# Match Details Skill

一个用于获取足球比赛详细数据的OpenClaw技能，特别针对titan007.com体育数据平台。

## 功能概述

这个技能提供完整的足球比赛数据分析流程：

1. **球队搜索** - 通过球队名称搜索球队ID
2. **赛程获取** - 获取球队的完整比赛赛程
3. **比赛详情** - 获取具体比赛的详细统计数据
4. **综合分析** - 生成包含球队信息、赛程、比赛详情的综合报告

## 快速开始

### 安装依赖
```bash
cd /Users/rongyingjie/.openclaw/workspace/skills/match-details
npm init -y
# 无需额外依赖，使用Node.js内置模块
```

### 基本使用

#### 1. 搜索球队
```bash
node scripts/search_team.js "华奇巴托"
```

#### 2. 获取球队赛程
```bash
node scripts/get_schedule.js 1055 --limit 5 --time recent
```

#### 3. 获取比赛详情
```bash
node scripts/get_match_details.js 2921125 --level full
```

#### 4. 完整分析流程
```bash
node scripts/match_analyzer.js "华奇巴托" --limit 3 --level summary
```

### 在OpenClaw中使用

当用户询问球队比赛信息时，这个技能会自动激活。例如：

```
用户: 获取华奇巴托的比赛详情
```

技能将执行以下流程：
1. 搜索"华奇巴托"获取球队ID
2. 获取球队最近赛程
3. 获取最近一场比赛的详细数据
4. 生成综合报告

## 脚本说明

### 核心脚本

| 脚本文件 | 功能 | 参数 |
|---------|------|------|
| `search_team.js` | 搜索球队ID | `球队名称` |
| `get_schedule.js` | 获取球队赛程 | `球队ID [--limit N] [--time range]` |
| `get_match_details.js` | 获取比赛详情 | `比赛ID [--level summary/full]` |
| `match_analyzer.js` | 完整分析流程 | `球队名称 [选项]` |

### 辅助脚本

| 脚本文件 | 功能 |
|---------|------|
| `example_usage.js` | 使用示例 |
| (计划) `test_scripts.js` | 单元测试 |

## 选项说明

### match_analyzer.js 选项

| 选项 | 说明 | 默认值 | 示例 |
|------|------|--------|------|
| `--match ID` | 指定比赛ID | 最近一场 | `--match 2921125` |
| `--limit N` | 显示比赛数量 | 5 | `--limit 10` |
| `--time range` | 时间范围 | recent | `--time all` |
| `--level level` | 详细级别 | summary | `--level full` |
| `--format format` | 输出格式 | text | `--format json` |

### 时间范围选项
- `recent` - 最近比赛（默认）
- `all` - 所有比赛
- `upcoming` - 未来比赛

### 详细级别
- `summary` - 摘要信息（默认）
- `full` - 完整详细信息

## 输出格式

### 文本格式（默认）
```
⚽ 华奇巴托 比赛分析报告
============================================================

📊 球队信息
   名称: 华奇巴托
   ID: 1055
   联赛: 智利甲级联赛
   匹配精度: 精确

🗓️ 近期赛程 (显示 3/46 场)
   1. 2026-04-07 08:00 华奇巴托 vs 康塞普西翁大学 - 5-1 ✅
   2. 2026-04-02 05:00 科洛科洛 vs 华奇巴托 - 1-0 ❌
   3. 2026-03-26 05:00 华奇巴托 vs 科金博 - 0-1 ❌

🔍 比赛分析 - ID: 2921125
   时间: 2026-04-07 08:00
   比分: 5-1
   半场: 1-1

📈 关键统计数据
   射门: 18 ← 16
   射正: 12 ← 5
   控球率: 46% → 54%
   角球: 2 → 3
   犯规: 15 → 9
   黄牌: 3   3
   预期进球(xG): 2.00 ← 0.95

🎯 进球时间线
   6' ⚽ 乌尔兹
   37' ⚽ 圣地亚哥.席尔瓦
   67' ⚽ 尼古拉巴尔加斯
   70' ⚽ C·马丁内斯
   79' ⚽ 维贾尔
   83' ⚽ 塞普尔维达

📊 比赛事件: 20 个事件记录

💡 分析洞察
   1. 射门准确率: 主队 67% vs 客队 31%
   2. 主队在控球率劣势的情况下取得胜利，显示高效反击
   3. 犯规-黄牌转化率: 主队 0.20 vs 客队 0.33
   4. 进球分布: 上半场 2球，下半场 4球
   5. 下半场进球明显多于上半场，显示球队后劲十足

⏰ 报告生成时间: 2026/4/8 下午11:45:00
📱 数据来源: titan007.com
============================================================
```

