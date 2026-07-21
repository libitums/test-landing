# shadcn FAQ Footer 디자인 고정

## 범위와 근거

이 문서는 `k-drama`, `ai-communication`, `k-culture` 세 프로젝트가 로고,
FAQ 문답, 탐색 링크, 정책 링크, 저작권 문구와 목적지를 주입하는 공통 Footer의
시각 계약이다. `DESIGN.md`, `docs/design/landing-monorepo.md`,
`docs/design/localization-phase-2.md`를 확장하며 평행한 디자인 시스템을 만들지
않는다.

Footer의 FAQ는 shadcn `Accordion` 계열 primitive로 정보를 펼쳐 읽게 한다.
`.pen` 레퍼런스에서 확인한 `FAQ 목록 → 브랜드와 링크의 하단 행` 정보 구조만
참고하고, 모든 시각 값은 기존 공통 토큰으로 정규화한다. 프로젝트별 문구와
목적지는 앱 콘텐츠가 소유한다. 외부 API/CMS, 관리자 편집, 뉴스레터, 소셜 링크,
별도 CTA는 범위 밖이다.

`warm-editorial`은 `apps/k-drama/k-drama.pen`의 `Pricing Notices Footer`를
직접 참조한다. 공통 슬롯과 DOM 순서는 유지하되 `--color-surface` 표면, 더 조밀한
20px 제목·50px FAQ 행·12px 답변 위계, 첫 FAQ 기본 open, Footer 상단 경계와 하단 구분선 없는
로고/링크 행을 사용한다. `.pen`의 이미지 로고는 대응 저장소 자산이 제공될 때
기존 `FooterLogo` image variant로 교체한다.

기존 토큰만으로 배경, 경계, 타이포, 간격, 포커스와 모션을 모두 표현할 수 있어
`packages/design-tokens/src/tokens.css`에는 Footer 전용 토큰을 추가하지 않는다.

## 컴포넌트와 시맨틱 구조

```text
Footer (contentinfo)
├── FooterFaq (labelled section)
│   ├── FooterHeading
│   └── Accordion
│       └── AccordionItem × N
│           ├── AccordionTrigger (question + chevron)
│           └── AccordionContent (answer)
└── FooterBottom
    ├── FooterLogoLink
    ├── FooterNavigation
    ├── FooterPolicyNavigation
    └── FooterCopyright
```

- 페이지에는 공통 Footer가 하나의 `footer`/`contentinfo` landmark로 존재한다.
- FAQ 제목은 문서 제목 위계를 건너뛰지 않는 heading이며 FAQ 영역의 접근 가능한
  이름을 제공한다.
- FAQ는 shadcn/Radix Accordion의 trigger-content 연결, `aria-expanded`,
  `aria-controls`와 키보드 관례를 그대로 사용한다. 질문은 버튼인
  `AccordionTrigger`, 답변은 연결된 `AccordionContent`다.
- Accordion은 여러 답을 동시에 비교할 수 있는 `multiple` 동작을 기본 계약으로
  삼는다. `warm-editorial`은 `.pen` 상태와 같이 첫 항목을 기본 open으로 표시하고,
  나머지 appearance는 모두 닫힘으로 시작한다.
- 로고는 홈 목적지를 가진 링크다. 이미지 로고에는 앱이 제공한 대체 이름을 쓰고,
  텍스트 로고는 표시 문자열 자체로 이름을 갖는다.
- 일반 링크와 정책 링크는 의미가 드러나는 별도 `nav` 영역으로 묶고 각각
  locale-aware 접근 가능한 이름을 제공한다. 링크의 문구와 목적지는 앱이
  주입하며 Footer가 경로나 영어 기본값을 추정하지 않는다.
- 저작권은 링크가 아닌 텍스트이며 앱이 완성된 locale-aware 문구를 제공한다.
  시각적 위치가 낭독 순서를 바꾸지 않는다.
- chevron은 `lucide-react` named ESM import를 사용하는 장식 아이콘이며 접근성
  트리에서 제외한다. 아이콘이 열린 상태의 유일한 표현이 되지 않는다.

## 레이아웃

### 데스크톱

```text
┌──────────────────────────────────────────────────────────────┐
│ FAQ heading                                                  │
│ Question 1                                               ∨   │
│ Question 2                                               ∧   │
│   Answer wraps across available reading width                │
│ Question 3                                               ∨   │
├──────────────────────────────────────────────────────────────┤
│ Logo   Navigation links   Policy links   Copyright            │
└──────────────────────────────────────────────────────────────┘
```

- Footer 표면은 `--color-bg`, 글자는 `--color-fg`, 최상단 경계는
  `--color-border`를 쓴다. 표면 위계를 위해 별도 그림자나 component-specific
  색을 만들지 않는다.
- 내부 컨테이너는 `--content-max` 안에서 가운데 정렬하고 인라인 패딩은
  `--space-8`, 전체 블록 패딩은 `--space-16`을 쓴다.
