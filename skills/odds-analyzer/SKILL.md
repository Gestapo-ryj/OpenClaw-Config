# Odds Analyzer Skill

## Purpose
快速分析足球比赛赔率，识别重要变化、趋势和投注机会。特别适用于新加坡博彩公司(sgodds.com)和其他赔率数据源。

## When to Use
- 用户询问比赛赔率分析
- 需要找出赔率变化超过特定阈值（如10%）的比赛
- 需要比较不同比赛的赔率趋势
- 需要识别投注市场中的异常或机会

## Input Requirements
1. **赔率数据源**：可以是sgodds.com页面内容、API响应或结构化的赔率数据
2. **分析参数**（可选）：
   - 变化阈值（默认10%）
   - 时间范围（如特定日期）
   - 联赛筛选
   - 赔率类型（1X2、亚洲盘等）

## Core Functions

### 1. 赔率数据提取
```javascript
// 从sgodds.com页面提取结构化数据
extractOddsData(htmlContent) {
  // 解析比赛时间、联赛、赔率、变化百分比
  // 返回结构化数组
}
```

### 2. 变化分析
```javascript
analyzeOddsChanges(oddsData, threshold = 10) {
  // 找出变化超过阈值的赔率选项
  // 计算最大/最小变化
  // 识别趋势（一致上升/下降）
}
```

### 3. 机会识别
```javascript
identifyOpportunities(oddsData) {
  // 找出赔率与概率不匹配的比赛
  // 识别市场过度反应
  // 找出价值投注机会
}
```

### 4. 报告生成
```javascript
generateReport(analysisResults) {
  // 生成易读的总结报告
  // 包括：高风险比赛、最大变化、趋势分析
}
```

## Workflow

### 步骤1：获取赔率数据
1. 访问sgodds.com/football/current-odds
2. 或使用其他赔率数据源
3. 提取比赛列表和赔率信息

### 步骤2：数据清洗和结构化
1. 解析比赛时间、联赛、对阵
2. 提取主胜、平局、客胜赔率
3. 提取变化百分比（如有）
4. 转换为结构化JSON

### 步骤3：获取球队信息 (增强)
1. **数据源整合**：由于sgodds.com不直接提供对阵球队名称，需要通过以下方式获取：
   - 使用 `web_search` 搜索 "[时间] [联赛] 比赛对阵"（如 "22:00 Indian S League 今天比赛"）
   - 访问体育新闻网站（如flashscore.com）获取赛程信息
   - 使用专门的体育数据API（如有）
2. **匹配策略**：
   - 根据比赛时间和联赛进行精确匹配
   - 对于知名联赛（英超、西甲、德甲等），搜索结果通常更准确
   - 对于较小联赛，可能需要结合多个信息源验证
3. **信息补充**：
   - 获取球队基本信息（如近期状态、伤病情况、历史交锋）
   - 验证对阵信息的准确性（避免匹配错误）
4. **降级方案**：如果无法获取球队信息，在报告中明确标注"球队信息缺失"，仅提供时间和联赛分析。

### 步骤4：分析执行
1. 计算每个赔率选项的变化
2. 应用阈值筛选（默认10%）
3. 识别异常变化模式
4. 趋势分析（联赛、时间维度）

### 步骤5：结果呈现
1. 列出变化超过阈值的比赛，并附带球队信息（如果能获取到）。
2. 突出显示最大变化。
3. 提供简要分析。
4. 可选：风险提示。

## Output Format

