# Landing Experiments

한국어를 배우고 싶은 해외 사용자에게 **같은 제품을 세 가지 다른 이야기로 제안하고, 어느 이야기가 사전 등록으로 이어지는지 재는** 저장소다.

제품은 하나다 — 좋아하는 한국어 콘텐츠로 한국어를 배우는 서비스. 하지만 "왜 이걸 써야 하는지"를 설명하는 방법은 여러 가지고, 어느 쪽이 통하는지는 만들어서 재보기 전에는 모른다. 그래서 랜딩페이지를 셋 만들었다. 셋은 같은 디자인 토큰·공통 UI·같은 분석 계약·같은 사전 등록 경로를 쓰고, **다른 것은 메시지와 그 메시지를 뒷받침하는 화면뿐이다.** 그래야 성과 차이를 메시지의 차이로 읽을 수 있다.

아직 출시 전이다. 세 페이지의 전환 지점은 결제가 아니라 **사전 등록(Get Early Access)** 이다.

## 세 개의 가설

| 앱                                               | 브랜드  | 이 페이지가 거는 가설                                              | Hero 문구 (en-US)                                        |
| ------------------------------------------------ | ------- | ------------------------------------------------------------------ | -------------------------------------------------------- |
| [`apps/k-drama`](apps/k-drama)                   | Baetter | 이미 보고 있는 K-드라마·쇼츠를 그대로 교재로 쓸 수 있다면 시작한다 | _Watch what you love. Speak Korean._                     |
| [`apps/ai-communication`](apps/ai-communication) | Baetter | 단어는 아는데 말을 못 하는 사람에게는 "말할 상대"가 제품이다       | _Practice real Korean Conversations — out loud, anytime_ |
| [`apps/k-culture`](apps/k-culture)               | K-zip   | 교과서 한국어가 아니라 밈·팬덤·드라마 대사를 원한다                | _The real Korean you actually wanted to learn_           |

각 앱은 가설을 화면으로 편다.

- **k-drama** — `Watch → Understand → Speak` 3단 proof strip, 이중 자막·유튜브 링크 수업·쇼츠 3개 기능 섹션.
- **ai-communication** — 역할극, 즉석 교정, 좋아하는 아이돌과의 대화. "이미 배운 단어를 실제로 말해보게 한다"가 축이다.
- **k-culture** — "교과서가 빼놓은 것" 전부. 밈 한 장(뜻·유래·말맛), 상황 팩 두 개(덕질·한국 여행), 관계별 말투 네 가지(친구·선배·상사·어른)로 편다.

분석에서는 세 페이지가 한 실험의 세 variant다 — `experimentId: landing-phase-1`, `variantId: k-drama-v1 · ai-communication-v1 · k-culture-v1`.

## 방문자가 지나는 길

세 앱이 공유하는 뼈대다. 안에 들어가는 내용만 앱마다 다르다.

```text
Navbar  →  Hero (+ 진입 CTA)  →  Proof  →  Features ×3  →  Final CTA  →  Pricing  →  Footer
                  │                                            │
                  └──────────  사전 등록 폼  ←──────────────────┘
                        k-drama는 전용 페이지, 나머지 둘은 모달
```

사전 등록은 공통 Supabase Edge Function 하나를 거쳐 프로젝트별 테이블에 들어간다. 테이블 직접 접근은 RLS로 막혀 있고 함수의 서버 자격 증명으로만 삽입한다. 계약은 [`docs/specs/supabase-early-access-foundation.md`](docs/specs/supabase-early-access-foundation.md)에 있다.

## 실험이 비교 가능하려면 지켜야 하는 것

랜딩페이지를 여러 개 만드는 일의 어려움은 만드는 게 아니라 **비교 가능하게 유지하는 것**이다. 이 저장소가 그 비용을 무는 자리는 넷이다.

- **언어** — 세 앱 모두 `en-US`(기본), `ko-KR`, `ja-JP`, `vi-VN`, `th-TH`, `zh-CN`, `zh-TW`, `ar`(RTL) 여덟 locale을 같은 키 집합으로 갖는다. 키가 빠지거나 남으면 테스트가 실패한다. `?pseudo=1`로 문구를 35% 늘린 pseudo-locale(`en-XA`)을 띄워 잘림을 확인한다.
- **측정** — 노출·CTA 클릭·전환 이벤트 이름과 필수 속성이 `@landing/contracts`에 고정돼 있고, 동의 전에는 외부로 나가지 않으며 payload에 PII를 담지 못한다. 분석이 죽어도 링크와 렌더링은 살아 있어야 한다.
- **시각** — 색·간격·타이포는 `@landing/design-tokens`의 CSS 변수에서만 온다. 앱 스타일에 생값을 쓰지 않는다.
- **접근성** — axe critical/serious 0건, WCAG AA 대비, 키보드만으로 모든 상호작용 도달, `prefers-reduced-motion` 존중. Playwright가 데스크톱·모바일, LTR·RTL에서 검사한다.

무엇이 어디까지 검증됐는지는 [`PLAN.md`](PLAN.md)의 단계별 검증 기록에 남아 있다.

