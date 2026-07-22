# Shared Feature UI 디자인 고정

## 범위와 레퍼런스 해석

세 앱이 같은 정보 위계와 반응형 리듬을 유지하면서 앱별 기능 콘텐츠와 동작을
합성하는 공통 기능 섹션의 시각 계약이다. 각 앱은 이 계약으로 기능 섹션을 최소
3개 반복하며, 반복 인스턴스도 하나의 일관된 문서 흐름으로 읽혀야 한다. 구조 어휘는 `SharedFeature`,
`SharedFeatureNumber`, `SharedFeatureHeader`, `SharedFeatureSubheader`,
`SharedFeatureContent`로 고정한다.

`apps/k-drama/k-drama.pen`의 기능 섹션에서 다음 시각 위계를 참조했다.

- 밝은 전체 폭 섹션 위에 번호 배지, 큰 헤드라인, 설명, 기능 데모가 문서 순서대로
  놓인다.
- 번호 배지는 원형에 가까운 작은 강조 표면으로 헤드라인보다 먼저 읽힌다.
- 헤드라인은 강한 전경색과 굵기로, 서브헤더는 muted 전경색과 본문 행간으로
  구분된다.
- 기능 데모는 각 앱의 고유 표현이므로 공통 템플릿이 외형이나 상태를 강제하지
  않는 `children` 영역으로 남긴다.

레퍼런스의 생 색상과 치수는 복사하지 않는다. `DESIGN.md`의 공통 토큰으로
동일한 위계를 재현하며 의도적인 디자인 이탈은 없다.

## 토큰 계약

기본 흰색 표면은 기존 `--color-bg`를 재사용한다. 레퍼런스의 따뜻하고 옅은 교대
표면 `#fbf9f8`은 기존 `--color-surface`와 색 의도가 달라 컴포넌트 독립 시맨틱
토큰 `--color-surface-soft` 하나만 추가한다. 기능별 색 토큰은 만들지 않는다.
대비 계산 결과 `--color-surface-soft` 위 `--color-fg`는 17.01:1,
`--color-muted-fg`는 7.22:1이며 일반 텍스트 WCAG AA를 충족한다. 기존 흰색
표면에서는 각각 17.85:1, 7.58:1이다.

번호 배지는 단계 표시라는 시맨틱 역할에 맞춰 `--color-step`을 사용한다. 이
토큰은 기존 `--color-editorial-accent`를 별칭으로 재사용하므로 요구 색상
`#6d5dfb`의 단일 출처를 유지하고 UI CSS에는 생 색상을 노출하지 않는다.
`--color-accent-fg`의 흰색 텍스트는 `--color-step` 위에서 4.56:1로 일반 텍스트
WCAG AA를 충족한다.

서브헤더는 본문보다 낮은 위계를 드러내는 `--color-subtle-fg`를 사용한다. 이
시맨틱 토큰의 값은 `#64748b`이며 disabled 상태와 의미를 섞지 않는다. 실제
`--text-xl` 크기와 `--font-light` 굵기에서도 일반 텍스트 기준을 적용했을 때
`--color-bg` 위 4.76:1, `--color-surface-soft` 위 4.53:1로 WCAG AA를 충족한다.
`--font-light`는 기존 굵기 스케일의 `--font-normal`(400) 바로 아래인 표준 light
값 300이며, 세 앱이 같은 서브헤더 위계를 공유하도록 공통 토큰으로 둔다.

Early Access CTA는 기존 공통 `ButtonLink`의 명시적 `text` variant를 사용한
인라인 텍스트 링크로 표현한다. 기본색은 기존 `--color-subtle-fg`를 재사용하고,
hover와 active가 공유하는 보라색은 상호작용 역할의 `--color-link-interactive`
토큰 하나만 추가한다. 값 `#5b42c7`을 UI CSS에 직접 쓰지 않는다. 기본 링크는
흰색/soft 표면에서 각각 4.76:1/4.53:1, 상호작용 링크는 각각 6.89:1/6.56:1로
일반 텍스트 WCAG AA를 충족한다.

