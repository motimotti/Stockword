import json
import os
import re

import anthropic
import streamlit as st
from dotenv import load_dotenv

load_dotenv(".env")

SYSTEM_PROMPT = """あなたはIT・ビジネス用語の専門家であり、日本語学習支援システムです。
ユーザーが入力したIT・ビジネス用語について、以下のJSON形式のみで回答してください。

## 出力形式（JSONのみ・マークダウン不可）
{
  "term": "入力された用語をそのまま記載",
  "reading": "ひらがなまたはカタカナでの読み方（例：えーぴーあい、クラウド）",
  "english": "英語の正式名称またはフルスペル（例：Application Programming Interface）",
  "etymology": "語源・構成要素の解説。英語略語の場合は各単語の意味と対応する日本語を記載。例：Application（アプリケーション）+ Programming（プログラミング）+ Interface（接点）。日本語由来や説明不要の場合は空文字列を返す",
  "meaning": "50文字以内の簡潔な日本語説明。専門知識のない読者にも理解できる表現を使う",
  "fillBlank1": {
    "question": "「[用語]とは、（　　　）である。」という1箇所のみ空欄がある穴埋め問題文",
    "answer": "空欄に入る答えの文字列"
  },
  "fillBlank2": {
    "question": "「[用語]とは、（①）〜（②）〜」という①と②の2箇所に空欄がある穴埋め問題文",
    "answers": ["①の答え", "②の答え"]
  }
}

## 厳守ルール
1. 出力はJSONオブジェクトのみ。```json等のコードブロック、前置き・後書きの文章は一切不要
2. 穴埋め問題の空欄表現：単一空欄は（　　　）、番号付き空欄は（①）（②）の全角括弧形式を使用すること
3. fillBlank1とfillBlank2は異なる切り口の問題を作成すること
4. answersは必ず2要素の配列とすること
5. 用語が不明・存在しない場合でも、最善の推測で情報を提供すること

## 対象用語ジャンル例
ネットワーク・インターネット技術：API、TCP/IP、HTTP、HTTPS、DNS、VPN、クラウド、サーバー、クライアント、プロキシ、ロードバランサー、CDN、WebSocket、REST、GraphQL
ソフトウェア開発：アジャイル、スクラム、ウォーターフォール、CI/CD、デプロイ、リファクタリング、テスト駆動開発、コードレビュー、バージョン管理、Git、Docker、Kubernetes、マイクロサービス、モノリス
データ・AI：機械学習、ディープラーニング、ビッグデータ、データマイニング、自然言語処理、コンピュータビジョン、強化学習、ニューラルネットワーク、データウェアハウス、ETL、BI（ビジネスインテリジェンス）、データレイク
ビジネス：KPI、ROI、PDCAサイクル、バリューチェーン、ステークホルダー、SLA、BPO、ERP、CRM、SCM、M&A、IPO、PMF（プロダクトマーケットフィット）
セキュリティ：ファイアウォール、暗号化、二要素認証、フィッシング、マルウェア、ゼロデイ攻撃、ペネトレーションテスト、SSO、OAuth、JWT、CSRF、XSS、SQLインジェクション
クラウド・インフラ：IaaS、PaaS、SaaS、オンプレミス、ハイブリッドクラウド、マルチクラウド、スケールアウト、スケールアップ、オートスケーリング、可用性、冗長性、フォールトトレランス

## 穴埋め問題の例
用語：API
fillBlank1: { "question": "APIとは、異なるソフトウェア同士をつなぐ（　　　）である。", "answer": "インターフェース" }
fillBlank2: { "question": "APIとは、異なる（①）同士がデータをやり取りするための決められた（②）。", "answers": ["ソフトウェア", "インターフェース"] }

用語：クラウド
fillBlank1: { "question": "クラウドとは、インターネット経由でサービスを提供する（　　　）の総称である。", "answer": "コンピューティング環境" }
fillBlank2: { "question": "クラウドとは、自社で（①）を持たずに（②）経由でリソースを利用する形態。", "answers": ["サーバー", "インターネット"] }"""


