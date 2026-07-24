# AI Communication Pen alignment

## Status and scope

This is the frozen visual contract for the in-use `HeroShowcase`, role-play,
corrections, and bias/persona compositions. It follows `DESIGN.md`; the bespoke
illustrations remain app-owned, while every copied raw color, length, shadow, and
time in `apps/ai-communication/src/styles.css` must be replaced by the token roles
below during implementation. Image URLs and unitless transform/opacity/keyframe
percentages are content or animation state, not design-token values.

## Shared raw-value inventory and mapping

| Raw role currently present                                                           | Frozen token                                                                                                                                                                                                                                                               |
| ------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| white surfaces / text (`#fff`)                                                       | `--color-bg` / `--color-conversation-on-media`                                                                                                                                                                                                                             |
| purple fill (`#7b61ff`, `#635bff`, `#6d28d9`)                                        | `--color-conversation-accent`; white content uses `--color-conversation-accent-fg`                                                                                                                                                                                         |
| pale purple (`#f5f3ff`, `#f6f4ff`)                                                   | `--color-conversation-accent-soft`                                                                                                                                                                                                                                         |
| purple text (`#6d28d9`)                                                              | `--color-conversation-accent-soft-fg`                                                                                                                                                                                                                                      |
| correction / bias canvases (`#fbf9f8`, `#fcfaf7`)                                    | `--color-conversation-canvas`, `--color-conversation-canvas-warm`                                                                                                                                                                                                          |
| selected/chat panel/avatar (`#f6f5f9`, `#e8e8e8`, `#e5e5ea`)                         | `--color-conversation-panel`, `--color-conversation-selected`, `--color-conversation-avatar`                                                                                                                                                                               |
| incoming bubble (`#ededf0`)                                                          | `--color-conversation-bubble`                                                                                                                                                                                                                                              |
| primary dark text (`#111`, `#111827`, `#1f2937`)                                     | `--color-editorial-fg`, `--color-conversation-ink`                                                                                                                                                                                                                         |
| body/support/decorative text (`#374151`, `#4b5563`, `#5f6368`, `#6b7280`, `#9ca3af`) | `--color-conversation-ink-soft`, `--color-muted-fg`, `--color-conversation-ink-muted`, `--color-subtle-fg`, `--color-conversation-icon-muted`                                                                                                                              |
| media base (`#0b0b0f`, `#050505`, `#151515`)                                         | `--color-conversation-media`, `--color-conversation-media-strong`, `--color-editorial-fg`                                                                                                                                                                                  |
| media text (`#fff`, translucent white, `#d2d7dc`)                                    | opaque `--color-conversation-on-media`, `--color-conversation-on-media-muted` only                                                                                                                                                                                         |
| correction arrow (`#0066ff`)                                                         | `--color-conversation-link`                                                                                                                                                                                                                                                |
| dark/light glass and borders                                                         | `--color-conversation-glass`, `--color-conversation-glass-strong`, `--color-conversation-glass-light`, `--color-conversation-glass-border`, `--color-conversation-decoration-border`                                                                                       |
| image gradients (`48%`, `73%`, `60%` black)                                          | `--color-conversation-scrim-top`, `--color-conversation-scrim-bottom`, `--color-conversation-scrim-soft`                                                                                                                                                                   |
| text 9/10/11/12/13/14/15/16/18/20 px                                                 | `--text-2xs`, `--text-compact`, `--text-caption`, `--text-xs`, `--text-ui-sm`, `--text-sm`, `--text-body-sm`, `--text-base`, `--text-lg`, `--text-xl`                                                                                                                      |
| gaps/insets/padding 4/6/8/10/12/14/16/18/20/22/24/28/32 px                           | `--space-1`, `--space-1-5`, `--space-2`, `--space-2-5`, `--space-3`, `--space-3-5`, `--space-4`, `--space-4-5`, `--space-5`, `--space-5-5`, `--space-6`, `--space-7`, `--space-8`                                                                                          |
| round corners 4/6/8/12/16/18/22/24/48 px/full                                        | `--radius-sm`, `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-xl`, `--radius-bubble`, `--radius-panel`, `--radius-2xl`, `--radius-device`, `--radius-full`                                                                                                         |
| bubble/panel/tag/control/card/media/rail/feedback/inset/float/device/glass shadows   | corresponding `--shadow-conversation-*` semantic tokens                                                                                                                                                                                                                    |
| 1/1.9/2.4/3.6/4.4/4.6/5/8 seconds                                                    | `--duration-conversation-dot`, `--duration-conversation-wave`, `--duration-conversation-press`, `--duration-conversation-reply`, `--duration-conversation-arrival`, `--duration-conversation-card`, `--duration-conversation-message`, `--duration-conversation-highlight` |
| 0.16/0.28/0.32/1.2/2.2 second delays                                                 | `--delay-conversation-dot`, `--delay-conversation-card`, `--delay-conversation-dot-late`, `--delay-conversation-press`, `--delay-conversation-alternate`                                                                                                                   |
| `ease-in-out` / spring cubic Bézier                                                  | `--ease-conversation` / `--ease-conversation-spring`                                                                                                                                                                                                                       |
| feature heading clamps / `-0.02em` tracking                                          | `--text-feature-display`, `--text-feature-display-compact`, `--text-feature-display-narrow` / `--tracking-tight`                                                                                                                                                           |
| repeated badge size `44px`                                                           | `--control-height`                                                                                                                                                                                                                                                         |
| repeated glyph/tile/wave geometry `34/88/82px`                                       | `--geometry-glyph-lg`, `--geometry-tile`, `--geometry-wave-block`                                                                                                                                                                                                          |
| card geometry `138/180/200/217/240px`                                                | `--geometry-card-inline-xs`, `--geometry-card-block-sm`, `--geometry-card-inline-sm`, `--geometry-card-inline-md`, `--geometry-card-block-lg`                                                                                                                              |
| notice/device/panel widths `112/270/300/340px`                                       | `--geometry-notice-inline`, `--geometry-device-inline`, `--geometry-panel-inline`, `--geometry-panel-inline-lg`                                                                                                                                                            |
| illustration offsets `150/235/278px`                                                 | `--geometry-offset-sm`, `--geometry-offset-lg`, `--geometry-offset-xl`                                                                                                                                                                                                     |
| illustration heights `560/620px`                                                     | `--geometry-visual-block-compact`, `--geometry-visual-block`                                                                                                                                                                                                               |
| media boundaries `720/768/900px`                                                     | `--breakpoint-conversation-compact`, `--breakpoint-mobile`, `--breakpoint-conversation-stack`                                                                                                                                                                              |

