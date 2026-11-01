// app/(auth)/layout.tsx
import type { ReactNode } from "react";
import PublicNavbar from "@/features/layout/PublicNavbar";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <PublicNavbar />
      <main className="flex min-h-[calc(100vh-64px)] items-center justify-center px-4">
        {children}
      </main>
    </div>
  );
}
