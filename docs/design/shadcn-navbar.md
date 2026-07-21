# shadcn Navbar 디자인 고정

## 범위와 근거

이 문서는 `k-drama`, `ai-communication`, `k-culture` 세 프로젝트가 각자 다른
콘텐츠와 목적지 props를 주입하는 공통 Navbar의 시각 계약이다. `DESIGN.md`,
`docs/design/landing-monorepo.md`, `docs/design/localization-phase-2.md`를 확장하며
평행한 디자인 시스템을 만들지 않는다.

`apps/k-drama/k-drama.pen`과 `apps/ai-communication/ai-community.pen`에서 확인한
공통 정보 구조는 로고, `How it works`, `Pricing`, 언어 변경, `Try` 순서다.
레퍼런스에서 확인한 색과 치수는 디자인 토큰으로 승격한 뒤 사용한다. 인증 메뉴, 실제
라우팅, 언어 전환 로직, API·상태 연동은 이 계약의 범위 밖이다.

`NavbarAppearance`는 구조를 바꾸지 않는 명시적 시각 확장점이다.

| 앱                 | appearance         | 근거                                                 |
| ------------------ | ------------------ | ---------------------------------------------------- |
| `k-drama`          | `warm-editorial`   | `k-drama.pen`의 editorial navigation과 violet 컨트롤 |
| `ai-communication` | `violet-editorial` | `ai-community.pen`의 violet 언어 컨트롤과 검정 CTA   |
| `k-culture`        | `neutral`          | 앱 전용 `.pen`이 없으므로 기존 공통 토큰 유지        |

## 컴포넌트와 shadcn 관례

- 루트는 시맨틱 `header`이며 내부 `Container`는 기존 `.container` 계약을
  따른다. 배경은 투명하며 전경은 `--color-fg`, 구분선은
  `--color-border`, 표면 위계는 `--layer-header`를 사용한다.
- 로고는 홈 목적지를 표현하는 링크 슬롯이다. 이미지 로고에는 전달받은 대체
  이름을 쓰고, 텍스트 로고에는 그 텍스트 자체를 접근 가능한 이름으로 쓴다.
  프로젝트별 로고 자산·레이블·목적지는 props로 주입하며 Navbar가 추정하지
  않는다.
- 데스크톱 메뉴는 시맨틱 `nav`와 일반 링크로 구성한다. 하위 메뉴가 없으므로
  shadcn `NavigationMenu`의 팝업 패턴을 추가하지 않는다.
- 언어 변경은 shadcn `Button`의 `ghost` 시각 variant를 따른다. editorial
  appearance에서는 `.pen`에 맞춰 원형 언어 glyph를 표시하고, `neutral`에서는
  locale 레이블을 표시한다. 트리거는 shadcn `DropdownMenu` 계열 primitive를
  열며 현재 locale에는 check glyph와 `aria-current`를 함께 제공한다. 아이콘만
  보이더라도 현재 언어 또는 동작을 설명하는 접근 가능한 이름을 props로
  받는다. 실제 locale 변경은 소비자가 소유한다.
- `Try`는 shadcn `Button`의 primary 시각 variant를 따르는 링크 또는 버튼
  슬롯이다. 목적지와 레이블은 프로젝트별 props다.
- 모바일 메뉴는 shadcn `Sheet`의 controlled/uncontrolled API와 Radix 접근성
  관례를 따른다. 트리거는 햄버거 아이콘 `Button`의 `ghost` variant이며,
  접근 가능한 이름은 닫힘/열림 상태를 구분한다. `SheetContent`에는 시각적 또는
  `VisuallyHidden` 제목을 반드시 제공한다.
- 아이콘은 `lucide-react`의 named ESM import로 언어·메뉴·닫기 glyph만
  tree-shaking되게 사용하며 장식용 아이콘은 접근성 트리에서 제외한다. 아이콘
  자체가 이름을 대신하지 않는다.

## 레이아웃

### 데스크톱

```text
[Logo]  flexible space  [How it works] [Pricing] [Language] [Try]
 start                                                   end
```

- 내부 컨테이너는 `--content-max` 안에서 가운데 정렬하고 인라인 패딩은
  `--space-8`을 쓴다. 최소 블록 크기는 `--control-height`; Navbar 블록 패딩은
  `--space-4`를 사용한다.
