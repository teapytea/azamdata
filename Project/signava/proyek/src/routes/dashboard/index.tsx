import {
  Certificate01Icon,
  Layers01Icon,
  MailSend01Icon,
  QrCode01Icon,
  Sent02Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { createFileRoute, Link } from "@tanstack/react-router"
import { motion } from "motion/react"
import { MetricCard } from "@/components/dashboard/metric-card"
import { BatchStatusBadge } from "@/components/dashboard/status-badge"
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
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatDate, formatNumber } from "@/lib/format"
import { getTemplateById, mockBatches, mockOverviewMetrics } from "@/lib/mock"
import { useMockLoading } from "@/lib/mock/use-mock-loading"

export const Route = createFileRoute("/dashboard/")({
  component: OverviewPage,
})

function OverviewPage() {
  const isLoading = useMockLoading()
  const recentBatches = [...mockBatches]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 5)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-foreground">Ringkasan</h1>
          <p className="text-sm text-muted-foreground">
            Pantau penerbitan dan distribusi kredensial organisasi Anda.
          </p>
        </div>
        <Button render={<Link to="/dashboard/batches/new" />}>
          <HugeiconsIcon icon={Sent02Icon} />
          Terbitkan sertifikat baru
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Kredensial terbit",
            value: mockOverviewMetrics.totalCredentials,
            hint: "Sepanjang waktu",
            icon: Certificate01Icon,
          },
          {
            label: "Batch aktif",
            value: mockOverviewMetrics.activeBatches,
            hint: "Draf dan sedang diproses",
            icon: Layers01Icon,
          },
          {
            label: "Scan verifikasi",
            value: mockOverviewMetrics.verificationScans,
            hint: "30 hari terakhir",
            icon: QrCode01Icon,
          },
          {
            label: "Email terkirim",
            value: mockOverviewMetrics.emailsSent,
            hint: "Sepanjang waktu",
            icon: MailSend01Icon,
          },
        ].map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: index * 0.08,
              duration: 0.5,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            <MetricCard
              label={metric.label}
              value={metric.value}
              hint={metric.hint}
              icon={metric.icon}
            />
          </motion.div>
        ))}
      </div>

      <Card className="shadow-xs">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="space-y-1">
            <CardTitle>Batch terbaru</CardTitle>
            <CardDescription>
              Lima batch terakhir yang Anda kerjakan.
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            render={<Link to="/dashboard/batches" />}
          >
            Lihat semua
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {["a", "b", "c", "d"].map((row) => (
                <Skeleton key={row} className="h-10 w-full" />
              ))}
            </div>
          ) : recentBatches.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <HugeiconsIcon icon={Certificate01Icon} />
                </EmptyMedia>
                <EmptyTitle>Belum ada batch</EmptyTitle>
                <EmptyDescription>
                  Terbitkan batch pertama Anda untuk mulai membagikan
                  kredensial.
                </EmptyDescription>
              </EmptyHeader>
              <Button render={<Link to="/dashboard/batches/new" />}>
                Terbitkan batch pertama
              </Button>
            </Empty>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama batch</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Template
                  </TableHead>
                  <TableHead className="text-right">Jumlah</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden sm:table-cell">
                    Tanggal
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentBatches.map((batch) => (
                  <TableRow key={batch.id}>
                    <TableCell>
                      <Link
                        to="/dashboard/batches/$id"
                        params={{ id: batch.id }}
                        className="font-medium text-foreground hover:underline"
                      >
                        {batch.name}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {batch.eventName}
                      </p>
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground md:table-cell">
                      {getTemplateById(batch.templateId)?.name ?? "—"}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatNumber(batch.totalCount)}
                    </TableCell>
                    <TableCell>
                      <BatchStatusBadge status={batch.status} />
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground sm:table-cell">
                      {formatDate(batch.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
