import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "고객지원 — 포인토",
  description: "포인토 서비스 이용 중 궁금한 점이 있으시면 문의해주세요.",
};

export default function SupportPage() {
  return (
    <main className="flex-1 py-16 sm:py-24">
      <div className="max-w-3xl mx-auto px-6">
        <h1 className="mb-4 text-[26px] font-bold leading-snug sm:text-[34px]">
          고객지원
        </h1>
        <p className="mb-16 text-[17px] leading-relaxed text-muted">
          포인토 이용 중 궁금한 점이 있으시면 언제든 문의해주세요.
        </p>

        {/* Contact */}
        <section className="mb-16">
          <h2 className="text-xl font-semibold mb-6">문의하기</h2>
          <div className="bg-surface rounded-2xl border border-border p-8">
            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 text-lg">
                  @
                </div>
                <div>
                  <p className="font-medium mb-1">이메일 문의</p>
                  <a
                    href="mailto:thewoowon@gmail.com"
                    className="text-primary hover:underline"
                  >
                    thewoowon@gmail.com
                  </a>
                  <p className="text-muted text-sm mt-1">
                    영업일 기준 24시간 이내 답변드립니다.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section>
          <h2 className="text-xl font-semibold mb-6">자주 묻는 질문</h2>
          <div className="space-y-4">
            <FaqItem
              question="카페가 아닌데 써도 되나요?"
              answer="네. 적립 방식을 매장에서 정하기 때문에 볼링장, 미용실, 학원처럼 재방문이 있는 곳이면 그대로 쓰실 수 있습니다. 잔 수 대신 이용 횟수나 금액으로 쌓도록 바꾸면 됩니다."
            />
            <FaqItem
              question="매장 등록은 어떻게 하나요?"
              answer="앱을 설치하고 구글 또는 애플 계정으로 로그인한 뒤 '매장 등록'에서 매장 정보를 입력하시면 됩니다. 관리자 승인 후 바로 사용할 수 있습니다."
            />
            <FaqItem
              question="고객은 앱을 설치해야 하나요?"
              answer="아닙니다. 고객은 앱 설치 없이 매장에 비치된 태블릿에서 전화번호만 입력하면 적립됩니다."
            />
            <FaqItem
              question="스탬프 개수나 쿠폰 종류를 바꿀 수 있나요?"
              answer="네, 사장님 전용 설정 화면에서 스탬프 개수, 쿠폰 종류, 환영 메시지 등을 자유롭게 설정할 수 있습니다."
            />
            <FaqItem
              question="여러 매장을 운영하고 있는데 각각 등록 가능한가요?"
              answer="네. 계정 하나로 로그인하면 운영 중인 매장이 모두 보이고, 매장별 적립과 쿠폰은 서로 완전히 분리되어 관리됩니다."
            />
            <FaqItem
              question="고객 정보는 안전한가요?"
              answer="포인토는 전화번호 외 어떠한 개인정보도 수집하지 않습니다. 데이터는 Google Firebase에 암호화되어 안전하게 보관됩니다."
            />
            <FaqItem
              question="회원 탈퇴는 어떻게 하나요?"
              answer="앱 내 고객 화면에서 직접 탈퇴할 수 있으며, 탈퇴 시 모든 개인정보가 즉시 삭제됩니다."
            />
          </div>
        </section>
      </div>
    </main>
  );
}

function FaqItem({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) {
  return (
    <details className="group bg-surface rounded-2xl border border-border">
      <summary className="flex items-center justify-between cursor-pointer p-6 font-medium">
        {question}
        <span className="text-muted text-xl transition-transform group-open:rotate-45 ml-4 shrink-0">
          +
        </span>
      </summary>
      <div className="px-6 pb-6 text-muted text-[15px] leading-7">
        {answer}
      </div>
    </details>
  );
}
