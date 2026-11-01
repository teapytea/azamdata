"use client";

import { useRouter } from "next/navigation";
import { Tabs } from "@/components/ui";

export function PeriodTabs({ value }: { value: string }) {
  const router = useRouter();
  return (
    <div className="card p-1">
      <Tabs value={value} onChange={(p) => router.push(p === "today" ? "/dashboard" : `/dashboard?period=${p}`)}
        items={[{ id: "today", label: "Hari ini" }, { id: "week", label: "7 hari" }, { id: "month", label: "Bulan ini" }]} />
    </div>
  );
}
