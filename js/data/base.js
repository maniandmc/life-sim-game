// 게임의 기본 데이터: 능력치, 출생 환경, 타고난 특성, 직업, 사업, 업적
// 돈 단위는 모두 "만 원"입니다. (3000 = 3천만 원, 10000 = 1억 원)

const STAT_INFO = {
  health:   { label: '건강', color: 'var(--c-health)' },
  happy:    { label: '행복', color: 'var(--c-happy)' },
  smarts:   { label: '지능', color: 'var(--c-smarts)' },
  relation: { label: '관계', color: 'var(--c-relation)' },
};
const STATS = Object.keys(STAT_INFO);

// 이벤트 파일들이 여기에 사건을 추가합니다.
const EVENTS = [];

// ---------- 출생 환경 ----------
// family: 집안 형편 0~5 (용돈·유산·성인식 지원금에 영향)
// mult: 점수 보정. 불리하게 태어날수록 같은 결과도 더 높게 평가합니다.
const BIRTHS = [
  {
    id: 'chaebol', name: '재벌가', weight: 2, family: 5, mult: 0.8,
    stats: { health: 70, happy: 55, smarts: 60, relation: 45 },
    text: '할아버지 회사가 코스피 시가총액 7위입니다. 당신의 첫 울음소리는 비서실장이 녹음해서 보관 중입니다.',
    img: 'born in a marble-floored chaebol mansion while suited secretaries peek at the cradle',
  },
  {
    id: 'pro', name: '의사·변호사 집안', weight: 6, family: 4, mult: 0.9, flags: { proParents: true },
    stats: { health: 65, happy: 55, smarts: 65, relation: 50 },
    text: '아빠는 의사, 엄마는 변호사입니다. 거실 책장에 동화책보다 판례집이 많습니다.',
    img: 'born into a tidy upper-middle-class apartment lined with medical and law books',
  },
  {
    id: 'middle', name: '평범한 맞벌이 가정', weight: 30, family: 2, mult: 1.0,
    stats: { health: 65, happy: 60, smarts: 50, relation: 60 },
    text: '아파트 대출이 23년 남은 대한민국 표준 가정입니다. 엄마 아빠는 퇴근하고 교대로 당신을 재웁니다.',
    img: 'born into an ordinary Korean apartment with tired but loving working parents',
  },
  {
    id: 'chicken', name: '치킨집 사장님 댁', weight: 10, family: 2, mult: 1.0, flags: { familyShop: true },
    stats: { health: 65, happy: 60, smarts: 45, relation: 65 },
    text: '부모님이 동네에서 치킨집을 하십니다. 집에서는 늘 기름 냄새가 나고, 첫 장난감은 치킨무 통이었습니다.',
    img: 'born above a small neighborhood fried-chicken shop with a glowing sign',
  },
  {
    id: 'farm', name: '시골 농가', weight: 8, family: 1, mult: 1.1, flags: { rural: true },
    stats: { health: 75, happy: 65, smarts: 45, relation: 60 },
    text: '반경 2km 안에 사람보다 소가 많은 마을입니다. 공기는 1등급, 와이파이는 0칸입니다.',
    img: 'born in a farmhouse in the Korean countryside surrounded by rice paddies and cows',
  },
  {
    id: 'single', name: '한부모 가정', weight: 8, family: 1, mult: 1.1, flags: { singleParent: true },
    stats: { health: 65, happy: 50, smarts: 50, relation: 55 },
    text: '엄마 혼자 당신을 키웁니다. 엄마는 슈퍼우먼이지만, 슈퍼우먼도 월세는 냅니다.',
    img: 'born to a hardworking single mother in a small rented room',
  },
  {
    id: 'grandma', name: '할머니 손에서', weight: 5, family: 1, mult: 1.1, flags: { grandma: true },
    stats: { health: 65, happy: 60, smarts: 45, relation: 65 },
    text: '부모님은 지방에서 일하시고, 당신은 할머니와 삽니다. 하루 섭취 칼로리의 절반이 "더 먹어라"에서 나옵니다.',
    img: 'raised by a warm grandmother in an old house with a low table full of side dishes',
  },
  {
    id: 'multi', name: '다문화 가정', weight: 5, family: 2, mult: 1.05, flags: { multicultural: true },
    stats: { health: 65, happy: 55, smarts: 55, relation: 55 },
    text: '아빠는 한국인, 엄마는 베트남 출신입니다. 당신은 두 나라 말로 떼를 쓸 수 있는 몸이 되었습니다.',
    img: 'born into a cheerful Korean-Vietnamese family with two cultures at the dinner table',
  },
  {
    id: 'orphan', name: '보육원', weight: 3, family: 0, mult: 1.3, flags: { orphan: true },
    stats: { health: 60, happy: 45, smarts: 50, relation: 50 },
    text: '부모님 얼굴은 모릅니다. 대신 형, 누나, 동생이 열두 명 있습니다. 반찬 경쟁이 치열합니다.',
    img: 'growing up in a modest orphanage where many children share one long table',
  },
  {
    id: 'celeb', name: '연예인 부모', weight: 3, family: 4, mult: 0.9, flags: { celebParents: true },
    stats: { health: 65, happy: 55, smarts: 50, relation: 50 },
    text: '엄마는 90년대 하이틴 스타입니다. 당신의 신생아 사진이 포털 메인에 걸렸고, 댓글이 3천 개 달렸습니다.',
    img: 'born to a famous celebrity mother amid flashing paparazzi cameras',
  },
  {
    id: 'debt', name: '빚더미 가정', weight: 6, family: 0, mult: 1.2, flags: { familyDebt: true },
    stats: { health: 60, happy: 45, smarts: 50, relation: 55 },
    text: '아빠 사업이 당신이 태어나기 한 달 전에 망했습니다. 집에 찾아오는 손님의 절반은 빚쟁이입니다.',
    img: 'born into a cramped home with red debt notices taped to the door',
  },
  {
    id: 'military', name: '군인 가정', weight: 6, family: 2, mult: 1.0, flags: { militaryFamily: true },
    stats: { health: 70, happy: 55, smarts: 50, relation: 50 },
    text: '아빠는 직업군인입니다. 2년마다 이사를 가고, 집안 기상 시간은 06시 정각입니다.',
    img: 'born into a military family living in army housing with neatly folded blankets',
  },
];
const BIRTH_BY_ID = Object.fromEntries(BIRTHS.map((b) => [b.id, b]));

