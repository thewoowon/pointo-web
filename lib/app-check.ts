/**
 * App Check (웹) — reCAPTCHA v3.
 *
 * 규칙이 "누가 요청했는가"는 검증하지만 "어디서 왔는가"는 모른다. 웹은 코드가
 * 그대로 공개돼 익명 세션을 받는 게 앱보다 훨씬 쉬우므로, App Check로 "이 요청이
 * 실제로 우리 사이트에서 왔는가"를 증명한다.
 *
 * ── 앱과 다른 점 ────────────────────────────────────────────────────────
 * RN 앱은 App Attest / Play Integrity를 쓴다(`src/services/appCheck.ts`).
 * 웹은 제공자도 사이트 키도 완전히 별개다. Console에서 **웹 앱을 따로 등록**하고
 * reCAPTCHA v3 사이트 키를 발급받아야 한다.
 *
 * ── 왜 여기서 조용히 넘어가나 ───────────────────────────────────────────
 * 사이트 키가 없으면 초기화를 건너뛴다. Firestore의 App Check 적용(enforce)이
 * 꺼져 있는 동안에는 토큰이 없어도 요청이 통과하므로, 키 발급 전에도 로컬 개발과
 * 배포가 막히지 않는다. **enforce를 켜기 전에 반드시 키를 채울 것** — 안 채우면
 * 그 순간 웹 전체가 차단된다. (KBffee/SECURITY_PASS.md 웹 배포 순서)
 */

import type { FirebaseApp } from "firebase/app";

/** reCAPTCHA v3 사이트 키. Console → App Check → 앱 등록에서 발급된다. */
const SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

/**
 * 로컬 개발용 디버그 토큰.
 *
 * reCAPTCHA는 localhost에서 정상 토큰을 못 만든다. 이 값을 넣고 실행하면 콘솔에
 * 디버그 토큰이 찍히고, 그걸 Console → App Check → 앱 → 디버그 토큰 관리에
 * 등록하면 로컬에서도 통과한다. `true`를 주면 매 실행 새 토큰이 발급된다.
 *
 * ⚠️ 운영 빌드에는 절대 들어가면 안 된다. 디버그 토큰은 App Check를 통째로
 *    우회하므로, 유출되면 검증이 무의미해진다.
 */
const DEBUG_TOKEN = process.env.NEXT_PUBLIC_APPCHECK_DEBUG_TOKEN;

let started = false;

/**
 * App Check을 시작한다. **Firestore·Auth의 첫 요청보다 먼저** 불려야 한다.
 * 늦으면 그 사이 나간 요청에는 토큰이 실리지 않는다.
 *
 * 서버(SSR)에서는 아무것도 하지 않는다 — reCAPTCHA는 브라우저 전용이다.
 */
export function startAppCheck(app: FirebaseApp): void {
  if (started) return;
  if (typeof window === "undefined") return;
  if (!SITE_KEY) return;

  started = true;

  if (DEBUG_TOKEN) {
    // firebase/app-check가 초기화 시점에 읽는 전역. 반드시 그 전에 세팅한다.
    (
      globalThis as unknown as { FIREBASE_APPCHECK_DEBUG_TOKEN?: string | boolean }
    ).FIREBASE_APPCHECK_DEBUG_TOKEN =
      DEBUG_TOKEN === "true" ? true : DEBUG_TOKEN;
  }

  // App Check은 이 화면에 필요할 때만 내려받으면 되는 코드다. 정적 import로 두면
  // reCAPTCHA를 쓰지 않는 마케팅 페이지 번들까지 커진다.
  void import("firebase/app-check")
    .then(({ initializeAppCheck, ReCaptchaV3Provider }) => {
      initializeAppCheck(app, {
        provider: new ReCaptchaV3Provider(SITE_KEY),
        // 토큰 만료 전에 자동 갱신. 끄면 오래 열어둔 탭이 조용히 실패한다.
        isTokenAutoRefreshEnabled: true,
      });
    })
    .catch((error) => {
      // App Check 초기화 실패가 화면을 죽이면 안 된다. enforce가 꺼져 있으면
      // 조회는 그대로 되고, 켜져 있으면 어차피 요청 단계에서 드러난다.
      console.error("[app-check] 초기화 실패:", error);
      started = false;
    });
}

/** 사이트 키가 설정돼 있는지. 배포 전 점검용. */
export function isAppCheckConfigured(): boolean {
  return Boolean(SITE_KEY);
}
