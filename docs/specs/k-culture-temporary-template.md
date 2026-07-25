# 작업 스펙: K-zip 공용 템플릿 임시 배포

## 목적 (goal)
K-culture 최종 디자인이 완성되기 전에 사용자가 K-zip의 실제 기능 메시지와 배포 형태를 검토할 수 있도록, K-drama와 AI Communication이 함께 사용하는 템플릿에 K-zip 카피를 적용한 임시 페이지를 Vercel에 배포한다.

## 타깃 (target)
- 디바이스: 모바일·데스크톱
- 브라우저 하한: Chrome·Safari·Edge 최신 2개 버전

## 디자인 (design_ref)
DESIGN.md 표준 따름. 벗어남: K-culture 최종 디자인 및 디자인 children은 이번 임시 버전에 반영하지 않고 기존 공용 템플릿 표현을 유지한다.

## 범위
- 포함(scope_in): K-drama와 AI Communication이 함께 사용하는 템플릿 구조 적용, `violet-editorial` K-zip 텍스트 Navbar, K-zip용 Hero·Proof·Feature 1~3·Final CTA·Pricing·FAQ·Footer 카피, K-drama와 동일한 8개 locale의 전체 번역·라우트·selector·canonical/hreflang·RTL 처리, 반응형 렌더링, 임시 Vercel 배포
- 제외(scope_out): K-culture 최종 디자인 및 디자인 children 반영

## 수용 기준 (acceptance_criteria)  ← 피드백 레이어 검증 타깃
1. K-zip 페이지가 공용 템플릿을 사용해 모바일과 데스크톱에서 정상 렌더링되고, 제공된 Feature 1~3 문구가 정확히 표시된다.
2. Hero·Proof·Pricing·FAQ·Final CTA에 Feature 1~3의 기능 메시지와 일치하는 임시 카피가 표시된다.
3. 기존 K-drama와 AI Communication 앱에 기능 및 시각 회귀가 없다.
4. 루트 build, typecheck, lint, test 품질 게이트가 모두 통과한다.
5. 배포된 Vercel 임시 URL에 접속할 수 있다.
6. Navbar가 `violet-editorial` appearance와 접근 가능한 이름 `K-zip`인 텍스트 로고를 사용하고 Proof `#proof`, Pricing `#pricing`, locale selector, CTA `#cta`를 제공한다.
7. 본문과 Footer는 Hero → Proof → Features → Final CTA → Pricing → Footer/FAQ 순서로 렌더링된다.
8. locale은 `ko-KR`, `en-US`, `ja-JP`, `vi-VN`, `th-TH`, `zh-CN`, `zh-TW`, `ar`의 정확한 순서로 제공되고, 각 locale에 전체 번역 resource와 접근 가능한 locale route가 존재한다.
9. 각 locale 문서는 자기 자신의 canonical과 8개 locale 전체의 hreflang alternate를 제공하며, `x-default`는 `en-US` route를 가리킨다.
10. `dir="rtl"`은 `ar` route에만 적용되고 나머지 7개 locale은 `dir="ltr"`이며, 모든 locale에서 브랜드는 정확히 `K-zip`이다.

## 제약 (constraints)
기존 모노레포 기술 스택과 공용 템플릿 계약을 유지하고, 본문과 핵심 UI는 WCAG AA 및 reduced-motion 기준을 따른다.

## 시각 레퍼런스 (visual_reference)
K-drama와 AI Communication이 함께 사용하는 기존 템플릿. K-culture 전용 디자인 children은 미반영.

## 우선순위 / 데이터 (선택)
속도와 기존 템플릿 재사용을 우선한다. 실제 API/CMS 연동 없이 정적 임시 카피를 사용한다.

