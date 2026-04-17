import type { TermData } from "@/lib/types";

interface Props {
  data: TermData;
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block bg-gray-900 text-white text-xs font-bold px-2 py-0.5 rounded-sm tracking-wide">
      {children}
    </span>
  );
}

const circledNumbers = ["①", "②", "③", "④", "⑤"];

export function TermCard({ data }: Props) {
  return (
    <div className="mt-8 w-full max-w-lg bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header with left accent border */}
      <div className="border-l-4 border-gray-900 px-5 py-4 bg-gray-50">
        <p className="text-xs text-gray-500 mb-0.5">{data.reading}／{data.english}</p>
        <h2 className="text-2xl font-bold text-gray-900">{data.term}</h2>
      </div>

      <div className="px-5 py-4 space-y-4">
        {/* Etymology */}
        {data.etymology && (
          <section>
            <Badge>語源</Badge>
            <p className="mt-1.5 text-sm text-gray-700 leading-relaxed">{data.etymology}</p>
          </section>
        )}

        {/* Meaning */}
        <section>
          <Badge>意味</Badge>
          <p className="mt-1.5 text-sm text-gray-700 leading-relaxed">{data.meaning}</p>
        </section>

        {/* Fill-in-blank 1 */}
        <section>
          <Badge>穴埋め①</Badge>
          <p className="mt-1.5 text-sm text-gray-700 leading-relaxed">{data.fillBlank1.question}</p>
          <p className="text-sm text-gray-500 mt-1">答え：{data.fillBlank1.answer}</p>
        </section>

        {/* Fill-in-blank 2 */}
        <section>
          <Badge>穴埋め②</Badge>
          <p className="mt-1.5 text-sm text-gray-700 leading-relaxed">{data.fillBlank2.question}</p>
          <p className="text-sm text-gray-500 mt-1">
            答え：{data.fillBlank2.answers.map((a, i) => `${circledNumbers[i] ?? `(${i + 1})`}${a}`).join("　")}
          </p>
        </section>
      </div>
    </div>
  );
}
