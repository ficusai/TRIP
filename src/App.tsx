// TAG: app.core-components - Application Shell (ARCHITECTURE.md)
// TAG: app.error-boundary - Application Error Boundary (ARCHITECTURE.md)

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Import the React class-component base used to keep state across renders.
import { Component } from 'react';
// Import types that describe React error details and renderable child content.
import type { ErrorInfo, ReactNode } from 'react';
// Import the shared logger so boundary errors are recorded in the same format as other app events.
import { createLogger } from './lib/logger';

// Create a logger labeled for the application shell and its error boundary.
const log = createLogger('app.core-components');

// Describe the values a caller may pass when using ErrorBoundary.
interface ErrorBoundaryProps {
  // children is the normal React content displayed when no error has occurred.
  children: ReactNode;
  // fallback is an optional replacement screen supplied by the caller for an error.
  fallback?: ReactNode;
}

// Describe the boundary's internal state between renders.
interface ErrorBoundaryState {
  // hasError becomes true after React reports an error in a child component.
  hasError: boolean;
  // error stores the reported Error object, or null before any error occurs.
  error: Error | null;
}

/**
 * ErrorBoundary watches the components placed inside it.
 * If a child throws while React is rendering, the boundary records the error
 * and shows a recovery screen instead of letting the entire page disappear.
 *
 * @tag app.error-boundary.component - Error Boundary (ARCHITECTURE.md)
 * @see {@link App} for the primary consumer
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  // React calls this constructor once when it creates the boundary.
  constructor(props: ErrorBoundaryProps) {
    // Pass the incoming properties to React's Component base class.
    super(props);
    // Start healthy: no error has been caught and no error is stored.
    this.state = { hasError: false, error: null };
  }

  // React calls this static method after a child throws; it cannot use `this`.
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Mark the boundary as failed and retain the exact Error object for recovery.
    return { hasError: true, error };
  }

  // React calls this after the boundary has changed state because of an error.
  componentDidCatch(error: Error, info: ErrorInfo): void {
    // Record the error itself and label this stage of the error-handling flow.
    log.error(error, 'componentDidCatch');
    // Record React's component stack so a developer can locate the failing child.
    log.step('error-boundary-caught', {
      componentStack: info.componentStack,
    });
  }

  // Build the visible React content for either the normal app or the error screen.
  render(): ReactNode {
    try {
      // Once an error is recorded, do not render the failed child tree again.
      if (this.state.hasError) {
        // A caller-supplied fallback takes priority over the built-in recovery screen.
        if (this.props.fallback) {
          return this.props.fallback;
        }

        // Build the built-in full-page error screen with Tailwind utility classes.
        return (
          <div className="flex h-screen w-full flex-col items-center justify-center bg-slate-950 text-slate-200 font-sans p-8">
            {/* The heading uses a bold rose color to make the failure easy to notice. */}
            <h1 className="text-xl font-bold text-rose-400 mb-2">
              Something went wrong
            </h1>
            {/* Show the error message, or a generic message if no message exists. */}
            <p className="text-sm text-slate-400 mb-4 max-w-md text-center">
              {this.state.error?.message ?? 'An unexpected error occurred.'}
            </p>
            {/* The button lets a user request a fresh render after the failure. */}
            <button
              // When clicked, clear the error state and ask React to render the children again.
              onClick={() => {
                try {
                  this.setState({ hasError: false, error: null });
                  log.step('error-boundary-reset');
                } catch (err) {
                  log.error(err, 'error-boundary-reset-failed');
                }
              }}
              className="px-4 py-2 rounded-lg bg-slate-800 border border-slate-600 text-slate-200 text-sm hover:bg-slate-700 transition-colors"
            >
              Try again
            </button>
          </div>
        );
      }

      // In the healthy state, render exactly the components supplied by the caller.
      return this.props.children;
    } catch (err) {
      // If rendering the recovery screen itself fails, log that second failure.
      log.error(err, 'ErrorBoundary-render-crash');
      // Return a very small final screen so the method still returns valid React content.
      return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-slate-950 text-slate-200 font-sans p-8">
          <h1 className="text-xl font-bold text-rose-400">Fatal Crash</h1>
        </div>
      );
    }
  }
}

/**
 * App is the root component returned to React at startup.
 * It places the visible Trip Mapper shell inside ErrorBoundary so a child
 * failure can be contained and replaced with a recovery screen instead of
 * leaving the page blank.
 *
 * @tag app.main-component - Main App Component (ARCHITECTURE.md)
 * @see {@link ErrorBoundary} for the wrapping error boundary
 */
export default function App(): ReactNode {
  try {
    // Record that React is beginning to create the root component.
    log.entry();
    // Build the component tree without changing any application data.
    const result = (
      // Catch errors from the shell and its descendants.
      <ErrorBoundary>
        {/* Center the current placeholder heading in a full-height dark shell. */}
        <div className="flex h-screen w-full items-center justify-center bg-slate-950 text-slate-200 font-sans">
          <h1 className="text-2xl font-bold">Trip Mapper</h1>
        </div>
      </ErrorBoundary>
    );
    // Record that the component tree was created successfully.
    log.exit({ status: 'success' });
    // Return the tree so React can display it.
    return result;
  } catch (err) {
    // Record a failure while constructing the tree, then let React see the original error.
    log.error(err, 'App-render');
    throw err;
  }
}
