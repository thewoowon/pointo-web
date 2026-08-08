"use client";

/**
 * 설정 폼용 입력 요소들.
 *
 * 컴포넌트를 파일 최상위에 두는 이유: 렌더 함수 안에서 정의하면 매 렌더마다
 * 새 타입이 되어 입력 중 포커스가 날아간다. (RN 설정 화면에도 같은 이유의
 * 주석이 달려 있다)
 */

export function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-app-md border border-app-line px-5 py-5">
      <h2 className="text-sm font-semibold text-app-text-high">{title}</h2>
      {description ? (
        <p className="mt-1 text-xs text-app-text-low">{description}</p>
      ) : null}
      <div className="mt-4 flex flex-col gap-4">{children}</div>
    </section>
  );
}

export function Field({
  label,
  value,
  onChange,
  type = "text",
  hint,
  inputMode,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "email";
  hint?: string;
  inputMode?: "numeric" | "text" | "email";
}) {
  return (
    <label className="block">
      <span className="text-sm text-app-text-mid">{label}</span>
      <input
        type={type}
        inputMode={inputMode}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`mt-1.5 h-11 w-full rounded-app-sm border border-app-line px-3.5 text-base outline-none transition focus:border-app-brand ${
          inputMode === "numeric" ? "tabular" : ""
        }`}
      />
      {hint ? <span className="mt-1 block text-xs text-app-text-low">{hint}</span> : null}
    </label>
  );
}

/** 두 개 이상의 선택지 중 하나 (운영 모드, 쿠폰 개수 등) */
export function Choice<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string; description?: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <div>
      <span className="text-sm text-app-text-mid">{label}</span>
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        {options.map((option) => {
          const active = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              aria-pressed={active}
              className={`rounded-app-sm border px-4 py-3 text-left transition ${
                active
                  ? "border-app-brand bg-app-brand-subtle"
                  : "border-app-line hover:bg-app-container"
              }`}
            >
              <span className="block text-sm font-medium">{option.label}</span>
              {option.description ? (
                <span className="mt-0.5 block text-xs text-app-text-low">
                  {option.description}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
