// Halaman & komponen yang lahir dari model stok baru: Sinkron Marketplace (antrian "angka mana
// yang harus kamu ubah di Shopee/TikTok"), Hitung Stok (opname), dan layar pemindahan data lama.
// Logika hitungnya ada di stok.js / penyimpanan.js; file ini hanya tampilan.

const LABEL_LISTING = { 'Shopee': 'Shopee', 'TikTok Shop': 'TikTok' };

function teksListing(n) { return n === null ? '?' : String(n); }

// ---------- Sel "angka di marketplace" pada tabel varian ----------
// Sama dgn stok fisik -> angka biasa. Beda -> "1 → 0" (merah) + tombol centang untuk menandai
// bahwa angkanya sudah kamu ubah di marketplace.
function htmlSelListing(p, v, channel) {
  const fisik = Math.max(0, hitungStok(p.id, v.id));
  const l = listingVarian(v.id, channel);
  if (l === fisik) return `<span class="listing-ok">${l}</span>`;
  return `<span class="listing-beda" data-tip="Di ${escapeHtml(channel)} tertera ${teksListing(l)}, seharusnya ${fisik}">${teksListing(l)} <i>&rarr;</i> <b>${fisik}</b></span>
    <button type="button" class="btn-centang" data-sesuaikan="${v.id}|${escapeHtml(channel)}" data-tip="Tandai: sudah kuubah di ${escapeHtml(channel)}" aria-label="Sudah diubah di ${escapeHtml(channel)}">&#10003;</button>`;
}
function pasangAksiSelListing(setelah) {
  KONTEN().querySelectorAll('[data-sesuaikan]').forEach(btn => {
    btn.addEventListener('click', () => {
      const [vId, channel] = btn.dataset.sesuaikan.split('|');
      sesuaikanListing(vId, [channel]);
      tampilkanToast(`Angka ${channel} dicatat sudah sesuai.`, 'sukses');
      setelah();
    });
  });
}

// ---------- Titik status di kartu produk ----------
function dotListingHtml(p) {
  const antrian = antrianSinkronSaatIni().filter(x => x.produk.id === p.id);
  return CHANNEL_ONLINE.map(c => {
    const beda = antrian.filter(x => x.item.some(i => i.channel === c)).length;
    return `<span class="dot-channel ${beda ? 'dot-channel--beda' : 'd-' + KELAS_CHANNEL[c]}" data-tip="${escapeHtml(c)}: ${beda ? beda + ' varian perlu disesuaikan' : 'sudah sesuai'}"></span>`;
  }).join('');
}

function cocokStatusProduk(p, status) {
  if (!status) return true;
  if (status === 'Perlu disesuaikan') return antrianSinkronSaatIni().some(x => x.produk.id === p.id);
  const total = p.varian.reduce((a, v) => a + hitungStok(p.id, v.id), 0);
  if (status === 'Stok habis') return total <= 0;
  if (status === 'Stok menipis') return total > 0 && p.varian.some(v => hitungStok(p.id, v.id) <= (p.stokMinim ?? 3));
  return true;
}

// Teks toast setelah transaksi: langsung sebut apa yang harus diubah di marketplace.
function pesanSetelahTransaksi(produkId, varianId) {
  const q = antrianSinkronSaatIni().find(x => x.varian.id === varianId);
  if (!q) return 'Transaksi disimpan. Marketplace sudah sesuai.';
  return 'Transaksi disimpan. Ubah di marketplace: ' + q.item.map(i => `${i.channel} ${teksListing(i.listing)} → ${i.target}`).join(', ') + '.';
}

