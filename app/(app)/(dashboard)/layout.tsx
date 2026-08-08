"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { restoreAccount } from "@/lib/firestore/owners";
import { FullScreenSpinner, Spinner } from "@/components/ui/spinner";

/**
 * 인증 가드 + 대시보드 공통 헤더.
 *
 * 이 그룹 안의 모든 라우트는 로그인을 요구한다. `/login`은 한 단계 위
 * `(app)` 그룹에 있어서 가드에 걸리지 않는다.
 *
 * 클라이언트 가드인 이유: Firebase 세션이 브라우저(IndexedDB)에 있어 서버가
 * 볼 수 없다. 서버에서 막으려면 세션 쿠키를 따로 발급해야 하는데, 지금은
 * 데이터 접근 자체를 Firestore 보안 규칙이 막고 있어 이 화면 가드는
 * "잘못된 화면을 보여주지 않기" 용도면 충분하다.
 */
export default function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const router = useRouter();
  const { loading, user, owner, ownerStatus, pendingDeletion, signOut, refreshOwner } =
    useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return <FullScreenSpinner label="불러오는 중" />;
  }

  // 프로필을 못 가져오면 원인을 보여준다. 예전에는 여기서 무한 스피너가 됐다.
  if (ownerStatus === "error") {
    return (
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-16">
        <div className="w-full max-w-[460px] text-center">
          <h1 className="text-xl font-bold">계정 정보를 불러오지 못했어요</h1>
          <p className="mt-3 text-sm leading-6 text-app-text-mid">
            네트워크 문제이거나, 브라우저 확장(광고·추적 차단)이 Firestore 요청을
            막고 있을 수 있어요. 시크릿 창에서 열어보면 구분됩니다.
          </p>
          <div className="mt-8 flex gap-2">
            <button
              type="button"
              onClick={() => refreshOwner()}
              className="h-12 flex-1 rounded-app-sm bg-app-brand text-sm font-semibold text-app-text-on-brand transition hover:bg-app-brand-hover"
            >
              다시 시도
            </button>
            <button
              type="button"
              onClick={() => signOut()}
              className="h-12 flex-1 rounded-app-sm border border-app-line-strong text-sm font-medium transition hover:bg-app-container"
            >
              로그아웃
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (ownerStatus === "loading") {
    return <FullScreenSpinner label="계정 정보를 불러오는 중" />;
  }

  // 탈퇴 유예 중인 계정은 매장에 접근할 수 없다. (앱의 DeletionPending과 같은 규칙)
  if (pendingDeletion) {
    return <DeletionPending />;
  }

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-app-line bg-app-bg/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
          <Link href="/stores" className="text-lg font-bold text-app-brand">
            포인토
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/account"
              className="hidden text-sm text-app-text-mid transition hover:text-app-text-highest sm:inline"
            >
              {owner?.email ?? user.email}
            </Link>
            <Link
              href="/account"
              className="text-sm text-app-text-mid transition hover:text-app-text-highest sm:hidden"
            >
              계정
            </Link>
            <button
              type="button"
              onClick={() => signOut()}
              className="text-sm text-app-text-mid transition hover:text-app-text-highest"
            >
              로그아웃
            </button>
          </div>
        </div>
      </header>
      {children}
    </>
  );
}

/**
 * 탈퇴 유예 화면 — RN DeletionPendingScreen과 같은 역할.
 *
 * 여기서 복구까지 되어야 한다. 로그아웃만 있으면 유예 중인 점주가 되돌릴
 * 방법이 화면에 없어진다.
 */
function DeletionPending() {
  const { user, owner, refreshOwner, signOut } = useAuth();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deadline = owner?.deletedAt
    ? new Date(new Date(owner.deletedAt).getTime() + 30 * 24 * 60 * 60 * 1000)
    : null;

  const handleRestore = async () => {
    if (!user) return;
    setPending(true);
    setError(null);
    try {
      await restoreAccount(user.uid);
      await refreshOwner();
    } catch (e) {
      console.error("[account] 복구 실패:", e);
      setError("복구에 실패했어요. 잠시 후 다시 시도해주세요.");
      setPending(false);
    }
  };

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-[420px] text-center">
        <h1 className="text-xl font-bold">탈퇴가 진행 중이에요</h1>
        <p className="mt-3 text-sm leading-6 text-app-text-mid">
          {deadline
            ? `${deadline.getFullYear()}년 ${deadline.getMonth() + 1}월 ${deadline.getDate()}일에 계정이 완전히 삭제됩니다.`
            : "요청일로부터 30일 뒤에 계정이 완전히 삭제됩니다."}
          <br />
          그 전까지는 매장에 접근할 수 없어요.
        </p>

        {error ? (
          <p className="mt-4 text-sm text-app-text-warning">{error}</p>
        ) : null}

        <button
          type="button"
          onClick={handleRestore}
          disabled={pending}
          className="mt-8 flex h-12 w-full items-center justify-center rounded-app-sm bg-app-brand text-sm font-semibold text-app-text-on-brand transition hover:bg-app-brand-hover disabled:opacity-60"
        >
          {pending ? <Spinner className="h-5 w-5" /> : "탈퇴 취소하고 계속 쓰기"}
        </button>

        <button
          type="button"
          onClick={() => signOut()}
          disabled={pending}
          className="mt-2 h-12 w-full rounded-app-sm border border-app-line-strong text-sm font-medium transition hover:bg-app-container disabled:opacity-60"
        >
          로그아웃
        </button>
      </div>
    </main>
  );
}