## 비고
- 임시 카피 작성 권한: Hero·Proof·Pricing·FAQ·Final CTA는 제공된 Feature 1~3 기능을 근거로 작성한다.
- Feature 1 title: Get the meme, then say it.
- Feature 1 subtitle: Watch YouTube clips and K-drama scenes with Korean and your language side by side. Tap any subtitle to replay the moment, understand words in context, and save natural Korean phrases for review.
- Feature 2 title: Not textbook Korean — the real thing
- Feature 2 subtitle: From the situations you'll actually hit living in Korea—hospitals, city offices, part-time jobs—to fan meets, video calls, and cheering on your bias. Learn the Korean your K-pop life actually needs.
- Feature 3 title: One Meaning, Everyone Different
- Feature 3 subtitle: Pick who you're talking to—your boss, a close friend, an elder, a stranger—and say the same thing to each. Watch the words shift with the person, and drill it until switching feels automatic.
- [추론] 표시 항목: 없음

## 컴포넌트 트리와 단일 책임

```text
KCultureApp
└── landing:k-culture
    └── LandingShell
        ├── Navbar (`violet-editorial`; `K-zip` 텍스트 로고)
        │   ├── Proof link → #proof
        │   ├── Pricing link → #pricing
        │   ├── Locale selector → 현재 경로의 locale 전환 링크
        │   └── CTA link → #cta
        ├── LandingShell.Main
        │   ├── Hero (텍스트 콘텐츠만; children·placeholder 없음)
        │   ├── KCultureProofStrip
        │   ├── KCultureTemporaryFeatures (명시적 K-culture 조합 경계)
        │   │   ├── SharedFeatureTemplate: clips
        │   │   │   └── FeatureEarlyAccessCta (기존 텍스트 링크만 유지)
        │   │   ├── SharedFeatureTemplate: real-life
        │   │   │   └── FeatureEarlyAccessCta (기존 텍스트 링크만 유지)
        │   │   └── SharedFeatureTemplate: register
        │   │       └── FeatureEarlyAccessCta (기존 텍스트 링크만 유지)
        │   ├── CtaSection
        │   └── PricingSection
        └── Footer (`K-zip` 텍스트 로고와 저작권)
            └── FAQ (기존 공용 Footer의 정적 FAQ 합성)
```

- `KCultureApp`: 정적 콘텐츠, 기존 분석 핸들러와 Hero → Proof → Features → Final CTA → Pricing → Footer/FAQ 순서를 조합한다.
- `Navbar`: `violet-editorial` 공용 표현에 `K-zip` 텍스트 로고와 Proof, Pricing, locale, CTA 탐색 목적지를 제공한다.
- `Hero`: K-culture의 임시 핵심 메시지만 표시한다. 미승인 디자인을 암시하는 media children, 빈 wrapper 또는 placeholder를 합성하지 않는다.
- `KCultureProofStrip`: 기능 1~3이 제공하는 학습 흐름을 정적 지표 세 개로 요약한다.
- `KCultureTemporaryFeatures`: 세 개의 기능을 `white | soft | white` appearance로 명시적으로 조합한다.
- `SharedFeatureTemplate`: 번호, 제목, 설명과 앱 소유 `children`을 공용 정보 순서로 표현한다.
- `FeatureEarlyAccessCta`: 기존 `/k-culture/early-access` 이동과 `feature_cta_clicked` 요청만 소유한다.
- `PricingSection`: 기능 1~3을 기준으로 한 임시 3-tier 정적 가격 콘텐츠를 표시한다.
- `CtaSection`: Features 직후의 Final CTA 메시지와 early-access 행동을 표시하고 기존 `cta_clicked` 분석 경계를 유지한다.
- `Footer`: `K-zip` 텍스트 로고, K-zip 저작권, 정책·locale 링크와 기능 기반 FAQ를 기존 공용 계약으로 표시한다.

공유 상태나 하위 컴포넌트 간 주입이 없으므로 compound context는 추가하지 않는다. 정적 구조는 render prop 대신 기존 `children` 합성을 사용하고, `isTemporary`, `hasFeatureVisual` 같은 Boolean prop은 추가하지 않는다. K-culture 임시 화면은 기존 공유 컴포넌트의 명시적 조합으로만 표현한다.

## 고정 Navbar 계약

