# Phase 2 localization design contract

This document freezes the visual contract for locale-aware content in
`k-drama`, `ai-communication`, and `k-culture`. It extends `DESIGN.md`; it does
not introduce a parallel design system or change existing component markup.

## Locale and direction

- The implementation supplies `lang` and `dir` from the active locale at the
  document root. Direction is `ltr` for Latin/CJK locales and `rtl` for Arabic
  (and any future locale explicitly marked RTL in locale metadata).
- Layout rules use logical properties (`margin-inline`, `padding-inline`,
  `inset-inline`, `border-start-*`, and `text-align: start/end`). No component
  may infer direction from string content.
- Locale switching must preserve the current route and experiment context.

## Typography and fallback

Existing `--font-sans` remains the single body/UI token. Its fallback chain must
include generic `sans-serif` and remain valid when the preferred face is absent;
locale-specific font files are optional and must not be required for first paint.
Arabic and CJK glyphs must render with a system fallback rather than tofu boxes.
This centralized token is the font fallback declaration for all three apps; do
not duplicate or override the chain per app, locale, or component.
`--leading-heading` and
`--leading-body` remain the line-height tokens; translated copy must be allowed
to wrap naturally.

## Layout invariants for translated copy

- Avoid fixed heights for headings, descriptions, notices, and CTA groups.
- CTA labels may wrap to two lines; the hit target still uses
  `--control-height` as a minimum, not a fixed height.
- Long words/URLs use safe wrapping (`overflow-wrap: anywhere` only on content
  intended to contain unbroken tokens); normal prose keeps readable wrapping.
- Cards and hero sections grow vertically; no clipping, ellipsis, or hidden
  overflow may conceal primary actions.
- RTL mirrors visual order only where the reading direction requires it; source
  and keyboard order stay semantic and unchanged.

## Pseudo-locale visual contract

The pseudo-locale expands strings (approximately 30–40%), adds accented glyphs,
and keeps the same direction as its source locale. It is a test locale, never a
production fallback. Screenshots/E2E must verify that every primary CTA remains
visible and keyboard focus remains within the viewport at mobile and desktop
breakpoints.

## Verification checks

1. Render each app in two LTR locales and one RTL locale; assert root `lang` and
   `dir` values and verify no horizontal overflow at supported breakpoints.
2. Run pseudo-locale E2E and assert primary CTA visibility, non-clipped text,
   and focus-ring visibility.
3. Validate locale metadata (`canonical`, `hreflang`) against the active locale.
4. Check number/date formatting through `Intl` using locale fixtures; snapshots
   must not contain raw untranslated keys.

Design freeze: reuse all existing tokens in `packages/design-tokens/src/tokens.css`;
no new visual values or component variants are required for Phase 2.
