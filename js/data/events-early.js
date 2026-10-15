// 0~19세 사건: 영유아, 초등학생, 중·고등학생, 수능과 진학
//
// 사건 형식
//   id, age: [최소, 최대], title, text, choices
//   once: false  → 여러 번 일어날 수 있음 (cooldown: 다시 일어나기까지 최소 햇수)
//   priority: true → 조건이 맞으면 그해에 반드시 일어남
//   if: (s) => 조건, weight: 일어날 가중치, prepare: (s) => 사건 시작 시 준비
//   선택지: { label, if, result, effect } 또는 { label, outcomes: [{ w, result, effect }] }

EVENTS.push(
  // ---------- 영유아 (0~6세) ----------
  {
    id: 'dol', age: [1, 1], priority: true,
    title: '돌잡이',
    text: '돌상 위에 실, 연필, 5만 원, 마이크, 청진기가 놓였습니다. 어른들이 숨을 죽입니다.',
    choices: [
      { label: '실을 잡는다', result: '오래 살라는 뜻이랍니다. 할머니가 박수를 치다가 우셨습니다.', effect: { health: 5 } },
      { label: '연필을 잡는다', result: '공부 잘하라는 뜻입니다. 엄마는 그날 밤 학원 전단지를 검색했습니다.', effect: { smarts: 5 } },
      { label: '5만 원을 잡는다', result: '친척들이 환호합니다. 손에 쥔 5만 원은 3초 만에 엄마가 회수했습니다.', effect: { happy: 3, set: { dolMoney: true } } },
      { label: '마이크를 잡는다', result: '연예인 될 상이랍니다. 삼촌이 미리 사인을 받아 갔습니다.', effect: { happy: 3, set: { wantsStar: true } } },
      {
        label: '청진기를 잡는다',
        result: (s) => (s.flags.proParents
          ? '"역시 피는 못 속인다"는 말이 나왔습니다. 아빠가 조용히 미소 지었습니다.'
          : '"의사 될 상"이랍니다. 집안에 의사는 한 명도 없지만 다들 진지합니다.'),
        effect: { smarts: 2, set: { wantsDoctor: true } },
      },
    ],
  },
  {
    id: 'firstWord', age: [1, 2],
    title: '첫 단어',
    text: '당신이 드디어 첫 단어를 말하려고 합니다. 온 가족이 휴대폰 카메라를 켰습니다.',
    choices: [
      { label: '"엄마"', result: '엄마가 그 영상을 47번 돌려 봤습니다.', effect: { relation: 3 } },
      { label: '"아빠"', result: '아빠가 회사 단톡방에 영상을 올렸습니다. 부장님만 읽고 답이 없습니다.', effect: { relation: 3 } },
      {
        label: (s) => (s.flags.familyShop ? '"치킨"' : '"까까"'),
        result: '현실적인 첫 단어입니다. 가족들은 웃었지만 조금 서운해했습니다.',
        effect: { happy: 4 },
      },
    ],
  },
  {
    id: 'daycare', age: [3, 3], priority: true,
    if: (s) => !s.flags.orphan,
    title: '어린이집 갈래?',
    text: '세 살이 되었습니다. 집에서 계속 지낼지, 어린이집에 갈지 정할 때입니다.',
    choices: [
      { label: '어린이집에 간다', result: '첫 달에 감기를 일곱 번 걸렸지만, 친구도 일곱 명 생겼습니다.', effect: { relation: 5, health: -2 } },
      { label: '집에서 지낸다', result: '낮잠의 달인이 되었습니다. 하루 일과의 40%가 간식 시간입니다.', effect: { happy: 4, health: 2, relation: -2 } },
      {
        label: '영어유치원에 간다', if: (s) => family(s) >= 3,
        result: '"Teacher, 쉬 마려워요"를 유창하게 구사합니다.',
        effect: { smarts: 5, happy: -3 },
      },
    ],
  },
  {
    id: 'fever', age: [2, 6],
    title: '한밤중의 고열',
    text: '새벽 2시, 열이 40도까지 올랐습니다. 보호자가 체온계를 세 번째 다시 재고 있습니다.',
    choices: [
      { label: '응급실로 간다', result: '응급실에서 4시간을 기다렸습니다. 다행히 큰 병은 아니었고, 막대사탕을 두 개 받았습니다.', effect: { health: 3 } },
      {
        label: '해열제를 먹고 지켜본다',
        outcomes: [
          { w: 80, result: '다음 날 아침, 언제 아팠냐는 듯 거실을 뛰어다닙니다.', effect: { health: -2 } },
          { w: 20, result: '폐렴이었습니다. 일주일 입원했는데, 병원 밥을 꽤 좋아했습니다.', effect: { health: -12 } },
        ],
      },
    ],
  },
  {
    id: 'sibling', age: [2, 6], weight: 0.7,
    if: (s) => !s.flags.orphan && !s.flags.singleParent,
    title: '동생이 생겼다',
    text: '동생이 태어났습니다. 모든 사람의 관심이 동생에게 쏠립니다. 당신은 처음으로 "질투"를 배웁니다.',
    choices: [
      { label: '아끼는 장난감을 동생에게 준다', result: '어른들이 "다 컸다"며 칭찬했습니다. 장난감은 10분 만에 침 범벅이 됐습니다.', effect: { relation: 5, set: { sibling: true } } },
      { label: '동생 볼을 몰래 꼬집는다', result: '들켰습니다. 동생보다 당신이 더 크게 울었습니다.', effect: { happy: 2, relation: -2, set: { sibling: true } } },
    ],
  },
  {
    id: 'talent', age: [5, 6],
    prepare: (s) => {
      s.tmp.talent = hasTrait(s, 'musical') ? '피아노' : hasTrait(s, 'athletic') ? '달리기' : hasTrait(s, 'genius') ? '숫자' : '그림';
    },
    title: '재능 발견',
    text: '유치원 선생님이 말합니다. "아이가 {talent}에 재능이 있는 것 같아요."',
    choices: [
      {
        label: '학원에 보낸다',
        result: '주 3회 학원 생활이 시작됐습니다. 여섯 살 인생에 일정표가 생겼습니다.',
        effect: { happy: -2, run: (s) => { s.flags.talentTrained = true; if (s.tmp.talent === '달리기') s.health = clamp(s.health + 4, 0, 100); else s.smarts = clamp(s.smarts + 4, 0, 100); } },
      },
      { label: '그냥 마음껏 놀게 둔다', result: '재능은 놀이터 모래성 건축에 쓰이고 있습니다. 꽤 웅장합니다.', effect: { happy: 6 } },
    ],
  },
  {
    id: 'lostMart', age: [4, 6],
    title: '마트 미아',
    text: '대형마트에서 정신을 차려 보니 보호자가 보이지 않습니다.',
    choices: [
      { label: '안내 데스크로 간다', result: '"엄마 이름이 뭐니?" "엄마요." 결국 안내 방송은 "엄마를 찾습니다"로 나갔습니다.', effect: { smarts: 3 } },
      { label: '시식 코너를 돈다', result: '보호자가 당신을 찾았을 때, 당신은 만두 시식 7회차였습니다.', effect: { happy: 5, health: 1 } },
    ],
  },
  {
    id: 'playRole', age: [5, 6],
    title: '유치원 학예회',
    text: '학예회 연극 배역을 정합니다. 주인공 자리는 하나, 나무 역할은 다섯입니다.',
    choices: [
      {
        label: '주인공에 도전한다',
        outcomes: [
          { w: (s) => 40 + (hasTrait(s, 'leader') || hasTrait(s, 'attractive') ? 30 : 0), result: '주인공을 맡았고 대사도 완벽했습니다. 객석에서 할머니가 기립 박수를 쳤습니다.', effect: { happy: 6, relation: 3 } },
          { w: 40, result: '무대에서 대사를 까먹고 "엄마!"라고 외쳤습니다. 그날 공연에서 가장 큰 박수를 받았습니다.', effect: { happy: 2 } },
        ],
      },
      { label: '나무 3을 맡는다', result: '바람에 흔들리는 연기가 일품이었다는 평을 들었습니다.', effect: { happy: 3 } },
    ],
  },

  // ---------- 초등학생 (7~12세) ----------
  {
    id: 'schoolDay1', age: [7, 7], priority: true,
    title: '초등학교 입학',
    text: '초등학교 입학식입니다. 가방이 당신보다 큽니다. 옆자리 짝꿍이 당신을 쳐다봅니다.',
    choices: [
      { label: '짝꿍에게 먼저 말을 건다', result: '"너 무슨 포켓몬 좋아해?" 그 한마디로 6년 우정이 시작됐습니다.', effect: { relation: 5 } },
      { label: '조용히 앞만 본다', result: '선생님 말씀을 한 글자도 놓치지 않았습니다. 짝꿍 이름은 한 달 뒤에 알았습니다.', effect: { smarts: 3 } },
      { label: '울면서 보호자를 찾는다', result: '3교시까지 울었고, 4교시에 급식 메뉴를 보고 그쳤습니다.', effect: { relation: 1, happy: -1 } },
    ],
  },
  {
    id: 'academy', age: [8, 9],
    title: '학원 몇 개 다닐래?',
    text: '같은 반 친구들은 벌써 학원을 네 개씩 다닙니다. 보호자가 학원 전단지를 펼쳐 놓았습니다.',
    choices: [
      { label: '학원은 안 다닌다', result: '놀이터의 지배자가 되었습니다. 동네 모든 술래잡기 규칙을 당신이 정합니다.', effect: { happy: 8, smarts: -2, health: 2 } },
      { label: '두 개만 다닌다', result: '영어와 태권도. 균형 잡힌 초등학생의 정석입니다.', effect: { smarts: 4, health: 1, happy: -1 } },
      {
        label: '여섯 개 다닌다', if: (s) => family(s) >= 2,
        result: '하교 후 집에 오는 시간이 밤 10시입니다. 편의점 삼각김밥 맛 감별사가 되었습니다.',
        effect: { smarts: 10, happy: -10, health: -3 },
      },
    ],
  },
  {
    id: 'classPresident', age: [9, 12],
    title: '반장 선거',
    text: '반장 선거가 열립니다. 친구들이 당신을 쳐다봅니다.',
    choices: [
      {
        label: '출마한다',
        outcomes: [
          { w: (s) => s.relation + (hasTrait(s, 'leader') ? 40 : 0), result: '당선! 공약이었던 "급식 디저트 2개"는 끝내 지키지 못했습니다.', effect: { happy: 6, relation: 4, achieve: 'president', set: { president: true } } },
          { w: 50, result: '2표 차이로 졌습니다. 그 2표 중 하나는 상대 후보를 찍은 당신의 표였습니다.', effect: { happy: -3 } },
        ],
      },
      { label: '친한 친구를 밀어준다', result: '선거운동원으로 맹활약했습니다. 정치는 뒤에서 하는 거라는 걸 배웠습니다.', effect: { relation: 4 } },
    ],
  },
  {
    id: 'gameOrFriends', age: [10, 12],
    title: '방과 후',
    text: '수업이 끝났습니다. 오늘 방과 후에는 무엇을 할까요?',
    choices: [
      { label: '게임 랭크를 올린다', result: '랭크는 다이아가 됐고, 시력은 0.3이 됐습니다.', effect: { happy: 5, health: -2, relation: -2, set: { gamer: true } } },
      { label: '친구들과 축구를 한다', result: '무릎에 훈장 같은 상처가 늘어갑니다. 친구도 늘어갑니다.', effect: { health: 4, relation: 4 } },
      { label: '도서관에 간다', result: '사서 선생님이 당신 이름을 외웠습니다. 당신은 서가 배치를 외웠습니다.', effect: { smarts: 5 } },
    ],
  },
  {
    id: 'bullied', age: [9, 13],
    weight: (s) => (hasTrait(s, 'shy') || s.flags.multicultural ? 1.5 : 0.5),
    title: '외톨이',
    text: '반 아이들이 당신만 빼고 단톡방을 만들었습니다. 점심시간이 유난히 깁니다.',
    choices: [
      { label: '선생님께 알린다', result: '상황은 조금 나아졌습니다. 그리고 용기를 낸 자신이 조금 더 좋아졌습니다.', effect: { happy: -2, relation: 2 } },
      { label: '집에 털어놓는다', result: '그날 저녁 식탁에 당신이 제일 좋아하는 반찬만 올라왔습니다. 말없이 든든했습니다.', effect: { happy: -1, relation: 4 } },
      { label: '혼자 참는다', result: '아무 일 없다는 듯 1년을 버텼습니다. 그 1년은 생각보다 오래 기억에 남았습니다.', effect: { happy: -8, smarts: 2 } },
    ],
  },
  {
    id: 'gifted', age: [10, 11],
    if: (s) => s.smarts >= 62,
    title: '영재원 시험',
    text: '담임 선생님이 영재원 시험을 권했습니다. 시험은 다음 주 토요일입니다.',
    choices: [
      {
        label: '시험을 본다',
        outcomes: [
          { w: (s) => s.smarts - 40, result: '합격! 그날부터 보호자의 카톡 프로필 사진이 합격증으로 바뀌었습니다.', effect: { smarts: 6, happy: 4, achieve: 'gifted' } },
          { w: 40, result: '떨어졌습니다. 시험지 뒷면에 그린 낙서는 꽤 훌륭했습니다.', effect: { smarts: 1, happy: -2 } },
        ],
      },
      { label: '토요일은 노는 날이다', result: '그 토요일, 동네 개울에서 가재를 세 마리 잡았습니다.', effect: { happy: 4 } },
    ],
  },
  {
    id: 'parentsDivorce', age: [7, 14], weight: 0.35,
    if: (s) => !s.flags.orphan && !s.flags.singleParent && !s.flags.grandma,
    title: '부모님의 이혼',
    text: '부모님이 당신을 조용히 앉혀 놓고 말합니다. "엄마랑 아빠가 따로 살게 됐어."',
    choices: [
      { label: '엄마와 산다', result: '집이 두 개가 됐습니다. 생일 케이크도 두 개가 됐습니다. 이건 좋습니다.', effect: { happy: -10, relation: -2, set: { parentsDivorced: true } } },
      { label: '아빠와 산다', result: '아빠의 요리 실력이 매주 조금씩 늘고 있습니다. 아직은 라면이 주력입니다.', effect: { happy: -10, relation: -2, set: { parentsDivorced: true } } },
      { label: '방문을 쾅 닫는다', result: '그날 밤, 엄마도 아빠도 당신 방문 앞을 오래 서성였습니다.', effect: { happy: -12, relation: -5, set: { parentsDivorced: true } } },
    ],
  },
  {
    id: 'firstPhone', age: [10, 11],
    title: '첫 스마트폰',
    text: '반에서 스마트폰이 없는 사람은 당신 포함 두 명뿐입니다.',
    choices: [
      {
        label: '최신 폰을 사 달라고 조른다',
        outcomes: [
          { w: (s) => family(s) * 20, result: '최신 폰을 받았습니다! 사흘 만에 액정 보호 필름에 금이 갔습니다.', effect: { happy: 6, relation: 2 } },
          { w: 40, result: '사촌 형이 쓰던 3년 된 폰을 받았습니다. 액정 금이 정확히 화면 한가운데에 있습니다.', effect: { happy: 1 } },
        ],
      },
      { label: '폰 없이 버틴다', result: '단톡방에 초대받지 못한 채 초등학교를 졸업했습니다. 대신 책을 120권 읽었습니다.', effect: { smarts: 4, relation: -3 } },
    ],
  },
  {
    id: 'transfer', age: [8, 15], once: false, cooldown: 3,
    if: (s) => s.flags.militaryFamily,
    title: '또 전학',
    text: '아빠가 또 발령을 받았습니다. 새 학교, 새 교실, 새 자기소개입니다.',
    choices: [
      { label: '먼저 다가간다', result: '전학 첫날 반 친구 다섯 명의 생일을 외웠습니다. 전학 경력직의 노하우입니다.', effect: { relation: 5, happy: -1 } },
      { label: '어차피 또 떠날 테니 마음을 닫는다', result: '혼자 있는 시간에 공부가 늘었습니다. 마음 한쪽이 조금 허전합니다.', effect: { relation: -4, smarts: 3 } },
    ],
  },
  {
    id: 'diary', age: [7, 12], once: false, cooldown: 3,
    title: '여름방학 일기',
    text: '개학이 내일입니다. 방학 일기는 아직 한 줄도 안 썼습니다.',
    choices: [
      { label: '오늘 밤에 한 번에 쓴다', result: '7월 23일부터 8월 25일까지 날씨가 모두 "맑음"입니다. 선생님은 아무 말도 하지 않았습니다.', effect: { happy: 2 } },
      { label: '솔직하게 못 썼다고 한다', result: '혼났지만 마음이 편했습니다. 정직함 스탯이 있었다면 올랐을 겁니다.', effect: { relation: 2 } },
    ],
  },
  {
    id: 'countrySchool', age: [8, 12],
    if: (s) => s.flags.rural,
    title: '전교생 12명',
    text: '면 단위 초등학교의 전교생은 12명입니다. 운동회 준비가 시작됐습니다.',
    choices: [
      { label: '축구 대표로 뛴다', result: '전교생이 모두 주전입니다. 후보 선수는 없습니다. 교장 선생님이 골키퍼입니다.', effect: { health: 5, relation: 5 } },
      {
        label: '군 과학 경시대회에 나간다',
        outcomes: [
          { w: (s) => s.smarts, result: '군 대회 1등! 마을 입구에 현수막이 걸렸습니다. 이장님이 직접 다셨습니다.', effect: { smarts: 6, happy: 5 } },
          { w: 50, result: '아쉽게 입상하지 못했습니다. 대신 읍내 짜장면을 먹고 왔습니다.', effect: { happy: 2 } },
        ],
      },
    ],
  },

  // ---------- 출생 환경별 이야기 ----------
  {
    id: 'grandmaSick', age: [12, 18],
    if: (s) => s.flags.grandma,
    title: '할머니가 편찮으시다',
    text: '할머니가 요즘 자주 누워 계십니다. 시험 기간이 다가오고 있습니다.',
    choices: [
      {
        label: '할머니 곁을 지킨다',
        result: '할머니가 "공부는 나중에 해도 된다"고 하셨습니다. 할머니 말씀은 대체로 맞았습니다.',
        effect: { relation: 8, smarts: -3, set: { caredGrandma: true }, moment: { ko: '아픈 할머니 곁을 지킴', img: 'a teenager reading aloud to a frail grandmother in a warm old room', w: 3 } },
      },
      { label: '시험공부에 집중한다', result: '성적은 올랐습니다. 할머니는 성적표를 냉장고에 붙여 두셨습니다.', effect: { smarts: 5, relation: -2 } },
    ],
  },
  {
    id: 'grandmaFarewell', age: [14, 24],
    if: (s) => s.flags.grandma && s.seen.grandmaSick !== undefined && s.age - s.seen.grandmaSick >= 2,
    title: '할머니와의 이별',
    text: '할머니가 돌아가셨습니다. 부엌에는 할머니가 담가 두신 김치가 아직 세 통 남아 있습니다.',
    choices: [
      { label: '할머니의 레시피 노트를 챙긴다', result: '삐뚤빼뚤한 글씨로 "간은 손맛으로"라고 적혀 있습니다. 끝까지 비법은 안 알려 주셨습니다.', effect: { happy: -8, relation: 3 } },
      { label: '울지 않으려고 애쓴다', result: '장례식에서는 참았습니다. 김치 마지막 통을 열던 날, 결국 울었습니다.', effect: { happy: -12 } },
    ],
  },
  {
    id: 'debtCollector', age: [8, 14],
    if: (s) => s.flags.familyDebt,
    title: '초인종',
    text: '혼자 집에 있는데 누가 초인종을 누릅니다. 목소리가 낯설고 큽니다. 빚을 받으러 온 사람입니다.',
    choices: [
      { label: '집에 없는 척한다', result: '숨 참기 실력이 늘었습니다. 수영에 소질이 생길지도 모릅니다.', effect: { happy: -3, health: 1 } },
      { label: '문을 열고 "아빠 없어요"라고 말한다', result: '아저씨가 한참 서 있다가 사탕을 주고 갔습니다. 빚쟁이도 누군가의 아빠였습니다.', effect: { happy: -4, relation: 2 } },
    ],
  },
  {
    id: 'stepParent', age: [8, 15],
    if: (s) => s.flags.singleParent,
    title: '엄마의 재혼',
    text: '엄마가 어떤 아저씨를 소개합니다. "앞으로 같이 살게 될 분이야." 아저씨가 긴장해서 땀을 흘립니다.',
    choices: [
      { label: '반갑게 인사한다', result: '새아빠의 아재 개그는 최악이지만, 마음은 최고입니다. 집에 웃음소리가 늘었습니다.', effect: { relation: 6, happy: 5, set: { stepFamily: true } } },
      { label: '대놓고 반대한다', result: '1년 동안 말을 섞지 않았습니다. 그래도 아저씨는 매일 아침 도시락을 싸 줬습니다.', effect: { relation: -5, happy: -4 } },
    ],
  },
  {
    id: 'discrimination', age: [8, 14],
    if: (s) => s.flags.multicultural,
    title: '말투 흉내',
    text: '반 친구가 엄마의 한국어 말투를 흉내 내며 웃습니다.',
    choices: [
      { label: '당당하게 맞선다', result: '"우리 엄마는 2개 국어 해. 너는?" 교실이 조용해졌습니다.', effect: { relation: 3, happy: 3 } },
      { label: '못 들은 척한다', result: '집에 와서 엄마에게 아무 말도 하지 않았습니다. 엄마는 이미 알고 있었던 것 같습니다.', effect: { happy: -6 } },
    ],
  },
  {
    id: 'vietnamTrip', age: [9, 16],
    if: (s) => s.flags.multicultural,
    title: '외가에 가는 여름',
    text: '이번 여름방학에 베트남 외가에 갈 수 있다고 합니다. 학원 보강 일정과 겹칩니다.',
    choices: [
      {
        label: '외가에 간다',
        result: '외할머니가 망고를 하루에 여섯 개씩 깎아 주셨습니다. 베트남어 실력이 폭발적으로 늘었습니다.',
        effect: { happy: 7, relation: 5, set: { bilingual: true }, moment: { ko: '베트남 외가에서 보낸 여름', img: 'eating mangoes with grandparents on a riverside porch in Vietnam', w: 3 } },
      },
      { label: '학원 보강을 듣는다', result: '수학 점수는 올랐습니다. 외할머니는 영상통화로 망고를 보여 주셨습니다.', effect: { smarts: 3, happy: -4 } },
    ],
  },
  {
    id: 'celebScandal', age: [10, 16],
    if: (s) => s.flags.celebParents,
    title: '엄마가 실검 1위',
    text: '엄마의 열애설 기사가 떴습니다. 아빠도 기사를 보고 처음 알았다고 합니다. 오보이길 바랍니다.',
    choices: [
      { label: '학교에 당당하게 간다', result: '"너희 엄마 기사 봤어"라는 말을 하루에 열여섯 번 들었습니다. 오보였습니다.', effect: { relation: 2, happy: -4 } },
      { label: '며칠 학교를 쉰다', result: '집에서 엄마와 떡볶이를 시켜 먹었습니다. 오보였고, 엄마는 고소장을 썼습니다.', effect: { happy: -1, smarts: -2, relation: 2 } },
    ],
  },
  {
    id: 'orphanSponsor', age: [9, 15],
    if: (s) => s.flags.orphan,
    title: '후원자의 편지',
    text: '얼굴 모르는 후원자에게서 편지가 왔습니다. "늘 응원하고 있어요."',
    choices: [
      { label: '정성껏 답장을 쓴다', result: '편지를 열 번 고쳐 썼습니다. 그 뒤로 매년 생일마다 카드가 옵니다.', effect: { relation: 5, happy: 4, set: { sponsor: true } } },
      { label: '쑥스러워서 답장하지 않는다', result: '편지는 서랍 맨 아래에 고이 넣어 두었습니다. 가끔 꺼내 읽습니다.', effect: { happy: 2 } },
    ],
  },
  {
    id: 'medPressure', age: [15, 17],
    if: (s) => s.flags.proParents,
    title: '"의대 가야지"',
    text: '저녁 식탁에서 아빠가 말합니다. "너도 의대 가야지." 당신은 다른 꿈이 있습니다.',
    choices: [
      { label: '알겠다고 한다', result: '그날부터 독서실 마감 시간까지 공부했습니다. 꿈은 일기장에만 적었습니다.', effect: { smarts: 5, happy: -5, set: { wantsDoctor: true } } },
      { label: '내 꿈을 말한다', result: '식탁이 3분간 조용했습니다. 그리고 엄마가 "그래, 한번 해 봐"라고 했습니다.', effect: { happy: 6, relation: -2, set: { ownDream: true } } },
    ],
  },
  {
    id: 'cityOrFarm', age: [17, 17], priority: true,
    if: (s) => s.flags.rural,
    title: '서울로 갈까?',
    text: '친구들은 하나둘 서울로 떠날 준비를 합니다. 아버지는 말없이 경운기를 닦고 계십니다.',
    choices: [
      { label: '서울로 간다', result: '"서울 가면 코 베어 간다"는 할머니 말씀을 가슴에 새겼습니다. 코는 무사합니다.', effect: { smarts: 3, happy: -2, set: { leftHome: true } } },
      {
        label: '고향에 남아 농사를 배운다',
        result: '스마트폰으로 날씨 앱 다섯 개를 비교하는 신세대 농부가 되었습니다.',
        effect: { happy: 5, health: 3, job: 'farmer', set: { track: 'farm' } },
      },
    ],
  },

  // ---------- 청소년 (13~19세) ----------
  {
    id: 'puberty', age: [13, 14],
    title: '사춘기',
    text: '이유 없이 모든 게 짜증 납니다. 거울 속 여드름이 당신을 비웃습니다.',
    choices: [
      { label: '방문을 걸어 잠근다', result: '방문에 "노크 필수"라고 써 붙였습니다. 엄마는 노크하고 바로 엽니다.', effect: { happy: 2, relation: -4 } },
      { label: '부모님과 대화해 본다', result: '대화는 3분 만에 잔소리로 바뀌었지만, 그래도 시도는 했습니다.', effect: { relation: 4 } },
      { label: '일기장에 시를 쓴다', result: '10년 뒤 이 시를 발견하고 이불을 찹니다.', effect: { smarts: 3, happy: 2 } },
    ],
  },
  {
    id: 'firstLove', age: [14, 17],
    title: '첫사랑',
    text: '같은 반 친구가 자꾸 눈에 밟힙니다. 그 친구가 지나가면 심장이 쿵쾅거립니다.',
    choices: [
      {
        label: '고백한다',
        outcomes: [
          {
            w: (s) => s.relation + (hasTrait(s, 'attractive') ? 30 : 0),
            result: '받아 줬습니다! 첫 데이트는 떡볶이집이었는데, 둘 다 한마디도 못 했습니다.',
            effect: { happy: 10, relation: 4, achieve: 'firstLove', moment: { ko: '첫사랑과 떡볶이 데이트', img: 'two shy teenagers in school uniforms sharing tteokbokki at a tiny snack bar', w: 2 } },
          },
          { w: 50, result: '"우리 그냥 친구로 지내자." 이 문장을 평생 기억하게 됩니다.', effect: { happy: -6 } },
        ],
      },
      { label: '마음속에 묻어 둔다', result: '졸업식 날까지 말하지 못했습니다. 그 노래만 들으면 아직도 생각납니다.', effect: { happy: -2, smarts: 2 } },
    ],
  },
  {
    id: 'gang', age: [14, 16],
    title: '일진의 제안',
    text: '학교에서 제일 잘나가는 무리가 같이 놀자고 합니다.',
    choices: [
      { label: '같이 어울린다', result: '매점 서열 1위가 됐습니다. 대신 생활기록부 서열은 바닥입니다.', effect: { happy: 4, relation: 3, smarts: -5, set: { delinquent: true } } },
      { label: '정중히 거절한다', result: '"나 학원 가야 돼." 세상에서 가장 강력한 거절 문장입니다.', effect: { smarts: 2, relation: -1 } },
    ],
  },
  {
    id: 'skipAcademy', age: [13, 17],
    title: '학원 땡땡이',
    text: '친구가 오늘 학원 빠지고 PC방에 가자고 합니다. 학원 앞에서 마음이 흔들립니다.',
    choices: [
      {
        label: 'PC방에 간다',
        outcomes: [
          { w: 60, result: '완벽한 하루였습니다. 학원 선생님이 보호자에게 전화하기 전까지는요.', effect: { happy: 4, relation: -3 } },
          { w: 40, result: 'PC방 옆자리에 학원 선생님이 앉아 계셨습니다. 둘 다 못 본 척했습니다.', effect: { happy: 6 } },
        ],
      },
      { label: '학원에 간다', result: '그날 배운 내용이 시험에 나왔습니다. 인생은 가끔 공정합니다.', effect: { smarts: 3 } },
    ],
  },
  {
    id: 'smokingOffer', age: [15, 19],
    title: '담배 한 대',
    text: '친구가 담배를 내밉니다. "한 번만 펴 봐. 별거 없어."',
    choices: [
      { label: '피워 본다', result: '기침을 세 번 했지만 아무렇지 않은 척했습니다. 그렇게 습관이 시작됐습니다.', effect: { happy: 2, health: -2, set: { smoker: true } } },
      { label: '거절한다', result: '"나 폐활량 시험 있어." 아무도 믿지 않았지만 통했습니다.', effect: { health: 2 } },
    ],
  },
  {
    id: 'motorcycle', age: [16, 19],
    weight: (s) => (hasTrait(s, 'reckless') || s.flags.delinquent ? 2 : 0.6),
    title: '친구의 오토바이',
    text: '친구가 오토바이 뒤에 타라고 합니다. 헬멧은 하나뿐이고, 친구가 쓰고 있습니다.',
    choices: [
      {
        label: '탄다',
        outcomes: [
          { w: 75, result: '바람을 가르는 기분이었습니다. 보호자에게 들키기 전까지는요.', effect: { happy: 6, relation: -2 } },
          {
            w: 22, result: '커브에서 넘어졌습니다. 다리 깁스에 친구들이 낙서를 가득 해 줬습니다.',
            effect: { health: -20, moment: { ko: '오토바이 사고로 깁스', img: 'a teenager on crutches with a cast covered in friends\' doodles', w: 2 } },
          },
          { w: 3, result: '커브 길에서 오토바이가 미끄러졌습니다.', effect: { death: 'motorcycle' } },
        ],
      },
      { label: '거절한다', result: '"헬멧도 없잖아." 당신의 수명이 오늘 조용히 연장되었습니다.', effect: { health: 1 } },
    ],
  },
  {
    id: 'sportsScout', age: [10, 14],
    if: (s) => hasTrait(s, 'athletic'),
    title: '운동부 스카우트',
    text: '체육 시간에 당신을 지켜보던 운동부 감독님이 다가옵니다. "운동 한번 해 볼래?"',
    choices: [
      { label: '운동부에 들어간다', result: '새벽 6시 훈련이 시작됐습니다. 하루에 밥을 다섯 공기 먹습니다.', effect: { health: 6, smarts: -3, set: { athleteTrack: true } } },
      { label: '공부를 계속한다', result: '감독님이 아쉬운 표정으로 명함을 주고 갔습니다.', effect: { smarts: 2 } },
    ],
  },
  {
    id: 'track', age: [15, 15], priority: true,
    if: (s) => !s.flags.track,
    title: '고등학교 진로',
    text: '고등학교를 정해야 합니다. 담임 선생님이 진로 상담 종이를 나눠 줍니다.',
    choices: [
      { label: '인문계 고등학교 (대학 목표)', result: '3년간의 입시 레이스에 참가 신청을 했습니다. 완주가 목표입니다.', effect: { smarts: 3, set: { track: 'academic' } } },
      {
        label: '예술고등학교', if: (s) => s.flags.wantsStar || hasTrait(s, 'musical') || s.flags.ownDream,
        result: '실기 시험에 합격했습니다. 이제 연습실이 두 번째 집입니다.',
        effect: { happy: 5, set: { track: 'arts', wantsStar: true } },
      },
      {
        label: '체육고등학교', if: (s) => s.flags.athleteTrack || hasTrait(s, 'athletic'),
        result: '하루 훈련량이 일반 고등학생의 1년 체육 시간과 맞먹습니다.',
        effect: { health: 6, set: { track: 'sports', athleteTrack: true } },
      },
      { label: '특성화고등학교 (기술)', result: '용접, 전기, 코딩 중에 코딩을 골랐습니다. 졸업하면 바로 취업할 수 있습니다.', effect: { happy: 3, set: { track: 'vocational' } } },
      { label: '자퇴하고 검정고시', result: '아침 7시 기상에서 해방됐습니다. 대신 보호자의 한숨이 아침 7시에 시작됩니다.', effect: { happy: 5, relation: -3, set: { track: 'academic', dropout: true } } },
    ],
  },
  {
    id: 'casting', age: [14, 18],
    if: (s) => (hasTrait(s, 'attractive') || hasTrait(s, 'musical') || s.flags.wantsStar) && !s.job,
    weight: 1.5,
    title: '길거리 캐스팅',
    text: '홍대 앞에서 누군가 명함을 내밉니다. "혹시 연예인 생각 있어요?"',
    choices: [
      {
        label: '연습생이 된다',
        result: '연습생 생활이 시작됐습니다. 하루 12시간 연습, 식단은 닭가슴살과 희망입니다.',
        effect: { happy: 5, smarts: -3, job: 'trainee', moment: { ko: '연습생 생활 시작', img: 'a teenager practicing dance alone late at night in a mirrored studio', w: 2 } },
      },
      { label: '사기일 수도 있으니 거절한다', result: '나중에 알고 보니 진짜 대형 기획사였습니다. 그 명함은 아직 지갑에 있습니다.', effect: { smarts: 2, happy: -2 } },
    ],
  },
  {
    id: 'traineeLife', age: [14, 25], once: false, cooldown: 2,
    if: (s) => s.job === 'trainee',
    title: '연습생의 하루',
    text: '월말 평가가 다가옵니다. 오늘 저녁은 또 닭가슴살입니다.',
    choices: [
      { label: '밤새 연습한다', result: '거울 속 자신이 조금 더 프로처럼 보입니다. 다리는 조금 더 후들거립니다.', effect: { health: -3, happy: -1, add: { practice: 1 } } },
      { label: '몰래 떡볶이를 먹는다', result: '인생 최고의 떡볶이였습니다. 다음 날 체중계 앞에서 매니저가 한숨을 쉬었습니다.', effect: { happy: 6 } },
    ],
  },
  {
    id: 'debutEval', age: [16, 26], priority: true, once: false, cooldown: 1,
    if: (s) => s.job === 'trainee' && (s.counters.traineeYears || 0) >= 2,
    title: '데뷔 평가',
    text: '데뷔 멤버를 정하는 최종 평가 날입니다. 연습생 열두 명 중 다섯 명만 데뷔합니다.',
    choices: [
      {
        label: '모든 걸 쏟아붓는다',
        outcomes: [
          {
            w: (s) => 25 + (hasTrait(s, 'attractive') ? 20 : 0) + (hasTrait(s, 'musical') ? 20 : 0) + (s.counters.practice || 0) * 8,
            result: '데뷔 확정! 음악방송 첫 무대에서 카메라를 못 찾아서 3초 동안 허공을 봤습니다.',
            effect: {
              job: 'idol', happy: 15, achieve: 'debut', set: { debuted: true },
              moment: { ko: '아이돌로 데뷔', img: 'debuting on a K-pop stage under colorful spotlights and fan light sticks', w: 4 },
            },
          },
          {
            w: 55,
            result: (s) => ((s.counters.traineeYears || 0) >= 5
              ? '이번에도 탈락했습니다. 연습생 생활은 노래방 98점이라는 기록으로 남았습니다.'
              : '탈락했습니다. 회사는 "다음 기회"를 이야기했습니다.'),
            effect: { happy: -10, run: (s) => { if ((s.counters.traineeYears || 0) >= 5) setJob(s, null); } },
          },
        ],
      },
      { label: '연습생을 그만둔다', result: '숙소 짐을 쌌습니다. 가장 먼저 한 일은 치킨 한 마리를 혼자 다 먹은 것입니다.', effect: { happy: 4, job: null } },
    ],
  },
  {
    id: 'proDraft', age: [18, 20], priority: true,
    if: (s) => s.flags.track === 'sports',
    title: '프로 입단 테스트',
    text: '프로팀 스카우터들이 관중석에 앉아 있습니다. 오늘 경기가 인생을 바꿀 수 있습니다.',
    choices: [
      {
        label: '평소대로 뛴다',
        outcomes: [
          {
            w: (s) => s.health,
            result: '드래프트 1라운드 지명! 사인 연습을 300번 했는데 막상 계약서에는 떨려서 이름이 삐뚤게 써졌습니다.',
            effect: { job: 'athlete', happy: 15, achieve: 'pro', moment: { ko: '프로 선수 입단', img: 'signing a pro contract in a team jersey under camera flashes', w: 4 } },
          },
          { w: 45, result: '지명받지 못했습니다. 운동화를 오래 바라보다가 신발장에 넣었습니다.', effect: { happy: -10, set: { track: 'academic' } } },
        ],
      },
      { label: '운동을 접고 공부한다', result: '체육관 대신 독서실로 향합니다. 체력 하나는 독서실 최강입니다.', effect: { smarts: 3, set: { track: 'academic' } } },
    ],
  },
  {
    id: 'schoolTrip', age: [17, 17],
    title: '수학여행',
    text: '수학여행 마지막 밤입니다. 선생님이 순찰을 돌고 있습니다.',
    choices: [
      { label: '밤새 수다를 떤다', result: '새벽 4시까지 떠들었습니다. 그날 나눈 이야기는 20년 뒤 동창회의 단골 안주가 됩니다.', effect: { relation: 5, health: -1 } },
      { label: '몰래 숙소를 빠져나간다', result: '편의점까지 갔다가 순찰 중인 선생님과 계산대에서 마주쳤습니다. 선생님도 컵라면을 사고 계셨습니다.', effect: { happy: 5, relation: 2 } },
      { label: '일찍 잔다', result: '아침 6시에 상쾌하게 일어났습니다. 방 친구들 얼굴에 낙서가 되어 있는 걸 보니 당신 얼굴도 무사하지 않은 것 같습니다.', effect: { health: 2 } },
    ],
  },

  // ---------- 수능과 진학 ----------
  {
    id: 'suneung', age: [18, 21], priority: true, once: false,
    if: (s) => !s.flags.suneung && !s.flags.afterDone && s.flags.track !== 'vocational' && s.flags.track !== 'farm' && s.flags.track !== 'sports' && !s.job,
    title: '수능',
    text: (s) => (s.flags.retakes
      ? `재수 ${s.flags.retakes}년 차, 다시 수능 날입니다. 고사장 가는 길이 작년과 똑같아서 더 떨립니다.`
      : s.flags.orphan
        ? '수능 날입니다. 원장님이 싸 주신 도시락에 "할 수 있다"라고 쓴 쪽지가 들어 있습니다.'
        : '수능 날입니다. 도시락은 소화 잘되는 죽입니다. 수험표는 세 번 확인했습니다.'),
    choices: [
      {
        label: '평소 실력대로 차분하게',
        outcomes: [
          {
            w: (s) => Math.max(2, s.smarts - 50),
            result: '전국 상위 1%! 보호자가 동네 맘카페에 "비결은 없어요"라는 글을 올렸습니다.',
            effect: { happy: 10, achieve: 'topScore', set: { suneung: 'top' }, moment: { ko: '수능 대박', img: 'jumping for joy while holding a college admission letter', w: 3 } },
          },
          { w: 45, result: '"평소 실력대로" 나왔습니다. 문제는 평소 실력이었습니다.', effect: { set: { suneung: 'mid' } } },
          { w: (s) => Math.max(5, 75 - s.smarts), result: '시험 중에 배가 아팠습니다. 죽 때문인지 긴장 때문인지는 영원한 미스터리입니다.', effect: { happy: -8, set: { suneung: 'low' } } },
        ],
      },
      {
        label: '모르는 문제는 연필 굴리기',
        outcomes: [
          { w: 8, result: '연필이 신들린 듯 정답을 골랐습니다. 그 연필은 지금 가보로 모셔져 있습니다.', effect: { happy: 12, achieve: 'topScore', set: { suneung: 'top' } } },
          { w: 35, result: '연필은 반반의 확률로 정직했습니다.', effect: { set: { suneung: 'mid' } } },
          { w: 45, result: '연필이 당신을 배신했습니다. 연필은 그날 밤 쓰레기통으로 갔습니다.', effect: { happy: -8, set: { suneung: 'low' } } },
        ],
      },
    ],
  },
  {
    id: 'afterSuneung', age: [18, 22], priority: true, once: false,
    if: (s) => s.flags.suneung && !s.flags.afterDone,
    title: '진학 결정',
    text: (s) => ({
      top: '성적표가 나왔습니다. 어디든 갈 수 있는 점수입니다. 갑자기 친척들 연락이 늘었습니다.',
      mid: '성적표가 나왔습니다. 갈 수 있는 곳과 가고 싶은 곳 사이에 거리가 조금 있습니다.',
      low: '성적표가 나왔습니다. 성적표를 접어서 가방 제일 깊은 곳에 넣었습니다.',
    })[s.flags.suneung],
    choices: [
      {
        label: '의대에 간다', if: (s) => s.flags.suneung === 'top' && s.smarts >= 68,
        result: '의대 합격! 6년 뒤에는 의사가 됩니다. 그 6년이 얼마나 긴지는 아직 모릅니다.',
        effect: { happy: 8, set: { student: 6, med: true, college: 'med', afterDone: true }, moment: { ko: '의대 합격', img: 'opening a medical school acceptance letter with family cheering', w: 2 } },
      },
      {
        label: '서울에 있는 대학에 간다', if: (s) => s.flags.suneung !== 'low',
        result: '서울 소재 대학에 합격했습니다. 자취방 월세를 보고 잠깐 정신이 아득해졌습니다.',
        effect: { smarts: 5, happy: 5, set: { student: 4, college: 'good', afterDone: true } },
      },
      {
        label: '집 근처 대학에 간다',
        result: '통학 시간 15분. 동네 친구들과 대학 생활까지 함께합니다.',
        effect: { smarts: 3, relation: 3, set: { student: 4, college: 'normal', afterDone: true } },
      },
      {
        label: '재수한다', if: (s) => (s.flags.retakes || 0) < 2,
        result: '재수 학원에 등록했습니다. 1년 동안 독서실 칸막이가 당신의 우주입니다.',
        effect: { happy: -6, smarts: 4, run: (s) => { s.flags.suneung = null; s.flags.retakes = (s.flags.retakes || 0) + 1; } },
      },
      {
        label: '바로 돈을 번다',
        result: (s) => (s.flags.orphan
          ? '공장 생산직에 취직했습니다. 첫 월급으로 원장님께 내복을 사 드렸습니다. 원장님이 우셨습니다.'
          : '공장 생산직에 취직했습니다. 첫 월급으로 부모님 내복을 샀습니다. 뻔하지만 진심이었습니다.'),
        effect: { happy: 2, relation: 3, job: 'factory', set: { afterDone: true } },
      },
    ],
  },
  {
    id: 'vocationalJob', age: [18, 19], priority: true,
    if: (s) => s.flags.track === 'vocational' && !s.flags.afterDone,
    title: '졸업 후 진로',
    text: '특성화고 졸업을 앞두고 회사 몇 곳에서 채용 제안이 왔습니다.',
    choices: [
      { label: '중견 제조업체에 취직한다', result: '열아홉 살에 4대 보험이 생겼습니다. 대학 간 친구들이 밥을 사 달라고 합니다.', effect: { job: 'factory', happy: 4, set: { afterDone: true } } },
      { label: 'IT 회사에 개발자로 간다', result: '코딩 실력으로 입사했습니다. 사수가 당신보다 키보드를 늦게 칩니다.', effect: { job: 'office', smarts: 3, set: { afterDone: true } } },
      { label: '대학에 진학한다', result: '조금 늦게 시작하는 공부지만, 이번에는 스스로 고른 길입니다.', effect: { smarts: 3, set: { student: 4, college: 'normal', afterDone: true } } },
    ],
  },
);
