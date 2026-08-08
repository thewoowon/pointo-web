# 웹 Apple 로그인 설정

앱(iOS 네이티브)과 웹은 **서로 다른 client_id를 쓴다.** 이게 이 설정에서 제일
헷갈리는 지점이다.

| | client_id | 추가 설정 |
|---|---|---|
| iOS 앱 | Bundle ID (`com.thewoowon.pointo`) | Firebase에서 Apple "사용 설정"만 하면 동작 |
| **웹** | **Services ID** (새로 만든다) | Services ID + Team ID + Key ID + .p8 필요 |

즉 앱이 잘 된다고 웹이 되는 게 아니다.

---

## 1. Apple Developer — Services ID 만들기

**Certificates, Identifiers & Profiles → Identifiers → ⊕ → Services IDs**

- Description: `Pointo Web`
- Identifier: `com.thewoowon.pointo.web`
  - ⚠️ 앱 Bundle ID와 **달라야 한다.** 같으면 등록이 안 된다.

만든 뒤 그 항목을 다시 클릭 → **Sign in with Apple** 체크 → **Configure**

- Primary App ID: `com.thewoowon.pointo` (앱 App ID)
- Domains and Subdomains: `kbffee-a365e.firebaseapp.com`
- Return URLs: `https://kbffee-a365e.firebaseapp.com/__/auth/handler`

⚠️ Return URL은 **한 글자도 틀리면 안 된다.** 오타가 나면 로그인 시
`invalid_client`가 뜨는데 원인이 화면에 드러나지 않아 찾기 어렵다.

> 도메인 검증에서 막히는 경우: Apple이 도메인 소유 확인 파일을 요구할 수 있다.
> `firebaseapp.com`은 대개 그냥 통과하지만, 막힌다면 Firebase Authentication의
> **커스텀 인증 도메인**을 설정해서 우리 도메인으로 콜백을 받아야 한다.

## 2. Apple Developer — 키 만들기 (이미 있으면 건너뛴다)

계정 삭제 기능(`functions/src/index.ts`의 Apple revoke)에서 쓰는 것과 **같은 키를
재사용할 수 있다.** 이미 `.p8`을 만들어 뒀다면 그걸 쓰면 된다.

**Keys → ⊕**

- Key Name: `Pointo Sign in with Apple`
- **Sign in with Apple** 체크 → Configure → Primary App ID 선택

생성 후:
- **`.p8` 파일을 반드시 내려받는다. 재다운로드가 불가능하다.**
- **Key ID** 기록 (10자리)
- **Team ID**는 우측 상단 계정 정보 / Membership에서 확인 (10자리)

## 3. Firebase Console

**Authentication → Sign-in method → Apple → 사용 설정**

| 칸 | 넣을 값 |
|---|---|
| 서비스 ID | `com.thewoowon.pointo.web` |
| Apple 팀 ID | 10자리 Team ID |
| 키 ID | 10자리 Key ID |
| 비공개 키 | `.p8` 파일 **내용 전체** (`-----BEGIN PRIVATE KEY-----` 포함) |

**Authentication → Settings → 승인된 도메인**
- `localhost` (기본 포함)
- 배포 시 `hellopointo.com`, `*.vercel.app` 추가

## 4. 확인

`http://localhost:3000/login` → 애플로 계속하기 → 팝업 → `/stores`로 이동하면 성공.

### 에러 해석

| 증상 | 원인 |
|---|---|
| `auth/operation-not-allowed` | Firebase에서 Apple 제공자 미활성화 |
| `auth/invalid-credential`, `invalid_client` | Services ID 또는 Return URL 불일치 |
| `auth/unauthorized-domain` | 승인된 도메인에 현재 도메인이 없음 |
| `auth/configuration-not-found` | Authentication 자체가 미설정 |

---

## 알아둘 것

**첫 로그인에서 계정 이전이 실행된다.** 카페 그랑 점주 계정(Apple)은 현재
`owners/{애플 sub}` 형태라, 웹에서 처음 로그인하는 순간 Firebase uid 기준으로
옮겨진다. 레거시 문서는 지우지 않고 `migratedTo` 표식만 남기므로 되돌릴 수 있다.

**웹 Apple 로그인은 revoke 토큰을 저장하지 않는다.** `registerAppleRefreshToken`은
앱에서만 호출된다. 웹으로만 가입한 Apple 계정은 탈퇴 시 Apple 연결 해제가
생략된다 — 앱도 함께 쓰는 점주라면 문제되지 않지만, 웹 전용 가입을 받기 시작하면
이 경로를 웹에도 붙여야 한다.
