# 작업 스펙: Supabase 공통 사전 등록 기반

## 목적 (goal)

세 랜딩페이지 방문자가 이메일 업데이트에 동의하고 사전 등록을 신청하면, 운영자가 프로젝트별로 분리된 저장소에서 신청을 관리할 수 있게 한다.

## 타깃 (target)

- 디바이스: 모바일과 데스크톱
- 브라우저 하한: 루트 Browserslist `> 0.5%, last 2 versions, Firefox ESR, not dead`; Safari/iOS Safari 15 이상; Android Chrome 109 이상; IE와 Opera Mini 제외

## 디자인 (design_ref)

DESIGN.md 표준 따름. 벗어남: 없음. 기존 `ai-communication` 사전 등록 폼과 상태 UI를 유지한다.

## 범위

- 포함(scope_in): 모노레포 공통 Supabase 클라이언트와 환경변수 경계, 프로젝트별 세 테이블, 단일 공통 Edge Function의 명시적 프로젝트 라우팅, 프론트엔드와 함수 양쪽 검증, 분산 환경에서 공유되는 IP별 rate limit, RLS와 권한 차단, `ai-communication` 폼 연결, API/port/test-id 계약, schema/function/app 자동 테스트
- 제외(scope_out): 관리자 UI, 확인 또는 마케팅 이메일 발송, CRM 연동, `k-drama`와 `k-culture` 폼 연결, 이메일 중복 제거, 원격 Supabase 리소스의 u0 단계 변경

## 수용 기준 (acceptance_criteria)

1. `k_drama_early_access`, `ai_communication_early_access`, `k_culture_early_access`가 아래 동일 스키마와 RLS 경계를 가지며 migration contract test를 통과한다.
2. anon 및 authenticated 역할의 테이블 직접 `select`, `insert`, `update`, `delete`는 모두 거부되고 Edge Function의 서버 자격 증명으로만 삽입할 수 있다.
3. `ai-communication`의 유효한 제출은 공통 Edge Function을 한 번 호출해 `ai_communication_early_access`에 한 행을 저장하고 `success` 상태를 표시한다.
4. 이메일이 유효하지 않거나 `marketingConsent`가 literal `true`가 아닌 요청은 프론트엔드와 Edge Function 양쪽에서 거부되며 어떤 등록 테이블에도 행을 만들지 않는다.
5. 같은 이메일을 반복 제출하면 매번 새로운 UUID 행과 새 `created_at`을 저장하며 모든 정상 요청은 `success`로 처리한다.
6. 같은 IP의 임의 60초 sliding window에서 첫 5개 POST 요청까지만 처리하고 여섯 번째 이후 요청은 저장 없이 HTTP 429와 올바른 `Retry-After`를 반환한다.
7. 누락되거나 허용 목록 밖인 `projectId`는 HTTP 404 `unknown_project`로 끝나며 어떤 등록 테이블에도 행을 만들지 않는다.
8. 잘못된 요청, rate limit, 네트워크 또는 서버 실패가 페이지 렌더링을 막거나 미처리 Promise rejection을 만들지 않고 폼의 오류 상태로 귀결된다.
9. contract typecheck, migration/RLS 테스트, Edge Function request/response·라우팅·검증·rate-limit 테스트, `ai-communication` adapter/UI 통합 테스트가 통과한다.

## 제약 (constraints)

- 공개 쓰기 경계는 하나의 Supabase Edge Function `register-early-access`다. 테이블 REST API를 앱에서 직접 사용하지 않는다.
- 브라우저 번들에는 publishable key만 허용한다. service-role key와 rate-limit 저장소 자격 증명은 서버 전용이다.
- 함수는 클라이언트를 신뢰하지 않고 동일 입력 계약을 다시 검증한다. service-role client는 함수 내부에서만 생성하고 반환·로깅하지 않는다.
- rate limit은 IP별 5회/60초 sliding window이며 공유·원자적 저장소를 사용한다. 인스턴스 메모리는 허용하지 않고 저장소 장애 시 등록을 차단해 HTTP 500으로 실패한다.
- RLS 활성화만으로 끝내지 않고 anon/authenticated의 테이블 권한도 회수한다. 등록 데이터 조회·수정·삭제용 공개 정책은 만들지 않는다.
- 로그에는 이메일, request body, publishable/service-role key, 전체 IP를 기록하지 않는다.

## 시각 레퍼런스 (visual_reference)

현재 `apps/ai-communication/src/app/EarlyAccessModal.tsx`의 폼, 성공 및 오류 상태 UI. 시각 변경 없음.

