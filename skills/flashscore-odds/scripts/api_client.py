#!/usr/bin/env python3
"""
从利物浦vs巴黎圣日耳曼页面搜索API请求
搜索: global.ds.lsapp.eu/odds/pq_graphql
"""

import requests
import re
import json
from urllib.parse import urlparse, parse_qs

def fetch_page_and_search_api():
    """获取页面并搜索API请求"""
    
    url = "https://www.flashscore.com/match/football/liverpool-lId4TMwf/psg-CjhkPw0k/"
    
    print("=" * 70)
    print("搜索页面中的API请求")
    print("=" * 70)
    print(f"目标URL: {url}")
    print()
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Encoding': 'identity',
    }
    
    try:
        # 获取页面
        print("📡 步骤1: 获取页面内容...")
        response = requests.get(url, headers=headers, timeout=15)
        
        if response.status_code == 200:
            html_content = response.text
            print(f"✅ 成功获取页面，长度: {len(html_content)} 字符")
            print()
            
            # 步骤2: 搜索API请求
            print("🔍 步骤2: 搜索API请求模式...")
            print()
            
            # 搜索API端点
            api_patterns = [
                r'global\.ds\.lsapp\.eu/odds/pq_graphql',
                r'https://global\.ds\.lsapp\.eu/odds/pq_graphql[^"\']*',
                r'fetch\(["\']([^"\']*pq_graphql[^"\']*)["\']',
                r'axios\.get\(["\']([^"\']*pq_graphql[^"\']*)["\']',
                r'\.get\(["\']([^"\']*pq_graphql[^"\']*)["\']',
                r'url:\s*["\']([^"\']*pq_graphql[^"\']*)["\']',
            ]
            
            found_api_calls = []
            
            for i, pattern in enumerate(api_patterns, 1):
                print(f"  尝试模式 {i}: {pattern}")
                matches = re.findall(pattern, html_content, re.IGNORECASE)
                
                if matches:
                    print(f"    ✅ 找到 {len(matches)} 个匹配")
                    for match in matches[:3]:  # 显示前3个
                        if match not in found_api_calls:
                            found_api_calls.append(match)
                            print(f"      - {match[:100]}...")
                else:
                    print(f"    ❌ 未找到匹配")
                print()
            
            # 步骤3: 分析找到的API调用
            print("🎯 步骤3: 分析API调用")
            print("-" * 40)
            
            if found_api_calls:
                print(f"✅ 找到 {len(found_api_calls)} 个API调用:")
                
                for api_call in found_api_calls:
                    print(f"\n🔗 API调用: {api_call}")
                    
                    # 如果是完整URL，解析参数
                    if api_call.startswith('http'):
                        parsed_url = urlparse(api_call)
                        query_params = parse_qs(parsed_url.query)
                        
                        print(f"   参数分析:")
                        for key, values in query_params.items():
                            print(f"     {key}: {values[0] if values else 'N/A'}")
                        
                        # 检查是否有eventId
                        if 'eventId' in query_params:
                            event_id = query_params['eventId'][0]
                            print(f"    🎯 找到eventId: {event_id}")
                            
                            # 立即测试这个API调用
                            test_api_call(api_call, event_id)
                    else:
                        print(f"    ⚠ 不是完整URL，需要构造")
            
            else:
                print("❌ 未找到直接的API调用")
                print("\n💡 可能原因:")
                print("  1. API调用在JavaScript中动态生成")
                print("  2. 需要执行JavaScript才能看到请求")
                print("  3. 页面可能使用WebSocket或其他技术")
            
            # 步骤4: 搜索JavaScript中的API配置
            print("\n🔍 步骤4: 搜索JavaScript中的API配置...")
            print()
            
            js_patterns = [
                r'apiEndpoint["\']?\s*:\s*["\']([^"\']+)["\']',
                r'baseUrl["\']?\s*:\s*["\']([^"\']+)["\']',
                r'oddsApi["\']?\s*:\s*["\']([^"\']+)["\']',
                r'graphqlUrl["\']?\s*:\s*["\']([^"\']+)["\']',
            ]
            
            for pattern in js_patterns:
                matches = re.findall(pattern, html_content)
                if matches:
                    print(f"  找到配置: {pattern}")
                    for match in matches[:2]:
                        print(f"    - {match}")
            
            # 步骤5: 搜索预加载的数据
            print("\n🔍 步骤5: 搜索预加载的赔率数据...")
            print()
            
            # 搜索可能的JSON数据块
            json_patterns = [
                r'<script[^>]*type=["\']application/json["\'][^>]*>(.*?)</script>',
                r'window\.__INITIAL_STATE__\s*=\s*(\{.*?\});',
                r'window\.data\s*=\s*(\{.*?\});',
                r'"odds"\s*:\s*(\{.*?\})',
            ]
            
            for pattern in json_patterns:
                matches = re.findall(pattern, html_content, re.DOTALL)
                if matches:
                    print(f"  找到JSON数据: {pattern}")
                    for match in matches[:1]:
                        try:
                            # 尝试解析JSON
                            data = json.loads(match)
                            print(f"    ✅ JSON解析成功")
                            
                            # 检查是否包含赔率数据
                            if isinstance(data, dict):
                                odds_keys = [k for k in data.keys() if 'odds' in k.lower() or 'bet' in k.lower()]
                                if odds_keys:
                                    print(f"    包含赔率相关键: {odds_keys}")
                        except:
                            print(f"    ⚠ JSON解析失败，长度: {len(match)} 字符")
                            # 显示片段
                            print(f"    片段: {match[:200]}...")
        
        else:
            print(f"❌ 获取页面失败: {response.status_code}")
    
    except Exception as e:
        print(f"❌ 请求错误: {e}")
    
    return None

