#!/usr/bin/env python3
"""
完整的工作流程 - 使用球队ID管理器
按照4步流程获取比赛赔率：
1. 查找两个队的球队ID（优先从本地数据库）
2. 用球队ID拼接出球赛详情页链接
3. 用球赛详情页链接获取比赛ID（eventId）
4. 用比赛ID查赔率信息
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from scripts.team_id_manager import TeamIDManager
from scripts.extract_event_id import extract_event_id_from_url
from scripts.get_odds import get_odds_by_event_id
import argparse
from datetime import datetime

class CompleteWorkflow:
    """完整的工作流程类"""
    
    def __init__(self, use_cache=True):
        """
        初始化工作流程
        
        Args:
            use_cache: 是否使用缓存
        """
        self.team_manager = TeamIDManager()
        self.use_cache = use_cache
    
    def step1_find_team_ids(self, home_team, away_team, force_refresh=False):
        """
        步骤1: 查找两个队的球队ID
        
        Args:
            home_team: 主队名称
            away_team: 客队名称
            force_refresh: 是否强制刷新
            
        Returns:
            dict: {home_team_id, away_team_id} or None
        """
        print("=" * 70)
        print("步骤1: 查找球队ID")
        print("=" * 70)
        
        print(f"主队: {home_team}")
        print(f"客队: {away_team}")
        print(f"使用缓存: {'是' if self.use_cache and not force_refresh else '否'}")
        
        # 查找主队ID
        print(f"\n🔍 查找主队ID: {home_team}")
        home_team_id = self.team_manager.get_team_id(home_team, force_refresh)
        
        if not home_team_id:
            print(f"❌ 未找到主队ID: {home_team}")
            return None
        
        # 查找客队ID
        print(f"\n🔍 查找客队ID: {away_team}")
        away_team_id = self.team_manager.get_team_id(away_team, force_refresh)
        
        if not away_team_id:
            print(f"❌ 未找到客队ID: {away_team}")
            return None
        
        print(f"\n✅ 步骤1完成!")
        print(f"   主队ID: {home_team_id}")
        print(f"   客队ID: {away_team_id}")
        
        return {
            'home_team': home_team,
            'away_team': away_team,
            'home_team_id': home_team_id,
            'away_team_id': away_team_id,
        }
    
    def step2_construct_match_url(self, team_ids):
        """
        步骤2: 用球队ID拼接出球赛详情页链接
        
        Args:
            team_ids: 步骤1返回的球队ID字典
            
        Returns:
            str: 比赛URL or None
        """
        print("\n" + "=" * 70)
        print("步骤2: 构造比赛URL")
        print("=" * 70)
        
        home_team = team_ids['home_team']
        away_team = team_ids['away_team']
        home_team_id = team_ids['home_team_id']
        away_team_id = team_ids['away_team_id']
        
        # 构造安全的球队名称（用于URL）
        def safe_team_name(team_name):
            return team_name.lower().replace(' ', '-').replace('.', '').replace("'", "")
        
        home_safe = safe_team_name(home_team)
        away_safe = safe_team_name(away_team)
        
        # 构造URL
        match_url = f"https://www.flashscore.com/match/football/{home_safe}-{home_team_id}/{away_safe}-{away_team_id}/"
        
        print(f"主队URL部分: {home_safe}-{home_team_id}")
        print(f"客队URL部分: {away_safe}-{away_team_id}")
        print(f"\n🔗 构造的比赛URL:")
        print(f"  {match_url}")
        
        # 验证URL格式
        print(f"\n🔍 验证URL格式...")
        if len(home_team_id) == 8 and len(away_team_id) == 8:
            print(f"✅ 球队ID格式正确 (8字符)")
        else:
            print(f"⚠ 球队ID长度异常: 主队={len(home_team_id)}, 客队={len(away_team_id)}")
        
        # 测试URL可访问性
        print(f"\n🔍 测试URL可访问性...")
        try:
            import requests
            headers = {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            }
            
            response = requests.head(match_url, headers=headers, timeout=5, allow_redirects=True)
            
            if response.status_code == 200:
                final_url = response.url
                print(f"✅ URL可访问 (状态码: 200)")
                print(f"   最终URL: {final_url}")
                
                # 检查是否重定向
                if final_url != match_url:
                    print(f"   ⚠ URL被重定向")
                    print(f"   原始URL: {match_url}")
                    print(f"   最终URL: {final_url}")
                    
                    # 更新为最终URL
                    match_url = final_url
            else:
                print(f"⚠ URL访问状态码: {response.status_code}")
                print(f"   比赛可能不存在或已结束")
        
        except Exception as e:
            print(f"⚠ URL测试错误: {e}")
            print(f"   继续流程，可能比赛页面不存在")
        
        team_ids['match_url'] = match_url
        team_ids['final_url'] = match_url  # 可能被更新为重定向后的URL
        
        print(f"\n✅ 步骤2完成!")
        print(f"   比赛URL: {match_url}")
        
        return team_ids
    
    def step3_extract_event_id(self, workflow_data):
        """
        步骤3: 用球赛详情页链接获取比赛ID（eventId）
        
        Args:
            workflow_data: 包含match_url的数据
            
        Returns:
            dict: 包含event_id的数据 or None
        """
        print("\n" + "=" * 70)
        print("步骤3: 提取比赛ID (eventId)")
        print("=" * 70)
        
        match_url = workflow_data['match_url']
        
        print(f"比赛URL: {match_url}")
        print(f"\n🔍 从页面提取eventId...")
        
        # 使用现有的提取函数
        try:
            event_id = extract_event_id_from_url(match_url)
            
            if event_id:
                print(f"✅ 成功提取eventId: {event_id}")
                workflow_data['event_id'] = event_id
                
                # 验证eventId格式
                if len(event_id) == 8:
                    print(f"✅ eventId格式正确 (8字符)")
                else:
                    print(f"⚠ eventId长度异常: {len(event_id)} 字符")
                
                print(f"\n✅ 步骤3完成!")
                print(f"   EventId: {event_id}")
                
                return workflow_data
            else:
                print(f"❌ 无法从页面提取eventId")
                print(f"\n💡 可能原因:")
                print(f"   1. 比赛页面不存在")
                print(f"   2. 比赛已结束或未开始")
                print(f"   3. 页面结构已更改")
                print(f"   4. 需要JavaScript执行")
                
                return None
        
        except Exception as e:
            print(f"❌ 提取eventId时出错: {e}")
            return None
    
    def step4_get_odds(self, workflow_data):
        """
        步骤4: 用比赛ID查赔率信息
        
        Args:
            workflow_data: 包含event_id的数据
            
        Returns:
            dict: 包含赔率数据的结果
        """
        print("\n" + "=" * 70)
        print("步骤4: 获取赔率信息")
        print("=" * 70)
        
        event_id = workflow_data['event_id']
        home_team = workflow_data['home_team']
        away_team = workflow_data['away_team']
        
        print(f"比赛: {home_team} vs {away_team}")
        print(f"EventId: {event_id}")
        print(f"\n💰 获取赔率数据...")
        
        # 使用现有的获取赔率函数
        try:
            odds_data = get_odds_by_event_id(event_id)
            
            if odds_data:
                print(f"✅ 成功获取赔率数据")
                workflow_data['odds_data'] = odds_data
                
                # 显示赔率信息
                print(f"\n📊 赔率信息:")
                if 'home' in odds_data:
                    print(f"   {home_team}: {odds_data['home'].get('value', 'N/A')}")
                if 'draw' in odds_data:
                    print(f"   平局: {odds_data['draw'].get('value', 'N/A')}")
                if 'away' in odds_data:
                    print(f"   {away_team}: {odds_data['away'].get('value', 'N/A')}")
                
                print(f"\n✅ 步骤4完成!")
                print(f"   成功获取完整赔率数据")
                
                return workflow_data
            else:
                print(f"❌ 无法获取赔率数据")
                print(f"\n💡 可能原因:")
                print(f"   1. EventId无效")
                print(f"   2. 比赛已结束")
                print(f"   3. API限制")
                print(f"   4. 网络问题")
                
                return None
        
        except Exception as e:
            print(f"❌ 获取赔率时出错: {e}")
            return None
    
    def run_complete_workflow(self, home_team, away_team, force_refresh=False):
        """
        运行完整的工作流程
        
        Args:
            home_team: 主队名称
            away_team: 客队名称
            force_refresh: 是否强制刷新球队ID
            
        Returns:
            dict: 完整的工作流程结果 or None
        """
        print("=" * 70)
        print("FlashScore赔率分析 - 完整工作流程")
        print("=" * 70)
        print(f"比赛: {home_team} vs {away_team}")
        print(f"时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print()
        
        # 步骤1: 查找球队ID
        step1_result = self.step1_find_team_ids(home_team, away_team, force_refresh)
        if not step1_result:
            print(f"\n❌ 工作流程在步骤1失败")
            return None
        
        # 步骤2: 构造比赛URL
        step2_result = self.step2_construct_match_url(step1_result)
        if not step2_result:
            print(f"\n❌ 工作流程在步骤2失败")
            return None
        
        # 步骤3: 提取eventId
        step3_result = self.step3_extract_event_id(step2_result)
        if not step3_result:
            print(f"\n❌ 工作流程在步骤3失败")
            return None
        
        # 步骤4: 获取赔率
        step4_result = self.step4_get_odds(step3_result)
        if not step4_result:
            print(f"\n❌ 工作流程在步骤4失败")
            return None
        
        # 工作流程完成
        print("\n" + "=" * 70)
        print("🎉 完整工作流程成功完成!")
        print("=" * 70)
        
        # 显示最终结果
        final_result = step4_result
        self._display_final_result(final_result)
        
        # 保存结果
        self._save_workflow_result(final_result)
        
        return final_result
    
    def _display_final_result(self, result):
        """显示最终结果"""
        print(f"\n📋 最终结果:")
        print(f"   比赛: {result['home_team']} vs {result['away_team']}")
        print(f"   主队ID: {result['home_team_id']}")
        print(f"   客队ID: {result['away_team_id']}")
        print(f"   比赛URL: {result['match_url']}")
        print(f"   EventId: {result['event_id']}")
        
        if 'odds_data' in result:
            odds = result['odds_data']
            print(f"\n💰 赔率数据:")
            if 'home' in odds:
                print(f"   {result['home_team']}: {odds['home'].get('value', 'N/A')}")
            if 'draw' in odds:
                print(f"   平局: {odds['draw'].get('value', 'N/A')}")
            if 'away' in odds:
                print(f"   {result['away_team']}: {odds['away'].get('value', 'N/A')}")
    
    def _save_workflow_result(self, result):
        """保存工作流程结果"""
        import json
        from datetime import datetime
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        safe_home = result['home_team'].lower().replace(' ', '_')
        safe_away = result['away_team'].lower().replace(' ', '_')
        
        filename = f"workflow_result_{safe_home}_vs_{safe_away}_{timestamp}.json"
        
        try:
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(result, f, indent=2, ensure_ascii=False)
            print(f"\n💾 结果已保存到: {filename}")
        except Exception as e:
            print(f"\n⚠ 保存结果失败: {e}")

def main():
    """主函数 - 命令行接口"""
    
    from datetime import datetime
    
    parser = argparse.ArgumentParser(description='完整的工作流程工具')
    parser.add_argument('home_team', help='主队名称')
    parser.add_argument('away_team', help='客队名称')
    parser.add_argument('--refresh', action='store_true', help='强制刷新球队ID（忽略缓存）')
    parser.add_argument('--no-cache', action='store_true', help='不使用缓存')
    
    args = parser.parse_args()
    
    print("=" * 70)
    print("FlashScore赔率分析 - 完整4步工作流程")
    print("=" * 70)
    
    # 创建工作流程实例
    workflow = CompleteWorkflow(use_cache=not args.no_cache)
    
    # 运行完整工作流程
    result = workflow.run_complete_workflow(
        args.home_team,
        args.away_team,
        force_refresh=args.refresh
    )
    
    if result:
        print(f"\n✅ 工作流程成功完成!")
        print(f"   比赛: {args.home_team} vs {args.away_team}")
        print(f"   EventId: {result['event_id']}")
        
        # 显示使用信息
        print(f"\n🔧 后续使用:")
        print(f"   使用eventId获取赔率: python get_odds.py --event {result['event_id']}")
        print(f"   使用命令行工具: python flashscore_cli.py --event {result['event_id']}")
    else:
        print(f"\n❌ 工作流程失败")
        print(f"\n💡 建议:")
        print(f"   1. 检查球队名称是否正确")
        print(f"   2. 尝试强制刷新: --refresh")
        print(f"   3. 检查网络连接")
        print(f"   4. 手动查找eventId")
    
    print("\n" + "=" * 70)
    print("工作流程结束")
    print("=" * 70)

if __name__ == "__main__":
    main()