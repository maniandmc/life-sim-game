// 무작위 선택으로 인생을 수천 번 자동 플레이해서 게임 균형과 오류를 점검하는 도구
// 사용법: node tools/simulate.js [인생 수]   (기본 3000)

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const FILES = [
  'js/data/base.js', 'js/engine.js', 'js/data/deaths.js', 'js/data/endings.js',
  'js/data/events-early.js', 'js/data/events-adult.js', 'js/data/events-late.js', 'js/prompt.js',
];
for (const f of FILES) vm.runInThisContext(fs.readFileSync(path.join(__dirname, '..', f), 'utf8'), { filename: f });

// 결과를 재현할 수 있도록 고정된 난수 사용
function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
rand = mulberry32(20261015);

const N = Number(process.argv[2]) || 3000;
const SEC_PER_YEAR = 2;     // 사건 없는 해: 버튼 한 번 누르고 기록 읽기
const SEC_PER_CHOICE = 12;  // 사건: 상황 읽기 + 고르기 + 결과 읽기

const ages = [], times = [], choiceCounts = [], scores = [];
const deathCount = {}, titleCount = {}, gradeCount = {}, evCount = {}, birthCount = {};
const problems = [];
const placeholder = /\{\w+\}|undefined|NaN/;

function check(where, text) {
  if (placeholder.test(String(text))) problems.push(`${where}: ${String(text).slice(0, 80)}`);
}

for (let i = 0; i < N; i++) {
  const s = newLife();
  birthCount[s.birthId] = (birthCount[s.birthId] || 0) + 1;
  let choices = 0;
  try {
    while (s.alive && s.age < 130) {
      const ev = advanceYear(s);
      if (!ev) continue;
      evCount[ev.id] = (evCount[ev.id] || 0) + 1;
      check(`text:${ev.id}`, eventText(s, ev));
      const opts = choicesOf(s, ev);
      if (!opts.length) { problems.push(`no choices: ${ev.id} @${s.age}`); continue; }
      opts.forEach((c) => check(`label:${ev.id}`, choiceLabel(s, c)));
      const r = resolveChoice(s, ev, pick(opts));
      check(`result:${ev.id}`, r.text);
      choices++;
    }
    if (s.alive) problems.push(`never died: ${s.name} age ${s.age}`);
    for (const k of [...STATS, 'money', 'home']) if (!Number.isFinite(s[k])) problems.push(`non-finite ${k} (${s.birthId})`);
    for (const e of s.log) check(`log:${e.title || e.kind}`, e.text);
    for (const id of Object.keys(s.seen)) if (findEvent(id) && findEvent(id).auto) evCount[id] = (evCount[id] || 0) + 1;

    const res = computeResult(s);
    const prompt = buildImagePrompt(s, res);
    check('prompt', prompt);
    ages.push(s.age);
    choiceCounts.push(choices);
    times.push((s.age * SEC_PER_YEAR + choices * SEC_PER_CHOICE) / 60);
    scores.push(res.total);
    deathCount[s.death.cause] = (deathCount[s.death.cause] || 0) + 1;
    titleCount[res.title.id] = (titleCount[res.title.id] || 0) + 1;
    gradeCount[res.grade] = (gradeCount[res.grade] || 0) + 1;
  } catch (err) {
    problems.push(`crash @${s.age} (${s.birthId}): ${err.stack.split('\n').slice(0, 3).join(' | ')}`);
  }
}

const q = (arr, p) => { const a = [...arr].sort((x, y) => x - y); return a[Math.min(a.length - 1, Math.floor(p * a.length))]; };
const mean = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;
const pct = (n) => `${((n / ages.length) * 100).toFixed(1)}%`;
const table = (obj, names) => Object.entries(obj).sort((a, b) => b[1] - a[1])
  .map(([k, v]) => `  ${(names ? names(k) : k).padEnd(16)} ${String(v).padStart(5)}  ${pct(v)}`).join('\n');

console.log(`인생 ${N}번 자동 플레이\n`);
console.log(`수명      평균 ${mean(ages).toFixed(1)}세 · 10% ${q(ages, 0.1)} · 중앙 ${q(ages, 0.5)} · 90% ${q(ages, 0.9)} · 최고 ${Math.max(...ages)}`);
console.log(`선택 사건 평균 ${mean(choiceCounts).toFixed(1)}개 · 95% ${q(choiceCounts, 0.95)}개`);
console.log(`예상 시간 중앙 ${q(times, 0.5).toFixed(1)}분 · 95% ${q(times, 0.95).toFixed(1)}분 · 최대 ${Math.max(...times).toFixed(1)}분  (사건 ${SEC_PER_CHOICE}초, 평범한 해 ${SEC_PER_YEAR}초 가정)`);
console.log(`점수      평균 ${mean(scores).toFixed(0)} · 10% ${q(scores, 0.1)} · 90% ${q(scores, 0.9)}`);
console.log(`\n등급\n${table(gradeCount)}`);
console.log(`\n사망 원인\n${table(deathCount, (k) => DEATHS[k].name)}`);
console.log(`\n칭호\n${table(titleCount, (k) => TITLES.find((t) => t.id === k).name)}`);
const never = EVENTS.filter((e) => !evCount[e.id]).map((e) => e.id);
console.log(`\n한 번도 안 일어난 사건 (${never.length}/${EVENTS.length}): ${never.join(', ') || '없음'}`);
console.log(`사망 원인 중 안 나온 것: ${Object.keys(DEATHS).filter((k) => !deathCount[k]).join(', ') || '없음'}`);
console.log(`칭호 중 안 나온 것: ${TITLES.filter((t) => !titleCount[t.id]).map((t) => t.name).join(', ') || '없음'}`);

const uniq = [...new Set(problems)];
if (uniq.length) {
  console.error(`\n❌ 문제 ${uniq.length}종\n` + uniq.slice(0, 30).join('\n'));
  process.exit(1);
}
console.log('\n✅ 오류 없음');
