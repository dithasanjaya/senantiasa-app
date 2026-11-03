// Penyimpanan online (Firestore) -- menggantikan localStorage + satu dokumen raksasa.
//
// Bentuk data di server (tiap catatan = SATU dokumen, jadi dua perangkat yg mencatat bersamaan
// tidak saling menimpa):
//   produk/{id}          info produk + varian (nama, ukuran, warna, saldo awal, harga)
//   transaksi/{id}       satu mutasi stok (masuk / keluar / koreksi); stok fisik dihitung dari sini
//   listing/{varianId}   angka stok yg tertera di Shopee & TikTok Shop
//   foto/{produkId}      foto produk (JPEG kecil, base64)
//   pengaturan/umum      daftar kategori & koleksi
//   pembukuan/{id}       catatan uang (HANYA pemilik)       -> field ws: senantiasa | dinda | retro
//   keuangan/pengaturan  kelompok biaya & kategori pembukuan (HANYA pemilik)
//   meta/migrasi, meta/opname
//
// DATA (data.js) adalah cerminan di memori yg diisi listener realtime. Ubah data lewat fungsi di
// bawah; tulisan ke server dikirim di belakang layar dan Firestore menyimpannya dulu di perangkat
// kalau sedang offline, lalu mengirimnya begitu internet kembali.
//
// BACKEND (disediakan firebase-init.js atau backend-lokal.js) punya antarmuka:
//   dengar(koleksi, cb(docs[{id,data}], {lokal}), errCb) -> fungsi berhenti
//   tulis(ops) -> Promise      ops: {t:'set'|'gabung'|'hapus'|'tambah', k, id, data|field,by,extra}
//   dokumen(path) -> Promise<data|null>
let BACKEND = null;
const KOLEKSI_SEMUA = ['produk', 'transaksi', 'listing', 'foto', 'pengaturan', 'meta'];
const KOLEKSI_PEMILIK = ['pembukuan', 'keuangan'];

let _dasar = new Map();         // "koleksi/id" -> JSON terakhir yg diketahui ada di server (utk diff)
let _stopDengar = [];
let _fotoPeta = {};
let _siapTulis = false;
let _jadwalFlush = null;
let _cacheStok = null;
let _setelahBerubah = null;

function pasangPendengarData(cb) { _setelahBerubah = cb; }
function emailPengguna() { const u = penggunaSaatIni(); return (u && u.email) || ''; }

// ---------- Stok (dihitung dari saldo awal + transaksi; di-cache sampai data berubah) ----------
function batalkanCacheStok() { _cacheStok = null; }
function petaStokSaatIni() { return _cacheStok || (_cacheStok = petaStok(DATA.produk, DATA.transaksi)); }
// Stok FISIK satu varian (satu-satunya angka stok yg nyata).
function hitungStok(produkId, varianId) { return petaStokSaatIni().get(varianId) || 0; }
function daftarVarianDenganStok() {
  const peta = petaStokSaatIni();
  const hasil = [];
  for (const p of DATA.produk) for (const v of p.varian) hasil.push({ produk: p, varian: v, stok: peta.get(v.id) || 0 });
  return hasil;
}
function daftarStokMenipis() {
  return daftarVarianDenganStok().filter(v => v.stok <= (v.produk.stokMinim ?? 3)).sort((a, b) => a.stok - b.stok);
}
function antrianSinkronSaatIni() { return antrianSinkron(DATA.produk, DATA.listing, petaStokSaatIni()); }
function listingVarian(varianId, channel) {
  const l = DATA.listing[varianId];
  return (l && typeof l[channel] === 'number') ? l[channel] : null;
}
function totalFisik() { let n = 0; petaStokSaatIni().forEach(x => { n += x; }); return n; }

