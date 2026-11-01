import type { Organization, TeamMember } from "./types"

export const mockOrganizations: Organization[] = [
  {
    id: "org-1",
    name: "Universitas Nusantara Jaya",
    handle: "univ-nusantara-jaya",
    initials: "UN",
    category: "Perguruan tinggi",
    plan: "pro",
    creditBalance: 2350,
  },
  {
    id: "org-2",
    name: "LPK Karya Digital",
    handle: "lpk-karya-digital",
    initials: "KD",
    category: "Lembaga pelatihan kerja",
    plan: "free",
    creditBalance: 80,
  },
  {
    id: "org-3",
    name: "Komunitas Data Indonesia",
    handle: "komunitas-data-id",
    initials: "KI",
    category: "Komunitas",
    plan: "bisnis",
    creditBalance: 7600,
  },
]

export const currentOrganization = mockOrganizations[0]

export const currentUser = {
  id: "user-1",
  name: "Pandu Wicaksono",
  email: "pandu@univnusantara.ac.id",
  initials: "PW",
  role: "owner" as const,
}

export const mockTeamMembers: TeamMember[] = [
  {
    id: "member-1",
    orgId: "org-1",
    name: "Pandu Wicaksono",
    email: "pandu@univnusantara.ac.id",
    role: "owner",
    status: "aktif",
    joinedAt: "2025-09-12",
  },
  {
    id: "member-2",
    orgId: "org-1",
    name: "Sari Rahmawati",
    email: "sari@univnusantara.ac.id",
    role: "admin",
    status: "aktif",
    joinedAt: "2025-10-03",
  },
  {
    id: "member-3",
    orgId: "org-1",
    name: "Bimo Aditya",
    email: "bimo@univnusantara.ac.id",
    role: "member",
    status: "aktif",
    joinedAt: "2026-01-19",
  },
  {
    id: "member-4",
    orgId: "org-1",
    name: "Rina Kusuma",
    email: "rina.kusuma@gmail.com",
    role: "member",
    status: "diundang",
    joinedAt: "2026-06-28",
  },
]
