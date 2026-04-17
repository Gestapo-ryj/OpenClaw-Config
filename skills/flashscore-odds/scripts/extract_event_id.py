#!/usr/bin/env python3
"""
从比赛URL提取event_id的改进函数
基于佩纳罗尔vs普拉腾斯案例的经验
"""

import requests
import re
import json

def extract_event_id_from_url(url):
    """
    从比赛URL提取event_id
    
    Args:
        url: 比赛URL
        
    Returns:
        event_id or None
    """
    print(f"🔍 从URL提取event_id: {url}")
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Encoding': 'identity',
    }
    
    try:
        response = requests.get(url, headers=headers, timeout=15)
        
        if response.status_code == 200:
            html_content = response.text
            
            # 方法1: 直接搜索event_id_c字段（佩纳罗尔案例的成功方法）
            if '"event_id_c":"' in html_content:
                start = html_content.find('"event_id_c":"') + 13
                end = html_content.find('"', start)
                if end - start == 8:  # 8位ID
                    event_id = html_content[start:end]
                    print(f"✅ 方法1: 直接找到event_id_c: {event_id}")
                    return event_id
            
            # 方法2: 提取window.environment JSON对象
            env_match = re.search(r'window\.environment\s*=\s*(\{[^;]+\});', html_content)
            if env_match:
                try:
                    env_data = json.loads(env_match.group(1))
                    if 'event_id_c' in env_data:
                        event_id = env_data['event_id_c']
                        print(f"✅ 方法2: 从window.environment找到event_id_c: {event_id}")
                        return event_id
                except json.JSONDecodeError:
                    pass
            
            # 方法3: 更精确地搜索event_id_c
            # 首先尝试直接查找JSON格式
            json_patterns = [
                r'"event_id_c"\s*:\s*"([a-zA-Z0-9]{8})"',
                r'"eventId"\s*:\s*"([a-zA-Z0-9]{8})"',
                r'event_id_c\s*=\s*"([a-zA-Z0-9]{8})"',
                r'eventId\s*=\s*"([a-zA-Z0-9]{8})"',
            ]
            
            for pattern in json_patterns:
                matches = re.findall(pattern, html_content)
                if matches:
                    event_id = matches[0]
                    print(f"✅ 方法3: 通过JSON模式找到event_id: {event_id}")
                    return event_id
            
            # 方法4: 搜索window.environment中的8位ID
            env_section = re.search(r'window\.environment\s*=\s*(\{[^;]+\});', html_content)
            if env_section:
                env_text = env_section.group(1)
                # 在environment中搜索8位ID
                env_ids = re.findall(r'"([a-zA-Z0-9]{8})"', env_text)
                if env_ids:
                    print(f"✅ 方法4: 在window.environment中找到ID: {env_ids[0]}")
                    return env_ids[0]
            
            # 方法5: 搜索所有8位ID，但优先选择混合大小写的
            id_pattern = r'[a-zA-Z0-9]{8}'
            all_ids = re.findall(id_pattern, html_content)
            
            # 过滤和排序
            filtered_ids = []
            for id_str in all_ids:
                # 排除明显不是event_id的
                if (id_str.isdigit() or  # 纯数字
                    id_str.isalpha() and id_str.islower() or  # 纯小写字母
                    id_str.isalpha() and id_str.isupper() or  # 纯大写字母
                    id_str.lower() in ['flashsco', 'platense', 'penarol', 'football', 'document', 'viewport']):
                    continue
                
                # 优先选择混合大小写和数字的（更像event_id）
                has_upper = any(c.isupper() for c in id_str)
                has_lower = any(c.islower() for c in id_str)
                has_digit = any(c.isdigit() for c in id_str)
                
                if (has_upper and has_lower) or (has_upper and has_digit) or (has_lower and has_digit):
                    filtered_ids.append(id_str)
            
            # 去重
            unique_ids = list(set(filtered_ids))
            
            if len(unique_ids) > 0:
                print(f"找到 {len(unique_ids)} 个可能的ID")
                
                # 优先选择在event或match上下文中的ID
                for id_str in unique_ids:
                    idx = html_content.find(id_str)
                    if idx > 0:
                        # 检查前后100字符的上下文
                        start = max(0, idx - 100)
                        end = min(len(html_content), idx + 100)
                        context = html_content[start:end]
                        
                        # 检查是否在相关上下文中
                        if ('event' in context.lower() or 
                            'match' in context.lower() or 
                            'id' in context.lower() or
                            'window.' in context):
                            print(f"✅ 方法5: 在相关上下文中找到ID: {id_str}")
                            return id_str
                
                # 返回第一个ID
                print(f"⚠ 方法5: 返回第一个可能的ID: {unique_ids[0]}")
                return unique_ids[0]
            
            print(f"❌ 未找到event_id")
            return None
        else:
            print(f"❌ 页面访问失败: {response.status_code}")
            return None
    
    except Exception as e:
        print(f"❌ 提取错误: {e}")
        return None