### 标准报告结构
```
## 赔率分析报告 - [日期]

### 📊 统计数据
- 总比赛场次: XX
- 分析比赛: XX
- 超过阈值: XX
- 数据更新时间: [时间]

### 🔍 重点关注比赛
1. **[时间] [联赛] - [主队] vs [客队]**
   - **赔率**: 主胜 X.XX (变化: ±X.X%) | 平 X.XX (变化: ±X.X%) | 客胜 X.XX (变化: ±X.X%)
   - **分析**: [基于赔率变化的简要分析]
   - **球队信息**: [如能获取：近期状态、伤病、历史交锋等]

### 📈 最大变化
- **最大上升**: [时间] [联赛] - [主队] vs [客队] ([选项] +XX%)
- **最大下降**: [时间] [联赛] - [主队] vs [客队] ([选项] -XX%)

### 🎯 趋势观察
1. [观察1]
2. [观察2]

### ⚠️ 风险提示
- [提示1]
- [提示2]
```

### 详细分析（可选）
```
## 详细数据

### 按联赛分组
[联赛1]:
- [比赛1]: 赔率 1/X/2, 变化 -A%/+B%/-C%
- [比赛2]: ...

### 按时间分组
[时段1]:
- [比赛1]: ...
```

## Examples

### 示例1：基本分析（含球队信息）
```
用户: 分析今天比赛赔率，找出变化超过10%的

技能执行:
1. 使用 web_fetch 抓取 https://sgodds.com/football/current-odds 获取赔率数据
2. 解析数据，提取时间、联赛、赔率、变化百分比
3. 对于变化超过10%的比赛，使用 web_search 搜索球队对阵信息
   - 示例搜索: "22:00 Indian S League 今天比赛 对阵"
   - 示例搜索: "01:00 Norwegian League 对阵 4月8日"
4. 整合赔率数据和球队信息
5. 生成包含统计、重点关注比赛（含球队）、最大变化的报告

输出示例:
## 赔率分析报告 - 2026年4月7日

### 📊 统计数据
- 总比赛场次: 37
- 变化超过10%的比赛: 4
- 数据更新时间: 2026-04-07 23:10:38

### 🔍 重点关注比赛
1. **22:00 Indian S League - Tampines Rovers vs Albirex Niigata (S)**
   - **赔率**: 主胜 1.60 (变化: -8.6%) | 平 3.40 (变化: +6.2%) | 客胜 4.70 (变化: +23.7%)
   - **分析**: 客胜赔率大幅上升23.7%，市场对客队信心显著下降
   - **球队信息**: Tampines主场表现稳定，Albirex近期状态下滑

2. **01:00 Norwegian League - Rosenborg vs Molde**
   - **赔率**: 主胜 2.40 (变化: -12.7%) | 平 3.40 | 客胜 2.40 (变化: +11.6%)
   - **分析**: 主胜赔率大幅下降，客胜赔率大幅上升，市场预期显著转变
   - **球队信息**: Rosenborg主场强势，Molde客场表现不稳定
...
```

### 示例2：特定联赛分析
```
用户: 分析英格兰冠军联赛的赔率变化

技能执行:
1. 获取赔率数据
2. 使用 leagueFilter: 'English League Champ' 筛选
3. 分析英冠比赛变化趋势
4. 输出联赛特定报告，包括:
   - 英冠比赛总数
   - 平均变化幅度
   - 最受关注比赛
   - 投注趋势分析
```

### 示例3：实时监控
```
用户: 监控特定比赛的赔率变化，超过15%时提醒

技能执行:
1. 定期获取赔率数据（如每30分钟）
2. 跟踪特定比赛ID或对阵
3. 计算实时变化
4. 当变化超过15%时发送提醒:
   - 比赛信息
   - 变化详情
   - 可能原因分析
   - 建议关注点
```

### 示例4：历史对比分析
```
用户: 比较今天和昨天的赔率变化模式

技能执行:
1. 获取今天和昨天的赔率数据
2. 分析变化趋势对比:
   - 总体变化幅度比较
   - 联赛分布变化
   - 时间段变化模式
   - 异常变化识别
3. 输出对比报告:
   - 相同点/不同点
   - 趋势预测
   - 风险提示
```

