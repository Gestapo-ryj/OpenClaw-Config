# ⚽ OpenClaw Football Analytics Workspace

> AI-powered football odds analysis and match data intelligence

[![OpenClaw](https://img.shields.io/badge/OpenClaw-AI%20Assistant-0066CC)](https://openclaw.ai)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933)](https://nodejs.org)
[![Git](https://img.shields.io/badge/Git-Enabled-F05032)](https://git-scm.com)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## 🎯 What's This?

This is an **AI-powered workspace** for football (soccer) analytics, specializing in:

- **📊 Odds Analysis** - Real-time odds tracking and value betting identification
- **⚽ Match Intelligence** - Detailed match statistics and team information
- **🧠 AI Memory** - Persistent learning and experience accumulation
- **🔧 Skill System** - Modular, extensible analysis tools

Built on the [OpenClaw](https://openclaw.ai) AI assistant platform, this workspace combines automated data collection with intelligent analysis to provide actionable insights for football enthusiasts and bettors.

## ✨ Features

### 🎲 **Smart Odds Analysis**
- **Real-time tracking** from sgodds.com and other sources
- **Change detection** - identify significant odds movements (>5%, >10% thresholds)
- **Value betting opportunities** based on market inefficiencies
- **Multi-league support** - European, Asian, American leagues

### 📈 **Match Data Intelligence**
- **Complete match details** - lineups, substitutions, events timeline
- **Technical statistics** - possession, shots, corners, cards
- **Team information** - integrated with Titan007 (新球体育) API
- **Historical analysis** - past performance and trends

### 🧩 **Modular Skill System**
- **Odds Analyzer** - Core odds analysis engine
- **Team Searcher** - Team ID and information lookup
- **Match Details** - Comprehensive match data fetcher
- **Easy to extend** - Add your own skills following our template

### 💾 **Intelligent Memory**
- **Long-term memory** (`MEMORY.md`) - Important decisions and user preferences
- **Daily logs** (`memory/YYYY-MM-DD.md`) - Detailed activity records
- **Skill memory** - Learning from past analyses and optimizations

## 🚀 Quick Start

### Prerequisites
- [OpenClaw](https://openclaw.ai) environment
- Node.js 18 or higher
- Git

### Basic Usage

```javascript
// 1. Odds Analysis
const OddsAnalyzer = require('./skills/odds-analyzer/scripts/analyze-odds.js');
const analyzer = new OddsAnalyzer({ threshold: 10 });
const report = analyzer.quickAnalyze(oddsData);
console.log(report);

// 2. Team Search
const TeamSearcher = require('./skills/odds-analyzer/scripts/search_team.js');
const searcher = new TeamSearcher();
const teamInfo = await searcher.searchTeam('Instituto AC Cordoba');
console.log(teamInfo);

// 3. Integrated Analysis
const integrated = require('./skills/odds-analyzer/scripts/integrated_example.js');
// See example for complete workflow
```

### Example: Analyze Today's Matches
```bash
# Run the integrated analysis example
node skills/odds-analyzer/scripts/integrated_example.js

# Or use the quick analysis script
node analyze_today_odds_fixed.js
```

## 📁 Project Structure

```
workspace/
├── 📄 AGENTS.md          # Agent configuration
├── 📄 SOUL.md            # AI personality definition
├── 📄 MEMORY.md          # Long-term memory
├── 📄 USER.md            # User information
├── 📄 TOOLS.md           # Tool configurations
├── 📂 memory/            # Daily memory logs
│   └── 2026-04-09.md     # Today's activities
├── 📂 skills/            # Skill modules
│   ├── 📂 odds-analyzer/     # Core odds analysis
│   │   ├── 📄 SKILL.md       # Skill documentation
│   │   ├── 📂 scripts/       # Main scripts
│   │   │   ├── analyze-odds.js      # Core analyzer
│   │   │   ├── search_team.js       # Team search
│   │   │   ├── integrated_example.js # Full example
│   │   │   └── test_*.js            # Test scripts
│   │   └── 📂 references/    # Documentation
│   ├── 📂 match-details/     # Match data
│   └── 📂 odds-summary/      # Summary reports
├── 📄 analyze_*.js       # Various analysis scripts
└── 📄 README.md          # This file
```

## 🔧 Development

### Creating a New Skill

1. **Create skill directory** in `skills/`
2. **Add SKILL.md** with documentation
3. **Write main scripts** in `scripts/`
4. **Add examples** and references

```markdown
# Skill Template

## Description
What this skill does

## Usage
```javascript
// Code example
```

## Parameters
- `param1`: Description
- `param2`: Description

## Examples
Practical usage examples
```

### Code Standards
- **ES6+** JavaScript
- **JSDoc** comments for all functions
- **Error handling** in all async operations
- **Modular design** for reusability

### Git Commit Convention
```
type(scope): description

body (optional)

footer (optional)
```

**Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

## 📊 Data Sources

| Source | Type | Purpose |
|--------|------|---------|
| [sgodds.com](https://sgodds.com) | Odds Data | Real-time odds tracking |
| [titan007.com](https://titan007.com) | Team Data | Team IDs and information |
| [FoxSports](https://foxsports.com) | Match Details | Comprehensive match data |
| [SofaScore](https://sofascore.com) | Statistics | Technical match stats |

## 🛠️ Configuration

### OpenClaw Settings
```yaml
# Example configuration
model: deepseek/deepseek-chat
tools:
  - read
  - write
  - exec
  - web_search
  - web_fetch
skills:
  auto_load: true
  directory: ./skills
```

### Environment Variables
```bash
# Optional: API keys for external services
export TITAN007_API_KEY=your_key_here
export SGODDS_USER=your_username
```

## 📈 Performance & Optimization

### Caching Strategy
- **Local cache** for frequent queries
- **API response caching** to reduce calls
- **Compressed memory storage**

### Error Handling
- **Retry mechanisms** for network failures
- **Graceful degradation** when services are down
- **Automatic backups** of critical data

### Monitoring
- **Performance metrics** tracking
- **Error rate monitoring**
- **Usage statistics**

## 🚨 Troubleshooting

### Common Issues

**Q: Odds data parsing fails**
```javascript
// Debug parsing
const analyzer = new OddsAnalyzer();
console.log('Sample data:', rawData.substring(0, 200));
const matches = analyzer.extractFromSgoddsText(rawData);
console.log('Parsed matches:', matches.length);
```

**Q: Team search returns no results**
- Check network connectivity
- Verify API endpoint is accessible
- Validate search parameters

**Q: Memory file corruption**
```bash
# Restore from git
git checkout MEMORY.md

# Or from backup
cp memory/backup/MEMORY.backup.md MEMORY.md
```

**Q: Skill fails to load**
- Check SKILL.md file format
- Verify script paths are correct
- Ensure required dependencies are installed

### Debug Mode
```javascript
// Enable debug logging
const analyzer = new OddsAnalyzer({ debug: true });
// Additional debug output will be shown
```

## 🤝 Contributing

We welcome contributions! Here's how:

1. **Fork** the repository
2. **Create a feature branch** (`git checkout -b feature/AmazingFeature`)
3. **Commit your changes** (`git commit -m 'feat: Add AmazingFeature'`)
4. **Push to the branch** (`git push origin feature/AmazingFeature`)
5. **Open a Pull Request**

### Contribution Guidelines
- Follow existing code style and conventions
- Add tests for new functionality
- Update documentation as needed
- Ensure all tests pass before submitting

## 📚 Documentation

### Internal Docs
- [Skill Development Guide](./skills/odds-analyzer/SKILL.md)
- [Odds Analyzer API](./skills/odds-analyzer/references/USAGE.md)
- [Quick Start Guide](./skills/odds-analyzer/references/QUICK-START.md)

### External Resources
- [OpenClaw Documentation](https://docs.openclaw.ai)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [Git Workflow Guide](https://www.atlassian.com/git/tutorials/comparing-workflows)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **[OpenClaw](https://openclaw.ai)** - The AI assistant platform that makes this possible
- **Data Providers** - sgodds.com, titan007.com, FoxSports, and others
- **Contributors** - Everyone who has helped improve this workspace
- **Users** - For feedback and suggestions that drive improvement

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)
- **Documentation**: [OpenClaw Docs](https://docs.openclaw.ai)
- **Community**: [OpenClaw Discord](https://discord.gg/openclaw)

---

**Version**: 1.0.0  
**Last Updated**: April 9, 2026  
**Maintainer**: OpenClaw AI Assistant  
**Status**: Actively Developed 🚀

*"Data-driven decisions beat gut feelings every time."*