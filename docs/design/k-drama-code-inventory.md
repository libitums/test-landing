# k-drama 코드 경계 인벤토리

## 0. 범위와 방법

- 스캔 대상: `apps/k-drama/src/app/App.tsx`가 실제로 렌더링하는 트리, 그 트리가
  참조하는 `apps/k-drama/src/features/k-drama/*`, `apps/k-drama/src/app/content.ts`,
  `apps/k-drama/src/styles.css` 전체.
- 스캔 제외: `apps/k-drama/src/app/LocaleNavigation.tsx` (아래 참고 참조),
  `apps/k-drama/dist/**` (빌드 산출물), `apps/k-culture`, `apps/ai-communication`,
  `packages/ui`, `packages/contracts`의 내부 구현(공통 UI 소비 여부 확인 목적으로만
  참조).
- 참고: `apps/k-drama/src/app/LocaleNavigation.tsx`는 파일로 존재하지만 어떤
  `.ts`/`.tsx`에서도 import되지 않는다(`grep -rn "LocaleNavigation"` 결과 자기 자신
  정의 파일만 매칭). `App.tsx` 렌더 트리에 나타나지 않으므로 아래 섹션 인벤토리
  표에서 제외했다.
- 이 문서는 사실을 나열하는 목적의 인벤토리이며, 발견된 항목에 대한 시정 여부나
  우선순위는 판단하지 않는다.

## 1. 섹션 인벤토리 표 (렌더 순서)

| # | 섹션 | DOM 앵커 (id/test-id) | 코드 경계 (파일:심볼) | 공통 UI 소비 여부 | 앱 전용 CSS 루트 클래스 |
|---|------|------------------------|------------------------|--------------------|--------------------------|
| 0 | 앱 루트 wrapper | `id="top"`, `data-testid="landing:k-drama"` | `apps/k-drama/src/app/App.tsx:47` (`App` 컴포넌트 반환 div) | 없음 (앱 전용 wrapper) | 없음 |
| 1 | LandingShell (레이아웃 셸) | `data-testid="landing-shell"` (기본값) | `apps/k-drama/src/app/App.tsx:48-204` → `packages/ui/src/sections/landing-shell.tsx:6-19` | 공통(`packages/ui`) | 없음 |
| 2 | Header / Navbar | `data-testid="landing-header"` (LandingShell.Header 기본값), Navbar 내부 `data-testid=navbarTestIds.root` | `apps/k-drama/src/app/App.tsx:49` + `apps/k-drama/src/app/content.ts:14-41` (`createNavbarProps`) → `packages/ui/src/sections/navbar.tsx` | 공통(`packages/ui`) | 없음 (appearance="warm-editorial"만 지정, k-drama 전용 클래스 없음) |
| 3 | Main 컨테이너 | `data-testid="landing-main"` (LandingShell.Main 기본값) | `apps/k-drama/src/app/App.tsx:52` → `packages/ui/src/sections/landing-shell.tsx:31-36` | 공통(`packages/ui`) | 없음 |
| 4 | Hero | `data-testid="hero"` (Hero 기본 `testId`), `aria-labelledby="hero-title"` | `apps/k-drama/src/app/App.tsx:53-164` (히어로 카드 마크업 인라인) → `packages/ui/src/sections/hero.tsx` (`Hero`) | 공통 `Hero` 셸 + **앱 전용 카드 마크업이 `App.tsx`에 직접 인라인** (별도 컴포넌트 파일 없음) | `.k-drama-hero`, `.k-drama-hero__visuals`, `.k-drama-hero-card`, `.k-drama-hero-card--video`, `.k-drama-hero-card--lesson`, `.k-drama-hero-card--feed` |
| 5 | Proof strip | `id="proof"` (wrapper div), 내부 `data-testid="k-drama-proof-strip"`, `aria-labelledby="k-drama-proof-title"` | `apps/k-drama/src/app/App.tsx:166-168` → `apps/k-drama/src/features/k-drama/KDramaProofStrip.tsx` | 앱 전용 컴포넌트 (단, `.section`/`.container`/`.stack` 공통 유틸리티 클래스는 재사용) | `.proof-strip`, `.proof-grid` |
| 6 | Features | `id="features"` (wrapper div) | `apps/k-drama/src/app/App.tsx:169-196` | 공통 `SharedFeatureTemplate` 셸(× 3) + 앱 전용 콘텐츠 | `.k-drama-feature-composition` (+ `#features` 하위 스코프 셀렉터로 grid 재배치) |
| 6.1 | Feature 1 (subtitles) | `sharedFeatureTestIds.root("k-drama-subtitles")` | `apps/k-drama/src/app/App.tsx:172-194` (index 0) → `packages/ui/src/sections/shared-feature-template.tsx` + `apps/k-drama/src/features/k-drama/KDramaDualSubtitleFeature.tsx` | 공통 `SharedFeatureTemplate` 셸 + 앱 전용 `KDramaDualSubtitleFeature` | `.k-drama-feature`, `.k-drama-feature--subtitles` |
| 6.2 | Feature 2 (youtube) | `sharedFeatureTestIds.root("k-drama-youtube")` | `apps/k-drama/src/app/App.tsx:172-194` (index 1, `appearance="soft"`) → `apps/k-drama/src/features/k-drama/KDramaYoutubeLessonFeature.tsx` | 공통 `SharedFeatureTemplate` 셸 + 앱 전용 `KDramaYoutubeLessonFeature` | `.k-drama-feature`, `.k-drama-feature--youtube` |
| 6.3 | Feature 3 (shortform) | `sharedFeatureTestIds.root("k-drama-shortform")` | `apps/k-drama/src/app/App.tsx:172-194` (index 2) → `apps/k-drama/src/features/k-drama/KDramaShortformFeature.tsx` | 공통 `SharedFeatureTemplate` 셸 + 앱 전용 `KDramaShortformFeature` | `.k-drama-feature`, `.k-drama-feature--shortform` |
| 7 | Pricing | `id="pricing"` (wrapper div), 내부 `data-testid="pricing-section"` (기본값) | `apps/k-drama/src/app/App.tsx:197-199` → `packages/ui/src/sections/pricing-section.tsx` | 공통(`packages/ui`) | 없음 |
| 8 | CTA | `id="cta"` (wrapper div), 내부 `data-testid="cta-section"` (기본값) | `apps/k-drama/src/app/App.tsx:200-202` → `packages/ui/src/sections/cta-section.tsx` | 공통(`packages/ui`) | 없음 |
| 9 | Footer | `data-testid="landing-footer"` (LandingShell.Footer 기본값), Footer 내부 `data-testid=footerTestIds.root` | `apps/k-drama/src/app/App.tsx:50` + `apps/k-drama/src/app/content.ts:43-84` (`createFooterProps`) → `packages/ui/src/sections/footer.tsx` | 공통(`packages/ui`) | 없음 |

각 feature 아이템의 CTA(`ButtonLink` "Get early access", `apps/k-drama/src/app/App.tsx:183-191`)는
공통 `ButtonLink` 컴포넌트를 사용하지만 앱 전용 클래스 `shared-feature__early-access-cta`가
`apps/k-drama/src/styles.css:456` 등에서 순서 재배치에 쓰인다.

## 2. 앱 전용 시각 컴포넌트 표 (`apps/k-drama/src/features/k-drama/*`)

| 컴포넌트 | 파일 | 담당 시각 요소 | 진입점 |
|----------|------|----------------|--------|
| `KDramaProofStrip` | `apps/k-drama/src/features/k-drama/KDramaProofStrip.tsx` | proof 지표 3개를 `<dl>/<dt>/<dd>` grid로 렌더 (`title`, `metrics` prop 기반, 정적 카피 없음) | `apps/k-drama/src/app/App.tsx:167`에서 `content.metrics`/`t("proof.title")`과 함께 직접 호출 |
| `KDramaDualSubtitleFeature` | `apps/k-drama/src/features/k-drama/KDramaDualSubtitleFeature.tsx` | subtitles feature의 폰 2대(`--primary`/`--secondary`) + side-action 아이콘 열, 정적 마크업(내부 상태 없음), 루트 `aria-hidden="true"` | `apps/k-drama/src/features/k-drama/KDramaFeatureVisuals.ts`(barrel export) → `apps/k-drama/src/app/App.tsx:24` `featureVisuals.subtitles` → `feature.id === "subtitles"`일 때 렌더 |
| `KDramaYoutubeLessonFeature` | `apps/k-drama/src/features/k-drama/KDramaYoutubeLessonFeature.tsx` | youtube 링크→레슨 변환 4-box(url/progress/lesson/library) 정적 시각, 내부 상태 없음, 루트 `aria-hidden="true"` | barrel export → `apps/k-drama/src/app/App.tsx:25` `featureVisuals.youtube` → `feature.id === "youtube"`일 때 렌더 |
| `KDramaShortformFeature` | `apps/k-drama/src/features/k-drama/KDramaShortformFeature.tsx` | shortform 챌린지 폰 2대(`ShortformPhoneContent`, `YoutubeShortsPhoneContent`) 시퀀스. `useState`/`useEffect` 기반 타이머로 `sequenceStep`, `challengeRun`, `sequenceCycle`, `countdown`, `isRecording` 상태를 갖고 자동 재생. **루트 div에 `aria-hidden` 속성 없음** (다른 두 feature 시각 컴포넌트와 다름, 3절·4절에서 관련 사실 참고) | barrel export → `apps/k-drama/src/app/App.tsx:26` `featureVisuals.shortform` → `feature.id === "shortform"`일 때 렌더 |
| `KDramaFeatureVisuals.ts` | `apps/k-drama/src/features/k-drama/KDramaFeatureVisuals.ts` | 위 3개 컴포넌트의 barrel re-export. 자체 시각 출력 없음 | `apps/k-drama/src/app/App.tsx:16-20`에서 import |