## 우선순위 / 데이터 (선택)

- 우선순위: 공통 schema/보안/API 계약을 먼저 고정한 뒤 `ai-communication` 하나에서 실제 저장을 검증한다.
- 데이터: 이메일과 이메일 업데이트 동의 증거를 프로젝트별 테이블에 저장한다. 동일 이메일은 중복 행을 허용한다.

## 비고

- [추론] 표시 항목: 없음
- 이 문서와 `packages/contracts/src/early-access.ts`가 u0 고정 계약이다. 공급자 SDK 타입은 공통 계약에 노출하지 않는다.

## 시스템 경계와 데이터 흐름

```text
EarlyAccessModal
  -> SubmitEarlyAccessRegistration({ email, marketingConsent })
  -> ai-communication adapter (projectId 고정 주입)
  -> POST /functions/v1/register-early-access
  -> shared rate limiter -> strict validation -> table allowlist routing
  -> project registration table
  -> response adapter -> resolve(success) / reject(typed submission error)
  -> page validation-error / rate-limit / network-error state
```

`k-drama`와 `k-culture`는 schema와 함수 라우팅까지만 준비한다. 두 앱에는 adapter나 폼을 연결하지 않는다. 함수의 table 이름은 요청에서 받지 않고 `earlyAccessTableByProject`와 같은 닫힌 서버 allowlist로만 결정한다.

## HTTP API 계약

### Endpoint와 요청

- 함수: `register-early-access`
- 메서드: `POST`; preflight `OPTIONS` 외 다른 메서드는 HTTP 400 `invalid`다.
- Content-Type: `application/json`
- JSON body의 허용 키는 정확히 `projectId`, `email`, `marketingConsent`다. 알 수 없는 키는 `body/unknown_field`로 거부한다.
- 유효 body 타입은 `EarlyAccessRegistrationRequest`다.

```json
{
  "projectId": "ai-communication",
  "email": "learner@example.com",
  "marketingConsent": true
}
```

프론트와 함수는 이메일의 앞뒤 ASCII/Unicode 공백을 제거한 뒤 동일한 predicate를 적용한다. 저장 값은 trim된 문자열이다. 유효 이메일은 길이 254자 이하이며 하나의 `@`, 비어 있지 않은 local/domain, domain의 점(`.`)을 요구하고 공백·제어 문자를 허용하지 않는다. 이메일 대소문자는 변경하지 않는다. 동의 값은 Boolean `true`만 유효하며 문자열 `"true"`는 거부한다.

### 응답과 상태 코드

모든 응답은 JSON이며 body의 `status`가 판별자다. 성공 receipt의 `id`는 UUID 문자열, `createdAt`은 UTC ISO 8601 문자열이다. 응답에 이메일이나 동의 값을 되돌려주지 않는다.

| HTTP | body                                                     | 의미                                                                                                   |
| ---- | -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| 201  | `{ status: "success", registration: { id, createdAt } }` | 새 행 저장 완료. 동일 이메일 여부는 검사하지 않는다.                                                   |
| 400  | `{ status: "invalid", issues: [{ field, code }] }`       | JSON/메서드/키/이메일/동의 계약 위반. `issues` 순서는 body, email, marketingConsent 순으로 안정적이다. |
| 404  | `{ status: "unknown_project" }`                          | `projectId` 누락 또는 닫힌 allowlist 밖의 값.                                                          |
| 429  | `{ status: "rate_limited", retryAfterSeconds }`          | IP 한도 초과. 같은 정수 초를 `Retry-After` 헤더에도 설정한다.                                          |
| 500  | `{ status: "server_error" }`                             | rate-limit 저장소 또는 DB 등 서버 실패. 내부 상세는 노출하지 않는다.                                   |

응답 타입과 상태 매핑의 단일 출처는 각각 `EarlyAccessRegistrationResponse`와 `earlyAccessHttpStatus`다. 현재 공개 testing endpoint의 CORS는 `Access-Control-Allow-Origin: *`이며 별도 origin 설정을 요구하지 않는다. preflight는 rate-limit 횟수에 포함하지 않는다.

## Rate-limit 의미론

