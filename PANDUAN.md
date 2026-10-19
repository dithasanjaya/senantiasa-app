# Panduan Pakai — Inventory Senantiasa

Aplikasi pencatatan stok untuk brand **Senantiasa** ([@senantiasa_](https://www.instagram.com/senantiasa_/)) — mencatat stok produk yang dijual lewat **Toko offline**, **Shopee**, dan **TikTok Shop**. *(Tokopedia sengaja tidak dilacak di aplikasi ini — keputusan bisnis, lihat bagian 4.)*

Aplikasi ini **halaman web biasa** (bukan aplikasi terinstal): tidak perlu server, tidak perlu internet setelah dibuka pertama kali, dan tidak perlu instalasi apa pun. Datanya tersimpan **di dalam browser** (Safari/Chrome) di komputer yang dipakai membuka aplikasi ini.

## Update: Sekarang Bisa Dibuka Online & Datanya Sama di Semua Device

App ini sekarang **juga** di-hosting online (gratis, lewat GitHub Pages) di:

**https://dithasanjaya.github.io/senantiasa-app/**

Beda dari versi lokal (folder di komputer) di bawah ini:

- **Wajib login** dulu (email + password) sebelum bisa masuk — ini akun terpisah dari akun apa pun yang lain, dikelola lewat Firebase (layanan Google), bukan sekadar password yang dicek di browser seperti sebelumnya.
- Data tersimpan **online** (Firestore, database gratis dari Google) — begitu login dari device MANA PUN (HP, laptop lain, dll.), datanya **sama persis**, langsung ter-update kalau ada perubahan dari device lain (tanpa perlu refresh manual).
- **Foto produk yang di-upload manual** (lewat tombol "Foto" di form Tambah/Edit Produk) **TIDAK ikut tersinkron** ke device lain — cuma tersimpan di device tempat foto itu di-upload (batasan ukuran database online). Foto asli katalog (yang otomatis termuat dari nama file) tetap sama di semua device.
- Tetap butuh koneksi internet tiap buka/simpan data (beda dari versi lokal yang bisa 100% offline).
- Kalau internet putus di tengah pemakaian, app tetap bisa dipakai (data sementara disimpan di browser device itu dulu) — begitu online lagi, otomatis tersinkron ke server.

Backup manual (menu Pengaturan → **Unduh Cadangan**) tetap sangat disarankan rutin dilakukan, walau datanya sekarang sudah online — sebagai jaga-jaga kalau ada masalah di sisi Firebase/Google.

## 0. Cara Memindahkan dari Komputer Ini ke MacBook (Versi Lokal/Offline)

Aplikasi ini **halaman web statis biasa** (HTML/CSS/JS) — tidak ada proses "build"/compile, tidak ada perbedaan Windows vs Mac. Yang perlu dilakukan cuma memindahkan foldernya apa adanya:

1. Di komputer ini, ambil folder `SENANTIASA` (atau file `Senantiasa-Inventory.zip` yang sudah dikemas — isinya `index.html`, `PANDUAN.md`, `Buka Senantiasa.command`, dan folder `assets`).
2. Pindahkan ke MacBook lewat salah satu cara: flashdisk/USB, upload ke Google Drive/iCloud Drive/Dropbox lalu download di Mac, atau kirim email ke diri sendiri (kalau ukurannya kecil, biasanya di bawah 100 KB).
3. Di MacBook, **ekstrak/unzip** dulu kalau bentuknya `.zip` (klik dua kali file zip-nya — macOS otomatis mengekstrak jadi folder).
4. Taruh folder hasil ekstrak di lokasi tetap, misalnya `Documents/Senantiasa` — jangan sering dipindah-pindah setelah ini (lihat poin 1 di bawah, alasannya soal penyimpanan data per-browser).
5. Buka lewat cara di bagian **1. Cara Membuka** di bawah ini.

Setelah dipindahkan, kalau ke depannya ada perubahan/perbaikan pada aplikasi, cukup ulangi langkah ini (timpa/ganti file `index.html` dan folder `assets` yang lama dengan yang baru) — data yang sudah dicatat **tidak ikut terhapus** karena tersimpan terpisah di penyimpanan browser (localStorage), bukan di dalam file aplikasi itu sendiri.

## 1. Cara Membuka

**Cara biasa (tab browser):**
1. Buka folder `SENANTIASA`.
2. Klik dua kali `index.html` — akan terbuka di browser default (Safari/Chrome di MacBook Air).
3. Simpan folder ini di tempat tetap (jangan sering dipindah-pindah/di-rename), dan **selalu buka file `index.html` yang sama** — karena data tersimpan per-browser, bukan di dalam file itu sendiri.

**Cara sebagai aplikasi mandiri (jendela sendiri, tanpa address bar/tab)** — lihat bagian **9. Membuka sebagai Aplikasi Mandiri** di bawah.

## 2. Menu Utama

| Menu | Fungsi |
|---|---|
| **Overview** | Ringkasan total produk & stok, nilai stok modal, omzet & estimasi laba periode berjalan (bisa pilih rentang tanggal lewat kalender di kanan atas), stok per channel, cek stok marketplace. |
| **Produk** | Kelola daftar produk. Tiga pilihan tampilan (List/Detail/Besar) & sortir stok tertinggi/terendah di sidebar kiri. Filter cepat lewat tombol Kategori/Koleksi/Channel. Klik satu produk untuk mengatur varian (ukuran/warna), stok & harga per channel, dan pindah stok antar channel. |
| **Transaksi** | Catat stok **Masuk** (restock), **Keluar** (terjual), atau **Penyesuaian** (koreksi hitung, retur, barang rusak/hilang) — tiap transaksi wajib pilih **channel** (Toko/Shopee/TikTok Shop), karena stok dikelola terpisah per channel. Bisa difilter per tipe/channel & dicari lewat kolom pencarian, periode lewat kalender di kanan atas. Menu ini melacak **pergerakan barang**, bukan uang — lihat menu Pembukuan untuk cashflow yang sebenarnya. |
| **Pembukuan** | Catatan uang masuk & keluar yang sebenarnya (lihat bagian **4** di bawah untuk penjelasan lengkap kenapa ini terpisah dari Transaksi). Ringkasan Uang Masuk/Keluar/Saldo Bersih per periode, rincian per sumber (Uang Masuk) & per kelompok biaya (Uang Keluar). |
| **Laporan** | Empat jenis laporan siap cetak ukuran A4: **Laporan Stok** (snapshot stok & nilai modal tiap varian per channel saat ini), **Laporan Transaksi** (rincian mutasi stok satu periode, termasuk estimasi laba per baris), **Laporan Total** (ringkasan gabungan stok + penjualan + produk terlaris), **Laporan Pembukuan** (rincian cashflow satu periode dari menu Pembukuan). Tombol **Cetak / Simpan PDF** di kanan atas. Catatan: "estimasi laba" di Laporan Total/Transaksi dihitung otomatis dari harga jual & modal (perkiraan kasar) — utk angka yang sebenarnya, pakai Laporan Pembukuan. |
| **Pengaturan** | Terbagi jadi 5 grup yang bisa dibuka/tutup: Data & Cadangan (ringkasan, backup, restore), Klasifikasi Produk (Kategori & Koleksi), Kelompok & Rincian Biaya (dipakai di Pembukuan), Marketplace & Toko (link toko), dan Zona Berbahaya (hapus semua data). |

## 3. Alur Kerja Dasar

1. **Tambah Produk** (menu Produk) — isi nama, kategori, koleksi (opsional), foto (opsional, rasio potret 4:5).
2. Buka produk tsb → **Tambah Varian** untuk tiap ukuran/warna, isi **stok awal per channel** (Toko/Shopee/TikTok Shop masing-masing punya angka sendiri), harga modal, harga jual umum, dan harga per channel kalau beda-beda.
3. Setiap ada barang masuk dari supplier ke channel tertentu → catat **Transaksi → Masuk**, pilih channel tujuannya.
4. Setiap ada penjualan → catat **Transaksi → Keluar**, pilih channel tempat lakunya.
5. Kalau ada selisih stok di channel tertentu (hilang, rusak, salah hitung, retur) → catat **Transaksi → Penyesuaian**, pilih channel yang dikoreksi.

Stok tiap varian di tiap channel dihitung otomatis dari: **stok awal channel itu + semua transaksi yang menyebut channel itu**. **Stok Total** yang tampil di berbagai tempat adalah **jumlah otomatis dari semua channel** — jadi kalau menambah stok di Shopee, Stok Total ikut naik, tapi stok Toko/TikTok Shop tidak ikut berubah (karena memang terpisah).

## 4. Pembukuan (Cashflow Sebenarnya)

**Kenapa terpisah dari menu Transaksi?** Menu Transaksi mencatat **pergerakan barang** (berapa item masuk/keluar per channel) — bukan uang yang benar-benar diterima. Harga jual di e-commerce sering tidak mencerminkan pendapatan sebenarnya karena potongan platform, promo, subsidi ongkir, dan faktor pengurang lain yang jumlahnya tidak tetap tiap transaksi. Menu **Pembukuan** dibuat khusus untuk mencatat uang masuk & keluar yang sesungguhnya, terpisah dari catatan stok.

**Kenapa Tokopedia tidak ada di daftar channel?** Keputusan bisnis — Tokopedia sengaja dikeluarkan dari pelacakan, baik di stok (Produk/Transaksi/Laporan Stok) maupun di Pembukuan. Channel aktif di aplikasi ini sekarang cuma **Toko, Shopee, TikTok Shop**.

**Uang Masuk** — dicatat sebagai **rekap satu periode** (bukan satu-satu per transaksi penjualan), dari 3 sumber: **Toko, Shopee, TikTok Shop**. Satu entri = total uang yang diterima dari satu channel untuk satu rentang tanggal, misalnya "Shopee, 1–7 September, Rp2.500.000".

**Uang Keluar** — dicatat per tanggal, dikelompokkan jadi:
- **Operasional**: Listrik, Keamanan, WiFi, Sewa, Konsumsi, Lain-lain
- **Ongkos Jahit**: per penjahit (default "Penjahit 1"/"Penjahit 2" — ganti nama aslinya di menu Pengaturan)
- **Ongkos Kirim**
- **Belanja Bahan**: Kain, Perlengkapan Jahit

Daftar kelompok & rincian biaya ini bisa ditambah/diedit/dihapus kapan saja lewat **Pengaturan → Kelompok & Rincian Biaya** — persis seperti Kategori/Koleksi produk.

Halaman Pembukuan menampilkan **Saldo Bersih** (Uang Masuk − Uang Keluar) untuk periode yang dipilih lewat kalender di kanan atas, plus rincian per sumber dan per kelompok biaya.

## 5. Kategori & Koleksi

Tiap produk bisa diberi **Kategori** (jenis barang, mis. Top/Outer/Rok/Skirt/Bikini/Dress/Kebaya) dan **Koleksi** (lini/musim, mis. Kasuari/Pesisir/Setala). Keduanya dipakai sebagai tombol filter cepat di menu Produk. Kelola daftar pilihannya di menu **Pengaturan → Kelola Kategori & Koleksi** (tambah/hapus label) — atau cukup ketik nama baru langsung di form Tambah Produk, otomatis tersimpan ke daftar.

## 6. Cek Stok Marketplace (Manual)

Aplikasi ini **tidak tersambung otomatis** ke sistem Shopee/TikTok Shop — tidak ada API/sinkronisasi data, murni tautan pintasan. Karena stok tiap channel dicatat manual, penting untuk rutin cek supaya angka di aplikasi ini tetap sesuai dengan yang sebenarnya ada di tiap marketplace.

Di kartu **"Cek Stok Marketplace"** pada Overview (dan juga di menu Pengaturan):
- Tombol **"Buka Toko ↗"** langsung membuka halaman toko asli Anda (Shopee/TikTok Shop) di tab baru, untuk dicocokkan manual dengan catatan di aplikasi ini.
- Tombol **"Tandai Sudah Dicek"** mencatat kapan terakhir kali Anda mengecek channel tersebut. Kalau sudah lebih dari 2 hari belum dicek, tulisannya akan berubah warna sebagai pengingat.

Kenapa tidak otomatis? Sinkronisasi otomatis butuh pendaftaran resmi sebagai developer di tiap platform, proses otorisasi akun toko, dan aplikasi harus berubah dari "murni file offline" jadi butuh server + koneksi internet aktif. Untuk saat ini dipilih cara manual supaya aplikasi tetap sederhana, aman, dan tidak butuh persetujuan pihak ketiga.

## 7. Backup Data (SANGAT PENTING)

Karena aplikasi ini **tidak** menyimpan data ke file di komputer (beda dengan aplikasi Sapta Sanak) — data hidup di penyimpanan browser (localStorage). Ini artinya data **bisa hilang** kalau:
- Cache/data browser dibersihkan,
- Ganti browser atau ganti komputer,
- Browser di-reset/reinstall.

**Karena itu, WAJIB rutin unduh cadangan:**
1. Menu **Pengaturan** → **⬇ Unduh Cadangan Sekarang**.
2. File `cadangan-inventory-senantiasa-YYYY-MM-DD.json` akan terunduh ke folder Downloads.
3. Simpan salinannya di tempat lain (Google Drive, email ke diri sendiri, USB) — di luar cache browser.
4. Aplikasi akan otomatis menampilkan **peringatan kuning** di bagian atas kalau sudah lebih dari 14 hari belum backup.

**Memulihkan data:** menu Pengaturan → **⬆ Pulihkan dari Cadangan** → pilih file JSON cadangan tsb. Ini akan **menggantikan seluruh data saat ini**, jadi pastikan sudah backup data yang sedang berjalan dulu kalau masih diperlukan.

## 8. Pertanyaan Umum

**Apakah data saya terkirim ke internet?**
Tidak. Semua data tersimpan lokal di browser komputer ini saja, tidak ada koneksi ke server luar.

**Bisa dipakai di HP?**
Bisa dibuka di browser HP juga (buka file `index.html`-nya, atau upload folder ke Google Drive lalu buka lewat itu), tapi datanya akan **terpisah** dari yang di laptop (karena tersimpan per-browser/per-perangkat). Untuk satu sumber data yang konsisten, sebaiknya selalu pakai satu perangkat/browser yang sama, lalu backup-restore kalau perlu pindah.

**Kenapa tidak seperti aplikasi Sapta Sanak (yang datanya jadi file otomatis)?**
Pola itu butuh program kecil yang berjalan di latar belakang (server lokal). Untuk versi ini dipilih pola paling sederhana (halaman web biasa, tanpa instalasi) supaya langsung bisa dipakai di MacBook Air tanpa persiapan tambahan — konsekuensinya adalah kewajiban rutin backup manual di atas.

**Setelah menerima folder/zip baru, tampilan aplikasi masih seperti versi lama — kenapa?**
Kemungkinan besar file yang dibuka masih folder/zip **lama** (browser tidak salah — memang belum ada file baru yang dibuka). Setiap kali menerima folder/zip baru: hapus dulu folder lama di Mac, ekstrak yang baru di lokasi yang sama, baru buka `index.html`-nya. File CSS/JS di aplikasi ini sudah dilengkapi "penanda versi" (`?v=...` di `index.html`) supaya begitu ada folder baru yang benar-benar dibuka, browser otomatis memuat isi terbaru tanpa perlu bersih-bersih cache manual sama sekali — jadi kalau masih terlihat lama, cek dulu apakah foldernya memang sudah yang terbaru.

## 9. Membuka sebagai Aplikasi Mandiri (Jendela Sendiri)

Kalau dibuka dengan cara biasa (klik dua kali `index.html`), aplikasi akan terbuka sebagai **tab** di Safari/Chrome — lengkap dengan address bar, tombol tab, dsb. Supaya terasa seperti aplikasi Mac sungguhan (jendela sendiri, tanpa address bar, muncul dgn nama "Senantiasa Inventory" saat Cmd+Tab), pakai salah satu cara ini:

**Cara 1 — Klik file `Buka Senantiasa.command` (paling gampang, sudah disiapkan)**
1. Pastikan **Google Chrome** terpasang di MacBook (kalau belum, bisa juga pakai Microsoft Edge).
2. Klik dua kali file `Buka Senantiasa.command` di dalam folder `SENANTIASA`.
3. **Kalau macOS menampilkan peringatan** "tidak bisa dibuka karena berasal dari pengembang yang tidak dikenal" (wajar utk file yang dipindah dari komputer lain, bukan tanda file rusak/berbahaya) — klik kanan file itu → **Open** → klik **Open** sekali lagi di dialog konfirmasi. Cukup dilakukan sekali; setelah itu klik dua kali biasa akan langsung jalan.
4. Sebuah jendela Terminal kecil akan muncul sebentar lalu aplikasi terbuka di jendela browser tersendiri. Jendela Terminal-nya boleh langsung ditutup.
5. **Opsional:** klik kanan ikon aplikasi ini di Dock (saat sedang terbuka) → **Options → Keep in Dock**, supaya ke depannya cukup klik ikon di Dock tanpa perlu buka folder lagi.

**Cara 2 — Fitur bawaan Chrome (tanpa file tambahan)**
1. Buka `index.html` seperti biasa di Chrome.
2. Klik menu titik tiga (⋮) di pojok kanan atas → **Cast, save and share** (atau **More Tools**) → **Create Shortcut...**
3. Centang **"Open as window"**, lalu klik **Create**.
4. Chrome akan membuat ikon aplikasi tersendiri (bisa ditaruh di Dock/Launchpad) yang membuka Senantiasa Inventory sebagai jendela mandiri, terpisah dari jendela Chrome biasa.

Kedua cara di atas **tidak mengubah cara data disimpan** — tetap di localStorage browser yang sama, jadi kewajiban backup rutin (lihat bagian 7) tetap berlaku sama seperti biasa.
