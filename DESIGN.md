# DESIGN.md — 디자인 시스템 단일 출처

`AGENT.md`가 링크하는 디자인 표준이다. `design` 역할은 토큰을 확장하고,
`implementation` 역할은 토큰을 적용한다. 작업별 스펙은 이 표준을 따르며,
의도적인 이탈만 `design_ref`에 기록한다.

## 원칙

- 데스크톱 기본 레이아웃을 먼저 정의하고 `--breakpoint-mobile` 이하에서 한 열로
  축소한다. 콘텐츠 순서와 핵심 행동은 뷰포트에 따라 바꾸지 않는다.
- 모든 시각 값은 `packages/design-tokens/src/tokens.css`의 CSS 변수에서 온다.
  컴포넌트와 앱 스타일에 색상, 길이, 시간의 생값을 쓰지 않는다.
- 공통 프리미티브는 접근 가능한 shadcn 계열 API를 따른다. 앱 전용 UI는 공통
  토큰을 소비하되 공통 패키지로 성급하게 승격하지 않는다.
- 본문과 핵심 UI는 WCAG AA를 만족한다. 포커스는 색상 변화에만 의존하지 않고
  `--focus-ring`을 사용하며, reduced-motion 선호를 존중한다.
- 국제화된 문구의 길이를 가정해 텍스트 영역은 고정 높이를 피하고 줄바꿈을
  허용한다. 논리적 CSS 속성을 우선한다.

## 토큰

토큰의 실제 값과 전체 목록은
`packages/design-tokens/src/tokens.css`가 단일 출처다.

| 범주     | 대표 토큰                                                   | 역할                       |
| -------- | ----------------------------------------------------------- | -------------------------- |
| 색       | `--color-bg`, `--color-fg`, `--color-muted-fg`              | 배경과 텍스트              |
| 액션     | `--color-accent`, `--color-accent-fg`                       | 주요 행동과 그 위의 콘텐츠 |
| 상태     | `--color-danger`, `--color-danger-fg`, `--color-focus`      | 오류와 키보드 포커스       |
| 간격     | `--space-1` … `--space-24`                                  | 밀도와 레이아웃 리듬       |
| 타이포   | `--font-sans`, `--text-xs` … `--text-display`               | 글꼴과 타입 스케일         |
| 형태     | `--radius-sm` … `--radius-full`                             | 컨트롤과 컨테이너 모서리   |
| 깊이     | `--shadow-sm` … `--shadow-lg`                               | 표면 위계                  |
| 모션     | `--duration-fast`, `--duration-normal`, `--ease-standard`   | 상태 전환                  |
| 레이아웃 | `--content-max`, `--content-reading`, `--breakpoint-mobile` | 콘텐츠 폭과 반응형 경계    |

## 컴포넌트 프리미티브

- `Button`: primary, secondary, ghost, destructive의 명시적 variant를 제공한다.
- `Card`: 기본 표면이며 테두리, radius, shadow는 공통 토큰만 사용한다.
- `Badge`: 짧은 상태나 분류에만 쓰고 본문 정보를 대신하지 않는다.
- `Input`: label, description, error를 연결하고 모든 상태에서 동일한 높이 리듬을
  유지한다.
- `Section`, `Container`, `Stack`: 앱 간 레이아웃 리듬을 공유하는 구조
  프리미티브다.

상태와 랜딩별 구조 계약은 `docs/design/landing-monorepo.md`를 따른다.
