# 작업 스펙: 세 프로젝트별 shadcn Navbar UI

## 목적 (goal)

사용자가 모바일과 데스크톱에서 각 프로젝트의 서로 다른 콘텐츠와 목적지에 맞는 공통 내비게이션을 확인하고 이용할 수 있게 한다.

## 타깃 (target)

- 디바이스: 모바일·데스크톱 모두
- 브라우저 하한: 저장소 루트 `browserslist`의 기존 정책 유지

## 디자인 (design_ref)

DESIGN.md 표준 따름. 벗어남: 없음.

## 범위

- 포함(scope_in): shadcn 계열 API를 따르는 공통 Navbar UI, 세 프로젝트별 콘텐츠·명시적 appearance props 설정, 데스크톱·모바일 반응형 배치, 키보드로 조작 가능한 모바일 메뉴와 언어 DropdownMenu, 접근 가능한 이름
- 제외(scope_out): 실제 라우팅과 링크 전환 로직, 언어 전환 로직, 인증 메뉴, API·전역 상태·분석 연동

## 수용 기준 (acceptance_criteria)

1. `k-drama`, `ai-communication`, `k-culture` 세 프로젝트에 Navbar가 표시되고 로고, How it works, Pricing, 언어 변경, Try의 문구·접근 가능한 이름·목적지 값이 프로젝트별 props로 설정된다.
2. 데스크톱에서 로고는 좌측, How it works·Pricing·언어 변경·Try는 우측에 이 순서로 표시된다.
3. 모바일에서 로고·언어 변경은 계속 노출되고 Try는 숨기며, How it works와 Pricing은 키보드로 열고 닫을 수 있는 햄버거 메뉴 안에 표시된다.
4. 로고, 메뉴 링크, 언어 변경, 데스크톱 Try, 햄버거 메뉴 트리거를 키보드로 탐색·조작할 수 있다.
5. 모든 상호작용 요소와 두 navigation 영역에 props에서 공급된 접근 가능한 이름이 제공된다.
6. 지원 viewport와 기존 브라우저 정책에서 콘텐츠 잘림이나 가로 overflow가 발생하지 않는다.
7. `k-drama`는 `warm-editorial`, `ai-communication`은 `violet-editorial`, `.pen`이 없는 `k-culture`는 `neutral` appearance를 사용하며 공통 구조와 접근성 계약은 동일하다.
8. 언어 트리거는 현재 경로·쿼리·해시를 보존하는 세 locale 옵션을 DropdownMenu로 제공하고 현재 locale에 `aria-current="page"`를 표시한다.

## 제약 (constraints)

shadcn 라이브러리의 API·접근성 관례와 기존 디자인 토큰을 따른다. 공통 Navbar는 UI 배치와 props 소비까지만 책임진다. Boolean 표시 플래그나 render prop 없이 명시적 데이터 계약과 합성을 사용한다.

## 시각 레퍼런스 (visual_reference)

아래 저해상도 반응형 와이어프레임을 구현 계약으로 사용한다.

## 우선순위 / 데이터 (선택)

프로젝트별 조합 가능한 props 계약과 접근 가능한 모바일 메뉴를 우선한다. 외부 데이터와 상태 연동은 없다.

## 비고

- [추론] 표시 항목: 없음

## 저해상도 와이어프레임

### 데스크톱

```text
┌────────────────────────────────────────────────────────────┐
│ Logo                  How it works   Pricing  Language Try │
└────────────────────────────────────────────────────────────┘
  좌측                                             우측
```

### 모바일

```text
┌──────────────────────────────────────────┐
│ Logo                  Language   [Menu] │
└──────────────────────────────────────────┘
                                 ┌────────┐
                                 │ How…   │
                                 │ Pricing│
                                 └────────┘
```

## 컴포넌트 트리와 책임

```text
Navbar
├── NavbarLogo
├── DesktopNavigation
│   ├── HowItWorksLink
│   └── PricingLink
├── NavbarActions
│   ├── LanguageLink
│   └── TryLink (desktop only)
└── MobileNavigation (shadcn Sheet 계열 합성)
    ├── MobileMenuTrigger
    └── MobileMenuContent
        ├── HowItWorksLink
        └── PricingLink
```

- `Navbar`: 고정된 콘텐츠 슬롯을 반응형 영역에 배치한다.
- `NavbarLogo`: `text | image` 판별 유니언에 따라 프로젝트별 로고를 표현한다.
- `DesktopNavigation`: 데스크톱의 중앙 링크 두 개만 표현한다.
- `NavbarActions`: 모든 viewport의 언어 변경과 데스크톱에서만 노출되는 Try 목적지를 표현한다.
- `MobileNavigation`: shadcn Sheet 계열 primitive의 포커스·Escape·열림/닫힘 동작을 사용해 모바일 링크를 제공한다.

