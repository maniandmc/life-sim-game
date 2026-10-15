// 사망 원인: 이름, 분류, 엔딩 문장, 묘비명 후보, 그림 프롬프트용 장면(img)
// img는 잔인하지 않게, 상징적인 장면으로 표현합니다.

const DEATHS = {
  // 자연사
  oldAge: {
    name: '노환', kind: '자연사',
    text: '오래 쓴 몸이 조용히 쉬기로 했습니다. 마지막 날 점심은 좋아하던 칼국수였습니다.',
    epitaph: ['잘 놀다 갑니다.', '오래 살아 보니 별거 없더라. 그래서 좋았다.', '다음 생에도 칼국수는 먹고 싶다.'],
    img: 'drifting off peacefully in a sunlit room surrounded by framed family photos',
  },

  // 질병
  heart: {
    name: '심근경색', kind: '질병',
    text: '갑자기 가슴을 움켜쥐었습니다. 구급차가 빨리 왔지만, 심장은 더 빨리 멈췄습니다.',
    epitaph: ['심장이 너무 열심히 일했다.', '이제 좀 쉬어도 된다.'],
    img: 'an empty armchair beside a window at dusk with a book left open on it',
  },
  stroke: {
    name: '뇌졸중', kind: '질병',
    text: '아침에 일어나 말을 하려는데 말이 나오지 않았습니다. 하고 싶은 말이 아직 많았습니다.',
    epitaph: ['하고 싶은 말이 많았는데.', '못다 한 말은 마음으로.'],
    img: 'an unfinished letter and a pen resting on a quiet wooden desk',
  },
  pneumonia: {
    name: '폐렴', kind: '질병',
    text: '가벼운 감기인 줄 알았던 기침이 폐렴이 되었습니다. 나이가 들면 감기도 만만하지 않습니다.',
    epitaph: ['따뜻하게 입고 다니세요.', '감기 조심.'],
    img: 'a warm knitted blanket folded on an empty hospital bed by a bright window',
  },
  dementia: {
    name: '치매 합병증', kind: '질병',
    text: '기억이 하나씩 떠나갔고, 마지막에는 몸도 따라갔습니다. 끝까지 기억한 건 어린 시절 살던 동네 골목이었습니다.',
    epitaph: ['다 잊어도 괜찮았다. 행복했던 건 몸이 기억했다.'],
    img: 'a gentle elder smiling at old photographs that slowly dissolve into warm light',
  },
  overwork: {
    name: '과로사', kind: '질병',
    text: '새벽 2시, 보고서 마지막 장을 저장하고 책상에 엎드렸습니다. 다시 일어나지 않았습니다.',
    epitaph: ['이제야 칼퇴합니다.', '보고서는 저장했습니다.'],
    img: 'a desk lamp still glowing in an empty office late at night beside a cold cup of coffee',
  },
  frail: {
    name: '지병 악화', kind: '질병',
    text: '어릴 때부터 약했던 몸이 결국 더 버티지 못했습니다. 그래도 참 오래 버텼습니다.',
    epitaph: ['약한 몸으로 참 오래 버텼다.'],
    img: 'a small potted flower blooming on a hospital windowsill',
  },
  liver: {
    name: '간경화', kind: '질병',
    text: '평생 마신 소주를 합치면 동네 수영장 하나는 채웠을 겁니다. 간이 먼저 은퇴했습니다.',
    epitaph: ['건배사는 내가 했다.', '마지막 잔은 사이다로.'],
    img: 'an empty soju glass turned upside down on a small table under a dim lamp',
  },
  lungCancer: {
    name: '폐암', kind: '질병',
    text: '담배를 끊으려고 했던 날이 모두 "내일"이었습니다. 폐는 기다려 주지 않았습니다.',
    epitaph: ['금연은 오늘부터.', '숨 한번 깊게 쉬고 싶었다.'],
    img: 'a crushed cigarette pack in a trash can beside a hospital window full of morning light',
  },
  liverCancer: {
    name: '간암', kind: '질병',
    text: '간은 침묵의 장기라고 합니다. 정말로 끝까지 아무 말도 하지 않았습니다.',
    epitaph: ['건강검진은 꼭 받으세요.'],
    img: 'a hospital bed by a window with a view of autumn trees',
  },
  stomachCancer: {
    name: '위암', kind: '질병',
    text: '"속이 좀 쓰린 것뿐"이라며 넘긴 날들이 쌓였습니다. 발견했을 때는 너무 늦었습니다.',
    epitaph: ['내시경은 2년마다.', '맛있게 먹었으면 됐다.'],
    img: 'a half-finished bowl of warm porridge on a hospital tray at sunset',
  },
  colonCancer: {
    name: '대장암', kind: '질병',
    text: '바쁘다는 이유로 미룬 검진이 마지막 기회였습니다.',
    epitaph: ['검진 미루지 마세요.'],
    img: 'a calendar on a hospital wall with an appointment circled in red',
  },
  infection: {
    name: '감염병', kind: '질병',
    text: '전염병이 유행하던 해, 결국 이겨 내지 못했습니다.',
    epitaph: ['손은 잘 씻었다.'],
    img: 'an empty hospital bench with sunlight streaming through a window',
  },

  // 사고
  carAccident: {
    name: '교통사고', kind: '사고',
    text: '빗길 교차로에서 사고가 났습니다. 너무 갑작스러운 이별이었습니다.',
    epitaph: ['안전운전 하세요. 진심입니다.'],
    img: 'a quiet rainy crossroad at night under a single streetlight',
  },
  drunkDriving: {
    name: '음주운전 사고', kind: '사고',
    text: '"가까운 거리니까 괜찮아." 그 가까운 거리가 마지막 길이 되었습니다.',
    epitaph: ['대리비 3만 원을 아끼지 말 것.'],
    img: 'car keys left on a pub table next to an untouched glass of water',
  },
  motorcycle: {
    name: '오토바이 사고', kind: '사고',
    text: '커브 길에서 속도를 줄이지 못했습니다. 헬멧은 친구 집에 두고 왔습니다.',
    epitaph: ['헬멧은 꼭 써라.'],
    img: 'a motorcycle helmet resting on a guardrail along a winding road at sunset',
  },
  industrial: {
    name: '산업재해', kind: '사고',
    text: '작업 현장에서 사고가 났습니다. 안전 장비가 하나만 더 있었어도 달랐을 겁니다.',
    epitaph: ['오늘도 무사히 퇴근하길.'],
    img: 'a hard hat resting on a steel beam at a quiet construction site at sunset',
  },

  // 무모한 도전
  drown: {
    name: '익사', kind: '무모한 도전',
    text: '계곡의 깊은 곳은 생각보다 훨씬 깊었습니다.',
    epitaph: ['수심 확인 필수.'],
    img: 'a pair of sandals left on a rock beside a calm mountain stream at dusk',
  },
  fall: {
    name: '등산 중 추락', kind: '무모한 도전',
    text: '등산 지도에 없는 지름길에는 다 이유가 있었습니다.',
    epitaph: ['정규 코스로 가세요.'],
    img: 'a lone hiking stick leaning against a signpost on a misty mountain trail',
  },
  everest: {
    name: '에베레스트 조난', kind: '무모한 도전',
    text: '정상이 보이는 곳에서 눈보라가 몰아쳤습니다. 산은 당신을 그곳에 남기기로 했습니다.',
    epitaph: ['그래도 꼭 가 보고 싶었다.'],
    img: 'colorful prayer flags fluttering on a snowy Himalayan ridge',
  },
  skydive: {
    name: '스카이다이빙 사고', kind: '무모한 도전',
    text: '낙하산이 펴지지 않았습니다. 확률 0.0007%의 주인공이 되었습니다.',
    epitaph: ['하늘을 날긴 날았다.'],
    img: 'an empty blue sky with a single small parachute drifting far above the clouds',
  },

  // 황당 사고 (아주 낮은 확률)
  ricecake: {
    name: '떡 먹다 질식', kind: '황당 사고',
    text: '설날, 가래떡을 한입에 넣었습니다. 아무도 말리지 않았습니다.',
    epitaph: ['떡은 꼭꼭 씹어 드세요.'],
    img: 'a festive Korean New Year table with a bowl of rice cake soup',
  },
  pufferfish: {
    name: '복어 독', kind: '황당 사고',
    text: '"자격증 있는 사장님이 직접 손질한다"던 그 집 사장님은 사실 자격증 시험 준비 중이었습니다.',
    epitaph: ['맛은 있었다.'],
    img: 'a cartoonishly puffed-up blowfish on a seaside restaurant sign',
  },
  selfie: {
    name: '셀카 찍다 추락', kind: '황당 사고',
    text: '인생샷을 위해 한 발짝만 더 물러섰습니다. 사진은 정말 잘 나왔습니다.',
    epitaph: ['사진은 잘 나왔다.'],
    img: 'a smartphone left on a cliffside viewpoint showing a perfect selfie',
  },
  meteor: {
    name: '운석 낙하', kind: '황당 사고',
    text: '운석이 지구에 떨어질 확률은 아주 낮습니다. 그 운석이 정확히 당신 집 마당에 떨어질 확률은 더 낮습니다. 축하합니다?',
    epitaph: ['이럴 거면 로또나 될 것이지.'],
    img: 'a comically oversized glowing meteor streaking across a peaceful evening sky',
  },
  hornet: {
    name: '말벌 쏘임', kind: '황당 사고',
    text: '추석 벌초를 하다가 말벌집을 건드렸습니다. 말벌들은 성묘 문화를 존중하지 않았습니다.',
    epitaph: ['벌초는 업체에 맡기세요.'],
    img: 'a quiet hillside family grave with freshly trimmed grass and one buzzing hornet',
  },
  vending: {
    name: '자판기 사고', kind: '황당 사고',
    text: '음료가 걸려서 자판기를 흔들었습니다. 자판기가 이겼습니다.',
    epitaph: ['그 음료, 결국 못 마셨다.'],
    img: 'an old vending machine on a street corner with one can stuck inside',
  },
};

const DEATH_KINDS = ['자연사', '질병', '사고', '무모한 도전', '황당 사고'];
