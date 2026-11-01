import { useMemo, useState, type Dispatch, type ReactNode, type SetStateAction } from 'react'
import { Route, Routes, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Bell,
  CalendarDays,
  Camera,
  Check,
  ChevronDown,
  ChevronRight,
  Clock3,
  Filter,
  Heart,
  Home,
  ImagePlus,
  MapPin,
  MoreHorizontal,
  PackageCheck,
  PartyPopper,
  Search,
  SlidersHorizontal,
  Star,
  UserRound,
  UsersRound,
  Verified,
} from 'lucide-react'
import { alviaPortfolio, recommendedMuas, searchMuas } from './data/mua'
import {
  BookingDetail,
  BookingHistory,
  CustomerAccount,
  CustomerBrief,
  CustomerFavorites,
  CustomerHelp,
  CustomerMessages,
  CustomerOverview,
  CustomerPayments,
  CustomerReview,
  UpcomingBookings,
} from './CustomerDashboard'
import {
  MuaAppointments,
  MuaArea,
  MuaAvailability,
  MuaCalendar,
  MuaCustomerBrief,
  MuaEarnings,
  MuaMessages,
  MuaOnboarding,
  MuaOverview,
  MuaPackages,
  MuaPerformance,
  MuaPortfolio,
  MuaRequests,
  MuaReviews,
  MuaVerification,
} from './MuaDashboard'
import {
  AdminCategories,
  AdminCommission,
  AdminContent,
  AdminDisputes,
  AdminOrders,
  AdminPromotions,
  AdminRefunds,
  AdminRegions,
  AdminReviews,
  AdminTransactions,
  AdminUsers,
  AdminVerification,
} from './AdminDashboard'
import {
  ForgotPassword,
  NotFound,
  Notifications,
  OtpVerification,
  SignIn,
  SignUp,
  SystemStates,
} from './AuthSystem'
import { StitchScreen } from './StitchScreen'

type BookingState = {
  event: string
  date: string
  time: string
  location: string
  people: string
  packageName: string
  addons: string[]
}

const initialBooking: BookingState = {
  event: 'Pernikahan',
  date: '24 Nov 2023',
  time: '04:00 AM',
  location: 'Kompleksi Grand Ballroom, Jl. MH Thamrin No. 1, Jakarta',
  people: '1 Orang',
  packageName: 'Modern Wedding Glam',
  addons: ['Pasang Softlens'],
}

const categories = [
  { label: 'Wisuda', icon: PartyPopper },
  { label: 'Pernikahan', icon: Heart },
  { label: 'Lamaran', icon: PartyPopper },
  { label: 'Bridesmaid', icon: UsersRound },
  { label: 'Photoshoot', icon: Camera },
] as const

const searchFilters = ['Harga Terjangkau', 'Tersedia', 'Terverifikasi'] as const

