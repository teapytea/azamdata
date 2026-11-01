import { useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Banknote,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  CircleAlert,
  FileText,
  LayoutDashboard,
  Megaphone,
  Plus,
  Settings2,
  Star,
  Tags,
  UsersRound,
  WalletCards,
} from 'lucide-react'
import { alviaPortfolio } from './data/mua'

function AdminHeader({ title }: { title: string }) {
  const navigate = useNavigate()
  return <header className="admin-header"><div><button className="icon-button" type="button" aria-label="Kembali" onClick={() => navigate(-1)}><ArrowLeft size={19} /></button><strong>{title}</strong><span className="header-spacer" /></div></header>
}

function AdminNav() {
  const navigate = useNavigate()
  const items = [{ label: 'Dasbor', icon: LayoutDashboard, path: '/admin/verifikasi' }, { label: 'Pesanan', icon: CalendarDays, path: '/admin/pesanan' }, { label: 'Keuangan', icon: WalletCards, path: '/admin/transaksi' }, { label: 'Lainnya', icon: Settings2, path: '/admin/konten' }]
  return <nav className="bottom-nav admin-nav">{items.map(({ label, icon: Icon, path }) => <button className="bottom-nav__item" type="button" key={label} onClick={() => navigate(path)}><Icon size={18} /><span>{label}</span></button>)}</nav>
}

function AdminPage({ title, children }: { title: string; children: ReactNode }) {
  return <div className="dashboard-page admin-page"><AdminHeader title={title} /><main className="dashboard-content admin-content">{children}</main><AdminNav /></div>
}

function AdminRow({ title, subtitle, status, action }: { title: string; subtitle: string; status?: string; action?: () => void }) {
  return <article className="admin-row"><img src={alviaPortfolio[0]} alt="" /><div><h2>{title}</h2><p>{subtitle}</p>{status ? <span className="admin-status">{status}</span> : null}</div>{action ? <button type="button" onClick={action}><ChevronRight size={18} /></button> : null}</article>
}

export function AdminVerification() {
  const [items, setItems] = useState([{ id: 1, name: 'Alya Prameswari MUA', status: 'Menunggu Verifikasi' }, { id: 2, name: 'Nabila Makeup Art', status: 'Menunggu Verifikasi' }])
  const update = (id: number, status: string) => setItems((current) => current.map((item) => item.id === id ? { ...item, status } : item))
  return <AdminPage title="Antrean Verifikasi MUA"><div className="admin-summary"><span>Perlu ditinjau</span><strong>{items.filter((item) => item.status === 'Menunggu Verifikasi').length}</strong><small>dokumen MUA</small></div><div className="admin-stack">{items.map((item) => <article className="admin-verification-card" key={item.id}><AdminRow title={item.name} subtitle="Surabaya · 12 foto portofolio" status={item.status} /><div><button className="secondary-button" type="button" onClick={() => update(item.id, 'Ditolak')}>Tolak</button><button className="booking-cta" type="button" onClick={() => update(item.id, 'Terverifikasi')}>Verifikasi</button></div></article>)}</div></AdminPage>
}

export function AdminUsers() {
  const [role, setRole] = useState('Semua Peran')
  return <AdminPage title="Manajemen Pengguna"><label className="admin-search"><UsersRound size={16} /><input placeholder="Cari pengguna" /></label><div className="admin-filter"><button type="button" onClick={() => setRole(role === 'Semua Peran' ? 'Pelanggan' : 'Semua Peran')}>{role} <ChevronDown size={14} /></button><span>2.384 pengguna</span></div><section className="admin-stack">{['Azam Pratama', 'Nadia Putri', 'Bunga Lestari MUA'].map((name, index) => <AdminRow title={name} subtitle={index === 2 ? 'MUA · Terverifikasi' : 'Pelanggan · Aktif'} status="Aktif" key={name} />)}</section></AdminPage>
}

export function AdminOrders() {
  const [status, setStatus] = useState('Semua Status')
  return <AdminPage title="Monitoring Pesanan"><div className="admin-kpis"><div><span>Hari ini</span><strong>38</strong></div><div><span>Menunggu</span><strong>12</strong></div><div><span>Bermasalah</span><strong>3</strong></div></div><div className="admin-filter"><button type="button" onClick={() => setStatus(status === 'Semua Status' ? 'Menunggu' : 'Semua Status')}>{status} <ChevronDown size={14} /></button><span>Update real time</span></div><section className="admin-stack">{['#RK-20231024 · Nadia Putri', '#RK-20231025 · Salsa Maharani', '#RK-20231026 · Aulia Putri'].map((item, index) => <AdminRow title={item} subtitle="Bunga Lestari MUA · Rp 2.500.000" status={index === 1 ? 'Menunggu DP' : 'Terkonfirmasi'} key={item} />)}</section></AdminPage>
}

export function AdminTransactions() {
  const [payout, setPayout] = useState(false)
  return <AdminPage title="Keuangan & Transaksi"><div className="admin-kpis"><div><span>GMV Bulan Ini</span><strong>Rp 86,4 jt</strong></div><div><span>Komisi</span><strong>Rp 12,9 jt</strong></div><div><span>Payout</span><strong>Rp 48,6 jt</strong></div></div><section className="admin-stack"><AdminRow title="Payout Bunga Lestari MUA" subtitle="Rp 3.450.000 · BCA 0123" status={payout ? 'Diproses' : 'Menunggu Payout'} action={() => setPayout(true)} /><AdminRow title="Pembayaran #RK-20231024" subtitle="Nadia Putri · Rp 2.500.000" status="Lunas" /></section></AdminPage>
}

