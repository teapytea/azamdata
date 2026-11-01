import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, Search, Save, Shield, Store, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

const dashboardEnvSchema = z
  .object({
    VITE_ENABLE_ADMIN_STOCK_DASHBOARD: z.string().optional(),
    VITE_ADMIN_STOCK_LOCAL_MODE: z.string().optional(),
    VITE_ADMIN_STOCK_DASHBOARD_TOKEN: z.string().optional(),
    VITE_SUPABASE_URL: z.string().url(),
    VITE_SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
  })
  .passthrough();

const dashboardEnvResult = dashboardEnvSchema.safeParse(import.meta.env);
const DASHBOARD_ENV = dashboardEnvResult.success ? dashboardEnvResult.data : null;
const ENABLE_ADMIN_STOCK_DASHBOARD = DASHBOARD_ENV?.VITE_ENABLE_ADMIN_STOCK_DASHBOARD === "true";
const ENABLE_LOCAL_STOCK_MODE = DASHBOARD_ENV?.VITE_ADMIN_STOCK_LOCAL_MODE === "true";
const ADMIN_TOKEN_STORAGE_KEY = "aromatique_admin_stock_token";
const LOCAL_AVAILABILITY_STORAGE_KEY = "aromatique_local_store_availability_v1";
const PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const;
const pageSizeSelectSchema = z.preprocess(
  (value) => Number(value),
  z.union([z.literal(10), z.literal(25), z.literal(50), z.literal(100)]),
);
const availabilityStatusSchema = z.enum(["in_stock", "out_of_stock"]);
const statusFilterSchema = z.union([z.literal("all"), availabilityStatusSchema]);
const storeRowSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  displayName: z.string(),
});
const storeDbRowsSchema = z.array(
  z.object({
    id: z.string(),
    store_slug: z.string(),
    store_name: z.string(),
    display_name: z.string().nullable(),
  }),
);
const productDbRowsSchema = z.array(
  z.object({
    product_id: z.string(),
    product_name: z.string(),
    visual_note: z.string().nullable(),
    visual_note_alt: z.string().nullable(),
    revolutionize: z.string().nullable(),
    main_accords: z.string().nullable(),
    olfactory_family: z.string().nullable(),
    meaning: z.string().nullable(),
  }),
);
const productRowSchema = z.object({
  productId: z.string(),
  productName: z.string(),
  visualNote: z.string().nullable(),
  visualNoteAlt: z.string().nullable(),
  revolutionize: z.string().nullable(),
  mainAccords: z.string().nullable(),
  olfactoryFamily: z.string().nullable(),
  meaning: z.string().nullable(),
  availabilityStatus: availabilityStatusSchema,
  stockQty: z.number().nullable(),
  lastUpdatedAt: z.string().nullable(),
});
const adminProductsResponseSchema = z.object({
  rows: z.array(productRowSchema),
});
const adminUpsertResponseSchema = z
  .object({
    lastUpdatedAt: z.string().nullable().optional(),
  })
  .passthrough();
const adminErrorResponseSchema = z.object({
  error: z.string(),
});
const localAvailabilitySchema = z.record(
  z.string(),
  z.record(
    z.string(),
    z.object({
      availabilityStatus: availabilityStatusSchema,
      lastUpdatedAt: z.string(),
    }),
  ),
);

type StoreRow = z.infer<typeof storeRowSchema>;
type AvailabilityStatus = z.infer<typeof availabilityStatusSchema>;
type ProductRow = z.infer<typeof productRowSchema>;
type PageSize = z.infer<typeof pageSizeSelectSchema>;
type LocalAvailability = z.infer<typeof localAvailabilitySchema>;

const LOCAL_STORES = [
  {
    id: "local_aromatique_jamal",
    slug: "aromatique_jamal",
    name: "Aromatique Jamal",
    displayName: "Aromatique Jamal",
  },
  {
    id: "local_urban_tajem",
    slug: "urban_tajem",
    name: "Urban Tajem",
    displayName: "Urban Tajem",
  },
] satisfies StoreRow[];

