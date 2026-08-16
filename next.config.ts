import createMDX from "@next/mdx";
import type { NextConfig } from "next";

/**
 * MDX — 콘텐츠(`content/blog/*.mdx`)를 빌드 타임에 정적으로 컴파일한다.
 *
 * `pageExtensions`에 mdx를 넣지 않은 것은 의도적이다. MDX 파일을 그대로
 * 라우트로 쓰지 않고 `content/` 아래 데이터로 두기 때문이다. 라우트는
 * `app/(marketing)/blog/[slug]`가 담당하고, 거기서 MDX를 불러 렌더한다.
 * 이렇게 해야 목록·태그·JSON-LD를 한 곳에서 만들 수 있다.
 */
/*
 * 플러그인을 `import remarkGfm from "remark-gfm"` 해서 넘기면 안 된다.
 * Turbopack은 로더 옵션을 직렬화해서 워커로 보내는데 함수는 직렬화되지 않아
 * "does not have serializable options"로 빌드가 죽는다. 이름 문자열로 넘기면
 * 워커 쪽에서 알아서 불러온다.
 */
const withMDX = createMDX({
  options: {
    // GFM: 표, 취소선, 자동 링크. 비교표를 본문에서 쓰려면 필요하다.
    remarkPlugins: [["remark-gfm", {}]],
    rehypePlugins: [],
  },
});

const nextConfig: NextConfig = {
  pageExtensions: ["ts", "tsx"],

  /*
   * 블로그 라우트는 목차와 읽는 시간을 만들려고 `content/blog/*.mdx` 원문을
   * 직접 읽는다(lib/blog/index.ts). 경로가 문자열로 조립되기 때문에 번들러가
   * 추적하지 못하고, 배포본에서만 파일이 없어 목차가 사라진다. 명시해 둔다.
   */
  outputFileTracingIncludes: {
    "/blog/[slug]": ["./content/blog/**/*.mdx"],
  },
};

export default withMDX(nextConfig);
