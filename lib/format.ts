/**
 * 표시 규칙.
 *
 * 전화번호 마스킹은 RN 앱 `src/screens/supervisor/logDisplay.ts`와 **동일해야
 * 한다.** 같은 데이터를 두 화면이 다르게 보여주면 점주가 혼란스럽고,
 * 특히 마스킹은 개인정보 노출 범위라 임의로 느슨해지면 안 된다.
 */

/** 목록 행에 쓰는 뒤 4자리. 예) 01012345678 → '5678' */
export function phoneLast4(phone: string): string {
  return (phone || "").replace(/\D/g, "").slice(-4);
}

/** 상세용 마스킹 표기. 예) 01012345678 → '010 **** 5678' */
export function maskPhone(phone: string): string {
  const digits = (phone || "").replace(/\D/g, "");
  if (digits.length < 7) return digits;
  return `${digits.slice(0, 3)} **** ${digits.slice(-4)}`;
}

export type LogActionStyle = {
  label: string;
  /** 배지에 적용할 Tailwind 클래스 */
  className: string;
};

/**
 * 적립/사용 배지 스타일. 앱과 같은 색 체계(적립=주황, 사용=블루)를 따른다.
 */
export function logActionStyle(action: string): LogActionStyle {
  return action === "stamp_saved"
    ? { label: "적립", className: "bg-app-earn-bg text-app-earn-fg" }
    : { label: "사용", className: "bg-app-use-bg text-app-use-fg" };
}

const TIME_FORMAT = new Intl.DateTimeFormat("ko-KR", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "Asia/Seoul",
});

const DATE_LABEL_FORMAT = new Intl.DateTimeFormat("ko-KR", {
  month: "long",
  day: "numeric",
  weekday: "short",
  timeZone: "Asia/Seoul",
});

/** 로그 행의 시각. 예) '14:32' */
export function formatTime(date: Date): string {
  return TIME_FORMAT.format(date);
}

/** 날짜 헤더. 예) '8월 8일 (금)' */
export function formatDateLabel(date: Date): string {
  return DATE_LABEL_FORMAT.format(date);
}

/**
 * `YYYY-MM-DD` (한국 시간 기준).
 *
 * `toISOString()`을 쓰면 UTC로 변환되면서 한국 시간 오전 9시 이전이 전날로
 * 밀린다. 매장 영업일 기준과 어긋나므로 로컬 기준으로 만든다.
 */
export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** `YYYY-MM-DD` → 로컬 자정 Date */
export function fromDateKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** 날짜를 일 단위로 이동한 새 키 */
export function shiftDateKey(key: string, days: number): string {
  const date = fromDateKey(key);
  date.setDate(date.getDate() + days);
  return toDateKey(date);
}

export function isToday(key: string): boolean {
  return key === toDateKey(new Date());
}