### JSON格式
```json
{
  "success": true,
  "teamInfo": {
    "id": 1055,
    "name": "华奇巴托",
    "league": "智利甲级联赛",
    "exactMatch": true
  },
  "scheduleSummary": {
    "totalMatches": 46,
    "displayedMatches": 3,
    "recentMatches": [
      {
        "time": "2026-04-07 08:00",
        "vs": "华奇巴托 vs 康塞普西翁大学",
        "score": "5-1",
        "status": "已结束"
      }
    ]
  },
  "matchAnalysis": {
    "matchId": "2921125",
    "basicInfo": {
      "strTime": "2026-04-07 08:00",
      "fullTimeScore": "5-1",
      "halfTimeScore": "1-1"
    }
  }
}
```

## 数据源

### 主要API端点
1. **球队搜索**: `https://ba2.titan007.com/homepage/multisearch?keyword={球队名称}&type=0`
2. **球队信息**: `https://zq.titan007.com/cn/team/Summary/{teamId}.html`
3. **球队赛程**: `https://zq.titan007.com/cn/team/TeamSche/{teamId}.html`
4. **比赛详情**: `https://live.titan007.com/detail/{matchId}cn.htm`

### 数据文件
- 球队详细数据: `/jsData/teamInfo/teamDetail/tdl{teamId}.js`
- 联赛数据: `/jsData/teamInfo/team{leagueId}.js`

## 错误处理

### 常见错误及解决方案

| 错误 | 可能原因 | 解决方案 |
|------|----------|----------|
| 球队未找到 | 名称拼写错误 | 检查拼写，尝试别名 |
| 网络请求失败 | 网络问题或API限制 | 重试，使用缓存数据 |
| 数据解析失败 | 页面结构变化 | 更新解析逻辑 |
| 比赛ID无效 | 比赛不存在或已删除 | 验证比赛ID |

### 降级策略
1. 使用简化数据提取
2. 提供部分数据而非完全失败
3. 提示用户手动检查
4. 使用缓存数据

## 集成示例

### 在OpenClaw技能中调用
```javascript
const { analyzeMatch } = require('./scripts/match_analyzer.js');

async function handleUserRequest(teamName) {
  try {
    const result = await analyzeMatch(teamName, {
      limit: 3,
      detailLevel: 'summary'
    });
    
    if (result.success) {
      // 生成用户友好的回复
      return formatForUser(result.report);
    } else {
      return `抱歉，找不到关于"${teamName}"的信息。`;
    }
  } catch (error) {
    return '查询过程中出现错误，请稍后重试。';
  }
}
```

### 定时任务
```javascript
// 每天获取特定球队的最新比赛
const schedule = require('node-schedule');

schedule.scheduleJob('0 9 * * *', async () => {
  const result = await analyzeMatch('华奇巴托', { limit: 1 });
  if (result.success) {
    sendNotification(result.report);
  }
});
```

## 性能优化

### 缓存策略
```javascript
// 简单的内存缓存
const cache = new Map();

async function getCachedAnalysis(teamName, options) {
  const cacheKey = `${teamName}:${JSON.stringify(options)}`;
  
  if (cache.has(cacheKey)) {
    const cached = cache.get(cacheKey);
    if (Date.now() - cached.timestamp < 30 * 60 * 1000) { // 30分钟缓存
      return cached.data;
    }
  }
  
  const result = await analyzeMatch(teamName, options);
  cache.set(cacheKey, {
    data: result,
    timestamp: Date.now()
  });
  
  return result;
}
```

### 批量处理
```javascript
// 批量获取多个球队信息
async function batchAnalyze(teamNames) {
  const results = [];
  
  for (const teamName of teamNames) {
    const result = await analyzeMatch(teamName, { limit: 1 });
    results.push({
      team: teamName,
      success: result.success,
      data: result.success ? result.report : null
    });
    
    // 避免请求过于频繁
    await sleep(1000);
  }
  
  return results;
}
```

## 扩展开发

### 添加新功能
1. **球员统计**: 获取球员个人数据
2. **联赛排名**: 获取联赛积分榜
3. **实时数据**: 获取进行中比赛的实时数据
4. **历史对比**: 对比不同赛季的数据
5. **预测分析**: 基于历史数据的比赛预测

### 支持新数据源
1. 添加其他体育数据网站的解析器
2. 支持API密钥认证的数据源
3. 集成官方联赛数据API

## 维护指南

### 定期检查
1. **API变化**: 每月检查titan007.com的API和页面结构
2. **数据格式**: 验证数据解析逻辑是否仍然有效
3. **性能监控**: 监控脚本执行时间和成功率
4. **错误日志**: 分析常见错误并优化处理

### 更新日志
- **v1.0.0** (2026-04-08): 初始版本，基础功能
- **v1.1.0** (计划): 添加缓存和性能优化
- **v1.2.0** (计划): 支持更多数据源
- **v1.3.0** (计划): 添加预测分析功能

## 许可证

本项目基于MIT许可证开源。

## 贡献指南

欢迎提交Issue和Pull Request来改进这个技能。

1. Fork项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建Pull Request

## 联系

如有问题或建议，请通过OpenClaw社区联系。

---

**注意**: 本技能获取的数据仅供参考，体育比赛结果具有不确定性，请理性对待分析结果。