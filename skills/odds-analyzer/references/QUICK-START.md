# Odds Analyzer 快速开始指南

## 一分钟上手

### 最简单用法
```javascript
// 在OpenClaw中直接使用
const response = await web_fetch({
  url: 'https://sgodds.com/football/current-odds',
  extractMode: 'text',
  maxChars: 30000
});

// 使用内置分析（简化版）
function simpleOddsAnalyzer(text, threshold = 10) {
  const lines = text.split('\n');
  let matches = [];
  let currentDate = '';
  
  for (let line of lines) {
    // 提取比赛数据
    if (line.includes('Spanish League') || line.includes('English League')) {
      const match = extractMatchData(line);
      if (match) matches.push(match);
    }
  }
  
  // 筛选变化超过阈值的
  const significant = matches.filter(m => 
    Math.abs(m.homeChange) >= threshold || 
    Math.abs(m.drawChange) >= threshold || 
    Math.abs(m.awayChange) >= threshold
  );
  
  // 生成报告
  return generateSimpleReport(significant, threshold);
}
```

## 常用场景

### 场景1：每日赔率监控
```javascript
// 每天早上9点检查赔率变化
async function dailyOddsCheck() {
  const data = await fetchSgoddsData();
  const analyzer = new OddsAnalyzer({ threshold: 8 });
  const report = analyzer.quickAnalyze(data);
  
  // 发送到Telegram/微信
  sendNotification('今日赔率变化分析', report);
  
  // 保存记录
  saveDailyRecord(report);
}
```

### 场景2：特定比赛跟踪
```javascript
// 跟踪曼联比赛的赔率变化
async function trackManchesterUnited() {
  const data = await fetchSgoddsData();
  const matches = extractMatches(data);
  
  const unitedMatches = matches.filter(m => 
    m.fixture.includes('Manchester United')
  );
  
  if (unitedMatches.length > 0) {
    const analysis = analyzeMatches(unitedMatches);
    if (analysis.hasSignificantChange) {
      alertUser(`曼联比赛赔率变化: ${analysis.details}`);
    }
  }
}
```

### 场景3：投注机会扫描
```javascript
// 扫描价值投注机会
async function scanValueBets() {
  const data = await fetchSgoddsData();
  const matches = extractMatches(data);
  
  const valueBets = [];
  matches.forEach(match => {
    // 计算隐含概率
    const impliedProb = {
      home: 1 / match.homeOdds,
      draw: 1 / match.drawOdds,
      away: 1 / match.awayOdds
    };
    
    // 找出概率总和 < 1 的机会（价值投注）
    const totalProb = impliedProb.home + impliedProb.draw + impliedProb.away;
    if (totalProb < 0.95) { // 存在价值
      valueBets.push({
        match,
        totalProb,
        value: (1 - totalProb) * 100 // 价值百分比
      });
    }
  });
  
  return valueBets.sort((a, b) => b.value - a.value);
}
```

## 实用代码片段

### 片段1：快速提取变化
```javascript
function getBigChanges(text, threshold = 10) {
  const regex = /(\d{2}:\d{2})([A-Za-z\s\.]+)(\d+\.\d+)\s*([+-]?\d+\.\d+%)/g;
  const matches = [];
  let match;
  
  while ((match = regex.exec(text)) !== null) {
    const change = parseFloat(match[4]);
    if (Math.abs(change) >= threshold) {
      matches.push({
        time: match[1],
        league: match[2].trim(),
        odds: parseFloat(match[3]),
        change: change
      });
    }
  }
  
  return matches;
}
```

### 片段2：生成简洁报告
```javascript
function generateBriefReport(matches, threshold) {
  let report = `发现 ${matches.length} 场比赛变化超过${threshold}%\\n\\n`;
  
  matches.forEach((m, i) => {
    report += `${i+1}. ${m.time} ${m.league}\\n`;
    report += `   赔率: ${m.odds} (变化: ${m.change > 0 ? '+' : ''}${m.change}%)\\n`;
  });
  
  report += `\\n---\\n数据来源: sgodds.com`;
  return report;
}
```