// ---------- Serialisasi dokumen ----------
function urut(o) {
  if (Array.isArray(o)) return o.map(urut);
  if (o && typeof o === 'object') { const r = {}; Object.keys(o).sort().forEach(k => { if (o[k] !== undefined) r[k] = urut(o[k]); }); return r; }
  return o;
}
function ser(o) { return JSON.stringify(urut(o)); }

function dokProduk(p) {
  return {
    nama: p.nama, kategori: p.kategori || '', koleksi: p.koleksi || '', catatan: p.catatan || '',
    stokMinim: p.stokMinim ?? 3, createdAt: p.createdAt || null, updatedAt: p.updatedAt || null,
    varian: p.varian.map(v => ({
      id: v.id, ukuran: v.ukuran || '', warna: v.warna || '', stokAwal: Number(v.stokAwal) || 0,
      hargaModal: v.hargaModal || 0, hargaJual: v.hargaJual || 0, hargaChannel: v.hargaChannel || {}
    }))
  };
}
function dokPengaturanUmum() { return { kategoriList: DATA.pengaturan.kategoriList, koleksiList: DATA.pengaturan.koleksiList }; }
function dokKeuangan() {
  const ws = {};
  DAFTAR_WS_PEMBUKUAN.forEach(id => {
    const w = DATA.pembukuanWs[id];
    ws[id] = { kelompokMasukList: w.kelompokMasukList, rincianMasuk: w.rincianMasuk, kelompokKeluarList: w.kelompokKeluarList, rincianKeluar: w.rincianKeluar };
  });
  return { kelompokBiayaList: DATA.pengaturan.kelompokBiayaList, rincianBiaya: DATA.pengaturan.rincianBiaya, ws };
}

// Semua dokumen yg dikelola lewat "ubah DATA lalu simpanData()" (stok/transaksi/listing/foto
// SENGAJA tidak ikut -- punya fungsi tulis sendiri di bawah).
function dokumenDiffSync() {
  const m = new Map();
  for (const p of DATA.produk) m.set('produk/' + p.id, dokProduk(p));
  m.set('pengaturan/umum', dokPengaturanUmum());
  if (apakahPemilik()) {
    for (const x of DATA.pembukuan) { const { id, ...sisa } = x; m.set('pembukuan/' + id, { ...sisa, ws: 'senantiasa' }); }
    DAFTAR_WS_PEMBUKUAN.forEach(wsId => {
      for (const x of DATA.pembukuanWs[wsId].list) { const { id, ...sisa } = x; m.set('pembukuan/' + x.id, { ...sisa, ws: wsId }); }
    });
    m.set('keuangan/pengaturan', dokKeuangan());
  }
  return m;
}
const KOLEKSI_DIFFSYNC = ['produk', 'pembukuan', 'pengaturan', 'keuangan'];

function kirim(ops) {
  if (!ops.length || !BACKEND) return Promise.resolve();
  return BACKEND.tulis(ops).catch(e => {
    console.error('Gagal menyimpan ke server', e);
    tampilkanToast('Gagal menyimpan ke server' + (e && e.code === 'permission-denied' ? ' (tidak punya izin)' : '') + '. Periksa koneksi internet lalu coba lagi.', 'error');
    // buang dasar utk dokumen yg gagal supaya simpanData() berikutnya mencoba lagi
    ops.forEach(o => _dasar.delete(o.k + '/' + o.id));
  });
}

function flushDiff() {
  _jadwalFlush = null;
  if (!_siapTulis) return;
  const sekarang = dokumenDiffSync();
  const ops = [];
  for (const [kunci, data] of sekarang) {
    const j = ser(data);
    if (_dasar.get(kunci) !== j) { _dasar.set(kunci, j); const [k, id] = kunci.split('/'); ops.push({ t: 'set', k, id, data: JSON.parse(j) }); }
  }
  for (const kunci of Array.from(_dasar.keys())) {
    const k = kunci.split('/')[0];
    if (!KOLEKSI_DIFFSYNC.includes(k) || sekarang.has(kunci)) continue;
    if (k === 'pembukuan' && !apakahPemilik()) continue;
    _dasar.delete(kunci);
    ops.push({ t: 'hapus', k, id: kunci.slice(k.length + 1) });
  }
  kirim(ops);
}

