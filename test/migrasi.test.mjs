import test from 'node:test';
import assert from 'node:assert/strict';
import { buatBackendMemori, buatPerangkat } from './harness.mjs';

// Data sistem lama: stok terpisah per channel; Semilir fisik 1 pcs di-input 1 di Shopee & 1 di TikTok.
const lama = {
  produk: [
    { id: 'pS', nama: 'Semilir', kategori: 'Kebaya', koleksi: '', catatan: '', stokMinim: 1, createdAt: '2026-01-01', updatedAt: '2026-01-01',
      varian: [{ id: 'vS', ukuran: 'All', warna: 'Putih', stokAwal: { Toko: 1, Shopee: 1, 'TikTok Shop': 1 }, hargaModal: 1, hargaJual: 2, hargaChannel: {} }] },
    { id: 'pT', nama: 'Tulip', kategori: 'Top', koleksi: '', catatan: '', stokMinim: 3, createdAt: '2026-01-02', updatedAt: '2026-01-02',
      varian: [{ id: 'vT', ukuran: 'M', warna: '-', stokAwal: 5, hargaModal: 1, hargaJual: 2 }] } // format paling lama: angka tunggal
  ],
  transaksi: [
    { id: 't1', tipe: 'keluar', produkId: 'pT', varianId: 'vT', channel: 'Toko', qty: 2, hargaSatuan: 100, tanggal: '2026-10-01', createdAt: '2026-10-01T00:00:00Z' },
    { id: 't2', tipe: 'koreksi', produkId: 'pS', varianId: 'vS', channel: 'Shopee', qty: -1, catatan: 'Pindah', tanggal: '2026-10-02', createdAt: '2026-10-02T00:00:00Z' },
    { id: 't3', tipe: 'koreksi', produkId: 'pS', varianId: 'vS', channel: 'Toko', qty: 1, catatan: 'Pindah', tanggal: '2026-10-02', createdAt: '2026-10-02T00:00:01Z' },
  ],
  pembukuan: [{ id: 'b1', tipe: 'masuk', sumber: 'Shopee', jumlah: 1000, periodeDari: '2026-10-01', periodeSampai: '2026-10-07' }],
  pembukuanWs: { dinda: { list: [{ id: 'd1', tipe: 'keluar', jumlah: 50, tanggal: '2026-10-03', kelompok: 'Belanja Harian' }] } },
  pengaturan: { kategoriList: ['Top', 'Kebaya'], koleksiList: ['Setala'], kelompokBiayaList: ['Operasional'], rincianBiaya: { Operasional: ['Listrik'] }, lastBackupAt: 'x' }
};

test('migrasi: stok fisik ditebak dari channel terbesar, listing = angka lama, data lama tak diubah', async () => {
  const b = buatBackendMemori({ dokumenLama: lama });
  const dok = JSON.stringify(lama);
  const a = buatPerangkat(b); await a.mulai();
  assert.equal(a.api('DATA.meta.migrasi'), null);
  assert.ok(await a.api('bacaDataLama()'));
  const jumlah = await a.api(`jalankanMigrasi(${JSON.stringify(lama)})`);
  assert.deepEqual(JSON.parse(JSON.stringify(jumlah)), { produk: 2, varian: 2, transaksi: 3, pembukuan: 1 });
  await a.tunggu();
  assert.equal(a.api("hitungStok('pS','vS')"), 2);   // tebakan = channel terbesar (Toko 2 setelah pindah stok), BUKAN jumlah 3; dikonfirmasi lewat opname
  assert.equal(a.api("hitungStok('pT','vT')"), 3);   // 5 - 2
  assert.equal(a.api("listingVarian('vS','Shopee')"), 0);
  assert.equal(a.api("listingVarian('vS','TikTok Shop')"), 1);
  assert.equal(a.api('perluOpname()'), true);
  assert.equal(a.api('DATA.pembukuan.length'), 1);
  assert.equal(a.api('DATA.pembukuanWs.dinda.list.length'), 1);
  assert.equal(a.api("DATA.pengaturan.kategoriList.join()"), 'Top,Kebaya');
  assert.equal(JSON.stringify(lama), dok);
  a.api('tandaiOpnameSelesai()');
  assert.equal(a.api('perluOpname()'), false);
});

