import "server-only";

import { readFileSync } from "node:fs";
import { join } from "node:path";

import { posts, type LoadedPost } from "@/content/blog";
import {
  extractHeadings,
  readingMinutes,
  type Heading,
} from "@/lib/blog/headings";
import type { Category, PostMeta } from "@/lib/blog/types";

/**
 * 글 조회 API — 라우트가 콘텐츠를 만지는 유일한 통로.
 *
 * `server-only`를 붙인 것은 이 파일이 파일 시스템을 읽기 때문이다. 클라이언트
 * 컴포넌트에서 실수로 import하면 번들 단계에서 바로 실패하게 만든다.
 */

/**
 * 초안 감추기.
 *
 * `draft: true`인 글은 배포본에서 목록·sitemap·상세 어디에도 나오지 않는다.
 * 개발 서버에서는 그대로 보인다 — 쓰는 중에 확인하려고 매번 플래그를 껐다
 * 켜면, 결국 켠 채로 커밋하는 날이 온다.
 */
const isVisible = (meta: PostMeta) =>
  !meta.draft || process.env.NODE_ENV === "development";

export const allPosts = (): LoadedPost[] => posts.filter((p) => isVisible(p.meta));

export const postsIn = (category: Category): LoadedPost[] =>
  allPosts().filter((p) => p.meta.category === category);

export const findPost = (slug: string): LoadedPost | undefined =>
  allPosts().find((p) => p.meta.slug === slug);

/**
 * 관련 글 — 같은 카테고리를 먼저, 모자라면 최신 글로 채운다.
 *
 * 태그 유사도로 고르는 방식도 해 봤는데, 글이 스무 편 아래일 때는 결과가
 * "그냥 최신 글"과 거의 같으면서 코드만 복잡해졌다.
 */
export function relatedPosts(slug: string, limit = 3): LoadedPost[] {
  const current = findPost(slug);
  if (!current) return [];

  const others = allPosts().filter((p) => p.meta.slug !== slug);
  const sameCategory = others.filter(
    (p) => p.meta.category === current.meta.category,
  );
  const rest = others.filter((p) => p.meta.category !== current.meta.category);

  return [...sameCategory, ...rest].slice(0, limit);
}

/* ────────────────────────────────────────────────────────────────────────
   원문 읽기 — 목차와 읽는 시간
   ──────────────────────────────────────────────────────────────────────── */

/*
 * 컴파일된 MDX가 아니라 원문 파일을 읽는다. 목차는 본문보다 **먼저** 필요한데,
 * 렌더 중에 제목을 수집하려면 컨텍스트로 끌어올려야 하고 그러면 서버
 * 컴포넌트에서 못 쓴다.
 *
 * 이 읽기는 빌드 시점에만 일어난다. 블로그 라우트가 전부
 * `generateStaticParams`로 미리 만들어지기 때문이다. 그래도 배포 번들에
 * `content/`가 빠지는 사고를 막으려고 next.config의 `outputFileTracingIncludes`에
 * 경로를 적어 뒀다.
 */
const CONTENT_DIR = join(process.cwd(), "content", "blog");

export type PostSource = {
  headings: Heading[];
  minutes: number;
};

const cache = new Map<string, PostSource>();

export function readSource(slug: string): PostSource {
  const hit = cache.get(slug);
  if (hit) return hit;

  let raw: string;
  try {
    raw = readFileSync(join(CONTENT_DIR, `${slug}.mdx`), "utf8");
  } catch {
    // 목차가 없다고 페이지가 죽을 이유는 없다. 본문은 이미 번들에 들어 있다.
    const empty = { headings: [], minutes: 1 };
    cache.set(slug, empty);
    return empty;
  }

  // meta 블록은 본문이 아니다. 읽는 시간에 넣으면 실제보다 길게 나온다.
  const body = raw.replace(/^export const meta = \{[\s\S]*?\n\};\n/, "");

  const source = {
    headings: extractHeadings(body),
    minutes: readingMinutes(body),
  };
  cache.set(slug, source);
  return source;
}

/**
 * MDX 원문을 순수 마크다운으로 되돌린다 (`/llms-full.txt`용).
 *
 * 답변형 검색은 HTML을 받아 태그를 걷어내는 과정에서 자주 뜻을 흘린다. 특히
 * `<Compare>` 같은 컴포넌트는 렌더된 결과만 보면 어느 쪽이 '지금까지'이고
 * 어느 쪽이 '바뀐 뒤'인지 구분되지 않는다. 그래서 아예 마크다운으로 한 벌 더
 * 내준다.
 *
 * 완벽한 변환을 노리지 않는다. 컴포넌트 안의 문장은 배열 리터럴에서 긁어
 * 목록으로 펴는 정도로 충분하다 — 목적은 재현이 아니라 **뜻이 통하는 것**이다.
 */
