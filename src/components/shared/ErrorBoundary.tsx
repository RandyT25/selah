"use client";

import { Component, type ReactNode } from "react";
import posthog from "posthog-js";
import { SectionError } from "./SectionError";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  context?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    console.error(`[ErrorBoundary${this.props.context ? `:${this.props.context}` : ""}]`, error.message);
    // Report to PostHog — free alternative to Sentry
    try {
      posthog.captureException(error, { context: this.props.context ?? "unknown" });
    } catch {
      // PostHog not initialised yet (e.g. during SSR)
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <SectionError onRetry={() => this.setState({ hasError: false, error: null })} />
      );
    }
    return this.props.children;
  }
}
