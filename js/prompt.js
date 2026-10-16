// 한 사람의 인생을 한 장의 그림으로 그리기 위한 이미지 생성 프롬프트를 만듭니다.
// 그림 AI는 영어를 가장 정확하게 이해하므로 프롬프트는 영어로 만듭니다.

const PROMPT_EXCLUDED_JOBS = ['soldier', 'inmate', 'trainee', 'retired', 'resident'];

// 가장 오래 한 직업을 "일하는 장면"으로 추가합니다. (기록된 장면이 적을 때 그림이 비지 않도록)
function careerMoment(s) {
  const entries = Object.entries(s.career).filter(([job, years]) => !PROMPT_EXCLUDED_JOBS.includes(job) && years >= 3);
  if (!entries.length) return null;
  const [job, years] = entries.sort((a, b) => b[1] - a[1])[0];
  const start = s.careerStart[job] ?? 30;
  return { age: start + Math.floor(years / 2), ko: `${JOBS[job].name} ${years}년`, img: JOBS[job].img, w: 2.5 };
}

// 중요도(w)가 높은 장면을 고른 뒤 나이순으로 정렬합니다.
function selectMoments(s, max) {
  const all = s.moments.map((m, i) => ({ ...m, i }));
  const career = all.length < 4 ? careerMoment(s) : null;
  if (career) all.push({ ...career, i: all.length });
  return all
    .sort((a, b) => b.w - a.w || a.i - b.i)
    .slice(0, max)
    .sort((a, b) => a.age - b.age || a.i - b.i);
}

function promptMood(avgHappy) {
  if (avgHappy >= 65) return 'bright and joyful, golden sunlight and rich warm colors';
  if (avgHappy >= 50) return 'warm and nostalgic, a mix of sunny and cloudy skies along the road';
  if (avgHappy >= 38) return 'bittersweet, soft muted colors with patches of warm light';
  return 'mostly gray and rainy along the road, with small warm lights of hope shining here and there';
}

function buildImagePrompt(s, result) {
  const person = s.gender === 'M' ? 'man' : 'woman';
  const finalLook = s.age >= 60 ? `an elderly ${person}` : s.age >= 40 ? `a middle-aged ${person}` : `a young ${person}`;
  const birth = BIRTH_BY_ID[s.birthId];
  const death = DEATHS[s.death.cause];
  const moments = selectMoments(s, 6);

  const scenes = [
    `Birth: as a newborn, ${birth.img}.`,
    ...moments.map((m) => `Age ${m.age}: ${m.img}.`),
    `Age ${s.age}, the end of the road: ${death.img}.`,
  ];

  const extras = [];
  if (result.net >= 100000) extras.push('The surroundings become noticeably more luxurious as the road goes on.');
  if (result.net < 0) extras.push('Part of the road passes through a hard, stormy stretch before it continues.');
  if (s.kids.length) extras.push(`In the later scenes, ${s.kids.length === 1 ? 'a child' : `${s.kids.length} children`}${s.grandkids ? ' and grandchildren' : ''} walk alongside.`);
  if (s.flags.pet) extras.push('A loyal pet appears beside the person in several scenes.');

  return [
    `Create one wide illustration that tells the whole life story of a Korean ${person}, from birth to age ${s.age}.`,
    `Composition: a single winding road runs from the bottom-left corner (birth) to the top-right corner (the end of life). The same person appears several times along the road, aging naturally from a baby into ${finalLook}. Keep the face, hairstyle and signature clothing colors consistent so it clearly reads as one person.`,
    `Scenes along the road, in order:\n${scenes.map((t, i) => `${i + 1}. ${t}`).join('\n')}`,
    extras.join(' '),
    `Mood: ${promptMood(result.avgHappy)}. The feeling of this life in one phrase: "${result.title.en}".`,
    'Style: Korean webtoon art style, like a full-color panel from a slice-of-life webtoon: clean digital line art, soft cel shading, bright vivid colors, expressive faces with slightly exaggerated comedic reactions, warm and gently humorous, full of small everyday details, set in modern South Korea.',
    'Do not include any text, letters, numbers or speech bubbles. Wide 16:9 format.',
  ].filter(Boolean).join('\n\n');
}
