// ============================================================
// FIREBASE: login (Authentication) + data online (Firestore)
// ============================================================
// File ini SATU-SATUNYA yg pakai ES module (SDK Firebase hanya tersedia dlm bentuk itu); file JS
// lain tetap <script> klasik tanpa build. Yg dibutuhkan file lain diekspos lewat `window.*`:
//   window.firebaseAuth / window.firebaseSignIn   (dipakai auth.js, data.js)
//   window.__backendFirestore                     (dipakai penyimpanan.js lewat BACKEND, lihat auth.js)
// Lalu event "firebase-siap" dikirim. Di mode demo (?local di localhost) SDK TIDAK dimuat sama
// sekali -- backend-lokal.js yg memasang pengganti di memori.
//
// firebaseConfig di bawah BUKAN rahasia (Firebase memang membuatnya publik); keamanan datang dari
// login + firestore.rules.
if (window.MODE_LOKAL) {
  window.dispatchEvent(new Event('firebase-siap'));
} else {
  const V = '12.19.0';
  const base = `https://www.gstatic.com/firebasejs/${V}/`;
  const [{ initializeApp }, A, F] = await Promise.all([
    import(base + 'firebase-app.js'), import(base + 'firebase-auth.js'), import(base + 'firebase-firestore.js')
  ]);

  const firebaseConfig = {
    apiKey: "AIzaSyCvt5Jz0VNTqF-jPn6cblAMELXndbF7SQ8",
    authDomain: "senantiasa-5598a.firebaseapp.com",
    projectId: "senantiasa-5598a",
    storageBucket: "senantiasa-5598a.firebasestorage.app",
    messagingSenderId: "262254971400",
    appId: "1:262254971400:web:3da62d3a154216a0e55fbd"
  };

  const fbApp = initializeApp(firebaseConfig);
  const auth = A.getAuth(fbApp);
  // Cache lokal permanen (multi-tab): tulisan saat offline disimpan di perangkat lalu dikirim
  // otomatis begitu online, dan buka-ulang aplikasi hanya mengunduh perubahan, bukan semuanya.
  const db = F.initializeFirestore(fbApp, {
    localCache: F.persistentLocalCache({ tabManager: F.persistentMultipleTabManager() })
  });

  window.firebaseAuth = {
    onAuthStateChanged: (cb) => A.onAuthStateChanged(auth, cb),
    signOut: () => A.signOut(auth),
    currentUser: () => auth.currentUser
  };
  window.firebaseSignIn = (email, password) => A.signInWithEmailAndPassword(auth, email, password);

  const BATCH_MAKS = 400;
  window.__backendFirestore = {
    dengar(k, cb, errCb) {
      return F.onSnapshot(F.collection(db, k),
        (snap) => cb(snap.docs.map(d => ({ id: d.id, data: d.data() })), { lokal: snap.metadata.hasPendingWrites }),
        errCb);
    },
    async tulis(ops) {
      for (let i = 0; i < ops.length; i += BATCH_MAKS) {
        const batch = F.writeBatch(db);
        for (const o of ops.slice(i, i + BATCH_MAKS)) {
          const ref = F.doc(db, o.k, o.id);
          if (o.t === 'set') batch.set(ref, o.data);
          else if (o.t === 'gabung') batch.set(ref, o.data, { merge: true });
          else if (o.t === 'hapus') batch.delete(ref);
          else if (o.t === 'tambah') batch.set(ref, { ...(o.extra || {}), [o.field]: F.increment(o.by) }, { merge: true });
        }
        await batch.commit();
      }
    },
    async dokumen(path) {
      const snap = await F.getDoc(F.doc(db, path));
      return snap.exists() ? snap.data() : null;
    }
  };

  window.dispatchEvent(new Event('firebase-siap'));
}
