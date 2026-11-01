import {
  Award01Icon,
  CheckmarkBadge02Icon,
  Clock01Icon,
  Download01Icon,
  EyeIcon,
  FingerPrintIcon,
  GlobeIcon,
  Linkedin01Icon,
  Money01Icon,
  QrCode01Icon,
  RankingIcon,
  SecurityCheckIcon,
  Share01Icon,
  Tick02Icon,
  UnavailableIcon,
  WhatsappIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { createFileRoute, Link } from "@tanstack/react-router"
import { motion } from "motion/react"
import { useState } from "react"
import { toast } from "sonner"

import { CertificatePreview } from "@/components/certificate-preview"
import { FakeQr } from "@/components/fake-qr"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { formatDate, formatNumber } from "@/lib/format"
import {
  currentOrganization,
  getBatchById,
  getCredentialByPublicId,
  getTemplateById,
} from "@/lib/mock"
import { cn } from "@/lib/utils"

export const Route = createFileRoute("/verify/$publicId")({
  component: VerifyPage,
})

// Pola guilloche halus — motif cetakan pengaman dokumen resmi, khas Signava.
function GuillochePattern() {
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 size-full opacity-[0.07]"
      preserveAspectRatio="xMidYMid slice"
      viewBox="0 0 800 400"
    >
      {Array.from({ length: 14 }, (_, i) => (
        <ellipse
          key={`e-${i * 30}`}
          cx="400"
          cy="200"
          rx={120 + i * 46}
          ry={40 + i * 22}
          fill="none"
          stroke="white"
          strokeWidth="1"
        />
      ))}
      {Array.from({ length: 10 }, (_, i) => (
        <ellipse
          key={`r-${i * 30}`}
          cx="400"
          cy="200"
          rx={40 + i * 22}
          ry={120 + i * 46}
          fill="none"
          stroke="white"
          strokeWidth="0.75"
        />
      ))}
    </svg>
  )
}

// Segel verifikasi Signava — cincin teal berdenyut dengan tanda centang.
function SignavaSeal() {
  return (
    <div className="relative flex size-16 items-center justify-center">
      <motion.span
        aria-hidden="true"
        className="absolute inset-0 rounded-full bg-[#16C0AE]"
        animate={{ scale: [1, 1.45], opacity: [0.45, 0] }}
        transition={{
          duration: 2,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeOut",
        }}
      />
      <motion.div
        initial={{ scale: 0.4, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 18 }}
        className="relative flex size-16 items-center justify-center rounded-full bg-[#16C0AE] shadow-lg shadow-[#16C0AE]/40 ring-4 ring-white/20"
      >
        <HugeiconsIcon
          icon={CheckmarkBadge02Icon}
          className="size-8 text-white"
        />
      </motion.div>
    </div>
  )
}

