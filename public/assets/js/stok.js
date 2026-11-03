// Logika stok MURNI (tanpa DOM, tanpa Firebase) -- dipakai app di browser dan diuji di Node
// (test/stok.test.mjs). Model stok Senantiasa:
//
//   1. STOK FISIK per varian = SATU angka, satu-satunya sumber kebenaran:
//        stokAwal (saldo awal) + semua transaksi masuk - keluar +/- koreksi.
//      Penjualan di channel mana pun (Toko, Shopee, TikTok Shop) mengurangi angka yg SAMA.
//   2. LISTING per marketplace (Shopee, TikTok Shop) = angka yg tertera di aplikasi marketplace
//      tsb saat ini, dicatat terpisah dan TIDAK PERNAH dijumlahkan ke stok fisik.
//   3. ANTRIAN SINKRON = daftar listing yg beda dari stok fisik, alias "yg harus kamu ubah
//      di marketplace sekarang". Mengganti tanda bulat di catatan manual.
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else Object.assign(root, factory());
})(typeof self !== 'undefined' ? self : globalThis, function () {
  const CHANNEL_ONLINE = ['Shopee', 'TikTok Shop'];

  // Perubahan stok fisik akibat satu transaksi.
  function efekStok(t) {
    if (t.tipe === 'masuk') return t.qty;
    if (t.tipe === 'keluar') return -t.qty;
    if (t.tipe === 'koreksi') return t.qty; // koreksi boleh negatif
    return 0;
  }

  // Perubahan angka listing akibat satu transaksi. Penjualan lewat Shopee/TikTok dikurangi
  // OTOMATIS oleh platform itu sendiri, jadi listing channel tsb ikut turun -- sedangkan channel
  // lain (dan restock/koreksi) tidak berubah sampai pemilik menyesuaikannya manual.
  function efekListing(t) {
    if (t.tipe === 'keluar' && CHANNEL_ONLINE.includes(t.channel)) return { [t.channel]: -t.qty };
    return {};
  }

  // Hitung stok fisik SEMUA varian sekali jalan -> Map(varianId -> angka).
  function petaStok(produkList, transaksiList) {
    const peta = new Map();
    for (const p of produkList) for (const v of p.varian) peta.set(v.id, Number(v.stokAwal) || 0);
    for (const t of transaksiList) {
      if (peta.has(t.varianId)) peta.set(t.varianId, peta.get(t.varianId) + efekStok(t));
    }
    return peta;
  }

  // Daftar penyesuaian yg harus dilakukan di marketplace.
  // Hasil: [{ produk, varian, fisik, item: [{ channel, listing, target }] }]
  //  - target  = berapa yg seharusnya tertera (sama dgn stok fisik, minimal 0)
  //  - listing = angka tercatat saat ini (null = belum pernah dicatat)
  function antrianSinkron(produkList, listing, peta) {
    const hasil = [];
    for (const p of produkList) {
      for (const v of p.varian) {
        const fisik = peta.get(v.id) || 0;
        const target = Math.max(0, fisik);
        const l = listing[v.id] || {};
        const item = [];
        for (const c of CHANNEL_ONLINE) {
          const tercatat = (typeof l[c] === 'number') ? l[c] : null;
          if (tercatat !== target) item.push({ channel: c, listing: tercatat, target });
        }
        if (item.length) hasil.push({ produk: p, varian: v, fisik, item });
      }
    }
    return hasil;
  }

  return { CHANNEL_ONLINE, efekStok, efekListing, petaStok, antrianSinkron };
});
