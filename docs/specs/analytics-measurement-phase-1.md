# 작업 스펙: Phase 1 공통 분석 측정

## 목적 (goal)

세 랜딩 프로젝트의 방문자가 실험 노출, CTA 행동, 전환을 개인정보 동의에 맞게 측정할 수 있도록 공급자와 프로젝트에 종속되지 않는 공통 분석 경계를 제공한다.

## 타깃 (target)

- 프로젝트: `k-drama`, `ai-communication`, `k-culture`
- 디바이스: 데스크톱과 모바일
- 브라우저 하한: Browserslist `> 0.5%, last 2 versions, Firefox ESR, not dead`; Safari/iOS Safari 15 이상; Android Chrome 109 이상; IE와 Opera Mini 제외

## 디자인 (design_ref)

DESIGN.md 표준 따름. 벗어남: 없음. 이번 Phase에는 시각 변경이 없다.

## 범위

- 포함(scope_in): 세 프로젝트 명칭과 경계로의 기존 예제 앱 마이그레이션, 공급자 독립적인 버전 1 이벤트 `experiment_viewed`/`cta_clicked`/`feature_cta_clicked`/`conversion_completed`, 기능 CTA의 필수 `featureId`, 런타임 payload 검증 계약, 공통 측정 context, `utm_country` 기반 `countryHint` 정제, 동의 게이트, no-op 및 in-memory adapter, 노출 중복 방지, 분석 실패 격리, 공통 contract/단위/통합 테스트
- 제외(scope_out): 실제 외부 분석 SDK, CMP, 동의 UI, IP 등으로 수행하는 정확한 위치 판정, `countryHint`를 이용한 동의 판정, 동의 전 이벤트 저장·큐·재전송, 원본 URL query 수집, 시각 디자인 변경

## 수용 기준 (acceptance_criteria)

1. 세 이벤트의 version 1 payload가 런타임 스키마를 통과하고, 누락 필드·알 수 없는 필드·잘못된 event name/version/consent/countryHint를 가진 payload는 전송 전에 거부됨을 contract test로 확인한다.
2. `k-drama`, `ai-communication`, `k-culture` 각각에서 노출 1회와 CTA 클릭 1회가 올바른 `experimentId`, `variantId`, `locale`, `pageId`와 함께 in-memory adapter에 기록된다.
3. 같은 `experimentId`/`variantId`/`pageId` 조합의 `experiment_viewed`를 한 페이지 생명주기에서 여러 번 요청해도 한 번만 기록된다.
4. consent가 `unknown` 또는 `denied`이면 outbound adapter 호출은 0건이고, 이후 `granted`로 변경되어도 앞서 차단한 이벤트가 큐잉되거나 재전송되지 않는다.
5. consent가 `granted`인 현재 이벤트만 adapter로 전달되며 `countryHint` 값은 consent 상태를 변경하거나 우회하지 않는다.
6. `utm_country`는 대소문자를 정규화한 대문자 ASCII 2자리 코드가 주입된 허용 목록에 있을 때만 해당 코드가 되고, 누락·중복·형식 오류·비허용 값이면 `unknown`이 된다. adapter payload와 오류 정보 어디에도 원본 query 또는 전체 URL이 포함되지 않는다.
7. 이메일, 전화번호, 원본 query, 전체 URL 및 계약에 없는 속성을 payload에 넣을 수 없고 런타임 검증에서도 거부됨을 자동 테스트로 확인한다.
8. 런타임 검증 실패와 동기/비동기 adapter 실패가 페이지 렌더링, CTA 기본 링크 이동, 호출자 흐름을 막지 않으며 미처리 예외를 만들지 않는다.
9. 저장소 루트의 typecheck와 관련 contract/unit/integration test가 지원 브라우저 정책을 대상으로 통과한다.
10. 최종 review 레이어가 Phase 1을 통과시킨 뒤 작업을 멈추고, Phase 2 착수 전에 사용자 의사를 확인한다.
11. 기능별 early-access CTA 클릭은 `feature_cta_clicked`로 기록되고 비어 있지 않은 `featureId`를 포함하며, 일반 `cta_clicked`와 구분된다.

## 제약 (constraints)

- 공통 계약과 측정 경계를 먼저 구현하고 세 프로젝트에는 동일 API로 최소 연결한다.
- 분석 UI에 Boolean mode props 또는 render props를 추가하지 않는다. 상태는 `ConsentState` 식별 union, 이벤트는 event name으로 구분되는 명시적 union을 사용한다.
- 이벤트 계약은 strict allowlist 방식이다. 스키마에 선언되지 않은 키는 PII 여부와 무관하게 거부한다.
- adapter 오류는 best-effort로 격리한다. 분석 완료를 렌더링이나 탐색의 선행 조건으로 삼지 않는다.
- `countryHint`는 콘텐츠/실험용 비신뢰 힌트이며 법적 지역 또는 consent의 근거가 아니다.

## 시각 레퍼런스 (visual_reference)

시각 변경 없음. 기존 DESIGN.md와 랜딩 구조를 유지한다.

## 우선순위 / 데이터 (선택)

프로젝트별 커스터마이징보다 세 프로젝트가 함께 소비하는 계약, adapter 경계, 동의 게이트, 검증 테스트를 최우선으로 한다. 외부 API/SDK 데이터 연동은 없다.

