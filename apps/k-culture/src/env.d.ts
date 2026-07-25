/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** GA4 measurement id. Absent in development and preview, injected per Vercel project. */
  readonly VITE_GA_MEASUREMENT_ID?: string;
  /** Shared roll-up property that receives all three apps for cross-app reporting. */
  readonly VITE_GA_ROLLUP_MEASUREMENT_ID?: string;
  /** Meta pixel id, used only for ad optimisation events. */
  readonly VITE_META_PIXEL_ID?: string;
}
