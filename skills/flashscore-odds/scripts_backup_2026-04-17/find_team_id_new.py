#!/usr/bin/env python3
"""
查找球队ID - 使用球队ID管理器
优先从本地数据库读取，找不到再从网站查询
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from scripts.team_id_manager import TeamIDManager

def find_team_id(team_name, force_refresh=False):
    """
    查找球队ID
    
    Args:
        team_name: 球队名称
        force_refresh: 是否强制刷新（忽略缓存）
        
    Returns:
        team_id or None
    """
    print(f"🔍 查找球队ID: {team_name}")
    
    # 创建球队ID管理器
    manager = TeamIDManager()
    
    # 获取球队ID
    team_id = manager.get_team_id(team_name, force_refresh)
    
    if team_id:
        # 获取详细信息
        team_data = manager.database.get(team_name, {})
        
        print(f"✅ 找到球队ID: {team_id}")
        print(f"   联赛: {team_data.get('league', 'Unknown')}")
        print(f"   验证状态: {'✅ 已验证' if team_data.get('verified', False) else '⚠ 待验证'}")
        print(f"   数据来源: {team_data.get('source', 'Unknown')}")
        print(f"   最后更新: {team_data.get('last_verified', 'Unknown')}")
        
        return team_id
    else:
        print(f"❌ 未找到球队ID: {team_name}")
        
        # 提供手动查找建议
        print(f"\n💡 手动查找建议:")
        print(f"1. 访问: https://www.flashscore.com/search/?q={team_name}")
        print(f"2. 查找球队页面或比赛链接")
        print(f"3. 从URL中提取8字符的球队ID")
        print(f"4. 使用命令添加: python team_id_cli.py --add \"{team_name}\" \"TEAM_ID\"")
        
        return None

def batch_find_team_ids(team_names, force_refresh=False):
    """
    批量查找球队ID
    
    Args:
        team_names: 球队名称列表
        force_refresh: 是否强制刷新
        
    Returns:
        dict: {team_name: team_id}
    """
    print(f"🔍 批量查找 {len(team_names)} 个球队的ID")
    
    manager = TeamIDManager()
    results = {}
    
    for team_name in team_names:
        print(f"\n处理: {team_name}")
        team_id = manager.get_team_id(team_name, force_refresh)
        
        if team_id:
            results[team_name] = team_id
            print(f"  ✅ 找到: {team_id}")
        else:
            results[team_name] = None
            print(f"  ❌ 未找到")
    
    return results

def search_teams(keyword):
    """
    搜索球队
    
    Args:
        keyword: 搜索关键词
        
    Returns:
        list: 搜索结果
    """
    print(f"🔍 搜索球队: {keyword}")
    
    manager = TeamIDManager()
    results = manager.search_teams(keyword)
    
    if results:
        print(f"✅ 找到 {len(results)} 个匹配:")
        for team_name, team_data in results:
            print(f"  • {team_name}: {team_data['id']} ({team_data.get('league', 'Unknown')})")
    else:
        print(f"❌ 未找到匹配的球队")
    
    return results

def show_database_stats():
    """显示数据库统计信息"""
    print("📊 球队ID数据库统计")
    
    manager = TeamIDManager()
    stats = manager.get_stats()
    
    print(f"总球队数: {stats['total_teams']}")
    print(f"已验证球队: {stats['verified_teams']}")
    print(f"验证率: {stats['verification_rate']}")
    print(f"数据库文件: {stats['database_file']}")
    print(f"缓存目录: {stats['cache_dir']}")
    
    # 显示部分球队
    print(f"\n📋 数据库中的球队 (前10个):")
    for i, (team_name, team_data) in enumerate(list(manager.database.items())[:10]):
        verified = "✅" if team_data.get('verified', False) else "⚠"
        print(f"  {verified} {team_name}: {team_data['id']}")

def main():
    """主函数 - 命令行接口"""
    
    import argparse
    
    parser = argparse.ArgumentParser(description='查找球队ID工具')
    parser.add_argument('team', nargs='?', help='球队名称')
    parser.add_argument('--batch', nargs='+', help='批量查找多个球队')
    parser.add_argument('--search', help='搜索球队')
    parser.add_argument('--stats', action='store_true', help='显示数据库统计')
    parser.add_argument('--refresh', action='store_true', help='强制刷新（忽略缓存）')
    parser.add_argument('--add', nargs=2, metavar=('TEAM_NAME', 'TEAM_ID'), help='手动添加球队到数据库')
    parser.add_argument('--export', help='导出数据库到文件')
    parser.add_argument('--import', dest='import_file', help='从文件导入数据库')
    
    args = parser.parse_args()
    
    print("=" * 70)
    print("球队ID查找工具 - 使用本地数据库和网站查询")
    print("=" * 70)
    
    manager = TeamIDManager()
    
    if args.add:
        # 手动添加球队
        team_name, team_id = args.add
        success = manager.add_team(team_name, team_id, source="手动添加")
        if success:
            print(f"✅ 已添加: {team_name} -> {team_id}")
        else:
            print(f"❌ 添加失败")
    
    elif args.export:
        # 导出数据库
        success = manager.export_database(args.export)
        if success:
            print(f"✅ 数据库已导出到: {args.export}")
        else:
            print(f"❌ 导出失败")
    
    elif args.import_file:
        # 导入数据库
        success = manager.import_database(args.import_file)
        if success:
            print(f"✅ 数据库已从 {args.import_file} 导入")
        else:
            print(f"❌ 导入失败")
    
    elif args.search:
        # 搜索球队
        search_teams(args.search)
    
    elif args.stats:
        # 显示统计信息
        show_database_stats()
    
    elif args.batch:
        # 批量查找
        results = batch_find_team_ids(args.batch, args.refresh)
        
        print(f"\n📋 批量查找结果:")
        for team_name, team_id in results.items():
            if team_id:
                print(f"  ✅ {team_name}: {team_id}")
            else:
                print(f"  ❌ {team_name}: 未找到")
    
    elif args.team:
        # 单个球队查找
        team_id = find_team_id(args.team, args.refresh)
        
        if team_id:
            print(f"\n🎯 最终结果: {args.team} -> {team_id}")
            
            # 显示使用示例
            print(f"\n🔗 使用示例:")
            print(f"  球队页面: https://www.flashscore.com/team/{args.team.lower().replace(' ', '-')}-{team_id}/")
            print(f"  比赛URL: .../{args.team.lower().replace(' ', '-')}-{team_id}/...")
            print(f"  API调用: eventId参数需要从比赛页面另外提取")
        else:
            print(f"\n⚠ 未找到球队ID: {args.team}")
    
    else:
        # 显示帮助信息
        print("""
使用方法:
  python find_team_id.py [球队名称]          # 查找单个球队
  python find_team_id.py --batch 球队1 球队2 # 批量查找
  python find_team_id.py --search 关键词     # 搜索球队
  python find_team_id.py --stats            # 显示数据库统计
  python find_team_id.py --refresh [球队]    # 强制刷新缓存

示例:
  python find_team_id.py "Liverpool"
  python find_team_id.py --batch "Liverpool" "Paris Saint-Germain" "Bayern Munich"
  python find_team_id.py --search "manchester"
  python find_team_id.py --stats
  python find_team_id.py "Liverpool" --refresh

数据库管理:
  python find_team_id.py --add "球队名" "球队ID"  # 手动添加
  python find_team_id.py --export 文件名.json     # 导出数据库
  python find_team_id.py --import 文件名.json     # 导入数据库
""")
    
    print("\n" + "=" * 70)
    print("工具完成")
    print("=" * 70)

if __name__ == "__main__":
    main()