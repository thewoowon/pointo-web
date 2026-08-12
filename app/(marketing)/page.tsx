import Image from "next/image";

import { AppStoreButton, ContactButton } from "@/components/marketing/cta";
import { Testimonials } from "@/components/marketing/testimonials";
import { stats, toManCheon, withComma } from "@/content/stats";

/**
 * 랜딩(hellopointo.com).
 *
 * 이 페이지의 이미지는 전부 `public/screenshot/`의 파생본이다. App Store
 * 스크린샷에서 상단 카피를 잘라내고 개인정보를 가린 것으로, **배경색이 우리
 * 토큰과 같다**(스탬프 화면=브랜드 블루, 나머지=container 회색). 그래서
 * 이미지를 놓을 때는 섹션 배경을 반드시 맞춰야 한다. 배경이 어긋나면 이미지
 * 주위에 네모난 자국이 그대로 드러난다.
 * 자세한 건 scripts/crop-screenshots.py 참고.
 */

export default function Home() {
  return (
    <main className="flex-1">
      <Hero />
      <PaperVsPointo />
      <Features />
      <Testimonials />
      <HowItWorks />
      <ClosingCta />
    </main>
  );
}

/* ────────────────────────────────────────────────────────────────────────
   히어로
   ──────────────────────────────────────────────────────────────────────── */

