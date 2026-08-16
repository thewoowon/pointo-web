import Image from "next/image";
import Link from "next/link";

import { AppStoreButton, ContactButton } from "@/components/marketing/cta";

/**
 * MDX 본문 안에서 쓰는 컴포넌트들.
 *
 * `mdx-components.tsx`에서 전역으로 넣어 주므로 글마다 import할 필요가 없다.
 * 글 쓰는 사람이 신경 쓸 것을 하나라도 줄이는 게 낫다.
 *
 * 종류를 일부러 적게 뒀다. 본문 장치가 많아지면 글마다 다른 얼굴이 되고,
 * 그때부터는 "이 글은 왜 박스가 세 개지"를 고민하게 된다.
 */

/* ────────────────────────────────────────────────────────────────────────
   Callout — 본문 흐름에서 잠깐 떼어내 강조할 한 문단
   ──────────────────────────────────────────────────────────────────────── */

type CalloutTone = "info" | "warn";

export function Callout({
  tone = "info",
  title,
  children,
}: {
  tone?: CalloutTone;
  title?: string;
  children: React.ReactNode;
}) {
  const skin =
    tone === "warn"
      ? "border-app-earn-fg/20 bg-app-earn-bg/50"
      : "border-primary/15 bg-app-brand-subtle";
  const titleColor =
    tone === "warn" ? "text-app-earn-fg" : "text-primary";

  return (
    <aside
      className={`mt-8 rounded-app-lg border p-6 sm:p-7 ${skin} [&>p]:mt-3 [&>p:first-of-type]:mt-0 [&>p]:text-[15.5px] [&>p]:leading-[1.8] [&>ul]:mt-3`}
    >
      {title && (
        <p className={`mb-3 text-sm font-semibold ${titleColor}`}>{title}</p>
      )}
      {children}
    </aside>
  );
}

/* ────────────────────────────────────────────────────────────────────────
   Screenshot — 앱 화면. 랜딩과 같은 파일을 재사용한다
   ──────────────────────────────────────────────────────────────────────── */

/*
 * `public/screenshot/`의 이미지는 배경색이 우리 토큰과 같게 잘려 있다
 * (스탬프 화면=브랜드 블루, 나머지=container 회색). 그래서 흰 배경에 그냥 얹으면
 * 이미지 둘레에 네모난 회색 자국이 생긴다. 회색 판 위에 올려 자국을 감춘다.
 */
const SHOT_SIZE: Record<string, { w: number; h: number; wide?: boolean }> = {
  "phone-keypad": { w: 900, h: 1523 },
  "phone-logs": { w: 900, h: 1523 },
  "phone-points": { w: 900, h: 1484 },
  "phone-search": { w: 900, h: 1523 },
  "phone-stamp": { w: 900, h: 1487 },
  "tablet-keypad": { w: 1800, h: 1064, wide: true },
  "tablet-logs": { w: 1800, h: 1064, wide: true },
  "tablet-points": { w: 1800, h: 1064, wide: true },
  "tablet-search": { w: 1800, h: 1064, wide: true },
  "tablet-stamp": { w: 1800, h: 1064, wide: true },
  "tablet-stores": { w: 1800, h: 795, wide: true },
};