def test_event_id(event_id):
    """测试event_id是否有效"""
    api_url = "https://global.ds.lsapp.eu/odds/pq_graphql"
    
    params = {
        "_hash": "ope2",
        "eventId": event_id,
        "bookmakerId": "417",
        "betType": "HOME_DRAW_AWAY",
        "betScope": "FULL_TIME"
    }
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
    
    try:
        response = requests.get(api_url, params=params, headers=headers, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            odds = data.get('data', {}).get('findPrematchOddsForBookmaker')
            
            if odds is not None:
                return True
            else:
                return False
        else:
            return False
            
    except Exception:
        return False

def test_extraction():
    """测试提取函数"""
    
    print("=" * 70)
    print("测试event_id提取 (基于佩纳罗尔vs普拉腾斯经验)")
    print("=" * 70)
    
    # 测试URL（包括成功的佩纳罗尔案例）
    test_urls = [
        {
            "url": "https://www.flashscore.com/match/football/penarol-r1hkKQek/platense-80MMdBdN/",
            "expected": "vuG923qH",
            "description": "佩纳罗尔 vs 普拉腾斯 (成功案例)"
        },
        {
            "url": "https://www.flashscore.com/match/football/liverpool-lId4TMwf/psg-CjhkPw0k/",
            "expected": "CjhkPw0k",
            "description": "利物浦 vs 巴黎圣日耳曼"
        },
    ]
    
    success_count = 0
    
    for test in test_urls:
        url = test["url"]
        expected = test["expected"]
        description = test["description"]
        
        print(f"\n📋 测试: {description}")
        print(f"URL: {url}")
        print(f"期望的event_id: {expected}")
        
        event_id = extract_event_id_from_url(url)
        
        if event_id:
            print(f"✅ 提取成功: {event_id}")
            
            # 验证格式
            if len(event_id) == 8:
                print(f"✅ 格式正确 (8字符)")
            else:
                print(f"⚠ 格式异常: {len(event_id)} 字符")
            
            # 验证是否匹配期望值
            if event_id == expected:
                print(f"🎯 完全匹配期望值!")
                success_count += 1
            else:
                print(f"⚠ 不匹配期望值 (期望: {expected})")
                
                # 测试提取的ID是否有效
                print(f"测试提取的ID有效性...")
                if test_event_id(event_id):
                    print(f"✅ 提取的ID有效!")
                    success_count += 1
                else:
                    print(f"❌ 提取的ID无效")
        else:
            print(f"❌ 提取失败")
    
    print("\n" + "=" * 70)
    print(f"测试结果: {success_count}/{len(test_urls)} 成功")
    print("=" * 70)
    
    # 使用说明
    print("\n💡 使用说明:")
    print("1. 首先获取比赛URL: https://www.flashscore.com/match/football/{team1}-{id1}/{team2}-{id2}/")
    print("2. 运行: python3 extract_event_id.py --url <比赛URL>")
    print("3. 或者直接调用函数: extract_event_id_from_url(url)")
    print("\n🎯 经验总结:")
    print("• event_id在 window.environment.event_id_c 字段中")
    print("• 直接搜索 \"event_id_c\":\" 字符串最有效")
    print("• 佩纳罗尔案例: vuG923qH")

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == "--url":
        if len(sys.argv) > 2:
            url = sys.argv[2]
            event_id = extract_event_id_from_url(url)
            if event_id:
                print(f"\n🎯 提取的event_id: {event_id}")
                
                # 测试有效性
                if test_event_id(event_id):
                    print(f"✅ 该event_id有效!")
                else:
                    print(f"⚠ 该event_id可能无效")
            else:
                print(f"❌ 未能提取event_id")
        else:
            print("错误: 请提供URL")
            print("用法: python3 extract_event_id.py --url <比赛URL>")
    else:
        test_extraction()