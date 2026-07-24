import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { getRuntime } from "../i18n";
import { EarlyAccessPage } from "./EarlyAccessPage";

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

describe("EarlyAccessPage", () => {
  it("renders an accessible localized form and keeps locale route state", () => {
    render(
      <EarlyAccessPage
        runtime={getRuntime("/en-US/ai-communication/early-access")}
        location="/en-US/ai-communication/early-access?source=hero#form"
      />,
    );

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Be first to practice Korean with Baetter",
    );
    expect(screen.getByRole("textbox", { name: "Email" })).toBeRequired();
    expect(screen.getByRole("link", { name: "Korean" })).toHaveAttribute(
      "href",
      "/ko-KR/ai-communication/early-access?source=hero#form",
    );
  });

  it("does not send data before the shared Supabase adapter is provided", async () => {
    render(
      <EarlyAccessPage
        runtime={getRuntime("/en-US/ai-communication/early-access")}
        location="/en-US/ai-communication/early-access"
      />,
    );
    fillRequiredFields();
    fireEvent.submit(screen.getByRole("button", { name: "Reserve early access" }).closest("form")!);
    expect(await screen.findByRole("status")).toHaveTextContent(
      "The form UI is ready. Registration will open",
    );
  });

  it("passes a provider-neutral payload through the future submission port", async () => {
    const submitRegistration = vi.fn().mockResolvedValue(undefined);
    render(
      <EarlyAccessPage
        runtime={getRuntime("/en-US/ai-communication/early-access")}
        location="/en-US/ai-communication/early-access"
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
});
