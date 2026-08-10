/**
 * 고객 화면 레이아웃.
 *
 * 마케팅 헤더/푸터도, 점주 대시보드 셸도 붙이지 않는다. 이 페이지는 매장에서
 * QR을 찍고 들어온 손님이 몇 초 보고 나가는 화면이라 크롬이 방해가 된다.
 */
export default function CustomerLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <main className="min-h-dvh bg-app-container">{children}</main>;
}
