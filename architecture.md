# Architecture — Trip Mapper v1.0

**Version:** 1.0.0  
**Last Updated:** 2026-07-23

## Overview

Trip Mapper v1.0 is a minimal viable product (MVP) built with React 19, TypeScript, and Vite. It provides a foundation for an offline-first world tour route planner with Leaflet mapping capabilities. The architecture emphasizes modularity, type safety, and extensibility for future feature additions.

## Technology Stack

### Core Framework
- **React 19.2.7**: UI framework with concurrent features (package.json: `^19.0.1`)
- **React DOM 19.2.7**: React DOM renderer (package.json: `^19.0.1`)
- **TypeScript 5.8.3**: Type safety and enhanced developer experience (package.json: `~5.8.2`)
- **Vite 6.4.3**: Fast build tool and dev server (package.json: `^6.2.3`)

### Styling & UI
- **Tailwind CSS 4.3.3**: Utility-first CSS framework with Vite plugin (package.json: `^4.1.14`)
- **Autoprefixer 10.5.4**: CSS vendor prefixing (package.json: `^10.4.21`)
- **Lucide React 0.546.0**: Icon library
- **Custom CSS**: Leaflet compatibility fixes and custom animations

### Mapping
- **Leaflet 1.9.4**: 2D mapping library
- **React Leaflet 5.0.0**: React integration for Leaflet

