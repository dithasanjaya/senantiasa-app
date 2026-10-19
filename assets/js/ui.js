// Helper UI umum: toast, modal, konfirmasi, format angka/tanggal, kompresi foto.

function tampilkanToast(pesan, jenis) {
  const host = document.getElementById('toastHost');
  const el = document.createElement('div');
  el.className = 'toast' + (jenis ? ' ' + jenis : '');
  el.textContent = pesan;
  host.appendChild(el);
  setTimeout(() => el.remove(), 3800);
}

function tutupModal() {
  document.getElementById('modalHost').innerHTML = '';
}

function bukaModal(judul, isiHtml, opsi) {
  opsi = opsi || {};
  const host = document.getElementById('modalHost');
  const wrap = document.createElement('div');
  wrap.className = 'modal-overlay';
  wrap.innerHTML = `<div class="modal ${opsi.lebar ? 'modal-lebar' : ''}">
    <h2>${judul}</h2>
    <div class="modal__isi">${isiHtml}</div>
  </div>`;
  wrap.addEventListener('mousedown', (e) => { if (e.target === wrap) tutupModal(); });
  host.innerHTML = '';
  host.appendChild(wrap);
  return wrap.querySelector('.modal');
}

function konfirmasi(pesan, onYa, opsi) {
  opsi = opsi || {};
  const modal = bukaModal(opsi.judul || 'Konfirmasi', `<p>${pesan}</p>
    <div class="modal__aksi">
      <button class="btn" id="btnBatalKonfirmasi">Batal</button>
      <button class="btn ${opsi.bahaya ? 'btn-bahaya' : 'btn-primer'}" id="btnYaKonfirmasi">${opsi.labelYa || 'Ya, lanjutkan'}</button>
    </div>`);
  modal.querySelector('#btnBatalKonfirmasi').onclick = tutupModal;
  modal.querySelector('#btnYaKonfirmasi').onclick = () => { tutupModal(); onYa(); };
}

