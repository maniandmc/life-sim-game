// 화면(UI)을 담당하는 파일입니다. 게임 규칙은 engine.js, 내용은 data 폴더에 있습니다.

const SAVE_KEY = 'life-sim-save-v1';
const DEX_KEY = 'life-sim-dex-v1';
const AUTO_DELAY = 550; // 자동 진행 간격(ms)
const $ = (id) => document.getElementById(id);
const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let life = null;        // 지금 살고 있는 인생
let openEv = null;      // 열려 있는 사건
let autoTimer = null;
let renderedLogs = 0;
let lastResult = null;

// ---------- 저장 (브라우저 localStorage, 실패해도 게임은 계속) ----------

function storageGet(key) {
  try { return JSON.parse(localStorage.getItem(key)); } catch (e) { return null; }
}
function storageSet(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* 저장 불가 환경 */ }
}
function storageDel(key) {
  try { localStorage.removeItem(key); } catch (e) { /* 저장 불가 환경 */ }
}
function save() { if (life && life.alive) storageSet(SAVE_KEY, life); }
function loadDex() { return storageGet(DEX_KEY) || { lives: 0, best: 0, deaths: {}, titles: {} }; }

// ---------- 공통 ----------

function esc(text) {
  return String(text).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

function show(name) {
  for (const id of ['start', 'birth', 'play', 'end']) $(`screen-${id}`).hidden = id !== name;
  window.scrollTo(0, 0);
}

let toastTimer;
function toast(msg) {
  const t = $('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2000);
}

function statBars(s) {
  return STATS.map((k) => {
    const v = Math.round(s[k]);
    return `<div class="stat" style="--c:${STAT_INFO[k].color}">
      <span class="stat-label">${STAT_INFO[k].label}</span>
      <span class="stat-bar"><i style="width:${v}%"></i></span>
      <span class="stat-num">${v}</span>
    </div>`;
  }).join('');
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
  renderDex();
  show('start');
}

function renderDex() {
  const dex = loadDex();
  const deathIds = Object.keys(DEATHS);
  const found = deathIds.filter((id) => dex.deaths[id]).length;
  const titlesFound = TITLES.filter((t) => dex.titles[t.id]).length;
  $('dex-summary').innerHTML = `
    <div><b>${dex.lives}</b><span>살아 본 인생</span></div>
    <div><b>${dex.best}</b><span>최고 점수</span></div>
    <div><b>${found}/${deathIds.length}</b><span>사망 원인</span></div>
    <div><b>${titlesFound}/${TITLES.length}</b><span>칭호</span></div>`;
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

function newBirth() {
  life = newLife();
  const b = BIRTH_BY_ID[life.birthId];
  $('birth-name').textContent = life.name;
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
  $('p-stats').innerHTML = statBars(life);
  $('p-money').textContent = formatMoney(netWorth(life));
  $('btn-next').textContent = `다음 해 · ${life.age + 1}세`;
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

function renderLogInto(list, entries) {
  for (const e of entries) {
    let group = list.lastElementChild;
    if (!group || Number(group.dataset.age) !== e.age) {
      group = document.createElement('li');
      group.className = 'year';
      group.dataset.age = e.age;
      group.innerHTML = `<span class="year-age">${e.age}세</span><div class="year-body"></div>`;
      list.appendChild(group);
    }
    group.lastElementChild.insertAdjacentHTML('beforeend', entryHtml(e));
  }
}

function appendLogs(scroll = true) {
  const fresh = life.log.slice(renderedLogs);
  renderedLogs = life.log.length;
  renderLogInto($('log'), fresh);
  if (scroll && fresh.length) {
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: reduceMotion ? 'auto' : 'smooth' });
  }
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
  $('ev-age').textContent = `${life.age}세`;
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
  const first = box.querySelector('button');
  if (first) first.focus({ preventScroll: true });
}

function pickChoice(choice) {
  if (!openEv || !$('ev-result').hidden) return;
  const r = resolveChoice(life, openEv, choice);
  $('ev-choices').hidden = true;
  $('ev-result-text').textContent = r.text;
  $('ev-changes').innerHTML = r.changes.map(changeChip).join('');
  $('btn-ev-ok').textContent = r.died ? '그렇게 삶이 끝났습니다' : '계속';
  $('ev-result').hidden = false;
  $('btn-ev-ok').focus({ preventScroll: true });
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
}

// ---------- 자동 진행 ----------

function startAuto() {
  stopAuto();
  autoTimer = setInterval(() => { if (!openEv) nextYear(); }, AUTO_DELAY);
  $('btn-auto').setAttribute('aria-pressed', 'true');
  $('btn-auto').textContent = '자동 멈춤';
}
function stopAuto() {
  clearInterval(autoTimer);
  autoTimer = null;
  $('btn-auto').setAttribute('aria-pressed', 'false');
  $('btn-auto').textContent = '자동 진행';
}

// ---------- 엔딩 ----------

function finishLife() {
  if (lastResult && lastResult.life === life) return; // 같은 인생을 두 번 정산하지 않도록
  stopAuto();
  openEv = null;
  $('modal').hidden = true;
  const result = computeResult(life);
  lastResult = { life, result };
  const dex = loadDex();
  dex.lives += 1;
  dex.best = Math.max(dex.best, result.total);
  dex.deaths[life.death.cause] = (dex.deaths[life.death.cause] || 0) + 1;
  dex.titles[result.title.id] = (dex.titles[result.title.id] || 0) + 1;
  storageSet(DEX_KEY, dex);
  storageDel(SAVE_KEY);
  renderEnd(result);
}

function renderEnd(result) {
  const d = DEATHS[life.death.cause];
  const b = BIRTH_BY_ID[life.birthId];
  $('t-name').textContent = life.name;
  $('t-years').textContent = `${life.birthYear} – ${life.birthYear + life.age}`;
  $('t-epitaph').textContent = life.death.epitaph;
  $('t-age').textContent = `향년 ${life.age}세`;
  $('t-cause').textContent = d.name;
  $('t-death-text').textContent = d.text;
  $('t-guests').textContent = result.guests.text;

  $('r-title').textContent = result.title.name;
  $('r-grade').textContent = result.grade;
  $('r-grade').dataset.grade = result.grade;
  $('r-total').textContent = `${result.total.toLocaleString()}점`;
  $('r-parts').innerHTML = result.parts.map((p) => `<tr><td>${esc(p.label)}</td><td>${esc(p.hint)}</td><td>${p.value}</td></tr>`).join('');
  $('r-foot').innerHTML = `
    <tr><td>합계</td><td></td><td>${result.base}</td></tr>
    <tr><td>출발점 보정</td><td>${esc(b.name)}</td><td>×${result.mult}</td></tr>
    <tr><td>최종 점수</td><td></td><td>${result.total}</td></tr>`;

  const highlights = [
    { age: 0, ko: `${b.name}에서 태어남` },
    ...[...life.moments].sort((a, c) => a.age - c.age),
    { age: life.age, ko: `세상을 떠남 · ${d.name}` },
  ];
  $('r-highlights').innerHTML = highlights.map((m) => `<li><span class="t-age">${m.age}세</span><span>${esc(m.ko)}</span></li>`).join('');
  $('r-achievements').innerHTML = life.achievements.length
    ? life.achievements.map((id) => `<span class="chip">${esc(ACHIEVEMENTS[id].name)} +${ACHIEVEMENTS[id].points}</span>`).join('')
    : '<span class="chip locked">이번 생에는 업적이 없었습니다</span>';

  $('prompt-text').value = buildImagePrompt(life, result);
  $('end-log').innerHTML = '';
  renderLogInto($('end-log'), life.log);

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
  if (!life || life.alive || $('screen-end').hidden) return;
  drawChart($('chart-happy'), life.history, {
    key: 'happy', label: '행복', min: 0, max: 100, step: 50,
    color: 'var(--c-happy)', tick: (v) => v, format: (v) => String(v),
  });
  drawChart($('chart-money'), life.history, {
    key: 'net', label: '순자산',
    color: 'var(--c-money)', tick: shortMoney, format: formatMoney,
  });
}

let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(drawCharts, 150);
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
$('btn-start-life').addEventListener('click', startPlay);
$('btn-continue').addEventListener('click', () => {
  const saved = storageGet(SAVE_KEY);
  if (!saved || !saved.alive) return renderStart();
  life = saved;
  startPlay();
});
$('btn-next').addEventListener('click', nextYear);
$('btn-auto').addEventListener('click', () => (autoTimer ? stopAuto() : startAuto()));
$('btn-home').addEventListener('click', () => { save(); renderStart(); });
$('btn-ev-ok').addEventListener('click', closeEvent);
$('btn-again').addEventListener('click', newBirth);
$('btn-end-home').addEventListener('click', renderStart);
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
