/**
 * 점주 계정·매장 데이터 접근.
 *
 * RN 앱 `src/hooks/useFirestore.ts`의 점주 영역을 웹으로 옮긴 것이다.
 * modular API라 로직은 거의 그대로지만 두 가지가 다르다:
 *   - `snap.exists` (RN: 속성) → `snap.exists()` (웹: 메서드)
 *   - `db.batch()` → `writeBatch(db)`
 *
 * 훅이 아니라 순수 함수로 둔 이유: 서버 컴포넌트·이벤트 핸들러 어디서든
 * 부르고 싶고, 렌더마다 새 참조가 생겨 useEffect 의존성이 꼬이는 문제
 * (RN 쪽에서 실제로 겪어 주석까지 달려 있다)를 처음부터 피하기 위함이다.
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { getDb } from "../firebase";
import { DEFAULT_SLOT_LIMIT, type Owner, type Store, type StoreSummary } from "./types";

function normalizePhone(phone: string): string {
  return phone.replace(/[^0-9]/g, "");
}

/** 계정 프로필 조회 */
export async function getOwnerProfile(uid: string): Promise<Owner | undefined> {
  const snap = await getDoc(doc(getDb(), "owners", uid));
  return snap.exists() ? (snap.data() as Owner) : undefined;
}

/** 계정 최초 생성 (이미 있으면 기존 프로필 반환) */
export async function ensureOwnerProfile(
  uid: string,
  email: string,
): Promise<Owner> {
  const ref = doc(getDb(), "owners", uid);
  const snap = await getDoc(ref);
  if (snap.exists()) return snap.data() as Owner;

  const owner: Owner = {
    email,
    createdAt: new Date().toISOString(),
    storeCodes: [],
    slotLimit: DEFAULT_SLOT_LIMIT,
    subscription: null,
  };
  await setDoc(ref, owner);
  return owner;
}

/**
 * 레거시 계정(구글/애플 제공자 id 기반)을 Firebase uid 기반으로 이전한다.
 *
 * Firebase Auth 도입 전에는 `owners/{제공자id}`로 저장했다. 보안 규칙이
 * `request.auth.uid`로 소유권을 판정하므로, 옮겨주지 않으면 점주가 자기 매장에
 * 접근하지 못한다. 앱(useFirestore.migrateLegacyOwner)과 **같은 동작**이어야 한다.
 *
 * - 레거시 문서는 지우지 않고 `migratedTo`만 남긴다 (롤백 여지)
 * - 이미 새 uid 문서가 있으면 건너뛴다 (재실행 안전)
 * - stores.ownerId도 함께 옮긴다. 안 옮기면 매장 쓰기 권한이 끊긴다
 */
export async function migrateLegacyOwner(
  firebaseUid: string,
  legacyUid: string | null,
  email: string,
): Promise<Owner> {
  const db = getDb();
  const newRef = doc(db, "owners", firebaseUid);

  const newSnap = await getDoc(newRef);
  if (newSnap.exists()) return newSnap.data() as Owner;

  if (legacyUid && legacyUid !== firebaseUid) {
    const legacyRef = doc(db, "owners", legacyUid);
    const legacySnap = await getDoc(legacyRef);

    if (legacySnap.exists()) {
      const legacy = legacySnap.data() as Owner;
      const codes = legacy.storeCodes ?? [];

      const batch = writeBatch(db);
      batch.set(newRef, {
        ...legacy,
        email: legacy.email || email,
        legacyUid,
        migratedAt: new Date().toISOString(),
      });
      batch.update(legacyRef, { migratedTo: firebaseUid });
      codes.forEach((code) => {
        batch.update(doc(db, "stores", code), { ownerId: firebaseUid });
      });
      await batch.commit();

      return { ...legacy, email: legacy.email || email };
    }
  }

  return ensureOwnerProfile(firebaseUid, email);
}

/** 계정에 연결된 매장 목록 (스위처용) */
export async function getOwnerStores(uid: string): Promise<StoreSummary[]> {
  const owner = await getOwnerProfile(uid);
  const codes = owner?.storeCodes ?? [];
  const db = getDb();

  // 매장 수가 슬롯 제한(기본 3, 최대 10)을 넘지 않아 병렬 조회로 충분하다.
  const snaps = await Promise.all(
    codes.map((code) => getDoc(doc(db, "stores", code))),
  );

  return snaps.flatMap((snap, i) =>
    snap.exists()
      ? [{ storeCode: codes[i], name: (snap.data() as Store).name ?? codes[i] }]
      : [],
  );
}

/** 단일 매장 조회 */
export async function getStore(code: string): Promise<Store | undefined> {
  const snap = await getDoc(doc(getDb(), "stores", code));
  return snap.exists() ? (snap.data() as Store) : undefined;
}

/** 슬롯 여유 확인 */
export async function getOwnerSlotInfo(
  uid: string,
): Promise<{ current: number; limit: number; canAdd: boolean }> {
  const owner = await getOwnerProfile(uid);
  const current = owner?.storeCodes?.length ?? 0;
  const limit = owner?.slotLimit ?? DEFAULT_SLOT_LIMIT;
  return { current, limit, canAdd: current < limit };
}

/**
 * 전화번호로 등록된 기존 매장을 계정에 흡수(claim).
 * 아직 주인이 없거나 본인 소유인 매장만 연결한다.
 * 기존 다점포 점주는 보유 수만큼 슬롯을 grandfather 한다.
 */
export async function claimStoresByPhone(
  uid: string,
  phone: string,
): Promise<string[]> {
  const db = getDb();
  const snapshot = await getDocs(
    query(
      collection(db, "stores"),
      where("ownerPhone", "==", normalizePhone(phone)),
    ),
  );

  const claimable = snapshot.docs.filter((d) => {
    const owner = d.data().ownerId;
    return !owner || owner === uid;
  });
  if (claimable.length === 0) return [];

  const ownerRef = doc(db, "owners", uid);
  const ownerSnap = await getDoc(ownerRef);
  const existing: string[] = ownerSnap.exists()
    ? (ownerSnap.data()?.storeCodes ?? [])
    : [];
  const merged = Array.from(
    new Set([...existing, ...claimable.map((d) => d.id)]),
  );
  const currentLimit: number = ownerSnap.exists()
    ? (ownerSnap.data()?.slotLimit ?? DEFAULT_SLOT_LIMIT)
    : DEFAULT_SLOT_LIMIT;

  const batch = writeBatch(db);
  claimable.forEach((d) => batch.update(d.ref, { ownerId: uid }));
  batch.update(ownerRef, {
    storeCodes: merged,
    slotLimit: Math.max(currentLimit, merged.length),
  });
  await batch.commit();

  return claimable.map((d) => d.id);
}

/** 탈퇴 요청 — soft delete. 실삭제는 서버 스케줄러가 30일 후 수행한다. */
export async function requestAccountDeletion(uid: string): Promise<void> {
  await updateDoc(doc(getDb(), "owners", uid), {
    accountStatus: "pending_deletion",
    deletedAt: new Date().toISOString(),
  });
}

/** 유예 기간 내 탈퇴 철회 */
export async function restoreAccount(uid: string): Promise<void> {
  await updateDoc(doc(getDb(), "owners", uid), {
    accountStatus: "active",
    deletedAt: null,
  });
}
