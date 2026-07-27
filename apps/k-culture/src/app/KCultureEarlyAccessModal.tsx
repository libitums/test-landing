import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import type { FormFunnelReporter } from "@landing/analytics";
import {
  earlyAccessFailureStateByCode,
  earlyAccessTestIds,
  type EarlyAccessSubmissionError,
  type SubmitEarlyAccessRegistration,
} from "@landing/contracts/early-access";
import { Checkbox, Input } from "@landing/ui";

type Status = "idle" | "validation-error" | "pending" | "success" | "network-error" | "rate-limit";

export interface KCultureEarlyAccessModalProps {
  submitRegistration: SubmitEarlyAccessRegistration;
  onClose: () => void;
  funnel: FormFunnelReporter;
}

function errorCode(reason: unknown): EarlyAccessSubmissionError["code"] {
  const code = (reason as { code?: unknown } | null)?.code;
  return code === "validation" || code === "rate_limited" || code === "network" ? code : "server";
}

export function KCultureEarlyAccessModal({
  submitRegistration,
  onClose,
  funnel,
}: KCultureEarlyAccessModalProps) {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [invalid, setInvalid] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const submittingRef = useRef(false);

  useEffect(() => {
    const previous = document.activeElement;
    const dialog = dialogRef.current;
    dialog?.querySelector<HTMLElement>("input, button")?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      if (previous instanceof HTMLElement && previous.isConnected) previous.focus();
    };
  }, [onClose]);

  function handleEmail(event: ChangeEvent<HTMLInputElement>) {
    funnel.fieldTouched("email");
    setEmail(event.currentTarget.value);
    setInvalid(false);
    setStatus("idle");
  }

  function handleConsent(event: ChangeEvent<HTMLInputElement>) {
    funnel.fieldTouched("marketingConsent");
    setConsent(event.currentTarget.checked);
    setStatus("idle");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submittingRef.current) return;
    const normalizedEmail = email.trim();
    funnel.submitted();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(normalizedEmail) || !consent) {
      funnel.failed("validation");
      setInvalid(true);
      setStatus("validation-error");
      return;
    }
    submittingRef.current = true;
    setInvalid(false);
    setStatus("pending");
    try {
      await submitRegistration({ email: normalizedEmail, marketingConsent: consent });
      funnel.succeeded();
      setEmail("");
      setConsent(false);
      setStatus("success");
    } catch (reason) {
      const code = errorCode(reason);
      funnel.failed(code);
      setStatus(earlyAccessFailureStateByCode[code]);
    } finally {
      submittingRef.current = false;
    }
  }

  const message = {
    idle: "",
    pending: "Saving your spot…",
    success: "You're on the list. We'll send your early-access invite by email.",
    "validation-error": "Enter a valid email and agree to receive early-access updates.",
    "network-error": "We couldn't save your spot. Please try again.",
    "rate-limit": "Too many attempts. Please wait a moment and try again.",
  }[status];
  const failed = status === "validation-error" || status === "network-error" || status === "rate-limit";

  return (
    <div className="early-access early-access--overlay" data-testid={earlyAccessTestIds.page}>
      <div className="early-access__main">
        <button className="early-access__backdrop" type="button" onClick={onClose} aria-label="Close early access form" data-testid="early-access-backdrop" />
        <dialog ref={dialogRef} className="early-access__modal" open aria-modal="true" aria-labelledby="early-access-title">
          <button className="early-access__close" type="button" onClick={onClose} aria-label="Close">×</button>
          <section className="early-access__card">
            <span className="early-access__eyebrow">K-zip early access</span>
            <h2 id="early-access-title">Get early access</h2>
            <p>Be first to learn the Korean behind the culture you love.</p>
            <form className="early-access__form" onSubmit={handleSubmit} noValidate data-testid={earlyAccessTestIds.form}>
              <label className="early-access__field early-access__field--wide">
                <span>Email address</span>
                <Input name="email" type="email" autoComplete="email" required disabled={status === "pending"} value={email} onChange={handleEmail} aria-invalid={invalid || undefined} data-testid={earlyAccessTestIds.email} />
              </label>
              <label className="early-access__consent early-access__field--wide">
                <Checkbox name="marketingConsent" required disabled={status === "pending"} checked={consent} onChange={handleConsent} data-testid={earlyAccessTestIds.marketingConsent} />
                <span>I agree to receive K-zip early-access and product updates.</span>
              </label>
              <p className="early-access__privacy">We only use your email for K-zip updates. Unsubscribe anytime.</p>
              <p className={`early-access__status early-access__status--${status}`} role={failed ? "alert" : "status"} aria-live="polite" data-testid={earlyAccessTestIds.status}>{message}</p>
              <button className="button button--primary early-access__submit" type="submit" disabled={status === "pending"} data-testid={earlyAccessTestIds.submit}>
                {status === "pending" ? "Saving…" : status === "success" ? "You're on the list" : "Reserve my spot"}
              </button>
            </form>
          </section>
        </dialog>
      </div>
    </div>
  );
}