// 성인(20세)이 될 때 집에서 받는 지원금, 부모님이 남기는 유산 (집안 형편 0~5)
const START_MONEY = [0, 200, 800, 2500, 8000, 200000];
const INHERITANCE = [0, 1500, 6000, 20000, 60000, 1000000];

// ---------- 타고난 특성 (태어날 때 1~2개) ----------
const TRAITS = [
  { id: 'athletic',   name: '운동신경',   desc: '넘어져도 착지 자세가 좋습니다.',              effect: { health: 10 } },
  { id: 'musical',    name: '절대음감',   desc: '전자레인지 알림음이 "솔"이라는 걸 압니다.',    effect: { happy: 3 } },
  { id: 'genius',     name: '천재',       desc: '세 살에 엘리베이터 버튼 규칙을 파악했습니다.', effect: { smarts: 20 } },
  { id: 'frail',      name: '허약 체질',  desc: '감기가 당신을 단골손님으로 생각합니다.',       effect: { health: -15 } },
  { id: 'attractive', name: '빼어난 외모', desc: '신생아실 간호사들이 당신만 두 번 봅니다.',     effect: { relation: 10 } },
  { id: 'shy',        name: '소심함',     desc: '마음속으로는 이미 대답을 열 번 했습니다.',     effect: { relation: -10, smarts: 5 } },
  { id: 'leader',     name: '리더십',     desc: '어린이집에서 벌써 줄 서기를 지휘합니다.',      effect: { relation: 5 } },
  { id: 'optimist',   name: '낙천적',     desc: '비가 오면 "식물들이 좋아하겠다"고 생각합니다.', effect: { happy: 10 } },
  { id: 'merchant',   name: '장사꾼 기질', desc: '돌잔치 축의금 정산을 직접 하려고 했습니다.',   effect: { smarts: 3 } },
  { id: 'reckless',   name: '겁 없음',    desc: '미끄럼틀을 거꾸로 올라갑니다. 머리부터.',      effect: { happy: 5, health: -3 } },
];
const TRAIT_BY_ID = Object.fromEntries(TRAITS.map((t) => [t.id, t]));

