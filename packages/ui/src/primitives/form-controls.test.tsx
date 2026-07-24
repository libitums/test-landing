import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { describe, expect, it } from "vitest";
import { Checkbox, Input, Select, Textarea } from "./form-controls";

describe("form controls", () => {
  it("forwards native attributes and composes shadcn-style class names", () => {
    render(
      <>
        <Input aria-label="Email" type="email" required className="custom-input" />
        <Select aria-label="Level" defaultValue="beginner">
          <option value="beginner">Beginner</option>
        </Select>
        <Textarea aria-label="Goal" rows={3} />
        <Checkbox aria-label="Consent" required />
      </>,
    );

    expect(screen.getByRole("textbox", { name: "Email" })).toHaveClass("ui-input", "custom-input");
    const select = screen.getByRole("combobox", { name: "Level" });
    expect(select).toHaveClass("ui-select");
    expect(select.parentElement).toHaveClass("ui-select-root");
    expect(select.parentElement?.querySelector(".ui-select-icon")).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Goal" })).toHaveClass("ui-textarea");
    expect(screen.getByRole("checkbox", { name: "Consent" })).toHaveClass("ui-checkbox");
  });
});
