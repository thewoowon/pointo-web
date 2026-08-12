import { allConfirmed, testimonials } from "@/content/testimonials";

/**
 * 도입 매장 후기 섹션.
 *
 * 제목이 두 갈래인 이유는 content/testimonials.ts의 긴 주석에 적어 뒀다.
 * 요약하면 — 사장님 확인을 받기 전에는 "후기"라고 부르지 않는다.
 */

export function Testimonials() {
  if (testimonials.length === 0) return null;

  const confirmed = allConfirmed();

  return (
    <section id="reviews" className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-xl">
          <p className="text-sm font-semibold text-primary">
            {confirmed ? "실제 사장님 후기" : "도입 매장 이야기"}
          </p>
          <h2 className="mt-3 text-[26px] font-bold leading-snug sm:text-[34px]">
            먼저 쓰고 계신 사장님들 이야기
          </h2>
        </div>

        <div className="mt-10 grid gap-4 sm:mt-12 lg:grid-cols-2 lg:gap-6">
          {testimonials.map((t) => (
            <figure
              key={t.store + t.area}
              className="flex flex-col rounded-app-xl border border-border bg-surface p-7 shadow-app-sm sm:p-9"
            >
              <Quote />
              <blockquote className="mt-5 flex-1 text-[17px] leading-relaxed text-app-text-high sm:text-lg">
                {t.quote}
              </blockquote>

              <figcaption className="mt-7 flex items-end justify-between gap-4 border-t border-border pt-6">
                <div>
                  <p className="font-semibold">
                    {t.area} · {t.store}
                  </p>
                  <p className="mt-1 text-sm text-muted">
                    {t.category} 사장님
                  </p>
                </div>
                {t.metric && (
                  <div className="text-right">
                    <p className="tabular text-xl font-bold text-primary">
                      {t.metric.value}
                    </p>
                    <p className="mt-0.5 text-[13px] text-muted">
                      {t.metric.label}
                    </p>
                  </div>
                )}
              </figcaption>
            </figure>
          ))}
        </div>

        <p className="mt-6 text-[13px] text-app-text-low">
          매장 이름은 사장님 요청에 따라 익명으로 표기했습니다.
        </p>
      </div>
    </section>
  );
}

function Quote() {
  return (
    <svg
      width="28"
      height="22"
      viewBox="0 0 28 22"
      fill="currentColor"
      aria-hidden="true"
      className="text-app-brand-subtle"
    >
      <path d="M0 22V12.6C0 8.9 1 5.9 3 3.6 5 1.2 7.9 0 11.6 0v4.7c-3.6.6-5.4 2.6-5.4 6h5.4V22H0zm16.4 0V12.6c0-3.7 1-6.7 3-9C21.4 1.2 24.3 0 28 0v4.7c-3.6.6-5.4 2.6-5.4 6H28V22H16.4z" />
    </svg>
  );
}
