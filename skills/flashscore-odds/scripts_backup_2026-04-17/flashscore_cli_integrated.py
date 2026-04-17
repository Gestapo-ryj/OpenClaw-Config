#!/usr/bin/env python3
"""
FlashScore赔率分析命令行工具 - 集成版本
包含完整的工作流程和球队ID管理
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import argparse
import json
from datetime import datetime

def main():
    """主函数"""
    
    parser = argparse.ArgumentParser(
        description='FlashScore赔率分析工具 - 集成版本',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
示例:
  # 完整工作流程
  python flashscore_cli.py workflow "Liverpool" "Paris Saint-Germain"
  
  # 使用eventId获取赔率
  python flashscore_cli.py odds --event OdLTIvyf
  
  # 使用比赛URL获取赔率
  python flashscore_cli.py odds --url "https://www.flashscore.com/match/football/liverpool-lId4TMwf/psg-CjhkPw0k/"
  
  # 球队ID管理
  python flashscore_cli.py team get "Liverpool"
  python flashscore_cli.py team batch "Liverpool" "Paris Saint-Germain"
  python flashscore_cli.py team search "manchester"
  python flashscore_cli.py team stats
  
  # 提取eventId
  python flashscore_cli.py extract "https://www.flashscore.com/match/football/liverpool-lId4TMwf/psg-CjhkPw0k/"
  
  # 快速分析已知比赛
  python flashscore_cli.py quick liverpool-psg
        """
    )
    
    subparsers = parser.add_subparsers(dest='command', help='命令')
    
    # workflow 命令: 完整工作流程
    workflow_parser = subparsers.add_parser('workflow', help='完整4步工作流程')
    workflow_parser.add_argument('home_team', help='主队名称')
    workflow_parser.add_argument('away_team', help='客队名称')
    workflow_parser.add_argument('--refresh', action='store_true', help='强制刷新球队ID')
    workflow_parser.add_argument('--no-cache', action='store_true', help='不使用缓存')
    
    # odds 命令: 获取赔率
    odds_parser = subparsers.add_parser('odds', help='获取赔率')
    odds_group = odds_parser.add_mutually_exclusive_group(required=True)
    odds_group.add_argument('--event', help='使用eventId')
    odds_group.add_argument('--url', help='使用比赛URL')
    odds_parser.add_argument('--detailed', action='store_true', help='显示详细分析')
    odds_parser.add_argument('--save', help='保存结果到文件')
    
    # team 命令: 球队ID管理
    team_parser = subparsers.add_parser('team', help='球队ID管理')
    team_subparsers = team_parser.add_subparsers(dest='team_command', help='球队命令')
    
    # team get
    team_get = team_subparsers.add_parser('get', help='获取球队ID')
    team_get.add_argument('team_name', help='球队名称')
    team_get.add_argument('--refresh', action='store_true', help='强制刷新')
    
    # team batch
    team_batch = team_subparsers.add_parser('batch', help='批量获取球队ID')
    team_batch.add_argument('team_names', nargs='+', help='球队名称列表')
    team_batch.add_argument('--refresh', action='store_true', help='强制刷新')
    
    # team search
    team_search = team_subparsers.add_parser('search', help='搜索球队')
    team_search.add_argument('keyword', help='搜索关键词')
    
    # team stats
    team_subparsers.add_parser('stats', help='显示数据库统计')
    
    # team add
    team_add = team_subparsers.add_parser('add', help='手动添加球队')
    team_add.add_argument('team_name', help='球队名称')
    team_add.add_argument('team_id', help='球队ID')
    team_add.add_argument('--league', default='Unknown', help='所属联赛')
    team_add.add_argument('--verified', action='store_true', help='标记为已验证')
    
    # team list
    team_list = team_subparsers.add_parser('list', help='列出球队')
    team_list.add_argument('--limit', type=int, default=20, help='显示数量限制')
    team_list.add_argument('--verified-only', action='store_true', help='只显示已验证的')
    
    # extract 命令: 提取eventId
    extract_parser = subparsers.add_parser('extract', help='从URL提取eventId')
    extract_parser.add_argument('url', help='比赛URL')
    
    # quick 命令: 快速分析
    quick_parser = subparsers.add_parser('quick', help='快速分析已知比赛')
    quick_parser.add_argument('match', choices=['liverpool-psg', 'levante-getafe'], help='已知比赛')
    
    args = parser.parse_args()
    
    if not args.command:
        parser.print_help()
        return
    
    print("=" * 70)
    print("FlashScore赔率分析工具 - 集成版本")
    print("=" * 70)
    print(f"时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    try:
        if args.command == 'workflow':
            # 完整工作流程
            from scripts.complete_workflow_new import CompleteWorkflow
            
            print(f"🔧 完整工作流程: {args.home_team} vs {args.away_team}")
            
            workflow = CompleteWorkflow(use_cache=not args.no_cache)
            result = workflow.run_complete_workflow(
                args.home_team,
                args.away_team,
                force_refresh=args.refresh
            )
            
            if result:
                print(f"\n✅ 工作流程成功!")
                print(f"   EventId: {result['event_id']}")
                print(f"   比赛URL: {result['match_url']}")
            else:
                print(f"\n❌ 工作流程失败")
        
        elif args.command == 'odds':
            # 获取赔率
            from scripts.get_odds import get_odds_by_event_id, get_odds_by_url
            
            if args.event:
                print(f"💰 使用eventId获取赔率: {args.event}")
                odds_data = get_odds_by_event_id(args.event)
            elif args.url:
                print(f"💰 使用URL获取赔率: {args.url}")
                odds_data = get_odds_by_url(args.url)
            
            if odds_data:
                print(f"✅ 成功获取赔率数据")
                
                # 显示赔率
                print(f"\n📊 赔率信息:")
                if 'home' in odds_data:
                    print(f"   主胜: {odds_data['home'].get('value', 'N/A')}")
                if 'draw' in odds_data:
                    print(f"   平局: {odds_data['draw'].get('value', 'N/A')}")
                if 'away' in odds_data:
                    print(f"   客胜: {odds_data['away'].get('value', 'N/A')}")
                
                # 保存结果
                if args.save:
                    import json
                    with open(args.save, 'w', encoding='utf-8') as f:
                        json.dump(odds_data, f, indent=2, ensure_ascii=False)
                    print(f"\n💾 结果已保存到: {args.save}")
                
                # 详细分析
                if args.detailed:
                    from scripts.odds_analyzer import analyze_odds
                    analysis = analyze_odds(odds_data)
                    
                    if analysis:
                        print(f"\n📈 详细分析:")
                        print(f"   隐含概率: 主胜 {analysis.get('home_prob', 0):.1f}%, "
                              f"平局 {analysis.get('draw_prob', 0):.1f}%, "
                              f"客胜 {analysis.get('away_prob', 0):.1f}%")
                        print(f"   博彩公司利润: {analysis.get('bookmaker_margin', 0):.1f}%")
            else:
                print(f"❌ 获取赔率失败")
        
        elif args.command == 'team':
            # 球队ID管理
            from scripts.team_id_manager import TeamIDManager
            
            manager = TeamIDManager()
            
            if args.team_command == 'get':
                # 获取单个球队ID
                print(f"🔍 获取球队ID: {args.team_name}")
                
                team_id = manager.get_team_id(args.team_name, args.refresh)
                
                if team_id:
                    team_data = manager.database.get(args.team_name, {})
                    print(f"✅ 找到: {team_id}")
                    print(f"   联赛: {team_data.get('league', 'Unknown')}")
                    print(f"   验证: {'✅' if team_data.get('verified', False) else '⚠'}")
                else:
                    print(f"❌ 未找到")
            
            elif args.team_command == 'batch':
                # 批量获取
                print(f"🔍 批量获取 {len(args.team_names)} 个球队ID")
                
                results = {}
                for team_name in args.team_names:
                    team_id = manager.get_team_id(team_name, args.refresh)
                    results[team_name] = team_id
                    status = "✅" if team_id else "❌"
                    print(f"  {status} {team_name}: {team_id or '未找到'}")
                
                found = sum(1 for v in results.values() if v)
                print(f"\n📊 结果: {found}/{len(results)} 成功")
            
            elif args.team_command == 'search':
                # 搜索球队
                print(f"🔍 搜索球队: {args.keyword}")
                
                results = manager.search_teams(args.keyword)
                
                if results:
                    print(f"✅ 找到 {len(results)} 个匹配:")
                    for team_name, team_data in results:
                        verified = "✅" if team_data.get('verified', False) else "⚠"
                        print(f"  {verified} {team_name}: {team_data['id']}")
                else:
                    print(f"❌ 未找到匹配")
            
            elif args.team_command == 'stats':
                # 显示统计
                print("📊 球队ID数据库统计")
                
                stats = manager.get_stats()
                print(f"总球队数: {stats['total_teams']}")
                print(f"已验证球队: {stats['verified_teams']}")
                print(f"验证率: {stats['verification_rate']}")
                
                # 显示最近更新
                print(f"\n📅 最近更新的球队:")
                sorted_teams = sorted(
                    manager.database.items(),
                    key=lambda x: x[1].get('last_verified', '2000-01-01'),
                    reverse=True
                )
                
                for team_name, team_data in sorted_teams[:5]:
                    verified = "✅" if team_data.get('verified', False) else "⚠"
                    print(f"  {verified} {team_name}: {team_data['id']}")
            
            elif args.team_command == 'add':
                # 添加球队
                print(f"📝 添加球队: {args.team_name} -> {args.team_id}")
                
                success = manager.add_team(
                    args.team_name,
                    args.team_id,
                    league=args.league,
                    verified=args.verified,
                    source="手动添加"
                )
                
                if success:
                    print(f"✅ 添加成功")
                else:
                    print(f"❌ 添加失败")
            
            elif args.team_command == 'list':
                # 列出球队
                print(f"📋 列出球队 (显示前 {args.limit} 个)")
                
                teams = list(manager.database.items())
                
                if args.verified_only:
                    teams = [(name, data) for name, data in teams if data.get('verified', False)]
                    print(f"  只显示已验证的球队: {len(teams)} 个")
                
                for i, (team_name, team_data) in enumerate(teams[:args.limit]):
                    verified = "✅" if team_data.get('verified', False) else "⚠"
                    print(f"  {i+1:2d}. {verified} {team_name:30} {team_data['id']:10}")
        
        elif args.command == 'extract':
            # 提取eventId
            from scripts.extract_event_id import extract_event_id_from_url
            
            print(f"🔍 从URL提取eventId: {args.url}")
            
            event_id = extract_event_id_from_url(args.url)
            
            if event_id:
                print(f"✅ 提取成功: {event_id}")
                
                # 验证格式
                if len(event_id) == 8:
                    print(f"✅ 格式正确 (8字符)")
                else:
                    print(f"⚠ 格式异常: {len(event_id)} 字符")
            else:
                print(f"❌ 提取失败")
        
        elif args.command == 'quick':
            # 快速分析已知比赛
            print(f"⚡ 快速分析: {args.match}")
            
            known_matches = {
                'liverpool-psg': {
                    'event_id': 'OdLTIvyf',
                    'description': '利物浦 vs 巴黎圣日耳曼',
                    'url': 'https://www.flashscore.com/match/football/liverpool-lId4TMwf/psg-CjhkPw0k/'
                },
                'levante-getafe': {
                    'event_id': 'nmFfvLPh',
                    'description': '莱万特 vs 赫塔菲',
                    'url': 'https://www.flashscore.com/match/football/getafe-dboeiWOt/levante-G8FL0ShI/'
                }
            }
            
            if args.match in known_matches:
                match_info = known_matches[args.match]
                print(f"比赛: {match_info['description']}")
                print(f"EventId: {match_info['event_id']}")
                print(f"URL: {match_info['url']}")
                
                # 获取赔率
                from scripts.get_odds import get_odds_by_event_id
                odds_data = get_odds_by_event_id(match_info['event_id'])
                
                if odds_data:
                    print(f"\n💰 赔率数据:")
                    if 'home' in odds_data:
                        print(f"   主胜: {odds_data['home'].get('value', 'N/A')}")
                    if 'draw' in odds_data:
                        print(f"   平局: {odds_data['draw'].get('value', 'N/A')}")
                    if 'away' in odds_data:
                        print(f"   客胜: {odds_data['away'].get('value', 'N/A')}")
                else:
                    print(f"\n❌ 获取赔率失败")
            else:
                print(f"❌ 未知的比赛: {args.match}")
                print(f"可用的比赛: {', '.join(known_matches.keys())}")
    
    except ImportError as e:
        print(f"❌ 导入模块失败: {e}")
        print(f"请确保所有依赖已安装: pip install -r requirements.txt")
    except Exception as e:
        print(f"❌ 执行错误: {e}")
    
    print("\n" + "=" * 70)
    print("命令执行完成")
    print("=" * 70)

if __name__ == "__main__":
    main()