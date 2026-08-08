"use client";

/**
 * 점주 세션 컨텍스트.
 *
 * RN의 `AuthContext`와 역할이 같지만 훨씬 얇다. 웹은 "기기 고객모드 잠금"이나
 * "마지막 세션 복원" 같은 키오스크용 개념이 없고, Firebase가 세션 유지를
 * 알아서 하기 때문이다.
 *
 * 선택된 매장은 URL(`/stores/[storeCode]/...`)이 진실의 원천이다. 컨텍스트에
 * 넣지 않는 이유: 새로고침·링크 공유·뒤로가기가 전부 공짜로 동작하고,
 * "URL과 상태가 어긋나는" 흔한 버그가 아예 생기지 않는다.
 *
 * ⚠️ 로그인 상태(`loading`)와 프로필 조회(`ownerStatus`)는 **분리한다.**
 *    한데 묶으면 Firestore 읽기가 한 번 막히는 순간 앱 전체가 영원히
 *    로딩 스피너에 갇힌다. 실제로 그렇게 만들었다가 겪었다.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { getFirebaseAuth } from "./firebase";
import { signOutOwner } from "./auth";
import { getOwnerProfile } from "./firestore/owners";
import type { Owner } from "./firestore/types";

/**
 * 프로필 조회 제한 시간.
 *
 * Firestore 웹 SDK는 네트워크가 막히면 실패하지 않고 **무한정 기다린다.**
 * (브라우저 확장이 firestore.googleapis.com을 차단하는 경우가 흔하다)
 * 그대로 두면 원인 모를 무한 스피너가 되므로 끊어서 에러로 만든다.
 */
const PROFILE_TIMEOUT_MS = 15000;

export type OwnerStatus = "loading" | "ready" | "error";

type AuthState = {
  /** Firebase 세션 복원 중 — 로그인 여부 자체를 아직 모르는 상태 */
  loading: boolean;
  user: User | null;
  owner: Owner | null;
  /** 프로필 조회 상태. 로그인 상태와 별개다. */
  ownerStatus: OwnerStatus;
  /** 탈퇴 유예 중인 계정 — 매장 접근을 막아야 한다 */
  pendingDeletion: boolean;
  refreshOwner: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthState | undefined>(undefined);

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(
        () =>
          reject(
            new Error(
              "Firestore 응답이 없습니다. 네트워크나 브라우저 확장(광고 차단 등)이 " +
                "firestore.googleapis.com을 막고 있는지 확인해주세요.",
            ),
          ),
        ms,
      ),
    ),
  ]);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [owner, setOwner] = useState<Owner | null>(null);
  const [ownerStatus, setOwnerStatus] = useState<OwnerStatus>("loading");
  // 수동 재시도용 — 값이 바뀌면 조회 effect가 다시 돈다
  const [reloadToken, setReloadToken] = useState(0);

  // 1) 로그인 상태만 본다. Firestore와 무관하게 즉시 확정된다.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getFirebaseAuth(), (next) => {
      setUser(next);
      setLoading(false);
      if (!next) {
        setOwner(null);
        setOwnerStatus("ready");
      }
    });
    return unsubscribe;
  }, []);

  // 2) 프로필은 별도로 가져온다. 실패해도 로그인 상태를 막지 않는다.
  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    (async () => {
      try {
        const profile = await withTimeout(
          getOwnerProfile(user.uid),
          PROFILE_TIMEOUT_MS,
        );
        if (cancelled) return;
        setOwner(profile ?? null);
        setOwnerStatus("ready");
      } catch (e) {
        if (cancelled) return;
        console.error("[auth] 계정 프로필 조회 실패:", e);
        setOwnerStatus("error");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user, reloadToken]);

  const refreshOwner = useCallback(async () => {
    setReloadToken((n) => n + 1);
  }, []);

  const signOut = useCallback(async () => {
    await signOutOwner();
    setOwner(null);
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      loading,
      user,
      owner,
      ownerStatus,
      pendingDeletion: owner?.accountStatus === "pending_deletion",
      refreshOwner,
      signOut,
    }),
    [loading, user, owner, ownerStatus, refreshOwner, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
