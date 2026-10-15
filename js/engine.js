// 게임 진행 엔진: 한 해가 지날 때 일어나는 일, 사건 고르기, 선택 결과 적용, 사망 판정
// 화면 코드와 분리되어 있어서 tools/simulate.js에서 수천 번 자동으로 돌려볼 수 있습니다.

// 난수 함수. 시뮬레이션에서 고정된 난수로 바꿔 끼울 수 있게 변수로 둡니다.
let rand = Math.random;

// ---------- 작은 도구들 ----------

function chance(p) { return rand() < p; }
function randInt(min, max) { return min + Math.floor(rand() * (max - min + 1)); }
function pick(arr) { return arr[Math.floor(rand() * arr.length)]; }
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
function val(v, s) { return typeof v === 'function' ? v(s) : v; }

function weightedPick(items, weightOf) {
  const weights = items.map((it) => Math.max(0, weightOf(it) || 0));
  const total = weights.reduce((a, b) => a + b, 0);
  if (total <= 0) return items[0];
  let r = rand() * total;
  for (let i = 0; i < items.length; i++) {
    if (r < weights[i]) return items[i];
    r -= weights[i];
  }
  return items[items.length - 1];
}

// 만 원 단위 → "3,200만 원", "4.5억 원"
function formatMoney(man) {
  const sign = man < 0 ? '-' : '';
  const a = Math.abs(Math.round(man));
  if (a >= 10000) {
    const eok = a / 10000;
    return sign + (eok >= 100 ? Math.round(eok).toLocaleString() : eok.toFixed(1).replace(/\.0$/, '')) + '억 원';
  }
  return sign + a.toLocaleString() + '만 원';
}

function inc(s, key, n = 1) { s.counters[key] = (s.counters[key] || 0) + n; }
function hasTrait(s, id) { return s.traits.includes(id); }
function netWorth(s) { return s.money + s.home; }
function family(s) { return BIRTH_BY_ID[s.birthId].family; }
function isMarried(s) { return !!s.partner && s.partner.status === 'married'; }
function inArmy(s) { return s.flags.inArmy > 0; }
function inPrison(s) { return s.flags.prison > 0; }
function isStudent(s) { return s.flags.student > 0; }

const EMPLOYEE_JOBS = ['office', 'bigcorp', 'civil', 'factory', 'parttime', 'security', 'freelancer', 'rider'];
function isEmployee(s) { return EMPLOYEE_JOBS.includes(s.job); }

function randomName(gender) { return pick(SURNAMES) + pick(GIVEN_NAMES[gender]); }
function anyName() { return randomName(chance(0.5) ? 'M' : 'F'); }

// 문장 속 {name}, {partner}, {biz} 같은 자리를 실제 값으로 바꿉니다.
function fmt(text, s) {
  return String(text).replace(/\{(\w+)\}/g, (m, key) => {
    if (key === 'name') return s.name;
    if (key === 'partner') return s.partner ? s.partner.name : '연인';
    if (key === 'biz') return s.business ? BUSINESSES[s.business.type].name : '가게';
    if (key === 'amount') return formatMoney(s.tmp.amount || 0);
    if (s.tmp[key] !== undefined) return s.tmp[key];
    return m;
  });
}

// ---------- 새 인생 ----------

const TRAIT_CONFLICTS = [['athletic', 'frail'], ['shy', 'leader']];

function rollTraits() {
  const count = chance(0.4) ? 2 : 1;
  const traits = [];
  while (traits.length < count) {
    const t = pick(TRAITS).id;
    const conflict = TRAIT_CONFLICTS.some((pair) => pair.includes(t) && pair.some((p) => traits.includes(p)));
    if (!traits.includes(t) && !conflict) traits.push(t);
  }
  return traits;
}