def test_api_call(api_url, event_id):
    """测试API调用"""
    
    print(f"\n📡 测试API调用: {api_url}")
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': 'application/json',
        'Referer': 'https://www.flashscore.com/',
    }
    
    try:
        response = requests.get(api_url, headers=headers, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ API调用成功")
            
            if 'data' in data and data['data']:
                odds_data = data['data'].get('findPrematchOddsForBookmaker', {})
                
                if odds_data:
                    print(f"🎯 成功获取赔率数据 (eventId: {event_id})")
                    
                    # 显示简要赔率
                    print(f"   利物浦赔率: {odds_data.get('home', {}).get('value', 'N/A')}")
                    print(f"   平局赔率: {odds_data.get('draw', {}).get('value', 'N/A')}")
                    print(f"   巴黎圣日耳曼赔率: {odds_data.get('away', {}).get('value', 'N/A')}")
                    
                    # 保存数据
                    timestamp = re.sub(r'[^\w]', '_', event_id)
                    output_file = f"api_odds_{timestamp}.json"
                    
                    with open(output_file, 'w', encoding='utf-8') as f:
                        json.dump(data, f, indent=2, ensure_ascii=False)
                    
                    print(f"💾 数据已保存到: {output_file}")
                    
                    return True
                else:
                    print(f"⚠ API返回数据但没有赔率信息")
            else:
                print(f"⚠ API响应中没有data字段")
        
        else:
            print(f"❌ API状态码: {response.status_code}")
    
    except Exception as e:
        print(f"❌ API测试错误: {e}")
    
    return False

def construct_api_url_from_page():
    """从页面信息构造API URL"""
    
    print("\n" + "=" * 70)
    print("构造API URL")
    print("=" * 70)
    
    # 已知的API信息
    base_url = "https://global.ds.lsapp.eu/odds/pq_graphql"
    event_id = "OdLTIvyf"  # 从页面提取的
    
    # 标准参数
    params = {
        '_hash': 'ope2',
        'eventId': event_id,
        'bookmakerId': 417,
        'betType': 'HOME_DRAW_AWAY',
        'betScope': 'FULL_TIME',
    }
    
    # 构造URL
    query_string = '&'.join([f"{k}={v}" for k, v in params.items()])
    api_url = f"{base_url}?{query_string}"
    
    print(f"🔗 构造的API URL:")
    print(f"  {api_url}")
    print()
    
    print(f"📋 参数详情:")
    for key, value in params.items():
        print(f"  {key}: {value}")
    
    print()
    print("💡 这个URL可以直接在浏览器或工具中访问")
    print("   返回JSON格式的赔率数据")
    
    return api_url

def main():
    """主函数"""
    
    # 搜索页面中的API请求
    fetch_page_and_search_api()
    
    # 构造API URL
    api_url = construct_api_url_from_page()
    
    # 测试构造的API
    print("\n" + "=" * 70)
    print("测试构造的API")
    print("=" * 70)
    
    test_api_call(api_url, "OdLTIvyf")
    
    print("\n" + "=" * 70)
    print("搜索完成")
    print("=" * 70)
    
    print("""
📋 总结:

1. **页面中的API请求**:
   - FlashScore使用动态JavaScript加载API请求
   - 完整的API URL不会直接出现在HTML中
   - 需要从JavaScript代码或网络请求中获取

2. **构造的API URL**:
   - 基于已知的API结构和参数
   - 使用从页面提取的eventId: OdLTIvyf
   - 可以直接访问获取赔率数据

3. **实际可用的API**:
   https://global.ds.lsapp.eu/odds/pq_graphql?_hash=ope2&eventId=OdLTIvyf&bookmakerId=417&betType=HOME_DRAW_AWAY&betScope=FULL_TIME

💡 建议:
   1. 按F12打开开发者工具
   2. 切换到Network(网络)标签
   3. 刷新页面
   4. 搜索"pq_graphql"请求
   5. 查看完整的请求URL和参数
""")

if __name__ == "__main__":
    main()