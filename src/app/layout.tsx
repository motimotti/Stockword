import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Stockword - IT・ビジネス用語検索",
  description: "Claude AIを使ったIT・ビジネス用語の解説ツール",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="antialiased">{children}</body>
    </html>
  );
}
