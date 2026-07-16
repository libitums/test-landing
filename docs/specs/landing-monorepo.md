# 작업 스펙: Vite React 랜딩 실험 모노레포

## 목적 (goal)

다양한 국가의 사용자를 대상으로 여러 랜딩 페이지 실험을 빠르게 만들고 비교할 수 있도록, 공통 디자인 시스템과 UI를 재사용하면서 실험별 개별 UI도 허용하는 pnpm 기반 Vite React 모노레포를 구축한다.

## 타깃 (target)

- 디바이스: 데스크톱 UI 우선 구성 후 모바일로 확장
- 브라우저 하한: Browserslist `> 0.5%, last 2 versions, Firefox ESR, not dead`; Safari/iOS Safari 15 이상; Android Chrome 109 이상; IE와 Opera Mini 제외

## 디자인 (design_ref)

DESIGN.md 표준 따름. 벗어남: 없음.

## 범위

- 포함(scope_in): pnpm workspace 모노레포, Vite React TypeScript 랜딩 앱 2개, shadcn 계열의 공통 UI 패키지, 공통 디자인 토큰/스타일, 앱별 개별 UI 확장 지점, 공통 TypeScript/ESLint/Vite 설정, 루트 install/build/typecheck/lint/test 명령, 향후 계획 `PLAN.md`
- 제외(scope_out): 분석 도구 연동

## 수용 기준 (acceptance_criteria)

1. 예제 랜딩 앱 2개가 각각 실행·빌드되며 공통 UI 및 동일 디자인 토큰 패키지를 실제로 소비한다.
2. 앱별 전용 UI가 공통 UI를 변경하지 않고 독립적으로 존재할 수 있는 구조가 코드로 확인된다.
3. 루트에서 `pnpm install` 후 `pnpm build`, `pnpm typecheck`, `pnpm lint`, `pnpm test`가 모두 통과한다.
4. `PLAN.md`에 분석 연동을 포함한 향후 확장 계획이 작성된다.

## 제약 (constraints)

pnpm, Vite, React, TypeScript, shadcn 기반 구성 원칙. 데스크톱 우선 반응형. 위 글로벌 브라우저 하한을 준수한다.

## 시각 레퍼런스 (visual_reference)

별도 레퍼런스 없음. 아래 저해상도 구조를 두 랜딩 예시의 최초 계약으로 사용한다.

## 우선순위 / 데이터 (선택)

빠른 실험 생성과 재사용성 우선. 이번 범위에서 API 및 분석 데이터 연동 없음.

## 비고

- [추론] 표시 항목: 없음

## 저장소 구조 계약

구현자는 아래 경로를 그대로 사용한다. 앱은 공유 패키지만 의존하며 서로를 import하지 않는다.

```text
.
├── apps/
│   ├── landing-alpha/
│   │   └── src/
│   │       ├── app/App.tsx
│   │       └── features/alpha/AlphaProofStrip.tsx
│   └── landing-beta/
│       └── src/
│           ├── app/App.tsx
│           └── features/beta/BetaComparison.tsx
├── packages/
│   ├── contracts/src/landing.ts
│   ├── design-tokens/src/{tokens.css,index.ts}
│   ├── ui/src/
│   │   ├── primitives/{button,card}.tsx
│   │   └── landing/{landing-shell.tsx,hero.tsx,feature-grid.tsx,cta-section.tsx}.tsx
│   ├── config-eslint/
│   ├── config-typescript/
│   └── config-vite/
├── docs/specs/landing-monorepo.md
├── PLAN.md
├── pnpm-workspace.yaml
└── package.json
```

패키지 이름은 각각 `@landing/contracts`, `@landing/design-tokens`, `@landing/ui`, `@landing/config-eslint`, `@landing/config-typescript`, `@landing/config-vite`로 고정한다. 앱 패키지 이름은 `@landing/alpha`, `@landing/beta`다. `@landing/ui`는 `@landing/design-tokens/tokens.css`를 소비하며, 각 앱 진입점은 이 CSS를 한 번만 import한다.

