import { NextRequest, NextResponse } from "next/server";
import { fetchTermData } from "@/lib/claude";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const term: unknown = body?.term;

  if (!term || typeof term !== "string" || term.trim().length === 0) {
    return NextResponse.json({ error: "用語を入力してください" }, { status: 400 });
  }

  if (term.length > 100) {
    return NextResponse.json({ error: "用語が長すぎます（100文字以内）" }, { status: 400 });
  }

  try {
    const data = await fetchTermData(term.trim());
    return NextResponse.json({ data });
  } catch (err) {
    console.error("Claude API error:", err);
    return NextResponse.json(
      { error: "情報の取得に失敗しました。もう一度お試しください。" },
      { status: 500 }
    );
  }
}
