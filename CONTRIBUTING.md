# Contributing to Trip Mapper v1.0

Thank you for your interest in contributing to Trip Mapper v1.0! This document provides guidelines and instructions for contributing to the project.

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Setting Up the Development Environment

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/[your-username]/trip-mapper-v1.0.git
   cd trip-mapper-v1.0
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   # or
   ./launcher.sh
   ```

The application will be available at `http://localhost:3001`

## Development Workflow

### Code Style
- Use TypeScript strict mode
- Follow existing naming conventions
- Add TAG comments for significant code sections
- Log all significant operations via centralized logger

### Adding New Features

1. **Create a new branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Add structured logging via `createLogger()`
   - Use appropriate TAG comments for architecture documentation
   - Follow existing code patterns

3. **Test your changes**
   ```bash
   npm run lint
   npm run build
   ```

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

### Project Structure

```
trip-mapper-v1.0/
├── src/
│   ├── components/     # React UI components
│   ├── lib/           # Utilities and business logic
│   ├── App.tsx        # Main application component
│   ├── main.tsx       # Application entry point
│   └── index.css      # Global styles
├── vite-plugins/      # Custom Vite plugins
├── public/            # Static assets
├── logs/              # Session log files (gitignored)
└── docs/              # Documentation
```

## Logging System

Trip Mapper v1.0 uses a centralized logging system. All significant operations should be logged:

```typescript
import { createLogger } from './lib/logger';

const log = createLogger('your.module');

function yourFunction() {
  log.entry({ param1: 'value' });
  log.step('doing-something', { data: 'value' });
  log.exit({ result: 'success' });
}
```

### Runtime Log Control
```javascript
// In browser console
window.__tripMapperLog(false);  // Disable logging
window.__tripMapperLog(true);   // Enable logging
window.__tripMapperLogStatus(); // Check status
```

## Pull Request Process

1. **Update documentation** if needed
2. **Ensure all tests pass** (when tests are implemented)
3. **Update CHANGELOG.md** with your changes
4. **Submit a pull request** with a clear description

### Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How did you test your changes?

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review performed
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
- [ ] No new warnings generated
```

## Code Review Guidelines

- Be respectful and constructive
- Focus on the code, not the person
- Provide clear, actionable feedback
- Ask questions if something is unclear

## Issues and Bug Reports

When reporting issues, please include:

- **Description**: Clear description of the problem
- **Steps to reproduce**: Detailed steps to reproduce the issue
- **Expected behavior**: What you expected to happen
- **Actual behavior**: What actually happened
- **Environment**: Node.js version, OS, browser
- **Logs**: Relevant log entries if applicable

## Feature Requests

For feature requests:

- **Use case**: Describe the problem you're trying to solve
- **Proposed solution**: How you envision the feature working
- **Alternatives considered**: Other approaches you considered
- **Additional context**: Any other relevant information

## Questions and Discussions

For questions about:
- How to use the project
- Architecture decisions
- Implementation details
- Best practices

Please use GitHub Discussions or create an issue with the "question" label.

## License

By contributing to Trip Mapper v1.0, you agree that your contributions will be licensed under the Apache License 2.0.

## Recognition

Contributors will be recognized in the project's CONTRIBUTORS section once the project matures.

## Contact

For questions or discussions:
- Open an issue on GitHub
- Start a discussion in GitHub Discussions
- Contact the maintainers (update contact information in GITHUB_SETUP.md)

Thank you for contributing to Trip Mapper v1.0!