### 示例5：价值投注识别
```
用户: 找出赔率与概率不匹配的比赛

技能执行:
1. 获取赔率数据
2. 计算隐含概率: 1/赔率
3. 识别异常:
   - 赔率过高（价值被低估）
   - 赔率过低（过热投注）
   - 市场过度反应
4. 输出价值投注机会:
   - 比赛推荐
   - 赔率合理性分析
   - 风险收益评估
   - 建议投注策略
```

## Configuration

### 默认参数
```yaml
threshold: 10  # 变化阈值百分比
timeRange: "today"  # 时间范围
leagues: "all"  # 联赛筛选
oddsType: "1X2"  # 赔率类型
outputDetail: "summary"  # 输出详细程度
excludeWomen: true  # 默认排除女足比赛
```

### 可调整参数
- `threshold`: 变化阈值（5-20%）
- `minOdds`: 最低赔率过滤
- `maxOdds`: 最高赔率过滤
- `timeFilter`: 特定时间段
- `leagueFilter`: 特定联赛
- `excludeWomen`: 是否排除女足比赛（true/false）

## Error Handling

### 常见错误
1. **数据源不可用**: 尝试备用源或缓存数据
2. **解析失败**: 检查HTML结构变化，调整解析逻辑
3. **数据不完整**: 标记不完整数据，继续处理其他
4. **网络问题**: 重试机制，超时处理

### 降级方案
1. 使用最后一次成功获取的数据
2. 提供简化分析（仅基本统计）
3. 提示用户手动检查

## Integration

### 与其他技能结合
1. **比赛信息技能**: 获取球队状态、伤病信息
2. **统计技能**: 历史数据、概率计算
3. **提醒技能**: 设置赔率变化提醒
4. **web_search技能**: 搜索球队对阵和新闻信息
5. **web_fetch技能**: 抓取体育网站赛程数据

### 数据获取流程优化
```javascript
// 获取赔率数据 + 球队信息的完整流程
async function getCompleteOddsAnalysis() {
  // 1. 获取赔率数据
  const oddsData = await fetchSgoddsData();
  
  // 2. 分析赔率变化，找出重点关注比赛
  const significantMatches = analyzeOddsChanges(oddsData, threshold = 10);
  
  // 3. 为每场重点关注比赛获取球队信息
  for (const match of significantMatches) {
    // 构建搜索查询: 时间 + 联赛 + "对阵"
    const searchQuery = `${match.time} ${match.league} 对阵`;
    
    // 使用 web_search 获取球队信息
    const teamInfo = await searchTeamInfo(searchQuery, match.date);
    
    // 整合数据
    match.teams = teamInfo;
  }
  
  // 4. 生成完整报告
  return generateReportWithTeams(significantMatches);
}
```

### 数据存储
```javascript
// 可选：保存分析结果
saveAnalysis(results) {
  // 保存到本地文件或数据库
  // 用于趋势分析和历史比较
}
```

## Best Practices

### 分析建议
1. **关注一致性**: 多个赔率选项同时大幅变化更值得关注
2. **考虑时间**: 临近比赛开始的变化通常更有意义
3. **结合背景**: 赔率变化需要结合球队新闻、伤病等信息
4. **风险管理**: 大变化可能意味着高风险或高机会

### 呈现建议
1. **突出重点**: 用颜色/符号标记重要变化
2. **提供上下文**: 解释变化可能的原因
3. **保持客观**: 提供数据，让用户自己做决定
4. **明确限制**: 说明分析的局限性

## Maintenance

### 定期检查
1. 数据源结构变化
2. 赔率格式更新
3. 新联赛支持
4. 分析算法优化
5. 球队信息获取渠道更新

## 新增功能：新球体育球队搜索

### 5. 球队ID搜索功能
```javascript
// 搜索球队ID
searchTeamId(teamName) {
  // 使用新球体育(titan007.com)API搜索球队
  // 返回球队ID、名称、队徽等信息
}
```

### 工作流程优化

