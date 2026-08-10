/**
 * 고객 본인 조회 — 전화번호 한 건.
 *
 * RN 앱 `useFirestore._resolveUserDoc` / `src/utils/coupons.ts`와 **같은 규칙**이어야
 * 한다. 어긋나면 고객이 매장 태블릿에서 본 값과 웹에서 본 값이 달라진다.
 *
 * 목록 조회(list)를 절대 쓰지 않는다는 점이 중요하다. 규칙상 users 목록은 점주
 * 전용이고, 익명 세션에는 단건 조회(get)만 열려 있다.
 */

import { doc, getDoc } from "firebase/firestore";
import { getDb } from "../firebase";
import { resolveStoreConfig } from "./store-config";
import type { CouponType, LevelTier, RecentLog, StoreConfig, User } from "./types";

/** 숫자만 남긴다. 앱의 normalizePhone과 같다. */
export function normalizePhone(phone: string): string {
  return phone.replace(/[^0-9]/g, "");
}

/** 국내 휴대폰 번호로 볼 수 있는 형태인지 (010… 10~11자리) */
export function isValidPhone(phone: string): boolean {
  const digits = normalizePhone(phone);
  return /^01[016789][0-9]{7,8}$/.test(digits);
}

/** '010-1234-5678' */
export function formatPhone(phone: string): string {
  const d = normalizePhone(phone);
  if (d.length === 11) return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
  return d;
}

/** 뒤 네 자리만 남긴다. 화면에 번호를 통째로 되비추지 않기 위해. */
export function maskPhone(phone: string): string {
  const d = normalizePhone(phone);
  return d.length >= 4 ? `···· ${d.slice(-4)}` : d;
}

export interface CouponEntry {
  key: string;
  typeId: string;
  name: string;
  /** 발급일(ISO). 발급 시점 기록 전에 나간 레거시 장은 null */
  issuedAt: string | null;
  /** 만료일 'YYYY. M. D'. 무기한이거나 발급일 미상이면 null */
  expiry: string | null;
}

export interface CustomerView {
  storeName: string;
  config: StoreConfig;
  phone: string;
  level: number;
  tier: LevelTier | null;
  /** 스탬프 모드=현재 스탬프 수, 포인트 모드=보유 포인트 */
  stamps: number;
  coupons: CouponEntry[];
  recentLogs: RecentLog[];
  lastUsed: string;
}

/**
 * 레거시 쿠폰 키를 현재 매장의 쿠폰 id로 옮긴다.
 * 앱 `normalizeUser`와 같은 규칙 — 안 맞추면 오래된 매장의 고객이 보유한 쿠폰이
 * 화면에서 사라진다(데이터는 남아 있는데 안 보이는, 설명하기 어려운 사고다).
 */
function remapLegacyCoupons(
  raw: Record<string, number> | undefined,
  couponTypes: CouponType[],
): Record<string, number> {
  const firstId = couponTypes[0]?.id ?? "americano";
  const secondId = couponTypes[1]?.id ?? "beverage";
  const out: Record<string, number> = {};

  for (const [key, value] of Object.entries(raw ?? {})) {
    if (key === "americano" && firstId !== "americano") out[firstId] = value;
    else if (key === "beverage" && secondId !== "beverage") out[secondId] = value;
    else out[key] = value;
  }
  return out;
}

/** 앱 `getLevelInfo`와 동일 */
function resolveTier(level: number, tiers: LevelTier[]): LevelTier | null {
  if (!tiers?.length) return null;
  const sorted = [...tiers].sort((a, b) => a.maxLevel - b.maxLevel);
  for (const tier of sorted) {
    if (level <= tier.maxLevel) return tier;
  }
  return sorted[sorted.length - 1];
}

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * 보유 쿠폰을 장 단위로 펼친다. 만료 임박한 순.
 *
 * 앱 `buildCouponEntries` + `filterExpiredCoupons`를 합친 것이다. 개수의 정답은
 * `coupons[typeId]`이고 `couponIssuedAt[typeId]`는 그보다 짧을 수 있다 — 발급
 * 시점을 기록하기 전에 나간 장들이라 만료 판정에서 제외한다(만료시키지 않는다).
 */
function buildCoupons(
  coupons: Record<string, number>,
  issuedAt: Record<string, string[]> | undefined,
  couponTypes: CouponType[],
  expiryDays: number,
): CouponEntry[] {
  const now = Date.now();
  const entries: CouponEntry[] = [];

  for (const ct of couponTypes) {
    const count = coupons[ct.id] ?? 0;
    const dates = issuedAt?.[ct.id] ?? [];

    for (let i = 0; i < count; i++) {
      const issued = dates[i] ?? null;

      // 만료된 장은 아예 빼고 보여준다. 앱도 조회 시점에 걸러낸 값을 쓴다.
      if (issued && expiryDays > 0) {
        const elapsed = (now - new Date(issued).getTime()) / DAY_MS;
        if (elapsed >= expiryDays) continue;
      }

      entries.push({
        key: `${ct.id}-${i}`,
        typeId: ct.id,
        name: ct.name,
        issuedAt: issued,
        expiry:
          issued && expiryDays > 0
            ? new Date(new Date(issued).getTime() + expiryDays * DAY_MS)
                .toLocaleDateString("ko-KR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
            : null,
      });
    }
  }

  return entries.sort((a, b) => {
    if (a.issuedAt && b.issuedAt) return a.issuedAt.localeCompare(b.issuedAt);
    if (a.issuedAt) return -1;
    if (b.issuedAt) return 1;
    return 0;
  });
}

/** 매장 이름 + 설정. 매장이 없으면 null */
export async function getStoreForCustomer(
  storeCode: string,
): Promise<{ name: string; config: StoreConfig } | null> {
  const snap = await getDoc(doc(getDb(), "stores", storeCode));
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    name: (data?.name as string) ?? "",
    config: resolveStoreConfig(data?.config),
  };
}

/**
 * 전화번호로 고객 문서 한 건을 읽는다.
 *
 * 복합 ID(`{전화번호}_{매장코드}`)를 먼저 보고, 없으면 레거시(전화번호 단독)로
 * 폴백한다 — 앱 `_resolveUserDoc`과 같은 순서다. 레거시 문서는 `store_code`가
 * 정확히 일치할 때만 인정한다. 안 그러면 다른 매장 고객의 잔액이 보인다.
 */
export async function findCustomer(
  storeCode: string,
  rawPhone: string,
  store: { name: string; config: StoreConfig },
): Promise<CustomerView | null> {
  const db = getDb();
  const phone = normalizePhone(rawPhone);

  let data: User | null = null;

  const compositeSnap = await getDoc(doc(db, "users", `${phone}_${storeCode}`));
  if (compositeSnap.exists()) {
    data = compositeSnap.data() as User;
  } else {
    const legacySnap = await getDoc(doc(db, "users", phone));
    if (legacySnap.exists()) {
      const legacy = legacySnap.data() as User;
      if (legacy.store_code === storeCode) data = legacy;
    }
  }

  if (!data) return null;

  const config = store.config;
  const coupons = remapLegacyCoupons(data.coupons, config.couponTypes);
  const level = data.level ?? 0;

  return {
    storeName: store.name,
    config,
    phone,
    level,
    tier: resolveTier(level, config.levelTiers),
    stamps: data.stamps ?? 0,
    coupons: buildCoupons(
      coupons,
      data.couponIssuedAt,
      config.couponTypes,
      config.couponExpiryDays,
    ),
    recentLogs: Array.isArray(data.recentLogs) ? data.recentLogs : [],
    lastUsed: data.last_used ?? "",
  };
}
