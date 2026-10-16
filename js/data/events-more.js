// 추가 사건 묶음: 어린 시절·학창 시절·노년기를 보강하고, 새 인생 경로(이민, 프로게이머, 웹툰 작가, 교수)를 더합니다.

RETIRABLE.push('professor', 'expat', 'webtoonist');

EVENTS.push(
  // ---------- 영유아 (0~6세) ----------
  {
    id: 'firstSteps', age: [1, 2],
    title: '첫걸음',
    text: '소파를 붙잡고 서 있던 당신이 손을 놓았습니다. 거실 반대편에서 가족들이 두 팔을 벌리고 있습니다.',
    choices: [
      { label: '엄마에게 걸어간다', result: '세 걸음 만에 엄마 품에 안겼습니다. 이 영상은 결혼식 때 다시 상영됩니다.', effect: { relation: 3, health: 2 } },
      { label: '냉장고로 걸어간다', result: '목적지가 분명한 아이입니다. 가족들은 박수를 치다 말고 웃었습니다.', effect: { happy: 3, smarts: 1 } },
      { label: '그냥 기어간다', result: '"걷는 건 비효율적"이라는 듯 다시 엎드렸습니다. 첫걸음은 다음 달로 미뤄졌습니다.', effect: { happy: 2 } },
    ],
  },
  {
    id: 'toyTantrum', age: [3, 6],
    title: '장난감 가게 앞',
    text: '마트 장난감 코너에서 로봇 하나가 당신을 부릅니다. 보호자는 "오늘은 구경만 하자"고 했습니다.',
    choices: [
      { label: '바닥에 드러눕는다', outcomes: [
        { w: 40, result: '10분 뒤 로봇은 당신 품에 있었습니다. 대신 보호자의 눈빛은 한동안 차가웠습니다.', effect: { happy: 5, relation: -3 } },
        { w: 60, result: '보호자가 카트를 끌고 그냥 지나갔습니다. 혼자 남은 바닥은 생각보다 차가웠습니다.', effect: { happy: -3, smarts: 2 } },
      ] },
      { label: '생일 선물로 예약한다', result: '"생일에 사 줄게." 그 약속을 237일 동안 매일 확인했습니다.', effect: { smarts: 2, relation: 2 } },
    ],
  },
  {
    id: 'santa', age: [5, 8],
    title: '산타의 정체',
    text: '크리스마스이브 밤, 화장실에 가다가 아빠가 선물을 트리 밑에 두는 걸 봤습니다.',
    choices: [
      { label: '못 본 척한다', result: '다음 날 아침 "산타 할아버지 고마워요!"를 외쳤습니다. 이 연기로 2년 더 선물을 받았습니다.', effect: { smarts: 3, happy: 3 } },
      { label: '"아빠가 산타였어?"', result: '아빠가 선물을 든 채 굳었습니다. 그해 크리스마스는 조금 일찍 어른이 된 날이었습니다.', effect: { happy: -2, relation: 2 } },
    ],
  },
  {
    id: 'grandparentsSummer', age: [4, 9],
    if: (s) => !s.flags.orphan && !s.flags.grandma,
    title: '시골 할머니 댁',
    text: '여름방학에 시골 할머니 댁에 왔습니다. 마당에 강아지와 닭, 그리고 모기 수천 마리가 있습니다.',
    choices: [
      { label: '개울에서 하루 종일 논다', result: '올챙이를 서른 마리 잡았다가 다 놓아줬습니다. 얼굴이 새까맣게 탔습니다.', effect: { health: 4, happy: 5 } },
      { label: '할머니 옆에서 옥수수를 먹는다', result: '할머니가 옛날이야기를 해 주셨습니다. 같은 이야기를 세 번 들었지만 세 번 다 재밌었습니다.', effect: { relation: 5, happy: 3 } },
      { label: '와이파이를 찾아 헤맨다', result: '면사무소 앞에서 신호 한 칸을 찾았습니다. 그 앞에서 동네 아이들과 친구가 됐습니다.', effect: { relation: 3, smarts: 1 } },
    ],
  },
  {
    id: 'kidsCafe', age: [4, 7],
    title: '친구 생일 파티',
    text: '어린이집 친구의 키즈카페 생일 파티에 초대받았습니다. 선물을 고를 시간입니다.',
    choices: [
      { label: '내가 갖고 싶은 걸 산다', result: '친구가 선물을 열자 당신이 더 기뻐했습니다. 결국 둘이 같이 가지고 놀았습니다.', effect: { happy: 4, relation: 2 } },
      { label: '편지를 정성껏 쓴다', result: '글씨는 반쯤 거울 글씨였지만, 친구 엄마가 냉장고에 붙여 두셨습니다.', effect: { relation: 5 } },
    ],
  },
  {
    id: 'pictureDiary', age: [5, 7],
    title: '그림일기',
    text: '선생님이 그림일기 숙제를 내 주셨습니다. 주제는 "우리 가족"입니다.',
    choices: [
      { label: '가족을 정직하게 그린다', result: '아빠 배를 너무 정직하게 그렸습니다. 아빠는 그날부터 운동을 시작했습니다.', effect: { relation: 3, happy: 2 } },
      { label: '공룡도 가족에 넣는다', result: '"우리 가족: 엄마, 아빠, 나, 티라노." 선생님이 별 다섯 개를 주셨습니다.', effect: { happy: 5, smarts: 1 } },
    ],
  },

  // ---------- 초등학생 (7~12세) ----------
  {
    id: 'dictation', age: [7, 9],
    title: '받아쓰기',
    text: '받아쓰기 시험지를 받았습니다. 빨간 비가 내렸습니다. 30점입니다.',
    choices: [
      { label: '0을 8로 고쳐 본다', outcomes: [
        { w: 30, result: '"80점이네!" 보호자가 칭찬했습니다. 양심이 사흘 동안 따끔거렸습니다.', effect: { happy: 2, smarts: -1 } },
        { w: 70, result: '선생님 도장 옆에 숫자가 너무 굵었습니다. 금방 들켰고, 받아쓰기 연습이 두 배가 됐습니다.', effect: { smarts: 3, relation: -2 } },
      ] },
      { label: '틀린 단어를 열 번씩 쓴다', result: '"닭"을 열 번 쓰다가 "닭"이 무슨 글자인지 잊어버렸습니다. 다음 시험은 90점이었습니다.', effect: { smarts: 5, happy: -1 } },
    ],
  },
  {
    id: 'relay', age: [8, 12],
    title: '운동회 계주',
    text: '운동회 반 대항 계주의 마지막 주자가 됐습니다. 바통을 받을 때 우리 반은 2등입니다.',
    choices: [
      { label: '젖 먹던 힘까지 달린다', outcomes: [
        { w: (s) => 30 + (hasTrait(s, 'athletic') ? 40 : 0), result: '결승선 직전 역전! 반 친구들이 운동장으로 쏟아져 나왔습니다. 그날 당신은 전설이 됐습니다.', effect: { happy: 8, relation: 6, health: 2 } },
        { w: 50, result: '코너에서 넘어졌습니다. 일어나서 끝까지 달렸고, 그게 더 큰 박수를 받았습니다.', effect: { health: -3, relation: 4 } },
      ] },
      { label: '앞 주자와 페이스를 맞춘다', result: '2등을 지켰습니다. 담임 선생님이 "안정적이었다"고 했습니다. 칭찬인지는 모르겠습니다.', effect: { happy: 2 } },
    ],
  },
  {
    id: 'allowance', age: [9, 12],
    title: '첫 용돈',
    text: '이번 달부터 일주일에 5천 원씩 용돈을 받게 됐습니다.',
    choices: [
      { label: '문방구 뽑기에 쓴다', result: '뽑기 기계에 3주치 용돈을 넣었습니다. 나온 건 지우개 일곱 개였습니다.', effect: { happy: 4, add: { gambles: 0.3 } } },
      { label: '돼지 저금통에 모은다', result: '1년 뒤 저금통을 깼더니 23만 원이 나왔습니다. 경제 감각이 생겼습니다.', effect: { smarts: 4, set: { saver: true } } },
      { label: '친구들에게 떡볶이를 쏜다', result: '그 주에 당신은 반에서 제일 인기 있는 사람이었습니다. 다음 주엔 아니었습니다.', effect: { relation: 5, happy: 2 } },
    ],
  },
  {
    id: 'witnessBullying', age: [9, 13],
    title: '목격',
    text: '쉬는 시간, 반 친구 한 명이 여럿에게 둘러싸여 놀림을 받고 있습니다. 다들 못 본 척합니다.',
    choices: [
      { label: '"그만해"라고 말한다', result: '목소리가 떨렸지만 분위기가 멈췄습니다. 그 친구와는 졸업할 때까지 단짝이 됐습니다.', effect: { relation: 6, happy: 3 } },
      { label: '선생님께 몰래 알린다', result: '다음 날 반 전체가 상담을 받았습니다. 누가 알렸는지는 아무도 모릅니다.', effect: { relation: 2, smarts: 2 } },
      { label: '모른 척한다', result: '그날 일은 생각보다 오래 기억에 남았습니다. 어른이 되어서도 가끔 떠오릅니다.', effect: { happy: -4 } },
    ],
  },
  {
    id: 'pianoContest', age: [8, 13],
    if: (s) => hasTrait(s, 'musical') || s.flags.talentTrained,
    title: '콩쿠르',
    text: '피아노 학원 선생님이 콩쿠르에 나가 보자고 합니다. 무대 위 피아노는 집에 있는 것보다 세 배 큽니다.',
    choices: [
      { label: '나간다', outcomes: [
        { w: (s) => (hasTrait(s, 'musical') ? 60 : 25), result: '금상을 받았습니다! 트로피가 당신 키의 절반입니다.', effect: { happy: 8, smarts: 3, set: { wantsStar: true }, moment: { ko: '피아노 콩쿠르 금상', img: 'a child bowing beside a grand piano on a big stage holding a trophy', w: 2 } } },
        { w: 50, result: '중간에 악보가 하얘졌습니다. 즉흥으로 마무리했는데 심사위원 한 분이 웃으며 박수를 쳤습니다.', effect: { happy: 1, smarts: 2 } },
      ] },
      { label: '무대는 무섭다', result: '대신 집에서 가족을 위해 연주회를 열었습니다. 관객 셋, 기립 박수 셋.', effect: { relation: 3, happy: 2 } },
    ],
  },
  {
    id: 'camp', age: [10, 12],
    title: '수련회',
    text: '2박 3일 수련회입니다. 마지막 날 밤 촛불 의식에서 교관님이 "부모님을 생각해 보세요"라고 합니다.',
    choices: [
      { label: '펑펑 운다', result: '옆 친구도 울고, 그 옆 친구도 울었습니다. 교관님은 이 장면을 매주 봅니다.', effect: { relation: 4, happy: 2 } },
      { label: '버틴다', result: '끝까지 안 울었는데 집에 와서 엄마 얼굴을 보자마자 울었습니다.', effect: { relation: 3 } },
      { label: '몰래 과자 파티를 연다', result: '조교에게 걸려 새벽 2시에 운동장을 세 바퀴 돌았습니다. 그래도 과자는 맛있었습니다.', effect: { happy: 5, health: 1, relation: 3 } },
    ],
  },
  {
    id: 'scienceKit', age: [9, 12],
    title: '과학의 날',
    text: '과학의 날 행사입니다. 물로켓, 과학상자, 상상화 그리기 중 하나를 골라야 합니다.',
    choices: [
      { label: '물로켓', outcomes: [
        { w: 50, result: '운동장 끝까지 날아갔습니다. 교감 선생님 차 지붕에 착지했습니다.', effect: { happy: 6, smarts: 2 } },
        { w: 50, result: '발사 직후 물이 전부 당신 쪽으로 쏟아졌습니다. 과학은 냉정합니다.', effect: { happy: 2, smarts: 1 } },
      ] },
      { label: '과학상자', result: '선풍기 자동차를 만들었습니다. 바람이 반대로 불어 뒤로 갔지만 "창의적"이라는 평을 받았습니다.', effect: { smarts: 5 } },
      { label: '상상화 그리기', result: '"2050년 우리 동네"를 그렸습니다. 하늘을 나는 버스 정류장에 줄이 길었습니다.', effect: { happy: 3, smarts: 2 } },
    ],
  },
  {
    id: 'petBegging', age: [7, 12],
    if: (s) => !s.flags.pet,
    title: '강아지 키우고 싶어',
    text: '친구네 강아지를 보고 온 뒤로 "우리도 강아지 키우자"를 하루에 스무 번 말합니다.',
    choices: [
      { label: '산책 당번 계약서를 쓴다', outcomes: [
        { w: (s) => (family(s) >= 2 ? 50 : 25), result: '계약서가 통했습니다. 유기견 보호소에서 "보리"를 데려왔습니다. 산책은 3주 만에 아빠 몫이 됐습니다.', effect: { happy: 8, relation: 3, run: (s) => { s.flags.pet = '보리'; s.flags.petSince = s.age; } } },
        { w: 50, result: '"너 금붕어도 못 키웠잖아." 반박할 수 없었습니다.', effect: { happy: -2 } },
      ] },
      { label: '다마고치로 참는다', result: '디지털 강아지를 키웠습니다. 일주일 만에 세 번 죽었습니다. 아직은 때가 아니었습니다.', effect: { smarts: 1, happy: 1 } },
    ],
  },
  {
    id: 'parentsWork', age: [8, 12],
    if: (s) => !s.flags.orphan,
    title: '부모님 회사 구경',
    text: '"자녀와 함께 출근하는 날"입니다. 부모님 회사에 따라왔습니다.',
    choices: [
      { label: '회의에 조용히 앉아 있는다', result: '회의는 두 시간 동안 아무것도 결정하지 않았습니다. 어른들도 숙제가 있다는 걸 알았습니다.', effect: { smarts: 4 } },
      { label: '탕비실 간식을 섭렵한다', result: '믹스커피를 몰래 마셨다가 밤 2시까지 잠이 안 왔습니다.', effect: { happy: 4, health: -1 } },
    ],
  },

  // ---------- 청소년 (13~19세) ----------
  {
    id: 'fandom', age: [13, 18],
    title: '덕질',
    text: '최애 아이돌이 컴백합니다. 앨범 버전이 일곱 가지고, 포토카드는 랜덤입니다.',
    choices: [
      { label: '일곱 가지 다 산다', result: '원하는 포토카드는 끝내 안 나왔습니다. 중고거래 앱에서 2만 원에 샀습니다. 처음부터 그럴 걸 그랬습니다.', effect: { happy: 6, add: { gambles: 0.3 } } },
      { label: '음원 스트리밍만 한다', result: '하루 18시간 스트리밍했습니다. 최애가 1위를 했고, 그 1위의 0.0001%는 당신 몫입니다.', effect: { happy: 4, smarts: -1 } },
      { label: '덕질 대신 공부한다', result: '최애의 "꿈을 포기하지 마세요"를 실천했습니다. 성적이 올랐습니다.', effect: { smarts: 4 } },
    ],
  },
  {
    id: 'groupProject', age: [13, 24],
    if: (s) => s.age <= 18 || isStudent(s),
    title: '조별 과제',
    text: '조별 과제 단톡방에 네 명이 있습니다. 그중 두 명은 3일째 "넵"만 보냈습니다.',
    choices: [
      { label: '혼자 다 한다', result: '발표까지 혼자 했습니다. 점수는 모두가 똑같이 A를 받았습니다. 세상은 공평하지 않습니다.', effect: { smarts: 4, happy: -4, add: { overwork: 1 } } },
      { label: '조원 평가에 솔직하게 쓴다', result: '"○○: 기여도 0%." 다음 학기 그 친구와 또 같은 조가 됐습니다.', effect: { relation: -3, happy: 2 } },
      { label: '단톡방에 공지를 박는다', result: '"내일까지 각자 파트 안 주면 이름 뺍니다." 다음 날 아침 6시에 파일 세 개가 도착했습니다.', effect: { smarts: 2, relation: 2, happy: 3 } },
    ],
  },
  {
    id: 'firstJob', age: [15, 19],
    if: (s) => !s.job,
    title: '첫 아르바이트',
    text: '용돈이 모자랍니다. 동네 편의점과 고깃집에서 아르바이트를 구한다고 합니다.',
    choices: [
      { label: '편의점 야간', result: '새벽 3시에 컵라면을 사러 온 손님과 인생 이야기를 나눴습니다. 시급보다 배운 게 많았습니다.', effect: { money: 0, happy: 1, health: -2, smarts: 2, set: { earlyJob: true } } },
      { label: '고깃집 서빙', result: '불판을 하루에 200장 갈았습니다. 사장님이 끝날 때마다 고기를 구워 주셨습니다.', effect: { health: 1, relation: 3, set: { earlyJob: true } } },
      { label: '공부가 우선이다', result: '아르바이트 대신 독서실에 갔습니다. 독서실 총무님이 시급 얘기를 해 줬습니다.', effect: { smarts: 3 } },
    ],
  },
  {
    id: 'mockExam', age: [16, 18],
    title: '모의고사 성적표',
    text: '모의고사 성적표가 나왔습니다. 수학 점수가 신발 사이즈와 비슷합니다.',
    choices: [
      { label: '인강 패스를 결제한다', outcomes: [
        { w: 55, result: '인강을 1.8배속으로 들었습니다. 다음 모의고사에서 점수가 두 배가 됐습니다.', effect: { smarts: 6 } },
        { w: 45, result: '인강 강사님 유머만 외웠습니다. 수학은 그대로입니다.', effect: { happy: 3, smarts: 1 } },
      ] },
      { label: '성적표를 숨긴다', result: '책상 서랍, 침대 밑, 신발장. 결국 보호자가 학교 홈페이지에서 확인했습니다.', effect: { relation: -4, happy: -2 } },
    ],
  },
  {
    id: 'studentCouncil', age: [15, 18],
    title: '학생회장 선거',
    text: '학생회장 선거 공약을 고민 중입니다. 친구들은 "매점 메뉴"만 이야기합니다.',
    choices: [
      { label: '"교복 대신 체육복 등교"를 건다', outcomes: [
        { w: (s) => s.relation + (hasTrait(s, 'leader') ? 40 : 0), result: '압도적 당선! 공약은 교장 선생님 반대로 "금요일만"이 되었지만, 역사는 그렇게 시작됩니다.', effect: { happy: 8, relation: 6, achieve: 'president', moment: { ko: '학생회장 당선', img: 'a teen giving a victory speech at a school assembly with friends cheering', w: 2 } } },
        { w: 50, result: '2위로 떨어졌습니다. 당선자의 공약은 "매점 피자빵 매일 입고"였습니다. 이길 수 없는 상대였습니다.', effect: { happy: -3, relation: 2 } },
      ] },
      { label: '출마 대신 선거 운동원을 한다', result: '친구가 당선됐습니다. 당신은 "킹메이커"라는 별명을 얻었습니다.', effect: { relation: 5 } },
    ],
  },
  {
    id: 'snsCringe', age: [13, 17],
    title: 'SNS 흑역사',
    text: '새벽 2시, 감성에 젖어 SNS에 긴 글을 올리려 합니다. 제목은 "아무도 날 이해 못 해"입니다.',
    choices: [
      { label: '올린다', result: '다음 날 아침 댓글이 47개 달렸습니다. 그중 46개가 친구들의 "ㅋㅋㅋ"였습니다. 이 글은 10년 뒤에도 소환됩니다.', effect: { happy: -2, relation: 2 } },
      { label: '메모장에만 쓴다', result: '현명한 선택이었습니다. 이 메모는 서른 살에 다시 읽고 혼자 이불을 찹니다.', effect: { smarts: 2, happy: 1 } },
    ],
  },
  {
    id: 'proGamerScout', age: [15, 19], weight: 3,
    if: (s) => s.flags.gamer && !s.job,
    title: '프로팀 연락',
    text: '게임 랭킹 상위권에 이름이 오르자, 한 프로팀에서 "테스트 한번 볼래요?"라는 메시지가 왔습니다.',
    choices: [
      { label: '테스트를 본다', outcomes: [
        { w: (s) => 25 + s.smarts / 4, result: '입단! 숙소에서 하루 14시간 연습합니다. 엄마는 아직도 "그게 직업이냐"고 묻습니다.', effect: { job: 'progamer', happy: 12, achieve: 'progamer', set: { afterDone: true, track: 'esports' }, moment: { ko: '프로게이머 입단', img: 'a teenager signing with an esports team in a room full of gaming monitors', w: 4 } } },
        { w: 60, result: '마지막 라운드에서 손이 떨렸습니다. 탈락했지만 랭킹은 여전히 상위권입니다.', effect: { happy: -6, smarts: 1 } },
      ] },
      { label: '게임은 취미로 남긴다', result: '친구들과 주말에만 합니다. 이기면 더 즐겁고, 져도 덜 슬픕니다.', effect: { happy: 3, smarts: 2 } },
    ],
  },
  {
    id: 'festivalStage', age: [14, 18],
    title: '학교 축제 장기자랑',
    text: '학교 축제 장기자랑 신청 마감이 오늘입니다. 친구가 같이 춤을 추자고 합니다.',
    choices: [
      { label: '무대에 오른다', outcomes: [
        { w: 55, result: '전교생 앞에서 아이돌 춤을 췄습니다. 이날 영상은 졸업 앨범 QR코드로 박제됐습니다.', effect: { happy: 7, relation: 6 } },
        { w: 45, result: '음악이 끊겼습니다. 무반주로 끝까지 췄고, 그 뻔뻔함에 기립 박수가 나왔습니다.', effect: { happy: 4, relation: 5 } },
      ] },
      { label: '객석에서 응원한다', result: '응원 피켓을 만들어 흔들었습니다. 친구가 무대에서 당신을 가리켰습니다.', effect: { relation: 3, happy: 2 } },
    ],
  },
  {
    id: 'dyeHair', age: [16, 19],
    title: '일탈',
    text: '수능이 끝나면 하고 싶은 게 있었습니다. 머리를 탈색하는 겁니다.',
    choices: [
      { label: '탈색 세 번', result: '머리카락이 노란색을 넘어 빨대 질감이 됐습니다. 그래도 거울 속 내가 낯설고 좋았습니다.', effect: { happy: 6, health: -1 } },
      { label: '귀를 뚫는다', result: '생각보다 안 아팠습니다. 보호자는 사흘 뒤에야 알아챘습니다.', effect: { happy: 4 } },
      { label: '그냥 잔다', result: '12년의 피로를 사흘 동안 풀었습니다. 이것도 훌륭한 일탈입니다.', effect: { health: 4, happy: 3 } },
    ],
  },

  // ---------- 청년 (20~39세) ----------
  {
    id: 'gradSchool', age: [22, 30],
    if: (s) => (s.flags.college === 'good' || s.smarts >= 70) && !s.job && !isStudent(s) && !s.flags.gradDone,
    title: '대학원 진학',
    text: '지도 교수님이 대학원에 오라고 합니다. "연구실 분위기 좋아." 선배들의 눈빛이 묘합니다.',
    choices: [
      { label: '대학원에 간다', result: '연구실 자리를 받았습니다. 첫날 밤 11시, 선배가 "일찍 가네?"라고 했습니다.', effect: { job: 'gradstudent', smarts: 5, happy: -2, set: { gradDone: true } } },
      { label: '취업한다', result: '교수님이 아쉬워하셨습니다. 선배들은 조용히 엄지를 들어 줬습니다.', effect: { set: { gradDone: true } } },
    ],
  },
  {
    id: 'thesis', age: [26, 40], priority: true,
    if: (s) => s.job === 'gradstudent' && s.jobYears >= 4,
    title: '학위 논문 심사',
    text: '논문 심사 날입니다. 심사위원 한 분이 첫 장부터 빨간 펜을 꺼냈습니다.',
    choices: [
      { label: '밤새 준비한 대로 발표한다', outcomes: [
        { w: (s) => 30 + s.smarts / 2, result: '통과! 박사가 됐습니다. 이제 명함에 "Dr."를 붙일 수 있지만, 아무도 그렇게 부르지 않습니다.', effect: { happy: 12, smarts: 5, set: { phd: true }, moment: { ko: '박사 학위 취득', img: 'wearing a doctoral gown and hood, holding a thesis on graduation day', w: 3 } } },
        { w: 35, result: '"한 학기만 더 고쳐 오세요." 연구실 의자가 당신의 모양대로 꺼져 있습니다.', effect: { happy: -8, health: -2 } },
      ] },
      { label: '그만두고 취업한다', result: '석사로 마무리하고 회사에 들어갔습니다. 연구실 동기들이 부러운 눈으로 배웅했습니다.', effect: { job: 'office', happy: 4, smarts: 2 } },
    ],
  },
  {
    id: 'professorJob', age: [30, 50], priority: true,
    if: (s) => s.flags.phd && s.job === 'gradstudent',
    title: '교수 임용',
    text: '박사 후 연구원으로 몇 년을 보냈습니다. 지방 국립대에서 교수 공채 면접 연락이 왔습니다.',
    choices: [
      { label: '면접을 본다', outcomes: [
        { w: (s) => 25 + s.smarts / 3, result: '임용됐습니다! 연구실 문에 이름표가 붙었습니다. 사진을 37장 찍었습니다.', effect: { job: 'professor', happy: 12, achieve: 'professor', moment: { ko: '교수 임용', img: 'standing proudly at the door of their own university office with a nameplate', w: 4 } } },
        { w: 50, result: '최종 2인에서 떨어졌습니다. 내년 공채를 기다리기로 했습니다.', effect: { happy: -6, money: -300 } },
      ] },
      { label: '기업 연구소로 간다', result: '연봉이 교수 첫해의 두 배입니다. 대신 논문 대신 보고서를 씁니다.', effect: { job: 'bigcorp', achieve: 'bigcorp', happy: 3 } },
    ],
  },
  {
    id: 'emigrateOffer', age: [25, 45],
    if: (s) => !s.flags.emigrated && !!s.job && s.job !== 'expat' && (s.smarts >= 60 || s.flags.bilingual || s.flags.workingHoliday),
    weight: 0.6,
    title: '해외 취업 제안',
    text: '해외 지사에서 일할 사람을 찾는다고 합니다. 연봉은 오르고, 김치는 비싸집니다.',
    choices: [
      {
        label: '떠난다',
        result: '캐리어 두 개에 인생을 담았습니다. 공항에서 가족이 손을 흔드는 모습이 오래 남았습니다.',
        effect: { job: 'expat', happy: 4, relation: -4, set: { emigrated: true }, moment: { ko: '해외 이민', img: 'waving goodbye to family at an airport gate with two big suitcases', w: 4 } },
      },
      { label: '한국에 남는다', result: '"다음 기회에." 그 말을 하고 퇴근길 떡볶이를 먹었습니다. 역시 한국이 좋습니다.', effect: { happy: 2, relation: 2 } },
    ],
  },
  {
    id: 'abroadLife', age: [26, 70], once: false, cooldown: 4,
    if: (s) => s.job === 'expat',
    title: '타국 생활',
    text: '해외 생활 몇 년 차입니다. 현지 마트에서 한국 라면을 발견하면 아직도 심장이 뜁니다.',
    choices: [
      { label: '현지 친구를 사귄다', result: '동료 집 바비큐 파티에 초대받았습니다. 당신이 가져간 불고기가 그날의 주인공이었습니다.', effect: { relation: 6, happy: 4, smarts: 2 } },
      { label: '한인 마트에서 김치를 산다', result: '김치 한 통에 2만 8천 원. 비싸지만 마음의 고향 값입니다.', effect: { happy: 5, money: -3 } },
      { label: '향수병에 영상통화를 한다', result: '시차 때문에 엄마는 새벽 3시에 전화를 받았습니다. 그래도 목소리는 반가웠습니다.', effect: { relation: 4, happy: -1 } },
    ],
  },
  {
    id: 'abroadDecision', age: [32, 75], priority: true,
    if: (s) => s.job === 'expat' && (s.career.expat || 0) >= 6 && !s.flags.abroadDecided,
    title: '영주권',
    text: '영주권을 신청할 수 있게 됐습니다. 이곳에 뿌리를 내릴지, 돌아갈지 정할 때입니다.',
    choices: [
      { label: '이곳에 정착한다', result: '영주권이 나왔습니다. 이제 이 도시의 지하철 노선도가 서울보다 익숙합니다.', effect: { happy: 6, achieve: 'emigrate', set: { abroadDecided: true } } },
      { label: '한국으로 돌아간다', result: '인천공항에 내리자마자 국밥을 먹었습니다. 역시 돌아오길 잘했습니다.', effect: { happy: 8, relation: 6, job: 'office', set: { abroadDecided: true } } },
    ],
  },
  {
    id: 'webtoonDebut', age: [19, 40],
    if: (s) => !s.flags.webtoonTried && (s.flags.track === 'arts' || hasTrait(s, 'shy') || s.happy < 55),
    weight: 0.5,
    title: '웹툰 공모전',
    text: '퇴근 후 몰래 그리던 만화가 있습니다. 웹툰 플랫폼 공모전 마감이 이번 주입니다.',
    choices: [
      { label: '응모한다', outcomes: [
        { w: 22, result: '우수상! 정식 연재 제안이 왔습니다. 첫 화 댓글 1등이 "작가님 혹시 제 얘기 쓰세요?"였습니다.', effect: { job: 'webtoonist', happy: 12, achieve: 'webtoon', set: { webtoonTried: true }, moment: { ko: '웹툰 작가 데뷔', img: 'celebrating in front of a laptop showing their first published webtoon episode', w: 4 } } },
        { w: 78, result: '낙선했습니다. 그래도 SNS에 올렸더니 팔로워가 300명 생겼습니다.', effect: { happy: 2, relation: 2, set: { webtoonTried: true } } },
      ] },
      { label: '그림은 취미로', result: '주말마다 카페에서 그립니다. 마감이 없는 그림이 이렇게 즐거운 줄 몰랐습니다.', effect: { happy: 4, set: { webtoonTried: true } } },
    ],
  },
  {
    id: 'webtoonDeadline', age: [20, 60], once: false, cooldown: 3,
    if: (s) => s.job === 'webtoonist',
    title: '마감',
    text: '마감까지 6시간. 원고는 60% 완성됐습니다. 손목이 이상한 소리를 냅니다.',
    choices: [
      { label: '밤을 새운다', result: '마감 3분 전에 업로드했습니다. 그 화가 이번 시즌 최고 조회수를 찍었습니다.', effect: { health: -5, happy: 3, money: 300, add: { overwork: 1 } } },
      { label: '휴재 공지를 올린다', result: '"작가 건강 문제로 휴재합니다." 댓글 창이 걱정으로 가득 찼습니다. 독자들이 생각보다 다정했습니다.', effect: { health: 4, happy: 2, money: -200 } },
    ],
  },
  {
    id: 'progamerWorlds', age: [17, 30],
    if: (s) => s.job === 'progamer',
    title: '세계 대회',
    text: '세계 대회 결승입니다. 관중석에 5만 명, 생중계 시청자 3천만 명입니다.',
    choices: [
      { label: '평소처럼 한다', outcomes: [
        { w: 40, result: '우승! 트로피를 들어 올리는 순간, 엄마가 처음으로 "잘했다"고 문자를 보냈습니다.', effect: { happy: 15, money: 5000, moment: { ko: '세계 대회 우승', img: 'lifting a huge esports world championship trophy under confetti and stage lights', w: 5 } } },
        { w: 60, result: '준우승입니다. 대기실에서 한참 울었지만, 팬들이 공항에 마중 나와 있었습니다.', effect: { happy: -3, money: 1500, relation: 4 } },
      ] },
      { label: '긴장을 풀려고 바나나를 먹는다', result: '바나나 효과였는지 손이 덜 떨렸습니다. 결과와 상관없이 이 루틴은 은퇴까지 계속됩니다.', effect: { happy: 3, health: 1 } },
    ],
  },
  {
    id: 'progamerRetire', age: [24, 32], priority: true,
    if: (s) => s.job === 'progamer' && (s.career.progamer || 0) >= 5,
    title: '은퇴 기자회견',
    text: '반응 속도가 예전 같지 않습니다. 열아홉 살 신인에게 한 번 진 게임이 오래 생각납니다.',
    choices: [
      { label: '게임 방송인이 된다', result: '개인 방송을 시작했습니다. 현역 시절보다 더 많이 웃고, 더 많이 법니다.', effect: { job: 'creator', happy: 6, set: { bigCreator: true } } },
      { label: '코치가 된다', result: '팀의 코치가 됐습니다. 신인에게 "손목 스트레칭부터 해"라고 말하는 자신이 낯섭니다.', effect: { job: 'coach', happy: 4, relation: 4 } },
      { label: '늦깎이 대학생이 된다', result: '스물여섯 살 신입생입니다. 동기들이 당신을 알아보고 사인을 받아 갔습니다.', effect: { job: null, smarts: 4, set: { student: 4, college: 'normal' } } },
    ],
  },
  {
    id: 'remoteWork', age: [24, 55],
    if: (s) => ['office', 'bigcorp', 'freelancer'].includes(s.job),
    weight: 0.7,
    title: '재택근무',
    text: '회사가 주 3일 재택근무를 시작했습니다. 출근 시간 0분, 하지만 침대와의 거리도 0분입니다.',
    choices: [
      { label: '홈오피스를 꾸민다', result: '모니터 받침대와 조명을 샀습니다. 화상회의 배경이 동료들 사이에서 화제가 됐습니다.', effect: { happy: 5, money: -150, smarts: 1 } },
      { label: '잠옷으로 일한다', result: '화상회의 중 상의만 정장이었습니다. 일어나는 순간 모두가 봤습니다.', effect: { happy: 3, relation: -1 } },
      { label: '카페로 출근한다', result: '아메리카노 한 잔으로 6시간을 버텼습니다. 사장님 눈빛이 점점 날카로워집니다.', effect: { happy: 2, money: -50 } },
    ],
  },
  {
    id: 'badBoss', age: [23, 55],
    if: (s) => ['office', 'bigcorp', 'civil', 'factory'].includes(s.job),
    weight: 0.8,
    title: '빌런 상사',
    text: '새 팀장님은 퇴근 10분 전에 일을 줍니다. 오늘도 5시 50분에 "잠깐 얘기 좀"이 왔습니다.',
    choices: [
      { label: '웃으며 받는다', result: '야근을 했습니다. 팀장님은 6시 정각에 퇴근하셨습니다.', effect: { happy: -5, add: { overwork: 1 }, relation: 2 } },
      { label: '"내일 오전에 드릴게요"', result: '팀장님이 3초간 말이 없었습니다. 그리고 "그래요"라고 했습니다. 세상이 무너지지 않았습니다.', effect: { happy: 4 } },
      { label: '인사팀 면담을 신청한다', outcomes: [
        { w: 50, result: '팀장님이 다른 부서로 갔습니다. 회식 자리에서 팀원들이 당신에게 술잔을 돌렸습니다.', effect: { happy: 8, relation: 5 } },
        { w: 50, result: '면담 내용이 팀장님 귀에 들어갔습니다. 회사 생활이 조금 추워졌습니다.', effect: { happy: -6, relation: -3 } },
      ] },
    ],
  },
  {
    id: 'aiReplace', age: [28, 60],
    if: (s) => ['office', 'bigcorp', 'freelancer', 'webtoonist'].includes(s.job),
    weight: 0.5,
    title: 'AI가 온다',
    text: '회사에 AI 도구가 들어왔습니다. 당신이 일주일 걸리던 보고서를 3분 만에 씁니다. 오타도 없습니다.',
    choices: [
      { label: 'AI를 제일 잘 쓰는 사람이 된다', result: '사내 AI 활용 교육 강사가 됐습니다. 이제 AI가 쓴 보고서를 고치는 게 당신 일입니다.', effect: { smarts: 5, happy: 3, run: (s) => { s.flags.raise = (s.flags.raise || 0) + 0.1; } } },
      { label: '불안해서 자격증을 딴다', result: '주말마다 학원에 다녀 자격증을 땄습니다. 그 시험 문제도 AI가 냈다는 소문이 있습니다.', effect: { smarts: 3, happy: -2, money: -200 } },
      { label: '버틴다', outcomes: [
        { w: 60, result: 'AI가 못하는 일이 아직 많았습니다. 예를 들면 부장님 기분 맞추기 같은 거요.', effect: { happy: 1 } },
        { w: 40, result: '조직 개편으로 팀이 사라졌습니다. 위로금을 받고 회사를 나왔습니다.', effect: { job: null, money: 3000, happy: -8 } },
      ] },
    ],
  },
  {
    id: 'guarantee', age: [28, 60],
    if: (s) => s.money > 2000,
    weight: 0.5,
    title: '보증',
    text: '오랜 친구가 찾아왔습니다. "대출 보증 한 번만 서 줘. 진짜 금방 갚을게."',
    choices: [
      { label: '보증을 서 준다', outcomes: [
        { w: 45, result: '친구가 약속을 지켰습니다. 우정이 한 단계 깊어졌습니다.', effect: { relation: 6, happy: 3 } },
        { w: 55, result: '친구 연락이 끊겼습니다. 은행에서 연락이 왔습니다. 빚 5천만 원이 당신 이름으로 넘어왔습니다.', effect: { money: -5000, happy: -12, relation: -6, moment: { ko: '친구 보증으로 빚', img: 'staring at a bank letter at a kitchen table late at night', w: 3 } } },
      ] },
      { label: '정중히 거절한다', result: '"보증은 가족한테도 안 서." 친구는 서운해했지만, 5년 뒤 "그때 거절해 줘서 고맙다"는 문자를 보냈습니다.', effect: { relation: -2, smarts: 2 } },
    ],
  },
  {
    id: 'officeRomance', age: [24, 40],
    if: (s) => !s.partner && ['office', 'bigcorp', 'civil'].includes(s.job),
    prepare: (s) => { s.tmp.newName = anyName(); },
    title: '사내 연애',
    text: '옆 부서 {newName} 님과 엘리베이터에서 자주 마주칩니다. 오늘은 커피를 한 잔 더 사 왔다고 합니다.',
    choices: [
      { label: '비밀 연애를 시작한다', result: '3개월 동안 아무도 몰랐습니다. 회식 날, 둘이 같은 택시를 타는 걸 부장님이 봤습니다.', effect: { happy: 8, run: newPartner } },
      { label: '회사 사람은 안 된다', result: '선을 지켰습니다. 1년 뒤 그 사람이 다른 팀 사람과 결혼한다는 청첩장이 돌았습니다.', effect: { smarts: 1 } },
    ],
  },
  {
    id: 'weddingCost', age: [26, 45],
    if: (s) => s.partner && s.partner.status === 'dating' && s.age - s.partner.since >= 1,
    title: '결혼 준비',
    text: '{partner} 님과 결혼 이야기가 나왔습니다. 스드메, 예식장, 신혼집… 견적서를 보고 둘 다 말이 없어졌습니다.',
    choices: [
      { label: '스몰 웨딩을 한다', result: '가족과 친한 친구 30명만 불렀습니다. 축가는 신랑신부가 직접 불렀고, 음이탈도 추억이 됐습니다.', effect: { happy: 10, money: -800, run: marry, moment: { ko: '스몰 웨딩', img: 'a small garden wedding with thirty guests and string lights', w: 4 } } },
      { label: '남들 하는 만큼 한다', result: '하객 400명. 식이 끝나고 둘 다 탈진했지만, 사진은 정말 예뻤습니다.', effect: { happy: 7, money: -4000, relation: 4, run: marry, moment: { ko: '결혼식', img: 'a grand wedding hall with hundreds of guests and a flower arch', w: 4 } } },
      { label: '돈 모일 때까지 미룬다', result: '결혼 적금을 들었습니다. 매달 통장을 보며 둘이 같이 웃습니다.', effect: { happy: 1, money: 300 } },
    ],
  },
  {
    id: 'newlywedFight', age: [25, 50],
    if: (s) => isMarried(s) && s.age - s.partner.since <= 2,
    title: '신혼 싸움',
    text: '결혼 1년 차. 치약을 가운데부터 짜는 사람과 끝부터 짜는 사람이 한집에 살고 있습니다.',
    choices: [
      { label: '치약을 두 개 산다', result: '평화가 찾아왔습니다. 결혼 생활의 9할은 이런 해결책으로 이루어집니다.', effect: { happy: 4, relation: 4 } },
      { label: '끝까지 토론한다', result: '새벽 2시까지 싸웠고, 결론은 "배고프다"였습니다. 라면을 끓여 먹고 화해했습니다.', effect: { happy: 2, relation: 3 } },
    ],
  },
  {
    id: 'marathon', age: [25, 60],
    if: (s) => s.flags.exercise && s.health >= 55,
    title: '마라톤',
    text: '운동을 꾸준히 했더니 친구가 풀코스 마라톤에 같이 나가자고 합니다. 42.195km입니다.',
    choices: [
      { label: '도전한다', outcomes: [
        { w: (s) => s.health, result: '4시간 48분 만에 완주! 결승선에서 받은 메달을 일주일 동안 목에 걸고 다녔습니다.', effect: { happy: 10, health: 3, achieve: 'marathon', moment: { ko: '마라톤 풀코스 완주', img: 'crossing a marathon finish line with arms raised and a medal', w: 3 } } },
        { w: 40, result: '32km 지점에서 다리가 멈췄습니다. 구급차 대신 아이스크림 트럭을 타고 돌아왔습니다.', effect: { health: -4, happy: 2 } },
      ] },
      { label: '10km만 뛴다', result: '10km를 완주했습니다. 기념품 티셔츠가 마음에 들어서 다음 대회도 신청했습니다.', effect: { health: 3, happy: 4 } },
    ],
  },

  // ---------- 중년 (40~64세) ----------
  {
    id: 'kidPuberty', age: [38, 65],
    if: (s) => s.kids.some((k) => kidAge(s, k) >= 13 && kidAge(s, k) <= 16),
    prepare: (s) => pickKid(s, (k) => kidAge(s, k) >= 13 && kidAge(s, k) <= 16),
    title: '자녀의 사춘기',
    text: '{kid}의 방문이 닫혔습니다. 문에 "노크 필수"라고 적혀 있습니다. 어디서 많이 본 문구입니다.',
    choices: [
      { label: '문 앞에 간식을 두고 간다', result: '사흘째 되던 날, 접시와 함께 "고마워"라는 쪽지가 돌아왔습니다.', effect: { relation: 5, happy: 3 } },
      { label: '"너 요즘 왜 그래"', result: '문이 더 세게 닫혔습니다. 당신도 그 나이 땐 그랬다는 걸 떠올렸습니다.', effect: { relation: -3, happy: -2 } },
      { label: '같이 게임을 하자고 한다', result: '처참하게 졌습니다. {kid}가 3년 만에 깔깔 웃었습니다.', effect: { relation: 6, happy: 4 } },
    ],
  },
  {
    id: 'kidCareer', age: [42, 70],
    if: (s) => s.kids.some((k) => kidAge(s, k) >= 18 && kidAge(s, k) <= 24),
    prepare: (s) => pickKid(s, (k) => kidAge(s, k) >= 18 && kidAge(s, k) <= 24),
    title: '자녀의 진로',
    text: '{kid}가 말합니다. "나 회사 그만두고 유튜버 할래." 어디서 많이 들어 본 소리입니다.',
    choices: [
      { label: '응원한다', outcomes: [
        { w: 35, result: '1년 뒤 구독자 50만. 첫 수익으로 당신에게 안마의자를 사 줬습니다.', effect: { relation: 8, happy: 8 } },
        { w: 65, result: '1년 뒤 다시 취업했습니다. 그래도 해 봤으니 후회는 없다고 합니다. 당신도 그렇게 생각합니다.', effect: { relation: 6, happy: 2 } },
      ] },
      { label: '현실을 이야기한다', result: '{kid}가 한참 말이 없더니 "알았어"라고 했습니다. 그 "알았어"가 오래 마음에 걸렸습니다.', effect: { relation: -4 } },
    ],
  },
  {
    id: 'menopause', age: [45, 58],
    title: '갱년기',
    text: '이유 없이 덥고, 이유 없이 서럽습니다. 드라마 예고편을 보다가 울었습니다.',
    choices: [
      { label: '병원에 간다', result: '"자연스러운 변화예요." 그 말에 이상하게 안심이 됐습니다. 약을 먹고 한결 나아졌습니다.', effect: { health: 4, happy: 4, money: -50 } },
      { label: '가족에게 솔직하게 말한다', result: '가족들이 갑자기 다정해졌습니다. 설거지를 서로 하겠다고 싸웁니다.', effect: { relation: 6, happy: 3 } },
      { label: '등산으로 이겨 낸다', result: '주말마다 산에 갑니다. 정상에서 소리를 지르면 반은 해결됩니다.', effect: { health: 5, happy: 3 } },
    ],
  },
  {
    id: 'oldTeacher', age: [35, 70],
    title: '은사님',
    text: '스승의 날입니다. 고등학교 때 담임 선생님이 퇴임하신다는 소식을 들었습니다.',
    choices: [
      { label: '찾아뵙는다', result: '선생님이 당신 이름을 기억하셨습니다. "너 그때 맨날 졸았잖아." 그것까지 기억하셨습니다.', effect: { relation: 5, happy: 6 } },
      { label: '문자만 드린다', result: '"고맙다, 잘 살고 있구나." 짧은 답장을 사진으로 저장했습니다.', effect: { relation: 2, happy: 2 } },
    ],
  },
  {
    id: 'camping', age: [30, 70], weight: 0.7,
    title: '캠핑',
    text: '캠핑에 빠진 친구가 장비를 빌려주겠다고 합니다. 날씨 예보는 "가끔 비"입니다.',
    choices: [
      { label: '떠난다', outcomes: [
        { w: 60, result: '모닥불 앞에서 고기를 구웠습니다. 별이 이렇게 많은 줄 처음 알았습니다.', effect: { happy: 7, health: 2 } },
        { w: 40, result: '"가끔 비"는 밤새 폭우였습니다. 차 안에서 컵라면을 먹었는데, 그게 인생 컵라면이었습니다.', effect: { happy: 4 } },
      ] },
      { label: '거실에 텐트를 친다', result: '거실 캠핑. 화장실이 가깝고 와이파이가 빵빵합니다. 이게 진짜 글램핑입니다.', effect: { happy: 3, relation: 2 } },
    ],
  },
  {
    id: 'hairLoss', age: [35, 60],
    title: '정수리',
    text: '엘리베이터 거울에 비친 정수리가 낯섭니다. 조명 탓이라고 믿고 싶습니다.',
    choices: [
      { label: '탈모 샴푸를 산다', result: '샴푸가 세 병째입니다. 효과는 모르겠지만 냄새는 좋습니다.', effect: { happy: 1, money: -15 } },
      { label: '시원하게 민다', result: '삭발했습니다. 생각보다 두상이 예뻐서 다들 놀랐습니다. 진작 할 걸 그랬습니다.', effect: { happy: 6 } },
      { label: '모자를 산다', result: '모자 컬렉션이 열두 개가 됐습니다. 이제 패션의 일부입니다.', effect: { happy: 3, money: -30 } },
    ],
  },
  {
    id: 'sideProject', age: [30, 60],
    if: (s) => !!s.job && s.job !== 'owner',
    weight: 0.6,
    title: '부업',
    text: '월급만으로는 불안합니다. 퇴근 후에 할 수 있는 부업을 찾아봤습니다.',
    choices: [
      { label: '스마트스토어를 연다', outcomes: [
        { w: 35, result: '수제 키링이 대박 났습니다. 부업 수입이 월급을 넘보기 시작했습니다.', effect: { money: 1500, happy: 6, add: { overwork: 1 } } },
        { w: 65, result: '첫 달 주문 3건. 그중 2건은 엄마와 이모였습니다.', effect: { money: -100, happy: 1 } },
      ] },
      { label: '주말 강사를 한다', result: '회사에서 배운 걸 주말에 가르칩니다. 수강생 후기가 생각보다 따뜻합니다.', effect: { money: 600, smarts: 2, health: -2 } },
      { label: '쉬는 게 남는 거다', result: '주말엔 쉬기로 했습니다. 통장은 그대로지만 얼굴색이 좋아졌습니다.', effect: { health: 3, happy: 3 } },
    ],
  },
  {
    id: 'parentsDementia', age: [42, 68],
    if: (s) => !s.flags.orphan && !s.flags.parentsDead && !s.flags.parentDementia,
    weight: 0.5,
    title: '어머니의 기억',
    text: '어머니가 같은 질문을 다섯 번 하셨습니다. "밥은 먹었니?" 다섯 번 다 "네"라고 대답했습니다.',
    choices: [
      { label: '바로 병원에 모시고 간다', result: '초기 치매 진단을 받았습니다. 일찍 발견해서 진행을 늦출 수 있다고 합니다.', effect: { relation: 6, happy: -6, money: -500, set: { parentDementia: true } } },
      { label: '매일 전화를 드린다', result: '매일 저녁 7시, 같은 대화가 반복됩니다. 그래도 어머니 목소리를 듣는 게 하루의 마무리가 됐습니다.', effect: { relation: 5, happy: -3, set: { parentDementia: true } } },
    ],
  },
  {
    id: 'coupleTrip', age: [40, 70],
    if: (s) => isMarried(s) && s.money > 500,
    title: '결혼기념일',
    text: '결혼 기념일이 다가옵니다. 작년엔 둘 다 잊어버렸습니다.',
    choices: [
      { label: '신혼여행지에 다시 간다', result: '같은 바닷가, 같은 식당. 사장님이 바뀌었지만 노을은 그대로였습니다.', effect: { happy: 8, relation: 6, money: -400, moment: { ko: '신혼여행지 재방문', img: 'an older couple holding hands on the same beach where they honeymooned, at sunset', w: 2 } } },
      { label: '집에서 손편지를 쓴다', result: '편지지 한 장을 채우는 데 두 시간이 걸렸습니다. {partner} 님이 그 편지를 지갑에 넣고 다닙니다.', effect: { relation: 6, happy: 4 } },
    ],
  },

  // ---------- 노년 (65세 이후) ----------
  {
    id: 'babysitGrandkid', age: [55, 85], once: false, cooldown: 4, weight: 3,
    if: (s) => s.grandkids > 0 && s.health >= 40,
    title: '손주 돌보기',
    text: '자녀가 맞벌이라 손주를 봐 달라고 합니다. 평일 아침 8시부터 저녁 7시까지입니다.',
    choices: [
      { label: '흔쾌히 맡는다', result: '손주가 처음 한 말이 "할머니" 혹은 "할아버지"였습니다. 그 한마디에 허리 통증이 다 나았습니다.', effect: { relation: 8, happy: 6, health: -3 } },
      { label: '주 2일만 한다', result: '"할 만큼만 하자." 서로 서운하지 않은 선을 찾았습니다.', effect: { relation: 3, happy: 3 } },
      { label: '정중히 거절한다', result: '"우리도 우리 인생이 있다." 대신 주말마다 손주와 동물원에 갑니다.', effect: { happy: 4, relation: -1 } },
    ],
  },
  {
    id: 'lateDivorce', age: [62, 85],
    if: (s) => isMarried(s) && s.relation < 62,
    title: '황혼의 결심',
    text: '40년을 함께 산 {partner} 님이 식탁에서 말합니다. "남은 시간은 나답게 살고 싶어."',
    choices: [
      { label: '보내 준다', result: '서로에게 고마웠다고 말하고 헤어졌습니다. 가끔 손주 생일에 만나 밥을 먹습니다.', effect: { happy: -4, relation: -3, run: (s) => { s.money = Math.round(s.money / 2); s.home = Math.round(s.home / 2); s.partner = null; s.flags.divorced = true; } } },
      { label: '다시 데이트를 신청한다', result: '40년 만에 극장에 갔습니다. 영화는 졸렸지만, 팝콘을 나눠 먹는 손이 따뜻했습니다.', effect: { relation: 8, happy: 6 } },
    ],
  },
  {
    id: 'seniorYoutube', age: [65, 90],
    if: (s) => s.job !== 'creator',
    weight: 0.6,
    title: '실버 유튜버',
    text: '손주가 휴대폰으로 유튜브 찍는 법을 알려 줬습니다. "할머니 할아버지 요리하는 거 찍어 봐요."',
    choices: [
      { label: '채널을 연다', outcomes: [
        { w: 20, result: '"80세의 김치찌개" 영상이 조회수 200만을 찍었습니다. 댓글에 "우리 할머니 생각나요"가 가득합니다.', effect: { happy: 12, relation: 8, money: 1000, moment: { ko: '실버 유튜버로 화제', img: 'an elder cooking kimchi stew in front of a smartphone on a tripod, laughing', w: 4 } } },
        { w: 80, result: '구독자 82명. 대부분 경로당 친구들입니다. 그래도 매주 업로드합니다.', effect: { happy: 5, relation: 3 } },
      ] },
      { label: '찍는 건 손주한테 맡긴다', result: '손주 채널에 "우리 할머니/할아버지" 시리즈로 출연합니다. 출연료는 귤 한 봉지입니다.', effect: { relation: 5, happy: 4 } },
    ],
  },
  {
    id: 'seniorCollege', age: [65, 90],
    title: '노인대학',
    text: '동네 복지관 노인대학 입학식입니다. 과목은 영어, 서예, 스마트폰, 그리고 댄스입니다.',
    choices: [
      { label: '영어반', result: '"How are you?"에 "I am fine, thank you, and you?"까지 완벽하게 대답합니다. 미국 여행이 목표입니다.', effect: { smarts: 5, happy: 4 } },
      { label: '댄스반', result: '트로트 라인댄스 반장이 됐습니다. 지역 축제 무대에도 섰습니다.', effect: { health: 5, happy: 6, relation: 4 } },
      { label: '서예반', result: '"人生" 두 글자를 백 번 썼습니다. 백 번째 글씨를 표구해서 거실에 걸었습니다.', effect: { smarts: 3, happy: 4 } },
    ],
  },
  {
    id: 'senoirCenterPolitics', age: [68, 95],
    title: '경로당 회장 선거',
    text: '경로당 회장 선거가 열립니다. 공약은 "안마의자 한 대 추가"와 "화투 판돈 상한제"로 갈렸습니다.',
    choices: [
      { label: '안마의자 공약으로 출마한다', outcomes: [
        { w: (s) => s.relation, result: '당선! 취임 첫날 안마의자 앞에 대기 줄이 생겼습니다. 정치란 이런 겁니다.', effect: { relation: 8, happy: 6 } },
        { w: 50, result: '3표 차로 졌습니다. 상대 후보가 떡을 돌렸다는 소문이 있습니다.', effect: { happy: -2, relation: 2 } },
      ] },
      { label: '중립을 지킨다', result: '양쪽에서 귤을 받았습니다. 중립의 맛은 달았습니다.', effect: { happy: 3 } },
    ],
  },
  {
    id: 'organDonation', age: [55, 90],
    title: '장기기증 서약',
    text: '병원 대기실에서 장기기증 서약 안내문을 봤습니다. "한 사람이 아홉 명을 살릴 수 있습니다."',
    choices: [
      { label: '서약한다', result: '신분증에 작은 스티커가 붙었습니다. 왠지 마음이 단정해졌습니다.', effect: { happy: 5, relation: 3, achieve: 'organDonor' } },
      { label: '가족과 먼저 이야기한다', result: '저녁 식탁에서 이야기를 꺼냈습니다. 생각보다 진지하고 따뜻한 대화가 오갔습니다.', effect: { relation: 5 } },
    ],
  },
  {
    id: 'hometownVisit', age: [60, 90],
    title: '고향',
    text: '50년 만에 태어난 동네에 가 봤습니다. 다니던 학교 자리에 아파트가 섰습니다.',
    choices: [
      { label: '옛 골목을 걷는다', result: '문방구 자리에 편의점이 있습니다. 그래도 골목 끝 슈퍼 할머니의 딸이 가게를 하고 있었습니다.', effect: { happy: 5, relation: 2 } },
      { label: '옛 친구를 수소문한다', result: '동네 노인정에서 초등학교 짝꿍을 만났습니다. 서로 알아보는 데 10분, 웃는 데 1초 걸렸습니다.', effect: { relation: 7, happy: 6 } },
    ],
  },
  {
    id: 'oldFlame', age: [65, 90],
    if: (s) => !s.partner,
    prepare: (s) => { s.tmp.newName = anyName(); },
    title: '그 시절 그 사람',
    text: '동창회 단톡방에 낯익은 이름이 들어왔습니다. 스무 살 때 좋아했던 {newName} 님입니다.',
    choices: [
      { label: '차 한잔하자고 연락한다', outcomes: [
        { w: 45, result: '찻집에서 네 시간을 이야기했습니다. 다음 주에도 만나기로 했습니다.', effect: { happy: 10, relation: 5, run: newPartner } },
        { w: 55, result: '반갑게 이야기를 나눴습니다. 추억은 추억으로 두기로 했지만, 오래 웃었습니다.', effect: { happy: 5, relation: 3 } },
      ] },
      { label: '인사만 남긴다', result: '"잘 지내지?" 짧은 인사와 함께 하트가 하나 돌아왔습니다. 그걸로 충분했습니다.', effect: { happy: 3 } },
    ],
  },
  {
    id: 'emptyHoliday', age: [65, 95],
    if: (s) => s.kids.length > 0,
    title: '명절',
    text: '이번 명절에 자녀들이 바빠서 못 온다고 합니다. 전은 이미 부쳐 놨습니다.',
    choices: [
      { label: '택배로 보낸다', result: '전 세 상자를 보냈습니다. "엄마/아빠 전이 최고"라는 문자가 세 통 왔습니다.', effect: { relation: 4, happy: 2, money: -10 } },
      { label: '경로당 친구들과 나눠 먹는다', result: '경로당 명절 잔치가 됐습니다. 이게 진짜 명절 같았습니다.', effect: { relation: 5, happy: 5 } },
      { label: '서운하다고 말한다', result: '다음 명절에 온 가족이 다 모였습니다. 말을 해야 아는 법입니다.', effect: { relation: 3, happy: 3 } },
    ],
  },
  {
    id: 'cruise', age: [60, 85],
    if: (s) => s.money > 3000,
    title: '크루즈 여행',
    text: '평생 모은 돈으로 크루즈 여행을 갈 수 있을 것 같습니다. 2주 동안 바다 위입니다.',
    choices: [
      { label: '떠난다', result: '선상 디너쇼에서 외국인과 춤을 췄습니다. 말은 안 통했지만 스텝은 통했습니다.', effect: { happy: 10, money: -1500, moment: { ko: '크루즈 여행', img: 'an elder dancing on the deck of a cruise ship at sunset', w: 3 } } },
      { label: '자녀에게 물려준다', result: '"그 돈으로 너희 집 대출 갚아." 자녀가 한참 말을 잇지 못했습니다.', effect: { relation: 8, money: -1500 } },
    ],
  },
  {
    id: 'decluttering', age: [70, 100],
    title: '정리',
    text: '집에 물건이 너무 많습니다. 50년 동안 "언젠가 쓰겠지" 하고 모은 것들입니다.',
    choices: [
      { label: '하나씩 정리한다', result: '버리다가 옛날 연애편지를 발견했습니다. 정리는 사흘째 그 편지 앞에서 멈춰 있습니다.', effect: { happy: 5, smarts: 2 } },
      { label: '손주들에게 나눠 준다', result: '손주가 당신의 30년 된 카메라를 "레트로 감성"이라며 좋아했습니다.', effect: { relation: 6, happy: 4 } },
    ],
  },

  // ---------- 운 (선택 없이 일어나는 일) ----------
  {
    id: 'celebSighting', auto: true, age: [10, 80], weight: 0.4,
    title: '길에서 만난 연예인',
    text: '편의점에서 유명 배우와 같은 컵라면을 골랐습니다. 눈이 마주쳤고, 둘 다 어색하게 웃었습니다.',
    effect: { happy: 3 },
  },
  {
    id: 'typhoon', auto: true, age: [10, 95], weight: 0.4,
    title: '태풍',
    text: '태풍이 지나갔습니다.',
    outcomes: [
      { w: 70, result: '베란다 화분 두 개가 날아간 것 외엔 무사했습니다.', effect: { happy: -1 } },
      { w: 30, result: '창문이 깨지고 집에 물이 들어왔습니다. 수리비가 꽤 나왔습니다.', effect: { money: -500, happy: -4 } },
    ],
  },
  {
    id: 'surpriseParty', auto: true, age: [15, 90], weight: 0.4,
    title: '깜짝 파티',
    text: '생일날 집에 들어서자 불이 켜지며 "서프라이즈!" 소리가 났습니다. 놀라서 가방을 던졌는데 케이크에 맞았습니다.',
    effect: { happy: 6, relation: 4 },
  },
  {
    id: 'secondhandLuck', auto: true, age: [20, 80], weight: 0.3,
    title: '중고 득템',
    text: '중고거래 앱에서 5만 원에 산 그림이 알고 보니 유명 화가의 초기작이었습니다.',
    effect: { money: 800, happy: 5 },
  },
  {
    id: 'blackout', auto: true, age: [8, 95], weight: 0.4,
    title: '정전',
    text: '동네 전체가 정전됐습니다. 와이파이가 끊기자 가족들이 거실에 모여 촛불 아래서 수다를 떨었습니다. 전기가 들어오자 다들 조금 아쉬워했습니다.',
    effect: { relation: 3, happy: 2 },
  },
  {
    id: 'kindNeighbor', auto: true, age: [20, 95], weight: 0.4,
    title: '이웃',
    text: '옆집 할머니가 김장 김치를 한 통 주셨습니다. 그 김치로 한 달을 버텼습니다.',
    effect: { happy: 3, relation: 3 },
  },
);