function newLife() {
  const gender = chance(0.5) ? 'M' : 'F';
  const birth = weightedPick(BIRTHS, (b) => b.weight);
  const traits = rollTraits();
  const s = {
    v: 1,
    name: randomName(gender),
    gender,
    birthId: birth.id,
    birthYear: new Date().getFullYear(),
    traits,
    age: 0,
    alive: true,
    health: 0, happy: 0, smarts: 0, relation: 0,
    money: 0,          // 현금 (빚이면 마이너스)
    home: 0,           // 집 가치
    job: null, jobYears: 0,
    career: {},        // { 직업id: 일한 햇수 }
    careerStart: {},   // { 직업id: 처음 시작한 나이 }
    business: null,    // { type, level, hp, years }
    illness: null,     // { cause, years, detected, fatalAt }
    partner: null,     // { name, status: 'dating' | 'married', since }
    kids: [],          // [{ name, born(내가 몇 살 때), married }]
    grandkids: 0,
    flags: { ...(birth.flags || {}) },
    counters: {},
    seen: {},          // { 사건id: 마지막으로 일어난 나이 }
    tmp: {},
    log: [],
    moments: [],       // 그림 프롬프트와 인생 하이라이트에 쓰는 장면들
    history: [],       // 나이별 행복·자산 (인생 그래프)
    happySum: 0,
    years: 0,
    achievements: [],
    death: null,
    pendingEvent: null,
  };
  for (const k of STATS) {
    const bonus = traits.reduce((sum, t) => sum + (TRAIT_BY_ID[t].effect[k] || 0), 0);
    s[k] = clamp(birth.stats[k] + randInt(-8, 8) + bonus, 5, 100);
  }
  addLog(s, { kind: 'note', text: birth.text });
  recordYear(s);
  return s;
}

// ---------- 기록 ----------

function addLog(s, entry) { s.log.push({ age: s.age, ...entry }); }
function note(s, text) { addLog(s, { kind: 'note', text }); }

function addMoment(s, m) {
  s.moments.push({ age: s.age, ko: m.ko, img: m.img, w: m.w ?? 2 });
}

function achieve(s, id) {
  if (!s.achievements.includes(id)) s.achievements.push(id);
}

function recordYear(s) {
  s.history.push({ age: s.age, happy: Math.round(s.happy), net: Math.round(netWorth(s)) });
  s.happySum += s.happy;
  s.years += 1;
}

// ---------- 직업·사업·가족 도우미 (사건 데이터에서 사용) ----------

function setJob(s, id) {
  s.job = id;
  s.jobYears = 0;
  if (id && s.careerStart[id] === undefined) s.careerStart[id] = s.age;
}

function enlist(s, years) {
  s.flags.prevJob = s.job;
  s.flags.inArmy = years;
  s.flags.armyDone = true;
  setJob(s, 'soldier');
}

function arrest(s, years) {
  s.flags.prison = years;
  s.flags.criminalRecord = true;
  if (s.business) s.business = null;
  setJob(s, 'inmate');
}

function startBusiness(s, type, costRate = 1) {
  s.money -= Math.round(BUSINESSES[type].cost * costRate);
  s.business = { type, level: 1, hp: 60, years: 0 };
  s.flags.everOwner = true;
  s.flags.wantBiz = false;
  setJob(s, 'owner');
}

function closeBusiness(s, recoverRate) {
  const b = s.business;
  s.money += Math.round(BUSINESSES[b.type].cost * b.level * recoverRate);
  s.business = null;
  setJob(s, null);
}

function goBankrupt(s) {
  const b = s.business;
  s.money -= Math.round(BUSINESSES[b.type].cost * b.level * 0.6);
  s.business = null;
  s.flags.bankrupt = true;
  setJob(s, null);
}

function retire(s) {
  s.flags.pension = (JOBS[s.job] && JOBS[s.job].pension) || 1000;
  setJob(s, 'retired');
}

function newPartner(s) {
  s.partner = { name: s.tmp.newName || anyName(), status: 'dating', since: s.age };
}

