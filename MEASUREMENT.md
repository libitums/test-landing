# MEASUREMENT.md — 랜딩페이지로 무엇을 재는가

세 랜딩페이지는 같은 제품을 세 가지 이야기로 제안한다. 이 문서는 **그래서 무엇을 알고 싶었는지**와, 그 질문을 어떤 신호로 답하기로 했는지를 적는다. 이벤트의 타입 정의는 [`packages/contracts/src/analytics.ts`](packages/contracts/src/analytics.ts)가, 고정 계약과 수용 기준은 [`docs/specs/analytics-measurement-phase-1.md`](docs/specs/analytics-measurement-phase-1.md)가 단일 출처다. 이 문서는 그 위에 **의도**를 얹는다.

## 다섯 개의 질문

| #   | 알고 싶은 것                                    | 답을 주는 신호                                                                       |
| --- | ----------------------------------------------- | ------------------------------------------------------------------------------------ |
| Q1  | 세 이야기 중 **어느 것이 사전 등록을 만드는가** | `experiment_viewed` → `conversion_completed`의 비율, `variantId`별                   |
| Q2  | 떠나는 사람은 **어디까지 보고 떠나는가**        | `section_viewed` · `section_dwelled` · `scroll_depth_reached` · `page_exited`        |
| Q3  | 폼까지 온 사람은 **왜 못 끝내는가**             | `form_opened` → `form_started` → `form_submitted` → `form_failed` / `form_abandoned` |
| Q4  | **어떤 기능 약속**이 사람을 움직이는가          | `feature_cta_clicked`의 `featureId`, 그리고 그 CTA로 열린 폼의 `sourceId`            |
| Q5  | **누가** 오는가                                 | 모든 이벤트에 붙는 `locale`과 `countryHint`                                          |

Q1이 이 저장소의 존재 이유고, Q2–Q4는 **Q1이 "졌다"고 말할 때 왜 졌는지**를 알기 위해 있다. 전환율 하나만으로는 카피가 약한 것인지, 사람들이 폼까지 오지도 못한 것인지, 폼에서 막힌 것인지 구분할 수 없다.

## 모든 이벤트가 함께 지고 다니는 것

열세 개 이벤트 전부가 같은 여섯 개 맥락을 달고 나간다. 이것이 있어야 비교가 성립한다.

| 필드           | 값                                                            | 왜                                                                        |
| -------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------- |
| `projectId`    | `k-drama` · `ai-communication` · `k-culture`                  | 어느 페이지인가                                                           |
| `experimentId` | `landing-phase-2`                                             | 어느 실험 회차인가. `landing-phase-1`은 아래 계측 결손이 섞여 있어 닫았다 |
| `variantId`    | `k-drama-v1` · `ai-communication-v1` · `k-culture-v1`         | 어느 이야기인가                                                           |
| `locale`       | 여덟 locale 중 현재 것                                        | 문구가 번역돼도 성과가 유지되는가                                         |
| `pageId`       | `home`                                                        | 페이지가 늘어나도 이벤트가 섞이지 않게                                    |
| `countryHint`  | 허용 목록(`KR`·`US`)을 통과한 `utm_country`, 아니면 `unknown` | 어느 나라에서 왔는가 — 정확한 위치가 아니라 **캠페인이 붙여 준 힌트**다   |

## 이벤트 열세 개

이름은 모두 과거형이다. GA4가 자동으로 수집하는 `scroll`·`form_start`·`form_submit`과 부딪히지 않게 하기 위해서다.

### 도달과 행동

| 이벤트                 | 언제                            | 추가 속성   | 답하는 질문 |
| ---------------------- | ------------------------------- | ----------- | ----------- |
| `experiment_viewed`    | 페이지가 뜰 때 (생명주기당 1회) | —           | Q1의 분모   |
| `cta_clicked`          | 사전 등록 폼을 여는 모든 CTA    | —           | Q1          |
| `feature_cta_clicked`  | 기능 섹션의 CTA                 | `featureId` | Q4          |
| `conversion_completed` | 사전 등록 성공                  | —           | Q1의 분자   |