히어로 카드(`.k-drama-hero-card--video/--lesson/--feed`)는 위 표에 없다. 이 세 카드는
별도 컴포넌트 파일로 분리되어 있지 않고 `apps/k-drama/src/app/App.tsx:53-165`에 인라인
JSX로 존재한다.

## 3. 생값(raw value) 감사 — `apps/k-drama/src/styles.css`

스캔 범위: `apps/k-drama/src/styles.css` 전체(2054줄), `apps/k-drama/src/**/*.ts`,
`apps/k-drama/src/**/*.tsx` 전체. `.ts`/`.tsx` 파일에서는 `style={{ ... }}` 인라인
스타일이 0건이며, hex/rgb/px/rem 패턴의 매치 2건(`content.ts:20`의
`href: "#features"`, `localization.integration.test.tsx:61`의 URL 문자열 `...#features`)은
CSS 색상이 아닌 앵커 해시(`#features`) 문자열이므로 생값 감사 대상에서 제외한다.
**`apps/k-drama/src/**/*.ts(x)`의 생값: 0건.**

이하는 모두 `apps/k-drama/src/styles.css` 안에서 발견된 항목이다. CSS 셀렉터
자체에 등장하는 `#features`(ID 셀렉터)도 hex 색상 매칭에서 제외했다.

### 3.1 색상 — hex 리터럴 (`var()`을 거치지 않은 `#rrggbb`/`#rgb` 값), 100건

| 파일:라인 | 값(라인 원문) | 맥락(선택자) |
|---|---|---|
| `styles.css:91` | `#7b61ff 0 50%,` | `.k-drama-hero-card__captions span` |
| `styles.css:129` | `color: #fff;` | `.k-drama-feature__scene-caption strong span` |
| `styles.css:132` | `color: #a78bfa;` | `.k-drama-feature__romanization i` |
| `styles.css:213` | `color: #ff0033;` | `.k-drama-hero-card__youtube-icon` |
| `styles.css:304` | `background: #ff0033;` | `.k-drama-hero-card__youtube-logo` |
| `styles.css:357` | `background: #7b61ff;` | `.k-drama-hero-card__feed-chip--topic` |
| `styles.css:470` | `background: linear-gradient(145deg, #f5f3ff, #fff 58%);` | `.k-drama-feature` |
| `styles.css:482` | `border: 0.5rem solid #111;` | `.k-drama-feature__phone` |
| `styles.css:484` | `background: #111;` | `.k-drama-feature__phone` |
| `styles.css:494` | `background: #000;` | `.k-drama-feature__phone--primary` |
| `styles.css:505` | `background: #000;` | `.k-drama-feature__phone--primary::before` |
| `styles.css:518` | `background: #fff;` | `.k-drama-feature__phone--primary::after` |
| `styles.css:591` | `background: #000;` | `.k-drama-feature__phone--secondary` |
| `styles.css:623` | `background: #fff;` | `.k-drama-feature__side-actions` |
| `styles.css:632` | `background: #f8fafc;` | `.k-drama-feature__side-actions span` |
| `styles.css:633` | `color: #334155;` | `.k-drama-feature__side-actions span` |
| `styles.css:636` | `background: #635bff;` | `.k-drama-feature__side-actions span:first-child` |
| `styles.css:637` | `color: #fff;` | `.k-drama-feature__side-actions span:first-child` |
| `styles.css:640` | `background: #f6f4ff;` | `.k-drama-feature__side-actions span:nth-child(2)` |
| `styles.css:641` | `color: #635bff;` | `.k-drama-feature__side-actions span:nth-child(2)` |
| `styles.css:665` | `color: #fff;` | `.k-drama-feature__phone-header` |
| `styles.css:693` | `linear-gradient(145deg, #172033, #0f172a 55%, #30225f);` | `.k-drama-feature__scene` |
| `styles.css:698` | `background: #000;` | `.k-drama-feature__scene--night` |
| `styles.css:705` | `background: linear-gradient(to bottom, transparent 32%, rgb(0 0 0 / 58%) 54%, #000 72%);` | `.k-drama-feature__scene--night::after` |
| `styles.css:733` | `color: #fff;` | `.k-drama-feature__scene-caption` |
| `styles.css:741` | `color: #fff;` | `.k-drama-feature__scene-caption strong span` |
| `styles.css:760` | `color: #a78bfa;` | `.k-drama-feature__romanization i` |
| `styles.css:817` | `color: #fff;` | `@keyframes k-drama-shadowing-word-clean` (`100%` 스텝) |
| `styles.css:822` | `border-color: #a78bfa;` | `@keyframes k-drama-shadowing-chip` (`32%` 스텝) |
| `styles.css:824` | `color: #fff;` | `@keyframes k-drama-shadowing-chip` (`32%` 스텝) |
| `styles.css:836` | `color: #fff;` | `.k-drama-feature__player-controls` |
| `styles.css:858` | `background: #ff174a;` | `.k-drama-feature__player-progress::before` |
| `styles.css:868` | `background: #ff174a;` | `.k-drama-feature__player-progress::after` |
| `styles.css:886` | `color: #fff;` | `.k-drama-feature__player-actions span` |
| `styles.css:892` | `color: #fff;` | `.k-drama-feature__player-actions .is-active` |
| `styles.css:914` | `radial-gradient(circle at 34% 30%, #7b61ff, #1e1b4b 56%, #0f172a);` | `.k-drama-feature__scene--violet` |
| `styles.css:923` | `color: #fff;` | `.k-drama-feature__play` |
| `styles.css:930` | `background: #fff;` | `.k-drama-feature__word-row` |
| `styles.css:935` | `background: #f5f3ff;` | `.k-drama-feature__word-row span` |
| `styles.css:936` | `color: #5b42c7;` | `.k-drama-feature__word-row span` |
| `styles.css:942` | `background: #000;` | `.k-drama-feature__phone--primary .k-drama-feature__translation-card` |
| `styles.css:943` | `color: #fff;` | `.k-drama-feature__phone--primary .k-drama-feature__translation-card` |
| `styles.css:947` | `color: #c4b5fd;` | `.k-drama-feature__phone--primary .k-drama-feature__word-row span` |
| `styles.css:958` | `background: #fff;` | `.k-drama-feature__subtitle-stack` |
| `styles.css:963` | `color: #7b61ff;` | `.k-drama-feature__url-card small` |
| `styles.css:971` | `color: #64748b;` | `.k-drama-feature__subtitle-stack span` |
| `styles.css:980` | `color: #fff;` | `.k-drama-feature__subtitle-stack` |
| `styles.css:1006` | `background: #fff;` | `.k-drama-feature__youtube-box` |
| `styles.css:1044` | `color: #7b61ff;` | `.k-drama-feature__youtube-box small` |
| `styles.css:1050` | `color: #111;` | `.k-drama-feature__youtube-box .k-drama-feature__url-heading` |
| `styles.css:1053` | `color: #64748b;` | `.k-drama-feature__youtube-box .k-drama-feature__url-description` |
| `styles.css:1065` | `border: 1px solid #e2e8f0;` | `.k-drama-feature__url-input` |
| `styles.css:1067` | `background: #f8fafc;` | `.k-drama-feature__url-input` |
| `styles.css:1068` | `color: #94a3b8;` | `.k-drama-feature__url-input` |
| `styles.css:1102` | `background: #111;` | `.k-drama-feature__url-submit` |
| `styles.css:1103` | `color: #fff;` | `.k-drama-feature__url-submit` |
| `styles.css:1115` | `background: #ff0033;` | `.k-drama-feature__youtube-mark` |
| `styles.css:1116` | `color: #fff;` | `.k-drama-feature__youtube-mark` |
| `styles.css:1174` | `background: #fff;` | `.k-drama-feature__download-core` |
| `styles.css:1184` | `background: #7b61ff;` | `.k-drama-feature__lesson-chip` |
| `styles.css:1185` | `color: #fff;` | `.k-drama-feature__lesson-chip` |
| `styles.css:1202` | `background: #fff;` | `.k-drama-feature__saved-skeleton` |
| `styles.css:1210` | `background: linear-gradient(90deg, #f1f5f9 25%, #fff 50%, #f1f5f9 75%);` | `.k-drama-feature__saved-skeleton span` |
| `styles.css:1258` | `color: #64748b;` | `.k-drama-feature__youtube-box--lesson > small` |
| `styles.css:1263` | `color: #7b61ff;` | `.k-drama-feature__youtube-box--lesson > .k-drama-feature__lesson-romanization` |
| `styles.css:1275` | `background: #f1f5f9;` | `.k-drama-feature__lesson-lines span` |
| `styles.css:1294` | `color: #64748b;` | `.k-drama-feature__library-header span` |
| `styles.css:1319` | `background: #f8fafc;` | `.k-drama-feature__saved-skeleton` |
| `styles.css:1349` | `color: #fff;` | `.k-drama-feature__saved-overlay` |
| `styles.css:1379` | `color: #cbd5e1;` | `.k-drama-feature__saved-caption > small` |
| `styles.css:1393` | `background: #ffffff26;` | `.k-drama-feature__saved-caption i` |
| `styles.css:1394` | `color: #e2e8f0;` | `.k-drama-feature__saved-caption i` |
| `styles.css:1419` | `background: #000;` | `.k-drama-feature__phone--shortform` |
| `styles.css:1430` | `background: #000;` | `.k-drama-feature__phone--shortform::before` |
| `styles.css:1443` | `background: #fff;` | `.k-drama-feature__phone--shortform::after` |
| `styles.css:1453` | `background: #000;` | `.k-drama-feature__phone--shortform-secondary` |
| `styles.css:1497` | `color: #fff;` | `.k-drama-feature__challenge-countdown` |
| `styles.css:1515` | `color: #fff;` | `.k-drama-feature__challenge-capture button:not(.is-recording)` |
| `styles.css:1530` | `color: #a99cff;` | `.k-drama-feature__challenge-toolbar strong svg` |
| `styles.css:1568` | `color: #fff;` | `.k-drama-feature__challenge-guide button` |
| `styles.css:1593` | `background: #a99cff;` | `.k-drama-feature__challenge-wave i` |
| `styles.css:1609` | `background: #ff174a;` | `.k-drama-feature__challenge-capture > small i` |
| `styles.css:1622` | `border: 0.25rem solid #fff;` | `.k-drama-feature__challenge-capture .is-recording` |
| `styles.css:1632` | `background: #ff174a;` | `.k-drama-feature__challenge-capture .is-recording i` |
| `styles.css:1650` | `border: 0.25rem solid #fff;` | `.k-drama-feature__challenge-start button` |
| `styles.css:1661` | `background: #ff174a;` | `.k-drama-feature__challenge-start button i` |
| `styles.css:1704` | `background: #000;` | `.k-drama-feature__shorts-screen` |
| `styles.css:1705` | `color: #fff;` | `.k-drama-feature__shorts-screen` |
| `styles.css:1738` | `color: #fff;` | `.k-drama-feature__shorts-preview-caption` |
| `styles.css:1804` | `color: #fff;` | `.k-drama-feature__shorts-actions svg` |
| `styles.css:1811` | `background: #635bff;` | `.k-drama-feature__shorts-actions .is-challenge svg` |
| `styles.css:1818` | `color: #fff;` | `.k-drama-feature__shorts-actions small` |
| `styles.css:1869` | `background: #ff174a;` | `.k-drama-feature__shorts-progress::before` |
| `styles.css:1892` | `radial-gradient(circle at 50% 25%, #7b61ff, #312e81 42%, #111827 75%);` | `.k-drama-feature__shortform-preview` |
| `styles.css:1893` | `color: #fff;` | `.k-drama-feature__shortform-preview` |
| `styles.css:1901` | `color: #fff;` | `.k-drama-feature__template-label` |
| `styles.css:1915` | `background: linear-gradient(145deg, #312e81, #7b61ff);` | `.k-drama-feature__template-grid span` |
| `styles.css:1916` | `color: #fff;` | `.k-drama-feature__template-grid span` |
| `styles.css:1927` | `color: #fff;` | `.k-drama-feature__shortform-note` |
| `styles.css:1935` | `background: #7b61ff;` | `.k-drama-feature__shortform-note span` |

