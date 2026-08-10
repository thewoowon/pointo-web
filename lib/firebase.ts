/**
 * Firebase 웹 SDK 초기화.
 *
 * RN 앱과 **같은 Firebase 프로젝트**(kbffee-a365e)를 바라본다. 같은 Firestore를
 * 읽고 쓰므로 보안 규칙도 그대로 적용된다 — 즉 여기서도 로그인 없이는 아무것도
 * 못 읽는다. (레포 KBffee의 SECURITY_PASS.md 참고)
 *
 * 설정값은 비밀이 아니다(브라우저에 노출되는 게 정상). 그래도 하드코딩하지 않고
 * 환경변수로 두는 이유는 개발/운영 프로젝트를 나눌 여지를 남기기 위함이다.
 * 값은 Firebase Console → 프로젝트 설정 → 내 앱 → 웹 앱에서 얻는다.
 */

import { getApp, getApps, initializeApp, type FirebaseOptions } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { startAppCheck } from "./app-check";

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

/**
 * 설정이 비어 있으면 Firebase는 인증 단계에서야 알 수 없는 에러를 던진다.
 * 원인을 바로 알 수 있도록 초기화 시점에 먼저 확인한다.
 */
function assertConfigured(config: FirebaseOptions): void {
  const missing = (
    ["apiKey", "authDomain", "projectId", "appId"] as const
  ).filter((key) => !config[key]);

  if (missing.length > 0) {
    throw new Error(
      `Firebase 설정이 비어 있습니다: ${missing
        .map((k) => `NEXT_PUBLIC_FIREBASE_${k.replace(/[A-Z]/g, (c) => `_${c}`).toUpperCase()}`)
        .join(", ")}\n` +
        `.env.local을 만들고 .env.local.example의 안내를 따르세요.`,
    );
  }
}

/** 설정이 채워져 있는지. UI가 흰 화면 대신 안내를 띄우는 데 쓴다. */
export function isFirebaseConfigured(): boolean {
  return Boolean(
    firebaseConfig.apiKey &&
      firebaseConfig.authDomain &&
      firebaseConfig.projectId &&
      firebaseConfig.appId,
  );
}

// Next는 개발 중 모듈을 다시 평가하므로 중복 초기화를 막는다.
function getFirebaseApp() {
  const app =
    getApps().length > 0
      ? getApp()
      : (assertConfigured(firebaseConfig), initializeApp(firebaseConfig));

  // App Check은 Firestore·Auth의 첫 요청보다 먼저 시작돼야 한다. getDb()/
  // getFirebaseAuth()가 전부 여기를 거치므로 이 자리가 유일하게 안전하다.
  // (컴포넌트의 useEffect는 이미 늦다 — AuthContext가 마운트 즉시 세션을 복원한다)
  startAppCheck(app);

  return app;
}

export function getFirebaseAuth(): Auth {
  return getAuth(getFirebaseApp());
}

export function getDb(): Firestore {
  return getFirestore(getFirebaseApp());
}
