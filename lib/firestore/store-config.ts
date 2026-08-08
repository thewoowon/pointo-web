/**
 * 매장 설정 로드·저장.
 *
 * RN `src/hooks/useStoreConfig.ts` + `StoreSettingsScreen`의 저장 로직을 옮겼다.
 *
 * ⚠️ 여기서 제일 조심할 것은 **레거시 매장**이다. 초기 매장들은 쿠폰 id가
 *    `americano` / `beverage`이고, 고객 문서의 `coupons` 맵도 그 키로 쌓여 있다.
 *    설정을 저장할 때 id를 새로 만들어버리면 고객이 이미 보유한 쿠폰이
 *    조회되지 않는다 — 데이터는 남아 있는데 화면에서 사라지는, 되돌리기 어려운
 *    사고다. 그래서 **id는 언제나 기존 것을 유지하고 이름만 바꾼다.**
 */

import { doc, getDoc, updateDoc } from "firebase/firestore";
import { getDb } from "../firebase";
import type { CouponType, StoreConfig } from "./types";

/** 레거시 매장용 쿠폰 타입 (americano/beverage 키를 그대로 사용) */
const LEGACY_COUPON_TYPES: CouponType[] = [
  { id: "americano", name: "아메리카노 쿠폰", description: "무료 쿠폰이 한장 생겨요!" },
  { id: "beverage", name: "음료 쿠폰", description: "무료 쿠폰이 한장 생겨요!" },
];

export const DEFAULT_STORE_CONFIG: StoreConfig = {
  mode: "stamp",
  stampsPerCoupon: 10,
  couponTypes: [
    { id: "coupon_a", name: "무료 쿠폰", description: "무료 쿠폰이 한장 생겨요!" },
  ],
  couponSequence: ["coupon_a"],
  couponExpiryDays: 180,
  levelTiers: [
    { maxLevel: 0, emoji: "🌱", name: "새싹", color: "#6B9E78", bgColor: "rgba(107,158,120,0.12)" },
    { maxLevel: 3, emoji: "⭐", name: "단골", color: "#D4845A", bgColor: "rgba(212,132,90,0.12)" },
    { maxLevel: 7, emoji: "🏆", name: "단골왕", color: "#C89A2E", bgColor: "rgba(200,154,46,0.12)" },
    { maxLevel: Infinity, emoji: "👑", name: "레전드", color: "#9B59B6", bgColor: "rgba(155,89,182,0.12)" },
  ],
  levelIncrementOn: "coupon_a",
  pointPresets: [],
  pointUnit: "원",
  sessionTimeoutSeconds: 60,
  idleTimeoutMs: 300000,
  welcomeLines: ["오늘도 방문해주셔서", "감사합니다!", "스탬프를 적립해보세요."],
  guideLines: ["스탬프 조회 또는 가입을 위해", "전화번호를 입력해주세요."],
  companyName: "룰루랄라 컴퍼니",
  contactEmail: "thewoowon@gmail.com",
};

/**
 * 저장된 값을 실제 사용 설정으로 해석한다. 앱과 **같은 규칙**이어야 한다.
 *
 * 레거시 판정: couponTypes가 없거나, 기본값 `coupon_a` 하나만 있는 경우
 * (= 매장 설정에서 명시적으로 저장한 적이 없는 매장)
 */
export function resolveStoreConfig(raw: Partial<StoreConfig> | undefined): StoreConfig {
  if (!raw) {
    return {
      ...DEFAULT_STORE_CONFIG,
      couponTypes: LEGACY_COUPON_TYPES,
      couponSequence: ["americano", "beverage"],
      levelIncrementOn: "americano",
    };
  }

  const merged = { ...DEFAULT_STORE_CONFIG, ...raw };
  const types = raw.couponTypes;
  const isLegacy = !types || (types.length === 1 && types[0].id === "coupon_a");

  if (isLegacy) {
    merged.couponTypes = LEGACY_COUPON_TYPES;
    merged.couponSequence = ["americano", "beverage"];
    merged.levelIncrementOn = "americano";
  }

  return merged;
}

export async function getStoreConfig(storeCode: string): Promise<StoreConfig> {
  const snap = await getDoc(doc(getDb(), "stores", storeCode));
  const raw = snap.exists()
    ? (snap.data()?.config as Partial<StoreConfig> | undefined)
    : undefined;
  return resolveStoreConfig(raw);
}

export async function updateStoreConfig(
  storeCode: string,
  config: StoreConfig,
): Promise<void> {
  await updateDoc(doc(getDb(), "stores", storeCode), { config });
}

/**
 * 쿠폰 타입을 다시 만든다.
 *
 * **id는 반드시 기존 설정에서 가져온다.** 고객의 `coupons` 맵이 이 id를 키로
 * 쓰고 있어서, 새로 만들면 보유 쿠폰이 화면에서 사라진다.
 */
export function buildCouponTypes(
  current: StoreConfig,
  couponMode: "single" | "dual",
  names: Record<string, string>,
): { couponTypes: CouponType[]; couponSequence: string[] } {
  const description = "무료 쿠폰이 한장 생겨요!";
  const idA = current.couponTypes[0]?.id ?? "coupon_a";

  if (couponMode === "single") {
    return {
      couponTypes: [{ id: idA, name: names[idA] || "무료 쿠폰", description }],
      couponSequence: [idA],
    };
  }

  const idB = current.couponTypes[1]?.id ?? "coupon_b";
  return {
    couponTypes: [
      { id: idA, name: names[idA] || "쿠폰 A", description },
      { id: idB, name: names[idB] || "쿠폰 B", description },
    ],
    couponSequence: [idA, idB],
  };
}
