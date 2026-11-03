// Service worker Senantiasa -- syarat teknis supaya browser menganggap app ini "installable"
// (PWA) sekaligus menyimpan kode aplikasi (HTML/CSS/JS/ikon) supaya halaman tetap terbuka saat
// offline. DATA tidak lewat sini: data disimpan Firestore sendiri (cache lokal permanen).
//
// Hanya aktif lewat http(s) -- tidak jalan dari file://.
// Naikkan angka versi tiap kali file inti berubah supaya klien lama membuang cache basi.
const CACHE_NAME = 'senantiasa-cache-v5';
const ASET_INTI = [
  './',
  './manifest.json',
  './assets/css/style.css',
  './assets/css/tema.css',
  './assets/js/data.js',
  './assets/js/stok.js',
  './assets/js/migrasi.js',
  './assets/js/penyimpanan.js',
  './assets/js/backend-lokal.js',
  './assets/js/ui.js',
  './assets/js/rangepicker.js',
  './assets/js/app.js',
  './assets/js/halaman-stok.js',
  './assets/js/gerak.js',
  './assets/js/firebase-init.js',
  './assets/js/auth.js',
  './assets/img/logo.png',
  './assets/img/ikon-180.png',
  './assets/img/ikon-192.png',
  './assets/img/wordmark.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASET_INTI))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// "Network-first, fallback ke cache": selalu coba versi terbaru dulu, baru pakai salinan kalau
// offline. Yang dicegat HANYA file milik aplikasi (satu origin) dan SDK Firebase dari gstatic;
// lalu lintas Firestore/Auth (googleapis.com) dilepas apa adanya supaya koneksi realtime tidak terganggu.
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  const milikSendiri = url.origin === self.location.origin;
  const sdk = url.hostname === 'www.gstatic.com' && url.pathname.startsWith('/firebasejs/');
  if (!milikSendiri && !sdk) return;
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        if (res.ok) { const salinan = res.clone(); caches.open(CACHE_NAME).then((cache) => cache.put(e.request, salinan)); }
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
