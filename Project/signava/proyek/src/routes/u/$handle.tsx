import {
  CheckmarkBadge02Icon,
  UnavailableIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { createFileRoute, Link } from "@tanstack/react-router"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { formatDate } from "@/lib/format"
import { mockPublicProfile } from "@/lib/mock"

export const Route = createFileRoute("/u/$handle")({
  component: PublicProfilePage,
})

function PublicProfilePage() {
  const { handle } = Route.useParams()
  const profile = handle === mockPublicProfile.handle ? mockPublicProfile : null

  return (
    <div className="flex min-h-svh flex-col bg-muted/30">
      <header className="flex h-14 items-center justify-between border-b bg-background px-4 md:px-8">
        <Link to="/" className="flex items-center gap-2.5">
          <img
            src="/logo-signava.png"
            alt="Logo Signava"
            className="size-7 rounded-lg object-contain"
          />
          <span className="text-sm font-semibold text-foreground">Signava</span>
        </Link>
        <Button variant="outline" size="sm" render={<Link to="/register" />}>
          Buat portofolio Anda
        </Button>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 space-y-6 px-4 py-10">
        {!profile ? (
          <Card className="shadow-xs">
            <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
              <div className="flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                <HugeiconsIcon icon={UnavailableIcon} className="size-7" />
              </div>
              <div className="space-y-1">
                <h1 className="text-lg font-bold text-foreground">
                  Portofolio tidak ditemukan
                </h1>
                <p className="max-w-md text-sm text-muted-foreground">
                  Handle "{handle}" tidak terdaftar di Signava.
                </p>
              </div>
              <Button variant="outline" render={<Link to="/" />}>
                Ke beranda Signava
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="flex flex-col items-center gap-3 text-center">
              <Avatar className="size-16">
                <AvatarFallback className="bg-brand-navy text-lg font-bold text-white">
                  {profile.name
                    .split(" ")
                    .slice(0, 2)
                    .map((word) => word[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-xl font-bold text-foreground">
                  {profile.name}
                </h1>
                <p className="text-sm text-muted-foreground">
                  signava.id/u/{handle}
                </p>
              </div>
              <p className="max-w-md text-sm text-muted-foreground">
                {profile.bio}
              </p>
              <Badge className="gap-1.5 bg-accent text-accent-foreground">
                <HugeiconsIcon
                  icon={CheckmarkBadge02Icon}
                  className="size-3.5!"
                />
                {profile.credentials.length} kredensial terverifikasi
              </Badge>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {profile.credentials.map((credential) => (
                <Link
                  key={credential.id}
                  to="/verify/$publicId"
                  params={{ publicId: credential.publicId }}
                  className="block"
                >
                  <Card className="h-full shadow-xs transition-colors hover:border-ring">
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
                      <p className="text-xs font-medium text-primary">
                        Lihat verifikasi →
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </>
        )}
      </main>

      <footer className="border-t bg-background py-4 text-center text-xs text-muted-foreground">
        Portofolio diverifikasi oleh Signava
      </footer>
    </div>
  )
}
