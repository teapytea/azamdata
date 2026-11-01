"use client";
import { useEffect } from "react";

declare global {
  interface Window {
    snap: any;
  }
}

export default function SnapLauncher({
  token,
  onFinish,
}: {
  token: string;
  onFinish: () => void;
}) {
  useEffect(() => {
    const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY!;
    const ensureScript = () =>
      new Promise<void>((resolve) => {
        if (window.snap) return resolve();
        const s = document.createElement("script");
        s.src = "https://app.sandbox.midtrans.com/snap/snap.js";
        s.async = true;
        s.setAttribute("data-client-key", clientKey);
        s.onload = () => resolve();
        document.body.appendChild(s);
      });

    (async () => {
      await ensureScript();
      window.snap.pay(token, {
        onSuccess: () => {
          alert("Pembayaran berhasil!");
          onFinish();
        },
        onPending: () => {
          alert("Menunggu pembayaran...");
          onFinish();
        },
        onError: () => {
          alert("Pembayaran gagal!");
          onFinish();
        },
        onClose: () => {
          alert("Ditutup tanpa menyelesaikan pembayaran.");
          onFinish();
        },
      });
    })();
  }, [token, onFinish]);

  return null;
}
