import assert from 'node:assert/strict'
import test from 'node:test'
import {
  extractEmailAddress,
  hasPassingEmailAuthentication,
  parseBankEmail,
  parseCommerceEmail,
} from '../supabase/functions/_shared/bank-email-parser.mjs'

test('strict BCA parser extracts a successful IDR transaction', () => {
  const result = parseBankEmail({
    bank: 'bca',
    subject: 'Transaksi Berhasil',
    bodyText: `Status Transaksi: Berhasil
Jenis Transaksi: Pembayaran
Nominal: IDR 13,000.00
Tanggal & Waktu: 28 Jul 2026 13:45:00
Nomor Referensi: BCA123456
Nama Merchant: Example Store`,
  })
  assert.equal(result.outcome, 'processed')
  assert.equal(result.amountMinor, 1_300_000)
  assert.equal(result.currency, 'IDR')
  assert.equal(result.direction, 'debit')
  assert.equal(result.externalRef, 'BCA123456')
  assert.equal(result.occurredAt, '2026-07-28T06:45:00.000Z')
})

test('strict BSI parser understands Indonesian separators and month names', () => {
  const result = parseBankEmail({
    bank: 'bsi',
    subject: 'Notifikasi transaksi',
    bodyText: `Status: Sukses
Jenis Transaksi: Transfer Masuk
Nominal: Rp 15.000
Tanggal Transaksi: 3 Agu 2026 09:10
No. Referensi: BSI-ABC-99
Nama Penerima: Azam`,
  })
  assert.equal(result.outcome, 'processed')
  assert.equal(result.amountMinor, 1_500_000)
  assert.equal(result.direction, 'credit')
  assert.equal(result.occurredAt, '2026-08-03T02:10:00.000Z')
})

test('BCA QRIS uses the payee instead of Merchant PAN and the total paid amount', () => {
  const result = parseBankEmail({
    bank: 'bca',
    subject: 'Internet Transaction Journal',
    bodyText: `Status Transaksi : Berhasil
Tanggal Transaksi : 01 Agu 2026 09:23:27
Jenis Transaksi : Pembayaran QRIS
Pembayaran Ke : BENTO KOPI
Merchant PAN : 9360000915000000000
Nominal Bayar : IDR 52,000.00
Biaya : IDR 2,000.00
Total Bayar : IDR 54,000.00
Nomor Referensi : QRIS-123`,
  })
  assert.equal(result.outcome, 'processed')
  assert.equal(result.direction, 'debit')
  assert.equal(result.description, 'BENTO KOPI')
  assert.equal(result.amountMinor, 5_400_000)
})

test('BCA external transfer is recognized as an outgoing debit', () => {
  const result = parseBankEmail({
    bank: 'bca',
    subject: 'Internet Transaction Journal',
    bodyText: `Status Transaksi : Berhasil
Tanggal Transaksi : 01 Agu 2026 09:23:27
Jenis Transfer : Transfer ke BANK BRI
Rekening Tujuan : 1020012325814
Nama Penerima : ORI ARIFIN
Nominal : IDR 140,000.00
Biaya Admin : IDR 2,500.00
Total Debit : IDR 142,500.00
Nomor Referensi : TRANSFER-123`,
  })
  assert.equal(result.outcome, 'processed')
  assert.equal(result.direction, 'debit')
  assert.equal(result.description, 'ORI ARIFIN')
  assert.equal(result.amountMinor, 14_250_000)
})

test('BCA Transfer QRIS is recognized as an outgoing debit', () => {
  const result = parseBankEmail({
    bank: 'bca',
    subject: 'Internet Transaction Journal',
    bodyText: `Status : Berhasil
Tanggal Transaksi : 03 Jul 2026 00:51:37
Jenis Transaksi : Transfer QRIS
Nama Penerima : ADINDYA FEBRIANDANA
Nominal : IDR 15,000.00
No. Referensi : 9527120260703005137104QRS0800771966`,
  })
  assert.equal(result.outcome, 'processed')
  assert.equal(result.direction, 'debit')
  assert.equal(result.description, 'ADINDYA FEBRIANDANA')
  assert.equal(result.amountMinor, 1_500_000)
})