- FAQ 제목은 `--text-2xl`/`--leading-heading`/`--font-bold`이며 목록과의
  간격은 `--space-8`이다. FAQ 목록은 컨테이너의 가용 폭을 사용하되 답변 본문은
  `--content-reading`을 최대 읽기 폭으로 삼고 inline-start에 정렬한다.
- Accordion item은 `--color-border`의 1px block-end 경계로 구분한다. Trigger는
  `--control-height`를 최소 블록 크기로 하고 `--space-4`의 블록 패딩과
  `--space-2`의 질문-아이콘 간격을 쓴다. 고정 높이는 사용하지 않는다.
- 열린 Content는 질문 아래에 배치하고 block-end `--space-6`,
  inline-end `--space-10`의 여유를 둔다. 답변은
  `--text-sm`/`--leading-body`/`--color-muted-fg`를 쓴다.
- FAQ와 하단 행 사이에는 `--space-12` 간격과 `--color-border` 구분선을 둔다.
  하단 행의 내부 block-start 여백은 `--space-8`이다.
- 하단 행은 하나의 wrapping flex 행이다. DOM 순서는
  `Logo → Navigation → Policy → Copyright`이고 로고는 inline-start, 나머지는
  inline-end 쪽에 배치한다. 그룹 사이는 `--space-8`, 그룹 안 링크 사이는
  `--space-6`을 사용한다. 공간 부족 시 행 전체가 자연스럽게 wrap한다.

### 모바일 (`--breakpoint-mobile` 이하)

```text
FAQ heading
[Question 1                                      ∨]
[Question 2                                      ∧]
[Answer wraps to its intrinsic block size          ]
[Question 3                                      ∨]
───────────────────────────────────────────────────
[Logo]
[Navigation links, wrapping]
[Policy links, wrapping]
[Copyright]
```

- 컨테이너 인라인 패딩은 `--space-4`, 전체 블록 패딩은 `--space-12`다.
- FAQ와 하단 영역은 문서 순서를 유지한 한 열이다. 답변의 inline-end 여백은
  `--space-6`으로 줄이고 나머지 크기·색·타입 위계는 데스크톱과 동일하다.
- 하단 행은 한 열로 전환하고 `align-items: flex-start`, 그룹 간
  `--space-6`을 사용한다. 각 navigation 내부 링크는 `--space-4` 간격으로
  wrap하며 좁은 화면에서 가로 overflow를 만들지 않는다.
- 로고, 링크, Trigger에는 고정 인라인 크기, 말줄임, 잘림, 숨김 overflow를
  사용하지 않는다. `--control-height`는 Trigger의 최소값일 뿐 고정 높이가 아니다.
- 미디어 쿼리 선언 값은 `--breakpoint-mobile`의 단일 출처 값과 동기화한다.
  CSS custom property를 미디어 조건에 직접 사용할 수 있다고 가정하지 않는다.

## Accordion 및 링크 시각 상태

| 요소                | 상태           | 토큰 계약                                                              |
| ------------------- | -------------- | ---------------------------------------------------------------------- |
| Accordion Trigger   | closed/default | 투명 배경, `--color-fg`, `--font-semibold`; chevron은 닫힘 방향        |
| Accordion Trigger   | hover          | `--color-surface`; 질문은 밑줄 또는 동일한 비색상 강조를 함께 사용     |
| Accordion Trigger   | active         | `--color-surface-strong`                                               |
| Accordion Trigger   | focus-visible  | `--color-focus` outline과 `--focus-ring`; 링은 item 경계에 잘리지 않음 |
| Accordion Trigger   | open           | `--color-fg`, `--font-semibold`, `aria-expanded=true`; chevron 회전    |
| Accordion Content   | open           | `--color-muted-fg`; 질문과 연결된 답변이 intrinsic block size로 표시   |
| Accordion Content   | closed         | 시각 및 접근성 트리에서 닫힘 primitive 계약을 따름; 빈 자리 없음       |
| 로고·일반·정책 링크 | default        | 로고 `--color-fg`; 링크 `--color-muted-fg`                             |
| 로고·일반·정책 링크 | hover          | `--color-fg`와 밑줄을 함께 사용                                        |
| 로고·일반·정책 링크 | focus-visible  | `--color-focus` outline과 `--focus-ring`; 인접 요소에 가려지지 않음    |
| 현재 링크           | current        | `--color-fg`, `--font-semibold`와 네이티브 current 의미를 함께 제공    |
| 저작권              | default        | `--text-sm`, `--color-muted-fg`                                        |

Footer에는 loading, error, disabled 상태가 없다. FAQ 배열이 비어 있으면 FAQ 제목과
Accordion 영역을 함께 렌더하지 않고 하단 Footer 정보는 유지한다. 질문은 있으나
답변이 없는 불완전 데이터는 렌더링 단계까지 넘기지 않는다.

## 상호작용, 키보드와 포커스

