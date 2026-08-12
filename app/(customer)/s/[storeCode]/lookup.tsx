"use client";

import { useCallback, useEffect, useState } from "react";
import {
  findCustomer,
  formatPhone,
  getStoreForCustomer,
  isValidPhone,
  maskPhone,
  normalizePhone,
  type CustomerView,
} from "@/lib/firestore/customer";
import { ensureCustomerSession } from "@/lib/customer-session";
import type { StoreConfig } from "@/lib/firestore/types";
import { Spinner } from "@/components/ui/spinner";

type Store = { name: string; config: StoreConfig };

/** 매장 로딩 → 번호 입력 → 결과. 상태가 셋뿐이라 훅으로 빼지 않았다. */
export default function CustomerLookup({ storeCode }: { storeCode: string }) {
  const [store, setStore] = useState<Store | null>(null);
  const [storeError, setStoreError] = useState<string | null>(null);

  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<CustomerView | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 매장 정보는 들어오자마자 읽는다. 이름이 보여야 손님이 "맞게 찍었구나"를 안다.
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        await ensureCustomerSession();
        const found = await getStoreForCustomer(storeCode);
        if (!alive) return;
        if (!found) {
          setStoreError("존재하지 않는 매장이에요. QR을 다시 확인해주세요.");
          return;
        }
        setStore(found);
      } catch {
        if (alive) setStoreError("매장 정보를 불러오지 못했어요.");
      }
    })();
    return () => {
      alive = false;
    };
  }, [storeCode]);

  const lookup = useCallback(async () => {
    if (!store || !isValidPhone(phone)) return;
    setBusy(true);
    setError(null);
    setNotFound(false);
    try {
      await ensureCustomerSession();
      const found = await findCustomer(storeCode, phone, store);
      if (found) setResult(found);
      else setNotFound(true);
    } catch {
      setError("조회에 실패했어요. 잠시 후 다시 시도해주세요.");
    } finally {
      setBusy(false);
    }
  }, [phone, store, storeCode]);

  const reset = () => {
    setResult(null);
    setNotFound(false);
    setPhone("");
  };

  if (storeError) {
    return (
      <Centered>
        <p className="text-app-text-mid">{storeError}</p>
      </Centered>
    );
  }

  if (!store) {
    return (
      <Centered>
        <Spinner className="h-6 w-6 text-app-brand" />
      </Centered>
    );
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 py-8">
      <header className="mb-8 text-center">
        <p className="text-sm text-app-text-mid">{store.name}</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">
          {result ? "내 적립 현황" : "내 스탬프 조회"}
        </h1>
      </header>

      {result ? (
        <Result view={result} onReset={reset} />
      ) : (
        <PhoneForm
          phone={phone}
          setPhone={setPhone}
          onSubmit={lookup}
          busy={busy}
          notFound={notFound}
          error={error}
        />
      )}

      <footer className="mt-auto pt-10 text-center text-xs leading-relaxed text-app-text-low">
        적립과 쿠폰 사용은 매장 기기에서만 가능해요.
        <br />
        이 화면은 확인 전용입니다.
      </footer>
    </div>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh items-center justify-center px-6 text-center">
      {children}
    </div>
  );
}

function PhoneForm({
  phone,
  setPhone,
  onSubmit,
  busy,
  notFound,
  error,
}: {
  phone: string;
  setPhone: (v: string) => void;
  onSubmit: () => void;
  busy: boolean;
  notFound: boolean;
  error: string | null;
}) {
  const valid = isValidPhone(phone);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="rounded-app-lg bg-app-bg p-6 shadow-sm"
    >
      <label htmlFor="phone" className="block text-sm text-app-text-mid">
        매장에 등록한 전화번호
      </label>
      <input
        id="phone"
        type="tel"
        inputMode="numeric"
        autoComplete="tel"
        placeholder="010-0000-0000"
        // 화면에는 하이픈이 보이지만 상태에는 숫자만 담는다. 검증·조회가 한 가지
        // 표현만 다루게 해서 "왜 안 찾아지지" 류의 버그를 없앤다.
        value={formatPhone(phone)}
        onChange={(e) => setPhone(normalizePhone(e.target.value).slice(0, 11))}
        className="tabular mt-2 w-full rounded-app-sm border border-app-line px-4 py-3 text-lg outline-none transition focus:border-app-brand"
      />

      {notFound && (
        <p className="mt-3 text-sm text-app-text-warning">
          이 번호로 적립된 내역이 없어요. 매장에서 먼저 적립해주세요.
        </p>
      )}
      {error && <p className="mt-3 text-sm text-app-text-warning">{error}</p>}

      <button
        type="submit"
        disabled={!valid || busy}
        className="mt-5 w-full rounded-app-sm bg-app-brand py-3.5 font-semibold text-app-text-on-brand transition hover:bg-app-brand-hover disabled:bg-app-disabled disabled:text-app-text-low"
      >
        {busy ? "조회 중…" : "조회하기"}
      </button>
    </form>
  );
}