| 시각 역할                                 | 토큰                                               |
| ----------------------------------------- | -------------------------------------------------- |
| 흰색 섹션 배경 / 기본 글자                | `--color-bg` / `--color-fg`                        |
| 부드러운 섹션 배경 / 기본 글자            | `--color-surface-soft` / `--color-fg`              |
| 서브헤더 글자                             | `--color-subtle-fg`                                |
| 번호 배지 배경 / 글자                     | `--color-step` / `--color-accent-fg`               |
| 전체 콘텐츠 폭                            | `--content-max`                                    |
| 헤더 읽기 폭                              | `--content-reading`                                |
| 데스크톱 인라인 여백 / 모바일 인라인 여백 | `--space-8` / `--space-4`                          |
| 데스크톱 블록 여백 / 모바일 블록 여백     | `--space-24` / `--space-16`                        |
| 번호 배지 크기                            | `--space-12`                                       |
| 번호와 헤더 간격                          | `--space-8`                                        |
| 헤더와 서브헤더 간격                      | `--space-6`                                        |
| 소개부와 기능 콘텐츠 간격                 | `--space-12`                                       |
| 헤더 타입                                 | `--text-display`, `--font-bold`, `--leading-tight` |
| 서브헤더 타입                             | `--text-xl`, `--font-light`, `--leading-body`      |
| 번호 타입                                 | `--text-lg`, `--font-bold`, `--leading-heading`    |
| 번호 형태                                 | `--radius-full`                                    |
| 반응형 경계                               | `--breakpoint-mobile`                              |
| Early Access CTA 기본 / hover·active      | `--color-subtle-fg` / `--color-link-interactive`   |
| Early Access CTA 타입                     | `--text-base`, `--font-semibold`, `--leading-body` |
| Early Access CTA 포커스                   | `--color-focus`, `--focus-ring`                    |

`--text-display`가 이미 유동 크기이므로 레퍼런스의 큰 헤드라인을 별도 기능 전용
타입 토큰 없이 재현한다. 번호 배지 또한 `--space-12`를 너비와 높이에 함께 써서
새 크기 토큰 없이 정사각형 비율을 만든다.

## 컴포넌트별 시각 스펙

### `SharedFeature`

- 전체 폭 의미론적 섹션이며 글자는 `--color-fg`다. `white` 표면 variant는
  `--color-bg`, `soft` 표면 variant는 `--color-surface-soft`를 사용한다. 두
  variant는 정보 위계나 동작을 바꾸지 않고 인접한 기능 섹션의 경계만 보조한다.
- 앱마다 최소 3개 인스턴스를 문서 순서대로 반복한다. 기본 표면 리듬은
  `white` → `soft` → `white`이며, 더 많은 섹션은 두 variant를 계속 교대한다.
  인스턴스 사이를 여백만으로 구분하지 않아 저시력 환경에서도 경계가 남게 한다.
- 내부 컨테이너는 `--content-max` 안에서 가운데 정렬한다. 인라인 여백은
  데스크톱 `--space-8`, 모바일 `--space-4`다.
- 블록 여백은 데스크톱 `--space-24`, 모바일 `--space-16`이다.
- 공통 소개부 다음에 `SharedFeatureContent`가 오며 간격은 `--space-12`다.
- 텍스트와 콘텐츠 모두 고정 높이를 쓰지 않는다. 긴 번역문은 줄바꿈되며 섹션
  높이는 콘텐츠에 따라 늘어난다.

### `SharedFeatureNumber`

- 소개부의 첫 요소다. 배경은 `--color-step`, 글자는
  `--color-accent-fg`이며 크기는 양 축 모두 `--space-12`다.
- 가운데 정렬한 `--text-lg` / `--font-bold` / `--leading-heading` 번호를 쓰고
  형태는 `--radius-full`이다.
- 번호는 장식이 아니라 단계 정보다. 색과 모양만으로 의미를 전달하지 않으며
  접근성 이름을 가진 텍스트로 남는다.

### `SharedFeatureHeader`

- 문서의 올바른 제목 단계에 맞는 의미론적 heading이다. 시각 타입은
  `--text-display` / `--font-bold` / `--leading-tight`다.