// Dipanggil UI setelah mengubah DATA (produk, pembukuan, pengaturan). Digabung per tick supaya
// beberapa perubahan berurutan jadi satu kiriman.
function simpanData() {
  if (!_jadwalFlush) _jadwalFlush = setTimeout(flushDiff, 0);
  return true;
}

// ---------- Hidrasi: server -> DATA ----------
function lekatkanFoto() { DATA.produk.forEach(p => { p.foto = _fotoPeta[p.id] || null; }); }

function terapkanSnapshot(k, docs) {
  if (k === 'produk') {
    DATA.produk = docs.map(d => ({
      id: d.id, ...d.data, koleksi: d.data.koleksi || '',
      varian: (d.data.varian || []).map(v => ({ ...v, stokAwal: Number(v.stokAwal) || 0, hargaChannel: v.hargaChannel || {} }))
    })).sort((a, b) => String(a.createdAt || '').localeCompare(String(b.createdAt || '')) || a.nama.localeCompare(b.nama));
    lekatkanFoto();
    docs.forEach(d => _dasar.set('produk/' + d.id, ser(dokProduk(DATA.produk.find(p => p.id === d.id)))));
    for (const kunci of Array.from(_dasar.keys())) if (kunci.startsWith('produk/') && !docs.some(d => 'produk/' + d.id === kunci)) _dasar.delete(kunci);
    batalkanCacheStok();
  } else if (k === 'transaksi') {
    DATA.transaksi = docs.map(d => ({ id: d.id, ...d.data }));
    batalkanCacheStok();
  } else if (k === 'listing') {
    DATA.listing = {};
    docs.forEach(d => { DATA.listing[d.id] = d.data; });
  } else if (k === 'foto') {
    _fotoPeta = {};
    docs.forEach(d => { _fotoPeta[d.id] = d.data.data || null; });
    lekatkanFoto();
  } else if (k === 'pengaturan') {
    const umum = docs.find(d => d.id === 'umum');
    if (umum) {
      DATA.pengaturan.kategoriList = umum.data.kategoriList || DATA.pengaturan.kategoriList;
      DATA.pengaturan.koleksiList = umum.data.koleksiList || DATA.pengaturan.koleksiList;
      pastikanPengaturanLengkap(DATA.pengaturan);
      _dasar.set('pengaturan/umum', ser(dokPengaturanUmum()));
    }
  } else if (k === 'keuangan') {
    const d = docs.find(x => x.id === 'pengaturan');
    if (d) {
      const png = DATA.pengaturan;
      png.kelompokBiayaList = d.data.kelompokBiayaList || png.kelompokBiayaList;
      png.rincianBiaya = d.data.rincianBiaya || png.rincianBiaya;
      pastikanPengaturanLengkap(png);
      DAFTAR_WS_PEMBUKUAN.forEach(id => Object.assign(DATA.pembukuanWs[id], (d.data.ws || {})[id] || {}));
      pastikanPembukuanWsLengkap(DATA);
      _dasar.set('keuangan/pengaturan', ser(dokKeuangan()));
    }
  } else if (k === 'pembukuan') {
    DATA.pembukuan = [];
    DAFTAR_WS_PEMBUKUAN.forEach(id => { DATA.pembukuanWs[id].list = []; });
    docs.forEach(d => {
      const { ws, ...sisa } = d.data;
      const entri = { id: d.id, ...sisa };
      if (ws && ws !== 'senantiasa' && DATA.pembukuanWs[ws]) DATA.pembukuanWs[ws].list.push(entri);
      else DATA.pembukuan.push(entri);
      _dasar.set('pembukuan/' + d.id, ser({ ...sisa, ws: ws || 'senantiasa' }));
    });
    for (const kunci of Array.from(_dasar.keys())) if (kunci.startsWith('pembukuan/') && !docs.some(d => 'pembukuan/' + d.id === kunci)) _dasar.delete(kunci);
  } else if (k === 'meta') {
    DATA.meta.migrasi = (docs.find(d => d.id === 'migrasi') || {}).data || null;
    DATA.meta.opname = (docs.find(d => d.id === 'opname') || {}).data || null;
  }
}