function marry(s) {
  s.partner.status = 'married';
  s.partner.since = s.age;
  s.flags.everMarried = true;
  achieve(s, 'married');
}

function addKid(s) {
  const name = pick(GIVEN_NAMES[chance(0.5) ? 'M' : 'F']);
  s.kids.push({ name, born: s.age, married: false });
  s.tmp.kid = name;
  achieve(s, 'parent');
  return name;
}

function kidAge(s, kid) { return s.age - kid.born; }

function die(s, cause) {
  if (!s.alive) return;
  const d = DEATHS[cause] || DEATHS.oldAge;
  s.alive = false;
  s.death = { cause, age: s.age, epitaph: pick(d.epitaph) };
  if (s.age >= 100) achieve(s, 'centenarian');
  addLog(s, { kind: 'death', title: `사망 · ${d.name}`, text: d.text });
}

// ---------- 효과 적용 ----------

function snapshot(s) {
  return { health: s.health, happy: s.happy, smarts: s.smarts, relation: s.relation, net: netWorth(s) };
}

function diffChanges(before, s) {
  const out = [];
  for (const k of STATS) {
    const d = Math.round(s[k]) - Math.round(before[k]);
    if (d) out.push({ key: k, label: STAT_INFO[k].label, delta: d });
  }
  const dm = Math.round(netWorth(s) - before.net);
  if (dm) out.push({ key: 'money', label: '돈', delta: dm });
  return out;
}

// effect: { health, happy, smarts, relation, money, set, add, job, run, achieve, moment, death }
// 숫자 자리에는 (s) => 숫자 함수도 쓸 수 있습니다.
function applyEffect(s, eff) {
  if (!eff) return;
  for (const k of STATS) {
    if (eff[k] != null) s[k] = clamp(s[k] + val(eff[k], s), 0, 100);
  }
  if (eff.money != null) s.money += Math.round(val(eff.money, s));
  if (eff.set) Object.assign(s.flags, eff.set);
  if (eff.add) for (const k in eff.add) inc(s, k, eff.add[k]);
  if (eff.job !== undefined) setJob(s, eff.job);
  if (eff.run) eff.run(s);
  if (eff.achieve) achieve(s, eff.achieve);
  if (eff.moment) addMoment(s, eff.moment);
}

// ---------- 한 해 진행 ----------

function advanceYear(s) {
  const logStart = s.log.length;
  s.age += 1;
  s.tmp = {};
  growUp(s);
  tickJob(s);
  tickMoney(s);
  tickBody(s);
  tickBusiness(s);
  tickIllness(s);
  checkMilestones(s);
  if (s.alive) {
    const cause = naturalDeath(s);
    if (cause) die(s, cause);
  }
  if (s.alive) runLuckEvent(s);
  const ev = s.alive ? pickEvent(s) : null;
  if (!ev && s.alive && s.log.length === logStart) addLog(s, { kind: 'quiet', text: pick(QUIET_YEARS) });
  recordYear(s);
  s.pendingEvent = ev ? ev.id : null;
  return ev;
}

