"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { byteChunks, escPos } from "./calc";

type SerialWriter = { write(b: Uint8Array): Promise<void>; abort?(reason?: unknown): Promise<void>; releaseLock(): void };
type SerialPortLike = {
  open(o: { baudRate: number; bufferSize?: number }): Promise<void>;
  close(): Promise<void>;
  writable: { getWriter(): SerialWriter } | null;
};
type SerialLike = {
  requestPort(): Promise<SerialPortLike>;
  getPorts(): Promise<SerialPortLike[]>;
  addEventListener?(type: "disconnect", fn: (e: Event) => void): void;
  removeEventListener?(type: "disconnect", fn: (e: Event) => void): void;
};

const serial = () => (typeof navigator !== "undefined" ? (navigator as unknown as { serial?: SerialLike }).serial : undefined);
const KEY = "teapy-printer";
const CHUNK_BYTES = 128;
const CHUNK_DELAY_MS = 8;
const TIMEOUT_MS = 30000;
export type PrintMode = "direct" | "browser";

/**
 * Printer thermal 58 mm lewat Web Serial, di laptop maupun tablet Android (Bluetooth RFCOMM).
 * Tiap perangkat kasir mengingat printernya sendiri. Data dikirim per potongan kecil karena
 * buffer printer Bluetooth terbatas; nota panjang yang dikirim sekaligus bisa terpotong.
 */
export function usePrinter() {
  const [mode, setModeState] = useState<PrintMode>("browser");
  const [status, setStatus] = useState("Belum terhubung");
  const [connected, setConnected] = useState(false);
  const [supported, setSupported] = useState(false);
  const port = useRef<SerialPortLike | null>(null);
  const busy = useRef(false);

  const attach = useCallback(async (p: SerialPortLike) => {
    await p.open({ baudRate: 9600, bufferSize: 4096 });
    if (!p.writable) throw new Error("Printer tidak menyediakan saluran cetak.");
    port.current = p;
    setConnected(true);
    setStatus("Terhubung · ESC/POS 58 mm");
  }, []);

  const dropped = useCallback((message: string) => {
    const p = port.current;
    port.current = null;
    setConnected(false);
    setStatus(message);
    p?.close().catch(() => {});
  }, []);

  useEffect(() => {
    const api = window.isSecureContext ? serial() : undefined;
    setSupported(!!api);
    let saved: { mode?: PrintMode; index?: number } = {};
    try { saved = JSON.parse(localStorage.getItem(KEY) || "{}"); } catch {}
    if (!api || saved.mode === "browser") return;
    setModeState("direct");
    api.getPorts().then((ports) => {
      const p = ports[saved.index ?? 0];
      if (p) attach(p).catch(() => setStatus("Printer belum siap. Tekan Hubungkan printer."));
    }).catch(() => {});
    // Di Android event ini belum selalu muncul; kegagalan kirim tetap ditangani saat mencetak.
    const onDisconnect = (e: Event) => { if (e.target === port.current) dropped("Koneksi printer terputus. Hubungkan kembali."); };
    api.addEventListener?.("disconnect", onDisconnect);
    return () => {
      api.removeEventListener?.("disconnect", onDisconnect);
      port.current?.close().catch(() => {});
      port.current = null;
    };
  }, [attach, dropped]);

  function setMode(next: PrintMode) {
    setModeState(next);
    try { localStorage.setItem(KEY, JSON.stringify({ mode: next, index: 0 })); } catch {}
  }

  async function connect() {
    if (busy.current) return;
    busy.current = true;
    setStatus("Pilih printer pada dialog Chrome.");
    let chosen: SerialPortLike | null = null;
    try {
      chosen = await serial()!.requestPort();
      await port.current?.close().catch(() => {});
      await attach(chosen);
      const ports = await serial()!.getPorts();
      try { localStorage.setItem(KEY, JSON.stringify({ mode: "direct", index: Math.max(0, ports.indexOf(chosen)) })); } catch {}
    } catch (e) {
      const name = (e as Error).name;
      port.current = null;
      setConnected(false);
      setStatus(name === "NotFoundError" ? "Printer tidak dipilih. Pastikan sudah dipasangkan di pengaturan Bluetooth."
        : name === "SecurityError" ? "Izin ditolak. Buka POS langsung di Chrome dan izinkan perangkat sekitar."
        : "Tidak bisa membuka printer. Pastikan menyala dan tidak sedang tersambung ke perangkat lain.");
    } finally {
      busy.current = false;
    }
  }

  async function disconnect() {
    if (busy.current) return;
    const p = port.current;
    port.current = null;
    setConnected(false);
    setStatus("Belum terhubung");
    await p?.close().catch(() => {});
  }

  async function send(bytes: Uint8Array) {
    if (busy.current) throw new Error("Pengiriman cetak sedang berjalan.");
    const p = port.current;
    if (!p?.writable) throw new Error("Printer belum terhubung. Tekan Hubungkan printer.");
    busy.current = true;
    const writer = p.writable.getWriter();
    let stopped = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      await Promise.race([
        (async () => {
          for (const chunk of byteChunks(bytes, CHUNK_BYTES)) {
            if (stopped) return;
            await writer.write(chunk);
            await new Promise((r) => setTimeout(r, CHUNK_DELAY_MS));
          }
        })(),
        new Promise((_, reject) => { timer = setTimeout(() => reject(new Error("Batas waktu cetak terlampaui")), TIMEOUT_MS); }),
      ]);
      setStatus("Nota terkirim. Periksa hasil cetak.");
    } catch (e) {
      stopped = true;
      await writer.abort?.(e).catch(() => {});
      writer.releaseLock();
      dropped("Pengiriman terputus. Sebagian nota mungkin sudah tercetak.");
      throw new Error("Pengiriman ke printer terputus. Hubungkan kembali, periksa hasil sebelum mencetak ulang.");
    } finally {
      stopped = true;
      if (timer) clearTimeout(timer);
      try { writer.releaseLock(); } catch {}
      busy.current = false;
    }
  }

  return {
    mode, setMode, status, connected, supported, connect, disconnect,
    printLines: (lines: string[]) => send(escPos(lines)),
  };
}
