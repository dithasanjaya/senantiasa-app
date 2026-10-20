// Aplikasi Inventory Senantiasa -- router hash sederhana + halaman-halaman.
// Tidak pakai framework/build step supaya bisa langsung dibuka dari file index.html.

const KONTEN = () => document.getElementById('kontenUtama');
const WARNA = { sorrell: '#C8B37F', sorrellDark: '#8a7442', matisse: '#1C4C94', sienna: '#D47444', siennaDark: '#a8532b', almond: '#ECCCC4', garis: '#EFE3DB' };
let FILTER_CHANNEL_AWAL = '';
let FILTER_PRODUK = { kategori: '', koleksi: '', channel: '' };
let REFRESH_GRID_PRODUK = null;
let VIEW_PRODUK = 'besar'; // 'list' | 'detail' | 'besar'
let SORT_PRODUK = ''; // '' (nama A-Z) | 'stok-tinggi' | 'stok-rendah'
let FILTER_TRANSAKSI = { tipe: '', channel: '' };
let REFRESH_TABEL_TRANSAKSI = null;
let SCROLL_STICKY_HANDLER = null; // handler aktif dari pasangHeaderSticky() -- dicopot tiap ganti halaman
let JENIS_LAPORAN_AKTIF = 'stok'; // 'stok' | 'transaksi' | 'total' | 'pembukuan'
let GRUP_PENGATURAN_AKTIF = 'data'; // 'data' | 'klasifikasi' | 'pembukuan' | 'marketplace' | 'bahaya' -- tab horizontal, selalu ada satu yg aktif
let FILTER_PEMBUKUAN = { tipe: '' };
let REFRESH_TABEL_PEMBUKUAN = null;
let FILTER_PEMBUKUAN_WS = { dinda: { tipe: '' }, retro: { tipe: '' } };
let REFRESH_TABEL_PEMBUKUAN_WS = { dinda: null, retro: null };

const IKON = {
  box: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8 12 3 3 8v8l9 5 9-5z"/><path d="M3 8l9 5 9-5M12 13v8"/></svg>',
  stack: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 3 8l9 5 9-5z"/><path d="M3 13l9 5 9-5M3 17.5l9 5 9-5"/></svg>',
  wallet: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7a2 2 0 0 1 2-2h13a1 1 0 0 1 1 1v3"/><path d="M3 7v11a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1V10a1 1 0 0 0-1-1H6a2 2 0 0 1 0-4"/><circle cx="17" cy="14.5" r="1.4" fill="currentColor" stroke="none"/></svg>',
  trend: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/></svg>',
  tag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20.6 12.9 12.1 21.4a2 2 0 0 1-2.8 0l-6.7-6.7a2 2 0 0 1 0-2.8L11.1 3.4a2 2 0 0 1 1.4-.6H19a2 2 0 0 1 2 2v6.7a2 2 0 0 1-.4 1.4z"/><circle cx="15.5" cy="8.5" r="1.4" fill="currentColor" stroke="none"/></svg>',
  laba: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M9 15l6-6"/><circle cx="9.5" cy="9.5" r=".6" fill="currentColor" stroke="none"/><circle cx="14.5" cy="14.5" r=".6" fill="currentColor" stroke="none"/></svg>',
  toko: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l1.4-5h15.2L21 9"/><path d="M4 9v10a1 1 0 0 0 1 1h4v-7h6v7h4a1 1 0 0 0 1-1V9"/><path d="M3 9h18"/></svg>',
  peringatan: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 2 21h20L12 3z"/><path d="M12 10v5M12 18h.01"/></svg>',
  laporanKecil: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2h9l5 5v15H6z"/><path d="M9 12h6M9 16h6M9 8h3"/></svg>',
  editKecil: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>',
  hapusKecil: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>'
};

// ============================================================
// HELPER VISUAL (sparkline, grafik tren interaktif)
// ============================================================
// Path SVG melengkung (Catmull-Rom -> kurva Bezier kubik) lewat titik2 [x,y] -- dipakai
// gantiin polyline lurus supaya garis grafik terlihat lebih halus/modern, bukan patah2 kaku.
function svgPathHalus(pts) {
  if (pts.length < 2) return pts.length ? `M ${pts[0][0]},${pts[0][1]}` : '';
  let d = `M ${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i === 0 ? 0 : i - 1];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2 < pts.length ? i + 2 : i + 1];
    const cp1x = p1[0] + (p2[0] - p0[0]) / 6;
    const cp1y = p1[1] + (p2[1] - p0[1]) / 6;
    const cp2x = p2[0] - (p3[0] - p1[0]) / 6;
    const cp2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C ${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return d;
}

// Dimensi grafik "Tren Transaksi" -- dipakai SAMA di svgTrenMingguan (render) & pasangTrenMingguan
// (wiring interaksi mouse) spy hitungan koordinatnya konsisten antara render & hover-detection.
const TREN_DIM = { w: 320, h: 130, padL: 28, padR: 8, padT: 12, padB: 20 };

function trenSkalaY(data) {
  const maxValRaw = Math.max(1, ...data.map(d => Math.max(d.masuk, d.keluar)));
  const magnitude = Math.pow(10, Math.floor(Math.log10(maxValRaw || 1)));
  return Math.ceil(maxValRaw / magnitude) * magnitude || 1;
}

// Grafik tren interaktif (dipakai di Overview): garis melengkung + grid horizontal + tooltip
// yg mengikuti mouse (lihat pasangTrenMingguan utk wiring hover-nya, dipanggil terpisah setelah
// markup ini disisipkan ke DOM -- pola yg sama dgn pasangRangePicker/pasangHeaderSticky dst).
function svgTrenMingguan(data) {
  const { w, h, padL, padR, padT, padB } = TREN_DIM;
  const innerW = w - padL - padR, innerH = h - padT - padB;
  const maxVal = trenSkalaY(data);
  const stepX = innerW / (data.length - 1 || 1);
  const y = (v) => padT + innerH - (v / maxVal) * innerH;
  const x = (i) => padL + i * stepX;

  const titikMasuk = data.map((d, i) => [x(i), y(d.masuk)]);
  const titikKeluar = data.map((d, i) => [x(i), y(d.keluar)]);

  const grid = [0, 0.5, 1].map(f => {
    const gy = padT + innerH - f * innerH;
    return `<line x1="${padL}" y1="${gy.toFixed(1)}" x2="${w - padR}" y2="${gy.toFixed(1)}" stroke="${WARNA.garis}" stroke-width="1" stroke-dasharray="${f === 0 ? 'none' : '3,3'}"/>
      <text x="${padL - 6}" y="${(gy + 3).toFixed(1)}" font-size="11" fill="${WARNA.sorrellDark}" text-anchor="end">${Math.round(maxVal * f)}</text>`;
  }).join('');

  const labels = data.map((d, i) => {
    return `<text x="${x(i).toFixed(1)}" y="${h - 4}" font-size="11" fill="${WARNA.sorrellDark}" text-anchor="middle">${d.label}</text>`;
  }).join('');

  const titikHtml = (pts, warna) => pts.map(([px, py]) => `<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="2.5" fill="${warna}"/>`).join('');

  return `<div class="tren-chart-wrap" data-tren>
    <svg viewBox="0 0 ${w} ${h}" style="width:100%;height:${h}px">
      ${grid}
      <path d="${svgPathHalus(titikKeluar)}" fill="none" stroke="${WARNA.sienna}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="${svgPathHalus(titikMasuk)}" fill="none" stroke="${WARNA.matisse}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
      ${titikHtml(titikKeluar, WARNA.sienna)}
      ${titikHtml(titikMasuk, WARNA.matisse)}
      ${labels}
      <line class="tren-garis-hover" x1="0" y1="${padT}" x2="0" y2="${padT + innerH}" stroke="${WARNA.sorrellDark}" stroke-width="1" stroke-dasharray="3,3" opacity="0"/>
      <circle class="tren-titik-hover" data-seri="masuk" r="4" fill="${WARNA.matisse}" stroke="#fff" stroke-width="1.5" opacity="0"/>
      <circle class="tren-titik-hover" data-seri="keluar" r="4" fill="${WARNA.sienna}" stroke="#fff" stroke-width="1.5" opacity="0"/>
      <rect class="tren-overlay" x="0" y="0" width="${w}" height="${h}" fill="transparent"/>
    </svg>
    <div class="tren-tooltip"></div>
  </div>`;
}

// Wiring hover: gerakkan garis+titik penanda & tooltip mengikuti posisi mouse di atas grafik,
// dipanggil SETELAH svgTrenMingguan() disisipkan ke DOM (lihat pola pasangRangePicker dst).
function pasangTrenMingguan(host, data) {
  const wrap = host.querySelector('[data-tren]');
  if (!wrap) return;
  const svg = wrap.querySelector('svg');
  const overlay = wrap.querySelector('.tren-overlay');
  const garis = wrap.querySelector('.tren-garis-hover');
  const titikMasuk = wrap.querySelector('.tren-titik-hover[data-seri="masuk"]');
  const titikKeluar = wrap.querySelector('.tren-titik-hover[data-seri="keluar"]');
  const tooltip = wrap.querySelector('.tren-tooltip');
  const { w, h, padL, padR, padT, padB } = TREN_DIM;
  const innerW = w - padL - padR, innerH = h - padT - padB;
  const maxVal = trenSkalaY(data);
  const stepX = innerW / (data.length - 1 || 1);
  const y = (v) => padT + innerH - (v / maxVal) * innerH;
  const x = (i) => padL + i * stepX;

  function tampilkan(idx) {
    const d = data[idx];
    const px = x(idx);
    garis.setAttribute('x1', px); garis.setAttribute('x2', px); garis.setAttribute('opacity', '1');
    titikMasuk.setAttribute('cx', px); titikMasuk.setAttribute('cy', y(d.masuk)); titikMasuk.setAttribute('opacity', '1');
    titikKeluar.setAttribute('cx', px); titikKeluar.setAttribute('cy', y(d.keluar)); titikKeluar.setAttribute('opacity', '1');

    tooltip.innerHTML = `<strong>${d.labelPenuh}</strong>
      <span><i style="background:${WARNA.matisse}"></i>Masuk: ${d.masuk}</span>
      <span><i style="background:${WARNA.sienna}"></i>Keluar: ${d.keluar}</span>`;
    tooltip.classList.add('tampil');

    const rectSvg = svg.getBoundingClientRect();
    if (!rectSvg.width) return;
    const skalaX = rectSvg.width / w;
    const leftPx = px * skalaX;
    const tw = tooltip.offsetWidth;
    let left = leftPx - tw / 2;
    left = Math.max(0, Math.min(left, rectSvg.width - tw));
    tooltip.style.left = left.toFixed(1) + 'px';
  }
  function sembunyikan() {
    garis.setAttribute('opacity', '0');
    titikMasuk.setAttribute('opacity', '0');
    titikKeluar.setAttribute('opacity', '0');
    tooltip.classList.remove('tampil');
  }
  function posisiKeIndex(clientX) {
    const rectSvg = svg.getBoundingClientRect();
    const xRatio = rectSvg.width ? (clientX - rectSvg.left) / rectSvg.width : 0;
    const xSvg = xRatio * w;
    return Math.max(0, Math.min(data.length - 1, Math.round((xSvg - padL) / stepX)));
  }
  overlay.addEventListener('mousemove', (e) => tampilkan(posisiKeIndex(e.clientX)));
  overlay.addEventListener('mouseleave', sembunyikan);
}

// Kelompokkan transaksi jadi bucket {label, labelPenuh, masuk, keluar, omzet} mengikuti rentang
// [dari,sampai] APAPUN yg dipilih user di date-picker (bukan selalu "7 hari terakhir" yg dulu
// fixed) -- dipakai grafik Tren Transaksi di Overview. Granularitas menyesuaikan panjang rentang
// spy titik grafiknya tetap enak dibaca: harian kalau pendek (<=14 hari), mingguan kalau sedang
// (<=90 hari), bulanan kalau panjang (>90 hari) -- kalau tetap harian utk rentang setahun, grafik
// bakal rapat >300 titik dan labelnya tumpang tindih.
function bucketAdaptif(dari, sampai) {
  const msHari = 86400000;
  const totalHari = Math.round((new Date(sampai + 'T00:00:00') - new Date(dari + 'T00:00:00')) / msHari) + 1;

  function hitungRentang(dariIso, sampaiEksklusifIso) {
    const b = { masuk: 0, keluar: 0, omzet: 0 };
    DATA.transaksi.forEach(t => {
      if (t.tanggal < dariIso || t.tanggal >= sampaiEksklusifIso) return;
      if (t.tipe === 'masuk') b.masuk += t.qty;
      if (t.tipe === 'keluar') { b.keluar += t.qty; b.omzet += t.qty * (t.hargaSatuan || 0); }
    });
    return b;
  }

  if (totalHari <= 14) {
    const hasil = [];
    for (let i = 0; i < totalHari; i++) {
      const d = new Date(dari + 'T00:00:00'); d.setDate(d.getDate() + i);
      const iso = d.toISOString().slice(0, 10);
      const esok = new Date(d.getTime() + msHari).toISOString().slice(0, 10);
      const label = totalHari <= 7 ? d.toLocaleDateString('id-ID', { weekday: 'short' }) : `${d.getDate()}/${d.getMonth() + 1}`;
      const labelPenuh = d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' });
      hasil.push({ label, labelPenuh, ...hitungRentang(iso, esok) });
    }
    return hasil;
  }

  if (totalHari <= 90) {
    const hasil = [];
    let kursor = new Date(dari + 'T00:00:00');
    const akhir = new Date(sampai + 'T00:00:00');
    while (kursor <= akhir) {
      const mulaiIso = kursor.toISOString().slice(0, 10);
      const batas = new Date(kursor); batas.setDate(batas.getDate() + 7);
      const batasIso = batas.toISOString().slice(0, 10);
      const akhirBucket = new Date(Math.min(batas.getTime() - msHari, akhir.getTime())).toISOString().slice(0, 10);
      hasil.push({ label: `${kursor.getDate()}/${kursor.getMonth() + 1}`, labelPenuh: formatRentangLabel(mulaiIso, akhirBucket), ...hitungRentang(mulaiIso, batasIso) });
      kursor = batas;
    }
    return hasil;
  }

  const hasil = [];
  let kursor = new Date(dari + 'T00:00:00'); kursor.setDate(1);
  const akhir = new Date(sampai + 'T00:00:00');
  const tahunSampai = akhir.getFullYear();
  while (kursor <= akhir) {
    const mulaiIso = kursor.toISOString().slice(0, 10);
    const bulanBerikut = new Date(kursor.getFullYear(), kursor.getMonth() + 1, 1);
    const label = kursor.toLocaleDateString('id-ID', { month: 'short' }) + (kursor.getFullYear() !== tahunSampai ? ` '${String(kursor.getFullYear()).slice(2)}` : '');
    const labelPenuh = kursor.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
    hasil.push({ label, labelPenuh, ...hitungRentang(mulaiIso, bulanBerikut.toISOString().slice(0, 10)) });
    kursor = bulanBerikut;
  }
  return hasil;
}

function persenPerubahan(a, b) {
  if (!b) return a > 0 ? 100 : 0;
  return Math.round(((a - b) / b) * 100);
}

function htmlDelta(persen) {
  if (!isFinite(persen) || persen === 0) return `<span class="teks-lemah">stabil</span>`;
  return persen > 0 ? `<span class="naik">▲ ${persen}%</span>` : `<span class="turun">▼ ${Math.abs(persen)}%</span>`;
}

// Estimasi laba kotor = (harga jual saat transaksi - harga modal SAAT INI di varian) x qty,
// dijumlah dari semua transaksi 'keluar' dlm periode. Pakai harga modal saat ini (bukan
// historis) krn app tidak menyimpan snapshot modal per transaksi -- cukup utk perkiraan kasar,
// bukan pembukuan akuntansi presisi.
function estimasiLabaPeriode(dari, sampai) {
  let laba = 0;
  DATA.transaksi.forEach(t => {
    if (t.tipe !== 'keluar' || t.tanggal < dari || t.tanggal > sampai) return;
    const v = cariVarian(t.produkId, t.varianId);
    const modal = v ? (v.hargaModal || 0) : 0;
    laba += (t.hargaSatuan || 0) * t.qty - modal * t.qty;
  });
  return laba;
}

// Hitung rentang sebelumnya dgn panjang yg sama, persis sebelum tanggal "dari" -- dipakai
// utk bandingan naik/turun yg adil terhadap rentang kustom manapun (bukan cuma 7 hari tetap).
function rentangSebelumnya(dari, sampai) {
  const msHari = 86400000;
  const panjang = Math.round((new Date(sampai) - new Date(dari)) / msHari) + 1;
  const sebelumSampai = new Date(new Date(dari).getTime() - msHari);
  const sebelumMulai = new Date(sebelumSampai.getTime() - (panjang - 1) * msHari);
  return { dari: sebelumMulai.toISOString().slice(0, 10), sampai: sebelumSampai.toISOString().slice(0, 10) };
}

function daftarStokMenipis() {
  return daftarVarianDenganStok().filter(v => v.stok <= (v.produk.stokMinim ?? 3)).sort((a, b) => a.stok - b.stok);
}

// Pintasan "buka Laporan [jenis]" dipakai dari header Produk/Transaksi/Pembukuan & kartu
// Overview -- pilih tab yg relevan lebih dulu baru pindah halaman (atau render ulang langsung
// kalau memang sudah di #laporan, krn ganti hash yg sama tidak memicu event hashchange).
function bukaLaporan(jenis) {
  JENIS_LAPORAN_AKTIF = jenis;
  if (ambilRute().halaman === 'laporan') render();
  else location.hash = '#laporan';
}
function htmlTombolLaporan(jenis, tip) {
  return `<button type="button" class="btn" data-buka-laporan="${jenis}" data-tip="${escapeHtml(tip)}">${IKON.laporanKecil} Laporan</button>`;
}

// ============================================================
// LONCENG STOK MENIPIS (di sidebar)
// ============================================================
function perbaruiLonceng() {
  const jumlah = daftarStokMenipis().length;
  const el = document.getElementById('bellCount');
  if (!el) return;
  if (jumlah > 0) { el.hidden = false; el.textContent = jumlah > 99 ? '99+' : jumlah; }
  else el.hidden = true;
}

// ============================================================
// ROUTER
// ============================================================
function ambilRute() {
  const hash = (location.hash || '#dashboard').slice(1);
  const [halaman, param] = hash.split('/');
  return { halaman: halaman || 'dashboard', param };
}

const HALAMAN_KHUSUS_PEMILIK = ['pembukuan', 'pembukuan-dinda', 'pembukuan-retro'];

function render() {
  const { halaman, param } = ambilRute();

  // Karyawan (bukan pemilik) tidak boleh lihat 3 menu pembukuan -- link sidebar-nya disembunyikan
  // DI SINI (idempotent, aman dipanggil ulang tiap render), dan kalau nekat ketik hash-nya
  // langsung di address bar, dialihkan balik ke dashboard drpd halamannya ikut ke-render. Lihat
  // catatan lengkap di apakahPemilik() (data.js) soal ini cuma pembeda TAMPILAN, bukan keamanan
  // data sungguhan (dokumen Firestore-nya tetap 1, sama2 bisa dibaca akun mana pun yg login).
  const pemilik = apakahPemilik();
  HALAMAN_KHUSUS_PEMILIK.forEach(kode => {
    const el = document.querySelector(`.nav__item[data-nav="${kode}"]`);
    if (el) el.hidden = !pemilik;
  });
  if (!pemilik && HALAMAN_KHUSUS_PEMILIK.includes(halaman)) {
    location.hash = '#dashboard';
    return;
  }

  // Dipakai style.css (body[data-ws-aktif="..."]) utk mewarnai judul/tombol sesuai workspace
  // pembukuan yg aktif -- direset di sini, lalu diisi ulang oleh renderPembukuan/renderPembukuanWs
  // kalau memang itu halamannya. Reset dulu supaya tidak "nyangkut" begitu pindah ke halaman lain.
  document.body.removeAttribute('data-ws-aktif');
  document.querySelectorAll('.nav__item').forEach(el => {
    el.classList.toggle('aktif', el.dataset.nav === halaman);
  });
  const scrollEl = document.getElementById('kontenScroll');
  scrollEl.scrollTop = 0;
  if (SCROLL_STICKY_HANDLER) { scrollEl.removeEventListener('scroll', SCROLL_STICKY_HANDLER); SCROLL_STICKY_HANDLER = null; }
  document.getElementById('halamanStickyHost').innerHTML = '';
  renderBanner();
  perbaruiLonceng();
  if (halaman === 'transaksi' && FILTER_CHANNEL_AWAL) {
    FILTER_TRANSAKSI.channel = FILTER_CHANNEL_AWAL;
    FILTER_CHANNEL_AWAL = '';
  }
  renderSidebarFilter(halaman, param);
  if (halaman === 'dashboard') renderDashboard();
  else if (halaman === 'produk' && param) renderProdukDetail(param);
  else if (halaman === 'produk') renderProdukList();
  else if (halaman === 'transaksi') renderTransaksi();
  else if (halaman === 'pembukuan') renderPembukuan();
  else if (halaman === 'pembukuan-dinda') renderPembukuanWs('dinda');
  else if (halaman === 'pembukuan-retro') renderPembukuanWs('retro');
  else if (halaman === 'laporan') renderLaporan();
  else if (halaman === 'pengaturan') renderPengaturan();
  else renderDashboard();
}

// Header (judul + toolbar) di Overview/Produk/Transaksi dirender ke #halamanStickyHost --
// elemen ini SIBLING dari #kontenUtama (bukan child), jadi lebarnya penuh selebar .konten
// (sidebar s.d. batas jendela), nempel di top:0 (position:sticky, tidak ikut tergulung) lalu
// "menipis" (judul & subjudul menyusut/hilang, padding menipis) begitu halaman discroll, lewat
// kelas .mengecil (lihat style.css). Toggle kelasnya digeser ke requestAnimationFrame supaya
// tidak menumpuk beberapa kali per frame saat scroll cepat -- itu yg bikin animasinya patah-patah
// sebelumnya. Dipasang ulang tiap render halaman ybs; listener lama dicopot di render() supaya
// tidak menumpuk saat pindah-pindah halaman.
function KONTEN_STICKY() { return document.getElementById('halamanStickyHost'); }

function pasangHeaderSticky() {
  const scrollEl = document.getElementById('kontenScroll');
  const host = KONTEN_STICKY();
  let dijadwalkan = false;
  const terapkan = () => {
    host.classList.toggle('mengecil', scrollEl.scrollTop > 10);
    dijadwalkan = false;
  };
  const handler = () => {
    if (dijadwalkan) return;
    dijadwalkan = true;
    requestAnimationFrame(terapkan);
  };
  terapkan();
  scrollEl.addEventListener('scroll', handler, { passive: true });
  SCROLL_STICKY_HANDLER = handler;
}

const IKON_VIEW = {
  list: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 6h16M4 12h16M4 18h16"/></svg>',
  detail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="4" width="18" height="7" rx="1.5"/><rect x="3" y="13" width="18" height="7" rx="1.5"/></svg>',
  besar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="8" height="8" rx="1.5"/><rect x="13" y="3" width="8" height="8" rx="1.5"/><rect x="3" y="13" width="8" height="8" rx="1.5"/><rect x="13" y="13" width="8" height="8" rx="1.5"/></svg>'
};

// Filter kontekstual tiap halaman (Kategori/Koleksi/Channel + Tampilan/Urutkan utk Produk,
// Tipe/Channel utk Transaksi) hidup di sidebar kiri (bukan di dalam halaman) supaya tetap
// terlihat & halaman itu sendiri lebih ringkas. Semua tools ini sengaja HANYA muncul di
// halaman daftar yg relevan -- panel disembunyikan total di halaman lain (mis. detail produk),
// karena filter/sortir daftar tidak berlaku lagi saat yang tampil cuma satu produk.
function grupChipFilter(label, key, opsi, filterState, ikonKanal) {
  return `<div class="sidebar-filter-grup">
    <div class="sidebar-filter-label">${label}</div>
    <div class="sidebar-filter-chips" data-grup-fkey="${key}">
      <button type="button" class="chip-filter-v ${!filterState[key] ? 'aktif' : ''}" data-fkey="${key}" data-fval="">Semua</button>
      ${opsi.map(o => `<button type="button" class="chip-filter-v ${filterState[key] === o ? 'aktif' : ''}" data-fkey="${key}" data-fval="${escapeHtml(o)}">${ikonKanal ? ikonChannel(o) : ''}${escapeHtml(o)}</button>`).join('')}
    </div>
  </div>`;
}

