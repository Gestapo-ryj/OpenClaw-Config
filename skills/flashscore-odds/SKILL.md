# FlashScore赔率分析Skill

## 描述
从FlashScore获取足球比赛赔率的完整4步工作流程：
1. 查找球队ID
2. 构造比赛URL
3. 提取比赛ID (eventId)
4. 获取赔率数据

## 已验证的工作流程
- ✅ 利物浦 vs 巴黎圣日耳曼 (2026-04-16)
- ✅ 莱万特 vs 赫塔菲 (测试API)

## 核心脚本
- `complete_workflow.py` - 完整4步流程
- `get_odds.py` - 获取赔率
- `extract_event_id.py` - 提取eventId
- `find_team_id.py` - 查找球队ID
- `flashscore_cli.py` - 命令行工具

## 使用方法
```bash
# 完整流程
python scripts/complete_workflow.py

# 命令行工具
python scripts/flashscore_cli.py --help

# 快速获取赔率
python scripts/flashscore_cli.py --event OdLTIvyf
```

## 技术要点
- API端点: https://global.ds.lsapp.eu/odds/pq_graphql
- 关键参数: eventId, bookmakerId, betType, betScope
- 反爬虫: Accept-Encoding: identity
- 数据格式: JSON

## 创建时间
2026-04-16 (基于实际验证的工作流程)
