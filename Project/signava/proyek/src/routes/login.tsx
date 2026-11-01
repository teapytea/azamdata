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

export const Route = createFileRoute("/login")({
  component: LoginPage,
})

function LoginPage() {
  const navigate = useNavigate()
  const emailId = useId()
  const passwordId = useId()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)
    if (!email.trim() || !password.trim()) {
      setError("Isi email dan kata sandi terlebih dahulu.")
      return
    }
    setIsLoading(true)
    // Simulasi autentikasi — nanti diganti Supabase Auth
    setTimeout(() => {
      toast.success("Selamat datang kembali!")
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
          <CardTitle>Masuk ke akun Anda</CardTitle>
          <CardDescription>
            Kelola penerbitan kredensial organisasi Anda.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor={emailId}>Email</Label>
              <Input
                id={emailId}
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="nama@organisasi.ac.id"
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor={passwordId}>Kata sandi</Label>
                <button
                  type="button"
                  className="text-xs text-primary hover:underline"
                  onClick={() =>
                    toast.info(
                      "Tautan atur ulang kata sandi dikirim ke email Anda"
                    )
                  }
                >
                  Lupa kata sandi?
                </button>
              </div>
              <Input
                id={passwordId}
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" isLoading={isLoading}>
              Masuk
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Belum punya akun?{" "}
            <Link to="/register" className="text-primary hover:underline">
              Daftar gratis
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
