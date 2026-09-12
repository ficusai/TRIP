// TAG: comp.toast - Toast Notification Component (ARCHITECTURE.md)

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Import useEffect so the component can start and cancel dismissal timers.
import { useEffect } from 'react';
// Import the shared logger for toast setup, dismissal, and failure records.
import { createLogger } from '../lib/logger';

// Create a logger labeled for this notification component.
const log = createLogger('comp.toast');

// A toast is one temporary notification shown to the user.
export interface ToastMessage {
  // id uniquely identifies this notification so React and the parent can track it.
  id: string;
  // message is the plain text displayed inside the notification.
  message: string;
  // variant selects one of the three supported visual states: success, error, or info.
  variant: 'success' | 'error' | 'info';
  // duration is the delay in milliseconds before this notification dismisses itself.
  duration: number;
}

// These are the values the parent component must provide to render the toast panel.
interface ToastProps {
  // toasts contains all notifications that should currently be visible.
  toasts: ToastMessage[];
  // onDismiss is called with a notification id when its timer expires.
  onDismiss: (id: string) => void;
}

/**
 * Renders a stack of temporary notifications for the user.
 * Each notification can be a success, error, or info message.
 * A positive duration schedules its removal; changing the list or leaving
 * the page cancels timers that are no longer needed.
 *
 * @tag comp.toast.component - Toast Notification Panel (ARCHITECTURE.md)
 * @param toasts - Array of active toast messages to display
 * @param onDismiss - Callback invoked with the toast ID when it should be removed
 * @see {@link ToastMessage} for the shape of each toast entry
 */
export default function Toast({ toasts, onDismiss }: ToastProps) {
  try {
    // Record how many notifications this render received.
    log.entry({ toastCount: toasts.length });

    // React runs this effect after displaying the component and whenever its dependencies change.
    useEffect(() => {
      try {
        // An empty list needs no timers and no visible notification work.
        if (toasts.length === 0) {
          log.step('no-active-toasts');
          return;
        }

        // Announce that one timer will be created for each valid active toast.
        log.step('setting-up-dismiss-timers', { count: toasts.length });

        // Keep browser timer identifiers so they can all be cancelled during cleanup.
        const timers: ReturnType<typeof setTimeout>[] = [];

        // Examine every supplied notification independently.
        toasts.forEach((toast) => {
          try {
            // A missing id cannot be safely matched to a parent-owned notification.
            if (!toast.id) {
              log.warn('toast-missing-id', { toast });
              return;
            }

            // Zero, negative, or invalid delays cannot provide useful auto-dismiss behavior.
            // This component skips them rather than inventing a duration.
            if (toast.duration <= 0) {
              log.warn('toast-non-positive-duration', { id: toast.id, duration: toast.duration });
              return;
            }

            // After the toast's duration in milliseconds, ask the parent to remove it.
            const timer = setTimeout(() => {
              try {
                onDismiss(toast.id);
                log.step('toast-dismissed', { id: toast.id });
              } catch (err) {
                // A parent callback must not break the rest of the component.
                log.error(err, 'onDismiss-callback');
              }
            }, toast.duration);

            // Remember this timer for the cleanup function below.
            timers.push(timer);
          } catch (err) {
            // A timer setup failure for one toast should not hide the other toasts.
            log.error(err, 'timer-setup');
          }
        });

        // Record how many valid timers were actually created.
        log.step('timers-created', { count: timers.length });

        // React calls this cleanup before rerunning the effect or unmounting the component.
        return () => {
          log.step('clearing-timers', { count: timers.length });
          timers.forEach((timer) => {
            try {
              clearTimeout(timer);
            } catch (err) {
              log.error(err, 'timer-cleanup');
            }
          });
        };
      } catch (err) {
        // Keep a render failure from becoming an uncaught effect error.
        log.error(err, 'Toast-useEffect');
      }
    }, [toasts, onDismiss]);

    // Record the number of notifications that will be represented in JSX.
    log.step('rendering-toast-stack', { count: toasts.length });

    // Build a fixed bottom-right panel; pointer-events:none lets clicks pass around empty areas.
    const result = (
      <div className="fixed bottom-6 right-6 z-[1200] flex flex-col gap-2 pointer-events-none">
        {/* Create one visual card per toast while using id as React's stable list key. */}
        {toasts.map((toast) => (
          <div
            key={toast.id}
            // The base classes position and animate the card; the conditional suffix selects its color.
            className={`pointer-events-auto px-4 py-2 rounded-lg shadow-xl text-sm font-medium animate-[toast-in_0.2s_ease-out] ${
              toast.variant === 'success'
                ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-200'
                : toast.variant === 'error'
                ? 'bg-rose-500/20 border border-rose-500/50 text-rose-200'
                : 'bg-sky-500/20 border border-sky-500/50 text-sky-200'
            }`}
          >
            {/* Render the caller's message as React text, not as HTML markup. */}
            {toast.message}
          </div>
        ))}
      </div>
    );
    
    // Record that the toast panel was created successfully.
    log.exit();
    // Return the panel to React for display.
    return result;
  } catch (err) {
    // If rendering fails, log it and show no partial toast panel.
    log.error(err, 'Toast-render');
    return null;
  }
}