// 나이에 따른 성장 단계, 군 복무·수감·학업 기간 카운트다운
function growUp(s) {
  const a = s.age;
  if (a === 13) note(s, '중학생이 되었습니다. 교복을 두 치수 크게 맞췄습니다. "금방 큰다"고 합니다.');
  if (a === 16) note(s, '고등학생이 되었습니다. 이제 모든 대화가 "그래서 대학은?"으로 끝납니다.');
  if (a === 18 && s.flags.orphan) {
    s.money += 1000;
    note(s, '보육원을 나와 자립했습니다. 자립정착금 1,000만 원과 원장님이 싸 주신 반찬 세 통이 전 재산입니다.');
  }
  if (a === 20) {
    const gift = START_MONEY[family(s)];
    s.money += gift;
    note(s, gift > 0
      ? `성인이 되었습니다. 집에서 독립 자금 ${formatMoney(gift)}을 보태 주셨습니다.`
      : '성인이 되었습니다. 독립 자금은 없지만 독립심은 넘칩니다.');
  }

  if (s.flags.inArmy > 0) {
    s.flags.inArmy -= 1;
    if (s.flags.inArmy === 0) {
      setJob(s, s.flags.prevJob || null);
      note(s, '전역했습니다! 전역한 그날 밤, 다시 입대하는 꿈을 꿨습니다.');
    }
  }
  if (s.flags.prison > 0) {
    s.flags.prison -= 1;
    inc(s, 'prisonYears');
    if (s.flags.prison === 0) {
      setJob(s, null);
      s.flags.exCon = true;
      note(s, '출소했습니다. 교도소 앞에서 두부를 먹었습니다. 생각보다 맛있었습니다.');
    }
  }
  if (s.flags.student > 0 && !inArmy(s)) {
    s.flags.student -= 1;
    if (s.flags.student === 0) {
      if (s.flags.med) {
        setJob(s, 'resident');
        s.flags.residentLeft = 4;
        achieve(s, 'doctor');
        addMoment(s, { ko: '의사 국가고시 합격', img: 'wearing a white coat for the first time, stethoscope around the neck', w: 4 });
        note(s, '의대를 졸업하고 국가고시에 합격했습니다. "선생님" 소리를 듣기 시작했지만, 잠은 못 잡니다.');
      } else {
        note(s, '대학을 졸업했습니다. 학사모를 하늘로 던졌는데, 받아 줄 사람이 없었습니다.');
      }
    }
  }
  if (s.job === 'resident') s.flags.residentLeft -= 1;
  if (s.job === 'trainee') inc(s, 'traineeYears');
  if (s.job === 'idol') inc(s, 'idolYears');
}

function tickJob(s) {
  if (!s.job) return;
  const job = JOBS[s.job];
  s.jobYears += 1;
  s.career[s.job] = (s.career[s.job] || 0) + 1;
  s.happy = clamp(s.happy + job.happy * 0.7, 0, 100);
  s.health = clamp(s.health + job.health * 0.5, 0, 100);
  if (job.overwork) inc(s, 'overwork');

  if (job.risk === 'rider') {
    if (chance(0.002)) return die(s, 'carAccident');
    if (chance(0.03)) {
      s.health = clamp(s.health - 12, 0, 100);
      note(s, '배달 중 빗길에 미끄러져 다쳤습니다. 깁스를 한 채로도 배달 앱 알림을 확인했습니다.');
    }
  }
  if (job.risk === 'factory') {
    if (chance(0.0015)) return die(s, 'industrial');
    if (chance(0.03)) {
      s.health = clamp(s.health - 10, 0, 100);
      note(s, '작업 중 손을 다쳤습니다. 산재 신청 서류가 부상보다 더 복잡했습니다.');
    }
  }
  if (job.crime && chance(0.25)) {
    arrest(s, randInt(2, 4));
    note(s, '사무실에 경찰이 들이닥쳤습니다. "사업"의 정체가 드러났고, 징역형을 선고받았습니다.');
  }
}

// 세후 소득 (단순화한 누진 구조)
function afterTax(income) {
  return income <= 4000 ? income * 0.9 : 3600 + (income - 4000) * 0.65;
}

