# k-drama.pen ↔ 코드 매핑

## 기준

- 원본 대리(proxy): `/private/tmp/claude-501/-Users-sehyeounkim-landing-test-landing/85db1e1d-b157-477a-986c-5da6e0b7b3b1/scratchpad/k-drama-pen-extract.md`
  (Pencil MCP `k-drama-pen-extract.md`, 이하 "추출본")
- 계약: `docs/specs/k-drama-pen-alignment.md`
- 이미 고정된 기록(재작업 안 함): `docs/design/k-drama-hero-pen.md`,
  `docs/specs/k-drama-hero-pen.md` — Hero 프레임 `kdsPI`의 토큰·시각 계약은
  여기서 이미 확정됐으므로, 이 문서는 Hero를 표에는 포함하되 세부 재설계는
  하지 않고 참조만 한다.
- `docs/design/k-drama-code-inventory.md`(병렬 단위, 이 문서 작성 도중 생성됨)는
  hex 리터럴 100건, `rgb()` 리터럴 69건, `rem` 리터럴 147건 등 생값 전수 감사를
  전담한다. 이 문서를 수정하지 않았고, §4 "토큰 대응표"의 대표 사례(그리고 §3
  관찰 6의 "102건" 집계는 본 문서 자체의 `grep` 결과)는 교차 검증용 발췌다.
  전수 목록은 인벤토리 문서를 단일 출처로 본다.

## 1. 매핑표 — `.pen` 최상위 섹션 7개

| # | `.pen` 노드 ID · 이름 | 코드 경계(파일:심볼) | DOM 앵커 | 상태 |
|---|---|---|---|---|
| 1 | `kdsPI` Talkie Landing Hero | `apps/k-drama/src/app/App.tsx:54-164` (`Hero` + 3 visual card divs), 스타일 `apps/k-drama/src/styles.css:1-446` | `div.k-drama-hero` → `[data-testid="hero"]` | 일치 (`docs/design/k-drama-hero-pen.md`에서 이미 고정) |
| 2 | `HL1Yl` Feature 01 · Korean dual subtitles | `apps/k-drama/src/app/App.tsx:169-196` (`SharedFeatureTemplate` index 0) + `apps/k-drama/src/features/k-drama/KDramaDualSubtitleFeature.tsx` | `#features` 내 `[data-testid="k-drama-subtitles"]` | 보정필요 (하위 노드 일부 미구현·근사, §3-4 참조) |
| 3 | `nJAKc` Feature 02 · YouTube URL to Lesson | 동일 반복, index 1, `apps/k-drama/src/features/k-drama/KDramaYoutubeLessonFeature.tsx` | `[data-testid="k-drama-youtube"]`, 배경 `soft` variant | 일치 (배경색 정확히 매칭, §4 토큰 대응표) |
| 4 | `pAVpV` Feature 01 · 기억이 이어지는 친구(실제 short-form) | 동일 반복, index 2, `apps/k-drama/src/features/k-drama/KDramaShortformFeature.tsx` | `[data-testid="k-drama-shortform"]` | 보정필요 (템플릿 그리드·서브 카피 박스 미구현, §3-4 참조) |
| 5 | `FSoGr` Talkie Final CTA · 밀어서 시작하기 | `apps/k-drama/src/app/App.tsx:200-202` (`CtaSection`), 스타일 `packages/ui/src/styles/ui.css:770-943` | `div#cta` → `[data-testid="cta-section"]` | 보정필요 (섹션 순서, §3-1) — 내부 구성 자체는 일치 |
| 6 | `ozZuT` Talkie Pricing | `apps/k-drama/src/app/App.tsx:197-199` (`PricingSection`), 스타일 `packages/ui/src/styles/ui.css:1012-1200` | `div#pricing` → `[data-testid="pricing-section"]` | 보정필요 (섹션 순서, §3-1) — 내부 구성 자체는 일치 |
| 7 | `RHIbx` Pricing Notices Footer | `packages/ui/src/sections/footer.tsx` (공유 `Footer`, `createFooterProps`는 `apps/k-drama/src/app/content.ts:43-84`) | `LandingShell` footer 슬롯 → `[data-testid="footer"]` | 보정필요 (콘텐츠 성격 불일치, §3-3) |