Composition roots may retain semantic aliases such as `--hero-tile-size` or
`--roleplay-phone-inline`, but each alias must resolve to the central geometry,
viewport, typography, or tracking token above. No numeric fallback or local raw
value is allowed. This keeps layout intent readable without duplicating the scale.

## Component alignment

### HeroShowcase

- Three columns wrap without reordering above the compact boundary. At
  `--breakpoint-conversation-compact` the correction column becomes full width and
  moves first; scenario semantics and DOM order remain unchanged.
- Scenario media uses the opaque media foreground tokens over the bottom scrim.
  The correction stack uses accent/outgoing, neutral/incoming, and surface/feedback
  roles. All feedback copy uses the conversation ink hierarchy.
- Tile press and staged-message motion use the conversation duration/easing tokens.

### Role-play

- Desktop is copy plus phone collage. At `--breakpoint-conversation-stack` it stacks
  to one column and scales the decorative visual without changing content order; at
  `--breakpoint-mobile` the shared template also becomes one column.
- Phone chrome uses media/glass roles; tags and controls use surface, accent, and
  soft-accent roles. Decorative scenario cards use the same media/scrim contract as
  the hero.

### Corrections

- Copy precedes a wrapping row of voice, chat, and correction cards. Narrow layouts
  wrap cards without clipping or changing their reading order.
- Voice bars, outgoing bubbles, and typing dots use accent roles. Incoming copy and
  feedback use surface plus ink roles. The feedback card shadow is the only elevated
  level in the chatroom.

### Bias/personas

- Desktop is copy plus chat list/persona grid; it stacks at
  `--breakpoint-conversation-stack`, then retains the same order at mobile.
- Chat rows use panel and ink roles. Persona text uses only opaque on-media colors
  over the bottom scrim. The add tile uses glass plus the float shadow.

## Motion and contrast gate

- Motion exists only inside `prefers-reduced-motion: no-preference`; the static
  state is complete and readable when reduced motion is requested.
- Text and its background must never animate opacity. Message sequencing uses
  `visibility` at discrete keyframes plus `clip-path` and/or transform; every visible
  frame renders foreground and background at full token opacity. The existing
  `fc-*`, `hs-msg-*`, `feature-card-slide`, and text-fill opacity/fade behavior is
  therefore implementation debt and must be replaced before visual approval.
- Media copy never uses translucent white. Use opaque
  `--color-conversation-on-media` (primary) or
  `--color-conversation-on-media-muted` (secondary), with the solid lower scrim
  covering the complete text bounding box.
- Contrast references (sRGB): `#ffffff` on `#6d28d9` is approximately 7.0:1;
  `#6d28d9` on `#f5f3ff` is approximately 6.4:1; `#111827` on `#ffffff` is
  approximately 17.7:1; `#5f6368` on `#fbf9f8` is approximately 5.9:1; and
  `#d2d7dc` on `#050505` is approximately 14:1. These exceed WCAG AA for normal
  text. Focusable controls additionally retain `--focus-ring` and cannot rely on
  color alone.

## Design freeze

The token vocabulary and responsive/contrast behavior above are frozen for
implementation. No unresolved design question remains; implementation must remove
the inventoried raw values and satisfy the motion gate without changing component
structure.
