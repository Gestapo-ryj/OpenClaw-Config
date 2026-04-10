#!/usr/bin/env python3
"""
解析J2联赛数据
使用J1联赛分析skill的解析逻辑
"""

import re
from datetime import datetime

def parse_j2_data(data_text):
    """解析J2联赛数据"""
    print("=" * 80)
    print("J2联赛数据解析")
    print("使用J1联赛分析skill的经验")
    print("=" * 80)
    
    # 读取数据
    with open(data_text, 'r', encoding='utf-8') as f:
        content = f.read()
    
    print(f"已加载数据，大小: {len(content)} 字符")
    
    # 查找所有比赛条目
    match_pattern = r'AA÷([^~]+)~'
    match_entries = re.findall(match_pattern, content)
    
    print(f"找到 {len(match_entries)} 个比赛条目")
    
    # 解析比赛
    matches = []
    seen_matches = set()  # 用于去重
    
    for i, entry in enumerate(match_entries):
        try:
            match_info = parse_match_entry(entry)
            if match_info:
                # 创建唯一标识符去重
                match_id = f"{match_info['home_team']}_{match_info['away_team']}_{match_info['time']}"
                if match_id not in seen_matches:
                    seen_matches.add(match_id)
                    matches.append(match_info)
        except Exception as e:
            continue
    
    print(f"解析完成，有效比赛: {len(matches)} 场（已去重）")
    return matches

def parse_match_entry(entry):
    """解析比赛条目"""
    info = {}
    
    # 提取基本信息
    home_match = re.search(r'AE÷([^¬]+)', entry)
    away_match = re.search(r'AF÷([^¬]+)', entry)
    time_match = re.search(r'AD÷(\d+)', entry)
    at_match = re.search(r'AT÷(\d+)', entry)  # 主队常规比分
    au_match = re.search(r'AU÷(\d+)', entry)  # 客队常规比分
    
    if not (home_match and away_match and at_match and au_match):
        return None
    
    info['home_team'] = home_match.group(1)
    info['away_team'] = away_match.group(1)
    info['home_score'] = int(at_match.group(1))
    info['away_score'] = int(au_match.group(1))
    info['score'] = f"{info['home_score']}-{info['away_score']}"
    info['is_draw'] = info['home_score'] == info['away_score']
    
    # 提取轮次
    round_match = re.search(r'ER÷([^¬]+)', entry)
    if round_match:
        round_str = round_match.group(1)
        # 处理不同的轮次格式
        if 'Round' in round_str:
            info['round'] = round_str.replace('Round ', '')
        elif 'Final' in round_str:
            info['round'] = '决赛'
        elif 'Semi-finals' in round_str:
            info['round'] = '半决赛'
        else:
            info['round'] = round_str
    else:
        info['round'] = '未知'
    
    if time_match:
        timestamp = int(time_match.group(1))
        info['timestamp'] = timestamp
        info['time'] = datetime.fromtimestamp(timestamp).strftime('%Y-%m-%d %H:%M')
        info['time_short'] = datetime.fromtimestamp(timestamp).strftime('%H:%M')
        info['date'] = datetime.fromtimestamp(timestamp).strftime('%Y-%m-%d')
    else:
        info['time'] = "未知"
        info['time_short'] = "未知"
    
    return info

def generate_j2_report(matches, output_file):
    """生成J2联赛报告"""
    print("\n生成J2联赛报告...")
    
    # 按轮次分组
    round_matches = {}
    for match in matches:
        round_num = match.get('round', '未知')
        if round_num not in round_matches:
            round_matches[round_num] = []
        round_matches[round_num].append(match)
    
    # 按时间排序每个轮次的比赛
    for round_num in round_matches:
        round_matches[round_num].sort(key=lambda x: x.get('timestamp', 0))
    
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write("# 日职乙（J2联赛）赛程与比分报告\n\n")
        f.write("## 📋 报告说明\n\n")
        f.write("**数据来源**: FlashScore (https://www.flashscore.com/football/japan/j2-league/results/)  \n")
        f.write("**比分类型**: 90分钟常规时间比分（AT/AU字段）  \n")
        f.write("**生成时间**: 2026年4月11日  \n")
        f.write("**解析方法**: 基于J1联赛分析skill的经验  \n\n")
        
        f.write("## 📊 数据统计\n\n")
        f.write(f"- **总比赛场次**: {len(matches)}场  \n")
        
        # 统计平局
        draws = sum(1 for m in matches if m['is_draw'])
        f.write(f"- **平局场次**: {draws}场 ({draws/len(matches)*100:.1f}%)  \n")
        f.write(f"- **非平局场次**: {len(matches)-draws}场 ({(len(matches)-draws)/len(matches)*100:.1f}%)  \n\n")
        
        # 按轮次显示
        f.write("## 📅 比赛详情\n\n")
        
        # 按轮次排序（尝试数字排序）
        sorted_rounds = []
        for round_num in round_matches.keys():
            try:
                # 尝试转换为数字
                if round_num.isdigit():
                    sorted_rounds.append((int(round_num), round_num))
                else:
                    sorted_rounds.append((999, round_num))  # 非数字放后面
            except:
                sorted_rounds.append((999, round_num))
        
        sorted_rounds.sort()
        
        for _, round_num in sorted_rounds:
            round_list = round_matches[round_num]
            
            f.write(f"### {round_num}\n\n")
            
            for match in round_list:
                draw_mark = " ⏰" if match['is_draw'] else ""
                f.write(f"- **{match['time_short']}** {match['home_team']} **{match['score']}** {match['away_team']}{draw_mark}\n")
            
            # 轮次统计
            round_draws = sum(1 for m in round_list if m['is_draw'])
            f.write(f"\n**统计**: {len(round_list)}场比赛，{round_draws}场平局  \n\n")
        
        # 球队列表
        f.write("## 🏆 参赛球队\n\n")
        
        teams = set()
        for match in matches:
            teams.add(match['home_team'])
            teams.add(match['away_team'])
        
        f.write(f"共 {len(teams)} 支球队:\n\n")
        
        # 按字母排序
        sorted_teams = sorted(teams)
        for i, team in enumerate(sorted_teams, 1):
            f.write(f"{i}. {team}  \n")
        
        f.write("\n## 💡 数据说明\n\n")
        f.write("1. **⏰标记**: 表示该场比赛常规时间为平局  \n")
        f.write("2. **比分**: 所有比分均为90分钟常规时间比分  \n")
        f.write("3. **数据来源**: FlashScore网站，已去除重复条目  \n")
        f.write("4. **解析方法**: 基于J1联赛分析skill的成熟经验  \n\n")
        
        f.write("---\n\n")
        f.write("**报告生成完成** ✅  \n")
        f.write("**数据准确性**: 基于已验证的解析逻辑  \n")
    
    print(f"✅ 报告已生成: {output_file}")

