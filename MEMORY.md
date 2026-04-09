# MEMORY.md - 长期记忆

## 技能记忆

### Odds Analyzer Skill
- **路径:** /Users/rongyingjie/.openclaw/workspace/skills/odds-analyzer/SKILL.md
- **用途:** 快速分析足球比赛赔率，识别重要变化、趋势和投注机会，特别适用于sgodds.com数据。
- **核心功能:**
    1.  赔率数据提取 (从HTML内容中解析比赛时间、联赛、赔率、变化百分比)
    2.  变化分析 (找出变化超过阈值，默认10%的赔率选项，计算最大/最小变化，识别趋势)
    3.  机会识别 (找出赔率与概率不匹配、市场过度反应或价值投注机会)
    4.  报告生成 (生成易读的总结报告，包括高风险比赛、最大变化、趋势分析)
- **配置:** 可调整 `threshold` (变化阈值), `timeRange`, `leagues`, `oddsType`, `outputDetail`, `excludeWomen` (默认排除女足比赛) 等参数。
- **注意事项:** 赔率分析仅供参考，投注有风险，需理性对待。

## 用户偏好和兴趣 (2026-04-06)
- 用户对足球比赛赔率分析有浓厚兴趣，经常询问当天比赛的赔率和变化。
- 希望获得球队信息作为赔率分析的补充。
- 位于新加坡巴西立（Pasir Ris）地区。

## 技术问题记录
- 之前遇到过网关配对问题（"gateway closed (1008): pairing required"）。
- odds-analyzer在解析sgodds.com数据时可能遇到格式问题，需要优化解析逻辑。
- Gemini搜索API可能遇到配额限制。

## 后续建议
- 修复odds-analyzer的数据解析问题，增加多源数据验证。
- 提醒用户手动修复网关连接以切换模型。
- 可基于用户位置提供更精准的本地服务推荐。
