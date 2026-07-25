import type { TrackedSection } from "./engagement-dom";

export interface SectionDiscoveryOptions {
  root: ParentNode;
  /** Ordered `[sectionId, selector]` pairs for the fixed landing sections. */
  named: readonly (readonly [string, string])[];
  /** Stripped from shared feature test ids so section ids match `feature_cta_clicked` ids. */
  featurePrefix?: string | undefined;
}

const featureRootPattern = /^shared-feature:[^:]+$/;

/**
 * Derives the section id shared by feature views and feature CTA clicks, from any shared
 * feature test id — the root or one of its descendants.
 */
export function featureSectionId(testId: string, featurePrefix = ""): string | undefined {
  const [namespace, featureId] = testId.split(":");
  if (namespace !== "shared-feature" || featureId === undefined || featureId === "") {
    return undefined;
  }

  return `feature:${featureId.startsWith(featurePrefix) ? featureId.slice(featurePrefix.length) : featureId}`;
}

/**
 * Resolves sections from the rendered DOM instead of extra wrapper markup, so tracking
 * cannot change layout. Missing sections are skipped rather than reported as empty.
 */
export function discoverSections(options: SectionDiscoveryOptions): TrackedSection[] {
  const named = options.named.flatMap(([id, selector]) => {
    const element = options.root.querySelector(selector);
    return element === null ? [] : [{ id, element }];
  });

  const features = [...options.root.querySelectorAll("[data-testid^='shared-feature:']")]
    .filter((element) => featureRootPattern.test(element.getAttribute("data-testid") ?? ""))
    .flatMap((element) => {
      const id = featureSectionId(
        element.getAttribute("data-testid") ?? "",
        options.featurePrefix ?? "",
      );
      return id === undefined ? [] : [{ id, element }];
    });

  return [...named, ...features];
}
