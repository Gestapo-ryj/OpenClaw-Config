# ⚽ OpenClaw Football Analytics

> AI-powered football odds analysis and match intelligence system

[![OpenClaw](https://img.shields.io/badge/OpenClaw-AI%20Assistant-0066CC)](https://openclaw.ai)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933)](https://nodejs.org)
[![Git](https://img.shields.io/badge/Git-Enabled-F05032)](https://git-scm.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## 🎯 Overview

An intelligent workspace for football analytics, combining:
- **Real-time odds tracking** and change detection
- **Comprehensive match data** from multiple sources
- **AI-powered analysis** and decision support
- **Modular skill system** for extensibility

Built on the [OpenClaw](https://openclaw.ai) AI assistant platform.

## ✨ Features

### 📊 **Odds Intelligence**
- Real-time odds monitoring from sgodds.com
- Change detection (5%, 10%+ thresholds)
- Value betting opportunity identification
- Multi-league support (Europe, Asia, Americas)

### ⚽ **Match Analytics**
- Complete match details and statistics
- Team information via Titan007 API
- Historical performance analysis
- Event timeline and lineup data

### 🧠 **AI Memory System**
- Long-term learning and experience accumulation
- Daily activity logs and performance tracking
- Skill optimization based on past results

### 🔧 **Modular Architecture**
- Extensible skill system
- Plugin-based data source integration
- Custom analysis pipeline support

## 🚀 Quick Start

### Prerequisites
- OpenClaw environment
- Node.js 18+
- Git

### Basic Usage
```javascript
// Odds analysis
const OddsAnalyzer = require('./skills/odds-analyzer/scripts/analyze-odds.js');
const analyzer = new OddsAnalyzer({ threshold: 10 });
const report = analyzer.quickAnalyze(oddsData);

// Team search
const TeamSearcher = require('./skills/odds-analyzer/scripts/search_team.js');
const searcher = new TeamSearcher();
const teamInfo = await searcher.searchTeam('Team Name');
```

### Run Examples
```bash
# Integrated analysis example
node skills/odds-analyzer/scripts/integrated_example.js

# Today's odds analysis
node analyze_today_odds_fixed.js
```

## 📁 Project Structure

```
workspace/
├── 📄 README.md          # This file
├── 📄 AGENTS.md          # Agent configuration
├── 📄 SOUL.md            # AI personality
├── 📄 MEMORY.md          # Long-term memory
├── 📂 memory/            # Daily logs
├── 📂 skills/            # Skill modules
│   ├── odds-analyzer/    # Core odds analysis
│   ├── match-details/    # Match data
│   └── odds-summary/     # Summary reports
├── 📄 CONTRIBUTING.md    # Contribution guide
├── 📄 CHANGELOG.md       # Version history
└── 📄 LICENSE            # MIT License
```

## 🔧 Development

### Skill Development
1. Create directory in `skills/`
2. Add `SKILL.md` documentation
3. Write scripts in `scripts/`
4. Add examples and tests

### Code Standards
- ES6+ JavaScript with JSDoc comments
- Comprehensive error handling
- Modular, reusable components
- Thorough testing

### Git Workflow
```
feat: add new analysis feature
fix: resolve data parsing issue
docs: update usage examples
style: improve code formatting
```

## 📊 Data Sources

| Source | Type | Purpose |
|--------|------|---------|
| sgodds.com | Odds | Real-time odds tracking |
| titan007.com | Teams | Team information |
| FoxSports | Matches | Detailed match data |
| SofaScore | Stats | Technical statistics |

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📚 Documentation

- [Skill Development Guide](skills/odds-analyzer/SKILL.md)
- [Odds Analyzer API](skills/odds-analyzer/references/USAGE.md)
- [Quick Start Guide](skills/odds-analyzer/references/QUICK-START.md)

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

- [OpenClaw](https://openclaw.ai) AI platform
- Data providers: sgodds.com, titan007.com
- All contributors and users

---

**Version**: 1.0.0  
**Last Updated**: 2026-04-09  
**Maintainer**: OpenClaw AI Assistant  
**Status**: Active Development 🚀