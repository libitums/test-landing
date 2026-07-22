# 작업 스펙: 세 앱 공통 Shared Feature UI 템플릿

## 목적 (goal)

세 앱의 사용자가 일관된 기능 소개 UX를 경험하면서 각 앱에 맞는 콘텐츠와 동작을 이용할 수 있도록 공통 기능 화면 템플릿을 제공한다.

## 타깃 (target)

- 디바이스: 모바일·데스크톱 모두
- 브라우저 하한: 최신 Chrome·Safari·Firefox·Edge를 정식 지원한다. 그보다 오래된 브라우저에는 번호 라벨, 헤더, 서브헤더와 `children`의 의미 있는 문서 순서가 숨겨지지 않도록 점진적 향상을 적용한다.

## 디자인 (design_ref)

DESIGN.md 표준 따름. 벗어남: 없음.

## 범위

- 포함(scope_in): 세 앱이 공유하는 기능 화면 템플릿, 넘버 라벨, 헤더 텍스트, 서브헤더 텍스트, 앱별 콘텐츠·동작을 합성하는 필수 `children` 확장 영역, 모바일·데스크톱 반응형 배치
- 제외(scope_out): 실제 API 연결과 앱별 비즈니스 로직

## 수용 기준 (acceptance_criteria) ← 피드백 레이어 검증 타깃

1. `k-drama`, `ai-communication`, `k-culture` 세 앱이 `SharedFeatureTemplateProps` 계약의 같은 공통 템플릿을 사용하고, 각각 넘버 라벨·헤더·서브헤더·앱별 `children`을 전달할 수 있다.
2. 모바일과 데스크톱에서 넘버 라벨, 헤더, 서브헤더, `children`이 동일한 의미 순서로 모두 표시되고, DESIGN.md의 반응형·국제화 텍스트 원칙을 지킨다.
3. 현재 Chrome·Safari·Firefox·Edge에서 전체 레이아웃과 앱별 `children` 동작이 작동한다.
4. 이전 브라우저에서 고급 레이아웃 CSS가 적용되지 않더라도 넘버 라벨, 헤더, 서브헤더, `children`이 기본 문서 흐름에서 표시되며 읽기와 기본 조작이 가능하다.
5. 공통 템플릿은 API, 앱 비즈니스 로직, 앱별 action callback을 소유하지 않으며 앱별 콘텐츠와 동작은 `children` 내부에 유지된다.

## 제약 (constraints)

React 19 + TypeScript의 기존 모노레포와 DESIGN.md를 따른다. Boolean 표시 플래그와 render prop 없이 `children` 합성을 사용한다. 핵심 콘텐츠는 의미 있는 HTML 문서 순서로 먼저 렌더링하며 CSS 지원 여부에 의존해 숨기지 않는다.

## 시각 레퍼런스 (visual_reference)

`apps/k-drama/k-drama.pen`의 기능 화면 프레임을 참고한다. 공통으로 반복되는 번호 배지 → 기능 헤더 → 기능 설명 → 기능별 시각물/동작 영역의 정보 위계만 계약으로 취하고, 픽셀 값과 앱별 목업은 고정 계약에 포함하지 않는다.

## 우선순위 / 데이터 (선택)

공통 UX와 앱별 확장 가능성을 우선한다. 실제 API 및 앱별 비즈니스 데이터 연동은 수행하지 않는다.

## 비고

- [추론] 표시 항목: 없음

## 컴포넌트 트리와 책임

```text
AppFeatureSection (앱별 명시적 조합)
└── SharedFeatureTemplate
    ├── NumberLabel
    ├── FeatureHeader
    │   ├── HeaderText
    │   └── SubheaderText
    └── FeatureContent
        └── children (앱별 콘텐츠와 동작)
```

- `SharedFeatureTemplate`: 네 개의 공통 입력을 접근 가능한 문서 순서로 배치하는 표현 전용 공통 섹션이다.
- `NumberLabel`: 단계 또는 순서를 나타내는 앱 제공 텍스트를 표시한다.
- `FeatureHeader`: 헤더와 서브헤더의 의미 관계를 유지한다.
- `FeatureContent`: 앱이 소유한 정적·상호작용 콘텐츠를 변경 없이 합성한다.
- `AppFeatureSection`: 각 앱이 명시적으로 정의하는 조합 경계이며 앱 데이터, 이벤트, 동작을 소유한다.

단일 확장 지점이고 공유 상태나 prop drilling이 없으므로 compound context는 도입하지 않는다. `children`이 부모에게 데이터를 돌려줄 필요가 없으므로 render prop도 사용하지 않는다. 앱별 화면은 `isKDrama`, `hasActions` 같은 Boolean variant 대신 각 앱의 명시적 조합 컴포넌트로 만든다.

## 고정 TypeScript 계약

단일 출처는 `packages/contracts/src/shared-feature.ts`이며 `@landing/contracts/shared-feature`에서 import한다.