// ---------- Kartu ringkas di Overview ----------
function htmlKartuSinkronRingkas() {
  const antrian = antrianSinkronSaatIni();
  const jumlahItem = antrian.reduce((a, x) => a + x.item.length, 0);
  return `<div class="kartu kartu-kompak sinkron-ringkas ${jumlahItem ? 'sinkron-ringkas--ada' : ''}">
    <h2>Perlu Disesuaikan di Marketplace</h2>
    ${jumlahItem ? `<div class="sinkron-ringkas__baris">
        ${antrian.slice(0, 4).map(x => `<a class="sinkron-ringkas__item" href="#sinkron">
          <span class="sinkron-ringkas__nama">${escapeHtml(x.produk.nama)} <span class="teks-lemah">${escapeHtml(labelVarian(x.varian))}</span></span>
          <span class="sinkron-ringkas__angka">${x.item.map(i => `${escapeHtml(LABEL_LISTING[i.channel])} ${teksListing(i.listing)}&rarr;<b>${i.target}</b>`).join(' &middot; ')}</span>
        </a>`).join('')}
      </div>
      <a class="btn btn-kecil btn-primer" href="#sinkron">${jumlahItem} angka perlu diubah${antrian.length > 4 ? ' (lihat semua)' : ''}</a>`
      : `<div class="kosong">Semua angka di Shopee &amp; TikTok sudah sesuai dengan stok fisik.</div>`}
  </div>`;
}

// ============================================================
// HALAMAN: SINKRON MARKETPLACE
// ============================================================
function renderSinkron() {
  const antrian = antrianSinkronSaatIni();
  const total = antrian.reduce((a, x) => a + x.item.length, 0);
  KONTEN_STICKY().innerHTML = `
    <div class="halaman-sticky-host__inner">
      <div class="halaman__header">
        <div><h1>Sinkron Marketplace</h1><p>${total ? `${total} angka perlu kamu ubah di Shopee / TikTok Shop` : 'Semua angka sudah sesuai dengan stok fisik'}</p></div>
        <div class="halaman__header-aksi">
          ${total ? '<button class="btn" id="btnSesuaikanSemua" data-tip="Pakai setelah semua angka di atas selesai kamu ubah di marketplace">Tandai semua sudah diubah</button>' : ''}
        </div>
      </div>
    </div>`;

  const kontainer = KONTEN();
  if (!total) {
    kontainer.innerHTML = `<div class="kartu"><div class="kosong">Tidak ada yang perlu diubah. Setiap kali ada penjualan atau restock, daftar ini otomatis terisi.</div></div>`;
    pasangHeaderSticky();
    return;
  }

  const perChannel = CHANNEL_ONLINE.map(c => ({
    channel: c,
    baris: antrian.filter(x => x.item.some(i => i.channel === c)).map(x => ({ ...x, i: x.item.find(i => i.channel === c) }))
  })).filter(g => g.baris.length);

  kontainer.innerHTML = `
    <p class="teks-lemah sinkron-petunjuk">Stok fisik adalah satu angka untuk semua channel. Barang yang laku di mana pun mengurangi angka yang sama, jadi angka di marketplace lain perlu mengikuti. Buka marketplace-nya, ubah angka sesuai kolom kanan, lalu tekan <strong>Sudah diubah</strong>.</p>
    ${perChannel.map(g => `
      <div class="kartu sinkron-kartu">
        <h2 style="display:flex;justify-content:space-between;align-items:center;gap:10px">
          <span>${badgeChannel(g.channel)} <span class="teks-lemah" style="font-weight:500">${g.baris.length} varian</span></span>
          ${CHANNEL_LINK[g.channel] ? `<a class="btn btn-kecil" href="${CHANNEL_LINK[g.channel]}" target="_blank" rel="noopener">Buka ${escapeHtml(g.channel)} ↗</a>` : ''}
        </h2>
        <div class="sinkron-daftar">
          ${g.baris.map(x => `<div class="sinkron-baris">
            <div class="sinkron-baris__nama">
              <a href="#produk/${x.produk.id}">${escapeHtml(x.produk.nama)}</a>
              <span class="teks-lemah">${escapeHtml(labelVarian(x.varian))} &middot; stok fisik ${x.fisik}</span>
            </div>
            <div class="sinkron-baris__angka">
              <span class="sinkron-lama">${teksListing(x.i.listing)}</span><i>&rarr;</i><span class="sinkron-baru ${x.i.target === 0 ? 'sinkron-baru--nol' : ''}">${x.i.target}</span>
            </div>
            <button class="btn btn-kecil btn-primer" data-sesuaikan="${x.varian.id}|${escapeHtml(g.channel)}">Sudah diubah</button>
          </div>`).join('')}
        </div>
      </div>`).join('')}`;

  pasangAksiSelListing(renderSinkron);
  const btnSemua = document.getElementById('btnSesuaikanSemua');
  if (btnSemua) btnSemua.addEventListener('click', () => {
    konfirmasi(`Yakin <strong>${total} angka</strong> di atas sudah kamu ubah di Shopee / TikTok Shop? Aplikasi akan mencatat semuanya sudah sesuai.`, () => {
      sesuaikanSemuaListing();
      tampilkanToast('Semua angka marketplace dicatat sudah sesuai.', 'sukses');
      renderSinkron();
      renderBanner();
    }, { labelYa: 'Ya, sudah semua' });
  });
  pasangHeaderSticky();
}

