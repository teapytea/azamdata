"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import VerificationQuestions from "./VerificationQuestions";
import ConfirmModal from "./ConfirmModal";

type Answer = "ya" | "tidak" | "";

const QUESTIONS = [
  {
    key: "q1",
    label: "Siap memulai proses ta'aruf secara serius (target 6—12 bulan)?",
  },
  {
    key: "q2",
    label: "Sudah berkonsultasi & mendapat pendampingan keluarga/wali?",
    helper: "Restu/pendampingan membantu kelancaran proses.",
  },
  {
    key: "q3",
    label:
      "Bersedia mengikuti alur Roomah (syar'i, pendampingan, aturan platform)?",
  },
  {
    key: "q4",
    label: "Bersedia mengisi data CV dengan jujur & bertanggung jawab?",
  },
  {
    key: "q5",
    label: "Setuju menjaga adab komunikasi & privasi selama proses?",
  },
];

export default function VerifyScreen() {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, Answer>>({
    q1: "",
    q2: "",
    q3: "",
    q4: "",
    q5: "",
  });
  const [confirm, setConfirm] = useState(false);

  const allAnswered = useMemo(
    () => Object.values(answers).every((v) => v === "ya" || v === "tidak"),
    [answers]
  );
  const hasNegative = useMemo(
    () => Object.values(answers).some((v) => v === "tidak"),
    [answers]
  );

  const onPick = (k: string, v: Answer) =>
    setAnswers((s) => ({ ...s, [k]: v }));
  const goNext = () => router.push("/onboarding/cv");
  const goHome = () => router.push("/");

  const onContinue = () => {
    if (!allAnswered) return;
    if (hasNegative) setConfirm(true);
    else goNext();
  };

  const answeredCount = Object.values(answers).filter((v) => v !== "").length;

  return (
    <div className="min-h-screen bg-hero-gradient">
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-success text-white rounded-full flex items-center justify-center text-sm font-semibold">
                ✓
              </div>
              <span className="text-sm text-success font-medium">
                Registrasi
              </span>
            </div>
            <div className="flex-1 h-0.5 bg-success/30"></div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
                2
              </div>
              <span className="text-sm text-primary font-medium">
                Verifikasi
              </span>
            </div>
            <div className="flex-1 h-0.5 bg-border"></div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-muted text-muted-foreground rounded-full flex items-center justify-center text-sm font-semibold">
                3
              </div>
              <span className="text-sm text-muted-foreground font-medium">
                CV Profile
              </span>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-6 lg:mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-3">
            Verifikasi Kesiapan Ta'aruf
          </h1>
          <p className="text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
            Jawab 5 pertanyaan penting ini untuk memastikan Anda siap memulai
            perjalanan ta'aruf yang berkah.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-4">
            <div className="sticky top-8">
              <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-secondary rounded-xl">
                    <div className="w-5 h-5 bg-info rounded-full flex items-center justify-center">
                      <span className="text-xs text-white font-bold">i</span>
                    </div>
                  </div>
                  <h3 className="font-semibold text-foreground">
                    Syarat Kesiapan
                  </h3>
                </div>

                <div className="space-y-4 text-sm text-muted-foreground">
                  <div className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <p>Komitmen proses ta'aruf yang syar'i & beradab</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <p>Data CV yang jujur & akurat</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <p>Mengikuti alur & pendampingan Roomah</p>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-surface-1 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">
                      Progress
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {answeredCount}/5
                    </span>
                  </div>
                  <div className="w-full bg-border rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(answeredCount / 5) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="lg:col-span-8">
            <div className="bg-card border border-border rounded-2xl shadow-sm">
              <div className="p-6 lg:p-8">
                <VerificationQuestions
                  questions={QUESTIONS}
                  value={answers}
                  onPick={onPick}
                />
              </div>

              {/* Footer */}
              <div className="border-t border-border p-6 lg:p-8 bg-surface-2 rounded-b-2xl">
                <div className="flex items-center justify-between gap-4">
                  <div className="text-sm text-muted-foreground">
                    {allAnswered ? (
                      hasNegative ? (
                        <div className="flex items-center gap-2 text-warning">
                          <span className="w-4 h-4 text-warning">⚠</span>
                          Ada jawaban "Tidak" — perlu konfirmasi lebih lanjut
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-success">
                          <span className="w-4 h-4 text-success">✓</span>
                          Semua siap! Anda dapat melanjutkan ke tahap berikutnya
                        </div>
                      )
                    ) : (
                      `Jawab ${
                        5 - answeredCount
                      } pertanyaan lagi untuk melanjutkan`
                    )}
                  </div>

                  <button
                    type="button"
                    disabled={!allAnswered}
                    onClick={onContinue}
                    className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm transition-all ${
                      allAnswered
                        ? "bg-primary text-primary-foreground hover:bg-primary/90 ring-1 ring-ring shadow-sm hover:shadow-md"
                        : "bg-muted text-muted-foreground cursor-not-allowed"
                    }`}
                  >
                    Lanjutkan
                    <span className="text-xs">→</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal konfirmasi */}
        <ConfirmModal
          open={confirm}
          onCancel={() => setConfirm(false)}
          onConfirm={goNext}
          onReject={goHome}
        />
      </div>
    </div>
  );
}
