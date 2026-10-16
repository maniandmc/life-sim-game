// 화면(UI)을 담당하는 파일입니다. 게임 규칙은 engine.js, 내용은 data 폴더에 있습니다.

const SAVE_KEY = 'life-sim-save-v1';
const SIGNUP_LATER_KEY = 'life-sim-signup-later'; // "나중에"를 누른 시점의 인생 수
const SIGNUP_ASK_AGAIN = 5;                        // "나중에" 후 몇 판 뒤에 다시 권할지
const AUTO_DELAY = 550; // 자동 진행 간격(ms)
const $ = (id) => document.getElementById(id);
const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let life = null;        // 지금 살고 있는 인생
let openEv = null;      // 열려 있는 사건
let autoOn = false;     // 자동 진행 중인지
let autoTimer = null;
let renderedLogs = 0;
let lastResult = null;
let lastShown = null;   // 직전에 화면에 보여 준 능력치 (변화량 표시용)
let endView = null;     // 결과 화면에 보여 주는 인생 기록 (방금 끝낸 인생 또는 보관소에서 연 인생)

const STAGES = [
  { name: '유년기', from: 0, to: 12 },
  { name: '청소년기', from: 13, to: 19 },
  { name: '청년기', from: 20, to: 39 },
  { name: '중년기', from: 40, to: 64 },
  { name: '노년기', from: 65, to: 100 },
];
function stageOf(age) { return STAGES.find((st) => age <= st.to) || STAGES[STAGES.length - 1]; }

// ---------- 저장 (진행 중인 인생은 이 브라우저에, 도감은 records.js) ----------

function save() { if (life && life.alive) storageSet(SAVE_KEY, life); }

// ---------- 공통 ----------

