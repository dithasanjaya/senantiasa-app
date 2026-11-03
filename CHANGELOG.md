# Riwayat perubahan

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
- Hosting pindah dari GitHub Pages ke Firebase Hosting (`senantiasa-5598a.web.app`). Alamat GitHub Pages hanya mengalihkan.
- Tidak ada lagi unduh cadangan, pengingat, atau pemulihan dari file.

**Struktur proyek.** Aplikasi dipindah ke `public/`. Ditambahkan `package.json`, `tools/`, dan `test/` (uji logika stok, dua perangkat, migrasi).

**Belum dikerjakan (tahap berikutnya)**: polesan UI/UX. Tampilan halaman baru sengaja polos.

## Sebelum 2.0.0

Versi 1.x: aplikasi lokal di localStorage, kemudian GitHub Pages dengan sinkron satu dokumen Firestore, role pemilik dan karyawan, tema berulang kali dirombak.
