#!/usr/bin/env python3
"""
从联赛页面提取球队ID的专用脚本
基于2026-04-17成功查询佩纳罗尔和普拉腾斯的经验
专门用于从比赛链接中提取球队ID
"""

import re
import requests
from urllib.parse import quote

def extract_team_id_from_league_page(team_name, league_url):
    """
    从联赛页面提取球队ID
    
    Args:
        team_name: 球队名称
        league_url: 联赛页面URL
        
    Returns:
        (team_id, match_text) or (None, None)
    """
    headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Encoding': 'identity',
    }
    
    try:
        response = requests.get(league_url, headers=headers, timeout=15)
        if response.status_code != 200:
            print(f"❌ 请求失败: {league_url} - 状态码: {response.status_code}")
            return None, None
        
        html_content = response.text
        team_name_lower = team_name.lower()
        
        # 核心匹配模式：从比赛链接中提取
        # 格式: [Team A - Team B](/match/football/team-a-ID1/team-b-ID2/)
        match_pattern = r'\[([^\]]+)\]\s*\(/match/football/([^/]+)-([a-zA-Z0-9]{8})/([^/]+)-([a-zA-Z0-9]{8})/\)'
        
        matches = re.findall(match_pattern, html_content)
        
        for match in matches:
            match_text = match[0]  # 例如: "Penarol - Juventud"
            team1_slug = match[1]  # 例如: "juventud"
            team1_id = match[2]    # 例如: "UcloL6tq"
            team2_slug = match[3]  # 例如: "penarol"
            team2_id = match[4]    # 例如: "r1hkKQek"
            
            # 检查比赛文本中是否包含球队名称
            if team_name_lower in match_text.lower():
                # 确定是哪个球队
                if team_name_lower in team1_slug.lower():
                    return team1_id, match_text
                elif team_name_lower in team2_slug.lower():
                    return team2_id, match_text
        
        return None, None
        
    except Exception as e:
        print(f"❌ 请求错误: {league_url} - {e}")
        return None, None

def find_team_id_by_league_search(team_name, preferred_leagues=None):
    """
    通过搜索联赛页面查找球队ID
    
    Args:
        team_name: 球队名称
        preferred_leagues: 优先搜索的联赛列表
        
    Returns:
        dict: 包含球队ID和详细信息的字典
    """
    # 默认搜索的联赛
    if preferred_leagues is None:
        preferred_leagues = [
            ('uruguay', 'https://www.flashscore.com/football/uruguay/liga-auf-uruguaya/'),
            ('argentina', 'https://www.flashscore.com/football/argentina/liga-profesional/'),
            ('brazil', 'https://www.flashscore.com/football/brazil/serie-a/'),
            ('chile', 'https://www.flashscore.com/football/chile/primera-division/'),
            ('england', 'https://www.flashscore.com/football/england/premier-league/'),
            ('spain', 'https://www.flashscore.com/football/spain/laliga/'),
            ('italy', 'https://www.flashscore.com/football/italy/serie-a/'),
            ('germany', 'https://www.flashscore.com/football/germany/bundesliga/'),
            ('france', 'https://www.flashscore.com/football/france/ligue-1/'),
        ]
    
    print(f"🔍 搜索球队: {team_name}")
    print(f"搜索 {len(preferred_leagues)} 个联赛...")
    
    for league_name, league_url in preferred_leagues:
        print(f"  正在搜索 {league_name} 联赛...", end=' ')
        
        team_id, match_text = extract_team_id_from_league_page(team_name, league_url)
        
        if team_id:
            print(f"✅ 找到!")
            
            # 构建球队页面URL
            team_slug = team_name.lower().replace(' ', '-').replace('ñ', 'n')
            team_url = f"https://www.flashscore.com/team/{team_slug}/{team_id}/"
            
            result = {
                'team_name': team_name,
                'team_id': team_id,
                'league': league_name,
                'league_url': league_url,
                'match_text': match_text,
                'team_url': team_url,
                'found_in': league_name,
                'timestamp': '2026-04-17',  # 固定时间戳，因为是静态数据
                'method': 'league_page_extraction'
            }
            
            return result
        
        print(f"❌ 未找到")
    
    print(f"❌ 在所有联赛中未找到球队: {team_name}")
    return None