function koleksiYangDidengar() {
  return apakahPemilik() ? KOLEKSI_SEMUA.concat(KOLEKSI_PEMILIK) : KOLEKSI_SEMUA;
}

// Mulai mendengarkan server. Resolve setelah SEMUA koleksi menerima data pertamanya.
function mulaiSinkron() {
  hentikanSinkron();
  DATA = dataKosong();
  _dasar = new Map(); _fotoPeta = {}; _siapTulis = false; batalkanCacheStok();
  const daftar = koleksiYangDidengar();
  return new Promise((resolve, reject) => {
    let tersisa = daftar.length;
    let selesai = false;
    daftar.forEach(k => {
      let pertama = true;
      _stopDengar.push(BACKEND.dengar(k, (docs, info) => {
        terapkanSnapshot(k, docs);
        if (pertama) { pertama = false; if (--tersisa === 0) { selesai = true; _siapTulis = true; resolve(); } }
        else if (selesai && _setelahBerubah) _setelahBerubah(info || {});
      }, (e) => {
        console.error('Sinkron ' + k + ' gagal', e);
        if (!selesai) { selesai = true; reject(e); }
        else tampilkanToast('Koneksi ke server terputus. Data akan menyusul begitu internet kembali.', 'error');
      }));
    });
  });
}
function hentikanSinkron() { _stopDengar.forEach(f => { try { f(); } catch (e) { /* abaikan */ } }); _stopDengar = []; }

// ---------- Transaksi (stok & listing) ----------
function terapkanEfekListing(varianId, produkId, efek, arah) {
  const ops = [];
  const l = DATA.listing[varianId];
  Object.keys(efek).forEach(c => {
    const by = efek[c] * arah;
    if (!by || !l || typeof l[c] !== 'number') return; // listing belum pernah dicatat -> biarkan, muncul di antrian
    l[c] += by;
    ops.push({ t: 'tambah', k: 'listing', id: varianId, field: c, by, extra: { produkId } });
  });
  return ops;
}

function tambahTransaksi(data) {
  const t = { hargaSatuan: 0, catatan: '', ...data, id: buatId('tx'), createdAt: new Date().toISOString(), oleh: emailPengguna() };
  DATA.transaksi.push(t); batalkanCacheStok();
  const ops = [{ t: 'set', k: 'transaksi', id: t.id, data: JSON.parse(JSON.stringify(t)) }];
  ops.push(...terapkanEfekListing(t.varianId, t.produkId, efekListing(t), +1));
  kirim(ops);
  return t;
}

function ubahTransaksi(id, perubahan) {
  const t = DATA.transaksi.find(x => x.id === id);
  if (!t) return null;
  const ops = terapkanEfekListing(t.varianId, t.produkId, efekListing(t), -1); // batalkan efek lama
  Object.assign(t, perubahan, { diubahAt: new Date().toISOString() });
  batalkanCacheStok();
  ops.push(...terapkanEfekListing(t.varianId, t.produkId, efekListing(t), +1)); // pasang efek baru
  ops.push({ t: 'set', k: 'transaksi', id, data: JSON.parse(JSON.stringify(t)) });
  kirim(ops);
  return t;
}

function hapusTransaksi(id) {
  const t = DATA.transaksi.find(x => x.id === id);
  if (!t) return;
  const ops = terapkanEfekListing(t.varianId, t.produkId, efekListing(t), -1);
  DATA.transaksi = DATA.transaksi.filter(x => x.id !== id); batalkanCacheStok();
  ops.push({ t: 'hapus', k: 'transaksi', id });
  kirim(ops);
}

