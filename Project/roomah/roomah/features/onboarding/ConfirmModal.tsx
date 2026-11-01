"use client";

export type ConfirmModalProps = {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  onReject: () => void;
};

export default function ConfirmModal({
  open,
  onCancel,
  onConfirm,
  onReject,
}: ConfirmModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 p-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-md bg-card border border-border rounded-2xl shadow-xl"
      >
        {/* Header */}
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-warning/10 rounded-full">
              <div className="w-5 h-5 bg-warning rounded-full flex items-center justify-center">
                <span className="text-xs text-white font-bold">!</span>
              </div>
            </div>
            <h2 className="text-xl font-semibold text-foreground">
              Perlu Bimbingan?
            </h2>
          </div>

          {/* Content */}
          <div className="space-y-4 mb-6">
            <p className="text-foreground">
              Kami melihat ada jawaban{" "}
              <span className="font-semibold text-destructive">"Tidak"</span>{" "}
              pada beberapa pertanyaan.
            </p>
            <p className="text-sm text-muted-foreground">
              Roomah dapat membantu membimbing Anda untuk mempersiapkan diri
              dengan lebih baik agar proses ta'aruf berjalan lancar dan sesuai
              syariat.
            </p>

            {/* Info box */}
            <div className="bg-info/5 border border-info/20 rounded-xl p-4">
              <h4 className="font-medium text-info mb-2">
                Bimbingan meliputi:
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Persiapan mental dan spiritual</li>
                <li>• Konsultasi dengan keluarga/wali</li>
                <li>• Pemahaman adab ta'aruf yang syar'i</li>
                <li>• Panduan komunikasi yang beretika</li>
              </ul>
            </div>
          </div>

          <p className="text-center text-sm text-muted-foreground mb-6">
            Apakah Anda bersedia dibimbing oleh tim Roomah?
          </p>
        </div>

        {/* Actions */}
        <div className="border-t border-border p-6">
          <div className="flex flex-col gap-3">
            {/* Primary action */}
            <button
              onClick={onConfirm}
              className="flex items-center justify-center gap-2 w-full bg-success hover:bg-success/90 text-white font-semibold py-3 px-4 rounded-lg transition-all ring-1 ring-ring shadow-sm hover:shadow-md"
            >
              <span className="text-sm">✓</span>
              Ya, saya mau dibimbing
            </button>

            {/* Destructive action */}
            <button
              onClick={onReject}
              className="w-full bg-destructive hover:bg-destructive/90 text-white font-semibold py-3 px-4 rounded-lg transition-all ring-1 ring-ring shadow-sm hover:shadow-md"
            >
              Tidak, batalkan pendaftaran
            </button>

            {/* Secondary action */}
            <button
              onClick={onCancel}
              className="w-full bg-muted hover:bg-muted/80 text-foreground font-medium py-3 px-4 rounded-lg transition-all ring-1 ring-border"
            >
              Kembali untuk memperbaiki jawaban
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