추가: 추출본의 `dlClE` "Problem Proof"는 최상위 섹션이 아니라 `kdsPI` 내부
자식이지만, 코드에서는 `div#proof` (`KDramaProofStrip`, `apps/k-drama/src/app/App.tsx:166-168`)로 **별도 최상위 섹션**이 됐다. 이는 §3-2에서 판정한다.

## 2. 하위 노드 매핑

### 2.1 `kdsPI` Hero (참조만, 재설계 없음)

이미 `docs/design/k-drama-hero-pen.md`에서 고정됨. `XhXaR`/`OmO2q`/`Bv805` →
`Hero` 컴포넌트 copy 슬롯, `EuYuY`/`J6fKNt`/`D29TJP` → `.k-drama-hero-card--video/--lesson/--feed` (`App.tsx:56-163`). `GVmtS` Navigation은 아래 §3-6(부가) 참조.

### 2.2 `HL1Yl` Feature 01 (Korean dual subtitles)

| 노드 | 코드 |
|---|---|
| `PRUlv` Step 01 Badge | `SharedFeatureTemplate` `numberLabel="01"` → `.shared-feature__number` (`packages/ui/src/sections/shared-feature-template.tsx:28-30`) |
| `Ok3gL`/`JKJF6`/`DiJZV` Feature Copy | `headerText`/`subheaderText` props ← `content.features[0].title/description` (`apps/k-drama/src/app/content.ts:100-105`) |
| `PEe5u` Primary Full-size Device Mockup | `.k-drama-feature__phone--primary` (`KDramaDualSubtitleFeature.tsx:108-114`) |
| `nlzxX` Secondary Device Mockup | `.k-drama-feature__phone--secondary` (`KDramaDualSubtitleFeature.tsx:68-74`) |
| `vcnZK` Main Device Action Rail (버튼 6개) | `.k-drama-feature__side-actions` (`KDramaDualSubtitleFeature.tsx:75-107`) — 아이콘 6개는 있으나 라벨(Shadowing/Listening/Bookmark/Like/Dislike/Replay)이 접근 가능한 텍스트로 노출되지 않음(`aria-hidden="true"` 컨테이너 안, 커스텀 svg만) → **미구현(접근성 이름 없음)**, 별도 접근성 에이전트 확인 필요 |
| `yGpTs` 자막 UI, 시간, 진행바 | `.k-drama-feature__scene-caption`, `.k-drama-feature__player-time`, `.k-drama-feature__player-progress` (`KDramaDualSubtitleFeature.tsx:20-59`) |

### 2.3 `nJAKc` Feature 02 (YouTube URL to Lesson)

| 노드 | 코드 |
|---|---|
| `SybHh` Step 01 Badge | `SharedFeatureTemplate` `numberLabel="02"` |
| `dVzGK` URL UI | `.k-drama-feature__youtube-box--url` (`KDramaYoutubeLessonFeature.tsx:4-14`) |
| `jBhNy` YouTube Download Progress Tile | `.k-drama-feature__youtube-box--progress` (`KDramaYoutubeLessonFeature.tsx:15-24`) |
| `y12Evd` Custom Content | `.k-drama-feature__youtube-box--lesson` (`KDramaYoutubeLessonFeature.tsx:25-43`) |
| `HLq0i`/`e3Erzm` Custom Contents List(그리드) | `.k-drama-feature__youtube-box--library` + `.k-drama-feature__saved-cards` (`KDramaYoutubeLessonFeature.tsx:44-128`) — 원본은 grid(2열), 코드는 4개 카드의 flex/stack 배치. 배치 방식은 다르지만 4개 콘텐츠 카드라는 개수·정보는 일치 |

### 2.4 `pAVpV` Feature 03 (실제 컨텐츠: short-form)

