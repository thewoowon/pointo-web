/**
 * 고객 화면용 익명 Firebase 세션.
 *
 * 왜 필요한가: 보안 규칙이 모든 컬렉션에 `isSignedIn()`을 요구한다. 로그인 없이는
 * 매장 이름 한 줄도 못 읽는다. 키오스크(RN 앱)가 익명 세션으로 도는 것과 같은
 * 방식으로, 고객 웹도 익명 세션을 하나 받아서 조회한다.
 *
 * 익명 세션이 읽을 수 있는 범위는 규칙이 정한다(firestore.rules):
 *   - `stores/{code}`  단건 조회 O / 목록 X
 *   - `users/{docId}`  단건 조회 O / 목록 X   ← 코드를 알아야만 읽힌다
 *   - `logs`           전부 X (점주 전용)
 * 즉 이 페이지는 "번호를 정확히 아는 한 건"만 볼 수 있고, 매장 고객을 훑는 것은
 * 불가능하다.
 *
 * ⚠️ 익명 세션은 누구나 발급받을 수 있는 신원이다. 번호를 이미 아는 사람이 그
 *    번호의 잔액을 들여다보는 것까지는 막지 못한다(매장 태블릿과 같은 수준).
 *    적립·사용 같은 **쓰기**를 웹에 열려면 그 전에 본인 인증(SMS)이 필요하다.
 *    SECURITY_PASS.md의 App Check 단계와 함께 다룬다.
 */

import { onAuthStateChanged, signInAnonymously } from "firebase/auth";
import { getFirebaseAuth } from "./firebase";

/** 진행 중인 로그인을 공유한다. 입력할 때마다 세션을 새로 만들지 않는다. */
let pending: Promise<void> | null = null;

/**
 * 익명 세션이 준비될 때까지 기다린다.
 *
 * 이미 세션이 있으면(점주가 같은 브라우저에서 로그인해 둔 경우 포함) 그대로 쓴다.
 * 점주 세션으로 읽어도 결과는 같다 — 이 페이지가 쓰는 규칙은 `isSignedIn()`뿐이다.
 */
export function ensureCustomerSession(): Promise<void> {
  const auth = getFirebaseAuth();
  if (auth.currentUser) return Promise.resolve();
  if (pending) return pending;

  pending = new Promise<void>((resolve, reject) => {
    // 새로고침 직후엔 currentUser가 아직 null이다. 복원을 한 틱 기다려 보고,
    // 그래도 없으면 새로 발급받는다. 이걸 안 하면 방문할 때마다 익명 계정이
    // 하나씩 쌓인다.
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        unsubscribe();
        if (user) {
          resolve();
          return;
        }
        signInAnonymously(auth)
          .then(() => resolve())
          .catch(reject);
      },
      reject,
    );
  }).finally(() => {
    pending = null;
  });

  return pending;
}
