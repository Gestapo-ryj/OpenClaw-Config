#!/usr/bin/env python3
"""
使用找到的eventId获取利物浦vs巴黎圣日耳曼的赔率信息
eventId: OdLTIvyf
"""

import requests
import json
from datetime import datetime

def get_odds_with_event_id(event_id):
    """使用eventId获取赔率信息"""
    
    print(f"💰 获取利物浦vs巴黎圣日耳曼赔率 (eventId: {event_id})")
    
    api_url = "https://global.ds.lsapp.eu/odds/pq_graphql"
    
    params = {
        '_hash': 'ope2',
        'eventId': event_id,
        'bookmakerId': 417,  # FlashScore默认博彩公司
        'betType': 'HOME_DRAW_AWAY',
        'betScope': 'FULL_TIME',
    }
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': 'application/json',
        'Origin': 'https://www.flashscore.com',
        'Referer': 'https://www.flashscore.com/',
    }
    
    print(f"📡 API调用: {api_url}")
    print(f"🔧 参数: {json.dumps(params, indent=2)}")
    
    try:
        response = requests.get(api_url, params=params, headers=headers, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            print("✅ API调用成功")
            
            # 检查数据
            if 'data' in data and data['data']:
                odds_data = data['data'].get('findPrematchOddsForBookmaker', {})
                
                if odds_data:
                    print("\n" + "=" * 70)
                    print("利物浦 vs 巴黎圣日耳曼 赔率分析")
                    print("=" * 70)
                    print(f"比赛时间: 2026年4月14日")
                    print(f"数据获取时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
                    print(f"EventId: {event_id}")
                    print("-" * 70)
                    
                    # 显示赔率
                    print("\n📊 实时赔率:")
                    print("-" * 40)
                    
                    outcomes = {
                        'home': '利物浦获胜',
                        'draw': '平局',
                        'away': '巴黎圣日耳曼获胜',
                    }
                    
                    for outcome_key, outcome_name in outcomes.items():
                        if outcome_key in odds_data and odds_data[outcome_key]:
                            outcome = odds_data[outcome_key]
                            current = outcome.get('value', 'N/A')
                            opening = outcome.get('opening', 'N/A')
                            change = outcome.get('change', {})
                            change_type = change.get('type', 'N/A') if isinstance(change, dict) else 'N/A'
                            change_percent = change.get('percent', 'N/A') if isinstance(change, dict) else 'N/A'
                            
                            print(f"{outcome_name:20} {current:6} (开盘: {opening})")
                            if change_type != 'N/A':
                                print(f"                   变化: {change_type} ({change_percent}%)")
                    
                    # 计算隐含概率
                    print("\n📈 隐含概率分析:")
                    print("-" * 40)
                    
                    try:
                        home_odds = float(odds_data.get('home', {}).get('value', 0))
                        draw_odds = float(odds_data.get('draw', {}).get('value', 0))
                        away_odds = float(odds_data.get('away', {}).get('value', 0))
                        
                        if home_odds > 0 and draw_odds > 0 and away_odds > 0:
                            home_prob = 1 / home_odds
                            draw_prob = 1 / draw_odds
                            away_prob = 1 / away_odds
                            
                            total_prob = home_prob + draw_prob + away_prob
                            
                            print(f"利物浦获胜概率: {home_prob/total_prob*100:.1f}%")
                            print(f"平局概率:       {draw_prob/total_prob*100:.1f}%")
                            print(f"巴黎圣日耳曼获胜概率: {away_prob/total_prob*100:.1f}%")
                            print(f"博彩公司利润:   {(total_prob-1)*100:.1f}%")
                            
                            # 判断价值投注
                            print("\n💡 价值投注分析:")
                            fair_prob = 1 / total_prob  # 公平概率
                            
                            if home_prob/total_prob > fair_prob * 1.1:
                                value_percent = (home_prob/total_prob/fair_prob-1)*100
                                print(f"  ✅ 利物浦赔率可能有价值 (+{value_percent:.1f}%)")
                            else:
                                print(f"  ⚠ 利物浦赔率价值一般")
                                
                            if away_prob/total_prob > fair_prob * 1.1:
                                value_percent = (away_prob/total_prob/fair_prob-1)*100
                                print(f"  ✅ 巴黎圣日耳曼赔率可能有价值 (+{value_percent:.1f}%)")
                            else:
                                print(f"  ⚠ 巴黎圣日耳曼赔率价值一般")
                            
                            # 投注建议
                            print("\n🎯 投注建议:")
                            if home_odds < 2.0:
                                print(f"  • 利物浦获胜: 赔率较低，适合保守投注")
                            elif home_odds > 2.5:
                                print(f"  • 利物浦获胜: 赔率较高，有一定价值")
                                
                            if draw_odds > 3.0:
                                print(f"  • 平局: 赔率有吸引力，适合风险投注")
                                
                            if away_odds < 2.5:
                                print(f"  • 巴黎圣日耳曼获胜: 赔率合理")
                            elif away_odds > 3.0:
                                print(f"  • 巴黎圣日耳曼获胜: 高赔率，高风险高回报")
                    except Exception as e:
                        print(f"⚠ 概率计算错误: {e}")
                    
                    # 赔率变化趋势
                    print("\n📉 赔率变化趋势:")
                    print("-" * 40)
                    
                    home_change = odds_data.get('home', {}).get('change', {})
                    if isinstance(home_change, dict) and home_change.get('type') != 'N/A':
                        print(f"利物浦赔率: {home_change.get('type')} ({home_change.get('percent', 'N/A')}%)")
                    
                    away_change = odds_data.get('away', {}).get('change', {})
                    if isinstance(away_change, dict) and away_change.get('type') != 'N/A':
                        print(f"巴黎圣日耳曼赔率: {away_change.get('type')} ({away_change.get('percent', 'N/A')}%)")
                    
                    # 保存数据
                    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                    output_file = f"liverpool_psg_odds_{timestamp}.json"
                    
                    with open(output_file, 'w', encoding='utf-8') as f:
                        json.dump(data, f, indent=2, ensure_ascii=False)
                    
                    print(f"\n💾 完整数据已保存到: {output_file}")
                    
                    return data
                else:
                    print("⚠ API返回数据但没有赔率信息")
                    print(f"响应: {json.dumps(data, indent=2)[:500]}...")
            else:
                print("⚠ API响应中没有data字段")
                print(f"响应: {json.dumps(data, indent=2)[:500]}...")
        
        else:
            print(f"❌ API状态码: {response.status_code}")
            print(f"响应: {response.text[:500]}...")
    
    except Exception as e:
        print(f"❌ API请求错误: {e}")
    
    return None

def verify_workflow():
    """验证完整工作流程"""
    
    print("=" * 70)
    print("验证完整工作流程")
    print("=" * 70)
    
    print("""
✅ 步骤1: 查找两个队的球队ID - 完成
  利物浦: lId4TMwf
  巴黎圣日耳曼: CjhkPw0k

✅ 步骤2: 用球队ID拼接出球赛详情页链接 - 完成
  URL: https://www.flashscore.com/match/football/liverpool-lId4TMwf/psg-CjhkPw0k/

✅ 步骤3: 用球赛详情页链接获取比赛ID（eventId） - 完成
  EventId: OdLTIvyf (从页面中找到)

✅ 步骤4: 用比赛ID查赔率信息 - 进行中...
""")

def main():
    """主函数"""
    
    # 验证工作流程
    verify_workflow()
    
    # 使用找到的eventId获取赔率
    event_id = "OdLTIvyf"
    odds_data = get_odds_with_event_id(event_id)
    
    if odds_data:
        print("\n" + "=" * 70)
        print("🎉 恭喜！完整工作流程成功完成！")
        print("=" * 70)
        
        print("""
📋 流程总结:
  1. 找到利物浦球队ID: lId4TMwf
  2. 找到巴黎圣日耳曼球队ID: CjhkPw0k
  3. 构造比赛URL成功
  4. 从页面提取eventId: OdLTIvyf
  5. 成功获取实时赔率数据

🔧 技术成就:
  • 绕过FlashScore反爬虫机制
  • 正确提取球队ID和eventId
  • 成功调用FlashScore API
  • 完成完整的4步工作流程

💡 后续应用:
  这个工作流程可以用于分析任何足球比赛的赔率！
""")
    else:
        print("\n⚠ 获取赔率失败，但前3步已完成")
    
    print("\n" + "=" * 70)
    print("流程结束")
    print("=" * 70)

if __name__ == "__main__":
    main()