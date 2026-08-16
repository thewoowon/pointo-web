import type { Metadata } from "next";

import { CategoryNav } from "@/components/blog/category-nav";
import { PostCard } from "@/components/blog/post-card";
import { JsonLd } from "@/components/json-ld";
import { allPosts, readSource } from "@/lib/blog";
import {
  breadcrumbSchema,
  graph,
  organizationSchema,
  websiteSchema,
} from "@/lib/seo/schema";
import { absoluteUrl } from "@/lib/site";

const TITLE = "콘텐츠";
const DESCRIPTION =
  "적립을 어떻게 굴릴지, 우리가 왜 이렇게 만들었는지. 매장을 운영하며 실제로 부딪히는 문제와 그에 대한 답을 씁니다.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: absoluteUrl("/blog") },
  openGraph: {
    type: "website",
    url: absoluteUrl("/blog"),
    title: `${TITLE} · 포인토`,
    description: DESCRIPTION,
  },
};

export default function BlogIndex() {
  const posts = allPosts();

  return (
    <main className="flex-1">
      <JsonLd
        data={graph(
          organizationSchema(),
          websiteSchema(),
          breadcrumbSchema([
            { name: "홈", path: "/" },
            { name: TITLE, path: "/blog" },
          ]),
        )}
      />

      <div className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
        <header className="max-w-2xl">
          <h1 className="text-[30px] font-bold leading-tight sm:text-[40px]">
            매장을 만드는 이야기
          </h1>
          <p className="mt-5 text-[17px] leading-relaxed text-muted">
            {DESCRIPTION}
          </p>
        </header>

        <CategoryNav active={null} />

        {posts.length === 0 ? (
          <p className="mt-16 text-muted">아직 발행한 글이 없습니다.</p>
        ) : (
          <div className="mt-12 grid gap-5 sm:grid-cols-2">
            {posts.map(({ meta }, i) => (
              <PostCard
                key={meta.slug}
                meta={meta}
                minutes={readSource(meta.slug).minutes}
                // 첫 글만 가로로 넓게. 목록에 무게 중심을 하나 만들어 준다.
                featured={i === 0}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
