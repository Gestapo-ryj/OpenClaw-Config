#!/usr/bin/env python3
"""
改进版球队ID查找脚本
使用从联赛页面提取比赛链接的方法
基于2026-04-17成功查询佩纳罗尔和普拉腾斯的经验
"""

import sys
import os
import json
import re
import requests
from datetime import datetime
from urllib.parse import quote

class ImprovedTeamIDFinder:
    """改进版球队ID查找器"""
    
    def __init__(self, db_file="team_id_database_improved.json"):
        """初始化"""
        self.db_file = db_file
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Encoding': 'identity',
        }
        
        # 加载数据库
        self.database = self._load_database()
        
        # 已知的联赛页面（用于搜索）
        self.league_pages = {
            # 南美联赛
            'uruguay': 'https://www.flashscore.com/football/uruguay/liga-auf-uruguaya/',
            'argentina': 'https://www.flashscore.com/football/argentina/liga-profesional/',
            'brazil': 'https://www.flashscore.com/football/brazil/serie-a/',
            'chile': 'https://www.flashscore.com/football/chile/primera-division/',
            
            # 欧洲主要联赛
            'england': 'https://www.flashscore.com/football/england/premier-league/',
            'spain': 'https://www.flashscore.com/football/spain/laliga/',
            'italy': 'https://www.flashscore.com/football/italy/serie-a/',
            'germany': 'https://www.flashscore.com/football/germany/bundesliga/',
            'france': 'https://www.flashscore.com/football/france/ligue-1/',
        }
    
    def _load_database(self):
        """加载数据库"""
        if os.path.exists(self.db_file):
            try:
                with open(self.db_file, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except:
                return {}
        return {}
    
    def _save_database(self):
        """保存数据库"""
        try:
            with open(self.db_file, 'w', encoding='utf-8') as f:
                json.dump(self.database, f, indent=2, ensure_ascii=False)
            print(f"💾 数据库已保存: {self.db_file}")
        except Exception as e:
            print(f"❌ 保存数据库失败: {e}")
    
    def _fetch_page(self, url):
        """获取页面内容"""
        try:
            response = requests.get(url, headers=self.headers, timeout=15)
            if response.status_code == 200:
                return response.text
            else:
                print(f"❌ 请求失败: {url} - 状态码: {response.status_code}")
        except Exception as e:
            print(f"❌ 请求错误: {url} - {e}")
        return None
    
    def _extract_team_id_from_match_links(self, html_content, team_name):
        """
        从比赛链接中提取球队ID
        基于成功查询佩纳罗尔和普拉腾斯的方法
        """
        if not html_content:
            return None
        
        # 将球队名称转换为小写用于搜索
        team_name_lower = team_name.lower()
        
        # 模式1: 比赛链接格式 [Team A - Team B](/match/football/team-a-ID1/team-b-ID2/)
        # 示例: [Penarol - Juventud](/match/football/juventud-UcloL6tq/penarol-r1hkKQek/)
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
                    return team1_id
                elif team_name_lower in team2_slug.lower():
                    return team2_id
        
        # 模式2: 直接搜索球队slug和ID
        # 查找类似 "penarol-r1hkKQek" 的模式
        direct_pattern = rf'{re.escape(team_name_lower)}-([a-zA-Z0-9]{{8}})'
        direct_matches = re.findall(direct_pattern, html_content, re.IGNORECASE)
        if direct_matches:
            return direct_matches[0]
        
        return None
    
    def search_in_league_pages(self, team_name):
        """
        在联赛页面中搜索球队
        返回 (team_id, league_name, source_url)
        """
        print(f"🔍 在联赛页面中搜索球队: {team_name}")
        
        for league_name, league_url in self.league_pages.items():
            print(f"   搜索 {league_name} 联赛...")
            
            html_content = self._fetch_page(league_url)
            if not html_content:
                continue
            
            team_id = self._extract_team_id_from_match_links(html_content, team_name)
            if team_id:
                print(f"   ✅ 在 {league_name} 联赛中找到: {team_id}")
                return team_id, league_name, league_url
        
        print(f"   ❌ 在所有联赛页面中未找到")
        return None, None, None
    
    def find_team_id(self, team_name, use_cache=True):
        """
        查找球队ID
        
        Args:
            team_name: 球队名称
            use_cache: 是否使用缓存
            
        Returns:
            team_id or None
        """
        print(f"\n{'='*60}")
        print(f"🔍 查找球队ID: {team_name}")
        print(f"{'='*60}")
        
        # 1. 检查缓存
        if use_cache and team_name in self.database:
            team_data = self.database[team_name]
            print(f"✅ 从缓存找到: {team_name} -> {team_data['id']}")
            print(f"   联赛: {team_data.get('league', 'Unknown')}")
            print(f"   来源: {team_data.get('source', 'Unknown')}")
            print(f"   时间: {team_data.get('timestamp', 'Unknown')}")
            return team_data['id']
        
        # 2. 在联赛页面中搜索
        team_id, league_name, source_url = self.search_in_league_pages(team_name)
        
        if team_id:
            # 保存到数据库
            team_data = {
                'id': team_id,
                'league': league_name,
                'source': f'从{league_name}联赛页面提取',
                'source_url': source_url,
                'timestamp': datetime.now().isoformat(),
                'method': 'league_page_extraction'
            }
            
            self.database[team_name] = team_data
            self._save_database()
            
            print(f"\n✅ 成功找到球队ID!")
            print(f"   球队: {team_name}")
            print(f"   ID: {team_id}")
            print(f"   联赛: {league_name}")
            print(f"   来源: {source_url}")
            
            # 提供球队页面URL
            team_slug = team_name.lower().replace(' ', '-').replace('ñ', 'n')
            team_url = f"https://www.flashscore.com/team/{team_slug}/{team_id}/"
            print(f"   球队页面: {team_url}")
            
            return team_id
        else:
            print(f"\n❌ 未找到球队: {team_name}")
            print(f"\n💡 建议:")
            print(f"1. 检查球队名称拼写")
            print(f"2. 尝试不同的名称变体")
            print(f"3. 手动访问FlashScore搜索")
            print(f"4. 从比赛URL中提取ID")
            
            return None
    
    def batch_find(self, team_names):
        """批量查找球队ID"""
        results = {}
        for team_name in team_names:
            team_id = self.find_team_id(team_name)
            results[team_name] = team_id
        return results
    
    def add_manual(self, team_name, team_id, league="Unknown"):
        """手动添加球队ID"""
        team_data = {
            'id': team_id,
            'league': league,
            'source': '手动添加',
            'timestamp': datetime.now().isoformat(),
            'method': 'manual'
        }
        
        self.database[team_name] = team_data
        self._save_database()
        
        print(f"✅ 手动添加: {team_name} -> {team_id}")
        return True
    
    def show_stats(self):
        """显示数据库统计"""
        print(f"\n{'='*60}")
        print(f"📊 球队ID数据库统计")
        print(f"{'='*60}")
        print(f"总球队数: {len(self.database)}")
        
        if self.database:
            print(f"\n球队列表:")
            for i, (team_name, team_data) in enumerate(self.database.items(), 1):
                print(f"{i:2d}. {team_name:20} -> {team_data.get('id', 'N/A'):10} ({team_data.get('league', 'Unknown')})")


def main():
    """主函数"""
    import argparse
    
    parser = argparse.ArgumentParser(description='改进版球队ID查找工具')
    parser.add_argument('team', nargs='?', help='球队名称')
    parser.add_argument('--search', help='搜索球队')
    parser.add_argument('--batch', nargs='+', help='批量查找多个球队')
    parser.add_argument('--add', nargs=2, metavar=('TEAM_NAME', 'TEAM_ID'), help='手动添加球队')
    parser.add_argument('--stats', action='store_true', help='显示统计')
    parser.add_argument('--no-cache', action='store_true', help='不使用缓存')
    
    args = parser.parse_args()
    
    finder = ImprovedTeamIDFinder()
    
    if args.stats:
        finder.show_stats()
    
    elif args.add:
        team_name, team_id = args.add
        finder.add_manual(team_name, team_id)
    
    elif args.batch:
        results = finder.batch_find(args.batch)
        print(f"\n📋 批量查找结果:")
        for team_name, team_id in results.items():
            status = "✅" if team_id else "❌"
            print(f"{status} {team_name:20} -> {team_id or '未找到'}")
    
    elif args.search:
        finder.find_team_id(args.search, use_cache=not args.no_cache)
    
    elif args.team:
        finder.find_team_id(args.team, use_cache=not args.no_cache)
    
    else:
        # 交互模式
        print("改进版球队ID查找工具")
        print("=" * 60)
        
        while True:
            team_name = input("\n请输入球队名称 (或输入 'quit' 退出): ").strip()
            if team_name.lower() in ['quit', 'exit', 'q']:
                break
            
            if team_name:
                finder.find_team_id(team_name)


if __name__ == "__main__":
    main()