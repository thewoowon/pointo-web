import type { MetadataRoute } from "next";

import { industries } from "@/content/industries";
import { allPosts } from "@/lib/blog";
import { CATEGORIES } from "@/lib/blog/types";
import { absoluteUrl } from "@/lib/site";

/**
 * sitemap.xml
 *
 * 크롤러는 사이트맵 없이도 링크를 타고 다니지만, 새 글이 발견되는 데 며칠씩
 * 걸린다. 사이트맵이 있으면 발행 즉시 알린다. 콘텐츠를 계속 낼 계획이라면
 * 이건 선택이 아니다.
 *
 * ── 무엇을 넣지 않는가 ───────────────────────────────────────────────────
 * 점주 대시보드(`/stores/*`), 로그인, 고객 셀프 조회(`/s/*`)는 넣지 않는다.
 * 로그인해야 보이거나 특정 매장 손님에게만 의미가 있는 주소이고, 검색 결과에
 * 뜨면 오히려 잘못 들어온 사람만 늘어난다. robots.ts에서도 같이 막는다.
 *
 * `priority`는 구글이 사실상 무시한다고 밝힌 지 오래라 굳이 넣지 않았다.
 * `lastModified`만 정확히 유지하는 편이 실제로 효과가 있다.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const posts = allPosts();

  /** 가장 최근에 글이 나온 날 — 목록 페이지들의 갱신일로 쓴다. */
  const latestPost = posts[0]?.meta;
  const latest = latestPost
    ? new Date(latestPost.updatedAt ?? latestPost.publishedAt)
    : new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), lastModified: latest, changeFrequency: "weekly" },
    {
      url: absoluteUrl("/blog"),
      lastModified: latest,
      changeFrequency: "weekly",
    },
    {
      url: absoluteUrl("/support"),
      lastModified: latest,
      changeFrequency: "monthly",
    },
    {
      url: absoluteUrl("/privacy"),
      lastModified: latest,
      changeFrequency: "yearly",
    },
  ];

  const categoryPages: MetadataRoute.Sitemap = Object.values(CATEGORIES).map(
    (category) => {
      const newest = posts.find((p) => p.meta.category === category.slug)?.meta;
      return {
        url: absoluteUrl(`/blog/category/${category.slug}`),
        lastModified: new Date(
          newest?.updatedAt ?? newest?.publishedAt ?? latest,
        ),
        changeFrequency: "weekly" as const,
      };
    },
  );

  const industryPages: MetadataRoute.Sitemap = industries.map((industry) => ({
    url: absoluteUrl(`/for/${industry.slug}`),
    lastModified: latest,
    changeFrequency: "monthly",
  }));

  const postPages: MetadataRoute.Sitemap = posts.map(({ meta }) => ({
    url: absoluteUrl(`/blog/${meta.slug}`),
    lastModified: new Date(meta.updatedAt ?? meta.publishedAt),
    changeFrequency: "monthly",
  }));

  return [...staticPages, ...categoryPages, ...industryPages, ...postPages];
}
