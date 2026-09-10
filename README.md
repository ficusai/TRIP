# Trip Mapper v1.0

![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)
![Node Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue.svg)
![React](https://img.shields.io/badge/React-19.2.7-61DAFB.svg)

**Version:** 1.0.0
**Status:** Development Foundation / MVP
**Last Updated:** 2026-07-21

## Overview

Trip Mapper v1.0 is a React-based web application foundation for an offline-first world tour route planner. This version establishes the core architecture, build system, and development infrastructure for future feature development.

## Current State

**What's Implemented:**
- ✅ React 19 + TypeScript application structure
- ✅ Vite build system with hot module replacement
- ✅ Tailwind CSS v4 styling framework
- ✅ Centralized structured logging system
- ✅ Error boundary with graceful fallback
- ✅ 100% try-catch error coverage across all source files
- ✅ Automatic session file logging
- ✅ Toast notification infrastructure
- ✅ Development launcher script
- ✅ Leaflet mapping integration (ready for implementation)
- ✅ Comprehensive build configuration
- ✅ HTML entry point with mobile optimization
- ✅ Apache-2.0 license
- ✅ GitHub CI/CD workflows
- ✅ Contributing guidelines
- ✅ GitHub publishing setup checklist
- ✅ Architecture documentation (architecture.md)
- ✅ User documentation (README.md)
- ✅ Version tracking (CHANGELOG.md)

**What's Pending:**
- ⏳ Map container and Leaflet integration
- ⏳ Trip planning functionality
- ⏳ Data persistence layer
- ⏳ Import/export features
- ⏳ User interface components

**Community & Governance:**
- ✅ Code of Conduct (Contributor Covenant v2.1)
- ✅ Security policy (SECURITY.md)
- ✅ Support documentation (SUPPORT.md)
- ✅ Code owners (.github/CODEOWNERS)
- ✅ TSDoc configuration for @tag system
- ✅ Environment variable template (.env.example)

## Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
cd trip-mapper-v1.0
# or
cd /path/to/trip-mapper-v1.0
npm install
```

### Running the Application

**Option 1: Using the launcher script**
```bash
./launcher.sh
```

**Option 2: Direct npm command**
```bash
npm run dev
```

The application will be available at `http://localhost:3001`

### Building for Production

```bash
npm run build
```

Output will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

### Type Checking

```bash
npm run lint
```

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
│   ├── App.tsx                # Main application component
│   ├── main.tsx               # Application entry point
│   ├── index.css              # Global styles
│   └── vite-env.d.ts          # Vite client TypeScript types
├── vite-plugins/
│   └── logWriter.ts           # Vite plugin for session logging
├── public/
│   └── favicon.svg            # App icon file (unused - favicon is inlined in index.html)
├── logs/                      # Session log files (gitignored)
├── index.html                 # HTML entry point
├── launcher.sh                # Development launcher
├── package.json               # Dependencies and scripts
├── package-lock.json          # Dependency lockfile
├── tsconfig.json              # TypeScript configuration
├── tsdoc.json                 # TSDoc config for @tag system
├── vite.config.ts             # Vite configuration
├── .env.example               # Environment variable template
├── .gitignore                 # Git ignore rules
├── CODE_OF_CONDUCT.md         # Contributor Covenant v2.1
├── CONTRIBUTING.md            # Contributing guidelines
├── CHANGELOG.md               # Version history
├── GITHUB_SETUP.md            # GitHub publishing checklist
├── LICENSE                    # Apache-2.0 license
├── README.md                  # This file
├── SECURITY.md                # Security policy
└── SUPPORT.md                 # Support and help resources
```

## Core Components

### 1. Application Bootstrap (`src/main.tsx`)
- Handles DOM mounting with error checking
- Provides fatal error fallback rendering
- Uses safe DOM manipulation to prevent XSS

### 2. Application Shell (`src/App.tsx`)
- Root error boundary implementation
- Centralized error logging
- Placeholder UI ready for feature expansion

### 3. Structured Logging (`src/lib/logger.ts`)
- Centralized logging for all application code
- Multi-level logging (trace, debug, info, warn, error)
- Runtime toggle via localStorage or HTTP API
- **Automatic Session Logging**: Every run of the dev server automatically streams logs to a dedicated file (`logs/session-*.txt`), capturing all `log.entry`, `log.step`, and `log.error` payloads natively.

**Usage:**
```typescript
import { createLogger } from './lib/logger';

const log = createLogger('my.module');

function myFunction() {
  log.entry({ param1: 'value' });
  log.step('doing-something', { data: 'value' });
  log.exit({ result: 'success' });
}
```

**Runtime Control:**
```javascript
// In browser console
window.__tripMapperLog(false);  // Disable logging
window.__tripMapperLog(true);   // Enable logging
window.__tripMapperLogStatus(); // Check status
```

### 4. Toast Notifications (`src/components/Toast.tsx`)
- Auto-dismissing notification system
- Support for success, error, and info variants
- Configurable duration per toast
- Timer cleanup on unmount

### 5. Vite Log Writer Plugin (`vite-plugins/logWriter.ts`)
- Collects log lines via HTTP POST
- Writes to session files with timestamps
- Provides logging control endpoints
- Automatic session cleanup

### 6. HTML Entry Point (`index.html`)
- HTML template for the application
- Mobile viewport configuration with no-scaling
- Dark theme color scheme
- Open Graph meta tags for social sharing
- Inline SVG favicon via data URI (public/favicon.svg file is unused)
- Apple mobile web app configuration

## Technology Stack

### Core Framework
- **React 19.2.7**: UI framework with concurrent features (package.json: `^19.0.1`)
- **React DOM 19.2.7**: React DOM renderer (package.json: `^19.0.1`)
- **TypeScript 5.8.3**: Type safety and enhanced DX (package.json: `~5.8.2`)
- **Vite 6.4.3**: Fast build tool and dev server (package.json: `^6.2.3`)

### Styling & UI
- **Tailwind CSS 4.3.3**: Utility-first CSS with Vite plugin (package.json: `^4.1.14`)
- **Autoprefixer 10.5.4**: CSS vendor prefixing (package.json: `^10.4.21`)
- **Lucide React 0.546.0**: Icon library
- **Custom CSS**: Leaflet compatibility and animations

### Mapping (Infrastructure Ready)
- **Leaflet 1.9.4**: 2D mapping library
- **React Leaflet 5.0.0**: React integration for Leaflet

### Development Tools
- **tsx 4.23.1**: TypeScript execution (package.json: `^4.21.0`)
- **@vitejs/plugin-react 5.2.0**: React plugin for Vite (package.json: `^5.0.4`)
- **@types/***: TypeScript type definitions
  - **@types/node 22.20.1**: Node.js type definitions (package.json: `^22.14.0`)

## Development Workflow

### Adding New Components

1. Create component in `src/components/`
2. Add structured logging:
```typescript
import { createLogger } from '../lib/logger';
const log = createLogger('comp.my-component');
```
3. Use appropriate TAG comments for architecture documentation
4. Follow existing naming conventions

### Adding New Utilities

1. Create utility in `src/lib/`
2. Export pure functions when possible
3. Add comprehensive TypeScript types
4. Log via centralized logger

### Adding New Vite Plugins

1. Create plugin in `vite-plugins/`
2. Export plugin function returning Vite Plugin interface
3. Add to plugin chain in `vite.config.ts`
4. Document with TAG comments

## Configuration

### TypeScript Configuration
- Target: ES2020
- Strict mode enabled
- JSX: react-jsx (automatic runtime)
- Bundler module resolution for Vite
- Excludes test files (currently references non-existent `src/test-app.test.tsx`)

### Vite Configuration
- Dev server on port 3001
- Plugin chain: React + Tailwind + Log Writer
- Build output to `dist/`
- Source maps disabled in production

### Environment Variables
- `VITE_LOGGING_ENABLED`: Set to `false` to disable logging at build time

### Package Configuration
- `"type": "module"` - Indicates ES module usage for the project
- `"private": true` - Prevents accidental publication to npm registry

## Logging System

The logging system provides comprehensive visibility into application behavior:

### Log Levels
- **trace**: Detailed step-by-step execution
- **debug**: Entry/exit points
- **info**: General information
- **warn**: Warning conditions
- **error**: Error conditions with stack traces

### Transport Methods
- Console output (color-coded by level)
- Session file writing (via Vite plugin)
- HTTP endpoints for runtime control

### Session Files
Session logs are written to `logs/session-YYYY-MM-DDTHH-MM-SS.txt` during development.

## Architecture

See [architecture.md](./architecture.md) for detailed documentation on:
- Component architecture
- Data flow patterns
- Build system details
- Security considerations
- Performance optimizations
- Extension points

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server on port 3001 with host binding |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run clean` | Remove dist directory |
| `npm run lint` | Run TypeScript type checking |

## Development Guidelines

### Code Style
- Use TypeScript strict mode
- Prefer functional components with hooks
- Use descriptive function and variable names
- Add TAG comments for significant code sections
- Log all significant operations via centralized logger

### Error Handling
- **100% Try-Catch Coverage**: Absolutely every operation (including root-level component renders, hooks, timeouts, config loading, etc.) must be wrapped in `try-catch` blocks.
- Log errors via `logger.error()` explicitly to prevent silent failures.
- Provide user-friendly error messages
- Use error boundaries for component trees

### Performance
- Use batched operations where possible
- Clean up timers and event listeners
- Optimize re-renders with proper dependency arrays
- Use React.memo for expensive components

## Future Development

The architecture is designed to support incremental feature addition:

### Planned Features
1. **Map Integration**: Leaflet map container with tile providers
2. **Data Persistence**: IndexedDB for trip data and photos
3. **Trip Planning**: Route creation, stop management, distance calculation
4. **Import/Export**: JSON, GPX, KML formats
5. **Advanced Features**: 3D mapping, offline tile management

### Extension Points
- `src/App.tsx`: Add main application UI
- `src/components/`: Add feature-specific components
- `src/lib/`: Add utilities and business logic
- `vite.config.ts`: Add build-time plugins

## Troubleshooting

### Development Server Issues
- Ensure port 3001 is available
- Check that Node.js 18+ is installed
- Delete `node_modules` and run `npm install` if dependencies fail

### Build Issues
- Run `npm run lint` to check for TypeScript errors
- Ensure all dependencies are installed
- Check Vite configuration for syntax errors

### Logging Issues
- Check that `logs/` directory is writable
- Verify Vite dev server is running for log collection
- Use `window.__tripMapperLogStatus()` to check logging state

## License

Apache-2.0 - See [LICENSE](./LICENSE) file for details

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines on how to contribute to this project.

## Support

- **Issues**: Report bugs and request features via [GitHub Issues](https://github.com/ficusai/trip-mapper-v1.0/issues)
- **Discussions**: Ask questions and discuss ideas via [GitHub Discussions](https://github.com/ficusai/trip-mapper-v1.0/discussions)
- **Documentation**: 
  - [architecture.md](./architecture.md) - Detailed architecture documentation
  - [CHANGELOG.md](./CHANGELOG.md) - Version history and changes

## Roadmap

See the "Future Development" section below for planned features and migration path.

## Acknowledgments

- Built with [React](https://react.dev/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Maps powered by [Leaflet](https://leafletjs.com/)
- Icons from [Lucide](https://lucide.dev/)
- Built with [Vite](https://vitejs.dev/)