| 노드 | 코드 |
|---|---|
| `gwVDr` Step 01 Badge | `SharedFeatureTemplate` `numberLabel="03"` |
| `IlTrf`/`Qwl1V` 헤드라인·설명 | `content.features[2].title/description` |
| `n9rEb1` Short-form Sub Copy Boxes (4개, `#F5F3FF`, radius 8) | **미구현.** `SharedFeatureTemplate`는 header/subheader/children만 제공하고(`shared-feature-template.tsx:1-47`) 4개 보조 카피 박스에 대응하는 슬롯이 없다. `KDramaShortformFeature.tsx`에도 대응 요소 없음 |
| `rKRnG` Primary Full-size Device Mockup(Templates 9개 타일) | **부분 미구현.** CSS 클래스 `.k-drama-feature__template-grid`, `.k-drama-feature__template-label`(`apps/k-drama/src/styles.css:1899-1918`)는 존재하지만 어떤 `.tsx`도 이 클래스를 사용하지 않는 **죽은 CSS**(orphaned). 실제 렌더는 `ShortformPhoneContent`의 "Speaking Challenge" UI로 완전히 다른 컨셉 |
| `w0PW2` Shorts Feed 목업 | `.k-drama-feature__phone--shortform` + `YoutubeShortsPhoneContent` (`KDramaShortformFeature.tsx:116-178`) |
| 챌린지 오버레이 `i8zKZU`/`SK05z`/`VI1iJ` (Make Short / DO Challenge!) | `ShortformPhoneContent`의 `.k-drama-feature__challenge-guide`(`KDramaShortformFeature.tsx:54-61`) 문구 "Repeat after the scene" / "아저씨 사랑해요"로 **의미는 유사하되 텍스트 자체는 다름** — 원본의 정적 라벨 대신 코드가 애니메이션 시퀀스(카운트다운→녹화)로 대체 |

### 2.5 `FSoGr` Final CTA

| 노드 | 코드 |
|---|---|
| `gdrQf` Promise Badge | `.cta__badge` (`packages/ui/src/styles/ui.css:816-825`) ← `content.cta.badge` |
| `yf1u0`/`zVa7d` 헤드라인·설명 | `.cta__title`/`.cta__description` ← `content.cta.title/description` |
| `moB7I`/`EV6dd` Ghost Word (SPEAK/FREELY) | `.cta__ghost--start`/`.cta__ghost--end` (`ui.css:784-803`) ← `content.cta.ghostWords` |
| `yoBWY` Slide To Start | `.cta__pill` (`ui.css:849-899`) — 원본은 "슬라이드형" 인터랙션 은유(트랙+노브), 코드는 hover/seen 상태에서 배경이 차오르는 필인 애니메이션(`cta__pill-fill`)으로 대체 |
| `wPFnp` Trial Notes | `.cta__notes` ← `content.cta.notes` |

### 2.6 `ozZuT` Pricing

| 노드 | 코드 |
|---|---|
| `hBcJO` Pricing Header(kicker/title/subtitle/billing toggle) | `.pricing__header` 하위 전부 (`pricing-section.tsx:25-55`) |
| `p0jXAI` Pricing Plans(3개, `JYZcF` 강조) | `.pricing__plans` → `.pricing__plan--featured` (`pricing-section.tsx:57-88`, `ui.css:1098-1113`) |
| `Bm9c0` Pricing Footer Note | `.pricing__note` ← `content.pricing.footerNote` (`pricing-section.tsx:90-92`) — 텍스트("Subscriptions renew automatically…")까지 정확히 일치 |

### 2.7 `RHIbx` Pricing Notices Footer

