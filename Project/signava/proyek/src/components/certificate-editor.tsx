import {
  Delete02Icon,
  QrCode01Icon,
  TextFontIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useRef, useState } from "react"

import { FakeQr } from "@/components/fake-qr"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import {
  type CertTemplate,
  type CredentialMeta,
  currentOrganization,
  mockTemplates,
} from "@/lib/mock"
import { cn } from "@/lib/utils"

export type ElementType =
  | "heading"
  | "subtitle"
  | "recipient"
  | "body"
  | "badge"
  | "qr"
  | "logo"
  | "divider"

export interface CanvasElement {
  id: string
  type: ElementType
  x: number // pusat elemen, persen 0–100
  y: number
  size: number // teks: ukuran font dalam cqw; badge/qr/logo/divider: lebar dalam cqw
  text?: string
  color?: string
  bold?: boolean
}

export type PaperSize = "a4" | "letter"

export interface CertDesign {
  templateId: string
  paperSize: PaperSize
  accentColor: string
  badgeColor: string
  elements: CanvasElement[]
}

const accentPresets = [
  { label: "Navy", value: "#16204A" },
  { label: "Biru royal", value: "#2A5BEA" },
  { label: "Teal", value: "#16C0AE" },
  { label: "Emas", value: "#B7791F" },
  { label: "Merah marun", value: "#8B2635" },
  { label: "Hijau hutan", value: "#1F6B3B" },
]

const textWidthByType: Record<string, number> = {
  heading: 82,
  subtitle: 74,
  recipient: 84,
  body: 72,
}

export function buildDesign(
  template: CertTemplate,
  meta: CredentialMeta
): CertDesign {
  const accent = template.accentColor
  const elements: CanvasElement[] = [
    ...(template.showLogo
      ? [
          {
            id: "logo",
            type: "logo" as const,
            x: 50,
            y: 13,
            size: 7,
            color: accent,
          },
        ]
      : []),
    {
      id: "heading",
      type: "heading",
      x: 50,
      y: 26,
      size: 4.4,
      text: template.title,
      color: accent,
      bold: true,
    },
    {
      id: "subtitle",
      type: "subtitle",
      x: 50,
      y: 37,
      size: 1.7,
      text: template.subtitle,
      color: "#6b7280",
    },
    {
      id: "recipient",
      type: "recipient",
      x: 50,
      y: 49,
      size: 5.4,
      color: "#111827",
      bold: true,
    },
    { id: "divider", type: "divider", x: 50, y: 57, size: 46, color: accent },
    {
      id: "body",
      type: "body",
      x: 50,
      y: 67,
      size: 1.5,
      text:
        meta.description ||
        "Diberikan atas partisipasi dan pencapaian dalam kegiatan ini.",
      color: "#4b5563",
    },
    ...(template.showBadge
      ? [
          {
            id: "badge",
            type: "badge" as const,
            x: 30,
            y: 83,
            size: 10,
            color: template.badgeColor,
          },
        ]
      : []),
    { id: "qr", type: "qr", x: 72, y: 82, size: 11 },
  ]

  return {
    templateId: template.id,
    paperSize: "a4",
    accentColor: accent,
    badgeColor: template.badgeColor,
    elements,
  }
}

function Medal({ color, size }: { color: string; size: number }) {
  return (
    <svg
      viewBox="0 0 40 52"
      aria-hidden="true"
      style={{ width: `${size}cqw`, height: "auto" }}
      className="drop-shadow-sm"
    >
      <polygon points="12,28 20,52 4,46" fill={color} opacity={0.75} />
      <polygon points="28,28 36,46 20,52" fill={color} opacity={0.6} />
      <circle cx="20" cy="18" r="15" fill={color} />
      <circle cx="20" cy="18" r="11" fill="white" opacity={0.25} />
      <path
        d="M20 10.5l2.2 4.5 5 .7-3.6 3.5.9 4.9-4.5-2.3-4.5 2.3.9-4.9-3.6-3.5 5-.7z"
        fill="white"
      />
    </svg>
  )
}