function renderSidebarFilter(halaman, param) {
  const host = document.getElementById('sidebarFilterProduk');
  if (halaman === 'produk' && !param) renderSidebarFilterProduk(host);
  else if (halaman === 'transaksi') renderSidebarFilterTransaksi(host);
  else if (halaman === 'pembukuan') renderSidebarFilterPembukuan(host);
  else if (halaman === 'pembukuan-dinda') renderSidebarFilterPembukuanWs(host, 'dinda');
  else if (halaman === 'pembukuan-retro') renderSidebarFilterPembukuanWs(host, 'retro');
  else { host.hidden = true; host.innerHTML = ''; }
}

function renderSidebarFilterProduk(host) {
  host.hidden = false;

  const tampilanHtml = `
    <div class="sidebar-filter-grup">
      <div class="sidebar-filter-label">Tampilan</div>
      <div class="view-toggle-baris">
        <button type="button" class="btn-view ${VIEW_PRODUK === 'list' ? 'aktif' : ''}" data-view="list" data-tip="List">${IKON_VIEW.list}</button>
        <button type="button" class="btn-view ${VIEW_PRODUK === 'detail' ? 'aktif' : ''}" data-view="detail" data-tip="Detail">${IKON_VIEW.detail}</button>
        <button type="button" class="btn-view ${VIEW_PRODUK === 'besar' ? 'aktif' : ''}" data-view="besar" data-tip="Besar">${IKON_VIEW.besar}</button>
      </div>
    </div>
    <div class="sidebar-filter-grup">
      <div class="sidebar-filter-label">Urutkan Stok</div>
      <select id="selSortProduk" class="select-kecil">
        <option value="">Nama (A-Z)</option>
        <option value="stok-tinggi" ${SORT_PRODUK === 'stok-tinggi' ? 'selected' : ''}>Tertinggi</option>
        <option value="stok-rendah" ${SORT_PRODUK === 'stok-rendah' ? 'selected' : ''}>Terendah</option>
      </select>
    </div>`;

  host.innerHTML = grupChipFilter('Kategori', 'kategori', kategoriTerpakai(), FILTER_PRODUK)
    + grupChipFilter('Koleksi', 'koleksi', koleksiTerpakai(), FILTER_PRODUK)
    + grupChipFilter('Channel', 'channel', CHANNEL_LIST, FILTER_PRODUK, true)
    + tampilanHtml;
  host.querySelectorAll('[data-fkey]').forEach(btn => {
    btn.addEventListener('click', () => {
      FILTER_PRODUK[btn.dataset.fkey] = btn.dataset.fval;
      renderSidebarFilterProduk(host);
      if (REFRESH_GRID_PRODUK) REFRESH_GRID_PRODUK();
    });
  });
  host.querySelectorAll('[data-view]').forEach(btn => {
    btn.addEventListener('click', () => {
      VIEW_PRODUK = btn.dataset.view;
      renderSidebarFilterProduk(host);
      if (REFRESH_GRID_PRODUK) REFRESH_GRID_PRODUK();
    });
  });
  const selSort = host.querySelector('#selSortProduk');
  if (selSort) {
    selSort.addEventListener('change', () => {
      SORT_PRODUK = selSort.value;
      if (REFRESH_GRID_PRODUK) REFRESH_GRID_PRODUK();
    });
  }
}

// Transaksi TIDAK punya pilihan Tampilan (selalu tabel) -- hanya filter Tipe & Channel.
// Periode/rentang tanggal dipisah dari sini, memakai tool kalender yg sama dgn Overview
// (lihat htmlRangePicker/pasangRangePicker di rangepicker.js), ditaruh di header halaman.
function renderSidebarFilterTransaksi(host) {
  host.hidden = false;
  const grupTipe = `<div class="sidebar-filter-grup">
    <div class="sidebar-filter-label">Tipe</div>
    <div class="sidebar-filter-chips">
      <button type="button" class="chip-filter-v ${!FILTER_TRANSAKSI.tipe ? 'aktif' : ''}" data-fkey="tipe" data-fval="">Semua</button>
      <button type="button" class="chip-filter-v ${FILTER_TRANSAKSI.tipe === 'masuk' ? 'aktif' : ''}" data-fkey="tipe" data-fval="masuk">Masuk</button>
      <button type="button" class="chip-filter-v ${FILTER_TRANSAKSI.tipe === 'keluar' ? 'aktif' : ''}" data-fkey="tipe" data-fval="keluar">Keluar</button>
      <button type="button" class="chip-filter-v ${FILTER_TRANSAKSI.tipe === 'koreksi' ? 'aktif' : ''}" data-fkey="tipe" data-fval="koreksi">Koreksi</button>
    </div>
  </div>`;
  host.innerHTML = grupTipe + grupChipFilter('Channel', 'channel', CHANNEL_LIST, FILTER_TRANSAKSI, true);
  host.querySelectorAll('[data-fkey]').forEach(btn => {
    btn.addEventListener('click', () => {
      FILTER_TRANSAKSI[btn.dataset.fkey] = btn.dataset.fval;
      renderSidebarFilterTransaksi(host);
      if (REFRESH_TABEL_TRANSAKSI) REFRESH_TABEL_TRANSAKSI();
    });
  });
}

// Pembukuan hanya punya filter Tipe (Masuk/Keluar) -- rentang tanggal dipisah lewat kalender
// di header halaman (sama pola dgn Transaksi/Laporan).
function renderSidebarFilterPembukuan(host) {
  host.hidden = false;
  host.innerHTML = `<div class="sidebar-filter-grup">
    <div class="sidebar-filter-label">Tipe</div>
    <div class="sidebar-filter-chips">
      <button type="button" class="chip-filter-v ${!FILTER_PEMBUKUAN.tipe ? 'aktif' : ''}" data-fkey="tipe" data-fval="">Semua</button>
      <button type="button" class="chip-filter-v ${FILTER_PEMBUKUAN.tipe === 'masuk' ? 'aktif' : ''}" data-fkey="tipe" data-fval="masuk">Uang Masuk</button>
      <button type="button" class="chip-filter-v ${FILTER_PEMBUKUAN.tipe === 'keluar' ? 'aktif' : ''}" data-fkey="tipe" data-fval="keluar">Uang Keluar</button>
    </div>
  </div>`;
  host.querySelectorAll('[data-fkey]').forEach(btn => {
    btn.addEventListener('click', () => aturFilterTipePembukuan(btn.dataset.fval));
  });
}

// Dipakai baik oleh chip filter Tipe di sidebar maupun kotak ringkasan Uang Masuk/Keluar di
// halaman Pembukuan sendiri -- keduanya mengontrol state yg sama (FILTER_PEMBUKUAN.tipe) &
// harus saling sinkron begitu salah satunya diklik. Klik ulang nilai yg sama = reset ke "Semua".
function aturFilterTipePembukuan(nilai) {
  FILTER_PEMBUKUAN.tipe = FILTER_PEMBUKUAN.tipe === nilai ? '' : nilai;
  const sidebarHost = document.getElementById('sidebarFilterProduk');
  if (sidebarHost) renderSidebarFilterPembukuan(sidebarHost);
  if (REFRESH_TABEL_PEMBUKUAN) REFRESH_TABEL_PEMBUKUAN();
}

// Sama pola dgn renderSidebarFilterPembukuan/aturFilterTipePembukuan (Senantiasa) di atas,
// diparameterkan by wsId utk dipakai Dinda Personal Finance & Retro Gaming Space Seririt.
function renderSidebarFilterPembukuanWs(host, wsId) {
  host.hidden = false;
  const f = FILTER_PEMBUKUAN_WS[wsId];
  host.innerHTML = `<div class="sidebar-filter-grup">
    <div class="sidebar-filter-label">Tipe</div>
    <div class="sidebar-filter-chips">
      <button type="button" class="chip-filter-v ${!f.tipe ? 'aktif' : ''}" data-fkey="tipe" data-fval="">Semua</button>
      <button type="button" class="chip-filter-v ${f.tipe === 'masuk' ? 'aktif' : ''}" data-fkey="tipe" data-fval="masuk">Uang Masuk</button>
      <button type="button" class="chip-filter-v ${f.tipe === 'keluar' ? 'aktif' : ''}" data-fkey="tipe" data-fval="keluar">Uang Keluar</button>
    </div>
  </div>`;
  host.querySelectorAll('[data-fkey]').forEach(btn => {
    btn.addEventListener('click', () => aturFilterTipePembukuanWs(wsId, btn.dataset.fval));
  });
}

function aturFilterTipePembukuanWs(wsId, nilai) {
  const f = FILTER_PEMBUKUAN_WS[wsId];
  f.tipe = f.tipe === nilai ? '' : nilai;
  const sidebarHost = document.getElementById('sidebarFilterProduk');
  if (sidebarHost) renderSidebarFilterPembukuanWs(sidebarHost, wsId);
  if (REFRESH_TABEL_PEMBUKUAN_WS[wsId]) REFRESH_TABEL_PEMBUKUAN_WS[wsId]();
}

window.addEventListener('hashchange', render);

// ============================================================
// PWA: instal sebagai aplikasi (lihat sw.js utk catatan lengkap syaratnya)
// ============================================================
// Browser (Chrome/Edge) nahan event ini & baru nawarin instal kalau kriteria PWA terpenuhi
// (manifest+SW valid, dibuka via http/https). e.preventDefault() nyegah prompt bawaan browser
// muncul otomatis -- disimpan dulu, baru dipicu manual pas tombol "Instal Aplikasi" di
// Pengaturan diklik (lihat renderPengaturan). Kalau event ini tidak PERNAH terpicu (mis. dibuka
// via file://, atau sudah terinstal), tombolnya tetap disembunyikan -- itu perilaku normal.
let PWA_DEFERRED_PROMPT = null;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  PWA_DEFERRED_PROMPT = e;
  const tombol = document.getElementById('btnInstalPWA');
  if (tombol) tombol.hidden = false;
});
window.addEventListener('appinstalled', () => {
  PWA_DEFERRED_PROMPT = null;
  tampilkanToast('Senantiasa berhasil diinstal sbg aplikasi.', 'sukses');
});

document.addEventListener('DOMContentLoaded', () => {
  // muatData() + render() pertama kali SEKARANG dipicu dari assets/js/auth.js, setelah login
  // Firebase berhasil (app ini butuh login dulu spy tahu dokumen Firestore siapa yg mau dibuka --
  // lihat pathDokumenFirestore() di data.js). Bagian di bawah ini semuanya wiring yg tidak
  // butuh DATA, jadi aman tetap jalan duluan di sini spy tidak nunggu login dulu.

  // Lihat catatan panjang di sw.js -- ini SENGAJA no-op diam2 kalau dibuka via file:// (API-nya
  // memang tidak ada di context itu) atau browser lama yg tidak dukung service worker.
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => { navigator.serviceWorker.register('sw.js').catch(() => {}); });
  }

  document.getElementById('btnBellSidebar').addEventListener('click', () => {
    SORT_PRODUK = 'stok-rendah';
    if (ambilRute().halaman === 'produk' && !ambilRute().param) render();
    else location.hash = '#produk';
  });

  // Reload penuh setelah logout (bukan cuma tampilkan gerbang lagi) supaya semua state lama
  // (listener Firestore realtime, DATA yg sudah kemuat, dsb) benar2 bersih sebelum login lagi.
  document.getElementById('btnKeluar').addEventListener('click', async () => {
    if (window.firebaseAuth) await window.firebaseAuth.signOut();
    location.reload();
  });

  // Delegasi satu listener utk semua tombol pintasan "Laporan" -- elemen pemicunya bisa hidup
  // di sticky-host (header Produk/Transaksi/Pembukuan) atau di KONTEN (kartu Overview), jadi
  // lebih simpel dipasang sekali di sini drpd dipasang ulang di tiap fungsi render halaman.
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-buka-laporan]');
    if (btn) bukaLaporan(btn.dataset.bukaLaporan);
  });

  // ---------- Sidebar sbg drawer di layar sempit (lihat @media di style.css) ----------
  // Nav/filter/footer di dalam sidebar itu markup STATIS (tidak digambar ulang tiap render()),
  // jadi listener2 di bawah ini aman dipasang SEKALI di sini, tidak perlu dipasang ulang.
  function tutupMenuMobile() { document.body.classList.remove('menu-terbuka'); }
  document.getElementById('btnBukaMenu').addEventListener('click', () => document.body.classList.toggle('menu-terbuka'));
  document.getElementById('btnTutupMenu').addEventListener('click', tutupMenuMobile);
  document.getElementById('sidebarBackdrop').addEventListener('click', tutupMenuMobile);
  document.querySelectorAll('.nav__item').forEach((a) => a.addEventListener('click', tutupMenuMobile));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') tutupMenuMobile(); });

  pasangTooltipGlobal();
  pasangFotoOtomatis();
});

// ============================================================
// BANNER PERINGATAN BACKUP
// ============================================================
function renderBanner() {
  const host = document.getElementById('bannerHost');
  const statusEl = document.getElementById('statusBackup');
  const punyaData = DATA.produk.length > 0 || DATA.transaksi.length > 0;
  const hari = hariSejakBackupTerakhir();

  if (DATA.pengaturan.lastBackupAt) {
    statusEl.textContent = 'Cadangan terakhir: ' + formatTanggal(DATA.pengaturan.lastBackupAt);
    statusEl.classList.toggle('peringatan', hari > BATAS_HARI_PERINGATAN_BACKUP);
  } else {
    statusEl.textContent = 'Belum pernah dicadangkan';
    statusEl.classList.toggle('peringatan', punyaData);
  }

  if (punyaData && hari > BATAS_HARI_PERINGATAN_BACKUP) {
    const teksWaktu = DATA.pengaturan.lastBackupAt ? `Sudah ${Math.floor(hari)} hari sejak cadangan data terakhir` : 'Belum pernah mengunduh cadangan data';
    host.innerHTML = `<div class="banner">
      <span>⚠️ ${teksWaktu}. Data hanya tersimpan di browser ini -- kalau cache terhapus, semua catatan bisa hilang.</span>
      <button class="link" id="btnBackupDariBanner">Unduh Cadangan Sekarang</button>
    </div>`;
    host.querySelector('#btnBackupDariBanner').onclick = () => { unduhCadangan(); tampilkanToast('Cadangan berhasil diunduh.', 'sukses'); render(); };
  } else {
    host.innerHTML = '';
  }
}

// ============================================================
// DASHBOARD
// ============================================================
function renderDashboard() {
  const semuaVarian = daftarVarianDenganStok();
  const totalProduk = DATA.produk.length;
  const totalVarian = semuaVarian.length;
  const totalStok = semuaVarian.reduce((a, v) => a + v.stok, 0);
  const nilaiModal = semuaVarian.reduce((a, v) => a + v.stok * (v.varian.hargaModal || 0), 0);
  const stokMenipis = daftarStokMenipis();

  inisialisasiRentangOverview();
  const { dari: rDari, sampai: rSampai } = RENTANG_OVERVIEW;
  const bucketTren = bucketAdaptif(rDari, rSampai);
  const transaksiPeriode = DATA.transaksi.filter(t => t.tipe === 'keluar' && t.tanggal >= rDari && t.tanggal <= rSampai);
  const omzetPeriode = transaksiPeriode.reduce((a, t) => a + t.qty * (t.hargaSatuan || 0), 0);
  const qtyTerjualPeriode = transaksiPeriode.reduce((a, t) => a + t.qty, 0);
  const periodeSebelum = rentangSebelumnya(rDari, rSampai);
  const omzetSebelum = DATA.transaksi.filter(t => t.tipe === 'keluar' && t.tanggal >= periodeSebelum.dari && t.tanggal <= periodeSebelum.sampai)
    .reduce((a, t) => a + t.qty * (t.hargaSatuan || 0), 0);
  const deltaOmzet = persenPerubahan(omzetPeriode, omzetSebelum);
  const labaPeriode = estimasiLabaPeriode(rDari, rSampai);
  const labaSebelum = estimasiLabaPeriode(periodeSebelum.dari, periodeSebelum.sampai);
  const deltaLaba = persenPerubahan(labaPeriode, labaSebelum);

  const ringkasChannel = {};
  CHANNEL_LIST.forEach(c => ringkasChannel[c] = { qty: 0, omzet: 0 });
  transaksiPeriode.forEach(t => {
    if (!ringkasChannel[t.channel]) ringkasChannel[t.channel] = { qty: 0, omzet: 0 };
    ringkasChannel[t.channel].qty += t.qty;
    ringkasChannel[t.channel].omzet += t.qty * (t.hargaSatuan || 0);
  });
  const maxChannelOmzet = Math.max(1, ...CHANNEL_LIST.map(c => ringkasChannel[c].omzet));

  const pembukuanPeriode = totalPembukuan(rDari, rSampai);
  const perSumberPembukuan = {};
  CHANNEL_PEMBUKUAN.forEach(c => perSumberPembukuan[c] = 0);
  pembukuanPeriode.list.filter(x => x.tipe === 'masuk').forEach(x => { perSumberPembukuan[x.sumber] = (perSumberPembukuan[x.sumber] || 0) + x.jumlah; });
  const maxSumberPembukuan = Math.max(1, ...CHANNEL_PEMBUKUAN.map(c => perSumberPembukuan[c]));

  const kelompokList = kelompokBiayaTerpakai();
  const perKelompokPembukuan = {};
  kelompokList.forEach(k => perKelompokPembukuan[k] = 0);
  pembukuanPeriode.list.filter(x => x.tipe === 'keluar').forEach(x => { perKelompokPembukuan[x.kelompok] = (perKelompokPembukuan[x.kelompok] || 0) + x.jumlah; });
  const kelompokTerbanyak = kelompokList.slice().sort((a, b) => perKelompokPembukuan[b] - perKelompokPembukuan[a]).slice(0, 4);
  const maxKelompokPembukuan = Math.max(1, ...kelompokTerbanyak.map(k => perKelompokPembukuan[k]));

  KONTEN_STICKY().innerHTML = `
    <div class="halaman-sticky-host__inner">
      <div class="halaman__header">
        <div><h1>Overview</h1><p>Ringkasan inventory Senantiasa &middot; ${new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p></div>
        ${htmlRangePicker(RENTANG_OVERVIEW)}
      </div>
    </div>
  `;

  const pemilik = apakahPemilik();

  KONTEN().innerHTML = `
    <div class="overview-compact">
    <div class="${pemilik ? 'overview-grid-3col' : 'overview-grid-2col'}">
      <div class="overview-kolom">
        <div class="overview-kolom__head">
          <h2 class="overview-kolom__judul">Stok</h2>
          ${htmlTombolLaporan('stok', 'Buka Laporan Stok')}
        </div>
        <div class="grid-3-kecil">
          <div class="stat klik" data-arah="#produk" data-tip="Lihat semua produk">
            <div class="stat__top"><div class="stat__icon stat__icon--sorrell">${IKON.box}</div></div>
            <div class="stat__label">Total Produk</div>
            <div class="stat__nilai">${totalProduk}</div>
          </div>
          <div class="stat klik" data-arah="#produk" data-tip="Lihat stok tiap produk">
            <div class="stat__top"><div class="stat__icon stat__icon--matisse">${IKON.stack}</div></div>
            <div class="stat__label">Total Stok</div>
            <div class="stat__nilai">${totalStok}</div>
          </div>
          <div class="stat klik" data-arah="#laporan" data-tip="Buka Laporan &middot; harga modal &times; stok saat ini">
            <div class="stat__top"><div class="stat__icon stat__icon--sienna">${IKON.wallet}</div></div>
            <div class="stat__label">Nilai Stok</div>
            <div class="stat__nilai">${formatRupiah(nilaiModal)}</div>
          </div>
        </div>
        <div class="overview-label-kecil">Stok per Channel</div>
        <div class="grid-3-kecil">
          ${CHANNEL_LIST.map(c => {
            const stokC = totalStokChannel(c);
            const bisaCek = !!CHANNEL_LINK[c];
            const hari = hariSejakCekStok(c);
            const sudahCek = bisaCek && isFinite(hari) && hari <= BATAS_HARI_PERINGATAN_CEK_STOK;
            const teksCek = !bisaCek ? 'Toko fisik' : isFinite(hari) ? `Dicek ${Math.floor(hari)}h lalu` : 'Belum pernah dicek';
            return `<div class="mini-stat-channel klik" data-arah="#transaksi" data-channel="${c}" data-tip="${escapeHtml(c)}: ${stokC} item &middot; ${escapeHtml(teksCek)}">
              <div class="mini-stat-channel__top">
                ${ikonChannel(c)}
                ${bisaCek ? `<button type="button" class="cek-stok-toggle cek-stok-toggle--kecil ${sudahCek ? 'sudah' : ''}" data-tandai-cek="${c}" data-tip="${sudahCek ? 'Sudah dicek' : 'Tandai sudah dicek hari ini'}">
                  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4L19 7"/></svg>
                </button>` : ''}
              </div>
              <div class="mini-stat-channel__nilai">${stokC}</div>
              <div class="mini-stat-channel__nama">${escapeHtml(c)}</div>
            </div>`;
          }).join('')}
        </div>
        <div class="kartu kartu-kompak kartu-sisa">
          <h2>Stok Menipis</h2>
          ${stokMenipis.length ? `<div class="tabel-wrap"><table><tbody>
            ${stokMenipis.slice(0, 4).map(v => `<tr>
              <td><a href="#produk/${v.produk.id}">${escapeHtml(v.produk.nama)}</a> <span class="teks-lemah">${escapeHtml(labelVarian(v.varian))}</span></td>
              <td class="teks-kanan">${v.stok}</td>
            </tr>`).join('')}
          </tbody></table></div>` : `<div class="kosong">Semua stok aman.</div>`}
        </div>
      </div>

      <div class="overview-kolom">
        <div class="overview-kolom__head">
          <h2 class="overview-kolom__judul">Penjualan</h2>
          ${htmlTombolLaporan('transaksi', 'Buka Laporan Transaksi')}
        </div>
        <div class="kartu">
          <h2>Tren Transaksi <span class="teks-lemah" style="font-weight:500;font-size:11px">&middot; ${formatRentangLabel(rDari, rSampai)}</span></h2>
          ${svgTrenMingguan(bucketTren)}
          <div class="legenda-chart">
            <span data-tip="Barang masuk/restock"><i style="background:${WARNA.matisse}"></i>Masuk</span>
            <span data-tip="Barang terjual"><i style="background:${WARNA.sienna}"></i>Keluar</span>
          </div>
        </div>
        <div class="grid-2-kecil">
          <div class="stat stat--hero klik" data-arah="#laporan" data-tip="Buka Laporan penjualan &middot; ${qtyTerjualPeriode} pcs terjual">
            <div class="stat__top"><div class="stat__icon stat__icon--almond">${IKON.trend}</div></div>
            <div class="stat__label">Omzet</div>
            <div class="stat__nilai">${formatRupiah(omzetPeriode)}</div>
            <div class="stat__sub">${htmlDelta(deltaOmzet)}</div>
          </div>
          <div class="stat klik" data-arah="#laporan" data-tip="Estimasi kasar: harga jual - harga modal saat ini, belum dikurangi biaya operasional/ongkir">
            <div class="stat__top"><div class="stat__icon stat__icon--laba">${IKON.laba}</div></div>
            <div class="stat__label">Laba</div>
            <div class="stat__nilai">${formatRupiah(labaPeriode)}</div>
            <div class="stat__sub">${htmlDelta(deltaLaba)}</div>
          </div>
        </div>
        <div class="kartu kartu-kompak kartu-sisa">
          <h2>Penjualan per Channel</h2>
          ${CHANNEL_LIST.map(c => {
            const d = ringkasChannel[c];
            const persen = Math.round((d.omzet / maxChannelOmzet) * 100);
            return `<div class="kategori-baris baris-klik" data-arah="#transaksi" data-channel="${c}" data-tip="${escapeHtml(c)}: ${formatRupiah(d.omzet)}">
              <span>${badgeChannel(c)}</span>
              <div class="bar-track"><div class="bar-isi ${kelasBarChannel(c)}" style="width:${persen}%"></div></div>
              <span class="teks-kanan">${d.qty} pcs</span>
            </div>`;
          }).join('')}
        </div>
      </div>

      ${!pemilik ? '' : `<div class="overview-kolom">
        <div class="overview-kolom__head">
          <h2 class="overview-kolom__judul">Pembukuan</h2>
          ${htmlTombolLaporan('pembukuan', 'Buka Laporan Pembukuan')}
        </div>
        <div class="grid-2-kecil">
          <div class="stat klik ${pembukuanPeriode.bersih < 0 ? 'warn' : ''}" data-arah="#pembukuan" data-tip="Buka Pembukuan &middot; Saldo bersih ${formatRupiah(pembukuanPeriode.bersih)}">
            <div class="stat__top"><div class="stat__icon stat__icon--matisse">${IKON.trend}</div></div>
            <div class="stat__label">Uang Masuk</div>
            <div class="stat__nilai">${formatRupiah(pembukuanPeriode.masuk)}</div>
          </div>
          <div class="stat klik" data-arah="#pembukuan" data-tip="Buka Pembukuan">
            <div class="stat__top"><div class="stat__icon stat__icon--sienna">${IKON.wallet}</div></div>
            <div class="stat__label">Uang Keluar</div>
            <div class="stat__nilai">${formatRupiah(pembukuanPeriode.keluar)}</div>
          </div>
        </div>
        <div class="kartu kartu-kompak">
          <h2>Pengeluaran Terbanyak</h2>
          ${kelompokTerbanyak.length ? kelompokTerbanyak.map(k => {
            const persen = Math.round((perKelompokPembukuan[k] / maxKelompokPembukuan) * 100);
            return `<div class="kategori-baris baris-klik" data-arah="#pembukuan" data-tip="${escapeHtml(k)}: ${formatRupiah(perKelompokPembukuan[k])}">
              <span>${escapeHtml(k)}</span>
              <div class="bar-track"><div class="bar-isi" style="width:${persen}%;background:${WARNA.sienna}"></div></div>
              <span class="teks-kanan">${formatRupiah(perKelompokPembukuan[k])}</span>
            </div>`;
          }).join('') : `<div class="kosong">Belum ada kelompok biaya.</div>`}
        </div>
        <div class="kartu kartu-kompak kartu-sisa">
          <h2>Pemasukan per Channel</h2>
          ${CHANNEL_PEMBUKUAN.map(c => {
            const persen = Math.round((perSumberPembukuan[c] / maxSumberPembukuan) * 100);
            return `<div class="kategori-baris baris-klik" data-arah="#pembukuan" data-tip="${escapeHtml(c)}: ${formatRupiah(perSumberPembukuan[c])}">
              <span>${badgeChannel(c)}</span>
              <div class="bar-track"><div class="bar-isi ${kelasBarChannel(c)}" style="width:${persen}%"></div></div>
              <span class="teks-kanan">${formatRupiah(perSumberPembukuan[c])}</span>
            </div>`;
          }).join('')}
        </div>
      </div>`}
    </div>
    </div>
  `;

  KONTEN().querySelectorAll('[data-tandai-cek]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const c = btn.dataset.tandaiCek;
      konfirmasi(`Yakin sudah cek stok channel <strong>${escapeHtml(c)}</strong> hari ini?`, () => {
        tandaiCekStok(c);
        tampilkanToast(`${c} ditandai sudah dicek.`, 'sukses');
        renderDashboard();
      }, { labelYa: 'Ya, sudah dicek' });
    });
  });

  KONTEN().querySelectorAll('[data-arah]').forEach(el => {
    el.addEventListener('click', (e) => {
      if (e.target.closest('button, a')) return;
      if (el.dataset.channel) FILTER_CHANNEL_AWAL = el.dataset.channel;
      location.hash = el.dataset.arah;
    });
  });

  pasangTrenMingguan(KONTEN(), bucketTren);
  pasangRangePicker({ ambil: () => RENTANG_OVERVIEW, atur: (r) => { RENTANG_OVERVIEW = r; }, render: renderDashboard });
  pasangHeaderSticky();
}