export function AdminRefunds() {
  const [requests, setRequests] = useState([{ id: 1, status: 'Menunggu Keputusan' }, { id: 2, status: 'Menunggu Keputusan' }])
  const decide = (id: number, status: string) => setRequests((current) => current.map((item) => item.id === id ? { ...item, status } : item))
  return <AdminPage title="Pembatalan & Refund"><section className="admin-stack">{requests.map((item) => <article className="admin-verification-card" key={item.id}><AdminRow title={`Refund #RF-00${item.id}`} subtitle="Booking dibatalkan oleh pelanggan · Rp 1.250.000" status={item.status} /><div><button className="secondary-button" type="button" onClick={() => decide(item.id, 'Ditolak')}>Tolak</button><button className="booking-cta" type="button" onClick={() => decide(item.id, 'Refund Diproses')}>Setujui</button></div></article>)}</section></AdminPage>
}

export function AdminDisputes() {
  const [resolved, setResolved] = useState(false)
  return <AdminPage title="Penyelesaian Sengketa"><section className="dispute-card"><div><CircleAlert size={20} /><span>Sengketa aktif</span></div><h1>#DSP-20231107</h1><p>Nadia Putri melaporkan perbedaan hasil makeup dari brief yang disepakati.</p><div className="dispute-parties"><span>Pelanggan: Nadia Putri</span><span>MUA: Bunga Lestari</span></div></section><section className="dashboard-section"><h2>Catatan Moderator</h2><textarea className="admin-textarea" placeholder="Masukkan keputusan atau catatan penyelesaian..." /></section><button className="primary-button" type="button" onClick={() => setResolved(true)}>{resolved ? 'Sengketa Ditutup' : 'Selesaikan Sengketa'}</button></AdminPage>
}

export function AdminReviews() {
  const [hidden, setHidden] = useState<Set<number>>(() => new Set())
  const reviews = ['Hasilnya bagus sekali dan MUA sangat ramah.', 'Tidak sesuai ekspektasi, ingin pengembalian dana.']
  return <AdminPage title="Moderasi Ulasan"><section className="admin-stack">{reviews.map((review, index) => <article className="moderation-card" key={review}><div><Star size={15} fill="#E66F61" color="#E66F61" /><strong>{index === 0 ? '5.0' : '2.0'}</strong><span>Nadia Putri</span></div><p>{review}</p><button className={hidden.has(index) ? 'secondary-button' : 'booking-cta'} type="button" onClick={() => setHidden((current) => new Set(current).add(index))}>{hidden.has(index) ? 'Disembunyikan' : 'Sembunyikan Ulasan'}</button></article>)}</section></AdminPage>
}

function EditableList({ title, initial }: { title: string; initial: string[] }) {
  const [items, setItems] = useState(initial)
  return <AdminPage title={title}><button className="primary-button" type="button" onClick={() => setItems((current) => [...current, `${title.replace('Manajemen ', '').replace('Pengaturan ', '')} Baru ${current.length + 1}`])}><Plus size={16} /> Tambah</button><section className="admin-stack">{items.map((item) => <div className="admin-list-item" key={item}><Tags size={16} /><span>{item}</span><button type="button" onClick={() => setItems((current) => current.filter((entry) => entry !== item))}>Hapus</button></div>)}</section></AdminPage>
}

export function AdminCategories() { return <EditableList title="Manajemen Kategori" initial={['Wedding', 'Wisuda', 'Lamaran', 'Photoshoot']} /> }
export function AdminRegions() { return <EditableList title="Pengaturan Wilayah" initial={['Surabaya', 'Jakarta', 'Bandung', 'Yogyakarta']} /> }

export function AdminCommission() {
  const [commission, setCommission] = useState(15)
  return <AdminPage title="Komisi Platform"><section className="commission-card"><span>Komisi standar platform</span><strong>{commission}%</strong><input type="range" min="5" max="25" value={commission} onChange={(event) => setCommission(Number(event.target.value))} /><p>Komisi diterapkan pada setiap booking berhasil.</p></section><section className="admin-stack"><div className="admin-list-item"><Banknote size={16} /><span>Wedding Package</span><strong>{commission}%</strong></div><div className="admin-list-item"><Banknote size={16} /><span>Graduation Makeup</span><strong>{commission}%</strong></div></section></AdminPage>
}

export function AdminPromotions() {
  const [active, setActive] = useState(true)
  return <AdminPage title="Promosi & Voucher"><button className="primary-button" type="button"><Plus size={16} /> Buat Voucher</button><article className="voucher-card"><div><Megaphone size={20} /><span>RIASKITA10</span></div><h2>Diskon 10% booking pertama</h2><p>Berlaku hingga 31 Desember 2023</p><button className={active ? 'toggle-on' : 'toggle-off'} type="button" onClick={() => setActive((current) => !current)}><i /></button></article></AdminPage>
}

export function AdminContent() {
  const [published, setPublished] = useState(true)
  const [language, setLanguage] = useState('Bahasa Indonesia')
  return <AdminPage title="Manajemen Konten"><section className="content-editor"><div><FileText size={18} /><span>Banner Beranda</span><button className={published ? 'toggle-on' : 'toggle-off'} type="button" onClick={() => setPublished((current) => !current)}><i /></button></div><label>Judul Banner<input defaultValue="Temukan MUA terbaik untuk momen spesialmu" /></label><label>Bahasa<select value={language} onChange={(event) => setLanguage(event.target.value)}><option>Bahasa Indonesia</option><option>English</option></select></label><button className="primary-button" type="button">Simpan Konten</button></section></AdminPage>
}
