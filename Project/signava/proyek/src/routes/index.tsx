import {
  CheckmarkBadge02Icon,
  MailSend01Icon,
  QrCode01Icon,
  Sent02Icon,
  Tick02Icon,
  UserGroupIcon,
  Wallet01Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { createFileRoute, Link } from "@tanstack/react-router"

import { CertificatePreview } from "@/components/certificate-preview"
import { ToggleTheme } from "@/components/toggle-theme"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { formatRupiah } from "@/lib/format"
import { mockPlans } from "@/lib/mock"
import { cn } from "@/lib/utils"

export const Route = createFileRoute("/")({ component: LandingPage })

const features = [
  {
    icon: Sent02Icon,
    title: "Terbit massal dalam hitungan menit",
    description:
      "Input manual untuk acara kecil, atau unggah Excel/CSV untuk ribuan peserta sekaligus — lengkap dengan validasi nama kosong dan duplikat.",
  },
  {
    icon: QrCode01Icon,
    title: "Verifikasi ber-QR di tiap sertifikat",
    description:
      "Setiap kredensial punya halaman verifikasi publik dengan ID unik. Perekrut cukup memindai QR untuk membuktikan keasliannya.",
  },
  {
    icon: MailSend01Icon,
    title: "Distribusi email otomatis",
    description:
      "Kirim sertifikat ke seluruh penerima lewat email ber-branding organisasi, bertahap dan terpantau statusnya: terkirim, dibuka, gagal.",
  },
  {
    icon: CheckmarkBadge02Icon,
    title: "Revisi tanpa drama",
    description:
      "Salah ketik satu nama di antara ribuan? Cari, perbaiki, dan regenerate satu kredensial saja — tanpa mengulang seluruh batch.",
  },
  {
    icon: Wallet01Icon,
    title: "Portofolio penerima seumur hidup",
    description:
      "Penerima mengumpulkan semua kredensialnya lintas penyelenggara dalam satu portofolio publik yang siap ditunjukkan ke HR.",
  },
  {
    icon: UserGroupIcon,
    title: "Kolaborasi tim & multi-organisasi",
    description:
      "Undang anggota tim dengan peran berbeda dan kelola beberapa organisasi dari satu akun.",
  },
]

const steps = [
  {
    number: "1",
    title: "Pilih template",
    description: "Mulai dari preset profesional, sesuaikan logo dan warna.",
  },
  {
    number: "2",
    title: "Masukkan peserta",
    description: "Ketik manual atau unggah Excel/CSV lalu petakan kolomnya.",
  },
  {
    number: "3",
    title: "Terbitkan & bagikan",
    description: "Ribuan sertifikat terbit dengan QR dan terkirim via email.",
  },
]

function LandingPage() {
  return (
    <div className="min-h-svh bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2.5">
            <img
              src="/logo-signava.png"
              alt="Logo Signava"
              className="size-7 rounded-lg object-contain"
            />
            <span className="text-sm font-semibold">Signava</span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <a href="#fitur" className="hover:text-foreground">
              Fitur
            </a>
            <a href="#cara-kerja" className="hover:text-foreground">
              Cara kerja
            </a>
            <a href="#harga" className="hover:text-foreground">
              Harga
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <div className="hidden sm:block">
              <ToggleTheme />
            </div>
            <Button variant="ghost" size="sm" render={<Link to="/login" />}>
              Masuk
            </Button>
            <Button size="sm" render={<Link to="/register" />}>
              Daftar gratis
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-4 py-16 md:grid-cols-2 md:py-24">
          <div className="space-y-6">
            <Badge className="bg-accent text-accent-foreground">
              Platform kredensial digital Indonesia
            </Badge>
            <h1 className="text-display">
              Terbitkan ribuan sertifikat terverifikasi dalam sekali klik
            </h1>
            <p className="text-lead text-muted-foreground">
              Signava membantu kampus, LPK, dan penyelenggara acara menerbitkan
              sertifikat digital ber-QR secara massal, membagikannya lewat
              email, dan menghemat jutaan rupiah biaya cetak.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button size="lg" render={<Link to="/register" />}>
                Mulai gratis
              </Button>
              <Button
                size="lg"
                variant="outline"
                render={
                  <Link
                    to="/verify/$publicId"
                    params={{ publicId: "contoh" }}
                  />
                }
              >
                Lihat contoh verifikasi
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Gratis 50 kredensial per bulan · Tanpa kartu kredit · Bahasa
              Indonesia
            </p>
          </div>
          <div className="relative">
            <CertificatePreview
              title="Sertifikat kelulusan"
              subtitle="Diberikan kepada"
              recipientName="Dewi Anggraini"
              accentColor="#2A5BEA"
              detailLines={["Teknik Informatika", "12 Juni 2026"]}
              className="rotate-1 shadow-lg"
            />
            <div className="absolute -bottom-4 -left-4 flex items-center gap-2 rounded-xl border bg-background px-3 py-2 shadow-md">
              <HugeiconsIcon
                icon={CheckmarkBadge02Icon}
                className="size-5 text-[#16C0AE]"
              />
              <span className="text-xs font-semibold">
                Terverifikasi · QR aktif
              </span>
            </div>
          </div>
        </section>

        <section id="fitur" className="border-t bg-muted/30 py-16 md:py-24">
          <div className="mx-auto max-w-6xl space-y-10 px-4">
            <div className="mx-auto max-w-2xl space-y-3 text-center">
              <h2 className="text-title">
                Berhenti kelola sertifikat lewat Word dan folder ZIP
              </h2>
              <p className="text-sm text-muted-foreground">
                Semua yang dibutuhkan operator sertifikat — dari penerbitan
                massal sampai bukti keaslian.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <Card key={feature.title} className="shadow-xs">
                  <CardContent className="space-y-3">
                    <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <HugeiconsIcon icon={feature.icon} className="size-5" />
                    </div>
                    <h3 className="text-sm font-semibold">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section id="cara-kerja" className="py-16 md:py-24">
          <div className="mx-auto max-w-6xl space-y-10 px-4">
            <div className="mx-auto max-w-2xl space-y-3 text-center">
              <h2 className="text-title">Tiga langkah, selesai</h2>
              <p className="text-sm text-muted-foreground">
                Dari daftar peserta sampai sertifikat sampai di kotak masuk —
                kurang dari 15 menit.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {steps.map((step) => (
                <div key={step.number} className="space-y-3 text-center">
                  <div className="mx-auto flex size-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                    {step.number}
                  </div>
                  <h3 className="text-sm font-semibold">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="harga" className="border-t bg-muted/30 py-16 md:py-24">
          <div className="mx-auto max-w-6xl space-y-10 px-4">
            <div className="mx-auto max-w-2xl space-y-3 text-center">
              <h2 className="text-title">Harga dalam rupiah, tanpa kejutan</h2>
              <p className="text-sm text-muted-foreground">
                Bandingkan dengan biaya cetak ±Rp5.000 per lembar — Signava jauh
                lebih hemat untuk volume berapa pun.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {mockPlans.map((plan) => (
                <Card
                  key={plan.id}
                  className={cn(
                    "shadow-xs",
                    plan.highlighted && "border-primary ring-1 ring-primary/30"
                  )}
                >
                  <CardContent className="flex h-full flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold">{plan.name}</h3>
                      {plan.highlighted && <Badge>Terpopuler</Badge>}
                    </div>
                    <div>
                      <span className="text-2xl font-bold">
                        {plan.priceMonthly === 0
                          ? "Gratis"
                          : formatRupiah(plan.priceMonthly)}
                      </span>
                      {plan.priceMonthly > 0 && (
                        <span className="text-sm text-muted-foreground">
                          /bulan
                        </span>
                      )}
                    </div>
                    <ul className="flex-1 space-y-2">
                      {plan.features.map((feature) => (
                        <li
                          key={feature}
                          className="flex items-start gap-2 text-sm text-muted-foreground"
                        >
                          <HugeiconsIcon
                            icon={Tick02Icon}
                            className="mt-0.5 size-4 shrink-0 text-primary"
                          />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Button
                      variant={plan.highlighted ? "default" : "outline"}
                      render={<Link to="/register" />}
                    >
                      Mulai dengan {plan.name}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
            <p className="text-center text-xs text-muted-foreground">
              Butuh volume lebih besar? Tersedia volume pack sekali bayar mulai{" "}
              {formatRupiah(99000)} — pembayaran QRIS dan virtual account via
              Pakasir.
            </p>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="mx-auto max-w-3xl space-y-6 px-4 text-center">
            <h2 className="text-title">Siap menerbitkan batch pertama Anda?</h2>
            <p className="text-sm text-muted-foreground">
              Daftar gratis dan rasakan bedanya — tidak perlu lagi lembur
              menyalin nama satu per satu.
            </p>
            <Button size="lg" render={<Link to="/register" />}>
              Terbitkan sertifikat pertama saya
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-xs text-muted-foreground md:flex-row">
          <div className="flex items-center gap-2">
            <img
              src="/logo-signava.png"
              alt="Logo Signava"
              className="size-5 rounded object-contain"
            />
            <span>© 2026 Signava — kredensial digital Indonesia</span>
          </div>
          <div className="flex gap-4">
            <a href="#fitur" className="hover:text-foreground">
              Fitur
            </a>
            <a href="#harga" className="hover:text-foreground">
              Harga
            </a>
            <Link to="/login" className="hover:text-foreground">
              Masuk
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
