#!/usr/bin/env python3
"""App Store 스크린샷 → 랜딩용 파생 에셋.

    원본  assets/screenshots/*.png   (웹에 서빙되지 않음)
    결과  public/screenshot/*.webp   (랜딩이 쓰는 것)

원본을 `public/` 밖에 두는 이유가 중요하다. `public/`에 있는 파일은 링크가
없어도 URL만 알면 누구나 받아갈 수 있다. 원본에는 마스킹되지 않은 실제 고객
전화번호가 찍혀 있어서, 거기 두면 마케팅 페이지가 개인정보를 배포하는 셈이
된다. 그래서 원본은 서빙 밖에 두고, 아래 REDACTIONS를 거친 파생본만 공개한다.

원본은 App Store 제출용이라 **상단에 마케팅 카피가 박혀 있다**. 랜딩에 그대로
쓰면 페이지 헤드라인과 문구가 두 번 나와서 촌스럽다. 그래서 카피 밴드만
잘라내고 기기 화면만 남긴다.

여기서 기기 프레임(목업)을 따로 씌우지 않는 이유:

    원본의 배경색이 이미 우리 디자인 토큰과 같다.
      · 1번 스크린샷  → #2974ff (--color-app-brand)
      · 나머지        → #f1f5f9 (--color-app-container)

    그래서 잘라낸 이미지를 **같은 배경색 섹션 위에** 올리면 이음매가 보이지
    않는다. 마스킹도, 투명 PNG도, 목업 리소스도 필요 없다. 랜딩에서 이미지를
    배치할 때 반드시 섹션 배경을 맞춰야 하는 이유이기도 하다.

크롭 지점은 하드코딩하지 않고 매번 계산한다. 스크린샷을 새로 뽑아 카피
길이가 달라져도 스크립트가 그대로 동작하게 하기 위해서다. 방법은 단순하다.
행 단위로 "배경색과 다른 픽셀"의 비율을 재면 카피 줄 → 여백 → 기기 순서로
덩어리가 잡힌다. 마지막 카피 덩어리와 기기 덩어리 사이 여백에서 자른다.

일회성 에셋 준비 도구다. 결과물(public/screenshot/)은 리포에 커밋하므로
평소에는 실행할 일이 없다. 실행하려면 Pillow가 필요하다:

    python3 -m pip install pillow
    python3 scripts/crop-screenshots.py
"""

from __future__ import annotations

import sys
from pathlib import Path

try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:  # pragma: no cover - 개발자 안내용
    sys.exit("Pillow가 필요하다: python3 -m pip install pillow")

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "assets" / "screenshots"
OUT = ROOT / "public" / "screenshot"

# 원본 파일명 → 랜딩에서 쓸 이름. 이름은 "무슨 화면인지"로 짓는다.
#
# 6.9_ Iphone_3(내 매장)은 일부러 뺐다. 로그인 배지가 "카카오"로 찍혀 있는데
# 앱에는 카카오 로그인이 없다(구글·애플뿐). 없는 로그인 수단을 랜딩에서
# 광고하게 되므로, 같은 화면은 배지가 Google로 나오는 태블릿 쪽을 쓴다.
NAMES = {
    "6.9_ Iphone_1.png": "phone-stamp",
    "6.9_ Iphone_2.png": "phone-points",
    "6.9_ Iphone_4.png": "phone-logs",
    "6.9_ Iphone_5.png": "phone-search",
    "6.9_ Iphone_6.png": "phone-keypad",
    "13_ Ipad_1.png": "tablet-stamp",
    "13_ Ipad_2.png": "tablet-points",
    "13_ Ipad_3.png": "tablet-stores",
    "13_ Ipad_4.png": "tablet-logs",
    "13_ Ipad_5.png": "tablet-search",
    "13_ Ipad_6.png": "tablet-keypad",
}

# 파생본 최대 가로폭. 레티나까지 감안해도 이 이상은 낭비다.
MAX_WIDTH = {"phone": 900, "tablet": 1800}

# 아래쪽 잘라내기 (원본 높이 대비 비율).
#
# "내 매장"처럼 내용이 위쪽에만 있는 화면은 아래 절반이 빈 회색이다. 랜딩에
# 가로로 크게 놓으면 그 여백이 화면을 다 먹어서 무슨 화면인지 안 보인다.
BOTTOM_CROP = {"tablet-stores": 0.80}

WEBP_QUALITY = 82

# 실제 개인정보 가리기.
#
# 스크린샷에 실제 고객 전화번호(적립내역 상세)와 실제 계정 이메일(내 매장)이
# 마스킹 없이 찍혀 있다. 앱스토어에 이미 올라갔다는 것과 별개로, 랜딩은 검색에
# 잡히고 링크로 퍼지는 공개 문서다. 남의 번호와 메일 주소를 거기 박아둘 이유가
# 없어서 더미 값으로 덮어 그린다.
#
# 좌표는 크롭·리사이즈가 **끝난** 파생본 기준이다. 스크린샷을 다시 뽑으면
# 당연히 어긋나므로, 새 스크린샷을 넣을 때는 결과물을 눈으로 확인할 것.
# (애초에 촬영 단계에서 더미 데이터를 쓰는 쪽이 낫다.)
REDACTIONS: dict[str, list[dict]] = {
    "tablet-logs": [
        {
            "box": (1086, 284, 1326, 326),
            "text": "010 1234 5678",
            "anchor": (1094, 320),  # 왼쪽 아래(베이스라인) 기준
            "size": 26,
            "weight": "Bold",
        }
    ],
    "tablet-stores": [
        {
            "box": (652, 278, 952, 313),
            "text": "owner@hellopointo.com",
            "anchor": (658, 307),
            "size": 23,
            "weight": "SemiBold",
        }
    ],
}

