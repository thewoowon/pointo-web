import type { MDXComponents } from "mdx/types";
import Link from "next/link";

import {
  Callout,
  Compare,
  InlineCta,
  Related,
  Screenshot,
  Steps,
} from "@/components/mdx";
import { slugifyHeading } from "@/lib/blog/headings";

/**
 * MDX 본문의 기본 태그 스타일.
 *
 * `@tailwindcss/typography`(prose)를 쓰지 않았다. prose는 자기만의 색·간격
 * 체계를 들고 오는데, 우리는 이미 `globals.css`에 앱에서 가져온 토큰이 있다.
 * 두 체계가 겹치면 "왜 본문만 회색이 다르지"를 계속 고치게 된다. 태그 수가
 * 스무 개 남짓이라 직접 잡는 편이 싸다.
 *
 * 읽기 폭은 65~75자가 한계다. 그래서 본문 컨테이너를 `max-w-[68ch]`로 두고,
 * 표나 이미지처럼 넓어야 하는 것만 그 밖으로 빼낸다(`components/mdx`).
 */

/*
 * 제목에 id를 달아 둔다. 두 가지가 여기에 걸려 있다.
 *   1. 목차(TOC)에서 앵커로 점프
 *   2. 검색·AI가 인용할 때 특정 문단으로 바로 링크(#:~: 없이도)
 * id 규칙은 lib/blog/headings.ts와 반드시 같아야 한다 — 목차는 MDX를 렌더하지
 * 않고 원문에서 제목을 뽑기 때문에, 규칙이 갈리면 앵커가 조용히 깨진다.
 */
function heading(level: 2 | 3 | 4) {
  const Tag = `h${level}` as const;
  const size =
    level === 2
      ? "mt-14 text-[22px] font-bold leading-snug sm:text-[26px]"
      : level === 3
        ? "mt-10 text-[18px] font-bold leading-snug sm:text-[20px]"
        : "mt-8 text-[16px] font-semibold leading-snug";

  return function Heading({ children }: { children?: React.ReactNode }) {
    const id = slugifyHeading(children);
    return (
      <Tag id={id} className={`${size} scroll-mt-24 first:mt-0`}>
        {/* 제목 자체를 링크로 감싸면 눌렀을 때 주소창에 앵커가 남는다.
            밑줄은 hover 전까지 감춰 본문 흐름을 방해하지 않는다. */}
        <a href={`#${id}`} className="group/anchor no-underline">
          {children}
          <span
            aria-hidden="true"
            className="ml-2 text-app-text-lowest opacity-0 transition-opacity group-hover/anchor:opacity-100"
          >
            #
          </span>
        </a>
      </Tag>
    );
  };
}

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    /*
     * 커스텀 컴포넌트를 전역 스코프에 넣는다. 글마다 import 줄을 다섯 개씩
     * 적게 하면, 결국 어떤 글은 빼먹은 채로 올라간다.
     */
    Callout,
    Compare,
    InlineCta,
    Related,
    Screenshot,
    Steps,

    h2: heading(2),
    h3: heading(3),
    h4: heading(4),

    p: ({ children }) => (
      <p className="mt-5 text-[16px] leading-[1.85] text-app-text-high sm:text-[17px]">
        {children}
      </p>
    ),

    strong: ({ children }) => (
      <strong className="font-semibold text-foreground">{children}</strong>
    ),

    a: ({ href = "", children }) => {
      // 내부 링크는 next/link로 — 프리페치와 클라이언트 전환을 살린다.
      const internal = href.startsWith("/") || href.startsWith("#");
      const className =
        "font-medium text-primary underline decoration-primary/30 underline-offset-[3px] transition-colors hover:decoration-primary";
      return internal ? (
        <Link href={href} className={className}>
          {children}
        </Link>
      ) : (
        <a
          href={href}
          className={className}
          target="_blank"
          rel="noopener noreferrer"
        >
          {children}
        </a>
      );
    },

    ul: ({ children }) => (
      <ul className="mt-5 space-y-2.5 pl-1">{children}</ul>
    ),
    ol: ({ children }) => (
      <ol className="tabular mt-5 list-decimal space-y-2.5 pl-5 marker:font-semibold marker:text-primary">
        {children}
      </ol>
    ),
    li: ({ children }) => (
      <li className="text-[16px] leading-[1.8] text-app-text-high sm:text-[17px]">
        {children}
      </li>
    ),

    blockquote: ({ children }) => (
      <blockquote className="mt-7 border-l-[3px] border-primary/40 pl-5 text-app-text-mid italic [&>p]:mt-0 [&>p+p]:mt-4">
        {children}
      </blockquote>
    ),

    hr: () => <hr className="my-12 border-border" />,

    /*
     * 표는 본문 폭(68ch)보다 넓어지기 쉽다. 폰에서 페이지 전체가 가로로
     * 밀리면 읽던 자리를 잃으므로, 표만 자기 안에서 스크롤하게 가둔다.
     */
    table: ({ children }) => (
      <div className="-mx-6 mt-8 overflow-x-auto px-6 sm:mx-0 sm:px-0">
        <table className="w-full min-w-[32rem] border-collapse text-left text-[15px]">
          {children}
        </table>
      </div>
    ),
    thead: ({ children }) => (
      <thead className="border-b border-app-line-strong">{children}</thead>
    ),
    th: ({ children }) => (
      <th className="px-3 py-3 font-semibold text-foreground first:pl-0 last:pr-0">
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td className="border-b border-border px-3 py-3 align-top leading-relaxed text-app-text-high first:pl-0 last:pr-0">
        {children}
      </td>
    ),

    code: ({ children }) => (
      <code className="rounded-app-xs bg-surface-alt px-1.5 py-0.5 text-[0.9em] text-app-text-high">
        {children}
      </code>
    ),
    pre: ({ children }) => (
      <pre className="-mx-6 mt-7 overflow-x-auto bg-[#0f172a] p-6 text-[13.5px] leading-relaxed text-slate-100 sm:mx-0 sm:rounded-app-lg">
        {children}
      </pre>
    ),

    ...components,
  };
}
