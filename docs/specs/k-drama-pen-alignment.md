# 작업 스펙: k-drama 디자인 원본 정합 검증과 매핑 문서화

## 목적 (goal)

k-drama 사용자가 보는 화면이 `apps/k-drama/k-drama.pen` 원본과 어긋나지 않음을
검증 가능한 형태로 확정하고, 이후 작업자가 원본 노드와 코드 경계를 추적할 수
있게 한다. PLAN.md Phase 3를 k-drama에 한해 닫는 경로다.

## 타깃 (target)

- 디바이스: 데스크톱과 모바일 둘 다 (`--breakpoint-mobile` 경계 기준)
- 브라우저 하한: 루트 `package.json`의 browserslist —
  Safari/iOS 15, Android Chrome 109, 최신 Chromium·Firefox·WebKit

## 디자인 (design_ref)

DESIGN.md 표준 따름. 벗어남: k-drama.pen 기준의 앱 전용 시각 표현은
`apps/k-drama/src/features/` 경계에 유지하며 공통 패키지로 승격하지 않는다.

## 범위

- 포함(scope_in):
  - `k-drama.pen` 원본과 현재 구현의 섹션별 diff 추출
  - diff에서 확인된 시각 불일치 보정 (토큰 사용, 생값 금지)
  - `.pen` 노드 ↔ 코드 경계 매핑 문서 작성 (의도적 deviation 목록 포함)
  - **`apps/k-drama/src/styles.css`의 색상 생값 184건 토큰화** (아래 참조)
  - k-drama axe `color-contrast` serious 위반 해소
  - `KDramaShortformFeature` 루트의 `aria-hidden` 불일치 수정
  - 미사용 `apps/k-drama/src/app/LocaleNavigation.tsx` 삭제
  - 데스크톱·모바일 × LTR·RTL × pseudo-locale 시각 회귀와 axe 재검증
  - 변경된 snapshot의 갱신 근거 기록
- 제외(scope_out):
  - `k-culture` (디자인 변경 예정이라 별도 작업으로 분리)
  - `ai-communication`
  - PLAN Phase 4 실험 카탈로그·generator
  - Hero CTA→목적지 전환 흐름 E2E 신규 작성 (Phase 8 잔여로 남김)
  - 공통 패키지(`packages/ui`, `packages/contracts`)의 공개 API 변경

## 수용 기준 (acceptance_criteria)

1. `.pen`의 최상위 섹션 노드가 모두 코드 경계에 매핑되고, 미매핑 항목이 0건
   이거나 의도적 deviation으로 명시된 매핑 문서가 `docs/design/`에 존재한다.
2. k-drama 앱 CSS와 컴포넌트에 새로 추가된 색상·길이·시간 생값이 0건이며
   모든 시각 값이 `packages/design-tokens` 토큰에서 온다.
3. `pnpm build`, `pnpm typecheck`, `pnpm lint`, `pnpm test`가 통과하고,
   `pnpm e2e`에서 **k-drama 관련 스펙이 모두 통과**한다. 다른 앱의 잔여 실패는
   해소 대상이 아니라 기록 대상이다(아래 "기준선 e2e 실패" 참조).
4. k-drama의 데스크톱·모바일 × `en-US`·`ar` × pseudo-locale에서 axe
   critical/serious 위반 0건, 가로 overflow 0건, 핵심 CTA 가림 0건이다.
5. 갱신된 시각 snapshot마다 갱신 사유가 문서에 기록된다.
6. k-drama 초기 JS gzip 150 KiB 이하, CSS gzip 50 KiB 이하를 유지한다.

## 제약 (constraints)

- 성능 예산: PLAN.md Phase 6 초기 예산 (JS gzip ≤ 150 KiB, CSS gzip ≤ 50 KiB)
- 접근성: WCAG AA, `--focus-ring` 기반 포커스 표시, `prefers-reduced-motion` 존중
- 스택: 기존 React 19 + Vite + vitest + Playwright 하네스를 유지한다.

## 시각 레퍼런스 (visual_reference)

`apps/k-drama/k-drama.pen` (Pencil MCP로 조회). 기존 고정 기록은
`docs/design/k-drama-hero-pen.md`와 `docs/specs/k-drama-hero-pen.md`.

## 우선순위 / 데이터 (선택)

