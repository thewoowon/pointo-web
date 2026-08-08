"use client";

import { useEffect, useState } from "react";
import { subscribeCustomerLogs } from "@/lib/firestore/logs";
import type { Log } from "@/lib/firestore/types";
import type { CustomerHit } from "@/lib/firestore/users";
import { formatTime, logActionStyle, maskPhone } from "@/lib/format";
import { Spinner } from "@/components/ui/spinner";

const DATE_FORMAT = new Intl.DateTimeFormat("ko-KR", {
  year: "numeric",
  month: "long",
  day: "numeric",
  timeZone: "Asia/Seoul",
});

/**
 * 고객 상세 — RN DetailView의 웹 버전.
 *
 * 보유 쿠폰은 `coupons`(쿠폰 타입 id → 개수) 맵에 들어 있는데, 표시 이름은
 * 매장 설정(StoreConfig.couponTypes)에 있다. 매장 설정 화면을 옮기기 전이라
 * 지금은 id를 그대로 보여주고 개수만 정확히 센다.
 *
 * ⚠️ 호출부는 `key={customer.phone}`을 반드시 넘길 것. 고객이 바뀌면 이 컴포넌트를
 *    새로 마운트해서 이전 고객의 이력이 잠깐 비쳐 보이는 일을 막는다.
 *    (effect 안에서 state를 리셋하는 것보다 이쪽이 React가 권하는 방식이다)
 */
export function CustomerDetail({
  storeCode,
  customer,
}: {
  storeCode: string;
  customer: CustomerHit;
}) {
  const [logs, setLogs] = useState<Log[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeCustomerLogs(
      storeCode,
      customer.phone,
      setLogs,
      (e) => {
        console.error("[customer-detail] 이력 구독 실패:", e);
        setError("이력을 불러오지 못했어요.");
        setLogs([]);
      },
    );

    return unsubscribe;
  }, [storeCode, customer.phone]);

  const couponCount = Object.values(customer.coupons ?? {}).reduce(
    (sum, n) => sum + (n ?? 0),
    0,
  );

  return (
    <div className="rounded-app-md border border-app-line">
      <header className="border-b border-app-line px-5 py-5">
        <p className="tabular text-lg font-bold">{maskPhone(customer.phone)}</p>
        <dl className="mt-4 grid grid-cols-3 gap-3">
          <div>
            <dt className="text-xs text-app-text-low">스탬프</dt>
            <dd className="tabular mt-1 text-xl font-bold">
              {customer.stamps ?? 0}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-app-text-low">보유 쿠폰</dt>
            <dd className="tabular mt-1 text-xl font-bold">{couponCount}</dd>
          </div>
          <div>
            <dt className="text-xs text-app-text-low">레벨</dt>
            <dd className="tabular mt-1 text-xl font-bold">
              {customer.level ?? 0}
            </dd>
          </div>
        </dl>
        {customer.created_at ? (
          <p className="mt-4 text-xs text-app-text-low">
            가입 {customer.created_at}
            {customer.last_used ? ` · 최근 방문 ${customer.last_used}` : null}
          </p>
        ) : null}
      </header>

      <div className="px-5 py-4">
        <h2 className="mb-3 text-sm font-semibold text-app-text-high">
          최근 이력
        </h2>

        {error ? (
          <p className="py-6 text-center text-sm text-app-text-warning">
            {error}
          </p>
        ) : logs === null ? (
          <div className="flex justify-center py-10">
            <Spinner className="h-5 w-5 text-app-brand" />
          </div>
        ) : logs.length === 0 ? (
          <p className="py-10 text-center text-sm text-app-text-mid">
            아직 이력이 없어요
          </p>
        ) : (
          <ul className="max-h-[26rem] divide-y divide-app-line overflow-y-auto">
            {logs.map((log) => {
              const style = logActionStyle(log.action);
              return (
                <li key={log.id} className="flex items-center gap-3 py-3">
                  <span
                    className={`shrink-0 rounded-app-xs px-2 py-1 text-xs font-semibold ${style.className}`}
                  >
                    {style.label}
                  </span>
                  <span className="tabular text-sm text-app-text-high">
                    {log.action === "stamp_saved" ? "+" : "−"}
                    {Math.abs(log.stamp)}
                  </span>
                  <span className="ml-auto text-xs text-app-text-low">
                    {DATE_FORMAT.format(log.timestamp)}{" "}
                    <span className="tabular">{formatTime(log.timestamp)}</span>
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
