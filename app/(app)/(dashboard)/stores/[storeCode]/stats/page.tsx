"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getLogsInRange } from "@/lib/firestore/logs";
import { getStore } from "@/lib/firestore/owners";
import { getStoreCustomerCount } from "@/lib/firestore/users";
import type { Log } from "@/lib/firestore/types";
import {
  dailyStats,
  dateRangeOf,
  hourlyStats,
  PERIOD_LABELS,
  todaySummary,
  type Period,
} from "@/lib/stats";
import { BarChart, type Series } from "@/components/charts/bar-chart";
import { Spinner } from "@/components/ui/spinner";

/** 계열 색은 앱의 적립/사용 배지와 같다. 순서·개수와 무관하게 고정. */
const TREND_SERIES: Series[] = [
  { key: "saved", label: "적립", className: "bg-app-earn-fg" },
  { key: "used", label: "사용", className: "bg-app-use-fg" },
];

const HOUR_SERIES: Series[] = [
  { key: "count", label: "활동", className: "bg-app-brand" },
];

const PERIODS: Period[] = ["today", "7days", "30days", "month"];

type Data = {
  logs: Log[];
  memberCount: number;
  isPointMode: boolean;
};

export default function StatsPage() {
  const { storeCode } = useParams<{ storeCode: string }>();

  const [period, setPeriod] = useState<Period>("7days");
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { start, end } = dateRangeOf(period);
        const [logs, memberCount, store] = await Promise.all([
          getLogsInRange(storeCode, start, end),
          getStoreCustomerCount(storeCode),
          getStore(storeCode),
        ]);
        if (cancelled) return;
        setData({
          logs,
          memberCount,
          isPointMode: store?.config?.mode === "point",
        });
      } catch (e) {
        if (cancelled) return;
        console.error("[stats] 조회 실패:", e);
        setError("통계를 불러오지 못했어요.");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [storeCode, period]);

  const unit = data?.isPointMode ? "P" : "건";

  return (
    <div>
      {/* 기간 필터 — 차트 위 한 줄 */}
      <div className="mb-8 flex flex-wrap gap-2">
        {PERIODS.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPeriod(p)}
            aria-pressed={period === p}
            className={`rounded-app-sm border px-4 py-2 text-sm font-medium transition ${
              period === p
                ? "border-app-brand bg-app-brand text-app-text-on-brand"
                : "border-app-line text-app-text-mid hover:bg-app-container"
            }`}
          >
            {PERIOD_LABELS[p]}
          </button>
        ))}
      </div>

      {error ? (
        <p className="rounded-app-sm bg-app-container px-4 py-3 text-sm text-app-text-warning">
          {error}
        </p>
      ) : !data ? (
        <div className="flex justify-center py-24">
          <Spinner className="h-6 w-6 text-app-brand" />
        </div>
      ) : (
        <StatsContent data={data} period={period} unit={unit} />
      )}
    </div>
  );
}

function StatsContent({
  data,
  period,
  unit,
}: {
  data: Data;
  period: Period;
  unit: string;
}) {
  const today = todaySummary(data.logs, data.isPointMode);
  const daily = dailyStats(data.logs, period, data.isPointMode);
  const hourly = hourlyStats(data.logs);

  const periodSaved = daily.reduce((s, d) => s + d.saved, 0);
  const periodUsed = daily.reduce((s, d) => s + d.used, 0);

  return (
    <div className="flex flex-col gap-10">
      {/* 오늘 요약 — 수치 하나짜리는 차트로 만들지 않는다 */}
      <section>
        <h2 className="mb-4 text-sm font-semibold text-app-text-high">오늘</h2>
        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatTile label="적립" value={today.saved} unit={unit} />
          <StatTile label="사용" value={today.used} unit={unit} />
          <StatTile label="방문 고객" value={today.visitors} unit="명" />
          <StatTile label="전체 회원" value={data.memberCount} unit="명" />
        </dl>
      </section>

      {/* 기간 추이 */}
      <section>
        <div className="mb-4 flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <h2 className="text-sm font-semibold text-app-text-high">
            {PERIOD_LABELS[period]} 추이
          </h2>
          <p className="text-sm text-app-text-mid">
            적립{" "}
            <span className="tabular font-semibold text-app-text-highest">
              {periodSaved}
            </span>
            {unit}
            <span className="mx-2 text-app-text-lowest">·</span>
            사용{" "}
            <span className="tabular font-semibold text-app-text-highest">
              {periodUsed}
            </span>
            {unit}
          </p>
        </div>

        <div className="rounded-app-md border border-app-line px-5 py-5">
          <BarChart
            caption={`일별 적립·사용 (${unit})`}
            data={daily.map((d) => ({
              label: d.label,
              values: { saved: d.saved, used: d.used },
            }))}
            series={TREND_SERIES}
            unit={unit}
          />
        </div>
      </section>

      {/* 시간대별 — 오늘 기준 */}
      <section>
        <h2 className="mb-4 text-sm font-semibold text-app-text-high">
          시간대별 (오늘)
        </h2>
        <div className="rounded-app-md border border-app-line px-5 py-5">
          <BarChart
            caption="시간대별 활동량 (건)"
            data={hourly.map((h) => ({
              label: h.label,
              values: { count: h.count },
            }))}
            series={HOUR_SERIES}
            maxTicks={6}
          />
        </div>
      </section>
    </div>
  );
}

function StatTile({
  label,
  value,
  unit,
}: {
  label: string;
  value: number;
  unit: string;
}) {
  return (
    <div className="rounded-app-md border border-app-line px-5 py-4">
      <dt className="text-xs text-app-text-mid">{label}</dt>
      <dd className="mt-1.5 flex items-baseline gap-1">
        <span className="tabular text-2xl font-bold">{value}</span>
        <span className="text-sm text-app-text-low">{unit}</span>
      </dd>
    </div>
  );
}
