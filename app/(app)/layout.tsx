import { AuthProvider } from "@/lib/auth-context";
import { isFirebaseConfigured } from "@/lib/firebase";
import { SetupNotice } from "@/components/setup-notice";

/**
 * 점주 대시보드 셸.
 *
 * 여기서는 세션 컨텍스트만 깐다. 로그인 페이지도 이 안에 있어야
 * "이미 로그인했으면 바로 통과" 판단을 할 수 있기 때문에, **인증 가드는
 * 여기가 아니라** 한 단계 아래 `(dashboard)/layout.tsx`에 둔다.
 */
export default function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-screen flex-1 flex-col bg-app-bg font-app text-app-text-highest">
      {isFirebaseConfigured() ? (
        <AuthProvider>{children}</AuthProvider>
      ) : (
        <SetupNotice />
      )}
    </div>
  );
}
