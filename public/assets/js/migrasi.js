// Rencana pemindahan data dari sistem LAMA (satu dokumen toko/{OWNER_UID}, stok terpisah per
// channel) ke sistem BARU (koleksi per dokumen, satu stok fisik per varian).
// Murni fungsi: terima data lama, kembalikan daftar dokumen yg harus ditulis -- dipakai di browser
// (penyimpanan.js) dan diuji di Node. Dokumen lama TIDAK pernah diubah atau dihapus.
//
// Kenapa stok fisik "ditebak": di sistem lama tiap channel punya stok sendiri dan Stok Total =
// jumlah semuanya, jadi 1 baju fisik yg di-input 1 di Shopee + 1 di TikTok terbaca 2-3. Dari angka
// lama TIDAK mungkin tahu stok fisik sebenarnya. Tebakan awal = angka channel TERBESAR (kasus
// umum: tiap channel diisi sama dgn jumlah barang fisik). Pemilik lalu mengonfirmasi lewat layar
// "Hitung Stok" (opname); angka lama per channel disimpan di meta/migrasi sbg petunjuk.
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else Object.assign(root, factory());
})(typeof self !== 'undefined' ? self : globalThis, function () {
  const CH = ['Toko', 'Shopee', 'TikTok Shop'];
  const efek = (t) => t.tipe === 'masuk' ? t.qty : t.tipe === 'keluar' ? -t.qty : t.tipe === 'koreksi' ? t.qty : 0;

  function bersih(o) { return JSON.parse(JSON.stringify(o)); } // buang undefined

  function rencanaMigrasi(lama, sekarang) {
    const docs = [];
    const legacy = {};
    const produk = lama.produk || [];
    // Transaksi yg akan ditulis: samakan dgn aturan server (masuk/keluar qty > 0), lewati yg tanpa efek.
    // Saldo awal dihitung dari daftar yg SAMA supaya stok hasil migrasi konsisten dgn riwayat tersimpan.
    const transaksi = [];
    for (const t of (lama.transaksi || [])) {
      const qty = t.tipe === 'koreksi' ? Number(t.qty) : Math.abs(Number(t.qty));
      if (!['masuk', 'keluar', 'koreksi'].includes(t.tipe) || !Number.isFinite(qty) || qty === 0 || !t.id || !t.varianId || !t.produkId) continue;
      transaksi.push({ ...t, qty });
    }
    let jumlahVarian = 0;

    for (const p of produk) {
      const varian = [];
      for (const v of (p.varian || [])) {
        jumlahVarian++;
        const awal = (typeof v.stokAwal === 'number')
          ? { 'Toko': v.stokAwal }
          : (v.stokAwal || {});
        const per = {};
        CH.forEach(c => { per[c] = Number(awal[c]) || 0; });
        let efekTotal = 0;
        for (const t of transaksi) {
          if (t.varianId !== v.id) continue;
          const e = efek(t);
          efekTotal += e;
          if (per[t.channel] !== undefined) per[t.channel] += e;
        }
        const totalLama = CH.reduce((a, c) => a + (Number(awal[c]) || 0), 0) + efekTotal;
        const tebakan = Math.max(0, ...CH.map(c => per[c]));
        legacy[v.id] = { 'Toko': per['Toko'], 'Shopee': per['Shopee'], 'TikTok Shop': per['TikTok Shop'], totalLama, tebakan };
        varian.push({
          id: v.id, ukuran: v.ukuran || '', warna: v.warna || '',
          // saldo awal disesuaikan supaya stok fisik hasil hitung = tebakan
          stokAwal: tebakan - efekTotal,
          hargaModal: v.hargaModal || 0, hargaJual: v.hargaJual || 0, hargaChannel: v.hargaChannel || {}
        });
        docs.push({
          k: 'listing', id: v.id,
          data: { produkId: p.id, 'Shopee': Math.max(0, per['Shopee']), 'TikTok Shop': Math.max(0, per['TikTok Shop']) }
        });
      }
      docs.push({
        k: 'produk', id: p.id,
        data: bersih({
          nama: p.nama || '(tanpa nama)', kategori: p.kategori || '', koleksi: p.koleksi || '', catatan: p.catatan || '',
          stokMinim: p.stokMinim ?? 3, createdAt: p.createdAt || sekarang, updatedAt: p.updatedAt || sekarang, varian
        })
      });
    }

    for (const t of transaksi) {
      docs.push({
        k: 'transaksi', id: t.id,
        data: bersih({
          tipe: t.tipe, produkId: t.produkId, varianId: t.varianId, channel: t.channel || 'Toko', qty: t.qty,
          hargaSatuan: t.hargaSatuan || 0, catatan: t.catatan || '', tanggal: t.tanggal, createdAt: t.createdAt || sekarang, lama: true
        })
      });
    }

    let n = 0;
    for (const x of (lama.pembukuan || [])) {
      docs.push({ k: 'pembukuan', id: x.id || ('mig_s_' + (n++)), data: bersih({ ...x, id: undefined, ws: 'senantiasa' }) });
    }
    const wsLama = lama.pembukuanWs || {};
    const wsPengaturan = {};
    for (const wsId of Object.keys(wsLama)) {
      const ws = wsLama[wsId] || {};
      for (const x of (ws.list || [])) {
        docs.push({ k: 'pembukuan', id: x.id || ('mig_' + wsId + '_' + (n++)), data: bersih({ ...x, id: undefined, ws: wsId }) });
      }
      wsPengaturan[wsId] = bersih({
        kelompokMasukList: ws.kelompokMasukList || [], rincianMasuk: ws.rincianMasuk || {},
        kelompokKeluarList: ws.kelompokKeluarList || [], rincianKeluar: ws.rincianKeluar || {}
      });
    }

    const png = lama.pengaturan || {};
    docs.push({ k: 'pengaturan', id: 'umum', data: bersih({ kategoriList: png.kategoriList || [], koleksiList: png.koleksiList || [] }) });
    docs.push({ k: 'keuangan', id: 'pengaturan', data: bersih({ kelompokBiayaList: png.kelompokBiayaList || [], rincianBiaya: png.rincianBiaya || {}, ws: wsPengaturan }) });

    const meta = {
      selesai: true, at: sekarang, versi: 2, sumber: 'toko (dokumen lama, tidak diubah)', perluOpname: true, legacy,
      jumlah: { produk: produk.length, varian: jumlahVarian, transaksi: transaksi.length, pembukuan: (lama.pembukuan || []).length }
    };
    return { docs, meta };
  }

  return { rencanaMigrasi };
});
