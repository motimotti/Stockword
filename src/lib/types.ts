export interface TermData {
  term: string;
  reading: string;
  english: string;
  etymology: string;
  meaning: string;
  fillBlank1: {
    question: string;
    answer: string;
  };
  fillBlank2: {
    question: string;
    answers: string[];
  };
}

export interface SearchResponse {
  data?: TermData;
  error?: string;
}
