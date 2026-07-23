# 작업 스펙: 세 프로젝트 공통 Pricing 섹션

## 목적 (goal)

방문자가 3-tier 요금제를 한눈에 비교하고 자신에게 맞는 플랜을 인지하도록, 세 앱이 공유하는 Pricing 섹션을 `k-drama.pen`의 "Talkie Pricing" 디자인 기준으로 구축한다.

## 디자인 레퍼런스 (design_ref)

`apps/k-drama/k-drama.pen` 프레임 "Talkie Pricing · 나에게 맞는 통화"(id `ozZuT`, 1440×984).
구성: kicker pill(sparkles + 텍스트) → 헤드라인 → 서브타이틀 → **Monthly/Annual 빌링 토글**(Annual "Save 20%") → **3-tier 플랜 카드**(Free / **Plus·Popular·강조** / Premium) → 하단 안내문. 각 카드: 플랜명 · 가격(`/mo`) · 설명 · CTA · 피처 체크리스트. 강조 플랜은 보라 테두리·큰 그림자·보라 CTA. 폰트는 레포 토큰(Inter)으로 적응([추론], Funnel Sans 미추가).

## 범위 (scope)

- 포함(scope_in): 세 앱이 공유하는 `PricingSection`; kicker · 헤드라인 · 서브타이틀(`\n`) · 인터랙티브 빌링 토글 · 확장형 플랜 배열(각 플랜 name/price/description/CTA/features/featured/badge) · 하단 안내문. 앱별 콘텐츠(i18n).
- 제외(scope_out): 안내 아코디언(하단 안내문만) · 실제 결제/체크아웃 · 플랜 CTA의 링크/추적(표시 전용) · Codex 담당 feature 섹션 · CTA 브랜치와 겹치는 편집.

## 인터랙션 (interaction)

- **빌링 토글**: Monthly ↔ Annual 클릭 전환(클라이언트 상태). 선택에 따라 각 플랜 가격이 바뀐다. Annual에 "Save 20%" 뱃지.
- **플랜 CTA**: 표시 전용(`aria-disabled`), 링크·추적 없음(Hero CTA와 동일 정책).

## 계약 (fixed contract) — pricing 범위 신규

```ts
export interface PricingContent {
  kicker?: string;
  title: string;
  subtitle?: string;              // '\n' 줄바꿈 지원
  billing: PricingBilling;
  plans: readonly PricingPlan[];  // 확장형(개수 제약 없음)
  footerNote?: string;
}
export interface PricingBilling {
  monthlyLabel: string;
  annualLabel: string;
  annualBadge?: string;           // 예: "Save 20%"
}
export interface PricingPlan {
  id: string;
  name: string;
  badge?: string;                 // 예: "Popular"
  featured?: boolean;
  description: string;
  price: PricingPrice;
  cta: string;                    // 표시 전용 라벨
  features: readonly PricingFeature[];
}
export interface PricingPrice {
  monthly: string;                // 예: "$4.99"
  annual: string;                 // 예: "$3.99"
  unit: string;                   // 예: "/mo"
}
export interface PricingFeature { id: string; label: string; }
export interface PricingSectionProps {
  content: PricingContent;
  testId?: "pricing-section";
}
```

testIds(pricing 범위): `pricingSection`, `pricingPlan(id)`, `pricingBilling`, `pricingBillingOption(period)`.

## 수용 기준 (acceptance_criteria)

1. 세 앱 모두 공통 Pricing 섹션을 사용하고 모바일·데스크톱에서 카드가 겹치거나 가로 overflow 없이 정렬된다(모바일 1열, 데스크톱 다열).
2. 빌링 토글이 접근성 있게(탭·엔터, `aria-pressed`/`role`) 동작하고 전환 시 가격이 바뀐다.
3. 강조(featured) 플랜이 시각적으로 구분되고 뱃지가 표시된다.
4. 플랜 CTA는 표시 전용이며 링크·추적이 없다.
5. RTL(`/ar/`) · pseudo-locale · `prefers-reduced-motion` 대응.
6. typecheck · 단위/통합 테스트 · e2e 통과, 시각 스냅샷 갱신(병합 시).

## 제약 (constraints)

React·TS·Vite·DESIGN.md 유지. **pricing 범위만 편집**(hero/feature/cta 라인 불가침). `pricing__*` 클래스, `pricing.*` i18n 키, `pricing-*` testId로 네이밍 격리. 전체 포맷터 금지.

## 병렬 작업(Codex/CTA) 조정

`feat/shared-pricing` 전용 worktree(origin/main 기준)에서만 작업. Codex의 `feat/shared-feature-ui*`, 본인의 `feat/shared-final-cta`와 공유 파일(contracts/ui.css/content) 겹칠 수 있어 pricing 영역만 최소 편집. 병합은 먼저 머지되는 쪽 위로 rebase하여 흡수.
