"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { getOwnerSlotInfo, getOwnerStores } from "@/lib/firestore/owners";
import type { StoreSummary } from "@/lib/firestore/types";
import { FullScreenSpinner } from "@/components/ui/spinner";

/**
 * 내 매장 — 로그인 후 첫 화면이자 계정 허브.
 *
 * RN의 SwitcherScreen과 같은 역할이다. 매장을 고르면
 * `/stores/[storeCode]`로 들어간다. (선택 상태는 URL이 진실의 원천)
 */
export default function StoresPage() {
  const { user } = useAuth();

  const [stores, setStores] = useState<StoreSummary[] | null>(null);
  const [slots, setSlots] = useState<{ current: number; limit: number } | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  // 취소 플래그가 필요한 이유: 계정이 바뀌거나 사용자가 화면을 떠난 뒤
  // 늦게 도착한 응답이 이전 계정의 매장을 덮어쓰면 안 된다.
  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    (async () => {
      try {
        const [list, slotInfo] = await Promise.all([
          getOwnerStores(user.uid),
          getOwnerSlotInfo(user.uid),
        ]);
        if (cancelled) return;
        setStores(list);
        setSlots({ current: slotInfo.current, limit: slotInfo.limit });
      } catch (e) {
        if (cancelled) return;
        console.error("[stores] 목록 조회 실패:", e);
        setError("매장을 불러오지 못했어요. 새로고침 해주세요.");
        setStores([]);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user]);

  if (stores === null) {
    return <FullScreenSpinner label="매장을 불러오는 중" />;
  }

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold">내 매장</h1>
          {slots ? (
            <p className="mt-1 text-sm text-app-text-mid">
              <span className="tabular">{slots.current}</span> /{" "}
              <span className="tabular">{slots.limit}</span>개 사용 중
            </p>
          ) : null}
        </div>
      </div>

      {error ? (
        <p className="mb-6 rounded-app-sm bg-app-container px-4 py-3 text-sm text-app-text-warning">
          {error}
        </p>
      ) : null}

      {stores.length === 0 ? (
        <div className="rounded-app-md border border-dashed border-app-line-strong px-6 py-16 text-center">
          <p className="font-medium">아직 등록된 매장이 없어요</p>
          <p className="mt-2 text-sm text-app-text-mid">
            포인토 앱에서 매장을 등록하면 여기에 나타납니다.
          </p>
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {stores.map((store) => (
            <li key={store.storeCode}>
              <Link
                href={`/stores/${store.storeCode}`}
                className="block rounded-app-md border border-app-line px-5 py-5 transition hover:border-app-brand hover:bg-app-container"
              >
                <p className="text-base font-semibold">{store.name}</p>
                <p className="mt-1 text-sm text-app-text-low">
                  적립 내역 · 고객 · 통계 보기
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