| 필드 | 고정 값 |
| --- | --- |
| `appearance` | `violet-editorial` |
| `content.logo` | `{ kind: "text", label: "K-zip", accessibleLabel: "K-zip", href: "#top" }` |
| `content.howItWorks` | Proof 의미의 locale 카피, `href: "#proof"` |
| `content.pricing` | Pricing 의미의 locale 카피, `href: "#pricing"` |
| `content.language` | `ko-KR`, `en-US`, `ja-JP`, `vi-VN`, `th-TH`, `zh-CN`, `zh-TW`, `ar` 순서의 전체 options와 `localizePath` 기반 locale 링크; 현재 locale만 `current: true` |
| `content.tryAction` | early-access CTA 의미의 locale 카피, `href: "#cta"` |

K-zip Navbar는 이미지 asset이나 `neutral` appearance를 사용하지 않는다. 데스크톱과 모바일에서 서비스명 `K-zip`, 같은 링크 목적지와 접근 가능한 이름을 유지한다.

## 고정 서비스명·Footer 계약

- 서비스명은 모든 locale에서 번역·음역하지 않은 정확한 문자열 `K-zip`이다.
- Navbar 로고의 노출 텍스트와 접근 가능한 이름은 모두 `K-zip`이다.
- Footer `content.logo`는 `{ kind: "text", label: "K-zip", accessibleLabel: "K-zip", href: "#top" }`이다.
- 영어 기준 저작권은 `© 2026 K-zip. All rights reserved.`다. 다른 locale은 `K-zip`과 `2026`을 그대로 유지하고 나머지 문구만 번역한다.
- 문서 title 및 페이지 metadata에서 서비스명을 노출하는 경우 정확한 표기 `K-zip`을 사용한다.

## 고정 locale·SEO 계약

지원 locale의 닫힌 집합과 노출 순서는 아래와 같다. `registry.supportedLocales`, Navbar selector, hreflang 생성과 locale 반복 테스트는 모두 이 순서를 공유한다.

```text
ko-KR → en-US → ja-JP → vi-VN → th-TH → zh-CN → zh-TW → ar
```

| locale | route | 문서 방향 |
| --- | --- | --- |
| `ko-KR` | `/ko-KR/` | `ltr` |
| `en-US` | `/en-US/` | `ltr` |
| `ja-JP` | `/ja-JP/` | `ltr` |
| `vi-VN` | `/vi-VN/` | `ltr` |
| `th-TH` | `/th-TH/` | `ltr` |
| `zh-CN` | `/zh-CN/` | `ltr` |
| `zh-TW` | `/zh-TW/` | `ltr` |
| `ar` | `/ar/` | `rtl` |

- 각 resource는 Navbar, Hero, Proof, Feature 1~3, Final CTA, Pricing, Footer/FAQ, 접근 가능한 label과 metadata에 필요한 키를 빠짐없이 번역한다. 영어 fallback이나 raw key 노출은 허용하지 않는다.
- `K-zip`, 기능/plan/FAQ ID, URL fragment, test-id와 숫자 가격은 번역하지 않는다.
- locale selector는 정확히 8개 option을 위 순서로 표시하고 현재 locale 하나에만 `current: true`/`aria-current`를 제공한다. 각 option은 동일 페이지의 대응 locale route와 현재 fragment 의미를 보존한다.
- 각 locale route의 canonical은 해당 locale의 자기 URL이다. 각 문서는 위 8개 locale의 hreflang alternate를 모두 제공하며 `x-default`는 `/en-US/`를 가리킨다. canonical 또는 alternate의 중복·누락·교차 locale 오지정은 허용하지 않는다.
- `<html lang>`은 현재 locale과 일치한다. 문서 방향은 `ar`에서만 `rtl`, 나머지에서 `ltr`이다. locale selector option 순서는 RTL에서도 뒤집지 않는다.

## 고정 콘텐츠 계약

아래 영어 문구와 ID를 기준 콘텐츠로 고정한다. 다른 locale은 같은 의미를 번역하되 ID, 링크, 숫자 가격, action variant와 test-id는 바꾸지 않는다. 제목의 줄바꿈은 문자열의 `\n`으로만 표현하며 접근 가능한 이름은 전체 문자열을 유지한다.

### Hero

