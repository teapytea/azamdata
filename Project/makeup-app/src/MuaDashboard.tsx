import { useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Banknote,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronRight,
  Eye,
  ImagePlus,
  MapPin,
  MessageCircle,
  Package,
  Plus,
  Send,
  Store,
  TrendingUp,
  UserRoundCheck,
  WalletCards,
} from 'lucide-react'
import { alviaPortfolio } from './data/mua'

function MuaHeader({ title }: { title: string }) {
  const navigate = useNavigate()
  return <header className="dashboard-header"><div><button className="icon-button" type="button" aria-label="Kembali" onClick={() => navigate(-1)}><ArrowLeft size={19} /></button><strong>{title}</strong><span className="header-spacer" /></div></header>
}

function MuaNav() {
  const navigate = useNavigate()
  const routes = [{ label: 'Dasbor', icon: Store, path: '/mua/dashboard' }, { label: 'Pesanan', icon: CalendarDays, path: '/mua/permintaan' }, { label: 'Pesan', icon: MessageCircle, path: '/mua/pesan' }, { label: 'Profil', icon: UserRoundCheck, path: '/mua/verifikasi' }]
  return <nav className="bottom-nav mua-nav">{routes.map(({ label, icon: Icon, path }) => <button className="bottom-nav__item" type="button" key={label} onClick={() => navigate(path)}><Icon size={18} /><span>{label}</span></button>)}</nav>
}

function MuaPage({ title, children }: { title: string; children: ReactNode }) {
  return <div className="dashboard-page mua-page"><MuaHeader title={title} /><main className="dashboard-content mua-content">{children}</main><MuaNav /></div>
}

const request = { customer: 'Nadia Putri', packageName: 'Modern Wedding Glam', date: '24 Nov 2023', time: '05:00 WIB', location: 'Grand Ballroom, Jakarta' }

function OrderRow({ status = 'Baru', action }: { status?: string; action?: () => void }) {
  return <article className="mua-order-row"><img src={alviaPortfolio[0]} alt="Nadia Putri" /><div><span className={status === 'Baru' ? 'mua-status' : 'status-tag'}>{status}</span><h2>{request.customer}</h2><p>{request.packageName}</p><small><CalendarDays size={12} /> {request.date} · {request.time}</small></div>{action ? <button type="button" onClick={action}><ChevronRight size={18} /></button> : null}</article>
}

export function MuaOnboarding() {
  const [step, setStep] = useState(1)
  const navigate = useNavigate()
  const labels = ['Profil Bisnis', 'Portofolio', 'Layanan', 'Verifikasi']
  return <MuaPage title="Bergabung sebagai MUA"><div className="mua-onboarding"><div className="mua-progress"><span>Langkah {step} dari 4</span><div>{labels.map((label, index) => <i className={index < step ? 'done' : ''} key={label} />)}</div></div><section><h1>{labels[step - 1]}</h1><p>Lengkapi informasi agar pelanggan dapat menemukan dan mempercayai layanan Anda.</p>{step === 1 ? <><label className="dashboard-field"><span>Nama Bisnis</span><input defaultValue="Alya Prameswari MUA" /></label><label className="dashboard-field"><span>Kota Domisili</span><input defaultValue="Surabaya" /></label></> : step === 2 ? <button className="mua-upload" type="button"><ImagePlus size={24} /> Tambah foto portofolio</button> : step === 3 ? <label className="dashboard-field"><span>Layanan Utama</span><input defaultValue="Wedding, Wisuda, Lamaran" /></label> : <div className="mua-notice"><UserRoundCheck size={20} /><span>Unggah KTP dan bukti pengalaman untuk verifikasi bisnis.</span></div>}</section><button className="primary-button" type="button" onClick={() => step === 4 ? navigate('/mua/dashboard') : setStep((current) => current + 1)}>{step === 4 ? 'Selesai & Buka Dasbor' : 'Lanjut'}</button></div></MuaPage>
}