// ---------- Listing marketplace ----------
// "Sudah disesuaikan": pemilik sudah mengubah angka di marketplace -> catat listing = stok fisik.
function sesuaikanListing(varianId, channels) {
  const v = DATA.produk.flatMap(p => p.varian.map(x => ({ p, x }))).find(o => o.x.id === varianId);
  if (!v) return;
  const nilai = Math.max(0, hitungStok(v.p.id, varianId));
  const data = { produkId: v.p.id };
  DATA.listing[varianId] = DATA.listing[varianId] || { produkId: v.p.id };
  (channels || CHANNEL_ONLINE).forEach(c => { DATA.listing[varianId][c] = nilai; data[c] = nilai; });
  kirim([{ t: 'gabung', k: 'listing', id: varianId, data }]);
}
function sesuaikanSemuaListing() {
  const ops = [];
  for (const q of antrianSinkronSaatIni()) {
    const data = { produkId: q.produk.id };
    DATA.listing[q.varian.id] = DATA.listing[q.varian.id] || { produkId: q.produk.id };
    q.item.forEach(i => { DATA.listing[q.varian.id][i.channel] = i.target; data[i.channel] = i.target; });
    ops.push({ t: 'gabung', k: 'listing', id: q.varian.id, data });
  }
  kirim(ops);
  return ops.length;
}
// Catat angka listing apa adanya (mis. kamu sengaja menaruh angka lebih kecil dari stok fisik).
function aturListing(produkId, varianId, channel, angka) {
  DATA.listing[varianId] = DATA.listing[varianId] || { produkId };
  DATA.listing[varianId][channel] = angka;
  kirim([{ t: 'gabung', k: 'listing', id: varianId, data: { produkId, [channel]: angka } }]);
}

// ---------- Produk, varian, foto ----------
function simpanFotoProduk(produkId, dataUrl) {
  _fotoPeta[produkId] = dataUrl || null;
  const p = cariProduk(produkId); if (p) p.foto = dataUrl || null;
  kirim([dataUrl ? { t: 'set', k: 'foto', id: produkId, data: { data: dataUrl } } : { t: 'hapus', k: 'foto', id: produkId }]);
}

function hapusProduk(id) {
  const p = cariProduk(id);
  if (!p) return;
  const ops = [{ t: 'hapus', k: 'produk', id }, { t: 'hapus', k: 'foto', id }];
  p.varian.forEach(v => { ops.push({ t: 'hapus', k: 'listing', id: v.id }); delete DATA.listing[v.id]; });
  DATA.transaksi.filter(t => t.produkId === id).forEach(t => ops.push({ t: 'hapus', k: 'transaksi', id: t.id }));
  DATA.produk = DATA.produk.filter(x => x.id !== id);
  DATA.transaksi = DATA.transaksi.filter(t => t.produkId !== id);
  _dasar.delete('produk/' + id); batalkanCacheStok();
  kirim(ops);
}

function hapusVarian(produkId, varianId) {
  const p = cariProduk(produkId);
  if (!p) return;
  const ops = [{ t: 'hapus', k: 'listing', id: varianId }];
  DATA.transaksi.filter(t => t.varianId === varianId).forEach(t => ops.push({ t: 'hapus', k: 'transaksi', id: t.id }));
  p.varian = p.varian.filter(v => v.id !== varianId);
  DATA.transaksi = DATA.transaksi.filter(t => t.varianId !== varianId);
  delete DATA.listing[varianId]; batalkanCacheStok();
  kirim(ops);
  simpanData();
}

