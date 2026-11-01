import { Building01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
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
import { currentOrganization } from "@/lib/mock"

export const Route = createFileRoute("/dashboard/settings/organization")({
  component: OrganizationSettingsPage,
})

function OrganizationSettingsPage() {
  const nameId = useId()
  const handleId = useId()
  const [name, setName] = useState(currentOrganization.name)
  const [handle, setHandle] = useState(currentOrganization.handle)
  const [isSaving, setIsSaving] = useState(false)

  const save = () => {
    setIsSaving(true)
    setTimeout(() => {
      setIsSaving(false)
      toast.success("Profil organisasi tersimpan")
    }, 700)
  }

  return (
    <div className="max-w-2xl space-y-4">
      <Card className="shadow-xs">
        <CardHeader>
          <CardTitle>Profil organisasi</CardTitle>
          <CardDescription>
            Nama dan logo tampil di sertifikat, email, dan halaman verifikasi.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex size-16 items-center justify-center rounded-xl bg-primary text-lg font-bold text-primary-foreground">
              {currentOrganization.initials}
            </div>
            <div className="space-y-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  toast.info("Pilih file logo (PNG/SVG, maks. 1 MB)")
                }
              >
                <HugeiconsIcon icon={Building01Icon} />
                Unggah logo
              </Button>
              <p className="text-xs text-muted-foreground">
                Disarankan rasio 1:1, latar transparan.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor={nameId}>Nama organisasi</Label>
            <Input
              id={nameId}
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={handleId}>Handle publik</Label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                signava.id/o/
              </span>
              <Input
                id={handleId}
                value={handle}
                onChange={(event) => setHandle(event.target.value)}
                className="flex-1"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Dipakai di halaman verifikasi dan portofolio publik.
            </p>
          </div>

          <Button onClick={save} isLoading={isSaving} loadingText="Menyimpan…">
            Simpan perubahan
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
