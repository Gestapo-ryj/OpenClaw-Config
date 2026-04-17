#!/usr/bin/env python3
"""
智能球队ID查找器 V2 - 完整版
基于"先确定国家，再查找联赛页面"的逻辑
"""

import json
import os
import re
import sys
from datetime import datetime

class SmartTeamIDFinder:
    """
    智能球队ID查找器
    逻辑：先确定球队的国家，然后通过对应的联赛页面查找球队ID
    """
    
    def __init__(self, db_file="smart_team_ids.json"):
        self.db_file = db_file
        self.database = self._load_database()
        
        # 国家-联赛映射（基于已验证的成功方法）
        self.country_leagues = {
            # 南美洲
            'argentina': [
                'https://www.flashscore.com/football/argentina/liga-profesional/'
            ],
            'uruguay': [
                'https://www.flashscore.com/football/uruguay/liga-auf-uruguaya/'
            ],
            'brazil': [
                'https://www.flashscore.com/football/brazil/serie-a/'
            ],
            'chile': [
                'https://www.flashscore.com/football/chile/primera-division/'
            ],
            
            # 欧洲
            'england': [
                'https://www.flashscore.com/football/england/premier-league/',
                'https://www.flashscore.com/football/england/championship/'
            ],
            'spain': [
                'https://www.flashscore.com/football/spain/laliga/'
            ],
            'italy': [
                'https://www.flashscore.com/football/italy/serie-a/'
            ],
            'germany': [
                'https://www.flashscore.com/football/germany/bundesliga/'
            ],
            'france': [
                'https://www.flashscore.com/football/france/ligue-1/'
            ],
            'portugal': [
                'https://www.flashscore.com/football/portugal/primeira-liga/'
            ],
            'netherlands': [
                'https://www.flashscore.com/football/netherlands/eredivisie/'
            ]
        }
        
        # 国家识别关键词
        self.country_keywords = {
            'argentina': ['argentina', 'argentine', 'buenos aires', 'rosario', 'cordoba', 
                         'river plate', 'boca juniors', 'racing', 'independiente'],
            'uruguay': ['uruguay', 'uruguayan', 'montevideo', 'penarol', 'peñarol', 'nacional'],
            'brazil': ['brazil', 'brasil', 'são paulo', 'rio de janeiro', 'flamengo', 
                      'palmeiras', 'santos', 'corinthians', 'grêmio'],
            'chile': ['chile', 'chilean', 'santiago', 'colo-colo', 'universidad de chile'],
            'england': ['england', 'english', 'london', 'manchester', 'liverpool', 
                       'chelsea', 'arsenal', 'tottenham', 'premier league'],
            'spain': ['spain', 'spanish', 'madrid', 'barcelona', 'valencia', 'sevilla', 
                     'atlético', 'real madrid', 'la liga'],
            'italy': ['italy', 'italian', 'milan', 'juventus', 'roma', 'napoli', 
                     'inter', 'serie a', 'torino'],
            'germany': ['germany', 'german', 'bayern', 'dortmund', 'berlin', 'hamburg', 
                       'munich', 'bundesliga', 'schalke'],
            'france': ['france', 'french', 'paris', 'marseille', 'lyon', 'monaco', 
                      'ligue 1', 'psg', 'saint-germain'],
            'portugal': ['portugal', 'portuguese', 'porto', 'lisbon', 'benfica', 'sporting'],
            'netherlands': ['netherlands', 'dutch', 'amsterdam', 'rotterdam', 'ajax', 
                           'feyenoord', 'psv', 'eredivisie']
        }
        
        # 已验证的球队（基于成功查询）
        self.verified_teams = {
            "Penarol": {
                "id": "r1hkKQek",
                "country": "uruguay",
                "league": "uruguay/liga-auf-uruguaya",
                "verified": True,
                "source": "2026-04-17成功查询"
            },
            "Platense": {
                "id": "80MMdBdN",
                "country": "argentina",
                "league": "argentina/liga-profesional",
                "verified": True,
                "source": "2026-04-17成功查询"
            }
        }
        
        # 合并到数据库
        self._merge_verified_data()
    
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
            return True
        except:
            return False
    
    def _merge_verified_data(self):
        """合并已验证数据"""
        for team_name, team_data in self.verified_teams.items():
            if team_name not in self.database:
                self.database[team_name] = team_data
    
    def _identify_country(self, team_name):
        """
        识别球队的国家
        
        Args:
            team_name: 球队名称
            
        Returns:
            list: 可能的国家列表（按可能性排序）
        """
        team_lower = team_name.lower()
        country_scores = {}
        
        print(f"🔍 识别球队国家: {team_name}")
        
        # 1. 检查已知数据库
        if team_name in self.database:
            team_data = self.database[team_name]
            if 'country' in team_data:
                country = team_data['country']
                print(f"  数据库匹配: {country}")
                return [country]
        
        # 2. 检查已验证数据
        if team_name in self.verified_teams:
            team_data = self.verified_teams[team_name]
            country = team_data['country']
            print(f"  已验证数据匹配: {country}")
            return [country]
        
        # 3. 基于关键词匹配
        for country, keywords in self.country_keywords.items():
            score = 0
            
            # 检查关键词
            for keyword in keywords:
                if keyword in team_lower:
                    score += 10
                    print(f"  关键词匹配: '{keyword}' → {country}")
            
            # 检查国家名称
            if country in team_lower:
                score += 20
            
            if score > 0:
                country_scores[country] = score
        
        # 4. 基于球队名称特征
        # 西班牙语特征
        spanish_indicators = ['real', 'atlético', 'deportivo', 'racing', 'estudiantes', 'club', 'cd']
        if any(indicator in team_lower for indicator in spanish_indicators):
            for country in ['argentina', 'uruguay', 'chile', 'spain']:
                country_scores[country] = country_scores.get(country, 0) + 5
        
        # 葡萄牙语特征
        portuguese_indicators = ['sport', 'clube', 'futebol', 'esporte', 'fc']
        if any(indicator in team_lower for indicator in portuguese_indicators):
            for country in ['brazil', 'portugal']:
                country_scores[country] = country_scores.get(country, 0) + 5
        
        # 英语特征
        english_indicators = [' united', ' city', ' town', ' wanderers', ' rovers']
        if any(indicator in team_lower for indicator in english_indicators):
            country_scores['england'] = country_scores.get('england', 0) + 10
        
        # 5. 排序并返回
        if country_scores:
            sorted_countries = sorted(country_scores.items(), key=lambda x: x[1], reverse=True)
            countries = [country for country, score in sorted_countries]
            print(f"  识别结果: {', '.join(countries[:3])}" + 
                  (f" 等{len(countries)}个" if len(countries) > 3 else ""))
            return countries
        else:
            print(f"  未识别到明确国家，使用默认搜索顺序")
            # 默认搜索顺序：主要足球国家
            default_order = ['england', 'spain', 'italy', 'germany', 'france', 
                           'argentina', 'brazil', 'uruguay', 'portugal', 'netherlands']
            return default_order
    
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
        print(f"逻辑: 先确定国家，再查找联赛页面")
        print(f"{'='*70}")
        
        # 1. 检查缓存
        if use_cache and team_name in self.database:
            team_data = self.database[team_name]
            print(f"✅ 从数据库找到: {team_name} -> {team_data['id']}")
            if 'country' in team_data:
                print(f"   国家: {team_data['country']}")
            return team_data['id']
        
        # 2. 检查已验证数据
        if team_name in self.verified_teams:
            team_data = self.verified_teams[team_name]
            print(f"✅ 从已验证数据找到: {team_name} -> {team_data['id']}")
            print(f"   国家: {team_data['country']}, 联赛: {team_data['league']}")
            return team_data['id']
        
        # 3. 识别国家
        possible_countries = self._identify_country(team_name)
        
        # 4. 提供建议（基于当前限制，不实际访问网站）
        print(f"\n💡 基于分析的建议:")
        print(f"1. 球队 '{team_name}' 可能来自: {', '.join(possible_countries[:3])}")
        
        if len(possible_countries) > 1:
            print(f"2. 建议按此顺序搜索联赛页面:")
            for i, country in enumerate(possible_countries[:5], 1):
                if country in self.country_leagues:
                    leagues = self.country_leagues[country]
                    print(f"   {i}. {country}: {leagues[0]}")
        
        print(f"\n⚠ 注意: 由于FlashScore反爬虫限制，自动访问可能失败")
        print(f"💡 建议手动方法:")
        print(f"1. 访问上述联赛页面")
        print(f"2. 查找比赛链接格式: [Team A - Team B](/match/football/teamA-ID/teamB-ID/)")
        print(f"3. 提取8位球队ID")
        
        # 5. 检查类似名称
        similar = self._find_similar_teams(team_name)
        if similar:
            print(f"\n🔍 找到类似名称的球队:")
            for team, data in similar:
                print(f"   - {team}: {data['id']} ({data.get('country', 'unknown')})")
        
        return None
    
    def _find_similar_teams(self, team_name):
        """查找类似名称的球队"""
        team_lower = team_name.lower()
        similar = []
        
        all_teams = {**self.verified_teams, **self.database}
        
        for known_team, team_data in all_teams.items():
            known_lower = known_team.lower()
            
            # 检查包含关系
            if team_lower in known_lower or known_lower in team_lower:
                similar.append((known_team, team_data))
            # 检查单词匹配
            elif any(word in known_lower for word in team_lower.split()):
                similar.append((known_team, team_data))
        
        return similar
    
    def add_team(self, team_name, team_id, country, league=""):
        """添加球队到数据库"""
        team_data = {
            "id": team_id,
            "country": country,
            "verified": True,
            "source": "手动添加",
            "timestamp": datetime.now().strftime("%Y-%m-%d")
        }
        
        if league:
            team_data["league"] = league
        
        self.database[team_name] = team_data
        self._save_database()
        
        print(f"\n✅ 成功添加:")
        print(f"   球队: {team_name}")
        print(f"   ID: {team_id}")
        print(f"   国家: {country}")
        if league:
            print(f"   联赛: {league}")
        
        return True
    
    def search(self, keyword):
        """搜索球队"""
        results = []
        all_teams = {**self.verified_teams, **self.database}
        
        for team_name, team_data in all_teams.items():
            if keyword.lower() in team_name.lower():
                results.append((team_name, team_data))
        
        return results
    
    def list_teams(self, country_filter=None):
        """列出球队"""
        all_teams = {**self.verified_teams, **self.database}
        
        if not all_teams:
            print("暂无球队数据")
            return
        
        # 按国家分组
        teams_by_country = {}
        for team_name, team_data in all_teams.items():
            country = team_data.get('country', 'unknown')
            if country_filter and country != country_filter:
                continue
            
            if country not in teams_by_country:
                teams_by_country[country] = []
            teams_by_country[country].append((team_name, team_data))
        
        # 显示
        print(f"\n{'='*70}")
        print(f"📋 球队列表" + (f" (国家: {country_filter})" if country_filter else ""))
        print(f"{'='*70}")
        
        total = 0
        for country in sorted(teams_by_country.keys()):
            teams = teams_by_country[country]
            total += len(teams)
            
            print(f"\n🌍 {country.upper()} ({len(teams)}支):")
            for team_name, team_data in sorted(teams):
                status = "✅" if team_data.get('verified', False) else "⚠"
                print(f"  {status} {team_name:25} -> {team_data['id']}")
        
        print(f"\n总计: {total} 支球队")
    
    def show_country_info(self, country):
        """显示国家信息"""
        if country not in self.country_leagues:
            print(f"❌ 未知国家: {country}")
            return
        
        print(f"\n🌍 国家信息: {country.upper()}")
        print(f"联赛页面:")
        for url in self.country_leagues[country]:
            print(f"  - {url}")
        
        if country in self.country_keywords:
            print(f"识别关键词: {', '.join(self.country_keywords[country][:5])}...")
        
        # 显示该国家的已知球队
        country_teams = []
        all_teams = {**self.verified_teams, **self.database}
        for team_name, team_data in all_teams.items():
            if team_data.get('country') == country:
                country_teams.append(team_name)
        
        if country_teams:
            print(f"已知球队: {', '.join(country_teams)}")


def main():
    """主函数"""
    import argparse
    
    parser = argparse.ArgumentParser(description='智能球队ID查找器')
    parser.add_argument('team', nargs='?', help='球队名称')
    parser.add_argument('--add', nargs=3, metavar=('TEAM', 'ID', 'COUNTRY'), 
                       help='添加球队')
    parser.add_argument('--league', help='添加球队时的联赛信息')
    parser.add_argument('--search', help='搜索球队')
    parser.add_argument('--list', action='store_true', help='列出所有球队')
    parser.add_argument('--country', help='按国家筛选列表或显示国家信息')
    parser.add_argument('--info', action='store_true', help='显示国家信息')
    
    args = parser.parse_args()
    
    finder = SmartTeamIDFinder()
    
    if args.add:
        team_name, team_id, country = args.add
        league = args.league if args.league else ""
        finder.add_team(team_name, team_id, country, league)
    
    elif args.search:
        results = finder.search(args.search)
        if results:
            print(f"✅ 找到 {len(results)} 个匹配:")
            for team_name, team_data in results:
                country = team_data.get('country', 'unknown')
                print(f"  - {team_name}: {team_data['id']} ({country})")
        else:
            print(f"