test('BCA GoPay top-up becomes an internal transfer with a separate fee', () => {
  const result = parseBankEmail({
    bank: 'bca',
    subject: 'Internet Transaction Journal',
    bodyText: `Status Transaksi : Berhasil
Tanggal Transaksi : 02 Agu 2026 12:30:00
Jenis Transaksi : Transfer ke BCA Virtual Account
Nama Perusahaan/Produk : PT DOMPET ANAK BANGSA / GOPAY TOPUP
Nominal : IDR 15,000.00
Biaya Admin : IDR 1,000.00
Total Debit : IDR 16,000.00
Nomor Referensi : GOPAY-123`,
  })
  assert.equal(result.outcome, 'processed')
  assert.equal(result.direction, 'transfer')
  assert.equal(result.counterpartAccountName, 'GoPay')
  assert.equal(result.amountMinor, 1_500_000)
  assert.equal(result.feeMinor, 100_000)
})

test('unknown or failed bank formats are not guessed', () => {
  const unknown = parseBankEmail({ bank: 'bca', subject: 'Pemberitahuan', bodyText: 'Nominal Rp 20.000' })
  const failed = parseBankEmail({ bank: 'bsi', subject: 'Transaksi gagal', bodyText: 'Status: Gagal' })
  assert.equal(unknown.outcome, 'needs_review')
  assert.equal(failed.outcome, 'ignored')
})

test('sender and authentication checks use raw verified evidence', () => {
  const raw = `Authentication-Results: mx.google.com;\n spf=pass smtp.mailfrom=bank.example;\n dkim=pass header.i=@bank.example;\n dmarc=pass header.from=bank.example\nFrom: Bank <notify@bank.example>\n\nBody`
  assert.equal(extractEmailAddress('Bank <Notify@Bank.Example>'), 'notify@bank.example')
  assert.equal(hasPassingEmailAuthentication(raw, 'notify@bank.example'), true)
  assert.equal(hasPassingEmailAuthentication(raw, 'notify@mail.bank.example'), true)
  assert.equal(hasPassingEmailAuthentication(raw, 'notify@unrelated.example'), false)
  assert.equal(hasPassingEmailAuthentication('Authentication-Results: spf=pass\n\nBody', 'notify@bank.example'), false)
})

test('Shopee only accepts shipped-order evidence and extracts its order code', () => {
  const shipped = parseCommerceEmail({
    provider: 'shopee',
    subject: 'Pesanan #2607315FS2DTDD Telah Dikirim',
    bodyText: 'Total Pembayaran: Rp 129.000\nWaktu Pemesanan: 31 Jul 2026 10:15',
  })
  const unrelated = parseCommerceEmail({ provider: 'shopee', subject: 'Promo 8.8', bodyText: 'Diskon hari ini' })
  assert.equal(shipped.outcome, 'needs_review')
  assert.equal(shipped.externalRef, '2607315FS2DTDD')
  assert.equal(shipped.amountMinor, 12_900_000)
  assert.equal(unrelated.outcome, 'ignored')
})

test('GoPay and Grab evidence stays in review until genuine templates and payment reconciliation are verified', () => {
  const gopay = parseCommerceEmail({
    provider: 'gopay',
    subject: 'Pembayaran berhasil',
    bodyText: 'Nominal: Rp 25.000\nID Transaksi: GP-123\nTanggal Transaksi: 4 Agu 2026 14:20\nNama Merchant: Kopi',
  })
  const grab = parseCommerceEmail({
    provider: 'grab',
    subject: 'Tanda terima perjalanan Grab',
    bodyText: 'Total: Rp 18.500\nBooking ID: GR-123\nTanggal Perjalanan: 4 Agu 2026 08:10',
  })
  assert.equal(gopay.outcome, 'needs_review')
  assert.equal(gopay.amountMinor, 2_500_000)
  assert.match(gopay.reason, /template needs validation/i)
  assert.equal(grab.outcome, 'needs_review')
  assert.match(grab.reason, /prevent double counting/i)
})
