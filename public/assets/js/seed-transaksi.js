// Data dummy riwayat transaksi (~35 hari terakhir) utk 7 produk asli di seed-produk.js --
// TIDAK menambah jenis/nama produk baru, hanya mengarang jumlah stok masuk/keluar/koreksi,
// channel, dan tanggalnya supaya aplikasi bisa langsung dicoba dengan data yang terasa hidup
// (grafik, laporan, stok per channel, dsb tidak kosong). Ganti/hapus lewat menu Transaksi
// begitu siap diisi data asli.
//
// "hariLalu" dihitung relatif terhadap tanggal aplikasi dibuka pertama kali (bukan tanggal
// tetap), supaya datanya selalu terasa "baru-baru ini" kapan pun folder ini pertama dibuka.
// namaProduk harus PERSIS sama dengan salah satu "nama" di SEED_PRODUK -- dicocokkan otomatis
// di data.js saat pertama kali mengisi data (lihat dataAwalDenganKatalog).

const SEED_TRANSAKSI = [
  // -- Sandat Kebaya Bordir Pendek --
  { hariLalu: 32, tipe: 'masuk', namaProduk: 'Sandat Kebaya Bordir Pendek', channel: 'Toko', qty: 5, catatan: 'Restock awal dari konveksi' },
  { hariLalu: 30, tipe: 'masuk', namaProduk: 'Sandat Kebaya Bordir Pendek', channel: 'Shopee', qty: 6 },
  { hariLalu: 25, tipe: 'keluar', namaProduk: 'Sandat Kebaya Bordir Pendek', channel: 'Shopee', qty: 2, hargaSatuan: 235000 },
  { hariLalu: 10, tipe: 'keluar', namaProduk: 'Sandat Kebaya Bordir Pendek', channel: 'Toko', qty: 1, hargaSatuan: 235000 },
  { hariLalu: 5, tipe: 'koreksi', namaProduk: 'Sandat Kebaya Bordir Pendek', channel: 'Shopee', qty: -1, catatan: 'Cacat jahitan, tidak dijual' },

  // -- Semilir Kebaya Bordir Outer --
  { hariLalu: 34, tipe: 'masuk', namaProduk: 'Semilir Kebaya Bordir Outer', channel: 'Toko', qty: 8 },
  { hariLalu: 33, tipe: 'masuk', namaProduk: 'Semilir Kebaya Bordir Outer', channel: 'Shopee', qty: 10 },
  { hariLalu: 20, tipe: 'masuk', namaProduk: 'Semilir Kebaya Bordir Outer', channel: 'TikTok Shop', qty: 2 },
  { hariLalu: 28, tipe: 'keluar', namaProduk: 'Semilir Kebaya Bordir Outer', channel: 'Shopee', qty: 3, hargaSatuan: 220000 },
  { hariLalu: 14, tipe: 'keluar', namaProduk: 'Semilir Kebaya Bordir Outer', channel: 'Shopee', qty: 2, hargaSatuan: 220000 },
  { hariLalu: 2, tipe: 'keluar', namaProduk: 'Semilir Kebaya Bordir Outer', channel: 'TikTok Shop', qty: 1, hargaSatuan: 235000 },

  // -- Rintik Halter Top Batik --
  { hariLalu: 29, tipe: 'masuk', namaProduk: 'Rintik Halter Top Batik', channel: 'Toko', qty: 4 },
  { hariLalu: 27, tipe: 'masuk', namaProduk: 'Rintik Halter Top Batik', channel: 'Shopee', qty: 3 },
  { hariLalu: 20, tipe: 'keluar', namaProduk: 'Rintik Halter Top Batik', channel: 'Shopee', qty: 1, hargaSatuan: 200000 },

  // -- Sarwa Skort (Kian Setala) --
  { hariLalu: 26, tipe: 'masuk', namaProduk: 'Sarwa Skort (Kian Setala)', channel: 'Toko', qty: 3 },
  { hariLalu: 15, tipe: 'masuk', namaProduk: 'Sarwa Skort (Kian Setala)', channel: 'Shopee', qty: 4 },
  { hariLalu: 9, tipe: 'koreksi', namaProduk: 'Sarwa Skort (Kian Setala)', channel: 'Toko', qty: -1, catatan: 'Salah hitung saat stok opname' },

  // -- Setala Top (Mini Top Tali Bralette) --
  { hariLalu: 33, tipe: 'masuk', namaProduk: 'Setala Top (Mini Top Tali Bralette)', channel: 'Shopee', qty: 9 },
  { hariLalu: 30, tipe: 'masuk', namaProduk: 'Setala Top (Mini Top Tali Bralette)', channel: 'Toko', qty: 6 },
  { hariLalu: 24, tipe: 'keluar', namaProduk: 'Setala Top (Mini Top Tali Bralette)', channel: 'Shopee', qty: 4, hargaSatuan: 100000 },
  { hariLalu: 17, tipe: 'keluar', namaProduk: 'Setala Top (Mini Top Tali Bralette)', channel: 'Shopee', qty: 2, hargaSatuan: 100000 },
  { hariLalu: 11, tipe: 'keluar', namaProduk: 'Setala Top (Mini Top Tali Bralette)', channel: 'Toko', qty: 1, hargaSatuan: 100000 },
  { hariLalu: 4, tipe: 'masuk', namaProduk: 'Setala Top (Mini Top Tali Bralette)', channel: 'TikTok Shop', qty: 3, catatan: 'Restock TikTok Shop' },

  // -- Citta Skirt (Rok Mermaid Panjang) --
  { hariLalu: 28, tipe: 'masuk', namaProduk: 'Citta Skirt (Rok Mermaid Panjang)', channel: 'Shopee', qty: 5 },
  { hariLalu: 26, tipe: 'masuk', namaProduk: 'Citta Skirt (Rok Mermaid Panjang)', channel: 'Toko', qty: 4 },
  { hariLalu: 19, tipe: 'keluar', namaProduk: 'Citta Skirt (Rok Mermaid Panjang)', channel: 'Shopee', qty: 2, hargaSatuan: 250000 },
  { hariLalu: 8, tipe: 'keluar', namaProduk: 'Citta Skirt (Rok Mermaid Panjang)', channel: 'Toko', qty: 1, hargaSatuan: 250000 },

  // -- Lily Top (Lace Top Coquette Style) --
  { hariLalu: 30, tipe: 'masuk', namaProduk: 'Lily Top (Lace Top Coquette Style)', channel: 'Shopee', qty: 4 },
  { hariLalu: 27, tipe: 'masuk', namaProduk: 'Lily Top (Lace Top Coquette Style)', channel: 'Toko', qty: 3 },
  { hariLalu: 16, tipe: 'keluar', namaProduk: 'Lily Top (Lace Top Coquette Style)', channel: 'Shopee', qty: 1, hargaSatuan: 200000 },
  { hariLalu: 6, tipe: 'koreksi', namaProduk: 'Lily Top (Lace Top Coquette Style)', channel: 'Shopee', qty: -1, catatan: 'Retur pembeli, warna pudar' }
];