def main():
    """主函数"""
    import argparse
    
    parser = argparse.ArgumentParser(description='从联赛页面提取球队ID')
    parser.add_argument('team', help='球队名称')
    parser.add_argument('--league', help='指定联赛 (uruguay, argentina, england等)')
    parser.add_argument('--url', help='指定联赛页面URL')
    
    args = parser.parse_args()
    
    print("=" * 70)
    print("从联赛页面提取球队ID工具")
    print("基于2026-04-17成功查询佩纳罗尔和普拉腾斯的方法")
    print("=" * 70)
    
    if args.url:
        # 使用指定的URL
        league_url = args.url
        league_name = "custom"
        
        print(f"使用指定URL: {league_url}")
        team_id, match_text = extract_team_id_from_league_page(args.team, league_url)
        
        if team_id:
            print(f"\n✅ 成功找到!")
            print(f"   球队: {args.team}")
            print(f"   ID: {team_id}")
            print(f"   比赛: {match_text}")
            print(f"   来源: {league_url}")
            
            team_slug = args.team.lower().replace(' ', '-').replace('ñ', 'n')
            team_url = f"https://www.flashscore.com/team/{team_slug}/{team_id}/"
            print(f"   球队页面: {team_url}")
        else:
            print(f"\n❌ 未找到球队: {args.team}")
    
    elif args.league:
        # 使用指定的联赛
        league_map = {
            'uruguay': 'https://www.flashscore.com/football/uruguay/liga-auf-uruguaya/',
            'argentina': 'https://www.flashscore.com/football/argentina/liga-profesional/',
            'brazil': 'https://www.flashscore.com/football/brazil/serie-a/',
            'chile': 'https://www.flashscore.com/football/chile/primera-division/',
            'england': 'https://www.flashscore.com/football/england/premier-league/',
            'spain': 'https://www.flashscore.com/football/spain/laliga/',
            'italy': 'https://www.flashscore.com/football/italy/serie-a/',
            'germany': 'https://www.flashscore.com/football/germany/bundesliga/',
            'france': 'https://www.flashscore.com/football/france/ligue-1/',
        }
        
        if args.league not in league_map:
            print(f"❌ 不支持的联赛: {args.league}")
            print(f"支持的联赛: {', '.join(league_map.keys())}")
            return
        
        league_url = league_map[args.league]
        print(f"搜索 {args.league} 联赛...")
        
        team_id, match_text = extract_team_id_from_league_page(args.team, league_url)
        
        if team_id:
            print(f"\n✅ 成功找到!")
            print(f"   球队: {args.team}")
            print(f"   ID: {team_id}")
            print(f"   比赛: {match_text}")
            print(f"   联赛: {args.league}")
            print(f"   来源: {league_url}")
            
            team_slug = args.team.lower().replace(' ', '-').replace('ñ', 'n')
            team_url = f"https://www.flashscore.com/team/{team_slug}/{team_id}/"
            print(f"   球队页面: {team_url}")
        else:
            print(f"\n❌ 在 {args.league} 联赛中未找到球队: {args.team}")
    
    else:
        # 自动搜索所有联赛
        result = find_team_id_by_league_search(args.team)
        
        if result:
            print(f"\n{'='*70}")
            print(f"✅ 搜索完成!")
            print(f"{'='*70}")
            print(f"球队: {result['team_name']}")
            print(f"ID: {result['team_id']}")
            print(f"联赛: {result['league']}")
            print(f"比赛: {result['match_text']}")
            print(f"球队页面: {result['team_url']}")
            print(f"来源: {result['league_url']}")
            print(f"方法: {result['method']}")
        else:
            print(f"\n❌ 在所有联赛中未找到球队: {args.team}")
            print(f"\n💡 建议:")
            print(f"1. 检查球队名称拼写")
            print(f"2. 使用 --league 参数指定联赛")
            print(f"3. 使用 --url 参数指定联赛页面URL")
            print(f"4. 手动访问FlashScore搜索")


if __name__ == "__main__":
    main()