| 노드 | 코드 |
|---|---|
| `f6uSQ` "Before you start" 헤딩 | **미구현.** 대응하는 `footer__heading`은 `content.faq.heading` = "Frequently asked questions"로 다른 문구·다른 성격(footer.tsx:70) |
| `MEe31` 4항목 아코디언(무료체험/자동갱신/플랜변경/통화량) | **미구현.** `content.faq.items`는 2항목(availability/workflow)이며 가격 관련 내용이 아님(`content.ts:60-75`) |
| `ME0sD` Footer Bottom(브랜드+법적 링크) | `.footer__bottom` (`footer.tsx:91-110`) — 구조는 일치(로고+링크+copyright) |
| 상단 stroke `#E8E5EB` 1px | **미구현/미확인.** 공유 `Footer`에 상단 보더 스타일 없음(§4 참조) |

## 3. 판정 목록 — 구조적 관찰 6가지 + 추가 발견

| 항목 | 원본 | 구현 | 판정 | 근거 |
|---|---|---|---|---|
| **관찰 1. 섹션 순서** | `... → Feature03(4) → Final CTA(5) → Pricing(6) → Footer(7)` | `apps/k-drama/src/app/App.tsx:169-202`: `#features → #pricing(197) → #cta(200) → Footer(LandingShell footer 슬롯)` — CTA와 Pricing이 뒤집힘 | **보정 대상** | `docs/design/landing-monorepo.md`의 두 와이어프레임(A/B)은 모두 `CTA band → Footer` 순서만 정의하고 Pricing 앞뒤 배치에 대한 규정이 없다(24-58행). k-drama 전용 순서 결정을 문서화한 곳이 없으므로 근거 부재 → 보정 대상 |
| **관찰 2. Proof strip 위치** | `dlClE` "Problem Proof"는 `kdsPI`(Hero) 프레임 **내부**, `XhXaR` Hero Copy의 자식 | `div#proof`가 Hero 바깥의 독립 섹션(`App.tsx:166-168`), `KDramaProofStrip`은 자체 `<section className="section proof-strip">`(`KDramaProofStrip.tsx:10`) | **의도적 deviation** | `docs/design/k-drama-hero-pen.md:8-27`가 Hero의 기준 노드를 `XhXaR/OmO2q/Bv805/EuYuY/J6fKNt/D29TJP`로 명시하고 CTA·highlights는 "공유 Hero 순서로 배치"한다고만 적었을 뿐 proof를 Hero 내부 자식으로 넣으라는 요구가 없다. 커밋 로그(`79c4a97 feat(ai-communication): swap comparison for proof strip`, `199f596`)가 proof strip을 앱 공통 패턴의 별도 섹션으로 도입한 의도적 리팩터임을 보여준다. 다만 이 근거는 Hero 문서 자체가 아니라 커밋 이력에서 유추한 것이므로 완전히 문서화되지는 않았다 — §5 미해결 질문에도 기록 |
| **관찰 3. Footer 성격** | `RHIbx`는 가격 관련 4항목 아코디언("무료 체험", "자동 갱신", "플랜 변경", "통화 제공량") + "Before you start" 헤딩 | 공유 `Footer`의 FAQ는 2항목(가용성/신규 스토리 발견)이며 가격과 무관, 헤딩은 "Frequently asked questions"(`content.ts:60-75`, `footer.tsx:70`) | **보정 대상** | `docs/design/landing-monorepo.md:55`가 두 와이어프레임 모두에 "FAQ" 섹션을 배치한 것은 사실이나, 이는 `.pen`보다 앞서 존재한 범용 플랫폼 와이어프레임이고 k-drama의 실제 콘텐츠가 pricing notice 대신 일반 FAQ 문구를 쓰는 이유를 설명하는 문서는 없다. `packages/contracts/src/footer.ts`의 FAQ 계약 자체는 임의의 질문/답변을 받을 수 있으므로 콘텐츠만 교체하면 되는데 교체되지 않았다 → 근거 없는 콘텐츠 공백은 보정 대상 |
| **관찰 4. Feature 03 하위 카피 박스** | `n9rEb1` 4개(`#F5F3FF`, radius 8, h50) | 대응 요소 없음(§2.4) | **보정 대상(정확히는 미구현)** | 어떤 문서도 이 4개 박스를 의도적으로 제거한다고 말하지 않는다. `shared-feature-ui.md`는 `children` 슬롯이 "각 앱의 고유 표현"이라고만 규정해 4박스 포함 여부를 앱 재량에 맡기지만, 재량으로 뺐다는 기록이 없으므로 근거 부재 → 보정 대상 |
| **관찰 5. 폰트(Inter vs Funnel Sans)** | Hero 헤드라인 외에 Step Badge 라벨(`oFRKy` 등), short-form 헤드라인(`IlTrf`), pricing 헤드라인(`ufdWY`), ghost word(`moB7I`/`EV6dd`)에 **Funnel Sans** 사용 | 코드 전체가 단일 `--font-sans`(Inter 기반 스택, `packages/design-tokens/src/tokens.css:38-41`)만 사용. 저장소 어디에도 Funnel Sans `@font-face`나 로드 설정 없음(전체 리포 검색 결과 0건) | **의도적 deviation** | `docs/specs/shared-pricing.md:10` — "폰트는 레포 토큰(Inter)으로 적응([추론], Funnel Sans 미추가)"라고 **명시적으로 기록**됨. `docs/design/shared-feature-ui.md:19-20` 역시 "레퍼런스의 생 색상과 치수는 복사하지 않는다 … 의도적인 디자인 이탈은 없다"는 원칙 아래 헤더/서브헤더 타입을 기존 토큰(`--text-display`/`--font-bold`, `packages/design-tokens/src/tokens.css`)으로만 정의해 Funnel Sans를 채택하지 않았다. Step Badge, Ghost Word에 대해서는 별도 명시 문서가 없어 동일 원칙의 연장으로 간주했으나 이 부분은 §5 미해결 질문에 남긴다 |
| **관찰 6. 원본에 변수가 없어 생값→토큰 흡수가 코드 책임** | `get_variables` → `{}` | `apps/k-drama/src/styles.css`에서 hex 리터럴이 **102건** 발견됨(`grep -c` 결과, 예: `#7b61ff`(357행), `#111`(482행), `#ff0033`(213행), `#a78bfa`(132행) 등). `packages/ui/src/styles/ui.css:1112`에도 `box-shadow: 0 20px 48px #6d28d927;` 리터럴 1건 | **보정 대상 (범위 큼)** | `DESIGN.md` 9행 — "컴포넌트와 앱 스타일에 색상, 길이, 시간의 생값을 쓰지 않는다"를 정면으로 위반한다. Hero 카드(`.k-drama-hero-card*`, `styles.css:34-430`)는 이미 토큰화됐지만(§4), Feature 데모 영역(`.k-drama-feature*`, `styles.css:447-1940`)은 대부분 리터럴이다. 이 파일 전체의 정량 감사는 병렬 단위 `docs/design/k-drama-code-inventory.md`가 전담하므로 본 문서는 관찰이 사실임을 확인하고 대표 사례만 §4에 기록한다 |
| **추가 A. Navbar 브랜드 로고** | `E23si` "Talkie Brand"는 `enabled:false`(비활성)이고 실제 활성 로고는 `WMa96` "Baetter Logo · Hero Nav"(이미지, `images/beater-Photoroom.png`) | `createNavbarProps`(`content.ts:14-41`)의 `logo: { kind: "text", label: t("brand") }` — 텍스트 로고("Luma")만 사용, 이미지 로고 미사용. `apps/k-drama/public/images/`에 `beater-Photoroom.png` 없음 | **미해결(판정 보류)** | `packages/contracts/src/navbar.ts`에 `NavbarImageLogo`(`kind:"image"`) 계약이 이미 존재해 기술적으로는 가능하지만, k-drama가 텍스트 로고를 선택한 이유를 담은 문서가 없다. §5로 이관 |
| **추가 B. Pricing 강조 플랜 보더** | `JYZcF`는 `#7B61FF` **2px** 스트로크, 나머지 두 플랜은 각각 `#66616d`/`#E8E5EB` 1px로 서로 다름 | `.pricing__plan`은 전부 `var(--color-border)` 1px, `.pricing__plan--featured`만 `var(--color-editorial-accent)` 1px(`ui.css:1104-1113`) — 두께 통일(1px), 비강조 플랜 색상도 통일 | **의도적 deviation(추정) — 근거 약함** | `docs/design/shared-feature-ui.md`와 동일한 "생값 대신 시맨틱 토큰으로 위계 재현" 원칙의 연장으로 보이나, pricing 전용 design 고정 문서(`docs/design/shared-pricing.md`)가 저장소에 없다(spec만 존재). 명시적 근거가 없으므로 §5 미해결 질문에 남기고, 현재는 "약한 의도적 deviation"으로만 잠정 표시 |

