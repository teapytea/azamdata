"use client";

import { useState } from "react";
import { createTopupIntent } from "@/app/(app)/koin/actions";
import SnapLauncher from "./SnapLauncher";

export default function Packages() {
  const [snapToken, setSnapToken] = useState<string | null>(null);
  const pkgs = [
    { amount: 25_000, label: "Rp25.000" },
    { amount: 50_000, label: "Rp50.000" },
    { amount: 100_000, label: "Rp100.000" },
  ];

  const onTopUp = async (amount: number) => {
    try {
      const { token } = await createTopupIntent(amount);
      setSnapToken(token);
    } catch (e: any) {
      alert(e?.message ?? "Gagal membuat transaksi");
    }
  };

  return (
    <div className="mt-4">
      <h2 className="font-semibold">Pilih Paket Top Up</h2>
      <div className="flex gap-3 mt-3">
        {pkgs.map((p) => (
          <button
            key={p.amount}
            onClick={() => onTopUp(p.amount)}
            className="px-3 py-2 border rounded-md"
          >
            {p.label}
          </button>
        ))}
      </div>

      {snapToken && (
        <SnapLauncher token={snapToken} onFinish={() => setSnapToken(null)} />
      )}
    </div>
  );
}
