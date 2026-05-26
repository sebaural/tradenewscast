'use client';

import React, { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('TradeNewsCast error:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center flex-1 p-8 text-center bg-tnc-bg">
          <p className="font-mono text-sm text-tnc-red mb-2">Something went wrong</p>
          <p className="font-mono text-[11px] text-tnc-text2 mb-4">
            Reload the page to restore the terminal.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="font-mono text-[10px] px-4 py-2 border border-tnc-accent text-tnc-accent rounded-[3px] hover:bg-tnc-accent/10"
          >
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
