import { createFileRoute, Link, useNavigate } from "@tanstack/react-router"
import { useId, useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export const Route = createFileRoute("/register")({
  component: RegisterPage,
})

function RegisterPage() {
  const navigate = useNavigate()
  const nameId = useId()
  const orgId = useId()
  const emailId = useId()
  const passwordId = useId()
  const [form, setForm] = useState({
    name: "",
    organization: "",
    email: "",
    password: "",
  })
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)
    if (!form.name || !form.organization || !form.email || !form.password) {
      setError("Lengkapi semua kolom terlebih dahulu.")
      return
    }
    if (form.password.length < 8) {
      setError("Kata sandi minimal 8 karakter.")
      return
    }
    setIsLoading(true)
    // Simulasi pendaftaran — nanti diganti Supabase Auth
    setTimeout(() => {
      toast.success("Akun berhasil dibuat — selamat datang di Signava!")
      navigate({ to: "/dashboard" })
    }, 800)
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

      <Card className="w-full max-w-sm shadow-xs">
        <CardHeader>
          <CardTitle>Buat akun baru</CardTitle>
          <CardDescription>
            Gratis 50 kredensial per bulan, tanpa kartu kredit.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor={nameId}>Nama lengkap</Label>
              <Input
                id={nameId}
                value={form.name}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                placeholder="Nama Anda"
                autoComplete="name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={orgId}>Nama organisasi</Label>
              <Input
                id={orgId}
                value={form.organization}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    organization: event.target.value,
                  }))
                }
                placeholder="Contoh: LPK Karya Digital"
                autoComplete="organization"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={emailId}>Email</Label>
              <Input
                id={emailId}
                type="email"
                value={form.email}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    email: event.target.value,
                  }))
                }
                placeholder="nama@organisasi.ac.id"
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={passwordId}>Kata sandi</Label>
              <Input
                id={passwordId}
                type="password"
                value={form.password}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    password: event.target.value,
                  }))
                }
                autoComplete="new-password"
              />
              <p className="text-xs text-muted-foreground">
                Minimal 8 karakter.
              </p>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" isLoading={isLoading}>
              Daftar
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Sudah punya akun?{" "}
            <Link to="/login" className="text-primary hover:underline">
              Masuk
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
