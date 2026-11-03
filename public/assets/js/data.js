// Lapisan data: simpan/muat dari localStorage, backup/restore JSON, dan helper hitung stok.
// Semua data hidup di browser (localStorage) -- tidak butuh server/internet. Karena itu WAJIB
// rutin "Unduh Cadangan" di menu Pengaturan supaya data tidak hilang kalau cache browser
// terhapus atau ganti komputer.

const STORAGE_KEY = 'senantiasa_inventory_v1';
// Tokopedia SENGAJA dikeluarkan dari daftar channel aktif (keputusan bisnis) -- baik dari
// pelacakan stok maupun pembukuan. Warna/logo-nya (KELAS_CHANNEL/CHANNEL_LOGO di ui.js)
// TETAP disimpan supaya transaksi lama yg masih menyebut "Tokopedia" (data sebelum
// perubahan ini) masih bisa tampil dgn benar -- cuma tidak lagi jadi pilihan utk data baru.
const CHANNEL_LIST = ['Toko', 'Shopee', 'TikTok Shop'];

// Link toko fisik & marketplace -- dipakai utk tombol "Buka Toko" & pengingat cek stok manual.
// Tidak ada koneksi/API ke platform ini, murni tautan pintasan (lihat catatan di PANDUAN.md).
const CHANNEL_LINK = {
  Shopee: 'https://shopee.co.id/senantiasa_',
  'TikTok Shop': 'https://www.tiktok.com/@senantiasa_?is_from_webapp=1&sender_device=pc'
};
const LOKASI_TOKO_MAPS = 'https://maps.app.goo.gl/MNizTHdhYiy6SAoW8';

const KATEGORI_DEFAULT = ['Top', 'Outer', 'Rok', 'Skirt', 'Bikini', 'Dress', 'Kebaya'];
const KOLEKSI_DEFAULT = ['Kasuari', 'Pesisir', 'Setala'];

// ---------- Pembukuan (cashflow) ----------
// Terpisah dari menu Transaksi (yg melacak PERGERAKAN BARANG) krn harga jual di transaksi
// tidak selalu = uang yg benar2 diterima (potongan platform, promo, ongkir, dst tidak tetap).
const CHANNEL_PEMBUKUAN = CHANNEL_LIST;
const KELOMPOK_BIAYA_DEFAULT = ['Operasional', 'Ongkos Jahit', 'Ongkos Kirim', 'Belanja Bahan'];
const RINCIAN_BIAYA_DEFAULT = {
  'Operasional': ['Listrik', 'Keamanan', 'WiFi', 'Sewa', 'Konsumsi', 'Lain-lain'],
  'Ongkos Jahit': ['Penjahit 1', 'Penjahit 2'],
  'Ongkos Kirim': [],
  'Belanja Bahan': ['Kain', 'Perlengkapan Jahit']
};

// ---------- Pembukuan workspace LAIN (di luar bisnis Senantiasa) ----------
// Dinda Personal Finance & Retro Gaming Space Seririt: pembukuan cashflow yg BERDIRI SENDIRI
// (data, kategori, & saldo tidak campur sama sekali dgn Senantiasa maupun satu sama lain --
// lihat DATA.pembukuanWs). Beda dgn pembukuan Senantiasa di atas: kategori "Uang Masuk" di sini
// JUGA bebas ditambah/dihapus user (kelompokMasukList), bukan tetap ikut daftar channel toko --
// krn kedua ini bukan bisnis online-shop yg jual lewat channel marketplace. Catatannya juga
// selalu per TANGGAL (bukan rekap per periode kayak "Uang Masuk" Senantiasa).
const PEMBUKUAN_WS_INFO = {
  dinda: {
    judul: 'Dinda Personal Finance',
    deskripsi: 'Cashflow keuangan pribadi Dinda per periode',
    kelompokMasukDefault: ['Gaji', 'Bonus/THR', 'Transfer Masuk', 'Lain-lain'],
    kelompokKeluarDefault: ['Belanja Harian', 'Tabungan', 'Cicilan/Utang', 'Hiburan', 'Transportasi', 'Kesehatan', 'Lain-lain']
  },
  retro: {
    judul: 'Retro Gaming Space Seririt',
    deskripsi: 'Cashflow usaha Retro Gaming Space Seririt per periode',
    kelompokMasukDefault: ['Sewa PS/Konsol', 'Penjualan Snack/Minuman', 'Top Up/Voucher Game', 'Lain-lain'],
    kelompokKeluarDefault: ['Sewa Tempat', 'Listrik & Internet', 'Perawatan Alat', 'Belanja Stok Snack', 'Gaji Penjaga', 'Lain-lain']
  }
};
const DAFTAR_WS_PEMBUKUAN = Object.keys(PEMBUKUAN_WS_INFO);

