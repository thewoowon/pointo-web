/**
 * `@types/mdx`가 선언한 `*.mdx` 모듈에 `meta` 하나를 얹는다.
 *
 * 글 한 편은 파일 한 개다 — 본문과 메타데이터가 같은 `.mdx` 안에 있다
 * (`export const meta = {...}`). 메타를 별도 TS 파일로 빼면 글을 쓸 때마다 두
 * 파일을 오가야 하고, 둘 중 하나만 고쳐 두는 일이 반드시 생긴다.
 *
 * ⚠️ 이 파일에 **top-level `import`/`export`를 쓰면 안 된다.** 그 순간 파일이
 * 모듈이 되고, 안의 `declare module`은 병합이 아니라 augmentation으로 해석된다.
 * 와일드카드 패턴(`*.mdx`)은 augmentation 대상이 될 수 없어서 조용히 무시되고,
 * `post.meta`가 다시 타입 에러가 난다. 타입이 필요하면 아래처럼 인라인
 * `import("...")`을 쓸 것 — 이건 파일을 모듈로 만들지 않는다.
 */
declare module "*.mdx" {
  export const meta: import("../lib/blog/types").PostMeta;
}
