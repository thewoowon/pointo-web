import type { Metadata } from "next";
import Link from "next/link";

import { JsonLd } from "@/components/json-ld";
import { faq } from "@/content/faq";
import { industries } from "@/content/industries";
import { allPosts } from "@/lib/blog";
import {
  breadcrumbSchema,
  faqSchema,
  graph,
  organizationSchema,
  websiteSchema,
} from "@/lib/seo/schema";
import { CONTACT_EMAIL, absoluteUrl } from "@/lib/site";

const DESCRIPTION =
  "포인토 이용 중 궁금한 점과 자주 묻는 질문. 카페가 아니어도 되는지, 고객이 앱을 깔아야 하는지, 개인정보는 어디까지 받는지 정리했습니다.";

export const metadata: Metadata = {
  title: "고객지원",
  description: DESCRIPTION,
  alternates: { canonical: absoluteUrl("/support") },
  openGraph: {
    type: "website",
    url: absoluteUrl("/support"),
    title: "고객지원 · 포인토",
    description: DESCRIPTION,
  },
};

export default function SupportPage() {
  const posts = allPosts().slice(0, 4);

  return (
    <main className="flex-1 py-16 sm:py-24">
      {/*
       * 이 페이지의 FAQ는 원래도 잘 쓰여 있었지만 `<details>` 마크업뿐이라
       * 검색엔진과 AI 입장에서는 "질문과 답"이라는 사실이 어디에도 적혀 있지
       * 않았다. 같은 배열(content/faq.ts)로 화면과 스키마를 동시에 먹인다.
       */}
      <JsonLd
        data={graph(
          organizationSchema(),
          websiteSchema(),
          faqSchema(faq),
          breadcrumbSchema([
            { name: "홈", path: "/" },
            { name: "고객지원", path: "/support" },
          ]),
        )}
      />

      <div className="mx-auto max-w-3xl px-6">
        <h1 className="mb-4 text-[26px] font-bold leading-snug sm:text-[34px]">
          고객지원
        </h1>
        <p className="mb-16 text-[17px] leading-relaxed text-muted">
          포인토 이용 중 궁금한 점이 있으시면 언제든 문의해주세요.
        </p>

        {/* Contact */}
        <section className="mb-16">
          <h2 className="mb-6 text-xl font-semibold">문의하기</h2>
          <div className="rounded-2xl border border-border bg-surface p-8">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-lg">
                @
              </div>
              <div>
                <p className="mb-1 font-medium">이메일 문의</p>
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="text-primary hover:underline"
                >
                  {CONTACT_EMAIL}
                </a>
                <p className="mt-1 text-sm text-muted">
                  영업일 기준 24시간 이내 답변드립니다.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section>
          <h2 className="mb-6 text-xl font-semibold">자주 묻는 질문</h2>
          <div className="space-y-4">
            {faq.map(({ q, a }) => (
              <FaqItem key={q} question={q} answer={a} />
            ))}
          </div>
        </section>

        {/* 업종별 안내 — "우리 업종도 되나요"가 가장 많은 질문이다. */}
        <section className="mt-16">
          <h2 className="mb-6 text-xl font-semibold">업종별 안내</h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {industries.map((industry) => (
              <li key={industry.slug}>
                <Link
                  href={`/for/${industry.slug}`}
                  className="block rounded-2xl border border-border p-5 transition-colors hover:border-primary/30 hover:bg-app-brand-subtle"
                >
                  <p className="font-medium">{industry.label}</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted">
                    {industry.recommend.mode} 적립 · {industry.unit} 단위
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* 더 긴 답이 필요한 질문은 글로 넘긴다. */}
        {posts.length > 0 && (
          <section className="mt-16">
            <h2 className="mb-6 text-xl font-semibold">더 자세한 안내</h2>
            <ul className="space-y-3">
              {posts.map(({ meta }) => (
                <li key={meta.slug}>
                  <Link
                    href={`/blog/${meta.slug}`}
                    className="group flex items-baseline gap-3"
                  >
                    <span className="font-medium group-hover:text-primary">
                      {meta.title}
                    </span>
                  </Link>
                  <p className="mt-1 text-sm leading-relaxed text-muted">
                    {meta.description}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </main>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  return (
    <details className="group rounded-2xl border border-border bg-surface">
      <summary className="flex cursor-pointer items-center justify-between p-6 font-medium">
        {question}
        <span className="ml-4 shrink-0 text-xl text-muted transition-transform group-open:rotate-45">
          +
        </span>
      </summary>
      <div className="px-6 pb-6 text-[15px] leading-7 text-muted">{answer}</div>
    </details>
  );
}
