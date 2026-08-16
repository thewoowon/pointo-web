import type { ReactNode } from "react";

/**
 * 제목 → 앵커 id.
 *
 * 이 규칙은 두 곳에서 **따로** 돌아간다. MDX를 렌더할 때(mdx-components.tsx)와
 * 목차를 만들 때(원문에서 `##` 줄을 긁는다). 둘이 어긋나면 목차 링크가 아무 데도
 * 가지 않는데, 화면상으로는 멀쩡해 보여서 알아채기 어렵다. 그래서 규칙을 이
 * 파일 하나로 묶어 뒀다. 고칠 일이 생기면 여기만 고칠 것.
 *
 * 한글을 로마자로 옮기지 않고 그대로 남긴다. 주소창에서는 퍼센트 인코딩으로
 * 보이지만 브라우저·검색엔진 모두 문제없이 다루고, 무엇보다 "#종이-쿠폰의-한계"
 * 쪽이 복사해서 공유했을 때 무슨 문단인지 읽힌다.
 */
export function slugify(text: string): string {
  return (
    text
      .trim()
      .toLowerCase()
      // 한글·영문·숫자·공백·하이픈만 남긴다. 물음표와 마침표가 흔히 걸린다.
      .replace(/[^\p{Script=Hangul}\p{Letter}\p{Number}\s-]/gu, "")
      .replace(/\s+/g, "-")
      .replace(/-{2,}/g, "-")
      .replace(/^-|-$/g, "")
  );
}

/** React 자식 트리에서 텍스트만 긁어낸다(제목 안에 `<code>`가 섞이는 경우). */
function toText(node: ReactNode): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(toText).join("");
  if (typeof node === "object" && "props" in node) {
    return toText((node.props as { children?: ReactNode }).children);
  }
  return "";
}

export function slugifyHeading(children: ReactNode): string {
  return slugify(toText(children));
}

export type Heading = { level: 2 | 3; text: string; id: string };

/**
 * MDX 원문에서 목차를 뽑는다.
 *
 * 컴파일된 결과가 아니라 원문 문자열을 읽는 이유는, 목차가 본문보다 **먼저**
 * 필요하기 때문이다. 렌더 중에 제목을 수집하려면 컨텍스트로 끌어올려야 하고
 * 그러면 서버 컴포넌트에서 못 쓴다.
 *
 * h4 이하는 목차에 넣지 않는다. 세 단계까지 들어가면 목차가 본문만큼 길어져서
 * 아무도 안 본다.
 */
export function extractHeadings(source: string): Heading[] {
  const headings: Heading[] = [];
  let inCodeFence = false;

  for (const line of source.split("\n")) {
    // 코드 블록 안의 `# 주석`을 제목으로 착각하지 않도록.
    if (line.startsWith("```")) {
      inCodeFence = !inCodeFence;
      continue;
    }
    if (inCodeFence) continue;

    const match = /^(#{2,3})\s+(.+?)\s*$/.exec(line);
    if (!match) continue;

    // 제목 줄에 남은 마크다운 강조 기호를 걷어낸다.
    const text = match[2].replace(/[*_`]/g, "").trim();
    headings.push({
      level: match[1].length as 2 | 3,
      text,
      id: slugify(text),
    });
  }

  return headings;
}

/**
 * 읽는 데 걸리는 시간(분).
 *
 * 영어권 공식(분당 200단어)을 한국어에 그대로 쓰면 실제보다 두 배 넘게 나온다.
 * 한글은 띄어쓰기 단위가 영어 단어보다 짧기 때문이다. 국내 매체들이 쓰는
 * 분당 500자를 기준으로 잡고, 마크다운 기호는 세지 않는다.
 */
export function readingMinutes(source: string): number {
  const plain = source
    .replace(/```[\s\S]*?```/g, "") // 코드 블록
    .replace(/<[^>]+>/g, "") // JSX 태그
    .replace(/[#*_>`\[\]()|-]/g, "");
  return Math.max(1, Math.round(plain.replace(/\s/g, "").length / 500));
}
