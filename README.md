# Landing Experiment Monorepo

여러 국가를 대상으로 하는 랜딩 페이지 실험을 빠르게 만들기 위한 pnpm + Vite + React + TypeScript 모노레포다. 세 프로젝트는 동일한 디자인 토큰, 공통 UI, 공급자 독립 분석 경계를 소비하며 앱 전용 UI는 각 앱 내부에 격리한다.

요구사항과 계약의 단일 출처는 [`docs/specs/landing-monorepo.md`](docs/specs/landing-monorepo.md), 디자인의 단일 출처는 [`DESIGN.md`](DESIGN.md), 후속 로드맵은 [`PLAN.md`](PLAN.md)다.

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
```

특정 workspace 명령은 pnpm filter로 실행한다.

```sh
pnpm --filter @landing/k-drama dev
pnpm --filter @landing/ai-communication test
pnpm --filter @landing/k-culture test
pnpm --filter @landing/ui test
```

## 디렉터리

```text
apps/
  k-drama/             K-drama 프로젝트와 전용 UI
  ai-communication/    AI communication 프로젝트와 전용 UI
  k-culture/           K-culture 프로젝트와 전용 UI
packages/
  analytics/           동의 게이트·검증·adapter를 묶는 공통 분석 경계
  contracts/           공유 콘텐츠·props·test-id 계약
  design-tokens/       DESIGN.md를 구현하는 공통 토큰과 전역 스타일
  ui/                  shadcn 계열 primitive와 공통 페이지 section
  config-eslint/       공유 ESLint 설정
  config-typescript/   공유 TypeScript 설정
  config-vite/         공유 Vite/Vitest 및 브라우저 타깃 설정
docs/
  specs/               실행 레이어가 소비하는 고정 계약
  design/              와이어프레임과 토큰 결정
```

앱은 다른 앱을 import하지 않는다. 공통화할 코드는 `packages/`로 이동하고, 앱만의 표현은 `apps/<app>/src/features/`에 둔다. 분석 context는 프로젝트별로 주입하되 consent 판단, 검증, adapter 동작은 `@landing/analytics`가 소유한다. 컴포넌트와 test-id의 정확한 경계는 스펙 문서를 따른다.

## Execution layer와 작업 DAG

Codex 하네스의 진입점은 [`.codex/AGENTS.md`](.codex/AGENTS.md)다. 프로젝트 상수는 `AGENT.md`, 디자인은 `DESIGN.md`, 역할과 스킬의 원본은 각각 `agents/`, `skills/`에 유지한다. `.codex/`는 실행용 얇은 미러이며 원본을 대체하지 않는다.

```text
discussion: 요구사항 완결
        ↓
orchestration: 작업 그래프·브리프 분해
        ↓
spec: 타입·props·test-id 계약 ─┬─ design: 와이어프레임·토큰
                              ↓
          ┌───────────────────┼────────────────────┐
          ↓                   ↓                    ↓
state-data: 데이터 경계  implementation: 제품 코드  tester: 검증 하네스
          └───────────────────┼────────────────────┘
                              ↓
accessibility: 통합 접근성 개선
                              ↓
review: 수용 기준과 전체 품질 게이트
```

각 실행자는 고정된 스펙 슬라이스만 구현한다. 계약 변경이 필요하면 소비자 코드를 먼저 우회 수정하지 않고 spec 문서와 계약 파일을 갱신한 뒤 영향받는 실행 단위를 다시 분배한다. 모든 루트 게이트가 green이 되기 전 작업을 완료로 판정하지 않는다.

## 새 랜딩 실험 추가

1. discussion 레이어에서 목적, 타깃, 포함·제외 범위, 객관적 수용 기준을 완결한다.
2. `docs/specs/`에 앱 경로, 공통/전용 UI 경계, props와 test-id를 고정한다.
3. 기존 토큰과 `@landing/ui`를 우선 재사용하고 앱 전용 UI만 새 앱의 `features/`에 둔다.
4. workspace package를 추가하고 루트 재귀 명령에 build/typecheck/lint/test가 포함되는지 확인한다.
5. 데스크톱에서 먼저 구성하되 모바일에서도 정보와 액션을 유지한다.
6. 루트 품질 게이트를 모두 실행하고 스펙의 수용 기준을 review 레이어에서 확인한다.

## 유지보수

- 역할 변경: `agents/*.md` 원본을 먼저 수정하고 필요한 경우에만 `.codex/agents/*` 미러를 갱신한다.
- 스킬 변경: `skills/` 원본을 먼저 수정하고 `.codex/skills/`와의 드리프트를 확인한다.
- 디자인 변경: `DESIGN.md`에서 토큰 의미와 접근성 기준을 먼저 갱신한 뒤 `@landing/design-tokens`와 UI를 변경한다.
- 계약 변경: `docs/specs/landing-monorepo.md`와 `@landing/contracts`를 함께 변경하고 두 앱과 테스트의 영향을 확인한다.
- 의존성 변경: 루트의 pnpm 버전 정책을 유지하고 lockfile을 함께 갱신한 뒤 전체 루트 게이트를 실행한다.
- 브라우저 변경: Browserslist, Vite build target, 브라우저 테스트 매트릭스를 함께 갱신한다.
- 장기 개선: 우선순위와 단계별 종료 기준은 `PLAN.md`에서 관리한다.
