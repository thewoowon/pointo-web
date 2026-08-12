/**
 * 랜딩에서 반복되는 두 개의 행동 유도 버튼.
 *
 * 헤더·히어로·맨 아래 밴드에서 같은 버튼이 세 번 나온다. 마크업을 복사해두면
 * 어느 하나만 문구가 어긋나기 시작하므로 여기 한 곳에 둔다.
 *
 * `tone`은 버튼이 놓이는 **배경**을 말한다. 파란 섹션 위에서는 흰 버튼이,
 * 흰 섹션 위에서는 파란 버튼이 주 버튼이 된다.
 */

const APP_STORE_URL = "https://apps.apple.com/app/id6763893004";

export const CONTACT_MAIL =
  "mailto:thewoowon@gmail.com?subject=%ED%8F%AC%EC%9D%B8%ED%86%A0%20%EB%8F%84%EC%9E%85%20%EB%AC%B8%EC%9D%98";

type Tone = "on-brand" | "on-light";

const base =
  "inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-[15px] font-semibold transition-colors sm:px-7 sm:text-base";

function AppleMark({ size = 19 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  );
}

export function AppStoreButton({ tone = "on-light" }: { tone?: Tone }) {
  const skin =
    tone === "on-brand"
      ? "bg-white text-primary hover:bg-white/90"
      : "bg-primary text-white hover:bg-primary-dark";
  return (
    <a href={APP_STORE_URL} className={`${base} ${skin}`}>
      <AppleMark />
      App Store에서 받기
    </a>
  );
}

export function ContactButton({ tone = "on-light" }: { tone?: Tone }) {
  const skin =
    tone === "on-brand"
      ? "border border-white/35 text-white hover:bg-white/10"
      : "border border-border text-foreground hover:bg-surface-alt";
  return (
    <a href={CONTACT_MAIL} className={`${base} ${skin}`}>
      도입 문의하기
    </a>
  );
}
