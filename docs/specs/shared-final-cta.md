# 작업 스펙: 세 프로젝트 공통 최종 CTA (Final CTA)

## 목적 (goal)

방문자가 페이지 하단에서 제품의 핵심 전환 행동을 명확히 인지하고 실행하도록, 세 앱이 공유하는 최종 CTA 섹션을 `k-drama.pen`의 "Final CTA · 밀어서 시작하기" 디자인 기준으로 재설계한다. 최종 CTA는 실제 전환 지점이므로 링크와 분석 이벤트를 유지한다.

## 디자인 레퍼런스 (design_ref)

`apps/k-drama/k-drama.pen` — 프레임 "Talkie Final CTA · 밀어서 시작하기"(id `FSoGr`, 1440×900).
중앙 정렬 구성: Promise 배지(작은 pill) → 대형 헤드라인 → 설명 → 와이드 pill CTA(왼쪽 보라 원형 노브 + 화살표 + 라벨) → Trial Notes(작은 리슈어런스 항목) → 배경 고스트 워드(SPEAK/FREELY, 반투명 보라 `#7B61FF0A`). 보라 액센트로 Hero CTA와 톤을 맞춘다.

## 범위 (scope)

- 포함(scope_in): 세 앱이 공유하는 `CtaSection` 재디자인 — badge · headline · description(`\n` 줄바꿈) · primary CTA(pill 링크) · notes · ghost words. 링크 + `cta_clicked` 추적 유지. 앱별 콘텐츠(i18n) 설정.
- 제외(scope_out): 드래그-슬라이드 인터랙션(클릭형 pill 링크로 대체) · 새 라우트/페이지 · CD/배포 · Codex 담당 feature 섹션.

## 인터랙션 (interaction)

- primary action은 pill 링크(`href`)로 렌더하고, 클릭 시 `onAction` → `cta_clicked`.
- 보조 action(있으면)은 일반 링크.
- 디자인의 "밀어서 시작(slide to start)"은 접근성·단순성을 위해 **클릭형 pill 링크**로 해석한다(드래그 없음). pill 룩(왼쪽 보라 노브 + 화살표 + 라벨)은 유지.

## 계약 (fixed contract) — CTA 범위 최소 확장

`CtaContent` 확장(추가만, 기존 필드 유지):

```ts
export interface CtaContent {
  title: string;
  description: string;            // '\n' 은 명시적 줄바꿈으로 렌더
  badge?: string;                // Promise 배지 (선택)
  actions: readonly [LandingAction, ...LandingAction[]];
  notes?: readonly CtaNote[];    // 확장형 리슈어런스 항목
  ghostWords: readonly [string, string]; // 배경 장식 워드 (항상 표시, 앱별)
}
export interface CtaNote { id: string; label: string; }
```

- `CtaSectionProps`: `content` · `onAction?` · `testId?: "cta-section"` 유지.
- testIds(cta 범위만 추가): `ctaSection`, `ctaAction(id)` 유지 · `ctaNote(id)` · `ctaGhost` 추가.

## 수용 기준 (acceptance_criteria)

1. 세 앱 모두 공통 최종 CTA를 사용하고 모바일·데스크톱에서 중앙 정렬된다.
2. primary CTA는 실제 이동 링크이며 클릭 시 `cta_clicked`가 1회 기록된다.
3. badge · notes · ghostWords는 콘텐츠(i18n)로 앱별 설정하며, 배경 고스트 워드는 항상 표시된다.
4. 기존 지원 viewport에서 텍스트·CTA·notes가 겹치거나 가로 overflow를 만들지 않는다. RTL(`/ar/`) · pseudo-locale · `prefers-reduced-motion`에 대응한다.
5. typecheck · 단위/통합 테스트 · e2e가 통과하고 시각 스냅샷을 갱신한다.

## 제약 (constraints)

- 현재 React·TypeScript·Vite 스택과 DESIGN.md를 유지한다.
- **CTA 범위만 편집**한다(feature/hero 라인 불가침). `cta__*` 클래스, `cta.*` i18n 키, `cta-*` testId로 네이밍을 격리한다. 전체 파일 포맷터 실행 금지.

## 병렬 작업(Codex) 조정 (coordination)

- Codex는 `feat/shared-feature-ui*` 브랜치에서 공유 feature 섹션을 작업 중이다. 본 작업은 `feat/shared-final-cta` 전용 worktree에서만 진행한다.
- 공유 파일(`packages/contracts/src/landing.ts`, `packages/ui/src/styles/ui.css`, `apps/*/src/app/content.ts`)은 겹칠 수 있으므로 **CTA 영역만 최소 편집**한다.
- 병합은 먼저 머지되는 쪽(Codex feature 또는 본 CTA) 위로 rebase하여 충돌을 흡수한다.

## 컴포넌트 트리와 책임

```text
CtaSection (공유)
├── ghost words (배경 장식, 좌/우)
└── container (중앙 정렬)
    ├── badge (선택)
    ├── h2 headline
    ├── p description ('\n' → 줄바꿈)
    ├── primary CTA (pill 링크: 보라 노브 + 화살표 + 라벨) + 보조 링크
    └── notes (확장형 리슈어런스 리스트)
```

## 비고

- [추론] 표시 항목: 없음. 디자인의 슬라이드 동작만 클릭형 링크로 해석함(명시).
