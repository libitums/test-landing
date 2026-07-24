import { render, screen, within } from "@testing-library/react";
import type { ProofMetric } from "@landing/contracts";
import { describe, expect, it } from "vitest";
import { KDramaProofStrip } from "./KDramaProofStrip";

const metrics: readonly ProofMetric[] = [
  { id: "watch", label: "Watch", value: "Bring in the shows you already love watching." },
  {
    id: "understand",
    label: "Understand",
    value: "See subtitles side by side to learn words in context.",
  },
  { id: "speak", label: "Speak", value: "Repeat the scene's lines out loud." },
];

describe("KDramaProofStrip", () => {
  it("renders a word + description pair for each item using dl/dt/dd semantics", () => {
    render(<KDramaProofStrip metrics={metrics} title="How you learn" />);

    const section = screen.getByTestId("k-drama-proof-strip");
    expect(section).toHaveAccessibleName("How you learn");

    expect(section.querySelector("dl.proof-grid")).toBeInTheDocument();
    expect(within(section).getAllByRole("term")).toHaveLength(metrics.length);

    for (const metric of metrics) {
      const item = screen.getByTestId(`k-drama-proof:${metric.id}`);
      const term = within(item).getByText(metric.label);
      const description = within(item).getByText(metric.value);
      expect(term.tagName).toBe("DT");
      expect(description.tagName).toBe("DD");
    }
  });

  it("never renders bare numeric or percentage metric values", () => {
    render(<KDramaProofStrip metrics={metrics} title="How you learn" />);
    for (const metric of metrics) {
      expect(metric.value).not.toMatch(/^\d+%?$|^\d+×$/);
    }
  });
});
