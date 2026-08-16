# 콘텐츠 쓰는 법

## 새 글 추가하기

1. `content/blog/<slug>.mdx` 파일을 만든다. slug는 영문 소문자·하이픈만.
2. `content/blog/index.ts`에 import 한 줄과 `modules` 배열에 한 줄을 추가한다.

끝이다. 목록·카테고리·sitemap·JSON-LD·`llms.txt`에 자동으로 들어간다.

> 파일을 자동으로 훑지 않고 손으로 등록하게 한 이유는 [`content/blog/index.ts`](../content/blog/index.ts)
> 주석에 적어 뒀다. 요약하면, 자동 수집은 배포 환경에서만 글이 사라지는 부류의
> 버그를 만든다.

## meta 필드

```js
export const meta = {
  slug: "how-many-stamps",        // 파일명과 같게. 한 번 정하면 바꾸지 않는다
  title: "스탬프 몇 개에 무엇을 드려야 할까",
  description: "...",             // 검색 결과에 그대로 나간다. 120~155자
  category: "guides",             // guides | stories | tech
  publishedAt: "2026-08-16",
  updatedAt: "2026-09-01",        // 선택. 내용을 실제로 고쳤을 때만
  answer: "...",                  // ★ 아래 설명
  faq: [{ q: "...", a: "..." }],  // 선택
  howTo: { name, steps },         // 선택. 절차 글에만
  tags: ["스탬프"],                // 선택
  cover: "phone-stamp",           // 선택. public/screenshot/ 기준 이름
  draft: true,                    // 선택. 배포본에서 감춰진다
};
```

빠뜨리면 빌드가 실패한다(`content/blog/index.ts`의 `assertValid`). 화면상으로
멀쩡해 보이면서 정렬과 sitemap만 조용히 어긋나는 것보다 낫다.

### `answer`가 이 사이트에서 가장 중요한 필드다

제목이 던진 질문에 대한 **두세 문장짜리 즉답**이다. 글 맨 위에 눈에 띄게
렌더되고, 동시에 JSON-LD의 `abstract`와 `llms.txt`에 그대로 들어간다.

글쓰기 상식과는 반대다. 보통은 도입부로 흥미를 끌고 결론을 뒤에 두지만, 검색으로
들어온 사람과 AI는 둘 다 결론부터 원한다. AI 검색은 페이지를 끝까지 읽지 않는다 —
위에서 답이 안 나오면 우리 글 대신 답을 아는 다른 글을 인용한다.

나쁜 예: "이 글에서는 스탬프 개수를 정하는 방법을 알아봅니다."
좋은 예: "손님이 완성하는 데 걸리는 기간이 2~3개월 안에 들어오게 개수를 정하세요. 주 2회 오는 매장이면 10개, ..."

## 본문에서 쓸 수 있는 컴포넌트

import 없이 바로 쓴다(`mdx-components.tsx`에서 전역으로 넣어 준다).

| 컴포넌트 | 쓰는 곳 |
|---|---|
| `<Callout title="..." tone="info\|warn">` | 본문에서 잠깐 떼어내 강조할 한 문단 |
| `<Screenshot src="phone-keypad" alt="..." caption="..." />` | 앱 화면. `public/screenshot/`의 이름만 |
| `<Compare before={[...]} after={[...]} />` | "지금까지 / 이렇게 바뀝니다" 두 칸 대비 |
| `<Steps items={[{ title, body }]} />` | 순서 있는 절차. `meta.howTo`와 짝을 맞춘다 |
| `<InlineCta title="..." body="..." />` | 글 중간에서 제품으로 넘기는 자리 |
| `<Related href="/blog/...">텍스트</Related>` | 다른 글로 넘기는 인라인 링크 |

`<Screenshot>`의 `src`에 없는 이름을 쓰면 빌드가 실패한다. 오타로 이미지가 조용히
사라지는 것보다 낫다.

### 자식을 받는 컴포넌트를 새로 만들 때

