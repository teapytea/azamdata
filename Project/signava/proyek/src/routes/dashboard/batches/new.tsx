import {
  Add01Icon,
  Alert02Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  CheckmarkBadge02Icon,
  CheckmarkCircle02Icon,
  CloudUploadIcon,
  Delete02Icon,
  Sent02Icon,
  Tick02Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { createFileRoute, Link } from "@tanstack/react-router"
import { motion } from "motion/react"
import { useId, useRef, useState } from "react"
import { toast } from "sonner"

import {
  buildDesign,
  type CertDesign,
  CertificateCanvas,
  CertificateEditor,
} from "@/components/certificate-editor"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { formatDate } from "@/lib/format"
import {
  type CredentialMeta,
  credentialFormatOptions,
  credentialLevelOptions,
  credentialTypeOptions,
  currentOrganization,
  earningCategoryOptions,
  makeDefaultCredentialMeta,
  mockTemplates,
} from "@/lib/mock"
import { cn } from "@/lib/utils"

export const Route = createFileRoute("/dashboard/batches/new")({
  component: NewBatchPage,
})

interface Participant {
  id: string
  name: string
  email: string
}

function headingText(design: CertDesign): string {
  return (
    design.elements.find((element) => element.type === "heading")?.text ??
    "Sertifikat"
  )
}

// Hasil "parsing" pura-pura dari file Excel/CSV yang diunggah
const uploadedColumns = [
  "Nama Lengkap",
  "Alamat Email",
  "Program",
  "Keterangan",
]

const uploadedRows: Record<string, string>[] = [
  {
    "Nama Lengkap": "Dewi Anggraini",
    "Alamat Email": "dewi.anggraini@gmail.com",
  },
  {
    "Nama Lengkap": "Rizky Pratama",
    "Alamat Email": "rizky.pratama@gmail.com",
  },
  { "Nama Lengkap": "Andi Saputra", "Alamat Email": "andi.saputra@gmail.com" },
  { "Nama Lengkap": "", "Alamat Email": "tanpa.nama@gmail.com" },
  { "Nama Lengkap": "Maya Lestari", "Alamat Email": "maya.lestari@gmail.com" },
  {
    "Nama Lengkap": "Dewi Anggraini",
    "Alamat Email": "dewi.anggraini@gmail.com",
  },
]

const steps = [
  { number: 1, label: "Data kredensial" },
  { number: 2, label: "Data peserta" },
  { number: 3, label: "Desain sertifikat" },
  { number: 4, label: "Pratinjau & terbitkan" },
]

let participantCounter = 0

function makeParticipant(): Participant {
  participantCounter += 1
  return { id: `p-${participantCounter}`, name: "", email: "" }
}

function NewBatchPage() {
  const [step, setStep] = useState(1)
  const [batchName, setBatchName] = useState("")
  const [meta, setMeta] = useState<CredentialMeta>(makeDefaultCredentialMeta)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [design, setDesign] = useState<CertDesign>(() =>
    buildDesign(mockTemplates[0], makeDefaultCredentialMeta())
  )
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [sendEmail, setSendEmail] = useState(true)
  const [issueState, setIssueState] = useState<"idle" | "issuing" | "done">(
    "idle"
  )
  const [progress, setProgress] = useState(0)

  const stepReady: Record<number, boolean> = {
    1: batchName.trim() !== "",
    2: participants.length > 0,
    3: true,
  }

  const issue = () => {
    setConfirmOpen(false)
    setIssueState("issuing")
    setProgress(0)
    const interval = setInterval(() => {
      setProgress((current) => {
        const nextValue = current + 12
        if (nextValue >= 100) {
          clearInterval(interval)
          setIssueState("done")
          return 100
        }
        return nextValue
      })
    }, 350)
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <Link
          to="/dashboard/batches"
          className="text-xs text-muted-foreground hover:text-foreground hover:underline"
        >
          ← Kembali ke daftar batch
        </Link>
        <h1 className="mt-1 text-xl font-bold text-foreground">
          Terbitkan sertifikat baru
        </h1>
        <p className="text-sm text-muted-foreground">
          Satu alur lengkap: isi data kredensial, masukkan peserta, atur desain,
          lalu terbitkan secara massal.
        </p>
      </div>

      <Stepper currentStep={step} />

      {issueState === "issuing" ? (
        <IssuingCard progress={progress} total={participants.length} />
      ) : issueState === "done" ? (
        <SuccessCard total={participants.length} sendEmail={sendEmail} />
      ) : (
        <>
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            {step === 1 && (
              <StepCredentialMeta
                batchName={batchName}
                onBatchNameChange={setBatchName}
                meta={meta}
                onChange={setMeta}
              />
            )}
            {step === 2 && (
              <StepParticipants
                participants={participants}
                onChange={setParticipants}
              />
            )}
            {step === 3 && (
              <StepDesign
                design={design}
                onChange={setDesign}
                meta={meta}
                previewName={participants[0]?.name || "Nama peserta"}
              />
            )}
            {step === 4 && (
              <StepPreview
                batchName={batchName}
                meta={meta}
                design={design}
                participants={participants}
                onIssueRequest={() => setConfirmOpen(true)}
              />
            )}
          </motion.div>

          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              disabled={step === 1}
              onClick={() => setStep((s) => Math.max(1, s - 1))}
            >
              <HugeiconsIcon icon={ArrowLeft01Icon} />
              Sebelumnya
            </Button>
            {step < 4 && (
              <Button
                disabled={!stepReady[step]}
                onClick={() => setStep((s) => Math.min(4, s + 1))}
              >
                Selanjutnya
                <HugeiconsIcon icon={ArrowRight01Icon} />
              </Button>
            )}
          </div>
        </>
      )}

      <ConfirmIssueDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        total={participants.length}
        sendEmail={sendEmail}
        onSendEmailChange={setSendEmail}
        onConfirm={issue}
      />
    </div>
  )
}

function Stepper({ currentStep }: { currentStep: number }) {
  return (
    <ol className="flex items-center gap-2">
      {steps.map((step, index) => (
        <li key={step.number} className="flex flex-1 items-center gap-2">
          <motion.div
            animate={{ scale: currentStep === step.number ? 1.1 : 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className={cn(
              "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors",
              currentStep > step.number
                ? "bg-accent text-accent-foreground"
                : currentStep === step.number
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
            )}
          >
            {currentStep > step.number ? (
              <HugeiconsIcon icon={Tick02Icon} className="size-4" />
            ) : (
              step.number
            )}
          </motion.div>
          <span
            className={cn(
              "hidden text-sm sm:inline",
              currentStep === step.number
                ? "font-semibold text-foreground"
                : "text-muted-foreground"
            )}
          >
            {step.label}
          </span>
          {index < steps.length - 1 && (
            <div className="h-px flex-1 bg-border" aria-hidden="true" />
          )}
        </li>
      ))}
    </ol>
  )
}

function StepCredentialMeta({
  batchName,
  onBatchNameChange,
  meta,
  onChange,
}: {
  batchName: string
  onBatchNameChange: (value: string) => void
  meta: CredentialMeta
  onChange: (meta: CredentialMeta) => void
}) {
  const nameId = useId()
  const durationId = useId()
  const priceId = useId()
  const descriptionId = useId()
  const skillId = useId()
  const [skillInput, setSkillInput] = useState("")

  const patch = (partial: Partial<CredentialMeta>) =>
    onChange({ ...meta, ...partial })

  const addSkill = () => {
    const skill = skillInput.trim()
    if (!skill || meta.skills.includes(skill)) return
    patch({ skills: [...meta.skills, skill] })
    setSkillInput("")
  }

  return (
    <Card className="shadow-xs">
      <CardHeader>
        <CardTitle>Langkah 1 — Data kredensial</CardTitle>
        <CardDescription>
          Detail resmi acara atau pencapaian. Data ini melekat pada tiap
          sertifikat dan tampil di halaman verifikasinya.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="max-w-md space-y-2">
          <Label htmlFor={nameId}>Nama batch</Label>
          <Input
            id={nameId}
            value={batchName}
            onChange={(event) => onBatchNameChange(event.target.value)}
            placeholder="Contoh: Wisuda periode Juli 2026"
          />
          <p className="text-xs text-muted-foreground">
            Nama internal untuk mengenali batch ini di daftar Anda.
          </p>
        </div>

        <Separator />

        <section className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              Detail acara
            </h3>
            <p className="text-xs text-muted-foreground">
              Jenis, tingkat, format, durasi, dan harga kredensial.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>Jenis</Label>
              <Select
                value={meta.type}
                onValueChange={(value) => value && patch({ type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {credentialTypeOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tingkat</Label>
              <Select
                value={meta.level}
                onValueChange={(value) => value && patch({ level: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {credentialLevelOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Format</Label>
              <Select
                value={meta.format}
                onValueChange={(value) => value && patch({ format: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {credentialFormatOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:max-w-sm">
            <div className="space-y-2">
              <Label htmlFor={durationId}>Durasi</Label>
              <div className="relative">
                <Input
                  id={durationId}
                  type="number"
                  min={0}
                  className="pr-10"
                  value={meta.durationHours}
                  onChange={(event) =>
                    patch({ durationHours: Number(event.target.value) || 0 })
                  }
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  jam
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor={priceId}>Harga</Label>
              <Input
                id={priceId}
                value={meta.price}
                placeholder="Gratis / Rp750.000"
                onChange={(event) => patch({ price: event.target.value })}
              />
            </div>
          </div>
        </section>

        <Separator />

        <section className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              Tentang & keahlian
            </h3>
            <p className="text-xs text-muted-foreground">
              Deskripsi kegiatan dan keahlian yang diperoleh penerima.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor={descriptionId}>Deskripsi</Label>
            <Textarea
              id={descriptionId}
              rows={3}
              value={meta.description}
              placeholder="Jelaskan kegiatan atau pencapaian yang mendasari kredensial ini…"
              onChange={(event) => patch({ description: event.target.value })}
            />
          </div>

          <div className="max-w-lg space-y-2">
            <Label htmlFor={skillId}>Keahlian terkait</Label>
            <div className="flex gap-2">
              <Input
                id={skillId}
                value={skillInput}
                placeholder="Contoh: Analisis data"
                onChange={(event) => setSkillInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault()
                    addSkill()
                  }
                }}
              />
              <Button variant="outline" onClick={addSkill}>
                Tambah
              </Button>
            </div>
            {meta.skills.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {meta.skills.map((skill) => (
                  <motion.span
                    key={skill}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 25 }}
                  >
                    <Badge variant="secondary" className="gap-1 pr-1">
                      {skill}
                      <button
                        type="button"
                        aria-label={`Hapus keahlian ${skill}`}
                        className="rounded-full px-1 hover:bg-foreground/10"
                        onClick={() =>
                          patch({
                            skills: meta.skills.filter((s) => s !== skill),
                          })
                        }
                      >
                        ×
                      </button>
                    </Badge>
                  </motion.span>
                ))}
              </div>
            )}
          </div>
        </section>

        <Separator />

        <section className="space-y-3">
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              Kriteria perolehan
            </h3>
            <p className="text-xs text-muted-foreground">
              Syarat yang harus dipenuhi peserta untuk menerima kredensial ini.
            </p>
          </div>
          {meta.earningCriteria.map((criterion, index) => (
            <div
              key={criterion.id}
              className="flex flex-wrap items-center gap-2"
            >
              <Select
                value={criterion.category}
                onValueChange={(value) => {
                  if (value === null) return
                  patch({
                    earningCriteria: meta.earningCriteria.map((c, i) =>
                      i === index ? { ...c, category: value } : c
                    ),
                  })
                }}
              >
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {earningCategoryOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                className="min-w-48 flex-1"
                value={criterion.detail}
                placeholder="Contoh: Mengikuti minimal 80% sesi"
                onChange={(event) =>
                  patch({
                    earningCriteria: meta.earningCriteria.map((c, i) =>
                      i === index ? { ...c, detail: event.target.value } : c
                    ),
                  })
                }
              />
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Hapus kriteria"
                onClick={() =>
                  patch({
                    earningCriteria: meta.earningCriteria.filter(
                      (_, i) => i !== index
                    ),
                  })
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
              patch({
                earningCriteria: [
                  ...meta.earningCriteria,
                  {
                    id: `criterion-${Date.now()}`,
                    category: earningCategoryOptions[0],
                    detail: "",
                  },
                ],
              })
            }
          >
            <HugeiconsIcon icon={Add01Icon} />
            Tambah kriteria
          </Button>
        </section>
      </CardContent>
    </Card>
  )
}

function StepParticipants({
  participants,
  onChange,
}: {
  participants: Participant[]
  onChange: (participants: Participant[]) => void
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [nameColumn, setNameColumn] = useState(uploadedColumns[0])
  const [emailColumn, setEmailColumn] = useState(uploadedColumns[1])

  const applyUpload = () => {
    const mapped: Participant[] = uploadedRows.map((row, index) => ({
      id: `upload-${index}`,
      name: row[nameColumn] ?? "",
      email: row[emailColumn] ?? "",
    }))
    onChange(mapped)
    toast.success(`${mapped.length} baris berhasil dibaca dari file`)
  }

  const updateParticipant = (id: string, patch: Partial<Participant>) => {
    onChange(
      participants.map((participant) =>
        participant.id === id ? { ...participant, ...patch } : participant
      )
    )
  }

  return (
    <Card className="shadow-xs">
      <CardHeader>
        <CardTitle>Langkah 2 — Data peserta</CardTitle>
        <CardDescription>
          Cukup nama dan email — detail acara sudah tersimpan di data
          kredensial. Tambahkan satu per satu, atau unggah Excel/CSV untuk
          volume besar.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="manual">
          <TabsList>
            <TabsTrigger value="manual">Input manual</TabsTrigger>
            <TabsTrigger value="upload">Unggah Excel/CSV</TabsTrigger>
          </TabsList>

          <TabsContent value="manual" className="space-y-4 pt-4">
            {participants.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Belum ada peserta. Tambahkan baris pertama untuk memulai.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama lengkap</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="w-12" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {participants.map((participant) => (
                    <TableRow key={participant.id}>
                      <TableCell>
                        <Input
                          value={participant.name}
                          placeholder="Contoh: Dewi Anggraini"
                          onChange={(event) =>
                            updateParticipant(participant.id, {
                              name: event.target.value,
                            })
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="email"
                          value={participant.email}
                          placeholder="nama@email.com"
                          onChange={(event) =>
                            updateParticipant(participant.id, {
                              email: event.target.value,
                            })
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label="Hapus baris"
                          onClick={() =>
                            onChange(
                              participants.filter(
                                (p) => p.id !== participant.id
                              )
                            )
                          }
                        >
                          <HugeiconsIcon icon={Delete02Icon} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            <Button
              variant="outline"
              onClick={() => onChange([...participants, makeParticipant()])}
            >
              <HugeiconsIcon icon={Add01Icon} />
              Tambah baris
            </Button>
          </TabsContent>

          <TabsContent value="upload" className="space-y-4 pt-4">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-8 text-center transition-colors hover:border-ring hover:bg-muted/40"
            >
              <HugeiconsIcon
                icon={CloudUploadIcon}
                className="size-8 text-muted-foreground"
              />
              <div>
                <p className="text-sm font-medium text-foreground">
                  {fileName ?? "Klik untuk memilih file Excel atau CSV"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Format .xlsx atau .csv, maksimal 5.000 baris
                </p>
              </div>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0]
                if (file) {
                  setFileName(file.name)
                  toast.info("File terbaca — atur pemetaan kolom di bawah")
                }
              }}
            />

            {fileName && (
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Petakan kolom file
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Kolom terdeteksi: {uploadedColumns.join(", ")}
                  </p>
                </div>
                <div className="grid max-w-lg grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label>Nama lengkap</Label>
                    <Select
                      value={nameColumn}
                      onValueChange={(value) => value && setNameColumn(value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {uploadedColumns.map((column) => (
                          <SelectItem key={column} value={column}>
                            {column}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Email penerima</Label>
                    <Select
                      value={emailColumn}
                      onValueChange={(value) => value && setEmailColumn(value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {uploadedColumns.map((column) => (
                          <SelectItem key={column} value={column}>
                            {column}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button onClick={applyUpload}>
                  Terapkan ({uploadedRows.length} baris)
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

function StepDesign({
  design,
  onChange,
  meta,
  previewName,
}: {
  design: CertDesign
  onChange: (design: CertDesign) => void
  meta: CredentialMeta
  previewName: string
}) {
  return (
    <Card className="shadow-xs">
      <CardHeader>
        <CardTitle>Langkah 3 — Desain sertifikat</CardTitle>
        <CardDescription>
          Pilih template, lalu edit langsung di atas pratinjau: geser posisi,
          ubah teks, warna, badge, QR, dan ukuran kertas sesuai preferensi Anda.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <CertificateEditor
          design={design}
          onChange={onChange}
          meta={meta}
          recipientName={previewName}
        />
      </CardContent>
    </Card>
  )
}

function StepPreview({
  batchName,
  meta,
  design,
  participants,
  onIssueRequest,
}: {
  batchName: string
  meta: CredentialMeta
  design: CertDesign
  participants: Participant[]
  onIssueRequest: () => void
}) {
  const [previewId, setPreviewId] = useState(participants[0]?.id ?? "")
  const previewParticipant =
    participants.find((participant) => participant.id === previewId) ??
    participants[0]

  const emptyNames = participants.filter((p) => p.name.trim() === "")
  const seen = new Set<string>()
  const duplicates = participants.filter((participant) => {
    const key = `${participant.name.trim().toLowerCase()}|${participant.email.trim().toLowerCase()}`
    if (key === "|") return false
    if (seen.has(key)) return true
    seen.add(key)
    return false
  })
  const invalidEmails = participants.filter(
    (participant) =>
      participant.email.trim() !== "" &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(participant.email.trim())
  )

  const warnings = [
    emptyNames.length > 0 && `${emptyNames.length} baris tanpa nama`,
    duplicates.length > 0 &&
      `${duplicates.length} baris duplikat (nama + email sama)`,
    invalidEmails.length > 0 &&
      `${invalidEmails.length} alamat email tidak valid`,
  ].filter(Boolean) as string[]

  return (
    <Card className="shadow-xs">
      <CardHeader>
        <CardTitle>Langkah 4 — Pratinjau & terbitkan</CardTitle>
        <CardDescription>
          Lihat hasil akhir dari sisi penerima sebelum menerbitkan{" "}
          {participants.length} kredensial untuk batch "{batchName}".
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {warnings.length > 0 ? (
          <Alert className="border-amber-300/60 text-amber-700 dark:border-amber-500/40 dark:text-amber-400">
            <HugeiconsIcon icon={Alert02Icon} />
            <AlertTitle>Periksa data berikut sebelum menerbitkan</AlertTitle>
            <AlertDescription>
              <ul className="list-inside list-disc">
                {warnings.map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        ) : (
          <Alert>
            <HugeiconsIcon icon={CheckmarkCircle02Icon} />
            <AlertTitle>Data siap diterbitkan</AlertTitle>
            <AlertDescription>
              Tidak ditemukan nama kosong, duplikat, atau email tidak valid.
            </AlertDescription>
          </Alert>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Pratinjau untuk:
          </span>
          <Select
            value={previewParticipant?.id ?? ""}
            onValueChange={(value) => value && setPreviewId(value)}
          >
            <SelectTrigger className="w-56" size="sm">
              <SelectValue placeholder="Pilih peserta" />
            </SelectTrigger>
            <SelectContent>
              {participants.map((participant) => (
                <SelectItem key={participant.id} value={participant.id}>
                  {participant.name.trim() || "(tanpa nama)"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Tabs defaultValue="certificate">
          <TabsList>
            <TabsTrigger value="certificate">Sertifikat</TabsTrigger>
            <TabsTrigger value="verification">Halaman verifikasi</TabsTrigger>
            <TabsTrigger value="email">Email</TabsTrigger>
          </TabsList>

          <TabsContent value="certificate" className="pt-4">
            <CertificateCanvas
              design={design}
              recipientName={previewParticipant?.name || "Nama peserta"}
              className="mx-auto max-w-2xl"
            />
          </TabsContent>

          <TabsContent value="verification" className="pt-4">
            <div className="mx-auto max-w-xl space-y-4 rounded-xl border bg-muted/30 p-5">
              <div className="flex flex-col items-center gap-2 text-center">
                <Badge className="gap-1.5 bg-accent text-accent-foreground">
                  <HugeiconsIcon
                    icon={CheckmarkBadge02Icon}
                    className="size-3.5!"
                  />
                  Kredensial terverifikasi
                </Badge>
                <p className="text-lg font-bold text-foreground">
                  {previewParticipant?.name || "Nama peserta"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Diterbitkan oleh {currentOrganization.name} ·{" "}
                  {formatDate(new Date().toISOString().slice(0, 10))}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                {[
                  { label: "Jenis", value: meta.type },
                  { label: "Tingkat", value: meta.level },
                  { label: "Format", value: meta.format },
                  {
                    label: "Durasi",
                    value:
                      meta.durationHours > 0
                        ? `${meta.durationHours} jam`
                        : "—",
                  },
                  { label: "Harga", value: meta.price || "—" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-lg border bg-background p-2"
                  >
                    <p className="text-[10px] text-muted-foreground">
                      {item.label}
                    </p>
                    <p className="truncate text-xs font-semibold text-foreground">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
              {meta.description && (
                <p className="text-xs text-muted-foreground">
                  {meta.description}
                </p>
              )}
              {meta.earningCriteria.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-foreground">
                    Kriteria perolehan
                  </p>
                  {meta.earningCriteria.map((criterion) => (
                    <p
                      key={criterion.id}
                      className="text-xs text-muted-foreground"
                    >
                      • {criterion.category}
                      {criterion.detail ? ` — ${criterion.detail}` : ""}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="email" className="pt-4">
            <div className="mx-auto max-w-xl overflow-hidden rounded-xl border bg-background">
              <div className="space-y-0.5 border-b bg-muted/40 px-5 py-3 text-xs">
                <p>
                  <span className="text-muted-foreground">Dari:</span>{" "}
                  <span className="font-medium text-foreground">
                    {currentOrganization.name} via Signava
                  </span>
                </p>
                <p>
                  <span className="text-muted-foreground">Subjek:</span>{" "}
                  <span className="font-medium text-foreground">
                    Selamat! Sertifikat Anda dari {currentOrganization.name}
                  </span>
                </p>
              </div>
              <div className="space-y-4 px-5 py-6 text-sm">
                <p className="text-foreground">
                  Halo {previewParticipant?.name || "Nama peserta"},
                </p>
                <p className="text-muted-foreground">
                  Selamat! Anda menerima kredensial "{headingText(design)}"
                  untuk {batchName}. Klik tombol di bawah untuk melihat,
                  mengunduh, dan membagikan sertifikat Anda.
                </p>
                <div
                  className="w-fit rounded-lg px-4 py-2 text-sm font-semibold text-white"
                  style={{ backgroundColor: design.accentColor }}
                >
                  Lihat kredensial saya
                </div>
                <p className="text-xs text-muted-foreground">
                  Dikirim melalui Signava — platform kredensial digital
                  Indonesia.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <Button
          size="lg"
          disabled={participants.length === 0}
          onClick={onIssueRequest}
        >
          <HugeiconsIcon icon={Sent02Icon} />
          Terbitkan {participants.length} kredensial
        </Button>
      </CardContent>
    </Card>
  )
}

function ConfirmIssueDialog({
  open,
  onOpenChange,
  total,
  sendEmail,
  onSendEmailChange,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  total: number
  sendEmail: boolean
  onSendEmailChange: (value: boolean) => void
  onConfirm: () => void
}) {
  const nowId = useId()
  const laterId = useId()
  const emailId = useId()
  const noEmailId = useId()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Anda akan menerbitkan {total} kredensial</DialogTitle>
          <DialogDescription>
            Periksa pengaturan penerbitan sebelum melanjutkan.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="space-y-2.5">
            <p className="text-sm font-semibold text-foreground">
              Kapan kredensial diterbitkan?
            </p>
            <RadioGroup value="now">
              <div className="flex items-center gap-2">
                <RadioGroupItem value="now" id={nowId} />
                <Label htmlFor={nowId} className="font-normal">
                  Terbitkan sekarang
                </Label>
              </div>
              <div className="flex items-center gap-2 opacity-50">
                <RadioGroupItem value="later" id={laterId} disabled />
                <Label htmlFor={laterId} className="font-normal">
                  Jadwalkan nanti{" "}
                  <Badge variant="outline" className="ml-1">
                    Segera hadir
                  </Badge>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2.5">
            <p className="text-sm font-semibold text-foreground">
              Bagaimana kredensial dikirimkan?
            </p>
            <RadioGroup
              value={sendEmail ? "email" : "none"}
              onValueChange={(value) => onSendEmailChange(value === "email")}
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="email" id={emailId} />
                <Label htmlFor={emailId} className="font-normal">
                  Kirim email ke penerima
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="none" id={noEmailId} />
                <Label htmlFor={noEmailId} className="font-normal">
                  Jangan kirim email
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="rounded-lg border bg-primary/5 px-4 py-3 text-sm text-foreground">
            {sendEmail ? (
              <>
                Signava akan mengirim email berisi tautan kredensial ke{" "}
                <span className="font-semibold">{total} penerima</span> secara
                bertahap.
              </>
            ) : (
              <>
                Kredensial tetap bisa dibagikan atau dikirim ulang kapan saja
                dari halaman detail batch.
              </>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button onClick={onConfirm}>Terbitkan sekarang</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function IssuingCard({ progress, total }: { progress: number; total: number }) {
  return (
    <Card className="shadow-xs">
      <CardContent className="space-y-3 py-10">
        <p className="text-center text-sm font-medium text-foreground">
          Menerbitkan {total} kredensial… {progress}%
        </p>
        <Progress value={progress} className="mx-auto max-w-md" />
        <p className="text-center text-xs text-muted-foreground">
          Batch besar diproses bertahap. Anda bisa meninggalkan halaman ini.
        </p>
      </CardContent>
    </Card>
  )
}

function SuccessCard({
  total,
  sendEmail,
}: {
  total: number
  sendEmail: boolean
}) {
  return (
    <Card className="shadow-xs">
      <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 18 }}
          className="flex size-14 items-center justify-center rounded-full bg-accent text-accent-foreground"
        >
          <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-7" />
        </motion.div>
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-foreground">
            Batch berhasil diterbitkan
          </h2>
          <p className="max-w-md text-sm text-muted-foreground">
            {total} kredensial telah dibuat
            {sendEmail
              ? " dan email sedang dikirim bertahap ke tiap penerima."
              : ". Anda bisa mengirim email atau mengunduhnya kapan saja."}
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          <Button
            render={
              <Link to="/dashboard/batches/$id" params={{ id: "batch-3" }} />
            }
          >
            Lihat detail batch
          </Button>
          <Button variant="outline" render={<Link to="/dashboard/batches" />}>
            Kembali ke daftar batch
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
