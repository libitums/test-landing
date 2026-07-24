# Supabase early-access form state contract

## Status and scope

This is the frozen visual, interaction, and accessibility contract for connecting
the existing `ai-communication` early-access form to the shared Supabase
submission boundary. It follows `DESIGN.md` with no deviation. The existing modal
composition in `EarlyAccessModal` is the visual reference: its
content order, card geometry, field layout, and responsive behavior do not change.

Only `ai-communication` receives an interactive form in this phase. Admin UI and
forms for `k-drama` and `k-culture` are out of scope. The contract applies to the
modal at every viewport supported by the existing app.

## Existing visual structure to preserve

The implementation keeps this order inside `early-access__card`:

1. localized form heading and description;
2. labeled email input;
3. required marketing-consent checkbox and its full consent statement;
4. privacy copy;
5. one persistent status-message location;
6. the full-width primary submit button.

Desktop retains the current two-column form grid with each present control
spanning the grid. At `--breakpoint-mobile` and below it becomes one column. Text,
including translated status copy and the submit label, may wrap; no state adds a
fixed block size or causes horizontal scrolling. The modal's sticky submit behavior
remains intact.

## Closed state model

The form exposes exactly the following user-visible states. `idle` is the initial
and post-editing state; the other names are stable implementation and test
vocabulary.

| State              | Trigger and visible result                                                                                                                                                                                                           | Controls and next action                                                                                                                                                                                         |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `idle`             | No status panel is visible. The email, consent, privacy copy, and default submit label remain as today.                                                                                                                              | Email and consent are enabled. Submit is enabled and uses the primary button states.                                                                                                                             |
| `validation-error` | Client validation fails before a request, or the submission boundary rejects invalid email/consent. Show an error beside the invalid field and the summary copy “Check the highlighted field and try again.” in the status location. | No request is sent for client failure. Keep all controls enabled. Move focus to the first invalid control. Correcting a field removes only that field's error; submit retries after the form is valid.           |
| `pending`          | A valid submission starts. The status location says “Saving your registration…” and the button label says “Saving…”. No spinner is required.                                                                                         | Disable email, consent, and submit for the full request lifetime. This, plus request-side guarding, prevents duplicate submission. Preserve entered values and focus; do not move focus into the status message. |
| `success`          | Any accepted submission, including a repeated email saved as a new row, says “You are on the list. We will be in touch soon.”                                                                                                        | Reset email and consent only after acceptance. Re-enable all controls. Keep the submit button available for a new registration. Do not automatically close the overlay or redirect.                              |
| `network-error`    | A network failure or non-rate-limit service/storage failure says “We could not save your registration. Check your connection and try again.”                                                                                         | Preserve both entered values, re-enable controls, and restore the default submit label so the same submission can be retried.                                                                                    |
| `rate-limit`       | The rate-limit response says “Too many registration attempts. Please wait one minute and try again.” It must not reuse the generic network message.                                                                                  | Preserve both entered values and re-enable controls. Do not run or display a countdown. A later submit is an explicit retry.                                                                                     |

All displayed strings are localized resources; the English sentences above are
the canonical meaning and test copy, not literals to place in JSX. Existing
localized submit and success resources remain valid. The obsolete
`integrationPending` presentation is not part of the connected state model.

## Field-error contract

- Invalid email and missing consent are separate failures. Each invalid control
  receives `aria-invalid="true"` and an `aria-describedby` reference to its own
  visible localized error message. Valid controls omit `aria-invalid` and do not
  reference an absent error.
- The email error appears immediately after the email control; the consent error
  appears after the consent row. Each uses `--space-2`, `--text-xs`,
  `--font-semibold`, and `--color-danger`. Invalid input borders use
  `--color-danger`; focus still uses `--focus-ring`, so error and focus remain
  simultaneously perceivable.
- Browser-native constraint validation may remain as an additional safeguard, but
  the implementation must expose the visible, associated messages above so the
  contract does not depend on browser-specific bubbles.
- A validation response from the submission boundary maps back to the same field
  treatment and summary. It never appears as `network-error`.

## Status surface and semantic priority

The existing `early-access__status` position is the only status-message location.
It stays in the layout when a message is present and uses the existing
`--space-3`, `--radius-lg`, `--text-sm`, and `--font-semibold` treatment.

