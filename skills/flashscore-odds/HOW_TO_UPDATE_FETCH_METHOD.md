# 如何正确更新 _fetch_from_website 方法

## 📅 更新原因
基于2026年4月17日成功查询佩纳罗尔和普拉腾斯的经验，发现原来的`_fetch_from_website`方法有问题。

## 🔍 问题分析

### ❌ 原来的方法（失败）
```python
def _fetch_from_website(self, team_name):
    # 构建搜索URL
    search_url = f"https://www.flashscore.com/search/?q={requests.utils.quote(team_name)}"
    # 访问搜索页面 → 返回404或反爬虫页面
```

### ✅ 成功的方法（web_fetch）
```python
# 实际成功步骤：
1. 使用 web_fetch 工具访问联赛页面
2. URL: https://www.flashscore.com/football/uruguay/liga-auf-uruguaya/
3. 从返回内容中提取比赛链接
4. 格式: [Penarol - Juventud](/match/football/juventud-UcloL6tq/penarol-r1hkKQek/)
5. 提取球队ID: r1hkKQek
```

## 🎯 需要更新的关键点

### 1. URL 改变
- **旧**: 搜索页面 `https://www.flashscore.com/search/?q=Penarol`
- **新**: 联赛页面 `https://www.flashscore.com/football/uruguay/liga-auf-uruguaya/`

### 2. 内容解析改变
- **旧**: 尝试从搜索结果中提取球队页面链接
- **新**: 从比赛链接中提取球队ID

### 3. 匹配模式改变
- **旧模式**: `/team/[^/]+-([a-zA-Z0-9]{8})/`
- **新模式**: `\[([^\]]+)\]\s*\(/match/football/([^/]+)-([a-zA-Z0-9]{8})/([^/]+)-([a-zA-Z0-9]{8})/\)`

## 🔧 具体更新步骤

### 步骤1: 修改URL构建
```python
# 原来的
search_url = f"https://www.flashscore.com/search/?q={requests.utils.quote(team_name)}"

# 更新为：定义联赛页面列表
league_pages = {
    'uruguay': 'https://www.flashscore.com/football/uruguay/liga-auf-uruguaya/',
    'argentina': 'https://www.flashscore.com/football/argentina/liga-profesional/',
    # ... 其他联赛
}
```

### 步骤2: 修改内容解析逻辑
```python
# 原来的模式（搜索球队页面）
team_patterns = [
    rf'/team/[^/]+-([a-zA-Z0-9]{{8}})/',
    rf'/match/[^/]+/[^/]+-([a-zA-Z0-9]{{8}})/[^/]+-([a-zA-Z0-9]{{8}})/',
]

# 更新为：比赛链接模式
match_pattern = r'\[([^\]]+)\]\s*\(/match/football/([^/]+)-([a-zA-Z0-9]{8})/([^/]+)-([a-zA-Z0-9]{8})/\)'
```

### 步骤3: 修改提取逻辑
```python
# 原来的：直接匹配ID
matches = re.findall(pattern, html_content)
if matches:
    return matches[0]

# 更新为：从比赛链接中提取
matches = re.findall(match_pattern, html_content)
for match in matches:
    match_text = match[0]  # "Penarol - Juventud"
    team1_slug = match[1]  # "juventud"
    team1_id = match[2]    # "UcloL6tq"
    team2_slug = match[3]  # "penarol"
    team2_id = match[4]    # "r1hkKQek"
    
    if team_name_lower in match_text.lower():
        if team_name_lower in team1_slug.lower():
            return team1_id
        elif team_name_lower in team2_slug.lower():
            return team2_id
```

## 📋 完整更新示例

```python
def _fetch_from_website_updated(self, team_name):
    """更新版网站查询方法 - 使用联赛页面"""
    
    team_name_lower = team_name.lower()
    
    # 联赛页面列表
    league_pages = {
        'uruguay': 'https://www.flashscore.com/football/uruguay/liga-auf-uruguaya/',
        'argentina': 'https://www.flashscore.com/football/argentina/liga-profesional/',
        'england': 'https://www.flashscore.com/football/england/premier-league/',
        'spain': 'https://www.flashscore.com/football/spain/laliga/',
        'italy': 'https://www.flashscore.com/football/italy/serie-a/',
        'germany': 'https://www.flashscore.com/football/germany/bundesliga/',
        'france': 'https://www.flashscore.com/football/france/ligue-1/',
    }
    
    for league_name, league_url in league_pages.items():
        try:
            response = requests.get(league_url, headers=self.headers, timeout=15)
            if response.status_code == 200:
                html_content = response.text
                
                # 比赛链接模式
                match_pattern = r'\[([^\]]+)\]\s*\(/match/football/([^/]+)-([a-zA-Z0-9]{8})/([^/]+)-([a-zA-Z0-9]{8})/\)'
                matches = re.findall(match_pattern, html_content)
                
                for match in matches:
                    match_text = match[0]
                    team1_slug = match[1]
                    team1_id = match[2]
                    team2_slug = match[3]
                    team2_id = match[4]
                    
                    if team_name_lower in match_text.lower():
                        if team_name_lower in team1_slug.lower():
                            return team1_id
                        elif team_name_lower in team2_slug.lower():
                            return team2_id
        
        except Exception as e:
            continue
    
    return None
```

## 🎯 验证的球队ID

| 球队 | 成功提取的ID | 来源页面 | 验证状态 |
|------|-------------|----------|----------|
| Penarol | `r1hkKQek` | 乌拉圭联赛页面 | ✅ 已验证 |
| Platense | `80MMdBdN` | 阿根廷联赛页面 | ✅ 已验证 |

## 💡 使用建议

### 对于现有代码
1. 将原来的`_fetch_from_website`方法替换为更新版
2. 或者创建新方法`_fetch_from_website_updated`并修改调用

### 对于新开发
1. 使用`team_id_manager_updated.py`作为基础
2. 集成已验证的成功模式
3. 添加更多联赛页面支持

## 📈 性能考虑

### 优点
1. **更高的成功率**：联赛页面比搜索页面更稳定
2. **更好的数据质量**：从比赛链接提取的ID更准确
3. **避免反爬虫**：联赛页面的访问限制较少

### 缺点
1. **需要搜索多个页面**：可能需要尝试多个联赛
2. **依赖页面结构**：如果FlashScore改变页面结构需要更新

## 🔄 后续维护

### 定期检查
1. 联赛页面URL是否变化
2. 比赛链接格式是否变化
3. 球队ID提取逻辑是否需要调整

### 扩展支持
1. 添加更多联赛页面
2. 支持更多体育项目
3. 添加缓存机制减少请求

---
**更新总结**: 2026-04-17  
**验证状态**: ✅ 佩纳罗尔和普拉腾斯查询成功  
**推荐方法**: 使用联赛页面而非搜索页面