// ---------- Combobox cari (input yg bisa diketik utk filter, opsi dikelompokkan) ----------
// Dipakai gantiin <select> polos yg opsinya banyak & susah dicari (mis. varian produk dgn
// puluhan kombinasi warna x ukuran) -- lihat pemakaiannya di modalFormTransaksi. `hostEl` diisi
// markup input+panel di sini; controller yg dikembalikan dipakai pemanggil utk ngisi daftar opsi
// (dikelompokkan) & baca/tulis nilai terpilih, mirip API elemen <select> tapi lebih ringkas.
function buatCombobox(hostEl, opsi) {
  opsi = opsi || {};
  hostEl.classList.add('combo-wrap');
  hostEl.innerHTML = `
    <input type="text" class="combo-input" placeholder="${escapeHtml(opsi.placeholder || 'Cari...')}" autocomplete="off">
    <div class="combo-panel" hidden></div>
  `;
  const input = hostEl.querySelector('.combo-input');
  const panel = hostEl.querySelector('.combo-panel');
  let daftarGrup = [];
  let nilai = '';
  let handlerUbah = () => {};

  // `label` item/grup adalah HTML (boleh ada tag & entity hasil escapeHtml, spy tampilan di
  // panel bisa kaya -- lihat kelompokkanVarianUntukCombo di app.js). Tapi input teks & pencarian
  // butuh TEKS POLOS asli (mis. "S & M", bukan "S &amp; M" atau "S &amp;amp; M"), jadi dibongkar
  // lewat elemen sungguhan (bukan cuma buang tag pakai regex) supaya entity ikut ke-decode benar.
  const elBongkarHtml = document.createElement('div');
  function teksDariHtml(html) {
    elBongkarHtml.innerHTML = html == null ? '' : String(html);
    return elBongkarHtml.textContent || '';
  }

  function cariItem(v) {
    for (const g of daftarGrup) {
      const f = g.items.find(it => it.value === v);
      if (f) return f;
    }
    return null;
  }

  function gambarPanel(kataKunci) {
    const kata = (kataKunci || '').trim().toLowerCase();
    // Cocok kalau kata kunci ketemu di LABEL KELOMPOK (mis. ketik warna "kuning" -> semua ukuran
    // dlm kelompok itu ikut muncul) ATAU di label item itu sendiri (mis. ketik ukuran "S/M" ->
    // item itu muncul lintas kelompok warna manapun).
    const teksPolos = (s) => teksDariHtml(s).toLowerCase();
    const hasil = daftarGrup
      .map(g => {
        const grupCocok = !kata || teksPolos(g.label).includes(kata);
        return { label: g.label, items: g.items.filter(it => grupCocok || teksPolos(it.label).includes(kata)) };
      })
      .filter(g => g.items.length);
    panel.innerHTML = hasil.length
      ? hasil.map(g => `
          ${g.label ? `<div class="combo-grup-label">${g.label}</div>` : ''}
          ${g.items.map(it => `<button type="button" class="combo-opsi ${it.value === nilai ? 'aktif' : ''}" data-nilai="${escapeHtml(it.value)}">${it.label}</button>`).join('')}
        `).join('')
      : `<div class="combo-kosong">${escapeHtml(opsi.kosongTeks || 'Tidak ada hasil.')}</div>`;
    panel.querySelectorAll('[data-nilai]').forEach(btn => {
      // mousedown (bukan click) supaya kepilih SEBELUM event blur di input nutup panelnya duluan.
      btn.addEventListener('mousedown', (e) => { e.preventDefault(); pilih(btn.dataset.nilai); });
    });
  }

  function bukaPanel() { panel.hidden = false; gambarPanel(input.dataset.mengetik === '1' ? input.value : ''); }
  function tutupPanel() { panel.hidden = true; }
  function pilih(v) {
    nilai = v;
    const item = cariItem(v);
    input.value = item ? teksDariHtml(item.label) : '';
    input.dataset.mengetik = '0';
    tutupPanel();
    handlerUbah(v);
  }

  input.addEventListener('focus', () => { input.select(); bukaPanel(); });
  input.addEventListener('input', () => { input.dataset.mengetik = '1'; bukaPanel(); });
  input.addEventListener('blur', () => {
    // Delay dikit spy klik opsi (mousedown) sempat kepegang duluan drpd panel ke-hide instan.
    setTimeout(() => { tutupPanel(); const it = cariItem(nilai); input.value = it ? teksDariHtml(it.label) : ''; input.dataset.mengetik = '0'; }, 150);
  });
  input.addEventListener('keydown', (e) => { if (e.key === 'Escape') input.blur(); });

  return {
    setDaftar(grup) { daftarGrup = grup || []; if (nilai && !cariItem(nilai)) { nilai = ''; input.value = ''; } },
    setNilai(v) {
      nilai = v || '';
      const item = cariItem(nilai);
      input.value = item ? teksDariHtml(item.label) : '';
    },
    getNilai() { return nilai; },
    onUbah(fn) { handlerUbah = fn; },
    kosongkan() { nilai = ''; input.value = ''; }
  };
}

// ---------- Tooltip global (mengambang, lihat catatan panjang di style.css) ----------
function tampilkanTooltip(target) {
  const el = document.getElementById('tooltipGlobal');
  const teks = target.getAttribute('data-tip');
  if (!el || !teks) return;
  el.textContent = teks;
  el.className = 'tooltip-global tampil';
  el.style.left = '0px';
  el.style.top = '0px';

  const rect = target.getBoundingClientRect();
  const tw = el.offsetWidth, th = el.offsetHeight;
  const kananSisi = target.hasAttribute('data-tip-kanan');
  let left = kananSisi ? rect.left : rect.left + rect.width / 2 - tw / 2;
  left = Math.max(6, Math.min(left, window.innerWidth - tw - 6));

  const ruangAtas = rect.top - th - 12;
  let top, arah;
  if (ruangAtas > 4) { top = rect.top - th - 9; arah = 'atas'; }
  else { top = rect.bottom + 9; arah = 'bawah'; }

  el.style.left = Math.round(left) + 'px';
  el.style.top = Math.round(top) + 'px';
  el.classList.add('tooltip-global--' + arah);
  const tengahTarget = rect.left + rect.width / 2 - left;
  el.style.setProperty('--panah-x', Math.round(Math.max(10, Math.min(tengahTarget, tw - 10))) + 'px');
}

function sembunyikanTooltip() {
  const el = document.getElementById('tooltipGlobal');
  if (el) el.classList.remove('tampil');
}

