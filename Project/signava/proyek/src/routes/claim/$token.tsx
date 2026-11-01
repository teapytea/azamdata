import { CheckmarkCircle02Icon, Wallet01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { createFileRoute, Link } from "@tanstack/react-router"
import { useState } from "react"

import { CertificatePreview } from "@/components/certificate-preview"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export const Route = createFileRoute("/claim/$token")({
  component: ClaimPage,
})

function ClaimPage() {
  const [state, setState] = useState<"idle" | "claiming" | "done">("idle")

  const claim = () => {
    setState("claiming")
    setTimeout(() => setState("done"), 900)
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted/30 px-4 py-10">
      <Link to="/" className="mb-6 flex items-center gap-2.5">
        <img
          src="/logo-signava.png"
          alt="Logo Signava"
          className="size-8 rounded-lg object-contain"
        />
        <span className="text-lg font-semibold text-foreground">Signava</span>
      </Link>

      <Card className="w-full max-w-md shadow-xs">
        <CardContent className="space-y-5 text-center">
          {state === "done" ? (
            <div className="flex flex-col items-center gap-4 py-6">
              <div className="flex size-14 items-center justify-center rounded-full bg-accent text-accent-foreground">
                <HugeiconsIcon
                  icon={CheckmarkCircle02Icon}
                  className="size-7"
                />
              </div>
              <div className="space-y-1">
                <h1 className="text-lg font-bold text-foreground">
                  Kredensial berhasil diklaim
                </h1>
                <p className="text-sm text-muted-foreground">
                  Sertifikat ini sekarang tersimpan di dompet kredensial Anda
                  dan tampil di portofolio publik.
                </p>
              </div>
              <Button render={<Link to="/wallet" />}>
                <HugeiconsIcon icon={Wallet01Icon} />
                Buka dompet saya
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-1">
                <h1 className="text-lg font-bold text-foreground">
                  Anda menerima kredensial baru
                </h1>
                <p className="text-sm text-muted-foreground">
                  Universitas Nusantara Jaya menerbitkan sertifikat ini untuk
                  Anda. Klaim untuk menyimpannya di portofolio Signava Anda.
                </p>
              </div>
              <CertificatePreview
                title="Sertifikat pelatihan"
                subtitle="Dengan bangga diberikan kepada"
                recipientName="Kirana Larasati"
                accentColor="#2A5BEA"
                detailLines={["Dasar Analisis Data", "16 jam"]}
              />
              <div className="space-y-2">
                <Button
                  className="w-full"
                  isLoading={state === "claiming"}
                  loadingText="Mengklaim…"
                  onClick={claim}
                >
                  Klaim ke akun saya
                </Button>
                <p className="text-xs text-muted-foreground">
                  Belum punya akun? Anda akan diminta membuat akun dengan email
                  yang sama.
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
