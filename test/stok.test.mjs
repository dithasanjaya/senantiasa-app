import test from 'node:test';
import assert from 'node:assert/strict';
import { buatBackendMemori, buatPerangkat } from './harness.mjs';

async function tokoDengan(stokAwal, listing) {
  const b = buatBackendMemori();
  await b.tulis([
    { t: 'set', k: 'produk', id: 'p1', data: { nama: 'Semilir Outer Kebaya', kategori: 'Kebaya', koleksi: '', catatan: '', stokMinim: 1, createdAt: '2026-01-01', updatedAt: '2026-01-01',
      varian: [{ id: 'v1', ukuran: 'All', warna: 'Putih', stokAwal, hargaModal: 100000, hargaJual: 235000, hargaChannel: {} }] } },
    { t: 'set', k: 'listing', id: 'v1', data: { produkId: 'p1', ...listing } },
    { t: 'set', k: 'meta', id: 'migrasi', data: { selesai: true, perluOpname: false } },
  ]);
  return b;
}
const jual = (ch, qty = 1) => `tambahTransaksi({tipe:'keluar',produkId:'p1',varianId:'v1',channel:'${ch}',qty:${qty},hargaSatuan:235000,tanggal:'2026-11-03'})`;

test('kasus pemilik: 1 pcs fisik, listing 1 di Shopee & TikTok -> stok 1 (bukan 3), antrian kosong', async () => {
  const b = await tokoDengan(1, { 'Shopee': 1, 'TikTok Shop': 1 });
  const a = buatPerangkat(b); await a.mulai();
  assert.equal(a.api("hitungStok('p1','v1')"), 1);
  assert.equal(a.api('antrianSinkronSaatIni().length'), 0);
});

test('laku di Shopee -> stok 0, listing Shopee ikut 0 otomatis, TikTok masuk antrian (1 -> 0)', async () => {
  const b = await tokoDengan(1, { 'Shopee': 1, 'TikTok Shop': 1 });
  const a = buatPerangkat(b); await a.mulai();
  a.api(jual('Shopee'));
  assert.equal(a.api("hitungStok('p1','v1')"), 0);
  const q = JSON.parse(a.api('JSON.stringify(antrianSinkronSaatIni().map(x=>x.item))'));
  assert.deepEqual(q, [[{ channel: 'TikTok Shop', listing: 1, target: 0 }]]);
  a.api("sesuaikanListing('v1',['TikTok Shop'])");
  assert.equal(a.api('antrianSinkronSaatIni().length'), 0);
});

test('laku di Toko offline -> kedua marketplace perlu dikurangi', async () => {
  const b = await tokoDengan(1, { 'Shopee': 1, 'TikTok Shop': 1 });
  const a = buatPerangkat(b); await a.mulai();
  a.api(jual('Toko'));
  assert.equal(a.api('antrianSinkronSaatIni()[0].item.length'), 2);
  assert.equal(a.api('sesuaikanSemuaListing()'), 1);
  assert.equal(a.api('antrianSinkronSaatIni().length'), 0);
});

test('stok Shopee kosong tapi barang masih ada -> antrian minta NAIKKAN listing; tetap bisa dijual di TikTok', async () => {
  const b = await tokoDengan(3, { 'Shopee': 0, 'TikTok Shop': 3 });
  const a = buatPerangkat(b); await a.mulai();
  const q = JSON.parse(a.api('JSON.stringify(antrianSinkronSaatIni()[0].item)'));
  assert.deepEqual(q, [{ channel: 'Shopee', listing: 0, target: 3 }]);
  a.api(jual('TikTok Shop'));
  assert.equal(a.api("hitungStok('p1','v1')"), 2);
});

test('dua perangkat mencatat penjualan bersamaan -> tidak ada yang hilang', async () => {
  const b = await tokoDengan(5, { 'Shopee': 5, 'TikTok Shop': 5 });
  const hp = buatPerangkat(b), laptop = buatPerangkat(b, { uid: 'staf1', email: 'staf@test' });
  await hp.mulai(); await laptop.mulai();
  hp.api(jual('Shopee', 1));
  laptop.api(jual('Shopee', 2));
  await hp.tunggu(); await laptop.tunggu();
  assert.equal(hp.api("hitungStok('p1','v1')"), 2);
  assert.equal(laptop.api("hitungStok('p1','v1')"), 2);
  assert.equal(hp.api("listingVarian('v1','Shopee')"), 2);
  assert.equal(laptop.api("listingVarian('v1','Shopee')"), 2);
});

