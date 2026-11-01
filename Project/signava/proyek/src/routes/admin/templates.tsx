import {
  Add01Icon,
  Copy01Icon,
  Delete02Icon,
  ImageUploadIcon,
  Layers01Icon,
  MoreVerticalIcon,
  PencilEdit01Icon,
  ViewIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { createFileRoute } from "@tanstack/react-router"
import { useId, useState } from "react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { formatDate, formatNumber } from "@/lib/format"
import {
  type SystemTemplate,
  systemTemplateCategories,
  systemTemplates,
  type TemplateCategory,
} from "@/lib/mock"
import { cn } from "@/lib/utils"

export const Route = createFileRoute("/admin/templates")({
  component: TemplateStudioPage,
})

type CategoryFilter = TemplateCategory | "semua"

function TemplateStudioPage() {
  const [templates, setTemplates] = useState<SystemTemplate[]>(systemTemplates)
  const [filter, setFilter] = useState<CategoryFilter>("semua")
  const [createOpen, setCreateOpen] = useState(false)

  const filtered = templates.filter(
    (template) => filter === "semua" || template.category === filter
  )
  const publishedCount = templates.filter((t) => t.status === "published").length

  const togglePublish = (template: SystemTemplate) => {
    setTemplates((current) =>
      current.map((t) =>
        t.id === template.id
          ? {
              ...t,
              status: t.status === "published" ? "draft" : "published",
            }
          : t
      )
    )
    toast.success(
      template.status === "published"
        ? `"${template.name}" disembunyikan dari galeri`
        : `"${template.name}" diterbitkan ke galeri`
    )
  }

  const addTemplate = (name: string, category: TemplateCategory) => {
    const created: SystemTemplate = {
      id: `sys-${Date.now()}`,
      name,
      category,
      accentColor: "#2A5BEA",
      status: "draft",
      usageCount: 0,
      updatedAt: new Date().toISOString().slice(0, 10),
    }
    setTemplates((current) => [created, ...current])
    setCreateOpen(false)
    toast.success(`Template "${name}" dibuat sebagai draf`)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-foreground">Template sistem</h1>
          <p className="text-sm text-muted-foreground">
            Kurasi galeri template yang dipakai semua organisasi.{" "}
            {publishedCount} dari {templates.length} template terbit.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <HugeiconsIcon icon={Add01Icon} />
          Tambah template
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {(["semua", ...systemTemplateCategories] as CategoryFilter[]).map(
          (category) => (
            <button
              key={category}
              type="button"
              onClick={() => setFilter(category)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                filter === category
                  ? "border-primary bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {category === "semua" ? "Semua" : category}
            </button>
          )
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((template) => (
          <div
            key={template.id}
            className="space-y-3 rounded-xl border bg-card p-3 shadow-xs transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            <div
              className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-lg border"
              style={{
                background: `linear-gradient(135deg, ${template.accentColor}14, ${template.accentColor}04)`,
              }}
            >
              <div
                className="pointer-events-none absolute inset-3 rounded-md border-2"
                style={{ borderColor: template.accentColor, opacity: 0.35 }}
              />
              <div className="flex flex-col items-center gap-1 text-center">
                <span
                  className="text-[10px] font-semibold uppercase tracking-[0.2em]"
                  style={{ color: template.accentColor }}
                >
                  {template.category}
                </span>
                <span className="font-serif text-sm text-neutral-700">
                  [nama penerima]
                </span>
              </div>
              <Badge
                variant="secondary"
                className={cn(
                  "absolute right-2 top-2",
                  template.status === "published"
                    ? "bg-accent text-accent-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {template.status === "published" ? "Terbit" : "Draf"}
              </Badge>
            </div>

            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">
                  {template.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {template.category} · dipakai{" "}
                  {formatNumber(template.usageCount)}×
                </p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Aksi untuk ${template.name}`}
                    />
                  }
                >
                  <HugeiconsIcon icon={MoreVerticalIcon} />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuItem
                    onClick={() =>
                      toast.info("Editor template sistem akan terbuka di sini")
                    }
                  >
                    <HugeiconsIcon icon={PencilEdit01Icon} className="size-4" />
                    Edit desain
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => togglePublish(template)}>
                    <HugeiconsIcon icon={ViewIcon} className="size-4" />
                    {template.status === "published"
                      ? "Sembunyikan dari galeri"
                      : "Terbitkan ke galeri"}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      toast.success(`"${template.name}" diduplikat`)
                    }
                  >
                    <HugeiconsIcon icon={Copy01Icon} className="size-4" />
                    Duplikat
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => {
                      setTemplates((current) =>
                        current.filter((t) => t.id !== template.id)
                      )
                      toast.success(`"${template.name}" dihapus`)
                    }}
                  >
                    <HugeiconsIcon icon={Delete02Icon} className="size-4" />
                    Hapus
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Diperbarui {formatDate(template.updatedAt)}
            </p>
          </div>
        ))}
      </div>

      <CreateTemplateDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreate={addTemplate}
      />
    </div>
  )
}

function CreateTemplateDialog({
  open,
  onOpenChange,
  onCreate,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreate: (name: string, category: TemplateCategory) => void
}) {
  const nameId = useId()
  const [name, setName] = useState("")
  const [category, setCategory] = useState<TemplateCategory>(
    systemTemplateCategories[0]
  )
  const [fileName, setFileName] = useState<string | null>(null)

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          setName("")
          setFileName(null)
          setCategory(systemTemplateCategories[0])
        }
        onOpenChange(next)
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah template sistem</DialogTitle>
          <DialogDescription>
            Unggah desain background, lalu atur slot data (nama, tanggal, QR) di
            editor. Teks tetap bisa diedit di atas background.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor={nameId}>Nama template</Label>
            <Input
              id={nameId}
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Contoh: Wisuda klasik emas"
            />
          </div>
          <div className="space-y-2">
            <Label>Kategori</Label>
            <Select
              value={category}
              onValueChange={(value) =>
                value && setCategory(value as TemplateCategory)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {systemTemplateCategories.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Background desain</Label>
            <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 text-center transition-colors hover:border-ring hover:bg-muted/40">
              <HugeiconsIcon
                icon={ImageUploadIcon}
                className="size-7 text-muted-foreground"
              />
              <span className="text-sm font-medium text-foreground">
                {fileName ?? "Klik untuk mengunggah PNG/JPG"}
              </span>
              <span className="text-xs text-muted-foreground">
                Rasio A4 landscape, kosongkan area nama & QR
              </span>
              <input
                type="file"
                accept="image/png,image/jpeg,image/svg+xml"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0]
                  if (file) setFileName(file.name)
                }}
              />
            </label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button
            disabled={name.trim() === ""}
            onClick={() => onCreate(name.trim(), category)}
          >
            <HugeiconsIcon icon={Layers01Icon} />
            Buat template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
