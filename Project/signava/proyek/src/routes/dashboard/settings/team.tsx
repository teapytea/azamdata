import { UserAdd01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { createFileRoute } from "@tanstack/react-router"
import { useId, useState } from "react"
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
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { formatDate } from "@/lib/format"
import { mockTeamMembers, type Role, type TeamMember } from "@/lib/mock"

export const Route = createFileRoute("/dashboard/settings/team")({
  component: TeamSettingsPage,
})

const roleLabels: Record<Role, string> = {
  owner: "Pemilik",
  admin: "Admin",
  member: "Anggota",
}

function TeamSettingsPage() {
  const emailId = useId()
  const [members, setMembers] = useState<TeamMember[]>(mockTeamMembers)
  const [inviteOpen, setInviteOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState<Role>("member")

  const invite = () => {
    if (!inviteEmail.includes("@")) {
      toast.error("Masukkan alamat email yang valid")
      return
    }
    const newMember: TeamMember = {
      id: `member-${Date.now()}`,
      orgId: "org-1",
      name: inviteEmail.split("@")[0],
      email: inviteEmail,
      role: inviteRole,
      status: "diundang",
      joinedAt: new Date().toISOString().slice(0, 10),
    }
    setMembers((current) => [...current, newMember])
    setInviteEmail("")
    setInviteOpen(false)
    toast.success(`Undangan dikirim ke ${newMember.email}`)
  }

  const changeRole = (member: TeamMember, role: Role) => {
    setMembers((current) =>
      current.map((m) => (m.id === member.id ? { ...m, role } : m))
    )
    toast.success(`Peran ${member.name} diubah menjadi ${roleLabels[role]}`)
  }

  return (
    <Card className="shadow-xs">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="space-y-1">
          <CardTitle>Anggota tim</CardTitle>
          <CardDescription>
            Atur siapa saja yang bisa mengelola organisasi ini.
          </CardDescription>
        </div>
        <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
          <DialogTrigger render={<Button />}>
            <HugeiconsIcon icon={UserAdd01Icon} />
            Undang anggota
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Undang anggota baru</DialogTitle>
              <DialogDescription>
                Anggota menerima email undangan untuk bergabung ke organisasi.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor={emailId}>Email</Label>
                <Input
                  id={emailId}
                  type="email"
                  value={inviteEmail}
                  onChange={(event) => setInviteEmail(event.target.value)}
                  placeholder="nama@email.com"
                />
              </div>
              <div className="space-y-2">
                <Label>Peran</Label>
                <Select
                  value={inviteRole}
                  onValueChange={(value) => setInviteRole(value as Role)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="member">Anggota</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setInviteOpen(false)}>
                Batal
              </Button>
              <Button onClick={invite}>Kirim undangan</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Anggota</TableHead>
              <TableHead>Peran</TableHead>
              <TableHead className="hidden sm:table-cell">Status</TableHead>
              <TableHead className="hidden md:table-cell">Bergabung</TableHead>
              <TableHead className="w-24" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => (
              <TableRow key={member.id}>
                <TableCell>
                  <p className="font-medium text-foreground">{member.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {member.email}
                  </p>
                </TableCell>
                <TableCell>
                  {member.role === "owner" ? (
                    <Badge variant="secondary">Pemilik</Badge>
                  ) : (
                    <Select
                      value={member.role}
                      onValueChange={(value) =>
                        changeRole(member, value as Role)
                      }
                    >
                      <SelectTrigger className="w-28" size="sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="member">Anggota</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <Badge
                    variant="secondary"
                    className={
                      member.status === "aktif"
                        ? "bg-accent text-accent-foreground"
                        : "bg-muted text-muted-foreground"
                    }
                  >
                    {member.status === "aktif" ? "Aktif" : "Diundang"}
                  </Badge>
                </TableCell>
                <TableCell className="hidden text-muted-foreground md:table-cell">
                  {formatDate(member.joinedAt)}
                </TableCell>
                <TableCell>
                  {member.role !== "owner" && (
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => {
                        setMembers((current) =>
                          current.filter((m) => m.id !== member.id)
                        )
                        toast.success(`${member.name} dikeluarkan dari tim`)
                      }}
                    >
                      Keluarkan
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