export function MuaOverview() {
  const navigate = useNavigate()
  return <MuaPage title="Dasbor MUA"><section className="mua-hero"><div><p>Selamat datang kembali,</p><h1>Alya Prameswari</h1><span>Profil terverifikasi</span></div><img src={alviaPortfolio[0]} alt="Alya Prameswari" /></section><section className="mua-kpis"><div><span>Booking baru</span><strong>4</strong></div><div><span>Jadwal minggu ini</span><strong>7</strong></div><div><span>Rating</span><strong>4.9</strong></div></section><section className="dashboard-section"><div className="dashboard-title-row"><h2>Permintaan Booking</h2><button type="button" onClick={() => navigate('/mua/permintaan')}>Lihat Semua</button></div><OrderRow action={() => navigate('/mua/permintaan')} /></section><section className="mua-shortcuts">{[[CalendarDays, 'Kalender', '/mua/kalender'], [Package, 'Paket', '/mua/paket'], [WalletCards, 'Pendapatan', '/mua/pendapatan'], [TrendingUp, 'Performa', '/mua/performa']].map(([Icon, label, route]) => { const ShortcutIcon = Icon as typeof CalendarDays; return <button type="button" key={label as string} onClick={() => navigate(route as string)}><ShortcutIcon size={18} /><span>{label as string}</span></button> })}</section></MuaPage>
}

export function MuaRequests() {
  const [requests, setRequests] = useState([{ id: 'RK-1024', status: 'Baru' }, { id: 'RK-1025', status: 'Menunggu Respon' }])
  const respond = (id: string) => setRequests((current) => current.map((item) => item.id === id ? { ...item, status: 'Diterima' } : item))
  return <MuaPage title="Permintaan Booking"><div className="mua-filter"><button type="button">Semua <ChevronDown size={15} /></button><span>{requests.length} permintaan aktif</span></div><div className="mua-stack">{requests.map((item) => <article className="mua-request-card" key={item.id}><OrderRow status={item.status} /><div><button className="secondary-button" type="button">Tolak</button><button className="booking-cta" type="button" onClick={() => respond(item.id)}>{item.status === 'Diterima' ? 'Diterima' : 'Terima'}</button></div></article>)}</div></MuaPage>
}