def analyze_j2_teams(matches):
    """分析J2联赛球队"""
    print("\n" + "=" * 80)
    print("J2联赛球队分析")
    print("=" * 80)
    
    team_stats = {}
    
    for match in matches:
        home_team = match['home_team']
        away_team = match['away_team']
        
        # 初始化球队统计
        for team in [home_team, away_team]:
            if team not in team_stats:
                team_stats[team] = {
                    'played': 0, 'wins': 0, 'draws': 0, 'losses': 0,
                    'goals_for': 0, 'goals_against': 0, 'points': 0
                }
        
        # 更新统计
        home_stats = team_stats[home_team]
        away_stats = team_stats[away_team]
        
        home_stats['played'] += 1
        away_stats['played'] += 1
        
        home_stats['goals_for'] += match['home_score']
        home_stats['goals_against'] += match['away_score']
        away_stats['goals_for'] += match['away_score']
        away_stats['goals_against'] += match['home_score']
        
        if match['home_score'] > match['away_score']:
            home_stats['wins'] += 1
            home_stats['points'] += 3
            away_stats['losses'] += 1
        elif match['home_score'] < match['away_score']:
            away_stats['wins'] += 1
            away_stats['points'] += 3
            home_stats['losses'] += 1
        else:
            home_stats['draws'] += 1
            away_stats['draws'] += 1
            home_stats['points'] += 1
            away_stats['points'] += 1
    
    # 按积分排序
    sorted_teams = sorted(team_stats.items(), 
                         key=lambda x: (-x[1]['points'], 
                                       -(x[1]['goals_for'] - x[1]['goals_against']),
                                       -x[1]['goals_for']))
    
    print("球队积分榜:")
    print("-" * 70)
    print("排名 | 球队 | 场次 | 胜 | 平 | 负 | 进球 | 失球 | 净胜球 | 积分")
    print("-" * 70)
    
    for rank, (team, stats) in enumerate(sorted_teams[:10], 1):  # 只显示前10名
        goal_diff = stats['goals_for'] - stats['goals_against']
        print(f"{rank:2d} | {team:30} | {stats['played']:3d} | {stats['wins']:2d} | {stats['draws']:2d} | {stats['losses']:2d} | "
              f"{stats['goals_for']:4d} | {stats['goals_against']:4d} | {goal_diff:+4d} | {stats['points']:3d}")
    
    # 保存球队分析
    with open('j2_league_teams_analysis.md', 'w', encoding='utf-8') as f:
        f.write("# J2联赛球队分析\n\n")
        f.write("## 🏆 积分榜\n\n")
        f.write("| 排名 | 球队 | 场次 | 胜 | 平 | 负 | 进球 | 失球 | 净胜球 | 积分 |\n")
        f.write("|------|------|------|----|----|----|------|------|--------|------|\n")
        
        for rank, (team, stats) in enumerate(sorted_teams, 1):
            goal_diff = stats['goals_for'] - stats['goals_against']
            f.write(f"| {rank} | {team} | {stats['played']} | {stats['wins']} | {stats['draws']} | {stats['losses']} | "
                   f"{stats['goals_for']} | {stats['goals_against']} | {goal_diff:+d} | {stats['points']} |\n")
    
    print(f"\n✅ 球队分析已保存到 j2_league_teams_analysis.md")

def main():
    """主函数"""
    # 解析数据
    matches = parse_j2_data('j2_league_data_raw.txt')
    
    if not matches:
        print("❌ 未解析到有效比赛数据")
        return
    
    # 显示样本数据
    print("\n样本比赛数据:")
    print("-" * 60)
    for i, match in enumerate(matches[:5]):
        draw_mark = " ⏰" if match['is_draw'] else ""
        print(f"{match['time_short']} 第{match['round']}轮 {match['home_team']} {match['score']} {match['away_team']}{draw_mark}")
    
    # 生成报告
    generate_j2_report(matches, 'j2_league_schedule_report.md')
    
    # 分析球队
    analyze_j2_teams(matches)
    
    print("\n" + "=" * 80)
    print("总结")
    print("=" * 80)
    print(f"✅ 成功解析 {len(matches)} 场J2联赛比赛")
    print(f"✅ 生成完整赛程报告: j2_league_schedule_report.md")
    print(f"✅ 生成球队分析: j2_league_teams_analysis.md")
    print(f"✅ 应用了J1联赛分析skill的成熟经验")

if __name__ == "__main__":
    main()