### 3.2 색상 — `rgb()` 함수 리터럴 (`var()`을 거치지 않은 값), 69건

| 파일:라인 | 값(라인 원문) | 맥락(선택자) |
|---|---|---|
| `styles.css:249` | `background: rgb(71 85 105 / 12%);` | `.k-drama-hero-card__download-tile` |
| `styles.css:268` | `rgb(255 0 51 / 18%) var(--download-progress) 100%` | `.k-drama-hero-card__download-progress` |
| `styles.css:413` | `background: rgb(255 255 255 / 15%);` | `.k-drama-hero-card__feed-action-icon` |
| `styles.css:506` | `box-shadow: inset 0 0 0 1px rgb(255 255 255 / 5%);` | `.k-drama-feature__phone--primary::before` |
| `styles.css:624` | `box-shadow: 0 0.75rem 2rem rgb(15 23 42 / 16%);` | `.k-drama-feature__side-actions` |
| `styles.css:652` | `color: rgb(255 255 255 / 75%);` | `.k-drama-feature__phone-status` |
| `styles.css:670` | `text-shadow: 0 1px 8px rgb(0 0 0 / 65%);` | `.k-drama-feature__phone-header strong` |
| `styles.css:674` | `border: 1px solid rgb(255 255 255 / 22%);` | `.k-drama-feature__phone-header span` |
| `styles.css:676` | `background: rgb(15 23 42 / 62%);` | `.k-drama-feature__phone-header span` |
| `styles.css:692` | `radial-gradient(circle at 70% 24%, rgb(123 97 255 / 85%), transparent 24%),` | `.k-drama-feature__scene` |
| `styles.css:705` | `background: linear-gradient(to bottom, transparent 32%, rgb(0 0 0 / 58%) 54%, #000 72%);` | `.k-drama-feature__scene--night::after` |
| `styles.css:756` | `color: rgb(255 255 255 / 65%);` | `.k-drama-feature__scene-caption > span` |
| `styles.css:774` | `border: 1px solid rgb(255 255 255 / 18%);` | `.k-drama-feature__scene-words i` |
| `styles.css:776` | `background: rgb(255 255 255 / 12%);` | `.k-drama-feature__scene-words i` |
| `styles.css:815` | `border-color: rgb(255 255 255 / 18%);` | `@keyframes k-drama-shadowing-chip` (`100%` 스텝) |
| `styles.css:816` | `background: rgb(255 255 255 / 12%);` | `@keyframes k-drama-shadowing-chip` (`100%` 스텝) |
| `styles.css:823` | `background: rgb(123 97 255 / 24%);` | `@keyframes k-drama-shadowing-chip` (`32%` 스텝) |
| `styles.css:841` | `color: rgb(255 255 255 / 64%);` | `.k-drama-feature__player-time` |
| `styles.css:849` | `background: rgb(255 255 255 / 24%);` | `.k-drama-feature__player-progress` |
| `styles.css:869` | `box-shadow: 0 2px 8px rgb(255 23 74 / 45%);` | `.k-drama-feature__player-progress::after` |
| `styles.css:913` | `linear-gradient(to top, rgb(15 23 42 / 90%), transparent 55%),` | `.k-drama-feature__scene--violet` |
| `styles.css:922` | `background: rgb(255 255 255 / 20%);` | `.k-drama-feature__play` |
| `styles.css:946` | `background: rgb(123 97 255 / 22%);` | `.k-drama-feature__phone--primary .k-drama-feature__word-row span` |
| `styles.css:950` | `color: rgb(255 255 255 / 58%);` | `.k-drama-feature__phone--primary .k-drama-feature__translation-card span` |
| `styles.css:979` | `background: rgb(15 23 42 / 82%);` | `.k-drama-feature__subtitle-stack` |
| `styles.css:984` | `color: rgb(255 255 255 / 65%);` | `.k-drama-feature__subtitle-stack span` |
| `styles.css:1007` | `box-shadow: 0 1rem 2.5rem rgb(15 23 42 / 14%);` | `.k-drama-feature__youtube-box` |
| `styles.css:1130` | `rgb(255 23 74 / 16%) var(--feature-download-progress) 100%` | `.k-drama-feature__lesson-progress` |
| `styles.css:1160` | `background: linear-gradient(to bottom, rgb(15 23 42 / 18%), rgb(15 23 42 / 62%));` | `.k-drama-feature__download-overlay` |
| `styles.css:1175` | `box-shadow: 0 0.5rem 1.25rem rgb(15 23 42 / 12%);` | `.k-drama-feature__download-core` |
| `styles.css:1251` | `linear-gradient(to top, rgb(15 23 42 / 78%), transparent 60%),` | `.k-drama-feature__library-preview` |
| `styles.css:1348` | `background: linear-gradient(to bottom, rgb(15 23 42 / 42%), transparent 36%, rgb(15 23 42 / 92%));` | `.k-drama-feature__saved-overlay` |
| `styles.css:1362` | `border: 1px solid rgb(255 255 255 / 22%);` | `.k-drama-feature__saved-heading > span` |
| `styles.css:1364` | `background: rgb(15 23 42 / 62%);` | `.k-drama-feature__saved-heading > span` |
| `styles.css:1391` | `border: 1px solid rgb(255 255 255 / 22%);` | `.k-drama-feature__saved-caption i` |
| `styles.css:1431` | `box-shadow: inset 0 0 0 1px rgb(255 255 255 / 5%);` | `.k-drama-feature__phone--shortform::before` |
| `styles.css:1480` | `linear-gradient(to bottom, rgb(0 0 0 / 58%), transparent 24%),` | `.k-drama-feature__challenge-shade` |
| `styles.css:1484` | `rgb(0 0 0 / 10%) 48%,` | `.k-drama-feature__challenge-shade` |
| `styles.css:1485` | `rgb(0 0 0 / 38%) 64%,` | `.k-drama-feature__challenge-shade` |
| `styles.css:1486` | `rgb(0 0 0 / 76%) 80%,` | `.k-drama-feature__challenge-shade` |
| `styles.css:1487` | `rgb(0 0 0 / 96%) 100%` | `.k-drama-feature__challenge-shade` |
| `styles.css:1510` | `border: 1px solid rgb(255 255 255 / 18%);` | `.k-drama-feature__challenge-capture button:not(.is-recording)` |
| `styles.css:1514` | `background: rgb(15 23 42 / 42%);` | `.k-drama-feature__challenge-capture button:not(.is-recording)` |
| `styles.css:1545` | `background: rgb(99 91 255 / 82%);` | `.k-drama-feature__challenge-guide > span` |
| `styles.css:1552` | `text-shadow: 0 0.125rem 0.75rem rgb(0 0 0 / 45%);` | `.k-drama-feature__challenge-guide strong` |
| `styles.css:1556` | `color: rgb(255 255 255 / 72%);` | `.k-drama-feature__challenge-guide small` |
| `styles.css:1562` | `border: 1px solid rgb(255 255 255 / 22%);` | `.k-drama-feature__challenge-guide button` |
| `styles.css:1567` | `background: rgb(15 23 42 / 52%);` | `.k-drama-feature__challenge-guide button` |
| `styles.css:1601` | `color: rgb(255 255 255 / 76%);` | `.k-drama-feature__challenge-capture > small` |
| `styles.css:1610` | `box-shadow: 0 0 0 0.25rem rgb(255 23 74 / 16%);` | `.k-drama-feature__challenge-capture > small i` |
| `styles.css:1626` | `background: rgb(255 255 255 / 12%);` | `.k-drama-feature__challenge-capture .is-recording` |
| `styles.css:1635` | `color: rgb(255 255 255 / 68%);` | `.k-drama-feature__challenge-capture > strong` |
| `styles.css:1654` | `background: rgb(255 255 255 / 12%);` | `.k-drama-feature__challenge-start button` |
| `styles.css:1655` | `box-shadow: 0 0.5rem 1.75rem rgb(0 0 0 / 30%);` | `.k-drama-feature__challenge-start button` |
| `styles.css:1678` | `background: rgb(0 0 0 / 52%);` | `.k-drama-feature__challenge-countdown` |
| `styles.css:1685` | `text-shadow: 0 0 2rem rgb(99 91 255 / 72%);` | `.k-drama-feature__challenge-countdown span` |
| `styles.css:1689` | `color: rgb(255 255 255 / 72%);` | `.k-drama-feature__challenge-countdown small` |
| `styles.css:1711` | `background: linear-gradient(to bottom, rgb(0 0 0 / 38%), transparent 26%, transparent 56%, rgb(0 0 0 / 90%));` | `.k-drama-feature__shorts-screen::after` |
| `styles.css:1745` | `color: rgb(255 255 255 / 72%);` | `.k-drama-feature__shorts-preview-caption small` |
| `styles.css:1778` | `border: 1px solid rgb(255 255 255 / 22%);` | `.k-drama-feature__shorts-header > div > span` |
| `styles.css:1780` | `background: rgb(15 23 42 / 62%);` | `.k-drama-feature__shorts-header > div > span` |
| `styles.css:1812` | `box-shadow: 0 0.375rem 1rem rgb(99 91 255 / 38%);` | `.k-drama-feature__shorts-actions .is-challenge svg` |
| `styles.css:1845` | `border: 1px solid rgb(255 255 255 / 55%);` | `.k-drama-feature__shorts-caption > div span` |
| `styles.css:1855` | `color: rgb(255 255 255 / 72%);` | `.k-drama-feature__shorts-caption p` |
| `styles.css:1862` | `background: rgb(255 255 255 / 28%);` | `.k-drama-feature__shorts-progress` |
| `styles.css:1873` | `45% { transform: scale(0.72); box-shadow: 0 0 0 0.8rem rgb(99 91 255 / 18%); }` | `@keyframes k-drama-challenge-tap` |
| `styles.css:1879` | `color: rgb(255 255 255 / 70%);` | `.k-drama-feature__shortform-toolbar` |
| `styles.css:1891` | `linear-gradient(to top, rgb(15 23 42 / 95%), transparent 62%),` | `.k-drama-feature__shortform-preview` |
| `styles.css:1897` | `color: rgb(255 255 255 / 65%);` | `.k-drama-feature__shortform-preview small` |

