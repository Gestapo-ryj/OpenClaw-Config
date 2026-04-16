#!/usr/bin/env python3
"""
检查利物浦vs巴黎圣日耳曼页面是否包含比赛ID OdLTIvyf
"""

import requests
import re

def fetch_full_html():
    """获取完整的HTML内容"""
    
    url = "https://www.flashscore.com/match/football/liverpool-lId4TMwf/psg-CjhkPw0k/"
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Encoding': 'identity',  # 不接受压缩
    }
    
    try:
        response = requests.get(url, headers=headers, timeout=15)
        
        if response.status_code == 200:
            html_content = response.text
            print(f"✅ 成功获取页面，长度: {len(html_content)} 字符")
            return html_content
        else:
            print(f"❌ 状态码: {response.status_code}")
    
    except Exception as e:
        print(f"❌ 请求错误: {e}")
    
    return None

def search_match_id(html_content, target_id="OdLTIvyf"):
    """在HTML中搜索特定的比赛ID"""
    
    print(f"\n🔍 搜索比赛ID: {target_id}")
    
    if not html_content:
        print("❌ 没有HTML内容")
        return False
    
    # 直接搜索
    if target_id in html_content:
        print(f"✅ 找到比赛ID {target_id} 在页面中!")
        
        # 查找上下文
        pos = html_content.find(target_id)
        start = max(0, pos - 100)
        end = min(len(html_content), pos + 100)
        context = html_content[start:end]
        
        print(f"\n上下文:")
        print(f"...{context}...")
        
        return True
    else:
        print(f"❌ 未找到比赛ID {target_id}")
        
        # 搜索所有可能的eventId模式
        print(f"\n🔍 搜索所有可能的eventId模式...")
        
        # 8字符字母数字组合
        event_patterns = [
            r'"eventId"\s*:\s*"([^"]+)"',
            r'data-event-id=["\']([^"\']+)["\']',
            r'eventId["\']?\s*:\s*["\']([^"\']+)["\']',
            r'/([a-zA-Z0-9]{8})/',  # 8字符模式
        ]
        
        found_ids = []
        
        for pattern in event_patterns:
            matches = re.findall(pattern, html_content)
            if matches:
                print(f"模式 '{pattern}' 找到 {len(matches)} 个匹配")
                for match in matches[:5]:  # 显示前5个
                    if match not in found_ids:
                        found_ids.append(match)
                        print(f"  - {match}")
        
        if found_ids:
            print(f"\n🎯 找到 {len(found_ids)} 个可能的eventId")
            print("请检查这些ID是否有效:")
            for event_id in found_ids:
                print(f"  {event_id}")
        else:
            print("⚠ 未找到任何eventId模式")
        
        return False

def check_page_structure(html_content):
    """检查页面结构"""
    
    print("\n📊 页面结构分析:")
    
    if not html_content:
        return
    
    # 基本检查
    checks = {
        '包含Liverpool': 'liverpool' in html_content.lower(),
        '包含PSG': 'psg' in html_content.lower(),
        '包含eventId': 'eventid' in html_content.lower(),
        '包含JavaScript': '<script' in html_content.lower(),
        '包含JSON数据': 'json' in html_content.lower(),
    }
    
    for check_name, check_result in checks.items():
        print(f"  {check_name}: {'✅' if check_result else '❌'}")
    
    # 显示页面标题
    title_match = re.search(r'<title[^>]*>(.*?)</title>', html_content, re.IGNORECASE)
    if title_match:
        print(f"\n📄 页面标题: {title_match.group(1)}")
    
    # 显示页面片段
    print(f"\n📄 页面前500字符:")
    print(html_content[:500])

def main():
    """主函数"""
    
    print("=" * 70)
    print("检查利物浦vs巴黎圣日耳曼页面")
    print("=" * 70)
    
    # 获取完整HTML
    html_content = fetch_full_html()
    
    if html_content:
        # 检查页面结构
        check_page_structure(html_content)
        
        # 搜索特定的比赛ID
        target_id = "OdLTIvyf"
        found = search_match_id(html_content, target_id)
        
        if found:
            print(f"\n🎉 成功! 比赛ID {target_id} 有效")
            print(f"\n📋 下一步:")
            print(f"1. 使用eventId获取赔率: python flashscore_cli.py --event {target_id}")
            print(f"2. 或直接调用API")
        else:
            print(f"\n⚠ 未找到比赛ID {target_id}")
            print(f"\n💡 建议:")
            print("1. 手动访问页面按F12查找eventId")
            print("2. 检查eventId是否正确")
            print("3. 尝试其他eventId")
    
    print("\n" + "=" * 70)
    print("检查完成")
    print("=" * 70)

if __name__ == "__main__":
    main()