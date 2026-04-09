# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial workspace structure
- Basic README documentation
- Git configuration files
- Contribution guidelines

### Changed
- 

### Fixed
- 

## [1.0.0] - 2026-04-09

### Added
- **Core Odds Analyzer Skill**
  - `analyze-odds.js` - Main odds analysis class
  - Support for sgodds.com data format
  - Change detection with configurable thresholds
  - Report generation in markdown format
  
- **Team Search Integration**
  - `search_team.js` - Team information lookup
  - Integration with Titan007 (新球体育) API
  - Team ID resolution and data fetching
  
- **Match Details Skill**
  - Basic structure for match data fetching
  - Support for multiple data sources (FoxSports, SofaScore)
  
- **Memory System**
  - Long-term memory (`MEMORY.md`)
  - Daily memory logs (`memory/YYYY-MM-DD.md`)
  - Memory search and retrieval functionality
  
- **Project Documentation**
  - Comprehensive README with usage examples
  - Skill development guidelines
  - Git workflow documentation
  - Troubleshooting guide
  
- **Development Tools**
  - Git ignore configuration
  - Code style guidelines
  - Testing framework setup
  - Build and deployment scripts (placeholder)

### Changed
- Initial release - no previous versions to compare

### Fixed
- Initial release - no previous bugs to fix

### Security
- Initial security review completed
- API key handling guidelines established
- Data privacy considerations documented

## [0.1.0] - 2026-04-03

### Added
- Initial workspace setup
- Basic OpenClaw configuration
- First memory entries
- Experimental odds analysis scripts

### Changed
- N/A (initial version)

### Fixed
- N/A (initial version)

---

## Versioning Notes

### Version Format
`MAJOR.MINOR.PATCH`

- **MAJOR**: Incompatible API changes
- **MINOR**: New functionality (backwards compatible)
- **PATCH**: Bug fixes (backwards compatible)

### Release Schedule
- **Major releases**: As needed for breaking changes
- **Minor releases**: Monthly or when significant features added
- **Patch releases**: Weekly or as bugs are fixed

### Deprecation Policy
- Features marked as deprecated will be supported for at least one major release
- Deprecation warnings will be added to documentation
- Migration guides will be provided when possible

---

## How to Update This Changelog

### For Maintainers
1. Create a new `[Unreleased]` section when starting new work
2. Move `[Unreleased]` to new version number when releasing
3. Update links at bottom of file
4. Add release date in `YYYY-MM-DD` format

### For Contributors
1. Add your changes to the `[Unreleased]` section
2. Use the appropriate category (`Added`, `Changed`, `Fixed`, etc.)
3. Include issue/PR numbers when applicable
4. Be descriptive but concise

### Categories
- `Added`: New features
- `Changed`: Changes in existing functionality
- `Deprecated`: Soon-to-be removed features
- `Removed`: Removed features
- `Fixed`: Bug fixes
- `Security`: Vulnerability fixes

---

## Links

[Unreleased]: https://github.com/your-repo/workspace/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/your-repo/workspace/releases/tag/v1.0.0
[0.1.0]: https://github.com/your-repo/workspace/releases/tag/v0.1.0