- 하나의 flex 행에서 로고를 inline-start, 기본 메뉴와 행동 그룹을
  inline-end에 연속 배치한다. `.pen`의 30px 간격에 가장 가까운 기존 토큰인
  `--space-8`을 메뉴와 행동 그룹의 모든 항목 사이에 쓴다.
- 논리적 속성과 `start`/`end` 정렬만 사용한다. 각 flex 자식은 축소 가능해야
  하며 텍스트에 고정 너비나 고정 높이를 두지 않는다.
- 문서 및 DOM 순서는 `Logo → How it works → Pricing → Language → Try`로
  유지한다. 시각 재정렬 속성은 사용하지 않는다.

### 모바일

```text
[Logo]  flexible space  [Language] [Try] [Menu]

Menu open:
[modal overlay]
                         [Sheet: title, close]
                         [How it works]
                         [Pricing]
```

- `--breakpoint-mobile` 이하에서 기본 메뉴만 숨기고, 로고·언어·Try·메뉴
  트리거는 한 행에 계속 노출한다. 컨테이너 인라인 패딩은 `--space-4`, 항목
  간격은 `--space-2`다.
- 로고 영역은 축소 가능하되 핵심 식별자를 말줄임이나 잘림으로 숨기지 않는다.
  행동 레이블은 자연스럽게 줄바꿈할 수 있고 컨트롤은
  `--control-height`를 최소 높이로 사용한다. 가용 폭이 좁아도 가로 overflow를
  만들지 않는다.
- Sheet는 inline-end에서 열리고 배경 overlay는 `--color-overlay`, 콘텐츠
  표면은 `--color-bg`, 경계는 `--color-border`, 그림자는 `--shadow-lg`, 위계는
  `--layer-dialog`을 사용한다. 내부 패딩은 `--space-6`, 링크 스택 간격은
  `--space-4`다.
- Sheet 링크 순서는 데스크톱과 동일하게 `How it works → Pricing`이다. 링크
  선택 후 닫기 여부는 실제 탐색 계약을 가진 소비자가 결정한다.
- 미디어 쿼리의 선언 값은 `--breakpoint-mobile`의 단일 출처 값과 동기화한다.
  현재 브라우저에서 CSS custom property를 미디어 조건에 직접 사용할 수 있다고
  가정하지 않는다.

## 시각 상태

| 요소               | 상태              | 토큰 계약                                                           |
| ------------------ | ----------------- | ------------------------------------------------------------------- |
| 로고·메뉴 링크     | default           | `--color-fg`; 메뉴 보조 위계가 필요하면 `--color-muted-fg`          |
| 로고·메뉴 링크     | hover             | `--color-fg`와 비색상 강조(밑줄 또는 표면 변화)를 함께 사용         |
| 모든 상호작용 요소 | focus-visible     | `--color-focus`와 `--focus-ring`; 색 변화만으로 표시하지 않음       |
| 메뉴 링크          | active/current    | `--color-fg`, `--font-semibold`, 네이티브 current 상태를 함께 제공  |
| 언어·메뉴 버튼     | default           | ghost Button: 투명 표면, `--color-fg`                               |
| 언어·메뉴 버튼     | hover             | `--color-surface`                                                   |
| 언어·메뉴 버튼     | active/open       | `--color-surface-strong`; 열린 상태를 의미 속성으로도 노출          |
| Try                | default           | `--color-accent` / `--color-accent-fg`                              |
| Try                | hover             | `--color-accent-hover`                                              |
| Try                | active            | 기본 검정 CTA 배경 유지                                             |
| 모든 컨트롤        | disabled          | `--color-disabled-bg` / `--color-disabled-fg`; 모션과 상호작용 제거 |
| Sheet              | opening / closing | `--duration-normal`과 `--ease-standard`                             |

Navbar 자체에는 loading, error, empty 상태가 없다. 소비자가 비동기 상태를
추가하더라도 메뉴 구조를 대체하거나 로고·Try를 제거하지 않는다. 로딩 표현이
필요한 개별 Button은 기존 레이블 폭과 접근 가능한 상태 문구를 보존한다.

## 키보드와 포커스

