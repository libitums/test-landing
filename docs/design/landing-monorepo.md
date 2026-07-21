# 랜딩 실험 모노레포 디자인 고정

## 범위와 가정

두 예시는 시각 레퍼런스 없이 정보 구조를 검증하는 저해상도 와이어프레임이다.
둘 다 `DESIGN.md`와 공통 토큰을 따르며 디자인 이탈은 없다. 앱별 섹션은 실험
공간이지만 색, 간격, 타이포, 형태, 모션의 새 생값을 소유하지 않는다.

## 공통 레이아웃 계약

- 페이지 배경은 `--color-bg`, 기본 글자는 `--color-fg`, 보조 글자는
  `--color-muted-fg`를 쓴다.
- `Container`는 `--content-max` 안에서 가운데 정렬하고 인라인 여백은 데스크톱
  `--space-8`, 모바일 `--space-4`를 쓴다.
- `Section`의 블록 여백은 데스크톱 `--space-24`, 모바일 `--space-16`이다.
- 두 열 영역은 데스크톱에서 동일 비중의 열과 `--space-12` 간격을 사용한다.
  `--breakpoint-mobile` 이하에서는 문서 순서를 유지한 한 열과 `--space-8`
  간격으로 바뀐다.
- 제목의 최대 읽기 폭은 `--content-reading`이며 hero 제목은
  `--text-display`/`--leading-tight`, 섹션 제목은
  `--text-3xl`/`--leading-heading`을 쓴다.
- 데스크톱 우선이지만 모든 텍스트는 줄바꿈을 허용한다. 번역문 확장을 위해
  버튼과 카드에 고정 너비 또는 고정 텍스트 높이를 두지 않는다.

## 와이어프레임 A — 제품 중심 랜딩

```text
[Header: Brand | Product · Pricing · FAQ | Primary action]
[Hero: eyebrow + headline + copy + actions | product preview]
[Trust strip: customer marks]
[Feature grid: shared Card × 3]
[App-only interactive comparison]
[Testimonial]
[CTA band: headline + primary action]
[Footer: locale + legal/navigation]
```

- Hero는 데스크톱 두 열, 모바일 한 열이다. 행동 그룹은 primary와 secondary만
  두며 모바일에서는 각 버튼이 가용 인라인 공간을 채울 수 있다.
- 제품 미리보기와 비교 영역은 `--color-surface`, `--color-border`,
  `--radius-xl`, `--shadow-lg`로 위계를 만든다.
- 전용 비교 UI는 A 앱에 남긴다. 다른 앱에서 같은 사용자 문제와 API가 확인될
  때만 공통 패키지 승격을 검토한다.

## 와이어프레임 B — 스토리 중심 랜딩

```text
[Header: Brand | Stories · Method | Primary action]
[Hero: centered eyebrow + headline + copy + action]
[Editorial proof: image placeholder | narrative]
[Outcome metrics: shared Card × 3]
[App-only step timeline]
[FAQ]
[CTA band: headline + primary action]
[Footer: locale + legal/navigation]
```

- Hero 본문은 `--content-reading` 안에서 가운데 정렬한다.
- Editorial proof는 데스크톱에서 교차 두 열, 모바일에서 이미지 다음 설명
  순서의 한 열이다.
- 전용 timeline은 B 앱에 남기며 단계는 색상만이 아니라 숫자와 제목으로
  식별한다.

## 공통 프리미티브 상태

| 프리미티브 | 상태            | 토큰 계약                                                                                                               |
| ---------- | --------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Button     | default         | primary는 `--color-accent`/`--color-accent-fg`; secondary는 `--color-bg`/`--color-fg`/`--color-border`                  |
| Button     | hover / active  | primary는 각각 `--color-accent-hover`, `--color-accent-active`; secondary는 `--color-surface`, `--color-surface-strong` |
| Button     | focus-visible   | `--color-focus`와 `--focus-ring`; outline 제거만 단독 사용 금지                                                         |
| Button     | disabled        | `--color-disabled-bg`/`--color-disabled-fg`; 상호작용과 모션 없음                                                       |
| Button     | loading         | 기존 레이블 폭을 보존하고 텍스트 상태를 함께 알림; `--duration-normal` 사용                                             |
| Card       | default / hover | `--color-bg`/`--color-border`/`--shadow-sm`; 상호작용형만 hover에서 `--shadow-md`                                       |
| Input      | default / focus | `--color-bg`/`--color-fg`/`--color-border`; focus-visible은 Button과 동일                                               |
| Input      | error           | `--color-danger`로 테두리와 연결된 오류 문구를 함께 표시                                                                |
| Empty      | empty           | 제목, 설명, 선택 행동 순서; `--color-muted-fg`를 보조 문구에만 사용                                                     |

모든 상태 전환은 `--duration-fast` 또는 `--duration-normal`과
`--ease-standard`를 사용한다. reduced-motion 환경에서는 비필수 전환과 반복
애니메이션을 제거한다.

## 대비와 반응형 검증 기준

- `--color-fg`, `--color-muted-fg`는 `--color-bg` 및 `--color-surface` 위에서
  일반 텍스트 AA를 만족한다.
- `--color-accent-fg`는 accent의 default, hover, active 배경 모두에서 일반
  텍스트 AA를 만족한다. danger 조합도 같은 기준을 적용한다.
- disabled 색은 정보 전달에 사용하지 않으며 비활성 의미를 네이티브 속성과
  함께 제공한다.
- 지원 범위는 프로젝트 Browserslist 계약을 따른다. CSS 변수, flex/grid,
  논리적 속성 범위 안에서 구성하며 모바일 경계는 `--breakpoint-mobile`의 값과
  동기화한다.

## 신규 토큰 도입 이유

기존 `DESIGN.md`가 자리표시자뿐이어서 공통 UI와 앱 전용 UI가 동일한 언어를
쓸 수 있도록 semantic color, spacing, type, radius, shadow, motion, layout
스케일을 한 번에 고정했다. component-specific 토큰은 만들지 않아 각 앱이
같은 기반을 조합할 수 있게 했다.
