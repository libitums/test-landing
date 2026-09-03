# 작업 스펙: 모바일 우선 전환과 계측 무결성 회복

## 목적 (goal)

트래픽의 99% 이상인 모바일 방문자가 기기 폭과 무관하게 랜딩을 온전히 보고 사전 등록까지 갈 수 있게 하고, 그 과정에서 남는 계측이 레이아웃 파손이 아니라 메시지 차이를 반영하게 한다.

## 배경 — 무엇이 실제로 깨져 있었나

`section_viewed`는 IntersectionObserver의 `intersectionRatio >= 0.5`로 발화한다. 이 비율은 `교차면적 ÷ 섹션면적`이라, **섹션이 뷰포트보다 2배 이상 높으면 비율의 천장이 0.5 아래로 내려가 아무리 오래 읽어도 발화하지 않는다.**

2026-09-03 측정(개발 서버, Chromium, `en-US`):

| 섹션                       | 데스크톱 1280×800 | iPhone SE 320×568 | iPhone 12 390×844 | iPhone 15 PM 430×932 |
| -------------------------- | ----------------- | ----------------- | ----------------- | -------------------- |
| k-drama `pricing`          | 1055px 발화       | 2058px 미발화     | 2006px 미발화     | 2006px 미발화        |
| k-drama `youtube`          | 1073px 발화       | 2079px 미발화     | 2007px 미발화     | 2007px 미발화        |
| k-drama `hero`             | 933px 발화        | 1584px 미발화     | 1533px 발화       | 1490px 발화          |
| ai-communication `pricing` | 1094px 발화       | 2180px 미발화     | 2040px 미발화     | 1955px 미발화        |
| k-culture `pricing`        | 1055px 발화       | 2120px 미발화     | 1984px 미발화     | 1984px 미발화        |

데스크톱에서는 모든 섹션이 발화하고 모바일에서는 세 앱 모두 `pricing`이 한 번도 발화하지 않는다. 320px에서는 hero와 기능 섹션 대부분까지 빠진다.

파급은 셋이다.

1. `section_dwelled`는 `sectionEntered`와 짝이라 미발화 섹션의 체류 시간이 0으로 남는다.
2. `page_exited.lastSectionId`는 마지막으로 _발화한_ 섹션이라, 요금제를 보다 떠난 사람이 `cta`에서 떠난 것으로 기록된다.
3. 앱마다 빠지는 섹션이 달라(k-culture 기능 셋은 발화, k-drama `youtube`는 미발화) 세 변형 비교가 메시지 차이가 아니라 계측 결손 차이를 비교하게 된다.

가로 오버플로도 같은 측정에서 나왔다 — 820px에서 k-drama 92px, k-culture 22px.

## 타깃 (target)

- 디바이스: 모바일 우선. 보장 폭은 **320px(iPhone SE) ~ 430px(iPhone 15 Pro Max)** 전 구간과 **820px(아이패드 세로)**. 280px(폴드 커버)는 보장하지 않는다.
- 브라우저 하한: 저장소 Browserslist `> 0.5%, last 2 versions, Firefox ESR, not dead`; Safari/iOS Safari 15 이상; Android Chrome 109 이상.

## 디자인 (design_ref)

DESIGN.md 표준을 따르되 **원칙 하나를 바꾼다.** "데스크톱 기본 레이아웃을 먼저 정의하고 `--breakpoint-mobile` 이하에서 한 열로 축소한다"를 모바일 기본 레이아웃을 먼저 정의하고 넓은 폭에서 확장하는 순서로 뒤집는다. 트래픽의 99%가 모바일이므로 기본값이 다수를 향해야 한다. DESIGN.md를 함께 갱신한다.

## 범위

