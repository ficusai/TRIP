// TAG: app.main - Application Entry Point (ARCHITECTURE.md)
// TAG: app.error-boundary - Root Error Boundary (ARCHITECTURE.md)

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Import the React library, which provides the component model used by this app.
import React from 'react';
// Import ReactDOM's client API, which attaches the React app to an HTML element.
import ReactDOM from 'react-dom/client';
// Import the root application component defined in App.tsx.
import App from './App';
// Import global CSS; this includes Tailwind utilities and Leaflet map fixes.
import './index.css';
// Import the factory that creates a logger scoped to this entry-point module.
import { createLogger } from './lib/logger';

// Create one logger whose records all carry the app.main context label.
const log = createLogger('app.main');

/**
 * Shows a fatal error without treating error text as HTML.
 * `target` is the page element that receives the message.
 * `title` is the short heading, and `detail` is the longer explanation.
 * The function accepts any non-empty HTML element and any strings; an empty
 * string is still valid and is displayed as blank text.
 *
 * @tag app.main.render-fallback - Fatal Error Fallback Renderer (ARCHITECTURE.md)
 * @param target - The DOM element to render the error into
 * @param title - The error heading
 * @param detail - The error detail message
 */
function renderFatalError(target: HTMLElement, title: string, detail: string): void {
  try {
    // Record the target id and both messages before changing the page.
    log.entry({ target: target.id, title, detail });

    // Create a new empty div instead of injecting an HTML string.
    const container = document.createElement('div');
    // Apply padding, a light-red error color, and a monospace font to that div.
    container.style.cssText = 'padding:2rem;color:#f87171;font-family:monospace;';

    // Create a heading element and assign the title as plain text.
    const heading = document.createElement('h1');
    // textContent prevents tags in `title` from becoming executable HTML.
    heading.textContent = title;

    // Create a paragraph element and assign the detail as plain text.
    const paragraph = document.createElement('p');
    // textContent also prevents tags in `detail` from becoming executable HTML.
    paragraph.textContent = detail;

    // Put the heading and paragraph inside the new container.
    container.appendChild(heading);
    container.appendChild(paragraph);
    // Attach the completed error panel to the requested page element.
    target.appendChild(container);
    // Record that the fallback renderer completed.
    log.exit();
  } catch (err) {
    // Record a renderer failure using the shared logger.
    log.error(err, 'renderFatalError');
    // Also print the failure because the normal error panel could not be created.
    console.error('Fatal error render failed:', err);
  }
}

/**
 * Find the page's root element and ask React to render the application there.
 * The function has two recovery paths: if `#root` is missing it writes a
 * message into `document.body`; if React cannot start, it writes a message
 * into the element that was found.
 *
 * @tag app.main.mount - DOM Mount (ARCHITECTURE.md)
 */
function mountApp(): void {
  try {
    // Record the beginning of the browser startup sequence.
    log.entry();

    // Look for the exact element whose id is "root" in index.html.
    const rootElement = document.getElementById('root');
    if (!rootElement) {
      // The expected mounting point is absent, so create an Error object to log.
      log.error(new Error('Root element #root not found in DOM'), 'mount');
      // Use the body as a last-resort target so the user still sees guidance.
      renderFatalError(
        document.body,
        'Fatal: #root element missing',
        'Check that index.html contains a div with id="root".',
      );
      // Stop before trying to render into an element that does not exist.
      return;
    }
    // Record the id of the element that will receive the React tree.
    log.step('root-element-found', { id: rootElement.id });

    try {
      // Create React's rendering controller for the existing DOM element.
      const root = ReactDOM.createRoot(rootElement);

      // Queue the App component inside StrictMode, which enables development checks.
      root.render(
        <React.StrictMode>
          <App />
        </React.StrictMode>,
      );

      // Rendering is asynchronous; this records that React accepted the request.
      log.step('render-queued');
      log.exit({ status: 'success' });
    } catch (err) {
      // Record a failure from createRoot or root.render.
      log.error(err, 'mount');
      // Show the original error message when it is an Error, otherwise convert it to text.
      renderFatalError(
        rootElement,
        'Failed to render application',
        err instanceof Error ? err.message : String(err),
      );
    }
  } catch (err) {
    // This outer guard covers an unexpected failure outside the inner render guard.
    console.error('Super fatal error in mountApp:', err);
  }
}

// Start the browser application immediately after this module is loaded.
mountApp();
