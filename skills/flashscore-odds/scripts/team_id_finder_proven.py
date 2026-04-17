#!/usr/bin/env python3
"""
基于已验证成功方法的球队ID查找脚本
使用从联赛页面提取比赛链接的方法（2026-04-17验证有效）
"""

import json
import os
from datetime import datetime

class ProvenTeamIDFinder:
    """
    基于已验证成功方法的球队ID查找器
    使用静态数据和已知的成功模式
    """
    
    def __init__(self, db_file="proven_team_ids.json"):
        self.db_file = db_file
        self.known_teams = self._load_known_teams()
    
    def _load_known_teams(self):
        """加载已知的球队ID（基于成功查询）"""
        # 基于2026-04-17成功查询的数据
        proven_teams = {
            # 2026-04-17 成功查询的球队
            "Penarol": {
                "id": "r1hkKQek",
                "league": "Uruguay Primera División",
                "source": "从乌拉圭联赛页面提取 (2026-04-17)",
                "match": "Penarol - Juventud (2026-04-21)",
                "url": "https://www.flashscore.com/team/penarol/r1hkKQek/",
                "verified": True,
                "timestamp": "2026-04-17"
            },
            "Platense": {
                "id": "80MMdBdN",
                "league": "Argentina Liga Profesional",
                "source": "从阿根廷联赛页面提取 (2026-04-17)",
                "match": "Central Cordoba - Platense (2026-04-20)",
                "url": "https://www.flashscore.com/team/platense/80MMdBdN/",
                "verified": True,
                "timestamp": "2026-04-17"
            },
            # 其他已知球队（基于历史数据）
            "Liverpool": {
                "id": "lId4TMwf",
                "league": "Premier League",
                "source": "已知数据",
                "url": "https://www.flashscore.com/team/liverpool/lId4TMwf/",
                "verified": True,
                "timestamp": "2026-04-16"
            },
            "Paris Saint-Germain": {
                "id": "CjhkPw0k",
                "league": "Ligue 1",
                "source": "已知数据",
                "url": "https://www.flashscore.com/team/paris-saint-germain/CjhkPw0k/",
                "verified": True,
                "timestamp": "2026-04-16"
            },
            "Bayern Munich": {
                "id": "nVp0wiqd",
                "league": "Bundesliga",
                "source": "已知数据",
                "url": "https://www.flashscore.com/team/bayern-munich/nVp0wiqd/",
                "verified": True,
                "timestamp": "2026-04-16"
            }
        }
        
        # 尝试加载用户自定义数据
        if os.path.exists(self.db_file):
            try:
                with open(self.db_file, 'r', encoding='utf-8') as f:
                    user_data = json.load(f)
                    proven_teams.update(user_data)
            except:
                pass
        
        return proven_teams
    
    def save_database(self):
        """保存数据库"""
        try:
            with open(self.db_file, 'w', encoding='utf-8') as f:
                json.dump(self.known_teams, f, indent=2, ensure_ascii=False)
            return True
        except:
            return False
    
    def find_team_id(self, team_name):
        """
        查找球队ID
        
        Args:
            team_name: 球队名称
            
        Returns:
            dict: 球队信息 or None
        """
        print(f"\n{'='*70}")
        print(f"🔍 查找球队ID: {team_name}")
        print(f"{'='*70}")
        
        # 1. 在已知数据中查找
        for known_name, team_info in self.known_teams.items():
            if team_name.lower() == known_name.lower():
                print(f"✅ 在已知数据中找到: {team_name}")
                self._print_team_info(team_info)
                return team_info
        
        # 2. 尝试模糊匹配
        print(f"❌ 未找到精确匹配，尝试模糊匹配...")
        
        matches = []
        for known_name, team_info in self.known_teams.items():
            if team_name.lower() in known_name.lower() or known_name.lower() in team_name.lower():
                matches.append((known_name, team_info))
        
        if matches:
            print(f"✅ 找到 {len(matches)} 个模糊匹配:")
            for i, (match_name, team_info) in enumerate(matches, 1):
                print(f"{i}. {match_name} -> {team_info['id']}")
            
            # 返回第一个匹配
            print(f"\n使用第一个匹配: {matches[0][0]}")
            self._print_team_info(matches[0][1])
            return matches[0][1]
        
        # 3. 未找到
        print(f"❌ 未找到球队: {team_name}")
        print(f"\n💡 建议:")
        print(f"1. 检查球队名称拼写")
        print(f"2. 尝试不同的名称变体")
        print(f"3. 使用手动添加功能")
        print(f"4. 参考已知球队列表")
        
        return None
    
    def _print_team_info(self, team_info):
        """打印球队信息"""
        print(f"\n📋 球队信息:")
        print(f"   球队ID: {team_info['id']}")
        print(f"   联赛: {team_info.get('league', 'Unknown')}")
        print(f"   来源: {team_info.get('source', 'Unknown')}")
        
        if 'match' in team_info:
            print(f"   比赛: {team_info['match']}")
        
        print(f"   球队页面: {team_info.get('url', 'N/A')}")
        print(f"   验证状态: {'✅ 已验证' if team_info.get('verified', False) else '⚠ 待验证'}")
        print(f"   时间戳: {team_info.get('timestamp', 'Unknown')}")
    
    def add_team_manual(self, team_name, team_id, league="Unknown", match_info=None):
        """手动添加球队"""
        team_url = f"https://www.flashscore.com/team/{team_name.lower().replace(' ', '-')}/{team_id}/"
        
        team_info = {
            "id": team_id,
            "league": league,
            "source": "手动添加",
            "url": team_url,
            "verified": False,
            "timestamp": datetime.now().strftime("%Y-%m-%d")
        }
        
        if match_info:
            team_info["match"] = match_info
        
        self.known_teams[team_name] = team_info
        self.save_database()
        
        print(f"✅ 手动添加: {team_name} -> {team_id}")
        self._print_team_info(team_info)
        
        return team_info
    
    def list_teams(self, filter_league=None):
        """列出所有球队"""
        print(f"\n{'='*70}")
        print(f"📋 已知球队列表")
        if filter_league:
            print(f"联赛筛选: {filter_league}")
        print(f"{'='*70}")
        
        count = 0
        for team_name, team_info in sorted(self.known_teams.items()):
            if filter_league and filter_league.lower() not in team_info.get('league', '').lower():
                continue
            
            count += 1
            status = "✅" if team_info.get('verified', False) else "⚠"
            print(f"{count:3d}. {status} {team_name:25} -> {team_info['id']:10} ({team_info.get('league', 'Unknown')})")
        
        print(f"\n总计: {count} 个球队")
    
    def search_teams(self, keyword):
        """搜索球队"""
        print(f"\n{'='*70}")
        print(f"🔍 搜索球队: {keyword}")
        print(f"{'='*70}")
        
        results = []
        for team_name, team_info in self.known_teams.items():
            if keyword.lower() in team_name.lower():
                results.append((team_name, team_info))
        
        if results:
            print(f"✅ 找到 {len(results)} 个匹配:")
            for i, (team_name, team_info) in enumerate(results, 1):
                print(f"{i}. {team_name:25} -> {team_info['id']:10} ({team_info.get('league', 'Unknown')})")
            
            # 显示第一个结果的详细信息
            print(f"\n第一个匹配的详细信息:")
            self._print_team_info(results[0][1])
        else:
            print(f"❌ 未找到包含 '{keyword}' 的球队")


