# DESIGN.md — 디자인 시스템 단일 출처

`AGENT.md`가 링크하는 디자인 표준이다. `design` 역할은 토큰을 확장하고,
`implementation` 역할은 토큰을 적용한다. 작업별 스펙은 이 표준을 따르며,
의도적인 이탈만 `design_ref`에 기록한다.

## 원칙

- **모바일 기본 레이아웃을 먼저 정의하고 넓은 폭에서 확장한다.** 기본 선언이 좁은
  폭을 향하고, `--breakpoint-mobile`을 넘는 폭에서 `min-width`로 올린다. 보장 폭은
  320px부터 430px까지와 820px이다. 콘텐츠 순서와 핵심 행동은 뷰포트에 따라 바꾸지
  않는다.
- **폭만으로 기기를 설명하지 않는다.** 320×568과 430×932는 세로가 364px 차이 나고, 세로에
  반응하는 값이 없으면 짧은 기기일수록 나빠진다. 히어로는 보장 뷰포트 전부에서 2화면을
  넘지 않고 주 CTA는 첫 화면 안에 있어야 한다. 화면을 채워야 하는 블록은 `vh`가 아니라
  `svh`를 쓴다 — 모바일의 `vh`는 URL 바가 숨은 큰 뷰포트 기준이다. 세로가 짧은 화면은
  `max-height: 40rem`에서 여백과 타입 스케일을 낮춘다.
- 이 순서는 2026-09-03에 뒤집혔다. 트래픽의 99% 이상이 모바일인데 기본값이 데스크톱을
  향해 있어, 넓은 폭에서만 성립하는 값이 기본이 되고 좁은 폭은 예외로 덮어쓰는 구조가
  됐다. 그 결과 768~1004px 구간에서 히어로 미디어가 넘쳤고, 세로 리듬이 데스크톱
  기준으로 남아 모바일 섹션이 뷰포트의 두 배를 넘겼다. 남아 있는 `max-width` 블록은
  건드리는 파일부터 `min-width`로 옮긴다.
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

| 범주     | 대표 토큰                                                   | 역할                                                                    |
| -------- | ----------------------------------------------------------- | ----------------------------------------------------------------------- |
| 색       | `--color-bg`, `--color-fg`, `--color-muted-fg`              | 배경과 텍스트                                                           |
| 액션     | `--color-accent`, `--color-accent-fg`                       | 주요 행동과 그 위의 콘텐츠                                              |
| 상태     | `--color-danger`, `--color-danger-fg`, `--color-focus`      | 오류와 키보드 포커스                                                    |
| 간격     | `--space-1` … `--space-24`                                  | 밀도와 레이아웃 리듬                                                    |
| 타이포   | `--font-sans`, `--text-xs` … `--text-display`               | 글꼴과 타입 스케일                                                      |
| 형태     | `--radius-sm` … `--radius-full`                             | 컨트롤과 컨테이너 모서리                                                |
| 깊이     | `--shadow-sm` … `--shadow-lg`                               | 표면 위계                                                               |
| 모션     | `--duration-fast`, `--duration-normal`, `--ease-standard`   | 상태 전환                                                               |
| 레이아웃 | `--content-max`, `--content-reading`, `--breakpoint-mobile` | 콘텐츠 폭과 반응형 경계                                                 |
| 리듬     | `--section-block`, `--section-block-compact`                | 섹션 세로 여백. 모바일 기본값을 갖고 `min-width: 48.01rem`에서 올라간다 |

## 컴포넌트 프리미티브

- `Button`: primary, secondary, ghost, destructive의 명시적 variant를 제공한다.
- `Card`: 기본 표면이며 테두리, radius, shadow는 공통 토큰만 사용한다.
- `Badge`: 짧은 상태나 분류에만 쓰고 본문 정보를 대신하지 않는다.
- `Input`: label, description, error를 연결하고 모든 상태에서 동일한 높이 리듬을
  유지한다.
- `Section`, `Container`, `Stack`: 앱 간 레이아웃 리듬을 공유하는 구조
  프리미티브다.

상태와 랜딩별 구조 계약은 `docs/design/landing-monorepo.md`를 따른다.
