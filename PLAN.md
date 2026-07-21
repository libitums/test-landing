# Landing Experiment Roadmap

현재 모노레포 구축 이후의 확장 계획이다. 각 단계는 앞 단계의 exit criteria를 만족한 뒤 진행한다. 일정이 아니라 검증 가능한 역량을 기준으로 단계를 닫는다.

## 1. 분석 연동과 실험 측정 — 완료

상태: **완료 (2026-07-21 검증)**

공통 CTA 경계에 공급자 독립적인 이벤트 계약을 추가하고, 사용자 동의와 지역별 개인정보 요구를 지키면서 실험 노출·행동·전환을 측정한다.

작업:

- `experiment_viewed`, `cta_clicked`, `conversion_completed` 이벤트 이름과 필수 속성의 버전 계약 정의
- 분석 SDK를 앱 UI에서 분리하는 adapter와 테스트용 no-op/in-memory adapter 제공
- 실험 ID, variant ID, locale, page ID를 공통 context로 주입
- 동의 전 이벤트 차단, 수집 거부, 중복 노출 방지, 전송 실패 처리 정의
- 개발/프리뷰/운영 환경의 데이터 분리와 PII 금지 검증

Exit criteria:

- 이벤트 스키마의 런타임 검증과 contract test가 통과한다.
- `k-drama`, `ai-communication`, `k-culture`에서 노출 1회와 CTA 클릭 1회가 올바른 experiment/variant ID로 테스트 adapter에 기록된다.
- 동의 거부 시 외부 분석 요청이 0건임을 자동 테스트로 확인한다.
- 이벤트 payload에 이메일, 전화번호, 전체 URL query 등 금지된 PII가 없음을 테스트한다.
- 분석 장애가 링크 이동과 페이지 렌더링을 막지 않음을 테스트한다.

검증 기록 (2026-07-21):

- `pnpm typecheck`: 통과. `@landing/contracts`, `@landing/analytics`와 세 프로젝트의 분석 계약 소비 경계를 포함한다.
- `pnpm test`: 통과. `@landing/analytics`의 contract/unit/integration 테스트 73개가 이벤트 strict allowlist, consent 차단과 non-replay, 노출 중복 방지, PII·원본 query 거부, adapter 실패 격리를 검증한다.
- 세 프로젝트 앱 테스트가 공통 분석 context의 `projectId`, `experimentId`, `variantId`, `locale`, `pageId`와 CTA 기본 링크 동작 보존을 검증한다.
- 고정 계약과 상세 수용 기준은 `docs/specs/analytics-measurement-phase-1.md`를 따른다.

## 2. 국제화와 현지화 — 완료

상태: **완료 (2026-07-21 검증)**

문자열, 숫자, 날짜, 방향성을 locale 데이터로 분리하고 국가별 카피·법적 고지를 앱 구조 변경 없이 제공한다.

작업:

- 지원 locale 목록, 기본 locale, fallback 정책과 URL 전략 고정
- 공통 계약의 정적 콘텐츠를 locale resource로 이전
- `Intl` 기반 숫자/날짜 형식과 RTL 레이아웃 지원
- 번역 누락·키 드리프트 검출 및 pseudo-locale 도입
- locale별 메타데이터, hreflang, canonical과 폰트 fallback 구성

Exit criteria:

- 기준 locale 2개 이상과 RTL locale 1개가 `k-drama`, `ai-communication`, `k-culture` 모두에서 빌드된다.
- CI에서 누락 키, 불필요 키, 기본 locale fallback 발생이 0건이다.
- pseudo-locale E2E에서 잘림으로 핵심 CTA가 가려지는 사례가 0건이다.
- 각 locale 문서의 `lang`/`dir`, canonical, hreflang이 자동 검사와 일치한다.
- 현지화된 숫자와 날짜의 단위 테스트가 지원 locale 전체에서 통과한다.

검증 기록 (2026-07-21):

