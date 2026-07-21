import type { I18nRuntime } from "@landing/contracts/i18n";
import { localizePath } from "@landing/i18n";
import { registry } from "../i18n";
export function LocaleNavigation({
  runtime,
  location,
}: {
  runtime: I18nRuntime;
  location: string;
}) {
  return (
    <nav
      id="locale-navigation"
      className="locale-nav"
      aria-label={runtime.translate("locale.label")}
    >
      {registry.supportedLocales.map((candidate) => (
        <a
          key={candidate}
          href={localizePath(registry, location, candidate)}
          aria-current={candidate === runtime.locale ? "page" : undefined}
        >
          {runtime.translate(`locale.${candidate}`)}
        </a>
      ))}
    </nav>
  );
}
