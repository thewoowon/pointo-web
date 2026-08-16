import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PostCard, formatDate } from "@/components/blog/post-card";
import { JsonLd } from "@/components/json-ld";
import { allPosts, findPost, readSource, relatedPosts } from "@/lib/blog";
import { CATEGORIES } from "@/lib/blog/types";
import { articleGraph } from "@/lib/seo/schema";
import { absoluteUrl } from "@/lib/site";

type Params = { params: Promise<{ slug: string }> };

/** 모든 글을 빌드 타임에 만든다. 콘텐츠는 요청마다 달라질 이유가 없다. */
export function generateStaticParams() {
  return allPosts().map(({ meta }) => ({ slug: meta.slug }));
}

/** 목록에 없는 slug는 404. 임의 문자열로 페이지가 생기지 않게 한다. */
export const dynamicParams = false;

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const post = findPost(slug);
  if (!post) return {};

  const { meta } = post;
  const url = absoluteUrl(`/blog/${meta.slug}`);
  const image = meta.cover
    ? absoluteUrl(`/screenshot/${meta.cover}.webp`)
    : undefined;

  return {
    title: meta.title,
    description: meta.description,
    keywords: meta.tags,
    // canonical이 없으면 쿼리스트링이 붙은 주소가 별도 페이지로 색인된다.
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title: meta.title,
      description: meta.description,
      publishedTime: meta.publishedAt,
      modifiedTime: meta.updatedAt ?? meta.publishedAt,
      images: image ? [image] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: meta.title,
      description: meta.description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function PostPage({ params }: Params) {
  const { slug } = await params;
  const post = findPost(slug);
  if (!post) notFound();

  const { meta, Body } = post;
  const { headings, minutes } = readSource(slug);
  const category = CATEGORIES[meta.category];
  const related = relatedPosts(slug);

  return (
    <main className="flex-1">
      <JsonLd data={articleGraph(meta)} />

      <article className="mx-auto max-w-3xl px-6 py-14 sm:py-20">
        {/* 빵부스러기 — 구조화 데이터와 짝을 맞춰 화면에도 둔다. */}
        <nav aria-label="현재 위치" className="text-[13px] text-app-text-low">
          <Link href="/blog" className="hover:text-foreground">
            콘텐츠
          </Link>
          <span aria-hidden="true" className="mx-1.5">
            /
          </span>
          <Link
            href={`/blog/category/${meta.category}`}
            className="font-medium text-primary hover:underline"
          >
            {category.label}
          </Link>
        </nav>

        <header className="mt-5">
          <h1 className="text-[30px] font-bold leading-[1.3] sm:text-[40px]">
            {meta.title}
          </h1>

          <div className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[14px] text-app-text-low">
            <time dateTime={meta.publishedAt} className="tabular">
              {formatDate(meta.publishedAt)}
            </time>
            {meta.updatedAt && (
              <>
                <span aria-hidden="true">·</span>
                <span className="tabular">
                  {formatDate(meta.updatedAt)} 수정
                </span>
              </>
            )}
            <span aria-hidden="true">·</span>
            <span className="tabular">{minutes}분 분량</span>
          </div>
        </header>

        <AnswerBlock answer={meta.answer} />

        {headings.length >= 3 && <TableOfContents headings={headings} />}

        <div className="mt-12">
          <Body />
        </div>

        {meta.faq && meta.faq.length > 0 && <Faq faq={meta.faq} />}

        {meta.tags && meta.tags.length > 0 && (
          <ul className="mt-12 flex flex-wrap gap-2">
            {meta.tags.map((tag) => (
              <li
                key={tag}
                className="rounded-full bg-surface-alt px-3 py-1.5 text-[13px] text-muted"
              >
                {tag}
              </li>
            ))}
          </ul>
        )}
      </article>

      {related.length > 0 && (
        <section className="border-t border-border bg-surface-alt">
          <div className="mx-auto max-w-5xl px-6 py-16">
            <h2 className="text-[20px] font-bold">이어서 읽을 만한 글</h2>
            <div className="mt-7 grid gap-5 sm:grid-cols-2">
              {related.map(({ meta: m }) => (
                <PostCard
                  key={m.slug}
                  meta={m}
                  minutes={readSource(m.slug).minutes}
                />
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}

/* ────────────────────────────────────────────────────────────────────────
   한 줄 답 — 이 사이트의 AEO에서 가장 중요한 블록
   ──────────────────────────────────────────────────────────────────────── */

/*
 * 제목이 던진 질문에 두세 문장으로 먼저 답한다. 본문보다 위에 둔다.
 *
 * 글쓰기 상식과는 반대다. 도입부로 흥미를 끌고 결론을 뒤에 두는 게 보통이지만,
 * 검색으로 들어온 사람과 AI는 둘 다 결론부터 원한다. 답을 위에 놓는다고 아래를
 * 안 읽는 게 아니라, 답이 위에 있어야 **아래를 읽을지 판단**할 수 있다.
 *
 * 같은 문장이 JSON-LD의 `abstract`에도 들어간다(lib/seo/schema.ts). 스키마에만
 * 있고 화면에 없는 내용은 클로킹으로 취급되므로 반드시 둘 다 있어야 한다.
 */
function AnswerBlock({ answer }: { answer: string }) {
  return (
    <div className="mt-10 rounded-app-xl border-l-[3px] border-primary bg-app-brand-subtle px-7 py-6 sm:px-8">
      <p className="text-sm font-semibold text-primary">한 줄 답</p>
      <p className="mt-2.5 text-[16.5px] leading-[1.8] text-app-text-high">
        {answer}
      </p>
    </div>
  );
}

function TableOfContents({
  headings,
}: {
  headings: { level: 2 | 3; text: string; id: string }[];
}) {
  return (
    <nav
      aria-label="목차"
      className="mt-8 rounded-app-lg border border-border px-7 py-6"
    >
      <p className="text-sm font-semibold text-muted">목차</p>
      <ol className="mt-3 space-y-2">
        {headings.map((h) => (
          <li key={h.id} className={h.level === 3 ? "pl-4" : undefined}>
            <a
              href={`#${h.id}`}
              className="text-[15px] leading-relaxed text-app-text-high hover:text-primary hover:underline"
            >
              {h.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

/*
 * FAQ는 본문 아래에 실제로 렌더한다. 스키마만 넣고 화면에 없으면 구조화 데이터가
 * 통째로 무시될 수 있다. `<details>`로 접어 두되 답변 텍스트는 항상 DOM에 있다 —
 * 크롤러는 접힌 내용도 읽는다.
 */
function Faq({ faq }: { faq: { q: string; a: string }[] }) {
  return (
    <section className="mt-16 border-t border-border pt-12">
      <h2 className="text-[22px] font-bold sm:text-[26px]">자주 묻는 질문</h2>
      <div className="mt-6 space-y-3">
        {faq.map(({ q, a }) => (
          <details
            key={q}
            className="group rounded-app-lg border border-border bg-surface"
          >
            <summary className="flex cursor-pointer items-center justify-between gap-4 p-5 text-[16px] font-medium">
              {q}
              <span
                aria-hidden="true"
                className="shrink-0 text-xl text-muted transition-transform group-open:rotate-45"
              >
                +
              </span>
            </summary>
            <p className="px-5 pb-5 text-[15.5px] leading-[1.8] text-muted">
              {a}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
