// TAG: app.core-components - Application Shell (ARCHITECTURE.md)
// TAG: app.error-boundary - Application Error Boundary (ARCHITECTURE.md)

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { createLogger } from './lib/logger';

const log = createLogger('app.core-components');

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * React class component that catches JavaScript errors anywhere in its
 * child component tree, logs them via the centralized logger, and renders
 * a fallback UI instead of crashing the whole application.
 *
 * @tag app.error-boundary.component - Error Boundary (ARCHITECTURE.md)
 * @see {@link App} for the primary consumer
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    log.error(error, 'componentDidCatch');
    log.step('error-boundary-caught', {
      componentStack: info.componentStack,
    });
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-slate-950 text-slate-200 font-sans p-8">
          <h1 className="text-xl font-bold text-rose-400 mb-2">
            Something went wrong
          </h1>
          <p className="text-sm text-slate-400 mb-4 max-w-md text-center">
            {this.state.error?.message ?? 'An unexpected error occurred.'}
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              log.step('error-boundary-reset');
            }}
            className="px-4 py-2 rounded-lg bg-slate-800 border border-slate-600 text-slate-200 text-sm hover:bg-slate-700 transition-colors"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Main application component. Renders the application shell inside
 * an error boundary to prevent full-page crashes.
 *
 * @tag app.main-component - Main App Component (ARCHITECTURE.md)
 * @see {@link ErrorBoundary} for the wrapping error boundary
 */
export default function App(): ReactNode {
  return (
    <ErrorBoundary>
      <div className="flex h-screen w-full items-center justify-center bg-slate-950 text-slate-200 font-sans">
        <h1 className="text-2xl font-bold">Trip Mapper</h1>
      </div>
    </ErrorBoundary>
  );
}
