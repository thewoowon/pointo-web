# 폰트 (Pretendard)

웹도 RN 앱과 같은 Pretendard를 쓴다. 시스템 한글 폴백(Apple SD Gothic Neo,
맑은 고딕)은 기기마다 굵기와 자간이 달라서, 같은 브랜드인데 앱과 웹이 딴
얼굴이 된다. 그 차이가 "대충 만든 사이트" 인상의 큰 몫을 차지한다.

파일은 두 종류이고, 둘 다 `app/fonts/`에 있다.

| 파일 | 쓰는 곳 | 크기 |
| --- | --- | --- |
| `PretendardVariable.subset.woff2` | 사이트 전체 본문 | 456KB |
| `og-Bold.subset.otf`, `og-SemiBold.subset.otf` | OG 이미지 렌더링 | 각 6KB |

라이선스는 SIL OFL 1.1이다. 전문은 `app/fonts/OFL.txt`에 함께 둔다.

## 본문용 서브셋을 다시 만들려면

원본 Variable은 2MB라 랜딩에 그냥 얹을 수 없다. 한글 완성형 11,172자가
대부분을 차지하는데, 실제로 쓰이는 건 KS X 1001의 2,350자다. 그 범위로
줄이면 456KB가 되고, 한 파일로 45~920 굵기를 전부 커버한다.

```bash
pip install fonttools brotli

# 1. 원본 Variable 받기
curl -L -o PretendardVariable.woff2 \
  https://cdn.jsdelivr.net/npm/pretendard@1.3.9/dist/web/variable/woff2/PretendardVariable.woff2

# 2. KS X 1001 한글 목록 뽑기 (EUC-KR 완성형 영역)
python3 - <<'PY'
ks = [cp for cp in range(0xAC00, 0xD7A4)
      if (b := chr(cp).encode('euc-kr')) and 0xB0 <= b[0] <= 0xC8 and 0xA1 <= b[1] <= 0xFE]
open('ks.txt', 'w').write('\n'.join('U+%04X' % c for c in ks))  # 2,350자
PY

# 3. 서브셋
pyftsubset PretendardVariable.woff2 \
  --output-file=app/fonts/PretendardVariable.subset.woff2 --flavor=woff2 \
  --unicodes-file=ks.txt \
  --unicodes='U+0020-007E,U+00A0-00FF,U+2000-206F,U+20A0-20BF,U+2190-2193,U+2212,U+25A0-25CF,U+3000-303F,U+3131-318E,U+FF01-FF60' \
  --layout-features='kern,liga,tnum,calt' --no-hinting
```

`tnum`을 남기는 이유가 있다. 적립 수치와 통계에서 `.tabular` 클래스로
고정폭 숫자를 쓰는데, 그 기능이 빠지면 숫자가 자리마다 흔들린다.

서브셋 밖의 희귀 음절은 폴백 서체로 떨어진다. 사람 이름이나 매장 이름에
아주 드물게 나올 수 있고, 그때 한 글자만 다른 서체로 보인다. 2,350자를
넘기려면 크기가 네 배로 뛰므로 그 편이 낫다고 판단했다.

## OG 이미지용 서브셋

`ImageResponse`(satori)는 woff2를 읽지 못해 본문용 파일을 그대로 못 쓴다.
온전한 OTF는 1.5MB라 빌드에 얹기 아깝다. 그래서 **OG 이미지에 실제로 찍히는
글자만** 남긴다.

```bash
TEXT='포인토포스없이,태블릿한대로단골을만듭니다전화번호하나면적립끝hellopointo.com·'
for W in Bold SemiBold; do
  pyftsubset "Pretendard-$W.otf" --output-file="app/fonts/og-$W.subset.otf" \
    --text="$TEXT" --layout-features='' --no-hinting
done
```

**OG 문구를 바꾸면 이 서브셋도 다시 떠야 한다.** 없는 글자는 빈칸으로
렌더링되는데, 빌드는 통과하므로 눈치채기 어렵다. 문구를 고쳤다면
`/opengraph-image`를 열어 눈으로 확인할 것.
