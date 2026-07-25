# Measurement plan — Meta ads to early access

How the landing pages are measured, what each number means, and the URL rules the ads have
to follow for any of it to work.

## Properties

| Property         | Id        | Measurement id | Receives       |
| ---------------- | --------- | -------------- | -------------- |
| ai-communication | 547067207 | `G-PXFZE55LDP` | that app only  |
| k-drama          | 546985970 | `G-DRCRY4DEKK` | that app only  |
| k-culture        | 547070568 | `G-8RJ6T2EZP4` | that app only  |
| all-apps-rollup  | 546995023 | `G-3K7ED4LTR6` | all three apps |

Every page reports to two properties: its own and the roll-up. Use the
per-app properties for day-to-day reporting, and the roll-up whenever a question spans apps
("which app converts best in Vietnam on the pain-point creative"). Split the roll-up by the
`Project` dimension.

Data retention is set to 14 months on all four properties. The default is 2 months, which is
too short to compare a campaign against the one before it.

Both ids are passed to `gtag('config', ...)` and events are sent **without `send_to`**, so one
call fans out to every configured destination. Sending the same event once per destination
makes GA4 drop the later copies as duplicates.

> New stream caveat, 2026-07-25: a freshly created data stream only sends the automatic
> `page_view`; gtag drops custom events before they leave the browser. Reproduced on both
> streams created that day (`G-3K7ED4LTR6`, `G-8RJ6T2EZP4`), including from a standalone page
> that configures nothing else, while the streams created hours earlier
> (`G-PXFZE55LDP`, `G-DRCRY4DEKK`) send everything. Letting real hits through to activate the
> property did not change it, so it is time, not the tag code or activation. Re-check Realtime
> for 546995023 and 547070568 after the next deploy before trusting their numbers.

## Ad URL rules

GA4 reads UTM parameters into its own session dimensions, so the ad URL is where campaign
reporting is decided. Meta substitutes the braces at delivery time.

```
https://<app-domain>/<locale>/
  ?utm_source=meta
  &utm_medium=paid_social
  &utm_campaign={{campaign.name}}
  &utm_content={{ad.name}}
  &utm_term={{adset.name}}
  &utm_id={{campaign.id}}
```

- `utm_content` carries the creative slide. Name the two ads so they read well in a report,
  e.g. `slide-painpoint` and `slide-features`.
- `utm_term` carries the ad set, which is how countries are split. Name ad sets after the
  country, e.g. `kr`, `us`, `vn`.
- Meta's in-app browser drops the referrer. Without UTM parameters that traffic lands in
  `(direct)` and is unattributable, so no ad may run without them.
- `fbclid` is appended by Meta automatically and is not used by GA4.

In reports these arrive as Session source / medium / campaign / manual ad content / manual
term. They need no custom dimensions.

## Where each question is answered

| Question                                        | Where                                                      |
| ----------------------------------------------- | ---------------------------------------------------------- |
| Which creative and country drive traffic        | Session campaign / manual ad content / manual term         |
| Who they are — age, gender, interests           | **Meta Ads Manager breakdowns**, not GA4                   |
| Where they are                                  | GA4 geo dimensions, from IP                                |
| How far they read                               | `scroll_depth_reached`, `page_exited.max_scroll_percent`   |
| Which sections they actually looked at          | `section_viewed`, `section_dwelled.dwell_ms`               |
| Which feature holds attention                   | `section_dwelled` on `feature:*` vs `feature_cta_clicked`  |
| Where they gave up                              | `page_exited.last_section_id`                              |
| Whether they opened the form and from which CTA | `form_opened.source_id`                                    |
| Where they abandoned the form                   | `form_abandoned.last_field_id`                             |
| Whether they registered                         | `form_submitted`, `conversion_completed` (both key events) |

GA4 demographics need Google Signals, and even then rows below the reporting threshold are
hidden. Meta knows the age and interests of the people it served the ad to, so read
demographics there and join to GA4 through `utm_content` / `utm_term`.

## Event reference

