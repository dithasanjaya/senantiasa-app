// Widget pemilih rentang tanggal -- dropdown dengan preset cepat + kalender custom, dibangun
// manual (tanpa library) supaya tetap 100% offline. Awalnya khusus Overview, sekarang jadi
// komponen standar yg dipakai di halaman manapun yg butuh filter periode (mis. Transaksi) --
// tiap pemasang cukup sediakan "konteks" (baca/tulis rentang miliknya sendiri + fungsi render
// ulang halamannya), lihat pasangRangePicker().

const NAMA_BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const NAMA_HARI_SINGKAT = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

let RENTANG_OVERVIEW = null; // { dari, sampai } -- rentang aktif milik halaman Overview
let RENTANG_TRANSAKSI = null; // { dari, sampai } -- rentang aktif milik halaman Transaksi
let RENTANG_LAPORAN = null; // { dari, sampai } -- rentang aktif milik Laporan Transaksi/Total
let RENTANG_PEMBUKUAN = null; // { dari, sampai } -- rentang aktif milik halaman Pembukuan
let RENTANG_PEMBUKUAN_WS = { dinda: null, retro: null }; // sama, tapi utk Dinda/Retro Gaming (lihat renderPembukuanWs di app.js)
let PICKER_STATE = { terbuka: false, bulanTampil: null, draftMulai: null, draftSelesai: null };
let PICKER_KONTEKS = null; // { ambil, atur, render } -- instance range picker yg sedang dipasang di halaman ini

function isoDariBagian(tahun, bulanIdx, tanggal) {
  const bln = String(bulanIdx + 1).padStart(2, '0');
  const tgl = String(tanggal).padStart(2, '0');
  return `${tahun}-${bln}-${tgl}`;
}

function inisialisasiRentangOverview() {
  if (RENTANG_OVERVIEW) return;
  const hariIni = tanggalHariIni();
  RENTANG_OVERVIEW = { dari: hariIni.slice(0, 8) + '01', sampai: hariIni };
}

// Default Transaksi sengaja mencakup dari transaksi TERLAMA yg tercatat s.d. hari ini (bukan
// "Bulan Ini" seperti Overview) supaya begitu halaman dibuka tidak ada riwayat yg sembunyi.
function inisialisasiRentangTransaksi() {
  if (RENTANG_TRANSAKSI) return;
  const hariIni = tanggalHariIni();
  const tanggalTerlama = DATA.transaksi.reduce((min, t) => (t.tanggal < min ? t.tanggal : min), hariIni);
  RENTANG_TRANSAKSI = { dari: tanggalTerlama, sampai: hariIni };
}

// Default Pembukuan sengaja mencakup dari catatan TERLAMA (masuk/keluar) s.d. hari ini, sama
// alasannya dgn Transaksi -- supaya rekap cashflow yg sudah dicatat tidak sembunyi begitu
// halaman pertama dibuka.
function inisialisasiRentangPembukuan() {
  if (RENTANG_PEMBUKUAN) return;
  const hariIni = tanggalHariIni();
  const tanggalTerlama = DATA.pembukuan.reduce((min, x) => {
    const t = x.tipe === 'masuk' ? x.periodeDari : x.tanggal;
    return (t && t < min) ? t : min;
  }, hariIni);
  RENTANG_PEMBUKUAN = { dari: tanggalTerlama, sampai: hariIni };
}

// Sama alasannya dgn inisialisasiRentangPembukuan (Senantiasa): mulai dari catatan TERLAMA
// workspace ybs, bukan "Bulan Ini", supaya rekap yg sudah dicatat tidak sembunyi.
function inisialisasiRentangPembukuanWs(wsId) {
  if (RENTANG_PEMBUKUAN_WS[wsId]) return;
  const hariIni = tanggalHariIni();
  const tanggalTerlama = wsPembukuan(wsId).list.reduce((min, x) => (x.tanggal && x.tanggal < min ? x.tanggal : min), hariIni);
  RENTANG_PEMBUKUAN_WS[wsId] = { dari: tanggalTerlama, sampai: hariIni };
}

function inisialisasiRentangLaporan() {
  if (RENTANG_LAPORAN) return;
  const hariIni = tanggalHariIni();
  RENTANG_LAPORAN = { dari: hariIni.slice(0, 8) + '01', sampai: hariIni };
}

function formatTanggalPendek(iso) {
  const d = new Date(iso + 'T00:00:00');
  return d.getDate() + ' ' + NAMA_BULAN[d.getMonth()].slice(0, 3);
}

