# FlashScore赔率分析Skill

## 🎯 当前状态 (2026-04-17更新)

基于2026年4月17日成功查询佩纳罗尔和普拉腾斯的经验，本技能已经过优化和整理。

## 📋 已验证的成功方法

### ✅ 成功案例：佩纳罗尔和普拉腾斯球队ID查询
通过`web_fetch`工具成功找到了从FlashScore联赛页面提取球队ID的方法：

#### 1. **佩纳罗尔 (Penarol)**
- **来源页面**: https://www.flashscore.com/football/uruguay/liga-auf-uruguaya/
- **比赛链接**: `[Penarol - Juventud](/match/football/juventud-UcloL6tq/penarol-r1hkKQek/)`
- **提取的球队ID**: `r1hkKQek`
- **球队页面**: https://www.flashscore.com/team/penarol/r1hkKQek/

#### 2. **普拉腾斯 (Platense)**
- **来源页面**: https://www.flashscore.com/football/argentina/liga-profesional/
- **比赛链接**: `[Central Cordoba - Platense](/match/football/central-cordoba-santiago-del-estero-0dHZReql/platense-80MMdBdN/)`
- **提取的球队ID**: `80MMdBdN`
- **球队页面**: https://www.flashscore.com/team/platense/80MMdBdN/

## 🔧 核心脚本 (整理后)

### 📁 scripts/ 目录
```
scripts/
├── api_client.py                 # API客户端
├── complete_workflow.py          # 完整工作流程 (参考)
├── complete_workflow_new.py      # 更新版完整工作流程 ✅
├── extract_event_id.py           # 提取事件ID
├── get_odds.py                   # 获取赔率数据
├── team_id_finder_proven.py      # 基于已验证方法的球队ID查找器 ✅ 推荐
└── team_id_manager_updated.py    # 更新版球队ID管理器 ✅ 推荐
```

### 🎯 推荐使用的脚本

#### 1. **球队ID查找** - `team_id_finder_proven.py`
```bash
# 查找球队ID
python3 team_id_finder_proven.py "Penarol"

# 搜索球队
python3 team_id_finder_proven.py --search "plat"

# 列出所有已知球队
python3 team_id_finder_proven.py --list

# 手动添加球队
python3 team_id_finder_proven.py --add "Boca Juniors" "boca1234" "Argentina"
```

#### 2. **完整工作流程** - `complete_workflow_new.py`
```bash
# 完整4步工作流程
python3 complete_workflow_new.py "主队名称" "客队名称"
```

## 📊 已验证的球队ID数据库

| 球队 | FlashScore ID | 联赛 | 验证状态 |
|------|---------------|------|----------|
| Penarol | `r1hkKQek` | 乌拉圭甲级联赛 | ✅ 已验证 |
| Platense | `80MMdBdN` | 阿根廷职业联赛 | ✅ 已验证 |
| Liverpool | `lId4TMwf` | 英超联赛 | ✅ 已验证 |
| Paris Saint-Germain | `CjhkPw0k` | 法甲联赛 | ✅ 已验证 |
| Bayern Munich | `nVp0wiqd` | 德甲联赛 | ✅ 已验证 |

## 💡 重要技术发现

### 1. **正确的查询方法**
- ❌ 旧方法: 访问搜索页面 `https://www.flashscore.com/search/?q=Penarol` → 404错误
- ✅ 新方法: 访问联赛页面 → 从比赛链接提取ID

### 2. **匹配模式**
```python
# 比赛链接格式
pattern = r'\[([^\]]+)\]\s*\(/match/football/([^/]+)-([a-zA-Z0-9]{8})/([^/]+)-([a-zA-Z0-9]{8})/\)'
# 示例: [Penarol - Juventud](/match/football/juventud-UcloL6tq/penarol-r1hkKQek/)
```

### 3. **球队ID格式**
- 8个字符长度
- 大小写字母和数字混合
- 示例: `r1hkKQek`, `80MMdBdN`, `lId4TMwf`

## 📄 相关文档

1. **`UPDATE_SUMMARY.md`** - 2026-04-17更新总结
2. **`HOW_TO_UPDATE_FETCH_METHOD.md`** - 方法更新指南
3. **`UPDATES.md`** - 历史更新记录

## 🚀 快速开始

### 步骤1: 查找球队ID
```bash
cd /Users/rongyingjie/.openclaw/workspace/skills/flashscore-odds
python3 scripts/team_id_finder_proven.py "球队名称"
```

### 步骤2: 运行完整工作流程
```bash
python3 scripts/complete_workflow_new.py "主队" "客队"
```

### 步骤3: 分析赔率数据
检查生成的JSON文件，查看赔率变化和分析结果。

## 🔄 后续开发

### 短期计划
1. 扩展已验证球队数据库
2. 添加更多联赛页面支持
3. 优化缓存机制

### 长期计划
1. 集成实时赔率监控
2. 添加投注机会识别
3. 支持更多体育项目

---
**最后更新**: 2026-04-17  
**验证状态**: ✅ 佩纳罗尔和普拉腾斯查询成功  
**推荐脚本**: `team_id_finder_proven.py` + `complete_workflow_new.py`