// ============================================================
// HALAMAN: HITUNG STOK (OPNAME)
// ============================================================
function renderOpname() {
  const peta = petaStokSaatIni();
  const legacy = (DATA.meta.migrasi && DATA.meta.migrasi.legacy) || {};
  const perlu = perluOpname();
  KONTEN_STICKY().innerHTML = `
    <div class="halaman-sticky-host__inner">
      <div class="halaman__header">
        <div><h1>Hitung Stok</h1><p>Cocokkan angka di aplikasi dengan barang yang benar-benar ada</p></div>
        <div class="halaman__header-aksi">
          ${perlu ? '<button class="btn" id="btnLewatiOpname" data-tip="Pakai kalau semua angka tebakan sudah benar">Angkanya sudah benar semua</button>' : ''}
          <button class="btn btn-primer" id="btnSimpanOpname">Simpan hasil hitung</button>
        </div>
      </div>
      <div class="toolbar"><div class="field"><input type="text" id="cariOpname" placeholder="Cari produk..."></div></div>
    </div>`;

  const baris = [];
  DATA.produk.slice().sort((a, b) => a.nama.localeCompare(b.nama)).forEach(p => p.varian.forEach(v => baris.push({ p, v })));

  KONTEN().innerHTML = `
    ${perlu ? `<div class="kartu opname-info"><p>Angka stok awal berasal dari tebakan saat memindahkan data lama, karena di sistem lama setiap channel punya angka sendiri. Isi kolom <strong>Hitungan nyata</strong> hanya untuk varian yang angkanya berbeda dari barang yang ada. Yang dikosongkan tidak diubah.</p></div>` : `<p class="teks-lemah sinkron-petunjuk">Isi <strong>Hitungan nyata</strong> hanya untuk varian yang ingin dikoreksi. Yang dikosongkan tidak diubah. Selisihnya dicatat sebagai transaksi Koreksi supaya ada jejaknya.</p>`}
    <div class="kartu" style="padding:0"><div class="tabel-wrap"><table class="tabel-opname">
      <thead><tr><th>Produk</th><th>Varian</th>${perlu ? '<th>Angka lama</th>' : ''}<th class="teks-kanan">Tercatat</th><th class="teks-kanan">Hitungan nyata</th><th class="teks-kanan">Selisih</th></tr></thead>
      <tbody id="tbodyOpname">
        ${baris.length ? baris.map(({ p, v }) => {
          const L = legacy[v.id];
          return `<tr data-nama="${escapeHtml((p.nama + ' ' + labelVarian(v)).toLowerCase())}">
            <td>${escapeHtml(p.nama)}</td><td>${escapeHtml(labelVarian(v))}</td>
            ${perlu ? `<td class="teks-lemah">${L ? `Toko ${L['Toko']} &middot; Shopee ${L['Shopee']} &middot; TikTok ${L['TikTok Shop']}` : '-'}</td>` : ''}
            <td class="teks-kanan"><strong>${peta.get(v.id) || 0}</strong></td>
            <td class="teks-kanan"><input type="number" class="opname-input" data-p="${p.id}" data-v="${v.id}" data-tercatat="${peta.get(v.id) || 0}" min="0" inputmode="numeric" aria-label="Hitungan nyata ${escapeHtml(p.nama)} ${escapeHtml(labelVarian(v))}"></td>
            <td class="teks-kanan opname-selisih">-</td>
          </tr>`;
        }).join('') : '<tr><td colspan="6" class="kosong">Belum ada produk.</td></tr>'}
      </tbody>
    </table></div></div>`;

  KONTEN().querySelectorAll('.opname-input').forEach(inp => inp.addEventListener('input', () => {
    const sel = inp.closest('tr').querySelector('.opname-selisih');
    if (inp.value === '') { sel.textContent = '-'; sel.className = 'teks-kanan opname-selisih'; return; }
    const d = Number(inp.value) - Number(inp.dataset.tercatat);
    sel.textContent = d > 0 ? '+' + d : String(d);
    sel.className = 'teks-kanan opname-selisih' + (d ? (d > 0 ? ' opname-selisih--naik' : ' opname-selisih--turun') : '');
  }));
  document.getElementById('cariOpname').addEventListener('input', (e) => {
    const k = e.target.value.trim().toLowerCase();
    KONTEN().querySelectorAll('#tbodyOpname tr[data-nama]').forEach(tr => { tr.hidden = !!k && !tr.dataset.nama.includes(k); });
  });
  document.getElementById('btnSimpanOpname').addEventListener('click', () => {
    const hasil = Array.from(KONTEN().querySelectorAll('.opname-input')).filter(i => i.value !== '')
      .map(i => ({ produkId: i.dataset.p, varianId: i.dataset.v, nyata: Math.max(0, Math.round(Number(i.value))) }));
    const jumlah = terapkanOpname(hasil);
    if (perlu) tandaiOpnameSelesai();
    tampilkanToast(jumlah ? `${jumlah} koreksi stok dicatat.` : 'Tidak ada angka yang berubah.', 'sukses');
    location.hash = antrianSinkronSaatIni().length ? '#sinkron' : '#dashboard';
    render();
  });
  const lewati = document.getElementById('btnLewatiOpname');
  if (lewati) lewati.addEventListener('click', () => {
    tandaiOpnameSelesai();
    tampilkanToast('Stok awal dikonfirmasi benar.', 'sukses');
    location.hash = '#dashboard';
    render();
  });
  pasangHeaderSticky();
}