function tickMoney(s) {
  const adult = s.age >= 20;
  if (!adult && !s.job) return;

  let income = 0;
  const job = s.job ? JOBS[s.job] : null;
  if (s.job === 'retired') {
    income = s.flags.pension || 0;
  } else if (s.job === 'creator') {
    income = afterTax(job.salary * (0.2 + rand() * 2.5) * (s.flags.bigCreator ? 8 : 1));
  } else if (job && s.job !== 'owner') {
    income = afterTax(job.salary * (1 + Math.min(s.jobYears, 25) * 0.02) * (1 + (s.flags.raise || 0)));
  }
  if (s.age >= 65 && netWorth(s) < 30000) income += 400; // 기초연금
  if (isMarried(s)) income += s.age < 65 ? 1500 : 500;  // 배우자 소득·연금 (단순화)

  let cost;
  if (inArmy(s) || inPrison(s) || !adult) cost = 0;
  else if (isStudent(s)) cost = family(s) >= 2 ? 0 : 600;     // 형편이 어려우면 학자금 대출
  else if (!s.job && s.age < 25) cost = 700;                  // 취업 준비 중에는 부모님 집에서
  else cost = (s.job === 'retired' || s.age >= 65 ? 1800 : 2200) + income * 0.25 + (isMarried(s) ? 800 : 0);
  cost += s.kids.filter((k) => kidAge(s, k) < 25).length * 900;
  if (s.age >= 70) cost += (100 - s.health) * 10;             // 병원비

  s.money += Math.round(income - cost);
  s.money = Math.round(s.money * (s.money < 0 ? 1.035 : 1.01)); // 대출 이자 / 예금 이자
  if (s.home > 0) s.home = Math.round(s.home * 1.01);
}

function tickBody(s) {
  const a = s.age;
  let dh = a < 25 ? 0.6 : a < 40 ? 0 : a < 55 ? -0.4 : a < 70 ? -0.8 : a < 80 ? -1.4 : -2.2;
  if (a < 60) dh += (65 - s.health) * 0.03;  // 젊을 때는 아파도 조금씩 회복
  if (s.flags.smoker) { dh -= 1; inc(s, 'smokeYears'); }
  if (s.flags.drinker) { dh -= 0.8; inc(s, 'drinkYears'); }
  if (s.flags.exercise && a < 80) dh += 1.2;
  if (s.happy < 25) dh -= 1;
  if (hasTrait(s, 'frail')) dh -= 0.3;
  s.health = clamp(s.health + dh, 0, 100);
  if (a < 10) s.health = Math.max(s.health, 15);

  // 행복은 관계·건강 수준으로 조금씩 돌아갑니다.
  const target = 30 + s.relation * 0.25 + s.health * 0.2 + (hasTrait(s, 'optimist') ? 8 : 0);
  s.happy = clamp(s.happy + (target - s.happy) * 0.06, 0, 100);

  if (isMarried(s)) s.relation = clamp(s.relation + 0.2, 0, 100);
  s.relation = clamp(s.relation + (50 - s.relation) * 0.02, 0, 100);
  if (a >= 70) {
    s.relation = clamp(s.relation - 0.4, 0, 100);
    s.smarts = clamp(s.smarts - 0.5, 0, 100);
  }
  if (s.flags.dementia) s.smarts = clamp(s.smarts - (s.flags.dementiaCare ? 2 : 4), 0, 100);
  if (a <= 18 && !s.flags.dropout) s.smarts = clamp(s.smarts + 0.8, 0, 100);
}

function tickBusiness(s) {
  const b = s.business;
  if (!b) return;
  const info = BUSINESSES[b.type];
  b.years += 1;
  const luck = rand() + s.smarts / 400 + (hasTrait(s, 'merchant') ? 0.12 : 0) - 0.12;
  const perf = clamp((luck - 0.5) * 2, -1, 1.2);
  const raw = info.base * b.level * (0.35 + perf * info.vol);
  const profit = Math.round(raw > 0 ? raw * 0.85 : raw);
  s.money += profit;
  b.lastProfit = profit;
  b.hp = clamp(b.hp + perf * 18 + (profit < 0 ? -6 : 2), 0, 100);
  s.happy = clamp(s.happy + perf * 3, 0, 100);
  inc(s, 'overwork', 0.5);
}

