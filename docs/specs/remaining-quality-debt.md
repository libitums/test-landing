# 작업 스펙: 남은 품질 부채 정리

## 목적 (goal)

앞선 작업에서 범위 밖으로 미뤄 둔 항목을 한 번에 닫아, 로컬 품질 게이트가 실제로 통과 가능한 상태가 되고 랜딩 세 개가 폰에서 읽히는 분량으로 줄어들게 한다.

## 배경 — 무엇이 남아 있었나

| #   | 항목                                                                  | 근거                                                                                               |
| --- | --------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| A   | `pnpm e2e`가 81건 실패한다                                            | `origin/main`에서도 같다. CI가 e2e를 돌리지 않아(`.github/workflows/ci.yml` 5–7줄) 드러나지 않았다 |
| B   | `pricing`이 320×568에서 3.6~3.8화면                                   | k-drama 2026px · ai-communication 2148px · k-culture 2088px                                        |
| C   | 12px 미만 텍스트가 앱당 8~18개                                        | 모든 폭에서 같아 기기 크기 문제가 아니다                                                           |
| D   | `apps/k-culture/.env.example`에 Supabase 변수가 없다                  | 사전 등록이 빈 URL로 제출된다. 전환 지표의 분자가 조용히 0이 된다                                  |
| E   | ai-communication의 `hero.eyebrow`·`features.title`이 범용 템플릿 문구 | "A better way to decide" · "A system that makes tradeoffs visible"                                 |
| F   | `DESIGN.md`가 없는 `AGENT.md`를 참조한다                              | 파일이 저장소에 없다                                                                               |

A의 81건은 네 갈래다.

| 원인                                                                | 건수 |
| ------------------------------------------------------------------- | ---: |
| 자체 config를 가진 spec을 기본 config로 돌려 `baseURL`이 없다       |   63 |
| `k-culture-temporary-template`의 기대 title이 문구 개편 전 값이다   |   15 |
| `navbar.spec.ts`의 k-culture `localeCount`가 3에 멈춰 있다 (실제 8) |    1 |
| k-culture에 색 대비 위반 2종                                        |    1 |
| ai-communication 히어로 CTA의 `aria-disabled` 기대                  |    1 |

## 타깃 (target)

- 디바이스와 브라우저 하한은 `docs/specs/mobile-first-measurement-integrity.md`와 같다. 보장 뷰포트는 320×568 · 360×640 · 390×844 · 412×915 · 430×932 · 820×1180.

## 디자인 (design_ref)

DESIGN.md 표준 따름. 벗어남: 없음. B는 히어로에서 이미 쓴 폰 레일을 그대로 적용한다.

## 범위

- 포함(scope_in): 위 표의 A~F 전부. A는 실패 원인별로 나눠 처리하고, B는 요금제 카드를 폰에서 가로 레일로, C는 최소 글자 크기 보장, D는 환경변수 예시 보강, E는 이 페이지가 이미 말하는 내용에서 유도한 문구 교체, F는 참조 정리.
- 제외(scope_out): 새 기능, 새 이벤트, 정보 구조 변경(요금제 항목 자체는 그대로 둔다), 이미 병합된 커밋 메시지 수정, 성능 예산 CI 게이트.

## 수용 기준 (acceptance_criteria)

1. `pnpm e2e`가 0건 실패로 끝난다.
2. 보장 뷰포트 전부에서 `pricing`이 2.5화면 이하다.
3. 보조기술에 노출되는 텍스트가 세 앱 모두 12px 이상으로 렌더링된다. `aria-hidden` 목업 안의 문구는 앱 화면을 그린 그림이라 제외하고, 대비는 axe가 계속 본다. WCAG에 최소 글자 크기 규정은 없으므로 이 기준은 판정 가능한 선까지만 좁혔다.
4. `apps/k-culture/.env.example`이 다른 두 앱과 같은 Supabase 변수를 갖는다.
5. ai-communication의 `hero.eyebrow`와 `features.title`이 여덟 locale 모두에서 이 앱의 실제 제안과 일치한다.
6. `DESIGN.md`에 존재하지 않는 파일 참조가 없다.
7. `pnpm build`·`typecheck`·`lint`·`test`가 통과하고 axe critical/serious 위반이 0건이다.

## 측정 (measurement)

- `pnpm e2e`의 실패 건수. 0으로 유지되는지가 이 작업이 실제로 게이트를 되살렸는지를 말한다.
- 사전 등록 성공률. D를 고친 뒤 k-culture의 `conversion_completed`가 다른 두 앱과 같은 자릿수로 올라오는지 본다.
- `pricing`의 `section_dwelled`. 분량이 줄어든 뒤 체류가 늘어나는지 줄어드는지가 요금제 레일이 맞는 선택이었는지를 말한다.

## 제약 (constraints)

- 시각 값은 `packages/design-tokens`의 CSS 변수에서만 온다.
- 낡은 테스트는 기대값만 현재 계약에 맞추고 검사 자체를 약화하지 않는다.
- 문구 교체는 새 포지셔닝을 만들지 않고 해당 페이지가 이미 말하는 내용에서 유도한다.
