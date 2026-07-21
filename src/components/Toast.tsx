// TAG: comp.toast - Toast Notification Component (ARCHITECTURE.md)

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect } from 'react';
import { createLogger } from '../lib/logger';

const log = createLogger('comp.toast');

export interface ToastMessage {
  id: string;
  message: string;
  variant: 'success' | 'error' | 'info';
  duration: number;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

/**
 * Renders a stack of auto-dismissing toast notifications.
 * Each toast is dismissed after its specified duration via a setTimeout timer.
 * All timers are cleaned up on unmount or when the toasts array changes.
 *
 * @tag comp.toast.component - Toast Notification Panel (ARCHITECTURE.md)
 * @param toasts - Array of active toast messages to display
 * @param onDismiss - Callback invoked with the toast ID when it should be removed
 * @see {@link ToastMessage} for the shape of each toast entry
 */
export default function Toast({ toasts, onDismiss }: ToastProps) {
  log.entry({ toastCount: toasts.length });

  useEffect(() => {
    if (toasts.length === 0) {
      log.step('no-active-toasts');
      return;
    }

    log.step('setting-up-dismiss-timers', { count: toasts.length });

    const timers: ReturnType<typeof setTimeout>[] = [];

    toasts.forEach((toast) => {
      try {
        if (!toast.id) {
          log.warn('toast-missing-id', { toast });
          return;
        }

        if (toast.duration <= 0) {
          log.warn('toast-non-positive-duration', { id: toast.id, duration: toast.duration });
          return;
        }

        const timer = setTimeout(() => {
          try {
            onDismiss(toast.id);
            log.step('toast-dismissed', { id: toast.id });
          } catch (err) {
            log.error(err, 'onDismiss-callback');
          }
        }, toast.duration);

        timers.push(timer);
      } catch (err) {
        log.error(err, 'timer-setup');
      }
    });

    log.step('timers-created', { count: timers.length });

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
  }, [toasts, onDismiss]);

  log.step('rendering-toast-stack', { count: toasts.length });

  return (
    <div className="fixed bottom-6 right-6 z-[1200] flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto px-4 py-2 rounded-lg shadow-xl text-sm font-medium animate-[toast-in_0.2s_ease-out] ${
            toast.variant === 'success'
              ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-200'
              : toast.variant === 'error'
              ? 'bg-rose-500/20 border border-rose-500/50 text-rose-200'
              : 'bg-sky-500/20 border border-sky-500/50 text-sky-200'
          }`}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}
