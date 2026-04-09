# OpenClaw AI Assistant Workspace

![OpenClaw](https://img.shields.io/badge/OpenClaw-AI%20Assistant-blue)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![Git](https://img.shields.io/badge/Git-Enabled-brightgreen)

这是一个OpenClaw AI助手的工作空间，专注于足球赔率分析和比赛数据查询。包含完整的技能系统、记忆管理和开发工具。

## ✨ 核心功能

### 🎯 赔率分析系统
- **实时赔率监控**: 从sgodds.com等源获取最新赔率
- **变化趋势分析**: 识别赔率变化模式和趋势
- **投注机会识别**: 基于赔率变化发现价值投注机会
- **球队信息集成**: 集成新球体育API搜索球队数据

### 📊 比赛数据查询
- **比赛详情获取**: 从多个源获取完整比赛信息
- **技术统计对比**: 详细的比赛数据统计分析
- **事件时间线**: 完整的比赛事件记录
- **阵容和换人**: 球队阵容和换人信息

### 🧠 智能记忆系统
- **长期记忆**: 重要决策和用户偏好
- **每日日志**: 详细的工作记录和交互历史
- **技能记忆**: 技能使用经验和优化记录

## 🚀 快速开始

### 1. 环境要求
- Node.js 18+
- Git
- OpenClaw环境

### 2. 安装和使用
```bash
# 克隆仓库
git clone <repository-url>

# 进入工作目录
cd workspace

# 运行赔率分析示例
node skills/odds-analyzer/scripts/integrated_example.js
```

### 3. 基本使用示例
```javascript
// 赔率分析
const OddsAnalyzer = require('./skills/odds-analyzer/scripts/analyze-odds.js');
const analyzer = new OddsAnalyzer({ threshold: 10 });
const report = analyzer.quickAnalyze(oddsData);

// 球队搜索
const TeamSearcher = require('./skills/odds-analyzer/scripts/search_team.js');
const searcher = new TeamSearcher();
const teamInfo = await searcher.searchTeam('科尔多瓦学院');
```

## 📁 项目结构

```
workspace/
├── README.md                   # 项目说明
├── AGENTS.md                   # 代理配置
├── SOUL.md                     # AI个性定义
├── MEMORY.md                   # 长期记忆
├── memory/                     # 每日记忆
│   └── YYYY-MM-DD.md
├── skills/                     # 技能目录
│   ├── odds-analyzer/         # 赔率分析技能
│   │   ├── SKILL.md
│   │   ├── scripts/
│   │   └── references/
│   ├── match-details/         # 比赛详情技能
│   └── odds-summary/          # 赔率汇总技能
└── *.js                       # 各种分析脚本
```

## 🔧 技能开发

### 创建新技能
1. 在`skills/`目录下创建技能文件夹
2. 添加`SKILL.md`技能文档
3. 在`scripts/`目录下编写主要脚本
4. 在`references/`目录下添加使用文档

### 技能模板
```markdown
# 技能名称

## 描述
简要描述技能功能

## 使用方法
```javascript
// 代码示例
```

## 参数说明
- `param1`: 参数说明
- `param2`: 参数说明

## 示例
具体使用示例
```

## 📊 数据源

| 数据源 | 类型 | 用途 |
|--------|------|------|
| sgodds.com | 赔率数据 | 赔率变化分析 |
| titan007.com | 球队数据 | 球队信息查询 |
| FoxSports | 比赛详情 | 比赛数据获取 |
| SofaScore | 技术统计 | 数据分析 |

## 🛠️ 开发指南

### 代码规范
- 使用ES6+语法
- 添加JSDoc注释
- 错误处理完善
- 模块化设计

### 提交规范
```
feat: 添加新功能
fix: 修复问题
docs: 更新文档
style: 代码格式
refactor: 代码重构
test: 测试相关
chore: 工具更新
```

### 测试要求
- 主要功能需有测试用例
- 边界情况测试
- 错误处理测试

## 🔄 工作流程

1. **数据获取**: 从多个源获取赔率和比赛数据
2. **数据分析**: 使用分析技能处理数据
3. **报告生成**: 生成详细的分析报告
4. **记忆更新**: 记录分析结果和经验
5. **优化迭代**: 基于反馈优化算法

## 📈 性能优化

### 缓存策略
- 频繁查询的数据本地缓存
- API响应缓存减少请求
- 记忆数据压缩存储

### 并发处理
- 异步数据获取
- 并行分析任务
- 资源使用监控

### 错误恢复
- 网络错误重试机制
- 数据备份和恢复
- 降级方案准备

## 🚨 故障排除

### 常见问题

**Q: 赔率数据解析失败**
A: 检查数据格式，使用`test_fixed_parser.js`测试

**Q: 球队搜索无结果**
A: 验证API端点，检查网络连接

**Q: 记忆文件损坏**
A: 使用git恢复或从备份恢复

**Q: 技能加载失败**
A: 检查SKILL.md格式和脚本路径

### 调试工具
```javascript
// 调试赔率解析
const analyzer = new OddsAnalyzer();
console.log('原始数据:', rawData.substring(0, 500));
const matches = analyzer.extractFromSgoddsText(rawData);
console.log('解析结果:', matches);
```

## 🤝 贡献指南

1. Fork本仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'feat: Add AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启Pull Request

### 贡献要求
- 遵循现有代码风格
- 添加必要的测试
- 更新相关文档
- 通过代码审查

## 📚 学习资源

### 内部文档
- [技能开发指南](./skills/odds-analyzer/SKILL.md)
- [赔率分析API文档](./skills/odds-analyzer/references/USAGE.md)
- [快速开始指南](./skills/odds-analyzer/references/QUICK-START.md)

### 外部资源
- [OpenClaw官方文档](https://docs.openclaw.ai)
- [Node.js最佳实践](https://github.com/goldbergyoni/nodebestpractices)
- [Git工作流指南](https://www.atlassian.com/git/tutorials/comparing-workflows)

## 📄 许可证

本项目基于MIT许可证开源。详见[LICENSE](LICENSE)文件。

## 🙌 致谢

感谢以下项目和服务的支持：
- [OpenClaw](https://openclaw.ai) - AI助手平台
- [sgodds.com](https://sgodds.com) - 赔率数据源
- [titan007.com](https://titan007.com) - 球队数据源
- 所有贡献者和用户

## 📞 支持

如有问题或建议，请：
1. 查看[常见问题](#故障排除)
2. 提交[Issue](https://github.com/your-repo/issues)
3. 参考[文档](#学习资源)

---

**版本**: 1.0.0  
**最后更新**: 2026年4月9日  
**维护者**: OpenClaw AI助手  
**状态**: 活跃开发中 🚀