### 3.3 길이 — `rem` 리터럴 (`var(--space-*)` 등을 거치지 않은 값), 147건

| 파일:라인 | 값(라인 원문) | 맥락(선택자) |
|---|---|---|
| `styles.css:309` | `border-block: 0.375rem solid transparent;` | `.k-drama-hero-card__youtube-play` |
| `styles.css:467` | `min-height: 32rem;` | `.k-drama-feature` |
| `styles.css:474` | `min-height: 47.25rem;` | `.k-drama-feature--subtitles` |
| `styles.css:482` | `border: 0.5rem solid #111;` | `.k-drama-feature__phone` |
| `styles.css:483` | `border-radius: 2.25rem;` | `.k-drama-feature__phone` |
| `styles.css:490` | `width: 22.25rem;` | `.k-drama-feature__phone--primary` |
| `styles.css:491` | `height: 47.25rem;` | `.k-drama-feature__phone--primary` |
| `styles.css:502` | `width: 7.5rem;` | `.k-drama-feature__phone--primary::before` |
| `styles.css:503` | `height: 2rem;` | `.k-drama-feature__phone--primary::before` |
| `styles.css:515` | `width: 7.5rem;` | `.k-drama-feature__phone--primary::after` |
| `styles.css:516` | `height: 0.3125rem;` | `.k-drama-feature__phone--primary::after` |
| `styles.css:524` | `grid-template-columns: minmax(0, 1fr) minmax(32.25rem, 0.9fr);` | `#features > .shared-feature:first-child .shared-feature__inner` |
| `styles.css:546` | `inset-inline-end: 10rem;` | `#features > .shared-feature:first-child .k-drama-feature__phone--primary` |
| `styles.css:549` | `inset-inline-start: 17.25rem;` | `#features > .shared-feature:first-child .k-drama-feature__phone--secondary` |
| `styles.css:559` | `grid-template-columns: minmax(0, 1fr) minmax(38rem, 1fr);` | `#features > .shared-feature:nth-child(3) .shared-feature__inner` |
| `styles.css:586` | `inset-inline-start: calc(100% - 5rem);` | `.k-drama-feature__phone--secondary` |
| `styles.css:587` | `width: 15rem;` | `.k-drama-feature__phone--secondary` |
| `styles.css:588` | `height: 31.5rem;` | `.k-drama-feature__phone--secondary` |
| `styles.css:616` | `inset-block-start: 8rem;` | `.k-drama-feature__side-actions` |
| `styles.css:617` | `inset-inline-start: -3rem;` | `.k-drama-feature__side-actions` |
| `styles.css:624` | `box-shadow: 0 0.75rem 2rem rgb(15 23 42 / 16%);` | `.k-drama-feature__side-actions` |
| `styles.css:680` | `backdrop-filter: blur(0.5rem);` | `.k-drama-feature__phone-header span` |
| `styles.css:684` | `transform: translateY(-1rem);` | `.k-drama-feature__player-controls` |
| `styles.css:688` | `min-height: 15rem;` | `.k-drama-feature__scene` |
| `styles.css:728` | `inset-block-end: 12.5rem;` | `.k-drama-feature__scene-caption` |
| `styles.css:780` | `backdrop-filter: blur(0.5rem);` | `.k-drama-feature__scene-words i` |
| `styles.css:825` | `transform: translateY(-0.125rem);` | `@keyframes k-drama-shadowing-chip` (`32%` 스텝) |
| `styles.css:847` | `height: 0.25rem;` | `.k-drama-feature__player-progress` |
| `styles.css:887` | `font-size: 1.75rem;` | `.k-drama-feature__player-actions span` |
| `styles.css:898` | `border-block: 0.625rem solid transparent;` | `.k-drama-feature__rewind-icon` |
| `styles.css:899` | `border-inline-end: 0.875rem solid currentColor;` | `.k-drama-feature__rewind-icon` |
| `styles.css:902` | `width: 1.75rem;` | `.k-drama-feature__challenge-icon` |
| `styles.css:903` | `height: 1.75rem;` | `.k-drama-feature__challenge-icon` |
| `styles.css:964` | `font-size: 0.625rem;` | `.k-drama-feature__url-card small` |
| `styles.css:981` | `backdrop-filter: blur(0.5rem);` | `.k-drama-feature__subtitle-stack` |
| `styles.css:987` | `min-height: 38.125rem;` | `.k-drama-feature--youtube` |
| `styles.css:1007` | `box-shadow: 0 1rem 2.5rem rgb(15 23 42 / 14%);` | `.k-drama-feature__youtube-box` |
| `styles.css:1011` | `width: 12.5rem;` | `.k-drama-feature__youtube-box--progress` |
| `styles.css:1012` | `height: 12.5rem;` | `.k-drama-feature__youtube-box--progress` |
| `styles.css:1013` | `transform: translateY(-14.375rem);` | `.k-drama-feature__youtube-box--progress` |
| `styles.css:1027` | `width: 18.75rem;` | `.k-drama-feature__youtube-box--lesson` |
| `styles.css:1028` | `height: 26.875rem;` | `.k-drama-feature__youtube-box--lesson` |
| `styles.css:1032` | `width: 18.75rem;` | `.k-drama-feature__youtube-box--library` |
| `styles.css:1033` | `height: 38.125rem;` | `.k-drama-feature__youtube-box--library` |
| `styles.css:1045` | `font-size: 0.625rem;` | `.k-drama-feature__youtube-box small` |
| `styles.css:1069` | `font-size: 0.625rem;` | `.k-drama-feature__url-input` |
| `styles.css:1095` | `font-size: 0.5rem;` | `.k-drama-feature__url-input .k-drama-feature__youtube-mark` |
| `styles.css:1122` | `width: 6rem;` | `.k-drama-feature__lesson-progress` |
| `styles.css:1123` | `height: 6rem;` | `.k-drama-feature__lesson-progress` |
| `styles.css:1175` | `box-shadow: 0 0.5rem 1.25rem rgb(15 23 42 / 12%);` | `.k-drama-feature__download-core` |
| `styles.css:1215` | `height: 12rem;` | `.k-drama-feature__lesson-skeleton span:first-child` |
| `styles.css:1255` | `height: 12rem;` | `.k-drama-feature__lesson-scene` |
| `styles.css:1307` | `height: 8.125rem;` | `.k-drama-feature__saved-card` |
| `styles.css:1308` | `flex: 0 0 8.125rem;` | `.k-drama-feature__saved-card` |
| `styles.css:1365` | `font-size: 0.625rem;` | `.k-drama-feature__saved-heading > span` |
| `styles.css:1368` | `backdrop-filter: blur(0.5rem);` | `.k-drama-feature__saved-heading > span` |
| `styles.css:1380` | `font-size: 0.625rem;` | `.k-drama-feature__saved-caption > small` |
| `styles.css:1395` | `font-size: 0.5625rem;` | `.k-drama-feature__saved-caption i` |
| `styles.css:1399` | `min-height: 51.25rem;` | `.k-drama-feature--shortform` |
| `styles.css:1415` | `width: 22.25rem;` | `.k-drama-feature__phone--shortform` |
| `styles.css:1416` | `height: 47.25rem;` | `.k-drama-feature__phone--shortform` |
| `styles.css:1427` | `width: 7.5rem;` | `.k-drama-feature__phone--shortform::before` |
| `styles.css:1428` | `height: 2rem;` | `.k-drama-feature__phone--shortform::before` |
| `styles.css:1440` | `width: 7.5rem;` | `.k-drama-feature__phone--shortform::after` |
| `styles.css:1441` | `height: 0.3125rem;` | `.k-drama-feature__phone--shortform::after` |
| `styles.css:1449` | `width: 15rem;` | `.k-drama-feature__phone--shortform-secondary` |
| `styles.css:1450` | `height: 31.5rem;` | `.k-drama-feature__phone--shortform-secondary` |
| `styles.css:1500` | `inset-block-start: 1.5rem;` | `.k-drama-feature__challenge-toolbar` |
| `styles.css:1501` | `inset-inline: 1.25rem;` | `.k-drama-feature__challenge-toolbar` |
| `styles.css:1508` | `width: 2.75rem;` | `.k-drama-feature__challenge-toolbar > span, .k-drama-feature__challenge-capture button:not(.is-recording)` |
| `styles.css:1509` | `height: 2.75rem;` | `.k-drama-feature__challenge-toolbar > span, .k-drama-feature__challenge-capture button:not(.is-recording)` |
| `styles.css:1516` | `backdrop-filter: blur(0.75rem);` | `.k-drama-feature__challenge-toolbar > span, .k-drama-feature__challenge-capture button:not(.is-recording)` |
| `styles.css:1520` | `width: 1.25rem;` | `.k-drama-feature__challenge-toolbar svg, .k-drama-feature__challenge-capture svg` |
| `styles.css:1521` | `height: 1.25rem;` | `.k-drama-feature__challenge-toolbar svg, .k-drama-feature__challenge-capture svg` |
| `styles.css:1526` | `gap: 0.4rem;` | `.k-drama-feature__challenge-toolbar strong` |
| `styles.css:1527` | `font-size: 0.875rem;` | `.k-drama-feature__challenge-toolbar strong` |
| `styles.css:1533` | `inset-inline: 1.25rem;` | `.k-drama-feature__challenge-guide` |
| `styles.css:1542` | `margin-block-end: 0.75rem;` | `.k-drama-feature__challenge-guide > span` |
| `styles.css:1543` | `padding: 0.35rem 0.7rem;` | `.k-drama-feature__challenge-guide > span` |
| `styles.css:1546` | `font-size: 0.625rem;` | `.k-drama-feature__challenge-guide > span` |
| `styles.css:1550` | `font-size: 1.75rem;` | `.k-drama-feature__challenge-guide strong` |
| `styles.css:1552` | `text-shadow: 0 0.125rem 0.75rem rgb(0 0 0 / 45%);` | `.k-drama-feature__challenge-guide strong` |
| `styles.css:1555` | `margin-block-start: 0.4rem;` | `.k-drama-feature__challenge-guide small` |
| `styles.css:1557` | `font-size: 0.75rem;` | `.k-drama-feature__challenge-guide small` |
| `styles.css:1560` | `margin-block-start: 1rem;` | `.k-drama-feature__challenge-guide button` |
| `styles.css:1561` | `padding: 0.55rem 0.85rem;` | `.k-drama-feature__challenge-guide button` |
| `styles.css:1566` | `gap: 0.4rem;` | `.k-drama-feature__challenge-guide button` |
| `styles.css:1569` | `font-size: 0.6875rem;` | `.k-drama-feature__challenge-guide button` |
| `styles.css:1570` | `backdrop-filter: blur(0.75rem);` | `.k-drama-feature__challenge-guide button` |
| `styles.css:1573` | `width: 0.9rem;` | `.k-drama-feature__challenge-guide button svg` |
| `styles.css:1574` | `height: 0.9rem;` | `.k-drama-feature__challenge-guide button svg` |
| `styles.css:1577` | `inset-inline: 1.25rem;` | `.k-drama-feature__challenge-capture` |
| `styles.css:1578` | `inset-block-end: 1.5rem;` | `.k-drama-feature__challenge-capture` |
| `styles.css:1584` | `height: 2.25rem;` | `.k-drama-feature__challenge-wave` |
| `styles.css:1587` | `gap: 0.28rem;` | `.k-drama-feature__challenge-wave` |
| `styles.css:1590` | `width: 0.18rem;` | `.k-drama-feature__challenge-wave i` |
| `styles.css:1602` | `font-size: 0.625rem;` | `.k-drama-feature__challenge-capture > small` |
| `styles.css:1605` | `width: 0.4rem;` | `.k-drama-feature__challenge-capture > small i` |
| `styles.css:1606` | `height: 0.4rem;` | `.k-drama-feature__challenge-capture > small i` |
| `styles.css:1607` | `margin-inline-end: 0.35rem;` | `.k-drama-feature__challenge-capture > small i` |
| `styles.css:1610` | `box-shadow: 0 0 0 0.25rem rgb(255 23 74 / 16%);` | `.k-drama-feature__challenge-capture > small i` |
| `styles.css:1614` | `margin-block: 0.9rem 0.6rem;` | `.k-drama-feature__challenge-capture > div:nth-of-type(2)` |
| `styles.css:1620` | `width: 4.5rem;` | `.k-drama-feature__challenge-capture .is-recording` |
| `styles.css:1621` | `height: 4.5rem;` | `.k-drama-feature__challenge-capture .is-recording` |
| `styles.css:1622` | `border: 0.25rem solid #fff;` | `.k-drama-feature__challenge-capture .is-recording` |
| `styles.css:1629` | `width: 2.75rem;` | `.k-drama-feature__challenge-capture .is-recording i` |
| `styles.css:1630` | `height: 2.75rem;` | `.k-drama-feature__challenge-capture .is-recording i` |
| `styles.css:1636` | `font-size: 0.625rem;` | `.k-drama-feature__challenge-capture > strong` |
| `styles.css:1640` | `inset-inline: 1.25rem;` | `.k-drama-feature__challenge-start` |
| `styles.css:1641` | `inset-block-end: 2.25rem;` | `.k-drama-feature__challenge-start` |
| `styles.css:1645` | `gap: 0.75rem;` | `.k-drama-feature__challenge-start` |
| `styles.css:1648` | `width: 4.75rem;` | `.k-drama-feature__challenge-start button` |
| `styles.css:1649` | `height: 4.75rem;` | `.k-drama-feature__challenge-start button` |
| `styles.css:1650` | `border: 0.25rem solid #fff;` | `.k-drama-feature__challenge-start button` |
| `styles.css:1655` | `box-shadow: 0 0.5rem 1.75rem rgb(0 0 0 / 30%);` | `.k-drama-feature__challenge-start button` |
| `styles.css:1658` | `width: 3rem;` | `.k-drama-feature__challenge-start button i` |
| `styles.css:1659` | `height: 3rem;` | `.k-drama-feature__challenge-start button i` |
| `styles.css:1668` | `font-size: 0.6875rem;` | `.k-drama-feature__challenge-start strong` |
| `styles.css:1677` | `gap: 0.5rem;` | `.k-drama-feature__challenge-countdown` |
| `styles.css:1679` | `backdrop-filter: blur(0.25rem);` | `.k-drama-feature__challenge-countdown` |
| `styles.css:1682` | `font-size: 6rem;` | `.k-drama-feature__challenge-countdown span` |
| `styles.css:1685` | `text-shadow: 0 0 2rem rgb(99 91 255 / 72%);` | `.k-drama-feature__challenge-countdown span` |
| `styles.css:1690` | `font-size: 0.75rem;` | `.k-drama-feature__challenge-countdown small` |
| `styles.css:1733` | `inset-inline: var(--space-5) 4.5rem;` | `.k-drama-feature__shorts-preview-caption` |
| `styles.css:1734` | `inset-block-end: 3.5rem;` | `.k-drama-feature__shorts-preview-caption` |
| `styles.css:1784` | `backdrop-filter: blur(0.5rem);` | `.k-drama-feature__shorts-header > div > span` |
| `styles.css:1788` | `inset-block-end: 8rem;` | `.k-drama-feature__shorts-actions` |
| `styles.css:1798` | `font-size: 1.75rem;` | `.k-drama-feature__shorts-actions > span` |
| `styles.css:1802` | `width: 1.75rem;` | `.k-drama-feature__shorts-actions svg` |
| `styles.css:1803` | `height: 1.75rem;` | `.k-drama-feature__shorts-actions svg` |
| `styles.css:1809` | `padding: 0.5rem;` | `.k-drama-feature__shorts-actions .is-challenge svg` |
| `styles.css:1812` | `box-shadow: 0 0.375rem 1rem rgb(99 91 255 / 38%);` | `.k-drama-feature__shorts-actions .is-challenge svg` |
| `styles.css:1819` | `font-size: 0.5625rem;` | `.k-drama-feature__shorts-actions small` |
| `styles.css:1824` | `inset-inline-end: 4.5rem;` | `.k-drama-feature__shorts-caption` |
| `styles.css:1825` | `inset-block-end: 3.5rem;` | `.k-drama-feature__shorts-caption` |
| `styles.css:1831` | `transform: translateY(1rem);` | `.k-drama-feature__shorts-caption` |
| `styles.css:1847` | `font-size: 0.625rem;` | `.k-drama-feature__shorts-caption > div span` |
| `styles.css:1860` | `inset-block-end: 1.75rem;` | `.k-drama-feature__shorts-progress` |
| `styles.css:1861` | `height: 0.1875rem;` | `.k-drama-feature__shorts-progress` |
| `styles.css:1873` | `45% { transform: scale(0.72); box-shadow: 0 0 0 0.8rem rgb(99 91 255 / 18%); }` | `@keyframes k-drama-challenge-tap` |
| `styles.css:1883` | `height: 19rem;` | `.k-drama-feature__shortform-preview` |
| `styles.css:1917` | `font-size: 0.625rem;` | `.k-drama-feature__template-grid span` |
| `styles.css:1923` | `width: 14rem;` | `.k-drama-feature__shortform-note` |
| `styles.css:1997` | `min-height: 31rem;` | `.k-drama-feature` (미디어 쿼리 `max-width: 48rem` 내부) |
| `styles.css:2011` | `width: min(22.25rem, 100%);` | `.k-drama-feature__phone--primary` (미디어 쿼리 `max-width: 48rem` 내부) |
| `styles.css:2042` | `min-height: 43rem;` | `.k-drama-feature--shortform` (미디어 쿼리 `max-width: 48rem` 내부) |
| `styles.css:2045` | `width: min(18rem, 100%);` | `.k-drama-feature__phone--shortform` (미디어 쿼리 `max-width: 48rem` 내부) |