function ElementView({
  element,
  recipientName,
}: {
  element: CanvasElement
  recipientName: string
}) {
  switch (element.type) {
    case "logo":
      return (
        <div
          className="flex items-center justify-center rounded-full font-bold text-white"
          style={{
            width: `${element.size}cqw`,
            height: `${element.size}cqw`,
            backgroundColor: element.color,
            fontSize: `${element.size * 0.32}cqw`,
          }}
        >
          {currentOrganization.initials}
        </div>
      )
    case "qr":
      return (
        <div style={{ width: `${element.size}cqw` }}>
          <FakeQr seed="preview-editor" className="size-full !p-0.5" />
        </div>
      )
    case "badge":
      return <Medal color={element.color ?? "#B7791F"} size={element.size} />
    case "divider":
      return (
        <div
          style={{
            width: `${element.size}cqw`,
            height: "0.25cqw",
            backgroundColor: element.color,
          }}
        />
      )
    default: {
      const text =
        element.type === "recipient"
          ? recipientName || "Nama peserta"
          : (element.text ?? "")
      return (
        <p
          style={{
            width: `${textWidthByType[element.type] ?? 70}cqw`,
            fontSize: `${element.size}cqw`,
            color: element.color,
            fontWeight: element.bold ? 700 : 400,
            lineHeight: 1.25,
            letterSpacing: element.type === "heading" ? "0.02em" : undefined,
            fontFamily:
              element.type === "recipient" ? "Georgia, serif" : undefined,
            textTransform: element.type === "heading" ? "uppercase" : undefined,
          }}
          className="text-center"
        >
          {text}
        </p>
      )
    }
  }
}

