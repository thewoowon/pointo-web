import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

/**
 * 루트 레이아웃 — html/body, 폰트, 전역 스타일만 담당한다.
 *
 * 헤더/푸터 같은 마케팅 크롬은 `(marketing)/layout.tsx`로 내렸다.
 * 점주 대시보드인 `(app)`은 그 크롬을 쓰지 않기 때문이다.
 */

/*
 * Pretendard — RN 앱과 같은 서체. 시스템 한글 폴백(Apple SD Gothic Neo 등)은
 * 기기마다 자간과 굵기가 달라서, 앱은 Pretendard인데 웹만 딴 얼굴이 됐다.
 *
 * 원본 Variable은 2MB라 랜딩에 그냥 얹을 수 없어 KS X 1001 한글 2,350자 +
 * 라틴·문장부호로 서브셋했다(456KB). 한 파일로 45~920 굵기를 모두 커버한다.
 * 서브셋 밖의 희귀 음절(사람·매장 이름에 드물게 나온다)은 폴백으로 떨어진다.
 * 만드는 법은 docs/fonts.md 참고.
 */
const pretendard = localFont({
  src: "./fonts/PretendardVariable.subset.woff2",
  weight: "45 920",
  style: "normal",
  display: "swap",
  variable: "--font-pretendard",
  fallback: [
    "-apple-system",
    "BlinkMacSystemFont",
    "Apple SD Gothic Neo",
    "Malgun Gothic",
    "system-ui",
    "sans-serif",
  ],
});

const SITE_URL = "https://hellopointo.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "포인토 — 포스 없이, 태블릿 하나로 단골 관리",
    template: "%s · 포인토",
  },
  description:
    "종이 쿠폰은 잃어버리고, 포스는 비싸고. 포인토는 태블릿 한 대로 적립부터 쿠폰 발급까지 끝냅니다. 카페·볼링장·미용실 어디든, 고객은 전화번호만 입력하면 됩니다.",
  keywords: [
    "포인토",
    "스탬프 앱",
    "적립 앱",
    "종이 쿠폰 대체",
    "매장 단골 관리",
    "포스 없이 적립",
  ],
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: SITE_URL,
    siteName: "포인토",
    title: "포인토 — 포스 없이, 태블릿 하나로 단골 관리",
    description:
      "고객은 전화번호만 입력. 사장님은 태블릿 하나로 적립·쿠폰·통계까지. 가장 간단한 매장 적립 서비스.",
  },
  twitter: {
    card: "summary_large_image",
    title: "포인토 — 포스 없이, 태블릿 하나로 단골 관리",
    description:
      "고객은 전화번호만 입력. 사장님은 태블릿 하나로 적립·쿠폰·통계까지.",
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
      className={`${pretendard.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
