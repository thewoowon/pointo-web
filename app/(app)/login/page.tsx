"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { UserCredential } from "firebase/auth";
import {
  consumeRedirectResult,
  isSignInCancelled,
  providerIdOf,
  signIn,
  type OwnerProvider,
} from "@/lib/auth";
import { migrateLegacyOwner } from "@/lib/firestore/owners";
import { useAuth } from "@/lib/auth-context";
import { Spinner } from "@/components/ui/spinner";

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.06 12.25c0-.85-.08-1.67-.22-2.45H12v4.64h6.2a5.3 5.3 0 0 1-2.3 3.48v2.89h3.72c2.18-2 3.44-4.96 3.44-8.46Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.11 0 5.72-1.03 7.62-2.79l-3.72-2.89c-1.03.69-2.35 1.1-3.9 1.1-3 0-5.540-2.03-6.45-4.75H1.7v2.98A11.5 11.5 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.55 14.67a6.9 6.9 0 0 1 0-4.41V7.28H1.7a11.51 11.51 0 0 0 0 10.37l3.85-2.98Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.69 0 3.21.58 4.4 1.72l3.3-3.3C17.72 1.2 15.11 0 12 0 7.48 0 3.57 2.59 1.7 6.36l3.85 2.98C6.46 6.78 9 4.75 12 4.75Z"
      />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const { user, loading, refreshOwner } = useAuth();

  const [pending, setPending] = useState<OwnerProvider | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * 로그인 후처리 — 앱의 LoginScreen.completeSignIn과 같은 역할.
   *
   * 기존 점주는 `owners/{제공자id}`로 저장돼 있어서, 이전해주지 않으면
   * 보안 규칙상 자기 매장에 접근하지 못한다.
   */
  const completeSignIn = useCallback(
    async (credential: UserCredential, provider: OwnerProvider) => {
      const { user: signedIn } = credential;
      await migrateLegacyOwner(
        signedIn.uid,
        providerIdOf(signedIn, provider),
        signedIn.email ?? "",
      );
      await refreshOwner();
      router.replace("/stores");
    },
    [refreshOwner, router],
  );

  // 팝업이 막혀 리다이렉트로 로그인한 경우, 돌아왔을 때 결과를 회수한다.
  useEffect(() => {
    let active = true;
    (async () => {
      const credential = await consumeRedirectResult();
      if (!active || !credential) return;
      const provider: OwnerProvider =
        credential.providerId === "apple.com" ? "apple" : "google";
      await completeSignIn(credential, provider);
    })();
    return () => {
      active = false;
    };
  }, [completeSignIn]);

  // 이미 로그인된 상태로 들어오면 곧장 통과시킨다.
  useEffect(() => {
    if (!loading && user && !pending) {
      router.replace("/stores");
    }
  }, [loading, user, pending, router]);

  const handleSignIn = async (provider: OwnerProvider) => {
    setPending(provider);
    setError(null);
    try {
      const credential = await signIn(provider);
      if (!credential) return; // 리다이렉트로 폴백 — 페이지를 떠난다
      await completeSignIn(credential, provider);
    } catch (e) {
      if (!isSignInCancelled(e)) {
        console.error("[login] 실패:", e);
        setError("로그인에 실패했어요. 잠시 후 다시 시도해주세요.");
      }
      setPending(null);
    }
  };

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-[420px]">
        <div className="mb-12 text-center">
          <Link href="/" className="text-2xl font-bold text-app-brand">
            포인토
          </Link>
          <p className="mt-3 text-app-text-mid">사장님, 어서 오세요</p>
        </div>

        <div className="mb-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-app-line" />
          <span className="text-sm text-app-text-low">소셜로그인으로 계속하기</span>
          <div className="h-px flex-1 bg-app-line" />
        </div>

        <div className="flex flex-col gap-2.5">
          <button
            type="button"
            onClick={() => handleSignIn("google")}
            disabled={pending !== null}
            className="relative flex h-14 w-full items-center justify-center gap-3 rounded-app-sm border border-app-line-strong bg-white text-base font-medium text-app-text-highest shadow-sm transition hover:bg-app-container disabled:opacity-60"
          >
            <span className="absolute left-4">
              {pending === "google" ? null : <GoogleIcon />}
            </span>
            {pending === "google" ? <Spinner className="h-5 w-5" /> : "구글로 계속하기"}
          </button>

          <button
            type="button"
            onClick={() => handleSignIn("apple")}
            disabled={pending !== null}
            className="relative flex h-14 w-full items-center justify-center gap-3 rounded-app-sm bg-black text-base font-medium text-white transition hover:opacity-90 disabled:opacity-60"
          >
            <span className="absolute left-4">
              {pending === "apple" ? null : <AppleIcon />}
            </span>
            {pending === "apple" ? <Spinner className="h-5 w-5" /> : "애플로 계속하기"}
          </button>
        </div>

        {error ? (
          <p className="mt-4 text-center text-sm text-app-text-warning">{error}</p>
        ) : null}

        <p className="mt-6 text-center text-xs leading-5 text-app-text-low">
          로그인 시 서비스 이용약관 및{" "}
          <Link href="/privacy" className="underline">
            개인정보처리방침
          </Link>
          에 동의하게 됩니다.
        </p>
      </div>
    </main>
  );
}
