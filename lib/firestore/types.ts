/**
 * Firestore 도메인 타입.
 *
 * RN 앱(레포 KBffee)의 `index.d.ts`와 **같은 컬렉션을 공유**한다.
 * 한쪽만 바꾸면 두 클라이언트가 어긋나므로 함께 고칠 것.
 */

export interface CouponType {
  id: string;
  name: string;
  description: string;
}

export interface PointPreset {
  id: string;
  name: string;
  points: number;
}

export interface LevelTier {
  maxLevel: number;
  emoji: string;
  name: string;
  color: string;
  bgColor: string;
}

export interface StoreConfig {
  /** 'stamp' = 스탬프 카드 모델, 'point' = 포인트(적립금) 모델 */
  mode: "stamp" | "point";
  // 스탬프 모드 전용
  stampsPerCoupon: number;
  couponTypes: CouponType[];
  couponSequence: string[];
  levelIncrementOn: string;
  // 포인트 모드 전용
  pointPresets: PointPreset[];
  pointUnit: string;
  /** 쿠폰 유효기간 (일). 0이면 무기한 */
  couponExpiryDays: number;
  // 공통
  levelTiers: LevelTier[];
  sessionTimeoutSeconds: number;
  idleTimeoutMs: number;
  welcomeLines: string[];
  guideLines: string[];
  companyName: string;
  contactEmail: string;
}

export interface Store {
  last_logged: string;
  name?: string;
  ownerPhone?: string;
  createdAt?: string;
  status?: "pending" | "approved";
  config?: StoreConfig;
  /** 계정에 연결된 경우의 소유자 Firebase uid */
  ownerId?: string;
}

/** 점주 계정. `owners/{Firebase uid}` */
export interface Owner {
  email: string;
  createdAt: string;
  storeCodes: string[];
  slotLimit: number;
  subscription?: {
    status: "active" | "expired" | "none";
    productId?: string;
    expiresAt?: string;
  } | null;
  /** 'pending_deletion'이면 30일 유예 중 — 매장 접근을 막는다 */
  accountStatus?: "active" | "pending_deletion";
  deletedAt?: string | null;
  /** 이전 전 제공자 id (마이그레이션된 계정에만) */
  legacyUid?: string;
  migratedAt?: string;
  /** 레거시 문서에만 남는 표식 */
  migratedTo?: string;
}

/**
 * 고객 화면 "최근내역"용 이력 한 줄. `logs` 컬렉션과 별개로 users 문서에
 * 비정규화해 둔다 — logs 읽기는 점주 전용(firestore.rules)이라 익명 세션인
 * 키오스크·고객 웹이 조회할 수 없기 때문이다.
 */
export interface RecentLog {
  action: "stamp_saved" | "stamp_used";
  /** 포인트 모드=포인트 수, 스탬프 모드=스탬프 수(쿠폰 사용이면 장수) */
  amount: number;
  /** 발생 시각 (ISO 8601) */
  at: string;
  /** 표시용 부가 설명. 쿠폰 사용이면 '아메리카노 쿠폰 1장' 같은 문구 */
  note?: string;
}

export interface User {
  last_used: string;
  level: number;
  stamps: number;
  phase: string;
  coupons: Record<string, number>;
  couponIssuedAt?: Record<string, string[]>;
  /** 최근 적립/사용 이력 (최신순). 없으면 아직 한 번도 안 쌓인 문서 */
  recentLogs?: RecentLog[];
  hasRated?: boolean | null;
  created_at?: string;
  store_code?: string;
}

export interface Log {
  id?: string;
  action: "stamp_saved" | "stamp_used";
  phone_number: string;
  timestamp: Date;
  stamp: number;
  note: string;
  store_code?: string;
  user_level?: number;
  coupons_issued?: number;
}

/** 스위처에 뿌릴 매장 요약 */
export interface StoreSummary {
  storeCode: string;
  name: string;
}

/** 이메일 계정당 기본 스토어 슬롯 수. 구독 시 확장 */
export const DEFAULT_SLOT_LIMIT = 3;
export const SUBSCRIBED_SLOT_LIMIT = 10;
