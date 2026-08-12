/**
 * 통계 집계 — 순수 함수.
 *
 * Firestore 접근과 분리해 둔 이유: 집계 규칙(특히 스탬프/포인트 모드 차이)이
 * 조용히 틀리면 사장님이 잘못된 숫자를 믿게 된다. 입출력이 순수하면 값을
 * 넣어보며 검증할 수 있다.
 *
 * 앱 StatisticsScreen과 같은 규칙을 따른다:
 *   - 스탬프 모드: 건수를 센다
 *   - 포인트 모드: stamp 값을 합산한다
 */

import { toDateKey } from "./format";
import type { Log } from "./firestore/types";

export type Period = "today" | "7days" | "30days" | "month";

export const PERIOD_LABELS: Record<Period, string> = {
  today: "오늘",
  "7days": "7일",
  "30days": "30일",
  month: "이번 달",
};

export type DayStat = { key: string; label: string; saved: number; used: number };
export type HourStat = { label: string; count: number };

/** 앱과 동일한 시간대 구간 */
const HOUR_BLOCKS = [
  { label: "새벽", from: 0, to: 6 },
  { label: "아침", from: 6, to: 10 },
  { label: "점심", from: 10, to: 14 },
  { label: "오후", from: 14, to: 18 },
  { label: "저녁", from: 18, to: 22 },
  { label: "심야", from: 22, to: 24 },
] as const;

/** 기간 → 조회 범위 (YYYY-MM-DD) */
export function dateRangeOf(period: Period): { start: string; end: string } {
  const today = new Date();
  const end = toDateKey(today);

  if (period === "today") return { start: end, end };

  if (period === "month") {
    const first = new Date(today.getFullYear(), today.getMonth(), 1);
    return { start: toDateKey(first), end };
  }

  const days = period === "7days" ? 6 : 29;
  const start = new Date(today);
  start.setDate(start.getDate() - days);
  return { start: toDateKey(start), end };
}

/** 한 건이 집계에 기여하는 값 */
function weight(log: Log, isPointMode: boolean): number {
  return isPointMode ? Number(log.stamp) || 0 : 1;
}

/**
 * 지금 보고 있는 모드의 기록인지.
 *
 * 모드를 바꾼 매장은 `logs.stamp`에 스탬프 '개수'와 포인트 '금액'이 섞여
 * 있다. 둘을 합치면 단위 없는 숫자가 되므로 현재 모드의 로그만 센다.
 * `mode`가 없는 로그는 이 필드가 생기기 전 기록이고, 그때까진 어느 매장도
 * 모드를 바꾼 적이 없어서 현재 모드로 봐도 안전하다.
 */
function inMode(log: Log, isPointMode: boolean): boolean {
  const logMode = log.mode ?? (isPointMode ? "point" : "stamp");
  return logMode === (isPointMode ? "point" : "stamp");
}

function sum(logs: Log[], isPointMode: boolean): number {
  return logs
    .filter((log) => inMode(log, isPointMode))
    .reduce((total, log) => total + weight(log, isPointMode), 0);
}

/** 오늘 요약 — 적립 / 사용 / 순방문자 */
export function todaySummary(
  logs: Log[],
  isPointMode: boolean,
): { saved: number; used: number; visitors: number } {
  const today = toDateKey(new Date());
  const todayLogs = logs.filter((l) => toDateKey(l.timestamp) === today);

  return {
    saved: sum(
      todayLogs.filter((l) => l.action === "stamp_saved"),
      isPointMode,
    ),
    used: sum(
      todayLogs.filter((l) => l.action === "stamp_used"),
      isPointMode,
    ),
    // 같은 사람이 여러 번 찍어도 1명으로 센다
    visitors: new Set(todayLogs.map((l) => l.phone_number)).size,
  };
}

/** 기간 내 일별 추이 */
export function dailyStats(
  logs: Log[],
  period: Period,
  isPointMode: boolean,
): DayStat[] {
  const { start, end } = dateRangeOf(period);

  const byDay = new Map<string, Log[]>();
  for (const log of logs) {
    const key = toDateKey(log.timestamp);
    const bucket = byDay.get(key);
    if (bucket) bucket.push(log);
    else byDay.set(key, [log]);
  }

  // 로그가 없는 날도 0으로 채운다 — 빠뜨리면 추이가 실제보다 좋아 보인다.
  const stats: DayStat[] = [];
  const cursor = new Date(start.split("-").map(Number)[0], 0, 1);
  const [sy, sm, sd] = start.split("-").map(Number);
  cursor.setFullYear(sy, sm - 1, sd);

  const endDate = new Date();
  const [ey, em, ed] = end.split("-").map(Number);
  endDate.setFullYear(ey, em - 1, ed);
  endDate.setHours(0, 0, 0, 0);

  while (cursor <= endDate) {
    const key = toDateKey(cursor);
    const dayLogs = byDay.get(key) ?? [];
    stats.push({
      key,
      label: `${cursor.getMonth() + 1}/${cursor.getDate()}`,
      saved: sum(
        dayLogs.filter((l) => l.action === "stamp_saved"),
        isPointMode,
      ),
      used: sum(
        dayLogs.filter((l) => l.action === "stamp_used"),
        isPointMode,
      ),
    });
    cursor.setDate(cursor.getDate() + 1);
  }

  return stats;
}

/** 오늘의 시간대별 활동량 */
export function hourlyStats(logs: Log[]): HourStat[] {
  const today = toDateKey(new Date());
  const todayLogs = logs.filter((l) => toDateKey(l.timestamp) === today);

  return HOUR_BLOCKS.map((block) => ({
    label: block.label,
    count: todayLogs.filter((l) => {
      const hour = l.timestamp.getHours();
      return hour >= block.from && hour < block.to;
    }).length,
  }));
}