function App() {
  const [booking, setBooking] = useState<BookingState>(initialBooking)
  const [favorites, setFavorites] = useState<Set<string>>(() => new Set())

  const toggleFavorite = (id: string) => {
    setFavorites((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const stitch = (
    screenId: string,
    title: string,
    fallback: ReactNode,
    desktopScreenId?: string,
  ) => (
    <StitchScreen
      desktopScreenId={desktopScreenId}
      fallback={fallback}
      screenId={screenId}
      title={title}
    />
  )

  return (
    <Routes>
      <Route path="/" element={stitch('47755fb4ede8471aa7aad8c070d842c8', 'Beranda', <HomePage booking={booking} setBooking={setBooking} />)} />
      <Route path="/kebutuhan-makeup" element={stitch('f1ae54e3431a4261b5f9b8b8ce944972', 'Kebutuhan Makeup', <BriefPage booking={booking} setBooking={setBooking} />)} />
      <Route path="/pencarian" element={stitch('2c8f4125816c4d6f90d48e5b92c9d3da', 'Hasil Pencarian', <SearchPage favorites={favorites} onFavorite={toggleFavorite} />)} />
      <Route path="/mua/alya-lestri-artistry" element={stitch('9cb7dd536f96411b8318e964ff0e8222', 'Profil MUA', <ProfilePage booking={booking} setBooking={setBooking} />)} />
      <Route path="/checkout" element={stitch('633b80b842cc4611a6ab1cc04a528bdf', 'Booking dan Pembayaran', <CheckoutPage booking={booking} setBooking={setBooking} />)} />
      <Route path="/booking/berhasil" element={stitch('d5088dd89944457b84efe8c652f53197', 'Konfirmasi Booking', <ConfirmationPage booking={booking} />)} />
      <Route path="/booking-saya" element={stitch('a3e1ba3639ce48f38a711839686c924e', 'Booking Saya', <CustomerOverview booking={booking} />)} />
      <Route path="/booking-mendatang" element={stitch('caf65578a6294e4b9324b3cd217d1f91', 'Upcoming Bookings', <UpcomingBookings booking={booking} />)} />
      <Route path="/riwayat-booking" element={stitch('ef12b794a1e549dca69dcf483160002f', 'Riwayat Booking', <BookingHistory booking={booking} />)} />
      <Route path="/booking/detail" element={stitch('8e200f2baab1454cbb62c7744c3d4587', 'Detail Booking', <BookingDetail booking={booking} />)} />
      <Route path="/brief" element={stitch('3f637fc3b9954b9789602ca89cd5740d', 'Brief Makeup', <CustomerBrief booking={booking} />)} />
      <Route path="/pesan" element={stitch('34732b98d3114b578e73770d3bb3dd8f', 'Pesan', <CustomerMessages />)} />
      <Route path="/pesan/chat" element={stitch('c5d1de3630024bcea94eb2af6b0759d4', 'Chat dengan MUA', <CustomerMessages />)} />
      <Route path="/favorit" element={stitch('347efa58f9f5486a81dab26b9338cda1', 'MUA Favorit', <CustomerFavorites favorites={favorites} onFavorite={toggleFavorite} />)} />
      <Route path="/pembayaran" element={stitch('e16be7b6ebbc495db116d9d552f21fc9', 'Pembayaran dan Invoice', <CustomerPayments />)} />
      <Route path="/akun" element={stitch('bd7a2bdf2abb422496c3e13804362de7', 'Akun Saya', <CustomerAccount />)} />
      <Route path="/bantuan" element={stitch('c7a525ca54ee4c4b952f19daea355b0c', 'Pusat Bantuan', <CustomerHelp />)} />
      <Route path="/ulasan" element={stitch('99bf116a83884da3a8d80bfe0e67151f', 'Tulis Ulasan', <CustomerReview />)} />
      <Route path="/mua/onboarding" element={stitch('c2a44284ba7c4405b1edf9f132eabbc1', 'Onboarding MUA', <MuaOnboarding />)} />
      <Route path="/mua/onboarding/jadwal" element={stitch('046535e575664d59a191bd0c16068424', 'Jadwal dan Lokasi', <MuaOnboarding />)} />
      <Route path="/mua/onboarding/paket" element={stitch('a4c662786b034dd3b8e9879b92d428e5', 'Paket Layanan', <MuaPackages />)} />
      <Route path="/mua/onboarding/portfolio" element={stitch('f963c857d0704bc482203d9e825d1714', 'Portfolio dan Spesialisasi', <MuaPortfolio />)} />
      <Route path="/mua/onboarding/bisnis" element={stitch('d9ef9ec5bae44d14806d8eb69b85f1f1', 'Business Overview', <MuaVerification />)} />
      <Route path="/mua/dashboard" element={stitch('5f69e39625ad4bdba232100daec843a9', 'Dashboard MUA', <MuaOverview />)} />
      <Route path="/mua/permintaan" element={stitch('7e84fc0ba9c443ff8f8d9641d8c15eb7', 'Permintaan Booking', <MuaRequests />)} />
      <Route path="/mua/kalender" element={stitch('b7ae4140b0b149efa5fbfc0a10409942', 'Kalender Booking', <MuaCalendar />)} />
      <Route path="/mua/janji" element={stitch('8af010248cbd44a0b7d2a3ac1c098bd0', 'Janji Temu Mendatang', <MuaAppointments />)} />
      <Route path="/mua/paket" element={stitch('4942a9dccb7648378d719ae837a192d2', 'Manajemen Paket', <MuaPackages />)} />
      <Route path="/mua/portfolio" element={stitch('bb693eaa889144b3aaad881daef1dbfd', 'Kelola Portofolio', <MuaPortfolio />)} />
      <Route path="/mua/area" element={stitch('4a66daad676e4d21ba6e30b93ffa0242', 'Area dan Biaya Layanan', <MuaArea />)} />
      <Route path="/mua/ketersediaan" element={stitch('f189991383734260ba96981e5ff60a73', 'Ketersediaan dan Jam Kerja', <MuaAvailability />)} />
      <Route path="/mua/pesan" element={stitch('c5d1de3630024bcea94eb2af6b0759d4', 'Pesan MUA', <MuaMessages />)} />
      <Route path="/mua/brief-pelanggan" element={stitch('3f637fc3b9954b9789602ca89cd5740d', 'Brief Pelanggan', <MuaCustomerBrief />)} />
      <Route path="/mua/pendapatan" element={stitch('a99961c4fabb4216af4462208b2e07c3', 'Pendapatan dan Saldo', <MuaEarnings />)} />
      <Route path="/mua/ulasan" element={<MuaReviews />} />
      <Route path="/mua/performa" element={stitch('c574a58796cb4646bff3d8ac4d5fd952', 'Performa Profil', <MuaPerformance />)} />
      <Route path="/mua/verifikasi" element={stitch('1d6b4510059f432a8cb4d3167e8c7981', 'Verifikasi Bisnis', <MuaVerification />)} />
      <Route path="/admin/verifikasi" element={stitch('78f9eb78cd52479d8d6846a378dbbed9', 'Antrean Verifikasi MUA', <AdminVerification />, '5bed7307fdcf49c5b6f99565264b2bb7')} />
      <Route path="/admin/pengguna" element={stitch('ceca637b094f4adeabb9750fb033fe30', 'Manajemen Pengguna', <AdminUsers />, '32b0e7efee3842fcb2f42e24efa1e195')} />
      <Route path="/admin/pesanan" element={stitch('0efdcdd33804404b8da3d40b8b92e606', 'Monitoring Pesanan', <AdminOrders />, 'f7e77bd51bec4b5cad73d389e8340ab9')} />
      <Route path="/admin/transaksi" element={stitch('9c223e5fdd4c4be6be16d73ecfa048c4', 'Keuangan dan Transaksi', <AdminTransactions />, '32bcd9aaa22943f6bd2c76e6b0f3857d')} />
      <Route path="/admin/refund" element={stitch('816f20c66fff4430b1019f7c14be9465', 'Pembatalan dan Refund', <AdminRefunds />)} />
      <Route path="/admin/sengketa" element={stitch('cf58b738d3d6474cb8712e283df435f9', 'Penyelesaian Sengketa', <AdminDisputes />)} />
      <Route path="/admin/ulasan" element={stitch('95b758b5b8584a888543278179f907e4', 'Moderasi Ulasan', <AdminReviews />)} />
      <Route path="/admin/kategori" element={stitch('f5997cb0e06141eca624575a7c07c143', 'Manajemen Kategori', <AdminCategories />, 'bd1d8da6f3e84b10bc6b945a974a5e8a')} />
      <Route path="/admin/wilayah" element={stitch('93c87347b2cd46248e69174602f3a879', 'Pengaturan Wilayah', <AdminRegions />, '70ef6cc1480841b29d5866232f671aa8')} />
      <Route path="/admin/komisi" element={stitch('4af21ff727f84b21937c27c08c749442', 'Komisi Platform', <AdminCommission />, '5e60b181c1bf4b1bb5d7cc6a6b267bdb')} />
      <Route path="/admin/promosi" element={stitch('73d1ee28b8c4452d8b7fd5ace43f75bc', 'Promosi dan Voucher', <AdminPromotions />, '7234ce1b1a9146c180774163ffe68be0')} />
      <Route path="/admin/konten" element={stitch('9d56ba4ddad54495952fa9d1e1e6a872', 'Manajemen Konten', <AdminContent />)} />
      <Route path="/masuk" element={stitch('7081f22848bc4a388683fcf84b1c5b57', 'Masuk', <SignIn />)} />
      <Route path="/daftar" element={stitch('b2e998ba58b3436d89765821308ffa39', 'Daftar Akun', <SignUp />)} />
      <Route path="/lupa-password" element={stitch('87d546c7faf540578f3a2aededa491e2', 'Lupa Password', <ForgotPassword />)} />
      <Route path="/otp" element={stitch('473c092485b44103a68a346bb220cc13', 'Verifikasi OTP', <OtpVerification />)} />
      <Route path="/notifikasi" element={stitch('15333c8af234471a83ec07371bfed8a9', 'Notifikasi', <Notifications />)} />
      <Route path="/sistem" element={<SystemStates />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

function Header({ back = false, title = 'RiasKita' }: { back?: boolean; title?: string }) {
  const navigate = useNavigate()
  return (
    <header className="market-header">
      <div className="market-header__inner">
        {back ? (
          <button className="icon-button" type="button" aria-label="Kembali" onClick={() => navigate(-1)}><ArrowLeft size={19} /></button>
        ) : (
          <button className="location-control" type="button" aria-label="Pilih lokasi"><MapPin size={14} /><span>Surabaya</span><ChevronDown size={14} /></button>
        )}
        <span className="brand">{title}</span>
        {back ? <span className="header-spacer" /> : <button className="icon-button notification-button" type="button" aria-label="Notifikasi"><Bell size={19} /><span className="notification-dot" /></button>}
      </div>
    </header>
  )
}

function BottomNav() {
  const navigate = useNavigate()
  const navItems = [
    { label: 'Beranda', icon: Home, path: '/' },
    { label: 'Cari', icon: Search, path: '/pencarian' },
    { label: 'Booking', icon: CalendarDays, path: '/kebutuhan-makeup' },
    { label: 'Favorit', icon: Heart, path: '/pencarian' },
    { label: 'Akun', icon: UserRound, path: '/' },
  ]
  return <nav className="bottom-nav" aria-label="Navigasi utama">{navItems.map(({ label, icon: Icon, path }) => <button className="bottom-nav__item" type="button" key={label} onClick={() => navigate(path)}><Icon size={18} /><span>{label}</span></button>)}</nav>
}

function HomePage({ booking, setBooking }: { booking: BookingState; setBooking: Dispatch<SetStateAction<BookingState>> }) {
  const navigate = useNavigate()
  const fields = [
    { key: 'event' as const, label: 'Jenis Acara', placeholder: 'Pilih Acara', icon: PartyPopper, values: ['Pernikahan', 'Lamaran', 'Wisuda'] },
    { key: 'location' as const, label: 'Lokasi', placeholder: 'Masukkan Alamat', icon: MapPin, values: ['Surabaya Pusat', 'Gubeng, Surabaya', 'Rungkut, Surabaya'] },
    { key: 'date' as const, label: 'Tanggal', placeholder: 'Pilih Tanggal', icon: CalendarDays, values: ['24 Nov 2023', '12 Des 2023', '16 Des 2023'] },
    { key: 'time' as const, label: 'Jam Selesai Dirias', placeholder: 'Pilih Waktu', icon: Clock3, values: ['08:00 WIB', '10:00 WIB', '13:00 WIB'] },
  ]
  const nextFieldValue = (key: keyof BookingState, values: readonly string[]) => {
    const index = values.indexOf(booking[key] as string)
    setBooking((current) => ({ ...current, [key]: values[(index + 1) % values.length] }))
  }
  return <div className="app-shell"><Header /><main className="page-content">
    <section className="hero-section"><h1>Mau tampil seperti apa hari ini?</h1><div className="booking-card"><div className="booking-grid">{fields.map(({ key, label, placeholder, icon: Icon, values }) => <button className="booking-field" type="button" key={key} onClick={() => nextFieldValue(key, values)}><span className="booking-field__label">{label}</span><span className="booking-field__value">{booking[key] || placeholder}<Icon size={16} /></span></button>)}</div><div className="booking-card__action"><button className="primary-button" type="button" onClick={() => navigate('/pencarian')}><Search size={16} />Cari MUA</button></div></div></section>
    <section className="content-section"><h2>Kategori Layanan</h2><div className="category-grid">{categories.map(({ label, icon: Icon }) => <button className="category-card" type="button" key={label} onClick={() => { setBooking((current) => ({ ...current, event: label })); navigate('/kebutuhan-makeup') }}><span className="category-card__icon"><Icon size={18} /></span><span>{label}</span></button>)}<button className="category-card" type="button"><span className="category-card__icon category-card__icon--muted"><MoreHorizontal size={18} /></span><span>Lainnya</span></button></div></section>
    <section className="content-section"><div className="section-heading-row"><h2>MUA yang cocok untukmu</h2><button className="text-button" type="button" onClick={() => navigate('/pencarian')}>Lihat Semua</button></div><MuaCarousel onProfile={() => navigate('/mua/alya-lestri-artistry')} /></section>
  </main><BottomNav /></div>
}

function MuaCarousel({ onProfile }: { onProfile: () => void }) {
  return <div className="mua-carousel">{recommendedMuas.map((mua) => <article className="mua-card" key={mua.id} onClick={onProfile}><div className="mua-card__photo"><img src={mua.portfolioImage} alt={`Hasil rias ${mua.name}`} /><span className="rating-badge"><Star size={12} fill="currentColor" /> {mua.rating}</span></div><div className="mua-card__content"><div className="mua-card__name"><h3>{mua.name}</h3><Verified size={16} /></div><p className="mua-card__location"><MapPin size={13} />{mua.area}</p><div className="mua-card__footer"><div><p>Mulai dari</p><strong>{mua.startingPrice}</strong></div><span className="availability-badge">Tersedia</span></div></div></article>)}</div>
}

function BriefPage({ booking, setBooking }: { booking: BookingState; setBooking: Dispatch<SetStateAction<BookingState>> }) {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const titles = ['Acara', 'Lokasi', 'Gaya', 'Preferensi', 'Ringkasan']
  const continueFlow = () => step === 5 ? navigate('/pencarian') : setStep((current) => current + 1)
  return <div className="flow-page"><Header back /><main className="flow-content"><div className="progress-label"><span>Langkah {step} dari 5</span><span>{titles[step - 1]}</span></div><div className="progress-track"><span style={{ width: `${step * 20}%` }} /></div>
    {step === 1 ? <section className="brief-form"><h1>Detail Acara</h1><p className="helper-text">Beri tahu kami tentang acara Anda agar kami dapat mencocokkan Anda dengan MUA yang tepat.</p><FieldLabel label="Jenis Acara"><div className="choice-grid">{['Pernikahan', 'Lamaran', 'Wisuda', 'Photoshoot'].map((option) => <button className={`choice-button${booking.event === option ? ' choice-button--selected' : ''}`} type="button" onClick={() => setBooking((current) => ({ ...current, event: option }))} key={option}>{option}</button>)}</div></FieldLabel><FieldLabel label="Tanggal Acara"><input className="form-input" type="date" value="2023-11-24" onChange={() => undefined} /></FieldLabel><FieldLabel label="Target Waktu Selesai Makeup"><div className="input-with-icon"><input className="form-input" value={booking.time} onChange={(event) => setBooking((current) => ({ ...current, time: event.target.value }))} /><Clock3 size={16} /></div></FieldLabel><FieldLabel label="Jumlah Orang yang Dirias"><button className="select-input" type="button" onClick={() => setBooking((current) => ({ ...current, people: current.people === '1 Orang' ? '2 Orang' : '1 Orang' }))}><UsersRound size={16} />{booking.people}<ChevronDown size={16} /></button></FieldLabel><FieldLabel label="Referensi Makeup (Opsional)"><button className="upload-zone" type="button"><ImagePlus size={22} /><span>Tarik & lepas gambar ke sini<br />atau Pilih dari perangkat</span></button></FieldLabel></section> : <section className="brief-form"><h1>{titles[step - 1]}</h1><p className="helper-text">Lengkapi kebutuhan Anda untuk membantu kami menampilkan MUA yang paling sesuai.</p><div className="selection-summary"><PackageCheck size={20} /><div><strong>{booking.event}</strong><span>{booking.date} · {booking.people}</span></div></div><FieldLabel label={step === 2 ? 'Alamat Makeup' : step === 3 ? 'Gaya Makeup' : 'Catatan Tambahan'}><input className="form-input" value={step === 2 ? booking.location : 'Natural glam, tahan lama'} onChange={(event) => step === 2 && setBooking((current) => ({ ...current, location: event.target.value }))} /></FieldLabel></section>}
  </main><footer className="sticky-action"><button className="primary-button" type="button" onClick={continueFlow}>{step === 5 ? 'Lihat MUA yang Sesuai' : step === 1 ? 'Lanjut ke Lokasi' : `Lanjut ke ${titles[step]}`}</button></footer></div>
}

function FieldLabel({ label, children }: { label: string; children: ReactNode }) { return <label className="field-label"><span>{label}</span>{children}</label> }

function SearchPage({ favorites, onFavorite }: { favorites: Set<string>; onFavorite: (id: string) => void }) {
  const navigate = useNavigate()
  const [activeFilters, setActiveFilters] = useState<Set<string>>(() => new Set(['Tersedia']))
  const [sortAscending, setSortAscending] = useState<boolean | null>(null)
  const artists = useMemo(() => sortAscending === null ? searchMuas : [...searchMuas].sort((a, b) => {
    const priceA = Number(a.startingPrice.replace(/\D/g, ''))
    const priceB = Number(b.startingPrice.replace(/\D/g, ''))
    return sortAscending ? priceA - priceB : priceB - priceA
  }), [sortAscending])
  const toggleFilter = (filter: string) => setActiveFilters((current) => { const next = new Set(current); if (next.has(filter)) next.delete(filter); else next.add(filter); return next })
  return <div className="flow-page browse-page"><Header back title="MUA untuk kebutuhan..." /><main className="browse-content"><div className="search-summary"><div><span>Pernikahan · 24 Nov 2023</span><strong>17 MUA tersedia</strong></div><button className="filter-trigger" type="button"><SlidersHorizontal size={16} />Filter</button></div><div className="filter-row">{searchFilters.map((filter) => <button className={`filter-chip${activeFilters.has(filter) ? ' filter-chip--active' : ''}`} type="button" key={filter} onClick={() => toggleFilter(filter)}>{filter}{filter !== 'Harga Terjangkau' ? <ChevronDown size={13} /> : null}</button>)}<button className="sort-chip" type="button" onClick={() => setSortAscending((current) => current === null ? true : !current)}><Filter size={14} />Harga</button></div><div className="search-list">{artists.map((mua) => <article className="search-card" key={mua.id}><div className="search-card__image"><img src={mua.portfolioImage} alt={`Portofolio ${mua.name}`} /><button className="favorite-button" type="button" aria-label={`Favorit ${mua.name}`} onClick={() => onFavorite(mua.id)}><Heart size={17} fill={favorites.has(mua.id) ? 'currentColor' : 'none'} /></button></div><div className="search-card__body"><div className="artist-title"><div><h2>{mua.name}</h2><p><MapPin size={12} />{mua.area}</p></div><span className="rating-inline"><Star size={12} fill="currentColor" />{mua.rating}</span></div><div className="tag-row"><span>Wedding</span><span>Party</span><span>Photoshoot</span></div><div className="search-card__bottom"><div><small>Mulai dari</small><strong>{mua.startingPrice}</strong></div><span className="availability-badge">Tersedia</span></div><button className="profile-button" type="button" onClick={() => navigate('/mua/alya-lestri-artistry')}>Lihat Profil</button></div></article>)}</div></main><BottomNav /></div>
}

function ProfilePage({ booking, setBooking }: { booking: BookingState; setBooking: Dispatch<SetStateAction<BookingState>> }) {
  const navigate = useNavigate()
  const [tab, setTab] = useState('Portfolio')
  const [selectedPackage, setSelectedPackage] = useState(booking.packageName)
  const packages = [{ name: 'Graduation Look', price: 'Rp450.000', duration: '120 menit' }, { name: 'Engagement / Lamaran', price: 'Rp650.000', duration: '150 menit' }]
  const choosePackage = () => { setBooking((current) => ({ ...current, packageName: selectedPackage })); navigate('/checkout') }
  return <div className="flow-page profile-page"><Header back title="Alya Prameswari" /><main className="profile-content"><section className="artist-hero"><img className="artist-avatar" src={alviaPortfolio[0]} alt="Alya Prameswari" /><div><div className="artist-name"><h1>Alya Prameswari</h1><Verified size={16} /></div><p><Star size={12} fill="currentColor" /> 4.9 (120 review) · Surabaya</p><span className="online-badge">Online</span></div><button className="heart-circle" type="button" aria-label="Favorit Alya Prameswari"><Heart size={18} /></button></section><section className="profile-section"><h2>About</h2><p>Spesialisasi pernikahan, wisuda, dan acara formal. Hasil rias natural tahan lama dengan tampilan elegan dan nyaman.</p></section><section className="profile-section service-area"><h2>Service Area & Travel Fee</h2><div className="detail-rows"><p><MapPin size={15} /><span>Surabaya Pusat, Rungkut</span></p><p><ChevronRight size={15} /><span>Biaya travel mulai Rp25.000</span></p></div></section><section className="profile-section"><div className="tabs">{['Portfolio', 'Wedding', 'Graduation'].map((item) => <button className={tab === item ? 'tab tab--active' : 'tab'} type="button" key={item} onClick={() => setTab(item)}>{item}</button>)}</div><div className="portfolio-grid">{alviaPortfolio.map((image, index) => <img src={image} alt={`Portofolio makeup ${index + 1}`} key={image} />)}</div><button className="gallery-button" type="button">Lihat Semua (24 Foto)</button></section><section className="profile-section"><h2>Service Packages</h2><div className="package-list">{packages.map((item) => <article className={`package-card${selectedPackage === item.name ? ' package-card--selected' : ''}`} key={item.name}><div className="package-card__summary"><div><strong>{item.name}</strong><span>Makeup + hijab do, {item.duration}</span></div><strong>{item.price}</strong></div><button type="button" onClick={() => setSelectedPackage(item.name)}>Lihat Detail</button></article>)}</div></section></main><footer className="profile-action"><button className="secondary-button" type="button">Chat MUA</button><button className="booking-cta" type="button" onClick={choosePackage}>Pilih Paket</button></footer></div>
}

function CheckoutPage({ booking, setBooking }: { booking: BookingState; setBooking: Dispatch<SetStateAction<BookingState>> }) {
  const navigate = useNavigate()
  const addons = [{ name: 'Pasang Softlens', price: 'Rp 50.000' }, { name: 'Kuku Palsu', price: 'Rp 100.000' }]
  const toggleAddon = (name: string) => setBooking((current) => ({ ...current, addons: current.addons.includes(name) ? current.addons.filter((item) => item !== name) : [...current.addons, name] }))
  const total = booking.addons.includes('Kuku Palsu') ? 'Rp 1.675.000' : 'Rp 1.575.000'
  return <div className="flow-page checkout-page"><Header back title="RiasKita" /><main className="checkout-content"><div className="checkout-steps">{['Review', 'Jadwal', 'Lokasi', 'Briefing', 'Bayar'].map((label, index) => <div className={index === 0 ? 'checkout-step checkout-step--active' : 'checkout-step'} key={label}><span>{index + 1}</span><small>{label}</small></div>)}</div><section className="order-section"><h2>Detail Pesanan</h2><div className="order-artist"><img src={alviaPortfolio[0]} alt="Alvia Prameswari" /><div><strong>{booking.packageName}</strong><span>oleh Sahar MUA</span><div className="tag-row"><span>Half-do</span><span>100 pph</span></div></div></div><div className="addon-list">{addons.map((addon) => <button className="addon-row" type="button" key={addon.name} onClick={() => toggleAddon(addon.name)}><span className={booking.addons.includes(addon.name) ? 'checkbox checkbox--checked' : 'checkbox'}>{booking.addons.includes(addon.name) ? <Check size={12} /> : null}</span><span>{addon.name}</span><strong>{addon.price}</strong></button>)}</div></section><section className="order-section"><h2><CalendarDays size={17} /> Jadwal</h2><FieldLabel label="Tanggal Acara"><input className="form-input" value={booking.date} onChange={(event) => setBooking((current) => ({ ...current, date: event.target.value }))} /></FieldLabel><div className="two-fields"><FieldLabel label="Tiba (Mulai)"><input className="form-input" value={booking.time} onChange={(event) => setBooking((current) => ({ ...current, time: event.target.value }))} /></FieldLabel><FieldLabel label="Selesai"><input className="form-input" value="02:00 PM" readOnly /></FieldLabel></div></section><section className="order-section"><h2><MapPin size={17} /> Lokasi Home Service</h2><div className="map-placeholder"><span>Lokasi Makeup</span><MapPin size={21} /></div><p className="address"><MapPin size={15} /><span><strong>Rumah (Utama)</strong><br />{booking.location}</span></p><button className="address-button" type="button">Ubah Alamat</button></section></main><footer className="checkout-footer"><div><small>Total Tagihan (DP 50%)</small><strong>{total}</strong></div><button className="booking-cta" type="button" onClick={() => navigate('/booking/berhasil')}>Lanjut ke Pembayaran</button></footer></div>
}

function ConfirmationPage({ booking }: { booking: BookingState }) {
  const navigate = useNavigate()
  return <div className="flow-page confirmation-page"><main className="confirmation-card"><div className="success-icon"><Check size={24} /></div><h1>Booking<br />Terkonfirmasi</h1><p>Terima kasih! Pesanan Anda telah berhasil dikonfirmasi dan diproses setelah diterima.</p><div className="booking-number"><small>NOMOR REFERENSI</small><strong>#RK-20231012</strong></div><div className="confirmation-detail"><div className="confirmation-artist"><img src={alviaPortfolio[0]} alt="Alvia Prameswari" /><div><strong>Bunga Lestari MUA</strong><span>Wedding Package · Platinum</span></div></div><p><CalendarDays size={14} /><span><small>Tanggal</small>24 Nov 2023</span><Clock3 size={14} /><span><small>Waktu</small>05:00 - 08:30 WIB</span></p><p><MapPin size={14} /><span><small>Lokasi</small>{booking.location}</span></p><div className="confirmation-total"><span>Total Dibayar (Deposit)</span><strong>Rp 2.500.000</strong></div></div><section className="next-steps"><h2>Langkah Selanjutnya</h2><p><Check size={14} /> MUA akan menghubungi Anda H-3 untuk konfirmasi detail.</p><p><Check size={14} /> Siapkan ruang rias dengan pencahayaan yang cukup.</p><p><Check size={14} /> Pelunasan dilakukan maksimal H-1 acara.</p></section><button className="primary-button" type="button" onClick={() => navigate('/kebutuhan-makeup')}>Lihat Detail Booking</button><div className="confirmation-actions"><button type="button"><CalendarDays size={15} /> Ke Kalender</button><button type="button" onClick={() => navigate('/')}>Beranda</button></div></main></div>
}

export default App