### 3.4 길이 — `px` 리터럴, 17건

| 파일:라인 | 값(라인 원문) | 맥락(선택자) |
|---|---|---|
| `styles.css:211` | `border: 2px solid currentColor;` | `.k-drama-hero-card__youtube-icon` |
| `styles.css:221` | `border-inline-end: 1px solid currentColor;` | `.k-drama-hero-card__url-text` |
| `styles.css:506` | `box-shadow: inset 0 0 0 1px rgb(255 255 255 / 5%);` | `.k-drama-feature__phone--primary::before` |
| `styles.css:670` | `text-shadow: 0 1px 8px rgb(0 0 0 / 65%);` | `.k-drama-feature__phone-header strong` |
| `styles.css:674` | `border: 1px solid rgb(255 255 255 / 22%);` | `.k-drama-feature__phone-header span` |
| `styles.css:774` | `border: 1px solid rgb(255 255 255 / 18%);` | `.k-drama-feature__scene-words i` |
| `styles.css:795` | `text-shadow: 0 0 14px currentColor;` | `@keyframes k-drama-shadowing-word` (`32%` 스텝) |
| `styles.css:869` | `box-shadow: 0 2px 8px rgb(255 23 74 / 45%);` | `.k-drama-feature__player-progress::after` |
| `styles.css:1065` | `border: 1px solid #e2e8f0;` | `.k-drama-feature__url-input` |
| `styles.css:1362` | `border: 1px solid rgb(255 255 255 / 22%);` | `.k-drama-feature__saved-heading > span` |
| `styles.css:1391` | `border: 1px solid rgb(255 255 255 / 22%);` | `.k-drama-feature__saved-caption i` |
| `styles.css:1431` | `box-shadow: inset 0 0 0 1px rgb(255 255 255 / 5%);` | `.k-drama-feature__phone--shortform::before` |
| `styles.css:1510` | `border: 1px solid rgb(255 255 255 / 18%);` | `.k-drama-feature__challenge-capture button:not(.is-recording)` |
| `styles.css:1562` | `border: 1px solid rgb(255 255 255 / 22%);` | `.k-drama-feature__challenge-guide button` |
| `styles.css:1778` | `border: 1px solid rgb(255 255 255 / 22%);` | `.k-drama-feature__shorts-header > div > span` |
| `styles.css:1845` | `border: 1px solid rgb(255 255 255 / 55%);` | `.k-drama-feature__shorts-caption > div span` |
| (참고) `styles.css:360` | `border: 1px solid var(--color-bg);` | `.k-drama-hero-card__feed-chip--time` — `1px`만 리터럴이고 색상은 토큰 사용, 목록에 포함 |

