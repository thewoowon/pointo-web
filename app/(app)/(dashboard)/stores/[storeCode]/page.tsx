"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import {
  formatDateLabel,
  fromDateKey,
  isToday as isTodayKey,
  shiftDateKey,
  toDateKey,
} from "@/lib/format";
import { DailyLogs } from "@/components/daily-logs";

/**
 * 적립 내역 — RN MainScreen의 웹 버전.
 *
 * 앱은 새 로그를 폴링하지만 여기서는 구독한다. 카운터 태블릿에서 적립하면
 * 사장님 데스크톱 화면에 바로 뜨는 게 이 화면의 존재 이유다.
 *
 * 목록은 날짜로 키잉된 자식이 담당한다. 날짜를 바꿨을 때 이전 목록이 남아
 * 보이지 않게 하려면 리셋보다 리마운트가 깔끔하다.
 */
export default function StoreLogsPage() {
  const { storeCode } = useParams<{ storeCode: string }>();
  const [dateKey, setDateKey] = useState(() => toDateKey(new Date()));

  const today = isTodayKey(dateKey);

  return (
    <div>
      <div className="mb-6 flex items-center gap-1">
        <button
          type="button"
          onClick={() => setDateKey((d) => shiftDateKey(d, -1))}
          aria-label="이전 날짜"
          className="flex h-9 w-9 items-center justify-center rounded-app-sm text-app-text-mid transition hover:bg-app-container"
        >
          ‹
        </button>

        <span className="min-w-[8.5rem] text-center text-base font-semibold">
          {formatDateLabel(fromDateKey(dateKey))}
        </span>

        <button
          type="button"
          onClick={() => setDateKey((d) => shiftDateKey(d, 1))}
          disabled={today}
          aria-label="다음 날짜"
          className="flex h-9 w-9 items-center justify-center rounded-app-sm text-app-text-mid transition hover:bg-app-container disabled:opacity-30 disabled:hover:bg-transparent"
        >
          ›
        </button>

        {!today ? (
          <button
            type="button"
            onClick={() => setDateKey(toDateKey(new Date()))}
            className="ml-2 rounded-app-sm border border-app-line px-3 py-1.5 text-xs font-medium text-app-text-mid transition hover:bg-app-container"
          >
            오늘
          </button>
        ) : null}
      </div>

      <DailyLogs
        key={`${storeCode}:${dateKey}`}
        storeCode={storeCode}
        dateKey={dateKey}
        isToday={today}
      />
    </div>
  );
}
