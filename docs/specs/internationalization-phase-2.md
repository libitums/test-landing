# 작업 스펙: Phase 2 국제화·현지화

## 목적 (goal)

세 랜딩 프로젝트의 사용자가 locale을 바꿔도 동일한 핵심 행동을 수행할 수 있도록 문자열·형식·방향성·검색 메타데이터를 공통 국제화 경계로 제공한다.

## 타깃 (target)

- 프로젝트: `k-drama`, `ai-communication`, `k-culture`
- 디바이스: 데스크톱과 모바일
- 브라우저 하한: Browserslist `> 0.5%, last 2 versions, Firefox ESR, not dead`; Safari/iOS Safari 15 이상; Android Chrome 109 이상; IE와 Opera Mini 제외
- locale: `ko-KR`(기준), `en-US`(기준), `ar`(RTL)

## 디자인 (design_ref)

DESIGN.md 표준 따름. 벗어남: 없음. 국제화된 문구는 고정 높이를 가정하지 않고 논리적 CSS 속성을 사용한다.

## 범위

- 포함(scope_in): provider-independent locale registry/runtime 계약, 클라이언트 번역 라이브러리 소비 경계, locale resource 분리, 기본 locale·fallback·URL 전략(경로 prefix), `Intl.NumberFormat`/`Intl.DateTimeFormat`, RTL `dir`, 누락·불필요 키 검사, pseudo-locale, `lang`/`dir`/canonical/hreflang 메타데이터, locale별 폰트 fallback, 세 프로젝트의 공통 연결과 단위·통합·E2E 계약 테스트
- 제외(scope_out): 외부 번역 관리 서비스/CMS 또는 번역가 워크플로우, 서버 측 지역 판정, 법률 문구 작성·법률 검토, 동의 판정, 외부 번역 API, 새 시각 디자인 시스템 구축

## 수용 기준 (acceptance_criteria)

1. 세 프로젝트가 `ko-KR`, `en-US`, `ar`를 빌드하고 `ar`를 RTL로 처리하며 locale registry와 provider-independent contract를 통해 동일한 키 집합을 사용한다.
2. CI 검사가 기준 locale 대비 누락 키·불필요 키를 모두 보고하고 0건일 때만 통과하며, 런타임의 암묵적 기본 locale fallback 발생도 0건으로 검증된다.
3. pseudo-locale E2E에서 문자열 확장 상태로 데스크톱·모바일 핵심 CTA와 landmark가 잘리지 않고 키 자체가 노출되지 않는다.
4. locale 전환 시 `<html lang>`과 `<html dir>`가 registry와 일치하고, canonical은 locale prefix를 포함하며 hreflang alternate 집합이 지원 locale 전체와 일치한다.
5. `ko-KR`, `en-US`, `ar` 전체에서 숫자·날짜 formatting 단위 테스트가 `Intl` 결과를 검증하고, RTL에서도 논리적 순서·포커스·CTA 링크 동작이 유지된다.
6. 각 프로젝트의 locale별 폰트 fallback이 선언되며, 폰트 로드 실패가 텍스트 가독성·핵심 CTA 접근성을 저해하지 않는다.
7. 루트 typecheck·lint·test 및 지원 브라우저 정책 대상의 관련 E2E가 통과한다.
8. 최종 review 레이어가 Phase 2를 통과시키면 작업을 멈추고 Phase 3 진행 여부를 사용자에게 확인한다.

## 제약 (constraints)

- 특정 라이브러리는 구현 레이어에서 선택할 수 있으나 이 문서의 계약은 provider-independent이며 `packages/contracts/src/i18n.ts`를 단일 타입 출처로 한다. 외부 번역 서비스 연동은 금지한다.
- URL은 locale path prefix를 사용하고, 미지원·누락 locale은 기본 locale로 정규화한다. 원본 query는 번역 키나 메타데이터에 포함하지 않는다.
- 번역 키는 strict allowlist이며 누락 시 조용한 문구 대체를 허용하지 않는다. pseudo-locale은 테스트 전용이다.
- WCAG AA, 키보드 접근성, reduced-motion 및 기존 DESIGN 토큰을 유지한다.

## 시각 레퍼런스 (visual_reference)

시각 변경 없음. 기존 DESIGN.md와 랜딩 구조를 유지하며, 긴 번역문에 맞춰 자연스러운 줄바꿈을 허용한다.

## 우선순위 / 데이터 (선택)

세 프로젝트가 함께 소비하는 locale registry·리소스 검증·formatting·메타데이터 계약을 개별 카피보다 우선한다. 번역 데이터는 정적 클라이언트 리소스다.

## 비고

- 확정 locale: `ko-KR`, `en-US`, `ar`; `ar`는 RTL 방향을 사용한다.
- Phase 1의 프로젝트·브라우저 범위와 `countryHint` 정책을 상속하며, `utm_country`는 locale 또는 동의의 근거로 사용하지 않는다.

## 계약 고정

`packages/contracts/src/i18n.ts`의 `Locale`, `TextDirection`, `LocaleRegistry`, `I18nRuntime`, `LocaleRoutingMetadata`, `TranslationKeyReport` 타입과 본 문서의 fallback·URL·검증·메타데이터 불변식이 Phase 2 고정 계약이다.
