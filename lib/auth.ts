/**
 * 점주 로그인 (웹).
 *
 * RN 앱은 구글/애플 네이티브 SDK로 토큰을 받아 Firebase 자격증명으로 교환하지만,
 * 웹은 Firebase가 OAuth 흐름 전체를 대신 처리해준다. 그래서 코드가 훨씬 짧다.
 * 결과로 얻는 uid는 앱과 **같은 Firebase uid**라 두 플랫폼이 같은 계정을 본다.
 *
 * 팝업 vs 리다이렉트: 팝업을 기본으로 쓰되, 브라우저가 팝업을 막으면
 * 리다이렉트로 자동 폴백한다. (사파리·인앱 브라우저에서 흔하다)
 */

import {
  GoogleAuthProvider,
  OAuthProvider,
  getRedirectResult,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  type User,
  type UserCredential,
} from "firebase/auth";
import { getFirebaseAuth } from "./firebase";

export type OwnerProvider = "google" | "apple";

/** 소셜 계정의 제공자 id (구글 sub / 애플 sub). 레거시 계정 이전에 쓴다. */
export function providerIdOf(user: User, provider: OwnerProvider): string | null {
  const providerId = provider === "google" ? "google.com" : "apple.com";
  return (
    user.providerData.find((p) => p.providerId === providerId)?.uid ?? null
  );
}

/** 팝업이 막혔을 때 나는 에러인지 */
function isPopupBlocked(error: unknown): boolean {
  const code =
    typeof error === "object" && error !== null && "code" in error
      ? String((error as { code: string }).code)
      : "";
  return (
    code === "auth/popup-blocked" ||
    code === "auth/operation-not-supported-in-this-environment"
  );
}

/** 사용자가 팝업을 그냥 닫은 경우 (에러가 아니라 취소로 다뤄야 한다) */
export function isSignInCancelled(error: unknown): boolean {
  const code =
    typeof error === "object" && error !== null && "code" in error
      ? String((error as { code: string }).code)
      : "";
  return (
    code === "auth/popup-closed-by-user" ||
    code === "auth/cancelled-popup-request" ||
    code === "auth/user-cancelled"
  );
}

function buildProvider(provider: OwnerProvider) {
  if (provider === "google") {
    const google = new GoogleAuthProvider();
    // 계정이 여러 개인 점주가 매번 고를 수 있게 한다.
    google.setCustomParameters({ prompt: "select_account" });
    return google;
  }
  const apple = new OAuthProvider("apple.com");
  apple.addScope("email");
  apple.addScope("name");
  return apple;
}

/**
 * 소셜 로그인 실행.
 *
 * @returns 성공 시 자격증명. 리다이렉트로 폴백한 경우 페이지를 떠나므로 null.
 */
export async function signIn(
  provider: OwnerProvider,
): Promise<UserCredential | null> {
  const auth = getFirebaseAuth();
  const authProvider = buildProvider(provider);

  try {
    return await signInWithPopup(auth, authProvider);
  } catch (error) {
    if (isPopupBlocked(error)) {
      await signInWithRedirect(auth, authProvider);
      return null; // 이 줄 이후로는 실행되지 않는다
    }
    throw error;
  }
}

/**
 * 리다이렉트 로그인으로 돌아왔을 때의 결과를 회수한다.
 * 로그인 페이지 진입 시 1회 호출. 리다이렉트가 아니었으면 null.
 */
export async function consumeRedirectResult(): Promise<UserCredential | null> {
  try {
    return await getRedirectResult(getFirebaseAuth());
  } catch (error) {
    console.error("[auth] 리다이렉트 결과 회수 실패:", error);
    return null;
  }
}

export async function signOutOwner(): Promise<void> {
  await signOut(getFirebaseAuth());
}

/** Firebase가 저장된 세션 복원을 마칠 때까지 기다린다. */
export function waitForAuthReady(): Promise<User | null> {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(getFirebaseAuth(), (user) => {
      unsubscribe();
      resolve(user);
    });
  });
}

export { onAuthStateChanged, type User };
