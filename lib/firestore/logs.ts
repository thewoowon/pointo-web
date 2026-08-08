/**
 * 적립/사용 이력 조회.
 *
 * RN `useFirestore.ts`의 로그 영역을 옮긴 것이다. 한 가지를 바꿨다:
 * 앱은 새 로그를 `getLogsAfter`로 **폴링**하지만, 웹은 `onSnapshot`으로
 * 구독한다. 규칙상 점주는 자기 매장 로그를 list 할 수 있으므로 그대로 되고,
 * 폴링 간격만큼의 지연과 중복 읽기가 사라진다.
 *
 * ⚠️ 모든 쿼리는 `store_code` 필터가 **반드시** 있어야 한다. 보안 규칙이
 *    매장 소유를 문서 단위로 검사하므로, 필터가 없으면 전체 쿼리가 거부된다.
 */

import {
  collection,
  getDocs,
  limit as limitTo,
  onSnapshot,
  orderBy,
  query,
  startAfter,
  where,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { getDb } from "../firebase";
import { fromDateKey } from "../format";
import type { Log } from "./types";

/** 하루치 목록의 상한. 앱과 같은 값. */
const DAILY_LIMIT = 200;

function toLog(doc: QueryDocumentSnapshot): Log {
  const data = doc.data();
  return {
    id: doc.id,
    ...(data as Omit<Log, "id" | "timestamp">),
    // Firestore Timestamp → Date
    timestamp: data.timestamp?.toDate?.() ?? new Date(0),
  };
}

/** 해당 날짜의 시작/끝 (로컬 기준) */
function dayRange(dateKey: string): { start: Date; end: Date } {
  const start = fromDateKey(dateKey);
  const end = fromDateKey(dateKey);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

/**
 * 특정 날짜의 적립 내역을 구독한다.
 *
 * @returns 구독 해제 함수
 */
export function subscribeDailyLogs(
  storeCode: string,
  dateKey: string,
  onChange: (logs: Log[]) => void,
  onError: (error: Error) => void,
): () => void {
  const { start, end } = dayRange(dateKey);

  const q = query(
    collection(getDb(), "logs"),
    where("store_code", "==", storeCode),
    where("timestamp", ">=", start),
    where("timestamp", "<=", end),
    orderBy("timestamp", "desc"),
    limitTo(DAILY_LIMIT),
  );

  return onSnapshot(
    q,
    (snapshot) => onChange(snapshot.docs.map(toLog)),
    onError,
  );
}

/**
 * 기간 내 로그를 전부 가져온다. (통계용)
 *
 * 하루치와 달리 상한을 두지 않고 페이지네이션으로 끝까지 읽는다. 통계는
 * 누락되면 수치가 조용히 틀리기 때문이다. 앱의 getLogsInRange와 같은 방식.
 */
export async function getLogsInRange(
  storeCode: string,
  startKey: string,
  endKey: string,
): Promise<Log[]> {
  const start = fromDateKey(startKey);
  const end = fromDateKey(endKey);
  end.setHours(23, 59, 59, 999);

  const PAGE_SIZE = 500;
  const results: Log[] = [];
  let cursor: QueryDocumentSnapshot | undefined;

  while (true) {
    const constraints = [
      where("store_code", "==", storeCode),
      where("timestamp", ">=", start),
      where("timestamp", "<=", end),
      orderBy("timestamp", "desc"),
      limitTo(PAGE_SIZE),
      ...(cursor ? [startAfter(cursor)] : []),
    ];

    const snapshot = await getDocs(query(collection(getDb(), "logs"), ...constraints));
    if (snapshot.empty) break;

    results.push(...snapshot.docs.map(toLog));

    if (snapshot.docs.length < PAGE_SIZE) break;
    cursor = snapshot.docs[snapshot.docs.length - 1];
  }

  return results;
}

/**
 * 한 고객의 최근 이력을 구독한다. (고객 상세 패널)
 *
 * 전화번호는 매장 간 중복될 수 있어 store_code를 함께 건다.
 */
export function subscribeCustomerLogs(
  storeCode: string,
  phone: string,
  onChange: (logs: Log[]) => void,
  onError: (error: Error) => void,
): () => void {
  const q = query(
    collection(getDb(), "logs"),
    where("store_code", "==", storeCode),
    where("phone_number", "==", phone),
    orderBy("timestamp", "desc"),
    limitTo(50),
  );

  return onSnapshot(
    q,
    (snapshot) => onChange(snapshot.docs.map(toLog)),
    onError,
  );
}
