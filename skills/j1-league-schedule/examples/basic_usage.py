#!/usr/bin/env python3
"""
J1联赛数据解析基础使用示例
"""

import sys
import os

# 添加父目录到路径
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from j1_league_schedule.parse_flashscore_final import parse_flashscore_data

def basic_usage_example():
    """基础使用示例"""
    print("J1联赛数据解析 - 基础使用示例")
    print("=" * 60)
    
    # 假设有数据文件
    data_file = "flashscore_data_raw.txt"
    
    if not os.path.exists(data_file):
        print(f"❌ 数据文件不存在: {data_file}")
        print("请先获取FlashScore数据并保存为此文件")
        return
    
    # 读取数据
    with open(data_file, 'r', encoding='utf-8') as f:
        data_text = f.read()
    
    print(f"✅ 已加载数据，大小: {len(data_text)} 字符")
    
    # 解析数据
    print("正在解析数据...")
    all_matches = parse_flashscore_data(data_text)
    
    # 显示统计信息
    total_matches = sum(len(matches) for matches in all_matches.values())
    print(f"✅ 解析完成，共 {total_matches} 场比赛")
    
    # 显示各轮次统计
    print("\n各轮次比赛统计:")
    print("-" * 40)
    for round_num in sorted(all_matches.keys()):
        matches = all_matches[round_num]
        draws = sum(1 for m in matches if m['is_draw'])
        print(f"第{round_num}轮: {len(matches)}场，{draws}场平局 ({draws/len(matches)*100:.1f}%)")
    
    # 显示第9轮比赛
    print("\n第9轮比赛示例:")
    print("-" * 40)
    round_9_matches = all_matches.get(9, [])
    round_9_matches.sort(key=lambda x: x.get('timestamp', 0))
    
    for match in round_9_matches[:5]:  # 只显示前5场
        draw_mark = " ⏰" if match['is_draw'] else ""
        print(f"{match['time_short']} {match['home_team']} {match['score']} {match['away_team']}{draw_mark}")
    
    # 查找名古屋鲸八比赛
    print("\n名古屋鲸八比赛查询:")
    print("-" * 40)
    
    nagoya_matches = []
    for round_num, matches in all_matches.items():
        for match in matches:
            if match['home_team'] == 'Nagoya Grampus' or match['away_team'] == 'Nagoya Grampus':
                nagoya_matches.append((round_num, match))
    
    if nagoya_matches:
        for round_num, match in nagoya_matches[:3]:  # 只显示前3场
            home_away = "主场" if match['home_team'] == 'Nagoya Grampus' else "客场"
            opponent = match['away_team'] if match['home_team'] == 'Nagoya Grampus' else match['home_team']
            print(f"第{round_num}轮 {home_away} vs {opponent}: {match['score']}")
    else:
        print("未找到名古屋鲸八的比赛")

def team_analysis_example(team_name):
    """球队分析示例"""
    print(f"\n球队分析: {team_name}")
    print("-" * 40)
    
    # 这里需要实际数据，暂时只显示示例
    print("示例输出:")
    print(f"1. 查询{team_name}的所有比赛")
    print(f"2. 统计{team_name}的战绩（胜/平/负）")
    print(f"3. 分析{team_name}的进球和失球")
    print(f"4. 生成{team_name}的详细报告")

if __name__ == "__main__":
    basic_usage_example()
    
    # 球队分析示例
    team_analysis_example("名古屋鲸八")
    team_analysis_example("大阪樱花")
    
    print("\n" + "=" * 60)
    print("使用说明:")
    print("1. 确保有flashscore_data_raw.txt数据文件")
    print("2. 导入parse_flashscore_final模块")
    print("3. 使用parse_flashscore_data函数解析数据")
    print("4. 按需分析比赛数据")