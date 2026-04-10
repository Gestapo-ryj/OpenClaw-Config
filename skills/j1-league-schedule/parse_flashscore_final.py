#!/usr/bin/env python3
"""
FlashScore数据最终解析脚本
用于解析日职联比赛数据，提取常规时间比分
"""

import re
from datetime import datetime

def parse_flashscore_data(data_text):
    """
    解析FlashScore原始数据
    返回按轮次组织的比赛列表
    """
    all_matches = {}
    
    for round_num in range(1, 10):
        round_pattern = f'AA÷[^~]*ER÷Round {round_num}[^~]*~'
        round_entries = re.findall(round_pattern, data_text, re.DOTALL)
        
        round_matches = []
        seen_matches = set()  # 用于去重
        
        for entry in round_entries:
            match_info = parse_match_entry(entry)
            if match_info:
                # 创建唯一标识符去重
                match_id = f"{match_info['home_team']}_{match_info['away_team']}_{match_info['time']}"
                if match_id not in seen_matches:
                    seen_matches.add(match_id)
                    round_matches.append(match_info)
        
        all_matches[round_num] = round_matches
    
    return all_matches

def parse_match_entry(entry):
    """
    解析单个比赛条目
    返回比赛信息的字典
    """
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
    
    # 提取最终比分供对比
    ag_match = re.search(r'AG÷(\d+)', entry)  # 主队最终比分
    ah_match = re.search(r'AH÷(\d+)', entry)  # 客队最终比分
    
    if ag_match and ah_match:
        info['home_final'] = int(ag_match.group(1))
        info['away_final'] = int(ah_match.group(1))
        info['final_score'] = f"{info['home_final']}-{info['away_final']}"
        info['has_extra_time'] = (info['home_final'] != info['home_score']) or (info['away_final'] != info['away_score'])
    else:
        info['has_extra_time'] = False
    
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

def generate_report(all_matches, output_file):
    """
    生成比赛报告
    """
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write("# 日职联比赛数据报告\n\n")
        
        total_matches = 0
        total_draws = 0
        
        for round_num in sorted(all_matches.keys()):
            matches = all_matches[round_num]
            total_matches += len(matches)
            round_draws = sum(1 for m in matches if m['is_draw'])
            total_draws += round_draws
            
            f.write(f"## 第{round_num}轮\n\n")
            
            # 按时间排序
            matches.sort(key=lambda x: x.get('timestamp', 0))
            
            for match in matches:
                draw_mark = " ⏰" if match['is_draw'] else ""
                f.write(f"- **{match['time_short']}** {match['home_team']} **{match['score']}** {match['away_team']}{draw_mark}\n")
                
                if match.get('has_extra_time', False):
                    f.write(f"  - 常规时间{match['score']}，最终比分{match.get('final_score', '未知')}\n")
            
            f.write(f"\n**统计**: {len(matches)}场比赛，{round_draws}场平局\n\n")
        
        f.write(f"## 总体统计\n\n")
        f.write(f"- 总比赛场次: {total_matches}场\n")
        f.write(f"- 平局场次: {total_draws}场 ({total_draws/total_matches*100:.1f}%)\n")
        f.write(f"- 非平局场次: {total_matches - total_draws}场 ({(total_matches - total_draws)/total_matches*100:.1f}%)\n")
    
    print(f"报告已生成: {output_file}")

def main():
    """主函数"""
    # 读取数据
    try:
        with open('flashscore_data_raw.txt', 'r', encoding='utf-8') as f:
            data_text = f.read()
        print(f"已加载数据，大小: {len(data_text)} 字符")
    except FileNotFoundError:
        print("未找到数据文件 flashscore_data_raw.txt")
        return
    
    # 解析数据
    print("正在解析数据...")
    all_matches = parse_flashscore_data(data_text)
    
    # 统计
    total_matches = sum(len(matches) for matches in all_matches.values())
    print(f"解析完成，共 {total_matches} 场比赛")
    
    # 生成报告
    generate_report(all_matches, 'j1_league_report.md')
    
    # 显示关键比赛
    print("\n关键比赛:")
    print("-" * 60)
    
    # 名古屋鲸八 vs 大阪樱花
    for round_num in range(1, 10):
        for match in all_matches.get(round_num, []):
            if match['home_team'] == 'Nagoya Grampus' and match['away_team'] == 'Cerezo Osaka':
                print(f"名古屋鲸八 vs 大阪樱花 (第{round_num}轮):")
                print(f"  时间: {match['time']}")
                print(f"  比分: {match['score']}")
                print(f"  结果: {'平局' if match['is_draw'] else '非平局'}")
                break
    
    # 清水鼓动 vs 广岛三箭
    for round_num in range(1, 10):
        for match in all_matches.get(round_num, []):
            if match['home_team'] == 'Shimizu S-Pulse' and match['away_team'] == 'Sanfrecce Hiroshima':
                print(f"\n清水鼓动 vs 广岛三箭 (第{round_num}轮):")
                print(f"  时间: {match['time']}")
                print(f"  比分: {match['score']}")
                print(f"  结果: {'平局' if match['is_draw'] else '非平局'}")
                print(f"  备注: 用户确认正确比分")
                break

if __name__ == "__main__":
    main()