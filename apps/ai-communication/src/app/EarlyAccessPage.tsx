import { useEffect, useState, type FormEvent } from "react";
import type { I18nRuntime } from "@landing/contracts/i18n";
import { localizePath } from "@landing/i18n";
import { baetterLogo, Checkbox, Input } from "@landing/ui";
import { registry } from "../i18n";

export interface EarlyAccessSubmission {
  email: string;
  marketingConsent: boolean;
}

export interface EarlyAccessPageProps {
  runtime: I18nRuntime;
  location: string;
  submitRegistration?: (submission: EarlyAccessSubmission) => Promise<void>;
  overlay?: boolean;
  onClose?: () => void;
}

export function EarlyAccessPage({
  runtime,
  location,
  submitRegistration,
  overlay = false,
  onClose,
}: EarlyAccessPageProps) {
  const [status, setStatus] = useState<"idle" | "pending" | "success" | "error">("idle");
  const t = runtime.translate;
  const homeHref = `/${runtime.locale}/`;

  useEffect(() => {
    if (overlay) return;
    document.title = `${t("earlyAccess.form.title")} — Baetter`;
  }, [overlay, t]);

  useEffect(() => {
    if (!overlay) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose, overlay]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!submitRegistration) {
      setStatus("pending");
      return;
    }

    const data = new FormData(form);
    setStatus("pending");
    try {
      await submitRegistration({
        email: String(data.get("email") ?? "").trim(),
        marketingConsent: data.get("marketingConsent") === "on",
      });
      form.reset();
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div
      className={`early-access${overlay ? " early-access--overlay" : ""}`}
      data-testid="early-access-page"
      onMouseDown={
        overlay
          ? (event) => {
              if (!(event.target as Element).closest(".early-access__modal")) onClose?.();
            }
          : undefined
      }
    >
      {!overlay ? (
        <header className="early-access__header">
          <a className="early-access__brand" href={homeHref} aria-label={t("brand")}>
            <span className="early-access__brand-crop">
              <img src={baetterLogo} alt="" />
            </span>
          </a>
          <nav className="early-access__locales" aria-label={t("locale.label")}>
            {registry.supportedLocales.map((candidate) => (
              <a
                key={candidate}
                href={localizePath(registry, location, candidate)}
                hrefLang={candidate}
                aria-current={candidate === runtime.locale ? "page" : undefined}
              >
                {t(`locale.${candidate}`)}
              </a>
            ))}
          </nav>
        </header>
      ) : null}

      <main className="early-access__main">
        <div
          className="early-access__modal"
          role={overlay ? "dialog" : undefined}
          aria-modal={overlay ? "true" : undefined}
          aria-labelledby={overlay ? "early-access-form-title" : "early-access-title"}
        >
          {overlay ? (
            <button
              className="early-access__close"
              type="button"
              onClick={onClose}
              aria-label={t("earlyAccess.close")}
            >
              ×
            </button>
          ) : null}
          {!overlay ? (
            <section className="early-access__intro" aria-labelledby="early-access-title">
              {!overlay ? (
                <a className="early-access__back" href={homeHref}>
                  ← {t("earlyAccess.back")}
                </a>
              ) : null}
              <p className="early-access__eyebrow">{t("earlyAccess.eyebrow")}</p>
              <h1 id="early-access-title">{t("earlyAccess.title")}</h1>
              <p className="early-access__description">{t("earlyAccess.description")}</p>
              <ul className="early-access__benefits">
                <li>{t("earlyAccess.benefit.invite")}</li>
                <li>{t("earlyAccess.benefit.voice")}</li>
                <li>{t("earlyAccess.benefit.feedback")}</li>
              </ul>
            </section>
          ) : null}

          <section
            id="form"
            className="early-access__card"
            aria-labelledby="early-access-form-title"
          >
            <h2 id="early-access-form-title">{t("earlyAccess.form.title")}</h2>
            <p>{t("earlyAccess.form.description")}</p>
            <form className="early-access__form" onSubmit={handleSubmit}>
              <label className="early-access__field--wide">
                <span>{t("earlyAccess.form.email")}</span>
                <Input name="email" type="email" autoComplete="email" required />
              </label>
              <label className="early-access__consent early-access__field--wide">
                <Checkbox name="marketingConsent" required />
                <span>{t("earlyAccess.form.consent")}</span>
              </label>
              <p className="early-access__privacy">{t("earlyAccess.form.privacy")}</p>
              <p className="early-access__status" role="status" aria-live="polite">
                {status === "pending" && !submitRegistration
                  ? t("earlyAccess.form.integrationPending")
                  : null}
                {status === "success" ? t("earlyAccess.form.success") : null}
                {status === "error" ? t("earlyAccess.form.error") : null}
              </p>
              <button
                className="button button--primary early-access__submit"
                type="submit"
                disabled={status === "pending" && Boolean(submitRegistration)}
              >
                {status === "pending" && submitRegistration
                  ? t("earlyAccess.form.submitting")
                  : t("earlyAccess.form.submit")}
              </button>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}