### 片段3：发送提醒
```javascript
async function sendOddsAlert(match, change) {
  const message = `🚨 赔率变化提醒\\n` +
                 `比赛: ${match.league}\\n` +
                 `时间: ${match.time}\\n` +
                 `变化: ${change > 0 ? '+' : ''}${change}%\\n` +
                 `当前赔率: ${match.odds}\\n` +
                 `\\n建议关注市场动态。`;
  
  // 发送到不同平台
  await sendToTelegram(message);
  await sendToWeChat(message);
  await sendToEmail(message);
}
```

## 配置建议

### 不同用户类型的配置
```javascript
// 新手用户 - 保守分析
const beginnerConfig = {
  threshold: 15,      // 高阈值，减少干扰
  minOdds: 1.50,      // 避免过低赔率
  maxOdds: 5.00,      // 避免过高赔率
  focusLeagues: ['English League Champ', 'Spanish League'] // 关注主流联赛
};

// 进阶用户 - 全面分析
const advancedConfig = {
  threshold: 5,       // 低阈值，捕捉所有变化
  minOdds: 1.01,      // 包含所有赔率
  maxOdds: 100,       // 包含所有赔率
  allLeagues: true,   // 分析所有联赛
  enableTrend: true,  // 启用趋势分析
  enableValue: true   // 启用价值分析
};

// 专业用户 - 深度分析
const proConfig = {
  threshold: 3,       // 极低阈值
  enableAdvanced: true,
  features: [
    'impliedProbability',
    'marketEfficiency',
    'arbitrageDetection',
    'historicalComparison',
    'predictiveModeling'
  ]
};
```

## 故障排除

### 常见问题
1. **无法获取数据**
   ```javascript
   // 尝试备用数据源
   const backupUrls = [
     'https://sgodds.com/football/current-odds',
     'https://webcache.googleusercontent.com/search?q=cache:sgodds.com',
     'https://archive.is/sgodds.com'
   ];
   ```

2. **解析失败**
   ```javascript
   // 检查数据格式
   if (!text.includes('Spanish League')) {
     console.log('数据格式可能已变化，需要更新解析逻辑');
     // 使用降级解析
     return fallbackParse(text);
   }
   ```

3. **变化计算错误**
   ```javascript
   // 验证变化计算
   function validateChanges(matches) {
     return matches.filter(m => 
       !isNaN(m.homeChange) && 
       !isNaN(m.drawChange) && 
       !isNaN(m.awayChange)
     );
   }
   ```

## 性能优化

### 大数据量处理
```javascript
// 分批处理大量比赛
async function processLargeDataset(data, batchSize = 50) {
  const matches = extractMatches(data);
  const results = [];
  
  for (let i = 0; i < matches.length; i += batchSize) {
    const batch = matches.slice(i, i + batchSize);
    const batchResult = await analyzeBatch(batch);
    results.push(...batchResult);
    
    // 进度提示
    console.log(`处理进度: ${i + batch.length}/${matches.length}`);
  }
  
  return results;
}
```

### 缓存策略
```javascript
// 实现简单缓存
const cache = {
  data: null,
  timestamp: null,
  ttl: 5 * 60 * 1000 // 5分钟
  
  async getData() {
    if (this.data && Date.now() - this.timestamp < this.ttl) {
      return this.data; // 使用缓存
    }
    
    this.data = await fetchFreshData();
    this.timestamp = Date.now();
    return this.data;
  }
};
```

## 下一步

### 学习路径
1. ✅ 掌握基本用法 - 分析单日赔率变化
2. 🔄 学习高级功能 - 趋势分析、价值识别
3. 🚀 探索扩展功能 - 自定义数据源、机器学习
4. 📊 实践项目 - 建立个人赔率监控系统

### 资源推荐
- `references/` - 参考文档和示例
- `scripts/` - 核心代码和工具
- `examples/` - 使用案例
- `tests/` - 测试代码

### 社区支持
- 查看SKILL.md获取完整文档
- 参考USAGE.md了解详细用法
- 提交Issue报告问题
- 贡献代码改进功能

---

**开始使用**: 复制上面的代码片段，修改配置，立即开始分析赔率！