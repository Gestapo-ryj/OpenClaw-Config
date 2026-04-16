#!/usr/bin/env python3
"""
球队ID管理器
优先从本地数据库读取，找不到再从FlashScore网站查询
"""

import os
import json
import requests
import re
from datetime import datetime, timedelta

class TeamIDManager:
    """球队ID管理器"""
    
    def __init__(self, db_file="team_id_database.json", cache_dir="cache"):
        """
        初始化球队ID管理器
        
        Args:
            db_file: 数据库文件路径
            cache_dir: 缓存目录
        """
        self.db_file = db_file
        self.cache_dir = cache_dir
        self.cache_expiry_hours = 24  # 缓存过期时间（小时）
        
        # 创建缓存目录
        os.makedirs(cache_dir, exist_ok=True)
        
        # 加载数据库
        self.database = self._load_database()
        
        # 初始化已知的球队ID（从已验证的数据）
        self._init_known_teams()
    
    def _load_database(self):
        """加载本地数据库"""
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
        """保存数据库到文件"""
        try:
            with open(self.db_file, 'w', encoding='utf-8') as f:
                json.dump(self.database, f, indent=2, ensure_ascii=False)
            print(f"💾 数据库已保存: {self.db_file}")
            return True
        except Exception as e:
            print(f"❌ 保存数据库失败: {e}")
            return False
    
    def _init_known_teams(self):
        """初始化已知的球队ID"""
        known_teams = {
            "Liverpool": {
                "id": "lId4TMwf",
                "league": "Premier League",
                "verified": True,
                "last_verified": "2026-04-16",
                "source": "从英超页面提取"
            },
            "Paris Saint-Germain": {
                "id": "CjhkPw0k",
                "league": "Ligue 1",
                "verified": True,
                "last_verified": "2026-04-16",
                "source": "从欧冠页面提取"
            },
            "Bayern Munich": {
                "id": "nVp0wiqd",
                "league": "Bundesliga",
                "verified": True,
                "last_verified": "2026-04-16",
                "source": "从欧冠页面提取"
            },
            "Real Madrid": {
                "id": "SKbpVP5K",
                "league": "La Liga",
                "verified": False,
                "last_verified": "2026-04-16",
                "source": "待验证"
            },
            "Barcelona": {
                "id": "SKbpVP5K",
                "league": "La Liga",
                "verified": False,
                "last_verified": "2026-04-16",
                "source": "待验证"
            }
        }
        
        # 合并已知数据
        for team_name, team_data in known_teams.items():
            if team_name not in self.database:
                self.database[team_name] = team_data
                print(f"📝 添加已知球队: {team_name} -> {team_data['id']}")
        
        # 保存更新后的数据库
        self._save_database()
    
    def get_team_id(self, team_name, force_refresh=False):
        """
        获取球队ID
        
        Args:
            team_name: 球队名称
            force_refresh: 是否强制刷新（忽略缓存）
            
        Returns:
            team_id or None
        """
        print(f"🔍 查找球队ID: {team_name}")
        
        # 1. 检查本地数据库
        if not force_refresh and team_name in self.database:
            team_data = self.database[team_name]
            
            # 检查是否需要刷新（如果数据太旧）
            if self._should_refresh(team_data):
                print(f"  数据需要刷新: {team_name}")
            else:
                print(f"✅ 从数据库找到: {team_name} -> {team_data['id']}")
                return team_data['id']
        
        # 2. 检查缓存文件
        cache_file = self._get_cache_file(team_name)
        if not force_refresh and os.path.exists(cache_file):
            cached_data = self._load_cache(cache_file)
            if cached_data and not self._is_cache_expired(cached_data):
                print(f"✅ 从缓存找到: {team_name} -> {cached_data['id']}")
                
                # 更新数据库
                self.database[team_name] = cached_data
                self._save_database()
                
                return cached_data['id']
        
        # 3. 从网站查询
        print(f"🌐 从FlashScore查询: {team_name}")
        team_id = self._fetch_from_website(team_name)
        
        if team_id:
            # 保存到缓存和数据库
            team_data = {
                "id": team_id,
                "league": "Unknown",
                "verified": False,
                "last_verified": datetime.now().strftime("%Y-%m-%d"),
                "source": "网站查询",
                "last_fetched": datetime.now().isoformat()
            }
            
            self.database[team_name] = team_data
            self._save_database()
            self._save_cache(team_name, team_data)
            
            print(f"✅ 查询成功: {team_name} -> {team_id}")
            return team_id
        else:
            print(f"❌ 查询失败: {team_name}")
            return None
    
    def _should_refresh(self, team_data):
        """检查是否需要刷新数据"""
        if 'last_fetched' not in team_data:
            return True
        
        try:
            last_fetched = datetime.fromisoformat(team_data['last_fetched'])
            expiry_time = last_fetched + timedelta(hours=self.cache_expiry_hours)
            return datetime.now() > expiry_time
        except:
            return True
    
    def _get_cache_file(self, team_name):
        """获取缓存文件路径"""
        safe_name = re.sub(r'[^\w]', '_', team_name.lower())
        return os.path.join(self.cache_dir, f"{safe_name}.json")
    
    def _load_cache(self, cache_file):
        """加载缓存数据"""
        try:
            with open(cache_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        except:
            return None
    
    def _save_cache(self, team_name, team_data):
        """保存缓存数据"""
        cache_file = self._get_cache_file(team_name)
        try:
            with open(cache_file, 'w', encoding='utf-8') as f:
                json.dump(team_data, f, indent=2, ensure_ascii=False)
            return True
        except:
            return False
    
    def _is_cache_expired(self, cached_data):
        """检查缓存是否过期"""
        if 'last_fetched' not in cached_data:
            return True
        
        try:
            last_fetched = datetime.fromisoformat(cached_data['last_fetched'])
            expiry_time = last_fetched + timedelta(hours=self.cache_expiry_hours)
            return datetime.now() > expiry_time
        except:
            return True
    
    def _fetch_from_website(self, team_name):
        """从FlashScore网站查询球队ID"""
        
        # 构建搜索URL
        search_url = f"https://www.flashscore.com/search/?q={requests.utils.quote(team_name)}"
        
        headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Encoding': 'identity',
        }
        
        try:
            response = requests.get(search_url, headers=headers, timeout=15)
            
            if response.status_code == 200:
                html_content = response.text
                
                # 尝试从搜索结果中提取球队ID
                # 模式1: 球队页面链接
                team_patterns = [
                    # 球队页面: /team/liverpool-lId4TMwf/
                    rf'/team/[^/]+-([a-zA-Z0-9]{{8}})/',
                    # 比赛链接中的球队ID
                    rf'/match/[^/]+/[^/]+-([a-zA-Z0-9]{{8}})/[^/]+-([a-zA-Z0-9]{{8}})/',
                ]
                
                for pattern in team_patterns:
                    matches = re.findall(pattern, html_content)
                    if matches:
                        # 取第一个匹配的ID
                        if isinstance(matches[0], tuple):
                            # 如果是元组（比赛链接），尝试两个ID
                            for match in matches[0]:
                                if match:
                                    return match
                        else:
                            return matches[0]
                
                # 模式2: 在JavaScript数据中搜索
                data_pattern = rf'"{re.escape(team_name.lower())}"[^}}]+"id":"([a-zA-Z0-9]{{8}})"'
                matches = re.findall(data_pattern, html_content, re.IGNORECASE)
                if matches:
                    return matches[0]
            
            else:
                print(f"❌ 搜索请求失败: {response.status_code}")
        
        except Exception as e:
            print(f"❌ 查询错误: {e}")
        
        return None
    
    def add_team(self, team_name, team_id, league="Unknown", verified=False, source="手动添加"):
        """手动添加球队到数据库"""
        team_data = {
            "id": team_id,
            "league": league,
            "verified": verified,
            "last_verified": datetime.now().strftime("%Y-%m-%d"),
            "source": source,
            "last_fetched": datetime.now().isoformat()
        }
        
        self.database[team_name] = team_data
        self._save_database()
        self._save_cache(team_name, team_data)
        
        print(f"✅ 手动添加: {team_name} -> {team_id}")
        return True
    
    def search_teams(self, keyword):
        """搜索球队"""
        results = []
        for team_name, team_data in self.database.items():
            if keyword.lower() in team_name.lower():
                results.append((team_name, team_data))
        
        return results
    
    def get_stats(self):
        """获取数据库统计信息"""
        total = len(self.database)
        verified = sum(1 for data in self.database.values() if data.get('verified', False))
        
        return {
            "total_teams": total,
            "verified_teams": verified,
            "verification_rate": f"{(verified/total*100):.1f}%" if total > 0 else "0%",
            "database_file": self.db_file,
            "cache_dir": self.cache_dir
        }
    
    def export_database(self, output_file="team_id_database_export.json"):
        """导出数据库"""
        try:
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(self.database, f, indent=2, ensure_ascii=False)
            print(f"💾 数据库已导出: {output_file}")
            return True
        except Exception as e:
            print(f"❌ 导出失败: {e}")
            return False
    
    def import_database(self, input_file):
        """导入数据库"""
        try:
            with open(input_file, 'r', encoding='utf-8') as f:
                imported_data = json.load(f)
            
            # 合并数据
            for team_name, team_data in imported_data.items():
                if team_name not in self.database:
                    self.database[team_name] = team_data
                else:
                    # 保留较新的数据
                    existing_data = self.database[team_name]
                    existing_date = existing_data.get('last_verified', '2000-01-01')
                    new_date = team_data.get('last_verified', '2000-01-01')
                    
                    if new_date > existing_date:
                        self.database[team_name] = team_data
            
            self._save_database()
            print(f"✅ 数据库已导入: {input_file}")
            return True
        except Exception as e:
            print(f"❌ 导入失败: {e}")
            return False