function labelVarian(v) {
  const parts = [v.ukuran, v.warna].filter(Boolean);
  return parts.length ? parts.join(' / ') : 'Default';
}

// ---------- Foto produk: upload manual ATAU otomatis dari folder assets/img/ ----------
// Kalau produk belum punya foto upload manual (p.foto), dicoba otomatis file bernama PERSIS
// sama dgn nama produk di assets/img/ -- urut ekstensi di bawah ini, berhenti begitu satu
// berhasil kemuat. Kalau semua gagal (file tidak ada / nama filenya tidak cocok persis), <img>
// diganti placeholder inisial lewat pasangFotoOtomatis() (lihat listener "error" di bawah).
const EKSTENSI_FOTO_OTOMATIS = ['jpg', 'jpeg', 'png', 'webp'];

function fotoProdukHtml(p, kelasKosong) {
  if (p.foto) return `<img src="${p.foto}" alt="${escapeHtml(p.nama)}">`;
  const namaFile = encodeURIComponent(p.nama);
  return `<img src="assets/img/${namaFile}.${EKSTENSI_FOTO_OTOMATIS[0]}" alt="${escapeHtml(p.nama)}" data-foto-otomatis="${namaFile}" data-eks-idx="0" data-inisial="${escapeHtml((p.nama || '?')[0].toUpperCase())}" data-kelas-kosong="${kelasKosong}">`;
}

// Event "error" pada <img> TIDAK bubble spt event lain -- makanya harus didengar di fase
// CAPTURING (parameter ketiga `true`) di document, bukan delegasi bubble biasa. Dipasang SEKALI
// di DOMContentLoaded (lihat pasangTooltipGlobal utk pola yg sama), bukan per-render.
function pasangFotoOtomatis() {
  document.addEventListener('error', (e) => {
    const img = e.target;
    if (!(img instanceof HTMLImageElement) || !img.dataset.fotoOtomatis) return;
    const idxBerikut = Number(img.dataset.eksIdx) + 1;
    if (idxBerikut < EKSTENSI_FOTO_OTOMATIS.length) {
      img.dataset.eksIdx = idxBerikut;
      img.src = `assets/img/${img.dataset.fotoOtomatis}.${EKSTENSI_FOTO_OTOMATIS[idxBerikut]}`;
    } else {
      const div = document.createElement('div');
      div.className = img.dataset.kelasKosong;
      div.textContent = img.dataset.inisial;
      img.replaceWith(div);
    }
  }, true);
}

// ============================================================
// PRODUK -- LIST
// ============================================================
function renderProdukList() {
  const kontainer = KONTEN();

  KONTEN_STICKY().innerHTML = `
    <div class="halaman-sticky-host__inner">
      <div class="halaman__header">
        <div><h1>Produk</h1><p>${DATA.produk.length} produk terdaftar${FILTER_PRODUK.kategori || FILTER_PRODUK.koleksi || FILTER_PRODUK.channel ? ' &middot; filter aktif di sidebar' : ''}</p></div>
        <div class="halaman__header-aksi">
          ${htmlTombolLaporan('stok', 'Buka Laporan Stok')}
          <button class="btn" id="btnCatatTransaksiProduk" data-tip="Catat barang masuk/keluar tanpa pindah menu">+ Catat Transaksi</button>
          <button class="btn btn-primer" id="btnTambahProduk">+ Tambah Produk</button>
        </div>
      </div>
      <div class="toolbar">
        <div class="field"><input type="text" id="cariProduk" placeholder="Cari nama produk..."></div>
      </div>
    </div>
  `;
  kontainer.innerHTML = `
    <div class="produk-grid" id="gridProduk"></div>
  `;

  function totalStokProduk(p) { return p.varian.reduce((a, v) => a + hitungStok(p.id, v.id), 0); }
  function hargaMinProduk(p) {
    const hargaList = p.varian.map(v => v.hargaJual || 0).filter(Boolean);
    return hargaList.length ? Math.min(...hargaList) : 0;
  }
  // Dibatasi maks 4 chip -- produk dgn puluhan varian (byk kombinasi warna x ukuran, mis. hasil
  // impor katalog Shopee) dulu nampilin SEMUA chip disini, bikin tinggi kartu jomplang & grid
  // jadi berantakan. Sisanya diringkas jadi satu chip "+N lainnya" (detail lengkap tetap ada di
  // tabel Varian pas kartunya diklik/dibuka).
  function ukuranChipsHtml(p) {
    if (!p.varian.length) return `<span class="hint">Belum ada varian</span>`;
    const MAKS_CHIP = 4;
    const tampil = p.varian.slice(0, MAKS_CHIP);
    const sisa = p.varian.length - tampil.length;
    let html = tampil.map(v => `<span class="chip-ukuran ${hitungStok(p.id, v.id) > 0 ? '' : 'habis'}">${escapeHtml(labelVarian(v))}</span>`).join('');
    if (sisa > 0) html += `<span class="chip-ukuran chip-ukuran--lainnya" data-tip="${sisa} varian lainnya -- klik kartu utk lihat semua">+${sisa} lainnya</span>`;
    return html;
  }
  function dotChannelHtml(p) {
    return CHANNEL_LIST.map(c => {
      const stokC = p.varian.reduce((a, v) => a + hitungStokChannel(p.id, v.id, c), 0);
      return `<span class="dot-channel ${stokC > 0 ? 'd-' + KELAS_CHANNEL[c] : ''}" data-tip="${escapeHtml(c)}: ${stokC > 0 ? stokC + ' item' : 'stok habis'}"></span>`;
    }).join('');
  }

  function kartuBesar(p) {
    const stokP = totalStokProduk(p);
    return `<div class="produk-grid-card" data-id="${p.id}" data-tip="Kelola varian &amp; stok">
      <div class="foto-rasio">
        ${fotoProdukHtml(p, 'foto-rasio__kosong')}
        <div class="foto-rasio__stok-hover ${stokP === 0 ? 'foto-rasio__stok-hover--kosong' : ''}"><strong>${stokP}</strong></div>
        ${stokP === 0 ? `<span class="foto-rasio__flag-kosong" data-tip="Stok habis"><svg viewBox="0 0 24 24" width="13" height="13"><path d="M6 21V4" stroke="#fff" stroke-width="2.8" stroke-linecap="round"/><path d="M6 5h11l-3 4 3 4H6z" fill="#fff"/></svg></span>` : ''}
      </div>
      <div class="produk-grid-card__body">
        <div class="produk-grid-card__nama" title="${escapeHtml(p.nama)}">${escapeHtml(p.nama)}</div>
        <div class="produk-grid-card__kategori">${escapeHtml(p.kategori || 'Tanpa kategori')}${p.koleksi ? ' &middot; ' + escapeHtml(p.koleksi) : ''}</div>
        <div class="chip-ukuran-baris">${ukuranChipsHtml(p)}</div>
        <div class="dot-channel-baris">${dotChannelHtml(p)}</div>
        <div class="produk-grid-card__footer">
          <span>${stokP} item</span>
          <strong>${hargaMinProduk(p) ? formatRupiah(hargaMinProduk(p)) : '-'}</strong>
        </div>
      </div>
    </div>`;
  }

  function barisDetail(p) {
    return `<div class="produk-detail-baris" data-id="${p.id}" data-tip="Kelola varian &amp; stok">
      <div class="foto-rasio produk-detail-thumb">${fotoProdukHtml(p, 'foto-rasio__kosong')}</div>
      <div class="produk-detail-info">
        <div class="produk-grid-card__nama" title="${escapeHtml(p.nama)}">${escapeHtml(p.nama)}</div>
        <div class="produk-grid-card__kategori">${escapeHtml(p.kategori || 'Tanpa kategori')}${p.koleksi ? ' &middot; ' + escapeHtml(p.koleksi) : ''}</div>
        <div class="chip-ukuran-baris">${ukuranChipsHtml(p)}</div>
        <div class="dot-channel-baris">${dotChannelHtml(p)}</div>
      </div>
      <div class="produk-detail-angka">
        <strong>${totalStokProduk(p)} item</strong>
        <span>${hargaMinProduk(p) ? formatRupiah(hargaMinProduk(p)) : '-'}</span>
      </div>
    </div>`;
  }

  function barisList(p) {
    return `<div class="produk-list-baris" data-id="${p.id}" data-tip="Kelola varian &amp; stok">
      <div class="produk-list-thumb">${fotoProdukHtml(p, 'produk-list-thumb__kosong')}</div>
      <div class="produk-list-nama" title="${escapeHtml(p.nama)}">${escapeHtml(p.nama)}</div>
      <div class="produk-list-kategori teks-lemah">${escapeHtml(p.kategori || '-')}</div>
      <div class="teks-kanan">${totalStokProduk(p)} item</div>
      <div class="teks-kanan" style="color:var(--sienna-dark);font-weight:700">${hargaMinProduk(p) ? formatRupiah(hargaMinProduk(p)) : '-'}</div>
    </div>`;
  }

  function gambarUlang() {
    const kata = document.getElementById('cariProduk').value.trim().toLowerCase();
    let list = DATA.produk.filter(p => {
      const cocokKata = !kata || p.nama.toLowerCase().includes(kata);
      const cocokKategori = !FILTER_PRODUK.kategori || p.kategori === FILTER_PRODUK.kategori;
      const cocokKoleksi = !FILTER_PRODUK.koleksi || p.koleksi === FILTER_PRODUK.koleksi;
      const stokPerChannel = FILTER_PRODUK.channel ? p.varian.reduce((a, v) => a + hitungStokChannel(p.id, v.id, FILTER_PRODUK.channel), 0) : null;
      const cocokChannel = !FILTER_PRODUK.channel || stokPerChannel > 0;
      return cocokKata && cocokKategori && cocokKoleksi && cocokChannel;
    });

    if (SORT_PRODUK === 'stok-tinggi') list = list.slice().sort((a, b) => totalStokProduk(b) - totalStokProduk(a));
    else if (SORT_PRODUK === 'stok-rendah') list = list.slice().sort((a, b) => totalStokProduk(a) - totalStokProduk(b));
    else list = list.slice().sort((a, b) => a.nama.localeCompare(b.nama));

    const grid = kontainer.querySelector('#gridProduk');
    grid.className = VIEW_PRODUK === 'list' ? 'produk-list' : (VIEW_PRODUK === 'detail' ? 'produk-detail-list' : 'produk-grid');
    if (!list.length) {
      grid.innerHTML = `<div class="kosong" style="${VIEW_PRODUK === 'besar' ? 'grid-column:1/-1' : ''}">Tidak ada produk yang cocok.</div>`;
      return;
    }
    const kartu = VIEW_PRODUK === 'list' ? barisList : (VIEW_PRODUK === 'detail' ? barisDetail : kartuBesar);
    grid.innerHTML = list.map(kartu).join('');
    grid.querySelectorAll('[data-id]').forEach(el => {
      el.addEventListener('click', () => { location.hash = '#produk/' + el.dataset.id; });
    });
  }

  document.getElementById('cariProduk').addEventListener('input', gambarUlang);
  document.getElementById('btnTambahProduk').addEventListener('click', () => modalFormProduk(null, renderProdukList));
  document.getElementById('btnCatatTransaksiProduk').addEventListener('click', () => modalFormTransaksi(null, renderProdukList));
  REFRESH_GRID_PRODUK = gambarUlang;
  gambarUlang();
  pasangHeaderSticky();
}

// ============================================================
// PRODUK -- FORM TAMBAH/EDIT
// ============================================================
function modalFormProduk(id, onSelesai) {
  const p = id ? cariProduk(id) : null;
  let fotoSementara = p ? p.foto || null : null;
  const kategoriOpsi = kategoriTerpakai();
  const koleksiOpsi = koleksiTerpakai();

  const modal = bukaModal(p ? 'Edit Produk' : 'Tambah Produk', `
    <div class="field">
      <label>Nama Produk</label>
      <input type="text" id="fNama" value="${p ? escapeHtml(p.nama) : ''}" placeholder="Contoh: Blouse Rina">
    </div>
    <div class="field-row">
      <div class="field">
        <label>Kategori</label>
        <select id="fKategori">
          <option value="">Tanpa kategori</option>
          ${kategoriOpsi.map(k => `<option value="${escapeHtml(k)}" ${p && p.kategori === k ? 'selected' : ''}>${escapeHtml(k)}</option>`).join('')}
          <option value="__baru__">+ Kategori baru...</option>
        </select>
        <input type="text" id="fKategoriBaru" placeholder="Nama kategori baru" style="display:none;margin-top:6px">
        <div class="hint">Kelola daftar pilihan di menu Pengaturan.</div>
      </div>
      <div class="field">
        <label>Koleksi (opsional)</label>
        <select id="fKoleksi">
          <option value="">Tanpa koleksi</option>
          ${koleksiOpsi.map(k => `<option value="${escapeHtml(k)}" ${p && p.koleksi === k ? 'selected' : ''}>${escapeHtml(k)}</option>`).join('')}
          <option value="__baru__">+ Koleksi baru...</option>
        </select>
        <input type="text" id="fKoleksiBaru" placeholder="Nama koleksi baru" style="display:none;margin-top:6px">
      </div>
    </div>
    <div class="field">
      <label>Batas Stok Menipis</label>
      <input type="number" id="fStokMinim" min="0" value="${p ? p.stokMinim : 3}" style="max-width:200px">
      <div class="hint">Muncul di peringatan dashboard kalau stok varian &le; angka ini.</div>
    </div>
    <div class="field">
      <label>Catatan (opsional)</label>
      <textarea id="fCatatan" rows="2">${p ? escapeHtml(p.catatan || '') : ''}</textarea>
    </div>
    <div class="field">
      <label>Foto (opsional) &mdash; rasio potret 4:5</label>
      <div style="display:flex;align-items:flex-start;gap:14px">
        <div class="foto-preview foto-rasio" id="wrapPreviewFoto">
          ${fotoSementara ? `<img id="previewFoto" src="${fotoSementara}">` : `<div class="foto-rasio__kosong" style="font-size:22px">?</div>`}
        </div>
        <div>
          <input type="file" id="fFoto" accept="image/*">
          <div class="hint">Foto otomatis di-crop rapi mengikuti bagian tengah (4:5) supaya tidak gepeng/melar.</div>
          <button type="button" class="btn btn-kecil" id="btnHapusFoto" style="${fotoSementara ? '' : 'display:none'};margin-top:8px">Hapus Foto</button>
        </div>
      </div>
    </div>
    <div class="modal__aksi">
      <button class="btn" id="btnBatal">Batal</button>
      <button class="btn btn-primer" id="btnSimpan">Simpan</button>
    </div>
  `, { lebar: false });

  modal.querySelector('#fFoto').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    kompresFoto(file, (dataUrl) => {
      if (!dataUrl) { tampilkanToast('Gagal memproses foto.', 'error'); return; }
      fotoSementara = dataUrl;
      modal.querySelector('#wrapPreviewFoto').innerHTML = `<img id="previewFoto" src="${dataUrl}">`;
      modal.querySelector('#btnHapusFoto').style.display = '';
    });
  });
  modal.querySelector('#btnHapusFoto').addEventListener('click', () => {
    fotoSementara = null;
    modal.querySelector('#wrapPreviewFoto').innerHTML = `<div class="foto-rasio__kosong" style="font-size:22px">?</div>`;
    modal.querySelector('#btnHapusFoto').style.display = 'none';
  });
  function pasangDropdownBaru(idSelect, idInputBaru) {
    const sel = modal.querySelector(idSelect);
    const inputBaru = modal.querySelector(idInputBaru);
    sel.addEventListener('change', () => {
      const isBaru = sel.value === '__baru__';
      inputBaru.style.display = isBaru ? '' : 'none';
      if (isBaru) inputBaru.focus();
    });
  }
  pasangDropdownBaru('#fKategori', '#fKategoriBaru');
  pasangDropdownBaru('#fKoleksi', '#fKoleksiBaru');

  modal.querySelector('#btnBatal').addEventListener('click', tutupModal);
  modal.querySelector('#btnSimpan').addEventListener('click', () => {
    const nama = modal.querySelector('#fNama').value.trim();
    if (!nama) { tampilkanToast('Nama produk wajib diisi.', 'error'); return; }
    const selKategori = modal.querySelector('#fKategori').value;
    const kategori = bersihkanNamaKlasifikasi(selKategori === '__baru__' ? modal.querySelector('#fKategoriBaru').value : selKategori);
    const selKoleksi = modal.querySelector('#fKoleksi').value;
    const koleksi = bersihkanNamaKlasifikasi(selKoleksi === '__baru__' ? modal.querySelector('#fKoleksiBaru').value : selKoleksi);
    const stokMinim = Number(modal.querySelector('#fStokMinim').value) || 0;
    const catatan = modal.querySelector('#fCatatan').value.trim();

    if (kategori) tambahKlasifikasi('kategoriList', kategori);
    if (koleksi) tambahKlasifikasi('koleksiList', koleksi);

    if (p) {
      p.nama = nama; p.kategori = kategori; p.koleksi = koleksi; p.stokMinim = stokMinim; p.catatan = catatan; p.foto = fotoSementara;
      p.updatedAt = new Date().toISOString();
    } else {
      DATA.produk.push({
        id: buatId('prod'), nama, kategori, koleksi, stokMinim, catatan, foto: fotoSementara,
        varian: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
      });
    }
    simpanData();
    tutupModal();
    tampilkanToast('Produk disimpan.', 'sukses');
    if (onSelesai) onSelesai();
  });
}

// ============================================================
// PRODUK -- DETAIL & VARIAN
// ============================================================
// Dikelompokkan per WARNA dulu (baru ukuran di dalamnya) -- konsisten dgn combobox varian di
// form Transaksi (lihat kelompokkanVarianUntukCombo), supaya ukuran2 dari warna yg sama gampang
// dibandingkan berdampingan, tanpa nama warna berulang di tiap baris.
function htmlBarisVarianTerkelompok(p) {
  if (!p.varian.length) return `<tr><td colspan="5" class="kosong">Belum ada varian. Tambahkan ukuran/warna dulu sebelum mencatat stok.</td></tr>`;
  const grup = new Map();
  p.varian.forEach(v => {
    const kunci = v.warna || '(Tanpa warna)';
    if (!grup.has(kunci)) grup.set(kunci, []);
    grup.get(kunci).push(v);
  });
  return Array.from(grup.entries()).map(([warna, list]) => `
    <tr class="tabel-grup-baris"><td colspan="5">${escapeHtml(warna)}</td></tr>
    ${list.map(v => `<tr>
      <td>${escapeHtml(v.ukuran || 'Default')}</td>
      <td class="teks-kanan" data-tip="${CHANNEL_LIST.map(c => c + ': ' + hitungStokChannel(p.id, v.id, c)).join(' &bull; ')}">${hitungStok(p.id, v.id)}</td>
      <td class="teks-kanan">${formatRupiah(v.hargaModal)}</td>
      <td class="teks-kanan">${formatRupiah(v.hargaJual)}${v.hargaChannel && Object.keys(v.hargaChannel).length ? ` <span class="hint" data-tip="Harga custom di ${Object.keys(v.hargaChannel).join(', ')}">✎</span>` : ''}</td>
      <td class="teks-kanan">
        <button class="btn btn-kecil btn-primer" data-catat-varian="${v.id}" data-tip="Catat barang masuk/keluar utk varian ini">+ Catat</button>
        <button class="btn btn-kecil" data-pindah-varian="${v.id}" data-tip="Pindahkan stok dari satu channel ke channel lain">🔀 Pindah</button>
        <button class="btn btn-kecil btn-ikon" data-edit-varian="${v.id}" data-tip="Edit">${IKON.editKecil}</button>
        <button class="btn btn-kecil btn-ikon btn-bahaya" data-hapus-varian="${v.id}" data-tip="Hapus">${IKON.hapusKecil}</button>
      </td>
    </tr>`).join('')}
  `).join('');
}