## 4. 토큰 대응표

`.pen`에는 변수가 없으므로(`get_variables` → `{}`) 아래 대응은 전적으로 코드가
소유한 결정이다. Hero(`kdsPI`)의 토큰 결정은 `docs/design/k-drama-hero-pen.md`에
이미 있으므로 여기서는 그 결과만 인용하고, 나머지 6개 섹션 중심으로 정리한다.

| 원본 생값 | 등장 노드 | 사용 토큰 | 상태 |
|---|---|---|---|
| `#111111` | `OmO2q` headline 등 | `--color-editorial-fg` | 일치 (기존 고정) |
| `#5F6368` | `Bv805` subhead 등 | `--color-editorial-muted-fg` | 일치 (기존 고정) |
| `#fbf9f8` | `nJAKc` 섹션 배경 | `--color-surface-soft` (`packages/design-tokens/src/tokens.css:6`) | 일치 (정확한 hex 일치, `shared-feature-ui.md:24-30`에서 대비까지 계산) |
| `#FCFAF7` | `kdsPI`, `pAVpV` 섹션 배경 | 매핑 없음 — `pAVpV`(Feature 03)는 `--color-bg`(`#ffffff`)를 쓰는 `white` variant로 대체 | **토큰 부재(의도적 대체)** — `shared-feature-ui.md:84-88`의 white→soft→white 교대 규칙 때문에 3번째 섹션에 별도 토큰을 만들지 않음. `#FCFAF7` 자체를 위한 토큰은 존재하지 않는다 |
| `#6d5dfb`(도출값, 원본은 `#635bff`/`#7B61FF`/`#7b61ff` 노드별 상이) | `PRUlv`/`SybHh`/`gwVDr` Step Badge | `--color-step` → `--color-editorial-accent` (`tokens.css:28,31`) | 의도적 deviation — `shared-feature-ui.md:31-35`가 원본의 미세하게 다른 3개 hex를 단일 시맨틱 토큰으로 흡수한다고 명시 |
| `#7B61FF0A`(≈3.9% 알파) | `moB7I`/`EV6dd` ghost word | `--color-cta-ghost` = `rgb(123 97 255 / 5%)` (`tokens.css:36`) | 근사 일치 — RGB 성분(123,97,255)은 정확히 일치, 알파만 3.9%→5%로 근사. 별도 문서 없음(§5) |
| `#7b61ff`, `#635bff`, `#a78bfa`, `#312e81` 등 (feature 데모 내부 장식색) | `styles.css` 다수(357, 636, 132, 693행 등 — 렌더링되는 CSS). `#312e81`(1892, 1915행)은 §2.4에서 미구현으로 판정한 죽은 CSS(`template-grid`/`shortform-preview`) 안에만 존재해 실제로는 렌더되지 않는다 | **없음** — 리터럴 그대로 사용 | **토큰 부재** (§3 관찰 6) |
| `#ff0033`/`#FF0033`/`#FF174A` (YouTube 진행 링/자막 진행바 accent) | `e89wo`, `AcQFJ`, `WOV6F`, `kMkae` 등 | **없음** — `styles.css:213,304,858,868,1115` 등에서 리터럴 | **토큰 부재** |
| `#111`/`#000`/`#050505`/`#0A0A0F`/`#0B0B0F` (디바이스 목업 배경) | `PEe5u`, `nlzxX`, `rKRnG`, `w0PW2`, `EuYuY` | 부분 일치 — Hero의 `EuYuY`/`D29TJP`만 `--color-editorial-fg` 사용(고정 문서). Feature 섹션 공통 `.k-drama-feature__phone` 베이스가 `#111` 리터럴(`styles.css:482,484`)을 쓰고, 개별 목업(`--phone--primary::before/after`, `--phone--shortform` 등)도 `#000` 리터럴(`styles.css:494,591,698` 등)을 반복 사용 | **토큰 부재** (Hero 밖 영역) |
| `#6d28d927` (강조 플랜 그림자, 알파 포함 hex) | 원본에 없음(원본 `JYZcF` shadow는 표준 카드 그림자만 서술) | **없음** — `packages/ui/src/styles/ui.css:1112`에 리터럴 | **토큰 부재** — `--shadow-lg`/`--shadow-cta`와 유사한 보라색 그림자지만 전용 토큰이 없어 리터럴로 하드코딩됨 |
| `Funnel Sans` (여러 노드) | §3 관찰 5 | `--font-sans`(Inter 스택)로 대체, Funnel Sans 토큰 없음 | 의도적 deviation (근거: `shared-pricing.md:10`, `shared-feature-ui.md:19-20`) |

