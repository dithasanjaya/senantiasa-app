# Panduan Pakai: Senantiasa

Aplikasi pencatat stok brand **Senantiasa** ([@senantiasa_](https://www.instagram.com/senantiasa_/)) untuk produk yang dijual di **Toko offline**, **Shopee**, dan **TikTok Shop**, plus pembukuan uang masuk dan keluar. Dipakai oleh pemilik dan karyawan, dari perangkat mana pun.

Alamat: **https://senantiasa-5598a.web.app/** (masuk dengan email dan password akun Senantiasa).

## 1. Cara berpikir stok yang baru

Satu barang fisik hanya ada satu. Karena itu aplikasi sekarang menyimpan **satu stok fisik per varian**, bukan stok terpisah per channel.

- **Stok fisik** adalah jumlah barang yang benar-benar ada. Barang yang laku di Toko, Shopee, atau TikTok Shop mengurangi angka yang sama.
- **Angka di marketplace** adalah jumlah yang tertera di aplikasi Shopee dan TikTok Shop saat ini. Aplikasi mencatatnya terpisah dan tidak pernah menjumlahkannya ke stok fisik.
- **Sinkron Marketplace** adalah daftar angka marketplace yang berbeda dari stok fisik, alias yang harus kamu ubah. Ini menggantikan tanda bulat di catatan manual.

Contoh Semilir Kebaya, fisik 1 pcs, ditulis 1 di Shopee dan 1 di TikTok:

1. Laku di Shopee. Catat **Transaksi, Keluar, Terjual di Shopee**.
2. Stok fisik jadi 0. Angka Shopee ikut 0 otomatis, karena Shopee mengurangi sendiri.
3. Menu **Sinkron Marketplace** menampilkan: TikTok Shop **1 → 0**.
4. Buka TikTok Shop, ubah stok jadi 0, kembali ke aplikasi, tekan **Sudah diubah**.

Kebalikannya juga berlaku. Kalau stok Shopee kosong tapi barang masih ada di tempat lain, Sinkron akan menampilkan Shopee **0 → 1** supaya kamu menaikkannya, dan barang itu tetap bisa dijual di semua platform.

## 2. Menu

| Menu | Fungsi |
|---|---|
| **Overview** | Ringkasan stok fisik, nilai stok, daftar angka marketplace yang perlu disesuaikan, stok menipis, omzet dan laba periode (pilih tanggal di kanan atas). |
| **Sinkron Marketplace** | Daftar angka yang harus diubah di Shopee dan TikTok Shop, dikelompokkan per marketplace. Angka merah di sidebar adalah jumlahnya. Tombol **Sudah diubah** per baris, atau **Tandai semua sudah diubah**. |
| **Produk** | Daftar produk dan varian. Di detail produk ada tabel varian dengan kolom Stok (fisik), Shopee, TikTok. Angka merah seperti `5 → 4` artinya angka di marketplace itu belum sama dengan stok fisik, centang hijau menandai sudah kamu ubah. Filter Status di sidebar: Perlu disesuaikan, Stok menipis, Stok habis. |
| **Transaksi** | Catat **Masuk** (restock), **Keluar** (terjual, pilih channel), atau **Penyesuaian** (koreksi, retur, rusak). Channel hanya ditanyakan untuk penjualan. Setelah menyimpan, aplikasi langsung menyebut apa yang perlu diubah di marketplace. |
| **Hitung Stok** | Cocokkan angka di aplikasi dengan barang yang benar-benar ada. Isi **Hitungan nyata** hanya untuk varian yang berbeda, selisihnya dicatat sebagai Koreksi. |
| **Pembukuan** (3 buku) | Uang masuk dan keluar. Hanya akun pemilik yang bisa membuka. Lihat bagian 5. |
| **Laporan** | Laporan Stok (stok fisik dan angka marketplace per varian), Laporan Transaksi, Laporan Total, Laporan Pembukuan. Tombol Cetak atau Simpan PDF di kanan atas. |
| **Pengaturan** | Kategori dan koleksi, kelompok biaya, link toko, akses karyawan, instal aplikasi, zona berbahaya (pemilik). |

## 3. Alur harian

1. **Ada barang laku** di channel mana pun: Transaksi, Keluar, pilih produk, varian, dan channel. Atau dari detail produk, tombol **+ Catat** di baris varian.
2. Buka **Sinkron Marketplace**, ubah angka di Shopee dan TikTok sesuai daftar, lalu tekan **Sudah diubah**.
3. **Ada restock**: Transaksi, Masuk. Sinkron akan meminta angka marketplace dinaikkan.
4. **Selisih hitungan** (hilang, rusak, salah catat): Hitung Stok, atau Transaksi, Penyesuaian.
5. **Produk baru**: Produk, Tambah Produk, lalu Tambah Varian. Isi **Stok Fisik Sekarang** (cukup satu angka) dan, kalau berbeda, angka yang tertera di marketplace.

Kalau penjualan diinput melebihi stok yang tercatat, aplikasi bertanya dulu apakah tetap dicatat. Biasanya itu tanda ada restock yang belum dicatat.

## 4. Online dan multi-perangkat

- Data tersimpan online (Firebase). Buka dari HP, laptop, atau komputer lain dengan akun yang sama, hasilnya sama persis dan terbarui langsung.
- Dua orang boleh mencatat bersamaan. Setiap catatan adalah dokumen sendiri, jadi tidak saling menimpa. Dua penjualan bersamaan pada barang yang sama dua-duanya terhitung.
- **Tidak perlu unduh cadangan lagi.** Tidak ada pengingat cadangan. Di Pengaturan ada tombol *Unduh Salinan* (pemilik) kalau kamu ingin arsip pribadi.
- Kalau internet putus, aplikasi tetap terbuka dan catatan disimpan dulu di perangkat, lalu dikirim sendiri begitu online. Catatan yang dibuat saat offline baru terlihat di perangkat lain setelah terkirim.
- **Foto produk** ikut tersimpan online dan muncul di semua perangkat.
- Bisa diinstal seperti aplikasi: Pengaturan, Data & Akses, Instal Aplikasi. Di iPhone: Share, Tambah ke Layar Utama.

## 5. Pembukuan (khusus pemilik)

Menu Transaksi mencatat **pergerakan barang**, bukan uang yang diterima, karena harga jual di marketplace tidak sama dengan uang masuk (potongan platform, promo, ongkir). Pembukuan mencatat uang yang sebenarnya.

- **Uang Masuk** dicatat sebagai rekap satu periode per sumber (Toko, Shopee, TikTok Shop), misalnya "Shopee, 1 sampai 7 November, Rp2.500.000".
- **Uang Keluar** dicatat per tanggal dan dikelompokkan: Operasional, Ongkos Jahit, Ongkos Kirim, Belanja Bahan. Kelompok dan rinciannya bisa diubah di Pengaturan.
- Ada dua buku terpisah lain: **Dinda Personal Finance** dan **Retro Gaming Space Seririt**, masing-masing dengan kategori sendiri.
- Tokopedia sengaja tidak dilacak (keputusan bisnis).
- Akun karyawan **tidak bisa** membaca atau menulis pembukuan. Itu dijaga di server (`firestore.rules`), bukan hanya disembunyikan dari menu.

## 6. Akses karyawan

Hanya **dua akun** yang punya akses ke data: akun pemilik dan satu akun karyawan. Akun lain tidak bisa membuka data sama sekali, walau berhasil login atau mendaftar sendiri. Karyawan bisa mengelola stok, produk, dan transaksi. Pembukuan hanya terbuka untuk pemilik.

Menambah karyawan baru: buat akunnya di Firebase Console, Authentication, Users, salin UID-nya, lalu daftarkan di fungsi `staf()` pada `firestore.rules` dan deploy aturan. Sebaiknya pendaftaran mandiri juga dimatikan (Authentication, Settings, User actions, hilangkan centang *Enable create (sign-up)*).

## 7. Pemindahan dari versi lama (sekali saja, pemilik)

Pertama kali pemilik membuka aplikasi baru, muncul layar **Pindahkan data lama**.

- Data lama (produk, varian, transaksi, pembukuan, pengaturan) disalin ke sistem baru. Data lama **tidak diubah dan tidak dihapus**.
- Pemindahan hanya berjalan **sekali**, dan butuh internet: aplikasi memeriksa ke server dulu apakah sudah pernah dipindahkan dari perangkat lain.
- Selama pemindahan dan sesudahnya, **jangan pakai versi lama** untuk mencatat. Catatan yang masuk ke versi lama setelah pemindahan tidak ikut terbawa.
- Versi lama menyimpan stok terpisah per channel dan menjumlahkannya, sehingga stok fisik sebenarnya tidak bisa dihitung dari angka lama. Aplikasi **menebak** stok fisik dari channel terbesar, mencatat angka lama sebagai petunjuk, lalu mengarahkan ke **Hitung Stok** supaya kamu mengonfirmasi dengan barang yang ada.
- Angka di Shopee dan TikTok diisi dari angka lama masing-masing, jadi selisihnya langsung terlihat di Sinkron Marketplace.
- Foto produk yang dulu diunggah manual hanya tersimpan di satu perangkat dan tidak ikut pindah. Foto katalog asli (dari nama file) tetap muncul. Unggah ulang foto lainnya lewat Edit Info produk.

## 8. Tanya jawab

**Stok total di produk tidak sama dengan jumlah di Shopee plus TikTok. Salah?**
Tidak. Stok fisik itu satu angka. Angka Shopee dan TikTok hanya mencerminkan yang tertera di sana.

**Angka merah `5 → 4` itu apa?**
Di marketplace tertera 5, sedangkan stok fisik 4. Ubah di marketplace jadi 4, lalu tekan centang.

**Sengaja menaruh angka lebih kecil di marketplace (misal tahan stok)?**
Edit Varian, isi *Angka di Marketplace Saat Ini* dengan angka yang kamu pakai. Aplikasi akan tetap mengingatkan selama berbeda dari stok fisik.

**Salah catat transaksi?**
Klik barisnya di Transaksi, edit atau hapus. Stok dan angka marketplace dihitung ulang otomatis.
