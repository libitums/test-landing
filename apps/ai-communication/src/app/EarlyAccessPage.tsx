import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import {
  earlyAccessFailureStateByCode,
  earlyAccessTestIds,
  type EarlyAccessSubmissionError,
  type EarlyAccessValidationIssue,
  type SubmitEarlyAccessRegistration,
} from "@landing/contracts/early-access";
import type { I18nRuntime } from "@landing/contracts/i18n";
import { localizePath } from "@landing/i18n";
import { baetterLogo, Checkbox, Input } from "@landing/ui";
import { registry } from "../i18n";

type FormStatus =
  "idle" | "validation-error" | "pending" | "success" | "network-error" | "rate-limit";

type FieldErrors = Partial<Record<"email" | "marketingConsent", true>>;

export interface EarlyAccessPageProps {
  runtime: I18nRuntime;
  location: string;
  submitRegistration: SubmitEarlyAccessRegistration;
  overlay?: boolean;
  onClose?: () => void;
}

function validate(email: string, marketingConsent: boolean): FieldErrors {
  const errors: FieldErrors = {};
  const parts = email.split("@");
  const hasControlCharacter = [...email].some((character) => {
    const code = character.charCodeAt(0);
    return code <= 31 || code === 127;
  });
  if (
    email.length === 0 ||
    email.length > 254 ||
    parts.length !== 2 ||
    !parts[0] ||
    !parts[1] ||
    !parts[1].includes(".") ||
    /\s/u.test(email) ||
    hasControlCharacter
  )
    errors.email = true;
  if (!marketingConsent) errors.marketingConsent = true;
  return errors;
}

function isSubmissionError(reason: unknown): reason is EarlyAccessSubmissionError {
  if (typeof reason !== "object" || reason === null || !("name" in reason) || !("code" in reason)) {
    return false;
  }
  const candidate = reason as { name: unknown; code: unknown };
  return (
    candidate.name === "EarlyAccessSubmissionError" &&
    (candidate.code === "validation" ||
      candidate.code === "rate_limited" ||
      candidate.code === "network" ||
      candidate.code === "server")
  );
}

function fieldErrorsFromIssues(issues: readonly EarlyAccessValidationIssue[]): FieldErrors {
  const errors: FieldErrors = {};
  for (const issue of issues) {
    if (issue.field === "email" || issue.field === "marketingConsent") errors[issue.field] = true;
  }
  return errors;
}

function withoutField(errors: FieldErrors, field: keyof FieldErrors): FieldErrors {
  const next = { ...errors };
  delete next[field];
  return next;
}

