"use client";

import { Component, type ReactNode } from "react";
import { SectionError } from "./SectionError";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
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
    console.error("[ErrorBoundary]", error.message);
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
