import type { Metadata } from "next";
import CustomerLookup from "./lookup";

/**
 * 고객 셀프 조회 — `/s/{매장코드}`.
 *
 * 매장 태블릿의 QR이 이 주소를 가리킨다. 손님이 전화번호를 넣으면 그 매장에서의
 * 스탬프·쿠폰·최근내역을 보여준다. **조회 전용이다** — 적립·사용은 매장 태블릿에서만
 * 한다. 웹에서 쓰기를 열려면 번호 소유를 증명해야 하는데(전화번호만으로는 남의
 * 스탬프를 찍을 수 있다) 그건 SMS 인증이 붙는 다음 단계다.
 *
 * 매장 코드를 경로에 두는 이유: QR이 인쇄물로 붙어 있을 수 있어 주소가 안정적이어야
 * 하고, 쿼리스트링보다 공유·북마크가 자연스럽다.
 */

export const metadata: Metadata = {
  title: "내 스탬프 조회 — 포인토",
  description: "전화번호로 이 매장의 내 스탬프와 쿠폰을 확인하세요.",
  // 고객 개인 조회 화면이라 검색에 걸릴 이유가 없다.
  robots: { index: false, follow: false },
};

export default async function CustomerStorePage({
  params,
}: {
  params: Promise<{ storeCode: string }>;
}) {
  const { storeCode } = await params;
  return <CustomerLookup storeCode={storeCode.toUpperCase()} />;
}