/**
 * 값이 아니라 배선인 props — 마크다운으로 옮길 뜻이 없다.
 *
 * `beforeTitle`/`afterTitle`은 뜻이 있지만 아래 `label()`이 목록 머리말로
 * 이미 쓰기 때문에 여기서 한 번 더 나오면 같은 말이 두 번 찍힌다.
 */
const NOISE_PROPS = new Set([
  "src",
  "href",
  "width",
  "height",
  "className",
  "tone",
  "image",
  "index",
  "beforeTitle",
  "afterTitle",
]);

/**
 * 컴포넌트 태그 하나를 마크다운 조각으로.
 *
 * 태그를 통째로 지우면 `<Compare>`처럼 **내용이 props에만 들어 있는** 컴포넌트가
 * 흔적도 없이 사라진다. 그래서 지우기 전에 안에 있는 문자열을 먼저 꺼낸다.
 */
function tagToMarkdown(tag: string): string {
  const lines: string[] = [];
  const quoted = /"((?:[^"\\]|\\.)*)"/g;
  const unescape = (s: string) => s.replace(/\\"/g, '"');

  /*
   * `<Compare>`의 before/after에는 라벨을 반드시 붙인다.
   *
   * 화면에서는 두 칸이 나란히 놓이고 각각 "지금까지"·"포인토를 쓰면"이라는
   * 제목을 달고 있어서 구분이 되지만, 목록으로 펴 놓으면 그냥 항목 여섯 개다.
   * 그 상태로는 "이번 달 재방문 손님 수를 모른다"가 **포인토를 쓰면 그렇다**는
   * 말로 읽힌다. 정확히 반대 뜻이다.
   */
  const label = (prop: string): string | null => {
    const custom = new RegExp(`${prop}Title="([^"]*)"`).exec(tag)?.[1];
    if (prop === "before") return custom ?? "지금까지";
    if (prop === "after") return custom ?? "포인토를 쓰면";
    return null;
  };

  // 1) 배열 prop(before/after/bullets/items) → 목록
  for (const prop of tag.matchAll(/(\w+)=\{\[([\s\S]*?)\]\}/g)) {
    if (NOISE_PROPS.has(prop[1])) continue;

    const heading = label(prop[1]);
    if (heading) lines.push(`${heading}:`);

    /*
     * `<Steps items={[{ title, body }, ...]}>`은 번호가 뜻의 일부다. 제목과
     * 본문을 평평한 목록으로 펴 버리면 "태블릿을 고객 모드로 잠그기"가 몇 번째
     * 단계인지 사라지고, 절차를 설명하는 글이 그냥 항목 열 개가 된다.
     */
    const objects = [...prop[2].matchAll(/\{([^{}]*)\}/g)];
    if (objects.length > 0) {
      objects.forEach((object, i) => {
        const [title, body] = [...object[1].matchAll(quoted)].map((m) =>
          unescape(m[1]),
        );
        lines.push(`${i + 1}. ${title}${body ? ` — ${body}` : ""}`);
      });
      continue;
    }

    for (const value of prop[2].matchAll(quoted)) {
      lines.push(`- ${unescape(value[1])}`);
    }
  }

  // 2) 남은 문자열 prop(title/caption/body/alt) → 한 줄씩
  const scalarsOnly = tag.replace(/\w+=\{\[[\s\S]*?\]\}/g, "");
  for (const prop of scalarsOnly.matchAll(/(\w+)="((?:[^"\\]|\\.)*)"/g)) {
    if (NOISE_PROPS.has(prop[1])) continue;
    lines.push(unescape(prop[2]));
  }

  return lines.length > 0 ? `\n${lines.join("\n")}\n` : "";
}

export function toPlainMarkdown(slug: string): string {
  let raw: string;
  try {
    raw = readFileSync(join(CONTENT_DIR, `${slug}.mdx`), "utf8");
  } catch {
    return "";
  }

  return (
    raw
      // 메타 블록은 본문이 아니다.
      .replace(/^export const meta = \{[\s\S]*?\n\};\n/, "")
      /*
       * 여는 태그·닫는 태그·자기완결 태그를 한 번에 잡아 마크다운으로 바꾼다.
       * 태그를 지우는 것과 안의 문자열을 꺼내는 것을 **같은 패스에서** 해야
       * 한다. 나눠서 하면 나중 패스가 앞 패스의 결과물을 다시 먹는다.
       */
      .replace(/<\/?[A-Z]\w*(?:\s[^>]*?)?\/?>/g, (tag) =>
        tag.startsWith("</") ? "" : tagToMarkdown(tag),
      )
      // 줄바꿈 정리 — 빈 줄이 셋 이상 이어지지 않게.
      .replace(/\n{3,}/g, "\n\n")
      .trim()
  );
}

export type { LoadedPost };