function wsPembukuanKosong(wsId) {
  const info = PEMBUKUAN_WS_INFO[wsId];
  return {
    list: [],
    kelompokMasukList: [...info.kelompokMasukDefault],
    rincianMasuk: {},
    kelompokKeluarList: [...info.kelompokKeluarDefault],
    rincianKeluar: {}
  };
}

// DATA = cerminan (mirror) dari Firestore di memori. Diisi oleh penyimpanan.js lewat listener
// realtime; JANGAN diisi manual dari localStorage lagi. Ubah data lewat fungsi di penyimpanan.js
// (tambahTransaksi, simpanData, dst) supaya tersimpan ke server.
let DATA = dataKosong();

function buatId(prefix) {
  return (prefix ? prefix + '_' : '') + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function dataKosong() {
  const pembukuanWs = {};
  DAFTAR_WS_PEMBUKUAN.forEach(wsId => { pembukuanWs[wsId] = wsPembukuanKosong(wsId); });
  return {
    produk: [],
    transaksi: [],
    listing: {},      // { varianId: { produkId, Shopee: n, 'TikTok Shop': n } } -- angka yg tertera di marketplace
    pembukuan: [],
    pembukuanWs,
    meta: { migrasi: null, opname: null },
    pengaturan: {
      cekStok: {}, kategoriList: [...KATEGORI_DEFAULT], koleksiList: [...KOLEKSI_DEFAULT],
      kelompokBiayaList: [...KELOMPOK_BIAYA_DEFAULT], rincianBiaya: JSON.parse(JSON.stringify(RINCIAN_BIAYA_DEFAULT))
    }
  };
}

function pastikanPengaturanLengkap(pengaturan) {
  pengaturan = pengaturan || {};
  pengaturan.kategoriList = (pengaturan.kategoriList && pengaturan.kategoriList.length) ? pengaturan.kategoriList : [...KATEGORI_DEFAULT];
  pengaturan.koleksiList = (pengaturan.koleksiList && pengaturan.koleksiList.length) ? pengaturan.koleksiList : [...KOLEKSI_DEFAULT];
  pengaturan.kelompokBiayaList = (pengaturan.kelompokBiayaList && pengaturan.kelompokBiayaList.length) ? pengaturan.kelompokBiayaList : [...KELOMPOK_BIAYA_DEFAULT];
  pengaturan.rincianBiaya = pengaturan.rincianBiaya || {};
  pengaturan.kelompokBiayaList.forEach(k => {
    if (!Array.isArray(pengaturan.rincianBiaya[k])) pengaturan.rincianBiaya[k] = [...(RINCIAN_BIAYA_DEFAULT[k] || [])];
  });
  return pengaturan;
}

function pastikanPembukuanWsLengkap(data) {
  data.pembukuanWs = data.pembukuanWs || {};
  DAFTAR_WS_PEMBUKUAN.forEach(wsId => {
    const info = PEMBUKUAN_WS_INFO[wsId];
    const ws = data.pembukuanWs[wsId] = data.pembukuanWs[wsId] || wsPembukuanKosong(wsId);
    ws.list = ws.list || [];
    ws.kelompokMasukList = (ws.kelompokMasukList && ws.kelompokMasukList.length) ? ws.kelompokMasukList : [...info.kelompokMasukDefault];
    ws.rincianMasuk = ws.rincianMasuk || {};
    ws.kelompokKeluarList = (ws.kelompokKeluarList && ws.kelompokKeluarList.length) ? ws.kelompokKeluarList : [...info.kelompokKeluarDefault];
    ws.rincianKeluar = ws.rincianKeluar || {};
  });
}

// ---------- Role: pemilik vs karyawan ----------
// Pemilik = satu uid tetap. Sejak versi online baru, pembedanya JUGA ditegakkan di firestore.rules
// (koleksi pembukuan & keuangan hanya bisa dibaca pemilik), bukan cuma disembunyikan di tampilan.
const OWNER_UID = 'I6owACv9yJZQndKJK2Aq7aSqagh2';
function penggunaSaatIni() {
  return (window.firebaseAuth && window.firebaseAuth.currentUser()) || null;
}
function apakahPemilik() {
  const user = penggunaSaatIni();
  return !!user && user.uid === OWNER_UID;
}

// ---------- Helper pencarian ----------
function cariProduk(id) { return DATA.produk.find(p => p.id === id) || null; }
function cariVarian(produkId, varianId) {
  const p = cariProduk(produkId);
  if (!p) return null;
  return p.varian.find(v => v.id === varianId) || null;
}

// ---------- Harga per channel (opsional per varian, fallback ke hargaJual umum) ----------
function hargaVarianUntukChannel(v, channel) {
  const override = v.hargaChannel && v.hargaChannel[channel];
  return (override !== undefined && override !== null && override !== '') ? override : (v.hargaJual || 0);
}

// Total stok satu channel, dijumlah dari semua produk & varian -- dipakai di Overview.

// Daftar kategori/koleksi utk chip filter = gabungan master list (dari Pengaturan) + nilai
// apa pun yg sudah terpakai di data produk (jaga2 kalau ada nilai lama di luar master list).
function kategoriTerpakai() {
  const set = new Set(DATA.pengaturan.kategoriList);
  DATA.produk.forEach(p => { if (p.kategori) set.add(p.kategori); });
  return Array.from(set).sort();
}

function koleksiTerpakai() {
  const set = new Set(DATA.pengaturan.koleksiList);
  DATA.produk.forEach(p => { if (p.koleksi) set.add(p.koleksi); });
  return Array.from(set).sort();
}

// Karakter "|" sengaja dibuang dari SEMUA nama kelompok/rincian/kategori/koleksi (bukan cuma
// dirapikan) krn nama-nama ini disambung pakai "|" jadi satu string di atribut data-* tombol
// hapus/tambah di Pengaturan (mis. data-hapus-rincian="Operasional|Listrik") lalu dibongkar lagi
// pakai .split('|') -- kalau namanya sendiri mengandung "|", potongannya jadi salah/ke-truncate.
function bersihkanNamaKlasifikasi(s) {
  return (s || '').replace(/\|/g, '-').trim();
}

function tambahKlasifikasi(daftarKey, nilai) {
  nilai = bersihkanNamaKlasifikasi(nilai);
  if (!nilai) return false;
  const list = DATA.pengaturan[daftarKey];
  if (list.some(x => x.toLowerCase() === nilai.toLowerCase())) return false;
  list.push(nilai);
  simpanData();
  return true;
}

function hapusKlasifikasi(daftarKey, nilai) {
  DATA.pengaturan[daftarKey] = DATA.pengaturan[daftarKey].filter(x => x !== nilai);
  simpanData();
}

// ---------- Kelompok Biaya & Rincian (dipakai Pembukuan) ----------
// Sama pola dgn kategoriTerpakai/koleksiTerpakai di atas: gabungan master list + nilai apa pun
// yg sudah terpakai di catatan pembukuan (jaga2 kalau kelompok/rincian-nya sudah dihapus dari
// master list tapi masih ada di catatan lama).
function kelompokBiayaTerpakai() {
  const set = new Set(DATA.pengaturan.kelompokBiayaList);
  DATA.pembukuan.forEach(x => { if (x.kelompok) set.add(x.kelompok); });
  return Array.from(set);
}

function rincianBiayaTerpakai(kelompok) {
  const set = new Set(DATA.pengaturan.rincianBiaya[kelompok] || []);
  DATA.pembukuan.forEach(x => { if (x.kelompok === kelompok && x.rincian) set.add(x.rincian); });
  return Array.from(set);
}

function tambahRincianBiaya(kelompok, nilai) {
  nilai = bersihkanNamaKlasifikasi(nilai);
  if (!nilai || !kelompok) return false;
  if (!DATA.pengaturan.rincianBiaya[kelompok]) DATA.pengaturan.rincianBiaya[kelompok] = [];
  const list = DATA.pengaturan.rincianBiaya[kelompok];
  if (list.some(x => x.toLowerCase() === nilai.toLowerCase())) return false;
  list.push(nilai);
  simpanData();
  return true;
}

function hapusRincianBiaya(kelompok, nilai) {
  if (!DATA.pengaturan.rincianBiaya[kelompok]) return;
  DATA.pengaturan.rincianBiaya[kelompok] = DATA.pengaturan.rincianBiaya[kelompok].filter(x => x !== nilai);
  simpanData();
}

function hapusKelompokBiaya(nilai) {
  hapusKlasifikasi('kelompokBiayaList', nilai);
  delete DATA.pengaturan.rincianBiaya[nilai];
  simpanData();
}

// ---------- Ringkasan Pembukuan (cashflow) ----------
// Entri "masuk" adalah REKAP satu periode (bukan satu transaksi) -- dianggap "masuk rentang
// [dari,sampai]" kalau periodenya bersinggungan (overlap) dgn rentang tsb, nilainya diambil
// utuh (tidak dipro-rata harian) krn ini rekap kasar, bukan pembukuan akuntansi presisi.
function pembukuanDalamRentang(dari, sampai) {
  return DATA.pembukuan.filter(x => {
    if (x.tipe === 'masuk') return x.periodeDari <= sampai && x.periodeSampai >= dari;
    return x.tanggal >= dari && x.tanggal <= sampai;
  });
}

function totalPembukuan(dari, sampai) {
  const list = pembukuanDalamRentang(dari, sampai);
  const masuk = list.filter(x => x.tipe === 'masuk').reduce((a, x) => a + (x.jumlah || 0), 0);
  const keluar = list.filter(x => x.tipe === 'keluar').reduce((a, x) => a + (x.jumlah || 0), 0);
  return { masuk, keluar, bersih: masuk - keluar, list };
}

// ---------- Ringkasan Pembukuan workspace lain (Dinda Personal Finance, Retro Gaming) ----------
// Sama pola dgn kelompokBiayaTerpakai/rincianBiayaTerpakai/pembukuanDalamRentang/totalPembukuan
// di atas (khusus Senantiasa), cuma diparameterkan by wsId & mendukung tipe 'masuk'/'keluar'
// dua-duanya (bukan cuma 'keluar') krn kategorinya sama2 bebas diedit di kedua workspace ini.
function wsPembukuan(wsId) { return DATA.pembukuanWs[wsId]; }

function wsKelompokTerpakai(wsId, tipe) {
  const ws = wsPembukuan(wsId);
  const key = tipe === 'masuk' ? 'kelompokMasukList' : 'kelompokKeluarList';
  const set = new Set(ws[key]);
  ws.list.forEach(x => { if (x.tipe === tipe && x.kelompok) set.add(x.kelompok); });
  return Array.from(set);
}

function wsRincianTerpakai(wsId, tipe, kelompok) {
  const ws = wsPembukuan(wsId);
  const rincianKey = tipe === 'masuk' ? 'rincianMasuk' : 'rincianKeluar';
  const set = new Set(ws[rincianKey][kelompok] || []);
  ws.list.forEach(x => { if (x.tipe === tipe && x.kelompok === kelompok && x.rincian) set.add(x.rincian); });
  return Array.from(set);
}

function wsTambahKelompok(wsId, tipe, nilai) {
  nilai = bersihkanNamaKlasifikasi(nilai);
  if (!nilai) return false;
  const ws = wsPembukuan(wsId);
  const key = tipe === 'masuk' ? 'kelompokMasukList' : 'kelompokKeluarList';
  if (ws[key].some(x => x.toLowerCase() === nilai.toLowerCase())) return false;
  ws[key].push(nilai);
  simpanData();
  return true;
}

function wsHapusKelompok(wsId, tipe, nilai) {
  const ws = wsPembukuan(wsId);
  const key = tipe === 'masuk' ? 'kelompokMasukList' : 'kelompokKeluarList';
  const rincianKey = tipe === 'masuk' ? 'rincianMasuk' : 'rincianKeluar';
  ws[key] = ws[key].filter(x => x !== nilai);
  delete ws[rincianKey][nilai];
  simpanData();
}

function wsTambahRincian(wsId, tipe, kelompok, nilai) {
  nilai = bersihkanNamaKlasifikasi(nilai);
  if (!nilai || !kelompok) return false;
  const ws = wsPembukuan(wsId);
  const rincianKey = tipe === 'masuk' ? 'rincianMasuk' : 'rincianKeluar';
  if (!ws[rincianKey][kelompok]) ws[rincianKey][kelompok] = [];
  const list = ws[rincianKey][kelompok];
  if (list.some(x => x.toLowerCase() === nilai.toLowerCase())) return false;
  list.push(nilai);
  simpanData();
  return true;
}

function wsHapusRincian(wsId, tipe, kelompok, nilai) {
  const ws = wsPembukuan(wsId);
  const rincianKey = tipe === 'masuk' ? 'rincianMasuk' : 'rincianKeluar';
  if (!ws[rincianKey][kelompok]) return;
  ws[rincianKey][kelompok] = ws[rincianKey][kelompok].filter(x => x !== nilai);
  simpanData();
}

// Beda dgn pembukuanDalamRentang Senantiasa: di sini "Uang Masuk" JUGA per tanggal tunggal
// (bukan rekap periode), jadi cukup filter x.tanggal biasa utk kedua tipe.
function wsPembukuanDalamRentang(wsId, dari, sampai) {
  return wsPembukuan(wsId).list.filter(x => x.tanggal >= dari && x.tanggal <= sampai);
}

function wsTotalPembukuan(wsId, dari, sampai) {
  const list = wsPembukuanDalamRentang(wsId, dari, sampai);
  const masuk = list.filter(x => x.tipe === 'masuk').reduce((a, x) => a + (x.jumlah || 0), 0);
  const keluar = list.filter(x => x.tipe === 'keluar').reduce((a, x) => a + (x.jumlah || 0), 0);
  return { masuk, keluar, bersih: masuk - keluar, list };
}