export function Screenshot({
  src,
  alt,
  caption,
}: {
  src: keyof typeof SHOT_SIZE | string;
  alt: string;
  caption?: string;
}) {
  const size = SHOT_SIZE[src];
  if (!size) {
    // 오타로 이미지가 조용히 사라지는 것보다 빌드에서 걸리는 편이 낫다.
    throw new Error(
      `<Screenshot src="${src}"> — public/screenshot에 없는 이름입니다.`,
    );
  }

  return (
    <figure className="mt-9">
      <div
        className={`flex justify-center overflow-hidden rounded-app-lg bg-surface-alt ${
          size.wide ? "" : "py-8"
        }`}
      >
        <Image
          src={`/screenshot/${src}.webp`}
          alt={alt}
          width={size.w}
          height={size.h}
          sizes={size.wide ? "(max-width: 768px) 100vw, 720px" : "260px"}
          className={size.wide ? "w-full" : "w-[240px] max-w-full"}
        />
      </div>
      {caption && (
        <figcaption className="mt-3 text-center text-[13.5px] leading-relaxed text-app-text-low">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

/* ────────────────────────────────────────────────────────────────────────
   Compare — "지금까지 / 포인토를 쓰면" 두 칸 대비 (랜딩과 같은 형식)
   ──────────────────────────────────────────────────────────────────────── */

export function Compare({
  beforeTitle = "지금까지",
  afterTitle = "이렇게 바뀝니다",
  before,
  after,
}: {
  beforeTitle?: string;
  afterTitle?: string;
  before: string[];
  after: string[];
}) {
  return (
    <div className="mt-9 grid gap-4 sm:grid-cols-2">
      <div className="rounded-app-lg bg-surface-alt p-6">
        <p className="text-sm font-semibold text-muted">{beforeTitle}</p>
        <ul className="mt-4 space-y-3">
          {before.map((line) => (
            <li key={line} className="flex gap-3 text-muted">
              <span
                aria-hidden="true"
                className="mt-2.5 h-px w-3.5 shrink-0 bg-app-line-strong"
              />
              <span className="text-[15px] leading-relaxed">{line}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="rounded-app-lg border border-primary/15 bg-app-brand-subtle p-6">
        <p className="text-sm font-semibold text-primary">{afterTitle}</p>
        <ul className="mt-4 space-y-3">
          {after.map((line) => (
            <li key={line} className="flex gap-3">
              <CheckMark />
              <span className="text-[15px] leading-relaxed text-app-text-high">
                {line}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function CheckMark() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
      className="mt-1 shrink-0 text-primary"
    >
      <path
        d="M4.5 10.5 8 14l7.5-8"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ────────────────────────────────────────────────────────────────────────
   Steps — 절차. meta.howTo와 짝을 맞춰 쓴다
   ──────────────────────────────────────────────────────────────────────── */

/*
 * 순서 있는 절차를 `<ol>` 대신 이걸로 쓰는 이유는 구조화 데이터 때문이다.
 * 글 메타의 `howTo.steps`와 여기 적힌 단계가 **같아야** HowTo 스키마가
 * 유효하다. 둘 중 하나만 고치면 검색 콘솔에서 경고가 뜬다.
 */
export function Steps({
  items,
}: {
  items: { title: string; body: string }[];
}) {
  return (
    <ol className="mt-9 space-y-7">
      {items.map((item, i) => (
        <li key={item.title} className="flex gap-5">
          <span
            aria-hidden="true"
            className="tabular mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-[15px] font-bold text-white"
          >
            {i + 1}
          </span>
          <div>
            <p className="text-[17px] font-semibold leading-snug">
              {item.title}
            </p>
            <p className="mt-2 text-[15.5px] leading-[1.8] text-app-text-high">
              {item.body}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}

/* ────────────────────────────────────────────────────────────────────────
   InlineCta — 글 중간에서 제품으로 넘어가는 자리
   ──────────────────────────────────────────────────────────────────────── */

export function InlineCta({
  title = "우리 매장에 맞는지 15분이면 압니다",
  body = "업종과 지금 적립 방식만 알려주시면, 설정까지 같이 잡아 드립니다.",
}: {
  title?: string;
  body?: string;
}) {
  return (
    <div className="mt-12 rounded-app-xl bg-primary px-7 py-9 text-white sm:px-9">
      <p className="text-[20px] font-bold leading-snug sm:text-[22px]">
        {title}
      </p>
      <p className="mt-3 text-[15px] leading-relaxed text-white/85">{body}</p>
      <div className="mt-7 flex flex-col gap-3 sm:flex-row">
        <AppStoreButton tone="on-brand" />
        <ContactButton tone="on-brand" />
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────
   Related — 글 안에서 다른 글로 넘기는 인라인 링크
   ──────────────────────────────────────────────────────────────────────── */

/*
 * 루트가 `<div>`인 것이 중요하다 — `<p>`로 두면 안 된다.
 *
 * MDX는 JSX 자식이 여러 줄에 걸치면 그 안을 **마크다운으로** 파싱한다. 즉
 *
 *     <Related href="...">
 *       스탬프로 할까, 포인트로 할까
 *     </Related>
 *
 * 의 자식은 문자열이 아니라 문단이고, `mdx-components.tsx`의 매핑을 타고
 * `<p>`로 렌더된다. 루트가 `<p>`면 `<p>` 안에 `<p>`가 들어가 하이드레이션이
 * 깨진다. 브라우저가 여는 `<p>`를 자동으로 닫아 버려서 서버 HTML과 클라이언트
 * 트리가 달라지기 때문이다.
 *
 * 같은 이유로 자식을 감싸는 컴포넌트는 전부 블록 요소를 루트로 둔다
 * (`Callout`은 `<aside>`, 여기는 `<div>`). 자식을 받는 컴포넌트를 새로
 * 만들 때도 같은 규칙을 지킬 것.
 *
 * `[&_p]`로 안쪽 문단의 기본 여백·크기를 되돌린다. 그러지 않으면 본문 문단
 * 스타일(mt-5, 17px)이 그대로 먹어서 상자 안이 헐거워진다.
 */
export function Related({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-8 rounded-app-md border border-border bg-surface-alt/60 px-5 py-4 text-[15px] leading-relaxed">
      <span className="mr-2 font-semibold text-primary">함께 읽기</span>
      <Link
        href={href}
        className="font-medium underline decoration-app-line-strong underline-offset-[3px] hover:decoration-foreground [&_p]:mt-0 [&_p]:inline [&_p]:text-[15px] [&_p]:leading-relaxed"
      >
        {children}
      </Link>
    </div>
  );
}