| 필드 | 고정 값 |
| --- | --- |
| `title` | `Learn the Korean behind the culture.` |
| `description` | `Catch the jokes in the clips you love, handle real life in Korea, and speak naturally to whoever is in front of you.` |
| `cta.label` | `Get early access` |
| highlight `clips` | `Replay real clips with dual subtitles` |
| highlight `real-life` | `Practice Korean for real-life moments` |
| highlight `register` | `Switch your words for every relationship` |

Hero CTA는 현재 공용 `HeroContent`의 표시 전용 label이다. 링크·콜백·분석 계약을 Hero에 새로 추가하지 않는다. K-culture는 선택적 `HeroProps.children`을 생략하며 `hero-media`를 렌더링하지 않는다.

### Proof

| 필드 | 고정 값 |
| --- | --- |
| heading | `One language. Every side of your K-life.` |
| metric `clips` value / label | `2 languages` / `Side-by-side subtitles in every clip` |
| metric `situations` value / label | `Real life` / `Practice for the moments you will actually face` |
| metric `relationships` value / label | `4 registers` / `Boss, friend, elder, or stranger` |

### Feature 1~3

| 순서 / ID | appearance | title | subtitle |
| --- | --- | --- | --- |
| `01` / `clips` | `white` | `Get the meme, then say it.` | `Watch YouTube clips and K-drama scenes with Korean and your language side by side. Tap any subtitle to replay the moment, understand words in context, and save natural Korean phrases for review.` |
| `02` / `real-life` | `soft` | `Not textbook Korean — the real thing` | `From the situations you'll actually hit living in Korea—hospitals, city offices, part-time jobs—to fan meets, video calls, and cheering on your bias. Learn the Korean your K-pop life actually needs.` |
| `03` / `register` | `white` | `One Meaning,\nEveryone Different` | `Pick who you're talking to—your boss, a close friend, an elder, a stranger—and say the same thing to each. Watch the words shift with the person, and drill it until switching feels automatic.` |

각 기능의 `children`에는 현재 공용 계약이 요구하는 `Get early access` 텍스트 링크만 둔다. 기능별 신규 목업, 이미지, 인터랙션 또는 K-culture 디자인 children은 이번 작업에서 만들지 않는다.

### Pricing

| 필드 | 고정 값 |
| --- | --- |
| `kicker` | `Choose your pace` |
| `title` | `Start with the Korean you need now.` |
| `subtitle` | `Replay real clips, prepare for everyday situations, and practice the right level of Korean for every person.` |
| monthly / annual / badge | `Monthly` / `Annual` / `Save 20%` |
| unit | `/mo` |
| footer note | `Subscriptions renew automatically. Cancel anytime.` |

| plan ID | name / badge | monthly / annual | description | CTA | feature IDs and labels |
| --- | --- | --- | --- | --- | --- |
| `free` | `Free` / 없음 | `$0` / `$0` | `Try the essentials with a small set of clips and everyday phrases.` | `Start free` | `clips`: `Selected dual-subtitle clips`; `phrases`: `Save up to 20 phrases`; `register`: `Basic speech-level practice` |
| `plus` | `Plus` / `Most popular` | `$4.99` / `$3.99` | `Build a daily habit across clips, real-life situations, and relationship-based Korean.` | `Start Plus` | `unlimited`: `Unlimited clip lessons`; `situations`: `Full real-life situation library`; `drills`: `Unlimited register drills`; `review`: `Personal phrase review` |
| `premium` | `Premium` / 없음 | `$9.99` / `$7.99` | `Get the complete learning experience with deeper practice and early access to new tools.` | `Go Premium` | `everything`: `Everything in Plus`; `pronunciation`: `Pronunciation feedback`; `practice`: `Personalized practice sets`; `early-access`: `Early access to new features` |

`plus`만 기존 `featured: true`를 사용한다. 이 필드는 기존 `PricingPlan` 계약의 현재 표현 의미를 재사용하며 새로운 임시-mode Boolean을 추가하지 않는다.

### Final CTA

