/**
 * 사이트 상수 — 도메인, 서비스 이름, 회사 정보.
 *
 * 이 값들이 흩어져 있으면 sitemap은 https, canonical은 http, JSON-LD는 www가
 * 붙는 식으로 조용히 갈라진다. 검색엔진은 그걸 서로 다른 사이트로 본다.
 */

export const SITE_URL = "https://hellopointo.com";

export const SITE_NAME = "포인토";

export const SITE_TAGLINE = "포스 없이, 태블릿 하나로 단골 관리";

export const SITE_DESCRIPTION =
  "종이 쿠폰은 잃어버리고, 포스는 비싸고. 포인토는 태블릿 한 대로 적립부터 쿠폰 발급까지 끝냅니다. 카페·볼링장·미용실 어디든, 고객은 전화번호만 입력하면 됩니다.";

export const APP_STORE_URL = "https://apps.apple.com/app/id6763893004";

export const CONTACT_EMAIL = "thewoowon@gmail.com";

/** 절대 URL로 바꾼다. JSON-LD와 canonical은 상대 경로를 받지 않는다. */
export const absoluteUrl = (path: string) =>
  new URL(path, SITE_URL).toString();