1. 배포 플랫폼이 설정한 신뢰 가능한 client-IP 정보에서 한 IP를 정규화한다. 브라우저가 임의 추가한 forwarding header를 직접 신뢰하지 않는다.
2. `OPTIONS`를 제외한 함수의 모든 POST 시도는 project/input 유효성과 무관하게 해당 IP의 횟수에 포함한다.
3. 현재 시각 직전 60초 안의 요청이 5개 미만일 때만 현재 시도를 원자적으로 기록하고 계속 처리한다.
4. 이미 5개이면 현재 시도는 등록 테이블에 저장하지 않는다. `retryAfterSeconds`는 가장 오래된 유효 요청이 window 밖으로 나갈 때까지의 시간을 올림한 1 이상 60 이하 정수다.
5. 함수 인스턴스나 프로젝트가 달라도 같은 IP의 세 프로젝트 요청은 하나의 공통 budget을 공유한다. 테스트는 시간을 주입해 경계 `t+59.999s`와 `t+60s`를 결정적으로 검증한다.

## 테이블 schema와 RLS 계약

세 등록 테이블은 아래 스키마가 완전히 같다.

| column              | PostgreSQL type | null/default/constraint                                |
| ------------------- | --------------- | ------------------------------------------------------ |
| `id`                | `uuid`          | primary key, not null, `default gen_random_uuid()`     |
| `email`             | `text`          | not null, trim 후 비어 있지 않고 길이 254 이하인 check |
| `marketing_consent` | `boolean`       | not null, `check (marketing_consent is true)`          |
| `created_at`        | `timestamptz`   | not null, `default now()`                              |

- 이메일에는 unique index/constraint를 만들지 않는다. 요청마다 새 `id`를 생성한다.
- 세 테이블 모두 RLS를 enable하고 force한다.
- anon/authenticated에 table 또는 sequence 권한을 grant하지 않으며 기존 권한은 revoke한다.
- anon/authenticated 대상 `select`/`insert`/`update`/`delete` policy를 만들지 않는다. service role의 RLS bypass가 함수 쓰기 경계다.
- migration 검증은 각 테이블의 column/default/check/PK, unique-email 부재, RLS enable/force, 역할별 직접 CRUD 실패를 확인한다.

Rate-limit 저장 구조는 구현 세부사항이나, 구현이 선택한 DB 함수 또는 저장소는 위 sliding-window/공유/원자성/fail-closed 계약을 만족하고 클라이언트 역할에 노출되지 않아야 한다.

## 환경변수와 비밀 경계

| 위치                       | 이름                            | 공개 여부     | 계약                                                                                     |
| -------------------------- | ------------------------------- | ------------- | ---------------------------------------------------------------------------------------- |
| `ai-communication` Vite 앱 | `VITE_SUPABASE_URL`             | 브라우저 공개 | Supabase project URL. 누락 시 adapter 구성 실패를 명시적으로 반환한다.                   |
| `ai-communication` Vite 앱 | `VITE_SUPABASE_PUBLISHABLE_KEY` | 브라우저 공개 | publishable/anon client key. 비밀로 취급하지 않지만 로그에는 남기지 않는다.              |
| Edge Function              | `SUPABASE_URL`                  | 서버 전용     | Supabase가 주입하는 project URL.                                                         |
| Edge Function              | `SUPABASE_SERVICE_ROLE_KEY`     | 서버 비밀     | 등록 insert 전용 서버 client 생성에만 사용. 브라우저 변수명 또는 응답에 등장하면 실패다. |

함수 이름, 프로젝트/테이블 매핑, 5회/60초 값은 빌드 계약 상수이며 환경변수로 바꾸지 않는다. testing 단계에는 별도 origin allowlist나 IP hash secret을 설정하지 않는다. rate-limit 식별자는 자동 주입된 서버 secret으로 IP를 HMAC 처리해 만들며 raw IP를 저장하거나 로깅하지 않는다. `verify_jwt=false`는 로그인 없는 공개 사전 등록 호출을 허용하기 위한 설정이고, 함수 자체의 rate limit·strict validation·narrow insert RPC가 쓰기 경계를 담당한다.

## 프론트엔드 port 계약

기존 `EarlyAccessModal`과의 호환 경계는 다음과 같다.

```ts
type SubmitEarlyAccessRegistration = (submission: {
  email: string;
  marketingConsent: boolean;
}) => Promise<void>;
```