function esc(text) {
  return String(text).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

function show(name) {
  for (const id of ['start', 'birth', 'play', 'end', 'archive']) $(`screen-${id}`).hidden = id !== name;
  window.scrollTo(0, 0);
}

// 터치 기기(특히 iOS)에서는 코드로 포커스를 옮기면 페이지가 엉뚱하게 스크롤될 수 있어
// 키보드로 조작할 때만 포커스를 옮깁니다.
let usingKeyboard = false;
document.addEventListener('keydown', () => { usingKeyboard = true; }, true);
document.addEventListener('pointerdown', () => { usingKeyboard = false; }, true);
function focusIfKeyboard(el) { if (el && usingKeyboard) el.focus({ preventScroll: true }); }

function distanceFromBottom() {
  return document.documentElement.scrollHeight - window.innerHeight - window.scrollY;
}

// 부드러운 스크롤이 겹치면 iOS Safari에서 화면이 튈 수 있어서,
// 자동 진행 중이거나 직전 스크롤이 끝나지 않았으면 즉시 이동합니다.
let lastSmoothScroll = 0;
function scrollToBottom() {
  const now = Date.now();
  const smooth = !reduceMotion && !autoOn && now - lastSmoothScroll > 700;
  if (smooth) lastSmoothScroll = now;
  window.scrollTo({ top: document.documentElement.scrollHeight, behavior: smooth ? 'smooth' : 'auto' });
}

let toastTimer;
function toast(msg) {
  const t = $('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2000);
}

const STAT_ICONS = { health: 'health', happy: 'happy', smarts: 'smarts', relation: 'relation' };
function ico(name) { return `<svg class="ico"><use href="#i-${name}"/></svg>`; }

function statBars(s) {
  return STATS.map((k) => {
    const v = Math.round(s[k]);
    return `<div class="stat" style="--c:${STAT_INFO[k].color}">
      <span class="stat-label">${ico(STAT_ICONS[k])}${STAT_INFO[k].label}</span>
      <span class="stat-bar"><i style="width:${v}%"></i></span>
      <span class="stat-num">${v}</span>
      <span class="delta"></span>
    </div>`;
  }).join('');
}

// 변화량 표시: 같은 요소의 애니메이션을 다시 시작하려면 클래스를 뺐다가 다시 붙입니다.
function flashDelta(el, delta, text) {
  el.classList.remove('show', 'up', 'down');
  if (!delta) { el.textContent = ''; return; }
  el.textContent = text;
  void el.offsetWidth;
  el.classList.add('show', delta > 0 ? 'up' : 'down');
}

function viewSnapshot(s) {
  const snap = { net: Math.round(netWorth(s)) };
  for (const k of STATS) snap[k] = Math.round(s[k]);
  return snap;
}

function changeChip(c) {
  const sign = c.delta > 0 ? '+' : '';
  const value = c.key === 'money' ? sign + formatMoney(c.delta) : sign + c.delta;
  return `<span class="chip ${c.delta > 0 ? 'up' : 'down'}">${esc(c.label)} ${esc(value)}</span>`;
}

// ---------- 시작 화면 ----------

function renderStart() {
  stopAuto();
  const saved = storageGet(SAVE_KEY);
  const canContinue = saved && saved.v === 1 && saved.alive;
  $('btn-continue').hidden = !canContinue;
  if (canContinue) $('btn-continue').textContent = `이어서 살기 · ${saved.name} ${saved.age}세`;
  renderLastLife();
  renderDex();
  show('start');
}

function renderLastLife() {
  const rec = loadRecords();
  const last = recordStats(rec).last;
  $('last-life').hidden = !last;
  $('btn-archive').hidden = !rec.lives.length;
  $('archive-entry-count').textContent = `${rec.lives.length}개의 인생`;
  if (!last) return;
  const cause = DEATHS[last.cause] ? DEATHS[last.cause].name : '';
  const viewable = canOpenLife(last);
  $('last-life').innerHTML = `
    <p class="eyebrow">${ico('grave')}지난 인생</p>
    <p class="last-name"><span class="go">故</span> ${esc(last.name)}<small>${last.birthYear} – ${last.birthYear + last.age}</small></p>
    <p class="last-meta">향년 ${last.age}세 · ${esc(cause)}</p>
    <p class="last-title"><b>${esc(last.title)}</b> · ${esc(last.grade)}등급 ${last.total}점</p>
    ${viewable ? '<button id="btn-last-open" class="btn small">이 인생 다시 보기</button>' : ''}`;
  if (viewable) $('btn-last-open').addEventListener('click', () => openArchivedLife(last.id, 'start'));
}

// ---------- 인생 보관소 ----------

const ARCHIVE_PAGE = 30;
const ARCHIVE_SORTS = {
  recent: { label: '최신순', fn: (a, b) => b.at - a.at },
  score: { label: '점수순', fn: (a, b) => b.total - a.total || b.at - a.at },
  age: { label: '오래 산 순', fn: (a, b) => b.age - a.age || b.at - a.at },
};
let archiveSort = 'recent';
let archiveShown = ARCHIVE_PAGE;
let archiveScroll = 0;   // 목록으로 돌아올 때 보던 위치
let archiveFrom = 'start'; // 다시 보기를 어디서 열었는지 (돌아갈 곳)

// 전체 기록이 이 브라우저에 있거나, 계정에서 불러올 수 있는 인생인지
function canOpenLife(l) {
  return !!getDetail(l.id) || (l.hasDetail && !!Account.user);
}

function lifeDate(at) {
  const d = new Date(at);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

function openArchive(keepPlace = false) {
  if (!keepPlace) { archiveShown = ARCHIVE_PAGE; archiveScroll = 0; }
  renderArchive();
  show('archive');
  if (keepPlace) window.scrollTo(0, archiveScroll);
}

function renderArchive() {
  const lives = [...loadRecords().lives].sort(ARCHIVE_SORTS[archiveSort].fn);
  const best = lives.reduce((m, l) => Math.max(m, l.total || 0), 0);
  $('archive-count').textContent = lives.length
    ? `지금까지 ${lives.length}번 태어나고 ${lives.length}번 떠났습니다.`
    : '아직 보관된 인생이 없습니다. 한 판을 끝까지 살면 이곳에 남습니다.';
  $('archive-sort').innerHTML = Object.entries(ARCHIVE_SORTS).map(([key, s]) =>
    `<button class="sort-btn" data-sort="${key}" aria-pressed="${key === archiveSort}">${esc(s.label)}</button>`).join('');
  $('archive-list').innerHTML = lives.slice(0, archiveShown).map((l) => {
    const cause = DEATHS[l.cause] ? DEATHS[l.cause].name : '';
    const open = canOpenLife(l);
    const tag = l.total === best && best > 0 ? '<span class="arc-best">최고 기록</span>' : '';
    return `<li><${open ? `button type="button" data-id="${esc(l.id)}"` : 'div'} class="arc-item${open ? '' : ' sealed'}">
      <span class="arc-grade" data-grade="${esc(l.grade)}">${esc(l.grade)}</span>
      <span class="arc-main">
        <span class="arc-name"><span class="go">故</span> ${esc(l.name)}<small>${l.birthYear} – ${l.birthYear + l.age}</small></span>
        <span class="arc-title">${esc(l.title)}${tag}</span>
        <span class="arc-meta">향년 ${l.age}세 · ${esc(cause)}${open ? '' : ' · 요약만 남은 기록'}</span>
      </span>
      <span class="arc-side"><b>${(l.total || 0).toLocaleString()}</b><small>${lifeDate(l.at)}</small></span>
    </${open ? 'button' : 'div'}></li>`;
  }).join('');
  $('btn-archive-more').hidden = lives.length <= archiveShown;
}

async function openArchivedLife(id, from) {
  archiveFrom = from;
  if (from === 'archive') archiveScroll = window.scrollY;
  let detail = getDetail(id);
  if (!detail) {
    toast('계정에서 기록을 불러오는 중입니다');
    detail = await fetchDetail(id);
  }
  if (!detail) { toast('이 인생의 자세한 기록을 찾지 못했습니다'); return; }
  renderEnd(detail, true);
  $('btn-end-archive-back').textContent = from === 'archive' ? '‹ 보관소' : '‹ 처음으로';
}

function closeArchivedLife() {
  if (archiveFrom === 'archive') openArchive(true);
  else renderStart();
}

function renderDex() {
  const dex = recordStats(loadRecords());
  const deathIds = Object.keys(DEATHS);
  const found = deathIds.filter((id) => dex.deaths[id]).length;
  const titlesFound = TITLES.filter((t) => dex.titles[t.id]).length;
  $('dex-summary').innerHTML = `
    <div>${ico('hourglass')}<b>${dex.lives}</b><span>살아 본 인생</span></div>
    <div>${ico('trophy')}<b>${dex.best}</b><span>최고 점수</span></div>
    <div>${ico('grave')}<b>${found}/${deathIds.length}</b><span>사망 원인</span></div>
    <div>${ico('medal')}<b>${titlesFound}/${TITLES.length}</b><span>칭호</span></div>`;
  $('dex-deaths').innerHTML = DEATH_KINDS.map((kind) => {
    const chips = deathIds.filter((id) => DEATHS[id].kind === kind).map((id) => (dex.deaths[id]
      ? `<span class="chip">${esc(DEATHS[id].name)} ×${dex.deaths[id]}</span>`
      : '<span class="chip locked">???</span>')).join('');
    return `<div class="dex-kind"><span>${esc(kind)}</span><div class="chips">${chips}</div></div>`;
  }).join('');
  $('dex-titles').innerHTML = TITLES.map((t) => (dex.titles[t.id]
    ? `<span class="chip">${esc(t.name)}</span>`
    : '<span class="chip locked">???</span>')).join('');
}

// ---------- 출생 ----------

// 이름: 입력칸에 게임이 지은 이름을 미리 채워 둡니다. 그대로 두면 그 이름으로,
// 직접 입력하면 그 이름으로 태어납니다. 직접 정한 이름은 "다시 태어나기"를 해도 유지됩니다.
const NAME_MAX = 10;
let gameName = '';     // 게임이 지은 이름
let customName = null; // 플레이어가 직접 정한 이름

function cleanName(text) {
  return String(text).replace(/\s+/g, ' ').trim().slice(0, NAME_MAX);
}

function rerollName() {
  let name = gameName;
  while (name === gameName) name = randomName(life.gender);
  gameName = name;
  customName = null;
  life.name = name;
  $('birth-name').value = name;
}

function confirmBirth() {
  const typed = cleanName($('birth-name').value);
  life.name = typed || gameName;
  $('birth-name').value = life.name;
  startPlay();
}

function newBirth() {
  life = newLife();
  gameName = life.name;
  if (customName) life.name = customName;
  const b = BIRTH_BY_ID[life.birthId];
  $('birth-name').value = life.name;
  $('birth-meta').textContent = `${life.gender === 'M' ? '남자' : '여자'} · ${life.birthYear}년생`;
  $('birth-env').textContent = b.name;
  $('birth-text').textContent = b.text;
  $('birth-traits').innerHTML = life.traits.map((id) => {
    const t = TRAIT_BY_ID[id];
    return `<p class="trait"><b>${esc(t.name)}</b> <span>${esc(t.desc)}</span></p>`;
  }).join('');
  $('birth-mult').textContent = b.mult === 1
    ? '없음 (×1.0)'
    : `×${b.mult} · ${b.mult > 1 ? '불리한 출발이라 같은 결과도 더 높게 평가합니다.' : '유리한 출발이라 기대치가 높습니다.'}`;
  $('birth-stats').innerHTML = statBars(life);
  show('birth');
}

// ---------- 플레이 ----------

function startPlay() {
  renderedLogs = 0;
  $('log').innerHTML = '';
  $('p-stats').innerHTML = statBars(life);
  $('p-stages').innerHTML = STAGES.map((st) => `<span class="stage"><i><b></b></i>${st.name}</span>`).join('');
  lastShown = viewSnapshot(life);
  flashDelta($('p-money-delta'), 0, '');
  renderHead();
  appendLogs(false);
  show('play');
  window.scrollTo(0, document.documentElement.scrollHeight);
  save();
  if (life.pendingEvent) {
    const ev = findEvent(life.pendingEvent);
    if (ev) openEvent(ev);
  }
}

function renderHead() {
  const b = BIRTH_BY_ID[life.birthId];
  $('p-name').textContent = life.name;
  $('p-meta').textContent = `${life.gender === 'M' ? '남' : '여'} · ${b.name}`;
  $('p-age').textContent = life.age;
  $('p-status').textContent = [statusText(life), relationText(life)].filter(Boolean).join(' · ');
  $('p-money').textContent = formatMoney(netWorth(life));
  $('btn-next').innerHTML = `${ico('next')}<span>다음 해 · ${life.age + 1}세</span>`;

  // 능력치 막대는 다시 그리지 않고 값만 바꿔야 막대가 부드럽게 움직입니다.
  const now = viewSnapshot(life);
  $('p-stats').querySelectorAll('.stat').forEach((row, i) => {
    const k = STATS[i];
    row.querySelector('.stat-bar i').style.width = `${now[k]}%`;
    row.querySelector('.stat-num').textContent = now[k];
    const d = now[k] - lastShown[k];
    flashDelta(row.querySelector('.delta'), d, d > 0 ? `+${d}` : `${d}`);
  });
  const dm = now.net - lastShown.net;
  flashDelta($('p-money-delta'), dm, (dm > 0 ? '+' : '') + formatMoney(dm));
  lastShown = now;

  // 인생 단계 막대
  $('p-stages').querySelectorAll('.stage').forEach((el, i) => {
    const st = STAGES[i];
    const p = life.age > st.to ? 1 : life.age < st.from ? 0 : (life.age - st.from + 1) / (st.to - st.from + 1);
    el.querySelector('b').style.width = `${Math.round(p * 100)}%`;
    el.classList.toggle('now', stageOf(life.age) === st);
  });
}

function entryHtml(e) {
  if (e.kind === 'event') {
    return `<div class="entry event"><b>${esc(e.title)}</b><span class="pick">→ ${esc(e.choice)}</span> ${esc(e.text)}</div>`;
  }
  if (e.kind === 'luck' || e.kind === 'death') {
    return `<div class="entry ${e.kind}"><b>${esc(e.title)}</b>${esc(e.text)}</div>`;
  }
  return `<p class="entry ${e.kind}">${esc(e.text)}</p>`;
}

function newYearGroup(list, label) {
  const group = document.createElement('li');
  group.className = 'year';
  group.innerHTML = `<span class="year-age">${label}</span><div class="year-body"></div>`;
  list.appendChild(group);
  return group;
}

// 아무 일 없던 해가 이어지면 "27–29세 · 조용히 3년이 지나갔습니다"처럼 한 줄로 묶습니다.
function quietRangeText(n) {
  return n >= 5 ? `조용히 ${n}년이 흘렀습니다. 인생에는 이런 시절도 필요합니다.` : `조용히 ${n}년이 지나갔습니다.`;
}

function renderLogInto(list, entries, highlight = false) {
  const touched = new Set();
  for (const e of entries) {
    let group = list.lastElementChild;
    if (e.kind === 'quiet') {
      if (group && group.dataset.quiet && Number(group.dataset.end) === e.age - 1) {
        group.dataset.end = e.age;
        const n = e.age - Number(group.dataset.start) + 1;
        group.querySelector('.year-age').textContent = `${group.dataset.start}–${e.age}세`;
        group.querySelector('.entry').textContent = quietRangeText(n);
      } else {
        group = newYearGroup(list, `${e.age}세`);
        group.classList.add('quiet');
        group.dataset.quiet = '1';
        group.dataset.start = e.age;
        group.dataset.end = e.age;
        group.lastElementChild.insertAdjacentHTML('beforeend', entryHtml(e));
      }
    } else {
      if (!group || group.dataset.quiet || Number(group.dataset.age) !== e.age) {
        group = newYearGroup(list, `${e.age}세`);
        group.dataset.age = e.age;
      }
      group.lastElementChild.insertAdjacentHTML('beforeend', entryHtml(e));
    }
    touched.add(group);
  }
  if (highlight && !reduceMotion) {
    touched.forEach((g) => { g.classList.remove('fresh'); void g.offsetWidth; g.classList.add('fresh'); });
  }
}

function appendLogs(scroll = true) {
  const fresh = life.log.slice(renderedLogs);
  renderedLogs = life.log.length;
  // 자동 진행 중에 위로 올려 지난 기록을 읽고 있으면 맨 아래로 끌어내리지 않습니다.
  const wasNearBottom = distanceFromBottom() < 160;
  renderLogInto($('log'), fresh, scroll);
  if (scroll && fresh.length && (wasNearBottom || !autoOn)) scrollToBottom();
}

function nextYear() {
  if (!life || !life.alive || openEv) return;
  const ev = advanceYear(life);
  appendLogs();
  renderHead();
  if (!life.alive) return finishLife();
  save();
  if (ev) openEvent(ev);
}

// ---------- 사건 창 ----------

function openEvent(ev) {
  openEv = ev;
  $('ev-age').textContent = `${life.age}세 · ${stageOf(life.age).name}`;
  document.querySelector('#modal .sheet').classList.remove('died');
  $('ev-title').textContent = ev.title;
  $('ev-text').textContent = eventText(life, ev);
  const box = $('ev-choices');
  box.innerHTML = '';
  choicesOf(life, ev).forEach((c, i) => {
    const btn = document.createElement('button');
    btn.className = 'choice';
    btn.innerHTML = `<span class="key">${i + 1}</span><span>${esc(choiceLabel(life, c))}</span>`;
    btn.addEventListener('click', () => pickChoice(c));
    box.appendChild(btn);
  });
  box.hidden = false;
  $('ev-result').hidden = true;
  $('modal').hidden = false;
  focusIfKeyboard(box.querySelector('button'));
}

function pickChoice(choice) {
  if (!openEv || !$('ev-result').hidden) return;
  const label = choiceLabel(life, choice);
  const r = resolveChoice(life, openEv, choice);
  $('ev-choices').hidden = true;
  $('ev-picked').textContent = `→ ${label}`;
  $('ev-result-text').textContent = r.text;
  document.querySelector('#modal .sheet').classList.toggle('died', r.died);
  $('ev-changes').innerHTML = r.changes.map(changeChip).join('');
  $('btn-ev-ok').textContent = r.died ? '그렇게 삶이 끝났습니다' : '계속';
  $('ev-result').hidden = false;
  focusIfKeyboard($('btn-ev-ok'));
  save();
}

function closeEvent() {
  if (!openEv) return;
  $('modal').hidden = true;
  openEv = null;
  appendLogs();
  renderHead();
  if (!life.alive) return finishLife();
  save();
  if (autoOn) scheduleAuto(AUTO_DELAY * 2); // 사건 직후에는 결과를 볼 수 있게 잠깐 쉼
}

// ---------- 자동 진행 ----------

function scheduleAuto(delay = AUTO_DELAY) {
  clearTimeout(autoTimer);
  if (!autoOn) return;
  autoTimer = setTimeout(() => {
    if (!openEv) nextYear();
    if (autoOn && !openEv) scheduleAuto();
  }, delay);
}
function startAuto() {
  autoOn = true;
  $('btn-auto').setAttribute('aria-pressed', 'true');
  $('btn-auto').querySelector('.label').textContent = '멈춤';
  scheduleAuto(0);
}
function stopAuto() {
  autoOn = false;
  clearTimeout(autoTimer);
  autoTimer = null;
  $('btn-auto').setAttribute('aria-pressed', 'false');
  $('btn-auto').querySelector('.label').textContent = '자동';
}

// ---------- 엔딩 ----------

function finishLife() {
  if (lastResult && lastResult.life === life) return; // 같은 인생을 두 번 정산하지 않도록
  stopAuto();
  openEv = null;
  $('modal').hidden = true;
  const result = computeResult(life);
  lastResult = { life, result };
  const detail = makeDetail(life, result);
  putDetail(detail);
  saveRecords(addLifeRecord(loadRecords(), {
    id: detail.id, at: detail.at, hasDetail: true,
    name: life.name, birthYear: life.birthYear, age: life.age, cause: life.death.cause,
    titleId: result.title.id, title: result.title.name, grade: result.grade, total: result.total,
  }));
  if (Account.user) syncRecords();
  storageDel(SAVE_KEY);
  showCurtain(detail);
}

// 결과 화면을 다시 그리는 데 필요한 것만 담은 한 판의 전체 기록 (보관소에 저장)
function makeDetail(s, result) {
  return {
    id: makeId(), at: Date.now(),
    name: s.name, gender: s.gender, birthYear: s.birthYear, age: s.age, birthId: s.birthId,
    cause: s.death.cause, epitaph: s.death.epitaph, guests: result.guests.text,
    title: { id: result.title.id, name: result.title.name },
    grade: result.grade, total: result.total, base: result.base, mult: result.mult, parts: result.parts,
    moments: s.moments.map((m) => ({ age: m.age, ko: m.ko })),
    achievements: [...s.achievements],
    history: s.history,
    log: s.log,
    prompt: buildImagePrompt(s, result),
  };
}

// 죽음 연출: 어두운 화면에 이름·생몰년·사인·묘비명이 차례로 나타나고 도장이 찍힙니다.
function showCurtain(d) {
  $('c-name').textContent = d.name;
  $('c-years').textContent = `${d.birthYear} – ${d.birthYear + d.age}`;
  $('c-cause').textContent = `향년 ${d.age}세 · ${DEATHS[d.cause].name}`;
  $('c-epitaph').textContent = d.epitaph;
  $('curtain').hidden = false;
  $('btn-curtain').onclick = () => {
    $('curtain').hidden = true;
    renderEnd(d);
  };
  focusIfKeyboard($('btn-curtain'));
}

// 결과 화면: 방금 끝낸 인생이든 보관소에서 다시 연 인생이든 같은 기록(detail)으로 그립니다.
function renderEnd(d, archived = false) {
  endView = d;
  const death = DEATHS[d.cause] || { name: '알 수 없음', text: '' };
  const b = BIRTH_BY_ID[d.birthId] || { name: '어느 집' };
  $('end-archive-bar').hidden = !archived;
  $('end-archive-date').textContent = archived ? `${lifeDate(d.at)}에 산 인생` : '';
  $('t-name').textContent = d.name;
  $('t-years').textContent = `${d.birthYear} – ${d.birthYear + d.age}`;
  $('t-epitaph').textContent = d.epitaph;
  $('t-age').textContent = `향년 ${d.age}세`;
  $('t-cause').textContent = death.name;
  $('t-death-text').textContent = death.text;
  $('t-guests').textContent = d.guests;

  $('r-title').textContent = d.title.name;
  $('r-grade').textContent = d.grade;
  $('r-grade').dataset.grade = d.grade;
  $('r-total').textContent = `${d.total.toLocaleString()}점`;
  $('r-parts').innerHTML = d.parts.map((p) => `<tr><td>${esc(p.label)}</td><td>${esc(p.hint)}</td><td>${p.value}</td></tr>`).join('');
  $('r-foot').innerHTML = `
    <tr><td>합계</td><td></td><td>${d.base}</td></tr>
    <tr><td>출발점 보정</td><td>${esc(b.name)}</td><td>×${d.mult}</td></tr>
    <tr><td>최종 점수</td><td></td><td>${d.total}</td></tr>`;

  const highlights = [
    { age: 0, ko: `${b.name}에서 태어남` },
    ...[...d.moments].sort((a, c) => a.age - c.age),
    { age: d.age, ko: `세상을 떠남 · ${death.name}` },
  ];
  $('r-highlights').innerHTML = highlights.map((m) => `<li><span class="t-age">${m.age}세</span><span>${esc(m.ko)}</span></li>`).join('');
  const achievements = d.achievements.filter((id) => ACHIEVEMENTS[id]);
  $('r-achievements').innerHTML = achievements.length
    ? achievements.map((id) => `<span class="chip">${esc(ACHIEVEMENTS[id].name)} +${ACHIEVEMENTS[id].points}</span>`).join('')
    : '<span class="chip locked">이번 생에는 업적이 없었습니다</span>';

  if (archived) {
    $('signup-card').hidden = true;
  } else {
    signupJustSaved = false;
    renderSignupCard();
  }
  $('prompt-text').value = d.prompt;
  $('end-log').innerHTML = '';
  renderLogInto($('end-log'), d.log);
  $('end-full-log').open = archived; // 보관소에서 열면 연표를 펼쳐 둡니다
  $('btn-again').hidden = archived;
  $('btn-end-archive').hidden = !archived;
  $('btn-end-home').classList.toggle('primary', archived);

  show('end');
  drawCharts();
}

// ---------- 인생 그래프 (SVG) ----------

function niceStep(range, count) {
  const raw = range / count;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const norm = raw / mag;
  return (norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 5 ? 5 : 10) * mag;
}

function shortMoney(v) {
  const a = Math.abs(v);
  const sign = v < 0 ? '-' : '';
  if (a >= 10000) return `${sign}${+(a / 10000).toFixed(1)}억`;
  if (a >= 1000) return `${sign}${+(a / 1000).toFixed(1)}천만`;
  if (a === 0) return '0';
  return `${sign}${Math.round(a)}만`;
}

function drawChart(box, points, opt) {
  const W = Math.max(260, Math.round(box.clientWidth || 320));
  const H = 160;
  const m = { l: 46, r: 16, t: 16, b: 26 };
  const values = points.map((p) => p[opt.key]);
  const xMax = Math.max(10, points[points.length - 1].age);
  let yMin = opt.min ?? Math.min(0, ...values);
  let yMax = opt.max ?? Math.max(1, ...values);
  const step = opt.step || niceStep(yMax - yMin || 1, 3);
  if (opt.min === undefined) yMin = Math.floor(yMin / step) * step;
  if (opt.max === undefined) yMax = Math.ceil(yMax / step) * step;
  if (yMax === yMin) yMax = yMin + step;

  const X = (age) => m.l + (age / xMax) * (W - m.l - m.r);
  const Y = (v) => m.t + (1 - (v - yMin) / (yMax - yMin)) * (H - m.t - m.b);
  const baseY = Y(Math.max(yMin, Math.min(0, yMax)));

  const grid = [];
  for (let v = yMin; v <= yMax + 1e-9; v += step) {
    grid.push(`<line x1="${m.l}" x2="${W - m.r}" y1="${Y(v)}" y2="${Y(v)}" stroke="var(--line)" stroke-width="1"/>`);
    grid.push(`<text x="${m.l - 8}" y="${Y(v) + 4}" text-anchor="end" font-size="11" fill="var(--muted)">${opt.tick(v)}</text>`);
  }
  for (let a = 0; a <= xMax; a += 20) {
    grid.push(`<text x="${X(a)}" y="${H - 6}" text-anchor="middle" font-size="11" fill="var(--muted)">${a}세</text>`);
  }

  const line = points.map((p, i) => `${i ? 'L' : 'M'}${X(p.age).toFixed(1)},${Y(p[opt.key]).toFixed(1)}`).join('');
  const area = `${line}L${X(points[points.length - 1].age).toFixed(1)},${baseY}L${X(points[0].age).toFixed(1)},${baseY}Z`;
  const last = points[points.length - 1];
  const peak = points.reduce((a, p) => (p[opt.key] > a[opt.key] ? p : a), points[0]);
  const lx = X(last.age);
  const ly = Y(last[opt.key]);
  const labelAnchor = lx > W - 60 ? 'end' : 'start';

  box.innerHTML = `
    <svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img"
      aria-label="${esc(opt.label)}: 최고 ${esc(opt.format(peak[opt.key]))}(${peak.age}세), 마지막 ${esc(opt.format(last[opt.key]))}(${last.age}세)">
      ${grid.join('')}
      <path d="${area}" fill="${opt.color}" fill-opacity="0.1" stroke="none"/>
      <path d="${line}" fill="none" stroke="${opt.color}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
      ${Math.abs(X(peak.age) - lx) > 70 ? `<circle cx="${X(peak.age)}" cy="${Y(peak[opt.key])}" r="3.5" fill="${opt.color}" stroke="var(--surface)" stroke-width="2"/>
      <text x="${X(peak.age)}" y="${Y(peak[opt.key]) - 9}" text-anchor="middle" font-size="11" fill="var(--ink-2)">최고 ${esc(opt.format(peak[opt.key]))}</text>` : ''}
      <circle cx="${lx}" cy="${ly}" r="4.5" fill="${opt.color}" stroke="var(--surface)" stroke-width="2"/>
      <text x="${labelAnchor === 'end' ? lx : lx + 8}" y="${labelAnchor === 'end' ? ly - 10 : ly + 4}" text-anchor="${labelAnchor}" font-size="11" font-weight="700" fill="var(--ink)">${esc(opt.format(last[opt.key]))}</text>
      <line class="cross" x1="0" x2="0" y1="${m.t}" y2="${H - m.b}" stroke="var(--muted)" stroke-width="1" visibility="hidden"/>
      <circle class="hover-dot" r="4.5" fill="${opt.color}" stroke="var(--surface)" stroke-width="2" visibility="hidden"/>
      <rect x="${m.l}" y="0" width="${W - m.l - m.r}" height="${H}" fill="transparent"/>
    </svg>
    <div class="chart-tip" hidden></div>`;

  const svg = box.querySelector('svg');
  const cross = svg.querySelector('.cross');
  const dot = svg.querySelector('.hover-dot');
  const tip = box.querySelector('.chart-tip');
  const move = (evt) => {
    const rect = svg.getBoundingClientRect();
    const x = ((evt.clientX - rect.left) / rect.width) * W;
    const age = Math.round(((x - m.l) / (W - m.l - m.r)) * xMax);
    const p = points.reduce((a, q) => (Math.abs(q.age - age) < Math.abs(a.age - age) ? q : a), points[0]);
    const px = X(p.age);
    const py = Y(p[opt.key]);
    cross.setAttribute('x1', px); cross.setAttribute('x2', px); cross.setAttribute('visibility', 'visible');
    dot.setAttribute('cx', px); dot.setAttribute('cy', py); dot.setAttribute('visibility', 'visible');
    tip.hidden = false;
    tip.textContent = `${p.age}세 · ${opt.label} ${opt.format(p[opt.key])}`;
    tip.style.left = `${Math.min(Math.max((px / W) * rect.width, 60), rect.width - 60)}px`;
    tip.style.top = `${(py / H) * rect.height}px`;
  };
  const leave = () => { cross.setAttribute('visibility', 'hidden'); dot.setAttribute('visibility', 'hidden'); tip.hidden = true; };
  svg.addEventListener('pointermove', move);
  svg.addEventListener('pointerdown', move);
  svg.addEventListener('pointerleave', leave);
}

function drawCharts() {
  if (!endView || $('screen-end').hidden) return;
  drawChart($('chart-happy'), endView.history, {
    key: 'happy', label: '행복', min: 0, max: 100, step: 50,
    color: 'var(--c-happy)', tick: (v) => v, format: (v) => String(v),
  });
  drawChart($('chart-money'), endView.history, {
    key: 'net', label: '순자산',
    color: 'var(--c-money)', tick: shortMoney, format: formatMoney,
  });
}

let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(drawCharts, 150);
});

// ---------- 계정 (Google 로그인) ----------

let signupJustSaved = false; // 결과 화면에서 방금 가입해 저장했는지

function accountName() {
  const u = Account.user;
  return u ? (u.name || u.email.split('@')[0] || 'Google 계정') : '';
}

// 시작 화면의 계정 줄
function renderAccountBar() {
  const bar = $('account-bar');
  const on = Account.enabled || Account.status === 'error';
  bar.hidden = !on;
  if (!on) return;
  if (Account.status === 'error' && !Account.user) {
    bar.innerHTML = '<span class="who-line">로그인 서버에 연결하지 못했습니다. 기록은 이 기기에 저장됩니다.</span>';
    return;
  }
  if (!Account.user) {
    bar.innerHTML = `<span class="who-line">${ico('user')}이 기기에만 저장 중입니다. 계정이 있다면 로그인하세요.</span>
      <button id="btn-login" class="btn small">Google로 로그인</button>`;
    $('btn-login').addEventListener('click', doSignIn);
    return;
  }
  const sync = { syncing: '동기화 중…', synced: '동기화됨', error: '동기화 실패 · 이 기기에 저장됨' }[Account.status] || '';
  bar.innerHTML = `<span class="who-line">${ico('user')}<b>${esc(accountName())}</b> 님의 도감
      <span class="sync ${Account.status === 'error' ? 'error' : ''}">${esc(sync)}</span></span>
    <button id="btn-logout" class="btn small ghost">로그아웃</button>`;
  $('btn-logout').addEventListener('click', doSignOut);
}

// 결과 화면의 가입 권유 카드: 첫 판을 마친 뒤부터, 로그인하지 않은 경우에만
function shouldAskSignup() {
  if (!Account.enabled || Account.user) return false;
  const lives = recordStats(loadRecords()).lives;
  const later = storageGet(SIGNUP_LATER_KEY);
  return lives >= 1 && (later === null || lives - later >= SIGNUP_ASK_AGAIN);
}

function renderSignupCard() {
  const card = $('signup-card');
  if (signupJustSaved && Account.user) {
    card.hidden = false;
    card.innerHTML = `<h2>${ico('cloud')}저장했습니다</h2>
      <p>${esc(accountName())} 님의 계정에 도감이 저장됐습니다. 이제 휴대폰과 PC 어디서 해도 기록이 이어집니다.</p>`;
    return;
  }
  card.hidden = !shouldAskSignup();
  if (card.hidden) return;
  const lives = recordStats(loadRecords()).lives;
  card.innerHTML = `<h2>${ico('cloud')}${lives === 1 ? '첫 인생, 수고하셨습니다' : '이 기록, 계속 모아 볼까요?'}</h2>
    <p>Google 계정으로 가입하면 지금까지의 도감과 최고 점수가 계정에 저장됩니다. 기기를 바꾸거나 브라우저 기록을 지워도 이어서 모을 수 있습니다.</p>
    <div class="actions">
      <button id="btn-signup" class="btn primary">Google로 저장하기</button>
      <button id="btn-signup-later" class="btn">나중에</button>
    </div>`;
  $('btn-signup').addEventListener('click', async () => {
    const ok = await doSignIn();
    if (ok) { signupJustSaved = true; renderSignupCard(); }
  });
  $('btn-signup-later').addEventListener('click', () => {
    storageSet(SIGNUP_LATER_KEY, recordStats(loadRecords()).lives);
    card.hidden = true;
  });
}

async function doSignIn() {
  const r = await signIn();
  if (r === 'blocked') toast('팝업이 차단됐습니다. 팝업을 허용한 뒤 다시 눌러 주세요');
  else if (r === 'error') toast('로그인하지 못했습니다. 잠시 후 다시 시도해 주세요');
  return r === 'ok';
}

async function doSignOut() {
  await signOut();
  toast('로그아웃했습니다. 기록은 계정에 남아 있습니다');
}

onAccountChange(() => {
  renderAccountBar();
  if (!$('screen-start').hidden) { renderLastLife(); renderDex(); }
  if (!$('screen-archive').hidden) renderArchive();
  if (!$('screen-end').hidden && !$('signup-card').hidden) renderSignupCard();
});

// ---------- 프롬프트 복사 ----------

function copyPrompt() {
  const ta = $('prompt-text');
  const fallback = () => {
    ta.focus();
    ta.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    toast(ok ? '프롬프트를 복사했습니다' : '텍스트가 선택됐습니다. 직접 복사해 주세요');
  };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(ta.value).then(() => toast('프롬프트를 복사했습니다'), fallback);
  } else {
    fallback();
  }
}