export function MuaCalendar() {
  const [selectedDay, setSelectedDay] = useState(24)
  const days = Array.from({ length: 30 }, (_, index) => index + 1)
  return <MuaPage title="Kalender Booking"><div className="calendar-month"><button type="button">November 2023 <ChevronDown size={15} /></button><div className="calendar-grid">{['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((day) => <strong key={day}>{day}</strong>)}{days.map((day) => <button className={selectedDay === day ? 'calendar-selected' : [8, 16, 24].includes(day) ? 'calendar-booked' : ''} type="button" key={day} onClick={() => setSelectedDay(day)}>{day}</button>)}</div></div><section className="dashboard-section"><h2>Jadwal {selectedDay} November</h2><OrderRow status="Terkonfirmasi" /></section></MuaPage>
}

export function MuaAppointments() {
  const navigate = useNavigate()
  return <MuaPage title="Janji Temu Mendatang"><section className="appointment-banner"><CalendarDays size={22} /><div><strong>Hari ini, 24 Nov 2023</strong><span>1 jadwal makeup perlu disiapkan</span></div></section><div className="mua-stack"><OrderRow status="Hari ini" action={() => navigate('/mua/brief-pelanggan')} /><OrderRow status="Besok" action={() => navigate('/mua/brief-pelanggan')} /></div></MuaPage>
}

export function MuaPackages() {
  const [packages, setPackages] = useState([{ name: 'Modern Wedding Glam', price: 'Rp 1.450.000', active: true }, { name: 'Graduation Look', price: 'Rp 450.000', active: true }])
  const addPackage = () => setPackages((current) => [...current, { name: `Paket Baru ${current.length + 1}`, price: 'Rp 0', active: false }])
  return <MuaPage title="Manajemen Paket"><button className="primary-button" type="button" onClick={addPackage}><Plus size={16} /> Tambah Paket</button><div className="mua-stack">{packages.map((item) => <article className="mua-package-card" key={item.name}><div><h2>{item.name}</h2><p>Makeup, hair do, konsultasi singkat</p><strong>{item.price}</strong></div><button className={item.active ? 'toggle-on' : 'toggle-off'} type="button" aria-label={`Status ${item.name}`} onClick={() => setPackages((current) => current.map((entry) => entry.name === item.name ? { ...entry, active: !entry.active } : entry))}><i /></button></article>)}</div></MuaPage>
}

export function MuaPortfolio() {
  const [portfolio, setPortfolio] = useState([...alviaPortfolio])
  const addPhoto = () => setPortfolio((current) => [...current, alviaPortfolio[current.length % alviaPortfolio.length]])
  return <MuaPage title="Kelola Portofolio"><button className="mua-upload" type="button" onClick={addPhoto}><ImagePlus size={21} /> Tambah Foto</button><div className="mua-portfolio-grid">{portfolio.map((source, index) => <div key={`${source}-${index}`}><img src={source} alt={`Portofolio ${index + 1}`} /><button type="button" aria-label="Hapus foto" onClick={() => setPortfolio((current) => current.filter((_, itemIndex) => itemIndex !== index))}>×</button></div>)}</div></MuaPage>
}

export function MuaArea() {
  const [areas, setAreas] = useState(['Surabaya Pusat', 'Rungkut', 'Gubeng'])
  return <MuaPage title="Area & Biaya Layanan"><section className="mua-map"><MapPin size={27} /><span>Surabaya</span></section><section className="dashboard-section"><h2>Area Layanan</h2>{areas.map((area) => <div className="mua-list-row" key={area}><MapPin size={16} /><span>{area}</span><strong>Rp 25.000</strong><button type="button" onClick={() => setAreas((current) => current.filter((item) => item !== area))}>×</button></div>)}<button className="outline-action" type="button" onClick={() => setAreas((current) => [...current, `Area Baru ${current.length + 1}`])}><Plus size={15} /> Tambah Area</button></section></MuaPage>
}

export function MuaAvailability() {
  const [available, setAvailable] = useState<Record<string, boolean>>({ Senin: true, Selasa: true, Rabu: false, Kamis: true, Jumat: true, Sabtu: true, Minggu: false })
  return <MuaPage title="Ketersediaan & Jam Kerja"><section className="dashboard-section"><h2>Jam Kerja</h2><p className="dashboard-subtitle">Atur hari dan jam ketika Anda dapat menerima booking.</p>{Object.entries(available).map(([day, isAvailable]) => <div className="availability-row" key={day}><span>{day}</span><small>{isAvailable ? '08:00 - 18:00' : 'Tidak tersedia'}</small><button className={isAvailable ? 'toggle-on' : 'toggle-off'} type="button" onClick={() => setAvailable((current) => ({ ...current, [day]: !current[day] }))}><i /></button></div>)}</section><section className="dashboard-section"><h2>Tanggal Diblokir</h2><button className="outline-action" type="button"><Plus size={15} /> Tambah Tanggal</button></section></MuaPage>
}

export function MuaMessages() {
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState(['Halo Kak Alya, apakah jadwal tanggal 24 masih tersedia?', 'Halo Kak Nadia, masih tersedia ya. Saya sudah melihat brief-nya.'])
  const send = () => { if (!message.trim()) return; setMessages((current) => [...current, message.trim()]); setMessage('') }
  return <MuaPage title="Chat dengan Pelanggan"><section className="mua-chat-head"><img src={alviaPortfolio[0]} alt="Nadia Putri" /><div><strong>Nadia Putri</strong><span>Booking · Modern Wedding Glam</span></div></section><div className="mua-chat-thread">{messages.map((item, index) => <p className={index % 2 === 0 ? 'message-in' : 'message-out'} key={`${item}-${index}`}>{item}</p>)}</div><form className="chat-input" onSubmit={(event) => { event.preventDefault(); send() }}><input value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Tulis pesan..." /><button type="submit"><Send size={17} /></button></form></MuaPage>
}

export function MuaCustomerBrief() {
  return <MuaPage title="Brief Pelanggan"><section className="brief-booking-summary"><img src={alviaPortfolio[0]} alt="Nadia Putri" /><div><strong>Nadia Putri</strong><span>{request.packageName} · {request.date}</span></div></section><section className="mua-brief-panel"><h2>Detail Makeup</h2><div><span>Gaya</span><strong>Natural Glam</strong></div><div><span>Warna Outfit</span><strong>Gold & Ivory</strong></div><div><span>Catatan</span><strong>Makeup tahan lama, natural, dan tidak terlalu tebal.</strong></div></section><section className="reference-gallery"><h2>Referensi Pelanggan</h2><div>{alviaPortfolio.slice(1).map((source) => <img src={source} alt="Referensi pelanggan" key={source} />)}</div></section></MuaPage>
}

export function MuaEarnings() {
  const [period, setPeriod] = useState('November 2023')
  return <MuaPage title="Pendapatan & Saldo"><section className="earnings-card"><span>Saldo tersedia</span><strong>Rp 8.450.000</strong><button type="button">Tarik Saldo</button></section><div className="mua-filter"><button type="button" onClick={() => setPeriod(period === 'November 2023' ? 'Oktober 2023' : 'November 2023')}>{period} <ChevronDown size={15} /></button><span>4 transaksi</span></div><section className="mua-stack">{['Booking #RK-1024', 'Booking #RK-1019', 'Booking #RK-1008'].map((label, index) => <div className="mua-list-row" key={label}><Banknote size={17} /><span>{label}<small>{24 - index * 3} Nov 2023</small></span><strong>+ Rp {index === 0 ? '1.450.000' : '650.000'}</strong></div>)}</section></MuaPage>
}

export function MuaReviews() {
  const [filter, setFilter] = useState('Terbaru')
  return <MuaPage title="Ulasan Pelanggan"><div className="review-summary"><strong>4.9</strong><div><span>★★★★★</span><small>120 ulasan</small></div><button type="button" onClick={() => setFilter(filter === 'Terbaru' ? 'Tertinggi' : 'Terbaru')}>{filter} <ChevronDown size={14} /></button></div><section className="mua-stack">{['Hasil makeup-nya cantik, tahan lama, dan tepat waktu.', 'Sangat ramah dan profesional. Recommended!'].map((review, index) => <article className="mua-review-card" key={review}><div><img src={alviaPortfolio[index]} alt="Pelanggan" /><strong>{index === 0 ? 'Nadia Putri' : 'Salsa Maharani'}</strong><span>★★★★★</span></div><p>{review}</p><small>{20 - index} Nov 2023</small></article>)}</section></MuaPage>
}

export function MuaPerformance() {
  return <MuaPage title="Performa Profil"><section className="mua-kpis performance-kpis"><div><Eye size={17} /><span>Dilihat</span><strong>1.284</strong></div><div><MessageCircle size={17} /><span>Chat</span><strong>86</strong></div><div><CalendarDays size={17} /><span>Booking</span><strong>32</strong></div></section><section className="performance-chart"><h2>Performa 30 Hari</h2><div>{[34, 42, 30, 57, 48, 76, 64, 84, 70, 92, 79, 100].map((value, index) => <i style={{ height: `${value}%` }} key={index} />)}</div></section><section className="dashboard-section"><h2>Rekomendasi</h2><p className="performance-note">Tambahkan 3 foto portofolio untuk meningkatkan daya tarik profil Anda.</p></section></MuaPage>
}

export function MuaVerification() {
  const [documents, setDocuments] = useState({ identity: true, portfolio: true, bank: false })
  const complete = Object.values(documents).filter(Boolean).length
  return <MuaPage title="Profil & Verifikasi"><section className="mua-profile"><img src={alviaPortfolio[0]} alt="Alya Prameswari" /><div><h1>Alya Prameswari MUA</h1><p>Surabaya · Bergabung sejak 2022</p></div></section><section className="verification-progress"><span>Kelengkapan profil</span><strong>{Math.round((complete / 3) * 100)}%</strong><div><i style={{ width: `${(complete / 3) * 100}%` }} /></div></section><section className="mua-stack">{[['identity', 'Identitas Diri'], ['portfolio', 'Portofolio Profesional'], ['bank', 'Rekening Payout']].map(([key, label]) => <button className="verification-row" type="button" key={key} onClick={() => setDocuments((current) => ({ ...current, [key]: !current[key as keyof typeof current] }))}><span className={documents[key as keyof typeof documents] ? 'verification-check verification-check--done' : 'verification-check'}>{documents[key as keyof typeof documents] ? <Check size={13} /> : null}</span><span>{label}</span><ChevronRight size={17} /></button>)}</section></MuaPage>
}
