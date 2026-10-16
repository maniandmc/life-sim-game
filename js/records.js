// 도감 기록: 끝낸 인생마다 한 줄씩 남기고, 도감 숫자(살아 본 인생, 최고 점수, 사망 원인 등)는 그 기록에서 계산합니다.
// 기록마다 고유 id가 있어서, 여러 기기의 기록을 몇 번 합쳐도 같은 인생이 두 번 세어지지 않습니다.

const RECORDS_KEY = 'life-sim-records-v2';
const OLD_DEX_KEY = 'life-sim-dex-v1';  // 숫자만 저장하던 이전 형식
const RECORDS_MAX = 3000;               // 계정 문서 크기 제한(1MB) 안쪽으로 유지

// ---------- 브라우저 저장소 (실패해도 게임은 계속) ----------

function storageGet(key) {
  try { return JSON.parse(localStorage.getItem(key)); } catch (e) { return null; }
}
function storageSet(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* 저장 불가 환경 */ }
}
function storageDel(key) {
  try { localStorage.removeItem(key); } catch (e) { /* 저장 불가 환경 */ }
}

// ---------- 기록 ----------

function emptyRecords() { return { v: 2, lives: [], legacy: [] }; }

function makeId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 10); }

function normalizeRecords(r) {
  return {
    v: 2,
    lives: Array.isArray(r && r.lives) ? r.lives.filter((l) => l && l.id) : [],
    legacy: Array.isArray(r && r.legacy) ? r.legacy.filter((g) => g && g.id) : [],
  };
}

function loadRecords() {
  const saved = storageGet(RECORDS_KEY);
  if (saved && saved.v === 2) return normalizeRecords(saved);

  // 이전 형식 도감은 숫자 묶음 하나(legacy)로 옮겨 옵니다.
  const rec = emptyRecords();
  const old = storageGet(OLD_DEX_KEY);
  if (old && old.lives) {
    rec.legacy.push({
      id: `legacy-${makeId()}`, lives: old.lives, best: old.best || 0,
      deaths: old.deaths || {}, titles: old.titles || {}, last: old.last || null,
    });
  }
  saveRecords(rec);
  storageDel(OLD_DEX_KEY);
  return rec;
}

function saveRecords(rec) { storageSet(RECORDS_KEY, rec); }

function addLifeRecord(rec, summary) {
  rec.lives.push({ id: makeId(), at: Date.now(), ...summary });
  if (rec.lives.length > RECORDS_MAX) rec.lives = rec.lives.slice(-RECORDS_MAX);
  return rec;
}

// 두 기록을 합칩니다. 같은 id는 한 번만 남기므로 몇 번을 합쳐도 결과가 같습니다.
function mergeRecords(a, b) {
  const byId = (list) => new Map(list.map((x) => [x.id, x]));
  const lives = byId(a.lives);
  for (const l of b.lives) if (!lives.has(l.id)) lives.set(l.id, l);
  const legacy = byId(a.legacy);
  for (const g of b.legacy) if (!legacy.has(g.id)) legacy.set(g.id, g);
  const merged = {
    v: 2,
    lives: [...lives.values()].sort((x, y) => x.at - y.at).slice(-RECORDS_MAX),
    legacy: [...legacy.values()],
  };
  return JSON.parse(JSON.stringify(merged)); // undefined 값 제거 (클라우드 저장용)
}

function recordStats(rec) {
  const st = { lives: 0, best: 0, deaths: {}, titles: {}, last: null };
  const add = (map, key, n) => { if (key) map[key] = (map[key] || 0) + n; };
  for (const g of rec.legacy) {
    st.lives += g.lives || 0;
    st.best = Math.max(st.best, g.best || 0);
    for (const k in g.deaths) add(st.deaths, k, g.deaths[k]);
    for (const k in g.titles) add(st.titles, k, g.titles[k]);
    if (g.last && !st.last) st.last = g.last;
  }
  for (const l of rec.lives) {
    st.lives += 1;
    st.best = Math.max(st.best, l.total || 0);
    add(st.deaths, l.cause, 1);
    add(st.titles, l.titleId, 1);
  }
  if (rec.lives.length) st.last = rec.lives.reduce((a, l) => (l.at > a.at ? l : a));
  return st;
}

// ---------- 인생 보관소: 끝낸 인생의 전체 기록(비석, 점수, 그래프, 연표, 그림 프롬프트) ----------
// 도감 기록(한 줄 요약)과 따로 둡니다. 크기가 커서(한 판에 10KB 안팎) 이 브라우저에는 최근 것만 남기고,
// 로그인하면 계정에도 한 판씩 따로 저장해 두었다가 필요할 때 불러옵니다.

const ARCHIVE_KEY = 'life-sim-archive-v1';
const ARCHIVE_MAX = 100; // 이 브라우저에 남길 최근 인생 수

function loadArchive() {
  const a = storageGet(ARCHIVE_KEY);
  return a && a.v === 1 && a.lives && typeof a.lives === 'object' ? a : { v: 1, lives: {} };
}

// 저장 공간이 모자라면 오래된 인생부터 덜어 내며 다시 시도합니다.
function saveArchive(a) {
  const ids = Object.keys(a.lives).sort((x, y) => a.lives[y].at - a.lives[x].at);
  let keep = Math.min(ids.length, ARCHIVE_MAX);
  while (true) {
    const lives = {};
    ids.slice(0, keep).forEach((id) => { lives[id] = a.lives[id]; });
    try {
      localStorage.setItem(ARCHIVE_KEY, JSON.stringify({ v: 1, lives }));
      a.lives = lives;
      return true;
    } catch (e) {
      if (keep <= 1) return false;
      keep = Math.floor(keep / 2);
    }
  }
}

function getDetail(id) { return loadArchive().lives[id] || null; }

function putDetail(detail) {
  const a = loadArchive();
  a.lives[detail.id] = detail;
  saveArchive(a);
}

function clearArchive() { storageDel(ARCHIVE_KEY); }
