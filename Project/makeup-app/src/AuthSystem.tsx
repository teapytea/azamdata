import { useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Bell, Check, CircleAlert, LoaderCircle, Mail, RefreshCw, SearchX, ShieldCheck } from 'lucide-react'

function AuthHeader() {
  const navigate = useNavigate()
  return <header className="auth-header"><button className="icon-button" type="button" aria-label="Kembali" onClick={() => navigate(-1)}><ArrowLeft size={19} /></button><strong>RiasKita</strong><span /></header>
}

function AuthLayout({ children }: { children: ReactNode }) {
  return <div className="auth-page"><AuthHeader /><main className="auth-card">{children}</main></div>
}

export function SignIn() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const submit = () => { if (!email.includes('@') || password.length < 6) { setError('Masukkan email dan kata sandi yang valid.'); return } navigate('/') }
  return <AuthLayout><section className="auth-intro"><span>RiasKita</span><h1>Masuk ke akun Anda</h1><p>Kelola booking dan temukan MUA untuk momen spesial Anda.</p></section><div className="auth-fields"><label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="nama@email.com" /></label><label>Kata Sandi<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Minimal 6 karakter" /></label>{error ? <p className="auth-error">{error}</p> : null}<button className="text-button auth-forgot" type="button" onClick={() => navigate('/lupa-password')}>Lupa kata sandi?</button><button className="primary-button" type="button" onClick={submit}>Masuk</button></div><p className="auth-switch">Belum punya akun? <button type="button" onClick={() => navigate('/daftar')}>Daftar</button></p></AuthLayout>
}

export function SignUp() {
  const navigate = useNavigate()
  const [agreed, setAgreed] = useState(false)
  return <AuthLayout><section className="auth-intro"><span>RiasKita</span><h1>Buat akun baru</h1><p>Mulai mencari MUA dan mengatur booking Anda.</p></section><div className="auth-fields"><label>Nama Lengkap<input placeholder="Nama Anda" /></label><label>Email<input type="email" placeholder="nama@email.com" /></label><label>Nomor WhatsApp<input type="tel" placeholder="08xx xxxx xxxx" /></label><label>Kata Sandi<input type="password" placeholder="Minimal 6 karakter" /></label><label className="auth-checkbox"><input type="checkbox" checked={agreed} onChange={(event) => setAgreed(event.target.checked)} /> Saya menyetujui Syarat & Ketentuan</label><button className="primary-button" type="button" disabled={!agreed} onClick={() => navigate('/otp')}>Daftar</button></div><p className="auth-switch">Sudah punya akun? <button type="button" onClick={() => navigate('/masuk')}>Masuk</button></p></AuthLayout>
}

export function ForgotPassword() {
  const navigate = useNavigate()
  const [sent, setSent] = useState(false)
  return <AuthLayout><section className="auth-intro"><span>RiasKita</span><h1>Lupa kata sandi?</h1><p>Masukkan email yang terdaftar. Kami akan mengirim kode verifikasi.</p></section><div className="auth-fields"><label>Email<input type="email" placeholder="nama@email.com" /></label>{sent ? <p className="auth-success">Kode verifikasi telah dikirim.</p> : null}<button className="primary-button" type="button" onClick={() => { setSent(true); navigate('/otp') }}>Kirim Kode</button></div><p className="auth-switch"><button type="button" onClick={() => navigate('/masuk')}>Kembali ke masuk</button></p></AuthLayout>
}

export function OtpVerification() {
  const navigate = useNavigate()
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const verify = () => { if (code.length !== 6) { setError('Masukkan 6 digit kode verifikasi.'); return } navigate('/') }
  return <AuthLayout><section className="auth-intro otp-intro"><span className="otp-icon"><Mail size={22} /></span><h1>Verifikasi nomor Anda</h1><p>Kode verifikasi sudah dikirim melalui WhatsApp.</p></section><div className="auth-fields"><label className="otp-input-label">Kode Verifikasi<input value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))} inputMode="numeric" placeholder="000000" /></label>{error ? <p className="auth-error">{error}</p> : null}<button className="primary-button" type="button" onClick={verify}>Verifikasi</button><button className="text-button" type="button">Kirim ulang kode</button></div></AuthLayout>
}

export function Notifications() {
  const [items, setItems] = useState([{ id: 1, title: 'Booking dikonfirmasi', text: 'Bunga Lestari MUA telah menerima booking Anda.', read: false }, { id: 2, title: 'Waktunya melakukan pelunasan', text: 'Pelunasan booking #RK-20231012 jatuh tempo besok.', read: false }, { id: 3, title: 'Ulasan Anda diterbitkan', text: 'Terima kasih telah membagikan pengalaman Anda.', read: true }])
  return <div className="dashboard-page notifications-page"><header className="dashboard-header"><div><span className="header-spacer" /><strong>Notifikasi</strong><button className="icon-button" type="button" aria-label="Tandai semua dibaca" onClick={() => setItems((current) => current.map((item) => ({ ...item, read: true })))}><Check size={18} /></button></div></header><main className="dashboard-content"><div className="notification-filter"><button className="segment-control__active" type="button">Semua</button><button type="button">Belum Dibaca</button></div><section className="notification-list">{items.map((item) => <button className={item.read ? 'notification-row' : 'notification-row notification-row--new'} type="button" key={item.id} onClick={() => setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, read: true } : entry))}><span><Bell size={17} /></span><div><strong>{item.title}</strong><p>{item.text}</p><small>Hari ini, 10:24</small></div>{!item.read ? <i /> : null}</button>)}</section></main></div>
}

export function SystemStates() {
  const [state, setState] = useState<'loading' | 'empty' | 'error'>('loading')
  const content = state === 'loading' ? <><LoaderCircle className="system-spinner" size={34} /><h1>Memuat data</h1><p>Sedang menyiapkan informasi terbaru.</p></> : state === 'empty' ? <><SearchX size={34} /><h1>Belum ada data</h1><p>Data akan muncul saat aktivitas tersedia.</p></> : <><CircleAlert size={34} /><h1>Terjadi gangguan</h1><p>Informasi tidak dapat dimuat saat ini.</p><button className="primary-button" type="button" onClick={() => setState('loading')}><RefreshCw size={16} /> Coba Lagi</button></>
  return <div className="system-page"><div className="state-switch"><button className={state === 'loading' ? 'active' : ''} type="button" onClick={() => setState('loading')}>Loading</button><button className={state === 'empty' ? 'active' : ''} type="button" onClick={() => setState('empty')}>Kosong</button><button className={state === 'error' ? 'active' : ''} type="button" onClick={() => setState('error')}>Error</button></div><section className={`system-state system-state--${state}`}>{content}</section></div>
}

export function NotFound() {
  const navigate = useNavigate()
  return <div className="system-page"><section className="system-state"><ShieldCheck size={36} /><h1>Halaman tidak ditemukan</h1><p>Alamat yang Anda buka tidak tersedia di RiasKita.</p><button className="primary-button" type="button" onClick={() => navigate('/')}>Kembali ke Beranda</button></section></div>
}
