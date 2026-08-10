# App Check (웹) 설정

> 웹 배포 전 필수. 이걸 안 하고 Firestore의 App Check 적용(enforce)을 켜면
> **웹 전체가 차단된다.**

## 왜 웹은 따로 해야 하나

RN 앱은 이미 App Check을 쓴다(`KBffee/src/services/appCheck.ts` — iOS는 App Attest,
Android는 Play Integrity). 웹은 **제공자도 사이트 키도 완전히 별개**다. 앱을 등록해
뒀다고 웹이 통과하지 않는다.

웹이 특히 필요한 이유: 규칙은 "누가 요청했는가"까지만 본다. 키오스크·고객 웹이 쓰는
익명 세션은 누구나 발급받을 수 있는 신원이고, 웹은 코드가 그대로 공개돼 그 세션을
얻기가 앱보다 훨씬 쉽다. App Check은 "이 요청이 실제로 우리 사이트에서 왔는가"를
증명한다.

## 코드 쪽은 이미 되어 있다

| 파일 | 역할 |
|---|---|
| `lib/app-check.ts` | reCAPTCHA v3 초기화. 사이트 키가 없으면 **조용히 건너뛴다** |
| `lib/firebase.ts` | `getFirebaseApp()`에서 `startAppCheck(app)` 호출 |

`getDb()`·`getFirebaseAuth()`가 전부 `getFirebaseApp()`을 거치므로, Firestore·Auth의
첫 요청보다 App Check이 먼저 시작된다. 컴포넌트의 `useEffect`에 두면 이미 늦다 —
`AuthContext`가 마운트 즉시 세션을 복원하기 때문이다.

App Check 모듈은 동적 import한다. 정적으로 두면 reCAPTCHA를 쓰지 않는 마케팅 페이지
번들까지 커진다.

## 해야 할 일

### 1. Console에서 웹 앱 등록

Firebase Console → App Check → 앱 목록에서 **웹 앱** 선택 → reCAPTCHA v3 제공자 등록.
발급된 **사이트 키**를 받아둔다.

### 2. 환경변수 채우기

```
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=<발급받은 사이트 키>
```

로컬(Vercel이 아닌 개발)에서는 `.env.local`에, 배포는 Vercel 프로젝트 환경변수에 넣는다.

> 비어 있으면 App Check 초기화를 건너뛴다. enforce가 꺼져 있는 동안에는 그래도
> 동작하므로, 키 발급 전에도 개발·배포가 막히지 않는다. **enforce 전에 반드시 채울 것.**

### 3. 로컬 개발용 디버그 토큰 (선택)

reCAPTCHA는 localhost에서 정상 토큰을 만들지 못한다.

```
NEXT_PUBLIC_APPCHECK_DEBUG_TOKEN=true
```

로 두고 실행하면 브라우저 콘솔에 디버그 토큰이 찍힌다. 그 값을
Console → App Check → 앱 → **디버그 토큰 관리**에 등록하면 로컬에서도 통과한다.
고정하고 싶으면 `true` 대신 그 토큰 문자열을 넣는다.

> ⚠️ **운영 환경변수에는 절대 넣지 말 것.** 디버그 토큰은 App Check을 통째로
> 우회하므로, 유출되면 검증이 무의미해진다.

### 4. 적용(enforce)은 맨 마지막

```
1. 사이트 키 등록 + 환경변수 설정
2. 웹 배포
3. Console에서 **모니터링 모드**로 며칠 관찰   ← 건너뛰지 말 것
   "확인된 요청" 비율이 100%에 수렴하는지 본다
4. 100% 근처가 되면 Firestore에 enforce 켜기
```

롤백은 Console에서 enforce를 끄면 즉시 된다(재배포 불필요).

## 전체 배포 순서에서의 위치

`KBffee/SECURITY_PASS.md`의 웹 배포 순서 중 **5번**이다.

```
앱 배포 → 매장 기기 업데이트 → 소유권 실측 → 규칙 배포
  → [5] 웹 App Check 설정 → 웹 배포 → enforce
```

## 승인된 도메인

reCAPTCHA 사이트 키는 도메인에 묶인다. Console 등록 시 다음을 포함할 것:

- `hellopointo.com`, `www.hellopointo.com`
- `localhost` (개발)
- Vercel 미리보기 도메인을 쓴다면 그것도
