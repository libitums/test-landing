# 작업 스펙: k-drama early access 폼 (모달 + route 페이지)

## 목적 (goal)

k-drama 방문자가 CTA를 눌러 페이지를 떠나지 않고 그 자리에서 얼리 액세스
이메일을 등록할 수 있게 한다. ai-communication이 이미 가진 것과 동일한
경험을 k-drama에도 제공한다.

## 타깃 (target)

- 디바이스: 데스크톱·모바일 둘 다
- 브라우저 하한: 루트 browserslist (Safari/iOS 15, Android Chrome 109, 최신
  Chromium·Firefox·WebKit)

## 디자인 (design_ref)

DESIGN.md 표준 따름. 벗어남: 없음. early-access 시각 표현은
`apps/k-drama/src/styles.css`의 앱 경계에 두고, 색·길이·시간은 토큰에서 온다
(생값 금지 — 이 앱은 이미 생값 0건이다).

## 범위

- 포함(scope_in):
  - `apps/k-drama/src/app/KDramaEarlyAccessPage.tsx` — ai-communication의
    `EarlyAccessPage.tsx`와 동일한 계약(`overlay` prop으로 route 페이지 / 오버레이
    모달 겸용, Escape·backdrop 닫기, `role="dialog"`·`aria-modal`). 공유
    `packages/ui`의 `Input`·`Checkbox`·`baetterLogo`를 소비한다.
  - `apps/k-drama/src/app/App.tsx` — 모달 state(`isEarlyAccessOpen`) + `/k-drama/early-access`
    링크 클릭·Enter 인터셉트(`onClickCapture`/`onKeyDownCapture`) 배선. Hero CTA와
    feature CTA가 모두 모달을 연다.
  - `apps/k-drama/src/main.tsx` — `/<locale>/k-drama/early-access` 직접 접근 시
    `KDramaEarlyAccessPage`를 route 페이지로 렌더(JS 없이도 동작, SEO).
  - `apps/k-drama/src/resources.ts` — `earlyAccess.*` 키(아래 19개) 전체를 **8개
    로케일 모두**에 추가. 문구는 k-drama 서사(K-드라마 섀도잉)에 맞춘다 —
    ai-communication의 voice/persona 문구를 그대로 복사하지 않는다.
  - `apps/k-drama/src/styles.css` — early-access 스타일(앱 경계, 토큰만).
  - 테스트: `KDramaEarlyAccessPage.test.tsx`(폼 접근성·로케일 route 보존·제출
    상태), `App.test.tsx`에 모달 오픈/닫기 배선 케이스.
- 제외(scope_out):
  - 실제 백엔드 제출 연동(`submitRegistration`은 optional prop, 미주입 시
    "integration pending" 상태만 — ai-communication과 동일).
  - `apps/ai-communication`, `apps/k-culture` 수정.
  - `packages/ui`, `packages/contracts` 공개 API 변경(`Input`/`Checkbox`는 이미
    export됨, 그대로 소비만).
  - e2e 신규 플로우 작성(별도 후속). 단 기존 e2e가 깨지지 않아야 한다.

## earlyAccess 리소스 키 (19개, 8 로케일 전부 필요)

`earlyAccess.back` · `.close` · `.dismiss` · `.eyebrow` · `.title` ·
`.description` · `.benefit.invite` · `.benefit.voice` · `.benefit.feedback` ·
`.form.title` · `.form.description` · `.form.email` · `.form.consent` ·
`.form.submit` · `.form.submitting` · `.form.privacy` ·
`.form.integrationPending` · `.form.success` · `.form.error`

주의: `benefit.voice`는 ai-communication에서 "Voice, text, role-play, and persona
practice"다. k-drama에는 맞지 않으므로 K-드라마/섀도잉 맥락으로 재작성한다
(예: 자막·클립·섀도잉 관련 혜택). 키 이름은 유지하되 값만 k-drama 문구로.

## 수용 기준 (acceptance_criteria)

1. `/k-drama/early-access` URL 직접 접근 시 `KDramaEarlyAccessPage`가 route
   페이지(비오버레이)로 렌더되고 이메일·동의 폼과 홈 복귀 링크가 보인다.
2. Hero CTA와 feature "Get early access" CTA 클릭 시 페이지 이동 없이 오버레이
   모달이 열리고, Escape 또는 backdrop 클릭으로 닫힌다. 모달은 `role="dialog"`와
   `aria-modal="true"`를 갖는다.
3. `earlyAccess.*` 19개 키가 8개 로케일 모두에 존재하고 i18n 키 정합성 테스트가
   통과한다(누락/드리프트 0).
4. `apps/k-drama/src/styles.css`에 새 색상·길이·시간 생값 선언이 0건이다.
5. `pnpm typecheck`, `pnpm lint`, `pnpm test`가 통과하고, k-drama 기존 e2e가
   회귀 없이 통과한다(pseudo-locale·navbar 스냅샷 포함, 필요 시 근거와 함께 갱신).
6. axe critical/serious 위반 0건 — 모달 오픈 시 포커스가 폼으로 이동하고 키보드로
   닫을 수 있다.

## 제약 (constraints)

- 성능 예산: JS gzip ≤ 150 KiB, CSS gzip ≤ 50 KiB.
- 접근성: WCAG AA, `--focus-ring` 포커스 표시, `prefers-reduced-motion` 존중,
  모달 포커스 트랩/복귀.
- 스택: React 19 + Vite + vitest + Playwright. 공유 `Input`/`Checkbox` 소비.

## 시각 레퍼런스 (visual_reference)

`apps/ai-communication/src/app/EarlyAccessPage.tsx`와 그 CSS(`styles.css`의
`.early-access*` 규칙 + `packages/ui/src/styles/ui.css`)가 참조 구현이다. 구조는
동일하게, 문구·브랜드 맥락은 k-drama로.

## 우선순위 / 데이터 (선택)

- priority: 참조 구현과의 동작 동일성 우선. 새 UX를 발명하지 않는다.
- data_state: 실제 API 없음. `submitRegistration` 미주입 시 pending 안내만.

## 비고

- 신규 로케일 문구(ja/vi/th/zh-CN/zh-TW)와 ko/ar은 기계 보조 번역이라 원어민
  검토 대상 — PR에 명시한다.