선택 영역을 `showMenu`, `isMobile`, `imageLogo` 같은 Boolean prop으로 제어하지 않는다. 텍스트·이미지 로고는 `NavbarLogo` 판별 유니언으로 명시하며, 구조 확장이 필요하면 children 기반 compound component로 별도 계약을 추가한다.

## 고정 TypeScript 계약

단일 출처는 `packages/contracts/src/navbar.ts`이며 `@landing/contracts/navbar`에서 import한다.

- `NavbarDestination`: 앱이 제공하는 목적지 값. 라우팅 실행은 소유하지 않는다.
- `NavbarTextLogo`, `NavbarImageLogo`, `NavbarLogo`: 불가능한 로고 prop 조합을 막는 명시적 로고 variant.
- `NavbarLink`: 표시 문구, 선택적 명시 접근성 이름, 목적지를 가진 링크 데이터.
- `NavbarLanguageOption`, `NavbarLanguageMenu`: locale, 현재 상태, 보존된 목적지를 가진 언어 DropdownMenu 데이터.
- `NavbarContent`: 로고, How it works, Pricing, 언어 변경, Try의 고정 슬롯.
- `NavbarAccessibleLabels`: 주 navigation과 모바일 메뉴 열기·닫기·내용 영역 이름.
- `NavbarAppearance`: `warm-editorial | violet-editorial | neutral` 명시적 시각 variant.
- `NavbarProps`: 공통 Navbar가 소비하는 최상위 props. `appearance`와 콘텐츠·접근성 데이터를 받는다.

계약은 이벤트 콜백, 라우터 객체, locale runtime을 받지 않는다. `href`는 렌더링할 목적지 값일 뿐이며 실제 라우팅과 언어 변경 로직은 이번 범위 밖이다.

## test-id 계약

| 영역                | 고정 값                        |
| ------------------- | ------------------------------ |
| 루트                | `navbar`                       |
| 로고                | `navbar-logo`                  |
| 데스크톱 navigation | `navbar-desktop-navigation`    |
| How it works        | `navbar-how-it-works`          |
| Pricing             | `navbar-pricing`               |
| 언어 변경           | `navbar-language`              |
| 언어 변경 메뉴      | `navbar-language-menu-content` |
| Try                 | `navbar-try`                   |
| 모바일 메뉴 트리거  | `navbar-mobile-menu-trigger`   |
| 모바일 메뉴 내용    | `navbar-mobile-menu-content`   |

반응형으로 같은 링크가 두 영역에 렌더될 수 있으므로 테스트는 viewport별 가시성 범위 안에서 role/name을 우선 사용한다. test-id는 안정적인 영역 식별용이며 스타일 선택자로 사용하지 않는다.

## 데이터 흐름

```text
project content constants
  → NavbarProps (appearance + content + accessible labels)
    → shared Navbar presentation
      → native href destination
```

API, context, provider, 전역 상태는 없다. 모바일 메뉴의 일시적인 열림 상태는 shadcn primitive 내부 UI 상태이며 앱 데이터로 끌어올리지 않는다.

## 병렬 실행 단위

계약 고정 후 아래 작업은 독립 진행 가능하다.

1. 공통 Navbar JSX와 shadcn Sheet 계열 primitive 구현
2. DESIGN.md 토큰 기반 데스크톱·모바일 레이아웃 구현
3. 세 앱의 프로젝트별 `NavbarContent`와 접근성 문구 설정 및 기존 헤더 교체
4. 공통 단위 테스트, 앱 통합 테스트, 반응형·키보드·axe 검증

## 검증 계약

- TypeScript는 `NavbarProps`와 프로젝트별 콘텐츠 객체를 strict 모드로 검사한다.
- 단위 테스트는 데스크톱과 모바일에서 요구된 항목의 위치·가시성, 메뉴의 Enter/Space/Escape 조작, 포커스 복귀, 접근 가능한 이름을 검증한다.
- 통합 테스트는 세 앱 각각의 프로젝트별 문구와 목적지 값을 검증한다.
- Playwright는 기존 브라우저·viewport 정책에서 가로 overflow가 없음을 검증한다.
- axe 검증은 열린 메뉴와 닫힌 메뉴 상태 모두에서 심각한 위반이 없음을 확인한다.

## 계약 고정

이 문서와 `packages/contracts/src/navbar.ts`의 export 이름, 필드, 목적지 의미, test-id가 구현·디자인·테스트 레이어의 고정 계약이다. 변경이 필요하면 이 문서와 타입을 먼저 함께 갱신하고 모든 소비 레이어에 알린다.