- `pnpm build`: 통과. 세 프로젝트 모두 `ko-KR`, `en-US`, RTL `ar` locale 리소스와 메타데이터를 포함한 production build를 생성한다.
- `pnpm typecheck`, `pnpm lint`: 통과.
- `pnpm test`: 통과. `@landing/i18n` 테스트 17개와 프로젝트별 테스트 9개씩이 locale registry, 번역 키 정합성, fallback 부재, URL 보존, `Intl` 숫자·날짜 형식을 검증한다.
- `pnpm --filter @landing/e2e exec playwright test --config playwright.config.ts localization.spec.ts`: Chromium, Firefox, WebKit, Mobile Chromium에서 **60 passed, 24 skipped**로 통과했다. 세 프로젝트의 `lang`/`dir`, canonical/hreflang, locale 전환, RTL, pseudo-locale 잘림·가로 overflow, CTA 가시성·포커스, axe critical/serious 위반 부재와 reduced-motion을 검증한다.
- 24건의 skip은 의도된 브라우저/viewport 제한이다. 앱별 desktop snapshot은 Chromium 한 곳만 기준으로 두어 9건, pseudo-locale 시각 검증은 Chromium desktop/mobile만 실행해 6건, reduced-motion computed-style 검증은 Chromium 한 곳만 실행해 9건을 제외한다. 기능 미구현이나 실패에 따른 skip은 없다.
- 고정 계약과 상세 수용 기준은 `docs/specs/internationalization-phase-2.md`와 `docs/design/localization-phase-2.md`를 따른다.

## 3. 프로젝트 디자인 원본과 구현 정합화 — 부분 완료

상태: **부분 완료 (2026-07-21 검증)**

세 프로젝트의 시각 원본을 개별 `.pen` 파일로 관리하고, 반복되는 시각 언어는 공통 디자인 시스템에 반영한 뒤 각 프로젝트의 고유 디자인을 실제 앱에 적용한다. 이 단계를 먼저 닫아 이후 generator가 임시 UI나 오래된 공통 스타일을 복제하지 않게 한다.

작업:

- 원본이 제공된 `k-drama`, `ai-communication`의 `.pen`을 각 앱 루트에 추가하고 파일 위치, naming, owner, 버전 관리 규칙을 고정한다. `.pen`이 없는 `k-culture`는 `neutral` fallback을 명시한다.
- 각 `.pen`에서 공통 요소와 프로젝트 전용 요소를 구분하고 디자인 원본과 코드 컴포넌트의 매핑 문서 작성
- 세 프로젝트에서 반복되는 색상, 타이포그래피, 간격, 형태, 레이아웃, 상태를 `DESIGN.md`와 `packages/design-tokens`의 semantic token으로 반영
- 공통 컴포넌트 변경은 `packages/ui`에 적용하고, 프로젝트 고유 섹션과 표현은 각 `apps/<project>/src/features/` 경계에 유지
- 공통 디자인 변경을 세 프로젝트에 적용한 뒤 각 `.pen`을 기준으로 프로젝트별 레이아웃, 콘텐츠 위계와 전용 UI 구현
- 데스크톱·모바일, LTR·RTL, pseudo-locale에서 디자인 회귀와 접근성을 검증하고 기준 snapshot 갱신

Exit criteria:

- 디자인 원본이 제공된 `k-drama`, `ai-communication`에는 각각 대응하는 `.pen` 파일이 존재하고 프로젝트 ID와 코드 경계의 매핑을 추적할 수 있다. `.pen`이 없는 `k-culture`는 `neutral` fallback과 공통 계약을 문서화한다.
- `.pen`에서 확인된 공통 시각 값이 `DESIGN.md`와 semantic token으로 정의되며 앱 CSS에 중복된 색상, 길이, 시간 생값을 추가하지 않는다.
- 공통 UI 변경이 `packages/ui`에 반영되고 프로젝트 전용 UI가 다른 앱 또는 공통 패키지에 누출되지 않는다.
- `k-drama`, `ai-communication`은 각자의 `.pen` 디자인과, `k-culture`는 승인된 `neutral` 기준과 지정 viewport snapshot에서 허용 오차 안으로 일치한다.
- 세 프로젝트의 locale 콘텐츠가 데스크톱·모바일과 LTR·RTL에서 잘리거나 핵심 CTA를 가리지 않고, axe critical/serious 위반이 0건이다.
- `pnpm build`, `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm e2e`가 모두 통과하고 변경된 snapshot의 승인 근거가 남는다.
- 디자인 원본, 공통 토큰, 공통 UI와 프로젝트별 구현이 정합하다는 review 판정 후 Phase 4로 진행한다.