| 필드 | 고정 값 |
| --- | --- |
| `badge` | `Built for your K-life` |
| `title` | `Understand the moment. Say what fits.` |
| `description` | `Learn from the culture you already love, then practice the Korean that works in clips, daily life, and every relationship.` |
| action `early-access` | label `Get early access`, href `/k-culture/early-access`, variant `primary` |
| note `clips` | `Real clips, replayable line by line` |
| note `practice` | `Real-life and relationship-based practice` |
| ghost words | `WATCH`, `SPEAK` |

### FAQ

| FAQ ID | question | answer |
| --- | --- | --- |
| `clips` | `What can I learn from a clip?` | `You can view Korean and your language side by side, replay any subtitle, understand words in context, and save natural phrases for review.` |
| `real-life` | `Is this only for K-drama and K-pop?` | `No. You can also practice Korean for everyday situations in Korea, including hospitals, city offices, and part-time jobs.` |
| `register` | `Will it help me speak differently to different people?` | `Yes. You can practice the same meaning for a boss, close friend, elder, or stranger until switching speech levels feels natural.` |

## 고정 TypeScript·컴포넌트 계약

이번 작업은 공용 Hero의 미디어 없는 명시적 조합을 허용하기 위해 `packages/contracts/src/landing.ts`의 `HeroProps.children`만 선택적으로 완화한다. `packages/contracts/src/shared-feature.ts`를 포함한 다른 계약은 변경하지 않는다.

- Hero: `HeroContent`, 선택적 `HeroProps.children`, `landingTestIds.hero`, `landingTestIds.heroCta`, `landingTestIds.heroHighlights`
- Navbar: `NavbarProps`, `NavbarAppearance`, `NavbarTextLogo`, `navbarTestIds`
- Proof: `ProofMetric`과 K-culture 전용 `KCultureProofStrip`의 기존 `metrics`, `title` props
- Feature: `FeatureItem`, `SharedFeatureTemplateProps`, `FeatureEarlyAccessAction`, `sharedFeatureTestIds`
- Pricing: `PricingContent`, `PricingSectionProps`, `landingTestIds.pricing*`
- Final CTA: `CtaContent`, `CtaSectionProps`, `landingTestIds.cta*`
- FAQ: `FooterProps`, `FooterFaqItem`, `footerTestIds`

앱별 기능 ID의 닫힌 집합은 `clips | real-life | register`다. 공용 계약을 K-culture 전용 union으로 좁히지 않으며 `apps/k-culture/src/app/content.ts`의 정적 데이터에서 `satisfies`로 검증한다.

## 고정 test-id 계약

| 영역 | 고정 값 |
| --- | --- |
| 앱 루트 | `landing:k-culture` |
| Navbar | `navbar`, `navbar-logo`, `navbar-desktop-navigation`, `navbar-how-it-works`, `navbar-pricing`, `navbar-language`, `navbar-language-menu-content`, `navbar-try`, `navbar-mobile-menu-trigger`, `navbar-mobile-menu-content` |
| Hero | `hero`, `hero-cta`, `hero-highlights`, `hero-highlight:clips`, `hero-highlight:real-life`, `hero-highlight:register`; `hero-media`는 존재하지 않음 |
| Proof | `k-culture-proof-strip`, `k-culture-proof:clips`, `k-culture-proof:situations`, `k-culture-proof:relationships` |
| Feature 1 | `shared-feature:k-culture-clips` 및 기존 `:number-label`, `:header`, `:subheader`, `:content`, `:early-access-cta` suffix |
| Feature 2 | `shared-feature:k-culture-real-life` 및 같은 suffix |
| Feature 3 | `shared-feature:k-culture-register` 및 같은 suffix |
| Pricing | `pricing-section`, `pricing-billing`, `pricing-billing:monthly`, `pricing-billing:annual`, `pricing-plan:free`, `pricing-plan:plus`, `pricing-plan:premium` |
| Final CTA | `cta-section`, `cta-action:early-access`, `cta-note:clips`, `cta-note:practice`, `cta-ghost` |
| Footer | `footer`, `footer-logo`, `footer-copyright`, `footer-faq`, `footer-faq-item:clips`, `footer-faq-item:real-life`, `footer-faq-item:register` |

테스트는 role/name과 노출 카피를 우선하고 test-id는 반복 영역을 한정할 때만 사용한다. test-id를 CSS 선택자로 사용하지 않는다.

