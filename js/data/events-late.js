// 은퇴 이후·자녀 이야기·노년 사건, 그리고 선택 없이 저절로 일어나는 운(auto) 사건

const RETIRABLE = [...EMPLOYEE_JOBS, 'doctor', 'coach', 'actor'];

function pickKid(s, test) {
  const kids = s.kids.filter(test);
  const kid = pick(kids);
  s.tmp.kid = kid.name;
  s.tmp.kidIndex = s.kids.indexOf(kid);
}

EVENTS.push(
  // ---------- 은퇴 ----------
  {
    id: 'retirement', age: [60, 80], priority: true,
    if: (s) => RETIRABLE.includes(s.job) && s.age >= (s.job === 'doctor' ? 65 : 60) && chance(s.age >= 63 ? 0.85 : 0.35),
    title: '정년퇴직',
    text: '마지막 출근 날입니다. 후배들이 꽃다발과 롤링페이퍼를 건넵니다. 롤링페이퍼의 절반이 "건강하세요"입니다.',
    choices: [
      {
        label: '푹 쉰다',
        result: '30년 만에 알람 없이 일어났습니다. 그런데 몸은 여전히 6시에 눈을 뜹니다.',
        effect: { happy: 5, run: retire, moment: { ko: '정년퇴직', img: 'holding a bouquet at a small office retirement party surrounded by younger coworkers', w: 2 } },
      },
      {
        label: '아파트 경비원으로 재취업한다',
        result: '경비실에 들어갔습니다. 이제 동네에서 택배 위치를 가장 잘 아는 사람입니다.',
        effect: { relation: 3, run: (s) => { retire(s); setJob(s, 'security'); } },
      },
      {
        label: '퇴직금으로 창업한다',
        result: '다들 말렸습니다. 그래서 더 하고 싶어졌습니다.',
        effect: { happy: 3, run: (s) => { retire(s); s.flags.wantBiz = true; } },
      },
      {
        label: '귀농한다',
        result: '시골에 작은 밭을 얻었습니다. 첫 수확한 감자가 마트 감자보다 작지만 열 배 맛있습니다.',
        effect: { happy: 6, health: 4, run: (s) => { retire(s); setJob(s, 'farmer'); }, moment: { ko: '은퇴 후 귀농', img: 'an elder digging up small potatoes in a sunny countryside field', w: 2 } },
      },
    ],
  },
  {
    id: 'ownerRetire', age: [62, 90], priority: true, once: false, cooldown: 3,
    if: (s) => s.business && chance(0.35),
    title: '가게를 넘길 때',
    text: '{biz}을(를) 한 지 오래됐습니다. 요즘 셔터를 올리는 팔이 예전 같지 않습니다.',
    choices: [
      {
        label: '가게를 넘기고 은퇴한다',
        result: '마지막 영업일에 단골들이 줄을 섰습니다. 셔터를 내리고 한참 가게 앞에 서 있었습니다.',
        effect: { happy: 4, run: (s) => { closeBusiness(s, 0.5); s.flags.pension = 600; setJob(s, 'retired'); } },
      },
      { label: '평생 사장으로 산다', result: '"내 가게에서 일하다 쓰러지는 게 꿈이야." 아무도 웃지 않았습니다.', effect: { happy: 2 } },
    ],
  },

  // ---------- 자녀 ----------
  {
    id: 'kidSuneung', age: [35, 80], once: false, cooldown: 1, priority: true,
    if: (s) => s.kids.some((k) => kidAge(s, k) === 18) && chance(0.6),
    prepare: (s) => pickKid(s, (k) => kidAge(s, k) === 18),
    title: '자녀의 수능',
    text: '{kid}의 수능 날입니다. 시험은 아이가 보는데, 당신이 새벽 4시에 눈을 떴습니다.',
    choices: [
      {
        label: '도시락을 정성껏 싼다',
        outcomes: [
          { w: 50, result: '{kid}의 성적표가 나왔습니다. 대박입니다. 당신의 카톡 프로필 사진이 합격증으로 바뀌었습니다.', effect: { happy: 10, relation: 4 } },
          { w: 50, result: '{kid}의 성적표를 보고 둘 다 말이 없었습니다. 그날 저녁 같이 치킨을 먹으며 "괜찮다"고 말해 줬습니다.', effect: { relation: 6 } },
        ],
      },
      { label: '부담 주지 않으려고 평소처럼 출근한다', result: '회사에서 하루 종일 수능 뉴스만 봤습니다. 일은 하나도 안 했습니다.', effect: { relation: 2 } },
    ],
  },
  {
    id: 'kidWedding', age: [45, 90], once: false, cooldown: 2, weight: 3,
    if: (s) => s.kids.some((k) => kidAge(s, k) >= 27 && kidAge(s, k) <= 40 && !k.married),
    prepare: (s) => pickKid(s, (k) => kidAge(s, k) >= 27 && kidAge(s, k) <= 40 && !k.married),
    title: '자녀의 결혼',
    text: '{kid}의 결혼 소식입니다. 상대 집안과 상견례 날짜가 잡혔습니다. 무슨 옷을 입을지 벌써 고민입니다.',
    choices: [
      {
        label: '신혼집 마련에 보태 준다',
        result: '목돈을 보탰습니다. {kid}의 신혼집 현관에 당신이 사 준 신발장이 놓였습니다.',
        effect: { money: -10000, relation: 8, happy: 6, run: (s) => { s.kids[s.tmp.kidIndex].married = true; } },
      },
      {
        label: '마음만 전한다',
        result: '축의금 봉투에 편지를 넣었습니다. {kid}의 배우자가 그 편지를 보고 먼저 울었습니다.',
        effect: { money: -500, relation: 3, happy: 5, run: (s) => { s.kids[s.tmp.kidIndex].married = true; } },
      },
      {
        label: '결혼을 반대한다',
        result: '반대했지만 결혼식은 예정대로 열렸습니다. 사진 속 당신 표정만 굳어 있습니다.',
        effect: { relation: -10, happy: -4, run: (s) => { s.kids[s.tmp.kidIndex].married = true; } },
      },
    ],
  },
  {
    id: 'kidLoan', age: [45, 85],
    if: (s) => s.kids.some((k) => kidAge(s, k) >= 25 && kidAge(s, k) <= 45) && s.money > 3000,
    prepare: (s) => pickKid(s, (k) => kidAge(s, k) >= 25 && kidAge(s, k) <= 45),
    title: '자녀의 부탁',
    text: '{kid}의 전화입니다. "사업을 시작하려는데… 조금만 빌려줄 수 있어?"',
    choices: [
      {
        label: '빌려준다',
        outcomes: [
          { w: 50, result: '3년 뒤 이자까지 붙여서 돌려받았습니다. 돈보다 그 성실함이 더 기뻤습니다.', effect: { money: 600, relation: 6, happy: 5 } },
          { w: 50, result: '사업이 잘 안 됐습니다. 돈은 돌려받지 못했지만, {kid}는 명절마다 조금 더 오래 머물다 갑니다.', effect: { money: -5000, relation: 3, happy: -3 } },
        ],
      },
      { label: '거절한다', result: '"네 힘으로 해 봐." 맞는 말이었지만, 전화를 끊고 오래 휴대폰을 쳐다봤습니다.', effect: { relation: -5 } },
    ],
  },
  {
    id: 'grandchild', age: [48, 95], once: false, cooldown: 3, weight: 4,
    if: (s) => s.kids.some((k) => k.married) && s.grandkids < 6,
    title: '손주 탄생',
    text: '손주가 태어났습니다! 신생아실 유리창 앞에서 당신이 제일 오래 서 있었습니다.',
    choices: [
      {
        label: '육아를 돕는다',
        result: '손주를 업고 동네를 한 바퀴 돌았습니다. 허리는 아프지만 입꼬리는 내려오지 않습니다.',
        effect: {
          happy: 8, relation: 6, health: -3, achieve: 'grandparent',
          run: (s) => {
            s.grandkids += 1;
            if (s.grandkids === 1) addMoment(s, { ko: '첫 손주', img: 'a beaming grandparent carrying a newborn grandchild on their back', w: 3 });
          },
        },
      },
      {
        label: '용돈만 두둑이 보낸다',
        result: '"우리 강아지 기저귀값." 봉투에 쓴 글씨가 삐뚤빼뚤합니다.',
        effect: {
          happy: 5, money: -300, relation: 3, achieve: 'grandparent',
          run: (s) => {
            s.grandkids += 1;
            if (s.grandkids === 1) addMoment(s, { ko: '첫 손주', img: 'a beaming grandparent holding a newborn grandchild in a hospital', w: 3 });
          },
        },
      },
    ],
  },

  // ---------- 노년 ----------
  {
    id: 'spouseDeath', age: [60, 110], priority: true,
    if: (s) => isMarried(s) && chance((s.age - 58) * 0.009),
    title: '먼저 떠난 사람',
    text: '{partner} 님이 먼저 떠났습니다. 식탁에 수저를 두 벌 놓았다가 한 벌을 다시 넣었습니다.',
    choices: [
      {
        label: '함께 걷던 산책로를 혼자 걷는다',
        result: '벤치에 앉아 둘이 찍은 사진을 오래 봤습니다. 사진 속 둘은 늘 같은 쪽으로 웃고 있습니다.',
        effect: { happy: -20, run: (s) => { s.partner = null; s.flags.widowed = true; }, moment: { ko: '배우자와의 이별', img: 'an elder sitting alone on a park bench holding an old photo of their spouse', w: 4 } },
      },
      {
        label: '자녀 집 근처로 이사한다', if: (s) => s.kids.length > 0,
        result: '자녀 집에서 걸어서 5분 거리로 이사했습니다. 저녁 반찬이 매일 문 앞에 걸려 있습니다.',
        effect: { happy: -14, relation: 6, run: (s) => { s.partner = null; s.flags.widowed = true; }, moment: { ko: '배우자와의 이별', img: 'an elder sitting alone on a park bench holding an old photo of their spouse', w: 4 } },
      },
    ],
  },
  {
    id: 'remarry', age: [55, 90],
    if: (s) => !s.partner && (s.flags.widowed || s.flags.divorced),
    prepare: (s) => { s.tmp.newName = anyName(); },
    title: '복지관 로맨스',
    text: '노인복지관 노래 교실에서 {newName} 님이 매번 옆자리에 앉습니다. 오늘은 귤을 하나 건넸습니다.',
    choices: [
      {
        label: '사귀어 본다',
        result: '둘이서 손잡고 노래 교실에 다닙니다. 복지관 단톡방이 발칵 뒤집혔습니다.',
        effect: { happy: 10, relation: 4, run: newPartner, moment: { ko: '황혼의 연애', img: 'two elders holding hands and singing together in a community center music class', w: 3 } },
      },
      { label: '마음만 고맙게 받는다', result: '귤은 맛있었습니다. 다음 주에는 당신이 사과를 하나 건넸습니다.', effect: { happy: 3, relation: 2 } },
    ],
  },
  {
    id: 'kiosk', age: [65, 95],
    title: '키오스크',
    text: '단골 국밥집에 키오스크가 생겼습니다. 화면 속 버튼이 너무 많습니다. 뒤에 줄이 생기기 시작합니다.',
    choices: [
      { label: '끝까지 도전한다', result: '15분 걸려 주문에 성공했습니다. 국밥을 시켰는데 아이스 아메리카노가 같이 나왔습니다.', effect: { smarts: 3, happy: 3 } },
      { label: '뒤에 선 학생에게 도움을 청한다', result: '학생이 10초 만에 주문해 줬습니다. 고마워서 국밥을 사 줬습니다.', effect: { relation: 4, money: -1 } },
      { label: '그냥 나간다', result: '옆 가게로 갔습니다. 거기도 키오스크였습니다.', effect: { happy: -3 } },
    ],
  },
  {
    id: 'smartphoneClass', age: [65, 92],
    title: '스마트폰 교실',
    text: '주민센터에서 스마트폰 교실이 열립니다. 손주에게 이모티콘을 보내는 게 목표입니다.',
    choices: [
      { label: '수강한다', result: '이모티콘을 마스터했습니다. 이제 모든 문장 끝에 꽃 이모티콘이 세 개씩 붙습니다.', effect: { smarts: 3, relation: 5, happy: 3 } },
      { label: '전화가 최고다', result: '"문자 말고 전화해라." 오늘도 가족 모두에게 전화를 돌렸습니다.', effect: { relation: 2 } },
    ],
  },
  {
    id: 'homeShopping', age: [60, 95], once: false, cooldown: 6,
    title: '홈쇼핑',
    text: '새벽 홈쇼핑에서 "마감 임박! 오늘만 이 가격!"이라고 외칩니다. 쇼호스트가 당신을 보는 것 같습니다.',
    choices: [
      { label: '전화를 건다', result: '안마의자가 도착했습니다. 거실의 절반을 차지합니다. 하루 20분, 인생이 행복합니다.', effect: { money: -300, happy: 5, health: 1 } },
      { label: '채널을 돌린다', result: '다른 채널도 홈쇼핑이었습니다. 이번엔 참았습니다. 내일은 모르겠습니다.', effect: { happy: 1 } },
    ],
  },
  {
    id: 'gateball', age: [65, 95], once: false, cooldown: 5,
    title: '게이트볼 대회',
    text: '동네 게이트볼 대회 결승전입니다. 상대 팀 주장은 50년 지기 친구입니다.',
    choices: [
      {
        label: '봐주지 않는다',
        outcomes: [
          { w: 50, result: '우승! 트로피를 들고 동네를 한 바퀴 돌았습니다. 친구는 사흘 동안 전화를 안 받았습니다.', effect: { happy: 6, relation: -2, health: 2 } },
          { w: 50, result: '아깝게 졌습니다. 친구가 저녁을 샀습니다. 진 게 이긴 것 같습니다.', effect: { happy: 3, relation: 3, health: 2 } },
        ],
      },
      { label: '살살 한다', result: '일부러 진 걸 친구가 눈치챘습니다. 둘이서 한참 웃었습니다.', effect: { relation: 5, health: 2 } },
    ],
  },
  {
    id: 'volunteer', age: [55, 90], once: false, cooldown: 4,
    title: '봉사 활동',
    text: '동네 무료 급식소에서 일손이 모자란다고 합니다.',
    choices: [
      {
        label: '봉사하러 간다',
        result: '설거지를 300개 했습니다. "고맙습니다" 소리를 300번 들었습니다.',
        effect: {
          happy: 5, relation: 5,
          run: (s) => {
            inc(s, 'volunteer');
            if (s.counters.volunteer >= 3 && !s.achievements.includes('volunteer')) {
              achieve(s, 'volunteer');
              addMoment(s, { ko: '오랜 봉사 활동', img: 'an elder in an apron serving warm soup at a community kitchen', w: 3 });
            }
          },
        },
      },
      { label: '후원금만 보낸다', result: '매달 5만 원씩 보내기로 했습니다. 급식소 소식지에 당신 이름이 작게 실렸습니다.', effect: { money: -60, happy: 2 } },
    ],
  },
  {
    id: 'seniorFall', age: [72, 110], once: false, cooldown: 5,
    title: '빙판길',
    text: '아침 산책길이 꽁꽁 얼었습니다. 오늘은 나갈까요?',
    choices: [
      {
        label: '그래도 산책은 해야지',
        outcomes: [
          { w: 70, result: '조심조심 걸었습니다. 펭귄처럼 걷는 법을 터득했습니다.', effect: { health: 2 } },
          { w: 30, result: '미끄러져 손목이 부러졌습니다. 깁스를 하고 손주에게 사인을 받았습니다.', effect: { health: -12 } },
        ],
      },
      { label: '집에서 맨손체조를 한다', result: 'TV 체조 프로그램을 따라 했습니다. 선생님보다 박수를 더 크게 쳤습니다.', effect: { health: 1 } },
    ],
  },
  {
    id: 'oldFriend', age: [68, 110], once: false, cooldown: 6,
    title: '친구의 부고',
    text: '50년 지기 친구의 부고 문자가 왔습니다. 단톡방에 남은 사람이 점점 줄어듭니다.',
    choices: [
      { label: '장례식장에 간다', result: '영정 사진 속 친구가 젊을 때 사진이라 웃음이 났습니다. 그 녀석다운 선택이었습니다.', effect: { happy: -6, relation: 2 } },
      { label: '남은 친구들에게 연락을 돌린다', result: '"이번 주에 밥 먹자." 미루지 않기로 했습니다.', effect: { happy: -3, relation: 5 } },
    ],
  },
  {
    id: 'will', age: [72, 110],
    title: '유언장',
    text: '변호사 사무실에 앉았습니다. "재산을 어떻게 나누시겠습니까?"',
    choices: [
      { label: '자녀들에게 공평하게 나눈다', if: (s) => s.kids.length > 0, result: '모두 똑같이 나눴습니다. 그래도 누군가는 서운해할 겁니다. 그게 가족입니다.', effect: { relation: 5, happy: 2 } },
      {
        label: '전 재산을 기부한다',
        result: '장학재단에 전 재산을 기부하기로 했습니다. 서명하는 손이 가벼웠습니다.',
        effect: { relation: 6, happy: 8, achieve: 'donor', set: { donor: true }, moment: { ko: '전 재산 기부 약속', img: 'signing a donation document for a scholarship foundation with a calm smile', w: 4 } },
      },
      { label: '반려동물에게 남긴다', if: (s) => !!s.flags.pet, result: '"{petName}에게 평생 간식을 보장할 것." 변호사가 진지하게 받아 적었습니다.', effect: { happy: 4, relation: -3 }, },
      { label: '아직은 쓸 때가 아니다', result: '"100살까지 살 건데 뭘." 변호사가 고개를 끄덕였습니다. 상담료는 받았습니다.', effect: { money: -30, happy: 2 } },
    ],
    prepare: (s) => { s.tmp.petName = s.flags.pet || ''; },
  },
  {
    id: 'dementia', age: [75, 110], priority: true,
    if: (s) => !s.flags.dementia && chance(0.035 + (s.smarts < 40 ? 0.02 : 0)),
    title: '깜빡깜빡',
    text: '요즘 자꾸 깜빡합니다. 오늘은 냉장고에서 TV 리모컨이 나왔습니다. 병원에서 치매 초기라고 합니다.',
    choices: [
      { label: '치료를 시작한다', result: '매일 약을 먹고 퍼즐을 풉니다. 퍼즐 실력은 손주보다 낫습니다.', effect: { money: -500, happy: -5, set: { dementia: true, dementiaCare: true } } },
      { label: '가족에게 털어놓는다', result: '가족들이 냉장고에 "리모컨은 거실에"라는 메모를 붙였습니다. 메모 옆에 하트도 그려져 있습니다.', effect: { happy: -6, relation: 6, set: { dementia: true } } },
    ],
  },
  {
    id: 'autobiography', age: [70, 105],
    title: '자서전',
    text: '손주가 "할머니 할아버지 어릴 때 얘기 써 주세요"라고 했습니다. 공책 한 권을 샀습니다.',
    choices: [
      { label: '솔직하게 쓴다', result: '부끄러운 이야기까지 다 썼습니다. 가족들이 돌려 읽으며 가장 많이 웃은 건 그 부분이었습니다.', effect: { happy: 6, relation: 5, smarts: 2 } },
      { label: '조금 미화해서 쓴다', result: '자서전 속 당신은 반장도 하고 첫사랑도 이뤘습니다. 아무도 따지지 않았습니다.', effect: { happy: 8 } },
    ],
  },
  {
    id: 'hundred', age: [100, 100], priority: true,
    title: '100세 생일',
    text: '100번째 생일입니다. 구청장님이 축하 화환을 보냈고, 지역 신문 기자가 장수 비결을 물어봅니다.',
    choices: [
      { label: '"규칙적인 생활이요"', result: '모범 답안을 말했습니다. 사실 비결은 매일 먹은 믹스커피였습니다.', effect: { happy: 8, relation: 4, moment: { ko: '100세 생일 잔치', img: 'a centenarian blowing out candles on a giant birthday cake surrounded by four generations', w: 5 } } },
      { label: '"그냥 안 죽었어요"', result: '그 대답이 기사 제목이 됐습니다. 전국에서 가장 많이 공유된 기사였습니다.', effect: { happy: 10, relation: 6, moment: { ko: '100세 생일 잔치', img: 'a centenarian laughing at a birthday party surrounded by four generations', w: 5 } } },
    ],
  },

  // ---------- 운 (선택 없이 저절로 일어나는 일) ----------
  {
    id: 'drawingContest', auto: true, age: [8, 13],
    title: '그림 대회',
    text: '교내 그림 대회에서 입상했습니다. 제목은 "우리 가족"인데, 강아지가 제일 크게 그려져 있습니다.',
    effect: { happy: 4 },
  },
  {
    id: 'distantRelative', auto: true, age: [20, 85], weight: 0.3,
    title: '먼 친척의 유산',
    text: '처음 듣는 이름의 먼 친척이 유산을 남기셨습니다. 장례식장에서 처음 뵀습니다. 영정 사진으로요.',
    effect: { money: 3000, happy: 3 },
  },
  {
    id: 'minorAccident', auto: true, age: [15, 90], once: false, cooldown: 10,
    title: '접촉 사고',
    text: '신호 대기 중에 뒤차가 들이받았습니다.',
    outcomes: [
      { w: 70, result: '목이 조금 뻐근합니다. 보험사 직원이 당신보다 더 친절했습니다.', effect: { health: -6, money: 300 } },
      { w: 30, result: '한 달 동안 입원했습니다. 병원 식단표를 다 외웠습니다.', effect: { health: -15, money: 800 } },
    ],
  },
  {
    id: 'houseFire', auto: true, age: [20, 95], weight: 0.2,
    title: '화재',
    text: '집에 불이 났습니다. 가족은 모두 무사했습니다. 앨범 한 권만 건졌는데, 그게 가장 중요한 거였습니다.',
    effect: { money: -2000, happy: -8 },
  },
  {
    id: 'economicCrisis', auto: true, age: [20, 90], once: false, cooldown: 12, weight: 0.7,
    title: '경제 위기',
    text: '경제 위기가 터졌습니다. 뉴스마다 "역대 최악"이라는 말이 나옵니다.',
    effect: {
      happy: -4,
      run: (s) => {
        if (s.money > 0) s.money = Math.round(s.money * 0.9);
        if (s.home > 0) s.home = Math.round(s.home * 0.85);
        if (s.business) s.business.hp = clamp(s.business.hp - 20, 0, 100);
      },
    },
  },
  {
    id: 'pandemic', auto: true, age: [8, 110], weight: 0.5,
    title: '전염병 대유행',
    text: '전염병이 전 세계에 유행합니다. 마스크가 생필품이 됐습니다.',
    outcomes: [
      { w: (s) => (s.age >= 75 ? 6 : 0), result: '결국 감염됐습니다.', effect: { death: 'infection' } },
      {
        w: 94, result: '2년 동안 집에서 빵을 굽고 화분을 키웠습니다. 빵은 실패했고 화분은 살아남았습니다.',
        effect: { health: -4, happy: -5, run: (s) => { if (s.business) s.business.hp = clamp(s.business.hp - 25, 0, 100); } },
      },
    ],
  },
  {
    id: 'lostWallet', auto: true, age: [12, 85],
    title: '잃어버린 지갑',
    text: '지갑을 잃어버렸습니다.',
    outcomes: [
      { w: 60, result: '사흘 뒤 우체통으로 돌아왔습니다. 현금만 빼고요. 그래도 신분증이 돌아와서 감사했습니다.', effect: { money: -10 } },
      { w: 40, result: '찾았습니다. 냉장고 안에 있었습니다.', effect: { happy: 1 } },
    ],
  },
  {
    id: 'lotteryWin', auto: true, age: [25, 90], weight: 0.006,
    title: '로또 1등',
    text: '로또 1등에 당첨됐습니다! 은행 직원이 "다들 처음엔 침착하세요"라고 했습니다. 당신은 침착하지 못했습니다.',
    effect: { money: 200000, happy: 20, achieve: 'lottery', moment: { ko: '로또 1등 당첨', img: 'trembling hands holding a winning lottery ticket in front of a tiny corner store', w: 5 } },
  },
  {
    id: 'strayCat', auto: true, age: [10, 80], weight: 0.4,
    if: (s) => !s.flags.pet,
    title: '길고양이',
    text: '길고양이가 집 앞까지 따라왔습니다. 문을 열어 주자 원래 자기 집인 듯 들어왔습니다. 이름은 나비로 정했습니다.',
    effect: { happy: 5, run: (s) => { s.flags.pet = '나비'; s.flags.petSince = s.age; } },
  },
  {
    id: 'housePrice', auto: true, age: [30, 100], once: false, cooldown: 6, weight: 1.5,
    if: (s) => s.home > 0,
    title: '집값',
    outcomes: [
      { w: 45, result: '집값이 20% 올랐습니다. 팔 생각은 없지만 하루에 세 번 시세를 확인합니다.', effect: { happy: 4, run: (s) => { s.home = Math.round(s.home * 1.2); } } },
      { w: 30, result: '집값이 15% 떨어졌습니다. 아파트 단톡방 분위기가 장례식장 같습니다.', effect: { happy: -4, run: (s) => { s.home = Math.round(s.home * 0.85); } } },
      { w: 25, result: '집값이 그대로입니다. 뉴스에서는 오른다는데 우리 동네만 조용합니다.', effect: {} },
    ],
  },
);
