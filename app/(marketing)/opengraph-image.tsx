import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { ImageResponse } from "next/og";

/**
 * 링크 미리보기 이미지.
 *
 * 영업은 결국 카카오톡이나 문자로 링크를 보내는 일로 시작한다. OG 이미지가
 * 없으면 그 자리에 흰 카드가 뜨고, 받는 사람 눈에는 "만들다 만 사이트"로
 * 보인다. 랜딩을 아무리 고쳐도 첫인상은 여기서 결정된다.
 *
 * 폰트는 이 이미지에 실제로 쓰는 글자만 남긴 서브셋(각 6KB)이다. satori는
 * woff2를 읽지 못해 본문용 woff2를 그대로 쓸 수 없고, 온전한 OTF는 1.5MB라
 * 빌드에 얹기 아깝다. 문구를 바꾸면 서브셋도 다시 떠야 한다 —
 * scripts/crop-screenshots.py 옆의 README(docs/fonts.md) 참고.
 */

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "포인토 — 포스 없이, 태블릿 한 대로 단골 관리";

const BRAND = "#2974ff";

export default async function OpengraphImage() {
  const dir = join(process.cwd(), "app", "fonts");
  const [bold, semibold] = await Promise.all([
    readFile(join(dir, "og-Bold.subset.otf")),
    readFile(join(dir, "og-SemiBold.subset.otf")),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: BRAND,
          color: "#ffffff",
          padding: "72px 80px",
        }}
      >
        <div style={{ display: "flex", fontFamily: "PretendardSemiBold", fontSize: 34 }}>
          포인토
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            fontFamily: "PretendardBold",
            fontSize: 78,
            lineHeight: 1.24,
            letterSpacing: "-0.02em",
          }}
        >
          <span>포스 없이,</span>
          <span>태블릿 한 대로 단골을 만듭니다</span>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            fontFamily: "PretendardSemiBold",
            fontSize: 28,
            color: "rgba(255,255,255,0.8)",
          }}
        >
          <span>전화번호 하나면 적립 끝</span>
          <span>hellopointo.com</span>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "PretendardBold", data: bold, style: "normal" },
        { name: "PretendardSemiBold", data: semibold, style: "normal" },
      ],
    },
  );
}