## 데이터·이벤트 흐름

```text
apps/k-culture/src/resources.ts (순서가 고정된 8개 locale의 완전한 정적 문자열)
  → apps/k-culture/src/i18n.ts (locale registry, route, lang/dir, canonical/hreflang)
  → I18nRuntime.translate
  → apps/k-culture/src/app/content.ts (기존 공용 계약을 만족하는 정적 객체)
  → apps/k-culture/src/app/App.tsx (명시적 섹션 조합)
      ├→ 공용 표현 컴포넌트
      ├→ feature CTA → analytics.track({ name: "feature_cta_clicked", featureId })
      └→ final CTA   → analytics.track({ name: "cta_clicked" })
```

API, CMS, fetch, 전역 상태와 새 훅은 없다. 분석 tracker의 비동기 결과는 링크 이동의 선행 조건이 아니며 기존 이벤트 계약을 변경하지 않는다.

## 정확한 파일 경계

| 경로 | 소유 작업 | 금지 경계 |
| --- | --- | --- |
| `docs/specs/k-culture-temporary-template.md` | 이 작업의 계약 단일 출처 | 구현 세부·픽셀 값 추가 금지 |
| `apps/k-culture/src/resources.ts` | 고정 순서 8개 locale의 완전한 번역, `K-zip` 서비스명·저작권과 위 고정 카피 | 영어 fallback, raw key, component markup, 분석 로직 금지 |
| `apps/k-culture/src/i18n.ts` | 8개 locale registry 순서, locale route, `lang`/`dir`, canonical과 8개 hreflang + `x-default` metadata 입력 | 9번째 locale, `ar` 외 RTL, 번역 카피 소유 금지 |
| `apps/k-culture/src/app/content.ts` | Navbar appearance·K-zip 텍스트 로고·목적지, Footer K-zip 텍스트 로고·저작권, ID, 정적 콘텐츠 객체, 기존 contracts `satisfies` | JSX, styling, fetch/state 금지 |
| `apps/k-culture/src/app/App.tsx` | Hero → Proof → Features → Final CTA → Pricing 순서와 이벤트 연결, Hero children 생략, feature ID/test-id 합성 | Pricing/CTA 순서 변경, Hero media/placeholder 및 기능 visual children 추가, 공용 컴포넌트 내부 수정 금지 |
| `apps/k-culture/src/features/k-culture/KCultureProofStrip.tsx` | 기존 proof 구조에 새 정적 데이터 표시 | 신규 API/state 및 디자인 재구성 금지 |
| `apps/k-culture/src/app/App.test.tsx` | 영어 기준 카피, 섹션, ID, CTA 링크·이벤트 계약 검증 | 스타일 상세 assertion 금지 |
| `apps/k-culture/src/app/localization.integration.test.tsx` | 8개 locale 순서·키 완결성·route·selector·K-zip 불변식·lang/dir·canonical/hreflang과 locale 전환 회귀 검증 | 번역 문구를 영어와 동일하게 강제 금지 |
| `apps/k-culture/src/styles.css` | 기존 템플릿을 정상 렌더링하는 데 필요한 최소 연결만 | Hero media/placeholder와 K-culture 최종 디자인·신규 children 스타일 금지 |
| `e2e/`의 K-culture 관련 spec/snapshot | 모바일·데스크톱, 접근성, overflow, 임시 배포 전 회귀 검증 | 공용 템플릿의 의도적 기존 시각 변경 금지 |
| Vercel project/config | K-culture 앱 임시 preview 배포 | 운영 도메인·production 승격 금지 |

`packages/contracts/src/landing.ts`, `packages/contracts/src/shared-feature.ts`, `packages/ui`의 공용 JSX/CSS, `apps/k-drama`, `apps/ai-communication`은 읽기·회귀 검증 대상이며 이번 구현의 수정 대상이 아니다.

## 검증 계약