// ---------- 직업 ----------
// salary: 연봉(만 원), happy/health: 매년 능력치 변화, overwork: 과로 누적, risk: 사고 위험
const JOBS = {
  parttime:  { name: '아르바이트생',     salary: 1500,  happy: -1,   health: 0,    img: 'working a part-time shift behind a convenience store counter' },
  office:    { name: '중소기업 직장인',   salary: 3200,  happy: -1,   health: -0.5, img: 'commuting on a packed subway in an office outfit' },
  bigcorp:   { name: '대기업 직장인',     salary: 5500,  happy: -2,   health: -1,   overwork: true, img: 'working late in a glass office tower with a company ID badge' },
  civil:     { name: '공무원',           salary: 3600,  happy: 0,    health: 0,    pension: 2400, img: 'stamping documents at a tidy district office desk' },
  resident:  { name: '전공의',           salary: 4500,  happy: -3,   health: -2,   overwork: true, img: 'running down a hospital corridor in scrubs at night' },
  doctor:    { name: '의사',             salary: 13000, happy: -0.5, health: -0.5, pension: 1500, img: 'wearing a white coat and stethoscope in a busy hospital' },
  owner:     { name: '사장님',           salary: 0,     happy: 0,    health: -0.5, img: 'running a small business late into the night' },
  trainee:   { name: '연습생',           salary: 0,     happy: -2,   health: -0.5, img: 'practicing dance moves alone in a mirrored studio' },
  idol:      { name: '아이돌',           salary: 9000,  happy: 1,    health: -1,   overwork: true, img: 'performing on a K-pop stage under colorful spotlights' },
  actor:     { name: '배우',             salary: 6000,  happy: 1,    health: 0,    img: 'acting on a film set in front of cameras' },
  creator:   { name: '유튜버',           salary: 2500,  happy: 1,    health: -0.5, img: 'talking to a camera in a small room full of ring lights' },
  athlete:   { name: '프로 선수',         salary: 9000,  happy: 1,    health: 1,    img: 'competing in a packed stadium' },
  coach:     { name: '코치',             salary: 4000,  happy: 1,    health: 0.5,  img: 'coaching young athletes on a sunny field' },
  rider:     { name: '배달 라이더',       salary: 3300,  happy: -1,   health: -1,   risk: 'rider', img: 'riding a delivery scooter through rainy city streets' },
  factory:   { name: '공장 현장직',       salary: 3800,  happy: -1,   health: -1,   risk: 'factory', img: 'working on a factory line in a hard hat' },
  farmer:    { name: '농부',             salary: 2200,  happy: 1,    health: 0.5,  img: 'tending a vegetable field in a straw hat' },
  freelancer:{ name: '프리랜서',         salary: 2800,  happy: 1,    health: 0,    img: 'working on a laptop in a cozy cafe' },
  security:  { name: '아파트 경비원',     salary: 2100,  happy: 0,    health: 0,    img: 'greeting residents from a small apartment guard booth' },
  scammer:   { name: '"사업가"',         salary: 9000,  happy: -1,   health: 0,    crime: true, img: 'making shady phone calls in a dim rented office' },
  heir:      { name: '재벌 3세 (경영 수업 중)', salary: 30000, happy: -1, health: 0, img: 'sitting in a top-floor executive office overlooking Seoul' },
  chairman:  { name: '그룹 회장님',       salary: 200000, happy: -1,  health: -1,   overwork: true, img: 'presiding over a long boardroom table' },
  soldier:   { name: '군 복무 중',        salary: 1000,  happy: -2,   health: 1,    img: 'standing guard in a military uniform at dawn' },
  inmate:    { name: '수감 중',           salary: 0,     happy: -4,   health: -1,   img: 'looking out from behind prison bars' },
  progamer:  { name: '프로게이머',       salary: 6000,  happy: 1,    health: -1,   img: 'gaming on a glowing esports stage in front of a roaring crowd' },
  webtoonist:{ name: '웹툰 작가',        salary: 3500,  happy: 0.5,  health: -1,   overwork: true, img: 'drawing comics on a tablet at 3 a.m. surrounded by energy drinks' },
  gradstudent:{ name: '대학원생',        salary: 1500,  happy: -2,   health: -1,   overwork: true, img: 'sleeping on a lab desk next to a pile of research papers' },
  professor: { name: '교수',             salary: 8000,  happy: 0.5,  health: 0,    pension: 2400, img: 'lecturing in front of a chalkboard full of equations' },
  expat:     { name: '해외 직장인',       salary: 6000,  happy: 0,    health: 0,    img: 'commuting through a foreign city with a takeaway coffee' },
  retired:   { name: '은퇴',             salary: 0,     happy: 1,    health: 0,    img: 'enjoying a slow morning walk in a neighborhood park' },
};

