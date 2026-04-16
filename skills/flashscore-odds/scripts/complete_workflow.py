#!/usr/bin/env python3
"""
完整的利物浦 vs 巴黎圣日耳曼赔率获取流程
按照用户要求的步骤：
1. 查找两个队的球队ID
2. 用球队ID拼接出球赛详情页链接
3. 用球赛详情页链接获取比赛ID（eventId）
4. 用比赛ID查赔率信息
"""

import requests
import re
import json
import time
from datetime import datetime

class LiverpoolPSGWorkflow:
    def __init__(self):
        # 利物浦球队ID (已找到)
        self.liverpool_id = "lId4TMwf"
        
        # 巴黎圣日耳曼球队ID (需要查找)
        self.psg_id = None
        
        # API配置
        self.api_url = "https://global.ds.lsapp.eu/odds/pq_graphql"
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
            'Accept': 'application/json',
            'Origin': 'https://www.flashscore.com',
            'Referer': 'https://www.flashscore.com/',
        }
    
    def step1_find_team_ids(self):
        """步骤1: 查找两个队的球队ID"""
        
        print("=" * 70)
        print("步骤1: 查找球队ID")
        print("=" * 70)
        
        # 利物浦球队ID (已找到)
        print(f"\n✅ 利物浦球队ID: {self.liverpool_id}")
        print(f"   来源: 从FlashScore英超页面提取")
        print(f"   验证: 在比赛链接中找到: /match/football/everton-KluSTr9s/liverpool-{self.liverpool_id}/")
        
        # 查找巴黎圣日耳曼球队ID
        print("\n🔍 查找巴黎圣日耳曼球队ID...")
        
        # 尝试访问法甲页面
        ligue1_url = "https://www.flashscore.com/football/france/ligue-1/"
        
        headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Encoding': 'identity',  # 不接受压缩
        }
        
        try:
            response = requests.get(ligue1_url, headers=headers, timeout=15)
            
            if response.status_code == 200:
                html_content = response.text
                
                # 搜索巴黎圣日耳曼
                search_terms = ['paris-saint-germain', 'psg', 'paris saint germain']
                
                for term in search_terms:
                    if term in html_content.lower():
                        print(f"✅ 法甲页面包含'{term}'")
                        
                        # 搜索球队ID模式
                        # 模式: /match/.../paris-saint-germain-{8字符ID}/ 或 psg-{8字符ID}/
                        patterns = [
                            rf'{term}-([a-zA-Z0-9]{{8}})',
                            rf'/match/[^/]+/{term}-([a-zA-Z0-9]{{8}})/',
                        ]
                        
                        for pattern in patterns:
                            matches = re.findall(pattern, html_content.lower())
                            if matches:
                                self.psg_id = matches[0]
                                print(f"🎯 找到巴黎圣日耳曼球队ID: {self.psg_id}")
                                break
                        
                        if self.psg_id:
                            break
                
                if not self.psg_id:
                    print("⚠ 在法甲页面中未找到巴黎圣日耳曼球队ID")
                    print("💡 可能需要手动查找或使用其他方法")
            
            else:
                print(f"❌ 无法访问法甲页面: {response.status_code}")
        
        except Exception as e:
            print(f"❌ 请求错误: {e}")
        
        # 如果没找到，使用已知的可能ID
        if not self.psg_id:
            print("\n💡 使用已知的巴黎圣日耳曼可能ID...")
            # 基于常见模式猜测
            possible_psg_ids = [
                'psg',  # 可能简写
                'PSG',  # 大写简写
                'paris',  # 巴黎
                'saintg',  # 圣日耳曼简写
            ]
            
            # 填充到8字符
            for pid in possible_psg_ids:
                if len(pid) < 8:
                    test_id = pid + 'X' * (8 - len(pid))
                else:
                    test_id = pid[:8]
                
                print(f"  尝试: {test_id}")
        
        return self.liverpool_id, self.psg_id
    
    def step2_construct_match_url(self, liverpool_id, psg_id):
        """步骤2: 用球队ID拼接出球赛详情页链接"""
        
        print("\n" + "=" * 70)
        print("步骤2: 构造比赛详情页链接")
        print("=" * 70)
        
        if not psg_id:
            print("❌ 缺少巴黎圣日耳曼球队ID，无法构造URL")
            return None
        
        # FlashScore比赛URL格式:
        # https://www.flashscore.com/match/football/{主队}-{主队ID}/{客队}-{客队ID}/
        
        # 假设利物浦主场
        match_url = f"https://www.flashscore.com/match/football/liverpool-{liverpool_id}/paris-saint-germain-{psg_id}/"
        
        print(f"\n🔗 构造的比赛URL:")
        print(f"  {match_url}")
        
        # 也可以构造巴黎主场
        match_url_psg_home = f"https://www.flashscore.com/match/football/paris-saint-germain-{psg_id}/liverpool-{liverpool_id}/"
        print(f"\n🔗 巴黎主场URL:")
        print(f"  {match_url_psg_home}")
        
        return match_url
    
    def step3_extract_event_id(self, match_url):
        """步骤3: 用球赛详情页链接获取比赛ID（eventId）"""
        
        print("\n" + "=" * 70)
        print("步骤3: 从比赛页面提取eventId")
        print("=" * 70)
        
        print(f"📄 访问比赛页面: {match_url}")
        
        headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Encoding': 'identity',  # 不接受压缩
        }
        
        try:
            response = requests.get(match_url, headers=headers, timeout=15)
            
            if response.status_code == 200:
                html_content = response.text
                print(f"✅ 成功获取页面，长度: {len(html_content)} 字符")
                
                # 搜索eventId
                event_patterns = [
                    r'"eventId"\s*:\s*"([^"]+)"',
                    r'data-event-id=["\']([^"\']+)["\']',
                    r'eventId["\']?\s*:\s*["\']([^"\']+)["\']',
                    r'/([a-zA-Z0-9]{8})/',  # 8字符模式
                ]
                
                for pattern in event_patterns:
                    matches = re.findall(pattern, html_content)
                    if matches:
                        event_id = matches[0]
                        print(f"🎯 找到eventId: {event_id}")
                        return event_id
                
                print("⚠ 在页面中未找到eventId")
                
                # 检查页面内容
                if '404' in html_content or 'not found' in html_content.lower():
                    print("❌ 比赛页面不存在 (404)")
                    print("💡 可能原因:")
                    print("  1. 比赛不存在或已结束")
                    print("  2. 球队ID不正确")
                    print("  3. 需要特定的比赛时间")
                
                # 显示页面片段
                if len(html_content) > 1000:
                    # 查找可能包含eventId的script标签
                    script_pattern = r'<script[^>]*>.*?</script>'
                    scripts = re.findall(script_pattern, html_content, re.DOTALL)
                    
                    for script in scripts[:3]:  # 检查前3个script
                        if 'eventId' in script:
                            print(f"\n包含eventId的script标签 ({len(script)} 字符):")
                            print(script[:500] + "...")
                            break
            
            elif response.status_code == 404:
                print("❌ 比赛页面不存在 (404)")
                print("💡 建议:")
                print("  1. 检查球队ID是否正确")
                print("  2. 这场比赛可能不存在")
                print("  3. 尝试查找实际的利物浦vs巴黎圣日耳曼比赛")
            
            else:
                print(f"❌ 状态码: {response.status_code}")
        
        except Exception as e:
            print(f"❌ 请求错误: {e}")
        
        return None
    
    def step4_get_odds_with_event_id(self, event_id):
        """步骤4: 用比赛ID查赔率信息"""
        
        print("\n" + "=" * 70)
        print("步骤4: 使用eventId获取赔率信息")
        print("=" * 70)
        
        if not event_id:
            print("❌ 没有eventId，无法获取赔率")
            return None
        
        params = {
            '_hash': 'ope2',
            'eventId': event_id,
            'bookmakerId': 417,  # FlashScore默认博彩公司
            'betType': 'HOME_DRAW_AWAY',
            'betScope': 'FULL_TIME',
        }
        
        print(f"📡 调用API: {self.api_url}")
        print(f"🔧 参数: {json.dumps(params, indent=2)}")
        
        try:
            response = requests.get(self.api_url, params=params, headers=self.headers, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                print("✅ API调用成功")
                
                # 检查数据
                if 'data' in data and data['data']:
                    odds_data = data['data'].get('findPrematchOddsForBookmaker', {})
                    
                    if odds_data:
                        print("\n📊 赔率数据:")
                        print("-" * 40)
                        
                        # 显示赔率
                        outcomes = {
                            'home': '主胜 (利物浦)',
                            'draw': '平局',
                            'away': '客胜 (巴黎圣日耳曼)',
                        }
                        
                        for outcome_key, outcome_name in outcomes.items():
                            if outcome_key in odds_data and odds_data[outcome_key]:
                                outcome = odds_data[outcome_key]
                                current = outcome.get('value', 'N/A')
                                opening = outcome.get('opening', 'N/A')
                                change = outcome.get('change', {})
                                change_type = change.get('type', 'N/A') if isinstance(change, dict) else 'N/A'
                                
                                print(f"{outcome_name:20} {current:6} (开盘: {opening}) 变化: {change_type}")
                        
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
                                    print(f"  ✅ 利物浦赔率可能有价值 (+{(home_prob/total_prob/fair_prob-1)*100:.1f}%)")
                                if away_prob/total_prob > fair_prob * 1.1:
                                    print(f"  ✅ 巴黎圣日耳曼赔率可能有价值 (+{(away_prob/total_prob/fair_prob-1)*100:.1f}%)")
                        except:
                            print("⚠ 无法计算概率")
                        
                        return data
                    else:
                        print("⚠ API返回数据但没有赔率信息")
                else:
                    print("⚠ API响应中没有data字段")
            
            else:
                print(f"❌ API状态码: {response.status_code}")
                print(f"响应: {response.text[:500]}...")
        
        except Exception as e:
            print(f"❌ API请求错误: {e}")
        
        return None
    
    def test_with_known_event_id(self):
        """使用已知的eventId测试"""
        
        print("\n" + "=" * 70)
        print("测试: 使用已知的eventId (莱万特 vs 赫塔菲)")
        print("=" * 70)
        
        known_event_id = "nmFfvLPh"
        print(f"测试eventId: {known_event_id}")
        
        odds_data = self.step4_get_odds_with_event_id(known_event_id)
        
        if odds_data:
            print("\n✅ 测试成功! API工作正常")
            return True
        else:
            print("\n❌ 测试失败")
            return False
    
    def practical_workflow(self):
        """实际工作流程"""
        
        print("=" * 70)
        print("利物浦 vs 巴黎圣日耳曼 赔率获取流程")
        print("=" * 70)
        print(f"时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        # 首先测试API
        print("\n🔧 第一步: 测试API是否工作")
        api_working = self.test_with_known_event_id()
        
        if not api_working:
            print("\n❌ API测试失败，流程终止")
            return
        
        # 步骤1: 查找球队ID
        liverpool_id, psg_id = self.step1_find_team_ids()
        
        if not psg_id:
            print("\n⚠ 缺少巴黎圣日耳曼球队ID")
            print("\n💡 替代方案:")
            print("1. 手动查找巴黎圣日耳曼球队ID")
            print("2. 使用其他数据源")
            print("3. 分析现有比赛数据")
            return
        
        # 步骤2: 构造比赛URL
        match_url = self.step2_construct_match_url(liverpool_id, psg_id)
        
        if not match_url:
            return
        
        # 步骤3: 提取eventId
        event_id = self.step3_extract_event_id(match_url)
        
        if not event_id:
            print("\n⚠ 无法提取eventId")
            print("\n💡 可能原因和解决方案:")
            print("1. 比赛不存在 - 查找实际的利物浦vs巴黎圣日耳曼比赛")
            print("2. 需要手动访问比赛页面获取eventId")
            print("3. 使用其他方法获取eventId")
            return
        
        # 步骤4: 获取赔率
        odds_data = self.step4_get_odds_with_event_id(event_id)
        
        if odds_data:
            print("\n🎉 流程完成! 成功获取赔率信息")
            
            # 保存结果
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            output_file = f"liverpool_psg_odds_{timestamp}.json"
            
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(odds_data, f, indent=2, ensure_ascii=False)
            
            print(f"\n💾 结果已保存到: {output_file}")
            
            # 显示总结
            print("\n📋 流程总结:")
            print(f"  1. 利物浦球队ID: {liverpool_id}")
            print(f"  2. 巴黎圣日耳曼球队ID: {psg_id}")
            print(f"  3. 比赛URL: {match_url}")
            print(f"  4. EventId: {event_id}")
            print(f"  5. 赔率数据: 已获取并保存")
        
        else:
            print("\n⚠ 无法获取赔率信息")
            print(f"  利物浦ID: {liverpool_id}")
            print(f"  巴黎圣日耳曼ID: {psg_id}")
            print(f"  比赛URL: {match_url}")
            print(f"  EventId: {event_id}")

def main():
    """主函数"""
    
    workflow = LiverpoolPSGWorkflow()
    workflow.practical_workflow()
    
    print("\n" + "=" * 70)
    print("流程结束")
    print("=" * 70)

if __name__ == "__main__":
    main()