import type { PostMeta } from "@/lib/blog/types";

import * as beyondCafe from "./beyond-cafe.mdx";
import * as howManyStamps from "./how-many-stamps.mdx";
import * as paperCouponToApp from "./paper-coupon-to-app.mdx";
import * as phoneNumberOnly from "./phone-number-only.mdx";
import * as stampOrPoint from "./stamp-or-point.mdx";
import * as startInTenMinutes from "./start-in-10-minutes.mdx";
import * as whyWeBuiltPointo from "./why-we-built-pointo.mdx";

/**
 * 글 목록 — 새 글을 쓰면 여기 두 줄을 추가한다.
 *
 * 파일 시스템을 훑어서 자동으로 모을 수도 있었지만 그러지 않았다. 자동 수집은
 * 번들러가 무엇을 포함할지 정적으로 알 수 없게 만들고, 그러면 배포 환경에서만
 * 글이 사라지는 부류의 버그가 생긴다. 글 한 편에 import 한 줄은 싼 값이다.
 *
 * 순서는 신경 쓰지 않아도 된다 — 아래에서 발행일 역순으로 정렬한다.
 */
const modules = [
  paperCouponToApp,
  stampOrPoint,
  howManyStamps,
  startInTenMinutes,
  whyWeBuiltPointo,
  beyondCafe,
  phoneNumberOnly,
];

export type LoadedPost = {
  meta: PostMeta;
  /** MDX 본문 컴포넌트. */
  Body: (props: Record<string, unknown>) => React.JSX.Element;
};

/**
 * 메타데이터 검증.
 *
 * `.mdx` 안의 `export const meta`는 tsconfig의 검사 대상이 아니라 오타가 그대로
 * 통과한다. `publishedAt`을 빼먹으면 정렬이 조용히 어긋나고 sitemap의 날짜가
 * 비는데, 화면상으로는 멀쩡해 보인다. 빌드에서 터뜨리는 편이 낫다.
 */
function assertValid(meta: PostMeta, index: number): PostMeta {
  const where = meta?.slug ? `"${meta.slug}"` : `${index}번째 글`;
  const required: (keyof PostMeta)[] = [
    "slug",
    "title",
    "description",
    "category",
    "publishedAt",
    "answer",
  ];

  for (const key of required) {
    if (!meta?.[key]) {
      throw new Error(`content/blog — ${where}의 meta.${key}가 비어 있습니다.`);
    }
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(meta.publishedAt)) {
    throw new Error(
      `content/blog — ${where}의 publishedAt은 YYYY-MM-DD여야 합니다 (받은 값: ${meta.publishedAt}).`,
    );
  }
  return meta;
}

const loaded: LoadedPost[] = modules.map((m, i) => ({
  meta: assertValid(m.meta, i),
  Body: m.default as LoadedPost["Body"],
}));

// slug 중복은 라우트가 조용히 한쪽만 잡아먹는 형태로 나타난다. 먼저 막는다.
const seen = new Set<string>();
for (const { meta } of loaded) {
  if (seen.has(meta.slug)) {
    throw new Error(`content/blog — slug가 중복입니다: "${meta.slug}"`);
  }
  seen.add(meta.slug);
}

/** 발행일 역순. 같은 날이면 제목 순으로 안정 정렬한다. */
export const posts: LoadedPost[] = [...loaded].sort((a, b) => {
  const byDate = b.meta.publishedAt.localeCompare(a.meta.publishedAt);
  return byDate !== 0 ? byDate : a.meta.title.localeCompare(b.meta.title, "ko");
});
