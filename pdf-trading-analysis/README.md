# PDF交易记录复盘能力

这个文件夹包含了读取PDF交易记录并进行复盘分析的相关能力。专门整理和封装了投注交易记录的分析功能，便于重用和维护。

## 功能概述

1. **PDF解析**: 从PDF文件中提取交易记录数据（框架，需要实际PDF文件支持）
2. **数据清洗**: 清洗和标准化交易数据
3. **复盘分析**: 对交易记录进行统计分析
4. **报告生成**: 生成详细的复盘报告
5. **趋势识别**: 识别盈利模式和需要改进的领域

## 文件结构

```
pdf-trading-analysis/
├── README.md              # 本文件
├── package.json           # 项目配置和依赖
├── main.js               # 主入口文件
├── pdf-parser.js         # PDF解析器框架
├── trading-analyzer.js   # 交易分析器
├── report-generator.js   # 报告生成器
├── test.js              # 测试文件
├── sample-data/         # 示例数据
│   └── sample-transactions.json
└── reports/             # 生成的报告（运行时创建）
```

## 快速开始

### 1. 安装依赖
```bash
cd pdf-trading-analysis
npm install
```

### 2. 运行示例分析
```bash
# 快速分析
npm run quick

# 完整分析（生成详细报告）
npm run full
```

### 3. 使用自己的数据
```bash
# 快速分析
node main.js <你的数据文件路径> --quick

# 完整分析
node main.js <你的数据文件路径> --full
```

## 数据格式

系统支持JSON格式的交易数据，示例结构：
```json
[
  {
    "date": "05 Apr 2026",
    "time": "12:56 AM",
    "type": "Football",
    "selection": "Spanish League - Atletico Madrid vs Barcelona - 1X2 Barcelona @ 1.82",
    "amount": 15.00,
    "result": "Win",
    "payout": 27.30
  }
]
```

## 分析功能

### 基本统计
- 总投注次数、胜率、败率、平局率
- 总投注金额、总回报金额、净盈利
- 投资回报率（ROI）

### 详细分析
- **按日期分析**: 每日表现统计
- **按投注类型分析**: 识别最赚钱和最亏钱的投注类型
- **趋势分析**: 识别盈利趋势

### 报告生成
- 完整Markdown报告
- 文本摘要报告
- 可视化建议和关键发现

## 从PDF提取数据

如需从PDF文件提取数据，需要安装pdf-parse库：
```bash
npm install pdf-parse
```

然后修改`pdf-parser.js`中的解析逻辑以适应您的PDF格式。

## 扩展功能

### 添加新的分析维度
1. 在`trading-analyzer.js`中添加新的分析方法
2. 在`report-generator.js`中更新报告生成逻辑
3. 在`main.js`中集成新的分析功能

### 支持其他数据格式
1. 修改`pdf-parser.js`支持其他格式
2. 或创建新的解析器（如CSV解析器、Excel解析器）

## 注意事项

- 确保数据格式正确
- 定期备份原始交易记录
- 验证分析结果的准确性
- 投注有风险，分析仅供参考

## 开发指南

### 运行测试
```bash
npm test
```

### 开发模式
```bash
npm run dev
```

## 相关技能

这个能力与以下OpenClaw技能相关：
- **odds-analyzer**: 赔率分析技能
- **投注复盘**: 交易记录分析
- **数据分析**: 统计和趋势分析

## 更新日志

- v1.0.0: 初始版本，包含基本分析框架
- 未来计划: 添加PDF解析、可视化图表、机器学习预测