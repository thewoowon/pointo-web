"use client";

/**
 * 막대 차트 (1~2 계열).
 *
 * 색은 계열의 **정체성**에 고정되어 있다 — 적립=주황, 사용=블루. 앱의 적립/사용
 * 배지와 같은 색이라 제품 전체에서 같은 의미를 가진다. 순서나 개수가 바뀌어도
 * 색을 돌려쓰지 않는다.
 *
 * 표시 규칙:
 *   - 막대 끝만 둥글게(4px), 바닥은 축에 붙인다
 *   - 인접 막대 사이에 2px 간격
 *   - 격자·축은 뒤로 물린다. 값은 hover 툴팁으로 본다
 *   - 값·라벨은 계열 색이 아니라 텍스트 토큰을 쓴다
 *   - 스크린리더용 표를 함께 제공한다 (시각 정보에만 의존하지 않도록)
 */

export type Series = { key: string; label: string; className: string };

export type BarDatum = {
  label: string;
  /** series key → 값 */
  values: Record<string, number>;
};

export function BarChart({
  data,
  series,
  caption,
  unit = "건",
  maxTicks = 12,
}: {
  data: BarDatum[];
  series: Series[];
  caption: string;
  unit?: string;
  /** x축 라벨을 최대 몇 개까지 표시할지 (30일이면 전부 쓰면 겹친다) */
  maxTicks?: number;
}) {
  const max = Math.max(
    1,
    ...data.flatMap((d) => series.map((s) => d.values[s.key] ?? 0)),
  );

  // 라벨이 겹치지 않도록 일정 간격만 노출한다.
  const tickEvery = Math.max(1, Math.ceil(data.length / maxTicks));

  return (
    <figure className="m-0">
      <figcaption className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <span className="text-sm font-semibold text-app-text-high">
          {caption}
        </span>
        {series.length > 1 ? (
          <span className="flex items-center gap-4">
            {series.map((s) => (
              <span key={s.key} className="flex items-center gap-1.5">
                <span
                  aria-hidden="true"
                  className={`h-2.5 w-2.5 rounded-app-xs ${s.className}`}
                />
                <span className="text-xs text-app-text-mid">{s.label}</span>
              </span>
            ))}
          </span>
        ) : null}
      </figcaption>

      <div className="flex h-48 items-end gap-[2px]" role="presentation">
        {data.map((datum, i) => (
          <div
            key={datum.label + i}
            className="group relative flex h-full flex-1 items-end justify-center gap-[2px]"
          >
            {series.map((s) => {
              const value = datum.values[s.key] ?? 0;
              return (
                <div
                  key={s.key}
                  // 값이 0이어도 1px 남겨 "칸이 존재한다"는 걸 보이게 한다.
                  style={{ height: `${Math.max((value / max) * 100, value > 0 ? 2 : 0.5)}%` }}
                  className={`w-full max-w-6 rounded-t-[4px] ${s.className} ${
                    value === 0 ? "opacity-25" : ""
                  }`}
                />
              );
            })}

            {/* hover 툴팁 */}
            <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-app-sm bg-app-text-highest px-2.5 py-1.5 text-xs text-white shadow-lg group-hover:block">
              <p className="font-semibold">{datum.label}</p>
              {series.map((s) => (
                <p key={s.key} className="tabular mt-0.5 opacity-90">
                  {s.label} {datum.values[s.key] ?? 0}
                  {unit}
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* x축 */}
      <div className="mt-2 flex gap-[2px] border-t border-app-line pt-2">
        {data.map((datum, i) => (
          <span
            key={datum.label + i}
            className="tabular flex-1 text-center text-[10px] text-app-text-low"
          >
            {i % tickEvery === 0 ? datum.label : " "}
          </span>
        ))}
      </div>

      {/* 스크린리더·표 보기용 */}
      <table className="sr-only">
        <caption>{caption}</caption>
        <thead>
          <tr>
            <th scope="col">구간</th>
            {series.map((s) => (
              <th key={s.key} scope="col">
                {s.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((datum, i) => (
            <tr key={datum.label + i}>
              <th scope="row">{datum.label}</th>
              {series.map((s) => (
                <td key={s.key}>
                  {datum.values[s.key] ?? 0}
                  {unit}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
