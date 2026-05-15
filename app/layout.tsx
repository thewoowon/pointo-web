import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "포인토 — 사장님도 고객도 편한 스탬프 앱",
  description:
    "종이 쿠폰은 잃어버리고, 앱은 복잡하고. 포인토는 전화번호 하나로 스탬프 적립부터 쿠폰 발급까지. 카페 사장님과 고객 모두를 위한 가장 간단한 스탬프 서비스.",
  openGraph: {
    title: "포인토 — 사장님도 고객도 편한 스탬프 앱",
    description:
      "전화번호 하나로 스탬프 적립부터 쿠폰 발급까지. 가장 간단한 카페 스탬프 서비스.",
    type: "website",
  },
};

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
