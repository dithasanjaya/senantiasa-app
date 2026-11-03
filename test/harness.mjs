// Memuat file-file app (script klasik) ke sebuah "perangkat" virtual (vm) dgn backend bersama.
import vm from 'node:vm';
import fs from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const JS = new URL('../public/assets/js/', import.meta.url);
const { buatBackendMemori, isiDemo } = require('../public/assets/js/backend-lokal.js');
export { buatBackendMemori, isiDemo };

export const OWNER_UID = 'I6owACv9yJZQndKJK2Aq7aSqagh2';

export function buatPerangkat(backend, { uid = OWNER_UID, email = 'pemilik@test' } = {}) {
  const toasts = [];
  const ctx = {
    console, setTimeout, clearTimeout, Promise, JSON, Math, Date, Map, Set, Array, Object, Number, String, Error,
    tampilkanToast: (p, j) => toasts.push({ p, j }),
    tanggalHariIni: () => new Date().toISOString().slice(0, 10),
  };
  ctx.window = ctx; ctx.self = ctx; ctx.globalThis = ctx;
  ctx.firebaseAuth = { currentUser: () => ({ uid, email }) };
  vm.createContext(ctx);
  for (const f of ['data.js', 'stok.js', 'migrasi.js', 'penyimpanan.js']) {
    vm.runInContext(fs.readFileSync(new URL(f, JS), 'utf8'), ctx, { filename: f });
  }
  ctx.__backend = backend;
  vm.runInContext('BACKEND = __backend', ctx);
  const api = (kode) => vm.runInContext(kode, ctx);
  return { ctx, api, toasts, mulai: () => api('mulaiSinkron()'), tunggu: () => new Promise(r => setTimeout(r, 15)) };
}