### 3.5 길이 — `ch` 리터럴, 2건

| 파일:라인 | 값(라인 원문) | 맥락(선택자) |
|---|---|---|
| `styles.css:219` | `width: 18ch;` | `.k-drama-hero-card__url-text` |
| `styles.css:231` | `width: 18ch;` | `@keyframes k-drama-url-typing` (`92%` 스텝) |

### 3.6 길이 — `em` 리터럴 (letter-spacing), 2건

| 파일:라인 | 값(라인 원문) | 맥락(선택자) |
|---|---|---|
| `styles.css:966` | `letter-spacing: 0.08em;` | `.k-drama-feature__url-card small` |
| `styles.css:1047` | `letter-spacing: 0.08em;` | `.k-drama-feature__youtube-box small` |

### 3.7 시간 — `s`/`ms` 리터럴 (`var(--duration-*)`를 거치지 않은 애니메이션/트랜지션 값), 21건

| 파일:라인 | 값(라인 원문) | 맥락(선택자) |
|---|---|---|
| `styles.css:98` | `animation: k-drama-caption-highlight 2.4s ease-in-out infinite;` | `.k-drama-hero-card__captions span` |
| `styles.css:223` | `animation: k-drama-url-typing 6s steps(18, end) infinite;` | `.k-drama-hero-card__url-text` |
| `styles.css:270` | `animation: k-drama-download-progress 6s linear infinite;` | `.k-drama-hero-card__download-progress` |
| `styles.css:324` | `animation: k-drama-feed-swipe 7s ease-in-out infinite;` | `.k-drama-hero-card__feed-slides` |
| `styles.css:371` | `animation: k-drama-feed-progress 7s linear infinite;` | `.k-drama-hero-card--feed .k-drama-hero-card__progress::before` |
| `styles.css:722` | `--shadowing-duration: 4.8s;` | `.k-drama-feature__scene-caption` (커스텀 프로퍼티 선언) |
| `styles.css:723` | `--shadowing-delay: 0s;` | `.k-drama-feature__scene-caption` (커스텀 프로퍼티 선언) |
| `styles.css:748` | `--shadowing-delay: 0.8s;` | `.k-drama-feature__scene-caption strong span:nth-child(2), ...` |
| `styles.css:753` | `--shadowing-delay: 1.6s;` | `.k-drama-feature__scene-caption strong span:nth-child(3), ...` |
| `styles.css:1079` | `animation: k-drama-feature-url-typing 5s steps(25, end) infinite;` | `.k-drama-feature__url-value` |
| `styles.css:1132` | `animation: k-drama-feature-download 5s linear infinite;` | `.k-drama-feature__lesson-progress` |
| `styles.css:1203` | `animation: k-drama-feature-skeleton-reveal 5s linear infinite;` | `.k-drama-feature__lesson-skeleton, .k-drama-feature__saved-skeleton` |
| `styles.css:1212` | `animation: k-drama-feature-skeleton-shimmer 5s linear infinite;` | `.k-drama-feature__lesson-skeleton span, .k-drama-feature__saved-skeleton span` |
| `styles.css:1314` | `animation: k-drama-feature-saved-content 5s linear infinite;` | `.k-drama-feature__saved-card:first-child .k-drama-feature__saved-overlay` |
| `styles.css:1594` | `animation: k-drama-challenge-wave 0.8s ease-in-out infinite alternate;` | `.k-drama-feature__challenge-wave i` |
| `styles.css:1596` | `.k-drama-feature__challenge-wave i:nth-child(2n) { height: 82%; animation-delay: -0.4s; }` | `.k-drama-feature__challenge-wave i:nth-child(2n)` (한 줄짜리 규칙) |
| `styles.css:1597` | `.k-drama-feature__challenge-wave i:nth-child(3n) { height: 58%; animation-delay: -0.2s; }` | `.k-drama-feature__challenge-wave i:nth-child(3n)` (한 줄짜리 규칙) |
| `styles.css:1662` | `transition: transform 160ms ease;` | `.k-drama-feature__challenge-start button:hover i` |
| `styles.css:1686` | `animation: k-drama-challenge-countdown 700ms ease-out both;` | `.k-drama-feature__challenge-countdown span` |
| `styles.css:1717` | `transition: transform 680ms cubic-bezier(0.22, 1, 0.36, 1);` | `.k-drama-feature__shorts-slides` |
| `styles.css:1815` | `animation: k-drama-challenge-tap 500ms ease-out both;` | `.k-drama-feature__shorts-actions.is-clicking .is-challenge svg` |
| `styles.css:1832` | `transition: opacity 320ms ease 180ms, transform 420ms ease 180ms;` | `.k-drama-feature__shorts-caption` |

