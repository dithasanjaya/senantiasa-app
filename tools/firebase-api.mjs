// Akses API Google/Firebase proyek senantiasa-5598a memakai login Firebase CLI di komputer ini (token hanya di memori).
// Dipakai tools/rules-test.mjs. Butuh firebase-tools terpasang global dan sudah "firebase login".
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const fbAuth = require(require('node:path').join(require('node:child_process').execSync('npm root -g').toString().trim(), 'firebase-tools/lib/auth.js'));

export const PROJECT = 'senantiasa-5598a';
let tok = null, exp = 0;
async function token() {
  if (tok && Date.now() < exp) return tok;
  const acc = fbAuth.getGlobalDefaultAccount();
  if (!acc?.tokens?.refresh_token) throw new Error('Firebase CLI belum login');
  tok = (await fbAuth.getAccessToken(acc.tokens.refresh_token, [])).access_token;
  exp = Date.now() + 40 * 60000;
  return tok;
}
export async function api(url, { method = 'GET', body } = {}) {
  for (let i = 0; i < 5; i++) {
    const res = await fetch(url, { method, headers: { Authorization: `Bearer ${await token()}`, 'Content-Type': 'application/json', 'x-goog-user-project': PROJECT }, body: body ? JSON.stringify(body) : undefined });
    if (res.status === 429 || res.status >= 500) { await new Promise((r) => setTimeout(r, 2000 * (i + 1))); continue; }
    const txt = await res.text();
    if (!res.ok) throw new Error(`${method} ${url} -> ${res.status} ${txt.slice(0, 600)}`);
    return txt ? JSON.parse(txt) : {};
  }
  throw new Error('terlalu banyak percobaan ulang');
}
