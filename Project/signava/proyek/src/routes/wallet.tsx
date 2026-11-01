import {
  Download01Icon,
  Linkedin01Icon,
  LinkSquare01Icon,
  Share01Icon,
  Wallet01Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { createFileRoute, Link } from "@tanstack/react-router"
import { useId, useState } from "react"
import { toast } from "sonner"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDate } from "@/lib/format"
import { mockPublicProfile, mockWalletCredentials } from "@/lib/mock"
import { useMockLoading } from "@/lib/mock/use-mock-loading"

export const Route = createFileRoute("/wallet")({
  component: WalletPage,
})

function WalletPage() {
  const isLoading = useMockLoading()
  const handleId = useId()
  const [yearFilter, setYearFilter] = useState("semua")
  const [handle, setHandle] = useState(mockPublicProfile.handle)

  const years = [
    ...new Set(mockWalletCredentials.map((c) => `${c.year}`)),
  ].sort((a, b) => b.localeCompare(a))
  const filtered = mockWalletCredentials.filter(
    (credential) =>
      yearFilter === "semua" || `${credential.year}` === yearFilter
  )

  return (
    <div className="min-h-svh bg-muted/30">
      <header className="flex h-14 items-center justify-between border-b bg-background px-4 md:px-8">
        <Link to="/" className="flex items-center gap-2.5">
          <img
            src="/logo-signava.png"
            alt="Logo Signava"
            className="size-7 rounded-lg object-contain"
          />
          <span className="text-sm font-semibold text-foreground">Signava</span>
        </Link>
        <Avatar className="size-8">
          <AvatarFallback className="bg-brand-navy text-[10px] font-bold text-white">
            KL
          </AvatarFallback>
        </Avatar>
      </header>

      <main className="mx-auto max-w-5xl space-y-6 px-4 py-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-foreground">
              Dompet kredensial saya
            </h1>
            <p className="text-sm text-muted-foreground">
              Semua sertifikat Anda dari berbagai penyelenggara, dalam satu
              tempat.
            </p>
          </div>
          <Button
            variant="outline"
            render={
              <Link
                to="/u/$handle"
                params={{ handle: mockPublicProfile.handle }}
              />
            }
          >
            <HugeiconsIcon icon={LinkSquare01Icon} />
            Lihat portofolio publik
          </Button>
        </div>

        <Card className="shadow-xs">
          <CardContent className="flex flex-wrap items-end gap-3">
            <div className="min-w-64 flex-1 space-y-2">
              <Label htmlFor={handleId}>Handle portofolio publik</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  signava.id/u/
                </span>
                <Input
                  id={handleId}
                  value={handle}
                  onChange={(event) => setHandle(event.target.value)}
                  className="flex-1"
                />
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => toast.success(`Handle publik disimpan: ${handle}`)}
            >
              Simpan handle
            </Button>
          </CardContent>
        </Card>

        <div className="flex items-center gap-3">
          <Select
            value={yearFilter}
            onValueChange={(value) => setYearFilter(value ?? "semua")}
          >
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Semua tahun" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="semua">Semua tahun</SelectItem>
              {years.map((year) => (
                <SelectItem key={year} value={year}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            {filtered.length} kredensial
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {["a", "b", "c"].map((item) => (
              <Skeleton key={item} className="h-44 w-full rounded-xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <Empty className="py-16">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <HugeiconsIcon icon={Wallet01Icon} />
              </EmptyMedia>
              <EmptyTitle>Belum ada kredensial</EmptyTitle>
              <EmptyDescription>
                Kredensial yang Anda klaim dari email penyelenggara akan muncul
                di sini.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((credential) => (
              <Card key={credential.id} className="shadow-xs">
                <CardContent className="space-y-3">
                  <div
                    className="h-1.5 w-full rounded-full"
                    style={{ backgroundColor: credential.accentColor }}
                  />
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-foreground">
                      {credential.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {credential.organizationName} ·{" "}
                      {formatDate(credential.issuedAt)}
                    </p>
                  </div>
                  <div className="flex gap-1.5">
                    <Button
                      variant="outline"
                      size="icon-sm"
                      aria-label="Bagikan tautan"
                      onClick={() => toast.success("Tautan kredensial disalin")}
                    >
                      <HugeiconsIcon icon={Share01Icon} />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon-sm"
                      aria-label="Tambahkan ke LinkedIn"
                      onClick={() =>
                        toast.info("Membuka LinkedIn add-to-profile…")
                      }
                    >
                      <HugeiconsIcon icon={Linkedin01Icon} />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon-sm"
                      aria-label="Unduh PDF"
                      onClick={() => toast.info("Mengunduh PDF…")}
                    >
                      <HugeiconsIcon icon={Download01Icon} />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="ml-auto"
                      render={
                        <Link
                          to="/verify/$publicId"
                          params={{ publicId: credential.publicId }}
                        />
                      }
                    >
                      Verifikasi
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