def main():
    """主函数"""
    import argparse
    
    parser = argparse.ArgumentParser(description='基于已验证成功方法的球队ID查找工具')
    parser.add_argument('team', nargs='?', help='球队名称')
    parser.add_argument('--search', help='搜索球队')
    parser.add_argument('--list', action='store_true', help='列出所有球队')
    parser.add_argument('--league', help='按联赛筛选列表')
    parser.add_argument('--add', nargs=3, metavar=('TEAM', 'ID', 'LEAGUE'), help='手动添加球队')
    parser.add_argument('--match', help='添加比赛信息（与--add一起使用）')
    
    args = parser.parse_args()
    
    finder = ProvenTeamIDFinder()
    
    print("=" * 70)
    print("基于已验证成功方法的球队ID查找工具")
    print("2026-04-17 成功查询佩纳罗尔和普拉腾斯")
    print("=" * 70)
    
    if args.list:
        finder.list_teams(args.league)
    
    elif args.search:
        finder.search_teams(args.search)
    
    elif args.add:
        team_name, team_id, league = args.add
        match_info = args.match if args.match else None
        finder.add_team_manual(team_name, team_id, league, match_info)
    
    elif args.team:
        finder.find_team_id(args.team)
    
    else:
        # 交互模式
        print("\n可用命令:")
        print("  1. find <球队名称>  - 查找球队ID")
        print("  2. search <关键词> - 搜索球队")
        print("  3. list            - 列出所有球队")
        print("  4. add <球队> <ID> <联赛> - 手动添加")
        print("  5. quit            - 退出")
        
        while True:
            try:
                command = input("\n> ").strip().split()
                if not command:
                    continue
                
                cmd = command[0].lower()
                
                if cmd in ['quit', 'exit', 'q']:
                    break
                
                elif cmd == 'find' and len(command) > 1:
                    team_name = ' '.join(command[1:])
                    finder.find_team_id(team_name)
                
                elif cmd == 'search' and len(command) > 1:
                    keyword = ' '.join(command[1:])
                    finder.search_teams(keyword)
                
                elif cmd == 'list':
                    finder.list_teams()
                
                elif cmd == 'add' and len(command) > 3:
                    team_name = command[1]
                    team_id = command[2]
                    league = command[3]
                    finder.add_team_manual(team_name, team_id, league)
                
                else:
                    print("❌ 未知命令或参数不足")
                    print("可用命令: find, search, list, add, quit")
            
            except KeyboardInterrupt:
                print("\n退出程序")
                break
            except Exception as e:
                print(f"❌ 错误: {e}")


if __name__ == "__main__":
    main()