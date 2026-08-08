"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { requestAccountDeletion } from "@/lib/firestore/owners";
import { Spinner } from "@/components/ui/spinner";

/**
 * 계정 설정 — RN AccountSettingsScreen / DeletionConfirmScreen의 웹 버전.
 *
 * 탈퇴는 soft delete다. 30일 유예 뒤 서버 스케줄러가 실제로 지우고, 그동안
 * 매장 데이터는 보존된다. 유예 중 로그인하면 대시보드 가드가 막고 복구를
 * 안내한다.
 */
export default function AccountPage() {
  const { user, owner, refreshOwner, signOut } = useAuth();
  const [confirming, setConfirming] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!user) return;
    setPending(true);
    setError(null);
    try {
      await requestAccountDeletion(user.uid);
      await refreshOwner();
      // 가드가 유예 화면으로 전환한다
    } catch (e) {
      console.error("[account] 탈퇴 요청 실패:", e);
      setError("탈퇴 요청에 실패했어요. 잠시 후 다시 시도해주세요.");
      setPending(false);
    }
  };

  const storeCount = owner?.storeCodes?.length ?? 0;

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-10">
      <div className="mb-8">
        <Link
          href="/stores"
          className="text-sm text-app-text-mid transition hover:text-app-text-highest"
        >
          ← 내 매장
        </Link>
        <h1 className="mt-2 text-2xl font-bold">계정 설정</h1>
      </div>

      <section className="rounded-app-md border border-app-line px-5 py-5">
        <h2 className="text-sm font-semibold text-app-text-high">로그인 계정</h2>
        <p className="mt-2 text-base">{owner?.email ?? user?.email}</p>
        <p className="mt-1 text-sm text-app-text-mid">
          매장 <span className="tabular">{storeCount}</span>개 · 슬롯{" "}
          <span className="tabular">{owner?.slotLimit ?? 3}</span>개
        </p>
      </section>

      <section className="mt-5 rounded-app-md border border-app-line px-5 py-5">
        <h2 className="text-sm font-semibold text-app-text-high">개인정보</h2>
        <Link
          href="/privacy"
          className="mt-2 inline-block text-sm text-app-text-brand underline"
        >
          개인정보처리방침 보기
        </Link>
      </section>

      <section className="mt-5 rounded-app-md border border-app-line px-5 py-5">
        <h2 className="text-sm font-semibold text-app-text-high">로그아웃</h2>
        <button
          type="button"
          onClick={() => signOut()}
          className="mt-3 h-11 rounded-app-sm border border-app-line-strong px-5 text-sm font-medium transition hover:bg-app-container"
        >
          로그아웃
        </button>
      </section>

      {/* 탈퇴 */}
      <section className="mt-5 rounded-app-md border border-app-line px-5 py-5">
        <h2 className="text-sm font-semibold text-app-text-warning">회원 탈퇴</h2>

        {!confirming ? (
          <>
            <p className="mt-2 text-sm leading-6 text-app-text-mid">
              탈퇴를 요청하면 30일 뒤에 계정이 완전히 삭제됩니다. 그 전에는 다시
              로그인해서 되돌릴 수 있어요.
            </p>
            <button
              type="button"
              onClick={() => setConfirming(true)}
              className="mt-3 h-11 rounded-app-sm border border-app-line-strong px-5 text-sm font-medium text-app-text-warning transition hover:bg-app-container"
            >
              탈퇴 요청
            </button>
          </>
        ) : (
          <>
            <p className="mt-2 text-sm leading-6 text-app-text-mid">
              정말 탈퇴할까요? 유예 기간 동안{" "}
              <strong className="text-app-text-highest">
                매장 {storeCount}개에 접근할 수 없어요.
              </strong>{" "}
              매장과 고객 데이터는 보존되며, 30일 안에 복구하면 그대로 돌아옵니다.
            </p>

            {error ? (
              <p className="mt-3 text-sm text-app-text-warning">{error}</p>
            ) : null}

            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={handleDelete}
                disabled={pending}
                className="flex h-11 min-w-28 items-center justify-center rounded-app-sm bg-app-warning px-5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
              >
                {pending ? <Spinner className="h-5 w-5" /> : "탈퇴하기"}
              </button>
              <button
                type="button"
                onClick={() => setConfirming(false)}
                disabled={pending}
                className="h-11 rounded-app-sm border border-app-line-strong px-5 text-sm font-medium transition hover:bg-app-container"
              >
                취소
              </button>
            </div>
          </>
        )}
      </section>
    </main>
  );
}