function Result({
  view,
  onReset,
}: {
  view: CustomerView;
  onReset: () => void;
}) {
  const isPoint = view.config.mode === "point";

  return (
    <div className="space-y-4">
      <section className="rounded-app-lg bg-app-bg p-6 text-center shadow-sm">
        <p className="text-sm text-app-text-mid">{maskPhone(view.phone)}</p>

        {view.tier && (
          <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-app-container px-2.5 py-1 text-xs text-app-text-high">
            <span>LV.{view.level}</span>
            <span>{view.tier.name}</span>
            <span aria-hidden>{view.tier.emoji}</span>
          </p>
        )}

        {isPoint ? (
          <p className="tabular mt-4 text-4xl font-bold text-app-brand">
            {view.points.toLocaleString()}
            <span className="ml-1 text-xl">{view.config.pointUnit}</span>
          </p>
        ) : (
          <StampGrid
            stamps={view.stamps}
            perCoupon={view.config.stampsPerCoupon}
          />
        )}
      </section>

      <section className="rounded-app-lg bg-app-bg p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-app-text-high">
          보유 쿠폰 {view.coupons.length}장
        </h2>
        {view.coupons.length === 0 ? (
          <p className="mt-3 text-sm text-app-text-low">
            아직 사용할 수 있는 쿠폰이 없어요.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {view.coupons.map((c) => (
              <li
                key={c.key}
                className="flex items-center justify-between rounded-app-sm bg-app-brand-subtle px-4 py-3"
              >
                <span className="text-sm font-medium text-app-text-high">
                  {c.name}
                </span>
                <span className="text-xs text-app-text-mid">
                  {c.expiry ? `${c.expiry}까지` : "기한 없음"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {view.recentLogs.length > 0 && (
        <section className="rounded-app-lg bg-app-bg p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-app-text-high">최근 내역</h2>
          <ul className="mt-3 space-y-3">
            {view.recentLogs.map((log, i) => {
              const earned = log.action === "stamp_saved";
              return (
                <li
                  key={`${log.at}-${i}`}
                  className="flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <span
                      className={`inline-block rounded-app-xs px-1.5 py-0.5 text-[11px] font-medium ${
                        earned
                          ? "bg-app-earn-bg text-app-earn-fg"
                          : "bg-app-use-bg text-app-use-fg"
                      }`}
                    >
                      {earned ? "적립" : "사용"}
                    </span>
                    {log.note && (
                      <span className="ml-2 truncate text-sm text-app-text-high">
                        {log.note}
                      </span>
                    )}
                  </div>
                  <span className="tabular shrink-0 text-xs text-app-text-low">
                    {formatLogDate(log.at)}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <button
        type="button"
        onClick={onReset}
        className="w-full rounded-app-sm border border-app-line bg-app-bg py-3 text-sm font-medium text-app-text-mid transition hover:bg-app-container"
      >
        다른 번호 조회
      </button>
    </div>
  );
}

/** 스탬프판. 쿠폰 한 장에 필요한 칸 수만큼 그린다. */
function StampGrid({
  stamps,
  perCoupon,
}: {
  stamps: number;
  perCoupon: number;
}) {
  // 설정이 깨진 매장에서 0이나 음수가 들어오면 나누기가 무너진다.
  const total = perCoupon > 0 ? perCoupon : 10;
  const filled = Math.min(stamps, total);

  return (
    <div className="mt-5">
      <p className="tabular text-3xl font-bold">
        {stamps}
        <span className="text-lg font-medium text-app-text-low">
          {" "}
          / {total}
        </span>
      </p>
      <div className="mt-4 grid grid-cols-5 gap-2">
        {Array.from({ length: total }, (_, i) => (
          <div
            key={i}
            className={`aspect-square rounded-full ${
              i < filled ? "bg-app-brand" : "bg-app-container"
            }`}
          />
        ))}
      </div>
      <p className="mt-4 text-sm text-app-text-mid">
        {filled >= total
          ? "쿠폰을 받을 수 있어요!"
          : `쿠폰까지 ${total - filled}개 남았어요`}
      </p>
    </div>
  );
}

/** '8월 4일' — 올해가 아니면 연도까지 */
function formatLogDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const sameYear = d.getFullYear() === new Date().getFullYear();
  return d.toLocaleDateString("ko-KR", {
    year: sameYear ? undefined : "numeric",
    month: "long",
    day: "numeric",
  });
}
