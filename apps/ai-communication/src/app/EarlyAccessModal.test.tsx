import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { EarlyAccessSubmissionError } from "@landing/contracts/early-access";
import { describe, expect, it, vi } from "vitest";
import { getRuntime } from "../i18n";
import { EarlyAccessModal } from "./EarlyAccessModal";

const location = "/en-US/";

function renderPage(submitRegistration = vi.fn().mockResolvedValue(undefined)) {
  render(
    <EarlyAccessModal
      runtime={getRuntime(location)}
      submitRegistration={submitRegistration}
      onClose={vi.fn()}
    />,
  );
  return submitRegistration;
}

function email() {
  return screen.getByRole("textbox", { name: "Email" });
}

function consent() {
  return screen.getByRole("checkbox", {
    name: "I agree to receive early-access and launch updates by email.",
  });
}

function submit() {
  fireEvent.submit(screen.getByTestId("early-access-form"));
}

function fillRequiredFields(value = "learner@example.com") {
  fireEvent.change(email(), { target: { value } });
  fireEvent.click(consent());
}

function rejection(code: EarlyAccessSubmissionError["code"]): EarlyAccessSubmissionError {
  if (code === "validation") {
    return {
      name: "EarlyAccessSubmissionError",
      code,
      issues: [{ field: "email", code: "invalid" }],
    };
  }
  if (code === "rate_limited") {
    return { name: "EarlyAccessSubmissionError", code, retryAfterSeconds: 60 };
  }
  return { name: "EarlyAccessSubmissionError", code };
}

describe("EarlyAccessModal", () => {
  it("renders the stable accessible modal form contract", () => {
    renderPage();
    expect(screen.getByTestId("early-access-page")).toBeInTheDocument();
    expect(screen.getByTestId("early-access-email")).toBeRequired();
    expect(screen.getByRole("dialog", { name: "Reserve your spot" })).toBeInTheDocument();
  });

  it("blocks invalid input, associates visible errors, and focuses the first invalid field", async () => {
    const submitRegistration = renderPage();
    submit();

    expect(submitRegistration).not.toHaveBeenCalled();
    expect(email()).toHaveAttribute("aria-invalid", "true");
    expect(email()).toHaveAccessibleDescription("Enter a valid email address.");
    expect(consent()).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByRole("alert")).toHaveTextContent("Check the highlighted field");
    await waitFor(() => expect(email()).toHaveFocus());

    fireEvent.change(email(), { target: { value: "learner@example.com" } });
    expect(email()).not.toHaveAttribute("aria-invalid");
    expect(consent()).toHaveAttribute("aria-invalid", "true");
  });

  it("passes trimmed data, guards duplicate pending submits, and resets only on success", async () => {
    let resolveSubmission: (() => void) | undefined;
    const submitRegistration = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveSubmission = resolve;
        }),
    );
    renderPage(submitRegistration);
    fillRequiredFields("  learner@example.com  ");
    submit();
    submit();

    expect(submitRegistration).toHaveBeenCalledTimes(1);
    expect(submitRegistration).toHaveBeenCalledWith({
      email: "learner@example.com",
      marketingConsent: true,
    });
    expect(email()).toBeDisabled();
    expect(consent()).toBeDisabled();
    expect(screen.getByRole("button", { name: "Saving…" })).toBeDisabled();
    expect(screen.getByRole("status")).toHaveTextContent("Saving your registration");

    resolveSubmission?.();
    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent("You are on the list"),
    );
    expect(email()).toHaveValue("");
    expect(consent()).not.toBeChecked();
    expect(email()).toBeEnabled();
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Reserve early access" })).toHaveFocus(),
    );
  });

  it.each([
    ["network", "We could not save your registration"],
    ["server", "We could not save your registration"],
    ["rate_limited", "Too many registration attempts"],
  ] as const)("maps %s rejection and preserves values", async (code, message) => {
    renderPage(vi.fn().mockRejectedValue(rejection(code)));
    fillRequiredFields();
    submit();

    expect(await screen.findByRole("alert")).toHaveTextContent(message);
    expect(email()).toHaveValue("learner@example.com");
    expect(consent()).toBeChecked();
    expect(screen.getByRole("button", { name: "Reserve early access" })).toBeEnabled();
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Reserve early access" })).toHaveFocus(),
    );
  });

  it("maps adapter validation issues to the field and supports a later successful retry", async () => {
    const submitRegistration = vi
      .fn()
      .mockRejectedValueOnce(rejection("validation"))
      .mockResolvedValueOnce(undefined);
    renderPage(submitRegistration);
    fillRequiredFields();
    submit();

    expect(await screen.findByRole("alert")).toHaveTextContent("Check the highlighted field");
    await waitFor(() => expect(email()).toHaveFocus());
    expect(email()).toHaveValue("learner@example.com");

    fireEvent.change(email(), { target: { value: "retry@example.com" } });
    submit();
    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent("You are on the list"),
    );
    expect(submitRegistration).toHaveBeenCalledTimes(2);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("moves focus into the overlay, traps Tab, and restores the opener focus", async () => {
    const opener = document.createElement("button");
    opener.textContent = "Open registration";
    document.body.append(opener);
    opener.focus();
    const onClose = vi.fn();
    const { unmount } = render(
      <EarlyAccessModal
        runtime={getRuntime(location)}
        submitRegistration={vi.fn().mockResolvedValue(undefined)}
        onClose={onClose}
      />,
    );

    const close = screen.getByRole("button", { name: "Close early-access form" });
    await waitFor(() => expect(close).toHaveFocus());
    fireEvent.keyDown(document, { key: "Tab", shiftKey: true });
    expect(screen.getByRole("button", { name: "Reserve early access" })).toHaveFocus();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);

    unmount();
    expect(opener).toHaveFocus();
    opener.remove();
  });

  it("safely maps an unknown rejection to the retry UI", async () => {
    renderPage(vi.fn().mockRejectedValue(new Error("provider detail")));
    fillRequiredFields();
    submit();
    expect(await screen.findByRole("alert")).toHaveTextContent("Check your connection");
  });

  it("returns to idle when the email is edited after success", async () => {
    renderPage();
    fillRequiredFields();
    submit();
    await screen.findByText("You are on the list. We will be in touch soon.");

    fireEvent.change(email(), { target: { value: "another@example.com" } });

    expect(email()).toHaveValue("another@example.com");
    expect(screen.getByTestId("early-access-status")).toBeEmptyDOMElement();
    expect(screen.getByTestId("early-access-status")).toHaveRole("status");
  });

  it.each(["network", "rate_limited"] as const)(
    "returns to idle when a field is edited after %s failure",
    async (code) => {
      renderPage(vi.fn().mockRejectedValue(rejection(code)));
      fillRequiredFields();
      submit();
      await screen.findByRole("alert");

      fireEvent.click(consent());

      expect(email()).toHaveValue("learner@example.com");
      expect(consent()).not.toBeChecked();
      expect(screen.getByTestId("early-access-status")).toBeEmptyDOMElement();
      expect(screen.getByTestId("early-access-status")).toHaveRole("status");
    },
  );
});