- 최대 인라인 크기는 `--content-reading`이며 고정 너비와 강제 줄바꿈을 두지
  않는다. 단, 지역화 문자열에 포함된 의도적인 `\n`은 시각적 줄바꿈으로
  보존하고 그 밖의 줄바꿈은 가용 너비에 따라 자연스럽게 흐른다. 번호와의
  간격은 `--space-8`이다.

### `SharedFeatureSubheader`

- 헤더를 바로 보충하는 본문이다. 색은 `--color-subtle-fg`, 타입은
  `--text-xl` / `--font-light` / `--leading-body`다. 표준 light 굵기 300으로
  헤더와 위계를 분리한다.
- 최대 인라인 크기는 `--content-reading`이며 헤더와의 간격은 `--space-6`이다.
  지역화 문자열의 의도적인 `\n`을 보존하되 각 줄은 다시 자연스럽게 감쌀 수
  있어야 한다. 문구가 없을 때 빈 공간을 예약하지 않는다.

### `SharedFeatureContent`

- 앱별 `children`을 받는 흐름 컨테이너다. 공통 템플릿은 자식의 색, radius,
  shadow, 상호작용 상태를 덮어쓰지 않는다.
- 인라인 크기는 가용 공간 전체이며 최소 인라인 크기는 0이다. 이미지와 미디어는
  자신의 비율을 유지하되 컨테이너 너비를 넘지 않아야 한다.
- 앱별 콘텐츠의 내부 토큰 사용과 default / hover / focus / active / disabled /
  loading / error / empty 상태는 해당 자식 컴포넌트가 소유한다. 공통 섹션 자체는
  상호작용 요소가 아니므로 hover, active, disabled, loading 상태를 만들지 않는다.
  자식의 `focus-visible` 표시는 `--focus-ring`을 사용하고 섹션이 잘라내지 않는다.

### `EarlyAccessCta`

- 각 `SharedFeatureContent`의 앱별 자식에는 하나의 Early Access 인라인 텍스트 링크를
  포함한다. 공통 `ButtonLink`의 명시적 `text` variant를 합성하며 secondary 여부
  같은 Boolean 조합으로 외형을 전환하지 않는다. 앱은 지역화된 레이블과 실제
  목적지만 소유한다.
- 기본 상태는 투명한 표면과 경계 없는 `--color-subtle-fg` 텍스트를 쓰며 타입은
  `--text-base` / `--font-semibold` / `--leading-body`다. 링크는 기본 상태부터
  밑줄을 표시해 색상 없이도 상호작용 가능함을 알린다. 버튼형 패딩, 최소 블록 크기,
  radius, 고정 너비는 적용하지 않는다.
- hover와 active는 모두 `--color-link-interactive`로 바꾸되 밑줄을 계속 유지한다.
  두 상태 모두 색상만으로 구분하지 않도록 밑줄의 시각적 강조도 함께 유지하며,
  상태 전환이 레이아웃을 움직이지 않아야 한다.
- `focus-visible`은 `--color-focus`와 `--focus-ring`을 함께 사용한다. CTA의 링이
  `SharedFeatureContent` 경계에 잘리지 않아야 하며 Tab 순서는 해당 자식의 자연스러운
  DOM 순서를 따른다. 목적지를 가진 네이티브 `<a href>` 의미론을 사용하며 button
  role이나 키보드 동작을 덧씌우지 않는다.
- 기본 `--color-subtle-fg`와 hover·active `--color-link-interactive`는
  `--color-bg`와 `--color-surface-soft` 양쪽에서 일반 텍스트 WCAG AA를 만족한다.
  밑줄은 모든 표면에서 남아 색 차이가 유일한 링크 단서가 되지 않는다.
- 데스크톱과 모바일 모두 콘텐츠 흐름의 inline-start에 intrinsic 너비로 둔다.
  지역화 레이블은 자연스럽게 줄바꿈하며 고정 너비, 말줄임, line clamp를 쓰지 않는다.
  어떤 뷰포트에서도 숨기거나 다른 섹션으로 이동하지 않는다.
- CSS가 비활성화되거나 text variant를 지원하지 않는 구형 브라우저에서도 네이티브
  링크의 문구와 `href`가 남아 보여야 한다. 링크를 pseudo-element 생성 콘텐츠나
  JavaScript 초기화에 의존해 렌더하지 않는다.

