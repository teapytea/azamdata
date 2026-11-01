import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Clock3,
  FileText,
  Heart,
  House,
  MapPin,
  MessageCircle,
  Plus,
  Search,
  Send,
  Star,
  UserRound,
  WalletCards,
} from 'lucide-react'
import { alviaPortfolio, searchMuas } from './data/mua'

export type CustomerBooking = {
  packageName: string
  date: string
  time: string
  location: string
}

type SharedProps = { booking: CustomerBooking }

function DashboardHeader({ title, back = true }: { title: string; back?: boolean }) {
  const navigate = useNavigate()
  return <header className="dashboard-header"><div>{back ? <button className="icon-button" type="button" aria-label="Kembali" onClick={() => navigate(-1)}><ArrowLeft size={19} /></button> : <span className="header-spacer" />}<strong>{title}</strong><span className="header-spacer" /></div></header>
}

function CustomerNav() {
  const navigate = useNavigate()
  const items = [
    { label: 'Beranda', icon: House, path: '/' },
    { label: 'Pesan', icon: MessageCircle, path: '/pesan' },
    { label: 'Booking', icon: CalendarDays, path: '/booking-saya' },
    { label: 'Favorit', icon: Heart, path: '/favorit' },
    { label: 'Akun', icon: UserRound, path: '/akun' },
  ]
  return <nav className="bottom-nav customer-nav">{items.map(({ label, icon: Icon, path }) => <button className="bottom-nav__item" type="button" key={label} onClick={() => navigate(path)}><Icon size={18} /><span>{label}</span></button>)}</nav>
}

function BookingCard({ booking, status = 'Terkonfirmasi' }: { booking: CustomerBooking; status?: string }) {
  const navigate = useNavigate()
  return <article className="booking-list-card"><div className="booking-list-card__head"><img src={alviaPortfolio[0]} alt="Bunga Lestari MUA" /><div><span className="status-tag">{status}</span><h2>Bunga Lestari MUA</h2><p>{booking.packageName}</p></div></div><div className="booking-list-card__meta"><span><CalendarDays size={14} />{booking.date}</span><span><Clock3 size={14} />{booking.time}</span><span><MapPin size={14} />{booking.location}</span></div><button className="profile-button" type="button" onClick={() => navigate('/booking/detail')}>Lihat Detail</button></article>
}

export function CustomerOverview({ booking }: SharedProps) {
  const navigate = useNavigate()
  return <div className="dashboard-page"><DashboardHeader title="Booking Saya" back={false} /><main className="dashboard-content"><section className="greeting-block"><p>Selamat datang kembali,</p><h1>Azam</h1><button type="button" onClick={() => navigate('/kebutuhan-makeup')}><Plus size={16} /> Booking Makeup</button></section><section className="dashboard-section"><div className="dashboard-title-row"><h2>Booking Mendatang</h2><button type="button" onClick={() => navigate('/booking-mendatang')}>Lihat Semua</button></div><BookingCard booking={booking} /></section><section className="dashboard-section"><h2>Butuh Bantuan?</h2><div className="quick-action-grid"><button type="button" onClick={() => navigate('/pesan')}><MessageCircle size={18} /><span>Pesan MUA</span></button><button type="button" onClick={() => navigate('/pembayaran')}><WalletCards size={18} /><span>Pembayaran</span></button><button type="button" onClick={() => navigate('/bantuan')}><CircleHelp size={18} /><span>Pusat Bantuan</span></button></div></section></main><CustomerNav /></div>
}

export function UpcomingBookings({ booking }: SharedProps) {
  return <div className="dashboard-page"><DashboardHeader title="Booking Mendatang" /><main className="dashboard-content"><div className="date-filter"><button type="button">November 2023 <ChevronDown size={15} /></button><span>2 booking terjadwal</span></div><div className="booking-stack"><BookingCard booking={booking} /><BookingCard booking={{ ...booking, packageName: 'Graduation Makeup', date: '16 Des 2023', time: '08:00 WIB', location: 'Kampus Universitas Airlangga' }} status="Menunggu Pelunasan" /></div></main><CustomerNav /></div>
}

export function BookingHistory({ booking }: SharedProps) {
  const [tab, setTab] = useState('Selesai')
  const rows = tab === 'Selesai' ? [{ ...booking, date: '12 Okt 2023', packageName: 'Natural Wedding Makeup' }, { ...booking, date: '18 Sep 2023', packageName: 'Graduation Makeup' }] : [{ ...booking, date: '04 Agu 2023', packageName: 'Party Makeup' }]
  return <div className="dashboard-page"><DashboardHeader title="Riwayat Booking" /><main className="dashboard-content"><div className="segment-control">{['Selesai', 'Dibatalkan'].map((item) => <button className={tab === item ? 'segment-control__active' : ''} type="button" key={item} onClick={() => setTab(item)}>{item}</button>)}</div><div className="history-stack">{rows.map((item) => <BookingCard booking={item} status={tab === 'Selesai' ? 'Selesai' : 'Dibatalkan'} key={item.date} />)}</div></main><CustomerNav /></div>
}