@st.cache_data(show_spinner=False)
def fetch_term_data(term: str) -> dict:
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        raise ValueError("ANTHROPIC_API_KEY が設定されていません")

    client = anthropic.Anthropic(api_key=api_key)
    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1024,
        system=[
            {
                "type": "text",
                "text": SYSTEM_PROMPT,
                "cache_control": {"type": "ephemeral"},
            }
        ],
        messages=[{"role": "user", "content": term}],
    )

    raw = response.content[0].text
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        match = re.search(r"\{[\s\S]*\}", raw)
        if not match:
            raise ValueError("Claude のレスポンスをJSONとして解析できませんでした")
        return json.loads(match.group())


def render_card(data: dict) -> None:
    st.markdown(
        """
        <style>
        .sw-card {
            background: #ffffff;
            border-radius: 10px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.12);
            overflow: hidden;
            margin-top: 1.5rem;
            font-family: sans-serif;
        }
        .sw-header {
            border-left: 4px solid #111827;
            background: #f9fafb;
            padding: 16px 20px;
        }
        .sw-reading {
            font-size: 12px;
            color: #6b7280;
            margin: 0 0 2px 0;
        }
        .sw-term {
            font-size: 26px;
            font-weight: 700;
            color: #111827;
            margin: 0 0 4px 0;
        }
        .sw-body {
            padding: 16px 20px;
        }
        .sw-section {
            margin-bottom: 16px;
        }
        .sw-badge {
            display: inline-block;
            background: #111827;
            color: #ffffff;
            font-size: 11px;
            font-weight: 700;
            padding: 2px 8px;
            border-radius: 3px;
            letter-spacing: 0.05em;
        }
        .sw-text {
            font-size: 14px;
            color: #374151;
            line-height: 1.7;
            margin: 6px 0 0 0;
        }
        .sw-answer {
            font-size: 13px;
            color: #6b7280;
            margin: 4px 0 0 0;
        }
        </style>
        """,
        unsafe_allow_html=True,
    )

    reading = data.get("reading", "")
    english = data.get("english", "")
    etymology = data.get("etymology", "")
    meaning = data.get("meaning", "")
    fb1 = data.get("fillBlank1", {})
    fb2 = data.get("fillBlank2", {})

    circled = ["①", "②", "③", "④", "⑤"]
    answers2 = fb2.get("answers", [])
    answer2_str = "　".join(
        f"{circled[i] if i < len(circled) else f'({i+1})'}{a}"
        for i, a in enumerate(answers2)
    )

    etymology_html = ""
    if etymology:
        etymology_html = f"""
        <div class="sw-section">
            <span class="sw-badge">語源</span>
            <p class="sw-text">{etymology}</p>
        </div>
        """

    html = f"""
    <div class="sw-card">
        <div class="sw-header">
            <p class="sw-reading">{reading}／{english}</p>
            <p class="sw-term">{data.get("term", "")}</p>
        </div>
        <div class="sw-body">
            {etymology_html}
            <div class="sw-section">
                <span class="sw-badge">意味</span>
                <p class="sw-text">{meaning}</p>
            </div>
            <div class="sw-section">
                <span class="sw-badge">穴埋め①</span>
                <p class="sw-text">{fb1.get("question", "")}</p>
                <p class="sw-answer">答え：{fb1.get("answer", "")}</p>
            </div>
            <div class="sw-section">
                <span class="sw-badge">穴埋め②</span>
                <p class="sw-text">{fb2.get("question", "")}</p>
                <p class="sw-answer">答え：{answer2_str}</p>
            </div>
        </div>
    </div>
    """
    st.markdown(html, unsafe_allow_html=True)


# ── UI ──────────────────────────────────────────────────────────────

st.set_page_config(page_title="Stockword", layout="centered")
st.title("Stockword")
st.caption("IT・ビジネス用語を検索して解説カードを生成")

col1, col2 = st.columns([4, 1])
with col1:
    term_input = st.text_input(
        label="term",
        label_visibility="collapsed",
        placeholder="IT・ビジネス用語を入力（例：API、クラウド）",
    )
with col2:
    search_clicked = st.button("検索", use_container_width=True)

if search_clicked and term_input.strip():
    with st.spinner("検索中..."):
        try:
            data = fetch_term_data(term_input.strip())
            render_card(data)
        except ValueError as e:
            st.error(str(e))
        except Exception:
            st.error("情報の取得に失敗しました。もう一度お試しください。")
elif search_clicked:
    st.warning("用語を入力してください")