// Render sertifikat statis (dipakai di pratinjau langkah 4 & tempat lain).
export function CertificateCanvas({
  design,
  recipientName,
  className,
}: {
  design: CertDesign
  recipientName: string
  className?: string
}) {
  return (
    <div
      className={cn(
        "@container relative overflow-hidden rounded-lg border bg-white shadow-xs dark:bg-neutral-100",
        className
      )}
      style={{
        aspectRatio: design.paperSize === "a4" ? "1.414 / 1" : "1.294 / 1",
      }}
    >
      <div
        className="pointer-events-none absolute inset-[3cqw] rounded-[1cqw] border-2"
        style={{ borderColor: design.accentColor, opacity: 0.35 }}
      />
      {design.elements.map((element) => (
        <div
          key={element.id}
          className="absolute flex items-center justify-center"
          style={{
            left: `${element.x}%`,
            top: `${element.y}%`,
            transform: "translate(-50%, -50%)",
          }}
        >
          <ElementView element={element} recipientName={recipientName} />
        </div>
      ))}
    </div>
  )
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

let elementCounter = 0

// Editor sertifikat: pilih template, edit teks/warna/badge/QR, ukuran kertas,
// dan geser/hapus elemen langsung di atas pratinjau.
export function CertificateEditor({
  design,
  onChange,
  meta,
  recipientName,
}: {
  design: CertDesign
  onChange: (design: CertDesign) => void
  meta: CredentialMeta
  recipientName: string
}) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<{
    id: string
    startX: number
    startY: number
    elX: number
    elY: number
    width: number
    height: number
    moved: boolean
  } | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const selected = design.elements.find((element) => element.id === selectedId)

  const updateElement = (id: string, patch: Partial<CanvasElement>) => {
    onChange({
      ...design,
      elements: design.elements.map((element) =>
        element.id === id ? { ...element, ...patch } : element
      ),
    })
  }

  const removeElement = (id: string) => {
    onChange({
      ...design,
      elements: design.elements.filter((element) => element.id !== id),
    })
    setSelectedId(null)
  }

  const addText = () => {
    elementCounter += 1
    const id = `text-${elementCounter}`
    onChange({
      ...design,
      elements: [
        ...design.elements,
        {
          id,
          type: "body",
          x: 50,
          y: 50,
          size: 2,
          text: "Teks baru",
          color: "#111827",
        },
      ],
    })
    setSelectedId(id)
  }

  const hasQr = design.elements.some((element) => element.type === "qr")
  const hasBadge = design.elements.some((element) => element.type === "badge")

  const toggleElement = (type: ElementType, defaults: CanvasElement) => {
    const exists = design.elements.some((element) => element.type === type)
    if (exists) {
      onChange({
        ...design,
        elements: design.elements.filter((element) => element.type !== type),
      })
    } else {
      onChange({ ...design, elements: [...design.elements, defaults] })
    }
  }

  const handlePointerDown = (
    event: React.PointerEvent<HTMLDivElement>,
    element: CanvasElement
  ) => {
    event.stopPropagation()
    setSelectedId(element.id)
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return
    dragRef.current = {
      id: element.id,
      startX: event.clientX,
      startY: event.clientY,
      elX: element.x,
      elY: element.y,
      width: rect.width,
      height: rect.height,
      moved: false,
    }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current
    if (!drag) return
    const dx = ((event.clientX - drag.startX) / drag.width) * 100
    const dy = ((event.clientY - drag.startY) / drag.height) * 100
    if (Math.abs(dx) > 0.3 || Math.abs(dy) > 0.3) drag.moved = true
    updateElement(drag.id, {
      x: clamp(drag.elX + dx, 3, 97),
      y: clamp(drag.elY + dy, 3, 97),
    })
  }

  const handlePointerUp = () => {
    dragRef.current = null
  }

  return (
    <div className="space-y-4">
      {/* Toolbar atas */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-muted/40 p-2">
        <div className="flex items-center gap-2">
          <span className="pl-1 text-xs font-medium text-muted-foreground">
            Ukuran kertas
          </span>
          <div className="flex rounded-md border bg-background p-0.5">
            {(["a4", "letter"] as const).map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => onChange({ ...design, paperSize: size })}
                className={cn(
                  "rounded px-2.5 py-1 text-xs font-medium transition-colors",
                  design.paperSize === size
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {size === "a4" ? "A4" : "US Letter"}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={addText}>
            <HugeiconsIcon icon={TextFontIcon} />
            Tambah teks
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              toggleElement("qr", {
                id: "qr",
                type: "qr",
                x: 72,
                y: 82,
                size: 11,
              })
            }
            className={cn(hasQr && "border-primary text-primary")}
          >
            <HugeiconsIcon icon={QrCode01Icon} />
            QR code
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_260px]">
        {/* Kanvas */}
        <div>
          <div
            ref={canvasRef}
            className="@container relative mx-auto w-full max-w-2xl select-none overflow-hidden rounded-lg border bg-white shadow-sm dark:bg-neutral-100"
            style={{
              aspectRatio:
                design.paperSize === "a4" ? "1.414 / 1" : "1.294 / 1",
            }}
            onPointerDown={() => setSelectedId(null)}
          >
            <div
              className="pointer-events-none absolute inset-[3cqw] rounded-[1cqw] border-2"
              style={{ borderColor: design.accentColor, opacity: 0.35 }}
            />
            {design.elements.map((element) => (
              <div
                key={element.id}
                onPointerDown={(event) => handlePointerDown(event, element)}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                className={cn(
                  "absolute flex cursor-move items-center justify-center rounded-[0.5cqw] outline-offset-2 transition-shadow hover:outline hover:outline-primary/40",
                  selectedId === element.id &&
                    "outline-2 outline-primary outline-dashed"
                )}
                style={{
                  left: `${element.x}%`,
                  top: `${element.y}%`,
                  transform: "translate(-50%, -50%)",
                  padding: "0.5cqw",
                }}
              >
                <ElementView element={element} recipientName={recipientName} />
                {selectedId === element.id && (
                  <button
                    type="button"
                    aria-label="Hapus elemen"
                    onPointerDown={(event) => event.stopPropagation()}
                    onClick={() => removeElement(element.id)}
                    className="absolute -top-2 -right-2 flex size-5 items-center justify-center rounded-full bg-destructive text-white shadow-sm"
                  >
                    <HugeiconsIcon icon={Delete02Icon} className="size-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            Klik elemen untuk memilih, seret untuk memindahkan, dan gunakan
            panel di samping untuk mengedit.
          </p>
        </div>

        {/* Panel properti */}
        <div className="space-y-4 rounded-lg border p-3">
          {selected ? (
            <ElementProperties
              element={selected}
              onChange={(patch) => updateElement(selected.id, patch)}
              onDelete={() => removeElement(selected.id)}
            />
          ) : (
            <p className="text-sm text-muted-foreground">
              Pilih elemen pada sertifikat untuk mengedit teks, ukuran, dan
              warnanya.
            </p>
          )}

          <div className="space-y-3 border-t pt-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Warna aksen</Label>
              <ColorSwatches
                value={design.accentColor}
                onChange={(color) => {
                  onChange({
                    ...design,
                    accentColor: color,
                    elements: design.elements.map((element) =>
                      element.type === "divider" || element.type === "heading"
                        ? { ...element, color }
                        : element
                    ),
                  })
                }}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-xs">Badge medali</Label>
              <Switch
                checked={hasBadge}
                onCheckedChange={() =>
                  toggleElement("badge", {
                    id: "badge",
                    type: "badge",
                    x: 30,
                    y: 83,
                    size: 10,
                    color: design.badgeColor,
                  })
                }
              />
            </div>
            {hasBadge && (
              <div className="space-y-1.5">
                <Label className="text-xs">Warna badge</Label>
                <ColorSwatches
                  value={design.badgeColor}
                  onChange={(color) => {
                    onChange({
                      ...design,
                      badgeColor: color,
                      elements: design.elements.map((element) =>
                        element.type === "badge"
                          ? { ...element, color }
                          : element
                      ),
                    })
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pilih template */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground">
          Mulai dari template
        </p>
        <div className="flex flex-wrap gap-2">
          {mockTemplates.map((template) => (
            <button
              key={template.id}
              type="button"
              onClick={() => {
                onChange(buildDesign(template, meta))
                setSelectedId(null)
              }}
              className={cn(
                "flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-all hover:-translate-y-0.5 hover:shadow-sm",
                design.templateId === template.id
                  ? "border-primary ring-1 ring-primary/30"
                  : "hover:border-ring"
              )}
            >
              <span
                className="size-3 rounded-full"
                style={{ backgroundColor: template.accentColor }}
              />
              {template.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function ColorSwatches({
  value,
  onChange,
}: {
  value: string
  onChange: (color: string) => void
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {accentPresets.map((preset) => (
        <button
          key={preset.value}
          type="button"
          title={preset.label}
          aria-label={`Warna ${preset.label}`}
          onClick={() => onChange(preset.value)}
          className={cn(
            "size-6 rounded-full border-2 transition-transform hover:scale-110",
            value === preset.value ? "border-foreground" : "border-transparent"
          )}
          style={{ backgroundColor: preset.value }}
        />
      ))}
    </div>
  )
}

const textColorPresets = [
  "#111827",
  "#4b5563",
  "#6b7280",
  "#16204A",
  "#2A5BEA",
  "#16C0AE",
  "#B7791F",
  "#8B2635",
]

function ElementProperties({
  element,
  onChange,
  onDelete,
}: {
  element: CanvasElement
  onChange: (patch: Partial<CanvasElement>) => void
  onDelete: () => void
}) {
  const isText = ["heading", "subtitle", "recipient", "body"].includes(
    element.type
  )
  const sizeRange =
    element.type === "qr" || element.type === "badge" || element.type === "logo"
      ? { min: 4, max: 20, step: 0.5 }
      : element.type === "divider"
        ? { min: 10, max: 90, step: 1 }
        : { min: 1, max: 8, step: 0.1 }

  const labels: Record<string, string> = {
    heading: "Judul",
    subtitle: "Teks pengantar",
    recipient: "Nama penerima",
    body: "Teks isi",
    badge: "Badge medali",
    qr: "Kode QR",
    logo: "Logo",
    divider: "Garis pemisah",
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-foreground">
          {labels[element.type]}
        </p>
        <Button
          variant="ghost"
          size="icon-xs"
          aria-label="Hapus elemen"
          onClick={onDelete}
        >
          <HugeiconsIcon icon={Delete02Icon} />
        </Button>
      </div>

      {isText && element.type !== "recipient" && (
        <div className="space-y-1.5">
          <Label className="text-xs">Teks</Label>
          <Input
            value={element.text ?? ""}
            onChange={(event) => onChange({ text: event.target.value })}
          />
        </div>
      )}
      {element.type === "recipient" && (
        <p className="text-xs text-muted-foreground">
          Terisi otomatis dengan nama tiap penerima.
        </p>
      )}

      <div className="space-y-1.5">
        <Label className="text-xs">{isText ? "Ukuran teks" : "Ukuran"}</Label>
        <Slider
          value={[element.size]}
          min={sizeRange.min}
          max={sizeRange.max}
          step={sizeRange.step}
          onValueChange={(value) =>
            onChange({ size: Array.isArray(value) ? value[0] : value })
          }
        />
      </div>

      {isText && (
        <>
          <div className="flex items-center justify-between">
            <Label className="text-xs">Tebal</Label>
            <Switch
              checked={element.bold ?? false}
              onCheckedChange={(checked) => onChange({ bold: checked })}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Warna teks</Label>
            <div className="flex flex-wrap gap-1.5">
              {textColorPresets.map((color) => (
                <button
                  key={color}
                  type="button"
                  aria-label={`Warna ${color}`}
                  onClick={() => onChange({ color })}
                  className={cn(
                    "size-6 rounded-full border-2 transition-transform hover:scale-110",
                    element.color === color
                      ? "border-foreground"
                      : "border-transparent"
                  )}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