참고: `k-drama-shadowing-word`, `k-drama-shadowing-word-clean`, `k-drama-shadowing-chip`
애니메이션 자체의 `animation:` 선언(`styles.css:742`, `762`, `781`)은 지속시간에
`var(--shadowing-duration)` 커스텀 프로퍼티를 사용하지만, 그 커스텀 프로퍼티의 값
자체(`styles.css:722-723`, `748`, `753`)는 위 표에 포함된 생값 리터럴이다.

### 3.8 구조적으로 토큰화가 불가능한 값 — 미디어 쿼리 breakpoint

| 파일:라인 | 값(라인 원문) | 비고 |
|---|---|---|
| `styles.css:521` | `@media (min-width: 48.01rem) {` | `packages/design-tokens/src/tokens.css:105`의 `--breakpoint-mobile: 48rem` 토큰이 존재하지만, CSS 커스텀 프로퍼티는 `@media` 조건식 안에서 사용할 수 없어 리터럴 `48.01rem`을 직접 썼다. |
| `styles.css:1974` | `@media (max-width: 48rem) {` | 위와 동일한 구조적 제약. `--breakpoint-mobile` 값(`48rem`)과 리터럴이 우연히 일치한다. |

## 4. 하드코딩 카피 감사 (locale resource `t()`를 거치지 않고 JSX에 직접 박힌 사용자 가시 문자열)

스캔 대상: `apps/k-drama/src/app/App.tsx`,
`apps/k-drama/src/features/k-drama/KDramaDualSubtitleFeature.tsx`,
`apps/k-drama/src/features/k-drama/KDramaShortformFeature.tsx`,
`apps/k-drama/src/features/k-drama/KDramaYoutubeLessonFeature.tsx`.
`KDramaProofStrip.tsx`는 `title`/`metrics` prop만 렌더하므로 하드코딩 카피가 0건이다.

"aria-hidden 여부"는 문자열이 렌더되는 DOM 서브트리의 조상에
`aria-hidden="true"`가 존재하는지를 뜻한다(스크린 리더 노출 여부와 직결).

### 4.1 `apps/k-drama/src/app/App.tsx`

전제: 세 히어로 카드는 각각 `role="img"` 컨테이너 안에 `aria-hidden="true"`가
지정된 `k-drama-hero-card__content` div를 갖는다(video 카드 61번 줄, lesson 카드
81번 줄, feed 카드 111번 줄).

| 파일:라인 | 문자열 | aria-hidden 여부 |
|---|---|---|
| `App.tsx:62` | `Don't pause real clips` | 예 (61번 줄 조상) |
| `App.tsx:63` | `Study a real Korean moment frame by frame.` | 예 |
| `App.tsx:65` | `순식간에 배워보세요` | 예 |
| `App.tsx:66` | `Apprenez en un instant` | 예 |
| `App.tsx:67` | `Aprende en minutos` | 예 |
| `App.tsx:70` | `0:14` | 예 |
| `App.tsx:71` | `0:42` | 예 |
| `App.tsx:82` | `Make your own lesson` | 예 (81번 줄 조상) |
| `App.tsx:87` | `youtube.com/shorts/...` | 예 |
| `App.tsx:99-101` | `Paste a link.` / `Get a lesson.` | 예 |
| `App.tsx:103` | `Turn clips into captions, saved lines, and review cards.` | 예 |
| `App.tsx:115` | `Too busy?` | 예 (111번 줄 조상) |
| `App.tsx:118` | `K-pop` | 예 |
| `App.tsx:120` | `0:03` | 예 |
| `App.tsx:124` | `오늘도 좋은 하루 보내세요` | 예 |
| `App.tsx:127-128` | `One more scene` | 예 |
| `App.tsx:131` | `K-drama` | 예 |
| `App.tsx:134` | `0:08` | 예 |
| `App.tsx:138` | `괜찮아, 천천히 해도 돼` | 예 |
| `App.tsx:145` | `12K` | 예 |
| `App.tsx:149` | `342` | 예 |
| `App.tsx:157` | `Save` | 예 |
| `App.tsx:190` | `Get early access` (`ButtonLink` 라벨) | **아니오** — 화면에 노출되는 실 CTA 텍스트이며 `t()` 미사용 |

### 4.2 `apps/k-drama/src/features/k-drama/KDramaDualSubtitleFeature.tsx`

전제: 컴포넌트 루트 div가 `aria-hidden="true"`(67번 줄)이므로 이 파일의 모든
텍스트는 조상 aria-hidden에 해당한다.

| 파일:라인 | 문자열 | aria-hidden 여부 |
|---|---|---|
| `KDramaDualSubtitleFeature.tsx:15` | `오징어 게임1: Squid Game 2` | 예 |
| `KDramaDualSubtitleFeature.tsx:16` | `🔥 연속 챌린지 2회 달성` | 예 |
| `KDramaDualSubtitleFeature.tsx:39-40` | `0:14` / `0:42` | 예 |
| `KDramaDualSubtitleFeature.tsx:44` | `title="다시 재생"` | 예 |
| `KDramaDualSubtitleFeature.tsx:47` | `title="뒤로 가기"` | 예 |
| `KDramaDualSubtitleFeature.tsx:50` | `title="중지"` | 예 |
| `KDramaDualSubtitleFeature.tsx:51` | `title="재생"` | 예 |
| `KDramaDualSubtitleFeature.tsx:52` | `title="챌린지"` | 예 |
| `KDramaDualSubtitleFeature.tsx:71-72` | `captionWords={["Smooth","like","butter"]}`, `romanizationWords={["스무스","라이크","버터"]}` (호출부 리터럴) | 예 |
| `KDramaDualSubtitleFeature.tsx:111-112` | `captionWords={["무궁화","꽃이","피었습니다"]}`, `romanizationWords={["Mugunghwa","kkochi","pieotseumnida"]}` (호출부 리터럴) | 예 |