- priority: 정확도 우선. 시각 불일치를 남긴 채 문서만 채우지 않는다.
- data_state: 정적 콘텐츠와 기존 locale resource만 사용. 신규 API 없음.

## 기준선 e2e 실패 (작업 시작 시점, `main`)

`pnpm build`, `pnpm typecheck`, `pnpm lint`, `pnpm test`는 통과했으나 `pnpm e2e`는
**21 failed / 78 passed / 125 skipped** 였다. PLAN.md Phase 8이 기록한
"79 passed, 81 skipped, 0 failed"와 다르므로, 그 기록은 이후 디자인 작업의 회귀를
반영하지 못한 상태다. 이번 작업이 만든 회귀가 아니다.

실패는 두 부류다.

**(1) 실제 결함 — axe `color-contrast` serious (WCAG AA 미달)**

k-drama 소유 항목 (이번 작업의 해소 대상):

| 요소 | 전경/배경 | 실측 | 요구 |
| --- | --- | --- | --- |
| `.k-drama-hero-card__feed-chip--topic` | `#ffffff` on `#7b61ff`, 12px bold | 4.2:1 | 4.5:1 |
| `.k-drama-feature__url-value` | `#94a3b8` on `#f8fafc`, 10px normal | 2.45:1 | 4.5:1 |

이 외 k-drama 실패: 모바일 navbar 접근명(`Open menu`)과 메뉴 숨김 상태,
공유 feature 카피의 의도적 개행 유실, feature CTA `min-height`.

**(2) 오래된 시각 baseline — 6건**

디자인 작업으로 페이지 높이가 실제로 바뀌었다(예: 기대 `1280×5954` → 실제
`1280×6777`, 12% 차이). 의도된 변경이므로 갱신 대상이다.

**범위 결정**: 사용자 지시에 따라 k-drama 관련 실패만 해소하고, `ai-communication`
6건과 `k-culture` 2건은 해소하지 않고 여기 기록만 남긴다. 대비 수정은 뿌리가
공통 토큰이면 `packages/design-tokens`에서 고치는 것을 우선한다.

## 생값 토큰화 (Phase 3 exit criteria 위반 해소)

`docs/design/k-drama-code-inventory.md`의 감사 결과, `apps/k-drama/src/styles.css`
(2,053줄)에 색상 생값 **184건**(hex 112 + `rgba()` 72)이 있다. 토큰 참조는 362건.
비교: `ai-communication` 1,462줄에 hex 87건, `k-culture` 38줄에 0건.

이는 DESIGN.md("모든 시각 값은 `tokens.css`의 CSS 변수에서 온다. 컴포넌트와 앱
스타일에 색상, 길이, 시간의 생값을 쓰지 않는다")와 PLAN.md Phase 3 exit
criteria("앱 CSS에 중복된 색상, 길이, 시간 생값을 추가하지 않는다")를 위반한다.
따라서 이 상태로는 Phase 3를 닫을 수 없다.

방침:

- 세 앱에서 반복되는 색은 `packages/design-tokens`의 semantic token으로 올린다.
- k-drama 전용 색은 앱 경계의 CSS 변수 레이어로 묶어 생값이 선택자에 직접
  나타나지 않게 한다.
- **시각 결과는 불변이어야 한다.** 토큰화는 순수 치환이다.

### 실행 순서 (스냅샷을 안전망으로 사용)

1. 대비 위반과 `aria-hidden` 수정 — 의도된 시각 변경
2. 시각 snapshot 갱신 → 새 기준선 확정
3. 색상 생값 토큰화 → **snapshot이 green을 유지해야 한다** (회귀 감지 장치)
4. review 게이트 판정

## 비고

- 기준선 (`main`, 이 작업 시작 시점): `pnpm typecheck`, `pnpm lint`,
  `pnpm test`, `pnpm build` 통과. `pnpm e2e`는 위와 같이 red.
- k-drama 빌드 크기 기준선: JS 344.37 KiB (gzip 108.14), CSS 72.79 KiB
  (gzip 11.68). 예산 안이지만 PLAN.md의 2026-07-21 기록(gzip 98.98 / 3.53)보다
  커졌다.
- `k-culture`의 neutral fallback 문서화는 사용자 지시로 별도 작업에 분리했다.
