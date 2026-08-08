"use client";

/**
 * 점주 세션 컨텍스트.
 *
 * RN의 `AuthContext`와 역할이 같지만 훨씬 얇다. 웹은 "기기 고객모드 잠금"이나
 * "마지막 세션 복원" 같은 키오스크용 개념이 없고, Firebase가 세션 유지를
 * 알아서 하기 때문이다. 여기서 다루는 건 로그인 상태와 계정 프로필뿐이다.
 *
 * 선택된 매장은 URL(`/stores/[storeCode]/...`)이 진실의 원천이다. 컨텍스트에
 * 넣지 않는 이유: 새로고침·링크 공유·뒤로가기가 전부 공짜로 동작하고,
 * "URL과 상태가 어긋나는" 흔한 버그가 아예 생기지 않는다.
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

type AuthState = {
  /** Firebase 세션 복원 중 */
  loading: boolean;
  user: User | null;
  owner: Owner | null;
  /** 탈퇴 유예 중인 계정 — 매장 접근을 막아야 한다 */
  pendingDeletion: boolean;
  refreshOwner: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [owner, setOwner] = useState<Owner | null>(null);

  // 설정이 없을 때는 `(app)/layout.tsx`가 안내 화면을 대신 띄우므로
  // 이 provider 자체가 마운트되지 않는다. 여기서 다시 확인할 필요는 없다.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getFirebaseAuth(), async (next) => {
      setUser(next);
      if (next) {
        // 로그인 직후엔 아직 프로필이 없을 수 있다(마이그레이션/가입 진행 중).
        // 그 경우 null로 두고, 로그인 페이지가 프로필을 만든 뒤 refresh 한다.
        setOwner((await getOwnerProfile(next.uid)) ?? null);
      } else {
        setOwner(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const refreshOwner = useCallback(async () => {
    if (!user) return;
    setOwner((await getOwnerProfile(user.uid)) ?? null);
  }, [user]);

  const signOut = useCallback(async () => {
    await signOutOwner();
    setOwner(null);
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      loading,
      user,
      owner,
      pendingDeletion: owner?.accountStatus === "pending_deletion",
      refreshOwner,
      signOut,
    }),
    [loading, user, owner, refreshOwner, signOut],
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
