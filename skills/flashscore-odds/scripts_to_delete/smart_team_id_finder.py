#!/usr/bin/env python3
"""
智能球队ID查找器
逻辑：先确定球队的国家，然后通过对应的联赛页面查找球队ID
"""

import json
import os
import re
import requests
import sys
from datetime import datetime
from urllib.parse import quote

class SmartTeamIDFinder:
    """
    智能球队ID查找器
    1. 先确定球队的国家/地区
    2. 然后访问对应的联赛页面
    3. 从比赛链接中提取球队ID
    """
    
    def __init__(self, db_file="smart_team_ids.json", cache_dir="smart_cache"):
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
        
        # 国家-联赛映射表
        self.country_league_map = self._create_country_league_map()
        
        # 请求头
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Cache-Control': 'max-age=0',
        }
    
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
            print(f"📁 创建新的智能球队ID数据库: {self.db_file}")
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
    
    def _create_country_league_map(self):
        """
        创建国家-联赛映射表
        基于球队名称特征和国家信息
        """
        return {
            # 南美洲
            'argentina': {
                'leagues': ['argentina/liga-profesional'],
                'keywords': ['Argentin', 'Buenos Aires', 'Rosario', 'Cordoba', 'River Plate', 'Boca Juniors', 'Racing', 'Independiente', 'San Lorenzo', 'Estudiantes'],
                'team_patterns': ['^(CA )?', '^(Club )?', ' de ']
            },
            'uruguay': {
                'leagues': ['uruguay/liga-auf-uruguaya'],
                'keywords': ['Uruguay', 'Montevideo', 'Penarol', 'Nacional', 'Peñarol'],
                'team_patterns': []
            },
            'brazil': {
                'leagues': ['brazil/serie-a'],
                'keywords': ['Brazil', 'Brasil', 'São Paulo', 'Rio de Janeiro', 'Flamengo', 'Palmeiras', 'Santos', 'Corinthians', 'Grêmio', 'Internacional'],
                'team_patterns': ['^(SC )?', '^(EC )?', '^(SE )?', ' FC$']
            },
            'chile': {
                'leagues': ['chile/primera-division'],
                'keywords': ['Chile', 'Santiago', 'Colo-Colo', 'Universidad de Chile', 'Universidad Católica'],
                'team_patterns': [' CD$', '^(CD )?']
            },
            
            # 欧洲
            'england': {
                'leagues': ['england/premier-league', 'england/championship'],
                'keywords': ['England', 'English', 'United', 'City', 'FC', 'United', 'Wanderers', 'Rovers', 'Town', 'London', 'Manchester', 'Liverpool', 'Chelsea', 'Arsenal', 'Tottenham'],
                'team_patterns': ['^(AFC )?', '^(FC )?', ' United$', ' City$', ' Wanderers$', ' Rovers$', ' Town$']
            },
            'spain': {
                'leagues': ['spain/laliga'],
                'keywords': ['Spain', 'Spanish', 'Real', 'Atlético', 'Barcelona', 'Madrid', 'Valencia', 'Sevilla', 'Athletic', 'Real Sociedad', 'Villarreal'],
                'team_patterns': ['^(Real )?', '^(Club )?', '^(UD )?', '^(CD )?', '^(SD )?']
            },
            'italy': {
                'leagues': ['italy/serie-a'],
                'keywords': ['Italy', 'Italian', 'Milan', 'Inter', 'Juventus', 'Roma', 'Napoli', 'Fiorentina', 'Lazio', 'Torino', 'Genoa'],
                'team_patterns': ['^(AC )?', '^(FC )?', '^(AS )?', '^(SS )?', '^(US )?']
            },
            'germany': {
                'leagues': ['germany/bundesliga'],
                'keywords': ['Germany', 'German', 'Bayern', 'Dortmund', 'Schalke', 'Leverkusen', 'Frankfurt', 'Berlin', 'Hamburg', 'München', 'Köln'],
                'team_patterns': ['^(FC )?', '^(TSV )?', '^(VfB )?', '^(SV )?', '^(SC )?', '^(BSC )?', '^(1. FC )?']
            },
            'france': {
                'leagues': ['france/ligue-1'],
                'keywords': ['France', 'French', 'Paris', 'Marseille', 'Lyon', 'Monaco', 'Lille', 'Nice', 'Saint-Étienne', 'Bordeaux'],
                'team_patterns': ['^(AS )?', '^(FC )?', '^(Olympique )?', '^(Stade )?', '^(RC )?']
            },
            
            # 其他地区
            'portugal': {
                'leagues': ['portugal/primeira-liga'],
                'keywords': ['Portugal', 'Portuguese', 'Porto', 'Benfica', 'Sporting', 'Braga', 'Lisbon'],
                'team_patterns': ['^(FC )?', '^(SC )?', '^(GD )?']
            },
            'netherlands': {
                'leagues': ['netherlands/eredivisie'],
                'keywords': ['Netherlands', 'Dutch', 'Ajax', 'Feyenoord', 'PSV', 'Eindhoven', 'Amsterdam', 'Rotterdam'],
                'team_patterns': ['^(AFC )?', '^(FC )?', '^(SC )?']
            }
        }
    
    def _determine_country(self, team_name):
        """
        确定球队的国家/地区
        
        Args:
            team_name: 球队名称
            
        Returns:
            list: 可能的国家列表
        """
        team_name_lower = team_name.lower()
        possible_countries = []
        
        print(f"🔍 分析球队: {team_name}")
        
        # 检查已知的球队数据库
        if team_name in self.database:
            team_data = self.database[team_name]
            if 'country' in team_data:
                country = team_data['country']
                print(f"  从数据库找到国家: {country}")
                return [country]
        
        # 基于关键词匹配
        for country, info in self.country_league_map.items():
            # 检查关键词
            for keyword in info['keywords']:
                if keyword.lower() in team_name_lower:
                    print(f"  关键词匹配: {keyword} → {country}")
                    possible_countries.append(country)
                    break
            
            # 检查球队名称模式
            for pattern in info['team_patterns']:
                if pattern.strip('^$') in team_name:
                    print(f"  名称模式匹配: {pattern} → {country}")
                    if country not in possible_countries:
                        possible_countries.append(country)
                    break
        
        # 如果没有匹配，使用默认搜索顺序
        if not possible_countries:
            print(f"  未找到明确国家匹配，使用默认搜索顺序")
            # 默认搜索顺序：英格兰、西班牙、意大利、德国、法国、阿根廷、巴西等
            default_order = ['england', 'spain', 'italy', 'germany', 'france', 
                           'argentina', 'brazil', 'uruguay', 'portugal', 'netherlands']
            possible_countries = default_order
        
        # 去重
        possible_countries = list(dict.fromkeys(possible_countries))
        
        print(f"  可能的国家: {', '.join(possible_countries[:3])}" + 
              (f" 等{len(possible_countries)}个" if len(possible_countries) > 3 else ""))
        
        return possible_countries
    
    def _search_in_league(self, team_name, country):
        """
        在指定国家的联赛页面中搜索球队
        
        Args:
            team_name: 球队名称
            country: 国家
            
        Returns:
            str: 球队ID or None
        """
        if country not in self.country_league_map:
            print(f"  ❌ 未知国家: {country}")
            return None
        
        country_info = self.country_league_map[country]
        team_name_lower = team_name.lower()
        
        print(f"  🌐 在 {country} 联赛中搜索...")
        
        for league_path in country_info['leagues']:
            league_url = f"https://www.flashscore.com/football/{league_path}/"
            print(f"    访问: {league_url}")
            
            try:
                response = requests.get(league_url, headers=self.headers, timeout=15)
                
                if response.status_code == 200:
                    html_content = response.text
                    
                    # 比赛链接模式: [Team A - Team B](/match/football/teamA-ID/teamB-ID/)
                    match_pattern = r'\[([^\]]+)\]\s*\(/match/football/([^/]+)-([a-zA-Z0-9]{8})/([^/]+)-([a-zA-Z0-9]{8})/\)'
                    
                    matches = re.findall(match_pattern, html_content)
                    
                    if matches:
                        print(f"    找到 {len(matches)} 个比赛链接")
                        
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
                                    print(f"    ✅ 找到: {team1_id} (在 {match_text} 中)")
                                    return team1_id
                                elif team_name_lower in team2_slug.lower():
                                    print(f"    ✅ 找到: {team2_id} (在 {match_text} 中)")
                                    return team2_id
                        
                        print(f"    在比赛链接中未找到球队")
                    else:
                        print(f"    未找到比赛链接")
                
                else:
                    print(f"    请求失败: {response.status_code}")
            
            except Exception as e:
                print(f"    访问错误: {e}")
        
        print(f"  ❌ 在 {country} 联赛中未找到")
        return None
    
    def find_team_id(self, team_name, use_cache=True):
        """
        智能查找球队ID
        
        Args:
            team_name: 球队名称
            use_cache: 是否使用缓存
            
        Returns:
            str: 球队ID or None
        """
        print(f"\n{'='*70}")
        print(f"🔍 智能查找球队ID: {team_name}")
        print(f"{'='*70}")
        
        # 1. 检查缓存
        if use_cache and team_name in self.database:
            team_data = self.database[team_name]
            print(f"✅ 从缓存找到: {team_name} -> {team_data['id']}")
            return team_data['id']
        
        # 2. 确定国家
        possible_countries = self._determine_country(team_name)
        
        # 3. 按国家顺序搜索
        for country in possible_countries:
            team_id = self._search_in_league(team_name, country)
            
            if team_id:
                # 保存到数据库
                team_data = {
                    "id": team_id,
                    "country": country,
                    "league": self.country_league_map[country]['leagues'][0],
                    "verified": True,
                    "last_verified": datetime.now().strftime("%Y-%m-%d"),
                    "source": f"智能查找 ({country}联赛)",
                    "last_fetched": datetime.now().isoformat()
                }
                
                self.database[team_name] = team_data
                self._save_database()
                
                print(f"\n✅ 成功获取: {team_name} -> {team_id}")
                print(f"   国家: {country}")
                
                # 提供球队页面URL
                team_slug = team_name.lower().replace(' ', '-').replace('ñ', 'n').replace('é', 'e')
                team_url = f"https://www.flashscore.com/team/{team_slug}/{team_id}/"
                print(f"   球队页面: {team_url}")
                
                return team_id
        
        # 4. 未找到
        print(f"\n❌ 未找到球队ID: {team_name}")
        print(f"💡 建议:")
        print(f"1. 检查球队名称拼写")
        print(f"2. 尝试不同的名称变体")
        print(f"3. 手动添加球队ID")
        
        return None
    
    def add_team_manual(self, team_name, team_id, country="unknown", league="unknown"):
        """手动添加球队"""
        team_data = {
            "id": team_id,
            "country": country,
            "league": league,
            "verified": True,
            "last_verified": datetime.now().strftime("%Y-%m-%d"),
            "source": "手动添加",
            "last_fetched": datetime.now().isoformat()
        }
        
        self.database[team_name] = team_data
        self._save_database()
        
        print(f"✅ 手动添加: {team_name} -> {team_id}")
        print(f"   国家: {country}, 联赛: {league}")
        
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
        print(f"\n📊 智能球队ID数据库统计")
        print(f"总球队数: {len(self.database)}")
        
        if self.database:
            print(f"\n球队列表:")
            for i, (team_name, team_data) in enumerate(self.database.items(), 1):
                country = team_data.get('country', 'unknown')
                status = "✅" if team_data.get('verified', False) else "⚠"
                print(f"{i:3d}. {status} {team_name:20} -> {team_data['id']:10} ({country})")


