import {
  CheckmarkBadge02Icon,
  GlobeIcon,
  InstagramIcon,
  Linkedin01Icon,
  Mail01Icon,
  Megaphone01Icon,
  QrCode01Icon,
  Share05Icon,
  WhatsappIcon,
} from "@hugeicons/core-free-icons"
import type { IconSvgElement } from "@hugeicons/react"
import { HugeiconsIcon } from "@hugeicons/react"
import { createFileRoute } from "@tanstack/react-router"
import { motion } from "motion/react"
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import { MetricCard } from "@/components/dashboard/metric-card"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatNumber } from "@/lib/format"
import {
  mockAnalyticsSeries,
  mockBatches,
  mockBrandReach,
  mockChannelInsights,
  mockCredentialFunnel,
} from "@/lib/mock"
import { useMockLoading } from "@/lib/mock/use-mock-loading"

export const Route = createFileRoute("/dashboard/analytics")({
  component: AnalyticsPage,
})

const issuanceConfig = {
  issued: { label: "Terbit", color: "#2A5BEA" },
  sent: { label: "Terkirim", color: "#16C0AE" },
} satisfies ChartConfig

const engagementConfig = {
  opened: { label: "Email dibuka", color: "#2A5BEA" },
  scanned: { label: "Scan verifikasi", color: "#16C0AE" },
} satisfies ChartConfig

const channelIcons: Record<string, IconSvgElement> = {
  LinkedIn: Linkedin01Icon,
  WhatsApp: WhatsappIcon,
  Email: Mail01Icon,
  "Scan QR": QrCode01Icon,
  Instagram: InstagramIcon,
  "Situs & lainnya": GlobeIcon,
}

const funnelSteps = [
  { key: "issued", label: "Terbit", color: "#16204A" },
  { key: "sent", label: "Terkirim via email", color: "#2A5BEA" },
  { key: "opened", label: "Dibuka penerima", color: "#4a7cf0" },
  { key: "shared", label: "Dibagikan ke publik", color: "#16C0AE" },
  { key: "verified", label: "Diverifikasi pihak ketiga", color: "#0f9c8d" },
] as const

