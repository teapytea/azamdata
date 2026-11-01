import {
  Add01Icon,
  Copy01Icon,
  Delete02Icon,
  Layers01Icon,
  MoreVerticalIcon,
  PencilEdit01Icon,
  Sent02Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router"
import { useState } from "react"
import { toast } from "sonner"

import { CertificatePreview } from "@/components/certificate-preview"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDate } from "@/lib/format"
import { type CertTemplate, mockTemplates } from "@/lib/mock"
import { useMockLoading } from "@/lib/mock/use-mock-loading"

export const Route = createFileRoute("/dashboard/templates/")({
  component: TemplatesPage,
})

function TemplatesPage() {
  const isLoading = useMockLoading()
  const navigate = useNavigate()
  const [templates, setTemplates] = useState<CertTemplate[]>(mockTemplates)

  const duplicateTemplate = (template: CertTemplate) => {
    const copy: CertTemplate = {
      ...template,
      id: `tpl-copy-${Date.now()}`,
      name: `${template.name} (salinan)`,
      updatedAt: new Date().toISOString().slice(0, 10),
    }
    setTemplates((current) => [...current, copy])
    toast.success(`Template "${template.name}" berhasil diduplikat`)
  }

  const deleteTemplate = (template: CertTemplate) => {
    setTemplates((current) => current.filter((t) => t.id !== template.id))
    toast.success(`Template "${template.name}" dihapus`)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-foreground">Template</h1>
          <p className="text-sm text-muted-foreground">
            Kelola desain sertifikat organisasi Anda.
          </p>
        </div>
        <Button
          onClick={() => {
            toast.success("Template baru dibuat dari preset")
            navigate({
              to: "/dashboard/templates/$id/edit",
              params: { id: "tpl-2" },
            })
          }}
        >
          <HugeiconsIcon icon={Add01Icon} />
          Buat template
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {["a", "b", "c"].map((item) => (
            <Skeleton key={item} className="aspect-[4/3] w-full rounded-xl" />
          ))}
        </div>
      ) : templates.length === 0 ? (
        <Empty className="py-16">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <HugeiconsIcon icon={Layers01Icon} />
            </EmptyMedia>
            <EmptyTitle>Belum ada template</EmptyTitle>
            <EmptyDescription>
              Mulai dari preset yang tersedia, lalu sesuaikan teks, logo, dan
              warnanya.
            </EmptyDescription>
          </EmptyHeader>
          <Button
            onClick={() => {
              setTemplates(mockTemplates)
              toast.success("Preset template dipulihkan")
            }}
          >
            Mulai dari preset
          </Button>
        </Empty>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {templates.map((template) => (
            <div
              key={template.id}
              className="space-y-3 rounded-xl border bg-card p-3 shadow-xs transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <CertificatePreview
                title={template.title}
                subtitle={template.subtitle}
                recipientName={template.fields[0]?.example ?? "Nama peserta"}
                accentColor={template.accentColor}
                showLogo={template.showLogo}
                showBadge={template.showBadge}
                badgeColor={template.badgeColor}
              />
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {template.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Diperbarui {formatDate(template.updatedAt)} ·{" "}
                    {template.fields.length} field
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
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem
                      render={
                        <Link
                          to="/dashboard/templates/$id/edit"
                          params={{ id: template.id }}
                        />
                      }
                    >
                      <HugeiconsIcon
                        icon={PencilEdit01Icon}
                        className="size-4"
                      />
                      Edit template
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => duplicateTemplate(template)}
                    >
                      <HugeiconsIcon icon={Copy01Icon} className="size-4" />
                      Duplikat
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => deleteTemplate(template)}
                    >
                      <HugeiconsIcon icon={Delete02Icon} className="size-4" />
                      Hapus
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                render={<Link to="/dashboard/batches/new" />}
              >
                <HugeiconsIcon icon={Sent02Icon} />
                Gunakan untuk batch baru
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
