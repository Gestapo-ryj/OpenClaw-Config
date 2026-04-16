#!/usr/bin/env python3
"""
FlashScore 赔率数据命令行工具
"""

import argparse
import json
import sys
import os
from datetime import datetime

# 添加当前目录到路径
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from flashscore_odds_api import FlashScoreOddsAPI
except ImportError:
    print("错误: 无法导入 FlashScoreOddsAPI")
    print("请确保 flashscore_odds_api.py 在同一目录下")
    sys.exit(1)

def display_odds(odds, detailed=False):
    """显示赔率数据"""
    if not odds:
        print("未找到赔率数据")
        return
    
    print(f"\n📊 赔率分析报告")
    print("=" * 50)
    
    # 显示基本信息
    if 'teams' in odds:
        teams = odds['teams']
        print(f"比赛: {teams['home']['name']} 🆚 {teams['away']['name']}")
    
    print(f"博彩公司: {odds['bookmaker']}")
    print(f"投注类型: {odds['bet_type']} ({odds['bet_scope']})")
    print(f"查询时间: {odds['timestamp']}")
    
    print(f"\n🎯 当前赔率:")
    print("-" * 30)
    for outcome, data in odds['odds'].items():
        outcome_name = {'home': '主胜', 'draw': '平局', 'away': '客胜'}.get(outcome, outcome)
        print(f"{outcome_name:8} {data['current']:6} (开盘: {data['opening']})")
    
    # 显示变化分析
    if 'changes' in odds and any(odds['changes'].values()):
        print(f"\n📈 赔率变化:")
        print("-" * 30)
        for outcome, change in odds['changes'].items():
            if change:
                outcome_name = {'home': '主胜', 'draw': '平局', 'away': '客胜'}.get(outcome, outcome)
                change_type = {'UP': '📈上涨', 'DOWN': '📉下跌'}.get(change['type'], change['type'])
                change_pct = change.get('change_pct')
                pct_str = f"({change_pct:.1f}%)" if change_pct else ""
                print(f"{outcome_name:8} {change_type:8} {pct_str}")
    
    # 显示概率分析
    if 'analysis' in odds and 'implied_probabilities' in odds['analysis']:
        print(f"\n🎲 隐含概率:")
        print("-" * 30)
        probs = odds['analysis']['implied_probabilities']
        print(f"主胜概率: {probs['home']:8}")
        print(f"平局概率: {probs['draw']:8}")
        print(f"客胜概率: {probs['away']:8}")
        print(f"博彩利润: {probs['overround']:8}")
    
    # 详细模式显示更多信息
    if detailed:
        print(f"\n🔍 详细信息:")
        print("-" * 30)
        print(f"Event ID: {odds.get('event_id', 'N/A')}")
        print(f"Bookmaker ID: {odds.get('bookmaker_id', 'N/A')}")
        print(f"Bet Type Code: {odds.get('bet_type_code', 'N/A')}")
        print(f"Bet Scope Code: {odds.get('bet_scope_code', 'N/A')}")
        
        if 'analysis' in odds:
            analysis = odds['analysis']
            if 'favorite' in analysis:
                favorite = {'home': '主队', 'draw': '平局', 'away': '客队'}.get(analysis['favorite'], analysis['favorite'])
                print(f"热门选项: {favorite}")
            if 'odds_range' in analysis:
                print(f"赔率范围: {analysis['odds_range']}")
            if 'odds_spread' in analysis:
                print(f"赔率差距: {analysis['odds_spread']}")
    
    print("\n" + "=" * 50)

def save_results(odds, output_file):
    """保存结果到文件"""
    if not odds:
        print("没有数据可保存")
        return
    
    try:
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(odds, f, ensure_ascii=False, indent=2)
        print(f"✓ 数据已保存到: {output_file}")
    except Exception as e:
        print(f"保存文件时出错: {e}")

def main():
    parser = argparse.ArgumentParser(
        description='FlashScore 赔率数据命令行工具',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
使用示例:
  %(prog)s --event nmFfvLPh                    # 通过eventId查询
  %(prog)s --url https://www.flashscore.com/match/football/getafe-dboeiWOt/levante-G8FL0ShI/
  %(prog)s --event nmFfvLPh --bookmaker 1      # 指定博彩公司
  %(prog)s --event nmFfvLPh --detailed         # 显示详细信息
  %(prog)s --event nmFfvLPh --output odds.json # 保存到文件
        """
    )
    
    # 查询方式
    query_group = parser.add_argument_group('查询方式')
    query_group.add_argument('--event', type=str, help='比赛事件ID (如: nmFfvLPh)')
    query_group.add_argument('--url', type=str, help='比赛URL')
    
    # 查询参数
    param_group = parser.add_argument_group('查询参数')
    param_group.add_argument('--bookmaker', type=int, default=417, 
                           help='博彩公司ID (默认: 417)')
    param_group.add_argument('--bet-type', type=str, default='HOME_DRAW_AWAY',
                           choices=['HOME_DRAW_AWAY', 'ASIAN_HANDICAP', 'OVER_UNDER'],
                           help='投注类型 (默认: HOME_DRAW_AWAY)')
    param_group.add_argument('--bet-scope', type=str, default='FULL_TIME',
                           choices=['FULL_TIME', 'FIRST_HALF', 'SECOND_HALF'],
                           help='投注范围 (默认: FULL_TIME)')
    
    # 输出选项
    output_group = parser.add_argument_group('输出选项')
    output_group.add_argument('--detailed', action='store_true', 
                            help='显示详细信息')
    output_group.add_argument('--output', type=str, 
                            help='保存结果到文件')
    output_group.add_argument('--quiet', action='store_true',
                            help='安静模式，只输出必要信息')
    
    args = parser.parse_args()
    
    # 检查参数
    if not args.event and not args.url:
        parser.print_help()
        print("\n错误: 必须提供 --event 或 --url 参数")
        sys.exit(1)
    
    # 创建API客户端
    api = FlashScoreOddsAPI()
    
    # 执行查询
    odds = None
    
    if args.event:
        if not args.quiet:
            print(f"查询事件ID: {args.event}")
            print(f"博彩公司: {args.bookmaker}")
            print(f"投注类型: {args.bet_type}")
        
        odds = api.get_odds(
            event_id=args.event,
            bookmaker_id=args.bookmaker,
            bet_type=args.bet_type,
            bet_scope=args.bet_scope
        )
    
    elif args.url:
        if not args.quiet:
            print(f"查询URL: {args.url}")
        
        odds = api.get_match_odds_by_url(args.url)
        
        # 如果通过URL查询，可以覆盖部分参数
        if odds and (args.bookmaker != 417 or args.bet_type != 'HOME_DRAW_AWAY'):
            # 使用新参数重新查询
            event_id = odds.get('event_id')
            if event_id:
                odds = api.get_odds(
                    event_id=event_id,
                    bookmaker_id=args.bookmaker,
                    bet_type=args.bet_type,
                    bet_scope=args.bet_scope
                )
    
    # 显示结果
    if odds:
        if not args.quiet:
            display_odds(odds, args.detailed)
        else:
            # 安静模式只输出关键信息
            if 'odds' in odds:
                home = odds['odds'].get('home', {}).get('current', 'N/A')
                draw = odds['odds'].get('draw', {}).get('current', 'N/A')
                away = odds['odds'].get('away', {}).get('current', 'N/A')
                print(f"{home},{draw},{away}")
        
        # 保存结果
        if args.output:
            save_results(odds, args.output)
    else:
        print("未找到赔率数据")
        sys.exit(1)

if __name__ == "__main__":
    main()