import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { locale, localizePath } from "@landing/i18n";
import "@landing/ui/styles.css";
import "./styles.css";
import { App } from "./app/App";
import { createAppAnalytics } from "./analytics";
import { applyLocaleMetadata, createTestRegistry, getEntryRuntime } from "./i18n";

const pseudoEnabled = import.meta.env.DEV || import.meta.env.MODE === "test";
const runtime = getEntryRuntime(window.location.pathname, window.location.search, pseudoEnabled);
const analytics = createAppAnalytics(window.location.search, {}, runtime.locale);
const pseudoRegistry = runtime.locale === "en-XA" ? createTestRegistry() : undefined;
const metadataPath = pseudoRegistry
  ? localizePath(pseudoRegistry, window.location.pathname, locale("en-XA"))
  : window.location.pathname;
applyLocaleMetadata(metadataPath, pseudoRegistry);
const location = `${window.location.pathname}${window.location.search}${window.location.hash}`;
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App analytics={analytics} runtime={runtime} location={location} />
  </StrictMode>,
);