#### 步骤3增强：获取球队ID和信息
1. **直接API搜索**: 使用新球体育的MultiSearchResult API直接搜索球队
2. **精确匹配**: 根据比赛时间和联赛信息，在新球体育平台搜索对应球队
3. **ID获取**: 提取球队ID用于后续数据查询
4. **信息整合**: 将球队ID、名称、队徽等信息整合到赔率分析中

#### 新增搜索脚本：search_team.js
```javascript
// 主要功能
const searcher = new TeamSearcher();
const result = await searcher.searchTeam('科尔多瓦学院');
const teamId = searcher.getMainTeamId(result); // 返回731
```

#### 示例：完整赔率分析+球队信息流程
```javascript
async function getCompleteOddsAnalysisWithTeamIds() {
  // 1. 获取赔率数据
  const oddsData = await fetchSgoddsData();
  
  // 2. 分析赔率变化
  const significantMatches = analyzeOddsChanges(oddsData, threshold = 10);
  
  // 3. 为每场比赛搜索球队ID
  const searcher = new TeamSearcher();
  for (const match of significantMatches) {
    // 根据联赛和上下文推断球队名称
    const teamName = inferTeamNameFromLeague(match.league, match.time);
    
    // 搜索球队ID
    const searchResult = await searcher.searchTeam(teamName);
    const teamId = searcher.getMainTeamId(searchResult);
    
    // 整合数据
    match.teamId = teamId;
    match.teamInfo = searchResult;
  }
  
  // 4. 生成包含球队ID的报告
  return generateReportWithTeamIds(significantMatches);
}
```

### 优势
1. **直接可靠**: 直接从新球体育获取官方球队ID
2. **信息完整**: 获取球队名称、队徽、相关比赛等完整信息
3. **效率高**: 避免通用搜索的不确定性
4. **可扩展**: 支持批量搜索和缓存机制

### 使用示例
```javascript
// 基本使用
const searcher = new TeamSearcher();
const result = await searcher.searchTeam('科尔多瓦学院');
console.log(searcher.generateSearchReport(result));

// 获取主要球队ID
const teamId = searcher.getMainTeamId(result); // 731

// 批量搜索
const teams = ['科尔多瓦学院', '博卡青年', '河床'];
const results = await searcher.batchSearchTeams(teams);
```

### 输出格式
```
## 🔍 球队搜索结果

**搜索球队**: 科尔多瓦学院
**找到球队**: 5 个
**相关比赛**: 1 场

### 📋 球队列表
1. **科尔多瓦学院** 🏆
   - **球队ID**: 731
   - **详情页**: https://zq.titan007.com/cn/team/Summary/731.html
   - **队徽**: https://zq.titan007.com/Image/team/images/731/1kng7c0ymw1s.png

### 🎯 主要球队ID
**科尔多瓦学院** 的球队ID是: **731**

**使用示例**:
- 球队主页: https://zq.titan007.com/cn/team/Summary/731.html
- 球队赛程: https://zq.titan007.com/cn/team/Schedule/731.html
- 球队数据: https://zq.titan007.com/cn/team/Data/731.html
```

### 更新日志
- v1.0: 基础赔率变化分析
- v1.1: 增加趋势识别
- v1.2: 添加机会识别功能
- v1.3: 优化报告格式
- v1.4: 增强球队信息获取功能
   - 新增通过web_search获取球队对阵信息
   - 改进报告模板，包含完整的球队信息字段
   - 优化数据整合流程
- v1.5: 新增新球体育球队搜索功能
   - 新增search_team.js脚本
   - 支持直接搜索球队ID
   - 提供完整的球队信息报告
   - 支持批量搜索功能

---

**Note**: 赔率分析仅供参考，投注有风险，请理性对待。

**数据限制说明**:
1. sgodds.com 不直接提供对阵球队名称，需要通过其他渠道获取
2. 球队信息获取的准确性取决于搜索结果的可靠性
3. 对于较小联赛，可能无法获取准确的球队信息
4. 新球体育搜索功能依赖于该平台的API稳定性