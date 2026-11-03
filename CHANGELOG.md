# Riwayat perubahan

## 2.2.0 (5 November 2026): mulai pencatatan dari awal

- Layar pemindahan data lama punya pilihan **Produk saja, catatan mulai dari awal**: produk, varian, harga, kategori, dan pengaturan dipindahkan, riwayat transaksi dan catatan pembukuan lama tidak.
- Pengaturan, Zona Berbahaya: **Hapus riwayat, mulai dari awal** menghapus transaksi dan pembukuan, sementara produk, pengaturan, stok yang tercatat, dan angka marketplace tetap.
- Tooltip hover dimatikan.

## 2.1.0 (4 November 2026): tema Aurora

Tahap UI/UX. Bentuk mengikuti inspirasi ERP/POS (bingkai besar membulat, panel kaca buram, tombol pill, kartu pastel), warna tetap palet Senantiasa.
- Lapisan tema terpisah `public/assets/css/tema.css` (hapus file ini untuk kembali ke tampilan sebelumnya) dan `public/assets/js/gerak.js`.
- Sidebar dan konten sebagai dua panel kaca melayang di atas latar aurora; pil menu aktif yang meluncur antar menu.
- Gerak: kartu muncul berurutan tiap pindah halaman, angka statistik menghitung naik, modal dan toast membal halus, tombol terangkat saat disentuh. Semua berhenti jika perangkat meminta kurangi gerak.
- Pembiasaan: sapaan sesuai waktu dengan ringkasan yang perlu dikerjakan, tombol cepat **Catat** (juga tombol keyboard `c`) dari halaman mana pun, bar kemajuan dan konfeti di Sinkron Marketplace, keadaan "semua sudah sinkron".
- Overview tidak lagi terpotong di jendela sempit.

## 2.0.0 (3 November 2026): rombak backend dan frontend

**Masalah yang diperbaiki.** Versi lama menyimpan stok terpisah per channel dan menjumlahkannya. Satu baju fisik yang ditulis 1 di Shopee dan 1 di TikTok terbaca 2 atau 3, sehingga stok sebenarnya sulit dicek dan angka tidak sama dengan yang diinput di marketplace. Semua data juga berada dalam satu dokumen Firestore, sehingga dua perangkat yang menyimpan bersamaan bisa saling menimpa.

**Model stok baru**
- Satu stok fisik per varian. Penjualan di Toko, Shopee, atau TikTok Shop mengurangi angka yang sama.
- Angka di marketplace dicatat terpisah (listing) dan tidak dijumlahkan.
- Menu baru **Sinkron Marketplace**: daftar angka yang harus diubah di marketplace (misal TikTok 1 → 0), pengganti tanda bulat manual. Ringkasannya muncul di Overview dan sidebar.
- Menu baru **Hitung Stok** (opname) dengan koreksi tercatat.
- Dihapus: pindah stok antar channel, stok awal per channel, pengingat cek stok manual.

**Backend**
- Firestore per dokumen (produk, transaksi, listing, foto, pembukuan, pengaturan) dengan listener realtime. Dua perangkat tidak lagi saling menimpa.
- Cache lokal permanen: tetap bisa mencatat saat offline, terkirim otomatis saat online.
- Foto produk ikut tersimpan online.
- `firestore.rules` baru: pembukuan dan pengaturan biaya hanya bisa dibaca atau ditulis pemilik (sebelumnya hanya disembunyikan di tampilan); transaksi dan listing divalidasi. Akses tetap dibatasi ke dua uid (pemilik dan satu karyawan) seperti aturan lama, bukan semua akun yang login. Diuji dengan `npm run test:rules` (43 kasus).
- Pemindahan data lama sekali jalan: penanda dicek langsung ke server sebelum menulis (perangkat dengan cache lama tidak bisa menjalankannya ulang), butuh internet, dokumen lama tidak diubah. Kalau terputus di tengah jalan sebelum penanda tertulis, aman diulang.

**Online**
- Hosting pindah dari GitHub Pages ke Firebase Hosting (`senantiasa.web.app`). Alamat GitHub Pages hanya mengalihkan.
- Tidak ada lagi unduh cadangan, pengingat, atau pemulihan dari file.

**Struktur proyek.** Aplikasi dipindah ke `public/`. Ditambahkan `package.json`, `tools/`, dan `test/` (uji logika stok, dua perangkat, migrasi).

**Belum dikerjakan (tahap berikutnya)**: polesan UI/UX. Tampilan halaman baru sengaja polos.

## Sebelum 2.0.0

Versi 1.x: aplikasi lokal di localStorage, kemudian GitHub Pages dengan sinkron satu dokumen Firestore, role pemilik dan karyawan, tema berulang kali dirombak.