기능 CTA는 `feature_cta_clicked`와 `cta_clicked`를 **둘 다** 낸다. 앞의 것은 어느 기능이 끌었는지를, 뒤의 것은 전체 CTA 총량을 센다.

### 어디까지 읽었는가

| 이벤트                 | 언제                                                                                        | 추가 속성                                          |
| ---------------------- | ------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| `section_viewed`       | 섹션 면적의 **절반 이상**이 보이거나 섹션이 **뷰포트의 절반 이상**을 차지할 때 (섹션당 1회) | `sectionId`                                        |
| `section_dwelled`      | 페이지를 떠날 때, 섹션별 누적 체류 시간                                                     | `sectionId` · `dwellMs`                            |
| `scroll_depth_reached` | 25 · 50 · 75 · 90% 지점을 처음 지날 때                                                      | `scrollPercent`                                    |
| `page_exited`          | 탭이 숨겨지거나 페이지가 사라질 때 (1회)                                                    | `lastSectionId` · `maxScrollPercent` · `engagedMs` |

섹션 id는 고정 섹션 넷(`hero` · `proof` · `cta` · `pricing`)과 기능 섹션(`feature:<id>`)이다. 기능 섹션 id는 DOM의 `data-testid`에서 유도해 `feature_cta_clicked`의 `featureId`와 같은 이름을 쓴다 — **본 것과 누른 것을 같은 키로 이어 보려고** 그렇게 했다.

`engagedMs`는 탭이 보이는 동안만 쌓인다. 열어 두고 다른 일을 한 시간은 읽은 시간이 아니다.

**발화 조건이 두 갈래인 이유가 있다.** 처음에는 "섹션 면적의 절반"만 봤다. 그 비율은 `교차면적 ÷ 섹션면적`이라, 섹션이 뷰포트보다 두 배 이상 높으면 천장이 0.5 아래로 내려가 아무리 오래 읽어도 발화하지 않는다. 2026-09-03 측정에서 세 앱의 `pricing`이 실제 기기 폭 전부에서 한 번도 발화하지 않았고, 트래픽의 99%가 모바일이라 요금제 섹션은 사실상 아무도 안 본 것으로 기록되고 있었다. 뷰포트 쪽에서 같은 질문을 하는 두 번째 갈래에는 그 천장이 없다. 판정은 `packages/analytics/src/section-visibility.ts`의 순수 함수 하나에 있고 단위 테스트가 경계값을 지킨다. 경위는 [`docs/specs/mobile-first-measurement-integrity.md`](docs/specs/mobile-first-measurement-integrity.md)에 있다.

### 폼에서 무슨 일이 있었는가

| 이벤트           | 언제                      | 추가 속성                                                                     |
| ---------------- | ------------------------- | ----------------------------------------------------------------------------- |
| `form_opened`    | 폼이 열릴 때              | `formId` · `sourceId` (`hero` · `final-cta` · `feature:<id>`)                 |
| `form_started`   | 첫 필드를 건드릴 때 (1회) | `formId` · `fieldId`                                                          |
| `form_submitted` | 제출을 누를 때            | `formId`                                                                      |
| `form_failed`    | 제출이 실패할 때          | `formId` · `errorCode` (`validation` · `rate_limited` · `network` · `server`) |
| `form_abandoned` | 성공 없이 폼이 닫힐 때    | `formId` · `lastFieldId`                                                      |

`sourceId`가 있어서 "어느 CTA로 연 폼이 끝까지 갔는가"를 볼 수 있다. `lastFieldId`는 **어느 칸에서 손을 뗐는지**를 남긴다.

## 방문자 한 명이 남기는 자취

```text
페이지 도달 ─ experiment_viewed
     │
     ├─ 스크롤 ─ section_viewed ×N · scroll_depth_reached (25·50·75·90)
     │
     ├─ CTA 클릭 ─ cta_clicked  (+ 기능 CTA면 feature_cta_clicked)
     │       │
     │       └─ form_opened ─ form_started ─ form_submitted ─┬─ conversion_completed  ✅
     │                  │                            └─ form_failed(errorCode)
     │                  └─ form_abandoned(lastFieldId)
     │
     └─ 이탈 ─ section_dwelled ×N · page_exited(lastSectionId, maxScrollPercent, engagedMs)
```

