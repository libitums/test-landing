# 공통 확장형 Hero 디자인 고정

## 범위와 시각 계층

공통 Hero는 세 프로젝트의 첫 메시지를 같은 순서로 전달하되, 앱별 문구와
미디어 구성을 제한하지 않는다. 시각 순서와 DOM 순서는 모든 뷰포트에서 다음과
같다.

```text
[title]
[subtitle]
[CTA]
[media children]
```

- Hero 전체는 `Section`과 `Container`의 공통 레이아웃 리듬을 재사용한다.
- title, subtitle, CTA는 가운데 정렬된 단일 copy 영역을 이룬다. copy 영역의
  최대 인라인 크기는 `--content-reading`이며, 컨테이너 가운데에 놓인다.
- title은 `--text-display`, `--leading-tight`, `--font-bold`,
  `--color-fg`를 사용한다.
- subtitle은 `--text-lg`, `--leading-body`, `--color-muted-fg`를 사용한다.
- title과 subtitle 사이는 `--space-6`, subtitle과 CTA 사이는 `--space-8`,
  CTA와 media 사이는 `--space-12`를 사용한다.
- 실제 이미지, 장식, 애니메이션은 이 디자인 범위에 포함하지 않는다.

## 반응형 계약

### 데스크톱

- Hero는 두 열로 분리하지 않는다. title → subtitle → CTA → media 순서의 중앙형
  한 열을 유지한다.
- copy 영역은 `--content-reading`을 넘지 않으며, media 영역은
  `Container`의 가용 인라인 크기까지 확장할 수 있다.
- media에 고정 높이, 최소 높이 또는 고정 종횡비를 부여하지 않는다.

### 모바일

- `--breakpoint-mobile` 이하에서도 요소 순서와 중앙 정렬을 유지한다.
- `Section`과 `Container`의 모바일 여백은 기존 계약대로 각각 `--space-16`,
  `--space-4`를 사용한다.
- title과 subtitle 사이는 `--space-4`, subtitle과 CTA 사이는 `--space-6`,
  CTA와 media 사이는 `--space-8`로 축소한다.
- CTA는 번역문 길이에 따라 줄바꿈하거나 가용 인라인 공간 안에서 확장할 수
  있지만, 고정 너비와 고정 텍스트 높이는 사용하지 않는다.

CSS 미디어 쿼리는 CSS 사용자 정의 속성을 직접 조건으로 사용할 수 없으므로,
구현은 토큰 소스의 `--breakpoint-mobile` 값과 동일한 경계를 사용하고 토큰 변경
시 함께 동기화한다.

## media children 소유권

- 공통 Hero는 media `children`의 문서 순서, 가운데 배치, 가용 인라인 크기와
  copy 영역과의 간격만 소유한다.
- 앱은 전달한 `children`의 종횡비, 블록 크기, 내부 레이아웃, 배경, 테두리,
  radius, shadow와 접근 가능한 이름을 소유한다.
- 공통 Hero는 media에 `aspect-ratio`, 고정 블록 크기, 최소 블록 크기, 배경,
  테두리, radius 또는 shadow를 강제하지 않는다.
- media 슬롯과 직접 자식은 가용 인라인 크기를 넘지 않아야 하며, 축소 가능한
  구조를 사용해 가로 스크롤과 copy 영역 겹침을 만들지 않는다.
- `children`이 없으면 빈 표면이나 자리표시자를 렌더하지 않으며, CTA 아래의
  media 간격도 만들지 않는다.

## 국제화와 RTL

- title, subtitle, CTA는 줄 수와 블록 크기를 제한하지 않는다. ellipsis,
  line clamp, 숨김 overflow로 번역문을 생략하지 않는다.
- copy는 가운데 정렬하되 문장 자체의 양방향 알고리즘과 상위 문서의 `dir`을
  존중한다.
- media 배치에는 물리 방향 속성 대신 논리적 인라인/블록 속성을 사용한다.
- RTL에서도 title → subtitle → CTA → media의 문서·시각 순서가 바뀌지 않는다.
- 긴 번역문이나 혼합 방향 텍스트가 CTA와 media를 밀어낼 수는 있지만 서로
  겹치거나 가로 overflow를 만들어서는 안 된다.

## 상태 계약

- title/subtitle/media 슬롯에는 상호작용 상태를 만들지 않는다.
- CTA의 default, hover, active, focus-visible, disabled, loading 상태는 새로운
  Hero 전용 스타일을 만들지 않고 공통 `Button`의 명시적 variant와 상태 토큰을
  그대로 재사용한다.
- CTA focus-visible은 `--color-focus`와 `--focus-ring`을 사용하며 색 변화만으로
  포커스를 표현하지 않는다.
- 상태 전환이 필요한 공통 `Button`은 `--duration-fast`와
  `--ease-standard`를 사용한다. reduced-motion 환경에서는 비필수 전환을
  제거한다.
- 이 작업의 동작 범위에는 CTA 탐색, 이벤트, 로딩 전환 구현이 포함되지 않는다.
  상태 계약은 공통 Button을 소비할 때 시각 회귀를 만들지 않기 위한 기준이다.
- media가 없을 때는 별도 empty UI를 만들지 않는다. media 콘텐츠 자체의
  loading, error, empty 상태가 필요하면 앱이 자신의 `children` 안에서 정의한다.

## 토큰 재사용과 대비

신규 토큰은 도입하지 않는다. 기존 `--content-reading`, `--text-display`,
`--text-lg`, `--leading-tight`, `--leading-body`, `--font-bold`, 색상 토큰과 간격
스케일만으로 시각 계약을 표현할 수 있다.

- title의 `--color-fg`와 subtitle의 `--color-muted-fg`는 `--color-bg` 위에서
  기존 WCAG AA 계약을 유지한다.
- CTA는 공통 Button의 `--color-accent`/`--color-accent-fg` 및 상태 조합을
  재사용하므로 기존 일반 텍스트 AA 계약을 유지한다.
- 앱이 media 표면을 정의할 때도 `DESIGN.md`의 시맨틱 색상 조합과 WCAG AA
  기준을 따라야 한다.

## 구현 검증 기준

- 모바일과 데스크톱에서 title, subtitle, CTA가 가운데 정렬되고 media가 그
  아래에 놓인다.
- 세 프로젝트가 서로 다른 비율과 구조의 `children`을 전달해도 공통 Hero가
  높이나 비율을 덮어쓰지 않는다.
- 긴 번역문과 RTL에서 콘텐츠 생략, 겹침, 의도하지 않은 가로 스크롤이 없다.
- media 미전달 시 빈 placeholder와 불필요한 하단 간격이 없다.
- 실제 이미지 생성, API/CMS 연결, CTA 동작, 애니메이션 없이 시각 계약을
  충족한다.

## 가정

- CTA는 공통 `Button`의 기존 시각 API를 소비한다.
- 앱별 media는 공통 Hero의 `children`으로 전달되며, 앱이 해당 콘텐츠의 시각 및
  접근성 의미를 책임진다.
- 세 프로젝트 모두 `DESIGN.md`와 동일한 토큰 파일을 소비한다.
