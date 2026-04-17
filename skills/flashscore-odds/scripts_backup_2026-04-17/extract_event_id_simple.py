#!/usr/bin/env python3
"""
从比赛URL提取eventId的简单函数
"""

import requests
import re

def extract_event_id_from_url(url):
    """
    从比赛URL提取eventId
    
    Args:
        url: 比赛URL
        
    Returns:
        event_id or None
    """
    print(f"🔍 从URL提取eventId: {url}")
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Encoding': 'identity',
    }
    
    try:
        response = requests.get(url, headers=headers, timeout=15)
        
        if response.status_code == 200:
            html_content = response.text
            
            # 搜索eventId模式
            event_patterns = [
                # 模式1: window.environment中的event_id_c
                r'window\.environment\s*=\s*\{[^}]*"event_id_c"\s*:\s*"([^"]+)"',
                
                # 模式2: 标准的eventId字段
                r'"eventId"\s*:\s*"([^"]+)"',
                
                # 模式3: data-event-id属性
                r'data-event-id=["\']([^"\']+)["\']',
                
                # 模式4: eventId变量
                r'eventId["\']?\s*:\s*["\']([^"\']+)["\']',
            ]
            
            for pattern in event_patterns:
                matches = re.findall(pattern, html_content)
                if matches:
                    event_id = matches[0]
                    print(f"✅ 找到eventId: {event_id}")
                    return event_id
            
            print(f"❌ 未找到eventId")
            return None
        else:
            print(f"❌ 页面访问失败: {response.status_code}")
            return None
    
    except Exception as e:
        print(f"❌ 提取错误: {e}")
        return None

def test_extraction():
    """测试提取函数"""
    
    print("=" * 70)
    print("测试eventId提取")
    print("=" * 70)
    
    # 测试已知的URL
    test_urls = [
        "https://www.flashscore.com/match/football/liverpool-lId4TMwf/psg-CjhkPw0k/",
        "https://www.flashscore.com/match/football/getafe-dboeiWOt/levante-G8FL0ShI/",
    ]
    
    for url in test_urls:
        print(f"\n测试URL: {url}")
        event_id = extract_event_id_from_url(url)
        
        if event_id:
            print(f"✅ 提取成功: {event_id}")
            
            # 验证格式
            if len(event_id) == 8:
                print(f"✅ 格式正确 (8字符)")
            else:
                print(f"⚠ 格式异常: {len(event_id)} 字符")
        else:
            print(f"❌ 提取失败")
    
    print("\n" + "=" * 70)
    print("测试完成")
    print("=" * 70)

if __name__ == "__main__":
    test_extraction()