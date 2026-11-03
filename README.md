# Senantiasa

Stok dan pembukuan brand [Senantiasa](https://www.instagram.com/senantiasa_/): produk yang dijual di Shopee, TikTok Shop, dan toko offline. Web app statis (tanpa build) di **Firebase Hosting** dengan data di **Firestore** dan login **Firebase Authentication**. Panduan untuk pengguna: [PANDUAN.md](PANDUAN.md). Riwayat perubahan: [CHANGELOG.md](CHANGELOG.md).

## Model stok

- **Stok fisik per varian = satu angka**: `stokAwal + Σ masuk − Σ keluar ± koreksi`. Penjualan di channel mana pun mengurangi angka yang sama.
- **Listing** per marketplace (Shopee, TikTok Shop) = angka yang tertera di marketplace, disimpan terpisah, tidak pernah dijumlahkan ke stok fisik. Penjualan lewat marketplace X menurunkan listing X otomatis (platform mengurangi sendiri).
- **Antrian sinkron** = varian yang listing-nya berbeda dari stok fisik (`stok.js`, `antrianSinkron`). Tombol "Sudah diubah" mencatat listing = stok fisik.
- Tiap transaksi adalah **satu dokumen Firestore** (event log). Stok dihitung dari log, jadi dua perangkat yang mencatat bersamaan tidak saling menimpa. Listing diubah dengan `increment()` yang atomik.

## Struktur

```
public/                      yang disajikan Firebase Hosting
  index.html
  assets/js/stok.js          logika stok murni (dipakai app dan diuji di Node)
  assets/js/migrasi.js       rencana pemindahan data sistem lama -> baru (murni)
  assets/js/penyimpanan.js   cerminan Firestore -> DATA, tulis transaksi/listing/produk, opname, migrasi
  assets/js/backend-lokal.js backend memori (uji + mode demo ?local)
  assets/js/firebase-init.js SDK Firebase, adaptor Firestore, login
  assets/js/auth.js          gerbang login dan alur mulai
  assets/js/data.js          konstanta, DATA, helper pembukuan dan klasifikasi
  assets/js/app.js           router dan halaman (Overview, Produk, Transaksi, Pembukuan, Laporan, Pengaturan)
  assets/js/halaman-stok.js  Sinkron Marketplace, Hitung Stok, layar migrasi
firestore.rules              aturan akses (pembukuan hanya pemilik)
tools/serve.mjs              server statis lokal
tools/rules-test.mjs         uji aturan lewat Rules test API (tanpa deploy)
test/                        uji logika stok, dua perangkat, migrasi
```

Koleksi Firestore: `produk`, `transaksi`, `listing`, `foto`, `pengaturan/umum`, `meta/{migrasi,opname}`, dan khusus pemilik `pembukuan`, `keuangan/pengaturan`. Dokumen sistem lama `toko/{ownerUid}` hanya dibaca sekali saat migrasi dan tidak pernah diubah.

## Jalankan lokal

```bash
npm start
```

Buka `http://localhost:3100/?local` untuk **mode demo** (data di memori + localStorage, tanpa login, tanpa menyentuh Firebase). Parameter tambahan: `&reset` mengulang dari awal, `&staf` melihat tampilan karyawan, `&lama` mencoba layar pemindahan data lama dengan contoh data. Mode demo hanya aktif di localhost.

## Uji

```bash
npm test             # logika stok, dua perangkat bersamaan, migrasi (Node, tanpa jaringan)
npm run test:rules   # firestore.rules lewat Rules test API (butuh firebase login, tidak menyentuh data)
```

## Deploy

```bash
firebase deploy --only firestore:rules,hosting
```

Project: `senantiasa-5598a`. Setelah deploy dan pemindahan data selesai, ganti aturan `toko/{uid}` di `firestore.rules` menjadi `write: if false`, lalu deploy aturan lagi. Alamat lama di GitHub Pages hanya berisi pengalih ke Firebase Hosting.

## Catatan keamanan

- `firebaseConfig` di `firebase-init.js` memang publik. Keamanan datang dari login dan `firestore.rules`.
- Hanya dua uid (pemilik dan satu karyawan) yang bisa membaca data; akun lain ditolak di `firestore.rules`. Menambah karyawan: daftarkan uid di fungsi `staf()`. Sebaiknya matikan juga pendaftaran mandiri di Firebase Authentication (Settings, User actions).
- Pemindahan data lama dijaga agar hanya jalan sekali: penanda `meta/migrasi` dicek langsung ke server (bukan cache) sebelum menulis.
- Foto disimpan sebagai JPEG kecil (maks 480px) di dokumen `foto/{produkId}` karena Firebase Storage tidak dipakai (paket gratis).
