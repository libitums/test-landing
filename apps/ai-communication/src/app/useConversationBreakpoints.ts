import { useLayoutEffect, type RefObject } from "react";

const breakpoints = {
  conversationCompact: "--breakpoint-conversation-compact",
  conversationStack: "--breakpoint-conversation-stack",
  mobile: "--breakpoint-mobile",
} as const;

function toPixels(value: string, rootFontSize: number) {
  const amount = Number.parseFloat(value);
  if (!Number.isFinite(amount)) return Number.POSITIVE_INFINITY;
  return value.trim().endsWith("rem") ? amount * rootFontSize : amount;
}

export function useConversationBreakpoints(rootRef: RefObject<HTMLDivElement | null>) {
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const update = () => {
      const documentStyle = getComputedStyle(document.documentElement);
      const rootFontSize = Number.parseFloat(documentStyle.fontSize);
      for (const [name, token] of Object.entries(breakpoints)) {
        root.dataset[name] = String(
          window.innerWidth <= toPixels(documentStyle.getPropertyValue(token), rootFontSize),
        );
      }
    };

    update();
    window.addEventListener("resize", update, { passive: true });
    return () => window.removeEventListener("resize", update);
  }, [rootRef]);
}
