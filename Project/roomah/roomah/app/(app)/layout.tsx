import Navbar from "@/components/layout/Navbar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar variant="app" />
      <main className="flex-grow">{children}</main>
    </div>
  );
}