## 시작하기

Corepack과 저장소가 선언한 pnpm 버전을 사용한다.

```sh
corepack enable
pnpm install
pnpm dev:k-drama
pnpm dev:ai-communication
pnpm dev:k-culture
```

위 명령은 저장소 루트에서 각 앱의 Vite 개발 서버를 실행한다.

루트 품질 게이트:

```sh
pnpm build
pnpm typecheck
pnpm lint
pnpm test
pnpm e2e
```

특정 workspace 명령은 pnpm filter로 실행한다.

```sh
pnpm --filter @landing/k-drama dev
pnpm --filter @landing/ai-communication test
pnpm --filter @landing/ui test
```

배포는 앱마다 Vercel 프로젝트를 따로 두고 루트의 `vercel.<app>.json`이 build 명령과 출력 경로를 지정한다.

## 저장소 구조

```text
apps/
  k-drama/             K-드라마 섀도잉 가설과 전용 UI
  ai-communication/    AI 회화 연습 가설과 전용 UI
  k-culture/           K-컬처 가설과 전용 UI
packages/
  contracts/           공유 콘텐츠·props·test-id·이벤트·i18n 계약
  design-tokens/       DESIGN.md를 구현하는 공통 토큰과 전역 스타일
  ui/                  shadcn 계열 primitive와 공통 페이지 section
  analytics/           동의 게이트·검증·adapter를 묶는 공통 분석 경계
  i18n/                locale registry, fallback, 키 드리프트 검출, pseudo-locale
  early-access/        사전 등록 제출 adapter와 검증
  config-eslint/       공유 ESLint 설정
  config-typescript/   공유 TypeScript 설정
  config-vite/         공유 Vite/Vitest 및 브라우저 타깃 설정
supabase/              사전 등록 테이블 migration과 공통 Edge Function
e2e/                   세 앱을 함께 도는 Playwright 시나리오
docs/
  specs/               실행 레이어가 소비하는 고정 계약
  design/              와이어프레임과 토큰 결정
```

앱은 다른 앱을 import하지 않는다. 공통화할 코드는 `packages/`로 옮기고, 그 앱만의 표현은 `apps/<app>/src/features/`에 둔다. 분석 context는 프로젝트별로 주입하되 consent 판단·검증·adapter 동작은 `@landing/analytics`가 소유한다.

## 어디를 먼저 봐야 하나

| 알고 싶은 것                       | 볼 곳                                                              |
| ---------------------------------- | ------------------------------------------------------------------ |
| 이 페이지가 무슨 말을 하는가       | `apps/<app>/src/resources.ts` — 여덟 locale의 모든 문구            |
| 어떤 순서로 보여주는가             | `apps/<app>/src/app/App.tsx`                                       |
| 무엇이 공통이고 무엇이 앱 전용인가 | [`docs/specs/landing-monorepo.md`](docs/specs/landing-monorepo.md) |
| 시각 규칙과 토큰의 의미            | [`DESIGN.md`](DESIGN.md)                                           |
| 무엇을 재고 어디까지 검증됐는가    | [`PLAN.md`](PLAN.md)                                               |
| 개별 기능의 고정 계약              | `docs/specs/`                                                      |

## 새 실험 추가

1. 목적, 타깃, 포함·제외 범위, 객관적 수용 기준을 먼저 완결한다. 무엇을 확인하려는 실험인지가 없으면 결과를 읽을 수 없다.
2. `docs/specs/`에 앱 경로, 공통·전용 UI 경계, props와 test-id를 고정한다.
3. 기존 토큰과 `@landing/ui`를 우선 재사용하고, 새로 만드는 표현만 새 앱의 `features/`에 둔다.
4. 여덟 locale의 키를 모두 채우고 분석 context에 새 `variantId`를 넣는다.
5. workspace package를 추가하고 루트 재귀 명령에 build/typecheck/lint/test가 포함되는지 확인한다.
6. 데스크톱에서 먼저 구성하되 모바일에서도 정보와 액션을 유지한다.
7. 루트 품질 게이트를 모두 실행하고 스펙의 수용 기준을 확인한다.

## 유지보수

- 문구 변경: `apps/<app>/src/resources.ts`의 여덟 locale을 함께 바꾼다. 한 곳만 고치면 키 드리프트 테스트가 실패한다.
- 디자인 변경: `DESIGN.md`에서 토큰 의미와 접근성 기준을 먼저 갱신한 뒤 `@landing/design-tokens`와 UI를 변경한다.
- 계약 변경: `docs/specs/`와 `@landing/contracts`를 함께 변경하고 세 앱과 테스트의 영향을 확인한다. 소비자 코드를 먼저 우회 수정하지 않는다.
- 의존성 변경: 루트의 pnpm 버전 정책을 유지하고 lockfile을 함께 갱신한 뒤 전체 루트 게이트를 실행한다.
- 브라우저 변경: Browserslist, Vite build target, 브라우저 테스트 매트릭스를 함께 갱신한다.
- 장기 개선: 우선순위와 단계별 종료 기준은 `PLAN.md`에서 관리한다.