1. `pnpm --filter @landing/contracts typecheck`와 K-culture 앱 typecheck가 통과한다.
2. K-culture 단위·통합 테스트가 위 기준 카피, Hero의 `hero-media` 부재, 고정 ID, `white | soft | white`, 기능별 텍스트 early-access href와 분석 payload를 검증한다.
3. 정확한 순서의 8개 지원 locale마다 모든 신규 키와 번역값이 존재하고 영어 fallback 또는 raw key 문자열이 사용자 화면에 노출되지 않는다.
4. 루트 `build`, `typecheck`, `lint`, `test`가 통과하며 K-drama와 AI Communication 테스트 결과가 green이다.
5. 모바일·데스크톱에서 기존 공용 템플릿 구조, 문서 순서, 키보드 포커스, 가로 overflow 없음과 axe serious/critical 0건을 확인한다.
6. Vercel preview URL에서 locale 진입점과 `/k-culture/early-access` 링크 목적지가 접근 가능하다.
7. Navbar 단위·통합 테스트가 `violet-editorial`, role `link`와 접근 가능한 이름 `K-zip`인 텍스트 로고, 이미지 로고의 부재, `#proof`, `#pricing`, locale selector, `#cta`와 고정 Navbar test-id를 검증한다.
8. DOM 순서 검증이 Hero → Proof → Features → Final CTA → Pricing → Footer/FAQ 순서를 확인한다.
9. 모든 locale의 Navbar·Footer 로고가 정확히 `K-zip`으로 노출되고, `footer-logo`가 `#top` 링크이며, `footer-copyright`가 `2026`과 `K-zip`을 포함하는지 검증한다.
10. locale 통합 테스트가 selector option을 `ko-KR`, `en-US`, `ja-JP`, `vi-VN`, `th-TH`, `zh-CN`, `zh-TW`, `ar` 순서로 확인하고 각 `/locale/` route, 현재 option 한 개, locale 전환 후 대응 콘텐츠를 검증한다.
11. SEO 검증이 각 locale route의 self-canonical, 8개 hreflang alternate 전체와 `/en-US/` x-default를 확인하며 중복·누락이 0건인지 검증한다.
12. 각 route의 `<html lang>`이 locale과 일치하고 `dir="rtl"`은 `ar` 한 곳에만, `dir="ltr"`은 나머지 7개에 적용되는지 모바일·데스크톱에서 검증한다.

## 계약 고정 후 병렬 실행 단위

1. **콘텐츠·데이터**: `resources.ts`와 `content.ts`에 기준 카피, 8개 locale 전체 번역, K-zip 불변식과 고정 ID를 적용한다.
2. **locale·SEO**: `i18n.ts`와 문서 metadata 경계에 고정 locale 순서, 8개 route, selector 대상, lang/dir, canonical/hreflang과 x-default를 적용한다.
3. **앱 조합**: `App.tsx`에서 Hero children을 생략하고, 각 Feature에는 기존 텍스트 early-access CTA만 children으로 유지해 Hero → Proof → Features → Final CTA → Pricing → Footer/FAQ 순서와 이벤트를 연결한다.
4. **테스트**: 고정 카피/test-id/이벤트 단위 테스트, 8개 locale route·selector·SEO·RTL 통합 테스트와 viewport·접근성 E2E를 독립 갱신한다.
5. **회귀 검증**: 공용 패키지, K-drama, AI Communication을 수정하지 않은 상태에서 루트 품질 게이트와 시각 회귀를 실행한다.
6. **배포**: green 결과를 입력으로 K-culture만 Vercel preview에 배포하고 8개 locale URL을 smoke test한다.

상태·API 작업은 없다. 1~4는 이 계약을 기준으로 병렬 진행할 수 있고, 5는 병합 뒤, 6은 모든 검증 green 뒤 순차 실행한다.

## 계약 고정

이 문서의 서비스명 `K-zip`, 고정 순서의 8개 locale과 전체 번역·route·selector·canonical/hreflang·RTL 계약, 영어 기준 카피, ID, 섹션 순서, Hero children·placeholder 부재, Feature의 기존 텍스트 CTA 외 visual children 부재, test-id와 파일 소유 경계를 K-culture 임시 템플릿의 고정 계약으로 선언한다. 변경이 필요하면 구현보다 이 문서를 먼저 갱신한다.