function pasangTooltipGlobal() {
  document.addEventListener('mouseover', (e) => {
    const el = e.target.closest('[data-tip]');
    if (el) tampilkanTooltip(el);
  });
  document.addEventListener('mouseout', (e) => {
    const el = e.target.closest('[data-tip]');
    if (el && !el.contains(e.relatedTarget)) sembunyikanTooltip();
  });
  document.addEventListener('scroll', sembunyikanTooltip, true);
  document.addEventListener('click', sembunyikanTooltip, true);
}

function formatRupiah(angka) {
  angka = Number(angka) || 0;
  return 'Rp' + Math.round(angka).toLocaleString('id-ID');
}

function formatTanggal(iso) {
  if (!iso) return '-';
  const d = new Date(iso);
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatTanggalWaktu(iso) {
  if (!iso) return '-';
  const d = new Date(iso);
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) + ' ' +
    d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

function tanggalHariIni() {
  return new Date().toISOString().slice(0, 10);
}

function escapeHtml(s) {
  if (s === null || s === undefined) return '';
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

const KELAS_CHANNEL = { 'Toko': 'toko', 'Tokopedia': 'tokopedia', 'Shopee': 'shopee', 'TikTok Shop': 'tiktok' };

// Logo asli tiap marketplace (file di assets/img, lihat index.html utk logo brand Senantiasa
// sendiri) -- "Toko" (fisik) tidak punya logo brand, dikasih ikon toko generik sbg gantinya.
// Dipakai lewat ikonChannel()/badgeChannel() supaya representasinya SAMA di seluruh app &
// laporan (bukan cuma tulisan nama channel yg makan tempat).
const CHANNEL_LOGO = {
  'Tokopedia': 'assets/img/channel-tokopedia.svg?v=20260924u',
  'Shopee': 'assets/img/channel-shopee.svg?v=20260924u',
  'TikTok Shop': 'assets/img/channel-tiktok.png?v=20260924u'
};
const IKON_TOKO_KECIL = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l1.4-5h15.2L21 9"/><path d="M4 9v10a1 1 0 0 0 1 1h4v-7h6v7h4a1 1 0 0 0 1-1V9"/><path d="M3 9h18"/></svg>';

function ikonChannel(channel) {
  const kelas = KELAS_CHANNEL[channel] || '';
  const src = CHANNEL_LOGO[channel];
  const isi = src ? `<img src="${src}" alt="">` : IKON_TOKO_KECIL;
  return `<span class="ikon-channel ikon-channel--${kelas}">${isi}</span>`;
}

function badgeChannel(channel) {
  if (!channel) return '-';
  const kelas = KELAS_CHANNEL[channel];
  return `<span class="badge badge-channel badge-${kelas}">${ikonChannel(channel)}${escapeHtml(channel)}</span>`;
}

// Dipakai utk mewarnai bar grafik sesuai warna asli logo tiap marketplace (bar-isi--toko dst).
function kelasBarChannel(channel) {
  const kelas = KELAS_CHANNEL[channel];
  return kelas ? 'bar-isi--' + kelas : '';
}

function badgeTipeTransaksi(tipe) {
  const label = { masuk: 'Masuk', keluar: 'Keluar', koreksi: 'Koreksi' }[tipe] || tipe;
  return `<span class="badge badge-${tipe}">${label}</span>`;
}

// Pakai kelas badge-masuk/badge-keluar yg sama dgn badgeTipeTransaksi (warna sama = konsisten),
// cuma labelnya beda krn ini soal uang, bukan pergerakan barang.
function badgeTipePembukuan(tipe) {
  const label = tipe === 'masuk' ? 'Uang Masuk' : 'Uang Keluar';
  return `<span class="badge badge-${tipe}">${label}</span>`;
}

// Kompres & resize foto produk ke JPEG kecil (maks lebar 480px) supaya tidak
// cepat memenuhi kuota localStorage (biasanya sekitar 5-10MB per browser).
function kompresFoto(file, callback) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      const maxW = 480;
      const skala = Math.min(1, maxW / img.width);
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * skala);
      canvas.height = Math.round(img.height * skala);
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      callback(canvas.toDataURL('image/jpeg', 0.72));
    };
    img.onerror = () => callback(null);
    img.src = e.target.result;
  };
  reader.onerror = () => callback(null);
  reader.readAsDataURL(file);
}
