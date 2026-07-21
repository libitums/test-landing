import type { CtaContent, FeatureItem, HeroContent, ProofMetric } from "@landing/contracts";
import { landingTestIds } from "@landing/contracts";
import { ButtonLink, CtaSection, FeatureGrid, Hero, LandingShell } from "@landing/ui";
import { AlphaProofStrip } from "../features/alpha/AlphaProofStrip";

const hero = {
  eyebrow: "Launch with confidence",
  title: "One system, endless landing experiments",
  description:
    "Compose polished global experiences from shared foundations while keeping each idea free to stand apart.",
  actions: [
    { id: "start", label: "Start exploring", href: "#features", variant: "primary" },
    { id: "method", label: "See the method", href: "#proof", variant: "secondary" },
  ],
} satisfies HeroContent;
const features = [
  {
    id: "speed",
    title: "Ship quickly",
    description: "Reusable foundations keep experimentation focused on the idea.",
  },
  {
    id: "consistency",
    title: "Stay coherent",
    description: "Shared tokens create one visual language across every market.",
  },
  {
    id: "freedom",
    title: "Keep flexibility",
    description: "Experiment-specific UI remains close to the experience it serves.",
  },
] satisfies readonly FeatureItem[];
const metrics = [
  { id: "markets", value: "24", label: "Markets ready" },
  { id: "reuse", value: "82%", label: "Shared foundation" },
  { id: "launch", value: "2×", label: "Faster iteration" },
] satisfies readonly ProofMetric[];
const cta = {
  title: "Make the next idea tangible",
  description:
    "Start from a consistent base and spend your energy on what makes the experiment matter.",
  actions: [{ id: "create", label: "Create an experiment", href: "#top", variant: "primary" }],
} satisfies CtaContent;

export function App() {
  return (
    <div id="top" data-testid={landingTestIds.alphaRoot}>
      <LandingShell
        header={
          <LandingShell.Header>
            <div className="container header-inner">
              <a className="brand" href="#top">
                Luma
              </a>
              <nav className="nav" aria-label="Primary">
                <a href="#features">Product</a>
                <a href="#proof">Proof</a>
              </nav>
              <ButtonLink href="#cta">Get started</ButtonLink>
            </div>
          </LandingShell.Header>
        }
        footer={
          <LandingShell.Footer>
            <div className="container footer-inner">
              <span>Available worldwide</span>
              <a href="#top">Back to top</a>
            </div>
          </LandingShell.Footer>
        }
      >
        <LandingShell.Main>
          <Hero content={hero} />
          <div id="proof">
            <AlphaProofStrip metrics={metrics} />
          </div>
          <div id="features">
            <FeatureGrid title="Built for learning at speed" items={features} />
          </div>
          <div id="cta">
            <CtaSection content={cta} />
          </div>
        </LandingShell.Main>
      </LandingShell>
    </div>
  );
}
