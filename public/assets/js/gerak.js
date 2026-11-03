// Gerak & kesenangan kecil (Nov 2026): pil menu yang meluncur, kartu muncul berurutan tiap
// pindah halaman, angka yang menghitung naik, tombol "Catat" cepat, dan konfeti saat semua
// angka marketplace sudah sinkron. Murni tampilan: tidak menyentuh data. Semua gerak berhenti
// kalau perangkat meminta (prefers-reduced-motion), dan semuanya aman kalau skrip ini gagal.
(function () {
  const kurangGerak = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s) => document.querySelector(s);

  // ---------- Pil menu aktif ----------
  function letakkanPil() {
    const nav = $('.nav');
    if (!nav) return;
    let pil = nav.querySelector('.nav-pil');
    if (!pil) { pil = document.createElement('span'); pil.className = 'nav-pil'; nav.prepend(pil); }
    const aktif = nav.querySelector('.nav__item.aktif:not([hidden])');
    if (!aktif || !aktif.offsetHeight) { pil.classList.remove('siap'); document.body.classList.remove('ada-pil'); return; }
    const ws = { 'pembukuan': 'senantiasa', 'pembukuan-dinda': 'dinda', 'pembukuan-retro': 'retro' }[aktif.dataset.nav];
    if (ws) pil.dataset.ws = ws; else delete pil.dataset.ws;
    pil.style.height = aktif.offsetHeight + 'px';
    const sudah = pil.classList.contains('siap');
    if (!sudah) { pil.style.transition = 'none'; }
    pil.style.transform = 'translateY(' + aktif.offsetTop + 'px)';
    if (!sudah) { void pil.offsetWidth; pil.style.transition = ''; }
    pil.classList.add('siap');
    document.body.classList.add('ada-pil');
  }

  // ---------- Angka menghitung naik ----------
  function hitungNaik(el) {
    const teks = el.textContent.trim();
    const m = teks.match(/^(Rp)?\s?(\d{1,3}(?:\.\d{3})*|\d+)$/);
    if (!m) return;
    const akhir = parseInt(m[2].replace(/\./g, ''), 10);
    if (!akhir || akhir > 1e12) return;
    const awal = performance.now(), durasi = 900;
    function langkah(t) {
      const p = Math.min(1, (t - awal) / durasi);
      const nilai = Math.round(akhir * (1 - Math.pow(1 - p, 3)));
      el.textContent = (m[1] || '') + nilai.toLocaleString('id-ID');
      if (p < 1) requestAnimationFrame(langkah); else el.textContent = teks;
    }
    requestAnimationFrame(langkah);
  }

  // ---------- Setiap pindah halaman: kartu muncul berurutan ----------
  let hashTerakhir = null, timer = null;
  function halamanBerganti() {
    const isi = $('#kontenUtama'), sticky = $('#halamanStickyHost');
    if (!isi || hashTerakhir === location.hash) return;
    hashTerakhir = location.hash;
    if (kurangGerak()) return;
    [isi, sticky].forEach(e => e && e.classList.add('halaman-baru'));
    isi.querySelectorAll('.stat__nilai, .mini-stat-channel__nilai').forEach(hitungNaik);
    clearTimeout(timer);
    timer = setTimeout(() => [isi, sticky].forEach(e => e && e.classList.remove('halaman-baru')), 1300);
  }

  // ---------- Konfeti (warna palet Senantiasa) ----------
  window.rayakan = function (dariEl) {
    if (kurangGerak()) return;
    const r = dariEl ? dariEl.getBoundingClientRect() : { left: innerWidth / 2, top: innerHeight / 2, width: 0, height: 0 };
    const x0 = r.left + r.width / 2, y0 = r.top + r.height / 2;
    const warna = ['#D6E59A', '#8FA35A', '#D47444', '#ECCCC4', '#C8B37F', '#1C4C94'];
    for (let i = 0; i < 34; i++) {
      const p = document.createElement('span');
      p.className = 'konfeti';
      p.style.background = warna[i % warna.length];
      if (i % 3 === 0) p.style.borderRadius = '50%';
      document.body.appendChild(p);
      const sudut = Math.random() * Math.PI * 2, jarak = 90 + Math.random() * 190;
      const dx = Math.cos(sudut) * jarak, dy = Math.sin(sudut) * jarak - 70;
      const putar = (Math.random() - .5) * 720;
      const anim = p.animate([
        { transform: `translate(${x0}px, ${y0}px) rotate(0deg) scale(1)`, opacity: 1 },
        { transform: `translate(${x0 + dx}px, ${y0 + dy}px) rotate(${putar}deg) scale(1)`, opacity: 1, offset: .55 },
        { transform: `translate(${x0 + dx * 1.15}px, ${y0 + dy + 220}px) rotate(${putar * 1.4}deg) scale(.6)`, opacity: 0 }
      ], { duration: 1100 + Math.random() * 500, easing: 'cubic-bezier(.2,.7,.3,1)', fill: 'forwards' });
      anim.onfinish = () => p.remove();
    }
  };

  // ---------- Tombol cepat "Catat" ----------
  function pasangFab() {
    if ($('#fabCatat')) return;
    const b = document.createElement('button');
    b.id = 'fabCatat'; b.type = 'button'; b.className = 'fab-catat'; b.hidden = true;
    b.setAttribute('aria-label', 'Catat transaksi');
    b.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg><span>Catat</span>';
    b.addEventListener('click', bukaCatat);
    document.body.appendChild(b);
  }
  function siapPakai() {
    const g = $('#gerbangKunci');
    return typeof DATA !== 'undefined' && DATA.meta && DATA.meta.migrasi && g && g.hidden && DATA.produk.length;
  }
  function bukaCatat() {
    if (!siapPakai() || $('#modalHost').children.length) return;
    modalFormTransaksi(null, null);
  }
  function perbaruiFab() { const b = $('#fabCatat'); if (b) b.hidden = !siapPakai(); }

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'c' || e.ctrlKey || e.metaKey || e.altKey) return;
    if (/^(INPUT|TEXTAREA|SELECT)$/.test((document.activeElement || {}).tagName)) return;
    e.preventDefault(); bukaCatat();
  });

  document.addEventListener('DOMContentLoaded', () => {
    pasangFab();
    const isi = $('#kontenUtama');
    if (isi) new MutationObserver(() => { halamanBerganti(); letakkanPil(); perbaruiFab(); }).observe(isi, { childList: true });
    window.addEventListener('hashchange', () => requestAnimationFrame(letakkanPil));
    window.addEventListener('resize', letakkanPil);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(letakkanPil);
    letakkanPil();
    setInterval(perbaruiFab, 700); // gerbang login/migrasi bisa berganti tanpa mengubah isi halaman
  });
})();