## 5. 미해결 질문

1. **Proof strip을 Hero 밖 독립 섹션으로 뺀 결정의 1차 문서가 없다.** 커밋
   `79c4a97`/`199f596`에서 유추만 가능하다. `docs/design/k-drama-hero-pen.md`나
   별도 proof-strip 디자인 문서에 이 결정을 명시적으로 남길지 확인 필요.
2. **Navbar 브랜드 로고를 텍스트("Luma")로 할지 원본처럼 이미지 로고로 할지**
   결정 문서가 없다. `packages/contracts/src/navbar.ts`의 `kind:"image"` 계약은
   이미 있고 `apps/k-drama/public/images/`에 해당 로고 에셋(`beater-Photoroom.png`
   또는 대체 자산)도 없다. 브랜드 결정이 디자인 소관인지 콘텐츠 소관인지부터
   확인 필요.
3. **Pricing 강조 플랜의 보더 두께/색상 통일(1px, 단일 색)이 의도적인지.**
   `docs/design/shared-pricing.md`가 존재하지 않아 `docs/specs/shared-pricing.md`의
   한 줄("폰트는 Inter로 적응")만으로는 보더 위계까지 커버하는지 불확실.
4. **`packages/ui/src/styles/ui.css:1112`의 `#6d28d927` 그림자 리터럴**에 대응할
   전용 토큰(`--shadow-cta-featured` 등)을 새로 만들지, 기존 `--shadow-cta`로
   대체할지 결정 필요.
