"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import {
  Banknote, Bike, CheckCircle2, ChevronDown, CreditCard, FileText, Hand, History, Inbox, Leaf, Loader2, LogOut, Minus, Plus, Printer, QrCode, Receipt as ReceiptIcon, RefreshCw,
  Scissors, Search, Settings, ShoppingBag, Star, TicketPercent, UserPlus, Utensils, X, XCircle,
} from "lucide-react";
import { logoutTo } from "@/app/auth-actions";
import { ActionButton, Field, FormModal, Modal, toast, useRun } from "@/components/ui";
import { priceOrder, promoDiscount, receiptLines, unitPrice, type Receipt } from "@/lib/calc";
import { fmtDateTime, fmtTime, qty, rp } from "@/lib/format";
import { usePrinter } from "@/lib/printer";
import type { PublicSettings } from "@/lib/settings";
import { checkout, checkPromo, closeRegister, createCustomer, discardHold, findCustomer, getReceipt, holdOrder, openRegister, savePromo, togglePromo, voidSale, type CartLine } from "./actions";

type Product = { id: string; name: string; type: string; origin: string; price: number; price_takeaway: number | null; mode: string; direct_portions: number; serving_ml: number; image: string; sku: string; ready_ml: number; unlabeled_ml: number };
type Customer = { id: string; phone: string; name: string; points: number };
type Line = CartLine & { key: string; name: string; price: number; serving_ml: number };
type Held = { id: string; label: string; data: { lines: Line[]; orderType: string; tableNo: string; customerName: string; note: string; promo?: Promo | null }; created_at: string };
type Sale = { id: string; number: string; at: string; total: number; payment: string; status: string; order_type: string; table_no: string; customer_name: string; cashier: string };

type Promo = { code: string; percent: number };
type PromoRow = Promo & { active: boolean; used: number };

const ORDER_TYPES = [{ id: "Dine-in", icon: Utensils }, { id: "Takeaway", icon: ShoppingBag }, { id: "Kurir", icon: Bike }];
const SUGARS = ["Normal", "Less", "No sugar"];
const ICES = ["Normal ice", "Less ice", "No ice"];
const TOPPINGS = [{ name: "Tanpa topping", code: "" }, { name: "Honey Osmanthus Jelly", code: "jelly" }, { name: "Soybean Curd", code: "curd" }];
const newToken = () => crypto.randomUUID();

