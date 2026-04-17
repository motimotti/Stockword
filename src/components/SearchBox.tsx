"use client";

import { useState, KeyboardEvent } from "react";

interface Props {
  onSearch: (term: string) => void;
  loading: boolean;
}

export function SearchBox({ onSearch, loading }: Props) {
  const [value, setValue] = useState("");

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") onSearch(value);
  };

  return (
    <div className="flex gap-2 w-full max-w-md">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="IT・ビジネス用語を入力（例：API、クラウド）"
        disabled={loading}
        className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:bg-gray-100 bg-white"
      />
      <button
        onClick={() => onSearch(value)}
        disabled={loading || !value.trim()}
        className="px-4 py-2 bg-gray-900 text-white text-sm rounded hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        検索
      </button>
    </div>
  );
}