5. **Feature 데모 내부(디바이스 목업, 진행바, 챌린지 오버레이 등)의 리터럴
   102건**을 전부 토큰화할 때 몇 개의 새 시맨틱 토큰이 필요한지는 이 문서의
   범위를 넘는다. `docs/design/k-drama-code-inventory.md`(병렬 단위)가 존재하면
   그 결과와 본 문서 §4를 대조해 최종 토큰 세트를 확정해야 한다.
6. **원본 `n9rEb1`(4개 서브 카피 박스)과 `rKRnG`의 템플릿 그리드(9개 타일)를
   되살릴지, 아니면 현재의 "Speaking Challenge" 컨셉을 K-drama 고유 표현으로
   공식 채택할지**는 제품 결정이 필요하다(디자인 판단만으로 되돌릴 수 없음).
   현재 죽은 CSS(`k-drama-feature__template-grid` 등, `styles.css:1899-1918`)의
   보존 여부도 이 결정에 달려 있다.

## 고정 상태

이 문서는 판정 결과의 기록이며 코드를 변경하지 않았다. 위 "보정 대상" 항목의
실제 수정은 별도 브리프(구현 에이전트)가 수행한다. 이 문서의 매핑표·판정·토큰
대응표는 그 브리프의 입력으로 고정한다.