## 4. 실험 카탈로그와 생성 자동화

실험 메타데이터를 검색 가능한 카탈로그로 관리하고, 새 앱/variant의 반복 파일을 generator로 만든다.

작업:

- owner, status, hypothesis, audience, locale, start/end, app 경로를 포함한 실험 manifest 정의
- 이름 충돌과 필수 메타데이터를 검증하는 CLI 제공
- 공통 config, 테스트, 콘텐츠 골격을 생성하는 pnpm generator 추가
- 종료·보관된 실험의 삭제/보존 정책 수립

Exit criteria:

- 단일 명령으로 새 실험 workspace가 생성되고 추가 수작업 없이 루트 build/typecheck/lint/test를 통과한다.
- 중복 ID와 누락 owner/status를 CI가 실패 처리한다.
- 카탈로그가 모든 `apps/` workspace를 포함하며 orphan 앱과 orphan manifest가 0건이다.
- 생성 결과에 앱 전용 `features/` 경계와 공통 UI 소비 테스트가 포함된다.

## 5. 배포와 프리뷰

변경된 앱별 독립 프리뷰와 승인된 운영 배포를 자동화한다.

작업:

- 앱별 immutable preview URL, 환경 변수 스키마, secrets 경계 정의
- 변경 workspace만 빌드하는 CI 캐시와 배포 파이프라인 구성
- PR preview 링크, smoke test, 승인 기반 production promotion 추가
- CDN cache, rollback, locale/experiment routing 전략 확정

Exit criteria:

- 각 PR에서 변경된 랜딩 앱에 고유 preview URL이 생성되고 PR에 노출된다.
- preview smoke test가 HTTP 200, 핵심 landmark, 정적 asset 로드를 확인한다.
- 동일 commit artifact가 승인 후 운영으로 승격되며 재빌드하지 않는다.
- 이전 정상 release로의 rollback을 10분 이내 수행하는 리허설 기록이 있다.
- secrets가 클라이언트 bundle과 CI log에 포함되지 않음을 자동 검사한다.

## 6. 성능 예산

국가별 네트워크와 중저가 모바일 기기를 고려한 성능 예산을 CI 게이트로 만든다.

초기 예산:

- 앱 초기 JavaScript gzip 150 KiB 이하
- route 초기 CSS gzip 50 KiB 이하
- 대표 모바일 프로필 p75 목표: LCP 2.5초 이하, INP 200ms 이하, CLS 0.1 이하
- Hero 이미지 200 KiB 이하, 비 Hero 이미지 120 KiB 이하

Exit criteria:

- 세 프로젝트의 production build에서 JS/CSS 예산을 검사하며 초과 시 CI가 실패한다.
- 고정된 모바일 throttling 프로필로 각 앱을 3회 측정한 중앙값이 실험실 성능 기준을 통과한다.
- 운영 RUM에서 국가/기기군별 Core Web Vitals p75를 조회할 수 있다.
- 예산 예외는 owner, 만료일, 수치 근거가 있는 승인 파일 없이는 병합할 수 없다.

현재 측정 기준선 (2026-07-21, `pnpm build`):

| 프로젝트           | JavaScript | JavaScript gzip |       CSS | CSS gzip |
| ------------------ | ---------: | --------------: | --------: | -------: |
| `k-drama`          | 306.65 KiB |       98.98 KiB | 16.51 KiB | 3.53 KiB |
| `ai-communication` | 308.83 KiB |       99.43 KiB | 16.75 KiB | 3.59 KiB |
| `k-culture`        | 306.66 KiB |       98.78 KiB | 16.51 KiB | 3.53 KiB |

현재 세 프로젝트 모두 초기 JS gzip 150 KiB 및 CSS gzip 50 KiB 예산 안이다. 이 기록은 수동 기준선이며, 예산 초과를 실패시키는 CI 게이트와 실험실 성능·RUM 검증은 Phase 6의 미완료 범위다.

## 7. 브라우저 매트릭스

지원 정책을 실제 자동화 브라우저와 기기 검증에 연결한다.

기준 정책: `> 0.5%, last 2 versions, Firefox ESR, not dead`, Safari/iOS Safari 15 이상, Android Chrome 109 이상. IE와 Opera Mini는 제외한다.

