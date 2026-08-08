"use client";

import { useEffect, useMemo, useState } from "react";
import { subscribeDailyLogs } from "@/lib/firestore/logs";
import type { Log } from "@/lib/firestore/types";
import { formatTime, logActionStyle, phoneLast4 } from "@/lib/format";
import { Spinner } from "@/components/ui/spinner";

/**
 * 하루치 적립 내역 — 구독과 표시를 함께 갖는다.
 *
 * ⚠️ 호출부는 `key={`${storeCode}:${dateKey}`}`를 넘길 것. 날짜가 바뀌면 새로
 *    마운트되어 이전 날짜의 목록이 남아 보이지 않는다. effect에서 state를
 *    리셋하는 것보다 이쪽이 React가 권하는 방식이다.
 */
export function DailyLogs({
  storeCode,
  dateKey,
  isToday,
}: {
  storeCode: string;
  dateKey: string;
  isToday: boolean;
}) {
  const [logs, setLogs] = useState<Log[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeDailyLogs(storeCode, dateKey, setLogs, (e) => {
      console.error("[logs] 구독 실패:", e);
      setError("적립 내역을 불러오지 못했어요.");
      setLogs([]);
    });

    return unsubscribe;
  }, [storeCode, dateKey]);

  const summary = useMemo(() => {
    if (!logs) return null;
    const earned = logs.filter((l) => l.action === "stamp_saved").length;
    return { total: logs.length, earned, used: logs.length - earned };
  }, [logs]);

  if (error) {
    return (
      <p className="rounded-app-sm bg-app-container px-4 py-3 text-sm text-app-text-warning">
        {error}
      </p>
    );
  }

  if (logs === null) {
    return (
      <div className="flex justify-center py-20">
        <Spinner className="h-6 w-6 text-app-brand" />
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="rounded-app-md border border-dashed border-app-line-strong px-6 py-16 text-center">
        <p className="font-medium">
          {isToday ? "아직 오늘 적립이 없어요" : "이 날은 적립이 없었어요"}
        </p>
        {isToday ? (
          <p className="mt-2 text-sm text-app-text-mid">
            매장에서 적립하면 여기에 바로 나타납니다.
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-app-md border border-app-line">
      {summary ? (
        <p className="border-b border-app-line bg-app-container px-5 py-3 text-sm text-app-text-mid">
          총{" "}
          <span className="tabular font-semibold text-app-text-highest">
            {summary.total}
          </span>
          건
          <span className="mx-2 text-app-text-lowest">·</span>
          적립 <span className="tabular">{summary.earned}</span>
          <span className="mx-2 text-app-text-lowest">·</span>
          사용 <span className="tabular">{summary.used}</span>
        </p>
      ) : null}

      <ul className="divide-y divide-app-line">
        {logs.map((log) => {
          const style = logActionStyle(log.action);
          return (
            <li key={log.id} className="flex items-center gap-4 px-5 py-4">
              <span
                className={`shrink-0 rounded-app-xs px-2 py-1 text-xs font-semibold ${style.className}`}
              >
                {style.label}
              </span>

              <span className="tabular text-sm font-medium">
                ···{phoneLast4(log.phone_number)}
              </span>

              <span className="tabular ml-auto text-sm text-app-text-high">
                {log.action === "stamp_saved" ? "+" : "−"}
                {Math.abs(log.stamp)}
              </span>

              <span className="tabular w-12 shrink-0 text-right text-sm text-app-text-low">
                {formatTime(log.timestamp)}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
