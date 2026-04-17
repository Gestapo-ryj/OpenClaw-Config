#!/usr/bin/env python3
"""
专门搜索利物浦在FlashScore上的球队ID
使用多种方法尝试
"""

import requests
import re
import json
import time
from datetime import datetime

def search_liverpool_direct():
    """直接搜索利物浦相关页面"""
    
    print("🔍 方法1: 直接访问利物浦相关页面")
    
    # 尝试访问利物浦球队页面
    test_urls = [
        "https://www.flashscore.com/team/liverpool/",
        "https://www.flashscore.com/football/england/premier-league/",
        "https://www.flashscore.com/football/england/premier-league/liverpool/",
        "https://www.flashscore.com/team/liverpool/latest/",
    ]
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
    }
    
    for url in test_urls:
        print(f"\n尝试访问: {url}")
        
        try:
            response = requests.get(url, headers=headers, timeout=10, allow_redirects=True)
            
            print(f"状态码: {response.status_code}")
            print(f"最终URL: {response.url}")
            
            if response.status_code == 200:
                html_content = response.text
                
                # 检查是否包含利物浦
                if 'liverpool' in html_content.lower():
                    print("✅ 页面包含利物浦内容")
                    
                    # 搜索球队ID模式
                    patterns = [
                        r'/team/liverpool-([a-zA-Z0-9]{8})/',  # /team/liverpool-XXXXXXX/
                        r'teamId["\']?\s*:\s*["\']([a-zA-Z0-9]{8})["\']',  # teamId: "XXXXXXX"
                        r'data-team-id=["\']([a-zA-Z0-9]{8})["\']',  # data-team-id="XXXXXXX"
                        r'"id"\s*:\s*"([a-zA-Z0-9]{8})"',  # "id": "XXXXXXX"
                    ]
                    
                    for pattern in patterns:
                        matches = re.findall(pattern, html_content)
                        if matches:
                            print(f"🎯 找到球队ID模式: {matches[0]}")
                            return matches[0]
                    
                    # 搜索比赛链接中的球队ID
                    match_pattern = r'/match/[^/]+/liverpool-([a-zA-Z0-9]{8})/'
                    match_matches = re.findall(match_pattern, html_content, re.IGNORECASE)
                    if match_matches:
                        print(f"🎯 从比赛链接找到球队ID: {match_matches[0]}")
                        return match_matches[0]
                    
                    print("⚠ 在页面中未找到球队ID")
                    
                    # 显示页面片段
                    if len(html_content) > 1000:
                        # 查找包含liverpool的片段
                        liverpool_pos = html_content.lower().find('liverpool')
                        if liverpool_pos != -1:
                            start = max(0, liverpool_pos - 200)
                            end = min(len(html_content), liverpool_pos + 300)
                            snippet = html_content[start:end]
                            print(f"相关片段:\n...{snippet}...")
                else:
                    print("⚠ 页面不包含利物浦内容")
            
            elif response.status_code == 404:
                print("❌ 页面不存在")
            else:
                print(f"⚠ 其他状态码")
        
        except Exception as e:
            print(f"❌ 请求错误: {e}")
    
    return None

def search_via_google():
    """通过Google搜索利物浦FlashScore页面"""
    
    print("\n🔍 方法2: 尝试通过搜索引擎查找")
    
    # 构造搜索查询
    search_queries = [
        "site:flashscore.com liverpool team id",
        "liverpool flashscore team",
        "flashscore liverpool fixtures",
    ]
    
    print("搜索查询建议:")
    for query in search_queries:
        print(f"  {query}")
    
    print("\n💡 建议手动搜索:")
    print("1. 在Google搜索: 'liverpool flashscore team'")
    print("2. 查找结果中的FlashScore链接")
    print("3. 从URL中提取球队ID")
    
    return None

def search_via_known_matches():
    """通过已知的利物浦比赛查找"""
    
    print("\n🔍 方法3: 查找利物浦最近的比赛")
    
    # 尝试访问利物浦最近的比赛页面
    # 这些URL可能需要根据实际比赛调整
    possible_matches = [
        # 利物浦最近的比赛（需要根据实际情况调整）
        "https://www.flashscore.com/match/liverpool-vs-manchester-united/",
        "https://www.flashscore.com/match/manchester-city-vs-liverpool/",
        "https://www.flashscore.com/match/arsenal-vs-liverpool/",
        "https://www.flashscore.com/match/liverpool-vs-chelsea/",
    ]
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    }
    
    for match_url in possible_matches:
        print(f"\n尝试比赛URL: {match_url}")
        
        try:
            response = requests.head(match_url, headers=headers, timeout=5, allow_redirects=True)
            
            if response.status_code == 200:
                final_url = response.url
                print(f"✅ 比赛页面存在: {final_url}")
                
                # 从URL中提取球队ID
                # 格式: /match/football/liverpool-XXXXXXX/opponent-YYYYYYY/
                pattern = r'/liverpool-([a-zA-Z0-9]{8})/'
                matches = re.findall(pattern, final_url)
                
                if matches:
                    print(f"🎯 从比赛URL提取球队ID: {matches[0]}")
                    return matches[0]
                else:
                    print("⚠ 无法从URL提取球队ID")
                    print(f"URL模式分析: {final_url}")
            
            else:
                print(f"❌ 页面不存在 (状态码: {response.status_code})")
        
        except Exception as e:
            print(f"❌ 请求错误: {e}")
    
    return None