- Tab 순서는 DOM 순서를 따른다. 데스크톱은 로고, 두 메뉴, 언어, Try 순서다.
  모바일은 로고, 언어, Try, 메뉴 트리거 순서이며 닫힌 Sheet의 링크는 Tab
  순서에 들어오지 않는다.
- Enter는 링크·버튼을 활성화하고 Space는 버튼을 활성화한다. 별도의 arrow-key
  탐색을 발명하지 않는다.
- Sheet가 열리면 포커스를 Sheet 안으로 이동하고 가두며, Escape와 닫기
  버튼으로 닫을 수 있다. 닫힌 뒤에는 메뉴 트리거로 포커스를 복귀시킨다.
- overlay 클릭으로 닫을 수 있더라도 이것이 유일한 닫기 방식이면 안 된다.
- sticky header가 사용될 경우 포커스 대상과 해시 목적지를 가리지 않도록
  소비 앱이 논리적 scroll margin을 공통 spacing 토큰으로 제공한다.

## 국제화와 RTL

- 표시 문자열, 접근 가능한 이름, 목적지는 모두 프로젝트별 props다. Navbar는
  영어 문구나 경로를 내부 기본값으로 소유하지 않는다.
- 번역문과 pseudo-locale 확장을 허용하도록 고정 인라인 크기, 말줄임, 숨김
  overflow를 사용하지 않는다. 컨트롤 높이는 고정이 아닌 최소값이다.
- 루트 `dir`을 상속하고 `margin-inline`, `padding-inline`, `inset-inline` 등
  논리적 속성을 사용한다. RTL에서는 시작/끝 배치와 Sheet 진입 방향이
  미러링되지만 DOM·낭독·키보드 순서는 바꾸지 않는다.
- 언어 아이콘만으로 현재 언어나 변경 동작을 표현하지 않는다. 접근 가능한
  이름에는 locale-aware 레이블이 필요하다.

## 반응형·접근성 검증 계약

1. 세 프로젝트에서 각각 다른 로고, 메뉴 레이블·목적지, 언어 레이블·행동,
   Try 레이블·목적지 props가 동일한 구조에 반영된다.
2. 데스크톱에서는 정의된 다섯 항목이 한 행의 start/menu/end 그룹으로 보이고,
   모바일에서는 로고·언어·Try·메뉴 트리거만 상시 보이며 두 메뉴는 Sheet에만
   보인다.
3. 지원 viewport와 pseudo-locale에서 가로 overflow, 잘린 레이블, 가려진
   포커스 링이 없다.
4. LTR과 RTL에서 논리적 배치가 올바르게 미러링되고 DOM 순서는 동일하다.
5. 키보드만으로 모든 항목에 접근하고 Sheet를 열고 닫고 탈출할 수 있으며,
   닫은 뒤 트리거로 포커스가 복귀한다.
6. 로고, 메뉴 링크, 언어, Try, 메뉴 열기·닫기에는 각각 locale-aware 접근
   가능한 이름이 있다.

모든 상태 전환은 `prefers-reduced-motion`에서 제거하거나 즉시 완료한다.
본문·메뉴의 `--color-fg` 및 `--color-muted-fg` 조합과 primary Button 조합은
기존 토큰 계약의 WCAG AA 보장을 그대로 사용한다.

## 토큰 결정과 가정

- `.pen`의 반복 값은 `--color-editorial-*` 의미 토큰으로 승격했다. 컴포넌트는
  생 색상값을 직접 사용하지 않는다.
- 앱은 `appearance` 판별 유니언으로 시각 variant를 선택한다. Boolean 표시
  플래그는 추가하지 않으며 새 디자인은 계약·토큰·명시적 variant를 함께
  확장한다.
- `.pen`에 있는 이미지 로고 URL은 저장소에 대응 자산이 없어 임의 복사하지
  않았다. 프로젝트별 실제 로고는 기존 `NavbarLogo`의 `text | image` 계약으로
  교체할 수 있다.
- 실제 프로젝트별 브라우저 지원 범위는 각 프로젝트의 기존 정책을 그대로
  따른다.

Design freeze: 이 문서와 기존 `packages/design-tokens/src/tokens.css`는 구현이
소비할 수 있는 안정된 디자인 계약이다.