Exit criteria:

- CI가 최신 Chromium, Firefox, WebKit에서 세 프로젝트의 smoke/E2E를 통과한다.
- Safari/iOS Safari 15와 Android Chrome 109 기준의 호환성 점검 목록 및 실제 기기 또는 클라우드 기기 실행 기록이 release마다 남는다.
- Browserslist 결과, Vite target, polyfill 목록의 불일치를 검사하는 테스트가 통과한다.
- 지원 대상에서 핵심 탐색, CTA, 반응형 레이아웃의 차단 결함이 0건이다.

## 8. 시각·E2E·접근성 품질 게이트 — 부분 완료

상태: **부분 완료 (2026-07-21 검증)**

기능 단위 테스트를 넘어 사용자 흐름과 시각 회귀, WCAG 접근성을 필수 병합 게이트로 만든다.

작업:

- 데스크톱·모바일 viewport의 deterministic 시각 snapshot
- Hero CTA부터 목적지까지의 앱별 핵심 E2E
- axe 자동 검사와 키보드·스크린리더 수동 체크리스트
- flaky test 격리, 재시도 정책, snapshot 승인 소유권 정의

Exit criteria:

- `k-drama`, `ai-communication`, `k-culture`의 지정 데스크톱·모바일 snapshot이 승인 기준과 일치한다.
- 각 앱의 핵심 CTA E2E가 Chromium, Firefox, WebKit에서 통과한다.
- axe의 critical/serious 위반이 0건이고 색 대비가 WCAG AA를 충족한다.
- 키보드만으로 모든 상호작용에 접근 가능하며 focus 순서·표시 수동 점검이 release checklist에 기록된다.
- 20회 반복 실행에서 flaky 실패가 0건이거나 owner와 만료일이 있는 quarantine 항목으로 추적된다.

현재 완료된 범위:

- 세 프로젝트의 deterministic Chromium desktop snapshot과 Chromium desktop/mobile pseudo-locale snapshot을 저장했다.
- Chromium, Firefox, WebKit, Mobile Chromium에서 locale·RTL·CTA 가시성·semantic focus order E2E가 통과한다.
- 공통 Navbar의 데스크톱 그룹, 모바일 Try 비노출, 언어 DropdownMenu와 Sheet 키보드 동작을 검증한다.
- 공통 Footer의 FAQ Accordion, 프로젝트별 콘텐츠, RTL, reduced-motion과 모바일 overflow를 검증한다.
- pseudo-locale에서 axe critical/serious 위반 0건, 포커스 표시, CTA 접근 가능성, 가로 overflow 부재를 자동 검증한다.
- `prefers-reduced-motion` 적용을 Chromium computed style로 자동 검증한다.
- `pnpm e2e` 결과는 **79 passed, 81 intentionally skipped, 0 failed**다.
- 81건의 skip은 의도된 browser/viewport 제한이다. localization 24건은 Phase 2의 deterministic snapshot·pseudo-locale·reduced-motion 제한이며, Navbar 21건은 desktop Chromium·mobile Chromium·cross-app 단일 실행 제한, Footer 36건은 desktop Chromium·mobile Chromium·cross-app/RTL/reduced-motion 단일 실행 제한이다. 기능 미구현이나 실패에 따른 skip은 없다.

남은 범위:

- Hero CTA부터 실제 목적지까지의 프로젝트별 핵심 전환 흐름 E2E
- 스크린리더 및 키보드 수동 release checklist와 실행 기록
- 전체 색 대비 WCAG AA 측정 기록
- snapshot 승인 소유권, 갱신 절차와 flaky quarantine 정책
- 동일 조건 20회 반복 실행을 통한 flaky 검증

## 운영 원칙

- 각 단계의 계약과 테스트를 먼저 고정한 뒤 구현한다.
- 공통 패키지는 세 프로젝트에서 검증된 반복만 흡수하고 실험 전용 UI를 성급히 일반화하지 않는다.
- 품질 예외는 측정값, owner, 만료일을 남기며 무기한 예외를 허용하지 않는다.
- 브라우저 점유율, 개인정보 규정, Core Web Vitals 기준은 분기마다 재검토한다.