export function EarlyAccessPage({
  runtime,
  location,
  submitRegistration,
  overlay = false,
  onClose,
}: EarlyAccessPageProps) {
  const [status, setStatus] = useState<FormStatus>("idle");
  const [email, setEmail] = useState("");
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const submittingRef = useRef(false);
  const consentRef = useRef<HTMLInputElement>(null);
  const submitRef = useRef<HTMLButtonElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const t = runtime.translate;
  const homeHref = `/${runtime.locale}/`;

  useEffect(() => {
    if (overlay) return;
    document.title = `${t("earlyAccess.form.title")} — Baetter`;
  }, [overlay, t]);

  useEffect(() => {
    if (!overlay) return;
    const previouslyFocused = document.activeElement;
    const modal = modalRef.current;
    const focusableSelector =
      'button:not(:disabled), input:not(:disabled), a[href], [tabindex]:not([tabindex="-1"])';
    modal?.querySelector<HTMLElement>(focusableSelector)?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose?.();
        return;
      }
      if (event.key !== "Tab" || !modal) return;

      const focusable = [...modal.querySelectorAll<HTMLElement>(focusableSelector)].filter(
        (element) => !element.hasAttribute("disabled"),
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) {
        event.preventDefault();
        return;
      }
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      if (previouslyFocused instanceof HTMLElement && previouslyFocused.isConnected) {
        previouslyFocused.focus();
      }
    };
  }, [onClose, overlay]);

  function focusFirstInvalid(errors: FieldErrors) {
    requestAnimationFrame(() => {
      if (errors.email) document.getElementById("early-access-email")?.focus();
      else if (errors.marketingConsent) consentRef.current?.focus();
    });
  }

  function restoreSubmitFocus() {
    requestAnimationFrame(() => submitRef.current?.focus());
  }

  function handleEmailChange(event: ChangeEvent<HTMLInputElement>) {
    setEmail(event.currentTarget.value);
    setStatus("idle");
    if (fieldErrors.email) {
      setFieldErrors((current) => withoutField(current, "email"));
    }
  }

  function handleConsentChange(event: ChangeEvent<HTMLInputElement>) {
    setMarketingConsent(event.currentTarget.checked);
    setStatus("idle");
    if (fieldErrors.marketingConsent) {
      setFieldErrors((current) => withoutField(current, "marketingConsent"));
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submittingRef.current) return;

    const trimmedEmail = email.trim();
    const clientErrors = validate(trimmedEmail, marketingConsent);
    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors);
      setStatus("validation-error");
      focusFirstInvalid(clientErrors);
      return;
    }

    submittingRef.current = true;
    setEmail(trimmedEmail);
    setFieldErrors({});
    setStatus("pending");
    try {
      await submitRegistration({ email: trimmedEmail, marketingConsent });
      setEmail("");
      setMarketingConsent(false);
      setStatus("success");
      restoreSubmitFocus();
    } catch (reason) {
      const error: EarlyAccessSubmissionError = isSubmissionError(reason)
        ? reason
        : { name: "EarlyAccessSubmissionError", code: "server" };
      const nextStatus = earlyAccessFailureStateByCode[error.code];
      if (error.code === "validation") {
        const adapterErrors = fieldErrorsFromIssues(error.issues);
        setFieldErrors(adapterErrors);
        focusFirstInvalid(adapterErrors);
      } else {
        restoreSubmitFocus();
      }
      setStatus(nextStatus);
    } finally {
      submittingRef.current = false;
    }
  }

  const isPending = status === "pending";
  const statusMessage =
    status === "pending"
      ? t("earlyAccess.form.pending")
      : status === "success"
        ? t("earlyAccess.form.success")
        : status === "validation-error"
          ? t("earlyAccess.form.validationSummary")
          : status === "network-error"
            ? t("earlyAccess.form.networkError")
            : status === "rate-limit"
              ? t("earlyAccess.form.rateLimit")
              : "";
  const isFailure =
    status === "validation-error" || status === "network-error" || status === "rate-limit";

  return (
    <div
      className={`early-access${overlay ? " early-access--overlay" : ""}`}
      data-testid={earlyAccessTestIds.page}
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
        {overlay ? (
          <button
            className="early-access__backdrop"
            type="button"
            onClick={onClose}
            aria-label={t("earlyAccess.dismiss")}
            data-testid="early-access-backdrop"
          />
        ) : null}
        <div
          ref={modalRef}
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
              <a className="early-access__back" href={homeHref}>
                ← {t("earlyAccess.back")}
              </a>
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
            <form
              className="early-access__form"
              onSubmit={handleSubmit}
              noValidate
              data-testid={earlyAccessTestIds.form}
            >
              <div className="early-access__field early-access__field--wide">
                <label htmlFor="early-access-email">{t("earlyAccess.form.email")}</label>
                <Input
                  id="early-access-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  disabled={isPending}
                  value={email}
                  onChange={handleEmailChange}
                  aria-invalid={fieldErrors.email || undefined}
                  aria-describedby={fieldErrors.email ? "early-access-email-error" : undefined}
                  data-testid={earlyAccessTestIds.email}
                />
                {fieldErrors.email ? (
                  <span id="early-access-email-error" className="early-access__field-error">
                    {t("earlyAccess.form.emailError")}
                  </span>
                ) : null}
              </div>
              <div className="early-access__field--wide">
                <label className="early-access__consent">
                  <Checkbox
                    ref={consentRef}
                    name="marketingConsent"
                    required
                    disabled={isPending}
                    checked={marketingConsent}
                    onChange={handleConsentChange}
                    aria-invalid={fieldErrors.marketingConsent || undefined}
                    aria-describedby={
                      fieldErrors.marketingConsent ? "early-access-consent-error" : undefined
                    }
                    data-testid={earlyAccessTestIds.marketingConsent}
                  />
                  <span>{t("earlyAccess.form.consent")}</span>
                </label>
                {fieldErrors.marketingConsent ? (
                  <span id="early-access-consent-error" className="early-access__field-error">
                    {t("earlyAccess.form.consentError")}
                  </span>
                ) : null}
              </div>
              <p className="early-access__privacy">{t("earlyAccess.form.privacy")}</p>
              <p
                className={`early-access__status early-access__status--${status}`}
                role={isFailure ? "alert" : "status"}
                aria-live={isFailure ? "assertive" : "polite"}
                data-testid={earlyAccessTestIds.status}
              >
                {statusMessage}
              </p>
              <button
                ref={submitRef}
                className="button button--primary early-access__submit"
                type="submit"
                disabled={isPending}
                data-testid={earlyAccessTestIds.submit}
              >
                {isPending ? t("earlyAccess.form.submitting") : t("earlyAccess.form.submit")}
              </button>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}
