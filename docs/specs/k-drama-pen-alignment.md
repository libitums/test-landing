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
  - **Final CTA와 proof strip의 잔재 콘텐츠 교체** (아래 참조)
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

## 잔재 콘텐츠 교체 (Final CTA · proof strip)

k-drama의 일부 섹션이 이 앱과 무관한 카피를 물려받고 있다. `.pen` 원본에도
통화·대화 기반 제품("Talkie")의 흔적이 남아 있어(섹션 이름 "나에게 맞는 통화",
플랜 이름 "가볍게 시작/매일 대화/깊이 대화", footer 아코디언 이름표 "통화 제공량"),
어디까지가 유효한 원본인지 노드별로 확인했다.

**가격 — 교체 불필요.** `.pen`의 플랜 *콘텐츠*(Free `$0` / Plus `$4.99` /
Premium `$9.99`와 각 설명문)는 코드와 정확히 일치한다. 통화 관련 문구는 노드
*이름*에만 남아 있고, 기능 불릿은 코드가 이미 "3 clips per day", "Basic captions"
등으로 k-drama에 맞게 채우고 있다.

**Final CTA — `.pen`에 정답이 있고 코드가 낡았다.** 실험 플랫폼 카피가 남아 있다.

| 슬롯 | `.pen` (`FSoGr`) | 현재 코드 |
| --- | --- | --- |
| 배지 `gdrQf`/`alDjR` | YouTube K-drama Shadowing | 일치 |
| 제목 `yf1u0` | Speak Korean like the scenes you love | "Make the next idea tangible" |
| 설명 `zVa7d` | Practice real lines from YouTube K-drama clips, with bite-sized shadowing lessons made for international fans. | "일관된 기반에서 시작해 실험의 가치를…" |
| 버튼 `JkdlB` | Get Early Access | "Create an experiment" / "실험 만들기" |
| 노트 `wPFnp` | No card required · Early access updates | 일치 |

`.pen`은 영문만 제공하므로 `ko-KR`·`ar`은 `resources.ts`의 기존 번역 패턴을
따른다. 번역문은 사람 검토 대상임을 PR에 명시한다.

**Proof strip — `.pen`에 대응 숫자 지표가 없다.** 현재 값(`24 출시 준비 시장`,
`82% 공통 기반`, `2배 더 빠른 반복`)은 이 랜딩 모노레포 자체의 내부 지표이지
학습자용이 아니다. `.pen`의 proof 영역(`dlClE`)은 숫자가 아니라 체크 3개다:
"Learn from Any Content", "Make your favorite lesson", "shorts content".

**근거 없는 수치를 지어내지 않는다.** 숫자 지표는 만들지 않는다.

### proof 재설계 — 서비스 이해를 돕는 영역

사용자 결정: proof는 `.pen` 체크 한 줄의 복제가 아니라, **서비스가 무엇인지
즉시 이해시키는 영역**으로 재설계한다. 구조는 **한 단어 + 설명** 3쌍이며,
학습 흐름 3단계를 따른다.

| 단어 | 설명 (ko-KR) |
| --- | --- |
| `Watch` | 즐겨 보던 K-드라마와 쇼츠를 그대로 가져옵니다. |
| `Understand` | 한국어와 모국어 자막을 나란히 보며 단어와 표현을 맥락으로 익힙니다. |
| `Speak` | 장면의 대사를 따라 말하며 짧게 섀도잉으로 연습합니다. |

- 이 카피는 `.pen`에 없는 **신규 작성 콘텐츠**다. `.pen`의 proof 영역(`dlClE`,
  체크 3개)은 Hero의 `hero__highlights`가 이미 담당하므로 중복되지 않는다.
- 단어는 영문 그대로 두고 설명만 locale별로 번역한다(`ko-KR`·`en-US`·`ar`).
- `ProofMetric`의 `value`+`label` 구조는 "단어+설명" 의미와 맞지 않는다. 공통
  계약을 바꾸지 말고 앱 경계에서 필요한 형태를 정의한다. 계약이 막으면 보고한다.
- 기존 `proof.markets.*`, `proof.reuse.*`, `proof.launch.*` 키는 제거한다.

## 서비스명 확정 — Baetter

