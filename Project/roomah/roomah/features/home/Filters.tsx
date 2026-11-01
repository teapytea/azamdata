// features/home/Filters.tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

export default function Filters({ provinces }: { provinces: string[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const q = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set(name, value);
      else params.delete(name);
      params.set("page", "1");
      return params.toString();
    },
    [searchParams]
  );

  const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    router.push(`/?${q(e.target.name, e.target.value)}`, { scroll: false });
  };

  const onReset = () => router.push("/", { scroll: false });

  const baseSelect =
    "w-full sm:flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors";

  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-sm sm:flex-row sm:gap-4">
      <select
        name="gender"
        onChange={onChange}
        value={searchParams.get("gender") || ""}
        className={baseSelect}
      >
        <option value="">Pilih Gender</option>
        <option value="ikhwan">Ikhwan</option>
        <option value="akhwat">Akhwat</option>
      </select>

      <select
        name="age"
        onChange={onChange}
        value={searchParams.get("age") || ""}
        className={baseSelect}
      >
        <option value="">Pilih Umur</option>
        <option value="17-22">17 — 22 tahun</option>
        <option value="23-26">23 — 26 tahun</option>
        <option value="27-30">27 — 30 tahun</option>
        <option value="31-35">31 — 35 tahun</option>
        <option value="36-99">36+ tahun</option>
      </select>

      <select
        name="edu"
        onChange={onChange}
        value={searchParams.get("edu") || ""}
        className={baseSelect}
      >
        <option value="">Pilih Pendidikan</option>
        <option value="SMA/SMK">SMA/SMK</option>
        <option value="D3">D3</option>
        <option value="S1">S1</option>
        <option value="S2+">S2+</option>
      </select>

      <select
        name="prov"
        onChange={onChange}
        value={searchParams.get("prov") || ""}
        className={baseSelect}
      >
        <option value="">Pilih Domisili</option>
        {provinces.map((p) => (
          <option key={p} value={p}>
            {p}
          </option>
        ))}
      </select>

      <button
        onClick={onReset}
        className="w-full shrink-0 rounded-md bg-foreground px-6 py-2 text-sm font-semibold text-background shadow-sm hover:bg-foreground/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors sm:w-auto"
      >
        Reset
      </button>
    </div>
  );
}
