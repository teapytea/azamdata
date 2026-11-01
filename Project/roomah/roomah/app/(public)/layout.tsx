// app/(public)/layout.tsx
import type { ReactNode } from "react";
import PublicNavbar from "@/features/layout/PublicNavbar"; // sesuaikan path komponen navbar-mu

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <PublicNavbar />
      {children}
    </div>
  );
}
