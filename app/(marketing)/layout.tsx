import Link from "next/link";

import { CONTACT_MAIL } from "@/components/marketing/cta";
import { industries } from "@/content/industries";

/**
 * 마케팅 사이트 레이아웃 (hellopointo.com 랜딩).
 *
 * 루트 레이아웃에 있던 헤더/푸터를 여기로 내렸다. 점주 대시보드(`(app)`)는
 * 자체 셸을 쓰므로 이 크롬이 붙으면 안 된다.
 */

/*
 * 사업자 정보.
 *
 * 모르는 서비스에 매장 데이터를 맡길지 고민하는 사장님은 푸터를 본다. 상호·
 * 사업자등록번호·주소·대표전화가 없는 사이트는 그 단계에서 걸러진다. 전자
 * 상거래법상 표시 의무이기도 하다.
 *
 * 값을 아직 못 채웠으므로 비워 뒀다. **지어내면 안 된다** — 실제 등록증에
 * 적힌 그대로 채울 것. 채우면 푸터에 자동으로 나온다.
 */
const BUSINESS_INFO: [string, string][] = [
  // ["상호", "룰루랄라 컴퍼니"],
  // ["대표", "○○○"],
  // ["사업자등록번호", "000-00-00000"],
  // ["주소", "○○시 ○○구 ○○로 00"],
  // ["문의", "000-0000-0000"],
];

const NAV = [
  { href: "/#features", label: "기능" },
  { href: "/#reviews", label: "도입 매장" },
  { href: "/blog", label: "콘텐츠" },
  { href: "/support", label: "고객지원" },
];

const INDUSTRY_LINKS = industries.map((i) => ({
  href: `/for/${i.slug}`,
  label: i.label,
}));

function Wordmark() {
  return (
    <Link
      href="/"
      className="text-xl font-bold tracking-tight text-primary"
      aria-label="포인토 홈"
    >
      포인토
    </Link>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Wordmark />
        {/*
         * 좁은 화면에서는 링크를 감춘다. 폰으로 들어온 사람이 눌러야 하는 건
         * 로그인 하나뿐이고, 나머지는 스크롤하면 다 나온다.
         */}
        <nav className="flex items-center gap-6 text-sm">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="hidden text-muted transition-colors hover:text-foreground sm:block"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/login"
            className="rounded-lg border border-border px-4 py-2 font-semibold transition-colors hover:bg-surface-alt"
          >
            사장님 로그인
          </Link>
        </nav>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-surface-alt">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-col gap-8 sm:flex-row sm:justify-between">
          <div>
            <Wordmark />
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted">
              포스 없이, 태블릿 한 대로 시작하는
              <br />
              가장 간단한 매장 적립 서비스.
            </p>
          </div>

          {/*
           * 업종 링크를 푸터에 둔다. 헤더에 넣으면 항목이 다섯 개가 되어 좁은
           * 화면에서 먼저 잘려 나가고, 무엇보다 이 링크들은 검색으로 들어온
           * 사람이 "우리 업종도 있나"를 확인하는 자리라 아래쪽이 맞다.
           */}
          <div className="grid gap-8 text-sm sm:grid-cols-2 sm:gap-14">
            <nav className="flex flex-col gap-3">
              <p className="font-semibold text-foreground">업종별 안내</p>
              {INDUSTRY_LINKS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-muted transition-colors hover:text-foreground"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <nav className="flex flex-col gap-3">
              <p className="font-semibold text-foreground">포인토</p>
              <Link
                href="/blog"
                className="text-muted transition-colors hover:text-foreground"
              >
                콘텐츠
              </Link>
              <Link
                href="/support"
                className="text-muted transition-colors hover:text-foreground"
              >
                고객지원
              </Link>
              <Link
                href="/privacy"
                className="text-muted transition-colors hover:text-foreground"
              >
                개인정보처리방침
              </Link>
              <a
                href={CONTACT_MAIL}
                className="text-muted transition-colors hover:text-foreground"
              >
                도입 문의
              </a>
            </nav>
          </div>
        </div>

        <div className="mt-10 space-y-2 border-t border-border pt-6 text-[13px] leading-relaxed text-app-text-low">
          {BUSINESS_INFO.length > 0 && (
            <p className="flex flex-wrap gap-x-4 gap-y-1">
              {BUSINESS_INFO.map(([label, value]) => (
                <span key={label}>
                  {label} {value}
                </span>
              ))}
            </p>
          )}
          <p>
            &copy; {new Date().getFullYear()} 룰루랄라 컴퍼니. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default function MarketingLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
}
