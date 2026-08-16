import {
  APP_STORE_URL,
  CONTACT_EMAIL,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
  absoluteUrl,
} from "@/lib/site";
import type { PostMeta } from "@/lib/blog/types";

/**
 * 구조화 데이터(JSON-LD) 조립.
 *
 * ── 왜 이걸 따로 챙기는가 ────────────────────────────────────────────────
 * 검색은 이제 "링크 열 개"만 돌려주지 않는다. 구글의 AI 요약, ChatGPT,
 * Perplexity 같은 답변형 검색이 실제 유입의 상당 부분을 가져간다. 이쪽은
 * 페이지를 사람처럼 읽는 게 아니라 **기계가 읽을 수 있게 표시된 부분**을 먼저
 * 본다. FAQ를 아무리 잘 써 놔도 `<details>` 태그뿐이면 "이건 질문과 답이다"라는
 * 사실이 어디에도 안 적혀 있는 셈이다.
 *
 * ── 한 가지 원칙 ─────────────────────────────────────────────────────────
 * **스키마에 적는 내용은 페이지에 눈으로 보여야 한다.** 본문에 없는 답을 스키마에만
 * 넣는 것은 클로킹으로 취급돼 구조화 데이터 전체가 무시될 수 있다. 그래서 여기
 * 들어가는 값은 전부 화면에 렌더되는 것과 같은 출처를 쓴다.
 */

const ORG_ID = `${SITE_URL}/#organization`;
const SITE_ID = `${SITE_URL}/#website`;

/** 발행자 — 모든 Article이 이걸 참조한다. */
export function organizationSchema() {
  return {
    "@type": "Organization",
    "@id": ORG_ID,
    name: SITE_NAME,
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      url: absoluteUrl("/android-chrome-512x512.png"),
      width: 512,
      height: 512,
    },
    description: SITE_DESCRIPTION,
    email: CONTACT_EMAIL,
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: CONTACT_EMAIL,
      availableLanguage: ["ko"],
    },
  };
}

export function websiteSchema() {
  return {
    "@type": "WebSite",
    "@id": SITE_ID,
    url: SITE_URL,
    name: SITE_NAME,
    inLanguage: "ko-KR",
    publisher: { "@id": ORG_ID },
  };
}

/**
 * 제품 자체.
 *
 * `offers`에 가격을 적지 않았다. 요금이 확정되지 않은 상태에서 0원이라고 적으면
 * 검색 결과에 "무료"로 노출되고, 나중에 유료화할 때 그 표시를 되돌릴 방법이 없다.
 * 값을 지어내는 것보다 필드를 비우는 편이 낫다.
 */
export function softwareApplicationSchema() {
  return {
    "@type": "SoftwareApplication",
    name: SITE_NAME,
    applicationCategory: "BusinessApplication",
    operatingSystem: "iOS",
    url: SITE_URL,
    installUrl: APP_STORE_URL,
    description: SITE_DESCRIPTION,
    inLanguage: "ko-KR",
    publisher: { "@id": ORG_ID },
  };
}

/** 빵부스러기 — 검색 결과에 경로가 보이고, 사이트 구조를 알려준다. */
export function breadcrumbSchema(trail: { name: string; path: string }[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: trail.map((step, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: step.name,
      item: absoluteUrl(step.path),
    })),
  };
}

export function faqSchema(faq: { q: string; a: string }[]) {
  return {
    "@type": "FAQPage",
    mainEntity: faq.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };
}

export function howToSchema(howTo: NonNullable<PostMeta["howTo"]>) {
  return {
    "@type": "HowTo",
    name: howTo.name,
    step: howTo.steps.map((step, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: step.name,
      text: step.text,
    })),
  };
}

/**
 * 글 한 편.
 *
 * `@graph`로 여러 스키마를 한 스크립트에 묶어 내보낸다. Article, FAQPage,
 * HowTo, BreadcrumbList를 각각 다른 `<script>`로 흩어 놓으면 크롤러가 이것들이
 * **같은 페이지에 대한 설명**이라는 걸 연결하지 못한다.
 */
export function articleGraph(meta: PostMeta) {
  const url = absoluteUrl(`/blog/${meta.slug}`);

  const article: Record<string, unknown> = {
    "@type": "Article",
    "@id": `${url}#article`,
    headline: meta.title,
    description: meta.description,
    /*
     * AEO의 알맹이. 이 글이 답하는 질문과 그 답을 명시적으로 적는다. 답변형
     * 검색은 본문 전체를 읽고 요약하기보다, 이미 요약된 답이 있으면 그걸 쓴다.
     * 값은 화면 맨 위 '한 줄 답' 블록에 그대로 렌더되는 것과 같다.
     */
    abstract: meta.answer,
    inLanguage: "ko-KR",
    datePublished: meta.publishedAt,
    dateModified: meta.updatedAt ?? meta.publishedAt,
    author: { "@id": ORG_ID },
    publisher: { "@id": ORG_ID },
    isPartOf: { "@id": SITE_ID },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    url,
  };

  if (meta.cover) {
    article.image = absoluteUrl(`/screenshot/${meta.cover}.webp`);
  }
  if (meta.tags?.length) {
    article.keywords = meta.tags.join(", ");
  }

  const graph: Record<string, unknown>[] = [
    organizationSchema(),
    websiteSchema(),
    article,
    breadcrumbSchema([
      { name: "홈", path: "/" },
      { name: "콘텐츠", path: "/blog" },
      { name: meta.title, path: `/blog/${meta.slug}` },
    ]),
  ];

  if (meta.faq?.length) graph.push(faqSchema(meta.faq));
  if (meta.howTo) graph.push(howToSchema(meta.howTo));

  return { "@context": "https://schema.org", "@graph": graph };
}

/** 여러 스키마를 하나의 그래프로 묶는다. */
export function graph(...nodes: Record<string, unknown>[]) {
  return { "@context": "https://schema.org", "@graph": nodes };
}
