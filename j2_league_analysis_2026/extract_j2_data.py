#!/usr/bin/env python3
"""
提取J2联赛数据
使用J1联赛分析skill的经验
"""

import re
import json

def extract_flashscore_data(html_content):
    """
    从FlashScore HTML中提取比赛数据
    基于J1联赛分析的经验
    """
    print("正在提取J2联赛数据...")
    
    # 方法1: 查找常见的FlashScore数据模式
    patterns = [
        r'data:\s*"([^"]+)"',  # data: "encoded_data"
        r'window\.__INITIAL_STATE__\s*=\s*({[^;]+});',  # window.__INITIAL_STATE__
        r'<script[^>]*type="application/json"[^>]*>([^<]+)</script>',  # JSON-LD数据
    ]
    
    for pattern in patterns:
        matches = re.findall(pattern, html_content, re.DOTALL)
        if matches:
            print(f"找到数据模式，匹配数量: {len(matches)}")
            
            # 保存所有找到的数据
            for i, match in enumerate(matches[:3]):  # 只保存前3个
                with open(f'j2_data_extract_{i}.txt', 'w', encoding='utf-8') as f:
                    f.write(match[:5000])  # 只保存前5000字符
                print(f"  保存数据到 j2_data_extract_{i}.txt (前5000字符)")
            
            # 尝试解析第一个匹配
            data_text = matches[0]
            print(f"数据大小: {len(data_text)} 字符")
            
            # 检查是否是编码的FlashScore数据
            if 'AA÷' in data_text and '¬' in data_text:
                print("✅ 找到FlashScore编码数据格式")
                return data_text
            else:
                print("⚠️  数据格式不是预期的FlashScore编码格式")
                # 继续尝试其他模式
    
    # 方法2: 查找特定的比赛数据块
    print("\n尝试方法2: 查找比赛数据块...")
    
    # 查找可能包含比赛数据的script标签
    script_pattern = r'<script[^>]*>([^<]*match[^<]*data[^<]*)</script>'
    script_matches = re.findall(script_pattern, html_content, re.IGNORECASE)
    
    if script_matches:
        print(f"找到 {len(script_matches)} 个可能包含比赛数据的script标签")
        
        for i, script in enumerate(script_matches[:5]):
            if len(script) > 100:  # 只处理较长的script
                print(f"  Script {i+1}: {len(script)} 字符")
                if 'AA÷' in script or 'match' in script.lower():
                    print(f"    → 可能包含比赛数据")
    
    # 方法3: 直接搜索比赛条目
    print("\n尝试方法3: 直接搜索比赛条目...")
    
    # 搜索比赛ID模式
    match_id_pattern = r'AA÷([A-Za-z0-9]+)'
    match_ids = re.findall(match_id_pattern, html_content)
    
    if match_ids:
        print(f"找到 {len(match_ids)} 个可能的比赛ID")
        print(f"示例ID: {match_ids[:5]}")
        
        # 提取包含这些ID的数据块
        for match_id in match_ids[:3]:
            pattern = f'AA÷{match_id}[^~]+~'
            matches = re.findall(pattern, html_content, re.DOTALL)
            if matches:
                print(f"  比赛 {match_id}: 找到数据块，大小 {len(matches[0])} 字符")
    
    return None

def analyze_html_structure(html_content):
    """分析HTML结构"""
    print("\n分析HTML结构...")
    
    # 统计各种标签
    tags = {
        'script': len(re.findall(r'<script', html_content, re.IGNORECASE)),
        'div': len(re.findall(r'<div', html_content, re.IGNORECASE)),
        'table': len(re.findall(r'<table', html_content, re.IGNORECASE)),
        'match': len(re.findall(r'match', html_content, re.IGNORECASE)),
        'tournament': len(re.findall(r'tournament', html_content, re.IGNORECASE)),
        'result': len(re.findall(r'result', html_content, re.IGNORECASE)),
    }
    
    print("标签统计:")
    for tag, count in tags.items():
        print(f"  {tag}: {count}")
    
    # 查找可能的比赛数据区域
    print("\n查找数据区域...")
    
    # 查找包含"data"的script标签
    data_scripts = re.findall(r'<script[^>]*>[^<]*data[^<]*</script>', html_content, re.IGNORECASE | re.DOTALL)
    print(f"找到 {len(data_scripts)} 个包含'data'的script标签")
    
    for i, script in enumerate(data_scripts[:3]):
        print(f"  Script {i+1}: {len(script)} 字符")
        # 显示前200字符
        preview = script[:200].replace('\n', ' ').replace('\r', ' ')
        print(f"    预览: {preview}...")

def main():
    """主函数"""
    print("=" * 80)
    print("J2联赛数据提取工具")
    print("基于J1联赛分析skill的经验")
    print("=" * 80)
    
    # 读取HTML文件
    try:
        with open('j2_league_raw.html', 'r', encoding='utf-8') as f:
            html_content = f.read()
        print(f"✅ 已加载HTML，大小: {len(html_content)} 字符")
    except FileNotFoundError:
        print("❌ 未找到HTML文件，请先获取页面")
        return
    
    # 分析HTML结构
    analyze_html_structure(html_content)
    
    # 提取数据
    data_text = extract_flashscore_data(html_content)
    
    if data_text:
        print(f"\n✅ 成功提取数据，大小: {len(data_text)} 字符")
        
        # 保存数据
        with open('j2_league_data_raw.txt', 'w', encoding='utf-8') as f:
            f.write(data_text)
        print(f"✅ 数据已保存到 j2_league_data_raw.txt")
        
        # 尝试解析
        print("\n尝试解析数据...")
        parse_sample_data(data_text)
    else:
        print("\n❌ 未找到预期的FlashScore数据格式")
        print("建议:")
        print("1. 页面可能需要JavaScript渲染")
        print("2. 尝试使用不同的URL（如fixtures页面）")
        print("3. 检查页面是否包含动态加载的数据")

def parse_sample_data(data_text):
    """解析样本数据"""
    print("解析样本数据...")
    
    # 查找比赛条目
    match_pattern = r'AA÷([^~]+)~'
    matches = re.findall(match_pattern, data_text)
    
    print(f"找到 {len(matches)} 个比赛条目")
    
    if matches:
        # 显示前5个比赛
        print("\n前5个比赛条目:")
        for i, match in enumerate(matches[:5]):
            print(f"\n比赛 {i+1}:")
            
            # 提取基本信息
            home_match = re.search(r'AE÷([^¬]+)', match)
            away_match = re.search(r'AF÷([^¬]+)', match)
            time_match = re.search(r'AD÷(\d+)', match)
            at_match = re.search(r'AT÷(\d+)', match)  # 主队常规比分
            au_match = re.search(r'AU÷(\d+)', match)  # 客队常规比分
            
            if home_match and away_match:
                print(f"  对阵: {home_match.group(1)} vs {away_match.group(1)}")
            
            if time_match:
                from datetime import datetime
                timestamp = int(time_match.group(1))
                time_str = datetime.fromtimestamp(timestamp).strftime('%Y-%m-%d %H:%M')
                print(f"  时间: {time_str}")
            
            if at_match and au_match:
                print(f"  比分: {at_match.group(1)}-{au_match.group(1)}")
            
            # 检查轮次
            round_match = re.search(r'ER÷([^¬]+)', match)
            if round_match:
                print(f"  轮次: {round_match.group(1)}")

if __name__ == "__main__":
    main()