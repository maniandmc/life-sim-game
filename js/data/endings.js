// 엔딩: 칭호, 점수 계산, 조문객 수

// 위에서부터 차례로 검사해서 처음 맞는 칭호를 줍니다. (r = 계산된 결과 요약)
const TITLES = [
  { id: 'chosen',        name: '우주가 선택한 사람',        en: 'Chosen by the Universe',          if: (s) => s.death.cause === 'meteor' },
  { id: 'chaebolFall',   name: '몰락한 재벌 3세',           en: 'The Fallen Heir',                 if: (s, r) => s.birthId === 'chaebol' && (r.net < 10000 || s.flags.bankrupt || s.flags.criminalRecord) },
  { id: 'chairman',      name: '회장님',                    en: 'The Chairman',                    if: (s) => s.achievements.includes('chairman') },
  { id: 'selfmade',      name: '자수성가의 전설',            en: 'A Self-Made Legend',              if: (s, r) => family(s) <= 1 && r.net >= 100000 },
  { id: 'phoenix',       name: '망해도 다시 일어선 사람',     en: 'Rose Again After Bankruptcy',     if: (s) => s.achievements.includes('comeback') },
  { id: 'star',          name: '한 시대를 풍미한 스타',       en: 'A Star of an Era',                if: (s) => s.achievements.includes('chart1') || (s.counters.idolYears || 0) >= 5 },
  { id: 'centenarian',   name: '100세 철학자',              en: 'The Centenarian Philosopher',     if: (s) => s.age >= 100 },
  { id: 'shortFlame',    name: '불꽃처럼 짧았던 인생',        en: 'A Short Life That Burned Bright', if: (s) => s.age < 40 },
  { id: 'healer',        name: '수많은 생명을 살린 의사',     en: 'The Healer',                      if: (s) => (s.career.doctor || 0) >= 10 },
  { id: 'jailbird',      name: '담장 안팎을 오간 인생',       en: 'In and Out of Prison',            if: (s) => (s.counters.prisonYears || 0) >= 3 },
  { id: 'brokeHappy',    name: '망해도 행복했던 사람',        en: 'Broke but Happy',                 if: (s, r) => s.flags.bankrupt && r.avgHappy >= 55 },
  { id: 'richLonely',    name: '부유했지만 외로웠던 사람',     en: 'Rich but Lonely',                 if: (s, r) => r.net >= 100000 && s.relation < 45 && s.kids.length === 0 },
  { id: 'bigFamily',     name: '대가족의 큰 어른',           en: 'Head of a Big Family',            if: (s) => s.kids.length >= 3 || s.grandkids >= 4 },
  { id: 'gambler',       name: '인생은 한 방이었던 사람',     en: 'Always Chasing the Jackpot',      if: (s) => (s.counters.gambles || 0) >= 3 },
  { id: 'athlete',       name: '그라운드의 영웅',            en: 'Hero of the Field',               if: (s) => s.achievements.includes('pro') },
  { id: 'adventurer',    name: '겁 없는 모험가',             en: 'The Fearless Adventurer',         if: (s) => ['everest', 'skydive', 'fall', 'drown'].includes(s.death.cause) || s.achievements.includes('everest') },
  { id: 'civil',         name: '정년까지 버틴 공무원',        en: 'A Lifelong Public Servant',       if: (s) => (s.career.civil || 0) >= 20 },
  { id: 'workaholic',    name: '일에 바친 인생',             en: 'Married to Work',                 if: (s) => (s.counters.overwork || 0) >= 15 },
  { id: 'happyOrdinary', name: '평범하지만 행복했던 사람',     en: 'Ordinary but Happy',              if: (s, r) => r.avgHappy >= 62 },
  { id: 'farmer',        name: '흙과 함께한 삶',             en: 'A Life Close to the Soil',        if: (s) => (s.career.farmer || 0) >= 20 },
  { id: 'endured',       name: '버티고 또 버틴 사람',        en: 'The One Who Endured',             if: (s, r) => r.avgHappy < 42 && s.age >= 60 },
  { id: 'ordinary',      name: '그럭저럭 열심히 산 사람',     en: 'Did Their Best, More or Less',    if: () => true },
];

// 재산 점수: 많을수록 오르지만 점점 덜 오릅니다 (1억 ≈ 60점, 10억 ≈ 90점, 빚 1억 ≈ -60점)
function wealthScore(net) {
  const v = 30 * Math.log10(Math.abs(net) / 100 + 1);
  return net >= 0 ? v : -v;
}

function computeResult(s) {
  const avgHappy = s.years ? s.happySum / s.years : s.happy;
  const net = netWorth(s);
  const achievementPoints = s.achievements.reduce((sum, id) => sum + (ACHIEVEMENTS[id] ? ACHIEVEMENTS[id].points : 0), 0);
  const parts = [
    { label: '수명', value: s.age * 2, hint: `${s.age}세` },
    { label: '평균 행복', value: avgHappy * 4, hint: `평균 ${Math.round(avgHappy)}` },
    {
      label: '관계·가족',
      value: s.relation * 1.5 + (s.flags.everMarried ? 25 : 0) + Math.min(s.kids.length, 4) * 12 + Math.min(s.grandkids, 5) * 5,
      hint: relationText(s) || '혼자',
    },
    { label: '재산', value: wealthScore(net), hint: formatMoney(net) },
    { label: '업적', value: achievementPoints, hint: `${s.achievements.length}개` },
  ].map((p) => ({ ...p, value: Math.round(p.value) }));

  const base = parts.reduce((sum, p) => sum + p.value, 0);
  const birth = BIRTH_BY_ID[s.birthId];
  const total = Math.max(0, Math.round(base * birth.mult));
  const grade = total >= 790 ? 'S' : total >= 670 ? 'A' : total >= 540 ? 'B' : total >= 410 ? 'C' : 'D';

  const r = { avgHappy, net };
  const title = TITLES.find((t) => t.if(s, r));
  return { parts, base, mult: birth.mult, total, grade, title, avgHappy, net, guests: funeralGuests(s) };
}

function funeralGuests(s) {
  const n = Math.max(0, Math.round(
    s.relation * 1.2 + s.kids.length * 10 + s.grandkids * 5 + (s.flags.everMarried ? 10 : 0)
    + (s.flags.debuted ? 400 : 0) + (s.achievements.includes('chairman') ? 1200 : 0) - (s.age >= 95 ? 30 : 0),
  ));
  let text;
  if (n <= 1) text = '조문객은 장례지도사 한 분이었습니다. 그분이 진심으로 울어 주셨습니다.';
  else if (n < 15) text = `조문객 ${n}명이 조용히 다녀갔습니다.`;
  else if (n < 80) text = `조문객 ${n}명이 다녀갔습니다. 육개장이 모자라지 않았습니다.`;
  else if (n < 300) text = `조문객 ${n}명이 다녀갔습니다. 육개장을 세 번 더 끓였습니다.`;
  else text = `조문객 ${n.toLocaleString()}명이 줄을 섰습니다. 장례식장 근처 편의점이 역대 최고 매출을 찍었습니다.`;
  return { n, text };
}