function tickIllness(s) {
  if (s.illness) {
    s.illness.years += 1;
    s.health = clamp(s.health - 7, 0, 100);
    if (s.illness.years >= s.illness.fatalAt) die(s, s.illness.cause);
    return;
  }
  if (s.age < 30) return;
  const smoke = s.counters.smokeYears || 0;
  const drink = s.counters.drinkYears || 0;
  const p = 0.0015 * Math.pow(s.age / 40, 3) * (1 + smoke * 0.04 + drink * 0.03);
  if (!chance(p)) return;
  const cause = weightedPick(Object.keys(ILLNESSES), (c) =>
    c === 'lungCancer' ? 1 + smoke * 0.3 : c === 'liverCancer' ? 1 + drink * 0.3 : 2);
  s.illness = { cause, years: 0, detected: false, fatalAt: randInt(3, 6) };
}

function checkMilestones(s) {
  const net = netWorth(s);
  if (net >= 100000) achieve(s, 'rich');
  if (s.flags.bankrupt && net >= 10000 && !s.achievements.includes('comeback')) {
    achieve(s, 'comeback');
    addMoment(s, { ko: '파산 후 재기 성공', img: 'reopening a bright new shop with a crowd of customers after years of hardship', w: 4 });
    note(s, '파산 후 몇 년 만에 다시 일어섰습니다. 신용 점수가 돌아온 날, 혼자 삼겹살을 구워 먹었습니다.');
  }
}

// ---------- 사망 ----------

function naturalDeath(s) {
  if (s.age < 10) return null;
  if (s.health <= 0) return naturalCause(s);
  const p = 0.0002 * Math.exp((s.age - 30) / 9.5) * (1.9 - (s.health / 100) * 1.6);
  if (chance(p)) return naturalCause(s);
  if (s.age >= 12 && chance(0.0002 + (s.age >= 70 ? 0.0003 : 0))) return rareCause(s);
  return null;
}

function naturalCause(s) {
  const c = s.counters;
  const a = s.age;
  const w = {
    oldAge: a >= 70 ? (a - 65) * 1.2 + s.health / 10 : 0,
    heart: 1 + (c.overwork || 0) * 0.15 + (s.happy < 30 ? 2 : 0) + (a > 50 ? 1 : 0),
    stroke: a > 50 ? 1.5 : 0.3,
    pneumonia: a > 75 ? 2 : 0.2,
    dementia: s.flags.dementia ? 8 : 0,
    overwork: a < 65 && (c.overwork || 0) >= 8 ? c.overwork * 0.5 : 0,
    frail: hasTrait(s, 'frail') ? 2 : 0,
    liver: (c.drinkYears || 0) * 0.15,
    lungCancer: (c.smokeYears || 0) * 0.08,
  };
  return weightedPick(Object.keys(w), (k) => w[k]);
}

function rareCause(s) {
  const a = s.age;
  const w = {
    ricecake: a >= 70 ? 4 : 0.2,
    pufferfish: 1,
    selfie: a < 50 ? 1.5 : 0.2,
    meteor: 0.3,
    hornet: a >= 40 ? 1 : 0.2,
    vending: a < 40 ? 1 : 0.3,
  };
  return weightedPick(Object.keys(w), (k) => w[k]);
}

// ---------- 사건 고르기 ----------

const QUIET_YEARS = ['별일 없이 한 해가 지나갔습니다.', '평범한 한 해였습니다.', '조용한 1년이었습니다.', '특별한 일은 없었지만, 나쁘지 않은 한 해였습니다.'];

function isEligible(s, ev) {
  if (s.age < ev.age[0] || s.age > ev.age[1]) return false;
  const last = s.seen[ev.id];
  if (last !== undefined) {
    if (ev.once !== false) return false;
    if (s.age - last < (ev.cooldown || 1)) return false;
  }
  // 군 복무 중·수감 중에는 그 상황 전용 사건만 일어납니다.
  if (inArmy(s) !== !!ev.army) return false;
  if (inPrison(s) !== !!ev.prison) return false;
  if (ev.if && !ev.if(s)) return false;
  return true;
}

