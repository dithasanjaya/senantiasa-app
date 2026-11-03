// Uji "kering" memakai bentuk data sistem lama yang SESUNGGUHNYA: kode lama (dataAwalDenganKatalog)
// membangun data awal dari katalog + transaksi contoh, lalu dipindahkan dengan rencanaMigrasi.
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { rencanaMigrasi } = require('../public/assets/js/migrasi.js');

const lamaDir = new URL('../_lama/', import.meta.url);
const ada = fs.existsSync(new URL('data-lama.js', lamaDir));

test('data awal sistem lama (katalog + transaksi contoh) dipindahkan utuh dan sesuai aturan server', { skip: !ada && 'salinan kode lama tidak ada' }, () => {
  const ctx = { console, localStorage: { getItem: () => null, setItem() {} }, window: {}, tampilkanToast() {} };
  ctx.globalThis = ctx; vm.createContext(ctx);
  const J = new URL('../public/assets/js/', import.meta.url);
  vm.runInContext(fs.readFileSync(new URL('data-lama.js', lamaDir), 'utf8'), ctx);
  vm.runInContext(fs.readFileSync(new URL('seed-produk.js', J), 'utf8') + '\n' + fs.readFileSync(new URL('seed-transaksi.js', J), 'utf8'), ctx);
  const lama = JSON.parse(vm.runInContext('JSON.stringify(dataAwalDenganKatalog())', ctx));
  assert.ok(lama.produk.length >= 7 && lama.transaksi.length > 20);

  const { docs, meta } = rencanaMigrasi(lama, '2026-11-03T00:00:00Z');
  const per = (k) => docs.filter(d => d.k === k);
  assert.equal(per('produk').length, lama.produk.length);
  assert.equal(per('transaksi').length, lama.transaksi.length);
  assert.equal(meta.jumlah.varian, per('listing').length);
  // tak ada nilai undefined/NaN, id unik per koleksi, dan memenuhi aturan transaksi di firestore.rules
  const dump = JSON.stringify(docs);
  assert.ok(!/NaN|undefined/.test(dump));
  for (const k of ['produk', 'transaksi', 'listing', 'pembukuan']) assert.equal(new Set(per(k).map(d => d.id)).size, per(k).length, k);
  for (const { data: t } of per('transaksi')) {
    assert.ok(['masuk', 'keluar', 'koreksi'].includes(t.tipe));
    assert.ok(typeof t.qty === 'number' && (t.tipe === 'koreksi' || t.qty > 0));
    assert.ok(typeof t.varianId === 'string' && typeof t.produkId === 'string');
  }
  // stok hasil = tebakan di setiap varian, dan tidak pernah lebih besar dari angka channel terbesar
  const efek = (t) => t.tipe === 'masuk' ? t.qty : t.tipe === 'keluar' ? -t.qty : t.qty;
  for (const { data: p } of per('produk')) for (const v of p.varian) {
    const stok = v.stokAwal + per('transaksi').filter(d => d.data.varianId === v.id).reduce((a, d) => a + efek(d.data), 0);
    assert.equal(stok, meta.legacy[v.id].tebakan);
    assert.ok(stok <= Math.max(meta.legacy[v.id].Toko, meta.legacy[v.id].Shopee, meta.legacy[v.id]['TikTok Shop']) || stok === 0);
  }
  // ukuran dokumen jauh di bawah batas 1MB
  assert.ok(Math.max(...docs.map(d => JSON.stringify(d.data).length)) < 100000);
  console.log(`  ${lama.produk.length} produk, ${meta.jumlah.varian} varian, ${lama.transaksi.length} transaksi dipindahkan; total lama ${Object.values(meta.legacy).reduce((a, x) => a + x.totalLama, 0)} -> tebakan fisik ${Object.values(meta.legacy).reduce((a, x) => a + x.tebakan, 0)}`);
});
