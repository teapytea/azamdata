"use client";

type Answer = "ya" | "tidak" | "";
type Question = { key: string; label: string; helper?: string };

export type VerificationQuestionsProps = {
  questions: Question[];
  value: Record<string, Answer>;
  onPick: (key: string, val: Answer) => void;
};

export default function VerificationQuestions({
  questions,
  value,
  onPick,
}: VerificationQuestionsProps) {
  return (
    <div className="space-y-6">
      {questions.map((q, i) => (
        <div key={q.key} className="group">
          <div className="flex items-start gap-4">
            {/* Number indicator */}
            <div className="flex-shrink-0 mt-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-all ${
                  value[q.key] === "ya"
                    ? "bg-success text-white border-success"
                    : value[q.key] === "tidak"
                    ? "bg-destructive text-white border-destructive"
                    : "bg-surface-1 text-muted-foreground border-border"
                }`}
              >
                {value[q.key] === "ya"
                  ? "✓"
                  : value[q.key] === "tidak"
                  ? "✗"
                  : i + 1}
              </div>
            </div>

            <div className="flex-1 min-w-0">
              {/* Question content */}
              <div className="mb-4">
                <h3 className="font-semibold text-foreground leading-relaxed mb-2">
                  {q.label}
                </h3>
                {q.helper && (
                  <p className="text-sm text-link italic">{q.helper}</p>
                )}
              </div>

              {/* Answer buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => onPick(q.key, "ya")}
                  className={`inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg font-medium text-sm transition-all ring-1 ${
                    value[q.key] === "ya"
                      ? "bg-success text-white ring-success shadow-sm scale-105"
                      : "bg-card text-foreground ring-border hover:ring-success/50 hover:bg-success/5"
                  }`}
                  aria-pressed={value[q.key] === "ya"}
                >
                  {value[q.key] === "ya" && <span className="text-xs">✓</span>}
                  Ya
                </button>
                <button
                  type="button"
                  onClick={() => onPick(q.key, "tidak")}
                  className={`inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg font-medium text-sm transition-all ring-1 ${
                    value[q.key] === "tidak"
                      ? "bg-destructive text-white ring-destructive shadow-sm scale-105"
                      : "bg-card text-foreground ring-border hover:ring-destructive/50 hover:bg-destructive/5"
                  }`}
                  aria-pressed={value[q.key] === "tidak"}
                >
                  {value[q.key] === "tidak" && (
                    <span className="text-xs">✗</span>
                  )}
                  Tidak
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
