#!/usr/bin/env python3
"""
智能球队查找器
按照"先确定国家，再查找联赛页面"的逻辑
"""

import json
import os
import re
from datetime import datetime

class SmartTeamFinder:
    """智能球队查找器"""
    
    def __init__(self, db_file="smart_teams.json"):
        self.db_file = db_file
        self.teams = self._load_teams()
        
        # 国家-联赛映射（基于已验证数据）
        self.country_leagues = {
            'argentina': 'https://www.flashscore.com/football/argentina/liga-profesional/',
            'uruguay': 'https://www.flashscore.com/football/uruguay/liga-auf-uruguaya/',
            'brazil': 'https://www.flashscore.com/football/brazil/serie-a/',
            'chile': 'https://www.flashscore.com/football/chile/primera-division/',
            'england': 'https://www.flashscore.com/football/england/premier-league/',
            'spain': 'https://www.flashscore.com/football/spain/laliga/',
            'italy': 'https://www.flashscore.com/football/italy/serie-a/',
            'germany': 'https://www.flashscore.com/football/germany/bundesliga/',
            'france': 'https://www.flashscore.com/football/france/ligue-1/',
            'portugal': 'https://www.flashscore.com/football/portugal/primeira-liga/',
            'netherlands': 'https://www.flashscore.com/football/netherlands/eredivisie/'
        }
        
        # 国家识别规则
        self.country_rules = {
            'argentina': ['argentina', 'buenos aires', 'rosario', 'cordoba', 
                         'river', 'boca', 'racing', 'independiente', 'san lorenzo'],
            'uruguay': ['uruguay', 'montevideo', 'penarol', 'peñarol', 'nacional'],
            'brazil': ['brazil', 'brasil', 'são paulo', 'rio', 'flamengo', 
                      'palmeiras', 'santos', 'corinthians', 'grêmio'],
            'chile': ['chile', 'santiago', 'colo-colo', 'universidad'],
            'england': ['england', 'london', 'manchester', 'liverpool', 
                       'chelsea', 'arsenal', 'tottenham'],
            'spain': ['spain', 'madrid', 'barcelona', 'valencia', 'sevilla', 
                     'atlético', 'real'],
            'italy': ['italy', 'milan', 'juventus', 'roma', 'napoli', 'inter'],
            'germany': ['germany', 'bayern', 'dortmund', 'berlin', 'hamburg', 'munich'],
            'france': ['france', 'paris', 'marseille', 'lyon', 'monaco', 'psg'],
            'portugal': ['portugal', 'porto', 'lisbon', 'benfica', 'sporting'],
            'netherlands': ['netherlands', 'amsterdam', 'rotterdam', 'ajax', 'feyenoord']
        }
    
    def _load_teams(self):
        """加载球队数据"""
        if os.path.exists(self.db_file):
            try:
                with open(self.db_file, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except:
                return {}
        return {}
    
    def _save_teams(self):
        """保存球队数据"""
        try:
            with open(self.db_file, 'w', encoding='utf-8') as f:
                json.dump(self.teams, f, indent=2, ensure_ascii=False)
            return True
        except:
            return False
    
    def guess_country(self, team_name):
        """
        猜测球队国家
        
        Args:
            team_name: 球队名称
            
        Returns:
            list: 可能的国家列表
        """
        team_lower = team_name.lower()
        possible = []
        
        print(f"🔍 分析球队: {team_name}")
        
        # 1. 检查已知数据
        if team_name in self.teams:
            team_data = self.teams[team_name]
            if 'country' in team_data:
                country = team_data['country']
                print(f"  已知数据: {country}")
                return [country]
        
        # 2. 基于规则匹配
        for country, keywords in self.country_rules.items():
            for keyword in keywords:
                if keyword in team_lower:
                    if country not in possible:
                        possible.append(country)
                    print(f"  规则匹配: '{keyword}' → {country}")
                    break
        
        # 3. 基于名称特征
        if not possible:
            # 西班牙语特征
            if any(word in team_lower for word in ['real', 'atlético', 'deportivo', 'racing']):
                possible.extend(['argentina', 'uruguay', 'chile', 'spain'])
                print(f"  西班牙语特征")
            
            # 葡萄牙语特征
            elif any(word in team_lower for word in ['sport', 'clube', 'futebol']):
                possible.extend(['brazil', 'portugal'])
                print(f"  葡萄牙语特征")
            
            # 英语特征
            elif any(word in team_lower for word in [' united', ' city', ' town']):
                possible.append('england')
                print(f"  英语特征")
            
            # 意大利语特征
            elif any(word in team_lower for word in ['ac ', 'inter ', 'as ', 'us ']):
                possible.append('italy')
                print(f"  意大利语特征")
            
            # 德语特征
            elif any(word in team_lower for word in ['fc ', 'tsv ', 'vfb ', 'sv ']):
                possible.append('germany')
                print(f"  德语特征")
        
        # 4. 去重和排序
        possible = list(dict.fromkeys(possible))
        
        if not possible:
            print(f"  未识别，使用默认顺序")
            possible = ['england', 'spain', 'italy', 'germany', 'france', 
                       'argentina', 'brazil', 'uruguay']
        
        print(f"  可能的国家: {', '.join(possible[:3])}" + 
              (f" 等{len(possible)}个" if len(possible) > 3 else ""))
        
        return possible
    
    def find_team(self, team_name):
        """
        查找球队信息
        
        Args:
            team_name: 球队名称
            
        Returns:
            dict: 球队信息 or None
        """
        print(f"\n{'='*60}")
        print(f"🔍 查找球队: {team_name}")
        print(f"{'='*60}")
        
        # 1. 检查已知数据
        if team_name in self.teams:
            team_data = self.teams[team_name]
            print(f"✅ 找到已知数据:")
            self._print_team_info(team_data)
            return team_data
        
        # 2. 猜测国家
        possible_countries = self.guess_country(team_name)
        
        # 3. 提供查找建议
        print(f"\n💡 查找建议:")
        print(f"1. 球队可能来自: {', '.join(possible_countries[:3])}")
        
        for country in possible_countries[:3]:
            if country in self.country_leagues:
                url = self.country_leagues[country]
                print(f"2. 访问 {country} 联赛页面: {url}")
                print(f"   查找比赛链接格式: [Team A - Team B](/match/football/teamA-ID/teamB-ID/)")
                break
        
        print(f"\n📝 找到ID后，使用 --add 参数添加到数据库")
        
        return None
    
    def _print_team_info(self, team_data):
        """打印球队信息"""
        print(f"   球队ID: {team_data['id']}")
        if 'country' in team_data:
            print(f"   国家: {team_data['country']}")
        if 'league' in team_data:
            print(f"   联赛: {team_data['league']}")
        if 'source' in team_data:
            print(f"   来源: {team_data['source']}")
        
        # 球队页面URL
        team_slug = team_data.get('name', '').lower().replace(' ', '-').replace('ñ', 'n')
        if team_slug and 'id' in team_data:
            url = f"https://www.flashscore.com/team/{team_slug}/{team_data['id']}/"
            print(f"   球队页面: {url}")
    
    def add_team(self, team_name, team_id, country, league=""):
        """添加球队"""
        team_data = {
            "id": team_id,
            "country": country,
            "source": "手动添加",
            "timestamp": datetime.now().strftime("%Y-%m-%d")
        }
        
        if league:
            team_data["league"] = league
        
        self.teams[team_name] = team_data
        self._save_teams()
        
        print(f"\n✅ 添加成功:")
        print(f"   球队: {team_name}")
        print(f"   ID: {team_id}")
        print(f"   国家: {country}")
        if league:
            print(f"   联赛: {league}")
        
        return True
    
    def search(self, keyword):
        """搜索球队"""
        results = []
        for name, data in self.teams.items():
            if keyword.lower() in name.lower():
                results.append((name, data))
        
        return results
    
    def list_all(self, country_filter=None):
        """列出所有球队"""
        if not self.teams:
            print("暂无球队数据")
            return
        
        print(f"\n{'='*60}")
        print(f"📋 球队列表" + (f" (国家: {country_filter})" if country_filter else ""))
        print(f"{'='*60}")
        
        # 按国家分组
        by_country = {}
        for name, data in self.teams.items():
            country = data.get('country', 'unknown')
            if country_filter and country != country_filter:
                continue
            
            if country not in by_country:
                by_country[country] = []
            by_country[country].append((name, data))
        
        # 显示
        total = 0
        for country in sorted(by_country.keys()):
            teams = by_country[country]
            total += len(teams)
            
            print(f"\n🌍 {country.upper()} ({len(teams)}):")
            for name, data in sorted(teams):
                print(f"  {name:25} -> {data['id']}")
        
        print(f"\n总计: {total} 支球队")
    
    def show_countries(self):
        """显示支持的国家"""
        print(f"\n{'='*60}")
        print(f"🌍 支持的国家列表")
        print(f"{'='*60}")
        
        for country, url in self.country_leagues.items():
            print(f"{country:12} : {url}")


def main():
    """主函数"""
    import argparse
    
    parser = argparse.ArgumentParser(description='智能球队查找器')
    parser.add_argument('team', nargs='?', help='球队名称')
    parser.add_argument('--add', nargs=3, metavar=('TEAM', 'ID', 'COUNTRY'), 
                       help='添加球队')
    parser.add_argument('--league', help='联赛名称（与--add一起使用）')
    parser.add_argument('--search', help='搜索球队')
    parser.add_argument('--list', action='store_true', help='列出所有球队')
    parser.add_argument('--country', help='按国家筛选')
    parser.add_argument('--countries', action='store_true', help='显示支持的国家')
    
    args = parser.parse_args()
    
    finder = SmartTeamFinder()
    
    if args.add:
        team_name, team_id, country = args.add
        league = args.league if args.league else ""
        finder.add_team(team_name, team_id, country, league)
    
    elif args.search:
        results = finder.search(args.search)
        if results:
            print(f"✅ 找到 {len(results)} 个匹配:")
            for name, data in results:
                country = data.get('country', 'unknown')
                print(f"  - {name}: {data['id']} ({country})")
        else:
            print(f"❌ 未找到包含 '{args.search}' 的球队")
    
    elif args.list:
        finder.list_all(args.country)
    
    elif args.countries:
        finder.show_countries()
    
    elif args.team:
        finder.find_team(args.team)
    
    else:
        print("智能球队查找器")
        print("使用方法:")
        print("  python smart_team_finder.py <球队名称>")
        print("  python smart_team_finder.py --add <球队> <ID> <国家>")
        print("  python smart_team_finder.py --search <关键词>")
        print("  python smart_team_finder.py --list [--country <国家>]")
        print("  python smart_team_finder.py --countries")


if __name__ == "__main__":
    main()