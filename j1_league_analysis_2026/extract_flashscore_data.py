#!/usr/bin/env python3
"""
提取FlashScore比赛数据
"""

import re
from datetime import datetime

def extract_match_data(html_content):
    """
    从HTML内容中提取比赛数据
    """
    # 查找数据块
    pattern = r'data:\s*"([^"]+)"'
    match = re.search(pattern, html_content)
    
    if not match:
        print("未找到数据块")
        return None
    
    data_text = match.group(1)
    
    # 保存原始数据
    with open('flashscore_data_raw.txt', 'w', encoding='utf-8') as f:
        f.write(data_text)
    
    print(f"已提取数据，大小: {len(data_text)} 字符")
    return data_text

def quick_parse(data_text, team_filter=None):
    """
    快速解析数据，可筛选特定球队
    """
    matches = []
    
    # 查找所有比赛
    match_pattern = r'AA÷([^~]+)~'
    match_entries = re.findall(match_pattern, data_text)
    
    for entry in match_entries:
        # 提取基本信息
        home_match = re.search(r'AE÷([^¬]+)', entry)
        away_match = re.search(r'AF÷([^¬]+)', entry)
        time_match = re.search(r'AD÷(\d+)', entry)
        at_match = re.search(r'AT÷(\d+)', entry)  # 主队常规比分
        au_match = re.search(r'AU÷(\d+)', entry)  # 客队常规比分
        
        if not (home_match and away_match and at_match and au_match):
            continue
        
        home_team = home_match.group(1)
        away_team = away_match.group(1)
        
        # 球队筛选
        if team_filter:
            if team_filter.lower() not in home_team.lower() and team_filter.lower() not in away_team.lower():
                continue
        
        score = f"{at_match.group(1)}-{au_match.group(1)}"
        
        if time_match:
            timestamp = int(time_match.group(1))
            time_str = datetime.fromtimestamp(timestamp).strftime('%Y-%m-%d %H:%M')
        else:
            time_str = "未知"
        
        matches.append({
            'time': time_str,
            'home': home_team,
            'away': away_team,
            'score': score
        })
    
    return matches

def main():
    """主函数"""
    print("FlashScore数据提取工具")
    print("=" * 60)
    
    # 检查是否有数据文件
    try:
        with open('flashscore_data_raw.txt', 'r', encoding='utf-8') as f:
            data_text = f.read()
        print(f"已加载现有数据，大小: {len(data_text)} 字符")
    except FileNotFoundError:
        print("未找到数据文件，请先运行提取功能")
        data_text = None
    
    if data_text:
        # 快速解析示例
        print("\n快速解析示例:")
        print("-" * 60)
        
        # 查找名古屋鲸八的比赛
        nagoya_matches = quick_parse(data_text, 'Nagoya')
        print(f"名古屋鲸八相关比赛 ({len(nagoya_matches)}场):")
        for match in nagoya_matches[:5]:  # 只显示前5场
            print(f"  {match['time']} {match['home']} {match['score']} {match['away']}")
        
        # 查找大阪樱花的比赛
        cerezo_matches = quick_parse(data_text, 'Cerezo')
        print(f"\n大阪樱花相关比赛 ({len(cerezo_matches)}场):")
        for match in cerezo_matches[:5]:
            print(f"  {match['time']} {match['home']} {match['score']} {match['away']}")

if __name__ == "__main__":
    main()