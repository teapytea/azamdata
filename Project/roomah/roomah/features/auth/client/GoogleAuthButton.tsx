"use client";

/**
 * GoogleAuthButton.tsx — final
 * - Nonce: Google ⇐ SHA-256 HEX, Supabase ⇐ RAW (base64url).
 * - Register:
 *    * pre-check /check-user-exists → kalau sudah ada: gagal register (stay di /register)
 *    * kalau baru: sign-in lalu RPC ensure_profile → /onboarding/verify
 * - Login:
 *    * sign-in → RPC ensure_profile → user lama → /cv-saya (atau ?next=...)
 * - Safety-net:
 *    * bila terjadi mismatch (sudah login tapi "register"), signOut dan kembali ke /register?reason=already_registered
 */

import { useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client-browser";

declare global {
  interface Window {
    google?: any;
  }
}

type Props = { mode: "login" | "register"; className?: string };

const NONCE_KEY = "gis_nonce_v1";

/* ---------- helpers ---------- */
function toBase64Url(bytes: Uint8Array) {
  return btoa(String.fromCharCode(...Array.from(bytes)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}
function fromBase64Url(s: string) {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/");
  const pad = b64.length % 4 ? 4 - (b64.length % 4) : 0;
  return atob(b64 + "=".repeat(pad));
}
function parseJwtPayload(token: string): any {
  try {
    const payload = token.split(".")[1] || "";
    return JSON.parse(fromBase64Url(payload));
  } catch {
    return {};
  }
}
function createRawNonceB64Url(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return toBase64Url(bytes);
}
async function sha256Hex(input: string) {
  const enc = new TextEncoder().encode(input);
  const hashBuf = await crypto.subtle.digest("SHA-256", enc);
  const bytes = new Uint8Array(hashBuf);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/* ---------- component ---------- */
export default function GoogleAuthButton({ mode, className }: Props) {
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get("next") ?? "/cv-saya";

  const supabase = createClient();
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!;
  const hiddenRef = useRef<HTMLDivElement>(null);

  const handleResponse = async (resp: any) => {
    try {
      const idToken: string | undefined = resp?.credential;
      if (!idToken) {
        router.push(`/${mode}?error=no_google_credential`);
        return;
      }

      const payload = parseJwtPayload(idToken);
      const email: string = (payload?.email || "").toLowerCase();

      // ---------- 1) PRE-CHECK (khusus Register → fail cepat)
      if (mode === "register") {
        const { data: ex } = await supabase.functions
          .invoke("check-user-exists", { body: { email } })
          .catch(() => ({ data: null as any }));

        if (ex?.exists === true) {
          try {
            sessionStorage.removeItem(NONCE_KEY);
          } catch {}
          try {
            window.google?.accounts.id?.disableAutoSelect?.();
          } catch {}
          router.push(
            `/register?reason=already_registered&email=${encodeURIComponent(
              email
            )}`
          );
          router.refresh();
          return; // stop: jangan sign-in
        }
      }

      // ---------- 2) SIGN-IN (nonce RAW → Supabase)
      const rawNonce = sessionStorage.getItem(NONCE_KEY) || undefined;
      const { error } = await supabase.auth.signInWithIdToken({
        provider: "google",
        token: idToken,
        nonce: rawNonce,
      });
      try {
        sessionStorage.removeItem(NONCE_KEY);
      } catch {}

      if (error) {
        router.push(`/${mode}?error=${encodeURIComponent(error.message)}`);
        return;
      }

      // ---------- 3) SERVER IS TRUTH
      const { data: isNew, error: rpcErr } = await supabase.rpc(
        "ensure_profile"
      );
      if (rpcErr) {
        // fallback: sudah login → anggap user lama
        router.push("/cv-saya");
        router.refresh();
        return;
      }

      // ---------- 4) FINAL FLOW
      if (mode === "register" && isNew === false) {
        // safety-net: ini sebenarnya akun lama → gagal register
        await supabase.auth.signOut();
        try {
          window.google?.accounts.id?.disableAutoSelect?.();
        } catch {}
        router.push(
          `/register?reason=already_registered&email=${encodeURIComponent(
            email
          )}`
        );
        router.refresh();
        return;
      }

      if (isNew === true) {
        // user baru → jalur onboarding
        router.push("/onboarding/verify");
      } else {
        // user lama → dashboard (atau next)
        router.push(next);
      }
      router.refresh();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("google_signin_failed:", e);
      router.push(`/${mode}?error=google_signin_failed`);
    }
  };

  const onClick = async () => {
    if (!window.google) {
      router.push(`/${mode}?error=gsi_not_ready`);
      return;
    }
    // RAW nonce untuk Supabase
    const rawNonce = createRawNonceB64Url();
    try {
      sessionStorage.setItem(NONCE_KEY, rawNonce);
    } catch {}
    // HEX nonce untuk Google
    const hashedNonceHex = await sha256Hex(rawNonce);

    window.google.accounts.id.initialize({
      client_id: clientId,
      nonce: hashedNonceHex,
      ux_mode: "popup",
      context: mode === "register" ? "signup" : "signin",
      auto_select: false,
      callback: handleResponse,
    });

    const el = hiddenRef.current;
    if (!el) return;
    el.innerHTML = "";
    window.google.accounts.id.renderButton(el, {
      theme: "outline",
      size: "large",
      text: mode === "register" ? "signup_with" : "signin_with",
      width: 300,
    });

    const btn = el.querySelector('[role="button"]') as HTMLElement | null;
    if (btn) btn.click();
  };

  const label =
    mode === "register" ? "Register dengan Google" : "Login dengan Google";

  return (
    <div className={className}>
      <button
        type="button"
        onClick={onClick}
        className="flex w-full items-center justify-center gap-3 rounded-lg border bg-white px-4 py-3 text-sm font-semibold text-neutral-800 hover:bg-neutral-50"
        aria-label={label}
      >
        <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
          <path
            fill="#FFC107"
            d="M43.611 20.083H42V20H24v8h11.303C33.62 32.911 29.223 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.153 7.961 3.039l5.657-5.657C33.64 6.053 29.047 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20c10.493 0 19-8.507 19-19 0-1.341-.138-2.649-.389-3.917z"
          />
          <path
            fill="#FF3D00"
            d="M6.306 14.691l6.571 4.818C14.49 16.344 18.884 13 24 13c3.059 0 5.842 1.153 7.961 3.039l5.657-5.657C33.64 6.053 29.047 4 24 4 16.318 4 9.588 8.337 6.306 14.691z"
          />
          <path
            fill="#4CAF50"
            d="M24 44c5.166 0 9.807-1.977 13.283-5.197l-6.148-5.217C29.043 35.488 26.684 36 24 36c-5.202 0-9.588-3.064-11.285-7.388l-6.54 5.036C9.416 39.738 16.109 44 24 44z"
          />
          <path
            fill="#1976D2"
            d="M43.611 20.083H42V20H24v8h11.303c-1.338 3.051-4.41 5.53-8.303 5.53-5.202 0-9.588-3.064-11.285-7.388l-6.54 5.036C9.416 39.738 16.109 44 24 44c10.493 0 19-8.507 19-19 0-1.341-.138-2.649-.389-3.917z"
          />
        </svg>
        <span>{label}</span>
      </button>

      {/* tombol GIS tersembunyi */}
      <div
        ref={hiddenRef}
        style={{
          position: "absolute",
          opacity: 0,
          pointerEvents: "none",
          width: 0,
          height: 0,
          overflow: "hidden",
        }}
        aria-hidden="true"
      />
    </div>
  );
}