function Hero() {
  return (
    // 스크린샷 배경이 정확히 이 파랑이라 폰이 배경에서 솟은 것처럼 이어진다.
    <section className="relative overflow-hidden bg-primary text-white">
      <div className="mx-auto grid max-w-6xl gap-4 px-6 pt-14 sm:pt-20 lg:grid-cols-[1.08fr_0.92fr] lg:gap-10 lg:pt-24">
        <div className="lg:pb-24">
          <p className="text-[13px] font-semibold tracking-wide text-white/70 sm:text-sm">
            카페 · 볼링장 · 미용실 · 학원 · 동네 어디든
          </p>
          <h1 className="mt-4 text-[2rem] font-bold leading-[1.25] sm:text-5xl sm:leading-[1.2]">
            포스 없이,
            <br />
            태블릿 한 대로
            <br />
            단골을 만듭니다
          </h1>
          <p className="mt-6 max-w-md text-[17px] leading-relaxed text-white/85 sm:text-lg">
            고객은 전화번호만 누르면 적립 끝. 사장님은 앱 하나로 적립·쿠폰·
            통계까지. 종이 쿠폰과 포스 사이에 없던 선택지입니다.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <AppStoreButton tone="on-brand" />
            <ContactButton tone="on-brand" />
          </div>
          {/* 숫자는 content/stats.ts 한 곳에서만 온다. 손으로 고치지 말 것. */}
          <dl className="mt-12 grid max-w-lg grid-cols-3 gap-4 border-t border-white/20 pt-7">
            <Stat
              value={`${withComma(stats.customers)}명`}
              label="누적 가입 고객"
            />
            <Stat
              value={`${toManCheon(stats.events)}건`}
              label="쌓인 적립·사용"
            />
            <Stat value="0원" label="포스·쿠폰 인쇄 비용" />
          </dl>
        </div>

        {/* 폰은 섹션 바닥에 붙여 잘린 아래쪽이 화면 밖으로 이어지게 둔다. */}
        <div className="flex items-end justify-center lg:justify-end">
          <Image
            src="/screenshot/phone-stamp.webp"
            alt="포인토 고객 화면 — 이름과 함께 모인 스탬프 6개, 사용 가능한 쿠폰이 보인다"
            width={900}
            height={1487}
            priority
            className="w-[276px] max-w-full sm:w-[330px] lg:w-[380px]"
          />
        </div>
      </div>
    </section>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <dt className="tabular text-2xl font-bold sm:text-[28px]">{value}</dt>
      <dd className="mt-1 text-[13px] leading-snug text-white/70">{label}</dd>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────
   종이 쿠폰과의 대비 — 이모지 카드 그리드를 대신하는 자리
   ──────────────────────────────────────────────────────────────────────── */

const PAPER = [
  "도장을 찍어 주고, 잃어버렸다고 하면 그만큼 다시 채워 준다",
  "이번 달에 몇 명이 다시 왔는지 알 방법이 없다",
  "다 쓰면 또 인쇄한다. 디자인 바꾸면 또 처음부터",
];

const POINTO = [
  "고객이 번호를 누르면 적립. 잃어버릴 게 없다",
  "오늘 방문·신규·쿠폰 사용이 숫자로 남는다",
  "인쇄물이 없으니 바꾸는 데 비용이 들지 않는다",
];

function PaperVsPointo() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="max-w-xl text-[26px] font-bold leading-snug sm:text-[34px]">
          종이 쿠폰은, 사장님이 대신 일해 줘야 굴러갑니다
        </h2>
        <div className="mt-10 grid gap-4 sm:mt-12 lg:grid-cols-2 lg:gap-6">
          <div className="rounded-app-xl bg-surface-alt p-7 sm:p-9">
            <p className="text-sm font-semibold text-muted">지금까지</p>
            <ul className="mt-5 space-y-4">
              {PAPER.map((line) => (
                <li key={line} className="flex gap-3 text-muted">
                  <span
                    aria-hidden="true"
                    className="mt-2 h-px w-4 shrink-0 bg-app-line-strong"
                  />
                  <span className="text-[15px] leading-relaxed sm:text-base">
                    {line}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-app-xl border border-primary/15 bg-app-brand-subtle p-7 shadow-app-sm sm:p-9">
            <p className="text-sm font-semibold text-primary">포인토를 쓰면</p>
            <ul className="mt-5 space-y-4">
              {POINTO.map((line) => (
                <li key={line} className="flex gap-3">
                  <Check />
                  <span className="text-[15px] leading-relaxed text-app-text-high sm:text-base">
                    {line}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function Check() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
      className="mt-1 shrink-0 text-primary"
    >
      <path
        d="M4.5 10.5 8 14l7.5-8"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ────────────────────────────────────────────────────────────────────────
   제품 투어 — 화면을 좌우로 번갈아 놓아 스크롤에 리듬을 준다
   ──────────────────────────────────────────────────────────────────────── */

function Features() {
  return (
    // 배경색이 스크린샷 배경(#f1f5f9)과 같아야 이미지 테두리가 보이지 않는다.
    <section id="features" className="bg-surface-alt">
      <div className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
        <div className="max-w-xl">
          <p className="text-sm font-semibold text-primary">화면으로 보기</p>
          <h2 className="mt-3 text-[26px] font-bold leading-snug sm:text-[34px]">
            설명서가 필요 없는 화면만 남겼습니다
          </h2>
        </div>

        <div className="mt-14 space-y-20 sm:mt-16 sm:space-y-28">
          <FeatureRow
            index="01"
            title="고객이 하는 일은 번호를 누르는 것뿐"
            body="앱 설치도, 회원가입도, 카드 발급도 없습니다. 매장 태블릿에 전화번호를 넣으면 그 자리에서 적립됩니다."
            bullets={[
              "첫 방문 고객도 같은 화면에서 바로 가입",
              "전화번호 외에는 아무것도 받지 않습니다",
            ]}
            image="phone-keypad"
            alt="전화번호 입력 화면 — 숫자 키패드와 010-1234-5678 입력란"
            width={900}
            height={1523}
          />

          <FeatureRow
            index="02"
            title="스탬프로 할지 포인트로 할지, 매장이 정합니다"
            body="열 잔에 한 잔이 맞는 곳이 있고, 금액만큼 쌓아 두는 편이 맞는 곳이 있습니다. 운영 방식을 매장별로 고르세요."
            bullets={[
              "스탬프 개수·쿠폰 종류·환영 문구까지 설정",
              "카페가 아니어도 됩니다. 게임 수, 이용 횟수 무엇이든",
            ]}
            image="phone-points"
            alt="매장 설정 화면과 포인트 적립 화면 — 5,044P가 쌓여 있다"
            width={900}
            height={1484}
            reverse
          />

          <WideShot
            index="03"
            title="오늘 무엇이 오갔는지, 한 화면에"
            body="적립과 사용이 시간 순으로 쌓입니다. 한 건을 누르면 그 고객이 무엇을 썼는지까지 이어서 볼 수 있어요."
            image="tablet-logs"
            alt="태블릿 적립내역 화면 — 날짜별 적립·사용 목록과 오른쪽 상세 패널"
            width={1800}
            height={1064}
          />

          <FeatureRow
            index="04"
            title="포스가 없어도, 사장님이 직접 적립합니다"
            body="번호 뒷자리만 알면 고객을 찾아 바로 적립할 수 있습니다. 손님이 태블릿 앞에 서 있지 않아도 됩니다."
            bullets={[
              "뒷자리 두 자리만으로 검색",
              "적립 실수는 내역에서 되돌리기",
            ]}
            image="phone-search"
            alt="고객 검색 화면 — 번호 뒷자리로 고객을 찾아 적립한다"
            width={900}
            height={1523}
          />

          {/* 같은 "내 매장" 화면이라도 폰 스크린샷은 쓰지 않는다.
              로그인 배지가 카카오로 찍혀 있어서 없는 로그인 수단을 광고하게
              된다. 태블릿 쪽은 Google로 나온다. */}
          <WideShot
            index="05"
            title="매장이 여러 곳이어도 계정은 하나"
            body="구글이나 애플 계정으로 한 번 로그인하면 운영 중인 매장이 모두 보입니다. 매장마다 코드를 외울 필요가 없습니다."
            image="tablet-stores"
            alt="내 매장 화면 — 한 계정에 운영 중인 매장이 목록으로 보인다"
            width={1800}
            height={795}
          />
        </div>
      </div>
    </section>
  );
}

type FeatureRowProps = {
  index: string;
  title: string;
  body: string;
  bullets: string[];
  image: string;
  alt: string;
  width: number;
  height: number;
  reverse?: boolean;
};

function FeatureRow({
  index,
  title,
  body,
  bullets,
  image,
  alt,
  width,
  height,
  reverse = false,
}: FeatureRowProps) {
  return (
    <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
      <div className={reverse ? "lg:order-2" : undefined}>
        <p className="tabular text-sm font-semibold text-primary">{index}</p>
        <h3 className="mt-3 text-[22px] font-bold leading-snug sm:text-[28px]">
          {title}
        </h3>
        <p className="mt-4 max-w-md text-[15px] leading-relaxed text-muted sm:text-base">
          {body}
        </p>
        <ul className="mt-6 space-y-3">
          {bullets.map((b) => (
            <li key={b} className="flex gap-3">
              <Check />
              <span className="text-[15px] text-app-text-high">{b}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className={`flex justify-center ${reverse ? "lg:order-1" : ""}`}>
        <Image
          src={`/screenshot/${image}.webp`}
          alt={alt}
          width={width}
          height={height}
          sizes="(max-width: 1024px) 320px, 400px"
          className="w-[300px] max-w-full sm:w-[340px] lg:w-[400px]"
        />
      </div>
    </div>
  );
}

function WideShot({
  index,
  title,
  body,
  image,
  alt,
  width,
  height,
}: Omit<FeatureRowProps, "bullets" | "reverse">) {
  return (
    <div>
      <div className="max-w-lg">
        <p className="tabular text-sm font-semibold text-primary">{index}</p>
        <h3 className="mt-3 text-[22px] font-bold leading-snug sm:text-[28px]">
          {title}
        </h3>
        <p className="mt-4 text-[15px] leading-relaxed text-muted sm:text-base">
          {body}
        </p>
      </div>
      <Image
        src={`/screenshot/${image}.webp`}
        alt={alt}
        width={width}
        height={height}
        sizes="(max-width: 1152px) 100vw, 1152px"
        className="mt-8 w-full"
      />
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────
   시작하는 법
   ──────────────────────────────────────────────────────────────────────── */

const STEPS = [
  {
    title: "앱을 받고 매장을 등록합니다",
    body: "구글이나 애플 계정으로 로그인한 뒤 매장 정보를 넣으면 됩니다. 준비물은 쓰던 태블릿 한 대.",
  },
  {
    title: "우리 매장 방식을 고릅니다",
    body: "스탬프 개수, 쿠폰 종류, 환영 문구를 정하세요. 나중에 언제든 바꿀 수 있습니다.",
  },
  {
    title: "태블릿을 손님 쪽으로 돌려 둡니다",
    body: "이제 고객이 번호를 누르면 적립됩니다. 사장님이 해야 할 일은 여기서 끝납니다.",
  },
];

function HowItWorks() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="max-w-lg text-[26px] font-bold leading-snug sm:text-[34px]">
          오늘 신청하면, 오늘 적립을 시작합니다
        </h2>
        <ol className="mt-12 grid gap-10 sm:grid-cols-3 sm:gap-8">
          {STEPS.map((step, i) => (
            <li key={step.title} className="border-t-2 border-primary pt-6">
              <p className="tabular text-sm font-semibold text-primary">
                STEP {i + 1}
              </p>
              <h3 className="mt-2 text-lg font-semibold leading-snug">
                {step.title}
              </h3>
              <p className="mt-3 text-[15px] leading-relaxed text-muted">
                {step.body}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────────────────
   맺음 CTA
   ──────────────────────────────────────────────────────────────────────── */

function ClosingCta() {
  return (
    <section className="bg-primary text-white">
      <div className="mx-auto max-w-6xl px-6 py-20 text-center sm:py-24">
        <h2 className="text-[26px] font-bold leading-snug sm:text-[34px]">
          쿠폰 한 번 인쇄할 비용이면,
          <br className="sm:hidden" /> 계속 씁니다
        </h2>
        <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-white/85 sm:text-base">
          어떤 업종인지, 지금 어떻게 적립하고 계신지만 알려주세요. 우리 매장에
          맞는 설정까지 같이 잡아 드립니다.
        </p>
        <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
          <AppStoreButton tone="on-brand" />
          <ContactButton tone="on-brand" />
        </div>
      </div>
    </section>
  );
}