사용자 확인: k-drama의 서비스명은 **Baetter**다. `.pen`의 Hero 내비 로고 노드
이름("Baetter Logo · Hero Nav", 에셋 `images/beater-Photoroom.png")과 일치한다.

현재 코드의 `brand`는 세 앱 공통의 placeholder "Luma" 계열이다.

| 앱 | 현재 `brand` (ko-KR / en-US / ar) |
| --- | --- |
| `k-drama` | `Luma` / `Luma` / `لوما` |
| `k-culture` | `Luma 컬처` / `Luma Culture` / `ثقافة لوما` |
| `ai-communication` | `Luma 비교` / `Luma Compare` / `مقارنة لوما` |

방침:

- **범위가 k-drama이므로 k-drama만 `Baetter`로 바꾼다.** 다른 두 앱은 건드리지
  않는다(다른 세션이 ai-communication을 작업 중이고, k-culture는 별도 작업이다).
  결과적으로 앱 간 브랜드 표기가 한동안 비대칭이 된다 — 의도된 상태이며 여기
  기록해 둔다.
- `brand` 외에 `document.title`, `footer.label`, `footer.copyright`의 "Luma
  드라마"/"Luma Drama" 표기도 함께 교체한다(k-drama 안에서 8곳).
- footer 안내 문구는 앞서 브랜드명 미확정 때문에 브랜드 중립으로 처리했다. 이제
  브랜드가 확정됐으므로 `.pen` 원문의 의도대로 브랜드명을 쓴다. (`.pen` 본문의
  "Beatter"는 철자 흔들림이므로 **`Baetter`로 통일**한다.)
- `ar` 로케일 표기는 라틴 문자 `Baetter`를 유지한다. 기존 관례는 음차(`لوما`)지만
  신조 브랜드의 음차는 임의 결정이 되므로, 라틴 표기를 두고 **원어민 검토 대상**
  으로 PR에 명시한다.

## 생값 토큰화 (Phase 3 exit criteria 위반 해소)

`docs/design/k-drama-code-inventory.md`의 감사 결과, `apps/k-drama/src/styles.css`
(2,053줄)에 색상 생값 **184건**(hex 112 + `rgba()` 72)이 있다. 토큰 참조는 362건.
비교: `ai-communication` 1,462줄에 hex 87건, `k-culture` 38줄에 0건.

이는 DESIGN.md("모든 시각 값은 `tokens.css`의 CSS 변수에서 온다. 컴포넌트와 앱
스타일에 색상, 길이, 시간의 생값을 쓰지 않는다")와 PLAN.md Phase 3 exit
criteria("앱 CSS에 중복된 색상, 길이, 시간 생값을 추가하지 않는다")를 위반한다.
따라서 이 상태로는 Phase 3를 닫을 수 없다.

방침 (2026-07-24 갱신 — `a75ab86` 병합 후):

초기 방침은 앱 경계 변수 레이어(`--kd-*`)로 우회하는 것이었다. 이유는
`packages/design-tokens/src/tokens.css`를 다른 세션이 동시에 수정 중이라
충돌하기 때문이었다. `a75ab86`(ai-communication)이 origin/main에 병합되어 **그
제약이 사라졌고**, 동시에 같은 문제에 대한 선례가 생겼다.

`a75ab86`은 ai-communication의 생값을 **87건 → 0건**으로 없앴다. 방법은 앱 경계
레이어가 아니라 **공유 `tokens.css`에 앱 네임스페이스 토큰을 추가**하는 것이었다
(`--color-conversation-*`, `--duration-conversation-*`, `--ease-conversation*`,
`--breakpoint-conversation-*`, 그리고 앱 중립인 `--geometry-*`).

따라서 사용자 결정에 따라 **같은 방식을 따른다**:

- k-drama 전용 값은 `packages/design-tokens/src/tokens.css`에 `--color-drama-*`
  등 앱 네임스페이스 토큰으로 추가한다. DESIGN.md가 "모든 시각 값은
  `packages/design-tokens/src/tokens.css`의 CSS 변수에서 온다"고 파일을 명시하므로
  이 방식이 문구를 문자 그대로 만족한다.
- `a75ab86`이 추가한 `--geometry-*`(card/device/panel/tile 치수)는 앱 중립이므로
  k-drama 디바이스 목업에 **재사용한다**. 같은 값을 다시 정의하지 않는다.
- 기존 공유 토큰으로 표현 가능한 값은 그 토큰을 그대로 쓴다.
- 목표 상태: `apps/k-drama/src/styles.css`의 색상 생값 **0건**
  (ai-communication과 동일한 기준).
- **시각 결과는 불변이어야 한다.** 토큰화는 순수 치환이며 시각 snapshot이
  green을 유지하는 것으로 증명한다.

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