**루트를 `<p>`로 두면 안 된다.** MDX는 JSX 자식이 여러 줄에 걸치면 그 안을
마크다운으로 파싱한다. 즉

```mdx
<Related href="...">
  스탬프로 할까, 포인트로 할까
</Related>
```

의 자식은 문자열이 아니라 **문단**이고 `<p>`로 렌더된다. 루트가 `<p>`면 `<p>`
안에 `<p>`가 들어가고, 브라우저가 여는 문단을 자동으로 닫아 버려서 하이드레이션이
깨진다(`In HTML, <p> cannot be a descendant of <p>`).

자식을 받는 컴포넌트는 블록 요소를 루트로 둘 것 — `Callout`은 `<aside>`,
`Related`는 `<div>`다. 안쪽 문단 여백이 헐거워 보이면 `[&_p]:mt-0` 같은 식으로
되돌린다.

이 문제는 빌드·타입체크·lint를 전부 통과하고 브라우저 콘솔에서만 드러난다.
그래서 검사를 따로 뒀다:

```
yarn build && yarn check:html
```

## 지키는 규칙

**스키마에 적는 내용은 화면에 보여야 한다.** `faq`에 본문에 없는 질문을 넣으면
클로킹으로 취급돼 구조화 데이터 전체가 무시될 수 있다. `howTo.steps`는 본문의
`<Steps>`와 순서·개수가 같아야 한다.

**숫자를 손으로 적지 않는다.** 가입자 수·적립 건수는 `content/stats.ts`에서 온다.
값을 다시 재려면 앱 리포(KBffee)에서 `node scripts/landing-stats.mjs`.

**없는 후기를 실제 후기라고 하지 않는다.** `content/testimonials.ts`의 `confirmed`
플래그와 같은 원칙이다. 매장 실명은 사장님 동의 없이 내걸지 않는다.

**보안 관련 글에서 아직 안 막힌 것을 쓰지 않는다.** "현재 이런 공격이 가능합니다"는
고쳐진 다음에 할 이야기다. 왜 그렇게 설계했는지까지만 쓴다.

## 업종 페이지

`/for/<slug>`는 블로그 글이 아니라 랜딩의 변형이다. `content/industries.ts`에
항목을 추가하면 페이지·sitemap·푸터 링크·랜딩 카드가 함께 생긴다.

`proof`(도입 실적)는 **실측치가 있을 때만** 채운다. 비워 두면 화면에서 그 블록이
통째로 빠진다. "많은 볼링장에서 쓰고 있습니다" 류의 문장은 영업 나가서 "어디요?"
라는 질문을 받는 순간 신뢰를 통째로 잃는다.

## SEO/AEO 배관이 어디 있는지

| 파일 | 역할 |
|---|---|
| `app/sitemap.ts` | sitemap.xml. 글·카테고리·업종 페이지가 자동으로 들어간다 |
| `app/robots.ts` | AI 크롤러를 **막지 않는다**. 이유는 파일 주석 참고 |
| `app/llms.txt/route.ts` | AI용 사이트 안내문 |
| `app/llms-full.txt/route.ts` | 모든 글의 본문을 마크다운 한 장으로 |
| `lib/seo/schema.ts` | JSON-LD 조립 (Article/FAQPage/HowTo/Breadcrumb 등) |
| `content/faq.ts` | `/support`의 FAQ. 화면과 스키마가 같은 배열을 쓴다 |

## 배포 전에 남은 것

- [ ] `app/(marketing)/layout.tsx`의 `BUSINESS_INFO` — 사업자 정보가 아직 비어 있다.
      전자상거래법상 표시 의무이고, 푸터에 없으면 도입을 고민하던 사장님이 그
      단계에서 걸러진다. **실제 등록증에 적힌 그대로** 채울 것.
- [ ] Google Search Console에 `https://hellopointo.com/sitemap.xml` 제출
- [ ] [리치 결과 테스트](https://search.google.com/test/rich-results)로 글 하나 검증
