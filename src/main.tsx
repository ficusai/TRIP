// TAG: app.main - Application Entry Point (ARCHITECTURE.md)
// TAG: app.error-boundary - Root Error Boundary (ARCHITECTURE.md)

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { createLogger } from './lib/logger';

const log = createLogger('app.main');

/**
 * Safely renders a fatal error message into a target element using DOM APIs
 * instead of innerHTML, preventing any possibility of XSS from error messages.
 *
 * @tag app.main.render-fallback - Fatal Error Fallback Renderer (ARCHITECTURE.md)
 * @param target - The DOM element to render the error into
 * @param title - The error heading
 * @param detail - The error detail message
 */
function renderFatalError(target: HTMLElement, title: string, detail: string): void {
  log.step('render-fallback', { title, detail });

  const container = document.createElement('div');
  container.style.cssText = 'padding:2rem;color:#f87171;font-family:monospace;';

  const heading = document.createElement('h1');
  heading.textContent = title;

  const paragraph = document.createElement('p');
  paragraph.textContent = detail;

  container.appendChild(heading);
  container.appendChild(paragraph);
  target.appendChild(container);
}

/**
 * Mounts the React application into the DOM root element.
 * Wraps the entire render in a try-catch to surface fatal mount errors.
 *
 * @tag app.main.mount - DOM Mount (ARCHITECTURE.md)
 */
function mountApp(): void {
  log.entry();

  const rootElement = document.getElementById('root');
  if (!rootElement) {
    log.error(new Error('Root element #root not found in DOM'), 'mount');
    renderFatalError(
      document.body,
      'Fatal: #root element missing',
      'Check that index.html contains a div with id="root".',
    );
    return;
  }
  log.step('root-element-found', { id: rootElement.id });

  try {
    const root = ReactDOM.createRoot(rootElement);

    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
    );

    log.step('render-queued');
    log.exit({ status: 'success' });
  } catch (err) {
    log.error(err, 'mount');
    renderFatalError(
      rootElement,
      'Failed to render application',
      err instanceof Error ? err.message : String(err),
    );
  }
}

mountApp();
