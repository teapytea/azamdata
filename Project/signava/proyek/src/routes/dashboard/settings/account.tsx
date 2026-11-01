import { createFileRoute } from "@tanstack/react-router"
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
import { currentUser } from "@/lib/mock"

export const Route = createFileRoute("/dashboard/settings/account")({
  component: AccountSettingsPage,
})

function AccountSettingsPage() {
  const nameId = useId()
  const emailId = useId()
  const currentPasswordId = useId()
  const newPasswordId = useId()
  const [name, setName] = useState(currentUser.name)
  const [email, setEmail] = useState(currentUser.email)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [isSavingPassword, setIsSavingPassword] = useState(false)

  const saveProfile = () => {
    setIsSavingProfile(true)
    setTimeout(() => {
      setIsSavingProfile(false)
      toast.success("Profil tersimpan")
    }, 700)
  }

  const savePassword = () => {
    setPasswordError(null)
    if (!currentPassword || !newPassword) {
      setPasswordError("Isi kata sandi saat ini dan kata sandi baru.")
      return
    }
    if (newPassword.length < 8) {
      setPasswordError("Kata sandi baru minimal 8 karakter.")
      return
    }
    setIsSavingPassword(true)
    setTimeout(() => {
      setIsSavingPassword(false)
      setCurrentPassword("")
      setNewPassword("")
      toast.success("Kata sandi berhasil diganti")
    }, 700)
  }

  return (
    <div className="max-w-2xl space-y-4">
      <Card className="shadow-xs">
        <CardHeader>
          <CardTitle>Profil saya</CardTitle>
          <CardDescription>Informasi dasar akun Anda.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor={nameId}>Nama lengkap</Label>
            <Input
              id={nameId}
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={emailId}>Email</Label>
            <Input
              id={emailId}
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          <Button
            onClick={saveProfile}
            isLoading={isSavingProfile}
            loadingText="Menyimpan…"
          >
            Simpan profil
          </Button>
        </CardContent>
      </Card>

      <Card className="shadow-xs">
        <CardHeader>
          <CardTitle>Ganti kata sandi</CardTitle>
          <CardDescription>
            Gunakan kata sandi kuat yang tidak dipakai di layanan lain.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor={currentPasswordId}>Kata sandi saat ini</Label>
            <Input
              id={currentPasswordId}
              type="password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              autoComplete="current-password"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={newPasswordId}>Kata sandi baru</Label>
            <Input
              id={newPasswordId}
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              autoComplete="new-password"
            />
            <p className="text-xs text-muted-foreground">Minimal 8 karakter.</p>
          </div>
          {passwordError && (
            <p className="text-sm text-destructive">{passwordError}</p>
          )}
          <Button
            variant="outline"
            onClick={savePassword}
            isLoading={isSavingPassword}
            loadingText="Menyimpan…"
          >
            Ganti kata sandi
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
