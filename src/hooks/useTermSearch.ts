"use client";

import { useState, useCallback } from "react";
import type { TermData } from "@/lib/types";

interface State {
  data: TermData | null;
  loading: boolean;
  error: string | null;
}

export function useTermSearch() {
  const [state, setState] = useState<State>({
    data: null,
    loading: false,
    error: null,
  });

  const search = useCallback(async (term: string) => {
    if (!term.trim()) return;
    setState({ data: null, loading: true, error: null });

    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ term }),
      });
      const json = await res.json();
      if (!res.ok || json.error) {
        setState({ data: null, loading: false, error: json.error ?? "エラーが発生しました" });
      } else {
        setState({ data: json.data, loading: false, error: null });
      }
    } catch {
      setState({ data: null, loading: false, error: "ネットワークエラーが発生しました" });
    }
  }, []);

  return { ...state, search };
}
