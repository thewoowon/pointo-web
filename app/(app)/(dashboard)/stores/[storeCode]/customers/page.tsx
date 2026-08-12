"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
  filterCustomers,
  getStoreCustomers,
  MIN_QUERY_LENGTH,
  pointsOf,
  type CustomerHit,
} from "@/lib/firestore/users";
import {
  DEFAULT_STORE_CONFIG,
  getStoreConfig,
} from "@/lib/firestore/store-config";
import type { StoreConfig } from "@/lib/firestore/types";
import { maskPhone } from "@/lib/format";
import { Spinner } from "@/components/ui/spinner";
import { CustomerDetail } from "@/components/customer-detail";

/**
 * 고객 검색 — RN CustomerSearchSheet의 웹 버전.
 *
 * 앱과 같은 전략: 매장 고객을 1회 통째로 읽어 메모리에서 필터한다.
 * Firestore가 substring 검색을 못 하기 때문이고, 타이핑마다 쿼리를 날리는
 * 것보다 빠르며 읽기 비용도 싸다.
 *
 * 데스크톱은 시트 대신 좌우 2단으로 둔다. 목록에서 고객을 고르면 오른쪽에
 * 이력이 뜨고, 검색어를 바꿔도 선택이 유지돼 여러 고객을 비교하기 쉽다.
 */
export default function CustomersPage() {
  const { storeCode } = useParams<{ storeCode: string }>();

  const [customers, setCustomers] = useState<CustomerHit[] | null>(null);
  // 보유량을 무슨 단위로 읽을지는 매장 모드가 정한다 (스탬프 개수 / 포인트 금액).
  // 설정을 못 읽어도 목록은 떠야 하므로 기본값(스탬프)으로 시작한다.
  const [config, setConfig] = useState<StoreConfig>(DEFAULT_STORE_CONFIG);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<CustomerHit | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const [list, storeConfig] = await Promise.all([
          getStoreCustomers(storeCode),
          getStoreConfig(storeCode),
        ]);
        if (cancelled) return;
        setConfig(storeConfig);
        setCustomers(list);
      } catch (e) {
        if (cancelled) return;
        console.error("[customers] 조회 실패:", e);
        setError("고객 목록을 불러오지 못했어요.");
        setCustomers([]);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [storeCode]);

  const digits = query.replace(/\D/g, "");
  const results = useMemo(
    () => (customers ? filterCustomers(customers, digits) : []),
    [customers, digits],
  );

  const tooShort = digits.length < MIN_QUERY_LENGTH;
  const isPoint = config.mode === "point";

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      {/* 검색 + 결과 */}
      <section>
        <label htmlFor="customer-search" className="sr-only">
          전화번호로 고객 검색
        </label>
        <input
          id="customer-search"
          type="tel"
          inputMode="numeric"
          autoComplete="off"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="전화번호 뒷자리로 검색"
          className="tabular h-12 w-full rounded-app-sm border border-app-line px-4 text-base outline-none transition placeholder:text-app-text-low focus:border-app-brand"
        />

        <p className="mt-2 text-sm text-app-text-low">
          {customers === null
            ? "고객을 불러오는 중"
            : `전체 ${customers.length}명`}
        </p>

        {error ? (
          <p className="mt-4 rounded-app-sm bg-app-container px-4 py-3 text-sm text-app-text-warning">
            {error}
          </p>
        ) : null}

        <div className="mt-4">
          {customers === null ? (
            <div className="flex justify-center py-16">
              <Spinner className="h-6 w-6 text-app-brand" />
            </div>
          ) : tooShort ? (
            <p className="rounded-app-md border border-dashed border-app-line-strong px-5 py-12 text-center text-sm text-app-text-mid">
              전화번호를 {MIN_QUERY_LENGTH}자리 이상 입력해주세요
            </p>
          ) : results.length === 0 ? (
            <p className="rounded-app-md border border-dashed border-app-line-strong px-5 py-12 text-center text-sm text-app-text-mid">
              일치하는 고객이 없어요
            </p>
          ) : (
            <ul className="divide-y divide-app-line rounded-app-md border border-app-line">
              {results.map((customer) => {
                const active = selected?.phone === customer.phone;
                return (
                  <li key={customer.phone}>
                    <button
                      type="button"
                      onClick={() => setSelected(customer)}
                      aria-current={active ? "true" : undefined}
                      className={`flex w-full items-center gap-4 px-5 py-4 text-left transition ${
                        active ? "bg-app-brand-subtle" : "hover:bg-app-container"
                      }`}
                    >
                      <span className="tabular text-sm font-medium">
                        {maskPhone(customer.phone)}
                      </span>
                      <span className="ml-auto text-sm text-app-text-mid">
                        {isPoint ? "포인트" : "스탬프"}{" "}
                        <span className="tabular font-semibold text-app-text-highest">
                          {isPoint
                            ? `${pointsOf(customer).toLocaleString()}${config.pointUnit}`
                            : (customer.stamps ?? 0)}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>

      {/* 선택된 고객 상세 */}
      <section>
        {selected ? (
          <CustomerDetail
            key={selected.phone}
            storeCode={storeCode}
            customer={selected}
            config={config}
          />
        ) : (
          <div className="rounded-app-md border border-dashed border-app-line-strong px-5 py-16 text-center text-sm text-app-text-mid">
            고객을 선택하면 적립 이력이 여기에 표시됩니다
          </div>
        )}
      </section>
    </div>
  );
}
