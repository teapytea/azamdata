import { useCallback, useEffect, useState, type ReactNode, type SyntheticEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

type StitchScreenProps = {
  desktopScreenId?: string
  fallback: ReactNode
  screenId: string
  title: string
}

const customerNav: Record<string, string> = {
  akun: '/akun',
  beranda: '/',
  booking: '/booking-saya',
  cari: '/pencarian',
  favorit: '/favorit',
  pesan: '/pesan',
}

const muaNav: Record<string, string> = {
  beranda: '/mua/dashboard',
  dashboard: '/mua/dashboard',
  jadwal: '/mua/kalender',
  kalender: '/mua/kalender',
  keuangan: '/mua/pendapatan',
  paket: '/mua/paket',
  pendapatan: '/mua/pendapatan',
  pesanan: '/mua/permintaan',
  permintaan: '/mua/permintaan',
  profil: '/mua/verifikasi',
}

const adminNav: Record<string, string> = {
  bookings: '/admin/pesanan',
  content: '/admin/konten',
  dasbor: '/admin/verifikasi',
  dashboard: '/admin/verifikasi',
  kategori: '/admin/kategori',
  keuangan: '/admin/transaksi',
  komisi: '/admin/komisi',
  konten: '/admin/konten',
  lainnya: '/admin/konten',
  muas: '/admin/verifikasi',
  payments: '/admin/transaksi',
  pengguna: '/admin/pengguna',
  pesanan: '/admin/pesanan',
  promosi: '/admin/promosi',
  refund: '/admin/refund',
  settings: '/admin/wilayah',
  transaksi: '/admin/transaksi',
  ulasan: '/admin/ulasan',
  users: '/admin/pengguna',
  verifikasi: '/admin/verifikasi',
  wilayah: '/admin/wilayah',
}

const routeActions: Record<string, Array<[string, string]>> = {
  '/': [
    ['cari mua', '/kebutuhan-makeup'],
    ['cek ketersediaan', '/kebutuhan-makeup'],
    ['lihat semua', '/pencarian'],
  ],
  '/kebutuhan-makeup': [['lanjut', '/pencarian']],
  '/pencarian': [['lihat profil', '/mua/alya-lestri-artistry']],
  '/mua/alya-lestri-artistry': [
    ['pilih paket', '/checkout'],
    ['chat mua', '/pesan/chat'],
    ['tanya mua', '/pesan/chat'],
  ],
  '/checkout': [
    ['bayar', '/booking/berhasil'],
    ['lanjut', '/booking/berhasil'],
  ],
  '/booking/berhasil': [
    ['lihat detail', '/booking/detail'],
    ['beranda', '/'],
  ],
  '/booking-saya': [
    ['booking makeup', '/kebutuhan-makeup'],
    ['lihat detail', '/booking/detail'],
  ],
  '/booking-mendatang': [['lihat detail', '/booking/detail']],
  '/riwayat-booking': [['lihat detail', '/booking/detail']],
  '/booking/detail': [
    ['chat', '/pesan/chat'],
    ['tulis ulasan', '/ulasan'],
  ],
  '/pesan': [['alya', '/pesan/chat']],
  '/favorit': [['lihat profil', '/mua/alya-lestri-artistry']],
  '/akun': [
    ['pembayaran', '/pembayaran'],
    ['bantuan', '/bantuan'],
    ['keluar', '/masuk'],
  ],
  '/mua/onboarding': [['mulai', '/mua/onboarding/jadwal']],
  '/mua/onboarding/jadwal': [['lanjut', '/mua/onboarding/paket']],
  '/mua/onboarding/paket': [['lanjut', '/mua/onboarding/portfolio']],
  '/mua/onboarding/portfolio': [['lanjut', '/mua/onboarding/bisnis']],
  '/mua/onboarding/bisnis': [['dashboard', '/mua/dashboard']],
  '/mua/dashboard': [
    ['lihat semua', '/mua/permintaan'],
    ['kelola paket', '/mua/paket'],
    ['kelola portfolio', '/mua/portfolio'],
  ],
  '/mua/permintaan': [['lihat detail', '/mua/brief-pelanggan']],
  '/mua/kalender': [['lihat detail', '/mua/janji']],
  '/mua/janji': [['lihat detail', '/mua/brief-pelanggan']],
  '/mua/pesan': [['alya', '/mua/brief-pelanggan']],
  '/masuk': [
    ['lupa kata sandi', '/lupa-password'],
    ['daftar', '/daftar'],
  ],
  '/daftar': [
    ['masuk', '/masuk'],
    ['daftar', '/otp'],
  ],
  '/lupa-password': [['kirim', '/otp']],
  '/otp': [['verifikasi', '/']],
}

function normalize(value: string) {
  return value.replace(/\s+/g, ' ').trim().toLocaleLowerCase('id-ID')
}

function findNavigation(pathname: string, label: string, icon: string) {
  if (icon.includes('arrow_back') || label === 'kembali') return -1

  const action = routeActions[pathname]?.find(([match]) => label.includes(match))
  if (action) return action[1]

  const key = normalize(label || icon)
  const nav = pathname.startsWith('/admin/')
    ? adminNav
    : pathname.startsWith('/mua/')
      ? muaNav
      : customerNav

  return Object.entries(nav).find(([match]) => key === match || key.includes(match))?.[1]
}

export function StitchScreen({ desktopScreenId, fallback, screenId, title }: StitchScreenProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const [failed, setFailed] = useState(false)
  const [isDesktop, setIsDesktop] = useState(() => window.matchMedia('(min-width: 768px)').matches)

  useEffect(() => {
    const query = window.matchMedia('(min-width: 768px)')
    const update = (event: MediaQueryListEvent) => setIsDesktop(event.matches)
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])

  const bridge = useCallback((event: SyntheticEvent<HTMLIFrameElement>) => {
    const frame = event.currentTarget
    const document = frame.contentDocument
    if (!document) return

    document.documentElement.dataset.riaskitaRoute = location.pathname
    document.addEventListener('click', (clickEvent) => {
      const clicked = clickEvent.target as Element | null
      if (!clicked?.closest) return
      const control = clicked.closest('a, button')
      if (!control) return

      const label = normalize(control.textContent ?? '')
      const icon = normalize(
        Array.from(control.querySelectorAll('.material-symbols-outlined'))
          .map((element) => element.textContent ?? '')
          .join(' '),
      )
      const target = findNavigation(location.pathname, label, icon)

      if (target === -1) {
        clickEvent.preventDefault()
        navigate(-1)
      } else if (typeof target === 'string') {
        clickEvent.preventDefault()
        navigate(target)
      } else if (control.tagName === 'A' && control.getAttribute('href') === '#') {
        clickEvent.preventDefault()
      }
    })
  }, [location.pathname, navigate])

  if (failed) return fallback

  const activeScreenId = isDesktop && desktopScreenId ? desktopScreenId : screenId

  return (
    <div className="stitch-screen">
      <iframe
        className="stitch-screen__frame"
        key={activeScreenId}
        onError={() => setFailed(true)}
        onLoad={bridge}
        src={`/stitch/${activeScreenId}.html`}
        title={title}
      />
    </div>
  )
}
