/**
 * 매장 고객 조회.
 *
 * RN `useFirestore.ts`의 users 영역을 옮긴 것이다. 문서 ID가
 * `{전화번호}_{매장코드}` 복합 형태(레거시는 전화번호 단독)라, 화면에서
 * 쓰는 `phone`을 얻으려면 접미사를 떼야 한다. 안 떼면 logs의 phone_number와
 * 키가 어긋나 고객-이력 연결이 조용히 깨진다.
 */

import { collection, getDocs, query, where } from "firebase/firestore";
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

  // 같은 번호가 문서 두 개로 존재할 수 있다.
  //   레거시: `01012345678`        (매장 분리 이전에 만들어진 문서)
  //   복합:   `01012345678_ABC123`
  // 접미사만 떼고 그대로 내보내면 목록에 같은 사람이 두 번 나오고 회원 수도
  // 부풀려진다. 실제로 카페 그랑에 10건 있었다.
  //
  // 복합 문서를 우선한다 — 앱의 _resolveUserDoc이 복합을 먼저 찾으므로,
  // 키오스크가 실제로 읽고 쓰는 쪽이 복합이다. 레거시를 보여주면 고객이
  // 화면에서 보는 값과 어긋난다.
  const byPhone = new Map<string, CustomerHit>();
  for (const d of snapshot.docs) {
    const phone = stripStoreSuffix(d.id);
    const isComposite = d.id.includes("_");
    if (!byPhone.has(phone) || isComposite) {
      byPhone.set(phone, { phone, ...(d.data() as User) });
    }
  }

  return [...byPhone.values()];
}

/**
 * 매장 회원 수 — **고유 전화번호 수**.
 *
 * 서버 집계(getCountFromServer)가 읽기 비용은 훨씬 싸지만 쓰지 않는다.
 * 그건 *문서* 수를 세는데, 같은 사람이 레거시/복합 문서 두 개로 존재할 수
 * 있어서 실제 회원 수보다 많게 나온다. 사장님에게 보여주는 숫자가 틀리는 것보다
 * 읽기 몇 건 더 쓰는 편이 낫다.
 */
export async function getStoreCustomerCount(storeCode: string): Promise<number> {
  return (await getStoreCustomers(storeCode)).length;
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