루트 스크립트 `build`, `typecheck`, `lint`, `test`는 `pnpm -r --if-present <script>` 형태로 모든 workspace에 위임한다. 설치 명령은 pnpm 자체 명령이므로 별도 `install` 스크립트를 만들지 않는다. 버전 정책과 정확한 의존성 버전은 구현 레이어가 현재 호환 조합으로 고정하되 pnpm lockfile을 커밋 대상으로 만든다.

## 저해상도 와이어프레임

### Landing Alpha — 제품 가치 중심

```text
┌──────────────── Header: brand · nav · CTA ────────────────┐
│ Hero: eyebrow · headline · copy · primary/secondary CTA   │
│                                      product placeholder  │
├──────────────── AlphaProofStrip (앱 전용) ────────────────┤
│ FeatureGrid: 3 shared FeatureCard items                    │
├──────────────── final shared CTA ──────────────────────────┤
│ Footer                                                     │
└────────────────────────────────────────────────────────────┘
```

### Landing Beta — 비교·선택 중심

```text
┌──────────────── Header: brand · nav · CTA ────────────────┐
│ Hero: eyebrow · headline · copy · primary CTA             │
├──────────────── BetaComparison (앱 전용) ─────────────────┤
│ FeatureGrid: 3 shared FeatureCard items                    │
├──────────────── final shared CTA ──────────────────────────┤
│ Footer                                                     │
└────────────────────────────────────────────────────────────┘
```

좁은 화면에서는 동일한 문서 순서를 유지하고 다단 그리드와 Hero 콘텐츠를 단일 열로 전환한다. 정보나 액션을 모바일에서 제거하지 않는다.

## 컴포넌트 트리와 책임

```text
AlphaApp
└── LandingShell
    ├── LandingShell.Header (공통 탐색 슬롯)
    ├── Hero (공통 Hero 콘텐츠와 CTA)
    ├── AlphaProofStrip (Alpha 전용 증거 지표)
    ├── FeatureGrid
    │   └── FeatureCard × 3
    ├── CtaSection
    └── LandingShell.Footer (공통 푸터 슬롯)

BetaApp
└── LandingShell
    ├── LandingShell.Header (공통 탐색 슬롯)
    ├── Hero (공통 Hero 콘텐츠와 CTA)
    ├── BetaComparison (Beta 전용 비교 행)
    ├── FeatureGrid
    │   └── FeatureCard × 3
    ├── CtaSection
    └── LandingShell.Footer (공통 푸터 슬롯)
```

- `LandingShell`: 페이지 landmark와 Header/Main/Footer 슬롯을 합성하는 공통 프레임이다.
- `Hero`: 텍스트 콘텐츠와 1~2개의 CTA를 표현한다.
- `FeatureGrid`: 전달받은 기능 목록을 표시하며 각 항목을 `FeatureCard`에 위임한다.
- `FeatureCard`: 기능 하나의 제목과 설명을 표현한다.
- `CtaSection`: 페이지 마지막 행동 유도 콘텐츠를 표현한다.
- `AlphaProofStrip`: Alpha 앱에만 있는 증거 지표 목록을 표현한다.
- `BetaComparison`: Beta 앱에만 있는 비교 행 목록을 표현한다.

공유 프레임은 `children` 합성을 사용한다. 선택 영역을 `showProof`, `showComparison` 같은 Boolean prop이나 render prop으로 제어하지 않는다. Alpha/Beta 앱이 각각 자신의 명시적 트리를 조합한다.

## 고정 TypeScript 계약

단일 출처는 `packages/contracts/src/landing.ts`다. `@landing/ui`와 두 앱은 이 타입을 import하고 같은 이름의 로컬 타입을 재정의하지 않는다.

