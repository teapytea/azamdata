import { Tick02Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"
import { toast } from "sonner"

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
  currentOrganization,
  mockOrders,
  mockPlans,
  mockVolumePacks,
  type OrderStatus,
} from "@/lib/mock"
import { cn } from "@/lib/utils"

export const Route = createFileRoute("/dashboard/settings/billing")({
  component: BillingSettingsPage,
})

const orderStatusLabels: Record<OrderStatus, string> = {
  paid: "Lunas",
  pending: "Menunggu pembayaran",
  failed: "Gagal",
}

const orderStatusStyles: Record<OrderStatus, string> = {
  paid: "bg-accent text-accent-foreground",
  pending: "bg-primary/10 text-primary",
  failed: "bg-destructive/10 text-destructive",
}

function BillingSettingsPage() {
  const [checkoutItem, setCheckoutItem] = useState<string | null>(null)

  return (
    <div className="space-y-6">
      <Card className="shadow-xs">
        <CardContent className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">
              Saldo kredit saat ini
            </p>
            <p className="text-2xl font-bold text-foreground">
              {formatNumber(currentOrganization.creditBalance)} kredensial
            </p>
            <p className="text-xs text-muted-foreground">
              1 kredit = 1 kredensial terbit. Kredit volume pack tidak hangus.
            </p>
          </div>
          <Badge className="bg-primary/10 px-3 py-2 text-primary">
            Paket aktif: Pro
          </Badge>
        </CardContent>
      </Card>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">
          Paket langganan
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {mockPlans.map((plan) => {
            const isCurrent = plan.id === currentOrganization.plan
            return (
              <Card
                key={plan.id}
                className={cn(
                  "shadow-xs",
                  plan.highlighted && "border-primary ring-1 ring-primary/30"
                )}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{plan.name}</CardTitle>
                    {plan.highlighted && <Badge>Terpopuler</Badge>}
                  </div>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col gap-4">
                  <div>
                    <span className="text-2xl font-bold text-foreground">
                      {plan.priceMonthly === 0
                        ? "Gratis"
                        : formatRupiah(plan.priceMonthly)}
                    </span>
                    {plan.priceMonthly > 0 && (
                      <span className="text-sm text-muted-foreground">
                        /bulan
                      </span>
                    )}
                  </div>
                  <ul className="flex-1 space-y-2">
                    {plan.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-2 text-sm text-muted-foreground"
                      >
                        <HugeiconsIcon
                          icon={Tick02Icon}
                          className="mt-0.5 size-4 shrink-0 text-primary"
                        />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button
                    variant={isCurrent ? "outline" : "default"}
                    disabled={isCurrent}
                    onClick={() => setCheckoutItem(`Langganan ${plan.name}`)}
                  >
                    {isCurrent ? "Paket saat ini" : `Pilih ${plan.name}`}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="text-base font-semibold text-foreground">
            Volume pack
          </h2>
          <p className="text-sm text-muted-foreground">
            Beli kredit sekali bayar untuk acara besar — tanpa langganan.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {mockVolumePacks.map((pack) => (
            <Card key={pack.id} className="shadow-xs">
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {pack.name}
                  </p>
                  <p className="text-xs text-muted-foreground">{pack.note}</p>
                </div>
                <p className="text-xl font-bold text-foreground">
                  {formatRupiah(pack.price)}
                </p>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setCheckoutItem(pack.name)}
                >
                  Beli {formatNumber(pack.credits)} kredit
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Card className="shadow-xs">
        <CardHeader>
          <CardTitle>Riwayat transaksi</CardTitle>
          <CardDescription>
            Semua pembayaran diproses melalui Pakasir (QRIS/virtual account).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transaksi</TableHead>
                <TableHead className="hidden sm:table-cell">Metode</TableHead>
                <TableHead className="text-right">Jumlah</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Tanggal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>
                    <p className="font-medium text-foreground">
                      {order.description}
                    </p>
                    <p className="font-mono text-xs text-muted-foreground">
                      {order.orderId}
                    </p>
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground sm:table-cell">
                    {order.method}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatRupiah(order.amount)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={orderStatusStyles[order.status]}
                    >
                      {orderStatusLabels[order.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground md:table-cell">
                    {formatDate(order.date)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog
        open={checkoutItem !== null}
        onOpenChange={(open) => !open && setCheckoutItem(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Checkout via Pakasir</DialogTitle>
            <DialogDescription>
              Anda akan diarahkan ke halaman pembayaran Pakasir untuk{" "}
              {checkoutItem}. Setelah pembayaran terverifikasi, paket/kredit
              aktif otomatis.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 rounded-lg border bg-muted/40 p-4 text-sm">
            <p className="font-medium text-foreground">Metode yang tersedia:</p>
            <ul className="list-inside list-disc text-muted-foreground">
              <li>QRIS (semua e-wallet dan mobile banking)</li>
              <li>Virtual account (BCA, BNI, BRI, Mandiri)</li>
            </ul>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCheckoutItem(null)}>
              Batal
            </Button>
            <Button
              onClick={() => {
                setCheckoutItem(null)
                toast.info(
                  "Integrasi pembayaran Pakasir akan aktif saat backend tersambung"
                )
              }}
            >
              Lanjut ke pembayaran
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