- page는 project/Supabase 정보를 알지 않는다. `ai-communication` 조립 지점의 adapter가 `projectId: "ai-communication"`을 고정 주입한다.
- page는 native required/email 검증과 공통 predicate로 제출 전 검증한다. adapter도 Boolean `true`를 확인한 뒤 API를 호출한다.
- adapter는 HTTP 201 + `success` body를 확인한 뒤에만 resolve한다. reject reason은 임의 `Error`나 Supabase SDK 오류가 아니라 `name: "EarlyAccessSubmissionError"`와 아래 식별 가능한 `code`를 가진 `EarlyAccessSubmissionError` 계약 객체다.
- `invalid` 응답 또는 adapter 호출 전 email/consent 실패는 `code: "validation"`과 안정적인 `issues`를 전달한다. HTTP 429는 `code: "rate_limited"`와 `retryAfterSeconds`를 전달한다. fetch가 응답을 얻기 전에 실패하면 `code: "network"`다. `unknown_project`, `server_error`, 비정상 HTTP/body, 환경 설정 누락은 `code: "server"`다.
- page는 reject reason을 `earlyAccessFailureStateByCode`로 매핑한다. `validation`→`validation-error`, `rate_limited`→`rate-limit`, `network`/`server`→`network-error`다. network와 server는 진단 계약에서는 구분하지만, 디자인 계약에 따라 사용자에게는 같은 재시도 UI를 제공한다.
- `validation-error`는 `issues`의 필드 오류를 표시하고 첫 invalid control로 focus를 이동한다. `rate-limit`은 generic network 문구가 아닌 별도 localized 문구를 사용한다. `network-error`와 `rate-limit`은 값을 보존하고 focus를 submit에 유지한다.
- 알 수 없거나 계약을 만족하지 않는 reject reason은 안전하게 `server`로 취급해 `network-error` UI로 귀결하며 미처리 rejection을 만들지 않는다.
- submit pending 동안 중복 UI 제출을 막되, 완료 뒤 같은 이메일의 새 제출은 허용한다.

## test-id 계약

`earlyAccessTestIds`가 아래 안정 값을 소유한다. test-id는 E2E 경계에만 사용하고 스타일 selector로 사용하지 않는다.

| 영역              | 값                                 |
| ----------------- | ---------------------------------- |
| page              | `early-access-page` (기존 값 유지) |
| form              | `early-access-form`                |
| email             | `early-access-email`               |
| marketing consent | `early-access-marketing-consent`   |
| live status       | `early-access-status`              |
| submit            | `early-access-submit`              |

Testing Library 단위 테스트는 가능한 경우 test-id보다 role/name을 우선한다. E2E 및 adapter 통합 테스트는 고정 test-id를 사용할 수 있다.

## 테스트 계약

- contract: project/table mapping의 완전성, status/HTTP mapping, request와 response union, typed submission error와 form-state mapping, rate-limit 상수, 기존 page port assignability를 typecheck한다.
- migration/RLS: 세 동일 schema, email unique 부재, consent check, defaults, anon/authenticated 직접 CRUD 전부 실패, 서버 insert 성공을 검증한다.
- function: 정상 project별 routing, trim 저장, 동일 이메일 두 요청의 서로 다른 id, malformed JSON/extra key/email/consent, unknown project, DB 실패, 민감정보 없는 응답을 검증한다.
- rate limit: 같은 IP 5회 허용/6회 차단, IP 분리, 프로젝트 간 budget 공유, 60초 경계, invalid 요청 포함, `Retry-After`, 동시 요청 시 5건 초과 저장 불가, 저장소 실패의 fail-closed를 검증한다.
- app adapter: `ai-communication` project 주입, 성공 resolve, invalid/rate-limited/network/server의 식별 가능한 reject reason, 비정상 response와 env 누락의 server 매핑, env 누락 시 API 미호출을 검증한다.
- UI: 유효 payload 전달, invalid/미동의 client-side 차단, pending 재제출 차단, 성공 reset, validation field association/focus, rate-limit 전용 문구, network/server 재시도 문구, 오류 시 값 보존, 이후 재시도 성공을 검증한다.

## 병렬 실행 단위

계약 고정 후 다음 작업은 서로 독립적으로 진행할 수 있다.

1. 상태·데이터: migration, RLS, 공유·원자적 rate-limit 저장소 및 Edge Function 구현
2. 구현: provider-neutral adapter와 `ai-communication` 조립/폼 상태 연결
3. 테스트: schema/RLS/function contract와 rate-limit 결정론 테스트
4. 테스트: app adapter/UI 통합 및 브라우저 E2E
5. 운영 설정: 로컬/배포 환경변수 예제와 비밀 누출 검사

## 계약 고정

이 문서, `packages/contracts/src/early-access.ts`의 이름/union/mapping/status/rate-limit/test-id, `EarlyAccessSubmissionError` reject reason, 기존 `SubmitEarlyAccessRegistration` 호출 모양이 u0 고정 계약이다. 변경 시 문서와 TypeScript 계약을 먼저 함께 수정하고 모든 소비 레이어에 전달한다.