function formatRentangLabel(dari, sampai) {
  const a = new Date(dari + 'T00:00:00'), b = new Date(sampai + 'T00:00:00');
  const thnA = a.getFullYear(), thnB = b.getFullYear();
  if (dari === sampai) return `${a.getDate()} ${NAMA_BULAN[a.getMonth()]} ${thnA}`;
  if (thnA === thnB && a.getMonth() === b.getMonth()) return `${a.getDate()} - ${b.getDate()} ${NAMA_BULAN[b.getMonth()]} ${thnB}`;
  if (thnA === thnB) return `${formatTanggalPendek(dari)} - ${formatTanggalPendek(sampai)} ${thnB}`;
  return `${a.getDate()} ${NAMA_BULAN[a.getMonth()]} ${thnA} - ${b.getDate()} ${NAMA_BULAN[b.getMonth()]} ${thnB}`;
}

const PRESET_RENTANG = [
  { kode: '7hari', label: '7 Hari Terakhir', hitung: () => { const s = tanggalHariIni(); const d = new Date(); d.setDate(d.getDate() - 6); return { dari: d.toISOString().slice(0, 10), sampai: s }; } },
  { kode: '30hari', label: '30 Hari Terakhir', hitung: () => { const s = tanggalHariIni(); const d = new Date(); d.setDate(d.getDate() - 29); return { dari: d.toISOString().slice(0, 10), sampai: s }; } },
  { kode: 'bulanini', label: 'Bulan Ini', hitung: () => { const s = tanggalHariIni(); return { dari: s.slice(0, 8) + '01', sampai: s }; } },
  {
    kode: 'bulanlalu', label: 'Bulan Lalu', hitung: () => {
      const now = new Date(); const d = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const akhir = new Date(now.getFullYear(), now.getMonth(), 0);
      return { dari: isoDariBagian(d.getFullYear(), d.getMonth(), 1), sampai: isoDariBagian(akhir.getFullYear(), akhir.getMonth(), akhir.getDate()) };
    }
  }
];

// ---------- Markup ----------
// `rentang`: { dari, sampai } milik halaman pemanggil -- lihat inisialisasiRentangOverview/Transaksi.
function htmlRangePicker(rentang) {
  return `
    <div class="rentang-wrap">
      <button type="button" class="rentang-btn" id="btnRentang" data-tip="Ubah rentang tanggal">
        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M8 3v4M16 3v4M3 10h18"/></svg>
        <span id="labelRentang">${formatRentangLabel(rentang.dari, rentang.sampai)}</span>
        <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M6 9l6 6 6-6"/></svg>
      </button>
      <div class="rentang-panel" id="panelRentang"></div>
    </div>
  `;
}

function isiPanelRentang() {
  const panel = document.getElementById('panelRentang');
  if (!panel) return;
  const bulanTampil = PICKER_STATE.bulanTampil;
  const tahun = bulanTampil.getFullYear(), bulanIdx = bulanTampil.getMonth();
  const hariIni = tanggalHariIni();

  const first = new Date(tahun, bulanIdx, 1);
  let startDay = (first.getDay() + 6) % 7; // 0=Senin
  const jumlahHari = new Date(tahun, bulanIdx + 1, 0).getDate();

  let selHari = '';
  for (let i = 0; i < startDay; i++) selHari += `<span></span>`;
  for (let d = 1; d <= jumlahHari; d++) {
    const iso = isoDariBagian(tahun, bulanIdx, d);
    let kelas = 'kalender-hari';
    if (iso === hariIni) kelas += ' hari-ini';
    if (PICKER_STATE.draftMulai && iso === PICKER_STATE.draftMulai) kelas += ' terpilih';
    if (PICKER_STATE.draftSelesai && iso === PICKER_STATE.draftSelesai) kelas += ' terpilih';
    if (PICKER_STATE.draftMulai && PICKER_STATE.draftSelesai && iso > PICKER_STATE.draftMulai && iso < PICKER_STATE.draftSelesai) kelas += ' dalam-rentang';
    selHari += `<button type="button" class="${kelas}" data-tgl="${iso}">${d}</button>`;
  }

  panel.innerHTML = `
    <div class="rentang-preset">
      ${PRESET_RENTANG.map(p => `<button type="button" class="chip-preset" data-preset="${p.kode}">${p.label}</button>`).join('')}
    </div>
    <div class="kalender-head">
      <button type="button" class="kalender-nav" id="btnBulanSebelum">‹</button>
      <strong>${NAMA_BULAN[bulanIdx]} ${tahun}</strong>
      <button type="button" class="kalender-nav" id="btnBulanSesudah">›</button>
    </div>
    <div class="kalender-grid">
      ${NAMA_HARI_SINGKAT.map(h => `<span class="lbl">${h}</span>`).join('')}
      ${selHari}
    </div>
    <p class="hint" style="margin:8px 0 0">${PICKER_STATE.draftMulai ? formatTanggalPendek(PICKER_STATE.draftMulai) : '...'} &rarr; ${PICKER_STATE.draftSelesai ? formatTanggalPendek(PICKER_STATE.draftSelesai) : '...'}</p>
    <div class="rentang-aksi">
      <button type="button" class="btn btn-kecil" id="btnBatalRentang">Batal</button>
      <button type="button" class="btn btn-kecil btn-primer" id="btnTerapkanRentang">Terapkan</button>
    </div>
  `;

  panel.querySelectorAll('[data-preset]').forEach(btn => btn.addEventListener('click', () => {
    const preset = PRESET_RENTANG.find(p => p.kode === btn.dataset.preset);
    PICKER_KONTEKS.atur(preset.hitung());
    tutupPanelRentang();
    PICKER_KONTEKS.render();
  }));
  panel.querySelectorAll('[data-tgl]').forEach(btn => btn.addEventListener('click', () => klikTanggalKalender(btn.dataset.tgl)));
  panel.querySelector('#btnBulanSebelum').addEventListener('click', () => { PICKER_STATE.bulanTampil = new Date(tahun, bulanIdx - 1, 1); isiPanelRentang(); });
  panel.querySelector('#btnBulanSesudah').addEventListener('click', () => { PICKER_STATE.bulanTampil = new Date(tahun, bulanIdx + 1, 1); isiPanelRentang(); });
  panel.querySelector('#btnBatalRentang').addEventListener('click', tutupPanelRentang);
  panel.querySelector('#btnTerapkanRentang').addEventListener('click', () => {
    if (PICKER_STATE.draftMulai && PICKER_STATE.draftSelesai) {
      PICKER_KONTEKS.atur({ dari: PICKER_STATE.draftMulai, sampai: PICKER_STATE.draftSelesai });
      tutupPanelRentang();
      PICKER_KONTEKS.render();
    } else {
      tampilkanToast('Pilih tanggal awal & akhir dulu.', 'error');
    }
  });
}

