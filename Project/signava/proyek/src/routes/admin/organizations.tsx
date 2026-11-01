import { MoreVerticalIcon, Search01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"
import { toast } from "sonner"

import { TablePagination } from "@/components/dashboard/table-pagination"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { orgStatusBadge, planBadgeClass, planLabels } from "@/lib/admin-ui"
import { formatDate, formatNumber, formatRupiah } from "@/lib/format"
import { platformOrgs } from "@/lib/mock"

export const Route = createFileRoute("/admin/organizations")({
  component: AdminOrganizationsPage,
})

const PAGE_SIZE = 8
type PlanFilter = "semua" | "free" | "pro" | "bisnis"

function AdminOrganizationsPage() {
  const [query, setQuery] = useState("")
  const [planFilter, setPlanFilter] = useState<PlanFilter>("semua")
  const [page, setPage] = useState(1)

  const filtered = platformOrgs.filter((org) => {
    const matchesQuery =
      query.trim() === "" ||
      org.name.toLowerCase().includes(query.toLowerCase()) ||
      org.category.toLowerCase().includes(query.toLowerCase())
    const matchesPlan = planFilter === "semua" || org.plan === planFilter
    return matchesQuery && matchesPlan
  })
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const totalUsers = platformOrgs.reduce((sum, org) => sum + org.users, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">
          Organisasi & pengguna
        </h1>
        <p className="text-sm text-muted-foreground">
          {formatNumber(platformOrgs.length)} organisasi ·{" "}
          {formatNumber(totalUsers)} pengguna terdaftar (contoh data).
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-xs">
          <HugeiconsIcon
            icon={Search01Icon}
            className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value)
              setPage(1)
            }}
            placeholder="Cari organisasi atau kategori"
            className="pl-9"
          />
        </div>
        <Select
          value={planFilter}
          onValueChange={(value) => {
            if (!value) return
            setPlanFilter(value as PlanFilter)
            setPage(1)
          }}
        >
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Semua paket" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="semua">Semua paket</SelectItem>
            <SelectItem value="free">Gratis</SelectItem>
            <SelectItem value="pro">Pro</SelectItem>
            <SelectItem value="bisnis">Bisnis</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="shadow-xs">
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Organisasi</TableHead>
                <TableHead>Paket</TableHead>
                <TableHead className="hidden text-right sm:table-cell">
                  User
                </TableHead>
                <TableHead className="text-right">Kredensial</TableHead>
                <TableHead className="hidden text-right lg:table-cell">
                  MRR
                </TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden text-muted-foreground xl:table-cell">
                  Aktif terakhir
                </TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageItems.map((org) => (
                <TableRow key={org.id}>
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-brand-navy text-[10px] font-bold text-white">
                        {org.initials}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-foreground">
                          {org.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {org.category}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={planBadgeClass(org.plan)}
                    >
                      {planLabels[org.plan]}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden text-right tabular-nums sm:table-cell">
                    {org.users}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatNumber(org.credentialsIssued)}
                  </TableCell>
                  <TableCell className="hidden text-right tabular-nums lg:table-cell">
                    {org.mrr > 0 ? formatRupiah(org.mrr) : "—"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={orgStatusBadge(org.status).className}
                    >
                      {orgStatusBadge(org.status).label}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground xl:table-cell">
                    {formatDate(org.lastActiveAt)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`Aksi untuk ${org.name}`}
                          />
                        }
                      >
                        <HugeiconsIcon icon={MoreVerticalIcon} />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-52">
                        <DropdownMenuItem
                          onClick={() =>
                            toast.info(`Membuka detail ${org.name}`)
                          }
                        >
                          Lihat detail
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            toast.info(`Masuk sebagai ${org.name} (impersonate)`)
                          }
                        >
                          Masuk sebagai org ini
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() =>
                            toast.success(`${org.name} ditangguhkan`)
                          }
                        >
                          Tangguhkan
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <TablePagination
            page={page}
            pageSize={PAGE_SIZE}
            totalItems={filtered.length}
            onPageChange={setPage}
          />
        </CardContent>
      </Card>
    </div>
  )
}
