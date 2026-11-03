// Backend di memori dengan antarmuka SAMA seperti Firestore (lihat penyimpanan.js). Dipakai:
//  - uji otomatis di Node (test/*.test.mjs), dua "perangkat" berbagi satu backend
//  - mode demo di browser: buka http://localhost:PORT/?local -- tanpa login, tanpa menyentuh
//    Firebase, data demo tersimpan di localStorage browser itu (tambah &reset utk mengulang,
//    &staf utk melihat tampilan karyawan, &lama utk mencoba pemindahan dari data sistem lama).
// MODE_LOKAL harus sudah ditentukan sebelum firebase-init.js (module) jalan.
if (typeof window !== 'undefined' && window.location && typeof document !== 'undefined') {
  const q = new URLSearchParams(location.search);
  window.MODE_LOKAL = ['localhost', '127.0.0.1'].includes(location.hostname) && q.has('local');
}
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(root);
  else Object.assign(root, factory(root));
})(typeof self !== 'undefined' ? self : globalThis, function (root) {
  function buatBackendMemori(opsi) {
    opsi = opsi || {};
    const kol = {};              // koleksi -> Map(id -> data)
    const pendengar = {};        // koleksi -> Set(fungsi)
    const lama = opsi.dokumenLama || null; // isi toko/{uid} utk uji migrasi
    function ambil(k) { return kol[k] || (kol[k] = new Map()); }
    function daftar(k) { return Array.from(ambil(k)).map(([id, data]) => ({ id, data: JSON.parse(JSON.stringify(data)) })); }
    function pancar(k, lokal) {
      (pendengar[k] || new Set()).forEach(cb => Promise.resolve().then(() => cb(daftar(k), { lokal: !!lokal })));
    }
    function simpan() { if (opsi.simpan) opsi.simpan(b.ekspor()); }

    const b = {
      dengar(k, cb) {
        (pendengar[k] = pendengar[k] || new Set()).add(cb);
        Promise.resolve().then(() => cb(daftar(k), { lokal: false }));
        return () => pendengar[k].delete(cb);
      },
      tulis(ops) {
        if (opsi.tolak) return Promise.reject(Object.assign(new Error('ditolak'), { code: 'permission-denied' }));
        const berubah = new Set();
        for (const o of ops) {
          const m = ambil(o.k);
          if (o.t === 'set') m.set(o.id, JSON.parse(JSON.stringify(o.data)));
          else if (o.t === 'gabung') m.set(o.id, Object.assign({}, m.get(o.id) || {}, JSON.parse(JSON.stringify(o.data))));
          else if (o.t === 'hapus') m.delete(o.id);
          else if (o.t === 'tambah') {
            const d = Object.assign({}, m.get(o.id) || {}, o.extra || {});
            d[o.field] = (typeof d[o.field] === 'number' ? d[o.field] : 0) + o.by;
            m.set(o.id, d);
          }
          berubah.add(o.k);
        }
        berubah.forEach(k => pancar(k, true));
        simpan();
        return Promise.resolve();
      },
      dokumen(path) {
        if (path.startsWith('toko/')) return Promise.resolve(lama ? JSON.parse(JSON.stringify(lama)) : null);
        const [k, id] = path.split('/');
        return Promise.resolve(ambil(k).has(id) ? JSON.parse(JSON.stringify(ambil(k).get(id))) : null);
      },
      ekspor() { const o = {}; Object.keys(kol).forEach(k => { o[k] = Array.from(kol[k]); }); return o; },
      impor(o) { Object.keys(o).forEach(k => { kol[k] = new Map(o[k]); }); },
      kosong() { return Object.keys(kol).every(k => kol[k].size === 0); }
    };
    return b;
  }

  // Data demo: katalog dari seed-produk.js / seed-transaksi.js, dibuat sesuai model baru.
  function isiDemo(b, SEED_PRODUK, SEED_TRANSAKSI) {
    const now = new Date().toISOString();
    const rnd = (p) => p + '_' + Math.random().toString(36).slice(2, 9);
    const produk = (SEED_PRODUK || []).map(p => ({
      id: rnd('prod'), nama: p.nama, kategori: p.kategori, koleksi: p.koleksi || '', catatan: p.catatan || '',
      stokMinim: p.stokMinim ?? 3, createdAt: now, updatedAt: now,
      varian: p.varian.map(v => ({ id: rnd('var'), ukuran: v.ukuran, warna: v.warna, stokAwal: 0, hargaModal: v.hargaModal, hargaJual: v.hargaJual, hargaChannel: v.hargaChannel || {} }))
    }));
    const ops = produk.map(p => ({ t: 'set', k: 'produk', id: p.id, data: p }));
    const stok = {};
    (SEED_TRANSAKSI || []).forEach((t, i) => {
      const p = produk.find(x => x.nama === t.namaProduk);
      if (!p) return;
      const v = p.varian[0];
      const d = new Date(); d.setDate(d.getDate() - t.hariLalu);
      const tx = { tipe: t.tipe, produkId: p.id, varianId: v.id, channel: t.channel, qty: t.qty, hargaSatuan: t.hargaSatuan || 0, catatan: t.catatan || '', tanggal: d.toISOString().slice(0, 10), createdAt: d.toISOString() };
      ops.push({ t: 'set', k: 'transaksi', id: 'tx_demo_' + i, data: tx });
      stok[v.id] = (stok[v.id] || 0) + (t.tipe === 'masuk' ? t.qty : t.tipe === 'keluar' ? -t.qty : t.qty);
    });
    let n = 0;
    produk.forEach(p => p.varian.forEach(v => {
      const fisik = Math.max(0, stok[v.id] || 0);
      // sebagian sengaja beda dari stok fisik supaya antrian "perlu disesuaikan" ada isinya
      const geser = (n++ % 3 === 1) ? 1 : 0;
      ops.push({ t: 'set', k: 'listing', id: v.id, data: { produkId: p.id, 'Shopee': fisik, 'TikTok Shop': fisik + geser } });
    }));
    ops.push({ t: 'set', k: 'meta', id: 'migrasi', data: { selesai: true, at: now, versi: 2, perluOpname: false, sumber: 'demo' } });
    return b.tulis(ops);
  }

  return { buatBackendMemori, isiDemo };
});