- `LandingAction`: `primary | secondary | text` 명시적 variant와 링크 목적지를 가진 CTA
- `HeroContent`, `FeatureItem`, `CtaContent`: 공유 섹션 콘텐츠
- `ProofMetric`, `ComparisonRow`: 앱 전용 섹션 데이터
- `LandingShellProps`, `LandingShellSlotProps`: 합성 가능한 공통 프레임 props
- `HeroProps`, `FeatureGridProps`, `FeatureCardProps`, `CtaSectionProps`: 공유 UI props
- `AlphaProofStripProps`, `BetaComparisonProps`: 앱 전용 UI props

`onAction`은 분석 이벤트가 아니라 현재 범위의 앱 내 행동 경계다. 구현 시 링크 기본 동작을 보존하며, 분석 SDK나 이벤트 스키마를 추가하지 않는다.

## test-id 계약

`data-testid`는 아래 값만 안정 계약으로 사용한다. 반복 항목에는 데이터의 `id`를 `:` 뒤에 붙인다.

| 영역 | 고정 값 |
|---|---|
| 앱 루트 | `landing:alpha`, `landing:beta` |
| 공통 프레임 | `landing-shell`, `landing-header`, `landing-main`, `landing-footer` |
| Hero | `hero`, `hero-action:{action.id}` |
| 기능 | `feature-grid`, `feature-card:{feature.id}` |
| 최종 CTA | `cta-section`, `cta-action:{action.id}` |
| Alpha 전용 | `alpha-proof-strip`, `alpha-proof:{metric.id}` |
| Beta 전용 | `beta-comparison`, `beta-comparison-row:{row.id}` |

단위 테스트는 고정 test-id와 사용자 노출 role/name을 함께 사용한다. test-id는 스타일 선택자로 사용하지 않는다.

## 데이터 흐름

API와 전역 상태는 없다. 각 앱의 정적 콘텐츠 모듈이 계약 타입을 만족하는 데이터를 소유하고 App에서 공유/전용 컴포넌트로 아래 방향으로 전달한다. CTA 동작은 `onAction(action)`으로 앱에 올라가며 링크 이동 외 부수효과는 없다.

```text
app content constants → App composition → shared/app-specific UI
                                           └→ onAction → app navigation boundary
```

## 검증 계약

- 각 앱의 Vitest + Testing Library 테스트는 공통 `Hero`, `FeatureGrid`, `CtaSection`과 해당 앱 전용 컴포넌트가 렌더됨을 검증한다.
- 공통 UI 테스트는 CTA variant별 링크 속성, feature 반복 렌더, slot 합성을 검증한다.
- 계약 파일은 strict TypeScript로 검사한다.
- 빌드 산출물은 타깃 브라우저 정책을 반영한다. Browserslist 설정과 Vite의 build target 중 더 좁은 범위를 선택하지 않도록 구성한다.
- 접근 가능한 heading 순서, landmark, 링크 이름, 키보드 탐색을 구현 기본 요건으로 둔다. 색 대비 값은 DESIGN.md를 확장하는 디자인 레이어가 WCAG AA를 충족하도록 고정한다.

## 병렬 실행 단위

계약 고정 후 아래 묶음은 독립 진행 가능하다.

1. workspace 및 공통 config 패키지 구성
2. 디자인 토큰 패키지와 shadcn 계열 공통 UI 구현
3. Landing Alpha와 `AlphaProofStrip` 구현
4. Landing Beta와 `BetaComparison` 구현
5. 공통/앱 테스트 및 루트 검증 명령 구성
6. 분석 연동을 포함한 `PLAN.md` 작성

## 계약 고정

이 문서와 `packages/contracts/src/landing.ts`의 경로, export 이름, props, action variant, test-id가 구현·디자인·테스트 레이어의 고정 계약이다. 변경이 필요하면 소비 레이어 전체에 알리고 이 문서와 타입을 먼저 함께 갱신한다.