function renderProdukDetail(id) {
  const p = cariProduk(id);
  if (!p) {
    KONTEN().innerHTML = `<div class="kosong">Produk tidak ditemukan. <a href="#produk">Kembali ke daftar produk.</a></div>`;
    return;
  }
  const totalStok = p.varian.reduce((a, v) => a + hitungStok(p.id, v.id), 0);
  const hargaList = p.varian.map(v => v.hargaJual || 0).filter(Boolean);
  const hargaMin = hargaList.length ? Math.min(...hargaList) : 0;
  const hargaMax = hargaList.length ? Math.max(...hargaList) : 0;
  const hargaLabel = !hargaList.length ? '-' : (hargaMin === hargaMax ? formatRupiah(hargaMin) : `${formatRupiah(hargaMin)} - ${formatRupiah(hargaMax)}`);

  KONTEN().innerHTML = `
    <div class="halaman__header">
      <div>
        <p><a href="#produk">&larr; Kembali ke Produk</a></p>
        <h1>${escapeHtml(p.nama)}</h1>
        <p>${escapeHtml(p.kategori || 'Tanpa kategori')}${p.koleksi ? ' &middot; Koleksi ' + escapeHtml(p.koleksi) : ''} ${p.catatan ? '&middot; ' + escapeHtml(p.catatan) : ''}</p>
      </div>
      <div style="display:flex;gap:8px">
        <button class="btn" id="btnEditProduk">Edit Info</button>
        <button class="btn btn-bahaya" id="btnHapusProduk">Hapus Produk</button>
      </div>
    </div>

    <div class="detail-produk-atas">
      <div class="foto-rasio">
        ${fotoProdukHtml(p, 'foto-rasio__kosong')}
      </div>
      <div>
        <div class="kartu" style="margin-bottom:12px">
          <h2>Ketersediaan Ukuran</h2>
          <div class="ukuran-tersedia-baris">
            ${p.varian.length ? p.varian.map(v => {
              const stokV = hitungStok(p.id, v.id);
              return `<span class="chip-ukuran ${stokV > 0 ? '' : 'habis'}" data-tip="${stokV > 0 ? stokV + ' item tersisa' : 'Stok habis'}">${escapeHtml(labelVarian(v))}</span>`;
            }).join('') : `<span class="hint">Belum ada varian.</span>`}
          </div>
          <div class="grid-kartu" style="margin-top:12px">
            <div class="stat" style="padding:12px 14px" data-tip="Jumlah stok di semua channel"><div class="stat__label">Stok Total</div><div class="stat__nilai">${totalStok}</div></div>
            <div class="stat" style="padding:12px 14px"><div class="stat__label">Harga Jual</div><div class="stat__nilai" style="font-size:16px">${hargaLabel}</div></div>
          </div>
        </div>
        <div class="kartu" style="margin-bottom:0">
          <h2>Harga &amp; Stok per Channel</h2>
          <p class="teks-lemah" style="margin-top:-6px">Stok tiap channel dikelola terpisah -- Stok Total di atas otomatis dijumlah dari semua channel di bawah ini.</p>
          <div class="channel-harga-grid">
            ${CHANNEL_LIST.map(c => {
              const hargaC = p.varian.map(v => hargaVarianUntukChannel(v, c)).filter(Boolean);
              const min = hargaC.length ? Math.min(...hargaC) : 0;
              const max = hargaC.length ? Math.max(...hargaC) : 0;
              const label = !hargaC.length ? '-' : (min === max ? formatRupiah(min) : `${formatRupiah(min)} - ${formatRupiah(max)}`);
              const stokC = p.varian.reduce((a, v) => a + hitungStokChannel(p.id, v.id, c), 0);
              return `<div class="channel-harga-card">
                ${badgeChannel(c)}
                <div class="channel-harga-card__harga">${label}</div>
                <div class="channel-harga-card__stok" style="color:${stokC > 0 ? '' : 'var(--sienna-dark)'}">${stokC > 0 ? stokC + ' item tersedia' : 'Stok habis'}</div>
              </div>`;
            }).join('')}
          </div>
        </div>
      </div>
    </div>

    <div class="kartu">
      <h2 style="display:flex;justify-content:space-between;align-items:center">
        Varian <button class="btn btn-kecil btn-primer" id="btnTambahVarian">+ Tambah Varian</button>
      </h2>
      <div class="tabel-wrap"><table>
        <thead><tr><th>Ukuran</th><th class="teks-kanan">Stok</th><th class="teks-kanan">Harga Modal</th><th class="teks-kanan">Harga Jual</th><th></th></tr></thead>
        <tbody>${htmlBarisVarianTerkelompok(p)}</tbody>
      </table></div>
    </div>

    <div class="kartu">
      <h2>Riwayat Transaksi Produk Ini</h2>
      ${renderTabelTransaksiUntukProduk(p.id)}
    </div>
  `;

  KONTEN().querySelector('#btnEditProduk').addEventListener('click', () => modalFormProduk(p.id, () => renderProdukDetail(p.id)));
  KONTEN().querySelector('#btnHapusProduk').addEventListener('click', () => {
    const jumlahTx = DATA.transaksi.filter(t => t.produkId === p.id).length;
    konfirmasi(`Hapus produk <strong>${escapeHtml(p.nama)}</strong> beserta ${p.varian.length} varian${jumlahTx ? ' dan ' + jumlahTx + ' riwayat transaksinya' : ''}? Tindakan ini tidak bisa dibatalkan.`, () => {
      DATA.produk = DATA.produk.filter(x => x.id !== p.id);
      DATA.transaksi = DATA.transaksi.filter(t => t.produkId !== p.id);
      simpanData();
      tampilkanToast('Produk dihapus.', 'sukses');
      location.hash = '#produk';
    }, { bahaya: true, labelYa: 'Hapus' });
  });
  KONTEN().querySelector('#btnTambahVarian').addEventListener('click', () => modalFormVarian(p.id, null, () => renderProdukDetail(p.id)));
  KONTEN().querySelectorAll('[data-edit-varian]').forEach(btn => {
    btn.addEventListener('click', () => modalFormVarian(p.id, btn.dataset.editVarian, () => renderProdukDetail(p.id)));
  });
  KONTEN().querySelectorAll('[data-pindah-varian]').forEach(btn => {
    btn.addEventListener('click', () => modalPindahStok(p.id, btn.dataset.pindahVarian, () => renderProdukDetail(p.id)));
  });
  KONTEN().querySelectorAll('[data-catat-varian]').forEach(btn => {
    btn.addEventListener('click', () => modalCatatStokVarian(p.id, btn.dataset.catatVarian, () => renderProdukDetail(p.id)));
  });
  KONTEN().querySelectorAll('[data-hapus-varian]').forEach(btn => {
    btn.addEventListener('click', () => {
      const vId = btn.dataset.hapusVarian;
      const jumlahTx = DATA.transaksi.filter(t => t.produkId === p.id && t.varianId === vId).length;
      konfirmasi(`Hapus varian ini${jumlahTx ? ' beserta ' + jumlahTx + ' riwayat transaksinya' : ''}?`, () => {
        p.varian = p.varian.filter(v => v.id !== vId);
        DATA.transaksi = DATA.transaksi.filter(t => !(t.produkId === p.id && t.varianId === vId));
        simpanData();
        tampilkanToast('Varian dihapus.', 'sukses');
        renderProdukDetail(p.id);
      }, { bahaya: true, labelYa: 'Hapus' });
    });
  });
  pasangAksiTabelTransaksiProduk(p.id);
}

function renderTabelTransaksiUntukProduk(produkId) {
  const list = DATA.transaksi.filter(t => t.produkId === produkId)
    .sort((a, b) => (b.tanggal + b.createdAt).localeCompare(a.tanggal + a.createdAt));
  if (!list.length) return `<div class="kosong">Belum ada transaksi untuk produk ini.</div>`;
  return `<div class="tabel-wrap"><table>
    <thead><tr><th>Tanggal</th><th>Tipe</th><th>Varian</th><th>Channel</th><th class="teks-kanan">Qty</th><th class="teks-kanan">Harga</th><th></th></tr></thead>
    <tbody>${list.map(t => {
      const v = cariVarian(produkId, t.varianId);
      return `<tr class="klik" data-baris-tx="${t.id}" data-tip="Klik baris utk lihat ringkasan &amp; edit">
        <td>${formatTanggal(t.tanggal)}</td>
        <td>${badgeTipeTransaksi(t.tipe)}</td>
        <td>${v ? escapeHtml(labelVarian(v)) : '(dihapus)'}</td>
        <td>${badgeChannel(t.channel)}</td>
        <td class="teks-kanan">${t.tipe === 'koreksi' && t.qty > 0 ? '+' : ''}${t.qty}</td>
        <td class="teks-kanan">${t.hargaSatuan ? formatRupiah(t.hargaSatuan) : '-'}</td>
        <td class="teks-kanan">
          <button class="btn btn-kecil btn-ikon" data-edit-tx="${t.id}" data-tip="Edit">${IKON.editKecil}</button>
          <button class="btn btn-kecil btn-ikon btn-bahaya" data-hapus-tx="${t.id}" data-tip="Hapus">${IKON.hapusKecil}</button>
        </td>
      </tr>`;
    }).join('')}</tbody>
  </table></div>`;
}

// Dipasang setelah tabel riwayat transaksi produk disisipkan ke DOM (lihat renderProdukDetail)
// -- klik baris = buka popup ringkasan+edit (sama modal dgn menu Transaksi), tombol Edit sama,
// tombol Hapus pakai konfirmasi lalu render ulang halaman produk (stok/varian ikut ter-update).
function pasangAksiTabelTransaksiProduk(produkId) {
  const kontainer = KONTEN();
  const render_ulang = () => renderProdukDetail(produkId);
  kontainer.querySelectorAll('[data-baris-tx]').forEach(tr => tr.addEventListener('click', (e) => {
    if (e.target.closest('button')) return;
    modalFormTransaksi(tr.dataset.barisTx, render_ulang);
  }));
  kontainer.querySelectorAll('[data-edit-tx]').forEach(btn => btn.addEventListener('click', () => modalFormTransaksi(btn.dataset.editTx, render_ulang)));
  kontainer.querySelectorAll('[data-hapus-tx]').forEach(btn => btn.addEventListener('click', () => {
    konfirmasi('Hapus transaksi ini? Stok akan otomatis dihitung ulang.', () => {
      DATA.transaksi = DATA.transaksi.filter(t => t.id !== btn.dataset.hapusTx);
      simpanData();
      tampilkanToast('Transaksi dihapus.', 'sukses');
      render_ulang();
    }, { bahaya: true, labelYa: 'Hapus' });
  }));
}

function modalFormVarian(produkId, varianId, onSelesai) {
  const p = cariProduk(produkId);
  const v = varianId ? cariVarian(produkId, varianId) : null;
  const modal = bukaModal(v ? 'Edit Varian' : 'Tambah Varian', `
    <div class="field-row">
      <div class="field"><label>Ukuran</label><input type="text" id="fUkuran" value="${v ? escapeHtml(v.ukuran || '') : ''}" placeholder="S / M / L / All Size"></div>
      <div class="field"><label>Warna</label><input type="text" id="fWarna" value="${v ? escapeHtml(v.warna || '') : ''}" placeholder="Hitam / Maroon / dll"></div>
    </div>
    <div class="field-row">
      <div class="field"><label>Harga Modal</label><input type="number" id="fHargaModal" value="${v ? v.hargaModal : ''}" placeholder="0"></div>
      <div class="field"><label>Harga Jual Umum</label><input type="number" id="fHargaJual" value="${v ? v.hargaJual : ''}" placeholder="0"></div>
    </div>

    <div class="field" style="margin-top:4px">
      <label>${v ? 'Stok Awal per Channel / Penyesuaian Langsung' : 'Stok Awal per Channel'}</label>
      ${v ? '<div class="hint" style="margin-top:0;margin-bottom:8px">Ubah angka ini = koreksi diam-diam tanpa tercatat. Untuk koreksi yang tercatat (ada jejaknya), pakai menu Transaksi.</div>' : '<div class="hint" style="margin-top:0;margin-bottom:8px">Stok dikelola terpisah per channel -- total otomatis dijumlah dari semua channel.</div>'}
      <div class="field-row">
        ${CHANNEL_LIST.map(c => `
          <div class="field">
            <label style="font-weight:400">${badgeChannel(c)}</label>
            <input type="number" data-stok-channel="${escapeHtml(c)}" value="${v ? (v.stokAwal[c] || 0) : 0}">
            ${v ? `<div class="hint">Stok kini: ${hitungStokChannel(produkId, varianId, c)}</div>` : ''}
          </div>
        `).join('')}
      </div>
      ${v ? `<p class="hint">Total stok semua channel saat ini: <strong>${hitungStok(produkId, varianId)}</strong></p>` : ''}
    </div>

    <div class="field" style="margin-top:4px">
      <label>Harga Jual per Channel (opsional)</label>
      <div class="hint" style="margin-top:0;margin-bottom:8px">Isi hanya kalau harga di channel itu beda dari Harga Jual Umum di atas (mis. beda promo/ongkir). Kosongkan kalau sama.</div>
      <div class="field-row">
        ${CHANNEL_LIST.map(c => `
          <div class="field">
            <label style="font-weight:400">${badgeChannel(c)}</label>
            <input type="number" data-harga-channel="${escapeHtml(c)}" value="${v && v.hargaChannel && v.hargaChannel[c] != null ? v.hargaChannel[c] : ''}" placeholder="Sama: ${v && v.hargaJual ? formatRupiah(v.hargaJual) : 'Rp0'}">
          </div>
        `).join('')}
      </div>
    </div>

    <div class="modal__aksi">
      <button class="btn" id="btnBatal">Batal</button>
      <button class="btn btn-primer" id="btnSimpan">Simpan</button>
    </div>
  `, { lebar: true });

  modal.querySelector('#btnBatal').addEventListener('click', tutupModal);
  modal.querySelector('#btnSimpan').addEventListener('click', () => {
    const ukuran = modal.querySelector('#fUkuran').value.trim();
    const warna = modal.querySelector('#fWarna').value.trim();
    const hargaModal = Number(modal.querySelector('#fHargaModal').value) || 0;
    const hargaJual = Number(modal.querySelector('#fHargaJual').value) || 0;
    const stokAwal = {};
    CHANNEL_LIST.forEach(c => { stokAwal[c] = Number(modal.querySelector(`[data-stok-channel="${c}"]`).value) || 0; });
    const hargaChannel = {};
    CHANNEL_LIST.forEach(c => {
      const val = modal.querySelector(`[data-harga-channel="${c}"]`).value.trim();
      if (val !== '') hargaChannel[c] = Number(val);
    });

    if (v) {
      v.ukuran = ukuran; v.warna = warna; v.stokAwal = stokAwal; v.hargaModal = hargaModal; v.hargaJual = hargaJual; v.hargaChannel = hargaChannel;
    } else {
      p.varian.push({ id: buatId('var'), ukuran, warna, stokAwal, hargaModal, hargaJual, hargaChannel });
    }
    p.updatedAt = new Date().toISOString();
    simpanData();
    tutupModal();
    tampilkanToast('Varian disimpan.', 'sukses');
    if (onSelesai) onSelesai();
  });
}

// Pindah stok satu varian dari satu channel ke channel lain (mis. Tokopedia sisa 2 tapi
// yg laku di Shopee & Shopee-nya kosong) -- dicatat sbg sepasang transaksi "Koreksi" yg
// saling terkait (satu minus di channel asal, satu plus di channel tujuan) supaya tetap
// ada jejaknya di riwayat, tanpa perlu tipe transaksi baru.
function modalPindahStok(produkId, varianId, onSelesai) {
  const p = cariProduk(produkId);
  const v = cariVarian(produkId, varianId);
  if (!p || !v) return;

  const modal = bukaModal('Pindah Stok Antar Channel', `
    <p class="hint" style="margin-top:-4px">${escapeHtml(p.nama)}${v.ukuran || v.warna ? ' &middot; ' + escapeHtml(labelVarian(v)) : ''}</p>
    <div class="field-row">
      <div class="field">
        <label>Dari Channel</label>
        <select id="fDariChannel">${CHANNEL_LIST.map(c => `<option value="${c}">${c} (stok: ${hitungStokChannel(produkId, varianId, c)})</option>`).join('')}</select>
      </div>
      <div class="field">
        <label>Ke Channel</label>
        <select id="fKeChannel">${CHANNEL_LIST.map(c => `<option value="${c}">${c} (stok: ${hitungStokChannel(produkId, varianId, c)})</option>`).join('')}</select>
      </div>
    </div>
    <div class="field">
      <label>Jumlah Dipindah</label>
      <input type="number" id="fJumlahPindah" min="1" value="1">
      <div class="hint" id="hintPindah"></div>
    </div>
    <div class="field"><label>Catatan (opsional)</label><input type="text" id="fCatatanPindah" placeholder="Contoh: dialokasikan ulang krn laku duluan di channel lain"></div>
    <div class="modal__aksi">
      <button class="btn" id="btnBatal">Batal</button>
      <button class="btn btn-primer" id="btnSimpan">🔀 Pindahkan</button>
    </div>
  `);

  const selDari = modal.querySelector('#fDariChannel');
  const selKe = modal.querySelector('#fKeChannel');
  selKe.value = CHANNEL_LIST.find(c => c !== selDari.value) || CHANNEL_LIST[0];

  function perbaruiHint() {
    modal.querySelector('#hintPindah').textContent = `Stok ${selDari.value} saat ini: ${hitungStokChannel(produkId, varianId, selDari.value)} item`;
  }
  perbaruiHint();
  selDari.addEventListener('change', () => {
    if (selDari.value === selKe.value) selKe.value = CHANNEL_LIST.find(c => c !== selDari.value);
    perbaruiHint();
  });
  selKe.addEventListener('change', () => {
    if (selKe.value === selDari.value) {
      tampilkanToast('Channel tujuan harus beda dari channel asal.', 'error');
      selKe.value = CHANNEL_LIST.find(c => c !== selDari.value);
    }
  });

  modal.querySelector('#btnBatal').addEventListener('click', tutupModal);
  modal.querySelector('#btnSimpan').addEventListener('click', () => {
    const dari = selDari.value;
    const ke = selKe.value;
    const jumlah = Number(modal.querySelector('#fJumlahPindah').value);
    const catatan = modal.querySelector('#fCatatanPindah').value.trim();

    if (dari === ke) { tampilkanToast('Channel asal & tujuan harus berbeda.', 'error'); return; }
    if (!jumlah || jumlah <= 0) { tampilkanToast('Jumlah harus lebih dari 0.', 'error'); return; }

    const stokDari = hitungStokChannel(produkId, varianId, dari);
    if (jumlah > stokDari) {
      tampilkanToast(`Stok ${dari} cuma ${stokDari}, tidak bisa memindah ${jumlah}.`, 'error');
      return;
    }

    const tanggal = tanggalHariIni();
    const keterangan = catatan ? ` -- ${catatan}` : '';
    DATA.transaksi.push({ id: buatId('tx'), tipe: 'koreksi', produkId, varianId, channel: dari, qty: -jumlah, hargaSatuan: 0, catatan: `Pindah ${jumlah} ke ${ke}${keterangan}`, tanggal, createdAt: new Date().toISOString() });
    DATA.transaksi.push({ id: buatId('tx'), tipe: 'koreksi', produkId, varianId, channel: ke, qty: jumlah, hargaSatuan: 0, catatan: `Pindah ${jumlah} dari ${dari}${keterangan}`, tanggal, createdAt: new Date().toISOString() });
    simpanData();
    tutupModal();
    tampilkanToast(`${jumlah} item dipindah dari ${dari} ke ${ke}.`, 'sukses');
    if (onSelesai) onSelesai();
  });
}

// Versi ringkas modalFormTransaksi KHUSUS dipanggil dari baris varian di halaman detail produk --
// produk & varian sudah pasti (dari baris yg diklik), jadi TIDAK perlu dropdown pilih
// produk/varian lagi spy tidak redundan dgn form lengkap di menu Transaksi.
function modalCatatStokVarian(produkId, varianId, onSelesai) {
  const p = cariProduk(produkId);
  const v = cariVarian(produkId, varianId);
  if (!p || !v) return;

  const modal = bukaModal('Catat Transaksi', `
    <p class="hint" style="margin-top:-4px">${escapeHtml(p.nama)} &middot; ${escapeHtml(labelVarian(v))}</p>
    <div class="field-row">
      <div class="field">
        <label>Tipe</label>
        <select id="fTipeV">
          <option value="masuk">Masuk (Restock)</option>
          <option value="keluar">Keluar (Terjual)</option>
          <option value="koreksi">Penyesuaian (Koreksi/Retur/Rusak)</option>
        </select>
      </div>
      <div class="field"><label>Tanggal</label><input type="date" id="fTanggalV" value="${tanggalHariIni()}"></div>
    </div>
    <div class="field">
      <label id="labelChannelV">Channel</label>
      <select id="fChannelV">${CHANNEL_LIST.map(c => `<option value="${c}">${c}</option>`).join('')}</select>
    </div>
    <div class="field-row">
      <div class="field">
        <label id="labelQtyV">Jumlah</label>
        <input type="number" id="fQtyV" value="1" min="0">
        <div class="hint" id="hintStokV"></div>
      </div>
      <div class="field"><label>Harga Satuan (opsional)</label><input type="number" id="fHargaV" placeholder="0"></div>
    </div>
    <div class="field"><label>Catatan (opsional)</label><input type="text" id="fCatatanV" placeholder="Contoh: retur ukuran salah"></div>
    <div class="modal__aksi">
      <button class="btn" id="btnBatal">Batal</button>
      <button class="btn btn-primer" id="btnSimpan">Simpan</button>
    </div>
  `);

  const selTipe = modal.querySelector('#fTipeV');
  const selChannel = modal.querySelector('#fChannelV');
  const labelQty = modal.querySelector('#labelQtyV');

  function saranHarga() {
    if (selTipe.value !== 'keluar') return;
    const harga = hargaVarianUntukChannel(v, selChannel.value);
    modal.querySelector('#fHargaV').value = harga || '';
  }
  function perbaruiHint() {
    const stokC = hitungStokChannel(produkId, varianId, selChannel.value);
    modal.querySelector('#hintStokV').textContent = `Stok ${selChannel.value} saat ini: ${stokC} item`;
  }
  function terapkanTipe() {
    const tipe = selTipe.value;
    modal.querySelector('#labelChannelV').textContent = tipe === 'keluar' ? 'Channel Penjualan' : (tipe === 'masuk' ? 'Channel Tujuan Restock' : 'Channel yang Dikoreksi');
    labelQty.textContent = tipe === 'koreksi' ? 'Perubahan Stok (boleh minus, cth: -2)' : 'Jumlah';
    modal.querySelector('#fQtyV').min = tipe === 'koreksi' ? '' : '0';
    saranHarga();
    perbaruiHint();
  }
  selTipe.addEventListener('change', terapkanTipe);
  selChannel.addEventListener('change', () => { saranHarga(); perbaruiHint(); });
  terapkanTipe();

  modal.querySelector('#btnBatal').addEventListener('click', tutupModal);
  modal.querySelector('#btnSimpan').addEventListener('click', () => {
    const tipe = selTipe.value;
    let qty = Number(modal.querySelector('#fQtyV').value);
    if (tipe !== 'koreksi') qty = Math.abs(qty);
    if (!qty && tipe !== 'koreksi') { tampilkanToast('Jumlah harus lebih dari 0.', 'error'); return; }
    const tanggal = modal.querySelector('#fTanggalV').value || tanggalHariIni();
    const channel = selChannel.value;
    const hargaSatuan = Number(modal.querySelector('#fHargaV').value) || 0;
    const catatan = modal.querySelector('#fCatatanV').value.trim();

    if (tipe === 'keluar' || (tipe === 'koreksi' && qty < 0)) {
      const stokChannelSaatIni = hitungStokChannel(produkId, varianId, channel);
      const dampak = tipe === 'keluar' ? qty : -qty;
      if (dampak > stokChannelSaatIni) {
        tampilkanToast(`Stok ${channel} tidak cukup -- tersisa ${stokChannelSaatIni}, transaksi ini butuh ${dampak}.`, 'error');
        return;
      }
    }

    DATA.transaksi.push({ id: buatId('tx'), tipe, produkId, varianId, channel, qty, hargaSatuan, catatan, tanggal, createdAt: new Date().toISOString() });
    simpanData();
    tutupModal();
    tampilkanToast('Transaksi disimpan.', 'sukses');
    if (onSelesai) onSelesai();
  });
}