export default function AdminStockDashboard() {
  const [adminToken, setAdminToken] = useState(() => {
    const envToken = DASHBOARD_ENV?.VITE_ADMIN_STOCK_DASHBOARD_TOKEN;
    if (envToken) return envToken;
    try {
      return window.sessionStorage.getItem(ADMIN_TOKEN_STORAGE_KEY) ?? "";
    } catch {
      return "";
    }
  });
  const [tokenInput, setTokenInput] = useState(adminToken);
  const [stores, setStores] = useState<StoreRow[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState("");
  const [rows, setRows] = useState<ProductRow[]>([]);
  const [query, setQuery] = useState("");
  const [visualCategoryFilter, setVisualCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"all" | AvailabilityStatus>("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<PageSize>(25);
  const [loading, setLoading] = useState(false);
  const [savingProductId, setSavingProductId] = useState<string | null>(null);

  const selectedStore = stores.find((store) => store.id === selectedStoreId) ?? null;

  useEffect(() => {
    if (!ENABLE_ADMIN_STOCK_DASHBOARD) return;
    if (ENABLE_LOCAL_STOCK_MODE) {
      setStores(LOCAL_STORES);
      setSelectedStoreId((current) => current || LOCAL_STORES[0].id);
      return;
    }
    void loadStores();
  }, []);

  useEffect(() => {
    if (!selectedStore) return;
    if (!ENABLE_LOCAL_STOCK_MODE && !adminToken) return;
    void loadProducts(selectedStore);
  }, [selectedStoreId, adminToken]);

  const filteredRows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return rows
      .filter((row) => {
        const matchesQuery =
          !normalizedQuery ||
          [
            row.productName,
            row.visualNote,
            row.visualNoteAlt,
            row.revolutionize,
            row.mainAccords,
            row.olfactoryFamily,
            row.meaning,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase()
            .includes(normalizedQuery);
        const matchesCategory =
          visualCategoryFilter === "all" ||
          normalizeVisualCategory(row.visualNote) === visualCategoryFilter;
        const matchesStatus = statusFilter === "all" || row.availabilityStatus === statusFilter;
        return matchesQuery && matchesCategory && matchesStatus;
      })
      .sort((a, b) => {
        const categoryCompare = normalizeVisualCategory(a.visualNote).localeCompare(
          normalizeVisualCategory(b.visualNote),
        );
        if (categoryCompare !== 0) return categoryCompare;
        return a.productName.localeCompare(b.productName);
      });
  }, [query, rows, statusFilter, visualCategoryFilter]);

  const visualCategories = useMemo(() => {
    return Array.from(
      new Set(rows.map((row) => normalizeVisualCategory(row.visualNote)).filter(Boolean)),
    ).sort((a, b) => a.localeCompare(b));
  }, [rows]);

  useEffect(() => {
    setPage(1);
  }, [query, selectedStoreId, statusFilter, visualCategoryFilter, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const paginatedRows = filteredRows.slice(startIndex, startIndex + pageSize);

  if (!ENABLE_ADMIN_STOCK_DASHBOARD) {
    return (
      <Shell>
        <section className="mx-auto max-w-xl rounded-2xl border border-[#ccc3d4]/60 bg-white p-8 text-center shadow-sm">
          <Shield className="mx-auto mb-4 text-[#7046b7]" size={40} />
          <h1 className="text-2xl font-bold text-[#19191b]">Dashboard stok nonaktif</h1>
          <p className="mt-3 text-sm leading-6 text-[#5b5553]">
            Aktifkan `VITE_ENABLE_ADMIN_STOCK_DASHBOARD=true` di environment lokal untuk mengetes
            dashboard ini.
          </p>
        </section>
      </Shell>
    );
  }

  async function loadStores() {
    const { data, error } = await supabase
      .from("stores")
      .select("id,store_slug,store_name,display_name")
      .eq("is_active", true)
      .order("display_name", { ascending: true });

    if (error) {
      console.error(error);
      toast.error("Gagal memuat store. Pastikan migration store sudah berjalan.");
      return;
    }

    const parsedRows = storeDbRowsSchema.safeParse(data ?? []);
    if (!parsedRows.success) {
      console.error(parsedRows.error);
      toast.error("Format data store tidak valid.");
      return;
    }

    const mapped = parsedRows.data.map((store) => ({
      id: store.id,
      slug: store.store_slug,
      name: store.store_name,
      displayName: store.display_name ?? store.store_name,
    })) satisfies StoreRow[];
    setStores(mapped);
    if (!selectedStoreId && mapped[0]) setSelectedStoreId(mapped[0].id);
  }

  async function loadProducts(store: StoreRow) {
    setLoading(true);
    try {
      if (ENABLE_LOCAL_STOCK_MODE) {
        setRows(await loadLocalProducts(store));
        return;
      }

      const data = await callAdminFunction(
        "admin_store_products",
        { store_id: store.id },
        adminProductsResponseSchema,
      );
      setRows(data.rows);
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Gagal memuat produk");
    } finally {
      setLoading(false);
    }
  }

  async function updateAvailability(row: ProductRow, availabilityStatus: AvailabilityStatus) {
    if (!selectedStore) return;
    setSavingProductId(row.productId);
    try {
      if (ENABLE_LOCAL_STOCK_MODE) {
        const lastUpdatedAt = new Date().toISOString();
        saveLocalAvailability(selectedStore.slug, row.productId, availabilityStatus, lastUpdatedAt);
        setRows((prev) =>
          prev.map((item) =>
            item.productId === row.productId
              ? {
                  ...item,
                  availabilityStatus,
                  lastUpdatedAt,
                }
              : item,
          ),
        );
        toast.success(`${row.productName} diperbarui di mode lokal`);
        return;
      }

      const data = await callAdminFunction(
        "admin_store_availability_upsert",
        {
          store_id: selectedStore.id,
          product_id: row.productId,
          availability_status: availabilityStatus,
          stock_qty: row.stockQty,
        },
        adminUpsertResponseSchema,
      );
      setRows((prev) =>
        prev.map((item) =>
          item.productId === row.productId
            ? {
                ...item,
                availabilityStatus,
                lastUpdatedAt: data.lastUpdatedAt ?? new Date().toISOString(),
              }
            : item,
        ),
      );
      toast.success(`${row.productName} diperbarui`);
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Gagal menyimpan status");
    } finally {
      setSavingProductId(null);
    }
  }

  async function callAdminFunction<T>(
    mode: string,
    body: Record<string, unknown>,
    schema: z.ZodType<T>,
  ): Promise<T> {
    if (!DASHBOARD_ENV) {
      throw new Error("Environment dashboard tidak valid.");
    }

    const url = `${DASHBOARD_ENV.VITE_SUPABASE_URL}/functions/v1/aromatique-chat`;
    const resp = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: DASHBOARD_ENV.VITE_SUPABASE_PUBLISHABLE_KEY,
        Authorization: `Bearer ${DASHBOARD_ENV.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        "x-admin-token": adminToken,
      },
      body: JSON.stringify({ mode, ...body }),
    });

    const data: unknown = await resp.json().catch(() => null);
    if (!resp.ok) {
      const errorData = adminErrorResponseSchema.safeParse(data);
      throw new Error(errorData.success ? errorData.data.error : "Admin request failed");
    }

    const parsed = schema.safeParse(data);
    if (!parsed.success) {
      console.error(parsed.error);
      throw new Error("Format response admin tidak valid.");
    }

    return parsed.data;
  }

  async function loadLocalProducts(store: StoreRow): Promise<ProductRow[]> {
    const { data, error } = await supabase
      .from("products")
      .select(
        "product_id,product_name,visual_note,visual_note_alt,revolutionize,main_accords,olfactory_family,meaning",
      )
      .order("product_name", { ascending: true })
      .limit(1000);

    if (error) throw error;

    const parsedRows = productDbRowsSchema.safeParse(data ?? []);
    if (!parsedRows.success) {
      console.error(parsedRows.error);
      throw new Error("Format data produk tidak valid.");
    }

    const availability = readLocalAvailability();
    const storeAvailability = availability[store.slug] ?? {};

    return parsedRows.data.map((product) => {
      const localRow = storeAvailability[product.product_id];
      return {
        productId: product.product_id,
        productName: product.product_name,
        visualNote: product.visual_note,
        visualNoteAlt: product.visual_note_alt,
        revolutionize: product.revolutionize,
        mainAccords: product.main_accords,
        olfactoryFamily: product.olfactory_family,
        meaning: product.meaning,
        availabilityStatus: localRow?.availabilityStatus ?? "out_of_stock",
        stockQty: null,
        lastUpdatedAt: localRow?.lastUpdatedAt ?? null,
      } satisfies ProductRow;
    });
  }

  function readLocalAvailability(): LocalAvailability {
    try {
      const raw = window.localStorage.getItem(LOCAL_AVAILABILITY_STORAGE_KEY);
      if (!raw) return {};
      const parsedJson: unknown = JSON.parse(raw);
      const parsed = localAvailabilitySchema.safeParse(parsedJson);
      return parsed.success ? parsed.data : {};
    } catch {
      return {};
    }
  }

  function saveLocalAvailability(
    storeSlug: string,
    productId: string,
    availabilityStatus: AvailabilityStatus,
    lastUpdatedAt: string,
  ) {
    const availability = readLocalAvailability();
    availability[storeSlug] = {
      ...(availability[storeSlug] ?? {}),
      [productId]: { availabilityStatus, lastUpdatedAt },
    };
    window.localStorage.setItem(LOCAL_AVAILABILITY_STORAGE_KEY, JSON.stringify(availability));
  }

  function saveToken() {
    setAdminToken(tokenInput);
    try {
      window.sessionStorage.setItem(ADMIN_TOKEN_STORAGE_KEY, tokenInput);
    } catch {
      // Session storage can be unavailable in private contexts.
    }
  }

  return (
    <Shell>
      <header className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#ac82f7]/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-[#7046b7]">
            <Store size={16} /> Admin Stock {ENABLE_LOCAL_STOCK_MODE ? "Local Mode" : ""}
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#19191b]">
            Dashboard Stok Produk
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#5b5553]">
            Data produk dibaca dari katalog bersih. Perubahan di halaman ini hanya menulis status ke
            tabel availability per store.
          </p>
        </div>
        <button
          type="button"
          onClick={() => selectedStore && void loadProducts(selectedStore)}
          disabled={!selectedStore || loading || (!ENABLE_LOCAL_STOCK_MODE && !adminToken)}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-[#ac82f7]/40 bg-white px-4 py-2 text-sm font-bold text-[#7046b7] disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </header>

      {ENABLE_LOCAL_STOCK_MODE ? (
        <section className="mb-5 rounded-2xl border border-[#ac82f7]/30 bg-[#ac82f7]/10 p-4 text-sm font-semibold text-[#7046b7]">
          Mode lokal aktif. Produk dibaca dari katalog bersih, sedangkan perubahan stok disimpan
          hanya di browser ini.
        </section>
      ) : (
        <section className="mb-5 grid gap-3 rounded-2xl border border-[#ccc3d4]/50 bg-white p-4 shadow-sm lg:grid-cols-[1fr_auto]">
          <label className="block">
            <span className="mb-1 block text-xs font-bold uppercase tracking-[0.12em] text-[#5b5553]">
              Admin token
            </span>
            <input
              value={tokenInput}
              onChange={(event) => setTokenInput(event.target.value)}
              type="password"
              className="w-full rounded-xl border border-[#ccc3d4] px-4 py-3 text-sm outline-none focus:border-[#7046b7]"
              placeholder="Masukkan token dashboard lokal"
            />
          </label>
          <button
            type="button"
            onClick={saveToken}
            className="self-end rounded-xl bg-[#7046b7] px-5 py-3 text-sm font-bold text-white"
          >
            Gunakan Token
          </button>
        </section>
      )}

      <section className="mb-5 grid gap-3 rounded-2xl border border-[#ccc3d4]/50 bg-white p-4 shadow-sm lg:grid-cols-[220px_180px_minmax(240px,420px)_160px_140px]">
        <label className="block">
          <span className="mb-1 block text-xs font-bold uppercase tracking-[0.12em] text-[#5b5553]">
            Store
          </span>
          <select
            value={selectedStoreId}
            onChange={(event) => setSelectedStoreId(event.target.value)}
            className="w-full rounded-xl border border-[#ccc3d4] bg-white px-3 py-2.5 text-sm font-semibold text-[#19191b] outline-none focus:border-[#7046b7]"
          >
            {stores.map((store) => (
              <option key={store.id} value={store.id}>
                {store.displayName}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-bold uppercase tracking-[0.12em] text-[#5b5553]">
            Kategori
          </span>
          <select
            value={visualCategoryFilter}
            onChange={(event) => setVisualCategoryFilter(event.target.value)}
            className="w-full rounded-xl border border-[#ccc3d4] bg-white px-3 py-2.5 text-sm font-semibold text-[#19191b] outline-none focus:border-[#7046b7]"
          >
            <option value="all">Semua</option>
            {visualCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-bold uppercase tracking-[0.12em] text-[#5b5553]">
            Cari produk
          </span>
          <div className="flex items-center gap-2 rounded-xl border border-[#ccc3d4] px-3 focus-within:border-[#7046b7]">
            <Search size={17} className="text-[#7046b7]" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="w-full bg-transparent py-2.5 text-sm outline-none"
              placeholder="Cari produk..."
            />
          </div>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-bold uppercase tracking-[0.12em] text-[#5b5553]">
            Status
          </span>
          <select
            value={statusFilter}
            onChange={(event) => {
              const parsed = statusFilterSchema.safeParse(event.target.value);
              if (parsed.success) setStatusFilter(parsed.data);
            }}
            className="w-full rounded-xl border border-[#ccc3d4] bg-white px-3 py-2.5 text-sm font-semibold text-[#19191b] outline-none focus:border-[#7046b7]"
          >
            <option value="all">Semua</option>
            <option value="in_stock">In stock</option>
            <option value="out_of_stock">Out stock</option>
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-bold uppercase tracking-[0.12em] text-[#5b5553]">
            Per halaman
          </span>
          <select
            value={pageSize}
            onChange={(event) => {
              const parsed = pageSizeSelectSchema.safeParse(event.target.value);
              if (parsed.success) setPageSize(parsed.data);
            }}
            className="w-full rounded-xl border border-[#ccc3d4] bg-white px-3 py-2.5 text-sm font-semibold text-[#19191b] outline-none focus:border-[#7046b7]"
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>
                {size} produk
              </option>
            ))}
          </select>
        </label>
      </section>

      <section className="overflow-hidden rounded-2xl border border-[#ccc3d4]/50 bg-white shadow-sm">
        <div className="border-b border-[#ccc3d4]/50 bg-[#fbf9fc] px-4 py-3 text-xs font-semibold text-[#5b5553]">
          Menampilkan {filteredRows.length === 0 ? 0 : startIndex + 1}-
          {Math.min(startIndex + pageSize, filteredRows.length)} dari {filteredRows.length} produk
        </div>
        <div className="overflow-x-auto overflow-y-hidden">
          <div className="min-w-[1660px]">
            <div className="grid grid-cols-[170px_170px_180px_210px_250px_310px_150px_140px] gap-3 border-b border-[#ccc3d4]/50 bg-[#fbf9fc] px-4 py-3 text-xs font-bold uppercase tracking-[0.12em] text-[#5b5553]">
              <span>Latest visual notes</span>
              <span>Last visual notes</span>
              <span>Named before</span>
              <span>Revolutionize</span>
              <span>Main accord</span>
              <span>Meaning</span>
              <span>Status</span>
              <span>Last update</span>
            </div>
            <div>
              {loading ? (
                <div className="p-8 text-center text-sm text-[#5b5553]">Memuat produk...</div>
              ) : filteredRows.length === 0 ? (
                <div className="p-8 text-center text-sm text-[#5b5553]">
                  Tidak ada produk yang cocok.
                </div>
              ) : (
                paginatedRows.map((row) => (
                  <div
                    key={row.productId}
                    className="grid grid-cols-[170px_170px_180px_210px_250px_310px_150px_140px] gap-3 border-b border-[#ccc3d4]/40 px-4 py-3 text-sm last:border-b-0"
                  >
                    <TableCell>{row.visualNote}</TableCell>
                    <TableCell>{row.visualNoteAlt}</TableCell>
                    <TableCell strong>{row.productName}</TableCell>
                    <TableCell>{row.revolutionize}</TableCell>
                    <TableCell>{row.mainAccords}</TableCell>
                    <TableCell>{row.meaning}</TableCell>
                    <StatusToggle
                      value={row.availabilityStatus}
                      loading={savingProductId === row.productId}
                      onChange={(status) => void updateAvailability(row, status)}
                    />
                    <div className="text-xs leading-5 text-[#5b5553]">
                      {row.lastUpdatedAt
                        ? new Date(row.lastUpdatedAt).toLocaleString("id-ID")
                        : "-"}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-3 border-t border-[#ccc3d4]/50 bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs font-semibold text-[#5b5553]">
            Halaman {safePage} dari {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={safePage <= 1}
              className="inline-flex items-center gap-1 rounded-full border border-[#ccc3d4] px-3 py-2 text-xs font-bold text-[#7046b7] disabled:opacity-40"
            >
              <ChevronLeft size={15} /> Sebelumnya
            </button>
            <button
              type="button"
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              disabled={safePage >= totalPages}
              className="inline-flex items-center gap-1 rounded-full border border-[#ccc3d4] px-3 py-2 text-xs font-bold text-[#7046b7] disabled:opacity-40"
            >
              Berikutnya <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </section>
    </Shell>
  );
}

function StatusToggle({
  value,
  loading,
  onChange,
}: {
  value: AvailabilityStatus;
  loading: boolean;
  onChange: (value: AvailabilityStatus) => void;
}) {
  return (
    <div className="inline-grid grid-cols-2 rounded-full border border-[#ccc3d4] bg-[#fbf9fc] p-1 text-[11px] font-bold">
      {(["in_stock", "out_of_stock"] as const).map((status) => {
        const active = value === status;
        return (
          <button
            key={status}
            type="button"
            disabled={loading || active}
            onClick={() => onChange(status)}
            className={`rounded-full px-2 py-1.5 transition-colors disabled:cursor-default ${active ? "bg-[#7046b7] text-white" : "text-[#5b5553] hover:bg-white"}`}
            title={status}
          >
            {loading && active ? (
              <Save size={13} className="mx-auto animate-pulse" />
            ) : (
              statusLabel(status)
            )}
          </button>
        );
      })}
    </div>
  );
}

function statusLabel(status: AvailabilityStatus) {
  return status === "in_stock" ? "In stock" : "Out stock";
}

function normalizeVisualCategory(value: string | null | undefined) {
  const rawCategory = (value ?? "").split("/")[0]?.trim();
  if (!rawCategory) return "";
  return rawCategory
    .toLowerCase()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function TableCell({
  children,
  strong = false,
}: {
  children: string | null | undefined;
  strong?: boolean;
}) {
  return (
    <div
      className={`min-w-0 whitespace-normal break-words text-[13px] leading-[1.45] ${
        strong ? "font-bold text-[#19191b]" : "text-[#5b5553]"
      }`}
      title={children ?? ""}
    >
      {children?.trim() ? children : "-"}
    </div>
  );
}

function Shell({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-[#fbf9fc] px-4 py-6 text-[#19191b] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">{children}</div>
    </main>
  );
}