export function BookingDetail({ booking }: SharedProps) {
  const navigate = useNavigate()
  return <div className="dashboard-page"><DashboardHeader title="Detail Booking" /><main className="dashboard-content"><section className="booking-detail-hero"><span className="status-tag">Terkonfirmasi</span><h1>{booking.packageName}</h1><p>Bunga Lestari MUA · Wedding Package</p></section><section className="detail-panel"><h2>Jadwal & Lokasi</h2><p><CalendarDays size={16} /><span><small>Tanggal</small>{booking.date}</span></p><p><Clock3 size={16} /><span><small>Waktu</small>{booking.time}</span></p><p><MapPin size={16} /><span><small>Lokasi</small>{booking.location}</span></p></section><section className="detail-panel"><h2>Ringkasan Pembayaran</h2><div className="detail-total"><span>Deposit dibayar</span><strong>Rp 2.500.000</strong></div><div className="detail-total"><span>Sisa pelunasan</span><strong>Rp 1.575.000</strong></div></section><div className="dashboard-actions"><button className="secondary-button" type="button" onClick={() => navigate('/pesan')}>Chat MUA</button><button className="booking-cta" type="button" onClick={() => navigate('/brief')}>Lihat Brief</button></div></main></div>
}

export function CustomerBrief({ booking }: SharedProps) {
  const [note, setNote] = useState('Tampil natural glam, tahan lama, dan tetap nyaman untuk acara seharian.')
  const [saved, setSaved] = useState(false)
  return <div className="dashboard-page"><DashboardHeader title="Brief Makeup" /><main className="dashboard-content"><section className="brief-booking-summary"><img src={alviaPortfolio[0]} alt="Bunga Lestari MUA" /><div><strong>{booking.packageName}</strong><span>{booking.date} · {booking.time}</span></div></section><label className="dashboard-field"><span>Gaya Makeup</span><input value="Natural Glam" readOnly /></label><label className="dashboard-field"><span>Catatan untuk MUA</span><textarea value={note} onChange={(event) => setNote(event.target.value)} rows={5} /></label><section className="reference-gallery"><h2>Referensi Makeup</h2><div>{alviaPortfolio.slice(1).map((source) => <img src={source} alt="Referensi makeup" key={source} />)}</div></section><button className="primary-button" type="button" onClick={() => setSaved(true)}>{saved ? 'Brief Tersimpan' : 'Simpan Perubahan'}</button></main></div>
}

export function CustomerMessages() {
  const [activeConversation, setActiveConversation] = useState('Bunga Lestari MUA')
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState(['Halo Kak Azam, terima kasih sudah booking. Brief makeup-nya sudah saya terima.', 'Baik kak, saya juga akan siapkan referensi tambahan.'])
  const send = () => { if (!message.trim()) return; setMessages((current) => [...current, message.trim()]); setMessage('') }
  return <div className="dashboard-page messages-page"><DashboardHeader title="Pesan" back={false} /><main className="messages-layout"><aside className="conversation-list"><label><Search size={15} /><input placeholder="Cari percakapan" /></label>{['Bunga Lestari MUA', 'Alya Lestri Artistry', 'RiasKita Support'].map((name) => <button className={activeConversation === name ? 'conversation-active' : ''} type="button" key={name} onClick={() => setActiveConversation(name)}><img src={alviaPortfolio[0]} alt="" /><span><strong>{name}</strong><small>{name === 'Bunga Lestari MUA' ? 'Brief makeup sudah diterima' : 'Terakhir aktif hari ini'}</small></span></button>)}</aside><section className="chat-panel"><header><img src={alviaPortfolio[0]} alt="" /><div><strong>{activeConversation}</strong><small>Online</small></div></header><div className="chat-thread">{messages.map((item, index) => <p className={index % 2 === 0 ? 'message-in' : 'message-out'} key={`${item}-${index}`}>{item}</p>)}</div><form className="chat-input" onSubmit={(event) => { event.preventDefault(); send() }}><input value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Tulis pesan..." /><button type="submit" aria-label="Kirim pesan"><Send size={17} /></button></form></section></main><CustomerNav /></div>
}

export function CustomerFavorites({ favorites, onFavorite }: { favorites: Set<string>; onFavorite: (id: string) => void }) {
  const navigate = useNavigate()
  const artists = searchMuas.filter((artist) => favorites.size === 0 || favorites.has(artist.id))
  return <div className="dashboard-page"><DashboardHeader title="MUA Favorit" /><main className="dashboard-content"><p className="dashboard-subtitle">Simpan MUA untuk membandingkan dan booking nanti.</p><div className="favorite-grid">{artists.map((artist) => <article key={artist.id}><img src={artist.portfolioImage} alt={artist.name} /><button type="button" aria-label={`Hapus ${artist.name} dari favorit`} onClick={() => onFavorite(artist.id)}><Heart size={16} fill="currentColor" /></button><div><h2>{artist.name}</h2><p><Star size={12} fill="currentColor" /> {artist.rating} · {artist.area}</p><strong>{artist.startingPrice}</strong><button className="profile-button" type="button" onClick={() => navigate('/mua/alya-lestri-artistry')}>Lihat Profil</button></div></article>)}</div></main><CustomerNav /></div>
}