## 반응형 계약

- 데스크톱을 기본으로 하고 모든 공통 요소는 번호 → 헤더 → 서브헤더 → 콘텐츠
  순서의 한 열 흐름을 유지한다. 앱별 콘텐츠는 넓은 화면에서 자체 다열 구성을
  선택할 수 있다.
- `--breakpoint-mobile` 이하에서는 공통 컨테이너 여백과 섹션 블록 여백만 모바일
  토큰으로 축소한다. 정보 순서, heading 단계, 핵심 동작의 위치를 바꾸지 않는다.
- `white`와 `soft` 표면 variant 및 최소 3개 섹션의 순서는 모든 뷰포트에서
  유지한다. 모바일에서도 섹션을 탭, 캐러셀 또는 조건부 표시로 축약하지 않는다.
- 템플릿은 고정 화면 높이, 텍스트 line-clamp, 가로 스크롤에 의존하지 않는다.
  긴 국제화 문구와 200% 텍스트 확대에서도 핵심 콘텐츠가 잘리지 않아야 한다.

## 구형 브라우저와 점진적 향상

- CSS가 없거나 CSS 변수, `clamp()`, 논리적 속성, 최신 레이아웃 기능을 충분히
  지원하지 않는 환경에서도 의미론적 문서 순서로 번호, 헤더, 서브헤더,
  `children`이 모두 렌더되어야 한다.
- 표면 variant는 콘텐츠 가시성의 전제 조건이 아니다. 새 토큰을 해석하지 못하면
  브라우저 기본 배경으로 퇴행해도 텍스트와 세 섹션 이상의 문서 순서는 남는다.
- 지역화 문자열의 명시적 줄바꿈은 의미론적 텍스트로 남겨 CSS 향상이 없어도
  내용이 유실되지 않아야 한다. 줄바꿈 보존 향상은 고정 높이와 함께 쓰지 않는다.
- 기본 DOM을 숨긴 뒤 미디어 쿼리에서 다시 표시하는 방식, 콘텐츠를 CSS 생성
  콘텐츠에만 두는 방식, JavaScript 기능 탐지 전까지 섹션을 감추는 방식은 금지한다.
- 향상용 CSS는 지원되는 브라우저에서만 간격과 배치를 바꾼다. 지원되지 않는
  선언이 무시되어도 기본 블록 흐름과 텍스트 가시성이 남아야 한다.
- reduced-motion 환경에서는 자식의 비필수 전환과 반복 애니메이션을 제거한다.

## 상태와 접근성 검증

- 기본 상태에서 번호, 헤더, 서브헤더, 콘텐츠가 시각 순서와 DOM 순서 모두
  일치한다.
- 서브헤더가 없거나 `children`이 비어도 빈 자리, 장식용 skeleton, 임의 오류
  상태를 만들지 않는다. 데이터 상태가 필요한 앱은 `children` 내부에서 명시적
  empty / loading / error UI를 제공한다.
- `--color-fg`, `--color-muted-fg`, `--color-subtle-fg`는 `--color-bg` 및
  `--color-surface-soft` 양쪽에서 각각 사용하는 텍스트 크기의 WCAG AA를
  만족한다. 흰색과 soft 표면은 장식적 구분일 뿐이므로 색 차이를 유일한 섹션
  이름이나 순서 단서로 쓰지 않는다. `--color-link-interactive`도 두 표면에서
  일반 텍스트 AA를 만족하며, `--color-accent-fg`는 `--color-step` 위 일반
  텍스트 AA를 만족한다.
- 번호 외 앱별 인터랙션의 키보드 포커스를 섹션의 overflow나 stacking context로
  자르지 않는다. 정보는 색상 하나에만 의존하지 않는다.

## 디자인 고정

이 문서의 토큰 매핑, 앱당 최소 3개 반복, `white`/`soft` 표면 variant, 지역화
문자열의 의도적 줄바꿈, 공통 구조 어휘, 반응형 동작, 점진적 향상 규칙은 구현에
적용할 수 있는 상태로 고정한다. 앱별 `children`의 구체적인 시각 상태는 각 기능
소유이며 이 공통 템플릿의 디자인 계약 밖이다.