test('migrasi yang terputus (data tertulis, penanda belum) aman diulang tanpa menggandakan', async () => {
  const b = buatBackendMemori({ dokumenLama: lama });
  const a = buatPerangkat(b); await a.mulai();
  await a.api(`jalankanMigrasi(${JSON.stringify(lama)})`);
  await b.tulis([{ t: 'hapus', k: 'meta', id: 'migrasi' }]); // seolah terputus sebelum penanda tertulis
  await a.api(`jalankanMigrasi(${JSON.stringify(lama)})`);
  const e = b.ekspor();
  assert.equal(e.transaksi.length, 3);
  assert.equal(e.produk.length, 2);
  assert.equal(e.pembukuan.length, 2);
});

test('migrasi: transaksi lama yang janggal (qty 0 / negatif) disaring dan stok tetap konsisten dengan riwayat', async () => {
  const kotor = JSON.parse(JSON.stringify(lama));
  kotor.transaksi.push(
    { id: 'x0', tipe: 'keluar', produkId: 'pT', varianId: 'vT', channel: 'Toko', qty: 0, tanggal: '2026-10-05' },
    { id: 'x1', tipe: 'keluar', produkId: 'pT', varianId: 'vT', channel: 'Toko', qty: -1, tanggal: '2026-10-05' }, // dianggap 1 keluar
    { id: 'x2', tipe: 'aneh', produkId: 'pT', varianId: 'vT', channel: 'Toko', qty: 4, tanggal: '2026-10-05' }
  );
  const b = buatBackendMemori({ dokumenLama: kotor });
  const a = buatPerangkat(b); await a.mulai();
  const jumlah = await a.api(`jalankanMigrasi(${JSON.stringify(kotor)})`);
  assert.equal(jumlah.transaksi, 4); // t1,t2,t3 + x1
  await a.tunggu();
  assert.ok(b.ekspor().transaksi.every(([, t]) => (t.tipe === 'koreksi' ? t.qty !== 0 : t.qty > 0)));
  assert.equal(a.api("hitungStok('pT','vT')"), 2); // tebakan Toko = 5-2-1 = 2
});

test('migrasi ditolak kalau server sudah punya penanda (walau cache perangkat masih kosong)', async () => {
  const b = buatBackendMemori({ dokumenLama: lama });
  const hp = buatPerangkat(b); await hp.mulai();
  const laptop = buatPerangkat(b); await laptop.mulai();
  await laptop.api(`jalankanMigrasi(${JSON.stringify(lama)})`);
  await laptop.tunggu();
  laptop.api("tambahTransaksi({tipe:'keluar',produkId:'pT',varianId:'vT',channel:'Toko',qty:1,hargaSatuan:1,tanggal:'2026-11-03'})");
  laptop.api("hapusProduk('pS')");
  await laptop.tunggu();
  const sebelum = JSON.stringify(b.ekspor());
  hp.api('DATA.meta.migrasi = null'); // perangkat dgn cache lama: mengira belum dimigrasi
  let kode = null;
  try { await hp.api(`jalankanMigrasi(${JSON.stringify(lama)})`); } catch (e) { kode = e.code; }
  assert.equal(kode, 'sudah-dimigrasi');
  assert.equal(JSON.stringify(b.ekspor()), sebelum); // tidak ada yang tertimpa, produk yang dihapus tidak hidup lagi
});

test('migrasi menolak berjalan saat offline (tidak bisa memastikan ke server)', async () => {
  const b = buatBackendMemori({ dokumenLama: lama, offline: true });
  const a = buatPerangkat(b); await a.mulai();
  let kode = null;
  try { await a.api(`jalankanMigrasi(${JSON.stringify(lama)})`); } catch (e) { kode = e.code; }
  assert.equal(kode, 'unavailable');
  assert.equal(b.ekspor().produk.length, 0);
});
