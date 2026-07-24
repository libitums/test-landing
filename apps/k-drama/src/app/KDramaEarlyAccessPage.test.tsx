import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { getRuntime } from "../i18n";
import { KDramaEarlyAccessPage } from "./KDramaEarlyAccessPage";

function fillRequiredFields() {
  fireEvent.change(screen.getByRole("textbox", { name: "Email" }), {
    target: { value: "learner@example.com" },
  });
  fireEvent.click(
    screen.getByRole("checkbox", {
      name: "I agree to receive early-access and launch updates by email.",
    }),
  );
}

describe("KDramaEarlyAccessPage", () => {
  it("renders an accessible localized form and keeps locale route state", () => {
    render(
      <KDramaEarlyAccessPage
        runtime={getRuntime("/en-US/k-drama/early-access")}
        location="/en-US/k-drama/early-access?source=hero#form"
      />,
    );

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Be first to practice Korean with Baetter",
    );
    expect(screen.getByRole("textbox", { name: "Email" })).toBeRequired();
    expect(screen.getByRole("link", { name: "Korean" })).toHaveAttribute(
      "href",
      "/ko-KR/k-drama/early-access?source=hero#form",
    );
  });

  it("does not send data before a submission port is provided", async () => {
    render(
      <KDramaEarlyAccessPage
        runtime={getRuntime("/en-US/k-drama/early-access")}
        location="/en-US/k-drama/early-access"
      />,
    );
    fillRequiredFields();
    fireEvent.submit(screen.getByRole("button", { name: "Reserve early access" }).closest("form")!);
    expect(await screen.findByRole("status")).toHaveTextContent("Registration is not connected yet");
  });

  it("passes a provider-neutral payload through the submission port", async () => {
    const submitRegistration = vi.fn().mockResolvedValue(undefined);
    render(
      <KDramaEarlyAccessPage
        runtime={getRuntime("/en-US/k-drama/early-access")}
        location="/en-US/k-drama/early-access"
        submitRegistration={submitRegistration}
      />,
    );
    fillRequiredFields();
    fireEvent.submit(screen.getByRole("button", { name: "Reserve early access" }).closest("form")!);

    await waitFor(() =>
      expect(submitRegistration).toHaveBeenCalledWith({
        email: "learner@example.com",
        marketingConsent: true,
      }),
    );
    expect(await screen.findByRole("status")).toHaveTextContent("You are on the list");
  });

  it("exposes a dialog with a dismiss control in overlay mode", () => {
    const onClose = vi.fn();
    render(
      <KDramaEarlyAccessPage
        runtime={getRuntime("/en-US/")}
        location="/en-US/"
        overlay
        onClose={onClose}
      />,
    );
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    fireEvent.click(screen.getByTestId("early-access-backdrop"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