## 재지 않기로 한 것

무엇을 재는가만큼 **무엇을 안 재기로 했는가**가 이 설계를 결정했다.

- **계약에 없는 키는 전부 거부한다.** PII인지 따지는 게 아니라 스키마에 선언되지 않았으면 보내지 않는다. 개인정보 판단을 사람의 주의력에 맡기지 않기 위해서다.
- **원본 query와 전체 URL은 수집하지 않는다.** URL에서 꺼내 쓰는 것은 `utm_country` 하나, 그것도 허용 목록을 통과한 두 글자 코드만 남고 나머지는 `unknown`이 된다.
- **동의가 없으면 버린다.** 큐에 쌓아 두었다가 나중에 보내지 않는다. 나중에 동의해도 그 전 이벤트는 사라진 채로 둔다.
- **IP 등으로 위치를 판정하지 않는다.** `countryHint`는 힌트일 뿐이고 동의 판정에 쓰이지 않는다.
- **노출은 한 번만 센다.** `experiment_viewed`와 `section_viewed`는 페이지 생명주기당 1회다. 리렌더가 분모를 부풀리지 못한다.
- **광고 픽셀에는 세 개만 보낸다.** 나머지 참여 신호는 GA4에 남는다 — 픽셀에 이벤트를 더 넣을수록 광고 모델이 좋아지는 게 아니라 희석된다.
- **분석은 페이지를 막지 못한다.** 검증 실패도, adapter 실패도 렌더링과 링크 이동을 멈추지 않는다.

## 어디에 쌓이는가

| 목적지            | 무엇이                                                                                                        | 식별자                                                                     |
| ----------------- | ------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| GA4 앱별 property | 열세 개 이벤트 전부                                                                                           | k-drama `546985970` · ai-communication `547067207` · k-culture `547070568` |
| GA4 롤업 property | 같은 이벤트를 한 곳에 모아 세 페이지를 나란히 비교                                                            | `546995023`                                                                |
| Meta pixel        | `feature_cta_clicked`→`ViewContent` · `form_submitted`→`Lead` · `conversion_completed`→`CompleteRegistration` | 환경변수가 비어 있으면 픽셀은 꺼진다                                       |
| Supabase          | 사전 등록 원본 — 프로젝트별 테이블, RLS로 직접 접근 차단                                                      | `docs/specs/supabase-early-access-foundation.md`                           |

Consent mode v2 기본값은 `analytics_storage: granted`, 광고 관련 셋(`ad_storage` · `ad_user_data` · `ad_personalization`)은 모두 `denied`다. 광고 기능을 쓰지 않기 때문이다.

내 브라우저를 통계에서 빼려면 `?ga_internal=1`로 한 번 들어간다. 그 기기는 계속 제외되고, `?ga_internal=0`으로 되돌린다. IP 규칙은 모바일 네트워크와 VPN을 놓친다.

## 아직 정하지 않은 것

기록해 두지 않으면 나중에 "그때 왜 이렇게 읽었더라"가 된다.

- **판정 기준이 없다.** 어느 정도 차이를 "이겼다"고 볼 것인지, 표본이 얼마나 쌓여야 보는지, 언제 끊을 것인지를 정하지 않았다.
- **무작위 배분이 아니다.** 세 페이지는 각각 다른 배포와 URL이고 `variantId`가 앱에 고정돼 있다. 방문자가 무작위로 나뉘지 않으므로, **유입 경로가 다르면 전환율 차이는 이야기의 차이가 아니라 트래픽의 차이다.** 비교하려면 같은 조건으로 세 URL에 트래픽을 보내야 한다.
- **동의 UI가 없다.** 지금은 측정 동의를 `granted`로 두고 KR·US를 전제한다. 대상 국가가 늘면 이 전제부터 다시 봐야 한다.
- **`countryHint`는 링크에 달려 있다.** 캠페인 링크에 `utm_country`를 붙이지 않으면 전부 `unknown`이다.
- **성능은 아직 기준선뿐이다.** 예산 초과를 막는 CI 게이트와 운영 RUM은 `PLAN.md` 6단계의 미완료 범위다.
