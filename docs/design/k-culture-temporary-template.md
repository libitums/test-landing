# K-culture 공용 템플릿 임시 페이지 디자인 고정

## 범위와 재사용 결정

이 임시 페이지는 K-culture 최종 디자인을 만들지 않는다. K-drama와
AI Communication이 함께 소비하는 공용 랜딩 구성과 현재 K-culture의 공용
프리미티브 조합을 그대로 유지하고, 표시 문구만 K-culture 기능 메시지로
교체한다.

문서·시각 순서는 모든 뷰포트에서 다음과 같이 고정한다.

```text
Navbar
Hero (copy + CTA; 신규 media children 없음)
Proof
Feature 01 (copy + 기존 Early Access CTA; 신규 feature children 없음)
Feature 02 (copy + 기존 Early Access CTA; 신규 feature children 없음)
Feature 03 (copy + 기존 Early Access CTA; 신규 feature children 없음)
Pricing
Final CTA
Footer (FAQ + navigation/legal)
```

- Navbar, Hero, `SharedFeatureTemplate`, Pricing, Final CTA, FAQ/Footer의 DOM 구조,
  appearance, 상태와 간격은 `@landing/ui`의 현재 공용 구현을 그대로 재사용한다.
- Proof는 현재 K-culture `KCultureProofStrip`의 구조와 시각 표현을 유지하며
  문구·수치만 임시 콘텐츠로 교체한다.
- Hero에 K-drama 카드나 AI Communication showcase를 복제하지 않는다. 현재
  K-culture 전용 placeholder media도 임시 배포에서는 제거하여, 공용 Hero가
  `children` 미전달 상태에서 빈 표면이나 media 간격을 만들지 않는 계약을 따른다.
- Feature 01~03에는 K-drama/AI Communication의 데모, 이미지, 카드, 애니메이션
  또는 K-culture 전용 디자인 children을 넣지 않는다. 공용 번호·제목·설명과
  기존 텍스트형 Early Access CTA만 표시한다.
- Pricing, Final CTA와 FAQ/Footer는 사용자의 “Feature 1~3 외에도 모두 포함”
  요구에 따라 유지하되, 시각 variant를 추가하지 않는다.

## 토큰 결정

신규 토큰은 도입하지 않으며 `packages/design-tokens/src/tokens.css`도 변경하지
않는다. 이번 작업은 콘텐츠 교체와 공용 구조 재사용만으로 충족되므로 앱 전용
색상, 치수, 타이포, 그림자, 모션 토큰이 필요하지 않다.

| 영역 | 재사용하는 토큰·계약 |
| --- | --- |
| 페이지·컨테이너 | `--color-bg`, `--color-fg`, `--content-max`, `--space-8`, `--space-4` |
| Hero | `docs/design/shared-hero.md`와 공용 `.hero__*` 계약 |
| Proof | 현재 K-culture `.proof-strip`, `.proof-grid`와 기존 semantic color/spacing/type 토큰 |
| Feature | `docs/design/shared-feature-ui.md`; `--color-bg`, `--color-surface-soft`, `--color-step`, `--color-subtle-fg`, 공용 spacing/type 토큰 |
| Pricing | 현재 공용 `.pricing__*` 계약과 기존 semantic action/surface/card 토큰 |
| Final CTA | 현재 공용 `.cta__*` 계약과 기존 CTA/focus/motion 토큰 |
| FAQ/Footer | `docs/design/shadcn-footer.md`와 기존 footer/accordion 토큰 |

기존 토큰 조합의 WCAG AA 보장을 그대로 상속한다. 본문은
`--color-fg`/`--color-muted-fg`/`--color-subtle-fg`와 대응 표면을 사용하고,
핵심 행동은 공용 CTA/Button의 전경·배경 및 `--focus-ring` 계약을 유지한다.

## 영역별 시각 계약

### Hero와 Proof

- Hero는 공용 중앙형 단일 열의 title → subtitle → CTA 순서를 유지한다.
  텍스트는 고정 높이, line clamp, ellipsis 없이 자연스럽게 줄바꿈한다.
- Hero의 default, hover, active, focus-visible과 reduced-motion 동작은 공용 Hero
  CTA 상태를 그대로 사용한다. loading/error/disabled 상태를 새로 만들지 않는다.
