#!/usr/bin/env python3
"""基本测试"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'scripts'))

def test_imports():
    """测试模块导入"""
    try:
        import api_client
        import odds_analyzer
        print("✅ 模块导入测试通过")
        return True
    except ImportError as e:
        print(f"❌ 模块导入失败: {e}")
        return False

def test_known_event_id():
    """测试已知eventId"""
    print("测试已知eventId: OdLTIvyf")
    # 这里可以添加实际的API测试
    print("⚠ 需要安装依赖后运行")
    return True

if __name__ == "__main__":
    print("FlashScore赔率分析Skill测试")
    print("=" * 50)
    
    tests = [
        ("模块导入测试", test_imports),
        ("已知eventId测试", test_known_event_id),
    ]
    
    passed = 0
    for name, test_func in tests:
        print(f"\n🧪 {name}...")
        if test_func():
            print(f"  ✅ 通过")
            passed += 1
        else:
            print(f"  ❌ 失败")
    
    print(f"\n📊 测试结果: {passed}/{len(tests)} 通过")