// ============================================================
// TRANSAKSI
// ============================================================
function renderTransaksi() {
  const kontainer = KONTEN();
  inisialisasiRentangTransaksi();
  KONTEN_STICKY().innerHTML = `
    <div class="halaman-sticky-host__inner">
      <div class="halaman__header">
        <div><h1>Transaksi</h1><p>Catat barang masuk, terjual, atau penyesuaian stok</p></div>
        <div class="halaman__header-aksi">
          ${htmlTombolLaporan('transaksi', 'Buka Laporan Transaksi')}
          ${htmlRangePicker(RENTANG_TRANSAKSI)}
          <button class="btn btn-primer" id="btnTambahTransaksi" ${DATA.produk.length ? '' : 'disabled title="Tambahkan produk & varian dulu"'}>+ Tambah Transaksi</button>
        </div>
      </div>
      <div class="toolbar">
        <div class="field"><input type="text" id="cariTransaksi" placeholder="Cari produk atau catatan..."></div>
      </div>
    </div>
  `;
  kontainer.innerHTML = `
    <div class="kartu" style="padding:0"><div class="tabel-wrap"><table>
      <thead><tr><th>Tanggal</th><th>Tipe</th><th>Produk</th><th>Varian</th><th>Channel</th><th class="teks-kanan">Qty</th><th class="teks-kanan">Harga</th><th>Catatan</th><th></th></tr></thead>
      <tbody id="tbodyTransaksi"></tbody>
    </table></div></div>
  `;

  if (!DATA.produk.length) {
    kontainer.querySelector('.kartu').insertAdjacentHTML('beforebegin', `<div class="kartu">Belum ada produk. <a href="#produk">Tambahkan produk & varian dulu</a> sebelum mencatat transaksi.</div>`);
  }

  function gambarUlang() {
    const { dari, sampai } = RENTANG_TRANSAKSI;
    const kata = document.getElementById('cariTransaksi').value.trim().toLowerCase();
    let list = DATA.transaksi.filter(t => t.tanggal >= dari && t.tanggal <= sampai);
    if (FILTER_TRANSAKSI.tipe) list = list.filter(t => t.tipe === FILTER_TRANSAKSI.tipe);
    if (FILTER_TRANSAKSI.channel) list = list.filter(t => t.channel === FILTER_TRANSAKSI.channel);
    if (kata) list = list.filter(t => {
      const p = cariProduk(t.produkId);
      return (p && p.nama.toLowerCase().includes(kata)) || (t.catatan || '').toLowerCase().includes(kata);
    });
    list.sort((a, b) => (b.tanggal + b.createdAt).localeCompare(a.tanggal + a.createdAt));

    const tbody = kontainer.querySelector('#tbodyTransaksi');
    if (!list.length) { tbody.innerHTML = `<tr><td colspan="9" class="kosong">Tidak ada transaksi.</td></tr>`; return; }
    tbody.innerHTML = list.map(t => {
      const p = cariProduk(t.produkId);
      const v = p ? cariVarian(p.id, t.varianId) : null;
      return `<tr class="klik" data-baris-tx="${t.id}" data-tip="Klik baris utk edit">
        <td>${formatTanggal(t.tanggal)}</td>
        <td>${badgeTipeTransaksi(t.tipe)}</td>
        <td>${p ? escapeHtml(p.nama) : '(dihapus)'}</td>
        <td>${v ? escapeHtml(labelVarian(v)) : '-'}</td>
        <td>${badgeChannel(t.channel)}</td>
        <td class="teks-kanan">${t.tipe === 'koreksi' && t.qty > 0 ? '+' : ''}${t.qty}</td>
        <td class="teks-kanan">${t.hargaSatuan ? formatRupiah(t.hargaSatuan) : '-'}</td>
        <td class="teks-lemah">${escapeHtml(t.catatan || '')}</td>
        <td class="teks-kanan">
          <button class="btn btn-kecil btn-ikon" data-edit-tx="${t.id}" data-tip="Edit">${IKON.editKecil}</button>
          <button class="btn btn-kecil btn-ikon btn-bahaya" data-hapus-tx="${t.id}" data-tip="Hapus">${IKON.hapusKecil}</button>
        </td>
      </tr>`;
    }).join('');
    tbody.querySelectorAll('[data-baris-tx]').forEach(tr => tr.addEventListener('click', (e) => {
      if (e.target.closest('button')) return;
      modalFormTransaksi(tr.dataset.barisTx, gambarUlang);
    }));
    tbody.querySelectorAll('[data-edit-tx]').forEach(btn => btn.addEventListener('click', () => modalFormTransaksi(btn.dataset.editTx, gambarUlang)));
    tbody.querySelectorAll('[data-hapus-tx]').forEach(btn => btn.addEventListener('click', () => {
      konfirmasi('Hapus transaksi ini? Stok akan otomatis dihitung ulang.', () => {
        DATA.transaksi = DATA.transaksi.filter(t => t.id !== btn.dataset.hapusTx);
        simpanData();
        tampilkanToast('Transaksi dihapus.', 'sukses');
        gambarUlang();
      }, { bahaya: true, labelYa: 'Hapus' });
    }));
  }

  REFRESH_TABEL_TRANSAKSI = gambarUlang;
  document.getElementById('cariTransaksi').addEventListener('input', gambarUlang);
  document.getElementById('btnTambahTransaksi').addEventListener('click', () => modalFormTransaksi(null, gambarUlang));
  gambarUlang();
  pasangRangePicker({ ambil: () => RENTANG_TRANSAKSI, atur: (r) => { RENTANG_TRANSAKSI = r; }, render: renderTransaksi });
  pasangHeaderSticky();
}

function modalFormTransaksi(id, onSelesai, produkIdAwal) {
  const t = id ? DATA.transaksi.find(x => x.id === id) : null;

  const modal = bukaModal(t ? 'Edit Transaksi' : 'Tambah Transaksi', `
    <div class="field-row">
      <div class="field">
        <label>Tipe</label>
        <select id="fTipe">
          <option value="masuk">Masuk (Restock)</option>
          <option value="keluar">Keluar (Terjual)</option>
          <option value="koreksi">Penyesuaian (Koreksi/Retur/Rusak)</option>
        </select>
      </div>
      <div class="field"><label>Tanggal</label><input type="date" id="fTanggal" value="${t ? t.tanggal : tanggalHariIni()}"></div>
    </div>
    <div class="field-row">
      <div class="field">
        <label>Produk</label>
        <select id="fProduk">${DATA.produk.map(p => `<option value="${p.id}">${escapeHtml(p.nama)}</option>`).join('')}</select>
      </div>
      <div class="field"><label>Varian</label><div id="fVarian"></div></div>
    </div>
    <div class="field" id="wrapChannel">
      <label id="labelChannel">Channel</label>
      <select id="fChannel">${CHANNEL_LIST.map(c => `<option value="${c}">${c}</option>`).join('')}</select>
    </div>
    <div class="field-row">
      <div class="field">
        <label id="labelQty">Jumlah</label>
        <input type="number" id="fQty" value="${t ? Math.abs(t.qty) : 1}" min="0">
        <div class="hint" id="hintStokChannel"></div>
      </div>
      <div class="field"><label>Harga Satuan (opsional)</label><input type="number" id="fHarga" value="${t && t.hargaSatuan ? t.hargaSatuan : ''}" placeholder="0"></div>
    </div>
    <div class="field"><label>Catatan (opsional)</label><input type="text" id="fCatatanTx" value="${t ? escapeHtml(t.catatan || '') : ''}" placeholder="Contoh: retur ukuran salah"></div>
    <div class="modal__aksi">
      <button class="btn" id="btnBatal">Batal</button>
      <button class="btn btn-primer" id="btnSimpan">Simpan</button>
    </div>
  `);

  const selProduk = modal.querySelector('#fProduk');
  const comboVarian = buatCombobox(modal.querySelector('#fVarian'), { placeholder: 'Ketik warna/ukuran...', kosongTeks: 'Tidak ada varian dgn stok.' });
  const selTipe = modal.querySelector('#fTipe');
  const selChannel = modal.querySelector('#fChannel');
  const labelQty = modal.querySelector('#labelQty');

  // Dikelompokkan per WARNA dulu (baru ukuran di dalamnya) -- sebelumnya label "ukuran / warna"
  // bikin daftar kelihatan acak krn mata harus baca sampai bagian kedua tiap baris utk tahu
  // warnanya (lihat feedback user). Kalau produk cuma py 1 kelompok warna (mis. tanpa varian
  // warna sama sekali), header kelompok disembunyikan (lihat buatCombobox) drpd nampilin
  // "(Tanpa warna)" yg tidak berguna.
  function kelompokkanVarianUntukCombo(produkId, daftarVarian) {
    const peta = new Map();
    daftarVarian.forEach(v => {
      const kunci = v.warna || '(Tanpa warna)';
      if (!peta.has(kunci)) peta.set(kunci, []);
      peta.get(kunci).push(v);
    });
    return Array.from(peta.entries()).map(([warna, list]) => ({
      // Konsisten dgn label item di bawah (sudah lewat escapeHtml): panel & pencarian combobox
      // (buatCombobox di ui.js) memperlakukan SEMUA label sbg HTML siap-tampil, termasuk lewat
      // innerHTML saat membongkar jadi teks polos utk pencarian -- kalau warna mengandung "&"/"<"
      // dan tidak di-escape di sini, itu akan salah kebaca sbg markup (bukan cuma soal tampilan).
      label: escapeHtml(warna),
      items: list.map(v => ({
        value: v.id,
        label: `${escapeHtml(v.ukuran || 'Default')} <span class="teks-lemah" style="font-size:11px">(total: ${hitungStok(produkId, v.id)})</span>`
      }))
    }));
  }

  // Utk tipe "Keluar" (jual), produk/varian yg stoknya 0 di channel terpilih cuma bikin bingung
  // kalau ikut muncul di dropdown (lihat screenshot user: banyak opsi "(total: 0)" bercampur).
  // Difilter otomatis supaya yg kelihatan cuma yg BENERAN bisa dijual -- kecuali produk/varian
  // yg sedang diedit (t), itu tetap harus muncul walau stoknya skrg pas 0 spy form edit tdk rusak.
  function produkPunyaStok(p, channel) {
    return p.varian.some(v => hitungStokChannel(p.id, v.id, channel) > 0);
  }
  function isiProduk(pilihProdukId) {
    const tipe = selTipe.value;
    const channel = selChannel.value;
    let daftar = DATA.produk;
    if (tipe === 'keluar') {
      daftar = DATA.produk.filter(p => produkPunyaStok(p, channel) || (t && t.produkId === p.id));
    }
    selProduk.innerHTML = daftar.length
      ? daftar.map(p => `<option value="${p.id}">${escapeHtml(p.nama)}</option>`).join('')
      : `<option value="">Tidak ada produk dgn stok di channel ini</option>`;
    if (pilihProdukId && daftar.some(p => p.id === pilihProdukId)) selProduk.value = pilihProdukId;
  }
  function isiVarian(produkId, pilihVarianId) {
    const p = cariProduk(produkId);
    const tipe = selTipe.value;
    const channel = selChannel.value;
    let daftarVarian = p ? p.varian : [];
    if (tipe === 'keluar') {
      daftarVarian = daftarVarian.filter(v => hitungStokChannel(produkId, v.id, channel) > 0 || (t && t.varianId === v.id));
    }
    comboVarian.setDaftar(kelompokkanVarianUntukCombo(produkId, daftarVarian));
    if (pilihVarianId) comboVarian.setNilai(pilihVarianId);
    else if (daftarVarian.length) comboVarian.setNilai(daftarVarian[0].id);
    else comboVarian.kosongkan();
  }
  // Dipanggil tiap Tipe/Channel berubah -- susun ulang daftar produk dulu (baru daftar varian
  // dari produk hasil susun ulang itu), sambil sebisa mungkin pertahankan pilihan yg masih valid.
  function terapkanFilterKetersediaan() {
    const produkLama = selProduk.value;
    const varianLama = comboVarian.getNilai();
    isiProduk(produkLama);
    const produkBaru = selProduk.value;
    isiVarian(produkBaru, produkBaru === produkLama ? varianLama : null);
  }
  function terapkanTipe() {
    const tipe = selTipe.value;
    const labelChannel = modal.querySelector('#labelChannel');
    labelChannel.textContent = tipe === 'keluar' ? 'Channel Penjualan' : (tipe === 'masuk' ? 'Channel Tujuan Restock' : 'Channel yang Dikoreksi');
    labelQty.textContent = tipe === 'koreksi' ? 'Perubahan Stok (boleh minus, cth: -2)' : 'Jumlah';
    modal.querySelector('#fQty').min = tipe === 'koreksi' ? '' : '0';
    terapkanFilterKetersediaan();
    saranHarga();
    perbaruiHintStok();
  }
  // Saran harga otomatis dari harga per-channel varian terpilih -- hanya utk transaksi BARU
  // (tidak menimpa harga transaksi lama yg sedang diedit).
  function saranHarga() {
    if (t || selTipe.value !== 'keluar') return;
    const v = cariVarian(selProduk.value, comboVarian.getNilai());
    if (!v) return;
    const channel = modal.querySelector('#fChannel').value;
    const harga = hargaVarianUntukChannel(v, channel);
    modal.querySelector('#fHarga').value = harga || '';
  }
  function perbaruiHintStok() {
    const produkId = selProduk.value, varianId = comboVarian.getNilai();
    const channel = modal.querySelector('#fChannel').value;
    if (!produkId || !varianId) { modal.querySelector('#hintStokChannel').textContent = ''; return; }
    const stokC = hitungStokChannel(produkId, varianId, channel);
    modal.querySelector('#hintStokChannel').textContent = `Stok ${channel} saat ini: ${stokC} item`;
  }

  selProduk.addEventListener('change', () => { isiVarian(selProduk.value, null); saranHarga(); perbaruiHintStok(); });
  comboVarian.onUbah(() => { saranHarga(); perbaruiHintStok(); });
  selChannel.addEventListener('change', () => { terapkanFilterKetersediaan(); saranHarga(); perbaruiHintStok(); });
  selTipe.addEventListener('change', terapkanTipe);

  if (t) {
    selProduk.value = t.produkId;
    isiVarian(t.produkId, t.varianId);
    selTipe.value = t.tipe;
    if (t.channel) modal.querySelector('#fChannel').value = t.channel;
    modal.querySelector('#fQty').value = t.qty;
  } else if (DATA.produk.length) {
    if (produkIdAwal && cariProduk(produkIdAwal)) selProduk.value = produkIdAwal;
    isiVarian(selProduk.value, null);
  }
  terapkanTipe();

  modal.querySelector('#btnBatal').addEventListener('click', tutupModal);
  modal.querySelector('#btnSimpan').addEventListener('click', () => {
    const produkId = selProduk.value;
    const varianId = comboVarian.getNilai();
    if (!produkId || !varianId) { tampilkanToast('Pilih produk dan varian dulu.', 'error'); return; }
    const tipe = selTipe.value;
    let qty = Number(modal.querySelector('#fQty').value);
    if (tipe !== 'koreksi') qty = Math.abs(qty);
    if (!qty && tipe !== 'koreksi') { tampilkanToast('Jumlah harus lebih dari 0.', 'error'); return; }
    const tanggal = modal.querySelector('#fTanggal').value || tanggalHariIni();
    const channel = modal.querySelector('#fChannel').value;
    const hargaSatuan = Number(modal.querySelector('#fHarga').value) || 0;
    const catatan = modal.querySelector('#fCatatanTx').value.trim();

    if (tipe === 'keluar' || (tipe === 'koreksi' && qty < 0)) {
      const efekLama = (t && t.produkId === produkId && t.varianId === varianId && t.channel === channel) ? -efekTransaksi(t) : 0;
      const stokChannelSaatIni = hitungStokChannel(produkId, varianId, channel) + efekLama;
      const dampak = tipe === 'keluar' ? qty : -qty;
      if (dampak > stokChannelSaatIni) {
        tampilkanToast(`Stok ${channel} tidak cukup -- tersisa ${stokChannelSaatIni}, transaksi ini butuh ${dampak}. Perbaiki jumlah atau channel-nya.`, 'error');
        return;
      }
    }

    if (t) {
      Object.assign(t, { tipe, produkId, varianId, channel, qty, hargaSatuan, catatan, tanggal });
    } else {
      DATA.transaksi.push({ id: buatId('tx'), tipe, produkId, varianId, channel, qty, hargaSatuan, catatan, tanggal, createdAt: new Date().toISOString() });
    }
    simpanData();
    tutupModal();
    tampilkanToast('Transaksi disimpan.', 'sukses');
    if (onSelesai) onSelesai();
  });
}

// ============================================================
// PEMBUKUAN (cashflow) -- terpisah dari menu Transaksi krn harga jual di sana tidak selalu
// = uang yg benar2 diterima (potongan platform, promo, ongkir dst tidak tetap/tidak real).
// Uang Masuk dicatat sbg REKAP per periode per channel (bukan satu per transaksi penjualan),
// Uang Keluar dicatat per tanggal dgn kelompok+rincian biaya. Lihat estimasiLabaPeriode() utk
// perbandingan -- itu ESTIMASI dari data stok/harga, ini pembukuan MANUAL yg lebih akurat.
// ============================================================
function renderPembukuan() {
  document.body.dataset.wsAktif = 'senantiasa';
  const kontainer = KONTEN();
  inisialisasiRentangPembukuan();

  KONTEN_STICKY().innerHTML = `
    <div class="halaman-sticky-host__inner">
      <div class="halaman__header">
        <div><h1>Pembukuan</h1><p>Cashflow uang masuk &amp; keluar per periode</p></div>
        <div class="halaman__header-aksi">
          ${htmlTombolLaporan('pembukuan', 'Buka Laporan Pembukuan')}
          ${htmlRangePicker(RENTANG_PEMBUKUAN)}
          <button class="btn btn-primer" id="btnTambahPembukuan">+ Catat</button>
        </div>
      </div>
      <div class="toolbar">
        <div class="field"><input type="text" id="cariPembukuan" placeholder="Cari catatan/rincian..."></div>
      </div>
    </div>
  `;

  kontainer.innerHTML = `
    <div class="grid-kartu" id="ringkasPembukuan"></div>
    <div class="grid-2">
      <div class="kartu">
        <h2>Uang Masuk per Sumber</h2>
        <div id="rincianMasukSumber"></div>
      </div>
      <div class="kartu">
        <h2>Uang Keluar per Kelompok</h2>
        <div id="rincianKeluarKelompok"></div>
      </div>
    </div>
    <div class="kartu" style="padding:0"><div class="tabel-wrap"><table>
      <thead><tr><th>Tanggal</th><th>Tipe</th><th>Sumber / Kelompok</th><th>Rincian</th><th class="teks-kanan">Jumlah</th><th>Catatan</th><th></th></tr></thead>
      <tbody id="tbodyPembukuan"></tbody>
    </table></div></div>
  `;

  function gambarUlang() {
    const { dari, sampai } = RENTANG_PEMBUKUAN;
    const kata = document.getElementById('cariPembukuan').value.trim().toLowerCase();
    const ring = totalPembukuan(dari, sampai);

    kontainer.querySelector('#ringkasPembukuan').innerHTML = `
      <div class="stat klik ${FILTER_PEMBUKUAN.tipe === 'masuk' ? 'stat--filter-aktif' : ''}" data-filter-tipe-pb="masuk" data-tip="Klik utk filter Uang Masuk saja">
        <div class="stat__top"><div class="stat__icon stat__icon--matisse">${IKON.trend}</div></div>
        <div class="stat__label">Uang Masuk</div>
        <div class="stat__nilai">${formatRupiah(ring.masuk)}</div>
      </div>
      <div class="stat klik ${FILTER_PEMBUKUAN.tipe === 'keluar' ? 'stat--filter-aktif' : ''}" data-filter-tipe-pb="keluar" data-tip="Klik utk filter Uang Keluar saja">
        <div class="stat__top"><div class="stat__icon stat__icon--sienna">${IKON.wallet}</div></div>
        <div class="stat__label">Uang Keluar</div>
        <div class="stat__nilai">${formatRupiah(ring.keluar)}</div>
      </div>
      <div class="stat ${ring.bersih < 0 ? 'warn' : ''}">
        <div class="stat__top"><div class="stat__icon stat__icon--laba">${IKON.laba}</div></div>
        <div class="stat__label">Saldo Bersih</div>
        <div class="stat__nilai"${ring.bersih < 0 ? ' style="color:var(--sienna-dark)"' : ''}>${formatRupiah(ring.bersih)}</div>
      </div>
    `;
    kontainer.querySelectorAll('[data-filter-tipe-pb]').forEach(el => {
      el.addEventListener('click', () => aturFilterTipePembukuan(el.dataset.filterTipePb));
    });

    const perSumber = {};
    CHANNEL_PEMBUKUAN.forEach(c => perSumber[c] = 0);
    ring.list.filter(x => x.tipe === 'masuk').forEach(x => { perSumber[x.sumber] = (perSumber[x.sumber] || 0) + x.jumlah; });
    const maxSumber = Math.max(1, ...Object.values(perSumber));
    kontainer.querySelector('#rincianMasukSumber').innerHTML = CHANNEL_PEMBUKUAN.map(c => {
      const nilai = perSumber[c] || 0;
      const persen = Math.round((nilai / maxSumber) * 100);
      return `<div class="kategori-baris"><span>${badgeChannel(c)}</span><div class="bar-track"><div class="bar-isi ${kelasBarChannel(c)}" style="width:${persen}%"></div></div><span class="teks-kanan">${formatRupiah(nilai)}</span></div>`;
    }).join('');

    const kelompokList = kelompokBiayaTerpakai();
    const perKelompok = {};
    kelompokList.forEach(k => perKelompok[k] = 0);
    ring.list.filter(x => x.tipe === 'keluar').forEach(x => { perKelompok[x.kelompok] = (perKelompok[x.kelompok] || 0) + x.jumlah; });
    const maxKelompok = Math.max(1, ...Object.values(perKelompok));
    kontainer.querySelector('#rincianKeluarKelompok').innerHTML = kelompokList.length ? kelompokList.map(k => {
      const nilai = perKelompok[k] || 0;
      const persen = Math.round((nilai / maxKelompok) * 100);
      return `<div class="kategori-baris"><span>${escapeHtml(k)}</span><div class="bar-track"><div class="bar-isi" style="width:${persen}%;background:var(--sienna)"></div></div><span class="teks-kanan">${formatRupiah(nilai)}</span></div>`;
    }).join('') : `<div class="kosong">Belum ada kelompok biaya.</div>`;

    let list = ring.list.slice();
    if (FILTER_PEMBUKUAN.tipe) list = list.filter(x => x.tipe === FILTER_PEMBUKUAN.tipe);
    if (kata) list = list.filter(x => (x.catatan || '').toLowerCase().includes(kata) || (x.rincian || '').toLowerCase().includes(kata) || (x.kelompok || '').toLowerCase().includes(kata) || (x.sumber || '').toLowerCase().includes(kata));
    list.sort((a, b) => {
      const ka = (a.tipe === 'masuk' ? a.periodeSampai : a.tanggal) + a.createdAt;
      const kb = (b.tipe === 'masuk' ? b.periodeSampai : b.tanggal) + b.createdAt;
      return kb.localeCompare(ka);
    });

    const tbody = kontainer.querySelector('#tbodyPembukuan');
    if (!list.length) { tbody.innerHTML = `<tr><td colspan="7" class="kosong">Tidak ada catatan pembukuan.</td></tr>`; return; }
    tbody.innerHTML = list.map(x => {
      const labelTanggal = x.tipe === 'masuk' ? `${formatTanggal(x.periodeDari)} &ndash; ${formatTanggal(x.periodeSampai)}` : formatTanggal(x.tanggal);
      const sumberKelompok = x.tipe === 'masuk' ? badgeChannel(x.sumber) : escapeHtml(x.kelompok);
      return `<tr class="klik" data-baris-pb="${x.id}" data-tip="Klik baris utk edit">
        <td>${labelTanggal}</td>
        <td>${badgeTipePembukuan(x.tipe)}</td>
        <td>${sumberKelompok}</td>
        <td>${escapeHtml(x.rincian || '-')}</td>
        <td class="teks-kanan"><strong>${formatRupiah(x.jumlah)}</strong></td>
        <td class="teks-lemah">${escapeHtml(x.catatan || '')}</td>
        <td class="teks-kanan">
          <button class="btn btn-kecil btn-ikon" data-edit-pb="${x.id}" data-tip="Edit">${IKON.editKecil}</button>
          <button class="btn btn-kecil btn-ikon btn-bahaya" data-hapus-pb="${x.id}" data-tip="Hapus">${IKON.hapusKecil}</button>
        </td>
      </tr>`;
    }).join('');
    tbody.querySelectorAll('[data-baris-pb]').forEach(tr => tr.addEventListener('click', (e) => {
      if (e.target.closest('button')) return;
      modalFormPembukuan(tr.dataset.barisPb, gambarUlang);
    }));
    tbody.querySelectorAll('[data-edit-pb]').forEach(btn => btn.addEventListener('click', () => modalFormPembukuan(btn.dataset.editPb, gambarUlang)));
    tbody.querySelectorAll('[data-hapus-pb]').forEach(btn => btn.addEventListener('click', () => {
      konfirmasi('Hapus catatan pembukuan ini?', () => {
        DATA.pembukuan = DATA.pembukuan.filter(x => x.id !== btn.dataset.hapusPb);
        simpanData();
        tampilkanToast('Catatan dihapus.', 'sukses');
        gambarUlang();
      }, { bahaya: true, labelYa: 'Hapus' });
    }));
  }

  REFRESH_TABEL_PEMBUKUAN = gambarUlang;
  document.getElementById('cariPembukuan').addEventListener('input', gambarUlang);
  document.getElementById('btnTambahPembukuan').addEventListener('click', () => modalFormPembukuan(null, gambarUlang));
  gambarUlang();
  pasangRangePicker({ ambil: () => RENTANG_PEMBUKUAN, atur: (r) => { RENTANG_PEMBUKUAN = r; }, render: renderPembukuan });
  pasangHeaderSticky();
}