- Tab 순서는 DOM 순서를 따른다: FAQ Trigger들, 로고, 일반 링크, 정책 링크 순서다.
  닫힌 답변 안의 링크는 Tab 순서와 접근성 트리에 나타나지 않는다.
- Enter와 Space는 포커스된 Trigger를 열고 닫는다. 열린 뒤 포커스는 Trigger에
  남으며 포커스를 Content로 강제 이동하지 않는다.
- shadcn Accordion 관례에 따라 Trigger 간 arrow-key 이동을 지원한다면 방향은
  문서의 실제 orientation과 `dir`을 따른다. Tab 탐색을 대체하지 않는다.
- 답변에 링크가 포함되면 DOM에서 답변 문장 뒤의 자연스러운 위치에 두고,
  Content가 열린 경우에만 키보드로 접근 가능하다.
- Footer가 viewport 아래에 있다는 이유로 포커스를 자동 이동하거나 자동으로
  Accordion을 열지 않는다.

## 국제화, 긴 번역과 RTL

- 모든 표시 문자열, navigation 이름, 로고 이름과 목적지는 프로젝트별 props다.
  Footer는 영어 문구, 현재 연도, 정책 경로를 내부 기본값으로 소유하지 않는다.
- pseudo-locale의 30–40% 확장, CJK, Arabic을 포함해 질문·답변·링크·저작권은
  자연스럽게 줄바꿈한다. 고정 높이, line clamp, ellipsis를 사용하지 않는다.
- 일반 문장은 `overflow-wrap: break-word`, URL처럼 끊김 없는 토큰을 표시하는
  콘텐츠에만 `overflow-wrap: anywhere`를 적용한다.
- 루트의 `lang`과 `dir`을 상속한다. `margin-inline`, `padding-inline`,
  `border-block`, `text-align: start`와 flex/grid의 start/end 정렬을 사용한다.
- RTL에서는 하단 행의 inline-start/end 배치와 chevron의 방향 표현이 시각적으로
  맞게 미러링되지만 DOM·낭독·Tab 순서는 바꾸지 않는다. Accordion의 위/아래
  의미는 방향에 따라 뒤집지 않는다.
- 브랜드 이미지 자체에 읽어야 할 문자열이 포함된 경우 앱은 locale에 맞는 자산
  또는 동등한 접근 가능한 이름을 제공한다. CSS로 이미지를 강제 미러링하지 않는다.

## 모션과 reduced motion

- Content의 open/close와 chevron 전환은 `--duration-normal`과
  `--ease-standard`를 사용한다. 색상/표면 상태 전환은 `--duration-fast`와
  `--ease-standard`를 사용한다.
- 모션은 열린 상태를 보조할 뿐이다. `aria-expanded`, Content 노출, chevron 방향이
  전환 완료를 기다리지 않고 상태와 동기화되어야 한다.
- `prefers-reduced-motion: reduce`에서는 Content와 chevron 애니메이션 및 비필수
  전환을 제거하고 최종 상태를 즉시 표시한다. 닫힘 Content가 전환 중 포커스 가능한
  상태로 남아서는 안 된다.

## 대비와 검증 계약

- `--color-fg` 및 `--color-muted-fg`는 `--color-bg`와
  `--color-surface` 위 일반 텍스트에서 기존 WCAG AA 보장을 그대로 사용한다.
  포커스와 hover는 색상 하나에만 의존하지 않는다.
- 세 프로젝트의 서로 다른 로고, FAQ, 탐색·정책 링크, 저작권 문구와 목적지가
  동일한 구조에 반영되어야 한다.
- 데스크톱에서는 FAQ 위와 wrapping 하단 행, 모바일에서는 FAQ 위와 한 열 하단
  영역이 DOM 순서를 유지해야 한다.
- 모든 Accordion item은 closed/open 양쪽에서 질문-답변 연결과 접근 가능한 이름을
  유지하고 Enter/Space 및 키보드 탐색으로 조작 가능해야 한다.
- supported desktop/mobile viewport, pseudo-locale과 긴 URL에서 가로 overflow,
  잘린 문구, 겹친 chevron, 가려진 포커스 링이 없어야 한다.
- LTR과 RTL에서 논리적 배치가 올바르게 미러링되고 DOM·낭독·Tab 순서는 동일해야
  한다.
- `prefers-reduced-motion`에서 open/close가 즉시 완료되고 기능·상태 정보가
  손실되지 않아야 한다.
- axe 검증은 FAQ 전체 closed, 단일 open, 복수 open 상태 모두에서 serious 이상
  위반이 없어야 한다.

## 디자인 고정

이 계약은 Footer의 시각 구조, 토큰 매핑, desktop/mobile 레이아웃,
Accordion open/closed 및 focus/hover 상태, 긴 번역·RTL·reduced-motion 동작을
고정한다. 구현은 기존 공통 토큰만 소비하며 Footer 전용 생값이나 앱별 CSS variant를
추가하지 않는다. 프로젝트별 콘텐츠 차이는 구조나 시각 variant가 아니라 주입되는
데이터로 표현한다.