// ---------- 이벤트 연결 ----------

$('btn-born').addEventListener('click', newBirth);
$('btn-reroll').addEventListener('click', newBirth);
$('btn-start-life').addEventListener('click', confirmBirth);
$('btn-name-random').addEventListener('click', rerollName);
$('birth-name').addEventListener('input', () => {
  const typed = cleanName($('birth-name').value);
  customName = typed && typed !== gameName ? typed : null;
});
$('birth-name').addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.isComposing) { e.preventDefault(); confirmBirth(); }
});
$('btn-continue').addEventListener('click', () => {
  const saved = storageGet(SAVE_KEY);
  if (!saved || !saved.alive) return renderStart();
  life = saved;
  startPlay();
});
$('btn-next').addEventListener('click', nextYear);
$('btn-auto').addEventListener('click', () => (autoOn ? stopAuto() : startAuto()));
$('btn-home').addEventListener('click', () => { save(); renderStart(); });
$('btn-ev-ok').addEventListener('click', closeEvent);
$('btn-again').addEventListener('click', newBirth);
$('btn-end-home').addEventListener('click', renderStart);
$('btn-end-archive').addEventListener('click', () => openArchive(archiveFrom === 'archive'));
$('btn-end-archive-back').addEventListener('click', closeArchivedLife);
$('btn-archive').addEventListener('click', () => openArchive());
$('btn-archive-back').addEventListener('click', renderStart);
$('btn-archive-more').addEventListener('click', () => { archiveShown += ARCHIVE_PAGE; renderArchive(); });
$('archive-sort').addEventListener('click', (e) => {
  const btn = e.target.closest('[data-sort]');
  if (!btn || btn.dataset.sort === archiveSort) return;
  archiveSort = btn.dataset.sort;
  archiveShown = ARCHIVE_PAGE;
  renderArchive();
});
$('archive-list').addEventListener('click', (e) => {
  const item = e.target.closest('button[data-id]');
  if (item) openArchivedLife(item.dataset.id, 'archive');
});
$('btn-copy').addEventListener('click', copyPrompt);

// 키보드: 스페이스/엔터 = 다음 해, 숫자 = 선택지
document.addEventListener('keydown', (e) => {
  if ($('screen-play').hidden || e.altKey || e.ctrlKey || e.metaKey) return;
  if (e.target.tagName === 'BUTTON' && (e.key === 'Enter' || e.key === ' ')) return; // 버튼 기본 동작에 맡김
  if (openEv) {
    if (!$('ev-result').hidden && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); closeEvent(); return; }
    const n = Number(e.key);
    const buttons = $('ev-choices').querySelectorAll('button');
    if (!$('ev-choices').hidden && n >= 1 && n <= buttons.length) { e.preventDefault(); buttons[n - 1].click(); }
    return;
  }
  if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); nextYear(); }
});

renderStart();
initAccount();