// Varian BARU: stok awal = jumlah barang fisik yg ada sekarang; listing awal diisi sama (anggapan:
// barangnya langsung kamu pasang di marketplace dgn jumlah yg sama). Boleh diubah lewat Listing.
function tambahVarianBaru(p, varian, listingAwal) {
  p.varian.push(varian); batalkanCacheStok();
  if (listingAwal) {
    DATA.listing[varian.id] = { produkId: p.id, ...listingAwal };
    kirim([{ t: 'gabung', k: 'listing', id: varian.id, data: { produkId: p.id, ...listingAwal } }]);
  }
  simpanData();
}

// ---------- Hitung stok (opname) ----------
// hasil: [{ produkId, varianId, nyata }] -- hanya yg beda dari catatan yg dibuatkan koreksi.
function terapkanOpname(hasil) {
  const peta = petaStokSaatIni();
  const tanggal = tanggalHariIni();
  let jumlah = 0;
  hasil.forEach(h => {
    const selisih = h.nyata - (peta.get(h.varianId) || 0);
    if (!selisih) return;
    tambahTransaksi({ tipe: 'koreksi', produkId: h.produkId, varianId: h.varianId, channel: 'Toko', qty: selisih, hargaSatuan: 0, catatan: 'Hitung stok (opname)', tanggal });
    jumlah++;
  });
  return jumlah;
}
function tandaiOpnameSelesai() {
  const data = { selesaiAt: new Date().toISOString(), oleh: emailPengguna() };
  DATA.meta.opname = data;
  kirim([{ t: 'set', k: 'meta', id: 'opname', data }]);
}
function perluOpname() { return !!(DATA.meta.migrasi && DATA.meta.migrasi.perluOpname && !DATA.meta.opname); }

// ---------- Migrasi dari sistem lama ----------
async function bacaDataLama() {
  if (!BACKEND || !BACKEND.dokumen) return null;
  try { return await BACKEND.dokumen('toko/' + OWNER_UID); } catch (e) { console.error('Gagal membaca data lama', e); return null; }
}

async function jalankanMigrasi(lama) {
  const rencana = rencanaMigrasi(lama, new Date().toISOString());
  const ops = rencana.docs.map(d => ({ t: 'set', k: d.k, id: d.id, data: d.data }));
  await BACKEND.tulis(ops);                                                  // data dulu...
  await BACKEND.tulis([{ t: 'set', k: 'meta', id: 'migrasi', data: rencana.meta }]); // ...penanda selesai terakhir
  return rencana.meta.jumlah;
}
async function mulaiKosong() {
  await BACKEND.tulis([{ t: 'set', k: 'meta', id: 'migrasi', data: { selesai: true, at: new Date().toISOString(), versi: 2, perluOpname: false, sumber: 'kosong' } }]);
}

// ---------- Hapus semua data (Zona Berbahaya, pemilik) ----------
async function hapusSemuaData() {
  const ops = [];
  DATA.produk.forEach(p => { ops.push({ t: 'hapus', k: 'produk', id: p.id }, { t: 'hapus', k: 'foto', id: p.id }); p.varian.forEach(v => ops.push({ t: 'hapus', k: 'listing', id: v.id })); });
  DATA.transaksi.forEach(t => ops.push({ t: 'hapus', k: 'transaksi', id: t.id }));
  DATA.pembukuan.forEach(x => ops.push({ t: 'hapus', k: 'pembukuan', id: x.id }));
  DAFTAR_WS_PEMBUKUAN.forEach(w => DATA.pembukuanWs[w].list.forEach(x => ops.push({ t: 'hapus', k: 'pembukuan', id: x.id })));
  await BACKEND.tulis(ops);
}

// ---------- Cadangan opsional (pemilik) -- tidak ada lagi pengingat/wajib ----------
function unduhCadangan() {
  const salinan = JSON.parse(JSON.stringify(DATA));
  salinan.produk.forEach(p => { delete p.foto; });
  const blob = new Blob([JSON.stringify(salinan, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `salinan-senantiasa-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
}