function modalFormPembukuan(id, onSelesai) {
  const x = id ? DATA.pembukuan.find(p => p.id === id) : null;
  const kelompokOpsi = kelompokBiayaTerpakai();
  const hariIni = tanggalHariIni();

  const modal = bukaModal(x ? 'Edit Catatan Pembukuan' : 'Catat Pembukuan', `
    <div class="field">
      <label>Tipe</label>
      <select id="fTipePb">
        <option value="masuk">Uang Masuk (rekap penjualan per channel)</option>
        <option value="keluar">Uang Keluar (biaya/pengeluaran)</option>
      </select>
    </div>
    <div id="wrapMasukPb">
      <div class="field">
        <label>Sumber (Channel)</label>
        <select id="fSumberPb">${CHANNEL_PEMBUKUAN.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('')}</select>
        <div class="hint">Tokopedia sengaja tidak masuk daftar sumber uang masuk.</div>
      </div>
      <div class="field-row">
        <div class="field"><label>Periode Dari</label><input type="date" id="fPeriodeDariPb"></div>
        <div class="field"><label>Periode Sampai</label><input type="date" id="fPeriodeSampaiPb"></div>
      </div>
    </div>
    <div id="wrapKeluarPb" style="display:none">
      <div class="field"><label>Tanggal</label><input type="date" id="fTanggalPb"></div>
      <div class="field-row">
        <div class="field">
          <label>Kelompok Biaya</label>
          <select id="fKelompokPb">
            ${kelompokOpsi.map(k => `<option value="${escapeHtml(k)}">${escapeHtml(k)}</option>`).join('')}
            <option value="__baru__">+ Kelompok baru...</option>
          </select>
          <input type="text" id="fKelompokBaruPb" placeholder="Nama kelompok baru" style="display:none;margin-top:6px">
        </div>
        <div class="field">
          <label>Rincian (opsional)</label>
          <select id="fRincianPb"></select>
          <input type="text" id="fRincianBaruPb" placeholder="Rincian baru" style="display:none;margin-top:6px">
        </div>
      </div>
      <div class="hint">Kelola daftar kelompok &amp; rincian biaya di menu Pengaturan.</div>
    </div>
    <div class="field-row">
      <div class="field"><label>Jumlah (Rp)</label><input type="number" id="fJumlahPb" min="0" placeholder="0"></div>
      <div class="field"><label>Catatan (opsional)</label><input type="text" id="fCatatanPb" placeholder="Contoh: bayar listrik bulan ini"></div>
    </div>
    <div class="modal__aksi">
      <button class="btn" id="btnBatal">Batal</button>
      <button class="btn btn-primer" id="btnSimpan">Simpan</button>
    </div>
  `);

  const selTipe = modal.querySelector('#fTipePb');
  const selKelompok = modal.querySelector('#fKelompokPb');
  const selRincian = modal.querySelector('#fRincianPb');

  function isiRincian(kelompok, pilihRincian) {
    const opsi = rincianBiayaTerpakai(kelompok);
    selRincian.innerHTML = `<option value="">Tanpa rincian</option>` +
      opsi.map(r => `<option value="${escapeHtml(r)}">${escapeHtml(r)}</option>`).join('') +
      `<option value="__baru__">+ Rincian baru...</option>`;
    if (pilihRincian) selRincian.value = pilihRincian;
  }
  function terapkanTipe() {
    const tipe = selTipe.value;
    modal.querySelector('#wrapMasukPb').style.display = tipe === 'masuk' ? '' : 'none';
    modal.querySelector('#wrapKeluarPb').style.display = tipe === 'keluar' ? '' : 'none';
  }
  selTipe.addEventListener('change', terapkanTipe);
  selKelompok.addEventListener('change', () => {
    const isBaru = selKelompok.value === '__baru__';
    modal.querySelector('#fKelompokBaruPb').style.display = isBaru ? '' : 'none';
    if (isBaru) { modal.querySelector('#fKelompokBaruPb').focus(); selRincian.innerHTML = ''; }
    else isiRincian(selKelompok.value, null);
  });
  selRincian.addEventListener('change', () => {
    const isBaru = selRincian.value === '__baru__';
    modal.querySelector('#fRincianBaruPb').style.display = isBaru ? '' : 'none';
    if (isBaru) modal.querySelector('#fRincianBaruPb').focus();
  });

  if (x) {
    selTipe.value = x.tipe;
    if (x.tipe === 'masuk') {
      modal.querySelector('#fSumberPb').value = x.sumber;
      modal.querySelector('#fPeriodeDariPb').value = x.periodeDari;
      modal.querySelector('#fPeriodeSampaiPb').value = x.periodeSampai;
    } else {
      modal.querySelector('#fTanggalPb').value = x.tanggal;
      if (kelompokOpsi.includes(x.kelompok)) selKelompok.value = x.kelompok;
      isiRincian(selKelompok.value, x.rincian);
    }
    modal.querySelector('#fJumlahPb').value = x.jumlah;
    modal.querySelector('#fCatatanPb').value = x.catatan || '';
  } else {
    modal.querySelector('#fTanggalPb').value = hariIni;
    modal.querySelector('#fPeriodeDariPb').value = hariIni.slice(0, 8) + '01';
    modal.querySelector('#fPeriodeSampaiPb').value = hariIni;
    isiRincian(selKelompok.value, null);
  }
  terapkanTipe();

  modal.querySelector('#btnBatal').addEventListener('click', tutupModal);
  modal.querySelector('#btnSimpan').addEventListener('click', () => {
    const tipe = selTipe.value;
    const jumlah = Number(modal.querySelector('#fJumlahPb').value) || 0;
    const catatan = modal.querySelector('#fCatatanPb').value.trim();
    if (jumlah <= 0) { tampilkanToast('Jumlah wajib diisi lebih dari 0.', 'error'); return; }

    const data = { jumlah, catatan };
    if (tipe === 'masuk') {
      const dari = modal.querySelector('#fPeriodeDariPb').value;
      const sampai = modal.querySelector('#fPeriodeSampaiPb').value;
      if (!dari || !sampai || dari > sampai) { tampilkanToast('Periode tidak valid.', 'error'); return; }
      data.sumber = modal.querySelector('#fSumberPb').value;
      data.periodeDari = dari;
      data.periodeSampai = sampai;
    } else {
      const tanggal = modal.querySelector('#fTanggalPb').value;
      if (!tanggal) { tampilkanToast('Tanggal wajib diisi.', 'error'); return; }
      const selKelompokVal = selKelompok.value;
      const kelompok = bersihkanNamaKlasifikasi(selKelompokVal === '__baru__' ? modal.querySelector('#fKelompokBaruPb').value : selKelompokVal);
      if (!kelompok) { tampilkanToast('Kelompok biaya wajib diisi.', 'error'); return; }
      const selRincianVal = selRincian.value;
      const rincian = bersihkanNamaKlasifikasi(selRincianVal === '__baru__' ? modal.querySelector('#fRincianBaruPb').value : selRincianVal);
      tambahKlasifikasi('kelompokBiayaList', kelompok);
      if (rincian) tambahRincianBiaya(kelompok, rincian);
      data.tanggal = tanggal;
      data.kelompok = kelompok;
      data.rincian = rincian;
    }

    if (x) {
      if (x.tipe === 'masuk' && tipe === 'keluar') { delete x.sumber; delete x.periodeDari; delete x.periodeSampai; }
      if (x.tipe === 'keluar' && tipe === 'masuk') { delete x.tanggal; delete x.kelompok; delete x.rincian; }
      Object.assign(x, { tipe }, data);
    } else {
      DATA.pembukuan.push({ id: buatId('pb'), tipe, ...data, createdAt: new Date().toISOString() });
    }
    simpanData();
    tutupModal();
    tampilkanToast('Catatan pembukuan disimpan.', 'sukses');
    if (onSelesai) onSelesai();
  });
}

// ============================================================
// PEMBUKUAN WORKSPACE LAIN (Dinda Personal Finance, Retro Gaming Space Seririt)
// ============================================================
// Alur & markup SAMA dgn renderPembukuan/modalFormPembukuan (Senantiasa) di atas, diparameterkan
// by wsId lewat helper wsPembukuan*() di data.js. Beda utama: "Uang Masuk" di sini pakai
// kelompok+rincian yg bebas diedit (spt "Uang Keluar" Senantiasa), bukan sumber channel tetap
// -- dan selalu per tanggal tunggal, tanpa konsep rekap periode.
function renderPembukuanWs(wsId) {
  document.body.dataset.wsAktif = wsId;
  const info = PEMBUKUAN_WS_INFO[wsId];
  const kontainer = KONTEN();
  inisialisasiRentangPembukuanWs(wsId);

  KONTEN_STICKY().innerHTML = `
    <div class="halaman-sticky-host__inner">
      <div class="halaman__header">
        <div>${wsId === 'retro'
          ? `<img src="assets/img/retro-gaming-logo.png?v=20260925c" alt="${escapeHtml(info.judul)}" class="halaman__header-logo">`
          : `<h1>${escapeHtml(info.judul)}</h1>`}<p>${escapeHtml(info.deskripsi)}</p></div>
        <div class="halaman__header-aksi">
          ${htmlTombolLaporan('pembukuan-' + wsId, 'Buka Laporan ' + info.judul)}
          ${htmlRangePicker(RENTANG_PEMBUKUAN_WS[wsId])}
          <button class="btn btn-primer" id="btnTambahPembukuanWs">+ Catat</button>
        </div>
      </div>
      <div class="toolbar">
        <div class="field"><input type="text" id="cariPembukuanWs" placeholder="Cari catatan/rincian..."></div>
      </div>
    </div>
  `;

  kontainer.innerHTML = `
    <div class="grid-kartu" id="ringkasPembukuanWs"></div>
    <div class="grid-2">
      <div class="kartu">
        <h2>Uang Masuk per Kelompok</h2>
        <div id="rincianMasukWs"></div>
      </div>
      <div class="kartu">
        <h2>Uang Keluar per Kelompok</h2>
        <div id="rincianKeluarWs"></div>
      </div>
    </div>
    <div class="kartu" style="padding:0"><div class="tabel-wrap"><table>
      <thead><tr><th>Tanggal</th><th>Tipe</th><th>Kelompok</th><th>Rincian</th><th class="teks-kanan">Jumlah</th><th>Catatan</th><th></th></tr></thead>
      <tbody id="tbodyPembukuanWs"></tbody>
    </table></div></div>
  `;

  function gambarUlang() {
    const { dari, sampai } = RENTANG_PEMBUKUAN_WS[wsId];
    const kata = document.getElementById('cariPembukuanWs').value.trim().toLowerCase();
    const ring = wsTotalPembukuan(wsId, dari, sampai);
    const f = FILTER_PEMBUKUAN_WS[wsId];

    kontainer.querySelector('#ringkasPembukuanWs').innerHTML = `
      <div class="stat klik ${f.tipe === 'masuk' ? 'stat--filter-aktif' : ''}" data-filter-tipe-pbws="masuk" data-tip="Klik utk filter Uang Masuk saja">
        <div class="stat__top"><div class="stat__icon stat__icon--matisse">${IKON.trend}</div></div>
        <div class="stat__label">Uang Masuk</div>
        <div class="stat__nilai">${formatRupiah(ring.masuk)}</div>
      </div>
      <div class="stat klik ${f.tipe === 'keluar' ? 'stat--filter-aktif' : ''}" data-filter-tipe-pbws="keluar" data-tip="Klik utk filter Uang Keluar saja">
        <div class="stat__top"><div class="stat__icon stat__icon--sienna">${IKON.wallet}</div></div>
        <div class="stat__label">Uang Keluar</div>
        <div class="stat__nilai">${formatRupiah(ring.keluar)}</div>
      </div>
      <div class="stat ${ring.bersih < 0 ? 'warn' : ''}">
        <div class="stat__top"><div class="stat__icon stat__icon--laba">${IKON.laba}</div></div>
        <div class="stat__label">Saldo Bersih</div>
        <div class="stat__nilai"${ring.bersih < 0 ? ' style="color:var(--sienna-dark)"' : ''}>${formatRupiah(ring.bersih)}</div>
      </div>
    `;
    kontainer.querySelectorAll('[data-filter-tipe-pbws]').forEach(el => {
      el.addEventListener('click', () => aturFilterTipePembukuanWs(wsId, el.dataset.filterTipePbws));
    });

    const kelMasukList = wsKelompokTerpakai(wsId, 'masuk');
    const perMasuk = {};
    kelMasukList.forEach(k => perMasuk[k] = 0);
    ring.list.filter(x => x.tipe === 'masuk').forEach(x => { perMasuk[x.kelompok] = (perMasuk[x.kelompok] || 0) + x.jumlah; });
    const maxMasuk = Math.max(1, ...Object.values(perMasuk));
    kontainer.querySelector('#rincianMasukWs').innerHTML = kelMasukList.length ? kelMasukList.map(k => {
      const nilai = perMasuk[k] || 0;
      const persen = Math.round((nilai / maxMasuk) * 100);
      return `<div class="kategori-baris"><span>${escapeHtml(k)}</span><div class="bar-track"><div class="bar-isi" style="width:${persen}%;background:var(--matisse)"></div></div><span class="teks-kanan">${formatRupiah(nilai)}</span></div>`;
    }).join('') : `<div class="kosong">Belum ada kelompok pemasukan.</div>`;

    const kelKeluarList = wsKelompokTerpakai(wsId, 'keluar');
    const perKeluar = {};
    kelKeluarList.forEach(k => perKeluar[k] = 0);
    ring.list.filter(x => x.tipe === 'keluar').forEach(x => { perKeluar[x.kelompok] = (perKeluar[x.kelompok] || 0) + x.jumlah; });
    const maxKeluar = Math.max(1, ...Object.values(perKeluar));
    kontainer.querySelector('#rincianKeluarWs').innerHTML = kelKeluarList.length ? kelKeluarList.map(k => {
      const nilai = perKeluar[k] || 0;
      const persen = Math.round((nilai / maxKeluar) * 100);
      return `<div class="kategori-baris"><span>${escapeHtml(k)}</span><div class="bar-track"><div class="bar-isi" style="width:${persen}%;background:var(--sienna)"></div></div><span class="teks-kanan">${formatRupiah(nilai)}</span></div>`;
    }).join('') : `<div class="kosong">Belum ada kelompok pengeluaran.</div>`;

    let list = ring.list.slice();
    if (f.tipe) list = list.filter(x => x.tipe === f.tipe);
    if (kata) list = list.filter(x => (x.catatan || '').toLowerCase().includes(kata) || (x.rincian || '').toLowerCase().includes(kata) || (x.kelompok || '').toLowerCase().includes(kata));
    list.sort((a, b) => (b.tanggal + b.createdAt).localeCompare(a.tanggal + a.createdAt));

    const tbody = kontainer.querySelector('#tbodyPembukuanWs');
    if (!list.length) { tbody.innerHTML = `<tr><td colspan="7" class="kosong">Tidak ada catatan pembukuan.</td></tr>`; return; }
    tbody.innerHTML = list.map(x => `<tr class="klik" data-baris-pbws="${x.id}" data-tip="Klik baris utk edit">
        <td>${formatTanggal(x.tanggal)}</td>
        <td>${badgeTipePembukuan(x.tipe)}</td>
        <td>${escapeHtml(x.kelompok)}</td>
        <td>${escapeHtml(x.rincian || '-')}</td>
        <td class="teks-kanan"><strong>${formatRupiah(x.jumlah)}</strong></td>
        <td class="teks-lemah">${escapeHtml(x.catatan || '')}</td>
        <td class="teks-kanan">
          <button class="btn btn-kecil btn-ikon" data-edit-pbws="${x.id}" data-tip="Edit">${IKON.editKecil}</button>
          <button class="btn btn-kecil btn-ikon btn-bahaya" data-hapus-pbws="${x.id}" data-tip="Hapus">${IKON.hapusKecil}</button>
        </td>
      </tr>`).join('');
    tbody.querySelectorAll('[data-baris-pbws]').forEach(tr => tr.addEventListener('click', (e) => {
      if (e.target.closest('button')) return;
      modalFormPembukuanWs(wsId, tr.dataset.barisPbws, gambarUlang);
    }));
    tbody.querySelectorAll('[data-edit-pbws]').forEach(btn => btn.addEventListener('click', () => modalFormPembukuanWs(wsId, btn.dataset.editPbws, gambarUlang)));
    tbody.querySelectorAll('[data-hapus-pbws]').forEach(btn => btn.addEventListener('click', () => {
      konfirmasi('Hapus catatan pembukuan ini?', () => {
        const ws = wsPembukuan(wsId);
        ws.list = ws.list.filter(x => x.id !== btn.dataset.hapusPbws);
        simpanData();
        tampilkanToast('Catatan dihapus.', 'sukses');
        gambarUlang();
      }, { bahaya: true, labelYa: 'Hapus' });
    }));
  }

  REFRESH_TABEL_PEMBUKUAN_WS[wsId] = gambarUlang;
  document.getElementById('cariPembukuanWs').addEventListener('input', gambarUlang);
  document.getElementById('btnTambahPembukuanWs').addEventListener('click', () => modalFormPembukuanWs(wsId, null, gambarUlang));
  gambarUlang();
  pasangRangePicker({ ambil: () => RENTANG_PEMBUKUAN_WS[wsId], atur: (r) => { RENTANG_PEMBUKUAN_WS[wsId] = r; }, render: () => renderPembukuanWs(wsId) });
  pasangHeaderSticky();
}

function modalFormPembukuanWs(wsId, id, onSelesai) {
  const info = PEMBUKUAN_WS_INFO[wsId];
  const ws = wsPembukuan(wsId);
  const x = id ? ws.list.find(p => p.id === id) : null;
  const hariIni = tanggalHariIni();

  const modal = bukaModal(x ? 'Edit Catatan ' + info.judul : 'Catat ' + info.judul, `
    <div class="field">
      <label>Tipe</label>
      <select id="fTipePbWs">
        <option value="masuk">Uang Masuk</option>
        <option value="keluar">Uang Keluar</option>
      </select>
    </div>
    <div class="field"><label>Tanggal</label><input type="date" id="fTanggalPbWs"></div>
    <div class="field-row">
      <div class="field">
        <label>Kelompok</label>
        <select id="fKelompokPbWs"></select>
        <input type="text" id="fKelompokBaruPbWs" placeholder="Nama kelompok baru" style="display:none;margin-top:6px">
      </div>
      <div class="field">
        <label>Rincian (opsional)</label>
        <select id="fRincianPbWs"></select>
        <input type="text" id="fRincianBaruPbWs" placeholder="Rincian baru" style="display:none;margin-top:6px">
      </div>
    </div>
    <div class="hint">Kelola daftar kelompok &amp; rincian di menu Pengaturan.</div>
    <div class="field-row">
      <div class="field"><label>Jumlah (Rp)</label><input type="number" id="fJumlahPbWs" min="0" placeholder="0"></div>
      <div class="field"><label>Catatan (opsional)</label><input type="text" id="fCatatanPbWs" placeholder="Contoh: catatan tambahan"></div>
    </div>
    <div class="modal__aksi">
      <button class="btn" id="btnBatal">Batal</button>
      <button class="btn btn-primer" id="btnSimpan">Simpan</button>
    </div>
  `);

  const selTipe = modal.querySelector('#fTipePbWs');
  const selKelompok = modal.querySelector('#fKelompokPbWs');
  const selRincian = modal.querySelector('#fRincianPbWs');

  function isiRincian(tipe, kelompok, pilihRincian) {
    const opsi = wsRincianTerpakai(wsId, tipe, kelompok);
    selRincian.innerHTML = `<option value="">Tanpa rincian</option>` +
      opsi.map(r => `<option value="${escapeHtml(r)}">${escapeHtml(r)}</option>`).join('') +
      `<option value="__baru__">+ Rincian baru...</option>`;
    if (pilihRincian) selRincian.value = pilihRincian;
    modal.querySelector('#fRincianBaruPbWs').style.display = 'none';
  }
  function isiKelompok(tipe, pilihKelompok) {
    const opsi = wsKelompokTerpakai(wsId, tipe);
    selKelompok.innerHTML = opsi.map(k => `<option value="${escapeHtml(k)}">${escapeHtml(k)}</option>`).join('') +
      `<option value="__baru__">+ Kelompok baru...</option>`;
    if (pilihKelompok && opsi.includes(pilihKelompok)) selKelompok.value = pilihKelompok;
    modal.querySelector('#fKelompokBaruPbWs').style.display = 'none';
    isiRincian(tipe, selKelompok.value, null);
  }

  selTipe.addEventListener('change', () => isiKelompok(selTipe.value, null));
  selKelompok.addEventListener('change', () => {
    const isBaru = selKelompok.value === '__baru__';
    modal.querySelector('#fKelompokBaruPbWs').style.display = isBaru ? '' : 'none';
    if (isBaru) { modal.querySelector('#fKelompokBaruPbWs').focus(); selRincian.innerHTML = ''; }
    else isiRincian(selTipe.value, selKelompok.value, null);
  });
  selRincian.addEventListener('change', () => {
    const isBaru = selRincian.value === '__baru__';
    modal.querySelector('#fRincianBaruPbWs').style.display = isBaru ? '' : 'none';
    if (isBaru) modal.querySelector('#fRincianBaruPbWs').focus();
  });

  if (x) {
    selTipe.value = x.tipe;
    modal.querySelector('#fTanggalPbWs').value = x.tanggal;
    isiKelompok(x.tipe, x.kelompok);
    isiRincian(x.tipe, x.kelompok, x.rincian);
    modal.querySelector('#fJumlahPbWs').value = x.jumlah;
    modal.querySelector('#fCatatanPbWs').value = x.catatan || '';
  } else {
    modal.querySelector('#fTanggalPbWs').value = hariIni;
    isiKelompok('masuk', null);
  }

  modal.querySelector('#btnBatal').addEventListener('click', tutupModal);
  modal.querySelector('#btnSimpan').addEventListener('click', () => {
    const tipe = selTipe.value;
    const tanggal = modal.querySelector('#fTanggalPbWs').value;
    const jumlah = Number(modal.querySelector('#fJumlahPbWs').value) || 0;
    const catatan = modal.querySelector('#fCatatanPbWs').value.trim();
    if (!tanggal) { tampilkanToast('Tanggal wajib diisi.', 'error'); return; }
    if (jumlah <= 0) { tampilkanToast('Jumlah wajib diisi lebih dari 0.', 'error'); return; }
    const selKelompokVal = selKelompok.value;
    const kelompok = bersihkanNamaKlasifikasi(selKelompokVal === '__baru__' ? modal.querySelector('#fKelompokBaruPbWs').value : selKelompokVal);
    if (!kelompok) { tampilkanToast('Kelompok wajib diisi.', 'error'); return; }
    const selRincianVal = selRincian.value;
    const rincian = bersihkanNamaKlasifikasi(selRincianVal === '__baru__' ? modal.querySelector('#fRincianBaruPbWs').value : selRincianVal);
    wsTambahKelompok(wsId, tipe, kelompok);
    if (rincian) wsTambahRincian(wsId, tipe, kelompok, rincian);

    const data = { tipe, tanggal, kelompok, rincian, jumlah, catatan };
    if (x) Object.assign(x, data);
    else ws.list.push({ id: buatId('pb' + wsId), ...data, createdAt: new Date().toISOString() });
    simpanData();
    tutupModal();
    tampilkanToast('Catatan pembukuan disimpan.', 'sukses');
    if (onSelesai) onSelesai();
  });
}