- Proof는 현재 3열 metric grid를 유지하고 모바일에서는 같은 DOM 순서의 한 열로
  전환한다. 임시 카피가 길어져도 metric label/value를 자르거나 고정 높이에
  맞추지 않는다.

### Feature 01~03

- 세 섹션은 `white` → `soft` → `white` appearance, `01` → `02` → `03` 번호,
  header와 subheader 위계를 그대로 유지한다.
- `SharedFeatureContent`에는 기존 텍스트형 Early Access CTA만 둔다. 별도 카드,
  mockup, 이미지, 영상, 장식 배경과 애니메이션은 만들지 않는다.
- Early Access CTA의 default/hover/active/focus-visible은 공용 text Button 계약을
  재사용한다. feature별 색상이나 동작 variant는 없다.
- 긴 영문과 추후 번역문은 헤더·서브헤더의 intrinsic block size를 늘린다.
  줄 수 제한, 고정 높이와 가로 overflow를 허용하지 않는다.

### Pricing, Final CTA와 FAQ/Footer

- Pricing의 kicker, 제목, 설명, billing toggle, plan cards, footer note 구조와
  desktop 다열/mobile 한 열 동작을 유지한다. 선택·포커스·featured 상태도 공용
  구현에서 변경하지 않는다.
- Final CTA의 badge, 제목, 설명, primary pill action, notes, ghost words 구조와
  중앙 정렬을 유지한다. 문구 변경 때문에 장식 또는 레이아웃 variant를 만들지
  않는다.
- FAQ는 Footer의 Accordion open/closed, hover, active, focus-visible 상태와
  키보드 계약을 그대로 사용한다. navigation/legal과 함께 기존 Footer 문서 순서를
  유지한다.
- 각 영역의 empty/loading/error 상태는 이번 정적 콘텐츠 범위에 없다. 필수
  콘텐츠는 완성된 정적 데이터로 제공하며 불완전한 카드나 FAQ 항목을 placeholder로
  렌더하지 않는다.

## 반응형·국제화 계약

- 데스크톱 우선 레이아웃과 `--breakpoint-mobile`의 현재 값에 동기화된
  `48rem` 미디어 경계를 유지한다. 새 breakpoint를 만들지 않는다.
- 모바일에서도 Navbar → Hero → Proof → Feature 01~03 → Pricing → Final CTA →
  Footer의 콘텐츠 순서와 핵심 행동 순서를 바꾸지 않는다.
- 공용 `Container` 인라인 여백은 desktop `--space-8`, mobile `--space-4`를,
  공용 `Section` 블록 리듬은 desktop `--space-24`, mobile `--space-16`을 따른다.
- CJK, 긴 영어, pseudo-locale과 RTL에서 텍스트는 자연스럽게 줄바꿈하며 논리적
  속성과 상위 `dir`을 따른다. 텍스트 겹침, 잘림, 의도하지 않은 가로 스크롤은
  실패다.
- 모션은 현재 공용 컴포넌트에 있는 상태 전환만 허용한다.
  `prefers-reduced-motion: reduce`에서는 비필수 전환을 제거하는 기존 계약을
  유지하며 임시 페이지 전용 모션은 추가하지 않는다.

## 구현·시각 검증 기준

1. K-culture가 공용 시각 구조와 appearance를 유지하며 제공된 Feature 01~03
   문구를 표시한다.
2. Hero와 Feature 01~03에 앱 전용 media/design children, 이미지, mockup 또는
   애니메이션이 새로 표시되지 않는다.
3. Proof, Pricing, Final CTA와 FAQ/Footer가 기존 공용 스타일과 상태를 유지한다.
4. desktop/mobile, 긴 문구와 RTL에서 순서 변경, clipping, 겹침과 가로 overflow가
   없다.
5. focus-visible과 text/action 대비가 기존 WCAG AA 토큰 계약을 유지하고,
   reduced-motion에서 정보나 동작이 손실되지 않는다.
6. K-drama와 AI Communication의 시각 구현이나 앱 전용 children은 변경되지 않는다.

## 디자인 고정

신규 토큰 없음, 신규 시각 variant 없음, K-culture 최종 디자인 및 디자인
children 없음으로 고정한다. 구현은 정적 카피와 섹션 포함 여부만 변경할 수 있고,
공용 컴포넌트의 구조·스타일·반응형·상태 계약을 변경하려면 이 문서를 먼저
갱신해야 한다. 미해결 디자인 질문은 없다.
