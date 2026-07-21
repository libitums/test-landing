# 작업 스펙: 세 프로젝트 공통 FAQ Footer UI

## 목적 (goal)

사용자가 어느 프로젝트와 지원 viewport에서도 자주 묻는 질문의 답을 확인하고 로고, 일반 링크, 정책 링크와 저작권 정보를 이용할 수 있게 한다.

## 타깃 (target)

- 디바이스: 모바일·데스크톱 모두
- 브라우저 하한: 저장소 루트 `browserslist`의 기존 정책 유지

## 디자인 (design_ref)

DESIGN.md 표준 따름. 벗어남: 없음.

## 범위

- 포함(scope_in): shadcn Accordion 기반 공통 FAQ Footer, 로고 링크, 일반 링크, 정책 링크, 저작권, 세 프로젝트의 정적·지역화 FAQ 데이터, 모바일·데스크톱 반응형 배치, 접근 가능한 이름, 단위·통합·브라우저·접근성 전체 테스트
- 제외(scope_out): 외부 API·CMS 연동, 관리자 편집 기능, 뉴스레터, 소셜 링크, 별도 CTA

## 수용 기준 (acceptance_criteria)

1. `k-drama`, `ai-communication`, `k-culture` 세 프로젝트에 동일한 공통 Footer 구조가 표시되고 로고, 일반 링크, 정책 링크, 저작권과 현재 locale의 FAQ 문구가 각 앱의 정적 `FooterProps` 데이터로 설정된다.
2. FAQ의 각 질문은 shadcn Accordion으로 키보드에서 열고 닫을 수 있고, 트리거의 이름·확장 상태·콘텐츠 연결 관계가 보조 기술에 노출된다.
3. 로고와 모든 링크를 키보드로 탐색할 수 있으며 Footer, 일반 링크 navigation, 정책 navigation, FAQ 영역에 props에서 공급된 접근 가능한 이름이 제공된다.
4. 모바일과 데스크톱 및 루트 `browserslist` 범위에서 콘텐츠 순서가 유지되고, 지역화된 긴 질문·답변·링크가 잘리지 않으며 가로 overflow가 없다.
5. 단위 테스트, 세 앱 통합 테스트, TypeScript, lint, Playwright 반응형 검사와 axe 접근성 검사가 모두 통과한다.

## 제약 (constraints)

shadcn Accordion API와 접근성 관례, DESIGN.md 토큰을 사용한다. 공통 Footer는 표현과 Accordion의 일시적 열림 상태만 소유한다. Boolean 표시 props와 render prop을 추가하지 않으며 API·CMS·관리자·뉴스레터·소셜·별도 CTA를 포함하지 않는다.

## 시각 레퍼런스 (visual_reference)

아래 저해상도 와이어프레임을 구현 계약으로 사용한다.

## 우선순위 / 데이터 (선택)

공통 UI 재사용, FAQ 접근성, 전체 테스트 완성도를 우선한다. 데이터는 앱이 현재 locale에 맞춰 선택한 정적 `LocalizedFooterFaq`와 링크·저작권 문자열이며 fetch는 없다.

## 비고

- [추론] 표시 항목: 없음

## 저해상도 와이어프레임

### 데스크톱

```text
┌──────────────────────────────────────────────────────────────┐
│ FAQ                                      Logo                │
│ [ Question 1                                      v ]        │
│ [ Question 2                                      v ]        │
│                                                              │
│ General links                 Policy links       Copyright   │
└──────────────────────────────────────────────────────────────┘
```

### 모바일

```text
┌──────────────────────────────┐
│ FAQ                          │
│ [ Question 1             v ] │
│ [ Question 2             v ] │
│ Logo                         │
│ General links                │
│ Policy links                 │
│ Copyright                    │
└──────────────────────────────┘
```

세부 열 수와 정렬은 디자인 레이어가 토큰으로 확정하되, viewport가 바뀌어도 FAQ → 로고 → 일반 링크 → 정책 링크 → 저작권의 문서 순서와 정보는 바꾸지 않는다.

## 컴포넌트 트리와 책임

```text
Footer
├── FooterFaq
│   └── FooterFaqItem[] (shadcn Accordion Item/Trigger/Content 합성)
├── FooterLogo
├── FooterLinksNavigation
├── FooterPolicyNavigation
└── FooterCopyright
```

- `Footer`: 공통 contentinfo landmark 안에 고정 슬롯을 반응형으로 배치한다.
- `FooterFaq`: 현재 locale의 제목과 항목을 shadcn Accordion에 전달하고 일시적 열림 상태만 관리한다. `items`가 빈 배열이면 제목을 포함한 FAQ 영역 전체를 렌더하지 않는다.
- `FooterFaqItem`: 안정적 ID로 질문 트리거와 답변 콘텐츠를 연결한다.
- `FooterLogo`: `text | image` 판별 유니언에 맞는 홈 링크를 표현한다.
- `FooterLinksNavigation`: 앱이 제공한 일반 링크 목록을 순서대로 표현한다.
- `FooterPolicyNavigation`: 앱이 제공한 정책 링크 목록을 별도 navigation으로 표현한다.
- `FooterCopyright`: 앱이 제공한 지역화 가능 문자열을 그대로 표현한다.

표시 여부 Boolean이나 `renderFaq` 같은 render prop은 두지 않는다. 요구된 슬롯은 `FooterContent`에 필수이며 텍스트·이미지 로고만 판별 유니언으로 분리한다. FAQ 항목의 질문·답변은 데이터이므로 children API로 앱에 마크업 책임을 넘기지 않는다.

## 고정 TypeScript 계약

