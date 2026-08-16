/**
 * 콘텐츠 메타데이터 — 글 한 편이 자기 자신에 대해 알아야 하는 것들.
 *
 * 이 타입 하나가 목록 카드, `<head>` 메타태그, sitemap, JSON-LD 네 곳을 동시에
 * 먹인다. 그래서 "제목을 목록용과 SEO용으로 따로 쓰고 싶다" 같은 요구가 와도
 * 필드를 늘리기 전에 한 번 더 생각할 것. 두 벌로 갈라지는 순간 한쪽이 낡는다.
 */

/**
 * 카테고리는 셋으로 고정한다.
 *
 * 더 늘리고 싶어지면 대개 그건 카테고리가 아니라 `tags`다. 카테고리가 다섯 개를
 * 넘어가는 순간 독자는 어디를 눌러야 할지 모르게 되고, 각 목록은 글 두 편짜리
 * 빈 페이지가 된다.
 */
export type Category = "guides" | "stories" | "tech";

export const CATEGORIES: Record<
  Category,
  { label: string; blurb: string; slug: string }
> = {
  guides: {
    label: "사용법",
    blurb:
      "적립을 어떻게 굴릴지, 설정을 어떻게 잡을지. 사장님이 오늘 바로 따라 할 수 있는 것만 씁니다.",
    slug: "guides",
  },
  stories: {
    label: "이야기",
    blurb:
      "포인토를 만들면서 겪은 일과, 실제 매장에서 벌어진 일. 제품 자랑보다 사실에 가깝게 씁니다.",
    slug: "stories",
  },
  tech: {
    label: "기술",
    blurb:
      "매장 한 대의 태블릿이 멈추지 않게 하려고 우리가 고른 선택들. 만드는 사람을 위한 기록입니다.",
    slug: "tech",
  },
};

export type FaqEntry = {
  q: string;
  /** 답은 3~4문장 안에서 끝낼 것. 길면 AI가 요약하다 뜻을 바꾼다. */
  a: string;
};

export type HowToStep = {
  name: string;
  text: string;
};

export type PostMeta = {
  /** URL의 마지막 조각. 영문 소문자·하이픈만. 한 번 정하면 바꾸지 않는다. */
  slug: string;
  title: string;
  /**
   * 검색 결과에 그대로 나가는 한 문단. 120~155자가 잘리지 않는 길이다.
   * 제목을 되풀이하지 말고, 제목이 답하지 않은 것을 말할 것.
   */
  description: string;
  category: Category;
  /** YYYY-MM-DD. */
  publishedAt: string;
  /** 내용을 실제로 고쳤을 때만 갱신한다. 오타 수정으로는 올리지 않는다. */
  updatedAt?: string;
  /**
   * AEO의 핵심 필드. 제목이 던진 질문에 대한 **두세 문장짜리 즉답**이다.
   *
   * 글 맨 위에 눈에 띄게 렌더되고, 동시에 JSON-LD의 답변 자리에 들어간다.
   * AI 검색은 페이지를 끝까지 읽지 않는다 — 위에서 답이 안 나오면 우리 글
   * 대신 답을 아는 다른 글을 인용한다.
   */
  answer: string;
  /** 본문에 없는 질문을 여기 넣지 말 것. 스키마와 본문이 어긋나면 감점 대상이다. */
  faq?: FaqEntry[];
  /** 절차를 다루는 글에만. 본문의 단계와 순서·개수가 같아야 한다. */
  howTo?: { name: string; steps: HowToStep[] };
  /** 목록 필터에는 안 쓰고, 관련 글을 묶는 데만 쓴다. */
  tags?: string[];
  /**
   * 목록 카드와 OG 이미지에 쓸 대표 스크린샷. `public/screenshot/` 기준 이름.
   * 없으면 카드가 제목 타이포만으로 렌더된다(그것도 괜찮다).
   */
  cover?: string;
  /** 초안. true면 목록·sitemap 어디에도 나오지 않는다. */
  draft?: boolean;
};