// 한 해에 선택 사건이 일어날 확률 (한 판 길이를 조절하는 핵심 값)
function eventChance(age) {
  if (age <= 6) return 0.4;
  if (age <= 18) return 0.5;
  if (age <= 64) return 0.43;
  return 0.3;
}

function pickEvent(s) {
  const pool = EVENTS.filter((e) => !e.auto && isEligible(s, e));
  if (!pool.length) return null;
  let ev = pool.find((e) => e.priority);
  if (!ev && chance(eventChance(s.age))) ev = weightedPick(pool, (e) => val(e.weight ?? 1, s));
  if (!ev) return null;
  s.seen[ev.id] = s.age;
  if (ev.prepare) ev.prepare(s);
  return ev;
}

// 선택지 없이 저절로 일어나는 운 (복권, 사고, 경제 위기 등)
// "아무 일 없음"을 고정 비중으로 넣어 두어야, 후보가 적을 때도 드문 사건이 드물게 유지됩니다.
const LUCK_NOTHING_WEIGHT = 20;

function runLuckEvent(s) {
  if (s.age < 7) return;
  const pool = EVENTS.filter((e) => e.auto && isEligible(s, e));
  const nothing = { nothing: true };
  const ev = weightedPick([...pool, nothing], (e) => (e.nothing ? LUCK_NOTHING_WEIGHT : val(e.weight ?? 1, s)));
  if (ev.nothing) return;
  s.seen[ev.id] = s.age;
  if (ev.prepare) ev.prepare(s);
  const out = ev.outcomes ? weightedPick(ev.outcomes, (o) => val(o.w ?? 1, s)) : ev;
  applyEffect(s, out.effect);
  const text = [ev.text, out.result].filter(Boolean).map((t) => fmt(val(t, s), s)).join(' ');
  addLog(s, { kind: 'luck', title: ev.title, text });
  if (out.effect && out.effect.death) die(s, out.effect.death);
}

function findEvent(id) { return EVENTS.find((e) => e.id === id); }
function eventText(s, ev) { return fmt(val(ev.text, s), s); }
function choicesOf(s, ev) { return ev.choices.filter((c) => !c.if || c.if(s)); }
function choiceLabel(s, c) { return fmt(val(c.label, s), s); }

// 선택 결과 적용 → { text, changes, died }
function resolveChoice(s, ev, choice) {
  const before = snapshot(s);
  const out = choice.outcomes ? weightedPick(choice.outcomes, (o) => val(o.w ?? 1, s)) : choice;
  applyEffect(s, out.effect);
  const text = fmt(val(out.result, s), s);
  addLog(s, { kind: 'event', title: ev.title, choice: choiceLabel(s, choice), text });
  if (out.effect && out.effect.death) die(s, out.effect.death);
  s.pendingEvent = null;
  return { text, changes: diffChanges(before, s), died: !s.alive };
}

// ---------- 화면 표시용 ----------

function statusText(s) {
  if (!s.alive) return '고인';
  if (inPrison(s)) return '수감 중';
  if (inArmy(s)) return '군 복무 중';
  if (isStudent(s)) return s.flags.med ? '의대생' : '대학생';
  if (s.job === 'owner' && s.business) return `${BUSINESSES[s.business.type].name} 사장님`;
  if (s.job) return JOBS[s.job].name;
  if (s.age < 7) return '영유아';
  if (s.age < 13) return '초등학생';
  if (s.age < 16) return '중학생';
  if (s.age < 19) return '고등학생';
  return '무직';
}

function relationText(s) {
  const parts = [];
  if (s.partner) parts.push(s.partner.status === 'married' ? `배우자 ${s.partner.name}` : `연인 ${s.partner.name}`);
  if (s.kids.length) parts.push(`자녀 ${s.kids.length}명`);
  if (s.grandkids) parts.push(`손주 ${s.grandkids}명`);
  return parts.join(' · ');
}
