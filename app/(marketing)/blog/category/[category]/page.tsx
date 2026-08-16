import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CategoryNav } from "@/components/blog/category-nav";
import { PostCard } from "@/components/blog/post-card";
import { JsonLd } from "@/components/json-ld";
import { postsIn, readSource } from "@/lib/blog";
import { CATEGORIES, type Category } from "@/lib/blog/types";
import {
  breadcrumbSchema,
  graph,
  organizationSchema,
  websiteSchema,
} from "@/lib/seo/schema";
import { absoluteUrl } from "@/lib/site";

type Params = { params: Promise<{ category: string }> };

export function generateStaticParams() {
  return Object.keys(CATEGORIES).map((category) => ({ category }));
}

export const dynamicParams = false;

const isCategory = (value: string): value is Category => value in CATEGORIES;

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { category } = await params;
  if (!isCategory(category)) return {};

  const { label, blurb } = CATEGORIES[category];
  return {
    title: label,
    description: blurb,
    alternates: { canonical: absoluteUrl(`/blog/category/${category}`) },
    openGraph: {
      type: "website",
      url: absoluteUrl(`/blog/category/${category}`),
      title: `${label} · 포인토`,
      description: blurb,
    },
  };
}

export default async function CategoryPage({ params }: Params) {
  const { category } = await params;
  if (!isCategory(category)) notFound();

  const { label, blurb } = CATEGORIES[category];
  const posts = postsIn(category);

  return (
    <main className="flex-1">
      <JsonLd
        data={graph(
          organizationSchema(),
          websiteSchema(),
          breadcrumbSchema([
            { name: "홈", path: "/" },
            { name: "콘텐츠", path: "/blog" },
            { name: label, path: `/blog/category/${category}` },
          ]),
        )}
      />

      <div className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
        <header className="max-w-2xl">
          <h1 className="text-[30px] font-bold leading-tight sm:text-[40px]">
            {label}
          </h1>
          <p className="mt-5 text-[17px] leading-relaxed text-muted">{blurb}</p>
        </header>

        <CategoryNav active={category} />

        {posts.length === 0 ? (
          <p className="mt-16 text-muted">아직 이 분류의 글이 없습니다.</p>
        ) : (
          <div className="mt-12 grid gap-5 sm:grid-cols-2">
            {posts.map(({ meta }) => (
              <PostCard
                key={meta.slug}
                meta={meta}
                minutes={readSource(meta.slug).minutes}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