## 비고

- [추론] 표시 항목: 없음
- 현재 저장소의 `landing-alpha`와 `landing-beta`는 목표 프로젝트 이름과 일치하지 않는다. Phase 1 구현에서 이를 세 프로젝트 경계로 마이그레이션하고 `alpha`/`beta` 명칭을 새 계약에 남기지 않는다.
- 국가 허용 목록의 실제 코드 집합은 제품/배포 설정이 주입한다. 계약은 ISO 3166-1 alpha-2 형태(대문자 ASCII 2자리)와 목록 membership을 모두 요구한다.

## 공통 경계와 책임

```text
location.search
  -> parseCountryHint(search, allowedCountries)
  -> AnalyticsContext(countryHint 포함)

UI action / page exposure / conversion
  -> AnalyticsTracker (consent gate + exposure dedupe + failure isolation)
  -> runtime event validator (strict allowlist)
  -> AnalyticsAdapter
       |- no-op
       `- in-memory (tests)
```

- `parseCountryHint`: `utm_country` 하나만 읽고 정제된 힌트만 반환한다. 원본 search/query를 저장하거나 반환하지 않는다.
- `AnalyticsTracker`: 현재 consent를 확인하고 이벤트 context를 조립하며 노출 중복을 제거한다. 차단 이벤트를 보관하지 않는다.
- runtime validator: 이벤트 version과 discriminated union을 검증하고 알 수 없는 속성을 거부한다.
- `AnalyticsAdapter`: 검증·허용된 이벤트만 받는 공급자 독립 sink다. 외부 SDK adapter는 후속 범위다.
- no-op/in-memory adapter: 각각 안전한 폐기와 deterministic test 관찰을 제공한다.

## 데이터 흐름과 불변식

1. 프로젝트가 `experimentId`, `variantId`, `locale`, `pageId`와 정제된 `countryHint`를 공통 tracker에 주입한다.
2. tracker는 이벤트 요청 시점의 `ConsentProvider.getState()`만 읽는다.
3. `unknown`/`denied`면 즉시 `blocked` 결과를 반환하고 payload를 만들거나 adapter를 호출하지 않는다.
4. `granted`면 strict runtime validation을 통과한 version 1 event만 adapter에 전달한다.
5. tracker가 반환하는 Promise는 adapter 실패를 `failed` 결과로 흡수한다. UI는 이를 await해야 할 의무가 없다.
6. consent 변경은 이후 요청에만 적용한다. 과거 이벤트 replay API는 계약에 존재하지 않는다.

## 고정 TypeScript 계약

단일 출처는 `packages/contracts/src/analytics.ts`다.

- `AnalyticsProjectId`: 세 프로젝트의 닫힌 union
- `AnalyticsEventName`, `AnalyticsEventVersion`, `AnalyticsEvent`: version 1 이벤트 discriminated union
- `FeatureCtaClickedEvent`: 기능 CTA를 구분하는 필수 `featureId` payload
- `AnalyticsContext`: 모든 이벤트의 필수 공통 context
- `CountryHint`, `CountryHintParser`, `CountryAllowlist`: 정제된 국가 힌트 경계
- `ConsentState`, `ConsentProvider`: 현재 동의 상태 주입 경계
- `AnalyticsAdapter`: 공급자 독립 전송 경계
- `AnalyticsTracker`, `AnalyticsTrackResult`: non-throwing 측정 API와 관찰 가능한 결과
- `AnalyticsEventValidator`: strict 런타임 검증 경계
- `NoopAnalyticsAdapterFactory`, `InMemoryAnalyticsAdapterFactory`: 구현 레이어가 제공할 테스트 adapter 생성 계약

이 계약에는 Boolean mode prop, UI render prop, raw query, URL 또는 임의 metadata bag이 없다.

## 테스트 계약

- contract: event별 유효/무효 payload, extra-key 거부, version/name 불일치, PII/raw query 형태의 키 거부
- country parser: 단일 유효 값, lowercase 정규화, 누락, 빈 값, 중복 parameter, 비 ASCII, 2자리가 아닌 값, allowlist 미포함
- consent: 각 상태별 adapter 호출 수, 상태 변경 후 non-replay
- tracker: 노출 중복 제거, 세 프로젝트 context 전달, adapter sync throw/rejected Promise 격리
- app integration: 세 프로젝트의 페이지 노출과 CTA 링크 기본 동작 보존

## 병렬 실행 단위

계약 고정 후 아래 작업은 독립 진행 가능하다.

1. 상태·데이터: parser, strict validator, consent gate, dedupe tracker 구현
2. adapter: no-op 및 in-memory adapter 구현과 contract test
3. 프로젝트 마이그레이션: `k-drama`, `ai-communication`, `k-culture` 경계 구성
4. 앱 연결: 각 프로젝트에 공통 context와 exposure/CTA 측정 최소 연결
5. 테스트: PII/query 부재, non-replay, 실패 격리, 브라우저 통합 검증

## 계약 고정

이 문서와 `packages/contracts/src/analytics.ts`의 타입 이름, 닫힌 event/project union, 필수 context, consent/non-replay/failure-isolation 불변식이 Phase 1 고정 계약이다. 변경은 이 문서와 계약 파일을 먼저 함께 갱신한 뒤 모든 소비 레이어에 전달한다.
