#!/usr/bin/env python3
"""
更新版球队ID管理器
使用web_fetch成功的方法：通过联赛页面查找比赛链接
"""

import os
import json
import re
import requests
from datetime import datetime, timedelta

class UpdatedTeamIDManager:
    """更新版球队ID管理器 - 使用联赛页面方法"""
    
    def __init__(self, db_file="updated_team_id_database.json", cache_dir="cache_updated"):
        """
        初始化
        
        Args:
            db_file: 数据库文件路径
            cache_dir: 缓存目录
        """
        self.db_file = db_file
        self.cache_dir = cache_dir
        self.cache_expiry_hours = 24
        
        # 创建缓存目录
        os.makedirs(cache_dir, exist_ok=True)
        
        # 加载数据库
        self.database = self._load_database()
        
        # 联赛页面配置（基于成功查询）
        self.league_pages = {
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
        
        # 添加已验证数据
        self._add_proven_teams()
    
    def _load_database(self):
        """加载数据库"""
        if os.path.exists(self.db_file):
            try:
                with open(self.db_file, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except Exception as e:
                print(f"⚠ 加载数据库失败: {e}")
                return {}
        else:
            print(f"📁 创建新的球队ID数据库: {self.db_file}")
            return {}
    
    def _save_database(self):
        """保存数据库"""
        try:
            with open(self.db_file, 'w', encoding='utf-8') as f:
                json.dump(self.database, f, indent=2, ensure_ascii=False)
            print(f"💾 数据库已保存: {self.db_file}")
            return True
        except Exception as e:
            print(f"❌ 保存数据库失败: {e}")
            return False
    
    def _add_proven_teams(self):
        """添加已验证的球队（基于成功查询）"""
        proven_teams = {
            "Penarol": {
                "id": "r1hkKQek",
                "league": "uruguay",
                "verified": True,
                "last_verified": "2026-04-17",
                "source": "从乌拉圭联赛页面提取 (web_fetch方法)",
                "match": "Penarol - Juventud (2026-04-21)",
                "last_fetched": datetime.now().isoformat()
            },
            "Platense": {
                "id": "80MMdBdN",
                "league": "argentina",
                "verified": True,
                "last_verified": "2026-04-17",
                "source": "从阿根廷联赛页面提取 (web_fetch方法)",
                "match": "Central Cordoba - Platense (2026-04-20)",
                "last_fetched": datetime.now().isoformat()
            }
        }
        
        # 合并到数据库
        for team_name, team_data in proven_teams.items():
            if team_name not in self.database:
                self.database[team_name] = team_data
                print(f"📝 添加已验证球队: {team_name} -> {team_data['id']}")
        
        self._save_database()
    
    def _fetch_from_website_updated(self, team_name):
        """
        更新版网站查询方法
        使用联赛页面而非搜索页面
        
        Args:
            team_name: 球队名称
            
        Returns:
            team_id or None
        """
        print(f"🌐 使用更新方法查询: {team_name}")
        print(f"   方法: 搜索联赛页面中的比赛链接")
        
        team_name_lower = team_name.lower()
        
        # 尝试每个联赛页面
        for league_name, league_url in self.league_pages.items():
            print(f"   尝试 {league_name} 联赛页面...")
            
            try:
                # 使用更接近web_fetch的请求头
                headers = {
                    'User-Agent': 'Mozilla/5.0 (compatible; OpenClaw-WebFetch/1.0; +http://openclaw.ai)',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.5',
                    'Accept-Encoding': 'gzip, deflate',
                    'Connection': 'keep-alive',
                    'Upgrade-Insecure-Requests': '1',
                    'Cache-Control': 'max-age=0',
                }
                
                response = requests.get(league_url, headers=headers, timeout=15)
                
                if response.status_code == 200:
                    html_content = response.text
                    
                    # 使用成功查询的模式
                    # 查找比赛链接: [Team A - Team B](/match/football/teamA-ID/teamB-ID/)
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
                                print(f"   ✅ 在 {league_name} 联赛中找到: {team1_id}")
                                return team1_id
                            elif team_name_lower in team2_slug.lower():
                                print(f"   ✅ 在 {league_name} 联赛中找到: {team2_id}")
                                return team2_id
                    
                    print(f"   在 {league_name} 联赛中未找到")
                
                else:
                    print(f"   请求失败: {response.status_code}")
            
            except Exception as e:
                print(f"   查询错误: {e}")
        
        print(f"❌ 在所有联赛页面中未找到")
        return None
    
    def get_team_id(self, team_name, force_refresh=False):
        """
        获取球队ID - 使用更新版方法
        
        Args:
            team_name: 球队名称
            force_refresh: 是否强制刷新
            
        Returns:
            team_id or None
        """
        print(f"🔍 查找球队ID: {team_name}")
        
        # 1. 检查本地数据库（如果不强制刷新）
        if not force_refresh and team_name in self.database:
            team_data = self.database[team_name]
            print(f"✅ 从数据库找到: {team_name} -> {team_data['id']}")
            return team_data['id']
        
        # 2. 使用更新版网站查询方法
        team_id = self._fetch_from_website_updated(team_name)
        
        if team_id:
            # 保存到数据库
            team_data = {
                "id": team_id,
                "league": "unknown",  # 会在_fetch_from_website_updated中确定
                "verified": False,
                "last_verified": datetime.now().strftime("%Y-%m-%d"),
                "source": "更新版联赛页面查询",
                "last_fetched": datetime.now().isoformat()
            }
            
            self.database[team_name] = team_data
            self._save_database()
            
            print(f"✅ 成功获取并保存: {team_name} -> {team_id}")
            
            # 提供球队页面URL
            team_slug = team_name.lower().replace(' ', '-').replace('ñ', 'n')
            team_url = f"https://www.flashscore.com/team/{team_slug}/{team_id}/"
            print(f"   球队页面: {team_url}")
            
            return team_id
        else:
            print(f"❌ 未找到球队ID: {team_name}")
            return None
    
    def add_team_manual(self, team_name, team_id, league="unknown", match_info=None):
        """手动添加球队"""
        team_data = {
            "id": team_id,
            "league": league,
            "verified": True,
            "last_verified": datetime.now().strftime("%Y-%m-%d"),
            "source": "手动添加",
            "last_fetched": datetime.now().isoformat()
        }
        
        if match_info:
            team_data["match"] = match_info
        
        self.database[team_name] = team_data
        self._save_database()
        
        print(f"✅ 手动添加: {team_name} -> {team_id}")
        return True
    
    def search_teams(self, keyword):
        """搜索球队"""
        results = []
        for team_name, team_data in self.database.items():
            if keyword.lower() in team_name.lower():
                results.append((team_name, team_data))
        
        return results
    
    def show_stats(self):
        """显示统计"""
        print(f"\n📊 球队ID数据库统计")
        print(f"总球队数: {len(self.database)}")
        
        verified_count = sum(1 for data in self.database.values() if data.get('verified', False))
        print(f"已验证球队: {verified_count}")
        
        if self.database:
            print(f"\n球队列表:")
            for i, (team_name, team_data) in enumerate(self.database.items(), 1):
                status = "✅" if team_data.get('verified', False) else "⚠"
                print(f"{i:3d}. {status} {team_name:20} -> {team_data['id']:10}")


def test_updated_manager():
    """测试更新版管理器"""
    print("=" * 70)
    print("测试更新版球队ID管理器")
    print("使用联赛页面方法 (基于web_fetch成功经验)")
    print("=" * 70)
    
    manager = UpdatedTeamIDManager()
    
    # 测试已知的成功案例
    print("\n🧪 测试1: 查询已验证的球队 (Penarol)")
    team_id = manager.get_team_id("Penarol")
    print(f"结果: {team_id}")
    
    print("\n🧪 测试2: 查询已验证的球队 (Platense)")
    team_id = manager.get_team_id("Platense")
    print(f"结果: {team_id}")
    
    print("\n🧪 测试3: 显示统计")
    manager.show_stats()
    
    print("\n" + "=" * 70)
    print("测试完成")
    print("=" * 70)


def main():
    """主函数"""
    import argparse
    
    parser = argparse.ArgumentParser(description='更新版球队ID管理器')
    parser.add_argument('team', nargs='?', help='球队名称')
    parser.add_argument('--search', help='搜索球队')
    parser.add_argument('--add', nargs=3, metavar=('TEAM', 'ID', 'LEAGUE'), help='手动添加球队')
    parser.add_argument('--stats', action='store_true', help='显示统计')
    parser.add_argument('--test', action='store_true', help='运行测试')
    
    args = parser.parse_args()
    
    if args.test:
        test_updated_manager()
        return
    
    manager = UpdatedTeamIDManager()
    
    if args.stats:
        manager.show_stats()
    
    elif args.add:
        team_name, team_id, league = args.add
        manager.add_team_manual(team_name, team_id, league)
    
    elif args.search:
        results = manager.search_teams(args.search)
        if results:
            print(f"✅ 找到 {len(results)} 个匹配:")
            for team_name, team_data in results:
                print(f"  - {team_name}: {team_data['id']} ({team_data.get('league', 'unknown')})")
        else:
            print(f"❌ 未找到包含 '{args.search}' 的球队")
    
    elif args.team:
        team_id = manager.get_team_id(args.team)
        if team_id:
            print(f"\n✅ 球队ID: {team_id}")
        else:
            print(f"\n❌ 未找到球队: {args.team}")
    
    else:
        print("更新版球队ID管理器")
        print("使用方法:")
        print("  python team_id_manager_updated.py <球队名称>")
        print("  python team_id_manager_updated.py --search <关键词>")
        print("  python team_id_manager_updated.py --add <球队> <ID> <联赛>")
        print("  python team_id_manager_updated.py --stats")
        print("  python team_id_manager_updated.py --test")


if __name__ == "__main__":
    main()