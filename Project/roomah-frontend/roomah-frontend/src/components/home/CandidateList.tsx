// src/components/home/CandidateList.tsx
"use client";

import { Profile } from "@/lib/mock-data";
import ProfileCard from "@/components/shared/ProfileCard";

interface CandidateListProps {
  profiles: Profile[];
  isLoading: boolean;
}

export default function CandidateList({
  profiles,
  isLoading,
}: CandidateListProps) {
  if (isLoading) {
    return (
      <div className="text-center py-10 text-text-secondary">
        Memuat data kandidat...
      </div>
    );
  }

  if (!isLoading && profiles.length === 0) {
    return (
      <div className="text-center py-10 text-text-secondary">
        Tidak ada profil yang cocok dengan kriteria Anda.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in">
      {profiles.map((profile, index) => (
        <ProfileCard key={profile.id} profile={profile} />
      ))}
    </div>
  );
}
