"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  buildCouponTypes,
  getStoreConfig,
  updateStoreConfig,
} from "@/lib/firestore/store-config";
import type { PointPreset, StoreConfig } from "@/lib/firestore/types";
import { Choice, Field, Section } from "@/components/ui/field";
import { FullScreenSpinner, Spinner } from "@/components/ui/spinner";

/**
 * 매장 설정 — RN StoreSettingsScreen의 웹 버전.
 *
 * 저장은 `{...기존 설정, ...수정분}` 형태다. 화면에서 편집하지 않는 값
 * (레벨 티어, 대기화면 문구 등)을 날리지 않기 위함이다.
 */
export default function StoreSettingsPage() {
  const { storeCode } = useParams<{ storeCode: string }>();
  const [config, setConfig] = useState<StoreConfig | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const loaded = await getStoreConfig(storeCode);
        if (!cancelled) setConfig(loaded);
      } catch (e) {
        console.error("[settings] 설정 조회 실패:", e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [storeCode]);

  if (!config) return <FullScreenSpinner label="설정을 불러오는 중" />;

  // 로드된 설정을 초기값으로 폼을 새로 마운트한다.
  return <SettingsForm key={storeCode} storeCode={storeCode} initial={config} />;
}

type Status = "idle" | "saving" | "saved" | "error";