All events carry the shared context: `project_id`, `experiment_id`, `variant_id`, `locale`,
`page_id`, `country_hint`, `event_version`.

| Event                  | Extra parameters                                      | Fires when                                         |
| ---------------------- | ----------------------------------------------------- | -------------------------------------------------- |
| `experiment_viewed`    | —                                                     | once per page load                                 |
| `section_viewed`       | `section_id`                                          | a section first becomes half visible               |
| `section_dwelled`      | `section_id`, `dwell_ms`                              | on exit, once per section that was seen            |
| `scroll_depth_reached` | `scroll_percent`                                      | crossing 25 / 50 / 75 / 90 percent                 |
| `page_exited`          | `last_section_id`, `max_scroll_percent`, `engaged_ms` | tab hidden or page unloaded                        |
| `cta_clicked`          | —                                                     | hero or final CTA                                  |
| `feature_cta_clicked`  | `feature_id`                                          | a feature CTA                                      |
| `form_opened`          | `form_id`, `source_id`                                | the early access form opens                        |
| `form_started`         | `form_id`, `field_id`                                 | first field touched                                |
| `form_submitted`       | `form_id`                                             | submit pressed                                     |
| `form_failed`          | `form_id`, `error_code`                               | validation, rate limit, network, or server failure |
| `form_abandoned`       | `form_id`, `last_field_id`                            | form closed without registering                    |
| `conversion_completed` | —                                                     | registration accepted                              |

Section ids are `hero`, `proof`, `cta`, `pricing`, and `feature:<id>` where `<id>` matches
the `feature_id` on `feature_cta_clicked`, so views and clicks join directly.

`engaged_ms` only accumulates while the tab is visible. Scroll depth is not reported at all
on a page that cannot scroll, so a short viewport never inflates the numbers.

## Keeping the numbers clean

**Internal traffic.** Open any app with `?ga_internal=1` once and that browser is marked
`traffic_type=internal` for good; `?ga_internal=0` undoes it. It survives page loads through
local storage, so it works on phones and over a VPN, where an IP rule does not. GA4 still has
to be told to drop that traffic: Admin → Data collection and modification → Data filters →
Internal Traffic → set the state to **Active** (it ships in Testing state, which changes
nothing). Do this on all four properties.

**Conversion alert.** Admin → Custom insights → create one for `conversion_completed` with
the condition "is less than 1" over a day, emailed to whoever watches the campaign. A broken
form after a deploy otherwise burns ad spend silently. There is no Admin API for either of
these, so both are UI steps.

**BigQuery export.** Not enabled: GA4 refuses to link to a Google Cloud project without a
billing account, and `project-93860f66-0727-4252-8c3` has none. Once billing is attached, the
link can be created for each property against dataset location `asia-northeast3`. This is the
one addition that unlocks true sequence analysis — GA4 explorations cannot answer "which
sections did the visitors who registered see, compared with those who left".

## Meta pixel

The pixel is loaded only when `VITE_META_PIXEL_ID` is set, and receives just four events:
`PageView`, `ViewContent` (a feature CTA), `Lead` (`form_submitted`), and
`CompleteRegistration` (`conversion_completed`). Engagement events stay in GA4 — sending
everything to Meta dilutes the optimisation signal instead of improving it.

GA4 cannot feed Meta's delivery model, which is why the pixel exists at all. Without it the
campaign cannot optimise for registrations or build retargeting audiences.

## Consent

Consent mode v2 defaults to `analytics_storage: granted` with all three advertising signals
denied, and there is no cookie banner. That is a deliberate decision for KR/US targeting. If
the campaign expands into the EU, add a banner and switch the defaults to denied before the
first euro is spent.

## Environment variables

Per app, Production only, so preview deployments never pollute reporting:

- `VITE_GA_MEASUREMENT_ID` — the app's own property
- `VITE_GA_ROLLUP_MEASUREMENT_ID` — `G-3K7ED4LTR6`
- `VITE_META_PIXEL_ID` — unset until the pixel is created

Nothing is sent from development or test builds: the sinks are only constructed when
`import.meta.env.PROD` is true.
