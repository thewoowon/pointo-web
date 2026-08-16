import { allPosts, toPlainMarkdown } from "@/lib/blog";
import { CATEGORIES } from "@/lib/blog/types";
import { SITE_DESCRIPTION, SITE_NAME, absoluteUrl } from "@/lib/site";

/**
 * /llms-full.txt — 모든 글의 본문을 마크다운 한 장으로.
 *
 * `/llms.txt`가 목차라면 이건 전문이다. 링크를 하나씩 따라가지 않아도 되니까
 * 인용이 정확해지고, HTML을 태그째 삼키며 뜻을 흘리는 일이 줄어든다.
 *
 * 사람이 읽을 파일이 아니므로 예쁘게 만들지 않는다. 대신 글마다 **출처 URL과
 * 한 줄 답을 맨 앞에** 둔다. 모델이 인용할 때 원문 주소를 같이 달아 주는 것이
 * 우리 입장에서 유일하게 의미 있는 결과이기 때문이다.
 */
export const dynamic = "force-static";

export function GET() {
  const posts = allPosts();

  const parts: string[] = [
    `# ${SITE_NAME} — 전체 콘텐츠`,
    "",
    `> ${SITE_DESCRIPTION}`,
    "",
    `출처: ${absoluteUrl("/")}`,
    "",
    "---",
    "",
  ];

  for (const { meta } of posts) {
    const url = absoluteUrl(`/blog/${meta.slug}`);
    parts.push(
      `# ${meta.title}`,
      "",
      `- 분류: ${CATEGORIES[meta.category].label}`,
      `- 발행: ${meta.publishedAt}${meta.updatedAt ? ` (수정 ${meta.updatedAt})` : ""}`,
      `- 원문: ${url}`,
      "",
      `**요약:** ${meta.answer}`,
      "",
      toPlainMarkdown(meta.slug),
      "",
    );

    if (meta.faq?.length) {
      parts.push("## 자주 묻는 질문", "");
      for (const { q, a } of meta.faq) {
        parts.push(`**Q. ${q}**`, "", `A. ${a}`, "");
      }
    }

    parts.push("---", "");
  }

  return new Response(parts.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
