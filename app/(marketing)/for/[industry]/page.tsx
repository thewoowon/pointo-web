import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { JsonLd } from "@/components/json-ld";
import { AppStoreButton, ContactButton } from "@/components/marketing/cta";
import { findIndustry, industries, type Industry } from "@/content/industries";
import { allPosts, readSource } from "@/lib/blog";
import { PostCard } from "@/components/blog/post-card";
import {
  breadcrumbSchema,
  faqSchema,
  graph,
  organizationSchema,
  softwareApplicationSchema,
  websiteSchema,
} from "@/lib/seo/schema";
import { absoluteUrl } from "@/lib/site";

/**
 * 업종별 랜딩 — `/for/cafe`, `/for/bowling`, ...
 *
 * 블로그 글이 아니라 랜딩의 변형이다. "볼링장 적립"으로 검색해 들어온 사람은
 * 읽을거리가 아니라 **자기 업종에 맞는지**를 확인하러 온다. 그래서 도입부를
 * 짧게 끊고 CTA를 위쪽에 둔다.
 */

type Params = { params: Promise<{ industry: string }> };

export function generateStaticParams() {
  return industries.map((i) => ({ industry: i.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { industry: slug } = await params;
  const industry = findIndustry(slug);
  if (!industry) return {};

  const url = absoluteUrl(`/for/${industry.slug}`);
  return {
    title: industry.title,
    description: industry.description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      title: `${industry.title} · 포인토`,
      description: industry.description,
    },
  };
}

export default async function IndustryPage({ params }: Params) {
  const { industry: slug } = await params;
  const industry = findIndustry(slug);
  if (!industry) notFound();

  return (
    <main className="flex-1">
      <JsonLd
        data={graph(
          organizationSchema(),
          websiteSchema(),
          softwareApplicationSchema(),
          faqSchema(industry.faq),
          breadcrumbSchema([
            { name: "홈", path: "/" },
            { name: industry.label, path: `/for/${industry.slug}` },
          ]),
        )}
      />

      <Hero industry={industry} />
      <PainAndGain industry={industry} />
      <Recommendation industry={industry} />
      <Faq industry={industry} />
      <OtherIndustries current={industry.slug} />
      <ReadNext />
    </main>
  );
}

/* ──────────────────────────────────────────────────────────────────────── */

function Hero({ industry }: { industry: Industry }) {
  return (
    <section className="bg-primary text-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-6 pt-14 sm:pt-20 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12">
        <div className="lg:pb-20">
          <p className="text-[13px] font-semibold tracking-wide text-white/70 sm:text-sm">
            {industry.label}을 위한 적립
          </p>
          <h1 className="mt-4 text-[2rem] font-bold leading-[1.25] sm:text-[2.75rem] sm:leading-[1.2]">
            {industry.headline}
          </h1>

          {/*
           * 한 줄 답을 히어로에 그대로 둔다. 블로그 글의 '한 줄 답' 블록과
           * 같은 역할이다 — 검색·AI가 인용할 문장을 페이지 맨 위에 놓는다.
           */}
          <p className="mt-6 max-w-xl text-[16.5px] leading-[1.8] text-white/85">
            {industry.answer}
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <AppStoreButton tone="on-brand" />
            <ContactButton tone="on-brand" />
          </div>

          {industry.proof && (
            <p className="mt-8 border-t border-white/20 pt-6 text-[14px] leading-relaxed text-white/70">
              {industry.proof.line}
              <br />
              <span className="tabular text-white/50">
                {industry.proof.measuredAt} 실측
              </span>
            </p>
          )}
        </div>

        <div className="flex items-end justify-center lg:justify-end">
          <Image
            src="/screenshot/phone-stamp.webp"
            alt="포인토 고객 화면 — 모인 스탬프와 사용 가능한 쿠폰이 보인다"
            width={900}
            height={1487}
            priority
            sizes="(max-width: 1024px) 260px, 340px"
            className="w-[250px] max-w-full sm:w-[300px] lg:w-[340px]"
          />
        </div>
      </div>
    </section>
  );
}

function PainAndGain({ industry }: { industry: Industry }) {
  return (
    <section className="py-20 sm:py-24">
      <div className="mx-auto max-w-5xl px-6">
        <h2 className="max-w-xl text-[26px] font-bold leading-snug sm:text-[32px]">
          {industry.label}에서 실제로 벌어지는 일
        </h2>

        <div className="mt-10 grid gap-4 lg:grid-cols-2 lg:gap-6">
          <div className="rounded-app-xl bg-surface-alt p-7 sm:p-9">
            <p className="text-sm font-semibold text-muted">지금까지</p>
            <ul className="mt-5 space-y-4">
              {industry.pains.map((line) => (
                <li key={line} className="flex gap-3 text-muted">
                  <span
                    aria-hidden="true"
                    className="mt-2.5 h-px w-4 shrink-0 bg-app-line-strong"
                  />
                  <span className="text-[15px] leading-relaxed sm:text-base">
                    {line}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-app-xl border border-primary/15 bg-app-brand-subtle p-7 shadow-app-sm sm:p-9">
            <p className="text-sm font-semibold text-primary">포인토를 쓰면</p>
            <ul className="mt-5 space-y-4">
              {industry.gains.map((line) => (
                <li key={line} className="flex gap-3">
                  <Check />
                  <span className="text-[15px] leading-relaxed text-app-text-high sm:text-base">
                    {line}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function Recommendation({ industry }: { industry: Industry }) {
  return (
    <section className="bg-surface-alt">
      <div className="mx-auto max-w-5xl px-6 py-20 sm:py-24">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <div>
            <p className="text-sm font-semibold text-primary">권장 설정</p>
            <h2 className="mt-3 text-[26px] font-bold leading-snug sm:text-[32px]">
              {industry.label}은 {industry.recommend.mode}가 맞습니다
            </h2>
            <p className="mt-5 text-[15.5px] leading-[1.8] text-muted">
              {industry.recommend.reason}
            </p>
            <p className="mt-6 text-[15.5px] leading-[1.8] text-app-text-high">
              세는 단위는 <strong className="font-semibold">{industry.unit}</strong>
              입니다. 앱은 그게 무엇인지 몰라도 됩니다 — 무엇을 한 개로 볼지는
              매장이 정합니다.
            </p>
            <Link
              href="/blog/stamp-or-point"
              className="mt-6 inline-block text-[15px] font-medium text-primary underline decoration-primary/30 underline-offset-[3px] hover:decoration-primary"
            >
              스탬프와 포인트, 어떻게 고르는지 자세히 보기 →
            </Link>
          </div>

          <Image
            src="/screenshot/tablet-logs.webp"
            alt="태블릿 적립내역 화면 — 날짜별 적립·사용 목록과 오른쪽 상세 패널"
            width={1800}
            height={1064}
            sizes="(max-width: 1024px) 100vw, 620px"
            className="w-full rounded-app-lg"
          />
        </div>
      </div>
    </section>
  );
}

function Faq({ industry }: { industry: Industry }) {
  return (
    <section className="py-20 sm:py-24">
      <div className="mx-auto max-w-3xl px-6">
        <h2 className="text-[26px] font-bold leading-snug sm:text-[32px]">
          {industry.label} 사장님들이 자주 묻는 것
        </h2>
        <div className="mt-8 space-y-3">
          {industry.faq.map(({ q, a }) => (
            <details
              key={q}
              className="group rounded-app-lg border border-border bg-surface"
            >
              <summary className="flex cursor-pointer items-center justify-between gap-4 p-6 text-[16px] font-medium">
                {q}
                <span
                  aria-hidden="true"
                  className="shrink-0 text-xl text-muted transition-transform group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="px-6 pb-6 text-[15.5px] leading-[1.8] text-muted">
                {a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function OtherIndustries({ current }: { current: string }) {
  const others = industries.filter((i) => i.slug !== current);
  if (others.length === 0) return null;

  return (
    <section className="border-t border-border">
      <div className="mx-auto max-w-5xl px-6 py-14">
        <h2 className="text-[15px] font-semibold text-muted">다른 업종 보기</h2>
        <ul className="mt-4 flex flex-wrap gap-2">
          {others.map((i) => (
            <li key={i.slug}>
              <Link
                href={`/for/${i.slug}`}
                className="inline-block rounded-full bg-surface-alt px-4 py-2 text-sm font-medium text-muted transition-colors hover:text-foreground"
              >
                {i.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** 업종 페이지에서 콘텐츠로 넘기는 다리. 최신 글 두 편이면 충분하다. */
function ReadNext() {
  const posts = allPosts().slice(0, 2);
  if (posts.length === 0) return null;

  return (
    <section className="bg-surface-alt">
      <div className="mx-auto max-w-5xl px-6 py-16">
        <h2 className="text-[20px] font-bold">먼저 읽어 볼 만한 글</h2>
        <div className="mt-7 grid gap-5 sm:grid-cols-2">
          {posts.map(({ meta }) => (
            <PostCard
              key={meta.slug}
              meta={meta}
              minutes={readSource(meta.slug).minutes}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function Check() {
  return (
    <svg
      width="18"
      height="18"
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
