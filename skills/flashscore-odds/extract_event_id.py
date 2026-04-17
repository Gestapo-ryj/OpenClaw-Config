#!/usr/bin/env python3
"""
从比赛页面提取event_id
"""

import requests
import re
import json

def extract_event_id_from_url(url):
    """从比赛URL提取event_id"""
    print(f"🔍 从页面提取event_id: {url}")
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept-Encoding': 'identity'
    }
    
    try:
        response = requests.get(url, headers=headers, timeout=15)
        print(f"状态码: {response.status_code}")
        print(f"页面大小: {len(response.text)} 字符")
        
        if response.status_code == 200:
            html = response.text
            
            # 保存原始HTML
            with open('match_page.html', 'w', encoding='utf-8') as f:
                f.write(html)
            print("原始HTML已保存到: match_page.html")
            
            # 查找event_id的各种模式
            print("\n搜索event_id模式:")
            
            # 简化模式，避免转义问题
            patterns = [
                # 模式1: window.environment.event_id_c = 'XXXXXXX'
                r"window\.environment\.event_id_c\s*=\s*['\"]([a-zA-Z0-9]{8})['\"]",
                
                # 模式2: "eventId":"XXXXXXX"
                r'"eventId":"([a-zA-Z0-9]{8})"',
                
                # 模式3: 'eventId':'XXXXXXX'
                r"'eventId':'([a-zA-Z0-9]{8})'",
                
                # 模式4: eventId: 'XXXXXXX'
                r"eventId\s*:\s*['\"]([a-zA-Z0-9]{8})['\"]",
                
                # 模式5: data-event-id="XXXXXXX"
                r'data-event-id="([a-zA-Z0-9]{8})"',
                
                # 模式6: data-id="XXXXXXX"
                r'data-id="([a-zA-Z0-9]{8})"',
                
                # 模式7: "id":"XXXXXXX" (在JSON中)
                r'"id":"([a-zA-Z0-9]{8})"',
                
                # 模式8: "matchId":"XXXXXXX"
                r'"matchId":"([a-zA-Z0-9]{8})"',
                
                # 模式9: /event/XXXXXXX/
                r'/event/([a-zA-Z0-9]{8})/',
                
                # 模式10: event/XXXXXXX
                r'event/([a-zA-Z0-9]{8})',
            ]
            
            found_ids = []
            for i, pattern in enumerate(patterns, 1):
                matches = re.findall(pattern, html)
                if matches:
                    print(f"模式{i}: 找到 {len(matches)} 个匹配")
                    for match in matches[:3]:  # 只显示前3个
                        if match not in found_ids:
                            found_ids.append(match)
                            print(f"  - {match}")
            
            if found_ids:
                print(f"\n✅ 找到的ID列表: {found_ids}")
                
                # 测试每个ID的有效性
                print("\n测试ID有效性...")
                valid_ids = []
                
                for event_id in found_ids:
                    if test_event_id(event_id):
                        valid_ids.append(event_id)
                
                if valid_ids:
                    print(f"\n🎯 有效的event_id: {valid_ids}")
                    return valid_ids[0]  # 返回第一个有效的
                else:
                    print("\n❌ 没有找到有效的event_id")
            else:
                print("\n❌ 未找到任何8位ID")
            
            # 尝试查找包含event的script标签
            print("\n查找包含event的script标签...")
            script_pattern = r'<script[^>]*>([^<]*)</script>'
            scripts = re.findall(script_pattern, html, re.DOTALL)
            
            for i, script in enumerate(scripts[:5]):  # 只检查前5个script
                if 'event' in script.lower():
                    print(f"\nScript {i+1} (包含event):")
                    # 查找8位ID
                    id_matches = re.findall(r'([a-zA-Z0-9]{8})', script)
                    if id_matches:
                        print(f"  找到ID: {id_matches[:3]}")
            
            return None
            
        else:
            print(f"❌ 页面访问失败: {response.status_code}")
            return None
            
    except Exception as e:
        print(f"❌ 错误: {e}")
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
                print(f"  ✅ {event_id}: 有效 (有赔率数据)")
                return True
            else:
                print(f"  ⚠ {event_id}: API返回但数据为空")
                return False
        else:
            print(f"  ❌ {event_id}: 请求失败 {response.status_code}")
            return False
            
    except Exception as e:
        print(f"  ❌ {event_id}: 测试错误 {e}")
        return False