def main():
    """主函数 - 测试球队ID管理器"""
    
    print("=" * 70)
    print("球队ID管理器测试")
    print("=" * 70)
    
    # 创建管理器
    manager = TeamIDManager()
    
    # 测试1: 获取已知球队
    print("\n🧪 测试1: 获取已知球队")
    test_teams = ["Liverpool", "Paris Saint-Germain", "Bayern Munich"]
    
    for team in test_teams:
        team_id = manager.get_team_id(team)
        if team_id:
            print(f"  ✅ {team}: {team_id}")
        else:
            print(f"  ❌ {team}: 未找到")
    
    # 测试2: 搜索不存在的球队
    print("\n🧪 测试2: 搜索不存在的球队")
    unknown_team = "Test Team XYZ"
    team_id = manager.get_team_id(unknown_team)
    if team_id:
        print(f"  ⚠ {unknown_team}: {team_id} (意外找到)")
    else:
        print(f"  ✅ {unknown_team}: 未找到 (符合预期)")
    
    # 测试3: 数据库统计
    print("\n🧪 测试3: 数据库统计")
    stats = manager.get_stats()
    for key, value in stats.items():
        print(f"  {key}: {value}")
    
    # 测试4: 搜索功能
    print("\n🧪 测试4: 搜索功能")
    search_results = manager.search_teams("liv")
    print(f"  搜索 'liv' 找到 {len(search_results)} 个结果:")
    for team_name, team_data in search_results:
        print(f"    - {team_name}: {team_data['id']}")
    
    print("\n" + "=" * 70)
    print("测试完成")
    print("=" * 70)

if __name__ == "__main__":
    main()