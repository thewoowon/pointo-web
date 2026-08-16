#!/usr/bin/env node
/**
 * 빌드 결과 HTML에서 하이드레이션을 깨뜨리는 태그 중첩을 찾는다.
 *
 * ── 왜 필요한가 ──────────────────────────────────────────────────────────
 * `<p>` 안에 `<p>`나 `<div>`가 들어가면 브라우저가 여는 문단을 **자동으로 닫아
 * 버린다.** 그러면 서버가 보낸 HTML과 React가 만든 트리가 달라져서
 * "In HTML, <p> cannot be a descendant of <p>" 하이드레이션 에러가 난다.
 *
 * 이게 위험한 이유는 빌드·타입체크·lint가 전부 통과한다는 데 있다. 실제로 글
 * 일곱 편 전부가 이 문제를 안고 배포 직전까지 갔고, 브라우저 콘솔을 열어 보기
 * 전에는 아무도 몰랐다.
 *
 * ── MDX에서 특히 잘 터지는 이유 ──────────────────────────────────────────
 * MDX는 JSX 자식이 여러 줄에 걸치면 그 안을 마크다운으로 파싱한다.
 *
 *     <Related href="...">
 *       스탬프로 할까, 포인트로 할까
 *     </Related>
 *
 * 여기서 자식은 문자열이 아니라 **문단**이고 `<p>`로 렌더된다. 그래서 자식을
 * 받는 컴포넌트의 루트를 `<p>`로 두면 그 순간 깨진다. 자식을 받는 컴포넌트는
 * 반드시 블록 요소(`<div>`, `<aside>`, `<section>`)를 루트로 둘 것.
 *
 * 사용법: `yarn build` 다음에 `yarn check:html`.
 */

import { readFileSync } from "node:fs";
import { globSync } from "node:fs";
import { join } from "node:path";

/** `<p>` 안에 오면 브라우저가 문단을 강제로 닫는 요소들. */
const BLOCK =
  "p|div|ul|ol|section|aside|figure|figcaption|h[1-6]|blockquote|table|pre|form|hr";

const TAG = new RegExp(`<(${BLOCK})(?:\\s[^>]*?)?>|</(${BLOCK})>`, "g");

/** 닫는 태그가 없어도 되는 요소 — 스택에 쌓으면 안 된다. */
const VOID = new Set(["hr"]);

function findBadNesting(html) {
  const stack = [];
  const problems = [];

  for (const match of html.matchAll(TAG)) {
    const closing = match[0].startsWith("</");
    const tag = closing ? match[2] : match[1];

    if (closing) {
      const at = stack.lastIndexOf(tag);
      if (at !== -1) stack.length = at;
      continue;
    }

    if (stack.includes("p")) {
      const snippet = html
        .slice(match.index, match.index + 90)
        .replace(/\s+/g, " ");
      problems.push(`<${tag}> in <p> — ${snippet}`);
    }

    if (!VOID.has(tag) && !match[0].endsWith("/>")) stack.push(tag);
  }

  return problems;
}

const files = globSync("**/*.html", { cwd: ".next/server/app" });

if (files.length === 0) {
  console.error("빌드 결과가 없습니다. `yarn build`를 먼저 실행하세요.");
  process.exit(1);
}

let failed = 0;

for (const file of files.sort()) {
  const html = readFileSync(join(".next/server/app", file), "utf8");
  const problems = findBadNesting(html);
  if (problems.length === 0) continue;

  failed += problems.length;
  console.error(`\n✗ ${file} — ${problems.length}건`);
  for (const problem of problems.slice(0, 5)) console.error(`    ${problem}`);
  if (problems.length > 5) console.error(`    … 외 ${problems.length - 5}건`);
}

if (failed > 0) {
  console.error(
    `\n${failed}건의 잘못된 중첩이 있습니다. 자식을 받는 컴포넌트의 루트가 <p>는 아닌지 확인하세요.`,
  );
  process.exit(1);
}

console.log(`✓ ${files.length}개 페이지 — 하이드레이션을 깨뜨리는 중첩 없음`);