def main():
    """主函数"""
    url = "https://www.flashscore.com/match/football/penarol-r1hkKQek/platense-80MMdBdN/"
    
    print("=" * 70)
    print("从比赛页面提取event_id")
    print(f"URL: {url}")
    print("=" * 70)
    
    event_id = extract_event_id_from_url(url)
    
    if event_id:
        print(f"\n🎯 成功提取到event_id: {event_id}")
        
        # 获取赔率数据
        print("\n获取赔率数据...")
        api_url = "https://global.ds.lsapp.eu/odds/pq_graphql"
        
        params = {
            "_hash": "ope2",
            "eventId": event_id,
            "bookmakerId": "417",
            "betType": "HOME_DRAW_AWAY",
            "betScope": "FULL_TIME"
        }
        
        try:
            response = requests.get(api_url, params=params, timeout=15)
            if response.status_code == 200:
                data = response.json()
                
                # 保存数据
                with open('odds_data.json', 'w', encoding='utf-8') as f:
                    json.dump(data, f, indent=2, ensure_ascii=False)
                print("赔率数据已保存到: odds_data.json")
                
                # 分析赔率
                analyze_odds(data)
            else:
                print(f"❌ 获取赔率失败: {response.status_code}")
                
        except Exception as e:
            print(f"❌ 获取赔率错误: {e}")
    else:
        print("\n❌ 未能提取到有效的event_id")

def analyze_odds(odds_data):
    """分析赔率数据"""
    print("\n" + "=" * 70)
    print("赔率分析")
    print("=" * 70)
    
    try:
        odds_list = odds_data.get('data', {}).get('findPrematchOddsForBookmaker', [])
        
        if not odds_list:
            print("❌ 赔率列表为空")
            return
        
        print(f"数据点数量: {len(odds_list)}")
        
        # 显示最新赔率
        latest = odds_list[-1]
        print(f"\n🎯 最新赔率:")
        print(f"  主队获胜 (Penarol): {latest.get('homeOdds', 'N/A')}")
        print(f"  平局: {latest.get('drawOdds', 'N/A')}")
        print(f"  客队获胜 (Platense): {latest.get('awayOdds', 'N/A')}")
        
        # 显示时间戳
        if 'timestamp' in latest:
            from datetime import datetime
            ts = latest['timestamp']
            dt = datetime.fromtimestamp(ts)
            print(f"  更新时间: {dt}")
        
        # 显示开盘赔率（如果有）
        if len(odds_list) > 1:
            opening = odds_list[0]
            print(f"\n📅 开盘赔率:")
            print(f"  主队获胜: {opening.get('homeOdds', 'N/A')}")
            print(f"  平局: {opening.get('drawOdds', 'N/A')}")
            print(f"  客队获胜: {opening.get('awayOdds', 'N/A')}")
            
            # 计算变化
            if all([latest.get('homeOdds'), opening.get('homeOdds')]):
                home_change = ((latest['homeOdds'] - opening['homeOdds']) / opening['homeOdds']) * 100
                symbol = "📈" if home_change > 0 else "📉" if home_change < 0 else "➡️"
                print(f"\n📈 赔率变化:")
                print(f"  主队: {home_change:+.1f}% {symbol}")
        
        # 计算隐含概率
        home_odds = latest.get('homeOdds')
        draw_odds = latest.get('drawOdds')
        away_odds = latest.get('awayOdds')
        
        if all([home_odds, draw_odds, away_odds]):
            try:
                home_prob = 1 / float(home_odds)
                draw_prob = 1 / float(draw_odds)
                away_prob = 1 / float(away_odds)
                
                total_prob = home_prob + draw_prob + away_prob
                overround = (total_prob - 1) * 100
                
                print(f"\n📊 隐含概率:")
                print(f"  佩纳罗尔获胜: {home_prob:.1%}")
                print(f"  平局: {draw_prob:.1%}")
                print(f"  普拉腾斯获胜: {away_prob:.1%}")
                print(f"  总概率: {total_prob:.1%} (博彩公司利润: {overround:.1f}%)")
            except:
                print(f"\n⚠ 无法计算概率")
        
    except Exception as e:
        print(f"❌ 分析赔率时出错: {e}")

if __name__ == "__main__":
    main()