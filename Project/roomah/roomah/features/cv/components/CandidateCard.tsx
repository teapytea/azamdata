// features/cv/components/CandidateCard.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Briefcase, MapPin, GraduationCap, Eye, Coins } from "lucide-react";
import { createRequest } from "@/app/(app)/taaruf/actions";

const getAge = (dob?: string | null) => {
  if (!dob) return null;
  const today = new Date();
  const birth = new Date(dob);
  let a = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) a--;
  return a;
};

export default function CandidateCard({
  candidate,
  isLoggedIn,
  index,
}: {
  candidate: any;
  isLoggedIn: boolean;
  index: number;
}) {
  const router = useRouter();
  const age = getAge(candidate?.date_of_birth);
  const quote =
    candidate?.marriage_vision || candidate?.marriage_mission || "Sholehah";

  const handleAjukan = async () => {
    if (!isLoggedIn) {
      router.push("/login?next=/");
      return;
    }
    const result = await createRequest(candidate.user_id);
    alert(result.message);
    if (result.success) router.push("/taaruf");
  };

  const fallbackName = `${
    candidate?.gender === "ikhwan" ? "Ikhwan" : "Akhwat"
  }-${String(candidate?.id ?? index).padStart(3, "0")}`;
  const displayName = candidate?.full_name || fallbackName;

  const fallbackAvatar =
    candidate.gender === "ikhwan"
      ? "/avatar-ikhwan-placeholder.jpg"
      : "/avatar-akhwat-placeholder.jpg";

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg max-w-sm mx-auto">
      {/* Badge Siap Ta'aruf */}
      <div className="absolute right-4 top-4 z-10 rounded-full bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground">
        Siap Ta'aruf
      </div>

      {/* Avatar Section */}
      <div className="flex justify-center pt-12 pb-6">
        <div className="relative">
          <Image
            src={candidate?.avatarUrl || fallbackAvatar}
            alt={`Avatar ${displayName}`}
            width={88}
            height={88}
            className="h-22 w-22 rounded-full object-cover ring-2 ring-muted shadow-md"
          />
        </div>
      </div>

      {/* Content */}
      <div className="px-6 pb-6 text-center flex-1">
        {/* Name & Title */}
        <div className="mb-6">
          <h3 className="text-xl font-bold text-foreground mb-1">KANDIDAT</h3>
          <p className="text-sm text-muted-foreground font-medium">
            {candidate?.job || "aaaa"}
          </p>
        </div>

        {/* Stats Row */}
        <div className="mb-8 flex justify-center gap-8">
          <div className="flex flex-col items-center">
            <Briefcase size={20} className="mb-2 text-primary" />
            <span className="text-sm font-medium text-foreground">
              {age ?? "22"} tahun
            </span>
          </div>
          <div className="flex flex-col items-center">
            <MapPin size={20} className="mb-2 text-primary" />
            <span className="text-sm font-medium text-foreground">
              {candidate?.domicile_province || "Jakarta"}
            </span>
          </div>
          <div className="flex flex-col items-center">
            <GraduationCap size={20} className="mb-2 text-primary" />
            <span className="text-sm font-medium text-foreground">
              {candidate?.education || "S1"}
            </span>
          </div>
        </div>

        {/* Quote */}
        <div className="mb-8 min-h-[80px] flex items-center justify-center rounded-lg bg-muted/50 p-6">
          <p className="text-base italic text-muted-foreground font-medium">
            "{quote.length > 50 ? `${quote.substring(0, 50)}...` : quote}"
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-auto grid grid-cols-2 gap-0 border-t border-border">
        <Link
          href={`/profil/${candidate?.user_id}`}
          className="flex items-center justify-center gap-2 p-4 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Eye size={16} />
          Lihat CV
        </Link>
        <button
          onClick={handleAjukan}
          aria-label={`Ajukan Ta'aruf ke ${displayName}`}
          className="flex items-center justify-center gap-2 bg-primary p-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring border-l border-border"
        >
          <Coins size={16} />
          <span>5</span>
          Ajukan Ta'aruf
        </button>
      </div>
    </div>
  );
}