단일 출처는 `packages/contracts/src/footer.ts`이며 `@landing/contracts/footer`에서 import한다.

- `FooterDestination`: 앱이 제공하고 UI가 `href`로 렌더하는 목적지 값이다. 실제 라우팅·내비게이션 부수 효과와 일반·정책 목적지 페이지 구현은 앱 소유이며 이번 범위 밖이다.
- `FooterTextLogo`, `FooterImageLogo`, `FooterLogo`: 불가능한 로고 조합을 막는 명시적 variant.
- `FooterLink`: 일반·정책 링크가 공유하는 안정적 ID, 표시 문구, 접근 가능한 이름, 목적지와 선택적 `current` 상태. 정책 링크도 제공된 `href`를 렌더할 뿐 정책 페이지나 라우트를 만들지 않는다. `current === true`인 링크에는 `aria-current="page"`를 적용하고, 생략 또는 `false`이면 적용하지 않는다. Footer는 URL이나 locale에서 현재 상태를 추론하지 않는다.
- `FooterFaqItem`: 안정적 ID, 지역화된 질문과 답변.
- `LocalizedFooterFaq`: 현재 locale과 그 locale의 완전한 FAQ 제목·항목 집합. `items` 빈 배열은 FAQ 제목과 영역 전체를 미렌더한다는 명시적 empty-state 계약이다.
- `FooterContent`: 로고, 일반 links, policy links, copyright, localized FAQ의 고정 슬롯.
- `FooterAccessibleLabels`: Footer, 두 navigation과 FAQ 영역의 지역화된 접근 가능한 이름.
- `FooterAppearance`: `warm-editorial | violet-editorial | neutral` 명시적 시각 variant.
- `FooterProps`: 공통 Footer가 소비하는 appearance, content, 접근성 문구와 루트 test ID.

`FooterLink.id`와 `FooterFaqItem.id`는 locale이 달라도 같은 의미의 항목에 동일해야 하며 한 Footer 안에서 각각 중복되지 않는다. 일반·정책 링크 모두 현재 페이지라면 앱이 `current: true`를 명시한다. 계약은 콜백, 라우터, locale runtime 또는 원격 데이터 상태를 받지 않는다.

## test-id 계약

| 영역                 | 고정 값                    |
| -------------------- | -------------------------- |
| Footer 루트          | `footer`                   |
| 로고                 | `footer-logo`              |
| FAQ 영역             | `footer-faq`               |
| FAQ 항목             | `footer-faq-item:<id>`     |
| 일반 링크 navigation | `footer-links-navigation`  |
| 정책 navigation      | `footer-policy-navigation` |
| 저작권               | `footer-copyright`         |

FAQ 질문과 답변은 동일한 항목 test-id 범위 안에서 role/name과 확장 상태로 검증한다. 동적 suffix는 앱이 공급한 안정적 `FooterFaqItem.id`만 사용한다. 링크는 navigation 범위 내 role/name/href를 우선 검증하며 test-id는 스타일 선택자로 사용하지 않는다.

## 데이터 흐름

```text
app static localized constants
  → FooterProps (appearance + content + accessible labels)
    → shared Footer presentation
      → shadcn Accordion transient UI state + native href destinations
```

fetch, API, CMS, provider, 전역 상태는 없다. 앱의 기존 locale 선택 레이어가 현재 locale의 완전한 FAQ 객체와 링크의 `current` 값을 고르고 Footer는 locale·route 상태를 추정하거나 fallback하지 않는다. 모든 링크는 앱 소유 `href`를 그대로 렌더하며 목적지 라우트나 정책 페이지의 구현은 이 기능에 포함하지 않는다. FAQ `items`가 비어 있으면 Footer의 나머지 슬롯은 유지하고 FAQ 영역만 전체 미렌더한다.

## 병렬 실행 단위

계약 고정 후 아래 작업은 독립 진행 가능하다.

1. 공통 Footer JSX와 shadcn Accordion primitive 구현
2. DESIGN.md 토큰 기반 데스크톱·모바일 Footer 레이아웃 구현
3. 세 앱의 정적·지역화 `FooterContent`와 접근성 문구 구성 및 공통 Footer 연결
4. 공통 단위 테스트와 세 앱 통합 테스트
5. Playwright 반응형·키보드 검사와 axe 접근성 검증

## 검증 계약

- TypeScript는 `FooterProps`와 세 앱의 locale별 정적 객체를 strict 모드로 검사한다.
- 단위 테스트는 필수 슬롯, FAQ 항목 순서, 빈 `items`에서 FAQ 영역 전체 미렌더, 클릭·Enter·Space 조작, 확장 상태, 질문·답변 연결, 접근 가능한 이름과 명시적 `current`의 `aria-current="page"` 반영을 검증한다.
- 통합 테스트는 세 앱에서 프로젝트별 로고·링크·정책·저작권과 현재 locale FAQ를 검증한다.
- Playwright는 모바일·데스크톱에서 키보드 탐색, FAQ 조작, 문서 순서와 가로 overflow 부재를 검증한다.
- axe는 FAQ 닫힘·열림 상태 모두에서 serious 또는 critical 위반이 없음을 확인한다.
- 전체 저장소 typecheck, lint, test와 build가 통과해야 한다.

## 계약 고정

이 문서와 `packages/contracts/src/footer.ts`의 export 이름, 필드, ID 의미, 정적 데이터 경계와 test-id가 구현·디자인·상태·테스트 레이어의 고정 계약이다. 변경이 필요하면 문서와 타입을 먼저 함께 갱신하고 모든 소비 레이어에 알린다.