function klikTanggalKalender(iso) {
  if (!PICKER_STATE.draftMulai || (PICKER_STATE.draftMulai && PICKER_STATE.draftSelesai)) {
    PICKER_STATE.draftMulai = iso;
    PICKER_STATE.draftSelesai = null;
  } else if (iso < PICKER_STATE.draftMulai) {
    PICKER_STATE.draftSelesai = PICKER_STATE.draftMulai;
    PICKER_STATE.draftMulai = iso;
  } else {
    PICKER_STATE.draftSelesai = iso;
  }
  isiPanelRentang();
}

function bukaPanelRentang() {
  const rentang = PICKER_KONTEKS.ambil();
  PICKER_STATE.terbuka = true;
  PICKER_STATE.draftMulai = rentang.dari;
  PICKER_STATE.draftSelesai = rentang.sampai;
  PICKER_STATE.bulanTampil = new Date(rentang.sampai + 'T00:00:00');
  document.getElementById('panelRentang').classList.add('terbuka');
  isiPanelRentang();
  document.addEventListener('click', tutupPanelRentangDiLuar, true);
}

function tutupPanelRentang() {
  PICKER_STATE.terbuka = false;
  const panel = document.getElementById('panelRentang');
  if (panel) panel.classList.remove('terbuka');
  document.removeEventListener('click', tutupPanelRentangDiLuar, true);
}

function tutupPanelRentangDiLuar(e) {
  const wrap = document.querySelector('.rentang-wrap');
  if (wrap && !wrap.contains(e.target)) tutupPanelRentang();
}

// `konteks`: { ambil: () => {dari,sampai}, atur: (rentangBaru) => void, render: () => void } --
// halaman pemanggil menyediakan ini supaya widget tidak perlu tahu variabel/render mana yg
// dipakai (lihat renderDashboard & renderTransaksi di app.js utk contoh pemakaian).
function pasangRangePicker(konteks) {
  PICKER_KONTEKS = konteks;
  // Halaman pemasang bisa dirender ulang oleh aksi lain (mis. "Tandai Sudah Dicek") sementara
  // panel masih terbuka -- itu menghancurkan DOM panel lama tanpa lewat tutupPanelRentang(),
  // jadi PICKER_STATE.terbuka bisa nyangkut "true" padahal panel baru (hasil render ulang)
  // sebenarnya tertutup. Selalu disamakan ke kondisi tertutup di sini supaya klik pertama pada
  // tombol tetap langsung membuka panel, dan listener "klik di luar" yg lama (kalau ada) dibersihkan.
  PICKER_STATE.terbuka = false;
  document.removeEventListener('click', tutupPanelRentangDiLuar, true);

  const btn = document.getElementById('btnRentang');
  if (!btn) return;
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (PICKER_STATE.terbuka) tutupPanelRentang();
    else bukaPanelRentang();
  });
}