### 4.3 `apps/k-drama/src/features/k-drama/KDramaShortformFeature.tsx`

전제: 이 컴포넌트의 루트 div(203번 줄, `k-drama-feature k-drama-feature--shortform`)에는
`aria-hidden` 속성이 없다. 이는 같은 폴더의 `KDramaDualSubtitleFeature`(루트에
`aria-hidden="true"`)·`KDramaYoutubeLessonFeature`(루트에 `aria-hidden="true"`)와
다른 사실이다. 아래 문자열은 아이콘 자체(`lucide-react` 아이콘 각각에 개별
`aria-hidden="true"`)를 제외하면 스크린 리더에 노출된다.

| 파일:라인 | 문자열 | aria-hidden 여부 |
|---|---|---|
| `KDramaShortformFeature.tsx:48` | `Speaking Challenge` | 아니오 |
| `KDramaShortformFeature.tsx:55` | `Repeat after the scene` | 아니오 |
| `KDramaShortformFeature.tsx:56` | `아저씨 사랑해요` | 아니오 |
| `KDramaShortformFeature.tsx:57` | `Ajeossi, saranghaeyo · Mister, I love you` | 아니오 |
| `KDramaShortformFeature.tsx:59` | `Hear original` | 아니오 |
| `KDramaShortformFeature.tsx:74` | `REC&nbsp;&nbsp;00:08` | 아니오 |
| `KDramaShortformFeature.tsx:77` | `aria-label="Record again"` | 아니오 |
| `KDramaShortformFeature.tsx:80` | `aria-label="Stop recording"` | 아니오 |
| `KDramaShortformFeature.tsx:83` | `aria-label="Share challenge"` | 아니오 |
| `KDramaShortformFeature.tsx:87` | `Finish your take and share the challenge` | 아니오 |
| `KDramaShortformFeature.tsx:93` | `aria-label="Start speaking challenge"` | 아니오 |
| `KDramaShortformFeature.tsx:99` | `Tap to start your challenge` | 아니오 |
| `KDramaShortformFeature.tsx:105` | `Get ready` | 아니오 |
| `KDramaShortformFeature.tsx:125` | `Pick up Korean from every scene` | 아니오 |
| `KDramaShortformFeature.tsx:126` | `Swipe for your next phrase` | 아니오 |
| `KDramaShortformFeature.tsx:135` | `Short Feed` | 아니오 |
| `KDramaShortformFeature.tsx:136` | `🔥 5-day learning streak` | 아니오 |
| `KDramaShortformFeature.tsx:138` | `⌕ · ▣` | 아니오 |
| `KDramaShortformFeature.tsx:143` | `Challenge` | 아니오 |
| `KDramaShortformFeature.tsx:147` | `12K` | 아니오 |
| `KDramaShortformFeature.tsx:151` | `Dislike` | 아니오 |
| `KDramaShortformFeature.tsx:155` | `342` | 아니오 |
| `KDramaShortformFeature.tsx:159` | `Share` | 아니오 |
| `KDramaShortformFeature.tsx:163` | `Remix` | 아니오 |
| `KDramaShortformFeature.tsx:168` | `@talkie.korean` | 아니오 |
| `KDramaShortformFeature.tsx:169` | `Learn` | 아니오 |
| `KDramaShortformFeature.tsx:171` | `Learn today's phrase from this scene: 아저씨 사랑해요` | 아니오 |
| `KDramaShortformFeature.tsx:172` | `Ajeossi, saranghaeyo · Mister, I love you` | 아니오 |
| `KDramaShortformFeature.tsx:173` | `#LearnKorean #SceneLearning #Kdrama` | 아니오 |

### 4.4 `apps/k-drama/src/features/k-drama/KDramaYoutubeLessonFeature.tsx`

전제: 컴포넌트 루트 div가 `aria-hidden="true"`(3번 줄)이므로 이 파일의 모든
텍스트는 조상 aria-hidden에 해당한다.

| 파일:라인 | 문자열 | aria-hidden 여부 |
|---|---|---|
| `KDramaYoutubeLessonFeature.tsx:5` | `URL EMBED` | 예 |
| `KDramaYoutubeLessonFeature.tsx:7` | `Paste the YouTube link you want to study.` | 예 |
| `KDramaYoutubeLessonFeature.tsx:11` | `youtube.com/shorts/k-drama` | 예 |
| `KDramaYoutubeLessonFeature.tsx:13` | `Create lesson` | 예 |
| `KDramaYoutubeLessonFeature.tsx:32` | `K-drama` | 예 |
| `KDramaYoutubeLessonFeature.tsx:34` | `무궁화 꽃이 피었습니다` | 예 |
| `KDramaYoutubeLessonFeature.tsx:36` | `Mugunghwa kkochi pieotseumnida` | 예 |
| `KDramaYoutubeLessonFeature.tsx:46` | `Save lessons` | 예 |
| `KDramaYoutubeLessonFeature.tsx:47` | `전체보기 &gt;` | 예 |
| `KDramaYoutubeLessonFeature.tsx:59` | `Squid Game` | 예 |
| `KDramaYoutubeLessonFeature.tsx:60` | `🔥 4회 들음` | 예 |
| `KDramaYoutubeLessonFeature.tsx:63` | `무궁화 꽃이 피었습니다` | 예 |
| `KDramaYoutubeLessonFeature.tsx:64` | `Mugunghwa kkochi pieotseumnida` | 예 |
| `KDramaYoutubeLessonFeature.tsx:66-68` | `무궁화` / `꽃이` / `피었습니다` | 예 |
| `KDramaYoutubeLessonFeature.tsx:77` | `BTS · Butter` | 예 |
| `KDramaYoutubeLessonFeature.tsx:78` | `🔥 7회 들음` | 예 |
| `KDramaYoutubeLessonFeature.tsx:81` | `오늘 무대 최고였어` | 예 |
| `KDramaYoutubeLessonFeature.tsx:82` | `Oneul mudae choegoyeosseo` | 예 |
| `KDramaYoutubeLessonFeature.tsx:84-86` | `오늘` / `무대` / `최고였어` | 예 |
| `KDramaYoutubeLessonFeature.tsx:95` | `Weak Hero` | 예 |
| `KDramaYoutubeLessonFeature.tsx:96` | `🔥 3회 들음` | 예 |
| `KDramaYoutubeLessonFeature.tsx:99` | `끝까지 포기하지 마` | 예 |
| `KDramaYoutubeLessonFeature.tsx:100` | `Kkeutkkaji pogihaji ma` | 예 |
| `KDramaYoutubeLessonFeature.tsx:102-104` | `끝까지` / `포기하지` / `마` | 예 |
| `KDramaYoutubeLessonFeature.tsx:113` | `Daily Korean` | 예 |
| `KDramaYoutubeLessonFeature.tsx:114` | `🔥 5회 들음` | 예 |
| `KDramaYoutubeLessonFeature.tsx:117` | `오늘도 좋은 하루 보내세요` | 예 |
| `KDramaYoutubeLessonFeature.tsx:118` | `Oneuldo joeun haru bonaeseyo` | 예 |
| `KDramaYoutubeLessonFeature.tsx:120-122` | `오늘도` / `좋은 하루` / `보내세요` | 예 |

## 5. 요약 카운트

| 카테고리 | 건수 |
|---|---|
| 색상 — hex 리터럴 | 100 |
| 색상 — rgb() 리터럴 | 69 |
| 길이 — rem 리터럴 | 147 |
| 길이 — px 리터럴 | 17 |
| 길이 — ch 리터럴 | 2 |
| 길이 — em 리터럴 | 2 |
| 시간 — s/ms 리터럴 | 21 |
| 구조적 예외 — 미디어 쿼리 breakpoint | 2 |
| 하드코딩 카피 — App.tsx | 23줄(24개 문자열 그룹), 그중 aria-hidden 아님 1건(`Get early access`) |
| 하드코딩 카피 — KDramaDualSubtitleFeature.tsx | 10줄, 전부 aria-hidden |
| 하드코딩 카피 — KDramaShortformFeature.tsx | 28줄, 전부 aria-hidden 아님 |
| 하드코딩 카피 — KDramaYoutubeLessonFeature.tsx | 28줄, 전부 aria-hidden |
| `apps/k-drama/src/**/*.ts(x)`의 색상/길이/시간 생값 | 0건 |