| State              | Surface and text roles                                                         | Announcement                             |
| ------------------ | ------------------------------------------------------------------------------ | ---------------------------------------- |
| `pending`          | `--color-editorial-control` surface and `--color-fg` text                      | polite live status                       |
| `success`          | `--color-editorial-control` surface and `--color-editorial-accent-active` text | polite live status                       |
| `validation-error` | `--color-surface` surface, `--color-danger` text, and `--color-danger` border  | assertive alert after the submit attempt |
| `network-error`    | same danger roles; distinct message includes retry guidance                    | assertive alert                          |
| `rate-limit`       | same danger roles; distinct message includes the one-minute wait               | assertive alert                          |

State identity never relies on color: every state has unique text, and error
states include their reason or recovery action. Maintain a persistent live-region
node so changes are announced. `pending` and `success` use `role="status"` with
`aria-live="polite"`; failures use `role="alert"` (assertive). Do not place
decorative glyphs in the accessible name. If a visible icon is later composed, it
must be decorative and use existing tokens; it is not required by this contract.

## Interaction and focus

- A submit attempt enters at most one state. While `pending`, pointer, keyboard,
  Enter-key, and programmatic repeated submissions cannot begin another request.
- The pending button uses the native `disabled` attribute. Email and consent are
  also disabled so their values cannot diverge from the in-flight payload. The
  disabled appearance uses `--color-disabled-bg`, `--color-disabled-fg`, and the
  existing non-interactive cursor behavior; hover and active treatments do not run.
- On `success`, `network-error`, or `rate-limit`, focus stays on the submit button
  that initiated the request. The live region provides the result without an
  unexpected focus jump. On `validation-error`, focus moves only to the first
  invalid control.
- `--focus-ring` remains visible on every enabled interactive element and cannot be
  replaced by a color-only focus state.
- Status appearance changes use `--duration-fast` and `--ease-standard` at most.
  No loading loop, pulse, or content motion is required. Under
  `prefers-reduced-motion: reduce`, status changes are immediate.
- A result announcement occurs once per state transition. Re-renders and localized
  resource lookup must not repeat the same announcement.

## Token decision and contrast

No new design token is needed. Implementation reuses:

- structure: `--space-2`, `--space-3`, `--space-6`, `--radius-lg`,
  `--breakpoint-mobile`;
- typography: `--text-xs`, `--text-sm`, `--font-semibold`;
- neutral and success presentation: `--color-surface`,
  `--color-editorial-control`, `--color-fg`,
  `--color-editorial-accent-active`;
- failure presentation: `--color-danger` and the existing neutral surface;
- controls: `--color-disabled-bg`, `--color-disabled-fg`, `--focus-ring`;
- transition: `--duration-fast`, `--ease-standard`.

The existing opaque foreground/surface pairs are used. Danger is conveyed through
text and a border on a light surface, while success and the form eyebrow use
`--color-editorial-accent-active` for small text. Its `#4938d2` value has an sRGB
contrast of approximately 6.89:1 over `--color-editorial-control` (`#f5f3ff`) and
7.22:1 over `--color-surface` (`#f8fafc`). Both exceed the 4.5:1 WCAG AA threshold
for normal text. Core text and controls therefore retain the `DESIGN.md` WCAG AA
gate. Disabled color is not used to communicate request status by itself; native
disabled semantics and the live message accompany it.

## Verification contract

Implementation and accessibility tests must cover the modal form and verify:

1. state-specific localized copy and the absence of `integrationPending` after the
   adapter is connected;
2. one request despite repeated submit attempts during `pending`;
3. disabled inputs and button during `pending`, followed by re-enable on every
   terminal state;
4. reset only on `success`, with values preserved for both error states;
5. field association, `aria-invalid`, first-invalid focus, and no request on client
   validation failure;
6. polite pending/success announcements and assertive, distinguishable validation,
   network, and rate-limit announcements;
7. no automatic overlay close, redirect, countdown, or duplicate-email warning;
8. wrapping without clipping at mobile width and with expanded localized strings;
9. visible keyboard focus and reduced-motion behavior.

## Design freeze

The existing form composition, closed state names, field-error placement, status
semantics, control behavior, responsive treatment, and token mappings above are
frozen for implementation. No visual token addition or unresolved design decision
remains.
