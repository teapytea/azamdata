// features/home/data.ts
import { createClient } from "@/lib/supabase/client-server";

type SearchParams = Record<string, string | string[] | undefined>;
const PAGE_SIZE = 12;

function parseAgeRange(val?: string) {
  if (!val) return null;
  const [minS, maxS] = val.split("-");
  const min = Number(minS);
  const max = Number(maxS);
  if (isNaN(min)) return null;
  return { min, max: isNaN(max) ? 120 : max };
}

export async function getDistinctProvinces(): Promise<string[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cvs")
    .select("domicile_province")
    .eq("status", "approved")
    .not("domicile_province", "is", null);

  if (error || !data) return [];
  const set = new Set<string>();
  for (const r of data) if (r.domicile_province) set.add(r.domicile_province);
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}

export async function getFilteredCandidates(searchParams: SearchParams) {
  const supabase = await createClient();

  const page = Math.max(1, Number(searchParams.page ?? 1));
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const gender =
    typeof searchParams.gender === "string" ? searchParams.gender : "";
  const edu = typeof searchParams.edu === "string" ? searchParams.edu : "";
  const prov = typeof searchParams.prov === "string" ? searchParams.prov : "";
  const age = parseAgeRange(
    typeof searchParams.age === "string" ? searchParams.age : ""
  );

  let query = supabase
    .from("cvs")
    .select(
      `
      id,
      user_id,
      job,
      education,
      domicile_province,
      date_of_birth,
      marriage_vision,
      marriage_mission,
      avatar_path,
      created_at,
      profiles:profiles!inner ( id, full_name, gender )
    `,
      { count: "exact" }
    )
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  if (gender === "ikhwan" || gender === "akhwat") {
    query = query.eq("profiles.gender", gender);
  }
  if (edu) query = query.eq("education", edu);
  if (prov) query = query.eq("domicile_province", prov);

  query = query.range(from, to);

  const { data, error, count } = await query;
  if (error || !data) {
    return { data: [], count: 0, page, pageSize: PAGE_SIZE, totalPages: 1 };
  }

  // signed URL avatar per kandidat
  const withSigned = [];
  for (const row of data as any[]) {
    let avatarUrl: string | null = null;
    if (row.avatar_path) {
      const { data: s } = await supabase.storage
        .from("avatars")
        .createSignedUrl(row.avatar_path, 3600);
      avatarUrl = s?.signedUrl ?? null;
    }
    withSigned.push({ ...row, avatarUrl });
  }

  // filter umur di sisi JS (cukup utk MVP)
  const now = new Date();
  const withAge = withSigned.map((r: any) => {
    let ageYears: number | null = null;
    if (r.date_of_birth) {
      const dob = new Date(r.date_of_birth);
      let a = now.getFullYear() - dob.getFullYear();
      const m = now.getMonth() - dob.getMonth();
      if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) a--;
      ageYears = a;
    }
    return { ...r, __age: ageYears };
  });

  const ageFiltered =
    age && age.min != null
      ? withAge.filter(
          (r: any) =>
            r.__age != null && r.__age >= age.min && r.__age <= age.max
        )
      : withAge;

  const totalPages = Math.max(
    1,
    Math.ceil((count ?? ageFiltered.length) / PAGE_SIZE)
  );

  return {
    data: ageFiltered,
    count: count ?? ageFiltered.length,
    page,
    pageSize: PAGE_SIZE,
    totalPages,
  };
}
