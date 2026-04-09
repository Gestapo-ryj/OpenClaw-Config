# Odds Analyzer 使用说明

## 快速开始

### 基本使用
```javascript
const OddsAnalyzer = require('./scripts/analyze-odds.js');
const analyzer = new OddsAnalyzer({ threshold: 10 });

// 从sgodds.com获取文本数据
const sgoddsText = `...`; // 粘贴sgodds.com页面文本

const report = analyzer.quickAnalyze(sgoddsText);
console.log(report);
```

### 在OpenClaw中使用
1. 访问sgodds.com获取赔率数据
2. 使用`web_fetch`工具获取页面内容
3. 调用Odds Analyzer进行分析
4. 输出分析报告

## 配置选项

### 构造函数参数
```javascript
const analyzer = new OddsAnalyzer({
  threshold: 10,      // 变化阈值百分比，默认10%
  minOdds: 1.01,      // 最低赔率过滤
  maxOdds: 100,       // 最高赔率过滤
  leagueFilter: 'English League Champ', // 联赛筛选
  timeFilter: '22:00' // 时间筛选
});
```

### 阈值说明
- `threshold: 5` - 找出变化超过5%的比赛
- `threshold: 15` - 找出变化超过15%的比赛
- `threshold: 0` - 显示所有变化（不筛选）

## 数据源支持

### 1. sgodds.com（主要支持）
```javascript
// 自动解析sgodds.com页面格式
const matches = analyzer.extractFromSgoddsText(sgoddsText);
```

### 2. 自定义格式
如需支持其他数据源，可扩展`extractFromSgoddsText`方法或创建新的解析器。

## 输出格式

### 标准报告包含
1. **统计数据** - 总比赛数、变化比赛数
2. **重点关注比赛** - 变化超过阈值的比赛详情
3. **最大变化** - 最大上升和下降
4. **分布分析** - 按联赛和时间段分布
5. **分析说明** - 解读和建议

### 示例输出
```
## 赔率分析报告

### 统计数据
- 总比赛场次: 37
- 变化超过10%的比赛: 4

### 重点关注比赛（变化超过10%）
1. **01:00 Spanish League Div 2**
   - 赔率: 1.65 / 3.20 / 4.70
   - 主胜: -15.4% (赔率: 1.65)
   - 平局: +10.3% (赔率: 3.20)
   - 客胜: +23.7% (赔率: 4.70)
...
```

## 高级功能

### 1. 批量分析
```javascript
// 分析多日数据
const dailyReports = [];
dates.forEach(date => {
  const data = fetchDataForDate(date);
  const report = analyzer.quickAnalyze(data);
  dailyReports.push(report);
});
```

### 2. 趋势分析
```javascript
// 比较不同时间点的变化
const changesOverTime = analyzeTrend(historicalData);
```

### 3. 机会识别
```javascript
// 找出价值投注机会
const opportunities = identifyValueBets(matches);
```

## 在OpenClaw工作流中的集成

### 步骤1：获取数据
```javascript
// 使用web_fetch获取sgodds.com数据
const response = await web_fetch({
  url: 'https://sgodds.com/football/current-odds',
  extractMode: 'text'
});
```

### 步骤2：分析数据
```javascript
const analyzer = new OddsAnalyzer({ threshold: 10 });
const report = analyzer.quickAnalyze(response.text);
```

### 步骤3：输出结果
```javascript
// 发送分析报告给用户
sendMessage(report);
```

### 完整示例
```javascript
// OpenClaw技能实现
async function analyzeOdds() {
  // 1. 获取数据
  const response = await web_fetch({
    url: 'https://sgodds.com/football/current-odds',
    extractMode: 'text',
    maxChars: 30000
  });
  
  // 2. 分析数据
  const analyzer = new OddsAnalyzer({ threshold: 10 });
  const report = analyzer.quickAnalyze(response.text);
  
  // 3. 返回结果
  return report;
}
```

## 错误处理

### 常见问题
1. **数据格式错误** - 检查sgodds.com页面结构是否变化
2. **网络问题** - 实现重试机制
3. **解析失败** - 提供降级分析

### 调试模式
```javascript
const analyzer = new OddsAnalyzer({ threshold: 10 });
analyzer.debug = true; // 启用调试输出

const matches = analyzer.extractFromSgoddsText(text);
console.log('解析到的比赛:', matches.length);
```

## 最佳实践

### 分析建议
1. **结合上下文** - 赔率变化需要结合球队新闻、伤病等信息
2. **关注一致性** - 多个选项同时变化比单一变化更有意义
3. **时间因素** - 临近比赛的变化通常更准确
4. **风险管理** - 大变化可能意味着高风险或高机会

### 报告优化
1. **突出重点** - 用粗体、颜色标记重要信息
2. **提供上下文** - 解释变化可能的原因
3. **保持客观** - 提供数据，让用户自己做决定
4. **明确限制** - 说明分析的局限性

## 扩展开发

### 添加新数据源
```javascript
class ExtendedOddsAnalyzer extends OddsAnalyzer {
  extractFromCustomSource(text) {
    // 实现自定义解析逻辑
    return parsedMatches;
  }
}
```

### 添加新分析维度
```javascript
class AdvancedOddsAnalyzer extends OddsAnalyzer {
  calculateImpliedProbability(matches) {
    // 计算隐含概率
    return probabilities;
  }
  
  identifyValueBets(matches) {
    // 找出价值投注机会
    return valueBets;
  }
}
```

## 维护更新

### 定期检查
1. 检查sgodds.com页面结构变化
2. 更新解析逻辑以适应变化
3. 测试新功能
4. 优化性能

### 版本记录
- v1.0: 基础赔率变化分析
- v1.1: 增加趋势识别
- v1.2: 添加机会识别功能
- v1.3: 优化报告格式

## 联系支持
如有问题或建议，请参考SKILL.md文档或联系开发者。

---

**提示**: 赔率分析仅供参考，投注有风险，请理性决策。