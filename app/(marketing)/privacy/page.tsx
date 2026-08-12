import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "개인정보 처리방침 — 포인토",
  description: "포인토 서비스의 개인정보 처리방침입니다.",
};

export default function PrivacyPage() {
  return (
    <main className="flex-1 py-16 sm:py-24">
      <article className="max-w-3xl mx-auto px-6">
        <h1 className="mb-2 text-[26px] font-bold leading-snug sm:text-[34px]">
          개인정보 처리방침
        </h1>
        <p className="mb-12 text-sm text-muted">시행일: 2025년 5월 1일</p>

        <div className="space-y-10 text-[15px] leading-7 text-app-text-high">
          <p>
            룰루랄라 컴퍼니(이하 &ldquo;회사&rdquo;)는 「개인정보 보호법」에 따라
            이용자의 개인정보를 보호하고 이와 관련한 고충을 신속하게 처리하기 위하여
            다음과 같이 개인정보 처리방침을 수립·공개합니다.
          </p>

          <Section title="제1조 (수집하는 개인정보 항목)">
            <p>회사는 서비스 제공을 위해 다음의 개인정보를 수집합니다.</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>필수 수집 항목: 휴대전화번호</li>
              <li>
                자동 수집 항목: 서비스 이용 기록(스탬프 적립·사용 내역, 접속 일시)
              </li>
            </ul>
          </Section>

          <Section title="제2조 (개인정보의 수집 및 이용 목적)">
            <p>수집한 개인정보는 다음의 목적으로만 이용됩니다.</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>회원 식별 및 본인 확인</li>
              <li>스탬프 적립·사용·쿠폰 발급 서비스 제공</li>
              <li>서비스 이용 통계 및 분석</li>
            </ul>
          </Section>

          <Section title="제3조 (개인정보의 보유 및 이용 기간)">
            <p>
              이용자의 개인정보는 수집·이용 목적이 달성된 후 지체 없이 파기합니다.
              다만, 이용자가 회원 탈퇴를 요청할 경우 즉시 파기합니다.
            </p>
          </Section>

          <Section title="제4조 (개인정보의 파기 절차 및 방법)">
            <p>
              회사는 개인정보의 수집·이용 목적이 달성되면 해당 정보를 지체 없이
              파기합니다. 전자적 파일 형태의 정보는 복구할 수 없는 방법으로
              삭제합니다.
            </p>
          </Section>

          <Section title="제5조 (이용자의 권리와 행사 방법)">
            <p>이용자는 언제든지 다음의 권리를 행사할 수 있습니다.</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>개인정보 열람 요청</li>
              <li>개인정보 수정 요청</li>
              <li>회원 탈퇴 및 개인정보 삭제 요청</li>
            </ul>
            <p className="mt-2">
              회원 탈퇴는 앱 내 고객 화면에서 직접 처리할 수 있습니다.
            </p>
          </Section>

          <Section title="제6조 (개인정보의 제3자 제공)">
            <p>
              회사는 이용자의 개인정보를 제3자에게 제공하지 않습니다. 다만, 법령에
              의해 요구되는 경우는 예외로 합니다.
            </p>
          </Section>

          <Section title="제7조 (개인정보 보호책임자)">
            <p>
              회사는 개인정보 처리에 관한 업무를 총괄하여 책임지고, 이용자의
              불만처리 및 피해구제를 위해 아래와 같이 개인정보 보호책임자를 지정하고
              있습니다.
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>담당: 룰루랄라 컴퍼니</li>
              <li>이메일: thewoowon@gmail.com</li>
            </ul>
          </Section>

          <Section title="제8조 (방침의 변경)">
            <p>
              이 개인정보 처리방침은 시행일로부터 적용되며, 변경사항이 있을 경우 앱
              내 공지를 통해 알려드립니다.
            </p>
          </Section>
        </div>
      </article>
    </main>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="text-lg font-semibold text-foreground mb-3">{title}</h2>
      {children}
    </section>
  );
}
