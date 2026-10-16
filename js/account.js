// 계정(Google 로그인)과 도감 동기화
// FIREBASE_CONFIG가 비어 있으면 아무것도 하지 않고, 게임은 이 브라우저에만 기록합니다.
// 로그인하면 이 브라우저의 기록과 계정의 기록을 합쳐서 양쪽에 저장합니다.

const FIREBASE_SDK_VERSION = '10.12.2';

const Account = {
  enabled: false,   // 설정이 있고 Firebase가 준비됐는지
  user: null,       // { uid, name, email }
  status: 'off',    // off | loading | guest | syncing | synced | error
  listeners: [],
};

function onAccountChange(fn) { Account.listeners.push(fn); }
function notifyAccount() { Account.listeners.forEach((fn) => fn()); }
function setAccountStatus(status) { Account.status = status; notifyAccount(); }

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src;
    s.onload = resolve;
    s.onerror = () => reject(new Error(`스크립트를 불러오지 못했습니다: ${src}`));
    document.head.appendChild(s);
  });
}

async function initAccount() {
  if (!FIREBASE_CONFIG) return;
  setAccountStatus('loading');
  try {
    if (!window.firebase) {
      const base = `https://www.gstatic.com/firebasejs/${FIREBASE_SDK_VERSION}/`;
      await loadScript(`${base}firebase-app-compat.js`);
      await loadScript(`${base}firebase-auth-compat.js`);
      await loadScript(`${base}firebase-firestore-compat.js`);
    }
    if (!firebase.apps.length) firebase.initializeApp(FIREBASE_CONFIG);
    Account.enabled = true;
    setAccountStatus('guest');
    firebase.auth().onAuthStateChanged((u) => {
      Account.user = u ? { uid: u.uid, name: u.displayName || '', email: u.email || '' } : null;
      if (u) syncRecords();
      else setAccountStatus('guest');
    });
  } catch (err) {
    console.warn('[account] Firebase 초기화 실패:', err);
    Account.enabled = false;
    setAccountStatus('error');
  }
}

function playerDoc() {
  return firebase.firestore().collection('players').doc(Account.user.uid);
}

// 계정 기록과 이 브라우저 기록을 합쳐 양쪽에 저장합니다. (여러 기기가 동시에 저장해도 빠지지 않게 트랜잭션 사용)
async function syncRecords() {
  if (!Account.enabled || !Account.user) return;
  setAccountStatus('syncing');
  try {
    let merged = null;
    await firebase.firestore().runTransaction(async (tx) => {
      const ref = playerDoc();
      const snap = await tx.get(ref);
      const cloud = snap.exists ? normalizeRecords(snap.data().records) : emptyRecords();
      merged = mergeRecords(loadRecords(), cloud);
      tx.set(ref, { records: merged, updatedAt: firebase.firestore.FieldValue.serverTimestamp() });
    });
    saveRecords(merged);
    setAccountStatus('synced');
  } catch (err) {
    console.warn('[account] 동기화 실패:', err);
    setAccountStatus('error');
    return;
  }
  uploadDetails();
}

// ---------- 인생 보관소 (players/{uid}/lives/{인생 id}) ----------
// 전체 기록은 크기가 커서 도감 문서에 넣지 않고 인생마다 문서 하나씩 저장합니다.

function lifeDoc(id) { return playerDoc().collection('lives').doc(id); }

// 이 브라우저에만 있는 전체 기록을 계정에 올립니다.
async function uploadDetails() {
  if (!Account.enabled || !Account.user) return;
  const a = loadArchive();
  const pending = Object.values(a.lives).filter((d) => !d.up);
  if (!pending.length) return;
  try {
    const batch = firebase.firestore().batch();
    pending.forEach((d) => {
      const { up, ...detail } = d;
      batch.set(lifeDoc(d.id), { detail: JSON.parse(JSON.stringify(detail)), at: d.at });
    });
    await batch.commit();
    const fresh = loadArchive();
    pending.forEach((d) => { if (fresh.lives[d.id]) fresh.lives[d.id].up = true; });
    saveArchive(fresh);
  } catch (err) {
    console.warn('[account] 보관소 저장 실패:', err.code || err);
  }
}

// 이 브라우저에 없는 인생의 전체 기록을 계정에서 불러옵니다. 없으면 null
async function fetchDetail(id) {
  if (!Account.enabled || !Account.user) return null;
  try {
    const snap = await lifeDoc(id).get();
    if (!snap.exists) return null;
    const detail = { ...snap.data().detail, up: true };
    putDetail(detail);
    return detail;
  } catch (err) {
    console.warn('[account] 보관소 불러오기 실패:', err.code || err);
    return null;
  }
}

// 결과: 'ok' | 'cancelled' | 'blocked' | 'error'
async function signIn() {
  if (!Account.enabled) return 'error';
  try {
    await firebase.auth().signInWithPopup(new firebase.auth.GoogleAuthProvider());
    return 'ok';
  } catch (err) {
    if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') return 'cancelled';
    if (err.code === 'auth/popup-blocked') return 'blocked';
    console.warn('[account] 로그인 실패:', err.code, err.message);
    return 'error';
  }
}

// 로그아웃하면 이 브라우저의 기록과 보관소는 지웁니다. (계정에는 그대로 남아 있고, 다시 로그인하면 돌아옵니다)
async function signOut() {
  if (!Account.enabled) return;
  await firebase.auth().signOut();
  saveRecords(emptyRecords());
  clearArchive();
}
