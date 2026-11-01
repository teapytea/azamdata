// src/app/onboarding/verifikasi/page.tsx (VERSI PERBAIKAN)
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const questions = [
  "Apakah Anda sudah siap secara mental dan finansial untuk menikah?",
  "Apakah Anda sudah mendapatkan restu dari kedua orang tua/wali?",
  "Apakah Anda bersedia mengikuti proses ta'aruf sesuai syariat Islam?",
  "Apakah Anda memahami bahwa Roomah hanya sebagai perantara dan jodoh adalah ketetapan Allah?",
  "Apakah Anda bersedia menjaga kerahasiaan data calon yang Anda lihat?",
];

export default function VerificationPage() {
  const router = useRouter();
  const [answers, setAnswers] = useState<(boolean | null)[]>(
    Array(questions.length).fill(null)
  );
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);

  const handleAnswerChange = (index: number, value: string) => {
    const newAnswers = [...answers];
    newAnswers[index] = value === "ya";
    setAnswers(newAnswers);
  };

  const allAnswered = answers.every((answer) => answer !== null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!allAnswered) return;

    const hasNo = answers.some((answer) => answer === false);
    if (hasNo) {
      setShowConfirmationModal(true);
    } else {
      router.push("/onboarding/buat-cv");
    }
  };

  const handleModalResponse = (proceed: boolean) => {
    if (proceed) {
      router.push("/onboarding/buat-cv");
    } else {
      router.push("/");
    }
  };

  const ConfirmationModal = () => (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm text-center">
        <h3 className="text-lg font-bold text-text-primary">
          Konfirmasi Kesiapan
        </h3>
        <p className="my-4 text-sm text-text-secondary">
          Kami melihat ada beberapa hal yang mungkin perlu Anda persiapkan lebih
          lanjut. Tim Roomah siap membantu membimbing Anda. Apakah Anda tetap
          ingin melanjutkan proses?
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={() => handleModalResponse(false)}
            className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300"
          >
            Tidak, kembali
          </button>
          <button
            onClick={() => handleModalResponse(true)}
            className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-secondary"
          >
            Ya, Lanjutkan
          </button>
        </div>
      </div>
    </div>
  );

  return (
    // PERUBAHAN: Padding atas responsif
    <div className="flex flex-col items-center justify-center min-h-screen bg-background-color py-12 px-4 pt-2 sm:pt-10">
      {showConfirmationModal && <ConfirmationModal />}
      <div className="w-full max-w-2xl p-6 sm:p-8 space-y-6 bg-white rounded-2xl shadow-lg border border-gray-200">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-text-primary">
            Verifikasi Kesiapan {"Ta'aruf"}
          </h1>
          <p className="text-text-secondary mt-2">
            Jawablah pertanyaan berikut dengan jujur untuk melanjutkan.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {questions.map((question, index) => (
            <div
              key={index}
              className="p-4 border border-border-color rounded-lg"
            >
              <p className="font-medium text-text-primary mb-3">
                {index + 1}. {question}
              </p>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name={`question-${index}`}
                    value="ya"
                    required
                    onChange={(e) => handleAnswerChange(index, e.target.value)}
                    className="w-4 h-4 text-primary bg-gray-100 border-gray-300 focus:ring-primary focus:ring-2"
                  />
                  Ya
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name={`question-${index}`}
                    value="tidak"
                    required
                    onChange={(e) => handleAnswerChange(index, e.target.value)}
                    className="w-4 h-4 text-primary bg-gray-100 border-gray-300 focus:ring-primary focus:ring-2"
                  />
                  Tidak
                </label>
              </div>
            </div>
          ))}
          <div>
            <button
              type="submit"
              disabled={!allAnswered}
              className="w-full mt-4 px-4 py-3 font-semibold text-white bg-primary rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed hover:enabled:bg-secondary"
            >
              Lanjutkan Mengisi CV
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
