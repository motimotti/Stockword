"use client";

import { SearchBox } from "@/components/SearchBox";
import { TermCard } from "@/components/TermCard";
import { useTermSearch } from "@/hooks/useTermSearch";

export default function Page() {
  const { data, loading, error, search } = useTermSearch();

  return (
    <main className="min-h-screen bg-gray-100 flex flex-col items-center py-12 px-4">
      <h1 className="text-2xl font-bold mb-2 text-gray-900">Stockword</h1>
      <p className="text-sm text-gray-500 mb-8">IT・ビジネス用語を検索して解説カードを生成</p>
      <SearchBox onSearch={search} loading={loading} />
      {error && (
        <p className="mt-4 text-red-600 text-sm">{error}</p>
      )}
      {loading && (
        <p className="mt-8 text-gray-500 text-sm">検索中...</p>
      )}
      {data && <TermCard data={data} />}
    </main>
  );
}