- `SharedFeatureTemplateProps`: `numberLabel`, `headerText`, `subheaderText`, 필수 `children`, 선택적 안정 test-id로 구성한다.
- `numberLabel`은 `string`이다. `01` 같은 형식과 현지화 문자열을 숫자로 강제 변환하지 않는다.
- `children`은 저장소의 기존 `ContentSlot`을 재사용한다. 앱별 버튼, 링크, 목업과 그 동작은 이 슬롯 안에서 앱이 소유한다.
- `sharedFeatureTestIds`: 반복 가능한 섹션 인스턴스를 앱 제공 식별자로 구분하는 test-id 생성기다.

계약에는 레이아웃 방향, 색, 간격, 이미지, action callback, API 타입을 넣지 않는다. 이 값들은 각각 디자인·구현 또는 앱 소유 영역이다.

## test-id 계약

아래 `{id}`는 각 앱이 같은 페이지 안에서 안정적으로 부여하는 기능 식별자다.

| 영역             | 고정 값                            |
| ---------------- | ---------------------------------- |
| 공통 템플릿 루트 | `shared-feature:{id}`              |
| 넘버 라벨        | `shared-feature:{id}:number-label` |
| 헤더             | `shared-feature:{id}:header`       |
| 서브헤더         | `shared-feature:{id}:subheader`    |
| children 영역    | `shared-feature:{id}:content`      |

테스트는 사용자에게 노출되는 role/name과 문서 순서를 우선하고 test-id는 반복 섹션 영역을 안정적으로 한정할 때만 사용한다. test-id는 스타일 선택자로 사용하지 않는다.

## 데이터 흐름

```text
app content constants ───────────────┐
app event handlers / local behavior ─┴→ AppFeatureSection
                                        → SharedFeatureTemplate copy props
                                        → children (app-owned UI and actions)
```

공통 템플릿은 fetch, context, 전역 상태, 이벤트 해석을 하지 않는다. 앱이 텍스트와 `children`을 아래 방향으로 전달하며, 상호작용은 `children` 내부에서 앱 경계로 돌아간다.

## 반응형·점진적 향상 계약

- DOM 순서는 넘버 라벨 → 헤더 → 서브헤더 → `children`으로 고정하며 viewport에 따라 재배열하거나 제거하지 않는다.
- 데스크톱 레이아웃을 기본으로 정의하고 `--breakpoint-mobile` 이하에서 한 열로 축소한다.
- 헤더와 서브헤더는 고정 높이를 사용하지 않고 긴 번역 문구의 줄바꿈을 허용한다.
- 기본 block flow만으로 모든 콘텐츠가 보이도록 구현하고, grid/flex·시각 효과는 향상 레이어로 취급한다.
- 지원 브라우저에서는 앱별 `children`의 전체 동작을 보장한다. 이전 브라우저 보장은 의미 콘텐츠의 표시와 native HTML 기반 기본 조작까지이며 앱별 최신 기능의 완전한 동작 보장은 아니다.

## 검증 계약

- `pnpm --filter @landing/contracts typecheck`로 고정 계약을 strict TypeScript 검사한다.
- 공통 UI 단위 테스트는 네 props의 렌더링, 의미 순서, 여러 인스턴스 test-id, 임의의 정적·상호작용 `children` 합성을 검증한다.
- 세 앱 통합 테스트는 같은 템플릿을 import하면서 서로 다른 copy와 `children`을 제공하는지 검증한다.
- 모바일·데스크톱 Playwright 검증은 정보 제거, 가로 overflow, 텍스트 잘림이 없고 `children` 기본 조작이 가능한지 확인한다.
- CSS 비활성화 또는 핵심 layout declaration 제거 테스트로 콘텐츠가 DOM 문서 흐름에 남고 숨겨지지 않는지 확인한다.
- 접근성 검증은 섹션 제목의 접근 가능한 이름, 논리적 heading 순서, 키보드 조작 가능한 앱별 `children`, axe serious/critical 위반 0건을 확인한다.

## 병렬 실행 단위

계약 고정 후 아래 작업은 독립 진행 가능하다.

1. 공통 `SharedFeatureTemplate` JSX와 package export 구현
2. DESIGN.md와 `k-drama.pen` 정보 위계에 맞춘 토큰 기반 반응형·점진적 향상 CSS
3. `k-drama`의 명시적 copy와 `children` 조합
4. `ai-communication`의 명시적 copy와 `children` 조합
5. `k-culture`의 명시적 copy와 `children` 조합
6. 공통 단위 테스트와 세 앱 통합·반응형·접근성 테스트

상태·데이터 작업은 없다. 앱별 이벤트와 비즈니스 동작은 이번 공통 템플릿 작업의 제외 범위다.

## 계약 고정

이 문서와 `packages/contracts/src/shared-feature.ts`의 export 이름, prop 필드, `children` 소유권, test-id가 구현·디자인·테스트 레이어의 고정 계약이다. 변경이 필요하면 이 문서와 타입을 먼저 함께 갱신하고 세 앱 소비 레이어에 알린다.
