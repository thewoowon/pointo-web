/**
 * 매장 고객 조회.
 *
 * RN `useFirestore.ts`의 users 영역을 옮긴 것이다. 문서 ID가
 * `{전화번호}_{매장코드}` 복합 형태(레거시는 전화번호 단독)라, 화면에서
 * 쓰는 `phone`을 얻으려면 접미사를 떼야 한다. 안 떼면 logs의 phone_number와
 * 키가 어긋나 고객-이력 연결이 조용히 깨진다.
 */

import {
  collection,
  getCountFromServer,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { getDb } from "../firebase";
import type { User } from "./types";

export type CustomerHit = User & { phone: string };

/** 이 자리수부터 결과를 보여준다. 너무 짧으면 매장 전체가 다 걸린다. */
export const MIN_QUERY_LENGTH = 2;

/** 복합 문서 ID에서 전화번호만 뽑는다. 레거시 문서는 그대로 통과. */
export function stripStoreSuffix(docId: string): string {
  const idx = docId.indexOf("_");
  return idx === -1 ? docId : docId.slice(0, idx);
}

/**
 * 매장의 전체 고객을 한 번에 읽는다.
 *
 * Firestore는 substring 검색을 못 하므로, 앱과 같은 전략을 쓴다: 매장 고객을
 * 통째로 받아 메모리에서 필터한다. 매장당 수백~수천 명 규모라 타이핑마다
 * 쿼리를 날리는 것보다 빠르고 읽기 비용도 싸다.
 */
export async function getStoreCustomers(
  storeCode: string,
): Promise<CustomerHit[]> {
  const snapshot = await getDocs(
    query(collection(getDb(), "users"), where("store_code", "==", storeCode)),
  );

  return snapshot.docs.map((d) => ({
    phone: stripStoreSuffix(d.id),
    ...(d.data() as User),
  }));
}

/**
 * 매장 회원 수.
 *
 * 문서를 전부 받지 않고 서버 집계로 센다. 통계 화면은 숫자 하나만 필요하므로
 * 수천 건을 내려받을 이유가 없다. (보안 규칙 관점에서는 일반 목록 조회와 동일)
 */
export async function getStoreCustomerCount(storeCode: string): Promise<number> {
  const snapshot = await getCountFromServer(
    query(collection(getDb(), "users"), where("store_code", "==", storeCode)),
  );
  return snapshot.data().count;
}

/**
 * 입력한 숫자로 고객을 거른다.
 *
 * 정렬 규칙은 앱(useCustomerSearch)과 같다: 점주는 보통 **뒷자리**를
 * 입력하므로 끝자리 일치를 먼저 띄우고, 그다음 최근 방문순으로 둔다.
 */
export function filterCustomers(
  customers: CustomerHit[],
  digits: string,
): CustomerHit[] {
  if (digits.length < MIN_QUERY_LENGTH) return [];

  return customers
    .filter((c) => c.phone.includes(digits))
    .sort((a, b) => {
      const aTail = a.phone.endsWith(digits) ? 1 : 0;
      const bTail = b.phone.endsWith(digits) ? 1 : 0;
      if (aTail !== bTail) return bTail - aTail;
      return (b.last_used ?? "").localeCompare(a.last_used ?? "");
    });
}
