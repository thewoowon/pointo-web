/**
 * JSON-LD 삽입.
 *
 * `<script type="application/ld+json">`은 next/script를 쓰면 안 된다. next/script는
 * 실행 가능한 스크립트를 전제로 로딩 전략(afterInteractive 등)을 붙이는데, 구조화
 * 데이터는 실행되는 게 아니라 **HTML 소스에 처음부터 들어 있어야** 한다. 크롤러가
 * JS를 돌리지 않고 읽는 경우가 여전히 많다.
 *
 * `dangerouslySetInnerHTML`을 쓰는 것도 같은 이유다. React가 JSON 안의 `<`, `&`를
 * 이스케이프해 버리면 파싱이 깨진다. 대신 스크립트 태그를 조기 종료시킬 수 있는
 * `</script>` 시퀀스만 막는다 — 값에 사용자 입력이 섞일 일은 없지만, 글 제목에
 * 어떤 문자가 들어올지는 미래의 우리가 정하기 때문이다.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
