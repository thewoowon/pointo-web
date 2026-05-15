export default function Home() {
  return (
    <main className="flex-1">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-6 pt-24 pb-20 sm:pt-32 sm:pb-28">
          <div className="max-w-2xl">
            <p className="text-primary font-semibold text-sm tracking-wide mb-4">
              카페 스탬프, 이제 앱 하나로
            </p>
            <h1 className="text-4xl sm:text-5xl font-bold leading-tight tracking-tight">
              종이 쿠폰은 그만.
              <br />
              <span className="text-primary">전화번호 하나</span>로 끝.
            </h1>
            <p className="mt-6 text-lg text-muted leading-relaxed max-w-lg">
              고객은 전화번호만 입력하면 스탬프 적립. 사장님은 태블릿 하나로 매장
              관리. 카페 운영의 가장 간단한 시작, 포인토.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <a
                href="https://apps.apple.com/app/id6763893004"
                className="inline-flex items-center justify-center gap-2 bg-primary text-white font-semibold px-8 py-4 rounded-xl hover:bg-primary-dark transition-colors text-base"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                </svg>
                App Store에서 다운로드
              </a>
              <a
                href="#features"
                className="inline-flex items-center justify-center font-semibold px-8 py-4 rounded-xl border border-border hover:bg-surface transition-colors text-base"
              >
                기능 알아보기
              </a>
            </div>
          </div>
        </div>
        {/* Decorative gradient */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* Social proof */}
      <section className="bg-surface-alt">
        <div className="max-w-5xl mx-auto px-6 py-12 flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-16 text-center">
          <div>
            <p className="text-3xl font-bold text-primary">1,170+</p>
            <p className="text-sm text-muted mt-1">가입 고객 수</p>
          </div>
          <div className="hidden sm:block w-px h-10 bg-border" />
          <div>
            <p className="text-3xl font-bold text-primary">10초</p>
            <p className="text-sm text-muted mt-1">스탬프 적립 소요 시간</p>
          </div>
          <div className="hidden sm:block w-px h-10 bg-border" />
          <div>
            <p className="text-3xl font-bold text-primary">0원</p>
            <p className="text-sm text-muted mt-1">종이 쿠폰 비용</p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 sm:py-28">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              왜 포인토인가요?
            </h2>
            <p className="mt-4 text-muted text-lg max-w-md mx-auto">
              복잡한 건 빼고, 필요한 것만 담았습니다.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              emoji="📱"
              title="전화번호만으로 가입"
              description="앱 설치, 회원가입, 카드 발급 필요 없이 전화번호 입력 한 번이면 스탬프가 쌓입니다."
            />
            <FeatureCard
              emoji="☕"
              title="자동 쿠폰 발급"
              description="스탬프가 다 차면 자동으로 무료 음료 쿠폰이 발급됩니다. 잊어버릴 일이 없어요."
            />
            <FeatureCard
              emoji="📊"
              title="매장 대시보드"
              description="오늘 방문 고객 수, 신규 가입, 쿠폰 사용률까지. 사장님이 알아야 할 숫자를 한눈에."
            />
            <FeatureCard
              emoji="🎨"
              title="카페별 맞춤 설정"
              description="스탬프 개수, 쿠폰 종류, 환영 메시지까지. 우리 카페에 맞게 자유롭게 설정하세요."
            />
            <FeatureCard
              emoji="🏆"
              title="등급 시스템"
              description="새싹 → 단골 → 단골왕 → 레전드. 고객이 다시 찾아오게 만드는 리텐션 장치."
            />
            <FeatureCard
              emoji="🔒"
              title="개인정보 최소 수집"
              description="전화번호 외에는 아무것도 수집하지 않습니다. 심플하고 안전합니다."
            />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 sm:py-28 bg-surface-alt">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              이렇게 사용해요
            </h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-12">
            <StepCard
              step="1"
              title="카페 등록"
              description="앱에서 카페를 등록하고 승인을 받으세요. 태블릿 하나면 준비 끝."
            />
            <StepCard
              step="2"
              title="고객이 전화번호 입력"
              description="고객이 매장 태블릿에 전화번호를 입력하면 자동으로 스탬프가 적립됩니다."
            />
            <StepCard
              step="3"
              title="쿠폰 자동 발급"
              description="스탬프가 다 차면 무료 음료 쿠폰이 자동 발급. 고객도 사장님도 신경 쓸 게 없어요."
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 sm:py-28">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            지금 바로 시작하세요
          </h2>
          <p className="mt-4 text-muted text-lg max-w-md mx-auto">
            종이 쿠폰 주문하는 비용이면 한 달 내내 쓸 수 있어요.
          </p>
          <div className="mt-10">
            <a
              href="https://apps.apple.com/app/id6763893004"
              className="inline-flex items-center justify-center gap-2 bg-primary text-white font-semibold px-10 py-4 rounded-xl hover:bg-primary-dark transition-colors text-lg"
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
              </svg>
              App Store에서 다운로드
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}

function FeatureCard({
  emoji,
  title,
  description,
}: {
  emoji: string;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-surface rounded-2xl border border-border p-7 hover:shadow-sm transition-shadow">
      <div className="text-3xl mb-4">{emoji}</div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted text-sm leading-relaxed">{description}</p>
    </div>
  );
}

function StepCard({
  step,
  title,
  description,
}: {
  step: string;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center">
      <div className="w-12 h-12 rounded-full bg-primary text-white text-xl font-bold flex items-center justify-center mx-auto mb-5">
        {step}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted text-sm leading-relaxed">{description}</p>
    </div>
  );
}