// ---------- Laporan Pembukuan workspace lain (dipakai di halaman Laporan, lihat renderLaporan) ----------
function htmlLaporanPembukuanWs(wsId, dari, sampai) {
  const info = PEMBUKUAN_WS_INFO[wsId];
  const ring = wsTotalPembukuan(wsId, dari, sampai);
  const list = ring.list.slice().sort((a, b) => (a.tanggal + a.createdAt).localeCompare(b.tanggal + b.createdAt));

  const kelMasukList = wsKelompokTerpakai(wsId, 'masuk');
  const perMasuk = {};
  kelMasukList.forEach(k => perMasuk[k] = 0);
  list.filter(x => x.tipe === 'masuk').forEach(x => { perMasuk[x.kelompok] = (perMasuk[x.kelompok] || 0) + x.jumlah; });

  const kelKeluarList = wsKelompokTerpakai(wsId, 'keluar');
  const perKeluar = {};
  kelKeluarList.forEach(k => perKeluar[k] = 0);
  list.filter(x => x.tipe === 'keluar').forEach(x => { perKeluar[x.kelompok] = (perKeluar[x.kelompok] || 0) + x.jumlah; });

  const brandWs = wsId === 'retro'
    ? { logo: 'assets/img/retro-gaming-logo.png?v=20260925c', nama: info.judul, logoOnly: true }
    : null;

  return `<div class="laporan-kertas laporan-kertas--${wsId}">
    ${htmlKopLaporan('Laporan ' + info.judul, 'Periode ' + formatRentangLabel(dari, sampai), brandWs)}
    <div class="laporan-ringkas">
      <div><span>Uang Masuk</span><strong>${formatRupiah(ring.masuk)}</strong></div>
      <div><span>Uang Keluar</span><strong>${formatRupiah(ring.keluar)}</strong></div>
      <div><span>Saldo Bersih</span><strong${ring.bersih < 0 ? ' style="color:var(--bahaya)"' : ''}>${formatRupiah(ring.bersih)}</strong></div>
    </div>

    <h3 class="laporan-subjudul">Uang Masuk per Kelompok</h3>
    ${kelMasukList.length ? `<div class="laporan-tabel-wrap"><table class="laporan-tabel">
      <thead><tr><th>Kelompok</th><th class="teks-kanan">Jumlah</th></tr></thead>
      <tbody>${kelMasukList.map(k => `<tr><td>${escapeHtml(k)}</td><td class="teks-kanan">${formatRupiah(perMasuk[k] || 0)}</td></tr>`).join('')}</tbody>
    </table></div>` : `<div class="kosong">Belum ada kelompok pemasukan.</div>`}

    <h3 class="laporan-subjudul">Uang Keluar per Kelompok</h3>
    ${kelKeluarList.length ? `<div class="laporan-tabel-wrap"><table class="laporan-tabel">
      <thead><tr><th>Kelompok</th><th class="teks-kanan">Jumlah</th></tr></thead>
      <tbody>${kelKeluarList.map(k => `<tr><td>${escapeHtml(k)}</td><td class="teks-kanan">${formatRupiah(perKeluar[k] || 0)}</td></tr>`).join('')}</tbody>
    </table></div>` : `<div class="kosong">Belum ada kelompok pengeluaran.</div>`}

    <h3 class="laporan-subjudul">Rincian Catatan</h3>
    <div class="laporan-tabel-wrap"><table class="laporan-tabel">
      <thead><tr><th>Tanggal</th><th>Tipe</th><th>Kelompok</th><th>Rincian</th><th class="teks-kanan">Jumlah</th><th>Catatan</th></tr></thead>
      <tbody>
        ${list.length ? list.map(x => `<tr>
            <td>${formatTanggal(x.tanggal)}</td>
            <td>${badgeTipePembukuan(x.tipe)}</td>
            <td>${escapeHtml(x.kelompok)}</td>
            <td>${escapeHtml(x.rincian || '-')}</td>
            <td class="teks-kanan">${formatRupiah(x.jumlah)}</td>
            <td class="teks-lemah">${escapeHtml(x.catatan || '')}</td>
          </tr>`).join('') : `<tr><td colspan="6" class="kosong">Tidak ada catatan pembukuan di periode ini.</td></tr>`}
      </tbody>
      ${list.length ? `<tfoot><tr>
        <td colspan="4" class="teks-kanan"><strong>Saldo Bersih</strong></td>
        <td class="teks-kanan"><strong${ring.bersih < 0 ? ' style="color:var(--bahaya)"' : ''}>${formatRupiah(ring.bersih)}</strong></td>
        <td></td>
      </tr></tfoot>` : ''}
    </table></div>
  </div>`;
}

// ============================================================
// LAPORAN
// ============================================================
function renderLaporan() {
  const kontainer = KONTEN();
  inisialisasiRentangLaporan();

  const pemilik = apakahPemilik();
  // Karyawan nyasar ke tab pembukuan (mis. dari sesi lama sblm role-nya dicek) jatuh balik ke
  // Laporan Stok drpd nampilin laporan uang yg tabnya sendiri sudah disembunyikan di bawah.
  if (!pemilik && HALAMAN_KHUSUS_PEMILIK.includes(JENIS_LAPORAN_AKTIF)) {
    JENIS_LAPORAN_AKTIF = 'stok';
  }

  kontainer.innerHTML = `
    <div class="halaman__header">
      <div><h1>Laporan</h1></div>
      <button class="btn" id="btnCetak">🖶 Cetak / Simpan PDF</button>
    </div>
    <div class="laporan-tab-baris">
      <div class="laporan-tab-baris__tabs">
        <button type="button" class="laporan-tab ${JENIS_LAPORAN_AKTIF === 'stok' ? 'aktif' : ''}" data-jenis="stok">Laporan Stok</button>
        <button type="button" class="laporan-tab ${JENIS_LAPORAN_AKTIF === 'transaksi' ? 'aktif' : ''}" data-jenis="transaksi">Laporan Transaksi</button>
        <button type="button" class="laporan-tab ${JENIS_LAPORAN_AKTIF === 'total' ? 'aktif' : ''}" data-jenis="total">Laporan Total</button>
        ${!pemilik ? '' : `
          <button type="button" class="laporan-tab ${JENIS_LAPORAN_AKTIF === 'pembukuan' ? 'aktif' : ''}" data-jenis="pembukuan">Laporan Pembukuan</button>
          <button type="button" class="laporan-tab ${JENIS_LAPORAN_AKTIF === 'pembukuan-dinda' ? 'aktif' : ''}" data-jenis="pembukuan-dinda">Laporan Dinda</button>
          <button type="button" class="laporan-tab ${JENIS_LAPORAN_AKTIF === 'pembukuan-retro' ? 'aktif' : ''}" data-jenis="pembukuan-retro">Laporan Retro Gaming</button>
        `}
      </div>
      <div class="toolbar" id="toolbarLaporan" style="margin-bottom:0"></div>
    </div>
    <div id="isiLaporan"></div>
  `;

  function gambarToolbar() {
    const host = kontainer.querySelector('#toolbarLaporan');
    if (JENIS_LAPORAN_AKTIF === 'stok') { host.hidden = true; host.innerHTML = ''; return; }
    host.hidden = false;
    host.innerHTML = htmlRangePicker(RENTANG_LAPORAN);
    pasangRangePicker({ ambil: () => RENTANG_LAPORAN, atur: (r) => { RENTANG_LAPORAN = r; }, render: renderLaporan });
  }

  function gambarUlang() {
    const host = kontainer.querySelector('#isiLaporan');
    if (JENIS_LAPORAN_AKTIF === 'stok') host.innerHTML = htmlLaporanStok();
    else if (JENIS_LAPORAN_AKTIF === 'transaksi') host.innerHTML = htmlLaporanTransaksi(RENTANG_LAPORAN.dari, RENTANG_LAPORAN.sampai);
    else if (JENIS_LAPORAN_AKTIF === 'total') host.innerHTML = htmlLaporanTotal(RENTANG_LAPORAN.dari, RENTANG_LAPORAN.sampai);
    else if (JENIS_LAPORAN_AKTIF === 'pembukuan-dinda') host.innerHTML = htmlLaporanPembukuanWs('dinda', RENTANG_LAPORAN.dari, RENTANG_LAPORAN.sampai);
    else if (JENIS_LAPORAN_AKTIF === 'pembukuan-retro') host.innerHTML = htmlLaporanPembukuanWs('retro', RENTANG_LAPORAN.dari, RENTANG_LAPORAN.sampai);
    else host.innerHTML = htmlLaporanPembukuan(RENTANG_LAPORAN.dari, RENTANG_LAPORAN.sampai);
    host.querySelectorAll('[data-arah-produk]').forEach(tr => {
      if (!tr.dataset.arahProduk) return;
      tr.addEventListener('click', () => { location.hash = '#produk/' + tr.dataset.arahProduk; });
    });
  }

  kontainer.querySelectorAll('.laporan-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.dataset.jenis === JENIS_LAPORAN_AKTIF) return;
      JENIS_LAPORAN_AKTIF = btn.dataset.jenis;
      kontainer.querySelectorAll('.laporan-tab').forEach(b => b.classList.toggle('aktif', b === btn));
      gambarToolbar();
      gambarUlang();
    });
  });
  kontainer.querySelector('#btnCetak').addEventListener('click', () => window.print());

  gambarToolbar();
  gambarUlang();
}

// Kop/letterhead dipakai di ketiga jenis laporan supaya konsisten begitu dicetak jadi PDF/kertas.
// `brand` opsional -- dipakai laporan pembukuan yg punya logo sendiri (mis. Retro Gaming Space
// Seririt) supaya kop-nya tampil logo brand ybs, bukan logo Senantiasa. `logoOnly: true` kalau
// logonya sendiri sudah memuat nama brand (spy tidak dobel teks nama di sampingnya).
function htmlKopLaporan(judul, subjudul, brand) {
  const b = brand || { logo: 'assets/img/logo.png?v=20260925c', nama: 'Senantiasa', sub: 'Inventory & Penjualan' };
  return `<div class="laporan-kop">
    <div class="laporan-kop__brand ${b.logoOnly ? 'laporan-kop__brand--logo-only' : ''}">
      <img src="${b.logo}" alt="${escapeHtml(b.nama)}">
      ${b.logoOnly ? '' : `<div><strong>${escapeHtml(b.nama)}</strong><span>${escapeHtml(b.sub)}</span></div>`}
    </div>
    <div class="laporan-kop__judul">
      <h2>${escapeHtml(judul)}</h2>
      <p>${escapeHtml(subjudul)}</p>
    </div>
    <div class="laporan-kop__meta">Dicetak ${formatTanggalWaktu(new Date().toISOString())}</div>
  </div>`;
}

// ---------- Laporan Stok: snapshot detail tiap varian (semua channel), tanpa periode ----------
function htmlLaporanStok() {
  const baris = [];
  DATA.produk.slice().sort((a, b) => a.nama.localeCompare(b.nama)).forEach(p => {
    p.varian.forEach(v => baris.push({ p, v, stok: hitungStok(p.id, v.id) }));
  });
  const totalStok = baris.reduce((a, x) => a + x.stok, 0);
  const totalModal = baris.reduce((a, x) => a + x.stok * (x.v.hargaModal || 0), 0);
  const menipis = baris.filter(x => x.stok <= (x.p.stokMinim ?? 3));
  const kolomKosong = 3 + CHANNEL_LIST.length + 2;

  return `<div class="laporan-kertas">
    ${htmlKopLaporan('Laporan Stok', 'Snapshot per ' + formatTanggal(tanggalHariIni()))}
    <div class="laporan-ringkas">
      <div><span>Total Produk</span><strong>${DATA.produk.length}</strong></div>
      <div><span>Total Varian</span><strong>${baris.length}</strong></div>
      <div><span>Total Stok</span><strong>${totalStok} item</strong></div>
      <div><span>Nilai Stok (Modal)</span><strong>${formatRupiah(totalModal)}</strong></div>
      <div><span>Varian Stok Menipis</span><strong${menipis.length ? ' style="color:var(--sienna-dark)"' : ''}>${menipis.length}</strong></div>
    </div>
    <div class="laporan-tabel-wrap"><table class="laporan-tabel">
      <thead><tr>
        <th>Produk</th><th>Kategori</th><th>Varian</th>
        ${CHANNEL_LIST.map(c => `<th class="teks-tengah laporan-th-channel" data-tip="${escapeHtml(c)}">${ikonChannel(c)}</th>`).join('')}
        <th class="teks-kanan">Stok Total</th><th class="teks-kanan">Nilai Modal</th>
      </tr></thead>
      <tbody>
        ${baris.length ? baris.map(x => `<tr class="${x.stok <= (x.p.stokMinim ?? 3) ? 'laporan-baris-rendah' : ''}">
          <td>${escapeHtml(x.p.nama)}</td>
          <td>${escapeHtml(x.p.kategori || '-')}</td>
          <td>${escapeHtml(labelVarian(x.v))}</td>
          ${CHANNEL_LIST.map(c => `<td class="teks-tengah">${hitungStokChannel(x.p.id, x.v.id, c)}</td>`).join('')}
          <td class="teks-kanan"><strong>${x.stok}</strong></td>
          <td class="teks-kanan">${formatRupiah(x.stok * (x.v.hargaModal || 0))}</td>
        </tr>`).join('') : `<tr><td colspan="${kolomKosong}" class="kosong">Belum ada produk/varian.</td></tr>`}
      </tbody>
      ${baris.length ? `<tfoot><tr>
        <td colspan="3" class="teks-kanan"><strong>Total</strong></td>
        ${CHANNEL_LIST.map(c => `<td class="teks-tengah"><strong>${totalStokChannel(c)}</strong></td>`).join('')}
        <td class="teks-kanan"><strong>${totalStok}</strong></td>
        <td class="teks-kanan"><strong>${formatRupiah(totalModal)}</strong></td>
      </tr></tfoot>` : ''}
    </table></div>
  </div>`;
}

// ---------- Laporan Transaksi: ledger detail satu periode (dari kalender di toolbar) ----------
function htmlLaporanTransaksi(dari, sampai) {
  const list = DATA.transaksi.filter(t => t.tanggal >= dari && t.tanggal <= sampai)
    .slice().sort((a, b) => (a.tanggal + a.createdAt).localeCompare(b.tanggal + b.createdAt));
  const totalMasuk = list.filter(t => t.tipe === 'masuk').reduce((a, t) => a + t.qty, 0);
  const totalKeluar = list.filter(t => t.tipe === 'keluar').reduce((a, t) => a + t.qty, 0);
  const totalKoreksi = list.filter(t => t.tipe === 'koreksi').reduce((a, t) => a + t.qty, 0);
  const totalOmzet = list.filter(t => t.tipe === 'keluar').reduce((a, t) => a + t.qty * (t.hargaSatuan || 0), 0);
  const totalLaba = estimasiLabaPeriode(dari, sampai);

  return `<div class="laporan-kertas">
    ${htmlKopLaporan('Laporan Transaksi', 'Periode ' + formatRentangLabel(dari, sampai))}
    <div class="laporan-ringkas">
      <div><span>Total Transaksi</span><strong>${list.length}</strong></div>
      <div><span>Barang Masuk</span><strong>${totalMasuk} item</strong></div>
      <div><span>Barang Keluar</span><strong>${totalKeluar} item</strong></div>
      <div><span>Koreksi (Net)</span><strong>${totalKoreksi > 0 ? '+' : ''}${totalKoreksi} item</strong></div>
      <div><span>Omzet Penjualan</span><strong>${formatRupiah(totalOmzet)}</strong></div>
      <div><span>Estimasi Laba</span><strong>${formatRupiah(totalLaba)}</strong></div>
    </div>
    <div class="laporan-tabel-wrap"><table class="laporan-tabel">
      <thead><tr>
        <th>Tanggal</th><th>Tipe</th><th>Produk</th><th>Varian</th><th>Channel</th>
        <th class="teks-kanan">Qty</th><th class="teks-kanan">Harga</th><th class="teks-kanan">Subtotal</th><th class="teks-kanan">Est. Laba</th><th>Catatan</th>
      </tr></thead>
      <tbody>
        ${list.length ? list.map(t => {
          const p = cariProduk(t.produkId);
          const v = p ? cariVarian(p.id, t.varianId) : null;
          const subtotal = t.tipe === 'keluar' ? t.qty * (t.hargaSatuan || 0) : 0;
          const labaBaris = t.tipe === 'keluar' ? t.qty * ((t.hargaSatuan || 0) - (v ? (v.hargaModal || 0) : 0)) : 0;
          return `<tr>
            <td>${formatTanggal(t.tanggal)}</td>
            <td>${badgeTipeTransaksi(t.tipe)}</td>
            <td>${p ? escapeHtml(p.nama) : '(dihapus)'}</td>
            <td>${v ? escapeHtml(labelVarian(v)) : '-'}</td>
            <td>${badgeChannel(t.channel)}</td>
            <td class="teks-kanan">${t.tipe === 'koreksi' && t.qty > 0 ? '+' : ''}${t.qty}</td>
            <td class="teks-kanan">${t.hargaSatuan ? formatRupiah(t.hargaSatuan) : '-'}</td>
            <td class="teks-kanan">${subtotal ? formatRupiah(subtotal) : '-'}</td>
            <td class="teks-kanan">${t.tipe === 'keluar' ? formatRupiah(labaBaris) : '-'}</td>
            <td class="teks-lemah">${escapeHtml(t.catatan || '')}</td>
          </tr>`;
        }).join('') : `<tr><td colspan="10" class="kosong">Tidak ada transaksi di periode ini.</td></tr>`}
      </tbody>
      ${list.length ? `<tfoot><tr>
        <td colspan="7" class="teks-kanan"><strong>Total</strong></td>
        <td class="teks-kanan"><strong>${formatRupiah(totalOmzet)}</strong></td>
        <td class="teks-kanan"><strong>${formatRupiah(totalLaba)}</strong></td>
        <td></td>
      </tr></tfoot>` : ''}
    </table></div>
  </div>`;
}

// ---------- Laporan Total: ringkasan stok saat ini + performa penjualan satu periode ----------
function htmlLaporanTotal(dari, sampai) {
  const semuaVarian = daftarVarianDenganStok();
  const totalStok = semuaVarian.reduce((a, v) => a + v.stok, 0);
  const totalModal = semuaVarian.reduce((a, v) => a + v.stok * (v.varian.hargaModal || 0), 0);

  const terjual = DATA.transaksi.filter(t => t.tipe === 'keluar' && t.tanggal >= dari && t.tanggal <= sampai);
  const perChannel = {};
  CHANNEL_LIST.forEach(c => perChannel[c] = { qty: 0, omzet: 0 });
  terjual.forEach(t => {
    if (!perChannel[t.channel]) perChannel[t.channel] = { qty: 0, omzet: 0 };
    perChannel[t.channel].qty += t.qty;
    perChannel[t.channel].omzet += t.qty * (t.hargaSatuan || 0);
  });
  const totalQtyTerjual = terjual.reduce((a, t) => a + t.qty, 0);
  const totalOmzet = terjual.reduce((a, t) => a + t.qty * (t.hargaSatuan || 0), 0);
  const totalLaba = estimasiLabaPeriode(dari, sampai);
  const maxOmzet = Math.max(1, ...Object.values(perChannel).map(x => x.omzet));

  const perProduk = {};
  terjual.forEach(t => { perProduk[t.produkId] = (perProduk[t.produkId] || 0) + t.qty; });
  const terlaris = Object.entries(perProduk).sort((a, b) => b[1] - a[1]).slice(0, 10)
    .map(([produkId, qty]) => ({ produk: cariProduk(produkId), qty }));

  return `<div class="laporan-kertas">
    ${htmlKopLaporan('Laporan Total', 'Periode ' + formatRentangLabel(dari, sampai))}
    <div class="laporan-ringkas">
      <div><span>Total Produk</span><strong>${DATA.produk.length}</strong></div>
      <div><span>Total Stok Saat Ini</span><strong>${totalStok} item</strong></div>
      <div><span>Nilai Stok (Modal)</span><strong>${formatRupiah(totalModal)}</strong></div>
      <div><span>Terjual Periode Ini</span><strong>${totalQtyTerjual} item</strong></div>
      <div><span>Omzet Periode Ini</span><strong>${formatRupiah(totalOmzet)}</strong></div>
      <div><span>Estimasi Laba Periode Ini</span><strong>${formatRupiah(totalLaba)}</strong></div>
    </div>

    <h3 class="laporan-subjudul">Penjualan per Channel</h3>
    <div class="laporan-tabel-wrap"><table class="laporan-tabel">
      <thead><tr><th>Channel</th><th class="teks-kanan">Qty Terjual</th><th class="teks-kanan">Omzet</th><th>Proporsi</th></tr></thead>
      <tbody>
        ${CHANNEL_LIST.map(c => {
          const d = perChannel[c] || { qty: 0, omzet: 0 };
          const persen = Math.round((d.omzet / maxOmzet) * 100);
          return `<tr>
            <td>${badgeChannel(c)}</td>
            <td class="teks-kanan">${d.qty}</td>
            <td class="teks-kanan">${formatRupiah(d.omzet)}</td>
            <td><div class="bar-track"><div class="bar-isi ${kelasBarChannel(c)}" style="width:${persen}%"></div></div></td>
          </tr>`;
        }).join('')}
      </tbody>
    </table></div>

    <h3 class="laporan-subjudul">Produk Terlaris</h3>
    ${terlaris.length ? `<div class="laporan-tabel-wrap"><table class="laporan-tabel">
      <thead><tr><th>Produk</th><th class="teks-kanan">Terjual</th></tr></thead>
      <tbody>
        ${terlaris.map(x => `<tr class="${x.produk ? 'klik' : ''}" data-arah-produk="${x.produk ? x.produk.id : ''}"><td>${x.produk ? escapeHtml(x.produk.nama) : '(dihapus)'}</td><td class="teks-kanan">${x.qty}</td></tr>`).join('')}
      </tbody>
    </table></div>` : `<div class="kosong">Tidak ada penjualan di periode ini.</div>`}
  </div>`;
}

