// Uji firestore.rules lewat Firebase Rules test API (tanpa deploy): npm run test:rules
// Tiap kasus: harapan ALLOW/DENY. Jalankan setiap kali aturan diubah.
import fs from 'node:fs';
import { api, PROJECT } from './firebase-api.mjs';

const RULES = fs.readFileSync(new URL('../firestore.rules', import.meta.url), 'utf8');
const D = '/databases/(default)/documents';
const PEMILIK = 'I6owACv9yJZQndKJK2Aq7aSqagh2';
const WHO = { pemilik: PEMILIK, staf: 'UvWmcn4tGGWC0O12kpwkVzYmuqi1', asing: 'uidOrangAsing' };

function tc(name, expect, who, method, path, data = null) {
  const request = { auth: who ? { uid: WHO[who], token: {} } : null, method, path: `${D}/${path}` };
  if (data) request.resource = { data };
  return { name, c: { expectation: expect, request } };
}

const tx = { tipe: 'keluar', produkId: 'p1', varianId: 'v1', channel: 'Shopee', qty: 1, hargaSatuan: 100, tanggal: '2026-11-03' };
const produk = { nama: 'Semilir', varian: [] };

const cases = [
  // tanpa login
  tc('anonim baca produk', 'DENY', null, 'get', 'produk/p1'),
  tc('anonim tulis transaksi', 'DENY', null, 'create', 'transaksi/t1', tx),
  tc('anonim baca dokumen sistem lama', 'DENY', null, 'get', `toko/${PEMILIK}`),
  // akun asing (login tapi bukan pemilik/karyawan, mis. mendaftar sendiri)
  tc('asing baca produk', 'DENY', 'asing', 'get', 'produk/p1'),
  tc('asing daftar transaksi', 'DENY', 'asing', 'list', 'transaksi/t1'),
  tc('asing tulis transaksi', 'DENY', 'asing', 'create', 'transaksi/t1', tx),
  tc('asing tulis listing', 'DENY', 'asing', 'update', 'listing/v1', { produkId: 'p1', 'Shopee': 1 }),
  tc('asing tandai opname', 'DENY', 'asing', 'create', 'meta/opname', { selesaiAt: 'x' }),
  tc('asing baca dokumen sistem lama', 'DENY', 'asing', 'get', `toko/${PEMILIK}`),
  // karyawan: stok boleh
  tc('staf baca produk', 'ALLOW', 'staf', 'get', 'produk/p1'),
  tc('staf catat penjualan', 'ALLOW', 'staf', 'create', 'transaksi/t1', tx),
  tc('staf catat restock', 'ALLOW', 'staf', 'create', 'transaksi/t2', { ...tx, tipe: 'masuk' }),
  tc('staf koreksi minus', 'ALLOW', 'staf', 'create', 'transaksi/t3', { ...tx, tipe: 'koreksi', qty: -2 }),
  tc('staf penjualan qty minus', 'DENY', 'staf', 'create', 'transaksi/t4', { ...tx, qty: -1 }),
  tc('staf penjualan qty nol', 'DENY', 'staf', 'create', 'transaksi/t5', { ...tx, qty: 0 }),
  tc('staf tipe aneh', 'DENY', 'staf', 'create', 'transaksi/t6', { ...tx, tipe: 'hapus' }),
  tc('staf qty bukan angka', 'DENY', 'staf', 'create', 'transaksi/t7', { ...tx, qty: '5' }),
  tc('staf transaksi tanpa varian', 'DENY', 'staf', 'create', 'transaksi/t8', { ...tx, varianId: null }),
  tc('staf hapus transaksi', 'ALLOW', 'staf', 'delete', 'transaksi/t1'),
  tc('staf simpan produk', 'ALLOW', 'staf', 'update', 'produk/p1', produk),
  tc('staf produk tanpa nama', 'DENY', 'staf', 'update', 'produk/p1', { varian: [] }),
  tc('staf atur listing', 'ALLOW', 'staf', 'update', 'listing/v1', { produkId: 'p1', 'Shopee': 3, 'TikTok Shop': 2 }),
  tc('staf listing channel asing', 'DENY', 'staf', 'update', 'listing/v1', { produkId: 'p1', 'Lazada': 3 }),
  tc('staf listing bukan angka', 'DENY', 'staf', 'update', 'listing/v1', { produkId: 'p1', 'Shopee': 'banyak' }),
  tc('staf foto kecil', 'ALLOW', 'staf', 'create', 'foto/p1', { data: 'data:image/jpeg;base64,AAAA' }),
  tc('staf foto raksasa', 'DENY', 'staf', 'create', 'foto/p1', { data: 'x'.repeat(260000) }),
  tc('staf simpan kategori', 'ALLOW', 'staf', 'update', 'pengaturan/umum', { kategoriList: ['Top'] }),
  tc('staf tandai opname', 'ALLOW', 'staf', 'create', 'meta/opname', { selesaiAt: 'x' }),
  tc('staf tandai migrasi', 'DENY', 'staf', 'create', 'meta/migrasi', { selesai: true }),
  // karyawan: uang tertutup
  tc('staf baca pembukuan', 'DENY', 'staf', 'get', 'pembukuan/b1'),
  tc('staf daftar pembukuan', 'DENY', 'staf', 'list', 'pembukuan/b1'),
  tc('staf tulis pembukuan', 'DENY', 'staf', 'create', 'pembukuan/b1', { tipe: 'keluar', jumlah: 1 }),
  tc('staf hapus pembukuan', 'DENY', 'staf', 'delete', 'pembukuan/b1'),
  tc('staf baca pengaturan biaya', 'DENY', 'staf', 'get', 'keuangan/pengaturan'),
  tc('staf tulis pengaturan biaya', 'DENY', 'staf', 'update', 'keuangan/pengaturan', { kelompokBiayaList: [] }),
  // pemilik
  tc('pemilik baca pembukuan', 'ALLOW', 'pemilik', 'get', 'pembukuan/b1'),
  tc('pemilik tulis pembukuan', 'ALLOW', 'pemilik', 'create', 'pembukuan/b1', { tipe: 'keluar', jumlah: 1, ws: 'senantiasa' }),
  tc('pemilik tulis pengaturan biaya', 'ALLOW', 'pemilik', 'update', 'keuangan/pengaturan', { kelompokBiayaList: [] }),
  tc('pemilik tandai migrasi', 'ALLOW', 'pemilik', 'create', 'meta/migrasi', { selesai: true }),
  tc('pemilik baca dokumen sistem lama', 'ALLOW', 'pemilik', 'get', `toko/${PEMILIK}`),
  tc('staf baca dokumen sistem lama (aturan lama dipertahankan)', 'ALLOW', 'staf', 'get', `toko/${PEMILIK}`),
  tc('pemilik catat penjualan', 'ALLOW', 'pemilik', 'create', 'transaksi/t1', tx),
  // koleksi tak dikenal
  tc('koleksi tak dikenal ditolak', 'DENY', 'pemilik', 'create', 'sembarang/x', { a: 1 }),
];

const res = await api(`https://firebaserules.googleapis.com/v1/projects/${PROJECT}:test`, { method: 'POST', body: {
  source: { files: [{ name: 'firestore.rules', content: RULES }] },
  testSuite: { testCases: cases.map((x) => x.c) },
} });
if (res.issues?.length) { console.log('MASALAH SINTAKS:'); for (const i of res.issues) console.log(' ', i.severity, i.description, i.sourcePosition?.line); }
let bad = 0;
(res.testResults || []).forEach((r, i) => {
  const ok = r.state === 'SUCCESS';
  if (!ok) bad++;
  console.log(ok ? 'LULUS' : 'GAGAL', cases[i].c.expectation.padEnd(5), cases[i].name, ok ? '' : `\n      ${(r.debugMessages || []).join(' | ').slice(0, 300)} ${r.errorPosition ? 'baris ' + r.errorPosition.line : ''}`);
});
console.log(`\n${cases.length - bad}/${cases.length} lulus`);
if (bad || res.issues?.length) process.exit(1);
