# 작업 스펙: 세 프로젝트 공통 확장형 Hero

## 목적 (goal)

세 프로젝트의 방문자가 중앙 정렬된 핵심 문구와 CTA를 통해 각 제품의 주요 가치를 이해하고 다음 행동을 선택할 수 있게 한다.

## 타깃 (target)

- 디바이스: 모바일과 데스크톱
- 브라우저 하한: 저장소의 기존 Browserslist 및 E2E 브라우저 정책 유지

## 디자인 (design_ref)

DESIGN.md 표준 따름. 벗어남: 없음.

## 범위

- 포함(scope_in): 세 프로젝트가 공유하는 Hero UI와 props 계약, 중앙 정렬된 메인 헤더 텍스트·서브 헤더 텍스트·CTA 버튼, 프로젝트별 텍스트와 CTA label 설정, `children`으로 합성하는 프로젝트별 미디어 영역
- 제외(scope_out): CTA 링크·콜백·분석 이벤트, 실제 이미지 제작, API·CMS 연동, 애니메이션

## 수용 기준 (acceptance_criteria)

1. 세 프로젝트 모두 공통 Hero를 사용하고 모바일과 데스크톱에서 제목, 설명, CTA가 중앙 정렬된다.
2. 각 프로젝트는 `HeroContent.cta.label`로 CTA 문구를 설정하고 `cta`의 유무로 표시 여부만 결정하며, Hero 계약에는 링크·콜백·이벤트가 없다.
3. 미디어 영역은 `HeroProps.children`으로 합성되고 고정 종횡비나 고정 크기 계약 없이 프로젝트별 비율과 내부 구조를 수용한다.
4. 기존 지원 viewport에서 Hero의 텍스트, CTA, 미디어가 겹치거나 가로 overflow를 만들지 않는다.
5. 실제 이미지, API·CMS, 애니메이션을 추가하지 않은 상태에서 typecheck와 컴포넌트 테스트가 통과한다.

## 제약 (constraints)

현재 React·TypeScript·Vite 스택과 DESIGN.md를 유지한다. 미디어는 전용 데이터 prop이나 render prop이 아니라 `children` 합성을 사용한다. CTA 표시를 위한 Boolean prop을 추가하지 않는다.

## 시각 레퍼런스 (visual_reference)

```text
                 메인 헤더 텍스트
                 서브 헤더 텍스트
                    CTA 버튼

┌──────────────── 프로젝트별 media children ────────────────┐
│ 고정 비율·고정 내부 구조 없이 프로젝트가 내용을 합성      │
└────────────────────────────────────────────────────────────┘
```

## 우선순위 / 데이터 (선택)

프로젝트별 확장성과 재사용 가능한 API를 우선한다. 외부 데이터와 런타임 상태는 없다.

## 비고

- [추론] 표시 항목: 없음

## 컴포넌트 트리와 책임

```text
각 프로젝트 App
└── Hero
    ├── Hero text group
    │   ├── title
    │   ├── description
    │   └── optional CTA label
    └── children (project-owned media composition)
```

- `Hero`: 공통 Hero의 의미 구조와 중앙 기반 레이아웃 경계를 제공한다.
- `HeroContent`: 프로젝트가 제공하는 제목, 설명, 선택적 CTA label만 전달한다.
- `HeroProps.children`: 프로젝트별 미디어 비율과 내부 구조를 Hero 구현과 분리한다.

공유 상태나 하위 컴포넌트 간 데이터 주입이 없으므로 compound context는 도입하지 않는다. CTA 표시 여부는 `showCta` 같은 Boolean prop 대신 `cta` 객체의 존재 여부로 표현한다. CTA 종류를 암시하는 variant나 행동 prop은 만들지 않는다.

## 고정 TypeScript 계약

단일 출처는 `packages/contracts/src/landing.ts`다.

- `HeroCtaContent`: 표시할 `label`만 소유한다.
- `HeroContent`: 필수 `title`, `description`과 선택적 `cta`를 소유한다.
- `HeroContent.label`: 제목 앞의 짧은 label을 선택적으로 제공한다. 이를 생략하는 기존 프로젝트 콘텐츠는 그대로 유효하다.
- `HeroProps`: `content`, 필수 `children`, 선택적 고정값 `testId`만 소유한다.
- `LandingAction`과 `LandingActionHandler`: Hero에서는 사용하지 않지만 최종 CTA 등 다른 섹션의 기존 계약을 위해 유지한다.

`HeroProps.children`은 미디어 콘텐츠의 정적 합성 경계다. `media`, `renderMedia`, `aspectRatio`, `imageUrl` 같은 별도 계약은 이번 범위에 추가하지 않는다.

## test-id 계약

| 영역        | 고정 값      |
| ----------- | ------------ |
| Hero 루트   | `hero`       |
| Hero 라벨   | `hero-label` |
| Hero CTA    | `hero-cta`   |
| Hero 미디어 | `hero-media` |

동적 action id 기반 `hero-action:{id}`는 새 Hero에 action 식별자가 없으므로 제거한다. 테스트는 고정 test-id와 사용자 노출 role/name을 함께 사용하며 test-id를 스타일 선택자로 사용하지 않는다.

## 데이터 흐름

API, 전역 상태, 이벤트 흐름은 없다.

```text
project content constants ── title/description/optional CTA label ──┐
project App composition ───────── media children ────────────────────┤
                                                                    ▼
                                                               shared Hero
```

## 병렬 실행 단위

계약 고정 후 아래 작업은 독립 진행 가능하다.

1. 공통 Hero JSX와 반응형 스타일 구현
2. 세 프로젝트의 Hero content와 media children 합성 전환
3. 공통 컴포넌트·세 프로젝트 통합·E2E 테스트 갱신
4. 접근성, RTL, viewport overflow 검증

별도 상태·데이터 구현 단위는 없다.

## 계약 고정

이 문서와 `packages/contracts/src/landing.ts`의 `HeroCtaContent`, `HeroContent`, `HeroProps`, `landingTestIds.hero`, `landingTestIds.heroLabel`, `landingTestIds.heroCta`, `landingTestIds.heroMedia`를 구현·디자인·테스트 레이어의 고정 계약으로 선언한다. Hero에 링크·콜백·이벤트를 재도입하거나 미디어를 전용 prop으로 바꾸려면 이 계약을 먼저 갱신해야 한다.
