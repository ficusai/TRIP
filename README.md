# TRIP — Offline-First Interactive Web Mapper & World Tour Planner

> **TRIP** (Trip Mapper v1.0) is an offline-first web application built with React 19, TypeScript, Vite, Tailwind CSS v4, and Leaflet. Designed with 100% try-catch error resilience, structured session log streaming, and GPU-accelerated map rendering capabilities.

---

## 📖 Table of Contents
- [Overview & Purpose](#-overview--purpose)
- [Key Features](#-key-features)
- [Architecture & Core Concepts](#-architecture--core-concepts)
- [File & Directory Structure](#-file--directory-structure)
- [Installation & Setup](#-installation--setup)
- [Usage Guide (CLI & GUI)](#-usage-guide-cli--gui)
- [Testing & Quality Verification](#-testing--quality-verification)
- [Git & Release Branching](#-git--release-branching)
- [License & Attribution](#-license--attribution)

---

## 💡 Overview & Purpose

**TRIP** provides a resilient foundation for interactive 2D web mapping and route planning.

Key architectural highlights:
* **Zero-Crash Architecture**: Every component, event handler, async fetch, and Vite middleware route is wrapped in defensive try-catch guards with class-based fallback error boundaries.
* **Real-Time Structured Logging**: Features a multi-transport logging system (`logger.ts`) that streams browser logs directly to timestamped server files (`logs/session-*.txt`) via a custom Vite dev server plugin (`logWriterPlugin`).
* **Map Optimization**: Includes tailored Tailwind CSS v4 resets specifically designed to fix Leaflet tile tearing and enable GPU-accelerated map rendering (`transform: translateZ(0)`).

---

## ⚡ Key Features

* **React 19 & TypeScript 5 Setup**: Configured with strict type safety, ES2020 target compilation, and React 19 concurrent mode support.
* **100% Try-Catch Resilience**: Defensive programming pattern across all code modules prevents React DOM unmounting or unhandled promise rejections.
* **Server-Side Session Log Streaming**: Custom Vite plugin (`logWriter.ts`) intercepts HTTP POST requests at `/__log` to capture dev server events on disk.
* **Tailwind CSS v4 & Leaflet CSS Resets**: Overrides image resets and box-sizing constraints to guarantee rendering of Leaflet map layers and markers.
* **Auto-Dismissing Toast System**: Modular notification component (`Toast.tsx`) supporting success, error, and info status alerts with unmount timer cleanups.
* **Automated Dev Launcher**: `launcher.sh` checks Node environment settings (targeting Node 18+ / 22+), installs `node_modules` automatically if missing, and launches Vite on port `3001`.
* **CI/CD Security Workflows**: Pre-configured GitHub Actions workflows for Node.js matrix testing (`ci.yml`) and automated static analysis (`codeql.yml`).

---

## 🏗 Architecture & Core Concepts

```
┌─────────────────────────────────────────────────────────────────┐
│              Browser Client (React 19 + Tailwind v4)            │
│  ┌────────────────────┐  ┌───────────────────────────────────┐  │
│  │ src/main.tsx       │──│ src/App.tsx (ErrorBoundary)      │  │
│  └────────────────────┘  └─────────────────┬─────────────────┘  │
│                                            │                    │
│                                 src/lib/logger.ts               │
│                                  HTTP POST /__log               │
└────────────────────────────────────────────┼────────────────────┘
                                             │
                                             ▼
┌─────────────────────────────────────────────────────────────────┐
│         Vite Dev Server Plugin (vite-plugins/logWriter.ts)      │
│         Writes logs to logs/session-YYYY-MM-DDTHH-MM-SS.txt     │
└─────────────────────────────────────────────────────────────────┘
```

### Server API & Console Debug Log Endpoints

| Endpoint / API | Type | Function |
|---|---|---|
| `POST /__log` | Dev Middleware | Streams batched log entries to `logs/session-*.txt` |
| `GET /__log/status` | Dev Middleware | Returns logging state JSON |
| `POST /__log/toggle` | Dev Middleware | Flips runtime server logging on/off |
| `window.__tripMapperLog(boolean)` | Browser Console | Toggles client-side log dispatching |

---

## 📁 File & Directory Structure

```
TRIP/
├── src/                        # React / TypeScript source code
│   ├── components/             # UI components (Toast notification system)
│   ├── lib/                    # Core utilities (structured logging engine)
│   ├── App.tsx                 # Root layout shell and ErrorBoundary component
│   ├── main.tsx                # Entry point, DOM mounting & fallback renderer
│   ├── index.css               # Tailwind CSS v4 imports & Leaflet map overrides
│   └── vite-env.d.ts           # Vite client environment type declarations
├── vite-plugins/               # Custom Vite plugins
│   └── logWriter.ts            # Middleware streaming logs to session files
├── public/                     # Static public web assets (favicon.svg)
├── logs/                       # Server-side timestamped session log output files
├── .github/                    # CI/CD workflows (ci.yml, codeql.yml, issue templates)
├── launcher.sh                 # Bash dev server launcher
├── package.json                # Dependencies, scripts, and package metadata
├── vite.config.ts              # Vite bundler & plugin configuration
├── tsconfig.json               # TypeScript compiler options
├── tsdoc.json                  # TSDoc specification for @tag architecture tracking
├── architecture.md             # System design & architecture reference
└── README.md                   # Project documentation
```

---

## 🚀 Installation & Setup

### Prerequisites
* Node.js **18.0.0** or higher (Node 22 recommended)
* `npm` or `yarn`

### Installation

```bash
# Clone the repository
git clone https://github.com/ficusai/TRIP.git
cd TRIP

# Install dependencies
npm install
```

---

## 💻 Usage Guide (CLI & GUI)

### 1. Launching Development Server (Vite)

```bash
# Option A: Automated launcher script (checks Node & installs missing packages)
./launcher.sh

# Option B: Standard npm script
npm run dev
```
*App will run at `http://localhost:3001` (bound to `0.0.0.0` for local network testing).*

### 2. Building for Production

```bash
# Run production bundle build
npm run build

# Preview compiled production build
npm run preview

# Clean build artifacts
npm run clean
```

---

## 🧪 Testing & Quality Verification

Run type checking and static build validations:

```bash
# Execute TypeScript strict type checking
npm run lint

# Validate production build bundle
npm run build
```

---

## 🌿 Git & Release Branching

* **Active Release Branch**: `TRIP-0.1v-linux-native`
* **Remote Origin**: `https://github.com/ficusai/TRIP.git`

All commits within this repository maintain strict local directory boundary isolation and follow standardized release branch naming (`<PROJECT>-0.1v-linux-native`).

---

## 📄 License & Attribution

Distributed under the **Apache-2.0 License**. See `LICENSE` for details.  
Maintained by the **FICUS AI Team** (`https://github.com/ficusai`).
