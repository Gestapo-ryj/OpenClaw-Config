#!/usr/bin/env python3
"""
J1联赛球队分析示例
"""

import sys
import os

# 添加父目录到路径
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def analyze_team_performance(all_matches, team_name):
    """
    分析球队表现
    """
    team_matches = []
    
    for round_num, matches in all_matches.items():
        for match in matches:
            if match['home_team'] == team_name or match['away_team'] == team_name:
                # 复制比赛信息并添加轮次
                match_copy = match.copy()
                match_copy['round'] = round_num
                team_matches.append(match_copy)
    
    if not team_matches:
        return None
    
    # 统计战绩
    stats = {
        'played': 0,
        'wins': 0,
        'draws': 0,
        'losses': 0,
        'goals_for': 0,
        'goals_against': 0,
        'home_games': 0,
        'away_games': 0
    }
    
    for match in team_matches:
        stats['played'] += 1
        
        # 判断主客场
        if match['home_team'] == team_name:
            stats['home_games'] += 1
            team_score = match['home_score']
            opponent_score = match['away_score']
            is_home = True
        else:
            stats['away_games'] += 1
            team_score = match['away_score']
            opponent_score = match['home_score']
            is_home = False
        
        # 统计进球
        stats['goals_for'] += team_score
        stats['goals_against'] += opponent_score
        
        # 判断胜负
        if team_score > opponent_score:
            stats['wins'] += 1
        elif team_score < opponent_score:
            stats['losses'] += 1
        else:
            stats['draws'] += 1
    
    # 计算积分和净胜球
    stats['points'] = stats['wins'] * 3 + stats['draws']
    stats['goal_difference'] = stats['goals_for'] - stats['goals_against']
    
    # 计算胜率
    if stats['played'] > 0:
        stats['win_rate'] = stats['wins'] / stats['played'] * 100
        stats['draw_rate'] = stats['draws'] / stats['played'] * 100
        stats['loss_rate'] = stats['losses'] / stats['played'] * 100
    else:
        stats['win_rate'] = stats['draw_rate'] = stats['loss_rate'] = 0
    
    return {
        'team_name': team_name,
        'matches': team_matches,
        'stats': stats
    }

def generate_team_report(team_analysis):
    """生成球队报告"""
    if not team_analysis:
        return "未找到该球队的比赛数据"
    
    team_name = team_analysis['team_name']
    stats = team_analysis['stats']
    matches = team_analysis['matches']
    
    report = []
    report.append(f"# {team_name} 球队分析报告")
    report.append("")
    
    # 基本统计
    report.append("## 📊 基本统计")
    report.append("")
    report.append(f"- **比赛场次**: {stats['played']}场")
    report.append(f"- **胜/平/负**: {stats['wins']}胜/{stats['draws']}平/{stats['losses']}负")
    report.append(f"- **胜率**: {stats['win_rate']:.1f}%")
    report.append(f"- **积分**: {stats['points']}分")
    report.append(f"- **进球/失球**: {stats['goals_for']}/{stats['goals_against']}")
    report.append(f"- **净胜球**: {stats['goal_difference']:+d}")
    report.append(f"- **主场比赛**: {stats['home_games']}场")
    report.append(f"- **客场比赛**: {stats['away_games']}场")
    report.append("")
    
    # 详细比赛记录
    report.append("## 📅 比赛记录")
    report.append("")
    
    # 按轮次排序
    matches.sort(key=lambda x: x.get('round', 0))
    
    for match in matches:
        round_num = match.get('round', '?')
        time_str = match.get('time_short', '未知')
        
        if match['home_team'] == team_name:
            # 主场比赛
            vs_str = f"vs {match['away_team']}"
            result = "胜" if match['home_score'] > match['away_score'] else \
                     "负" if match['home_score'] < match['away_score'] else "平"
        else:
            # 客场比赛
            vs_str = f"@ {match['home_team']}"
            result = "胜" if match['away_score'] > match['home_score'] else \
                     "负" if match['away_score'] < match['home_score'] else "平"
        
        score = match['score']
        draw_mark = " ⏰" if match['is_draw'] else ""
        
        report.append(f"- **第{round_num}轮** {time_str} {vs_str} {score} ({result}){draw_mark}")
    
    report.append("")
    
    # 关键比赛
    report.append("## ⭐ 关键比赛")
    report.append("")
    
    # 找出大比分胜利
    big_wins = []
    for match in matches:
        if match['home_team'] == team_name:
            goal_diff = match['home_score'] - match['away_score']
            if goal_diff >= 3:  # 净胜3球以上
                big_wins.append((match, goal_diff, "主场"))
        else:
            goal_diff = match['away_score'] - match['home_score']
            if goal_diff >= 3:  # 净胜3球以上
                big_wins.append((match, goal_diff, "客场"))
    
    if big_wins:
        report.append("### 大比分胜利")
        for match, diff, venue in big_wins[:3]:  # 只显示前3场
            round_num = match.get('round', '?')
            opponent = match['away_team'] if venue == "主场" else match['home_team']
            report.append(f"- 第{round_num}轮 {venue} {match['score']} {opponent} (净胜{diff}球)")
        report.append("")
    
    # 平局比赛
    draws = [m for m in matches if m['is_draw']]
    if draws:
        report.append(f"### 平局比赛 ({len(draws)}场)")
        for match in draws[:3]:  # 只显示前3场
            round_num = match.get('round', '?')
            opponent = match['away_team'] if match['home_team'] == team_name else match['home_team']
            report.append(f"- 第{round_num}轮 {match['score']} {opponent}")
        report.append("")
    
    return "\n".join(report)

def main():
    """主函数"""
    print("J1联赛球队分析示例")
    print("=" * 60)
    
    # 这里需要实际数据，暂时只显示示例
    print("示例功能:")
    print("1. analyze_team_performance(all_matches, 'Nagoya Grampus')")
    print("2. generate_team_report(team_analysis)")
    print("")
    
    print("使用步骤:")
    print("1. 使用parse_flashscore_data解析数据")
    print("2. 调用analyze_team_performance分析球队")
    print("3. 调用generate_team_report生成报告")
    print("")
    
    print("示例输出格式:")
    print("-" * 40)
    
    # 模拟输出
    example_stats = {
        'played': 9,
        'wins': 1,
        'draws': 8,
        'losses': 0,
        'goals_for': 15,
        'goals_against': 12,
        'points': 11,
        'goal_difference': 3,
        'win_rate': 11.1,
        'home_games': 5,
        'away_games': 4
    }
    
    print(f"名古屋鲸八 (Nagoya Grampus)")
    print(f"比赛场次: {example_stats['played']}场")
    print(f"战绩: {example_stats['wins']}胜{example_stats['draws']}平{example_stats['losses']}负")
    print(f"积分: {example_stats['points']}分")
    print(f"进球/失球: {example_stats['goals_for']}/{example_stats['goals_against']}")
    print(f"净胜球: {example_stats['goal_difference']:+d}")

if __name__ == "__main__":
    main()