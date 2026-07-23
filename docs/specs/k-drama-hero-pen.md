# 작업 스펙: K-drama `.pen` 기반 Hero

## 목적 (goal)

K-drama 방문자가 `apps/k-drama/k-drama.pen`의 시각 위계로 제품의 정체성과 핵심 가치를 빠르게 이해하도록, 기존 공유 Hero 계약을 K-drama 전용 합성에서 재사용한다.

## 타깃 (target)

- 디바이스: 모바일과 데스크톱
- 브라우저 하한: 저장소의 기존 Browserslist 및 E2E 브라우저 정책 유지
- 레거시 환경: 핵심 콘텐츠를 숨기지 않는 점진적 저하

## 디자인 (design_ref)

- 단일 참조: `apps/k-drama/k-drama.pen`의 `Talkie Landing Hero` 프레임
- 프로젝트 표준: `DESIGN.md`
- 확정된 의도적 차이: `.pen`의 CTA는 이번 K-drama Hero에서 렌더링하지 않는다.

## 범위

- 포함(scope_in): K-drama Hero의 label, header, sub-header, `children` 기반 visual 합성, `.pen` 기반 반응형 시각 반영, 고정 test-id
- 제외(scope_out): Hero CTA 및 CTA 동작, highlights, 링크·콜백·분석 이벤트, API·CMS 연동, 다른 앱의 Hero 콘텐츠·표시 구성 변경, Hero 외 섹션

## 수용 기준 (acceptance_criteria)

1. K-drama Hero가 label → level-1 header → sub-header → visual 순서로 노출된다.
2. label은 `HeroContent.label`, visual은 기존 `HeroProps.children` 합성 경계를 사용한다.
3. K-drama Hero에는 `HeroContent.cta`와 `HeroContent.highlights`가 제공되지 않아 CTA와 highlights가 렌더링되지 않는다.
4. `ai-communication`과 `k-culture`가 현재 사용하는 선택적 CTA/highlights 계약과 기존 test-id는 변경 없이 유지된다.
5. 최신 모바일·데스크톱 브라우저에서 `.pen`의 정보 위계가 반영되고, 레거시 환경에서도 label·header·sub-header·visual 핵심 콘텐츠가 숨겨지지 않는다.
6. 제목과 설명은 locale별 명시적 `\n` 줄바꿈 및 자연 줄바꿈을 허용하고, 고정 높이 또는 가로 overflow에 의존하지 않는다.
7. typecheck, 컴포넌트 테스트, 앱 통합 테스트, 접근성 및 viewport 검증이 통과한다.

## 제약 (constraints)

- `showLabel`, `hideCta`, `showHighlights` 같은 Boolean variant prop을 추가하지 않는다.
- 미디어 전용 prop이나 render prop을 추가하지 않고 `children` 합성을 유지한다.
- K-drama만의 시각 차이를 공유 데이터 계약의 variant로 만들지 않는다. 앱 조합과 스타일 경계에서 명시적으로 표현한다.
- 새 상태, context, provider는 필요하지 않다.

## 컴포넌트 트리와 책임

```text
K-drama App
└── shared Hero
    ├── optional label
    ├── title (h1)
    ├── description
    └── children (K-drama-owned visual composition)
```

- `HeroContent`: label, title, description과 기존의 선택적 CTA/highlights 데이터 계약을 소유한다.
- `HeroProps.children`: K-drama visual의 정적 합성 경계다.
- K-drama App: CTA/highlights를 생략한 명시적 콘텐츠 조합과 visual children을 소유한다.

정적 구조이며 공유 상태가 없으므로 compound context를 도입하지 않는다. `children`만으로 필요한 합성 경계가 이미 존재한다.

## 고정 TypeScript 계약

단일 출처는 `packages/contracts/src/landing.ts`다.

- `HeroContent.label?: string`: 제목 앞에 배치되는 짧은 텍스트. 선택형으로 추가하여 다른 두 앱의 기존 객체를 하위 호환한다.
- `HeroContent.cta?`, `HeroContent.highlights?`: 다른 앱 하위 호환을 위해 유지한다. K-drama 조합에서는 두 필드를 전달하지 않는다.
- `HeroProps.children`: visual 전용 합성 경계로 유지한다.
- `landingTestIds.heroLabel`: label 영역의 고정 식별자 `hero-label`.
- 기존 `hero`, `heroCta`, `heroHighlights`, `heroMedia`, `heroHighlight(id)`는 유지한다.

## 데이터 흐름

API, 런타임 상태, 사용자 행동은 없다.

```text
K-drama localized content ── label/title/description ──┐
K-drama App composition ───────── visual children ─────┤
                                                       ▼
                                                  shared Hero
```

## 병렬 실행 단위

계약 고정 후 다음 작업을 독립 실행할 수 있다.

1. design: `.pen` Hero 프레임을 토큰·반응형 규칙으로 변환
2. implementation: 공유 Hero label 렌더링과 K-drama의 CTA/highlights 없는 명시적 합성
3. tester: 계약·컴포넌트·K-drama 통합·viewport 회귀 검증
4. accessibility: heading 관계, reading order, visual 대체 이름 및 overflow 검증

별도 상태·데이터 작업은 없다.

## 가정

- discussion에서 확정한 “라벨”은 Hero headline 앞의 짧은 텍스트이며 브랜드 로고나 CTA label을 뜻하지 않는다.
- visual의 실제 구조와 에셋 선택은 `.pen`을 해석하는 design/implementation 역할이 결정하되 `children` 계약을 벗어나지 않는다.

## 계약 고정

이 문서와 `packages/contracts/src/landing.ts`의 `HeroContent.label`, 기존 `HeroProps.children`, `landingTestIds.heroLabel`을 K-drama Hero 작업의 고정 계약으로 선언한다. K-drama Hero에는 CTA·highlights·행동 계약을 추가하지 않는다.