def test_smart_finder():
    """测试智能查找器"""
    print("=" * 70)
    print("测试智能球队ID查找器")
    print("逻辑: 先确定国家，再查找联赛页面")
    print("=" * 70)
    
    finder = SmartTeamIDFinder()
    
    # 测试已知的球队
    test_cases = [
        ("Penarol", "uruguay"),
        ("Platense", "argentina"),
        ("Liverpool", "england"),
        ("Barcelona", "spain"),
        ("Juventus", "italy"),
        ("Bayern Munich", "germany"),
        ("Paris Saint-Germain", "france"),
    ]
    
    for team_name, expected_country in test_cases:
        print(f"\n🧪 测试: {team_name} (期望国家: {expected_country})")
        team_id = finder.find_team_id(team_name)
        print(f"结果: {team_id}")
    
    print(f"\n🧪 显示统计")
    finder.show_stats()
    
    print("\n" + "=" * 70)
    print("测试完成")
    print("=" * 70)


def main():
    """主函数"""
    import argparse
    
    parser = argparse.ArgumentParser(description='智能球队ID查找器')
    parser.add_argument('team', nargs='?', help='球队名称')
    parser.add_argument('--search', help='搜索球队')
    parser.add_argument('--add', nargs=4, metavar=('TEAM', 'ID', 'COUNTRY', 'LEAGUE'), 
                       help='手动添加球队')
    parser.add_argument('--stats', action='store_true', help='显示统计')
    parser.add_argument('--test', action='store_true', help='运行测试')
    parser.add_argument('--force', action='store_true', help='强制重新查询')
    
    args = parser.parse_args()
    
    if args.test:
        test_smart_finder()
        return
    
    finder = SmartTeamIDFinder()
    
    if args.stats:
        finder.show_stats()
    
    elif args.add:
        team_name, team_id, country, league = args.add
        finder.add_team_manual(team_name, team_id, country, league)
    
    elif args.search:
        results = finder.search_teams(args.search)
        if results:
            print(f"✅ 找到 {len(results)} 个匹配:")
            for team_name, team_data in results:
                country = team_data.get('country', 'unknown')
                print(f"  - {team_name}: {team_data['id']} ({country})")
        else:
            print(f"❌ 未找到包含 '{args.search}' 的球队")
    
    elif args.team:
        use_cache = not args.force
        team_id = finder.find_team_id(args.team, use_cache)
        if team_id:
            print(f"\n✅ 球队ID: {team_id}")
        else:
            print(f"\n❌ 未找到球队: {args.team}")
    
    else:
        print("智能球队ID查找器")
        print("使用方法:")
        print("  python smart_team_id_finder.py <球队名称>")
        print("  python smart_team_id_finder.py <球队名称> --force (强制重新查询)")
        print("  python smart_team_id_finder.py --search <关键词>")
        print("  python smart_team_id_finder.py --add <球队> <ID> <国家> <联赛>")
        print("  python smart_team_id_finder.py --stats")
        print("  python smart_team_id_finder.py --test")


if __name__ == "__main__":
    main()
