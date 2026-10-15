// Firebase 설정 (Google 로그인과 도감 동기화)
//
// null로 두면 로그인 기능이 꺼지고, 도감은 지금처럼 이 브라우저에만 저장됩니다.
// 설정 방법은 docs/login-setup.md 를 보세요.
// 아래 값들은 비밀번호가 아니라 "어느 Firebase 프로젝트인지" 알려 주는 공개 식별 정보라서
// GitHub에 올려도 괜찮습니다. 데이터 보호는 Firestore 보안 규칙(firestore.rules)이 맡습니다.

const FIREBASE_CONFIG = null;

/* Firebase 콘솔에서 복사한 값을 이런 모양으로 넣으면 됩니다.
const FIREBASE_CONFIG = {
  apiKey: 'AIza...',
  authDomain: 'life-sim-game.firebaseapp.com',
  projectId: 'life-sim-game',
  storageBucket: 'life-sim-game.appspot.com',
  messagingSenderId: '1234567890',
  appId: '1:1234567890:web:abcdef',
};
*/
