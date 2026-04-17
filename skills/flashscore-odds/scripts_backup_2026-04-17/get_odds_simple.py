#!/usr/bin/env python3
"""
获取赔率的简单函数
"""

import requests
import json

def get_odds_by_event_id(event_id):
    """
    使用eventId获取赔率
    
    Args:
        event_id: 比赛ID
        
    Returns:
        dict: 赔率数据 or None
    """
    print(f"💰 获取赔率 (eventId: {event_id})")
    
    api_url = "https://global.ds.lsapp.eu/odds/pq_graphql"
    
    params = {
        '_hash': 'ope2',
        'eventId': event_id,
        'bookmakerId': 417,
        'betType': 'HOME_DRAW_AWAY',
        'betScope': 'FULL_TIME',
    }
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': 'application/json',
        'Origin': 'https://www.flashscore.com',
        'Referer': 'https://www.flashscore.com/',
    }
    
    try:
        response = requests.get(api_url, params=params, headers=headers, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            
            if 'data' in data and data['data']:
                odds_data = data['data'].get('findPrematchOddsForBookmaker', {})
                
                if odds_data:
                    print(f"✅ 成功获取赔率数据")
                    return odds_data
                else:
                    print(f"⚠ API返回数据但没有赔率信息")
            else:
                print(f"⚠ API响应中没有data字段")
        
        else:
            print(f"❌ API状态码: {response.status_code}")
    
    except Exception as e:
        print(f"❌ API请求错误: {e}")
    
    return None

def get_odds_by_url(url):
    """
    使用比赛URL获取赔率
    
    Args:
        url: 比赛URL
        
    Returns:
        dict: 赔率数据 or None
    """
    print(f"💰 从URL获取赔率: {url}")
    
    # 首先提取eventId
    from scripts.extract_event_id import extract_event_id_from_url
    
    event_id = extract_event_id_from_url(url)
    
    if event_id:
        return get_odds_by_event_id(event_id)
    else:
        print(f"❌ 无法从URL提取eventId")
        return None

def test_get_odds():
    """测试获取赔率函数"""
    
    print("=" * 70)
    print("测试赔率获取")
    print("=" * 70)
    
    # 测试已知的eventId
    test_event_ids = [
        "OdLTIvyf",  # 利物浦 vs 巴黎圣日耳曼
        "nmFfvLPh",  # 莱万特 vs 赫塔菲
    ]
    
    for event_id in test_event_ids:
        print(f"\n测试eventId: {event_id}")
        odds_data = get_odds_by_event_id(event_id)
        
        if odds_data:
            print(f"✅ 获取成功")
            
            # 显示赔率
            if 'home' in odds_data:
                print(f"   主胜: {odds_data['home'].get('value', 'N/A')}")
            if 'draw' in odds_data:
                print(f"   平局: {odds_data['draw'].get('value', 'N/A')}")
            if 'away' in odds_data:
                print(f"   客胜: {odds_data['away'].get('value', 'N/A')}")
        else:
            print(f"❌ 获取失败")
    
    print("\n" + "=" * 70)
    print("测试完成")
    print("=" * 70)

if __name__ == "__main__":
    test_get_odds()