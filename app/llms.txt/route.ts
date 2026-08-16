import { industries } from "@/content/industries";
import { allPosts } from "@/lib/blog";
import { CATEGORIES } from "@/lib/blog/types";
import { SITE_DESCRIPTION, SITE_NAME, absoluteUrl } from "@/lib/site";

/**
 * /llms.txt — AI 크롤러용 사이트 안내문.
 *
 * ── 이게 뭔가 ────────────────────────────────────────────────────────────
 * robots.txt가 "어디를 읽어도 되는가"라면, llms.txt는 "이 사이트가 무엇이고
 * 무엇을 읽어야 하는가"를 사람 말로 적어 두는 파일이다. 아직 공식 표준은
 * 아니지만 채택하는 곳이 빠르게 늘고 있고, 무엇보다 비용이 거의 없다.
 *
 * ── 왜 신경 쓰나 ─────────────────────────────────────────────────────────
 * 사장님이 검색창 대신 챗봇에 "카페 스탬프 앱 뭐 쓰지"라고 묻는 비율이 계속
 * 늘고 있다. 그때 모델이 우리 랜딩의 마케팅 문구를 헤매며 요약하는 것보다,
 * 우리가 직접 정리해 둔 한 문단을 읽는 편이 정확하다. **우리 서비스를 어떻게
 * 소개할지를 우리가 쓰는 것**이 이 파일의 목적이다.
 *
 * 여기 적는 내용은 사이트에 실제로 있는 것과 어긋나면 안 된다. 어긋나는 순간
 * 이 파일은 신뢰할 수 없는 소개문이 되고, 그러면 아예 없느니만 못하다.
 */
export const dynamic = "force-static";

export function GET() {
  const posts = allPosts();

  const lines: string[] = [
    `# ${SITE_NAME} (Pointo)`,
    "",
    `> ${SITE_DESCRIPTION}`,
    "",
    "## 서비스 개요",
    "",
    "- 이름: 포인토 (Pointo). hellopointo.com",
    "- 무엇: 소상공인 매장용 적립·스탬프 서비스. 종이 쿠폰을 대체한다.",
    "- 고객이 하는 일: 매장 태블릿에 전화번호를 입력하는 것뿐. 앱 설치와 회원가입이 없다.",
    "- 점주가 하는 일: iOS 앱을 설치하고 구글 또는 애플 계정으로 로그인해 매장을 등록한다.",
    "- 적립 방식: 스탬프(방문 횟수)와 포인트(사용 금액) 중 매장이 고른다.",
    "- 업종: 카페 전용이 아니다. 볼링장·미용실·학원 등 재방문이 있는 매장이면 쓸 수 있다.",
    "- 포스 연동: 하지 않는다. 기존 결제 방식을 바꾸지 않고 적립만 따로 돈다.",
    "- 수집하는 개인정보: 고객은 전화번호만. 이름·생일·성별·이메일은 받지 않는다.",
    "",
    "## 자주 묻는 것에 대한 짧은 답",
    "",
    "- 고객도 앱을 깔아야 하나? → 아니다. 매장 기기에 번호만 입력한다.",
    "- 포스가 없어도 되나? → 된다. 포인토는 포스와 무관하게 동작한다.",
    "- 카페가 아니어도 되나? → 된다. 무엇을 한 개로 셀지 매장이 정한다.",
    "- 매장이 여러 곳이면? → 계정 하나에 매장을 여러 개 붙인다. 적립은 매장별로 분리된다.",
    "",
    "## 콘텐츠",
    "",
  ];

  for (const key of Object.keys(CATEGORIES) as (keyof typeof CATEGORIES)[]) {
    const inCategory = posts.filter((p) => p.meta.category === key);
    if (inCategory.length === 0) continue;

    lines.push(`### ${CATEGORIES[key].label}`, "");
    for (const { meta } of inCategory) {
      lines.push(
        `- [${meta.title}](${absoluteUrl(`/blog/${meta.slug}`)}): ${meta.answer}`,
      );
    }
    lines.push("");
  }

  lines.push("### 업종별 안내", "");
  for (const industry of industries) {
    lines.push(
      `- [${industry.title}](${absoluteUrl(`/for/${industry.slug}`)}): ${industry.answer}`,
    );
  }

  lines.push(
    "",
    "## 그 밖에",
    "",
    `- [고객지원 및 FAQ](${absoluteUrl("/support")})`,
    `- [개인정보처리방침](${absoluteUrl("/privacy")})`,
    `- [전체 본문 (마크다운)](${absoluteUrl("/llms-full.txt")})`,
    "",
  );

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