function SettingsForm({
  storeCode,
  initial,
}: {
  storeCode: string;
  initial: StoreConfig;
}) {
  const [mode, setMode] = useState<StoreConfig["mode"]>(initial.mode);
  const [couponMode, setCouponMode] = useState<"single" | "dual">(
    initial.couponTypes.length > 1 ? "dual" : "single",
  );
  const [couponNames, setCouponNames] = useState<Record<string, string>>(() =>
    Object.fromEntries(initial.couponTypes.map((c) => [c.id, c.name])),
  );

  const [stampsPerCoupon, setStampsPerCoupon] = useState(
    String(initial.stampsPerCoupon),
  );
  const [couponExpiryDays, setCouponExpiryDays] = useState(
    String(initial.couponExpiryDays),
  );
  const [pointUnit, setPointUnit] = useState(initial.pointUnit);
  const [presets, setPresets] = useState<PointPreset[]>(initial.pointPresets ?? []);
  const [sessionTimeout, setSessionTimeout] = useState(
    String(initial.sessionTimeoutSeconds),
  );
  const [idleTimeout, setIdleTimeout] = useState(
    String(Math.round(initial.idleTimeoutMs / 1000)),
  );
  const [guide0, setGuide0] = useState(initial.guideLines[0] ?? "");
  const [guide1, setGuide1] = useState(initial.guideLines[1] ?? "");
  const [companyName, setCompanyName] = useState(initial.companyName);
  const [contactEmail, setContactEmail] = useState(initial.contactEmail);

  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string | null>(null);

  const couponIds =
    couponMode === "single"
      ? [initial.couponTypes[0]?.id ?? "coupon_a"]
      : [
          initial.couponTypes[0]?.id ?? "coupon_a",
          initial.couponTypes[1]?.id ?? "coupon_b",
        ];

  const handleSave = async () => {
    const fail = (text: string) => {
      setStatus("error");
      setMessage(text);
    };

    const session = Number.parseInt(sessionTimeout, 10);
    if (Number.isNaN(session) || session < 10) {
      return fail("세션 유지 시간은 10초 이상이어야 해요.");
    }

    const idle = Number.parseInt(idleTimeout, 10);
    if (Number.isNaN(idle) || idle < 5) {
      return fail("대기화면 전환 시간은 5초 이상이어야 해요.");
    }

    const expiry = Number.parseInt(couponExpiryDays, 10);
    if (Number.isNaN(expiry) || expiry < 0) {
      return fail("쿠폰 유효기간은 0 이상이어야 해요. (0 = 무기한)");
    }

    let stamps = initial.stampsPerCoupon;
    let coupons = {
      couponTypes: initial.couponTypes,
      couponSequence: initial.couponSequence,
    };

    if (mode === "stamp") {
      stamps = Number.parseInt(stampsPerCoupon, 10);
      if (Number.isNaN(stamps) || stamps < 1) {
        return fail("쿠폰당 스탬프 수는 1 이상이어야 해요.");
      }
      coupons = buildCouponTypes(initial, couponMode, couponNames);
    }

    setStatus("saving");
    setMessage(null);

    try {
      await updateStoreConfig(storeCode, {
        // 편집하지 않는 값(레벨 티어 등)을 보존한다
        ...initial,
        mode,
        stampsPerCoupon: stamps,
        couponExpiryDays: expiry,
        sessionTimeoutSeconds: session,
        idleTimeoutMs: idle * 1000,
        companyName,
        contactEmail,
        guideLines: [guide0, guide1].filter((line) => line.length > 0),
        couponTypes: coupons.couponTypes,
        couponSequence: coupons.couponSequence,
        levelIncrementOn: coupons.couponSequence[0],
        pointPresets: presets,
        pointUnit,
      });
      setStatus("saved");
      setMessage("설정이 반영되었어요.");
    } catch (e) {
      console.error("[settings] 저장 실패:", e);
      setStatus("error");
      setMessage("저장하지 못했어요. 잠시 후 다시 시도해주세요.");
    }
  };

  return (
    <div className="flex max-w-2xl flex-col gap-5">
      <Section
        title="운영 모드"
        description="매장이 스탬프를 모으는 방식인지, 금액 기반 포인트인지 정합니다."
      >
        <Choice
          label="모드"
          value={mode}
          onChange={setMode}
          options={[
            { value: "stamp", label: "스탬프", description: "n개 모으면 쿠폰" },
            { value: "point", label: "포인트", description: "금액만큼 적립" },
          ]}
        />
      </Section>

      {mode === "stamp" ? (
        <>
          <Section title="스탬프">
            <Field
              label="쿠폰당 스탬프 수"
              value={stampsPerCoupon}
              onChange={setStampsPerCoupon}
              inputMode="numeric"
            />
          </Section>

          <Section
            title="쿠폰"
            description="쿠폰 이름만 바꿉니다. 고객이 이미 보유한 쿠폰은 그대로 유지돼요."
          >
            <Choice
              label="쿠폰 종류"
              value={couponMode}
              onChange={setCouponMode}
              options={[
                { value: "single", label: "1종" },
                { value: "dual", label: "2종", description: "번갈아 발급" },
              ]}
            />

            {couponIds.map((id, index) => (
              <Field
                key={id}
                label={couponMode === "single" ? "쿠폰 이름" : `쿠폰 ${index + 1} 이름`}
                value={couponNames[id] ?? ""}
                onChange={(value) =>
                  setCouponNames((prev) => ({ ...prev, [id]: value }))
                }
              />
            ))}

            <Field
              label="쿠폰 유효기간 (일)"
              value={couponExpiryDays}
              onChange={setCouponExpiryDays}
              inputMode="numeric"
              hint="0으로 두면 무기한이에요."
            />
          </Section>
        </>
      ) : (
        <Section title="포인트">
          <Field label="단위 표시" value={pointUnit} onChange={setPointUnit} />
          <PresetEditor presets={presets} onChange={setPresets} />
        </Section>
      )}

      <Section title="세션 / 타이밍">
        <Field
          label="세션 유지 시간 (초)"
          value={sessionTimeout}
          onChange={setSessionTimeout}
          inputMode="numeric"
        />
        <Field
          label="대기화면 전환 시간 (초)"
          value={idleTimeout}
          onChange={setIdleTimeout}
          inputMode="numeric"
        />
      </Section>

      <Section title="안내 메시지" description="고객 태블릿 첫 화면에 보이는 문구입니다.">
        <Field label="1줄" value={guide0} onChange={setGuide0} />
        <Field label="2줄" value={guide1} onChange={setGuide1} />
      </Section>

      <Section title="회사 정보">
        <Field label="회사명" value={companyName} onChange={setCompanyName} />
        <Field
          label="연락처 이메일"
          value={contactEmail}
          onChange={setContactEmail}
          type="email"
          inputMode="email"
        />
      </Section>

      <div className="flex items-center gap-4 pb-4">
        <button
          type="button"
          onClick={handleSave}
          disabled={status === "saving"}
          className="flex h-12 min-w-32 items-center justify-center rounded-app-sm bg-app-brand px-6 text-sm font-semibold text-app-text-on-brand transition hover:bg-app-brand-hover disabled:opacity-60"
        >
          {status === "saving" ? <Spinner className="h-5 w-5" /> : "저장"}
        </button>

        {message ? (
          <p
            className={`text-sm ${
              status === "error" ? "text-app-text-warning" : "text-app-text-mid"
            }`}
          >
            {message}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function PresetEditor({
  presets,
  onChange,
}: {
  presets: PointPreset[];
  onChange: (presets: PointPreset[]) => void;
}) {
  const [name, setName] = useState("");
  const [points, setPoints] = useState("");

  const add = () => {
    const value = Number.parseInt(points, 10);
    if (!name.trim() || Number.isNaN(value) || value <= 0) return;
    onChange([
      ...presets,
      { id: `preset_${Date.now()}`, name: name.trim(), points: value },
    ]);
    setName("");
    setPoints("");
  };

  return (
    <div>
      <span className="text-sm text-app-text-mid">적립 프리셋</span>

      {presets.length > 0 ? (
        <ul className="mt-2 divide-y divide-app-line rounded-app-sm border border-app-line">
          {presets.map((preset) => (
            <li key={preset.id} className="flex items-center gap-3 px-3.5 py-2.5">
              <span className="text-sm">{preset.name}</span>
              <span className="tabular ml-auto text-sm text-app-text-mid">
                {preset.points}
              </span>
              <button
                type="button"
                onClick={() => onChange(presets.filter((p) => p.id !== preset.id))}
                className="text-sm text-app-text-low transition hover:text-app-text-warning"
                aria-label={`${preset.name} 삭제`}
              >
                삭제
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-xs text-app-text-low">아직 프리셋이 없어요.</p>
      )}

      <div className="mt-3 flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="이름"
          className="h-11 flex-1 rounded-app-sm border border-app-line px-3.5 text-sm outline-none transition focus:border-app-brand"
        />
        <input
          value={points}
          onChange={(e) => setPoints(e.target.value)}
          inputMode="numeric"
          placeholder="값"
          className="tabular h-11 w-24 rounded-app-sm border border-app-line px-3.5 text-sm outline-none transition focus:border-app-brand"
        />
        <button
          type="button"
          onClick={add}
          className="h-11 shrink-0 rounded-app-sm border border-app-line px-4 text-sm font-medium transition hover:bg-app-container"
        >
          추가
        </button>
      </div>
    </div>
  );
}