### Development Tools
- **tsx 4.23.1**: TypeScript execution (package.json: `^4.21.0`)
- **@vitejs/plugin-react 5.2.0**: React plugin for Vite (package.json: `^5.0.4`)
- **@types/***: TypeScript type definitions for Leaflet, React, Node.js
  - **@types/node 22.20.1**: Node.js type definitions (package.json: `^22.14.0`)

## Project Structure

```
trip-mapper v1.0/
├── .github/
│   ├── workflows/           # CI/CD workflows (ci.yml, codeql.yml)
│   ├── ISSUE_TEMPLATE/      # Issue templates (bug report, feature request)
│   ├── pull_request_template.md
│   ├── CODEOWNERS           # Code ownership rules
│   └── FUNDING.yml          # GitHub Sponsors configuration
├── src/
│   ├── components/
│   │   └── Toast.tsx          # Toast notification component
│   ├── lib/
│   │   └── logger.ts          # Centralized structured logging
│   ├── App.tsx                # Main application component with error boundary
│   ├── main.tsx               # Application entry point
│   ├── index.css              # Global styles with Tailwind + Leaflet fixes
│   └── vite-env.d.ts          # Vite client TypeScript types (/// <reference types="vite/client" />)
├── vite-plugins/
│   └── logWriter.ts           # Vite plugin for session log writing
├── public/
│   └── favicon.svg            # App icon file (unused - favicon is inlined in index.html via data URI)
├── logs/                      # Session log files (gitignored)
├── index.html                 # HTML entry point
├── launcher.sh                # Development server launcher script
├── package.json               # Dependencies and scripts
├── package-lock.json          # Dependency lockfile for reproducible builds
├── tsconfig.json              # TypeScript configuration
├── tsdoc.json                 # TSDoc config for @tag custom tag system
├── vite.config.ts             # Vite build configuration
├── .env.example               # Environment variable template
├── .gitignore                 # Git ignore rules (excludes node_modules, dist, logs, etc.)
├── architecture.md            # Detailed architecture documentation
├── README.md                  # User-facing documentation
├── CONTRIBUTING.md            # Contributing guidelines
├── CHANGELOG.md               # Version history and changes
├── CODE_OF_CONDUCT.md         # Contributor Covenant v2.1
├── SECURITY.md                # Security vulnerability reporting policy
├── SUPPORT.md                 # Support and help resources
├── LICENSE                    # Apache-2.0 license
└── GITHUB_SETUP.md            # GitHub publishing setup checklist
```

## Core Architectural Components

### 1. Application Bootstrap (`src/main.tsx`)

**Responsibilities:**
- DOM mounting with error handling
- Fatal error fallback rendering
- Root element validation

**Key Features:**
- Safe DOM manipulation using `createElement` instead of `innerHTML` (XSS prevention)
- Graceful degradation when root element is missing
- Wrapped in `React.StrictMode` for development warnings

**TAG:** `app.main`, `app.error-boundary`, `app.main.mount`, `app.main.render-fallback`

### 2. Application Shell (`src/App.tsx`)

**Responsibilities:**
- Root error boundary implementation
- Application layout shell
- Error recovery UI

**Key Features:**
- Class component error boundary with state management
- Centralized error logging via structured logger
- User-friendly error recovery with "Try again" button
- Placeholder UI ready for feature expansion

**TAG:** `app.core-components`, `app.error-boundary`, `app.main-component`, `app.error-boundary.component`

### 3. Structured Logging (`src/lib/logger.ts`)

**Responsibilities:**
- Centralized logging for all application code
- Multi-transport output (console + file)
- Runtime logging toggle
- Session file management

**Key Features:**

**Service Control:**
- Build-time toggle via `VITE_LOGGING_ENABLED` environment variable
- Runtime toggle via localStorage key `trip-mapper-logging`
- HTTP API endpoints: `GET /__log/status`, `POST /__log/toggle`
- Window globals: `window.__tripMapperLog()`, `window.__tripMapperLogStatus()`

**Logging Levels:**
- `trace`: Detailed step-by-step execution
- `debug`: Entry/exit points
- `info`: General information
- `warn`: Warning conditions
- `error`: Error conditions with stack traces

**Transport Methods:**
- Console output with appropriate method (`console.log`, `console.warn`, `console.error`)
- Batched HTTP POST to `/__log` endpoint (200ms debounce)
- Session file writing via Vite plugin

**TAG:** `utils.logger`, `utils.logger.create`, `utils.logger.toggle`, `utils.logger.is-enabled`

### 4. Vite Log Writer Plugin (`vite-plugins/logWriter.ts`)

**Responsibilities:**
- HTTP endpoint for log line collection
- Session file management
- Logging service control endpoints

**Key Features:**
- Session file creation with timestamp: `logs/session-YYYY-MM-DDTHH-MM-SS.txt`
- HTTP endpoints:
  - `POST /__log`: Accepts log line batches
  - `GET /__log/status`: Returns logging enabled state
  - `POST /__log/toggle`: Flips logging enabled state
- Automatic session cleanup on build end
- Graceful handling of write failures

**TAG:** `build.log-writer`, `build.log-writer.plugin`

### 5. Toast Notification System (`src/components/Toast.tsx`)

**Responsibilities:**
- Display auto-dismissing notifications
- Timer management for toast lifecycle
- Visual feedback for user actions

**Key Features:**
- Support for multiple toast variants: `success`, `error`, `info`
- Configurable duration per toast
- Automatic timer cleanup on unmount
- Fixed positioning with high z-index (1200)
- CSS animations for smooth entry

**TAG:** `comp.toast`, `comp.toast.component`

### 6. Build Configuration (`vite.config.ts`)

**Responsibilities:**
- Plugin orchestration
- Dev server configuration
- Build output configuration

**Key Features:**
- Plugin chain: React + Tailwind CSS + Log Writer
- Dev server on port 3001 with host binding
- Build output to `dist/` directory
- Source maps disabled for production

**TAG:** `build.vite-config`

### 7. Development Launcher (`launcher.sh`)

**Responsibilities:**
- Environment validation
- Dependency installation
- Dev server startup

**Key Features:**
- Node.js and npm availability checks
- Automatic `npm install` if `node_modules` missing
- Timestamped logging for launcher operations
- Error handling with exit codes

**TAG:** `build.launcher`

### 8. Styling System (`src/index.css`)

**Responsibilities:**
- Tailwind CSS integration
- Leaflet compatibility fixes
- Custom animations and utilities

**Key Features:**

**Tailwind v4 Integration:**
- `@import "tailwindcss"` directive
- Custom font families (Inter, JetBrains Mono)
- Theme customization via `@theme`

**Leaflet Compatibility:**
- Tile image display fixes (`display: inline !important`)
- Tile pane box-sizing overrides
- Border and padding resets for tiles
- Marker icon styling fixes
- SVG overlay display corrections

**Custom Styles:**
- GPU acceleration for map panes
- Custom zoom control styling
- POI marker animations with glow effects
- Toast entry animations
- Premium scrollbar styling
- Glassmorphism utility classes

**TAG:** `styles.global`, `styles.leaflet-fixes`

### 9. HTML Entry Point (`index.html`)

**Responsibilities:**
- HTML template for the application
- Meta tags for SEO and mobile optimization
- Application icon and theme configuration

**Key Features:**
- Mobile viewport configuration with no-scaling
- Dark theme color scheme
- Open Graph meta tags for social sharing
- Inline SVG favicon via data URI (public/favicon.svg file is unused)
- Apple mobile web app configuration
- Root div for React mounting

**Note:** No TAG comment present in index.html (unlike other source files)

## Data Flow Architecture

### Logging Flow

```
Application Code
    ↓
createLogger(context)
    ↓
logger.entry/step/exit/error()
    ↓
write() → isEnabled() check
    ↓
[Console Output] + [Buffer to sessionLines]
    ↓
scheduleFlush() (200ms debounce)
    ↓
POST /__log (batched lines)
    ↓
Vite Plugin (logWriter.ts)
    ↓
Write to logs/session-YYYY-MM-DDTHH-MM-SS.txt
```

### Error Handling Flow

```
Component Error
    ↓
ErrorBoundary.componentDidCatch()
    ↓
log.error() → Centralized logging
    ↓
Fallback UI rendering
    ↓
User clicks "Try again"
    ↓
setState({ hasError: false })
    ↓
Component re-renders
```

### Toast Notification Flow

```
User Action
    ↓
Add toast to state
    ↓
Toast component receives array
    ↓
useEffect sets up timers
    ↓
setTimeout → onDismiss(id)
    ↓
Toast removed from state
    ↓
Timer cleanup on unmount
```

## Build & Development Workflow

### Development Mode

```bash
./launcher.sh        # Validates environment, installs deps, starts dev server
# or
npm run dev          # Direct Vite dev server on port 3001
```

**Development Features:**
- Hot module replacement (HMR)
- Structured logging to console and session file
- Runtime logging toggle via browser console
- TypeScript type checking on build

### Production Build

```bash
npm run build        # Creates optimized bundle in dist/
npm run preview      # Preview production build locally
```

**Build Characteristics:**
- Tree-shaking removes unused code
- Logging can be disabled at build time via `VITE_LOGGING_ENABLED=false`
- Source maps disabled for production
- Minified bundle output

### Type Checking

```bash
npm run lint         # TypeScript type checking without emit
```

## Configuration Files

### TypeScript Configuration (`tsconfig.json`)

**Compiler Options:**
- Target: ES2020
- Module: ESNext (bundler mode)
- JSX: react-jsx (automatic runtime)
- Strict mode enabled
- No unused locals/parameters
- No fallthrough cases in switch

**Key Settings:**
- `moduleResolution: "bundler"` for Vite compatibility
- `allowImportingTsExtensions: true` for direct .tsx imports
- `isolatedModules: true` for Vite HMR
- Excludes test files (currently references non-existent `src/test-app.test.tsx`)

### Package Configuration (`package.json`)

**Package Metadata:**
- `"type": "module"` - Indicates ES module usage for the project
- `"private": true` - Prevents accidental publication to npm registry

**Scripts:**
- `dev`: Development server on port 3001 with host binding
- `build`: Production build
- `preview`: Preview production build
- `clean`: Remove dist directory
- `lint`: TypeScript type checking

**Dependencies:**
- React ecosystem (React 19, ReactDOM 19)
- Vite and plugins
- Leaflet and React Leaflet
- Tailwind CSS v4
- Lucide React icons

## Security Considerations

### XSS Prevention
- Fatal error rendering uses `createElement` instead of `innerHTML`
- React's built-in XSS protection via JSX
- No user-controlled HTML injection points

### Error Information Exposure
- Error messages displayed to users are sanitized
- Stack traces logged but not exposed in UI
- Error boundary provides generic fallback when needed

### Data Persistence
- No sensitive data in localStorage (only logging toggle)
- Session logs contain application traces, not user data
- No credential storage in application code

### Git Security
- .gitignore excludes sensitive files (node_modules, dist, logs, .env files)
- package-lock.json is committed for reproducible builds
- No API keys or secrets in source code

## Performance Optimizations

### Logging Performance
- Batched HTTP requests (200ms debounce)
- Build-time elimination via environment variable
- No console output when disabled
- Efficient JSON serialization with try-catch

### Rendering Performance
- Leaflet tile GPU acceleration (`transform: translateZ(0)`)
- Content visibility for large lists (`content-visibility: auto`)
- Will-change hints for animated elements
- Timer cleanup to prevent memory leaks

### Build Performance
- Vite's native ES modules for fast dev server
- Tree-shaking for minimal bundle size
- Source maps disabled in production
- Optimized dependency pre-bundling

## Extension Points

### Adding New Components
1. Create component in `src/components/`
2. Add structured logging via `createLogger()`
3. Use appropriate TAG comments for architecture documentation
4. Follow existing naming conventions

### Adding New Utilities
1. Create utility in `src/lib/` or appropriate subdirectory
2. Export pure functions when possible
3. Add comprehensive TypeScript types
4. Log via centralized logger

### Adding New Vite Plugins
1. Create plugin in `vite-plugins/`
2. Export plugin function returning Vite Plugin interface
3. Add to plugin chain in `vite.config.ts`
4. Document with TAG comments

### Adding New Logging Contexts
1. Use `createLogger('context.name')` at module level
2. Call `logger.entry()` at function start
3. Use `logger.step()` for significant operations
4. Call `logger.exit()` at function return
5. Use `logger.error()` in catch blocks

## Tag System

All significant code sections are tagged with `@tag` or `// TAG:` comments for architecture documentation:

- `app.*`: Application-level components and bootstrap
- `comp.*`: UI components
- `utils.*`: Utility functions and helpers
- `build.*`: Build configuration and plugins
- `styles.*`: Styling and CSS

These tags enable automated architecture documentation and code navigation.

## Development Guidelines

### Code Style
- Use TypeScript strict mode
- Prefer functional components with hooks
- Use descriptive function and variable names
- Add TAG comments for significant code sections
- Log all significant operations via centralized logger

### Error Handling
- Always use try-catch around async operations
- Log errors via `logger.error()`
- Provide user-friendly error messages
- Use error boundaries for component trees

### Testing Considerations
- Mock the logger in unit tests
- Test error boundary fallback rendering
- Test timer cleanup in toast component
- Verify build-time logging elimination

## Known Limitations

### Current MVP State
- App.tsx contains placeholder UI only
- No actual mapping functionality implemented
- No data persistence layer
- No routing or trip planning features
- No import/export functionality

### Architecture Implications
- Logging infrastructure ready for full implementation
- Error handling foundation in place
- Component structure ready for expansion
- Build system optimized for future features

## Migration Path

The architecture is designed to support incremental feature addition:

1. **Phase 1**: Implement MapContainer with Leaflet integration
2. **Phase 2**: Add data persistence layer (IndexedDB)
3. **Phase 3**: Implement trip planning logic
4. **Phase 4**: Add import/export functionality
5. **Phase 5**: Implement advanced features (3D mapping, etc.)

Each phase can build on the existing architecture without requiring structural changes.

## Documentation References

- **README.md**: User-facing documentation and setup instructions
- **CONTRIBUTING.md**: Contributing guidelines and development workflow
- **CHANGELOG.md**: Version history and changes
- **GITHUB_SETUP.md**: GitHub publishing setup checklist
- **CODE_OF_CONDUCT.md**: Contributor Covenant Code of Conduct
- **SECURITY.md**: Security vulnerability reporting policy
- **SUPPORT.md**: Support and help resources
- **LICENSE**: Apache-2.0 license
- **package.json**: Dependency versions and scripts
- **tsconfig.json**: TypeScript configuration details
- **tsdoc.json**: TSDoc configuration for @tag custom tag system
- **vite.config.ts**: Build configuration details
- **index.html**: HTML entry point with meta tags
- **.env.example**: Environment variable template

## License

Apache-2.0
