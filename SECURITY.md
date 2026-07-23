# Security Policy

## Supported Versions

| Version | Supported          |
|---------|--------------------|
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability in Trip Mapper, please report it responsibly.

**Do not open a public GitHub issue for security vulnerabilities.**

Instead, please report security vulnerabilities by emailing the maintainers or by using
GitHub's private vulnerability reporting feature:

1. Go to the [Security tab](https://github.com/ficusai/trip-mapper-v1.0/security) of the repository
2. Click "Report a vulnerability"
3. Fill in the details of the vulnerability

### What to Include

- Description of the vulnerability
- Steps to reproduce the issue
- Potential impact
- Suggested fix (if any)

### Response Timeline

- **Acknowledgment**: Within 48 hours of report
- **Initial assessment**: Within 1 week
- **Fix or mitigation**: Depends on severity, typically within 2 weeks for critical issues

## Security Best Practices

When running Trip Mapper in development:

- The dev server binds to `0.0.0.0` by default (accessible on your local network)
- The logging endpoints (`/__log`, `/__log/toggle`, `/__log/status`) are development-only
- Never expose the Vite dev server to the public internet without proper authentication

When deploying for production:

- Build with `npm run build` and serve the `dist/` directory with a production web server
- The logging endpoints are only available in development mode (Vite dev server)
- Ensure your deployment environment does not expose sensitive environment variables

## Scope

This security policy applies to the Trip Mapper v1.0 project. For issues related
to dependencies (React, Vite, Leaflet, etc.), please refer to their respective
security policies.
