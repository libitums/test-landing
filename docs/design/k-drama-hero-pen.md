# K-drama Pencil Hero 디자인 고정

## 기준과 범위

이 문서는 `apps/k-drama/k-drama.pen`의 `Talkie Landing Hero` 프레임
`kdsPI`를 K-drama 앱 Hero에 적용하기 위한 시각 계약이다. 기준 노드는 copy
`XhXaR`, headline `OmO2q`, subhead `Bv805`, visual cards `EuYuY`, `J6fKNt`,
`D29TJP`다.

포함 순서는 다음과 같다.

```text
[label]
[headline]
[subhead]
[CTA]
[highlights]
[compact visual] [wide visual] [compact visual]
```

- CTA와 highlights는 K-drama가 기존 공유 Hero에 제공하던 구성과 시각 상태를
  그대로 복원한다. Pencil의 copy·visual 위계 사이에 공유 Hero 순서로 배치한다.
- label은 K-drama가 제공하는 짧은 eyebrow 문구다. headline 위에 위치하며
  headline의 일부로 합치지 않는다.
- Hero는 K-drama 전용 조합이다. 다른 앱의 Hero 외형이나 공통 Hero API를 이
  문서만으로 변경하지 않는다.
- 이미지·카드 내부 콘텐츠의 의미와 대체 텍스트는 K-drama 앱이 소유한다.

## 토큰 결정

Pencil 원본을 재현할 수 있도록 공통 토큰 파일을 최소 확장한다.

| 토큰                       | 용도                    | 도입 이유                                                                      |
| -------------------------- | ----------------------- | ------------------------------------------------------------------------------ |
| `--text-hero-display`      | desktop headline 크기   | 기존 fluid `--text-display`로는 원본 headline 크기를 고정점에서 재현할 수 없음 |
| `--leading-hero-display`   | headline 행간           | 기존 `--leading-tight`보다 조밀한 원본 행간 보존                               |
| `--radius-2xl`             | 세 visual card radius   | 기존 radius scale에 원본 card radius가 없음                                    |
| `--shadow-media-card`      | 양쪽 dark visual 깊이   | 원본 dark card의 동일 shadow를 재사용                                          |
| `--shadow-media-card-soft` | 중앙 light visual 깊이  | 밝은 카드에 쓰인 더 낮은 shadow opacity 보존                                   |
| `--content-hero-copy`      | copy group 최대 폭      | 원본 copy frame의 확장 한계                                                    |
| `--content-hero-headline`  | headline 최대 폭        | 의도한 줄바꿈과 국제화 확장을 함께 제어                                        |
| `--content-hero-subhead`   | subhead 최대 폭         | 원본의 읽기 폭 보존                                                            |
| `--media-card-compact`     | 양쪽 visual 크기        | 동일한 정사각형 카드 크기를 한 토큰으로 공유                                   |
| `--media-card-wide`        | 중앙 visual 인라인 크기 | 중앙 카드의 넓은 비율 보존                                                     |

나머지는 기존 `--font-sans`, `--font-normal`, `--font-bold`, `--text-xs`,
`--text-lg`, `--leading-body`, `--color-editorial-fg`,
`--color-editorial-muted-fg`, `--color-bg`, 공유 CTA·highlight 토큰,
`--space-*`, `--content-max`를 재사용한다. CTA와 highlights를 위해 새 토큰을
도입하지 않는다.

## 컴포넌트별 시각 스펙

### Hero surface와 copy

- surface는 기존 `--color-bg`이며 최소 높이를 고정하지 않는다. Pencil의
  desktop 기준 프레임은 레이아웃 기준점일 뿐 콘텐츠 clipping 계약이 아니다.
- 전체 콘텐츠는 `--content-max` 안에서 중앙 정렬하고 논리적 인라인 padding을
  적용한다.
- copy group은 `--content-hero-copy`를 넘지 않고 중앙 정렬한다. label,
  headline, subhead, CTA, highlights는 문서 순서와 시각 순서가 같다.
- copy의 모든 텍스트는 고정 블록 높이, line clamp, ellipsis를 사용하지 않는다.
  저자가 넣은 줄바꿈과 자연 줄바꿈을 모두 허용한다.

### Label

- `--font-sans`, `--text-xs`, `--font-semibold`, `--leading-body`,
  `--color-editorial-muted-fg`를 사용한다.
- 짧은 분류 텍스트로만 사용하며 badge surface나 장식 pill을 만들지 않는다.
- 상호작용 요소가 아니므로 hover, active, disabled, loading 상태가 없다.

### Headline

- desktop에서 `--font-sans`, `--text-hero-display`, `--font-bold`,
  `--leading-hero-display`, `--color-editorial-fg`를 사용한다.
- 최대 인라인 크기는 `--content-hero-headline`이며 가운데 정렬한다.
- 문자열에 명시된 줄바꿈을 보존하되, 더 좁은 공간에서는 추가 자연 줄바꿈을
  허용한다.

### Subhead

- `--font-sans`, `--text-lg`, `--font-normal`, `--leading-body`,
  `--color-editorial-muted-fg`를 사용한다.
- 최대 인라인 크기는 `--content-hero-subhead`이며 가운데 정렬한다.
- headline과 동일하게 번역문을 자르거나 줄 수를 제한하지 않는다.

### CTA와 highlights

- CTA는 기존 공유 Hero의 `.hero__cta` 시각 계약과
  `--color-cta-*`, `--shadow-cta`, `--radius-full`, `--duration-normal`,
  `--ease-standard`를 그대로 사용한다. K-drama 전용 색상·크기·모션 variant를
  추가하지 않는다.
