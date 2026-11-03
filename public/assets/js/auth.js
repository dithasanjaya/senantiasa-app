// ============================================================
// GERBANG LOGIN + MULAI APLIKASI
// ============================================================
// Login sungguhan diverifikasi server Google (Firebase Authentication) -- password tidak pernah
// disimpan di kode ini. Alur setelah login: pasang BACKEND -> mulaiSinkron() (muat data dari
// Firestore) -> cek pemindahan data lama -> render().
//
// Markup kotak login sengaja TIDAK ada di HTML awal (cuma spinner) -- disisipkan lewat JS hanya
// kalau Firebase memastikan belum login, supaya sesi yg masih valid tidak melihat form berkedip.
(function () {
  const gerbang = document.getElementById('gerbangKunci');
  if (!gerbang) return;

  function pesanErrorLogin(kode) {
    if (kode === 'auth/invalid-credential' || kode === 'auth/wrong-password' || kode === 'auth/user-not-found') return 'Email atau password salah.';
    if (kode === 'auth/invalid-email') return 'Format email tidak valid.';
    if (kode === 'auth/too-many-requests') return 'Terlalu banyak percobaan gagal. Coba lagi beberapa menit lagi.';
    if (kode === 'auth/network-request-failed') return 'Tidak ada koneksi internet.';
    return 'Gagal masuk, coba lagi.';
  }

  function tampilkanPesanLayar(judul, isi, aksiHtml) {
    gerbang.hidden = false;
    gerbang.innerHTML = `
      <div class="gerbang-kunci__kotak">
        <img src="assets/img/logo.png?v=20261103" alt="" class="gerbang-kunci__logo">
        <h1>${judul}</h1>
        <p>${isi}</p>
        ${aksiHtml || ''}
      </div>`;
  }

  // Dipasang sekali: perubahan dari perangkat lain muncul tanpa reload. Tidak menggambar ulang
  // halaman saat kamu sedang mengetik (ditunda sampai selesai), dan posisi scroll dijaga.
  let tertunda = false;
  function segarkanDariServer(info) {
    if (info && info.lokal) return; // gema dari tulisan kita sendiri -- UI sudah digambar ulang oleh aksinya
    const aktif = document.activeElement;
    if (aktif && /^(INPUT|TEXTAREA|SELECT)$/.test(aktif.tagName) && aktif.closest('#kontenUtama, #halamanStickyHost')) {
      if (!tertunda) {
        tertunda = true;
        aktif.addEventListener('blur', () => { tertunda = false; gambarUlangAman(); }, { once: true });
      }
      return;
    }
    gambarUlangAman();
  }
  function gambarUlangAman() {
    const el = document.getElementById('kontenScroll');
    const y = el ? el.scrollTop : 0;
    mulaiTampilan();
    if (el) el.scrollTop = y;
  }

  // Tentukan layar yg tampil berdasarkan status pemindahan data.
  function mulaiTampilan() {
    if (!DATA.meta.migrasi) { tampilkanLayarMigrasi(gerbang); return; }
    gerbang.hidden = true;
    gerbang.innerHTML = '';
    render();
  }

  async function mulaiSetelahLogin() {
    if (window.MODE_LOKAL) { await window.__siapLokal; BACKEND = window.__backendLokal; }
    else BACKEND = window.__backendFirestore;
    tampilkanPesanLayar('Memuat data…', 'Mengambil stok terbaru dari server.', '<div class="gerbang-kunci__spinner" aria-label="Memuat"></div>');
    try {
      await mulaiSinkron();
    } catch (e) {
      console.error(e);
      const izin = e && e.code === 'permission-denied';
      tampilkanPesanLayar('Tidak bisa memuat data',
        izin ? 'Akun ini belum punya izin membuka data toko. Hubungi pemilik.' : 'Periksa koneksi internet, lalu coba lagi.',
        '<button type="button" id="btnCobaLagi">Coba lagi</button> <button type="button" id="btnKeluarGagal" class="gerbang-kunci__sekunder">Keluar</button>');
      document.getElementById('btnCobaLagi').onclick = mulaiSetelahLogin;
      document.getElementById('btnKeluarGagal').onclick = () => window.firebaseAuth.signOut();
      return;
    }
    pasangPendengarData(segarkanDariServer);
    mulaiTampilan();
  }
  window.mulaiTampilanSetelahMigrasi = mulaiTampilan;

  function tampilkanFormLogin() {
    gerbang.hidden = false;
    gerbang.innerHTML = `
      <div class="gerbang-kunci__kotak">
        <img src="assets/img/logo.png?v=20261103" alt="" class="gerbang-kunci__logo">
        <h1>Senantiasa</h1>
        <p>Masuk untuk membuka aplikasi.</p>
        <form id="formGerbangKunci">
          <input type="email" id="inputEmailGerbang" placeholder="Email" autocomplete="username" autofocus>
          <input type="password" id="inputGerbangKunci" placeholder="Password" autocomplete="current-password">
          <button type="submit">Masuk</button>
        </form>
        <p id="errorGerbangKunci" class="gerbang-kunci__error" hidden></p>
      </div>
    `;
    const form = document.getElementById('formGerbangKunci');
    const inputEmail = document.getElementById('inputEmailGerbang');
    const inputPassword = document.getElementById('inputGerbangKunci');
    const error = document.getElementById('errorGerbangKunci');
    const tombolMasuk = form.querySelector('button[type="submit"]');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      error.hidden = true;
      tombolMasuk.disabled = true;
      tombolMasuk.textContent = 'Memeriksa...';
      try {
        if (!window.firebaseSignIn) throw { code: 'auth/network-request-failed' };
        await window.firebaseSignIn(inputEmail.value.trim(), inputPassword.value);
        // Sisanya ditangani onAuthStateChanged di bawah.
      } catch (err) {
        error.textContent = pesanErrorLogin(err.code);
        error.hidden = false;
        inputPassword.value = '';
        inputPassword.focus();
      } finally {
        tombolMasuk.disabled = false;
        tombolMasuk.textContent = 'Masuk';
      }
    });
  }

  function pasangListenerAuth() {
    let sudahMulai = false;
    window.firebaseAuth.onAuthStateChanged((user) => {
      if (user) { if (!sudahMulai) { sudahMulai = true; mulaiSetelahLogin(); } }
      else { sudahMulai = false; hentikanSinkron(); tampilkanFormLogin(); }
    });
  }

  if (window.firebaseAuth) pasangListenerAuth();
  else window.addEventListener('firebase-siap', pasangListenerAuth, { once: true });
})();
