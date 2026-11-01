"use client";

import { useMemo, useRef, useState } from "react";
import { submitVerification } from "@/app/(app)/onboarding/verify/actions";

type Q = { id: string; label: string };

const QUESTIONS: Q[] = [
  {
    id: "q1_ready",
    label: "Apakah Anda siap untuk menikah dalam waktu dekat?",
  },
  {
    id: "q2_serious",
    label: "Apakah Anda serius mencari pasangan hidup melalui Roomah?",
  },
  { id: "q3_honest", label: "Apakah Anda akan mengisi data dengan jujur?" },
  {
    id: "q4_parents_ok",
    label: "Apakah orang tua/wali mengetahui & merestui niat Anda?",
  },
  {
    id: "q5_rules_ok",
    label: "Apakah Anda bersedia mengikuti aturan/proses taaruf di Roomah?",
  },
];

export default function VerificationForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [hasNo, setHasNo] = useState(false);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    // Cek apakah ada jawaban "false"
    const fd = new FormData(e.currentTarget);
    const anyNo = QUESTIONS.some((q) => String(fd.get(q.id)) === "false");
    if (anyNo) {
      e.preventDefault();
      setHasNo(true);
      setShowConfirm(true);
    }
    // Jika semua "true", biarkan submit ke server action (submitVerification)
  };

  const proceed = () => {
    // User konfirmasi "Ya, lanjut dibimbing" → submit ke server action
    setShowConfirm(false);
    formRef.current?.requestSubmit();
  };

  const cancelToHome = () => {
    // User memilih "Tidak" → kembali ke beranda, TIDAK menyimpan verifikasi
    window.location.href = "/";
  };

  const requiredMark = useMemo(
    () => (
      <span className="text-[red]" aria-hidden>
        *
      </span>
    ),
    []
  );

  return (
    <>
      <form
        ref={formRef}
        action={submitVerification}
        onSubmit={onSubmit}
        className="space-y-4"
      >
        {QUESTIONS.map((q) => (
          <div key={q.id} className="rounded-lg border bg-card p-4">
            <p className="font-medium">
              {q.label} {requiredMark}
            </p>
            <div className="mt-2 flex gap-6">
              <label className="inline-flex items-center gap-2">
                <input type="radio" name={q.id} value="true" required /> Ya
              </label>
              <label className="inline-flex items-center gap-2">
                <input type="radio" name={q.id} value="false" required /> Tidak
              </label>
            </div>
          </div>
        ))}

        <button
          type="submit"
          className="bg-primary text-primary-foreground px-4 py-2 rounded"
        >
          Lanjutkan
        </button>
      </form>

      {showConfirm && hasNo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-lg bg-card p-6 shadow">
            <h2 className="text-lg font-bold mb-2">Konfirmasi</h2>
            <p className="text-sm text-muted-foreground">
              Ada jawaban <strong>“Tidak”</strong>. Apakah Anda siap untuk
              dibimbing oleh Roomah untuk mempersiapkan pernikahan dan tetap
              melanjutkan proses onboarding?
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={cancelToHome}
                className="border px-3 py-2 rounded"
              >
                Tidak, kembali ke Beranda
              </button>
              <button
                onClick={proceed}
                className="bg-primary text-primary-foreground px-3 py-2 rounded"
              >
                Ya, lanjut dibimbing
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