// ---------- Pemasangan mode demo di browser ----------
if (typeof window !== 'undefined' && window.MODE_LOKAL) {
  (function () {
    const q = new URLSearchParams(location.search);
    const KEY = 'senantiasa_lokal_v2';
    const OWNER = 'I6owACv9yJZQndKJK2Aq7aSqagh2';
    const muatSkrip = (src) => new Promise((ok, gagal) => {
      const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = gagal; document.head.appendChild(s);
    });
    // Data "sistem lama" contoh utk mencoba layar pemindahan: ?local&lama
    function buatLamaDemo() {
      const now = new Date().toISOString();
      const produk = SEED_PRODUK.slice(0, 4).map((p, i) => ({
        id: 'lama_p' + i, nama: p.nama, kategori: p.kategori, koleksi: p.koleksi || '', catatan: '', stokMinim: 1, createdAt: now, updatedAt: now,
        varian: [{ id: 'lama_v' + i, ukuran: 'All', warna: '-', stokAwal: { 'Toko': 1 + i, 'Shopee': 1 + i, 'TikTok Shop': 1 + i }, hargaModal: p.varian[0].hargaModal, hargaJual: p.varian[0].hargaJual, hargaChannel: {} }]
      }));
      const transaksi = [{ id: 'lama_t0', tipe: 'keluar', produkId: 'lama_p1', varianId: 'lama_v1', channel: 'Shopee', qty: 1, hargaSatuan: 200000, catatan: '', tanggal: now.slice(0, 10), createdAt: now }];
      return { produk, transaksi, pembukuan: [], pembukuanWs: {}, pengaturan: {} };
    }
    const simpanan = (() => { try { return q.has('reset') ? null : JSON.parse(localStorage.getItem(KEY)); } catch (e) { return null; } })();
    let lama = null;
    const user = { uid: q.has('staf') ? 'staf-demo' : OWNER, email: q.has('staf') ? 'staf@demo' : 'pemilik@demo' };
    window.firebaseAuth = {
      onAuthStateChanged: (cb) => setTimeout(() => cb(user), 0),
      signOut: () => { location.href = location.pathname + '?local'; },
      currentUser: () => user
    };
    window.firebaseSignIn = () => Promise.resolve();
    window.__siapLokal = (async () => {
      await Promise.all(['seed-produk.js', 'seed-transaksi.js'].map(f => muatSkrip('assets/js/' + f)));
      if (q.has('lama')) lama = buatLamaDemo();
      const b = buatBackendMemori({
        dokumenLama: lama,
        simpan: (o) => { try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) { /* abaikan */ } }
      });
      window.__backendLokal = b;
      if (simpanan && !q.has('lama')) b.impor(simpanan);
      else if (!q.has('lama')) await isiDemo(b, SEED_PRODUK, SEED_TRANSAKSI);
    })();
  })();
}