- default, hover, focus-visible, active 상태는 공유 Hero와 같아야 한다.
  focus-visible은 기존 `--focus-ring`을 유지하고, reduced-motion에서는 공유
  Hero 계약대로 비필수 transition을 제거한다.
- highlights는 기존 `.hero__highlights`의 중앙 정렬·wrap 동작과
  `--text-sm`, `--font-medium`, `--color-fg`, `--color-cta-surface`,
  `--space-*` 조합을 그대로 사용한다.
- CTA와 highlights는 subhead 뒤, visual group 앞에 위치한다. 번역문이나 항목
  수가 늘면 자연스럽게 높이가 증가하며 visual과 겹치지 않는다.

### Visual group

- highlights 아래 한 행에 compact → wide → compact 순으로 배치하고 그룹
  전체를 가운데 정렬한다. DOM 순서도 동일하게 유지한다.
- `EuYuY`와 `D29TJP`는 인라인·블록 크기에 `--media-card-compact`, radius에
  `--radius-2xl`, 깊이에 `--shadow-media-card`를 사용한다.
- `J6fKNt`는 인라인 크기에 `--media-card-wide`, 블록 크기에
  `--media-card-compact`, radius에 `--radius-2xl`, 깊이에
  `--shadow-media-card-soft`를 사용한다.
- 카드 내부 이미지는 카드 경계를 따라 clip한다. 장식 이미지는 접근성 트리에서
  제외하고, 의미 있는 미리보기는 카드별 접근 가능한 이름을 제공한다.
- visual 자체는 링크나 버튼이 아니며 default 외 hover, focus, active,
  disabled, loading 상태를 만들지 않는다. 이미지 로딩 실패 시 배경색을 유지해
  카드 영역이 투명하게 무너지지 않게 한다.

## 반응형과 점진적 향상

### Desktop

- `--breakpoint-mobile` 초과에서는 중앙 copy와 3-card 행을 유지한다.
- 카드 행은 가용 폭이 부족하면 overflow를 만들지 않고 다음 단계의 모바일
  재배치로 전환한다. 카드 크기를 임의 축소해 내부 콘텐츠를 왜곡하지 않는다.

### Mobile

- `--breakpoint-mobile` 이하에서 label → headline → subhead → CTA → highlights →
  visuals의 순서는 유지한다.
- headline 크기는 기존 fluid `--text-display`를 사용하여 좁은 화면에서
  축소하되 `--font-bold`와 `--leading-hero-display`는 유지한다.
- visual group은 한 열로 바꾸고 compact → wide → compact 순으로 쌓는다.
  모든 카드는 `max-inline-size: 100%`의 제약을 받는다. wide 카드는 가용 폭에
  맞춰 축소하며 블록 크기는 동일 비율로 따라가야 한다.
- 긴 한국어·영어·아랍어 문구가 visual을 아래로 밀 수 있으며 이는 정상이다.
  텍스트와 visual이 겹치거나 가로 스크롤을 만들면 실패다.
- RTL은 텍스트의 양방향 흐름을 존중하되 visual의 의미 순서를 반전하지 않는다.

### Legacy graceful fallback

- CSS Grid를 지원하는 최신 브라우저에서는 desktop 3-column과 mobile 1-column을
  사용한다.
- Grid, `clamp()`, 논리적 속성 중 일부를 지원하지 않는 레거시 브라우저에서도
  콘텐츠를 숨기지 않는다. 기본 block 흐름과 물리적 width/max-width fallback을
  먼저 선언하고 향상 규칙을 뒤에 둔다.
- shadow나 radius를 지원하지 않아도 label, headline, subhead, CTA, highlights와
  세 visual의 문서 순서 및 읽을 수 있는 내용은 남아야 한다.
- CTA transition이 지원되지 않거나 reduced-motion이 활성화되어도 CTA의 문구와
  기본 동작은 유지한다.

## 대비 확인

- `--color-editorial-fg` (`#111111`) / `--color-bg` (`#ffffff`): 약
  **18.9:1**, WCAG AA 통과.
- `--color-editorial-muted-fg` (`#5f6368`) / `--color-bg` (`#ffffff`): 약
  **6.0:1**, 일반 텍스트 WCAG AA 통과.
- CTA와 highlights의 대비는 기존 공유 Hero 토큰 조합의 검증 결과를 유지한다.
- card 내부 텍스트는 이미지 위에 직접 배치하지 않는다. 부득이한 overlay는
  불투명 scrim과 함께 각 상태에서 4.5:1 이상을 별도로 검증한다.

## 구현·리뷰 검증 기준

1. K-drama Hero에 label, headline, subhead, 기존 공유 CTA, highlights와 세
   visual이 순서대로 보인다.
2. desktop 기준에서 양쪽 compact 카드와 중앙 wide 카드의 크기·radius·shadow
   위계가 Pencil 노드와 일치한다.
3. mobile에서 세 카드가 원래 순서대로 한 열에 놓이며 viewport overflow가 없다.
4. 명시적 줄바꿈, 장문 번역, RTL에서 텍스트가 생략되거나 겹치지 않는다.
5. 최신 브라우저에서 정교한 레이아웃을 제공하고 레거시 환경에서도 모든 핵심
   콘텐츠가 기본 block 흐름으로 노출된다.
6. label/headline/subhead 및 기존 CTA/highlights의 색상 조합이 WCAG AA를
   만족한다.

## 디자인 고정

위 토큰과 시각 스펙을 K-drama Pencil Hero의 디자인 단일 출처로 고정한다.
구현이 CTA/highlights 공유 시각 계약, 카드 순서, 반응형 재배치를 바꾸려면 이
문서를 먼저 갱신해야 한다.