// ---------- Laporan Pembukuan: cashflow uang masuk & keluar satu periode ----------
function htmlLaporanPembukuan(dari, sampai) {
  const ring = totalPembukuan(dari, sampai);
  const list = ring.list.slice().sort((a, b) => {
    const ka = (a.tipe === 'masuk' ? a.periodeSampai : a.tanggal) + a.createdAt;
    const kb = (b.tipe === 'masuk' ? b.periodeSampai : b.tanggal) + b.createdAt;
    return ka.localeCompare(kb);
  });

  const perSumber = {};
  CHANNEL_PEMBUKUAN.forEach(c => perSumber[c] = 0);
  list.filter(x => x.tipe === 'masuk').forEach(x => { perSumber[x.sumber] = (perSumber[x.sumber] || 0) + x.jumlah; });

  const kelompokList = kelompokBiayaTerpakai();
  const perKelompok = {};
  kelompokList.forEach(k => perKelompok[k] = 0);
  list.filter(x => x.tipe === 'keluar').forEach(x => { perKelompok[x.kelompok] = (perKelompok[x.kelompok] || 0) + x.jumlah; });

  return `<div class="laporan-kertas laporan-kertas--senantiasa">
    ${htmlKopLaporan('Laporan Pembukuan', 'Periode ' + formatRentangLabel(dari, sampai))}
    <div class="laporan-ringkas">
      <div><span>Uang Masuk</span><strong>${formatRupiah(ring.masuk)}</strong></div>
      <div><span>Uang Keluar</span><strong>${formatRupiah(ring.keluar)}</strong></div>
      <div><span>Saldo Bersih</span><strong${ring.bersih < 0 ? ' style="color:var(--bahaya)"' : ''}>${formatRupiah(ring.bersih)}</strong></div>
    </div>

    <h3 class="laporan-subjudul">Uang Masuk per Sumber</h3>
    <div class="laporan-tabel-wrap"><table class="laporan-tabel">
      <thead><tr><th>Sumber</th><th class="teks-kanan">Jumlah</th></tr></thead>
      <tbody>
        ${CHANNEL_PEMBUKUAN.map(c => `<tr><td>${badgeChannel(c)}</td><td class="teks-kanan">${formatRupiah(perSumber[c] || 0)}</td></tr>`).join('')}
      </tbody>
    </table></div>

    <h3 class="laporan-subjudul">Uang Keluar per Kelompok Biaya</h3>
    ${kelompokList.length ? `<div class="laporan-tabel-wrap"><table class="laporan-tabel">
      <thead><tr><th>Kelompok</th><th class="teks-kanan">Jumlah</th></tr></thead>
      <tbody>
        ${kelompokList.map(k => `<tr><td>${escapeHtml(k)}</td><td class="teks-kanan">${formatRupiah(perKelompok[k] || 0)}</td></tr>`).join('')}
      </tbody>
    </table></div>` : `<div class="kosong">Belum ada kelompok biaya.</div>`}

    <h3 class="laporan-subjudul">Rincian Catatan</h3>
    <div class="laporan-tabel-wrap"><table class="laporan-tabel">
      <thead><tr><th>Tanggal</th><th>Tipe</th><th>Sumber / Kelompok</th><th>Rincian</th><th class="teks-kanan">Jumlah</th><th>Catatan</th></tr></thead>
      <tbody>
        ${list.length ? list.map(x => {
          const labelTanggal = x.tipe === 'masuk' ? `${formatTanggal(x.periodeDari)} &ndash; ${formatTanggal(x.periodeSampai)}` : formatTanggal(x.tanggal);
          const sumberKelompok = x.tipe === 'masuk' ? badgeChannel(x.sumber) : escapeHtml(x.kelompok);
          return `<tr>
            <td>${labelTanggal}</td>
            <td>${badgeTipePembukuan(x.tipe)}</td>
            <td>${sumberKelompok}</td>
            <td>${escapeHtml(x.rincian || '-')}</td>
            <td class="teks-kanan">${formatRupiah(x.jumlah)}</td>
            <td class="teks-lemah">${escapeHtml(x.catatan || '')}</td>
          </tr>`;
        }).join('') : `<tr><td colspan="6" class="kosong">Tidak ada catatan pembukuan di periode ini.</td></tr>`}
      </tbody>
      ${list.length ? `<tfoot><tr>
        <td colspan="4" class="teks-kanan"><strong>Saldo Bersih</strong></td>
        <td class="teks-kanan"><strong${ring.bersih < 0 ? ' style="color:var(--bahaya)"' : ''}>${formatRupiah(ring.bersih)}</strong></td>
        <td></td>
      </tr></tfoot>` : ''}
    </table></div>
  </div>`;
}

// ============================================================
// PENGATURAN
// ============================================================
// Tiap grup: { kode, ikon, judul, ringkas(fn -> teks preview saat tertutup), html(fn -> isi body) }.
// Dikelompokkan (bukan 6 kartu berjejer) supaya halaman tidak berantakan di depan -- hanya
// grup aktif (GRUP_PENGATURAN_AKTIF) yang terbuka, sisanya cukup 1 baris judul + ringkasan.
// Kelola kelompok+rincian Uang Masuk & Uang Keluar workspace lain (Dinda/Retro Gaming) --
// sama pola dgn blok "Kelompok & Rincian Biaya" Senantiasa di daftarGrupPengaturan, cuma
// diduplikasi utk 2 tipe (masuk & keluar) sekaligus krn kategorinya sama2 bebas diedit di sini.
function htmlPengaturanWs(wsId) {
  const ws = wsPembukuan(wsId);
  function blokKelompok(tipe, judul) {
    const key = tipe === 'masuk' ? 'kelompokMasukList' : 'kelompokKeluarList';
    return `
      <div class="pengaturan-seksi">
        <label style="margin-top:0">${judul}</label>
        <div>${wsKelompokTerpakai(wsId, tipe).map(k => `<span class="kelola-klasifikasi-chip">${escapeHtml(k)}<button data-hapus-kelompok-ws="${wsId}|${tipe}|${escapeHtml(k)}" data-tip="Hapus dari daftar">&times;</button></span>`).join('') || '<span class="hint">Belum ada.</span>'}</div>
        <div class="tambah-klasifikasi-baris">
          <input type="text" data-input-kelompok-ws="${wsId}|${tipe}" placeholder="Tambah ${judul.toLowerCase()} baru...">
          <button class="btn btn-kecil btn-primer" data-btn-kelompok-ws="${wsId}|${tipe}">+ Tambah</button>
        </div>
      </div>
      ${ws[key].map(k => `
        <div class="pengaturan-seksi">
          <label>Rincian &mdash; ${escapeHtml(k)}</label>
          <div>${wsRincianTerpakai(wsId, tipe, k).map(r => `<span class="kelola-klasifikasi-chip">${escapeHtml(r)}<button data-hapus-rincian-ws="${wsId}|${tipe}|${escapeHtml(k)}|${escapeHtml(r)}" data-tip="Hapus dari daftar">&times;</button></span>`).join('') || '<span class="hint">Belum ada rincian.</span>'}</div>
          <div class="tambah-klasifikasi-baris">
            <input type="text" data-input-rincian-ws="${wsId}|${tipe}|${escapeHtml(k)}" placeholder="Tambah rincian baru...">
            <button class="btn btn-kecil btn-primer" data-btn-rincian-ws="${wsId}|${tipe}|${escapeHtml(k)}">+ Tambah</button>
          </div>
        </div>
      `).join('')}`;
  }
  return `
    <div class="pengaturan-seksi">
      <p class="teks-lemah">Kategori "Uang Masuk" &amp; "Uang Keluar" khusus pembukuan ${escapeHtml(PEMBUKUAN_WS_INFO[wsId].judul)} &mdash; terpisah dari kelompok biaya Senantiasa maupun workspace lainnya. Menghapus dari sini tidak menghapus catatan yang sudah memakainya.</p>
    </div>
    ${blokKelompok('masuk', 'Kelompok Uang Masuk')}
    ${blokKelompok('keluar', 'Kelompok Uang Keluar')}
  `;
}

function daftarGrupPengaturan() {
  return [
    {
      kode: 'data',
      ikon: IKON.wallet,
      judul: 'Data & Cadangan',
      ringkas: () => `${DATA.produk.length} produk &middot; ${DATA.transaksi.length} transaksi &middot; cadangan terakhir ${DATA.pengaturan.lastBackupAt ? formatTanggalWaktu(DATA.pengaturan.lastBackupAt) : 'belum pernah'}`,
      html: () => `
        <div class="pengaturan-seksi">
          <p>${DATA.produk.length} produk &middot; ${DATA.produk.reduce((a, p) => a + p.varian.length, 0)} varian &middot; ${DATA.transaksi.length} transaksi &middot; perkiraan ukuran data: ${perkiraanUkuranData()}</p>
          <p class="teks-lemah">Cadangan terakhir: ${DATA.pengaturan.lastBackupAt ? formatTanggalWaktu(DATA.pengaturan.lastBackupAt) : 'Belum pernah'}</p>
        </div>
        <div class="pengaturan-seksi">
          <h3>⬇ Unduh Cadangan Data</h3>
          <p class="teks-lemah">Data hanya tersimpan di browser ini (tidak ada server/internet). Unduh cadangan rutin (disarankan tiap minggu) dan simpan salinannya di Google Drive, email, atau USB.</p>
          <button class="btn btn-primer" id="btnBackup" data-tip="Unduh file .json ke folder Downloads">Unduh Cadangan Sekarang</button>
        </div>
        <div class="pengaturan-seksi">
          <h3>⬆ Pulihkan dari Cadangan</h3>
          <p class="teks-lemah">Memilih file cadangan akan <strong>menggantikan seluruh data saat ini</strong>. Pastikan sudah unduh cadangan data saat ini dulu kalau perlu.</p>
          <input type="file" id="fRestore" accept="application/json" data-tip="Data saat ini akan digantikan">
        </div>
        <div class="pengaturan-seksi">
          <h3>📲 Instal sebagai Aplikasi</h3>
          <p class="teks-lemah">Kalau dibuka lewat server/hosting (bukan dobel-klik file langsung), Senantiasa bisa diinstal jadi aplikasi mandiri dgn ikon sendiri di komputer/HP -- tidak perlu buka tab browser lagi tiap kali. Tombol di bawah cuma muncul kalau browser mendeteksi app ini sudah memenuhi syarat instal.</p>
          <button class="btn btn-primer" id="btnInstalPWA" ${PWA_DEFERRED_PROMPT ? '' : 'hidden'}>Instal Aplikasi</button>
          <p class="hint">Pakai iPhone/iPad (Safari)? Tombol di atas memang tidak akan pernah muncul -- Safari tidak punya fitur ini. Instal manual: ketuk ikon <strong>Share/Bagikan</strong> (kotak dgn panah ke atas) di bar Safari, lalu pilih <strong>"Add to Home Screen" / "Tambah ke Layar Utama"</strong>.</p>
        </div>`
    },
    {
      kode: 'klasifikasi',
      ikon: IKON.tag,
      judul: 'Klasifikasi Produk',
      ringkas: () => `${DATA.pengaturan.kategoriList.length} kategori &middot; ${DATA.pengaturan.koleksiList.length} koleksi`,
      html: () => `
        <div class="pengaturan-seksi">
          <p class="teks-lemah">Daftar ini muncul sebagai pilihan di form produk & tombol filter di menu Produk. Menghapus dari sini tidak menghapus label dari produk yang sudah memakainya -- akan tetap muncul di filter selama masih dipakai.</p>
          <label style="margin-top:10px">Kategori</label>
          <div id="wrapKategoriChip">${DATA.pengaturan.kategoriList.map(k => `<span class="kelola-klasifikasi-chip">${escapeHtml(k)}<button data-hapus-kelas="kategoriList|${escapeHtml(k)}" data-tip="Hapus dari daftar">&times;</button></span>`).join('') || '<span class="hint">Belum ada.</span>'}</div>
          <div class="tambah-klasifikasi-baris">
            <input type="text" id="fTambahKategori" placeholder="Tambah kategori baru (mis. Jumpsuit)...">
            <button class="btn btn-kecil btn-primer" id="btnTambahKategori">+ Tambah</button>
          </div>
          <label style="margin-top:18px">Koleksi</label>
          <div id="wrapKoleksiChip">${DATA.pengaturan.koleksiList.map(k => `<span class="kelola-klasifikasi-chip">${escapeHtml(k)}<button data-hapus-kelas="koleksiList|${escapeHtml(k)}" data-tip="Hapus dari daftar">&times;</button></span>`).join('') || '<span class="hint">Belum ada.</span>'}</div>
          <div class="tambah-klasifikasi-baris">
            <input type="text" id="fTambahKoleksi" placeholder="Tambah koleksi baru...">
            <button class="btn btn-kecil btn-primer" id="btnTambahKoleksi">+ Tambah</button>
          </div>
        </div>`
    },
    {
      kode: 'pembukuan',
      ikon: IKON.laba,
      judul: 'Kelompok & Rincian Biaya',
      ringkas: () => `${DATA.pengaturan.kelompokBiayaList.length} kelompok biaya`,
      html: () => `
        <div class="pengaturan-seksi">
          <p class="teks-lemah">Dipakai saat mencatat "Uang Keluar" di menu Pembukuan (mis. Operasional, Ongkos Jahit). Menghapus dari sini tidak menghapus catatan yang sudah memakainya.</p>
          <label style="margin-top:10px">Kelompok Biaya</label>
          <div id="wrapKelompokChip">${kelompokBiayaTerpakai().map(k => `<span class="kelola-klasifikasi-chip">${escapeHtml(k)}<button data-hapus-kelompok="${escapeHtml(k)}" data-tip="Hapus dari daftar">&times;</button></span>`).join('') || '<span class="hint">Belum ada.</span>'}</div>
          <div class="tambah-klasifikasi-baris">
            <input type="text" id="fTambahKelompok" placeholder="Tambah kelompok biaya baru...">
            <button class="btn btn-kecil btn-primer" id="btnTambahKelompok">+ Tambah</button>
          </div>
        </div>
        ${DATA.pengaturan.kelompokBiayaList.map(k => `
          <div class="pengaturan-seksi">
            <label>Rincian &mdash; ${escapeHtml(k)}</label>
            <div>${rincianBiayaTerpakai(k).map(r => `<span class="kelola-klasifikasi-chip">${escapeHtml(r)}<button data-hapus-rincian="${escapeHtml(k)}|${escapeHtml(r)}" data-tip="Hapus dari daftar">&times;</button></span>`).join('') || '<span class="hint">Belum ada rincian.</span>'}</div>
            <div class="tambah-klasifikasi-baris">
              <input type="text" data-input-rincian="${escapeHtml(k)}" placeholder="Tambah rincian baru...">
              <button class="btn btn-kecil btn-primer" data-btn-rincian="${escapeHtml(k)}">+ Tambah</button>
            </div>
          </div>
        `).join('')}`
    },
    {
      kode: 'pembukuan-dinda',
      ikon: IKON.laba,
      judul: 'Dinda Personal Finance',
      ringkas: () => `${wsPembukuan('dinda').kelompokMasukList.length} kelompok masuk &middot; ${wsPembukuan('dinda').kelompokKeluarList.length} kelompok keluar`,
      html: () => htmlPengaturanWs('dinda')
    },
    {
      kode: 'pembukuan-retro',
      ikon: IKON.laba,
      judul: 'Retro Gaming Space Seririt',
      ringkas: () => `${wsPembukuan('retro').kelompokMasukList.length} kelompok masuk &middot; ${wsPembukuan('retro').kelompokKeluarList.length} kelompok keluar`,
      html: () => htmlPengaturanWs('retro')
    },
    {
      kode: 'marketplace',
      ikon: IKON.toko,
      judul: 'Marketplace & Toko',
      ringkas: () => `${CHANNEL_LIST.length} channel terhubung`,
      html: () => `
        <div class="pengaturan-seksi">
          <p class="teks-lemah">Tautan pintasan saja (tidak ada koneksi/sinkron data) -- dipakai untuk cek stok manual di menu Overview.</p>
          <div class="link-toko-baris"><span>${badgeChannel('Toko')}</span><a class="btn btn-kecil" href="${LOKASI_TOKO_MAPS}" target="_blank" rel="noopener">Lihat Lokasi (Google Maps) ↗</a></div>
          ${CHANNEL_LIST.filter(c => c !== 'Toko').map(c => `<div class="link-toko-baris"><span>${badgeChannel(c)}</span><a class="btn btn-kecil" href="${CHANNEL_LINK[c]}" target="_blank" rel="noopener">Buka Toko ↗</a></div>`).join('')}
        </div>`
    },
    {
      kode: 'bahaya',
      ikon: IKON.peringatan,
      judul: 'Zona Berbahaya',
      bahaya: true,
      ringkas: () => 'Hapus permanen semua produk, varian & transaksi',
      html: () => `
        <div class="pengaturan-seksi">
          <p class="teks-lemah">Mengosongkan seluruh produk, varian, dan transaksi. Tidak bisa dibatalkan kecuali punya file cadangan.</p>
          <button class="btn btn-bahaya" id="btnReset" data-tip="Tindakan permanen, tidak bisa di-undo">Hapus Semua Data</button>
        </div>`
    }
  // Tab "Kelompok & Rincian Biaya" (Senantiasa), pengaturan Dinda/Retro Gaming, MAUPUN "Zona
  // Berbahaya" (hapus semua data) disembunyikan dari akun karyawan -- yg terakhir itu bukan soal
  // pembukuan, tapi tindakan destruktif yg sebaiknya cuma bisa dipicu pemilik. Lihat apakahPemilik()
  // di data.js.
  ].filter(g => apakahPemilik() || (!HALAMAN_KHUSUS_PEMILIK.includes(g.kode) && g.kode !== 'bahaya'));
}

function renderPengaturan() {
  const kontainer = KONTEN();
  const grupList = daftarGrupPengaturan();
  // Beda dgn akordeon lama (bisa semua tertutup): tab horizontal selalu ada SATU yg aktif --
  // konsisten dgn pola tab di menu Laporan. Kalau kode tersimpan sudah tidak valid (mis. grup
  // dihapus), jatuh balik ke grup pertama.
  if (!grupList.some(g => g.kode === GRUP_PENGATURAN_AKTIF)) GRUP_PENGATURAN_AKTIF = grupList[0].kode;
  const grupAktif = grupList.find(g => g.kode === GRUP_PENGATURAN_AKTIF);

  kontainer.innerHTML = `
    <div class="halaman__header"><div><h1>Pengaturan</h1><p>Backup, restore, dan info penyimpanan</p></div></div>
    <div class="pengaturan-tab-baris">
      ${grupList.map(g => `
        <button type="button" class="pengaturan-tab ${g.bahaya ? 'pengaturan-tab--bahaya' : ''} ${GRUP_PENGATURAN_AKTIF === g.kode ? 'aktif' : ''}" data-tab-grup="${g.kode}">
          <span class="pengaturan-tab__ikon">${g.ikon}</span>
          <span class="pengaturan-tab__judul">${escapeHtml(g.judul)}</span>
        </button>
      `).join('')}
    </div>
    <p class="pengaturan-tab-ringkas">${grupAktif.ringkas()}</p>
    <div class="kartu">${grupAktif.html()}</div>
  `;

  kontainer.querySelectorAll('[data-tab-grup]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.dataset.tabGrup === GRUP_PENGATURAN_AKTIF) return;
      GRUP_PENGATURAN_AKTIF = btn.dataset.tabGrup;
      renderPengaturan();
    });
  });

  kontainer.querySelectorAll('[data-hapus-kelas]').forEach(btn => {
    btn.addEventListener('click', () => {
      const [daftarKey, nilai] = btn.dataset.hapusKelas.split('|');
      hapusKlasifikasi(daftarKey, nilai);
      tampilkanToast(`"${nilai}" dihapus dari daftar.`, 'sukses');
      renderPengaturan();
    });
  });
  kontainer.querySelector('#btnTambahKategori')?.addEventListener('click', () => {
    const input = kontainer.querySelector('#fTambahKategori');
    if (tambahKlasifikasi('kategoriList', input.value)) { tampilkanToast('Kategori ditambahkan.', 'sukses'); renderPengaturan(); }
    else tampilkanToast('Isi nama kategori (dan pastikan belum ada).', 'error');
  });
  kontainer.querySelector('#btnTambahKoleksi')?.addEventListener('click', () => {
    const input = kontainer.querySelector('#fTambahKoleksi');
    if (tambahKlasifikasi('koleksiList', input.value)) { tampilkanToast('Koleksi ditambahkan.', 'sukses'); renderPengaturan(); }
    else tampilkanToast('Isi nama koleksi (dan pastikan belum ada).', 'error');
  });

  kontainer.querySelectorAll('[data-hapus-kelompok]').forEach(btn => {
    btn.addEventListener('click', () => {
      hapusKelompokBiaya(btn.dataset.hapusKelompok);
      tampilkanToast(`"${btn.dataset.hapusKelompok}" dihapus dari daftar.`, 'sukses');
      renderPengaturan();
    });
  });
  kontainer.querySelector('#btnTambahKelompok')?.addEventListener('click', () => {
    const input = kontainer.querySelector('#fTambahKelompok');
    if (tambahKlasifikasi('kelompokBiayaList', input.value)) { tampilkanToast('Kelompok biaya ditambahkan.', 'sukses'); renderPengaturan(); }
    else tampilkanToast('Isi nama kelompok (dan pastikan belum ada).', 'error');
  });
  kontainer.querySelectorAll('[data-hapus-rincian]').forEach(btn => {
    btn.addEventListener('click', () => {
      const [kelompok, nilai] = btn.dataset.hapusRincian.split('|');
      hapusRincianBiaya(kelompok, nilai);
      tampilkanToast(`"${nilai}" dihapus dari daftar.`, 'sukses');
      renderPengaturan();
    });
  });
  kontainer.querySelectorAll('[data-btn-rincian]').forEach(btn => {
    btn.addEventListener('click', () => {
      const kelompok = btn.dataset.btnRincian;
      const input = kontainer.querySelector(`[data-input-rincian="${CSS.escape(kelompok)}"]`);
      if (tambahRincianBiaya(kelompok, input.value)) { tampilkanToast('Rincian ditambahkan.', 'sukses'); renderPengaturan(); }
      else tampilkanToast('Isi nama rincian (dan pastikan belum ada).', 'error');
    });
  });

  kontainer.querySelectorAll('[data-hapus-kelompok-ws]').forEach(btn => {
    btn.addEventListener('click', () => {
      const [wsId, tipe, nilai] = btn.dataset.hapusKelompokWs.split('|');
      wsHapusKelompok(wsId, tipe, nilai);
      tampilkanToast(`"${nilai}" dihapus dari daftar.`, 'sukses');
      renderPengaturan();
    });
  });
  kontainer.querySelectorAll('[data-btn-kelompok-ws]').forEach(btn => {
    btn.addEventListener('click', () => {
      const [wsId, tipe] = btn.dataset.btnKelompokWs.split('|');
      const input = kontainer.querySelector(`[data-input-kelompok-ws="${CSS.escape(wsId + '|' + tipe)}"]`);
      if (wsTambahKelompok(wsId, tipe, input.value)) { tampilkanToast('Kelompok ditambahkan.', 'sukses'); renderPengaturan(); }
      else tampilkanToast('Isi nama kelompok (dan pastikan belum ada).', 'error');
    });
  });
  kontainer.querySelectorAll('[data-hapus-rincian-ws]').forEach(btn => {
    btn.addEventListener('click', () => {
      const [wsId, tipe, kelompok, nilai] = btn.dataset.hapusRincianWs.split('|');
      wsHapusRincian(wsId, tipe, kelompok, nilai);
      tampilkanToast(`"${nilai}" dihapus dari daftar.`, 'sukses');
      renderPengaturan();
    });
  });
  kontainer.querySelectorAll('[data-btn-rincian-ws]').forEach(btn => {
    btn.addEventListener('click', () => {
      const [wsId, tipe, kelompok] = btn.dataset.btnRincianWs.split('|');
      const input = kontainer.querySelector(`[data-input-rincian-ws="${CSS.escape(wsId + '|' + tipe + '|' + kelompok)}"]`);
      if (wsTambahRincian(wsId, tipe, kelompok, input.value)) { tampilkanToast('Rincian ditambahkan.', 'sukses'); renderPengaturan(); }
      else tampilkanToast('Isi nama rincian (dan pastikan belum ada).', 'error');
    });
  });

  kontainer.querySelector('#btnBackup')?.addEventListener('click', () => {
    unduhCadangan();
    tampilkanToast('Cadangan berhasil diunduh.', 'sukses');
    renderPengaturan();
  });

  kontainer.querySelector('#btnInstalPWA')?.addEventListener('click', async () => {
    if (!PWA_DEFERRED_PROMPT) return;
    PWA_DEFERRED_PROMPT.prompt();
    await PWA_DEFERRED_PROMPT.userChoice;
    PWA_DEFERRED_PROMPT = null;
    renderPengaturan();
  });

  kontainer.querySelector('#fRestore')?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    konfirmasi('Yakin memulihkan dari file ini? Seluruh data saat ini akan digantikan.', () => {
      pulihkanDariFile(file, (ok, err) => {
        if (ok) { tampilkanToast('Data berhasil dipulihkan.', 'sukses'); render(); }
        else { tampilkanToast('Gagal memulihkan: ' + err, 'error'); }
      });
    }, { bahaya: true, labelYa: 'Ya, Pulihkan' });
  });

  kontainer.querySelector('#btnReset')?.addEventListener('click', () => {
    konfirmasi('Yakin ingin menghapus SEMUA data (produk, varian, transaksi)? Sebaiknya unduh cadangan dulu sebelum ini.', () => {
      DATA = dataKosong();
      simpanData();
      tampilkanToast('Semua data telah dihapus.', 'sukses');
      location.hash = '#dashboard';
      render();
    }, { bahaya: true, labelYa: 'Ya, Hapus Semua' });
  });
}
