# 기여 가이드

이 저장소는 pnpm 워크스페이스 기반의 랜딩 실험 모노레포입니다. 아래만 지키면 됩니다.

## 준비

- Node 22, pnpm (버전은 `package.json`의 `packageManager`가 결정 — `corepack enable` 권장)
- 설치: `pnpm install`

## 자주 쓰는 스크립트

| 명령 | 설명 |
|------|------|
| `pnpm dev:k-drama` (또는 `dev:ai-communication`, `dev:k-culture`) | 앱 개발 서버 |
| `pnpm typecheck` | 전 워크스페이스 타입 검사 |
| `pnpm lint` | ESLint |
| `pnpm test` | 단위·통합 테스트 (Vitest) |
| `pnpm build` | 프로덕션 빌드 |
| `pnpm e2e` / `pnpm e2e:update` | Playwright E2E / 스냅샷 갱신 |
| `pnpm format` / `pnpm format:check` | Prettier |

## 브랜치와 커밋

- `main`에서 브랜치를 따서 작업합니다 (`feat/...`, `fix/...`).
- 커밋은 [Conventional Commits](https://www.conventionalcommits.org/)를 따릅니다: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`, `ci:`. PR에서 `Commit Lint`가 확인합니다.
- 리뷰가 쉽도록 **작게, 관심사별로** 커밋하세요.

## Pull Request

- PR을 열면 자동으로 리뷰어(조직 멤버)가 배정되고, 작성자가 assignee로 지정되며, 변경 경로에 따라 라벨이 붙습니다.
- `CI`(typecheck · lint · test · build)가 실행됩니다. 브랜치 보호는 없으므로 병합을 강제로 막지는 않지만, **머지 전 초록불을 확인**해주세요.
- 시각(E2E 스냅샷) 관련 변경은 `*-darwin.png` 기준으로 로컬(macOS)에서 갱신합니다. CI는 플랫폼 차이로 E2E를 돌리지 않습니다.

## 참고 문서

- 모노레포 설계·스펙: `docs/design/landing-monorepo.md`, `docs/specs/landing-monorepo.md`
- 기능별 스펙/디자인: `docs/specs/`, `docs/design/`