def analyze_flashscore_url_patterns():
    """分析FlashScore URL模式"""
    
    print("\n🔍 方法4: 分析FlashScore URL模式")
    
    print("已知的FlashScore URL模式:")
    print("1. 球队页面: https://www.flashscore.com/team/{球队名}-{球队ID}/")
    print("   示例: https://www.flashscore.com/team/liverpool-XXXXXXX/")
    print()
    print("2. 比赛页面: https://www.flashscore.com/match/football/{主队}-{主队ID}/{客队}-{客队ID}/")
    print("   示例: https://www.flashscore.com/match/football/liverpool-XXXXXXX/manchester-united-YYYYYYY/")
    print()
    print("3. 已知示例 (莱万特 vs 赫塔菲):")
    print("   比赛URL: https://www.flashscore.com/match/football/getafe-dboeiWOt/levante-G8FL0ShI/")
    print("   球队ID: Getafe = dboeiWOt, Levante = G8FL0ShI")
    print()
    print("💡 推断利物浦球队ID模式:")
    print("   - 应该是8个字符的字母数字组合")
    print("   - 可能包含'liverpool'的缩写")
    print("   - 可能是随机生成的字符串")
    
    # 尝试一些可能的模式
    possible_ids = [
        'liverpool',  # 可能球队名就是ID
        'LIV',        # 缩写
        'LFC',        # 利物浦足球俱乐部缩写
        'liv',        # 小写缩写
    ]
    
    print("\n尝试的ID模式:")
    for pid in possible_ids:
        # 填充到8字符
        if len(pid) < 8:
            test_id = pid + 'X' * (8 - len(pid))
        else:
            test_id = pid[:8]
        print(f"  {test_id}")
    
    return None

def manual_search_instructions():
    """提供手动搜索指南"""
    
    print("\n📋 手动搜索利物浦球队ID指南")
    print("=" * 60)
    
    print("""
步骤1: 访问FlashScore网站
  https://www.flashscore.com

步骤2: 搜索利物浦
  1. 在搜索框输入 "Liverpool"
  2. 或浏览: 足球 → 英格兰 → 英超 → 利物浦

步骤3: 找到利物浦球队页面
  1. 点击利物浦球队链接
  2. 查看浏览器地址栏的URL

步骤4: 从URL提取球队ID
  URL格式: https://www.flashscore.com/team/liverpool-{球队ID}/
  示例: https://www.flashscore.com/team/liverpool-XXXXXXX/
  
  球队ID: XXXXXXX (8个字符的字母数字组合)

步骤5: 或者从比赛URL提取
  1. 点击利物浦的任何一场比赛
  2. 查看比赛页面的URL
  3. 格式: .../liverpool-{球队ID}/...

步骤6: 记录球队ID
  复制找到的8字符代码发给我
""")
    
    print("\n💡 快速查找技巧:")
    print("  1. 使用浏览器的查找功能 (Ctrl+F)")
    print("  2. 搜索 'liverpool-' 在页面源代码中")
    print("  3. 查看网络请求中的API调用")
    
    print("\n🔧 技术方法:")
    print("  1. 按F12打开开发者工具")
    print("  2. 切换到Network(网络)标签")
    print("  3. 刷新页面")
    print("  4. 搜索包含 'team' 或 'liverpool' 的请求")
    print("  5. 查看响应数据中的ID字段")

def main():
    """主函数"""
    
    print("=" * 70)
    print("利物浦球队ID搜索工具")
    print("=" * 70)
    
    print(f"搜索时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # 方法1: 直接访问
    liverpool_id = search_liverpool_direct()
    
    if liverpool_id:
        print(f"\n🎉 成功找到利物浦球队ID: {liverpool_id}")
        
        # 保存结果
        with open('liverpool_team_id.txt', 'w') as f:
            f.write(liverpool_id)
        
        print(f"💾 已保存到: liverpool_team_id.txt")
        
        # 显示使用示例
        print(f"\n🔗 使用这个ID可以:")
        print(f"1. 构造利物浦球队页面: https://www.flashscore.com/team/liverpool-{liverpool_id}/")
        print(f"2. 构造比赛URL: https://www.flashscore.com/match/football/liverpool-{liverpool_id}/opponent-YYYYYYY/")
        print(f"3. 用于API调用")
        
        return liverpool_id
    
    # 方法2: 通过已知比赛查找
    liverpool_id = search_via_known_matches()
    
    if liverpool_id:
        print(f"\n🎉 从比赛URL找到利物浦球队ID: {liverpool_id}")
        
        with open('liverpool_team_id.txt', 'w') as f:
            f.write(liverpool_id)
        
        print(f"💾 已保存到: liverpool_team_id.txt")
        return liverpool_id
    
    # 方法3: 分析URL模式
    analyze_flashscore_url_patterns()
    
    # 方法4: 搜索引擎
    search_via_google()
    
    # 方法5: 手动搜索指南
    manual_search_instructions()
    
    print("\n" + "=" * 70)
    print("搜索结束 - 需要手动查找")
    print("=" * 70)
    
    return None

if __name__ == "__main__":
    result = main()
    
    if result:
        print(f"\n✅ 搜索成功! 利物浦球队ID: {result}")
    else:
        print(f"\n⚠ 自动搜索失败，请参考上面的手动查找指南")