- 포함(scope_in)
  - 섹션 가시성 판정 규칙 교체: 섹션 면적 기준 하나에서 **섹션 면적 50% 또는 뷰포트 높이 50% 중 하나를 만족**하면 본 것으로 판정. 순수 함수로 분리해 단위 계층에서 검증한다.
  - 위 규칙에 맞춘 IntersectionObserver threshold 조정. 뷰포트보다 높은 섹션에서도 콜백이 오게 한다.
  - `section_dwelled`와 `page_exited.lastSectionId`가 새 판정 규칙을 따르는지 확인.
  - 보장 폭 전 구간에서 가로 오버플로 제거. 820px에서 확인된 k-drama 92px, k-culture 22px 포함.
  - 공통 UI와 세 앱의 세로 리듬을 모바일 기본으로 재정의. 보장 폭에서 섹션 높이를 낮춘다.
  - DESIGN.md의 레이아웃 원칙 전환과 `MEASUREMENT.md`의 계측 규칙 기록 갱신.
  - `experimentId`를 `landing-phase-2`로 올려 고치기 전후 데이터를 분리.
  - 보장 폭을 도는 E2E 매트릭스 추가.
- 제외(scope_out)
  - 280px(폴드 커버) 대응.
  - 12px 미만 텍스트 정리. 모든 폭에서 동일하게 나타나 기기 크기 문제가 아니다. 별도 작업으로 둔다.
  - 문구·정보 구조 변경. 이번 작업은 같은 내용을 같은 순서로 두고 배치만 바꾼다.
  - 이미 GA4에 쌓인 `landing-phase-1` 데이터의 소급 보정.
  - 동의 UI, 새 이벤트 추가.

## 수용 기준 (acceptance_criteria)

1. 순수 판정 함수가 "섹션 면적 50% 이상" 또는 "뷰포트 높이의 50% 이상 차지" 중 하나를 만족할 때 참을 반환하고, 둘 다 미달이면 거짓을 반환함을 단위 테스트가 검증한다. 뷰포트보다 높은 섹션에서 참이 나오는 경계값을 포함한다.
2. 320 · 360 · 390 · 412 · 430 · 820px 각각에서 세 앱의 추적 섹션 전부가 `section_viewed`를 한 번씩 발화한다. 미발화 섹션 0건.
3. 위 여섯 폭에서 세 앱의 가로 오버플로가 0px이다.
4. 요금제 섹션까지 스크롤한 뒤 이탈하면 `page_exited.lastSectionId`가 `pricing`이다.
5. 세 앱의 분석 context가 `experimentId: landing-phase-2`를 낸다.
6. `pnpm build`, `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm e2e`가 모두 통과하고 axe critical/serious 위반이 0건으로 유지된다.

## 측정 (measurement)

출시 후 확인할 지표는 셋이다.

- **미발화 섹션 비율** — `experiment_viewed` 대비 각 `section_viewed`의 발생률. `pricing`이 0에 가깝던 것이 다른 섹션과 같은 자릿수로 올라오는지 본다.
- **`page_exited.lastSectionId`의 분포** — 특정 섹션에 몰려 있던 것이 실제 이탈 지점을 따라 흩어지는지 본다.
- **세 변형의 섹션 커버리지 차이** — 앱마다 다르던 결손이 사라져 변형 비교가 성립하는지 본다.

이 지표들이 정상 범위에 들어온 뒤에야 `landing-phase-2`의 전환율 비교를 읽는다.

## 제약 (constraints)

- 시각 값은 `packages/design-tokens`의 CSS 변수에서만 온다. 앱 스타일에 생값을 추가하지 않는다.
- 계측 판정은 DOM 측정과 분리된 순수 함수로 두어 단위 계층에서 검증 가능해야 한다.
- 이벤트 계약(`@landing/contracts`)의 이름과 속성은 바꾸지 않는다. 바뀌는 것은 발화 조건이다.
- 여덟 locale과 RTL에서 동일하게 성립해야 한다.

## 비고

- 발화에서 직접 확인한 항목: 모바일 비중 99% 이상, 데스크톱 확장 후 모바일 후속 작업이라는 경위, 기기별 크기 미대응, 계측 노이즈. 보장 폭·원칙 전환·데이터 분리는 사용자 선택으로 확정했다.
- `.env.example`의 k-culture Supabase 변수 누락은 이 작업과 별개다.