function fadeUp(delay: number) {
  return {
    initial: { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: { delay, duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
  }
}

function VerifyPage() {
  const { publicId } = Route.useParams()
  const credential = getCredentialByPublicId(publicId)
  const batch = credential ? getBatchById(credential.batchId) : undefined
  const template = batch ? getTemplateById(batch.templateId) : undefined
  const [verifyState, setVerifyState] = useState<
    "idle" | "checking" | "verified"
  >("idle")

  const isRevoked = credential?.status === "revoked"

  const runVerification = () => {
    setVerifyState("checking")
    setTimeout(() => {
      setVerifyState("verified")
      toast.success("Keaslian terkonfirmasi — data cocok dengan arsip penerbit")
    }, 900)
  }

  const share = (channel: string) => {
    navigator.clipboard?.writeText(
      `${window.location.origin}/verify/${publicId}?src=${channel}`
    )
    toast.success(
      channel === "salin"
        ? "Tautan verifikasi disalin"
        : `Tautan khusus ${channel} disalin — sumber kunjungan akan terlacak`
    )
  }

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <header className="z-20 flex h-14 items-center justify-between border-b bg-background px-4 md:px-8">
        <Link to="/" className="flex items-center gap-2.5">
          <img
            src="/logo-signava.png"
            alt="Logo Signava"
            className="size-7 rounded-lg object-contain"
          />
          <span className="text-sm font-semibold text-foreground">Signava</span>
        </Link>
        <Button variant="outline" size="sm" render={<Link to="/register" />}>
          Terbitkan kredensial Anda
        </Button>
      </header>

      {!credential || !batch ? (
        <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-16">
          <Card className="shadow-xs">
            <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
              <div className="flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                <HugeiconsIcon icon={UnavailableIcon} className="size-7" />
              </div>
              <div className="space-y-1">
                <h1 className="text-lg font-bold text-foreground">
                  Kredensial tidak ditemukan
                </h1>
                <p className="max-w-md text-sm text-muted-foreground">
                  ID "{publicId}" tidak terdaftar di Signava. Periksa kembali
                  tautan atau kode QR yang Anda pindai.
                </p>
              </div>
              <Button variant="outline" render={<Link to="/" />}>
                Ke beranda Signava
              </Button>
            </CardContent>
          </Card>
        </main>
      ) : (
        <main className="flex-1">
          {/* Panggung navy khas Signava */}
          <section className="relative overflow-hidden bg-gradient-to-br from-brand-navy via-brand-navy to-primary pb-44 pt-12 text-white md:pb-52">
            <GuillochePattern />
            <div className="relative mx-auto flex max-w-4xl flex-col items-center gap-4 px-4 text-center">
              <motion.div {...fadeUp(0)}>
                <SignavaSeal />
              </motion.div>
              <motion.p
                {...fadeUp(0.08)}
                className="text-xs font-semibold uppercase tracking-[0.25em] text-[#16C0AE]"
              >
                {isRevoked
                  ? "Kredensial dicabut"
                  : "Kredensial terverifikasi Signava"}
              </motion.p>
              <motion.h1
                {...fadeUp(0.14)}
                className="font-serif text-3xl font-bold md:text-5xl"
              >
                {credential.recipientName}
              </motion.h1>
              <motion.p
                {...fadeUp(0.2)}
                className="max-w-xl text-sm text-white/70"
              >
                menerima {batch.meta.type.toLowerCase()} "
                {template?.title ?? "Sertifikat"}" dari{" "}
                <span className="font-semibold text-white">
                  {currentOrganization.name}
                </span>{" "}
                pada {formatDate(credential.issuedAt)}
              </motion.p>
              <motion.div
                {...fadeUp(0.26)}
                className="flex flex-wrap justify-center gap-2 pt-1"
              >
                {[
                  batch.meta.type,
                  batch.meta.level !== "—" && batch.meta.level,
                  batch.meta.format,
                  batch.meta.durationHours > 0 &&
                    `${batch.meta.durationHours} jam`,
                ]
                  .filter(Boolean)
                  .map((chip) => (
                    <span
                      key={String(chip)}
                      className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur"
                    >
                      {chip}
                    </span>
                  ))}
              </motion.div>
            </div>
          </section>

          {/* Sertifikat menindih panggung */}
          <div className="relative z-10 mx-auto -mt-36 w-full max-w-3xl px-4 md:-mt-44">
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                delay: 0.3,
                duration: 0.6,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <CertificatePreview
                title={template?.title ?? "Sertifikat"}
                subtitle={template?.subtitle ?? "Diberikan kepada"}
                recipientName={credential.recipientName}
                accentColor={template?.accentColor ?? "#2A5BEA"}
                showLogo={template?.showLogo ?? true}
                showBadge={template?.showBadge ?? false}
                badgeColor={template?.badgeColor ?? "#B7791F"}
                detailLines={Object.entries(credential.fields)
                  .filter(([key]) => key !== "nama")
                  .map(([, value]) => value)}
                className={cn(
                  "shadow-2xl ring-1 ring-black/10",
                  isRevoked && "opacity-50 saturate-50"
                )}
              />
            </motion.div>

            {/* Strip verifikasi teal */}
            <motion.div
              {...fadeUp(0.42)}
              className={cn(
                "relative z-10 mx-auto -mt-1 flex max-w-2xl flex-wrap items-center justify-between gap-3 rounded-b-2xl px-5 py-4 text-white shadow-lg",
                isRevoked
                  ? "bg-destructive"
                  : "bg-gradient-to-r from-[#0f9c8d] to-[#16C0AE]"
              )}
            >
              <div className="flex min-w-0 items-center gap-3">
                <HugeiconsIcon
                  icon={isRevoked ? UnavailableIcon : FingerPrintIcon}
                  className="size-6 shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-xs text-white/80">Sidik jari kredensial</p>
                  <p className="truncate font-mono text-sm font-semibold">
                    {credential.publicId}
                  </p>
                </div>
              </div>
              {isRevoked ? (
                <p className="text-sm font-semibold">
                  Dicabut oleh penerbit — tidak lagi berlaku
                </p>
              ) : verifyState === "verified" ? (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="flex items-center gap-2 rounded-lg bg-white/15 px-3 py-1.5 text-sm font-semibold backdrop-blur"
                >
                  <HugeiconsIcon icon={Tick02Icon} className="size-4" />
                  Asli & tercatat di arsip penerbit
                </motion.div>
              ) : (
                <Button
                  size="sm"
                  className="border-white/30 bg-white/15 text-white shadow-none backdrop-blur hover:bg-white/25"
                  isLoading={verifyState === "checking"}
                  loadingText="Mencocokkan arsip…"
                  onClick={runVerification}
                >
                  <HugeiconsIcon icon={SecurityCheckIcon} />
                  Verifikasi keaslian
                </Button>
              )}
            </motion.div>
          </div>

          {/* Detail kredensial */}
          <div className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-6 px-4 py-10 lg:grid-cols-[1fr_300px]">
            <motion.div {...fadeUp(0.5)} className="space-y-6">
              {batch.meta.description && (
                <section className="space-y-2">
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    Tentang kredensial ini
                  </h2>
                  <p className="text-sm leading-relaxed text-foreground">
                    {batch.meta.description}
                  </p>
                </section>
              )}

              <section className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                {[
                  { icon: Award01Icon, label: "Jenis", value: batch.meta.type },
                  {
                    icon: RankingIcon,
                    label: "Tingkat",
                    value: batch.meta.level,
                  },
                  {
                    icon: GlobeIcon,
                    label: "Format",
                    value: batch.meta.format,
                  },
                  {
                    icon: Clock01Icon,
                    label: "Durasi",
                    value:
                      batch.meta.durationHours > 0
                        ? `${batch.meta.durationHours} jam`
                        : "—",
                  },
                  {
                    icon: Money01Icon,
                    label: "Harga",
                    value: batch.meta.price || "—",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-xl border bg-card p-3 shadow-xs"
                  >
                    <HugeiconsIcon
                      icon={item.icon}
                      className="size-4 text-primary"
                    />
                    <p className="mt-1.5 text-[10px] text-muted-foreground">
                      {item.label}
                    </p>
                    <p className="truncate text-sm font-semibold text-foreground">
                      {item.value}
                    </p>
                  </div>
                ))}
              </section>

              {batch.meta.skills.length > 0 && (
                <section className="space-y-2">
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    Keahlian yang dibuktikan
                  </h2>
                  <div className="flex flex-wrap gap-1.5">
                    {batch.meta.skills.map((skill) => (
                      <Badge
                        key={skill}
                        variant="secondary"
                        className="bg-accent text-accent-foreground"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </section>
              )}

              {batch.meta.earningCriteria.length > 0 && (
                <section className="space-y-3">
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    Cara kredensial ini diperoleh
                  </h2>
                  <ol className="space-y-2.5">
                    {batch.meta.earningCriteria.map((criterion, index) => (
                      <li
                        key={criterion.id}
                        className="flex items-start gap-3 text-sm"
                      >
                        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                          {index + 1}
                        </span>
                        <div>
                          <span className="font-medium text-foreground">
                            {criterion.category}
                          </span>
                          {criterion.detail && (
                            <span className="text-muted-foreground">
                              {" "}
                              — {criterion.detail}
                            </span>
                          )}
                        </div>
                      </li>
                    ))}
                  </ol>
                </section>
              )}

              <section className="flex items-center gap-4 rounded-xl border bg-muted/40 p-4">
                <FakeQr
                  seed={credential.publicId}
                  className="size-24 shrink-0"
                />
                <div className="space-y-1 text-sm">
                  <p className="font-semibold text-foreground">
                    Pindai untuk memverifikasi ulang
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Kode QR ini tercetak di sertifikat dan selalu menuju halaman
                    ini — sumber kebenaran satu-satunya adalah arsip penerbit di
                    Signava, bukan file yang beredar.
                  </p>
                </div>
              </section>
            </motion.div>

            {/* Kolom samping */}
            <motion.div {...fadeUp(0.58)} className="space-y-4">
              <Card className="shadow-xs">
                <CardContent className="space-y-2.5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Bagikan pencapaian
                  </p>
                  <Button
                    className="w-full"
                    render={
                      <a
                        href="https://www.linkedin.com/profile/add"
                        target="_blank"
                        rel="noreferrer"
                      />
                    }
                  >
                    <HugeiconsIcon icon={Linkedin01Icon} />
                    Tambahkan ke LinkedIn
                  </Button>
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      aria-label="Bagikan ke WhatsApp"
                      onClick={() => share("whatsapp")}
                    >
                      <HugeiconsIcon icon={WhatsappIcon} />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      aria-label="Salin tautan"
                      onClick={() => share("salin")}
                    >
                      <HugeiconsIcon icon={Share01Icon} />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      aria-label="Unduh PDF"
                      onClick={() => toast.info("Mengunduh sertifikat PDF…")}
                    >
                      <HugeiconsIcon icon={Download01Icon} />
                    </Button>
                  </div>
                  <p className="text-[11px] leading-relaxed text-muted-foreground">
                    Tiap tautan bagikan membawa penanda kanal, jadi penerbit
                    tahu dari mana kredensial ini dilihat.
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-xs">
                <CardContent className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Diterbitkan oleh
                  </p>
                  <p className="text-lg font-bold text-foreground">
                    {currentOrganization.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {currentOrganization.category} · signava.id/o/
                    {currentOrganization.handle}
                  </p>
                  <button
                    type="button"
                    className="pt-1 text-xs font-medium text-primary hover:underline"
                    onClick={() =>
                      toast.info(
                        `Permintaan koreksi dikirim ke ${currentOrganization.name}`
                      )
                    }
                  >
                    Laporkan kesalahan data →
                  </button>
                </CardContent>
              </Card>

              <Card className="border-[#16C0AE]/30 bg-accent/40 shadow-xs">
                <CardContent className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-accent-foreground">
                    Jejak kredensial
                  </p>
                  {[
                    {
                      icon: CheckmarkBadge02Icon,
                      label: "Diterbitkan",
                      value: formatDate(credential.issuedAt),
                    },
                    {
                      icon: EyeIcon,
                      label: "Dilihat",
                      value: `${formatNumber(credential.scanCount * 7 + 12)} kali`,
                    },
                    {
                      icon: QrCode01Icon,
                      label: "Diverifikasi pihak lain",
                      value: `${formatNumber(credential.scanCount)} kali`,
                    },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center gap-2.5">
                      <HugeiconsIcon
                        icon={row.icon}
                        className="size-4 shrink-0 text-accent-foreground"
                      />
                      <p className="flex-1 text-xs text-muted-foreground">
                        {row.label}
                      </p>
                      <p className="text-xs font-semibold text-foreground">
                        {row.value}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </main>
      )}

      <footer className="border-t bg-brand-navy py-5 text-center">
        <p className="text-xs text-white/60">
          Keaslian dijamin oleh{" "}
          <span className="font-semibold text-[#16C0AE]">Signava</span> —
          platform kredensial digital Indonesia
        </p>
      </footer>
    </div>
  )
}
