import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

/**
 * 루트 레이아웃 — html/body, 폰트, 전역 스타일만 담당한다.
 *
 * 헤더/푸터 같은 마케팅 크롬은 `(marketing)/layout.tsx`로 내렸다.
 * 점주 대시보드인 `(app)`은 그 크롬을 쓰지 않기 때문이다.
 */

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
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
