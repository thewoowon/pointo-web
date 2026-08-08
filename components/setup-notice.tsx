/**
 * Firebase 설정이 없을 때 띄우는 안내.
 *
 * 없으면 초기화가 throw하면서 흰 화면이 된다. 원인이 "환경변수 누락"이라는
 * 아주 흔하고 고치기 쉬운 문제이므로 화면에서 바로 알려준다.
 */
export function SetupNotice() {
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-[480px] rounded-app-md border border-app-line bg-app-container px-6 py-8">
        <h1 className="text-lg font-bold">Firebase 설정이 필요해요</h1>
        <p className="mt-3 text-sm leading-6 text-app-text-mid">
          점주 대시보드를 실행하려면 Firebase 웹 앱 설정이 있어야 합니다.
        </p>
        <ol className="mt-4 list-decimal space-y-1.5 pl-5 text-sm leading-6 text-app-text-mid">
          <li>
            <code className="rounded bg-white px-1.5 py-0.5 text-app-text-high">
              .env.local.example
            </code>
            을{" "}
            <code className="rounded bg-white px-1.5 py-0.5 text-app-text-high">
              .env.local
            </code>
            로 복사
          </li>
          <li>Firebase Console → 프로젝트 설정 → 내 앱에서 웹 앱 설정값 채우기</li>
          <li>개발 서버 재시작</li>
        </ol>
      </div>
    </main>
  );
}