// ---------- 사업 종류 ----------
// cost: 창업 비용, base: 연간 기대 수익, vol: 수익 변동성(클수록 대박·쪽박 가능성)
const BUSINESSES = {
  cafe:    { name: '카페',          cost: 8000, base: 2500, vol: 0.8, img: 'running a cozy cafe with a hand-written menu board' },
  chicken: { name: '치킨집',        cost: 6000, base: 3000, vol: 0.6, img: 'frying chicken in a tiny neighborhood shop' },
  app:     { name: '앱 스타트업',    cost: 5000, base: 5000, vol: 1.6, img: 'hustling at a startup office full of laptops and sticky notes' },
  shop:    { name: '온라인 쇼핑몰',  cost: 3000, base: 3000, vol: 1.0, img: 'packing boxes for an online shop in a cramped warehouse' },
};

// ---------- 질병 (조용히 진행되다가 검진이나 증상으로 발견) ----------
const ILLNESSES = {
  lungCancer:    { name: '폐암' },
  liverCancer:   { name: '간암' },
  stomachCancer: { name: '위암' },
  colonCancer:   { name: '대장암' },
};

// ---------- 업적 (점수 보너스) ----------
const ACHIEVEMENTS = {
  president:   { name: '반장 당선',       points: 5 },
  gifted:      { name: '영재원 합격',     points: 5 },
  firstLove:   { name: '첫사랑 성공',     points: 5 },
  topScore:    { name: '수능 대박',       points: 15 },
  bigcorp:     { name: '대기업 입사',     points: 15 },
  civil:       { name: '공무원 합격',     points: 20 },
  doctor:      { name: '의사 면허',       points: 30 },
  debut:       { name: '데뷔',           points: 30 },
  chart1:      { name: '음원 차트 1위',   points: 30 },
  pro:         { name: '프로 입단',       points: 30 },
  creator:     { name: '구독자 100만',    points: 30 },
  married:     { name: '결혼',           points: 25 },
  parent:      { name: '부모 되기',       points: 25 },
  grandparent: { name: '손주 보기',       points: 20 },
  home:        { name: '내 집 마련',      points: 25 },
  rich:        { name: '순자산 10억',     points: 30 },
  exit:        { name: '회사 매각 대박',   points: 50 },
  comeback:    { name: '파산 후 재기',    points: 40 },
  chairman:    { name: '그룹 회장 취임',   points: 40 },
  quitSmoke:   { name: '금연 성공',       points: 15 },
  survivor:    { name: '투병 승리',       points: 30 },
  everest:     { name: '에베레스트 등정',  points: 30 },
  reunion:     { name: '친부모 상봉',     points: 25 },
  whistle:     { name: '보이스피싱 신고',  points: 10 },
  volunteer:   { name: '꾸준한 봉사',     points: 20 },
  villageChief:{ name: '마을 이장',       points: 15 },
  lottery:     { name: '로또 1등',        points: 10 },
  donor:       { name: '전 재산 기부',    points: 40 },
  centenarian: { name: '100세 달성',      points: 50 },
  progamer:    { name: '프로게이머 데뷔',  points: 25 },
  webtoon:     { name: '웹툰 연재',       points: 20 },
  professor:   { name: '교수 임용',       points: 30 },
  emigrate:    { name: '해외 정착',       points: 15 },
  marathon:    { name: '마라톤 풀코스 완주', points: 15 },
  organDonor:  { name: '장기기증 서약',    points: 10 },
};

// ---------- 이름 ----------
const SURNAMES = ['김', '이', '박', '최', '정', '강', '조', '윤', '장', '임', '한', '오', '서', '신', '권', '황', '안', '송', '류', '홍'];
const GIVEN_NAMES = {
  M: ['민준', '서준', '도윤', '예준', '시우', '하준', '주원', '지호', '지훈', '준서', '건우', '현우', '우진', '선우', '유준', '정우', '승현', '준혁', '은우', '태윤', '동현', '재원', '성민', '민재'],
  F: ['서연', '서윤', '지우', '서현', '민서', '하은', '하윤', '윤서', '지유', '지민', '채원', '수아', '지아', '은서', '다은', '예은', '수빈', '소율', '예린', '시은', '유나', '나연', '혜원', '가은'],
};
