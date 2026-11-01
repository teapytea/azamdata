// app/(public)/profil/[userId]/page.tsx
export default function ProfilePage({
  params,
}: {
  params: { userId: string };
}) {
  return (
    <main className="container mx-auto px-4 py-16 text-center">
      <h1 className="text-3xl font-bold">Profil Publik Kandidat</h1>
      <p className="mt-4 text-lg text-neutral-600">
        Fitur halaman profil publik lengkap akan segera hadir.
      </p>
      <p className="mt-2 text-sm text-neutral-500">
        ID Kandidat: {params.userId}
      </p>
    </main>
  );
}
