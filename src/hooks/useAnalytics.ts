"use client";

import { usePostHog } from "posthog-js/react";
import type { SelahEvent, SelahEventProperties } from "@/lib/analytics/events";

export function useAnalytics() {
  const posthog = usePostHog();

  function capture<E extends SelahEvent>(
    event: E,
    ...args: SelahEventProperties[E] extends Record<string, never>
      ? []
      : [properties: SelahEventProperties[E]]
  ) {
    posthog?.capture(event, args[0] ?? {});
  }

  function identify(userId: string, traits?: Record<string, unknown>) {
    posthog?.identify(userId, traits);
  }

  function reset() {
    posthog?.reset();
  }

  return { capture, identify, reset };
}