test('ubah & hapus transaksi mengembalikan stok dan listing', async () => {
  const b = await tokoDengan(5, { 'Shopee': 5, 'TikTok Shop': 5 });
  const a = buatPerangkat(b); await a.mulai();
  const id = a.api(jual('Shopee', 2) + '.id');
  assert.equal(a.api("hitungStok('p1','v1')"), 3);
  a.api(`ubahTransaksi('${id}',{qty:1})`);
  assert.equal(a.api("hitungStok('p1','v1')"), 4);
  assert.equal(a.api("listingVarian('v1','Shopee')"), 4);
  a.api(`ubahTransaksi('${id}',{channel:'Toko'})`);
  assert.equal(a.api("listingVarian('v1','Shopee')"), 5);
  a.api(`hapusTransaksi('${id}')`);
  assert.equal(a.api("hitungStok('p1','v1')"), 5);
  await a.tunggu();
  assert.equal(b.ekspor().transaksi.length, 0);
});

test('restock menaikkan stok fisik dan memunculkan antrian naik di kedua marketplace', async () => {
  const b = await tokoDengan(1, { 'Shopee': 1, 'TikTok Shop': 1 });
  const a = buatPerangkat(b); await a.mulai();
  a.api("tambahTransaksi({tipe:'masuk',produkId:'p1',varianId:'v1',channel:'Toko',qty:4,tanggal:'2026-11-03'})");
  assert.equal(a.api("hitungStok('p1','v1')"), 5);
  assert.equal(a.api('antrianSinkronSaatIni()[0].item.length'), 2);
});

test('opname: koreksi hanya untuk yang berbeda', async () => {
  const b = await tokoDengan(3, { 'Shopee': 3, 'TikTok Shop': 3 });
  const a = buatPerangkat(b); await a.mulai();
  assert.equal(a.api("terapkanOpname([{produkId:'p1',varianId:'v1',nyata:2}])"), 1);
  assert.equal(a.api("hitungStok('p1','v1')"), 2);
  assert.equal(a.api("terapkanOpname([{produkId:'p1',varianId:'v1',nyata:2}])"), 0);
});

test('simpanData: perubahan produk terkirim; entri pembukuan yang dihapus ikut terhapus di server', async () => {
  const b = await tokoDengan(1, {});
  await b.tulis([{ t: 'set', k: 'pembukuan', id: 'k1', data: { ws: 'senantiasa', tipe: 'keluar', jumlah: 5000, tanggal: '2026-11-01', kelompok: 'Operasional', rincian: 'Listrik' } }]);
  const a = buatPerangkat(b); await a.mulai();
  assert.equal(a.api('DATA.pembukuan.length'), 1);
  a.api('DATA.pembukuan = []; simpanData()');
  await a.tunggu();
  assert.equal(b.ekspor().pembukuan.length, 0);
  a.api("DATA.produk[0].nama = 'Baru'; simpanData()");
  await a.tunggu();
  assert.equal(b.ekspor().produk[0][1].nama, 'Baru');
});

test('karyawan tidak memuat atau menghapus pembukuan', async () => {
  const b = await tokoDengan(1, {});
  await b.tulis([{ t: 'set', k: 'pembukuan', id: 'k1', data: { ws: 'senantiasa', tipe: 'keluar', jumlah: 5000, tanggal: '2026-11-01', kelompok: 'x' } }]);
  const s = buatPerangkat(b, { uid: 'staf1', email: 's@t' }); await s.mulai();
  assert.equal(s.api('DATA.pembukuan.length'), 0);
  s.api("DATA.produk[0].nama = 'X'; simpanData()"); await s.tunggu();
  assert.equal(b.ekspor().pembukuan.length, 1);
});
