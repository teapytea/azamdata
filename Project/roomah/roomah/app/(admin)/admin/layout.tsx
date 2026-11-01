export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-muted min-h-screen">
      <div className="p-4">
        <h2>Admin Layout</h2>
        {children}
      </div>
    </div>
  );
}
