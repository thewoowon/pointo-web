import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/lib/site";

/**
 * robots.txt
 *
 * ── AI 크롤러를 막지 않는다 ──────────────────────────────────────────────
 * GPTBot, ClaudeBot, PerplexityBot 같은 봇을 차단하는 사이트가 늘고 있다.
 * 원문이 자산인 언론사라면 합리적인 선택이지만, 우리는 정반대다. 우리 글이
 * AI 답변에 인용되는 것이 **곧 유입**이다. 사장님이 챗봇에 "카페 스탬프 앱
 * 뭐 쓰지"라고 물었을 때 우리 이름이 나오는 게 목표라면, 읽어 가게 둬야 한다.
 * 그래서 별도 차단 규칙을 두지 않는다.
 *
 * ── 대신 막는 것 ─────────────────────────────────────────────────────────
 * 로그인 뒤 화면과 고객 셀프 조회다. 크롤링돼도 로그인 벽에 막혀 빈 페이지가
 * 색인되는데, 그런 페이지가 쌓이면 사이트 전체 평가가 내려간다.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/login",
          "/stores", // 점주 대시보드 — 로그인해야 보인다
          "/stores/",
          "/account",
          "/s/", // 고객 셀프 조회 — 매장별 개인 화면
        ],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: absoluteUrl("/"),
  };
}
