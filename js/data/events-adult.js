// 19~64세 사건: 군대, 대학, 취업, 연애·결혼·육아, 직장, 돈, 건강, 창업, 직업별 이야기, 범죄, 모험

const CRISES = [
  '경기가 얼어붙었습니다. 손님들이 지갑을 닫았고, 당신은 문을 열어 둔 채 한숨을 쉽니다.',
  '동업자가 회삿돈을 들고 잠적했습니다. 마지막 카톡은 "미안하다 진짜"였습니다.',
  '건물주가 임대료를 40% 올렸습니다. 건물주 자녀가 같은 업종으로 창업한다는 소문이 돕니다.',
  '악성 리뷰 테러가 시작됐습니다. "사장님이 안 웃어요 ★☆☆☆☆". 사장님은 리뷰를 보고 더 못 웃게 됐습니다.',
  '대형 프랜차이즈가 바로 옆에 문을 열었습니다. 오픈 기념으로 전 메뉴 50% 할인 중입니다.',
];

const MEET_PLACES = ['친구 결혼식 뒤풀이에서', '회사 동호회에서', '소개팅 앱에서', '동네 헬스장에서', '지인의 소개로', '비 오는 날 버스 정류장에서'];

EVENTS.push(
  // ---------- 군대 ----------
  {
    id: 'military', age: [20, 24], priority: true,
    if: (s) => s.gender === 'M' && !s.flags.armyDone,
    title: '입영 통지서',
    text: '입영 통지서가 날아왔습니다. 머리를 밀 시간입니다.',
    choices: [
      {
        label: '육군 현역으로 간다',
        result: '머리를 밀었습니다. 거울 속 사람이 낯설지만 묘하게 각이 잡혀 있습니다.',
        effect: { health: 5, happy: -5, run: (s) => enlist(s, 2), moment: { ko: '군 입대', img: 'a young man with a fresh buzz cut waving goodbye at a training camp gate', w: 1 } },
      },
      {
        label: '해병대에 자원한다', if: (s) => s.health >= 55,
        result: '"누구나 해병이 될 수 있다면 나는 해병대를 선택하지 않았을 것이다." 이 말을 믿은 자신이 원망스럽습니다.',
        effect: { health: 8, happy: -8, relation: 5, run: (s) => enlist(s, 2), moment: { ko: '해병대 입대', img: 'a young marine in a red-and-khaki uniform standing on a windy beach', w: 2 } },
      },
      {
        label: '사회복무요원으로 간다', if: (s) => s.health < 50 || hasTrait(s, 'frail'),
        result: '구청 민원실에서 복사기와 깊은 우정을 쌓았습니다.',
        effect: { happy: -2, run: (s) => enlist(s, 2) },
      },
    ],
  },
  {
    id: 'armyLetter', age: [19, 26], army: true,
    title: '군대에서 온 편지',
    text: '훈련소에서 첫 편지 쓰는 시간입니다. 볼펜 한 자루와 편지지 두 장이 주어졌습니다.',
    choices: [
      { label: '집에 편지를 쓴다', result: '"엄마 밥이 먹고 싶습니다." 집에서는 그 편지를 냉장고에 붙여 두었습니다.', effect: { relation: 5, happy: 2 } },
      { label: '{partner}에게 쓴다', if: (s) => !!s.partner, result: '편지지 두 장이 모자랐습니다. 세 번째 장은 휴지에 썼습니다.', effect: { relation: 6, happy: 3 } },
      { label: '전투력 향상에 집중한다', result: '편지 대신 팔굽혀펴기를 했습니다. 분대장이 "독하다"고 했습니다.', effect: { health: 4 } },
    ],
  },
  {
    id: 'armyLeave', age: [19, 26], army: true,
    title: '첫 휴가',
    text: '첫 휴가를 나왔습니다. 시간은 4박 5일, 하고 싶은 건 40가지입니다.',
    choices: [
      { label: '친구들을 만난다', result: '친구들이 모두 시험 기간이라 바빴습니다. 결국 PC방에 혼자 있었습니다.', effect: { happy: 2 } },
      { label: '집에서 잔다', result: '4박 5일 중 3박을 잤습니다. 후회는 없습니다.', effect: { happy: 5, health: 2 } },
      { label: '{partner}와 데이트한다', if: (s) => !!s.partner, result: '시간이 너무 빨리 갔습니다. 복귀 버스에서 노래 한 곡을 계속 반복 재생했습니다.', effect: { happy: 6, relation: 4 } },
    ],
  },

  // ---------- 대학 생활 ----------
  {
    id: 'mt', age: [19, 26],
    if: (s) => isStudent(s),
    title: '대학 MT',
    text: '신입생 MT입니다. 선배가 "오늘 밤은 길다"고 합니다.',
    choices: [
      { label: '술 게임에 진심으로 임한다', result: '다음 날 아침, 기억나는 건 건배사뿐입니다. 동기들은 당신을 "그 건배사"로 기억합니다.', effect: { relation: 6, health: -2, add: { drinks: 1 } } },
      { label: '조용히 구석에서 대화한다', result: '구석 자리에서 평생 친구를 만났습니다. 둘 다 술을 못 마셨습니다.', effect: { relation: 4 } },
      { label: '고기만 굽는다', result: 'MT의 숨은 영웅. 집게를 놓은 적이 없습니다. 당신 이름은 몰라도 고기 맛은 다들 기억합니다.', effect: { relation: 3, happy: 3 } },
    ],
  },
  {
    id: 'campusLove', age: [19, 27],
    if: (s) => isStudent(s) && !s.partner,
    prepare: (s) => { s.tmp.newName = anyName(); },
    title: '같은 수업 그 사람',
    text: '전공 수업마다 옆자리에 앉는 {newName} 님이 있습니다. 오늘은 우산을 같이 쓰자고 합니다.',
    choices: [
      {
        label: '같이 쓴다',
        outcomes: [
          { w: (s) => s.relation, result: '우산이 작아서 둘 다 어깨가 젖었습니다. 그날부터 캠퍼스 커플이 되었습니다.', effect: { happy: 8, run: newPartner } },
          { w: 40, result: '정류장까지 같이 걸었습니다. 그게 전부였습니다. 그래도 좋은 오후였습니다.', effect: { happy: 2 } },
        ],
      },
      { label: '괜찮다고 비를 맞고 간다', result: '감기에 걸렸습니다. 다음 수업 때 그 사람이 감기약을 건넸습니다.', effect: { health: -2, relation: 2 } },
    ],
  },
  {
    id: 'exchange', age: [20, 26],
    if: (s) => isStudent(s) && (family(s) >= 3 || s.smarts >= 70),
    title: '교환학생',
    text: '교환학생 모집 공고가 올라왔습니다. 유럽 대학 자리가 하나 남았습니다.',
    choices: [
      {
        label: '지원해서 떠난다',
        result: '1년 동안 유럽에서 공부했습니다. 영어 실력보다 요리 실력이 더 늘었습니다.',
        effect: { smarts: 5, happy: 7, money: -1500, moment: { ko: '유럽 교환학생', img: 'an exchange student cycling past an old European university in autumn', w: 3 } },
      },
      { label: '학점 관리에 집중한다', result: '장학금을 받았습니다. 친구의 유럽 사진을 보며 장학금 통장을 열어 봤습니다.', effect: { smarts: 3, money: 300 } },
    ],
  },

  // ---------- 재기·출소 (취업보다 먼저 처리) ----------
  {
    id: 'comeback', age: [20, 70], priority: true,
    if: (s) => s.flags.bankrupt && !s.job && !s.business && !s.flags.comebackTried,
    title: '다시 일어설 시간',
    text: '파산하고 한동안 아무것도 못 했습니다. 오늘 아침, 거울 속 자신에게 "이제 일어나야지"라고 말했습니다.',
    choices: [
      { label: '배달 라이더로 다시 시작한다', result: '오토바이 할부를 시작했습니다. 사장님 시절보다 동네 골목을 더 잘 알게 됐습니다.', effect: { job: 'rider', happy: 3, set: { comebackTried: true } } },
      {
        label: '망한 이야기로 유튜브를 한다',
        outcomes: [
          {
            w: 25, result: '"사업 망하고 깨달은 7가지" 영상이 조회수 300만을 찍었습니다. 망한 덕분에 떴습니다.',
            effect: { job: 'creator', money: 3000, happy: 12, achieve: 'creator', set: { bigCreator: true, comebackTried: true }, moment: { ko: '망한 썰 유튜브로 대박', img: 'filming a heartfelt video in a small room while the subscriber count explodes', w: 3 } },
          },
          { w: 75, result: '구독자 37명. 그중 12명은 가족이고, 3명은 본인 부계정입니다.', effect: { job: 'creator', happy: 2, set: { comebackTried: true } } },
        ],
      },
      { label: '다시 창업한다', result: '"이번엔 다르다." 모든 재창업자가 하는 말이지만, 당신은 진심입니다.', effect: { happy: 3, set: { wantBiz: true, comebackTried: true } } },
    ],
  },
  {
    id: 'afterPrison', age: [20, 80], priority: true,
    if: (s) => s.flags.exCon && !s.job && !s.flags.afterPrisonDone,
    title: '출소 후 첫 아침',
    text: '세상은 그대로인데 당신만 달라진 것 같습니다. 휴대폰에는 업데이트가 237개 밀려 있습니다.',
    choices: [
      { label: '배달 라이더로 새 출발한다', result: '첫 배달을 마치고 "감사합니다"라는 문자를 받았습니다. 오랜만에 들은 말이었습니다.', effect: { job: 'rider', happy: 5, relation: 2, set: { afterPrisonDone: true } } },
      { label: '감방 동기가 소개한 "일"을 한다', result: '"이번엔 안 걸린다"는 말을 믿기로 했습니다.', effect: { job: 'scammer', relation: -5, set: { afterPrisonDone: true } } },
    ],
  },

  // ---------- 취업 ----------
  {
    id: 'jobHunt', age: [19, 59], priority: true, once: false, cooldown: 2,
    if: (s) => !s.job && !isStudent(s) && !s.flags.civilExam && !s.flags.wantBiz && s.flags.track !== 'farm'
      && (s.flags.afterDone || s.age >= 22),
    title: '취업 준비',
    text: (s) => (s.flags.college
      ? '졸업장은 받았는데 자리가 없습니다. 오늘도 채용 공고를 새로고침합니다.'
      : '일자리를 구해야 합니다. 통장 잔고가 그렇게 말하고 있습니다.'),
    choices: [
      {
        label: '대기업에 지원한다', if: (s) => s.smarts >= 55 || s.flags.college === 'good',
        outcomes: [
          {
            w: (s) => s.smarts - 35 + (s.flags.college === 'good' ? 20 : 0) + (s.flags.bilingual ? 10 : 0),
            result: '최종 합격! 사원증을 목에 걸고 회사 로비에서 셀카를 찍었습니다. 경비원 아저씨가 찍어 주셨습니다.',
            effect: { job: 'bigcorp', happy: 10, achieve: 'bigcorp', moment: { ko: '대기업 입사', img: 'proudly wearing a new company ID badge in a glass office tower lobby', w: 2 } },
          },
          { w: 50, result: '서류 탈락 47번째. 자기소개서의 "성실함"이 점점 성실하지 않아집니다.', effect: { happy: -5 } },
        ],
      },
      { label: '중소기업에 들어간다', result: '면접 당일 합격 통보를 받았습니다. 회사 단톡방에 바로 초대됐고, 사장님 프로필 사진은 골프장입니다.', effect: { job: 'office', happy: 2 } },
      {
        label: '공무원 시험을 준비한다', if: (s) => s.age <= 40,
        result: '노량진 고시원에 들어갔습니다. 방 크기는 1.5평, 꿈의 크기는 9급입니다.',
        effect: { happy: -2, set: { civilExam: 1 } },
      },
      { label: '창업한다', if: (s) => s.age >= 22, result: '사업계획서를 썼습니다. 엑셀 매출 예상표에서는 3년 뒤 건물주입니다.', effect: { happy: 3, set: { wantBiz: true } } },
      { label: '배달 라이더를 한다', result: '오토바이 할부를 시작했습니다. 이제 동네 골목을 내비게이션보다 잘 압니다.', effect: { job: 'rider' } },
      {
        label: '워킹홀리데이를 떠난다', if: (s) => s.age <= 30 && !s.flags.workingHoliday,
        result: '호주로 떠났습니다. 1년 동안 농장에서 딸기를 땄고, 영어는 "Thank you, mate"까지 늘었습니다.',
        effect: { happy: 8, money: 400, set: { workingHoliday: true }, moment: { ko: '호주 워킹홀리데이', img: 'picking strawberries under a huge Australian sky with a sunburned smile', w: 2 } },
      },
    ],
  },
  {
    id: 'civilExam', age: [20, 45], priority: true, once: false,
    if: (s) => s.flags.civilExam > 0 && !s.job,
    title: '공무원 시험',
    text: (s) => `공무원 시험 ${s.flags.civilExam}번째 도전입니다. 컴퓨터용 사인펜을 두 자루 챙겼습니다.`,
    choices: [
      {
        label: '응시한다',
        outcomes: [
          {
            w: (s) => 12 + s.smarts / 3 + s.flags.civilExam * 6,
            result: '합격! 합격자 명단에서 이름을 찾는 데 11분이 걸렸습니다. 손이 떨려서요.',
            effect: { job: 'civil', happy: 15, achieve: 'civil', set: { civilExam: 0 }, moment: { ko: '공무원 시험 합격', img: 'finding their own name on an exam pass list with trembling hands', w: 3 } },
          },
          { w: 60, result: '0.25점 차이로 떨어졌습니다. 0.25점은 OMR 카드 한 칸입니다.', effect: { happy: -6, smarts: 2, run: (s) => { s.flags.civilExam += 1; } } },
        ],
      },
      { label: '포기하고 다른 길을 찾는다', result: '고시원 방을 뺐습니다. 3년 치 문제집을 고물상에 팔았더니 2만 3천 원이 나왔습니다.', effect: { happy: 4, set: { civilExam: 0 } } },
    ],
  },

  // ---------- 창업과 사업 ----------
  {
    id: 'startupChoose', age: [20, 75], priority: true, once: false,
    if: (s) => s.flags.wantBiz && !s.business && !inPrison(s),
    title: '창업 아이템 고르기',
    text: (s) => `창업하기로 했습니다. 지금 가진 돈은 ${formatMoney(s.money)}. 모자라는 돈은 대출로 채웁니다.`,
    choices: [
      ...Object.keys(BUSINESSES).map((type) => ({
        label: `${BUSINESSES[type].name} (${formatMoney(BUSINESSES[type].cost)})`,
        result: {
          cafe: '인테리어에 진심을 다했습니다. 손님들이 커피보다 조명 사진을 더 많이 찍습니다.',
          chicken: '튀김기 앞에 섰습니다. 대한민국 치킨집 9만 개 중 하나가 되었습니다.',
          app: '공유 오피스에 노트북 두 대를 놓았습니다. 사무실 이름은 거창하고, 직원은 둘입니다.',
          shop: '원룸이 창고가 되었습니다. 택배 상자 사이에서 잠을 잡니다.',
        }[type],
        effect: {
          happy: 5,
          run: (s) => {
            startBusiness(s, type);
            addMoment(s, { ko: `${BUSINESSES[type].name} 창업`, img: BUSINESSES[type].img, w: 3 });
          },
        },
      })),
      { label: '역시 그만둔다', result: '사업계획서는 서랍에 넣었습니다. 가끔 꺼내 읽으며 흐뭇해합니다.', effect: { set: { wantBiz: false } } },
    ],
  },
  {
    id: 'bankrupt', age: [20, 90], priority: true, once: false,
    if: (s) => s.business && s.business.hp <= 0,
    title: '폐업',
    text: '{biz} 사업이 결국 문을 닫게 됐습니다. 남은 건 빚과, 아무도 앉지 않는 의자들입니다.',
    choices: [
      {
        label: '개인회생을 신청한다',
        result: '빚은 줄었지만 신용 점수가 미세먼지 농도보다 낮아졌습니다.',
        effect: {
          happy: -15,
          run: (s) => { goBankrupt(s); s.money = Math.max(s.money, -3000); },
          moment: { ko: '사업 실패와 파산', img: 'pulling down the metal shutter of a failed shop on a rainy night', w: 4 },
        },
      },
      {
        label: '부모님께 손을 벌린다', if: (s) => family(s) >= 2 && !s.flags.parentsDead,
        result: '아버지는 아무 말 없이 통장을 내미셨습니다. 그 침묵이 어떤 꾸중보다 아팠습니다.',
        effect: {
          happy: -10, relation: -6,
          run: (s) => { goBankrupt(s); s.money += 4000 * family(s); },
          moment: { ko: '사업 실패와 파산', img: 'pulling down the metal shutter of a failed shop on a rainy night', w: 4 },
        },
      },
      {
        label: '잠적한다',
        result: '휴대폰을 끄고 지방 모텔로 갔습니다. 3주 뒤, 부재중 전화 112통을 보고 돌아왔습니다.',
        effect: {
          happy: -12, relation: -15,
          run: goBankrupt,
          moment: { ko: '사업 실패와 파산', img: 'pulling down the metal shutter of a failed shop on a rainy night', w: 4 },
        },
      },
    ],
  },
  {
    id: 'bizCrisis', age: [20, 80], once: false, cooldown: 3, weight: 1.6,
    if: (s) => s.business && s.business.years >= 1,
    prepare: (s) => { s.tmp.crisis = pick(CRISES); },
    title: '사업 위기',
    text: '{crisis}',
    choices: [
      {
        label: '허리띠를 졸라매고 버틴다',
        outcomes: [
          { w: 55, result: '석 달을 라면으로 버텼고, 위기를 넘겼습니다. 라면 끓이는 실력이 장인 수준이 됐습니다.', effect: { money: -1500, happy: -3, run: (s) => { s.business.hp = clamp(s.business.hp + 15, 0, 100); } } },
          { w: 45, result: '버텼지만 상황이 나아지지 않았습니다. 통장 잔고가 바닥을 향해 다이빙 중입니다.', effect: { money: -2500, happy: -6, run: (s) => { s.business.hp = clamp(s.business.hp - 30, 0, 100); } } },
        ],
      },
      { label: '사채를 끌어다 쓴다', result: '급한 불은 껐습니다. 이자율은 차마 계산하지 않기로 했습니다.', effect: { money: 5000, set: { loanShark: true }, run: (s) => { s.business.hp = clamp(s.business.hp + 20, 0, 100); } } },
      { label: '미련 없이 정리한다', result: '가게를 정리했습니다. 남은 건 집기 몇 개와 "사장님"이라는 추억입니다.', effect: { happy: -5, run: (s) => closeBusiness(s, 0.3) } },
    ],
  },
  {
    id: 'bizExpand', age: [22, 75], once: false, cooldown: 3,
    if: (s) => s.business && s.business.years >= 2 && s.business.hp >= 55 && s.business.level < 4,
    title: '확장 기회',
    text: (s) => `${BUSINESSES[s.business.type].name} 장사가 잘됩니다. 작년 수익은 ${formatMoney(s.business.lastProfit || 0)}. 은행에서 확장 대출을 권합니다.`,
    choices: [
      {
        label: '대출받아 확장한다',
        result: (s) => `${s.business.level}호점을 냈습니다. "대표님"이라고 불러 달라고 했지만 아무도 안 불러 줍니다.`,
        effect: { happy: 4, run: (s) => { s.money -= Math.round(BUSINESSES[s.business.type].cost * 0.8); s.business.level += 1; s.business.hp -= 10; } },
      },
      { label: '지금 규모가 딱 좋다', result: '욕심을 내려놓았습니다. 저녁 9시에 퇴근하는 사장님이 됐습니다.', effect: { happy: 4, health: 2 } },
    ],
  },
  {
    id: 'bizJackpot', age: [25, 75],
    weight: (s) => (s.business && s.business.type === 'app' ? 1.5 : 0.5),
    if: (s) => s.business && s.business.level >= 2 && s.business.hp >= 70,
    title: '인수 제안',
    text: '대기업에서 연락이 왔습니다. "{biz}을(를) 인수하고 싶습니다." 회의실에 들어가기 전, 손이 떨립니다.',
    choices: [
      {
        label: '판다',
        result: (s) => `계약서에 사인했습니다. 통장에 찍힌 숫자의 0을 세다가 세 번 틀렸습니다.`,
        effect: {
          happy: 20, achieve: 'exit',
          run: (s) => {
            const b = s.business;
            const info = BUSINESSES[b.type];
            s.money += info.base * b.level * (b.type === 'app' ? 30 : 8);
            s.business = null;
            setJob(s, null);
            s.flags.soldBiz = true;
          },
          moment: { ko: '회사 매각 대박', img: 'shaking hands over a huge acquisition deal as confetti falls in a boardroom', w: 5 },
        },
      },
      {
        label: '거절하고 더 키운다',
        result: '"우리 가치는 그 이상입니다." 말하고 나서 사흘 동안 잠을 설쳤습니다.',
        effect: { happy: 3, run: (s) => { s.business.level += 1; s.business.hp -= 15; } },
      },
    ],
  },
  {
    id: 'loanShark', age: [20, 80], once: false, cooldown: 2, priority: true,
    if: (s) => s.flags.loanShark && chance(0.5),
    title: '사채업자의 방문',
    text: '정장을 입은 두 사람이 찾아왔습니다. 웃는 얼굴인데 웃는 것 같지 않습니다.',
    choices: [
      { label: '가진 돈을 털어 갚는다', result: '빚을 정리했습니다. 문 닫히는 소리가 이렇게 반가울 줄 몰랐습니다.', effect: { money: -7000, happy: 3, set: { loanShark: false } } },
      {
        label: '조금만 시간을 달라고 한다',
        outcomes: [
          { w: 50, result: '"한 달 드리죠." 이자는 한 달 사이에 두 배가 됐습니다.', effect: { money: -2000, happy: -6 } },
          { w: 50, result: '가게 집기를 압류해 갔습니다. 텅 빈 가게에 앉아 오래 천장을 봤습니다.', effect: { money: -3000, happy: -10, run: (s) => { if (s.business) s.business.hp = clamp(s.business.hp - 25, 0, 100); } } },
        ],
      },
    ],
  },
  {
    id: 'inheritShop', age: [26, 40],
    if: (s) => s.flags.familyShop && !s.business && !isStudent(s),
    title: '가게를 물려받을까?',
    text: '아버지가 기름 냄새 밴 앞치마를 내미십니다. "이제 네가 해 볼래?"',
    choices: [
      {
        label: '물려받는다',
        result: '30년 된 비법 양념의 비밀을 전수받았습니다. 비밀은 "물엿 조금 더"였습니다.',
        effect: { happy: 5, relation: 6, run: (s) => { startBusiness(s, 'chicken', 0.2); s.business.hp = 75; addMoment(s, { ko: '부모님 치킨집을 물려받음', img: 'proudly wearing an apron in a family fried-chicken shop with parents watching', w: 3 }); } },
      },
      { label: '내 길을 간다', result: '아버지는 앞치마를 다시 걸며 "그래, 잘 생각했다"고 하셨습니다. 조금 쓸쓸해 보였습니다.', effect: { relation: -2 } },
    ],
  },

  // ---------- 연애·결혼·육아 ----------
  {
    id: 'meetSomeone', age: [20, 50], once: false, cooldown: 3,
    weight: (s) => 0.6 + s.relation / 60,
    if: (s) => !s.partner && !isStudent(s),
    prepare: (s) => { s.tmp.newName = anyName(); s.tmp.place = pick(MEET_PLACES); },
    title: '새로운 만남',
    text: '{place} {newName} 님을 만났습니다. 이상하게 대화가 잘 통합니다.',
    choices: [
      {
        label: '적극적으로 연락한다',
        outcomes: [
          { w: (s) => s.relation + (hasTrait(s, 'attractive') ? 25 : 0), result: '세 번째 만남에서 둘 다 같은 밈을 좋아한다는 걸 알았습니다. 그걸로 충분했습니다. 연애를 시작했습니다.', effect: { happy: 8, run: newPartner } },
          { w: 40, result: '읽씹당했습니다. 숫자 1이 사라지는 걸 보고 사흘을 기다렸습니다.', effect: { happy: -4 } },
        ],
      },
      { label: '지금은 일이 먼저다', result: '연락처만 저장해 뒀습니다. 1년 뒤 그 사람 프로필 사진이 웨딩 사진으로 바뀌었습니다.', effect: { smarts: 1, happy: -1 } },
    ],
  },
  {
    id: 'arrangedMarriage', age: [26, 34], priority: true,
    if: (s) => s.birthId === 'chaebol' && !s.partner && chance(0.5),
    prepare: (s) => { s.tmp.newName = anyName(); },
    title: '정략결혼',
    text: '할아버지가 사진 한 장을 내밉니다. "○○그룹 막내다. {newName}. 다음 주 토요일에 만나 봐라."',
    choices: [
      {
        label: '집안 뜻을 따른다',
        result: '호텔 그랜드볼룸에서 결혼했습니다. 하객 중 아는 얼굴은 열두 명이었습니다.',
        effect: { happy: -4, relation: -3, money: 50000, run: (s) => { newPartner(s); marry(s); }, moment: { ko: '재벌가 정략결혼', img: 'a lavish hotel ballroom wedding full of strangers in tuxedos', w: 3 } },
      },
      { label: '사랑을 찾겠다고 거절한다', result: '할아버지가 사흘 동안 말을 안 하셨습니다. 나흘째 되던 날 용돈이 끊겼습니다.', effect: { happy: 4, relation: 3, set: { defiedFamily: true } } },
    ],
  },
  {
    id: 'proposal', age: [24, 70], once: false, cooldown: 2,
    weight: 1.5,
    if: (s) => s.partner && s.partner.status === 'dating' && s.age - s.partner.since >= 1,
    title: '결혼할까?',
    text: '{partner} 님과 만난 지 꽤 됐습니다. 친구들이 "결혼은 언제 하냐"고 묻기 시작했습니다.',
    choices: [
      {
        label: '프러포즈한다',
        outcomes: [
          {
            w: (s) => 60 + s.relation / 2,
            result: '반지를 꺼내기도 전에 "응"이라는 대답이 돌아왔습니다. 준비한 멘트 3분은 쓰지 못했습니다.',
            effect: { happy: 12, money: -3000, run: marry, moment: { ko: '결혼식', img: 'a joyful wedding where family throws flower petals over the couple', w: 4 } },
          },
          { w: 15, result: '상대가 울었습니다. 감동의 눈물이 아니라 고민의 눈물이었습니다. 결국 헤어졌습니다.', effect: { happy: -15, run: (s) => { s.partner = null; } } },
        ],
      },
      { label: '아직은 아니다', result: '연애 기간이 늘어 갑니다. 명절마다 받는 질문도 늘어 갑니다.', effect: { happy: -1 } },
      { label: '헤어진다', result: '정리하고 보니 서로를 위한 선택이었습니다. 그래도 그 사람 동네는 한동안 피해 다녔습니다.', effect: { happy: -8, run: (s) => { s.partner = null; } } },
    ],
  },
  {
    id: 'coupleRut', age: [20, 60], once: false, cooldown: 4, weight: 0.6,
    if: (s) => s.partner && s.partner.status === 'dating',
    title: '권태기',
    text: '{partner} 님과의 데이트가 "뭐 먹을래?" "아무거나"로 시작해서 그걸로 끝납니다.',
    choices: [
      {
        label: '새로운 데이트를 계획한다',
        outcomes: [
          { w: 65, result: '도자기 공방에 갔습니다. 둘 다 컵을 만들려다 재떨이를 만들었고, 그게 너무 웃겼습니다.', effect: { happy: 5, relation: 4 } },
          { w: 35, result: '계획한 맛집이 휴무였습니다. 편의점 앞에서 컵라면을 먹다가 결국 헤어지자는 말이 나왔습니다.', effect: { happy: -8, run: (s) => { s.partner = null; } } },
        ],
      },
      { label: '헤어진다', result: '서로 고마웠다는 말을 하고 헤어졌습니다. 어른스러운 이별이었지만, 집에 와서는 어른스럽지 않게 울었습니다.', effect: { happy: -7, run: (s) => { s.partner = null; } } },
    ],
  },
  {
    id: 'baby', age: [25, 46], once: false, cooldown: 2,
    weight: (s) => (s.kids.length === 0 ? 2 : 0.8),
    if: (s) => isMarried(s) && !s.flags.dink && s.kids.length < 4,
    title: '아이 계획',
    text: (s) => (s.kids.length === 0 ? '{partner} 님이 조심스럽게 묻습니다. "우리 아기 가질까?"' : '아이가 하나 더 있으면 어떨까 하는 이야기가 나왔습니다.'),
    choices: [
      {
        label: '아이를 갖는다',
        result: '아기가 태어났습니다. 이름은 {kid}입니다. 수면 시간은 반으로, 행복은 두 배로 늘었습니다.',
        effect: {
          happy: 10, money: -800,
          run: (s) => {
            addKid(s);
            if (s.kids.length === 1) addMoment(s, { ko: '첫아이 탄생', img: 'holding a newborn baby in a hospital room with tears of joy', w: 4 });
          },
        },
      },
      { label: '조금 더 둘이 지낸다', result: '주말마다 둘이서 늦잠을 잡니다. 이 평화가 언제까지 갈지는 모릅니다.', effect: { happy: 2 } },
      { label: '아이 없이 살기로 한다', result: '둘이서 해외여행을 1년에 두 번 갑니다. 명절마다 같은 질문을 받는 건 덤입니다.', effect: { happy: 3, set: { dink: true } } },
    ],
  },
  {
    id: 'parenting', age: [27, 60], once: false, cooldown: 4,
    if: (s) => s.kids.some((k) => kidAge(s, k) >= 3 && kidAge(s, k) <= 12),
    prepare: (s) => { s.tmp.kid = pick(s.kids.filter((k) => kidAge(s, k) >= 3 && kidAge(s, k) <= 12)).name; },
    title: '육아 전쟁',
    text: '"주말에 놀이공원 가자!" {kid}의 눈이 반짝입니다. 당신은 이번 주 내내 야근을 했습니다.',
    choices: [
      { label: '피곤해도 놀이공원에 간다', result: '줄을 4시간 서서 놀이기구를 3분 탔습니다. 돌아오는 차에서 {kid}의 한마디. "오늘 최고였어." 남는 장사였습니다.', effect: { health: -3, happy: 6, relation: 5 } },
      { label: '집에서 같이 뒹군다', result: '거실에 이불로 성을 쌓았습니다. 놀이공원보다 이게 더 좋았다고 합니다.', effect: { happy: 4, relation: 3 } },
      { label: '태블릿을 쥐여 준다', result: '조용한 주말이었습니다. 너무 조용해서 조금 마음에 걸렸습니다.', effect: { health: 2, relation: -3 } },
    ],
  },
  {
    id: 'divorce', age: [30, 75], once: false, cooldown: 8,
    weight: (s) => (s.relation < 45 ? 1.2 : 0.25),
    if: (s) => isMarried(s),
    title: '부부의 위기',
    text: '{partner} 님과의 대화가 "밥 먹었어?"로만 남았습니다. 같은 집에 사는 룸메이트 같습니다.',
    choices: [
      {
        label: '부부 상담을 받는다',
        outcomes: [
          { w: 70, result: '상담 선생님 앞에서 10년 치 서운함을 털어놓았습니다. 돌아오는 길에 오랜만에 손을 잡았습니다.', effect: { money: -200, happy: 5, relation: 8 } },
          { w: 30, result: '상담실에서 크게 싸웠습니다. 상담 선생님이 말리셨습니다.', effect: { money: -200, happy: -5 } },
        ],
      },
      {
        label: '이혼한다',
        result: '재산을 반으로 나눴습니다. 키우던 고양이 양육권은 6개월 협상 끝에 공동으로 하기로 했습니다.',
        effect: {
          happy: -10, relation: -5,
          run: (s) => { s.money = Math.round(s.money / 2); s.home = Math.round(s.home / 2); s.partner = null; s.flags.divorced = true; },
          moment: { ko: '이혼', img: 'two people walking away in opposite directions on a quiet street, a cat looking back at both', w: 2 },
        },
      },
      { label: '그냥 참고 산다', result: '참는 것도 실력이라고 생각하기로 했습니다. 실력이 매일 늘고 있습니다.', effect: { happy: -4 } },
    ],
  },

  // ---------- 직장 생활 ----------
  {
    id: 'companyDinner', age: [21, 62], once: false, cooldown: 3,
    if: (s) => ['office', 'bigcorp', 'civil', 'factory'].includes(s.job),
    title: '회식',
    text: '부장님이 "오늘 다 같이 한잔하지!"라고 외칩니다. 단톡방에 "참석" 이모티콘이 줄줄이 올라옵니다.',
    choices: [
      {
        label: '3차까지 달린다',
        result: '노래방에서 부장님 18번을 같이 불렀습니다. 승진 점수 +1, 간 수치 +30.',
        effect: { relation: 4, health: -3, add: { drinks: 1 }, run: (s) => { if ((s.counters.drinks || 0) >= 3) s.flags.drinker = true; } },
      },
      { label: '1차만 하고 빠진다', result: '"집에 일이 있어서요." 집에 있던 일은 넷플릭스였습니다.', effect: { relation: -2, health: 1, happy: 2 } },
    ],
  },
  {
    id: 'drunkDriving', age: [25, 70], weight: 0.6,
    if: (s) => (s.flags.drinker || (s.counters.drinks || 0) >= 2) && s.job,
    title: '자동차 키',
    text: '술자리가 끝났습니다. 집까지는 차로 10분. 대리운전 대기 시간은 40분입니다.',
    choices: [
      { label: '대리운전을 부른다', result: '기사님이 인생 상담까지 해 주셨습니다. 대리비 3만 원에 포함된 서비스였습니다.', effect: { money: -3, happy: 1 } },
      {
        label: '그냥 운전한다',
        outcomes: [
          { w: 55, result: '무사히 도착했습니다. 다음 날 아침 그 10분을 떠올리니 등골이 서늘했습니다.', effect: { happy: -2 } },
          { w: 38, result: '음주 단속에 걸렸습니다. 면허 취소에 벌금 1,500만 원. 대리비 3만 원이 생각났습니다.', effect: { money: -1500, happy: -10, relation: -4, set: { criminalRecord: true } } },
          { w: 7, result: '교차로에서 신호를 보지 못했습니다.', effect: { death: 'drunkDriving' } },
        ],
      },
    ],
  },
  {
    id: 'promotion', age: [28, 60], once: false, cooldown: 5,
    if: (s) => ['office', 'bigcorp', 'civil'].includes(s.job) && s.jobYears >= 4,
    title: '승진 경쟁',
    text: '팀장 자리가 하나 비었습니다. 후보는 당신과 입사 동기, 그리고 사장님 조카입니다.',
    choices: [
      {
        label: '야근으로 승부한다',
        outcomes: [
          { w: (s) => 30 + s.smarts / 2, result: '팀장이 되었습니다. 이제 회의를 "하는" 사람에서 "잡는" 사람이 됐습니다.', effect: { health: -4, happy: 6, add: { overwork: 2 }, run: (s) => { s.flags.raise = (s.flags.raise || 0) + 0.25; } } },
          { w: 40, result: '승진은 사장님 조카가 했습니다. 당신에게 남은 건 야근 수당이 없는 야근뿐입니다.', effect: { health: -4, happy: -8, add: { overwork: 2 } } },
        ],
      },
      { label: '워라밸을 지킨다', result: '칼퇴 3년 차. 승진은 늦지만, 저녁노을이 이렇게 예쁜 줄 처음 알았습니다.', effect: { happy: 5, health: 2 } },
    ],
  },
  {
    id: 'jobOffer', age: [27, 55], once: false, cooldown: 6, weight: 0.6,
    if: (s) => ['office', 'bigcorp', 'freelancer'].includes(s.job) && s.jobYears >= 2,
    title: '이직 제안',
    text: '헤드헌터에게서 연락이 왔습니다. "연봉 30% 인상 가능합니다. 대신 업무 강도가 좀…"',
    choices: [
      { label: '옮긴다', result: '연봉이 30% 올랐습니다. 업무량은 70% 올랐습니다.', effect: { happy: -2, add: { overwork: 2 }, run: (s) => { s.flags.raise = (s.flags.raise || 0) + 0.3; s.jobYears = 0; } } },
      { label: '지금 회사에 남는다', result: '팀장님이 회식 자리에서 당신을 칭찬했습니다. 연봉 얘기는 없었습니다.', effect: { relation: 3 } },
    ],
  },
  {
    id: 'layoff', age: [45, 58], weight: 0.7,
    if: (s) => ['office', 'bigcorp'].includes(s.job),
    title: '구조조정',
    text: '회사가 희망퇴직 신청을 받는다고 합니다. "희망"이라는 단어가 이렇게 차갑게 들린 적이 없습니다.',
    choices: [
      {
        label: '희망퇴직을 신청한다',
        result: '퇴직금이 들어왔습니다. 가족에게 말하기 전 일주일 동안 등산복을 입고 "출근"했습니다.',
        effect: { money: 8000, happy: -6, job: null, run: (s) => { s.flags.raise = 0; } },
      },
      {
        label: '끝까지 버틴다',
        outcomes: [
          { w: 60, result: '살아남았습니다. 옆자리가 세 개 비었습니다. 업무는 세 배가 됐습니다.', effect: { happy: -6, add: { overwork: 2 } } },
          { w: 40, result: '결국 권고사직을 받았습니다. 퇴직금은 희망퇴직 때보다 적었습니다.', effect: { money: 3000, happy: -10, job: null, run: (s) => { s.flags.raise = 0; } } },
        ],
      },
    ],
  },
  {
    id: 'burnout', age: [22, 64], once: false, cooldown: 6,
    weight: (s) => (s.happy < 35 || (s.counters.overwork || 0) >= 8 ? 2 : 0.3),
    if: (s) => !!s.job && s.job !== 'retired',
    title: '번아웃',
    text: '월요일 아침, 지하철에서 내리지 못하고 종점까지 갔습니다. 그냥 몸이 움직이지 않았습니다.',
    choices: [
      { label: '상담을 받는다', result: '상담 선생님이 "충분히 잘하고 있어요"라고 했습니다. 그 말을 30년 동안 기다렸던 것 같습니다.', effect: { happy: 10, money: -200 } },
      { label: '그만두고 쉰다', result: '사표를 냈습니다. 첫 주는 해방감, 둘째 주는 불안, 셋째 주에야 진짜 쉬는 법을 배웠습니다.', effect: { happy: 12, health: 4, job: null, run: (s) => { s.flags.raise = 0; s.counters.overwork = 0; if (s.business) s.business = null; } } },
      { label: '참고 버틴다', result: '커피를 하루 다섯 잔으로 늘렸습니다. 문제는 해결되지 않았고, 심장만 빨라졌습니다.', effect: { happy: -6, health: -4, add: { overwork: 1 } } },
    ],
  },

  // ---------- 돈: 투자, 집, 사기 ----------
  {
    id: 'coin', age: [20, 65], once: false, cooldown: 7, weight: 0.8,
    if: (s) => s.money > 500,
    prepare: (s) => { s.tmp.amount = Math.round(Math.min(30000, Math.max(500, s.money * 0.6))); },
    title: '친구의 투자 권유',
    text: '"이번 코인은 진짜야. 다음 달에 10배 간대." 친구가 보여 준 차트는 오른쪽 위로 뻗은 선 하나입니다.',
    choices: [
      {
        label: (s) => `영끌해서 넣는다 (${formatMoney(s.tmp.amount)})`,
        outcomes: [
          {
            w: 15, result: '진짜로 올랐습니다! 8배! 사직서를 쓸까 사흘 동안 고민했습니다.',
            effect: { money: (s) => s.tmp.amount * 7, happy: 15, add: { gambles: 1 }, moment: { ko: '코인 대박', img: 'staring wide-eyed at a phone screen showing a skyrocketing green chart', w: 3 } },
          },
          { w: 40, result: '조금 올랐을 때 팔았습니다. 치킨 열 마리 값을 벌었고, 정확히 치킨 열 마리를 사 먹었습니다.', effect: { money: (s) => s.tmp.amount * 0.2, happy: 3, add: { gambles: 1 } } },
          { w: 45, result: '차트가 파랗게 질렸습니다. 당신도요. 라면을 끓이며 차트를 보다가 라면이 불었습니다.', effect: { money: (s) => -s.tmp.amount * 0.85, happy: -12, add: { gambles: 1 } } },
        ],
      },
      {
        label: '우량주에 조금만 넣는다',
        outcomes: [
          { w: 65, result: '꾸준히 올랐습니다. 지루하지만 아름다운 그래프입니다.', effect: { money: (s) => s.tmp.amount * 0.15, happy: 2 } },
          { w: 35, result: '조금 떨어졌습니다. "장기 투자"라고 스스로를 다독입니다.', effect: { money: (s) => -s.tmp.amount * 0.08 } },
        ],
      },
      { label: '적금이 최고다', result: '연 3.5% 적금에 넣었습니다. 친구는 다음 달부터 연락이 없습니다.', effect: { money: (s) => s.money * 0.03, happy: 1 } },
    ],
  },
  {
    id: 'lotteryTicket', age: [20, 85], once: false, cooldown: 6, weight: 0.5,
    title: '로또 한 장',
    text: '꿈에 돌아가신 할아버지가 나와서 숫자 여섯 개를 불러 주셨습니다. 일어나 보니 세 개만 기억납니다.',
    choices: [
      {
        label: '기억나는 숫자로 산다',
        outcomes: [
          { w: 90, result: '5천 원 당첨! 그 5천 원으로 다시 로또를 샀고, 꽝이었습니다.', effect: { happy: 2 } },
          { w: 9, result: '꽝입니다. 할아버지가 불러 주신 숫자는 아무래도 할아버지 전화번호였던 것 같습니다.', effect: { happy: -1, money: -1 } },
          { w: 1, result: '3등 당첨! 150만 원입니다. 할아버지 산소에 소주 한 병 올리러 갔습니다.', effect: { happy: 6, money: 150 } },
        ],
      },
      { label: '자동으로 산다', result: '꽝입니다. 그래도 일주일 동안 행복한 상상을 했으니 5천 원어치 값은 했습니다.', effect: { happy: 1 } },
    ],
  },
  {
    id: 'homeBuying', age: [30, 58], once: false, cooldown: 5,
    if: (s) => s.home === 0 && !!s.job && s.job !== 'inmate',
    title: '내 집 마련',
    text: '부동산 앱을 하루에 40번 엽니다. 집값은 오늘도 당신 월급보다 빨리 오릅니다.',
    choices: [
      {
        label: '영끌해서 아파트를 산다', if: (s) => netWorth(s) >= 5000,
        result: '등기부등본에 이름이 올라갔습니다. 은행 이름도 같이 올라갔습니다.',
        effect: {
          happy: 10, achieve: 'home',
          run: (s) => { s.home = 35000; s.money -= 35000; },
          moment: { ko: '첫 내 집 마련', img: 'standing proudly in front of a modest apartment building holding new house keys', w: 3 },
        },
      },
      {
        label: '전세로 들어간다',
        outcomes: [
          { w: 85, result: '깨끗한 전셋집을 구했습니다. 2년마다 이사 걱정을 하는 건 덤입니다.', effect: { happy: 3 } },
          {
            w: 15, result: '집주인이 사라졌습니다. 같은 건물 세입자 47명이 단톡방을 만들었습니다. 전세사기였습니다.',
            effect: { money: -15000, happy: -20, moment: { ko: '전세사기 피해', img: 'worried tenants gathered outside an apartment building with a sealed front door', w: 3 } },
          },
        ],
      },
      { label: '월세로 버틴다', result: '이번 달도 월세가 빠져나갔습니다. 집주인의 노후에 작은 보탬이 되고 있습니다.', effect: { happy: -2 } },
    ],
  },
  {
    id: 'scamOffer', age: [20, 50],
    weight: (s) => (s.money < 0 || s.happy < 40 ? 1.5 : 0.4),
    if: (s) => !s.flags.criminalRecord,
    title: '고수익 아르바이트',
    text: '"단순 전달 업무, 일당 50만 원, 경력 무관." 문자 한 통이 왔습니다.',
    choices: [
      {
        label: '해 본다',
        outcomes: [
          {
            w: 55, result: '당신이 전달한 건 보이스피싱 피해금이었습니다. 경찰이 집으로 찾아왔습니다.',
            effect: { happy: -15, relation: -8, run: (s) => arrest(s, 2), moment: { ko: '보이스피싱 연루로 수감', img: 'sitting alone in a gray holding cell, staring at a phone that is no longer theirs', w: 3 } },
          },
          { w: 45, result: '일주일 만에 350만 원을 벌었습니다. 이상하게 잠이 오지 않습니다.', effect: { money: 350, happy: -3, set: { smallCrime: true } } },
        ],
      },
      {
        label: '경찰에 신고한다',
        result: '조직 검거에 결정적인 제보가 되었습니다. 경찰서장 감사장을 액자에 넣어 거실에 걸었습니다.',
        effect: { happy: 6, relation: 4, achieve: 'whistle' },
      },
      { label: '무시한다', result: '스팸 차단을 눌렀습니다. 다음 날 같은 문자가 다른 번호로 왔습니다.', effect: {} },
    ],
  },
  {
    id: 'bigScam', age: [22, 55],
    if: (s) => s.flags.smallCrime && !s.flags.criminalRecord && s.job !== 'scammer',
    title: '더 큰 판',
    text: '지난번 "일"을 소개한 사람이 다시 연락했습니다. "이번엔 사무실 하나 맡아 볼래요? 월 천."',
    choices: [
      { label: '맡는다', result: '명함에 "대표"라고 찍혔습니다. 회사 이름은 3개월마다 바뀝니다.', effect: { job: 'scammer', money: 1000, relation: -5 } },
      { label: '여기서 손을 씻는다', result: '번호를 바꿨습니다. 그날 밤 처음으로 푹 잤습니다.', effect: { happy: 5, set: { smallCrime: false } } },
    ],
  },
  {
    id: 'prisonLife', age: [18, 90], once: false, cooldown: 1, prison: true,
    title: '수감 생활',
    text: '교도소의 하루는 길고, 1년은 생각보다 짧습니다. 남은 시간을 어떻게 쓸까요?',
    choices: [
      { label: '독서와 자격증 공부', result: '지게차 자격증을 땄습니다. 교도관님이 "여기서 나가면 진짜 써먹으라"고 했습니다.', effect: { smarts: 6 } },
      { label: '운동한다', result: '팔굽혀펴기 하루 500개. 출소할 때쯤엔 문을 어깨로 열 수 있을 것 같습니다.', effect: { health: 6 } },
      { label: '가족에게 편지를 쓴다', result: '답장은 석 달 뒤에 왔습니다. "밥은 잘 먹니." 그 한 줄을 백 번 읽었습니다.', effect: { relation: 6, happy: 3 } },
    ],
  },
  {
    id: 'secondhand', age: [18, 65],
    title: '중고거래',
    text: '중고거래 앱에 원하던 게임기가 반값에 올라왔습니다. 판매자가 "택배 거래만 돼요. 선입금 부탁드려요."라고 합니다.',
    choices: [
      {
        label: '선입금한다',
        outcomes: [
          { w: 60, result: '정상적인 판매자였습니다. 게임기는 상자에 뽁뽁이가 일곱 겹 둘러져서 왔습니다.', effect: { happy: 5, money: -30 } },
          { w: 40, result: '입금하자마자 판매자가 사라졌습니다. 판매자 이름은 "정직한 거래"였습니다.', effect: { happy: -5, money: -30 } },
        ],
      },
      { label: '직거래 아니면 안 산다', result: '지하철역에서 직거래했습니다. 판매자가 덤으로 게임 CD를 두 장 더 줬습니다.', effect: { happy: 4, money: -30 } },
    ],
  },

  // ---------- 건강 ----------
  {
    id: 'exercise', age: [20, 70], once: false, cooldown: 5,
    if: (s) => !s.flags.exercise,
    title: '운동해야 하는데',
    text: '계단 두 층을 올라갔는데 숨이 찹니다. 헬스장 전단지가 오늘따라 눈에 띕니다.',
    choices: [
      {
        label: '헬스장 1년권을 끊는다',
        outcomes: [
          { w: 40, result: '진짜로 꾸준히 다녔습니다! 거울 속 자신에게 인사하는 사람이 되었습니다.', effect: { health: 5, happy: 3, money: -60, set: { exercise: true } } },
          { w: 60, result: '첫 주 3번, 둘째 주 1번, 셋째 주부터는 헬스장의 기부 천사가 되었습니다.', effect: { money: -60, happy: -1 } },
        ],
      },
      { label: '동네 산책부터 시작한다', result: '매일 저녁 30분씩 걸었습니다. 동네 고양이들이 당신을 알아보기 시작했습니다.', effect: { health: 3, happy: 3, set: { exercise: true } } },
      { label: '내일부터 한다', result: '"내일"은 오늘도 오지 않았습니다.', effect: { happy: 1 } },
    ],
  },
  {
    id: 'quitSmoke', age: [20, 85], once: false, cooldown: 3,
    if: (s) => s.flags.smoker,
    title: '금연 도전',
    text: '담뱃값이 또 올랐습니다. 계단을 오를 때마다 폐가 항의합니다.',
    choices: [
      {
        label: '오늘부터 끊는다',
        outcomes: [
          { w: 35, result: '금연 성공! 아낀 담뱃값으로 매년 여행을 갑니다.', effect: { health: 5, happy: 4, achieve: 'quitSmoke', set: { smoker: false } } },
          { w: 65, result: '사흘 만에 실패했습니다. 이유는 "스트레스 때문"이었고, 스트레스의 원인은 금연이었습니다.', effect: { happy: -3 } },
        ],
      },
      { label: '그냥 계속 피운다', result: '"다음 달부터"라고 다짐했습니다. 다음 달에도 같은 다짐을 할 예정입니다.', effect: { happy: 1 } },
    ],
  },
  {
    id: 'quitDrink', age: [25, 80], once: false, cooldown: 4,
    if: (s) => s.flags.drinker,
    title: '술 줄이기',
    text: '건강검진 결과지의 간 수치 옆에 빨간 별표가 세 개 붙어 있습니다.',
    choices: [
      {
        label: '술을 끊는다',
        outcomes: [
          { w: 45, result: '회식에서 사이다를 마시는 사람이 됐습니다. 처음엔 어색했지만 다음 날 아침이 이렇게 상쾌한 줄 몰랐습니다.', effect: { health: 5, relation: -2, set: { drinker: false } } },
          { w: 55, result: '"오늘만 마시고 끊자"를 365일 했습니다.', effect: { happy: -2 } },
        ],
      },
      { label: '주 1회로 줄인다', result: '금요일만 마십니다. 금요일이 조금 길어졌을 뿐입니다.', effect: { health: 2 } },
    ],
  },
  {
    id: 'checkup', age: [40, 95], once: false, cooldown: 4,
    weight: (s) => (s.illness ? 2.5 : 0.8),
    title: '건강검진 안내',
    text: '국가건강검진 안내 문자가 왔습니다. 올해가 대상자입니다. 내시경 전날 금식이 벌써 무섭습니다.',
    choices: [
      {
        label: '검진을 받는다',
        result: (s) => (s.illness
          ? '의사 선생님이 사진을 한참 보더니 "정밀검사를 해 봐야겠습니다"라고 했습니다.'
          : '모든 수치가 정상입니다. 의사 선생님이 "운동은 하시죠?"라고 물었고, 당신은 거짓말을 했습니다.'),
        effect: { money: -30, run: (s) => { if (s.illness) s.illness.detected = true; } },
      },
      { label: '바빠서 미룬다', result: '내년에 받기로 했습니다. 작년에도 그렇게 말했습니다.', effect: { happy: 1 } },
    ],
  },
  {
    id: 'symptoms', age: [30, 100], priority: true,
    if: (s) => s.illness && !s.illness.detected && s.illness.years >= 1 && chance(0.5),
    title: '이상한 신호',
    text: '요즘 이유 없이 살이 빠지고 계속 피곤합니다. 계단을 오르다 쉬는 횟수가 늘었습니다.',
    choices: [
      { label: '큰 병원에 간다', result: '검사를 받았습니다. 의사 선생님이 보호자와 같이 오라고 했습니다.', effect: { money: -50, run: (s) => { s.illness.detected = true; } } },
      { label: '그냥 피곤한 거겠지', result: '영양제를 하나 더 샀습니다. 몸은 계속 신호를 보내고 있습니다.', effect: { happy: -2 } },
    ],
  },
  {
    id: 'illnessTreat', age: [30, 110], priority: true, once: false,
    if: (s) => s.illness && s.illness.detected && !s.illness.treated,
    prepare: (s) => { s.tmp.illness = ILLNESSES[s.illness.cause].name; },
    title: '진단',
    text: '{illness} 진단을 받았습니다. 병원 복도의 형광등이 유난히 하얗게 보입니다.',
    choices: [
      {
        label: '수술과 항암 치료를 받는다',
        outcomes: [
          {
            w: (s) => (s.illness.years <= 1 ? 85 : 45),
            result: '긴 치료 끝에 완치 판정을 받았습니다. 병원 복도의 종을 치는데 손이 떨렸습니다.',
            effect: {
              money: -3000, health: 15, happy: 10, achieve: 'survivor',
              run: (s) => { s.illness = null; },
              moment: { ko: '암 투병을 이겨냄', img: 'ringing a bell in a hospital hallway after finishing cancer treatment', w: 4 },
            },
          },
          {
            w: (s) => (s.illness.years <= 1 ? 15 : 55),
            result: '치료는 쉽지 않았습니다. 남은 시간을 어떻게 쓸지 생각하기 시작했습니다.',
            effect: { money: -3000, health: -10, run: (s) => { s.illness.treated = true; s.illness.fatalAt = s.illness.years + randInt(1, 2); } },
          },
        ],
      },
      {
        label: '치료 대신 여행을 떠난다',
        result: '오래 미뤄 둔 여행을 떠났습니다. 바닷가 노을이 이렇게 오래 붉은 줄 몰랐습니다.',
        effect: {
          happy: 15, money: -800,
          run: (s) => { s.illness.treated = true; },
          moment: { ko: '마지막 여행', img: 'watching a long sunset on a quiet beach during one last trip', w: 4 },
        },
      },
    ],
  },
  {
    id: 'midlife', age: [42, 52],
    title: '중년의 위기',
    text: '거울을 보다가 갑자기 슬퍼졌습니다. 흰머리가 "안녕"하고 인사합니다.',
    choices: [
      { label: '오토바이를 산다', result: '할리데이비슨을 샀습니다. 주말마다 국도를 달립니다. 가족 단톡방이 조용해졌습니다.', effect: { money: -2500, happy: 8, set: { bike: true }, moment: { ko: '중년의 오토바이', img: 'a middle-aged rider on a big motorcycle cruising a coastal road', w: 2 } } },
      { label: '기타를 배운다', result: '3년째 "로망스" 앞부분만 칩니다. 그래도 즐겁습니다.', effect: { happy: 6, smarts: 2 } },
      { label: '마라톤에 도전한다', result: '첫 하프 마라톤 완주! 결승선에서 울었는데, 다리가 아파서였습니다.', effect: { health: 6, happy: 4, set: { exercise: true } } },
    ],
  },

  // ---------- 출생 환경·직업별 이야기 ----------
  {
    id: 'heirStart', age: [24, 30], priority: true,
    if: (s) => s.birthId === 'chaebol' && s.job !== 'heir' && !s.flags.heirDecided && !isStudent(s) && !inArmy(s),
    title: '경영 수업',
    text: '할아버지가 부르셨습니다. "이제 회사 일을 배워라. 상무 자리 하나 비워 뒀다."',
    choices: [
      {
        label: '경영 수업을 받는다',
        result: '스물몇 살에 상무가 됐습니다. 회의 때마다 당신보다 나이 많은 부장님들이 고개를 숙입니다. 불편합니다.',
        effect: { job: 'heir', set: { heirDecided: true }, moment: { ko: '재벌 3세 경영 수업', img: 'a young executive alone in a huge top-floor office overlooking Seoul', w: 2 } },
      },
      { label: '내 힘으로 살아 보겠다', result: '할아버지가 혀를 차셨지만, 할머니가 몰래 "멋지다"고 문자를 보내셨습니다.', effect: { happy: 5, relation: 3, set: { heirDecided: true, defiedFamily: true } } },
    ],
  },
  {
    id: 'successionWar', age: [40, 55], priority: true,
    if: (s) => s.job === 'heir' && chance(0.3),
    title: '경영권 분쟁',
    text: '할아버지가 쓰러지셨습니다. 병원 복도에서 형제들이 서로 다른 변호사를 데리고 마주쳤습니다.',
    choices: [
      {
        label: '정면 승부한다',
        outcomes: [
          {
            w: (s) => s.smarts + s.relation / 2,
            result: '주주총회에서 이겼습니다. 그룹 회장이 됐습니다. 축하 화환이 엘리베이터를 막았습니다.',
            effect: { job: 'chairman', achieve: 'chairman', happy: 10, relation: -10, moment: { ko: '그룹 회장 취임', img: 'sitting at the head of a long boardroom table as the new chairman', w: 5 } },
          },
          {
            w: 50,
            result: '졌습니다. 해외 지사장으로 발령이 났습니다. 말이 지사장이지 사실상 유배입니다.',
            effect: { job: null, money: 100000, happy: -15, set: { exiled: true }, moment: { ko: '경영권 분쟁에서 패배', img: 'staring out of an airplane window at a gray sky, briefcase on lap', w: 3 } },
          },
        ],
      },
      { label: '형제와 화해한다', result: '공동 경영을 하기로 했습니다. 명절에 다시 한 상에 둘러앉았습니다. 반찬이 맛있었습니다.', effect: { relation: 15, happy: 6, money: 30000 } },
    ],
  },
  {
    id: 'gapjil', age: [30, 75], weight: 0.6,
    if: (s) => s.job === 'heir' || s.job === 'chairman',
    title: '갑질 논란',
    text: '회의 중에 직원에게 결재판을 던지는 영상이 퍼졌습니다. 화질은 4K였습니다. 기억이 납니다. 사실입니다.',
    choices: [
      { label: '진심으로 사과한다', result: '기자회견에서 고개를 숙였습니다. 그 뒤로 회의실 결재판은 모두 스펀지로 바뀌었습니다.', effect: { relation: 5, happy: -4 } },
      { label: '법무팀에 맡긴다', result: '기사는 내려갔지만 별명은 남았습니다. 인터넷은 잊지 않습니다.', effect: { relation: -8, happy: -2 } },
    ],
  },
  {
    id: 'idolHit', age: [17, 40],
    if: (s) => s.job === 'idol',
    title: '컴백',
    text: '신곡 컴백 날입니다. 음원 사이트 실시간 차트를 30초마다 새로고침합니다.',
    choices: [
      {
        label: '음방 1위를 노린다',
        outcomes: [
          {
            w: 45, result: '음원 차트 1위! 수상 소감에서 매니저 이름을 빼먹어서 다음 날 사과했습니다.',
            effect: { happy: 12, money: 5000, achieve: 'chart1', moment: { ko: '음원 차트 1위', img: 'holding a music show trophy as confetti falls on stage', w: 5 } },
          },
          { w: 55, result: '차트 23위. 팬들은 "역주행 가자"고 합니다. 그 말이 정말 고마웠습니다.', effect: { happy: 2, money: 1000 } },
        ],
      },
      { label: '팬 사인회에 집중한다', result: '하루에 팬 300명의 이름을 외웠습니다. 다음 날 당신 이름을 잊을 뻔했습니다.', effect: { relation: 8, health: -2 } },
    ],
  },
  {
    id: 'idolScandal', age: [18, 40],
    if: (s) => s.job === 'idol',
    title: '열애설',
    text: '"[단독] ○○, 한강에서 데이트 포착." 사진 속 당신은 모자를 두 개 겹쳐 쓰고 있습니다.',
    choices: [
      { label: '인정한다', result: '"좋은 감정을 가지고 알아 가는 중입니다." 팬 카페가 사흘 동안 시끄러웠다가 조용해졌습니다.', effect: { happy: 3, relation: -4 } },
      {
        label: '부인한다',
        outcomes: [
          { w: 50, result: '기사가 조용히 묻혔습니다. 대신 한강에 다시는 못 가게 됐습니다.', effect: { happy: -2 } },
          { w: 50, result: '다음 날 두 번째 사진이 나왔습니다. 모자는 세 개였습니다.', effect: { happy: -8, relation: -8 } },
        ],
      },
    ],
  },
  {
    id: 'idolEnd', age: [22, 45], priority: true,
    if: (s) => s.job === 'idol' && ((s.counters.idolYears || 0) >= 6 || s.age >= 32),
    title: '계약 만료',
    text: '7년 계약이 끝났습니다. 회사는 재계약 대신 "새로운 출발을 응원한다"는 입장문을 올렸습니다.',
    choices: [
      { label: '배우로 전향한다', result: '첫 작품은 대사 두 줄짜리 역할이었습니다. 그 두 줄을 천 번 연습했습니다.', effect: { job: 'actor', happy: 3 } },
      { label: '유튜버가 된다', result: '"아이돌 생활 썰" 영상이 대박이 났습니다. 회사 몰래 먹던 야식 이야기가 제일 인기입니다.', effect: { job: 'creator', set: { bigCreator: true }, achieve: 'creator', happy: 6 } },
      { label: '카페를 차린다', result: '팬들이 줄을 섰습니다. 넉 달 뒤에는 동네 주민들만 남았지만, 그분들은 커피 맛을 알아봐 줬습니다.', effect: { happy: 4, run: (s) => startBusiness(s, 'cafe') } },
    ],
  },
  {
    id: 'injury', age: [19, 40], weight: 0.8,
    if: (s) => s.job === 'athlete',
    title: '부상',
    text: '경기 중에 무릎에서 "툭" 소리가 났습니다. 들것에 실려 나가는 동안 관중석이 조용해졌습니다.',
    choices: [
      {
        label: '재활에 모든 걸 건다',
        outcomes: [
          { w: 60, result: '1년 만에 복귀했습니다. 복귀전 첫 득점에 관중들이 기립 박수를 쳤습니다.', effect: { happy: 10, health: -3, moment: { ko: '부상 후 감동의 복귀전', img: 'an athlete returning to a roaring stadium after a long injury', w: 3 } } },
          { w: 40, result: '재활은 끝났지만 예전 같지 않았습니다. 몸이 먼저 은퇴를 말했습니다.', effect: { happy: -10, health: -8, set: { careerEnding: true } } },
        ],
      },
      { label: '은퇴를 결심한다', result: '은퇴 기자회견에서 웃으며 손을 흔들었습니다. 집에 와서는 유니폼을 안고 울었습니다.', effect: { happy: -8, set: { careerEnding: true } } },
    ],
  },
  {
    id: 'athleteRetire', age: [27, 45], priority: true,
    if: (s) => s.job === 'athlete' && (s.flags.careerEnding || s.age >= 34),
    title: '은퇴 이후',
    text: '선수 생활을 마칠 때가 됐습니다. 운동 말고는 해 본 게 없습니다.',
    choices: [
      { label: '유소년 코치가 된다', result: '아이들이 당신 사인을 받아 갑니다. 당신은 아이들의 가능성을 받아 갑니다.', effect: { job: 'coach', happy: 6, relation: 5 } },
      { label: '해설위원이 된다', result: '첫 중계에서 너무 흥분해서 캐스터보다 목소리가 컸습니다. 그 영상이 밈이 됐습니다.', effect: { job: 'creator', happy: 5 } },
      { label: '치킨집을 차린다', result: '가게 벽에 현역 시절 유니폼을 걸었습니다. 단골들이 사진을 찍고 갑니다.', effect: { happy: 3, run: (s) => startBusiness(s, 'chicken') } },
    ],
  },
  {
    id: 'doctorCareer', age: [28, 40], priority: true,
    if: (s) => s.job === 'resident' && s.flags.residentLeft <= 0,
    title: '전문의',
    text: '전공의 4년이 끝났습니다. 4년 동안 평균 수면 시간은 4시간이었습니다. 이제 어디서 일할까요?',
    choices: [
      {
        label: '대학병원에 남는다',
        result: '교수의 길을 걷기로 했습니다. 연구실 불은 오늘도 마지막으로 꺼집니다.',
        effect: { job: 'doctor', add: { overwork: 2 }, moment: { ko: '대학병원 교수', img: 'a doctor teaching medical students around a hospital bed', w: 2 } },
      },
      {
        label: '빚내서 개원한다',
        result: '병원 간판을 달았습니다. 대출 원금을 갚는 데 7년이 걸릴 예정입니다.',
        effect: { job: 'doctor', money: -30000, run: (s) => { s.flags.raise = 0.5; }, moment: { ko: '내 이름을 건 병원 개원', img: 'standing proudly in front of a small clinic with their name on the sign', w: 3 } },
      },
      {
        label: '의료 봉사를 떠난다',
        result: '아프리카 의료 봉사를 떠났습니다. 월급은 적지만, 하루에 "고맙다"는 말을 100번 듣습니다.',
        effect: { job: 'doctor', happy: 10, relation: 10, run: (s) => { s.flags.raise = -0.5; }, moment: { ko: '해외 의료 봉사', img: 'treating smiling children at a small clinic under a vast African sky', w: 4 } },
      },
    ],
  },
  {
    id: 'returnFarm', age: [50, 68], weight: 0.5,
    if: (s) => s.job !== 'farmer' && !s.business,
    title: '귀농',
    text: '주말마다 시골 땅 매물을 봅니다. 상추를 직접 키워 먹는 꿈을 꿉니다.',
    choices: [
      {
        label: '귀농한다',
        outcomes: [
          { w: 75, result: '첫해 수확한 고추를 자녀들에게 택배로 보냈습니다. 택배비가 고춧값보다 많이 나왔습니다.', effect: { job: 'farmer', happy: 8, health: 5, money: -5000, moment: { ko: '귀농', img: 'tending a vegetable field in the countryside wearing a straw hat', w: 3 } } },
          { w: 25, result: '땅을 샀는데 알고 보니 맹지(길이 없는 땅)였습니다. 이웃 할머니 밭을 지나서 출근합니다.', effect: { job: 'farmer', happy: 2, money: -9000 } },
        ],
      },
      { label: '주말농장으로 만족한다', result: '5평짜리 주말농장을 분양받았습니다. 상추가 너무 많이 자라서 아파트 단지에 나눠 줍니다.', effect: { happy: 5, relation: 3 } },
    ],
  },
  {
    id: 'villageChief', age: [55, 85],
    if: (s) => s.job === 'farmer' || (s.career.farmer || 0) >= 5,
    title: '이장 선거',
    text: '마을 이장 선거가 열립니다. 어르신들이 당신을 추천했습니다. 경쟁자는 30년째 이장인 김씨 할아버지입니다.',
    choices: [
      {
        label: '출마한다',
        outcomes: [
          { w: (s) => s.relation, result: '당선! 첫 업무는 마을 방송 테스트였습니다. "아아, 마이크 테스트." 마을 전체가 들었습니다.', effect: { relation: 10, happy: 8, achieve: 'villageChief', moment: { ko: '마을 이장 당선', img: 'speaking into an old village loudspeaker microphone with a proud smile', w: 3 } } },
          { w: 50, result: '김씨 할아버지가 31년째 이장이 됐습니다. 당선 축하 막걸리는 같이 마셨습니다.', effect: { relation: 4 } },
        ],
      },
      { label: '김씨 할아버지를 밀어준다', result: '김씨 할아버지가 고맙다며 수박을 한 통 주셨습니다. 매년 주십니다.', effect: { relation: 6 } },
    ],
  },
  {
    id: 'findParents', age: [22, 50],
    if: (s) => s.flags.orphan,
    title: '친부모 찾기',
    text: '경찰서 실종아동 센터에서 연락이 왔습니다. 유전자 정보가 일치할 수도 있는 사람이 있다고 합니다.',
    choices: [
      {
        label: '만나러 간다',
        outcomes: [
          {
            w: 40, result: '기차역에서 처음 본 얼굴인데 웃는 모습이 당신과 똑같았습니다. 둘 다 말없이 한참 울었습니다.',
            effect: { happy: 12, relation: 10, achieve: 'reunion', moment: { ko: '친부모와의 재회', img: 'a tearful reunion hug with a long-lost parent at a busy train station', w: 5 } },
          },
          { w: 35, result: '그분은 이미 몇 년 전 세상을 떠났습니다. 묘소에 꽃을 놓고, 하고 싶던 말을 다 했습니다.', effect: { happy: -6, relation: 3 } },
          { w: 25, result: '만났지만 서로 무슨 말을 해야 할지 몰랐습니다. 연락처를 주고받았고, 가끔 안부를 묻습니다.', effect: { happy: -2, relation: 2 } },
        ],
      },
      { label: '지금의 가족으로 충분하다', result: '보육원 형제들 단톡방에 "오늘 다 같이 밥 먹자"고 올렸습니다. 열한 명이 왔습니다.', effect: { happy: 4, relation: 4 } },
    ],
  },
  {
    id: 'payParentsDebt', age: [24, 45],
    if: (s) => s.flags.familyDebt && s.money > 0,
    title: '부모님의 빚',
    text: '아버지가 오랜만에 전화하셨습니다. 한참 날씨 이야기를 하시다가 빚 이야기를 꺼내십니다.',
    choices: [
      { label: '대신 갚아 드린다', result: '모아 둔 돈이 거의 다 나갔습니다. 아버지가 처음으로 당신 앞에서 우셨습니다.', effect: { money: -5000, relation: 10, happy: 2, set: { paidDebt: true } } },
      { label: '거절한다', result: '"저도 살아야죠." 맞는 말인데, 전화를 끊고 오래 마음이 무거웠습니다.', effect: { relation: -6, happy: -4 } },
    ],
  },
  {
    id: 'parentsCare', age: [42, 65], weight: 0.8,
    if: (s) => !s.flags.orphan && !s.flags.parentsDead,
    title: '부모님 간병',
    text: '어머니가 넘어지셔서 고관절을 다치셨습니다. 혼자 지내시기 어려워졌습니다.',
    choices: [
      {
        label: '집으로 모신다',
        result: '어머니가 매일 아침 당신 출근 옷차림을 지적하십니다. 다 큰 자식도 잔소리는 받습니다.',
        effect: { relation: 8, happy: -6, money: -1500, health: -3, moment: { ko: '부모님을 모심', img: 'helping an elderly mother walk slowly along a park path in spring', w: 3 } },
      },
      { label: '요양원에 모신다', result: '주말마다 찾아갑니다. 어머니는 요양원 친구들에게 당신 자랑만 하십니다.', effect: { money: -3000, relation: 2, happy: -2 } },
      { label: '형제에게 미룬다', if: (s) => s.flags.sibling, result: '형제와 단톡방에서 크게 싸웠습니다. 명절이 무서워졌습니다.', effect: { relation: -8, happy: -3 } },
    ],
  },
  {
    id: 'parentsDeath', age: [42, 78], priority: true,
    if: (s) => !s.flags.orphan && !s.flags.parentsDead && chance((s.age - 40) * 0.012),
    title: '부모님과의 이별',
    text: '부모님이 세상을 떠나셨습니다. 장례식장에서 처음 보는 친척이 가장 크게 웁니다.',
    choices: [
      {
        label: '유산을 정리한다', if: (s) => !s.flags.familyDebt,
        result: (s) => (INHERITANCE[family(s)] > 0
          ? `유산 ${formatMoney(INHERITANCE[family(s)])}을 상속받았습니다. 통장보다 부모님 휴대폰 사진첩이 더 오래 마음에 남았습니다.`
          : '남기신 건 낡은 앨범 한 권이었습니다. 앨범 속 당신은 늘 웃고 있었습니다.'),
        effect: { happy: -10, set: { parentsDead: true }, money: (s) => INHERITANCE[family(s)] },
      },
      {
        label: '상속을 포기한다', if: (s) => s.flags.familyDebt,
        result: '법원에 상속포기 서류를 냈습니다. 빚 대신 아버지가 쓰시던 낡은 손목시계만 받아 왔습니다.',
        effect: { happy: -10, set: { parentsDead: true } },
      },
      {
        label: '빚까지 모두 떠안는다', if: (s) => s.flags.familyDebt,
        result: '"아버지 이름에 빚이 남는 게 싫었습니다." 남은 빚을 모두 갚기로 했습니다.',
        effect: { happy: -8, relation: 8, money: -8000, set: { parentsDead: true } },
      },
    ],
  },

  // ---------- 일상 ----------
  {
    id: 'reunion', age: [30, 80], once: false, cooldown: 8,
    title: '동창회',
    text: '20년 만의 동창회 공지가 떴습니다. 단톡방이 갑자기 북적입니다.',
    choices: [
      {
        label: '간다',
        outcomes: [
          { w: 60, result: '다들 부동산 이야기만 합니다. 그래도 반장이 노래방에서 부른 노래는 20년 전과 똑같았습니다.', effect: { relation: 5, happy: 3 } },
          { w: 40, result: '첫사랑이 왔습니다. 대머리가 됐습니다. 추억은 추억으로 남겨야 아름답다는 걸 배웠습니다.', effect: { relation: 4, happy: 1 } },
        ],
      },
      { label: '안 간다', result: '단톡방 사진으로만 봤습니다. 다들 나이를 먹었고, 당신도 사진을 보며 나이를 실감했습니다.', effect: { happy: -1 } },
    ],
  },
  {
    id: 'pet', age: [22, 70],
    if: (s) => !s.flags.pet,
    prepare: (s) => { s.tmp.petName = pick(['콩이', '보리', '두부', '뭉치', '호두', '나비', '초코']); },
    title: '유기견 보호소',
    text: '지나가다 들른 유기견 보호소에서 한 녀석이 당신만 쳐다봅니다. 이름표에는 "{petName}"라고 적혀 있습니다.',
    choices: [
      {
        label: '입양한다',
        result: '{petName}가 집에 왔습니다. 첫날 소파를 뜯었고, 둘째 날 당신의 마음을 뜯어 갔습니다.',
        effect: { happy: 8, relation: 3, money: -100, run: (s) => { s.flags.pet = s.tmp.petName; s.flags.petSince = s.age; }, moment: { ko: '유기견 입양', img: 'walking a scruffy rescued dog along a riverside path at sunset', w: 3 } },
      },
      { label: '정기 후원만 한다', result: '매달 3만 원씩 후원합니다. 보호소 소식지에 {petName}가 입양됐다는 소식이 실렸습니다.', effect: { happy: 3, money: -36 } },
    ],
  },
  {
    id: 'petGoodbye', age: [30, 95],
    if: (s) => s.flags.pet && s.age - s.flags.petSince >= 13,
    prepare: (s) => { s.tmp.petName = s.flags.pet; },
    title: '무지개다리',
    text: '{petName}가 무지개다리를 건넜습니다. 현관에 아직 산책 줄이 걸려 있습니다.',
    choices: [
      { label: '사진첩을 만든다', result: '13년 치 사진을 정리하다 보니 당신 사진보다 {petName} 사진이 열 배 많았습니다.', effect: { happy: -8, run: (s) => { s.flags.pet = null; } } },
      { label: '보호소에서 새 친구를 데려온다', result: '{petName}를 잊은 건 아닙니다. {petName}가 준 사랑을 다른 아이에게 나눠 주기로 했습니다.', effect: { happy: -3, run: (s) => { s.flags.pet = '새 친구'; s.flags.petSince = s.age; } } },
    ],
  },
  {
    id: 'weddingGift', age: [26, 50], once: false, cooldown: 6,
    title: '청첩장',
    text: '5년간 연락 없던 대학 동기가 모바일 청첩장을 보냈습니다. "꼭 와 줘!"',
    choices: [
      { label: '10만 원 내고 간다', result: '뷔페가 맛있었습니다. 축의금의 절반은 회수한 것 같습니다.', effect: { money: -10, relation: 3 } },
      { label: '5만 원만 보낸다', result: '계좌로 5만 원을 보냈습니다. "고마워!" 답장에 하트가 하나 붙어 있었습니다.', effect: { money: -5, relation: 1 } },
      { label: '모른 척한다', result: '3년 뒤, 그 동기가 당신 결혼식에 와서 30만 원을 냈습니다. 마음이 아팠습니다.', effect: { relation: -3 } },
    ],
  },
  {
    id: 'travel', age: [22, 80], once: false, cooldown: 4,
    if: (s) => s.money > 500,
    title: '휴가',
    text: '드디어 휴가입니다. 어디로 갈까요?',
    choices: [
      {
        label: '유럽 일주를 떠난다',
        result: '에펠탑 앞에서 사진을 찍었습니다. 사진 속 당신은 웃고 있지만, 카드 명세서는 울고 있습니다.',
        effect: { money: -800, happy: 8, moment: { ko: '유럽 여행', img: 'grinning in front of the Eiffel Tower with an oversized backpack', w: 2 } },
      },
      { label: '동남아 휴양지에 간다', result: '수영장 옆 선베드에서 사흘 동안 책 한 권을 읽었습니다. 사실 열 쪽 읽었습니다.', effect: { money: -250, happy: 5, health: 2 } },
      { label: '집에서 쉰다', result: '"집콕도 여행이다." 냉장고에서 거실까지 왕복 47번을 여행했습니다.', effect: { happy: 2, health: 1 } },
    ],
  },
  {
    id: 'noise', age: [22, 80], once: false, cooldown: 10,
    title: '층간소음',
    text: '새벽 1시, 윗집에서 쿵쿵 소리가 납니다. 사흘째입니다.',
    choices: [
      {
        label: '올라가서 따진다',
        outcomes: [
          { w: 60, result: '윗집 아이가 줄넘기 대회를 준비 중이었습니다. 다음 날 사과 편지와 귤 한 봉지가 문 앞에 있었습니다.', effect: { happy: 3, relation: 2 } },
          { w: 40, result: '윗집 사람과 크게 싸웠습니다. 엘리베이터에서 마주칠 때마다 공기가 얼어붙습니다.', effect: { happy: -5, relation: -3 } },
        ],
      },
      { label: '정중한 쪽지를 붙인다', result: '다음 날 답장 쪽지가 붙었습니다. 그렇게 윗집과 펜팔이 시작됐습니다.', effect: { relation: 3, happy: 1 } },
      { label: '귀마개를 산다', result: '귀마개를 끼고 잤더니 알람 소리도 못 들었습니다. 지각했습니다.', effect: { happy: -2 } },
    ],
  },
  {
    id: 'diet', age: [20, 60], once: false, cooldown: 6,
    title: '다이어트',
    text: '여름이 다가옵니다. 작년 여름옷이 당신을 거부합니다.',
    choices: [
      {
        label: '간헐적 단식을 한다',
        outcomes: [
          { w: 45, result: '6kg을 뺐습니다! 축하 기념으로 치킨을 먹었습니다.', effect: { health: 4, happy: 3 } },
          { w: 55, result: '단식 16시간 중 15시간 50분에 무너졌습니다. 마지막 10분이 가장 길었습니다.', effect: { happy: -2 } },
        ],
      },
      { label: '"건강한 몸이 최고"라며 포기한다', result: '옷을 새로 샀습니다. 한 치수 크게. 마음이 편해졌습니다.', effect: { happy: 3, money: -20 } },
    ],
  },
  {
    id: 'youtube', age: [20, 60], weight: 0.4,
    if: (s) => s.job !== 'creator',
    title: '유튜브나 해 볼까?',
    text: '퇴근길 지하철에서 "유튜브로 월 천 버는 법" 영상을 봤습니다. 이상하게 할 수 있을 것 같습니다.',
    choices: [
      {
        label: '채널을 개설한다',
        outcomes: [
          {
            w: 10, result: '세 번째 영상이 알고리즘을 탔습니다. 구독자 100만! 회사에 사표를 냈습니다.',
            effect: { job: 'creator', happy: 12, achieve: 'creator', set: { bigCreator: true }, moment: { ko: '구독자 100만 유튜버', img: 'holding a shiny gold play button award in a small home studio', w: 4 } },
          },
          { w: 90, result: '구독자 37명. 그중 12명은 가족, 3명은 본인 부계정입니다. 그래도 댓글 하나에 하루가 행복합니다.', effect: { happy: 2 } },
        ],
      },
      { label: '보기만 한다', result: '"유튜브로 월 천 버는 법" 영상의 조회수를 1회 올려 줬습니다.', effect: {} },
    ],
  },
  {
    id: 'benefactor', age: [18, 65], weight: 0.4,
    title: '길에서 만난 어르신',
    text: '횡단보도 앞에서 할아버지가 무거운 짐을 들고 쩔쩔매고 계십니다. 신호가 곧 바뀝니다.',
    choices: [
      {
        label: '짐을 들어 드린다',
        outcomes: [
          { w: 80, result: '할아버지가 "복 받을 거야"라며 사탕을 주셨습니다. 그날 하루가 이상하게 잘 풀렸습니다.', effect: { happy: 4, relation: 3 } },
          { w: 20, result: '알고 보니 근처 건물 세 채의 주인이셨습니다. 며칠 뒤 감사 인사와 함께 봉투가 왔습니다.', effect: { happy: 6, relation: 3, money: 1000 } },
        ],
      },
      { label: '바빠서 지나친다', result: '회사에 2분 일찍 도착했습니다. 그 2분 동안 계속 그 할아버지가 생각났습니다.', effect: { happy: -2 } },
    ],
  },

  // ---------- 모험 ----------
  {
    id: 'valley', age: [15, 55], once: false, cooldown: 7,
    weight: (s) => (hasTrait(s, 'reckless') ? 1.5 : 0.6),
    title: '여름 계곡',
    text: '친구들과 계곡에 놀러 왔습니다. 친구들이 높은 바위 위에서 다이빙을 합니다. "너도 뛰어!"',
    choices: [
      {
        label: '뛰어든다',
        outcomes: [
          { w: 92, result: '인생 최고의 여름이었습니다. 영상은 단톡방 레전드로 남았습니다.', effect: { happy: 6, relation: 3 } },
          { w: 6, result: '바위에 다리를 긁혀 열두 바늘을 꿰맸습니다. 흉터가 훈장처럼 남았습니다.', effect: { health: -10 } },
          { w: 2, result: '물속에서 다리에 쥐가 났습니다.', effect: { death: 'drown' } },
        ],
      },
      { label: '구경하며 수박을 지킨다', result: '수박을 안전하게 지켜 냈습니다. 계곡물에 담가 둔 수박은 정말 시원했습니다.', effect: { happy: 3 } },
    ],
  },
  {
    id: 'mountain', age: [35, 78], once: false, cooldown: 6,
    title: '주말 산행',
    text: '산악회 회원들과 등산 중입니다. 대장님이 지도에 없는 지름길이 있다고 합니다.',
    choices: [
      {
        label: '지름길로 간다',
        outcomes: [
          { w: 90, result: '20분 일찍 정상에 도착했습니다. 정상 막걸리가 꿀맛이었습니다.', effect: { health: 3, happy: 4 } },
          { w: 7, result: '발을 헛디뎌 발목을 접질렸습니다. 헬기 대신 대장님 등에 업혀 내려왔습니다.', effect: { health: -10, relation: 3 } },
          { w: 3, result: '젖은 바위에서 미끄러졌습니다.', effect: { death: 'fall' } },
        ],
      },
      { label: '정규 등산로로 간다', result: '천천히 올라가며 들꽃 이름을 열 개 배웠습니다. 막걸리는 남아 있지 않았습니다.', effect: { health: 4, happy: 2 } },
    ],
  },
  {
    id: 'everest', age: [30, 58],
    weight: (s) => (hasTrait(s, 'reckless') ? 2 : 0.3),
    if: (s) => s.health >= 60 && (hasTrait(s, 'reckless') || s.money >= 8000),
    title: '에베레스트',
    text: '버킷리스트 맨 위에는 늘 "에베레스트 등정"이 적혀 있었습니다. 원정대에 자리가 하나 남았다고 합니다.',
    choices: [
      {
        label: '떠난다',
        outcomes: [
          {
            w: 55, result: '해발 8,848m 정상에 섰습니다. 산소마스크 너머로 세상이 동그랗게 보였습니다.',
            effect: { money: -8000, happy: 15, health: -5, achieve: 'everest', moment: { ko: '에베레스트 정상', img: 'standing on the summit of Mount Everest planting a tiny flag above a sea of clouds', w: 5 } },
          },
          { w: 37, result: '정상 300m 앞에서 돌아섰습니다. 셰르파가 "산은 내년에도 있다"고 했습니다.', effect: { money: -8000, happy: -3, health: -8 } },
          { w: 8, result: '정상 부근에서 눈보라를 만났습니다.', effect: { money: -8000, death: 'everest' } },
        ],
      },
      { label: '다큐멘터리로 만족한다', result: '에베레스트 다큐멘터리를 세 편 봤습니다. 고산병 증상을 전부 외웠습니다.', effect: { happy: 1 } },
    ],
  },
  {
    id: 'skydive', age: [20, 65], weight: 0.4,
    title: '스카이다이빙',
    text: '생일 선물로 친구가 스카이다이빙 체험권을 줬습니다. 고도는 4,000m입니다.',
    choices: [
      {
        label: '뛰어내린다',
        outcomes: [
          { w: 97, result: '처음 3초는 비명, 다음 50초는 환호였습니다. 착지하자마자 한 번 더 하고 싶어졌습니다.', effect: { happy: 10, moment: { ko: '스카이다이빙', img: 'free-falling above patchwork farmland with arms spread wide and a huge grin', w: 3 } } },
          { w: 2.5, result: '착지하다 발목이 꺾였습니다. 하늘은 좋았는데 땅이 문제였습니다.', effect: { health: -8, happy: 4 } },
          { w: 0.5, result: '낙하산이 펴지지 않았습니다.', effect: { death: 'skydive' } },
        ],
      },
      { label: '체험권을 중고로 판다', result: '체험권을 팔아서 치킨을 사 먹었습니다. 하늘보다 치킨이 더 안전합니다.', effect: { happy: 3, money: 15 } },
    ],
  },
);
