import Link from "next/link";

/**
 * 마케팅 사이트 레이아웃 (hellopointo.com 랜딩).
 *
 * 루트 레이아웃에 있던 헤더/푸터를 여기로 내렸다. 점주 대시보드(`(app)`)는
 * 자체 셸을 쓰므로 이 크롬이 붙으면 안 된다.
 */

function Header() {
  return (
    <header className="sticky top-0 z-50 bg-surface/80 backdrop-blur-md border-b border-border">
      <div className="max-w-5xl mx-auto flex items-center justify-between px-6 h-16">
        <Link href="/" className="text-xl font-bold text-primary">
          포인토
        </Link>
        <nav className="flex items-center gap-6 text-sm text-muted">
          <Link href="/privacy" className="hover:text-foreground transition-colors">
            개인정보처리방침
          </Link>
          <Link href="/support" className="hover:text-foreground transition-colors">
            고객지원
          </Link>
          <Link
            href="/login"
            className="rounded-lg bg-primary px-4 py-2 font-semibold text-white transition-colors hover:bg-primary-dark"
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
    <footer className="border-t border-border py-10 mt-auto">
      <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted">
        <p>&copy; 2025 룰루랄라 컴퍼니. All rights reserved.</p>
        <div className="flex gap-6">
          <Link href="/privacy" className="hover:text-foreground transition-colors">
            개인정보처리방침
          </Link>
          <Link href="/support" className="hover:text-foreground transition-colors">
            고객지원
          </Link>
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
