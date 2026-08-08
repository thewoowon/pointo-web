"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { getStore } from "@/lib/firestore/owners";
import { FullScreenSpinner } from "@/components/ui/spinner";
import type { Store } from "@/lib/firestore/types";

const TABS = [
  { segment: "", label: "적립 내역" },
  { segment: "customers", label: "고객" },
  { segment: "stats", label: "통계" },
  { segment: "settings", label: "매장 설정" },
] as const;

/**
 * 매장 셸 — 소유 확인 + 탭 네비게이션.
 *
 * 소유 여부는 owner.storeCodes로 판단한다. 남의 매장 코드를 URL에 직접 넣어도
 * Firestore 규칙이 데이터를 안 주지만, 그 경우 화면은 알 수 없는 에러로
 * 깨진다. 여기서 먼저 걸러 "권한 없음"을 제대로 보여준다.
 */
export default function StoreLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { storeCode } = useParams<{ storeCode: string }>();
  const pathname = usePathname();
  const { owner } = useAuth();

  // 소유 여부는 owner에서 바로 나오는 값이라 state로 둘 이유가 없다.
  // 부모 레이아웃이 프로필 로딩·에러를 이미 처리하므로 여기 도달했다면 판정이
  // 가능한 상태다. 계정 문서가 아예 없으면(owner === null) 소유 매장도 없다.
  const owned = owner?.storeCodes?.includes(storeCode) ?? false;

  // undefined = 조회 중, null = 없음/실패
  const [store, setStore] = useState<Store | null | undefined>(undefined);

  useEffect(() => {
    if (!owned) return;
    let cancelled = false;

    (async () => {
      try {
        const found = await getStore(storeCode);
        if (!cancelled) setStore(found ?? null);
      } catch (e) {
        if (cancelled) return;
        console.error("[store] 조회 실패:", e);
        setStore(null);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [owned, storeCode]);

  // 단계별로 나눠서 걸러야 아래에서 store가 Store로 좁혀진다.
  if (!owned) return <NoAccess />;
  if (store === undefined) return <FullScreenSpinner label="매장을 여는 중" />;
  if (store === null) return <NoAccess />;

  const base = `/stores/${storeCode}`;

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-8">
      <div className="mb-6">
        <Link
          href="/stores"
          className="text-sm text-app-text-mid transition hover:text-app-text-highest"
        >
          ← 내 매장
        </Link>
        <h1 className="mt-2 text-2xl font-bold">{store.name ?? storeCode}</h1>
      </div>

      {/* 탭 4개는 좁은 화면(아이폰 SE 등)에서 한 줄에 안 들어간다.
          페이지 전체가 가로로 밀리지 않도록 이 안에서만 스크롤한다. */}
      <nav className="mb-8 flex gap-1 overflow-x-auto border-b border-app-line [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {TABS.map((tab) => {
          const href = tab.segment ? `${base}/${tab.segment}` : base;
          const active = pathname === href;
          return (
            <Link
              key={tab.segment}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`-mb-px shrink-0 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition ${
                active
                  ? "border-app-brand text-app-brand"
                  : "border-transparent text-app-text-mid hover:text-app-text-highest"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>

      {children}
    </main>
  );
}

function NoAccess() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
      <h1 className="text-xl font-bold">접근할 수 없는 매장이에요</h1>
      <p className="mt-3 text-sm text-app-text-mid">
        계정에 연결되지 않은 매장이거나, 삭제된 매장입니다.
      </p>
      <Link
        href="/stores"
        className="mt-8 rounded-app-sm bg-app-brand px-5 py-3 text-sm font-medium text-app-text-on-brand transition hover:bg-app-brand-hover"
      >
        내 매장으로
      </Link>
    </main>
  );
}
