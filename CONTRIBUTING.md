# Contributing to OpenClaw Workspace

Thank you for your interest in contributing to the OpenClaw Football Analytics Workspace! This document provides guidelines and instructions for contributing.

## 🎯 Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for everyone.

## 📋 How to Contribute

### 1. Reporting Bugs
- Check if the bug has already been reported in [Issues](https://github.com/your-repo/issues)
- Use the bug report template
- Include steps to reproduce, expected behavior, and actual behavior
- Add relevant logs, screenshots, or error messages

### 2. Suggesting Enhancements
- Check if the enhancement has already been suggested
- Clearly describe the enhancement and its benefits
- Provide examples of how it would be used
- Consider if it aligns with project goals

### 3. Contributing Code

#### Fork and Clone
```bash
# Fork the repository on GitHub
# Clone your fork
git clone https://github.com/your-username/workspace.git
cd workspace

# Add upstream remote
git remote add upstream https://github.com/original-repo/workspace.git
```

#### Create a Branch
```bash
# Sync with upstream
git fetch upstream
git checkout main
git merge upstream/main

# Create a feature branch
git checkout -b feature/description
# or bug fix branch
git checkout -b fix/issue-description
```

#### Make Changes
- Follow the coding standards
- Write clear commit messages
- Add tests for new functionality
- Update documentation as needed

#### Commit Changes
```bash
# Stage changes
git add .

# Commit with descriptive message
git commit -m "feat: add new odds analysis feature

- Added support for Asian handicaps
- Improved error handling
- Updated documentation

Closes #123"
```

#### Push and Create Pull Request
```bash
# Push to your fork
git push origin feature/description

# Create PR on GitHub
# Use the PR template
# Link related issues
```

## 🏗️ Development Setup

### Prerequisites
- Node.js 18+
- Git
- OpenClaw environment

### Installation
```bash
# Clone the repository
git clone https://github.com/your-repo/workspace.git
cd workspace

# Install dependencies (if any)
npm install

# Set up environment (if needed)
cp .env.example .env
# Edit .env with your configuration
```

### Running Tests
```bash
# Run all tests
npm test

# Run specific test
npm test -- --grep "odds analyzer"

# Run with coverage
npm run test:coverage
```

## 📝 Coding Standards

### JavaScript/Node.js
- Use ES6+ features
- Follow Airbnb JavaScript Style Guide
- Use async/await for asynchronous code
- Add JSDoc comments for public functions

### File Structure
```
skill-name/
├── SKILL.md                    # Required: Skill documentation
├── scripts/
│   ├── main-script.js          # Main functionality
│   └── utils.js                # Utilities (if needed)
├── references/
│   ├── USAGE.md                # Usage examples
│   └── API.md                  # API documentation
├── examples/
│   └── basic-usage.js          # Example code
└── tests/
    └── main.test.js            # Test files
```

### Commit Message Format
```
type(scope): description

Body (optional)

Footer (optional)
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples**:
```
feat(odds): add support for live odds tracking

- Implemented WebSocket connection for real-time data
- Added caching layer for performance
- Updated documentation with examples

Closes #45
```

```
fix(parser): handle missing time data in sgodds format

- Added fallback parsing for incomplete time data
- Improved error messages
- Added test cases for edge conditions

Fixes #78
```

## 🧪 Testing

### Test Structure
```javascript
// Example test file
describe('OddsAnalyzer', () => {
  describe('extractFromSgoddsText', () => {
    it('should parse basic odds data', () => {
      // Test code
    });
    
    it('should handle missing data gracefully', () => {
      // Test error handling
    });
  });
});
```

### Test Requirements
- Unit tests for all public functions
- Integration tests for skill interactions
- Edge case testing
- Performance testing for data-intensive operations

## 📚 Documentation

### Skill Documentation (SKILL.md)
```markdown
# Skill Name

## Description
Brief description of what the skill does.

## Usage
```javascript
// Code example
```

## Parameters
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| threshold | number | 10 | Change threshold percentage |
| excludeWomen | boolean | true | Exclude women's matches |

## Examples
### Basic Usage
```javascript
// Example 1
```

### Advanced Usage
```javascript
// Example 2
```

## API Reference
### Class: SkillName
#### constructor(options)
#### methodName(param1, param2)

## Changelog
### v1.0.0 (2026-04-09)
- Initial release
- Basic odds analysis functionality
```

### Inline Documentation
```javascript
/**
 * Parse odds data from sgodds.com text format
 * @param {string} text - Raw HTML/text from sgodds.com
 * @param {Object} options - Parsing options
 * @param {number} options.threshold - Minimum change percentage to highlight
 * @returns {Array} Array of parsed match objects
 * @throws {Error} If data format is invalid
 */
function parseOddsData(text, options = {}) {
  // Implementation
}
```

## 🔄 Pull Request Process

1. **Ensure tests pass** - All existing and new tests should pass
2. **Update documentation** - Keep docs in sync with code changes
3. **Follow style guide** - Code should match project conventions
4. **Keep PR focused** - One feature/fix per PR
5. **Add description** - Explain what and why, not just how

### PR Review Checklist
- [ ] Code follows project standards
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] No breaking changes (or documented if necessary)
- [ ] Performance considered
- [ ] Security implications considered

## 🏷️ Versioning

We use [Semantic Versioning](https://semver.org/):
- **MAJOR** version for incompatible API changes
- **MINOR** version for new functionality (backwards compatible)
- **PATCH** version for bug fixes

## 📞 Getting Help

- **GitHub Issues**: For bug reports and feature requests
- **Discussions**: For questions and general discussion
- **Documentation**: Check existing docs first
- **Code Review**: Ask for help during PR review

## 🙏 Recognition

All contributors will be recognized in:
- GitHub contributors list
- Release notes
- Project documentation (if significant contribution)

## 📄 License

By contributing, you agree that your contributions will be licensed under the project's [MIT License](LICENSE).

---

Thank you for contributing to make this project better! 🚀