export function PosView({ user, products, register, held, history, settings, stock, promos }: {
  user: { id: string; name: string; role: string }; products: Product[]; register: { id: string; opened_at: string; opening_cash: number } | null;
  held: Held[]; history: Sale[]; settings: PublicSettings; stock: Record<string, number>; promos: PromoRow[];
}) {
  const router = useRouter();
  const printer = usePrinter();
  const { busy, run } = useRun();
  const searchRef = useRef<HTMLInputElement>(null);

  const [search, setSearch] = useState("");
  const [type, setType] = useState("Semua");
  const [lines, setLines] = useState<Line[]>([]);
  const [orderType, setOrderType] = useState("Dine-in");
  const [tableNo, setTableNo] = useState("");
  const [courier, setCourier] = useState("ShopeeFood");
  const [customerName, setCustomerName] = useState("");
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [phone, setPhone] = useState("");
  const [redeem, setRedeem] = useState(false);
  const [promo, setPromo] = useState<Promo | null>(null);
  const [promoInput, setPromoInput] = useState("");
  const [refreshing, startRefresh] = useTransition();
  const [note, setNote] = useState("");
  const [payment, setPayment] = useState("QRIS");
  const [tendered, setTendered] = useState(0);
  const [reference, setReference] = useState("");
  const [verified, setVerified] = useState(false);
  const [token, setToken] = useState(newToken);
  const [paid, setPaid] = useState<Receipt | null>(null);
  const [printing, setPrinting] = useState<string[] | null>(null);
  const [online, setOnline] = useState(true);
  const [modal, setModal] = useState<"" | "history" | "held" | "hold" | "open" | "close" | "printer" | "newCustomer" | "split" | "promos" | "promoForm">("");
  const [voiding, setVoiding] = useState<Sale | null>(null);
  const [closed, setClosed] = useState<{ expected: number; closing: number; variance: number } | null>(null);
  const [splitKeys, setSplitKeys] = useState<string[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);

  useEffect(() => {
    const on = () => setOnline(navigator.onLine);
    on();
    window.addEventListener("online", on);
    window.addEventListener("offline", on);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", on); };
  }, []);

  const types = useMemo(() => ["Semua", ...new Set(products.map((p) => p.type))], [products]);
  const visible = products.filter((p) => (type === "Semua" || p.type === type) && `${p.name} ${p.origin} ${p.sku}`.toLowerCase().includes(search.toLowerCase()));
  const toppingPrice = (t: string) => (t === "Tanpa topping" ? 0 : settings.topping_price);
  const productOf = (id: string) => products.find((x) => x.id === id);
  const lineUnit = (l: Line) => { const p = productOf(l.product_id); return p ? unitPrice(p, orderType) : l.price; };
  const subtotal = lines.reduce((s, l) => s + l.qty * (lineUnit(l) + toppingPrice(l.topping)), 0);
  const isCourier = orderType === "Kurir";
  const price = priceOrder(subtotal, settings, { discount: promoDiscount(subtotal, promo?.percent), isMember: !!customer, redeem, points: customer?.points });
  const payMethod = isCourier ? "Marketplace" : payment;
  const hasName = !!customer || !!customerName.trim();
  const canPay = lines.length > 0 && !!register && online && hasName && (
    (orderType !== "Dine-in" || !!tableNo.trim()) &&
    (payMethod === "Marketplace" || (payMethod === "Tunai" ? tendered >= price.total : !!reference.trim() && verified)));

  const missing = !register ? "" : [
    !lines.length && "pilih menu",
    lines.length > 0 && !hasName && "nama pelanggan",
    orderType === "Dine-in" && !tableNo.trim() && "nomor meja",
    payMethod === "Tunai" && tendered < price.total && "uang diterima",
    (payMethod === "QRIS" || payMethod === "EDC") && !(reference.trim() && verified) && "referensi & konfirmasi bayar",
  ].filter(Boolean).join(", ");
  const cupsFor = (p: Product) => (p.mode === "direct" ? p.direct_portions : Math.floor(p.ready_ml / p.serving_ml));
  const inCart = (id: string) => (paid ? [] : lines).filter((l) => l.product_id === id).reduce((s, l) => s + l.qty, 0);

  function add(p: Product) {
    if (inCart(p.id) >= cupsFor(p)) { toast(`Batch siap saji ${p.name} tidak cukup.`, "error"); return; }
    // Pesanan yang sudah lunas tidak boleh digabung: menu berikutnya memulai pesanan baru.
    if (paid) resetOrder();
    setLines((cur) => {
      const fresh: Line = { key: crypto.randomUUID(), product_id: p.id, name: p.name, price: p.price, serving_ml: p.serving_ml, qty: 1, sugar: "Normal", ice: "Normal ice", topping: "Tanpa topping", note: "" };
      const same = cur.find((l) => sameOptions(l, fresh));
      if (same) return cur.map((l) => (l === same ? { ...l, qty: l.qty + 1 } : l));
      return [...cur, fresh];
    });
  }
  /** Mengubah opsi satu cup. Bila jumlahnya lebih dari satu, cup itu terpisah menjadi baris sendiri. */
  function changeOption(key: string, change: Partial<Line>) {
    if (paid) return;
    const index = lines.findIndex((l) => l.key === key);
    if (index < 0) return;
    const line = lines[index];
    const unit: Line = { ...line, ...change, qty: 1, key: line.qty > 1 ? crypto.randomUUID() : line.key };
    if (sameOptions(line, unit)) return;
    const rest = line.qty > 1 ? lines.map((l) => (l.key === key ? { ...l, qty: l.qty - 1 } : l)) : lines.filter((l) => l.key !== key);
    const twin = rest.find((l) => sameOptions(l, unit));
    if (twin) {
      setLines(rest.map((l) => (l === twin ? { ...l, qty: l.qty + 1 } : l)));
      setEditing(twin.key);
      return;
    }
    rest.splice(line.qty > 1 ? index + 1 : index, 0, unit);
    setLines(rest);
    // Panel edit mengikuti cup yang sedang diubah agar opsi lain bisa langsung diatur.
    setEditing(unit.key);
  }
  const patch = (key: string, change: Partial<Line>) => setLines((cur) => cur.map((l) => (l.key === key ? { ...l, ...change } : l)));
  function changeQty(l: Line, delta: number) {
    if (paid) return;
    const p = products.find((x) => x.id === l.product_id)!;
    if (delta > 0 && inCart(p.id) >= cupsFor(p)) { toast(`Batch siap saji ${p.name} tidak cukup.`, "error"); return; }
    if (l.qty + delta <= 0) setLines((cur) => cur.filter((x) => x.key !== l.key));
    else patch(l.key, { qty: l.qty + delta });
  }
  function resetOrder() {
    setLines([]); setEditing(null); setTableNo(""); setCustomerName(""); setCustomer(null); setPhone(""); setRedeem(false); setPromo(null); setPromoInput(""); setNote("");
    setTendered(0); setReference(""); setVerified(false); setToken(newToken()); setPaid(null);
  }

  const previewReceipt: Receipt = {
    store: settings.store_name, address: settings.address, footer: settings.footer, wifi: settings.wifi, taxLabel: settings.tax_label,
    number: "BILL-SEMENTARA", at: new Date().toISOString(), cashier: user.name, order_type: orderType, table_no: orderType === "Dine-in" ? tableNo : "",
    customer: customer?.name || customerName, draft: true,
    promo_code: promo?.code, lines: lines.map((l) => ({ qty: l.qty, name: l.name, sugar: l.sugar, ice: l.ice, topping: l.topping, note: l.note, gross: l.qty * (lineUnit(l) + toppingPrice(l.topping)) })),
    subtotal, discount: price.discount, member_discount: price.memberDiscount, redeem_value: price.redeemValue, service: price.service, tax: price.tax, rounding: price.rounding, total: price.total,
  };

  async function print(r: Receipt) {
    const out = receiptLines(r);
    if (printer.mode === "direct") {
      try { await printer.printLines(out); toast("Data nota dikirim ke printer."); }
      catch (e) { toast(`${(e as Error).message}${r.draft ? "" : " Transaksi sudah tersimpan, jangan ulangi pembayaran."}`, "error"); }
      return;
    }
    setPrinting(out);
    setTimeout(() => window.print(), 120);
  }

  async function pay() {
    if (!register) { setModal("open"); return; }
    if (lines.length && !hasName) toast("Nama pelanggan wajib diisi.", "error");
    if (!canPay || busy) return;
    const receipt = await run(checkout, {
      token, lines: lines.map(({ product_id, qty, sugar, ice, topping, note }) => ({ product_id, qty, sugar, ice, topping, note })), order_type: orderType,
      table_no: tableNo, courier: isCourier ? courier : "", customer_name: customerName, customer_id: customer?.id, promo_code: promo?.code, redeem,
      payment: payMethod, tendered, reference, note, verified,
    });
    if (receipt) {
      setPaid(receipt as Receipt);
      await print(receipt as Receipt);
    }
  }

  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      const typing = (e.target as HTMLElement).matches?.("input,textarea,select");
      if (e.key === "F2" || (e.key === "/" && !typing)) { e.preventDefault(); searchRef.current?.focus(); }
      if (e.key === "F6" && lines.length) { e.preventDefault(); setModal("hold"); }
      if (e.key === "F7") { e.preventDefault(); setModal("history"); }
      if (e.key === "F10") { e.preventDefault(); pay(); }
    };
    window.addEventListener("keydown", on);
    return () => window.removeEventListener("keydown", on);
  });

  function resume(h: Held) {
    setLines(h.data.lines.map((l) => ({ ...l, ice: l.ice || "Normal ice" }))); setPromo(h.data.promo ?? null); setEditing(null); setOrderType(h.data.orderType); setTableNo(h.data.tableNo); setCustomerName(h.data.customerName); setNote(h.data.note);
    setToken(newToken()); setPaid(null); setModal("");
    run(discardHold, { id: h.id });
  }

  async function applyPromo() {
    const found = await run(checkPromo, { code: promoInput }, "Kode promo dipakai.");
    if (found) { setPromo(found as Promo); setPromoInput(""); }
  }

  async function lookup() {
    const c = await run(findCustomer, { phone });
    if (c === undefined) return;
    if (c === null || (c as unknown) === true) { setModal("newCustomer"); return; }
    setCustomer(c as Customer);
  }

  async function splitBill() {
    const moving = lines.filter((l) => splitKeys.includes(l.key));
    if (!moving.length || moving.length === lines.length) { toast("Pilih sebagian item untuk dipisah.", "error"); return; }
    const ok = await run(holdOrder, { label: `Pisahan ${tableNo ? `Meja ${tableNo}` : customerName || "tagihan"}`, data: { lines: moving, orderType, tableNo, customerName, note: "" } }, "Item dipindah ke pesanan ditahan.");
    if (ok !== undefined) { setLines(lines.filter((l) => !splitKeys.includes(l.key))); setSplitKeys([]); setModal(""); }
  }

  const receiptShown = paid || previewReceipt;
  const waText = encodeURIComponent(receiptLines(receiptShown).join("\n"));
  const waPhone = (customer?.phone || "").replace(/^0/, "62");

  return (
    <div className="min-h-screen bg-surface">
      <style>{`@media print { @page { size: 58mm auto; margin: 0; } }`}</style>
      {printing && <pre className="print-only" style={{ fontFamily: "monospace", fontSize: "10px", lineHeight: 1.25, width: "48mm", margin: "0 auto", padding: "2mm 0", color: "#000" }}>{printing.join("\n")}</pre>}

      <div className="no-print flex flex-col gap-3 p-3 max-[559px]:pb-28 min-[560px]:h-dvh min-[560px]:overflow-hidden lg:p-4 xl:h-auto xl:overflow-visible">
        {/* Baris atas: identitas, jenis pesanan, kasir */}
        <header className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 pr-2">
            <span className="flex h-9 w-9 items-center justify-center rounded bg-maroon text-white"><Leaf size={18} /></span>
            <div className="leading-tight"><p className="font-brand text-[16px] font-bold tracking-tight text-maroon">TEAPY</p><p className="mono text-[10px] text-soft">POS KIOSK</p></div>
          </div>
          <div className="flex rounded bg-mid p-1" role="tablist" aria-label="Jenis pesanan">
            {ORDER_TYPES.map((t) => (
              <button key={t.id} role="tab" aria-selected={orderType === t.id} onClick={() => setOrderType(t.id)} className={`flex items-center gap-1.5 rounded px-3 py-1.5 text-[12px] font-medium pointer-coarse:px-4 pointer-coarse:py-2.5 pointer-coarse:text-[13px] ${orderType === t.id ? "bg-maroon text-white" : "text-soft hover:text-maroon"}`}>
                <t.icon size={14} />{t.id === "Dine-in" && orderType === "Dine-in" && tableNo ? `Meja ${tableNo}` : t.id}
              </button>
            ))}
          </div>
          <span className="mono ml-auto hidden items-center gap-1 text-soft xl:flex">Kasir: <b className="text-ink">{user.name}</b></span>
          <span className={`badge ${register ? "badge-moss" : "badge-red"}`}>{register ? `Shift terbuka ${fmtTime(register.opened_at)}` : "Shift belum dibuka"}</span>
          <span className={`badge ${online ? "badge-moss" : "badge-red"}`}>{online ? "Online" : "Offline"}</span>
          <form action={() => logoutTo("/pos/login")}><button className="btn btn-sm btn-flat" onClick={(e) => { if (register) { e.preventDefault(); toast("Tutup shift kasir sebelum logout.", "error"); } }}><LogOut size={13} />Logout</button></form>
        </header>

        {/* Baris alat */}
        <div className="flex flex-wrap items-center gap-2 rounded-lg bg-low p-2 min-[560px]:flex-nowrap xl:flex-wrap">
          <button className="flex shrink-0 items-center gap-2 rounded bg-white px-3 py-1.5 text-left shadow-sm hover:bg-mid" onClick={() => setModal("printer")}>
            <Printer size={15} />
            <span className="leading-tight"><span className="block text-[12px] font-medium">Printer nota 58 mm</span><span className="mono block text-[10px] text-soft">{printer.mode === "direct" ? printer.status : "Dialog cetak browser"}</span></span>
            <span className={`h-2 w-2 rounded-full ${printer.mode === "browser" || printer.connected ? "bg-moss" : "bg-danger"}`} />
          </button>
          <div className="flex min-w-0 flex-nowrap gap-2 overflow-x-auto [scrollbar-width:none] min-[560px]:ml-auto xl:flex-wrap [&>*]:shrink-0">
            <button className="btn btn-sm" onClick={() => setModal("history")}><History size={13} />Riwayat <kbd className="desktop-only mono rounded bg-mid px-1">F7</kbd></button>
            <button className="btn btn-sm" disabled={!lines.length} onClick={() => setModal("hold")}><Hand size={13} />Tahan <kbd className="desktop-only mono rounded bg-mid px-1">F6</kbd></button>
            <button className="btn btn-sm" onClick={() => setModal("held")}><Inbox size={13} />Ditahan ({held.length})</button>
            <button className="btn btn-sm" disabled={lines.length < 2} onClick={() => { setSplitKeys([]); setModal("split"); }}><Scissors size={13} />Pisah tagihan</button>
            <button className="btn btn-sm" onClick={() => setModal("promos")}><TicketPercent size={13} />Kode promo</button>
            <button className={`btn btn-sm order-first xl:order-none ${register ? "" : "btn-primary"}`} onClick={() => setModal(register ? "close" : "open")}>{register ? "Tutup shift" : "Buka shift"}</button>
          </div>
        </div>

        {!register && <p className="rounded bg-danger-soft px-3 py-2 text-[12px] text-[#93000a]">Buka shift kasir dulu untuk menerima pembayaran.</p>}

        <div className="grid grid-cols-1 items-start gap-3 min-[560px]:min-h-0 min-[560px]:flex-1 min-[560px]:grid-cols-[minmax(0,1fr)_minmax(300px,44%)] min-[560px]:items-stretch xl:flex-none xl:grid-cols-[minmax(0,5fr)_minmax(340px,4fr)_minmax(300px,3fr)] xl:items-start">
          {/* Menu */}
          <section className="flex min-w-0 flex-col gap-3 min-[560px]:min-h-0 min-[560px]:overflow-y-auto xl:overflow-visible">
            <div className="flex flex-col gap-3 min-[560px]:sticky min-[560px]:top-0 min-[560px]:z-10 min-[560px]:bg-surface min-[560px]:pb-1 xl:static xl:bg-transparent xl:pb-0">
            <div className="card flex items-center gap-2 p-2">
              <Search size={16} className="ml-2 text-outline" />
              <input ref={searchRef} className="h-9 min-w-0 flex-1 bg-transparent text-[13px] outline-none pointer-coarse:h-11 pointer-coarse:text-[15px]" aria-label="Cari menu" placeholder="Cari menu" value={search} onChange={(e) => setSearch(e.target.value)} />
              <kbd className="desktop-only mono rounded bg-mid px-1.5 py-0.5 text-soft">/ F2</kbd>
              <button aria-label="Muat ulang data ERP" title="Muat ulang data ERP" disabled={refreshing} onClick={() => startRefresh(() => router.refresh())} className="tap rounded p-1.5 hover:bg-mid"><RefreshCw size={15} className={refreshing ? "animate-spin" : ""} /></button>
            </div>
            <div className="flex flex-wrap gap-1">
              {types.map((t) => <button key={t} onClick={() => setType(t)} className={`tab ${type === t ? "tab-on" : "bg-white"}`}>{t}</button>)}
            </div>
            </div>
            <div className="grid grid-cols-2 gap-3 min-[560px]:grid-cols-[repeat(auto-fill,minmax(150px,1fr))] xl:grid-cols-3">
              {visible.map((p) => {
                const cups = cupsFor(p) - inCart(p.id);
                const ready = cups > 0;
                return (
                  <article key={p.id} onClick={() => { if (ready) add(p); }} className={`card flex flex-col gap-2 p-2.5 ${ready ? "cursor-pointer active:scale-[.98]" : "opacity-70"}`}>
                    <div className="relative aspect-[3/2] overflow-hidden rounded bg-mid min-[560px]:aspect-[2/1] xl:aspect-[3/2]">
                      {p.image ? <img src={p.image} alt="" className="h-full w-full object-cover" /> : <span className="flex h-full w-full items-center justify-center text-hair"><Leaf size={36} /></span>}
                      <span className={`badge absolute bottom-1.5 right-1.5 ${ready ? "badge-moss" : "badge-red"}`}>{ready ? `Siap (${cups} ${p.mode === "direct" ? "porsi" : "cup"})` : p.mode === "direct" ? "Stok habis" : p.unlabeled_ml > 0 ? "Belum dilabeli" : "Belum siap saji"}</span>
                    </div>
                    <div><h3 className="line-clamp-2 min-h-[40px] text-[14px] font-medium leading-5">{p.name}</h3><p className="mono truncate text-soft">{p.origin ? `${p.origin} · ` : ""}{p.type}</p></div>
                    <div className="mt-auto flex items-center justify-between">
                      <span className="mono text-[13px] font-medium">{rp(unitPrice(p, orderType))}{p.price_takeaway != null && <small className="block text-[9px] font-normal uppercase text-soft">{orderType === "Dine-in" ? "Dine in" : "Takeaway"}</small>}</span>
                      <button aria-label={`Tambah ${p.name}`} disabled={!ready} onClick={(e) => { e.stopPropagation(); add(p); }} className="flex h-8 w-8 items-center justify-center rounded bg-maroon text-white hover:bg-maroon-dark disabled:opacity-40 pointer-coarse:h-11 pointer-coarse:w-11"><Plus size={16} /></button>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          {/* Tablet: pesanan dan pembayaran digulir bersama, aksi bayar selalu terlihat. Laptop: tiga kolom seperti biasa. */}
          <div className="flex min-w-0 flex-col gap-3 min-[560px]:min-h-0 xl:contents">
          <div className="flex min-w-0 flex-col gap-3 min-[560px]:min-h-0 min-[560px]:flex-1 min-[560px]:overflow-y-auto xl:contents">
          {/* Pesanan */}
          <section className="card flex min-w-0 shrink-0 flex-col">
            <div className="flex flex-col gap-3 p-4">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-[20px] font-semibold tracking-tight">{paid ? paid.number : "Pesanan aktif"}</h2>
                <span className="mono text-soft">{orderType}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {orderType === "Dine-in" && <input className="input col-span-2 xl:col-span-1" inputMode="numeric" aria-label="Nomor meja" placeholder="Nomor meja" value={tableNo} onChange={(e) => setTableNo(e.target.value)} />}
                {isCourier && <select className="input col-span-2 xl:col-span-1" aria-label="Layanan kurir" value={courier} onChange={(e) => setCourier(e.target.value)}><option>ShopeeFood</option><option>GoFood</option><option>GrabFood</option></select>}
                <input className={`input order-first col-span-2 xl:order-none ${orderType === "Takeaway" ? "" : "xl:col-span-1"} ${lines.length && !hasName ? "!border-danger" : ""}`} aria-label="Nama pelanggan" autoCapitalize="words" aria-required="true" placeholder="Nama pelanggan (wajib)" value={customer ? customer.name : customerName} onChange={(e) => setCustomerName(e.target.value)} disabled={!!customer} />
              </div>
              {customer ? (
                <div className="flex items-center gap-3 rounded bg-low p-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-sand text-[12px] font-semibold text-maroon">{customer.name.slice(0, 2).toUpperCase()}</span>
                  <div className="min-w-0 flex-1"><p className="truncate font-medium">{customer.name}</p><p className="mono text-soft">{customer.phone} · {qty(customer.points)} poin</p></div>
                  <button className="link" onClick={() => { setCustomer(null); setRedeem(false); setPhone(""); }}>Lepas</button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input className="input" inputMode="tel" aria-label="Nomor telepon member" placeholder="Nomor HP member" value={phone} onChange={(e) => setPhone(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && phone) lookup(); }} />
                  <button className="btn btn-primary" disabled={!phone} onClick={lookup}>Cek</button>
                  <button className="btn" aria-label="Member baru" title="Member baru" onClick={() => setModal("newCustomer")}><UserPlus size={15} /></button>
                </div>
              )}
            </div>

            <div className="flex flex-1 flex-col gap-2 border-t border-line p-4">
              {!lines.length && <p className="muted py-10 text-center">Pilih menu di sebelah kiri untuk menambah ke keranjang.</p>}
              {lines.map((l) => {
                const gross = l.qty * (lineUnit(l) + toppingPrice(l.topping));
                return (
                  <div key={l.key} className="rounded bg-low p-2.5">
                    <div className="flex flex-wrap items-center gap-2 xl:flex-nowrap xl:items-start">
                      <div className="flex items-center rounded bg-white">
                        <button aria-label={`Kurangi ${l.name}`} className="tap p-1.5" onClick={() => changeQty(l, -1)}><Minus size={13} /></button>
                        <span className="mono w-6 text-center text-[13px]">{l.qty}</span>
                        <button aria-label={`Tambah ${l.name}`} className="tap p-1.5" onClick={() => changeQty(l, 1)}><Plus size={13} /></button>
                      </div>
                      <div className="order-first w-full min-w-0 xl:order-none xl:w-auto xl:flex-1"><p className="line-clamp-2 text-[14px] font-medium leading-5">{l.name}</p><p className="mono truncate text-soft">{productOf(l.product_id)?.type}</p></div>
                      <span className="mono ml-auto text-[13px] xl:ml-0">{rp(gross)}</span>
                      <button aria-label={`Hapus ${l.name}`} className="tap text-soft hover:text-danger" onClick={() => setLines(lines.filter((x) => x.key !== l.key))}><X size={15} /></button>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-1">
                      {[sugarLabel(l.sugar), l.ice || "Normal ice", l.topping].map((o) => <span key={o} className="rounded bg-high px-2 py-1 text-[12px] text-soft">{o}</span>)}
                      {!paid && <button aria-expanded={editing === l.key} aria-label={`Edit ${l.name}`} onClick={() => setEditing(editing === l.key ? null : l.key)} className="chip-touch flex items-center gap-1 rounded bg-sand px-2 py-1 text-[12px] font-medium text-maroon">Edit<ChevronDown size={13} className={editing === l.key ? "rotate-180" : ""} /></button>}
                    </div>
                    {editing === l.key && !paid && (
                      <div className="mt-2 flex flex-col gap-2 rounded bg-white p-2.5">
                        {l.qty > 1 && <p className="mono text-soft">Perubahan berlaku untuk 1 cup dan menjadi baris terpisah.</p>}
                        <OptionRow label="Gula" options={SUGARS.map((s) => ({ value: s, label: sugarLabel(s) }))} value={l.sugar} onPick={(v) => changeOption(l.key, { sugar: v })} />
                        <OptionRow label="Es" options={ICES.map((i) => ({ value: i, label: i }))} value={l.ice || "Normal ice"} onPick={(v) => changeOption(l.key, { ice: v })} />
                        <OptionRow label="Topping" value={l.topping} onPick={(v) => changeOption(l.key, { topping: v })}
                          options={TOPPINGS.map((t) => ({ value: t.name, label: t.code ? `${t.name} +${settings.topping_price / 1000}K` : t.name, disabled: !!t.code && (stock[t.code] ?? 0) < settings.topping_qty }))} />
                      </div>
                    )}
                  </div>
                );
              })}
              <label className="mt-1 flex flex-col gap-1"><span className="mono uppercase tracking-wider text-soft">Catatan pesanan</span><textarea className="input" rows={2} maxLength={300} placeholder="Contoh: bungkus terpisah" value={note} onChange={(e) => setNote(e.target.value)} /></label>
              {customer && (
                <label className="flex items-center justify-between gap-2 rounded bg-mid p-2.5">
                  <span className="flex items-center gap-2"><Star size={16} className="text-maroon" /><span><b className="block font-medium">Tukar {settings.redeem_points} poin</b><span className="mono text-soft">Potongan {rp(settings.redeem_value)}</span></span></span>
                  <input type="checkbox" aria-label="Tukar poin" disabled={customer.points < settings.redeem_points} checked={redeem} onChange={(e) => setRedeem(e.target.checked)} />
                </label>
              )}
            </div>

            <dl className="flex flex-col gap-1.5 border-t border-line bg-low p-4">
              <Row label={`Subtotal (${lines.reduce((s, l) => s + l.qty, 0)} item)`} value={rp(subtotal)} />
              <div className="flex items-center justify-between gap-2">
                <dt className="muted">Kode promo</dt>
                {promo ? <button className="link" onClick={() => setPromo(null)}>Hapus {promo.code}</button> : (
                  <form className="flex gap-1" onSubmit={(e) => { e.preventDefault(); if (promoInput.trim()) applyPromo(); }}>
                    <input className="input input-compact w-28 uppercase" autoCapitalize="characters" aria-label="Kode promo" placeholder="PROMO10%" value={promoInput} onChange={(e) => setPromoInput(e.target.value)} />
                    <button className="btn btn-sm btn-flat" disabled={!promoInput.trim() || busy}>Pakai</button>
                  </form>
                )}
              </div>
              {price.discount > 0 && <Row label={`Diskon ${promo?.code} (${promo?.percent}%)`} value={`-${rp(price.discount)}`} />}
              {price.memberDiscount > 0 && <Row label={`Diskon member (${settings.member_discount_pct}%)`} value={`-${rp(price.memberDiscount)}`} />}
              {price.redeemValue > 0 && <Row label="Tukar poin" value={`-${rp(price.redeemValue)}`} />}
              {price.service > 0 && <Row label={`Service (${settings.service_pct}%)`} value={rp(price.service)} />}
              {price.tax > 0 && <Row label={`${settings.tax_label} (${settings.tax_pct}%)`} value={rp(price.tax)} />}
              {price.rounding !== 0 && <Row label="Pembulatan" value={rp(price.rounding)} />}
              <div className="mt-2 flex items-end justify-between border-t border-high pt-3">
                <dt className="font-semibold">TOTAL TAGIHAN</dt>
                <dd className="text-[28px] font-semibold leading-none tracking-tight text-maroon">{rp(price.total)}</dd>
              </div>
            </dl>
          </section>

          {/* Pembayaran dan struk */}
          <section className="flex min-w-0 shrink-0 flex-col gap-3">
            {!paid && (
              <div className="card p-3">
                <p className="mono mb-2 uppercase tracking-wider text-soft">Metode pembayaran</p>
                {isCourier ? <p className="rounded bg-low p-3">Dibayar lewat <b>{courier}</b>. Potongan kanal {settings.courier_fee_pct}% dicatat otomatis.</p> : (
                  <>
                    <div className="grid grid-cols-3 gap-2">
                      {[{ id: "QRIS", icon: QrCode }, { id: "EDC", icon: CreditCard }, { id: "Tunai", icon: Banknote }].map((m) => (
                        <button key={m.id} aria-pressed={payment === m.id} onClick={() => { setPayment(m.id); setVerified(false); }} className={`flex flex-col items-center gap-1 rounded p-2.5 text-[12px] font-medium ${payment === m.id ? "bg-maroon text-white" : "bg-low hover:bg-mid"}`}><m.icon size={18} />{m.id}</button>
                      ))}
                    </div>
                    {payment === "Tunai" ? (
                      <div className="mt-2 flex flex-col gap-2">
                        <div className="grid grid-cols-4 gap-1">
                          <button className="btn btn-sm btn-flat" onClick={() => setTendered(price.total)}>Pas</button>
                          {[50000, 100000, 200000].map((n) => <button key={n} className="btn btn-sm btn-flat" onClick={() => setTendered(n)}>{n / 1000}K</button>)}
                        </div>
                        <input className="input" type="number" inputMode="numeric" min="0" aria-label="Uang diterima" placeholder="Uang diterima (Rp)" value={tendered || ""} onChange={(e) => setTendered(Number(e.target.value))} />
                        <p className="mono flex justify-between"><span>Kembalian</span><span>{rp(Math.max(0, tendered - price.total))}</span></p>
                      </div>
                    ) : (
                      <div className="mt-2 flex flex-col gap-2">
                        <input className="input" aria-label="Referensi pembayaran" placeholder={payment === "QRIS" ? "Nomor transaksi QRIS" : "Referensi dari EDC"} value={reference} onChange={(e) => setReference(e.target.value)} />
                        <label className="flex items-center gap-2 text-[12px] pointer-coarse:min-h-11 pointer-coarse:text-[13px]"><input type="checkbox" checked={verified} onChange={(e) => setVerified(e.target.checked)} />Saya sudah memverifikasi pembayaran diterima.</label>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            <div className="card overflow-hidden">
              <button type="button" aria-expanded={showReceipt || !!paid} onClick={() => setShowReceipt(!showReceipt)} className="flex w-full items-center justify-between bg-low px-3 py-2 pointer-coarse:min-h-11 xl:pointer-events-none">
                <span className="mono flex items-center gap-1.5 uppercase"><ReceiptIcon size={13} />Struk thermal 58 mm</span>
                <span className="flex items-center gap-1">{paid && <span className="badge badge-moss"><CheckCircle2 size={11} />Lunas</span>}<ChevronDown size={14} className={`xl:hidden ${showReceipt || paid ? "rotate-180" : ""}`} /></span>
              </button>
              <pre className={`mx-auto max-h-[380px] w-fit overflow-auto bg-white p-3 font-mono text-[11px] leading-[15px] xl:block ${showReceipt || paid ? "" : "hidden"}`}>{receiptLines(receiptShown).join("\n")}</pre>
            </div>

            {paid ? (
              <div className="hidden flex-col gap-2 xl:flex">
                <button className="btn btn-primary h-11 text-[14px]" onClick={resetOrder}>Mulai pesanan baru</button>
                <div className="grid grid-cols-2 gap-2">
                  <button className="btn" onClick={() => print(paid)}><Printer size={14} />Cetak ulang</button>
                  <a className="btn" target="_blank" rel="noreferrer" href={`https://wa.me/${waPhone}?text=${waText}`}><FileText size={14} />WA / E-struk</a>
                </div>
              </div>
            ) : (
              <div className="hidden flex-col gap-2 xl:flex">
                <button className="btn btn-primary h-11 text-[14px]" disabled={(!canPay && !!register) || busy} onClick={pay}>
                  {busy ? <Loader2 size={16} className="animate-spin" /> : <Printer size={16} />}
                  {register ? "Bayar & Cetak Struk" : "Buka shift untuk checkout"} <kbd className="mono rounded bg-white/20 px-1">F10</kbd>
                </button>
                <button className="btn" disabled={!lines.length} onClick={() => print(previewReceipt)}><FileText size={14} />Bill sementara</button>
              </div>
            )}
          </section>
          </div>

          {/* Aksi bayar tablet dan ponsel */}
          <div className="card sticky bottom-0 z-20 flex shrink-0 flex-col gap-1 border border-high p-2 shadow-lg max-[559px]:fixed max-[559px]:inset-x-2 max-[559px]:bottom-2 xl:hidden">
            {paid ? (
              <div className="flex items-center gap-2">
                <button className="btn btn-primary min-w-0 flex-1 !min-h-12 text-[14px]" onClick={resetOrder}>Pesanan baru</button>
                <button className="btn !min-h-12" onClick={() => print(paid)}><Printer size={15} />Cetak ulang</button>
                <a className="btn !min-h-12" target="_blank" rel="noreferrer" href={`https://wa.me/${waPhone}?text=${waText}`} aria-label="Kirim e-struk lewat WhatsApp"><FileText size={15} />WA</a>
              </div>
            ) : (
              <>
                {missing && <p className="truncate text-[11px] text-soft">Lengkapi: {missing}</p>}
                <div className="flex items-center gap-2">
                  <div className="shrink-0 leading-tight"><p className="micro">Total</p><p className="text-[18px] font-semibold tracking-tight text-maroon">{rp(price.total)}</p></div>
                  <button className="btn !min-h-12 shrink-0" aria-label="Bill sementara" title="Bill sementara" disabled={!lines.length} onClick={() => print(previewReceipt)}><FileText size={15} /></button>
                  <button className="btn btn-primary min-w-0 flex-1 !min-h-12 !whitespace-normal text-[14px]" disabled={(!canPay && !!register) || busy} onClick={pay}>
                    {busy ? <Loader2 size={16} className="animate-spin" /> : <Printer size={16} />}
                    {register ? "Bayar & Cetak" : "Buka shift"}
                  </button>
                </div>
              </>
            )}
          </div>
          </div>
        </div>

        <footer className="mono flex flex-wrap justify-between gap-2 pt-2 text-soft min-[560px]:hidden xl:flex">
          <span><b className="font-brand text-[13px] text-ink">teapy</b> · Operating System Atelier Ledger</span>
          <span>{online ? "Stok diperiksa saat checkout" : "Offline: pembayaran membutuhkan koneksi"}</span>
        </footer>
      </div>

      {modal === "open" && (
        <FormModal title="Buka shift kasir" action={openRegister} success="Shift kasir dibuka." submit="Buka shift" onClose={() => setModal("")}>
          <Field label="Kas awal di laci (Rp)"><input className="input" name="opening_cash" type="number" min="0" required autoFocus /></Field>
        </FormModal>
      )}
      {modal === "close" && (
        <FormModal title="Tutup shift & hitung kas" description={`Kas awal ${rp(register?.opening_cash ?? 0)}. Selisih dihitung otomatis.`} action={closeRegister} submit="Tutup shift" onClose={() => setModal("")} onDone={(d) => setClosed(d)}>
          <Field label="Kas akhir hasil hitung (Rp)"><input className="input" name="closing_cash" type="number" min="0" required autoFocus /></Field>
          <Field label="Catatan"><input className="input" name="note" /></Field>
        </FormModal>
      )}
      {closed && (
        <Modal title="Laporan kas tersimpan" onClose={() => setClosed(null)}>
          <dl className="flex flex-col gap-1.5"><Row label="Kas seharusnya" value={rp(closed.expected)} /><Row label="Kas dihitung" value={rp(closed.closing)} /><Row label="Selisih" value={rp(closed.variance)} /></dl>
          <button className="btn btn-primary mt-4 w-full" onClick={() => setClosed(null)}>Selesai</button>
        </Modal>
      )}
      {modal === "hold" && (
        <FormModal title="Tahan pesanan" action={holdOrder as never} success="Pesanan ditahan." submit="Tahan" extra={{ data: { lines, orderType, tableNo, customerName, note, promo } }} onClose={() => setModal("")} onDone={resetOrder}>
          <Field label="Nama pesanan"><input className="input" name="label" required autoFocus defaultValue={tableNo ? `Meja ${tableNo}` : customerName} /></Field>
        </FormModal>
      )}
      {modal === "held" && (
        <Modal title="Pesanan ditahan" onClose={() => setModal("")}>
          {held.length ? <ul className="flex flex-col gap-2">{held.map((h) => (
            <li key={h.id} className="flex items-center justify-between gap-2 rounded bg-low p-2.5">
              <span><b className="block font-medium">{h.label}</b><span className="mono text-soft">{h.data.lines.reduce((s, l) => s + l.qty, 0)} item · {fmtTime(h.created_at)}</span></span>
              <span className="flex gap-1"><button className="btn btn-sm btn-primary" disabled={lines.length > 0} onClick={() => resume(h)}>Lanjutkan</button><button className="btn btn-sm btn-flat" onClick={() => run(discardHold, { id: h.id })}>Hapus</button></span>
            </li>
          ))}</ul> : <p className="muted py-6 text-center">Tidak ada pesanan ditahan.</p>}
          {lines.length > 0 && held.length > 0 && <p className="mono mt-2 text-soft">Selesaikan atau tahan pesanan aktif sebelum melanjutkan.</p>}
        </Modal>
      )}
      {modal === "split" && (
        <Modal title="Pisah tagihan" description="Item yang dipilih pindah ke pesanan ditahan untuk dibayar terpisah." onClose={() => setModal("")}>
          <ul className="flex flex-col gap-1">{lines.map((l) => (
            <li key={l.key}><label className="flex items-center gap-2 rounded bg-low p-2.5"><input type="checkbox" checked={splitKeys.includes(l.key)} onChange={(e) => setSplitKeys(e.target.checked ? [...splitKeys, l.key] : splitKeys.filter((k) => k !== l.key))} />{l.qty}x {l.name}</label></li>
          ))}</ul>
          <button className="btn btn-primary mt-3 w-full" onClick={splitBill}>Pisahkan</button>
        </Modal>
      )}
      {modal === "newCustomer" && (
        <FormModal title="Member baru" action={createCustomer} success="Member dibuat." onClose={() => setModal("")} onDone={(c) => setCustomer(c)}>
          <Field label="Nomor HP"><input className="input" name="phone" inputMode="tel" required defaultValue={phone} /></Field>
          <Field label="Nama"><input className="input" name="name" required autoFocus /></Field>
        </FormModal>
      )}
      {modal === "promos" && (
        <Modal title="Kode promo" description="Kode yang aktif bisa dipakai kasir pada kolom kode promo." onClose={() => setModal("")}>
          {promos.length ? <ul className="flex flex-col gap-2">{promos.map((p) => (
            <li key={p.code} className={`flex items-center justify-between gap-2 rounded bg-low p-2.5 ${p.active ? "" : "opacity-60"}`}>
              <span><b className="mono block text-[13px]">{p.code}</b><span className="muted text-[12px]">Diskon {p.percent}% · dipakai {p.used} kali</span></span>
              {["owner", "admin"].includes(user.role) ? <ActionButton className="btn btn-sm btn-flat" action={togglePromo} input={{ code: p.code, active: !p.active }}>{p.active ? "Nonaktifkan" : "Aktifkan"}</ActionButton> : <span className={`badge ${p.active ? "badge-moss" : ""}`}>{p.active ? "Aktif" : "Nonaktif"}</span>}
            </li>
          ))}</ul> : <p className="muted py-6 text-center">Belum ada kode promo.</p>}
          {["owner", "admin"].includes(user.role) ? <button className="btn btn-primary mt-3 w-full" onClick={() => setModal("promoForm")}><Plus size={14} />Tambah kode promo</button> : <p className="mono mt-3 text-soft">Kode promo diatur oleh admin.</p>}
        </Modal>
      )}
      {modal === "promoForm" && (
        <FormModal title="Tambah kode promo" description="Memakai kode yang sudah ada akan mengganti diskonnya." action={savePromo} success="Kode promo disimpan." onClose={() => setModal("promos")}>
          <Field label="Kode"><input className="input uppercase" name="code" required minLength={3} maxLength={30} placeholder="PROMO10%" autoFocus /></Field>
          <Field label="Diskon (%)"><input className="input" name="percent" type="number" min="0.01" max="100" step="any" required /></Field>
        </FormModal>
      )}
      {modal === "printer" && (
        <Modal title="Pengaturan printer" description="Setiap perangkat kasir menyimpan printernya sendiri. Kedua printer memakai format 58 mm." onClose={() => setModal("")}>
          <Field label="Cara cetak nota">
            <select className="input" value={printer.mode} onChange={(e) => printer.setMode(e.target.value as "direct" | "browser")}>
              <option value="browser">Dialog cetak browser</option>
              <option value="direct" disabled={!printer.supported}>Bluetooth langsung (Chrome){printer.supported ? "" : " - tidak didukung"}</option>
            </select>
          </Field>
          {!printer.supported && <p className="mt-2 rounded bg-danger-soft px-3 py-2 text-[12px] text-[#93000a]">Browser ini belum mendukung printer langsung. Buka POS di aplikasi Google Chrome versi terbaru, bukan browser bawaan tablet.</p>}
          {printer.mode === "direct" && (
            <div className="mt-3 flex flex-col gap-2">
              <p className="mono">{printer.status}</p>
              {printer.connected ? <button className="btn" onClick={printer.disconnect}>Putuskan printer</button> : <button className="btn btn-primary" onClick={printer.connect}>Hubungkan printer</button>}
            </div>
          )}
          <button className="btn mt-3 w-full" onClick={() => print({ ...previewReceipt, lines: [], subtotal: 0, discount: 0, member_discount: 0, redeem_value: 0, service: 0, tax: 0, rounding: 0, total: 0, number: "TES-CETAK", customer: "" })}><Settings size={14} />Tes cetak</button>
        </Modal>
      )}
      {modal === "history" && (
        <Modal wide title="Riwayat transaksi kasir" description="Tiga hari terakhir." onClose={() => setModal("")}>
          {history.length ? <div className="overflow-x-auto"><table className="tbl"><thead><tr><th>No. struk</th><th>Waktu</th><th>Kasir</th><th className="num">Total</th><th>Status</th><th className="num">Aksi</th></tr></thead><tbody>
            {history.map((s) => (
              <tr key={s.id}>
                <td className="mono">{s.number}<div className="text-soft">{s.order_type}{s.table_no ? ` · Meja ${s.table_no}` : ""}</div></td>
                <td className="mono">{fmtDateTime(s.at)}</td><td>{s.cashier}</td>
                <td className="num">{rp(s.total)}<div className="text-soft">{s.payment}</div></td>
                <td><span className={`badge ${s.status === "Selesai" ? "badge-moss" : "badge-red"}`}>{s.status}</span></td>
                <td className="num"><div className="flex justify-end gap-1">
                  <button className="btn btn-sm btn-flat" onClick={async () => { const r = await run(getReceipt, { id: s.id }); if (r) print(r as Receipt); }}>Cetak</button>
                  {s.status === "Selesai" && <button className="btn btn-sm btn-danger" onClick={() => setVoiding(s)}><XCircle size={12} />Void</button>}
                </div></td>
              </tr>
            ))}
          </tbody></table></div> : <p className="muted py-6 text-center">Belum ada transaksi.</p>}
        </Modal>
      )}
      {voiding && (
        <FormModal danger title={`Batalkan ${voiding.number}`} description={`${rp(voiding.total)}. Stok batch dan bahan dikembalikan.`} action={voidSale} extra={{ id: voiding.id }} success="Transaksi dibatalkan." submit="Batalkan transaksi" onClose={() => setVoiding(null)} onDone={() => router.refresh()}>
          <Field label="Alasan"><input className="input" name="reason" required autoFocus /></Field>
          {!["owner", "admin"].includes(user.role) && <Field label="PIN supervisor"><input className="input" name="pin" type="password" inputMode="numeric" required /></Field>}
        </FormModal>
      )}
    </div>
  );
}

const sugarLabel = (s: string) => (s === "No sugar" ? s : `${s} sugar`);

function OptionRow({ label, options, value, onPick }: { label: string; options: { value: string; label: string; disabled?: boolean }[]; value: string; onPick: (v: string) => void }) {
  return (
    <div className="flex flex-wrap items-center gap-1">
      <span className="mono w-14 shrink-0 uppercase text-soft">{label}</span>
      {options.map((o) => (
        <button key={o.value} disabled={o.disabled} aria-pressed={o.value === value} onClick={() => onPick(o.value)} className={`chip-touch rounded px-2 py-1 text-[12px] font-medium disabled:opacity-40 ${o.value === value ? "bg-maroon text-white" : "bg-mid text-soft hover:text-maroon"}`}>{o.label}</button>
      ))}
    </div>
  );
}

const sameOptions = (a: Line, b: Line) => a.product_id === b.product_id && a.sugar === b.sugar && (a.ice || "Normal ice") === (b.ice || "Normal ice") && a.topping === b.topping && (a.note || "") === (b.note || "");

function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between gap-2"><dt className="muted">{label}</dt><dd className="mono text-[13px]">{value}</dd></div>;
}
