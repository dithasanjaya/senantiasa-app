// Katalog awal, disusun dari screenshot toko Tokopedia & Shopee Senantiasa yang nyata
// (Tokopedia.png, Shopee.png -- lihat folder proyek). Ini BUKAN katalog lengkap: toko
// Shopee-nya sendiri menunjukkan 111 produk total, sementara screenshot yang ada baru
// menangkap sebagian (halaman utama/beranda toko, bukan daftar produk lengkap).
//
// STOK: stokAwal semua varian di bawah sengaja 0 -- stok & riwayatnya sepenuhnya berasal
// dari data dummy transaksi di seed-transaksi.js (masuk/keluar/koreksi per channel), supaya
// "Stok Total" yang tampil punya jejak transaksi yg bisa ditelusuri, bukan angka ajaib.
// Jumlah stok & harga modal di data dummy ini DIKARANG demi keperluan uji coba/demo --
// wajib diisi ulang dengan angka asli sebelum dipakai sungguhan (menu Produk -> Kelola).
//
// HARGA: harga jual umum & harga per-channel (field hargaChannel) yg sudah terisi memakai
// angka yg BENAR-BENAR terlihat di screenshot toko asli (dicatat di "catatan" tiap produk).
//
// Ukuran/warna juga belum bisa dipastikan dari thumbnail toko, jadi tiap produk baru diisi
// satu varian placeholder ("-") -- silakan pecah jadi varian asli (S/M/L, warna, dst) sendiri.

const SEED_PRODUK = [
  {
    nama: 'Sandat Kebaya Bordir Pendek',
    kategori: 'Kebaya',
    catatan: 'Terlihat di Tokopedia (promo ~Rp170.000, rating 4.4, 40+ terjual) & Shopee (Rp235.000, rating 5.0, 208 terjual). Ukuran/warna asli belum diverifikasi.',
    foto: null,
    stokMinim: 3,
    varian: [{ ukuran: '-', warna: '-', stokAwal: 0, hargaModal: 110000, hargaJual: 235000, hargaChannel: {} }]
  },
  {
    nama: 'Semilir Kebaya Bordir Outer',
    kategori: 'Kebaya',
    catatan: 'Terlihat di Tokopedia dalam 2 varian (Reguler & Tangan Panjang, promo ~Rp205.000, 60-250+ terjual) & Shopee sebagai "Sutra Crepe XL" (Rp220.000, 2rb+ terjual). Kemungkinan besar satu lini produk dengan beberapa pilihan lengan/bahan/ukuran -- perlu dicek ulang & dipecah jadi varian asli.',
    foto: null,
    stokMinim: 3,
    varian: [{ ukuran: '-', warna: '-', stokAwal: 0, hargaModal: 115000, hargaJual: 235000, hargaChannel: { Shopee: 220000 } }]
  },
  {
    nama: 'Rintik Halter Top Batik',
    kategori: 'Top',
    catatan: 'Bahan rayon katun. Terlihat di Tokopedia (promo ~Rp170.000) & Shopee (Rp200.000, 23 terjual).',
    foto: null,
    stokMinim: 3,
    varian: [{ ukuran: '-', warna: '-', stokAwal: 0, hargaModal: 90000, hargaJual: 200000, hargaChannel: {} }]
  },
  {
    nama: 'Sarwa Skort (Kian Setala)',
    kategori: 'Rok',
    koleksi: 'Setala',
    catatan: 'Terlihat di Tokopedia, harga normal Rp200.000 (promo ~Rp170.000). Bagian dari koleksi "Kian Setala".',
    foto: null,
    stokMinim: 3,
    varian: [{ ukuran: '-', warna: '-', stokAwal: 0, hargaModal: 85000, hargaJual: 200000, hargaChannel: {} }]
  },
  {
    nama: 'Setala Top (Mini Top Tali Bralette)',
    kategori: 'Top',
    koleksi: 'Setala',
    catatan: 'Atasan saja dari koleksi "Kian Setala". Terlihat di Shopee, Rp100.000, rating 4.9, 1rb+ terjual.',
    foto: null,
    stokMinim: 3,
    varian: [{ ukuran: '-', warna: '-', stokAwal: 0, hargaModal: 45000, hargaJual: 100000 }]
  },
  {
    nama: 'Citta Skirt (Rok Mermaid Panjang)',
    kategori: 'Rok',
    catatan: 'Terlihat di Shopee, Rp250.000, rating 5.0, 145 terjual.',
    foto: null,
    stokMinim: 3,
    varian: [{ ukuran: '-', warna: '-', stokAwal: 0, hargaModal: 120000, hargaJual: 250000 }]
  },
  {
    nama: 'Lily Top (Lace Top Coquette Style)',
    kategori: 'Top',
    catatan: 'Terlihat di Shopee, Rp200.000, rating 5.0, 73 terjual.',
    foto: null,
    stokMinim: 3,
    varian: [{ ukuran: '-', warna: '-', stokAwal: 0, hargaModal: 90000, hargaJual: 200000 }]
  }
];