export function CustomerPayments() {
  const [downloaded, setDownloaded] = useState(false)
  return <div className="dashboard-page"><DashboardHeader title="Pembayaran & Invoice" /><main className="dashboard-content"><section className="payment-summary"><span>Total Pengeluaran 2023</span><strong>Rp 5.750.000</strong><small>3 booking selesai</small></section><section className="dashboard-section"><h2>Transaksi Terbaru</h2>{['Wedding Package · Bunga Lestari MUA', 'Graduation Makeup · Alya Lestri'].map((name, index) => <article className="invoice-row" key={name}><span className="invoice-icon"><FileText size={18} /></span><div><strong>{name}</strong><small>{index === 0 ? '24 Nov 2023' : '18 Sep 2023'} · Lunas</small></div><strong>{index === 0 ? 'Rp 2.500.000' : 'Rp 650.000'}</strong><button type="button" onClick={() => setDownloaded(true)}><ChevronRight size={17} /></button></article>)}</section>{downloaded ? <p className="saved-notice">Invoice siap diunduh.</p> : null}</main><CustomerNav /></div>
}

export function CustomerAccount() {
  const [addresses, setAddresses] = useState(['Rumah (Utama) · Jl. Kebon Jeruk Raya No. 12, Jakarta Barat'])
  return <div className="dashboard-page"><DashboardHeader title="Akun Saya" /><main className="dashboard-content"><section className="account-hero"><img src={alviaPortfolio[0]} alt="Azam" /><div><h1>Azam Pratama</h1><p>azam@example.com · +62 812 3456 7890</p></div><ChevronRight size={18} /></section><section className="dashboard-section"><h2>Alamat Tersimpan</h2>{addresses.map((address) => <div className="address-row" key={address}><House size={16} /><span>{address}</span></div>)}<button className="outline-action" type="button" onClick={() => setAddresses((current) => [...current, `Kantor · Jl. Raya Darmo No. ${current.length + 10}, Surabaya`])}><Plus size={15} /> Tambah Alamat</button></section><section className="account-menu">{[['Metode Pembayaran', WalletCards], ['Pusat Bantuan', CircleHelp], ['Pengaturan Notifikasi', ChevronRight]].map(([label, Icon]) => { const MenuIcon = Icon as typeof WalletCards; return <button type="button" key={label as string}><MenuIcon size={18} /><span>{label as string}</span><ChevronRight size={17} /></button> })}</section></main><CustomerNav /></div>
}

export function CustomerHelp() {
  const [open, setOpen] = useState<string | null>(null)
  const questions = ['Bagaimana cara mengubah jadwal booking?', 'Kapan pelunasan dilakukan?', 'Bagaimana jika MUA membatalkan booking?']
  return <div className="dashboard-page"><DashboardHeader title="Pusat Bantuan" /><main className="dashboard-content"><section className="help-banner"><CircleHelp size={23} /><div><h1>Butuh bantuan?</h1><p>Temukan jawaban atau hubungi tim RiasKita.</p></div></section><label className="help-search"><Search size={16} /><input placeholder="Cari topik bantuan" /></label><section className="faq-list"><h2>Pertanyaan Populer</h2>{questions.map((question) => <button type="button" key={question} onClick={() => setOpen((current) => current === question ? null : question)}><span>{question}</span><ChevronDown size={17} />{open === question ? <p>Tim RiasKita akan membantu proses perubahan melalui detail booking Anda.</p> : null}</button>)}</section><button className="primary-button" type="button">Hubungi RiasKita Support</button></main><CustomerNav /></div>
}

export function CustomerReview() {
  const [rating, setRating] = useState(0)
  const [review, setReview] = useState('')
  const [submitted, setSubmitted] = useState(false)
  return <div className="dashboard-page"><DashboardHeader title="Tulis Ulasan" /><main className="dashboard-content review-content"><section className="review-artist"><img src={alviaPortfolio[0]} alt="Bunga Lestari MUA" /><div><h1>Bunga Lestari MUA</h1><p>Wedding Package · 24 Nov 2023</p></div></section><section className="rating-box"><h2>Bagaimana pengalaman Anda?</h2><div>{[1, 2, 3, 4, 5].map((value) => <button type="button" key={value} aria-label={`${value} bintang`} onClick={() => setRating(value)}><Star size={30} fill={value <= rating ? '#E66F61' : 'none'} color={value <= rating ? '#E66F61' : '#D5C1C8'} /></button>)}</div><span>{rating === 0 ? 'Pilih rating' : `${rating} dari 5`}</span></section><label className="dashboard-field"><span>Ceritakan pengalaman Anda</span><textarea value={review} onChange={(event) => setReview(event.target.value)} placeholder="Bagikan detail layanan MUA..." rows={5} /></label><button className="primary-button" type="button" disabled={rating === 0} onClick={() => setSubmitted(true)}>{submitted ? 'Ulasan Terkirim' : 'Kirim Ulasan'}</button></main></div>
}
