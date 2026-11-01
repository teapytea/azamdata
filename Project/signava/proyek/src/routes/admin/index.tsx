import {
  Building06Icon,
  Certificate01Icon,
  Layers01Icon,
  Money01Icon,
  UserMultiple02Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { createFileRoute, Link } from "@tanstack/react-router"
import { motion } from "motion/react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import { MetricCard } from "@/components/dashboard/metric-card"
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
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatDate, formatNumber, formatRupiah } from "@/lib/format"
import {
  platformMetrics,
  platformOrgs,
  platformRevenueSeries,
} from "@/lib/mock"
import { orgStatusBadge } from "@/lib/admin-ui"

export const Route = createFileRoute("/admin/")({
  component: AdminOverviewPage,
})

const revenueConfig = {
  mrr: { label: "MRR", color: "#2A5BEA" },
} satisfies ChartConfig

function AdminOverviewPage() {
  const recentOrgs = [...platformOrgs]
    .sort((a, b) => b.joinedAt.localeCompare(a.joinedAt))
    .slice(0, 6)

  const metrics = [
    {
      label: "Organisasi",
      value: platformMetrics.totalOrgs,
      hint: `${platformMetrics.activeTrials} sedang uji coba`,
      icon: Building06Icon,
    },
    {
      label: "Total pengguna",
      value: platformMetrics.totalUsers,
      hint: "Lintas seluruh organisasi",
      icon: UserMultiple02Icon,
    },
    {
      label: "Kredensial terbit",
      value: platformMetrics.credentialsIssued,
      hint: "Sepanjang waktu",
      icon: Certificate01Icon,
    },
    {
      label: "MRR",
      value: platformMetrics.mrr,
      hint: `Churn ${platformMetrics.churnRate}%/bulan`,
      icon: Money01Icon,
      isCurrency: true,
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Ringkasan platform</h1>
        <p className="text-sm text-muted-foreground">
          Pantau kesehatan seluruh Signava dari satu tempat.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric, index) => (
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
            {metric.isCurrency ? (
              <Card className="shadow-xs transition-shadow hover:shadow-md">
                <CardContent className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">
                      {metric.label}
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      {formatRupiah(metric.value)}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {metric.hint}
                    </p>
                  </div>
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <HugeiconsIcon icon={metric.icon} className="size-4.5" />
                  </div>
                </CardContent>
              </Card>
            ) : (
              <MetricCard
                label={metric.label}
                value={metric.value}
                hint={metric.hint}
                icon={metric.icon}
              />
            )}
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Card className="shadow-xs">
          <CardHeader>
            <CardTitle>Pertumbuhan pendapatan berulang</CardTitle>
            <CardDescription>MRR platform per bulan (Rp).</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={revenueConfig} className="h-64 w-full">
              <AreaChart data={platformRevenueSeries}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value: string) => value.slice(0, 3)}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value) => formatRupiah(Number(value))}
                    />
                  }
                />
                <Area
                  dataKey="mrr"
                  type="monotone"
                  fill="var(--color-mrr)"
                  fillOpacity={0.15}
                  stroke="var(--color-mrr)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="shadow-xs">
          <CardHeader>
            <CardTitle>Aksi cepat</CardTitle>
            <CardDescription>Kelola yang penting hari ini.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start"
              render={<Link to="/admin/templates" />}
            >
              <HugeiconsIcon icon={Layers01Icon} />
              Kelola template sistem
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              render={<Link to="/admin/organizations" />}
            >
              <HugeiconsIcon icon={Building06Icon} />
              Pantau organisasi & user
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              render={<Link to="/admin/finance" />}
            >
              <HugeiconsIcon icon={Money01Icon} />
              Lihat keuangan
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-xs">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="space-y-1">
            <CardTitle>Organisasi terbaru</CardTitle>
            <CardDescription>Enam pendaftar terakhir.</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            render={<Link to="/admin/organizations" />}
          >
            Lihat semua
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Organisasi</TableHead>
                <TableHead className="hidden sm:table-cell">Kategori</TableHead>
                <TableHead className="text-right">Kredensial</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Bergabung</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentOrgs.map((org) => (
                <TableRow key={org.id}>
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-brand-navy text-[10px] font-bold text-white">
                        {org.initials}
                      </span>
                      <span className="font-medium text-foreground">
                        {org.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground sm:table-cell">
                    {org.category}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatNumber(org.credentialsIssued)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={orgStatusBadge(org.status).className}
                    >
                      {orgStatusBadge(org.status).label}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground md:table-cell">
                    {formatDate(org.joinedAt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