# RN 앱과 같은 서체로 덮어야 티가 나지 않는다.
APP_FONT_DIR = Path.home() / "rrn" / "KBffee" / "src" / "assets" / "fonts"


def row_blocks(im: Image.Image) -> tuple[list[tuple[int, int]], tuple[int, int, int]]:
    """배경색과, 내용이 들어찬 행 덩어리 목록을 돌려준다."""
    px = im.load()
    w, h = im.size

    # 배경색: 맨 윗줄들의 최빈색. 카피 위쪽은 언제나 순수 배경이다.
    tally: dict[tuple[int, int, int], int] = {}
    for y in range(max(4, h // 100)):
        for x in range(0, w, 4):
            c = px[x, y]
            tally[c] = tally.get(c, 0) + 1
    bg = max(tally.items(), key=lambda kv: kv[1])[0]

    # 행마다 배경과 다른 픽셀 비율. 4px 간격 샘플링으로 충분하다.
    step = 4
    sampled = len(range(0, w, step))
    filled: list[bool] = []
    for y in range(h):
        n = 0
        for x in range(0, w, step):
            c = px[x, y]
            if abs(c[0] - bg[0]) + abs(c[1] - bg[1]) + abs(c[2] - bg[2]) > 20:
                n += 1
        filled.append(n / sampled > 0.004)

    blocks: list[tuple[int, int]] = []
    start: int | None = None
    for y, on in enumerate(filled):
        if on and start is None:
            start = y
        elif not on and start is not None:
            blocks.append((start, y))
            start = None
    if start is not None:
        blocks.append((start, h))

    # 안티에일리어싱 한두 줄이 덩어리로 잡히는 걸 걸러낸다.
    return [b for b in blocks if b[1] - b[0] > h * 0.004], bg


def crop_top(im: Image.Image) -> int:
    """카피 밴드를 걷어낼 y 좌표."""
    blocks, _ = row_blocks(im)
    if len(blocks) < 2:
        return 0

    # 마지막 덩어리가 기기 화면(가장 크고 아래쪽)이라고 본다.
    device_start = blocks[-1][0]
    caption_end = blocks[-2][1]
    gap = device_start - caption_end
    if gap <= 0:
        return 0

    # 여백을 다 먹으면 기기가 상단에 딱 붙어 답답하다. 절반 조금 넘게만 먹는다.
    return caption_end + int(gap * 0.55)


def redact(im: Image.Image, name: str) -> int:
    """실제 개인정보가 찍힌 자리를 더미 값으로 덮어 그린다. 덮은 개수를 돌려준다."""
    jobs = REDACTIONS.get(name)
    if not jobs:
        return 0

    draw = ImageDraw.Draw(im)
    for job in jobs:
        box = job["box"]
        # 덮을 색과 글자색은 그 자리에서 직접 뽑는다. 값을 손으로 적어두면
        # 배경 톤이 조금만 바뀌어도 사각형 자국이 남는다.
        bg = im.getpixel((box[0] + 2, box[1] + 2))
        crop = im.crop(box).convert("L")
        fg_lum = min(crop.getdata())
        fg = (fg_lum, fg_lum, fg_lum)

        draw.rectangle(box, fill=bg)
        path = APP_FONT_DIR / f"Pretendard-{job['weight']}.otf"
        font = (
            ImageFont.truetype(str(path), job["size"])
            if path.exists()
            else ImageFont.load_default()
        )
        draw.text(job["anchor"], job["text"], font=font, fill=fg, anchor="ls")
    return len(jobs)


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    for filename, name in sorted(NAMES.items(), key=lambda kv: kv[1]):
        src = SRC / filename
        if not src.exists():
            print(f"  건너뜀 (없음): {filename}")
            continue

        im = Image.open(src).convert("RGB")
        w, h = im.size
        top = crop_top(im)
        bottom = round(h * BOTTOM_CROP.get(name, 1.0))
        im = im.crop((0, top, w, bottom))

        limit = MAX_WIDTH["tablet" if name.startswith("tablet") else "phone"]
        if im.width > limit:
            im = im.resize(
                (limit, round(im.height * limit / im.width)), Image.LANCZOS
            )

        n = redact(im, name)

        dst = OUT / f"{name}.webp"
        im.save(dst, "WEBP", quality=WEBP_QUALITY, method=6)
        print(
            f"  {name:14s} {w}x{h} → {im.width}x{im.height}"
            f"  (상단 {top}px 절단{f', 개인정보 {n}곳 가림' if n else ''}"
            f", {dst.stat().st_size // 1024}KB)"
        )


if __name__ == "__main__":
    main()