function AnalyticsPage() {
  const isLoading = useMockLoading()
  const maxFunnel = mockCredentialFunnel.issued
  const maxVisits = Math.max(...mockChannelInsights.map((c) => c.visits))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Analitik</h1>
        <p className="text-sm text-muted-foreground">
          Lacak perjalanan kredensial Anda — dari terbit sampai dilihat perekrut
          di berbagai kanal.
        </p>
      </div>

      {/* Jangkauan brand */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          {
            label: "Estimasi tayangan brand",
            value: mockBrandReach.estimatedImpressions,
            hint: "Dari kredensial yang dibagikan penerima",
            icon: Megaphone01Icon,
          },
          {
            label: "Kredensial dibagikan",
            value: mockBrandReach.totalShares,
            hint: `Kanal teratas: ${mockBrandReach.topChannel}`,
            icon: Share05Icon,
          },
          {
            label: "Verifikasi pihak ketiga",
            value: mockBrandReach.thirdPartyVerifications,
            hint: "Perekrut/HR yang mengecek keaslian",
            icon: CheckmarkBadge02Icon,
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

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Corong kredensial */}
        <Card className="shadow-xs">
          <CardHeader>
            <CardTitle>Perjalanan kredensial</CardTitle>
            <CardDescription>
              Corong dari penerbitan sampai diverifikasi pihak ketiga.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading
              ? funnelSteps.map((step) => (
                  <Skeleton key={step.key} className="h-9 w-full" />
                ))
              : funnelSteps.map((step, index) => {
                  const value = mockCredentialFunnel[step.key]
                  const percent = Math.round((value / maxFunnel) * 100)
                  return (
                    <div key={step.key} className="space-y-1">
                      <div className="flex items-baseline justify-between text-xs">
                        <span className="font-medium text-foreground">
                          {step.label}
                        </span>
                        <span className="tabular-nums text-muted-foreground">
                          {formatNumber(value)} · {percent}%
                        </span>
                      </div>
                      <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ backgroundColor: step.color }}
                          initial={{ width: 0 }}
                          animate={{ width: `${percent}%` }}
                          transition={{
                            delay: 0.15 + index * 0.1,
                            duration: 0.7,
                            ease: [0.16, 1, 0.3, 1],
                          }}
                        />
                      </div>
                    </div>
                  )
                })}
            <p className="pt-1 text-xs text-muted-foreground">
              {Math.round(
                (mockCredentialFunnel.shared / mockCredentialFunnel.opened) *
                  100
              )}
              % penerima yang membuka email ikut membagikan kredensialnya — tiap
              bagikan adalah promosi gratis untuk brand Anda.
            </p>
          </CardContent>
        </Card>

        {/* Sumber kunjungan per kanal */}
        <Card className="shadow-xs">
          <CardHeader>
            <CardTitle>Dari mana kredensial Anda dilihat</CardTitle>
            <CardDescription>
              Terdeteksi dari tautan bagikan, header referer, dan pratinjau
              tautan platform (30 hari terakhir).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading
              ? mockChannelInsights.map((channel) => (
                  <Skeleton key={channel.channel} className="h-9 w-full" />
                ))
              : mockChannelInsights.map((channel, index) => (
                  <div
                    key={channel.channel}
                    className="flex items-center gap-3"
                  >
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <HugeiconsIcon
                        icon={channelIcons[channel.channel] ?? GlobeIcon}
                        className="size-4"
                      />
                    </span>
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-baseline justify-between gap-2 text-xs">
                        <span className="truncate font-medium text-foreground">
                          {channel.channel}
                        </span>
                        <span className="shrink-0 tabular-nums text-muted-foreground">
                          {formatNumber(channel.visits)} kunjungan
                        </span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                        <motion.div
                          className="h-full rounded-full bg-primary"
                          initial={{ width: 0 }}
                          animate={{
                            width: `${(channel.visits / maxVisits) * 100}%`,
                          }}
                          transition={{
                            delay: 0.15 + index * 0.08,
                            duration: 0.6,
                            ease: [0.16, 1, 0.3, 1],
                          }}
                        />
                      </div>
                    </div>
                    {channel.shares > 0 && (
                      <Badge
                        variant="secondary"
                        className="shrink-0 bg-accent text-accent-foreground"
                        title="Terdeteksi ditempel/dibagikan di kanal ini"
                      >
                        {formatNumber(channel.shares)}× dibagikan
                      </Badge>
                    )}
                  </div>
                ))}
          </CardContent>
        </Card>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Skeleton className="h-72 w-full rounded-xl" />
          <Skeleton className="h-72 w-full rounded-xl" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card className="shadow-xs">
            <CardHeader>
              <CardTitle>Penerbitan & pengiriman</CardTitle>
              <CardDescription>
                Jumlah kredensial terbit dan email terkirim per bulan.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={issuanceConfig} className="h-64 w-full">
                <AreaChart data={mockAnalyticsSeries}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value: string) => value.slice(0, 3)}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Area
                    dataKey="issued"
                    type="monotone"
                    fill="var(--color-issued)"
                    fillOpacity={0.15}
                    stroke="var(--color-issued)"
                    strokeWidth={2}
                  />
                  <Area
                    dataKey="sent"
                    type="monotone"
                    fill="var(--color-sent)"
                    fillOpacity={0.15}
                    stroke="var(--color-sent)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="shadow-xs">
            <CardHeader>
              <CardTitle>Keterlibatan penerima</CardTitle>
              <CardDescription>
                Email dibuka dan scan halaman verifikasi per bulan.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={engagementConfig} className="h-64 w-full">
                <BarChart data={mockAnalyticsSeries}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value: string) => value.slice(0, 3)}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar
                    dataKey="opened"
                    fill="var(--color-opened)"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="scanned"
                    fill="var(--color-scanned)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="shadow-xs">
        <CardHeader>
          <CardTitle>Kinerja per batch</CardTitle>
          <CardDescription>
            Perbandingan distribusi dan verifikasi tiap batch.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {["a", "b", "c", "d"].map((row) => (
                <Skeleton key={row} className="h-10 w-full" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Batch</TableHead>
                  <TableHead className="text-right">Terbit</TableHead>
                  <TableHead className="text-right">Terkirim</TableHead>
                  <TableHead className="hidden text-right sm:table-cell">
                    Dibuka
                  </TableHead>
                  <TableHead className="hidden text-right sm:table-cell">
                    Discan
                  </TableHead>
                  <TableHead className="hidden text-right md:table-cell">
                    Tingkat buka
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockBatches
                  .filter((batch) => batch.issuedCount > 0)
                  .map((batch) => (
                    <TableRow key={batch.id}>
                      <TableCell className="font-medium text-foreground">
                        {batch.name}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatNumber(batch.issuedCount)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatNumber(batch.sentCount)}
                      </TableCell>
                      <TableCell className="hidden text-right tabular-nums sm:table-cell">
                        {formatNumber(batch.openedCount)}
                      </TableCell>
                      <TableCell className="hidden text-right tabular-nums sm:table-cell">
                        {formatNumber(batch.scannedCount)}
                      </TableCell>
                      <TableCell className="hidden text-right tabular-nums md:table-cell">
                        {batch.sentCount > 0
                          ? `${Math.round((batch.openedCount / batch.sentCount) * 100)}%`
                          : "—"}
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