// ============================================================
// LAYAR PEMINDAHAN DATA LAMA (sekali jalan, pemilik)
// ============================================================
async function tampilkanLayarMigrasi(gerbang) {
  gerbang.hidden = false;
  const kotak = (isi) => { gerbang.innerHTML = `<div class="gerbang-kunci__kotak migrasi-kotak"><img src="assets/img/logo.png?v=20261103" alt="" class="gerbang-kunci__logo">${isi}</div>`; };

  if (!apakahPemilik()) {
    kotak(`<h1>Menunggu pemilik</h1><p>Aplikasi sedang dipindahkan ke sistem stok yang baru. Minta pemilik membuka aplikasi dan menyelesaikan pemindahan data satu kali, lalu muat ulang halaman ini.</p>
      <button type="button" id="btnMuatUlang">Muat ulang</button> <button type="button" id="btnKeluarM" class="gerbang-kunci__sekunder">Keluar</button>`);
    document.getElementById('btnMuatUlang').onclick = () => location.reload();
    document.getElementById('btnKeluarM').onclick = () => window.firebaseAuth.signOut();
    return;
  }

  kotak('<h1>Memeriksa data…</h1><div class="gerbang-kunci__spinner" aria-label="Memuat"></div>');

  // Cek ke SERVER (bukan cache perangkat) apakah pemindahan sudah pernah dilakukan dari perangkat lain.
  let sudah;
  try { sudah = await BACKEND.dokumenServer('meta/migrasi'); }
  catch (err) {
    kotak(`<h1>Butuh koneksi internet</h1><p>Pemindahan data hanya bisa dilakukan saat online. Sambungkan internet lalu coba lagi.</p><button type="button" id="btnCobaMigrasi">Coba lagi</button>`);
    document.getElementById('btnCobaMigrasi').onclick = () => tampilkanLayarMigrasi(gerbang);
    return;
  }
  if (sudah) {
    kotak('<h1>Data sudah dipindahkan</h1><p>Memuat ulang data terbaru…</p><div class="gerbang-kunci__spinner" aria-label="Memuat"></div>');
    setTimeout(() => location.reload(), 600);
    return;
  }
  const lama = await bacaDataLama();

  async function selesai() {
    for (let i = 0; i < 60 && !DATA.meta.migrasi; i++) await new Promise(r => setTimeout(r, 100));
    window.mulaiTampilanSetelahMigrasi();
  }

  if (!lama || !(lama.produk || []).length) {
    kotak(`<h1>Mulai dari awal</h1><p>Tidak ada data lama yang perlu dipindahkan. Kamu bisa langsung memakai aplikasi baru dan menambah produk.</p>
      <button type="button" id="btnMulaiKosong">Mulai</button>`);
    document.getElementById('btnMulaiKosong').onclick = async (e) => {
      e.target.disabled = true; e.target.textContent = 'Menyiapkan…';
      try { await mulaiKosong(); await selesai(); } catch (err) { if (err && err.code === 'sudah-dimigrasi') { location.reload(); return; } e.target.disabled = false; e.target.textContent = 'Mulai'; tampilkanToast('Gagal menyiapkan. Coba lagi.', 'error'); }
    };
    return;
  }

  const jumlahVarian = lama.produk.reduce((a, p) => a + (p.varian || []).length, 0);
  kotak(`<h1>Pindahkan data lama</h1>
    <p>Ditemukan <strong>${lama.produk.length} produk</strong>, <strong>${jumlahVarian} varian</strong>, <strong>${(lama.transaksi || []).length} transaksi</strong> dan <strong>${(lama.pembukuan || []).length} catatan pembukuan</strong> di sistem lama.</p>
    <p class="migrasi-catatan">Di sistem lama setiap channel punya stok sendiri dan dijumlahkan. Sistem baru memakai <strong>satu stok fisik</strong> per varian. Angka stok akan ditebak dari channel terbesar, lalu kamu konfirmasi lewat menu <strong>Hitung Stok</strong>. Data lama tidak diubah atau dihapus.</p>
    <button type="button" id="btnPindah">Pindahkan sekarang</button>
    <p id="statusMigrasi" class="migrasi-status" hidden></p>`);
  document.getElementById('btnPindah').onclick = async (e) => {
    const st = document.getElementById('statusMigrasi');
    e.target.disabled = true; e.target.textContent = 'Memindahkan…';
    st.hidden = false; st.textContent = 'Jangan tutup halaman ini sampai selesai.';
    try {
      await jalankanMigrasi(lama);
      await selesai();
      location.hash = '#opname';
    } catch (err) {
      console.error(err);
      if (err && err.code === 'sudah-dimigrasi') { location.reload(); return; }
      e.target.disabled = false; e.target.textContent = 'Coba lagi';
      st.textContent = 'Gagal memindahkan data. Periksa koneksi lalu coba lagi. Data lama masih utuh.';
    }
  };
}
