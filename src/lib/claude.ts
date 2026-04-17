import Anthropic from "@anthropic-ai/sdk";
import type { TermData } from "./types";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `あなたはIT・ビジネス用語の専門家であり、日本語学習支援システムです。
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
1. 出力はJSONオブジェクトのみ。\`\`\`json等のコードブロック、前置き・後書きの文章は一切不要
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
fillBlank2: { "question": "クラウドとは、自社で（①）を持たずに（②）経由でリソースを利用する形態。", "answers": ["サーバー", "インターネット"] }`;

export async function fetchTermData(term: string): Promise<TermData> {
  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    system: [
      {
        type: "text",
        text: SYSTEM_PROMPT,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [
      {
        role: "user",
        content: term,
      },
    ],
  });

  const raw = response.content[0];
  if (raw.type !== "text") throw new Error("Unexpected response type from Claude");

  let parsed: TermData;
  try {
    parsed = JSON.parse(raw.text) as TermData;
  } catch {
    const match = raw.text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("Failed to parse Claude response as JSON");
    parsed = JSON.parse(match[0]) as TermData;
  }

  const required = ["term", "reading", "english", "etymology", "meaning", "fillBlank1", "fillBlank2"] as const;
  for (const field of required) {
    if (!(field in parsed)) throw new Error(`Missing field: ${field}`);
  }
  if (!parsed.fillBlank1.question || !parsed.fillBlank1.answer) {
    throw new Error("Invalid fillBlank1 structure");
  }
  if (!parsed.fillBlank2.question || !Array.isArray(parsed.fillBlank2.answers)) {
    throw new Error("Invalid fillBlank2 structure");
  }

  return parsed;
}
