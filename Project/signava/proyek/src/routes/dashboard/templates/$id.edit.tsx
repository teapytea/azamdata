import {
  Add01Icon,
  Delete02Icon,
  FloppyDiskIcon,
  UnavailableIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { createFileRoute, Link } from "@tanstack/react-router"
import { useId, useState } from "react"
import { toast } from "sonner"

import { CertificatePreview } from "@/components/certificate-preview"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { getTemplateById, type TemplateField } from "@/lib/mock"
import { cn } from "@/lib/utils"

export const Route = createFileRoute("/dashboard/templates/$id/edit")({
  component: TemplateEditorPage,
})

const accentPresets = [
  { label: "Navy", value: "#16204A" },
  { label: "Biru royal", value: "#2A5BEA" },
  { label: "Teal", value: "#16C0AE" },
  { label: "Emas", value: "#B7791F" },
  { label: "Merah marun", value: "#8B2635" },
  { label: "Hijau hutan", value: "#1F6B3B" },
]

function TemplateEditorPage() {
  const { id } = Route.useParams()
  const source = getTemplateById(id)

  if (!source) {
    return (
      <Empty className="py-16">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <HugeiconsIcon icon={UnavailableIcon} />
          </EmptyMedia>
          <EmptyTitle>Template tidak ditemukan</EmptyTitle>
          <EmptyDescription>
            Template yang Anda cari tidak ada atau sudah dihapus.
          </EmptyDescription>
        </EmptyHeader>
        <Button variant="outline" render={<Link to="/dashboard/templates" />}>
          Kembali ke galeri template
        </Button>
      </Empty>
    )
  }

  return <TemplateEditor sourceId={source.id} />
}

function TemplateEditor({ sourceId }: { sourceId: string }) {
  // biome-ignore lint/style/noNonNullAssertion: keberadaan template sudah dicek pemanggil
  const source = getTemplateById(sourceId)!
  const nameId = useId()
  const titleId = useId()
  const subtitleId = useId()
  const logoId = useId()
  const badgeId = useId()

  const [name, setName] = useState(source.name)
  const [title, setTitle] = useState(source.title)
  const [subtitle, setSubtitle] = useState(source.subtitle)
  const [accentColor, setAccentColor] = useState(source.accentColor)
  const [showLogo, setShowLogo] = useState(source.showLogo)
  const [showBadge, setShowBadge] = useState(source.showBadge)
  const [badgeColor, setBadgeColor] = useState(source.badgeColor)
  const [fields, setFields] = useState<TemplateField[]>(source.fields)
  const [isSaving, setIsSaving] = useState(false)

  const save = () => {
    setIsSaving(true)
    setTimeout(() => {
      setIsSaving(false)
      toast.success(`Template "${name}" tersimpan`)
    }, 700)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            to="/dashboard/templates"
            className="text-xs text-muted-foreground hover:text-foreground hover:underline"
          >
            ← Kembali ke galeri template
          </Link>
          <h1 className="mt-1 text-xl font-bold text-foreground">
            Edit template
          </h1>
          <p className="text-sm text-muted-foreground">
            Sesuaikan teks, warna, logo, dan field dinamis sertifikat.
          </p>
        </div>
        <Button onClick={save} isLoading={isSaving} loadingText="Menyimpan…">
          <HugeiconsIcon icon={FloppyDiskIcon} />
          Simpan template
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-3">
          <CertificatePreview
            title={title}
            subtitle={subtitle}
            recipientName={fields[0]?.example ?? "Nama peserta"}
            accentColor={accentColor}
            showLogo={showLogo}
            showBadge={showBadge}
            badgeColor={badgeColor}
            detailLines={fields.slice(1).map((field) => field.example)}
            className="mx-auto max-w-2xl"
          />
          <p className="text-center text-xs text-muted-foreground">
            Pratinjau langsung — nilai field memakai contoh data.
          </p>
        </div>

        <div className="space-y-4">
          <Card className="shadow-xs">
            <CardHeader>
              <CardTitle>Informasi dasar</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor={nameId}>Nama template</Label>
                <Input
                  id={nameId}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={titleId}>Judul sertifikat</Label>
                <Input
                  id={titleId}
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={subtitleId}>Teks pengantar</Label>
                <Input
                  id={subtitleId}
                  value={subtitle}
                  onChange={(event) => setSubtitle(event.target.value)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor={logoId}>Tampilkan logo organisasi</Label>
                <Switch
                  id={logoId}
                  checked={showLogo}
                  onCheckedChange={setShowLogo}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-xs">
            <CardHeader>
              <CardTitle>Warna aksen</CardTitle>
              <CardDescription>
                Dipakai untuk bingkai dan judul sertifikat.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {accentPresets.map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    title={preset.label}
                    aria-label={`Warna ${preset.label}`}
                    onClick={() => setAccentColor(preset.value)}
                    className={cn(
                      "size-8 rounded-full border-2 transition-transform hover:scale-110",
                      accentColor === preset.value
                        ? "border-foreground"
                        : "border-transparent"
                    )}
                    style={{ backgroundColor: preset.value }}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-xs">
            <CardHeader>
              <CardTitle>Badge medali</CardTitle>
              <CardDescription>
                Segel penghargaan di pojok sertifikat — gaya piagam resmi.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor={badgeId}>Tampilkan badge</Label>
                <Switch
                  id={badgeId}
                  checked={showBadge}
                  onCheckedChange={setShowBadge}
                />
              </div>
              {showBadge && (
                <div className="flex flex-wrap gap-2">
                  {accentPresets.map((preset) => (
                    <button
                      key={preset.value}
                      type="button"
                      title={preset.label}
                      aria-label={`Warna badge ${preset.label}`}
                      onClick={() => setBadgeColor(preset.value)}
                      className={cn(
                        "size-8 rounded-full border-2 transition-transform hover:scale-110",
                        badgeColor === preset.value
                          ? "border-foreground"
                          : "border-transparent"
                      )}
                      style={{ backgroundColor: preset.value }}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-xs">
            <CardHeader>
              <CardTitle>Field dinamis</CardTitle>
              <CardDescription>
                Field ini diisi dari data peserta saat batch diterbitkan.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {fields.map((field, index) => (
                <div key={field.key} className="flex items-center gap-2">
                  <Input
                    value={field.label}
                    onChange={(event) =>
                      setFields((current) =>
                        current.map((f, i) =>
                          i === index ? { ...f, label: event.target.value } : f
                        )
                      )
                    }
                  />
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Hapus field ${field.label}`}
                    disabled={field.key === "nama"}
                    onClick={() =>
                      setFields((current) =>
                        current.filter((_, i) => i !== index)
                      )
                    }
                  >
                    <HugeiconsIcon icon={Delete02Icon} />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setFields((current) => [
                    ...current,
                    {
                      key: `field-${current.length + 1}`,
                      label: "Field baru",
                      example: "Contoh isi",
                    },
                  ])
                }
              >
                <HugeiconsIcon icon={Add01Icon} />
                Tambah field
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
