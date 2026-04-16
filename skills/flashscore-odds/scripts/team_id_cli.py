#!/usr/bin/env python3
"""
球队ID命令行工具
用于管理本地球队ID数据库
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from scripts.team_id_manager import TeamIDManager
import argparse

def main():
    """主函数"""
    
    parser = argparse.ArgumentParser(
        description='球队ID数据库管理工具',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
示例:
  # 查找单个球队
  python team_id_cli.py get "Liverpool"
  
  # 批量查找
  python team_id_cli.py batch "Liverpool" "Paris Saint-Germain" "Bayern Munich"
  
  # 搜索球队
  python team_id_cli.py search "manchester"
  
  # 显示统计
  python team_id_cli.py stats
  
  # 手动添加球队
  python team_id_cli.py add "Manchester City" "Wtn9Stg0" --league "Premier League"
  
  # 导出数据库
  python team_id_cli.py export team_database_backup.json
  
  # 导入数据库
  python team_id_cli.py import team_database_backup.json
  
  # 验证球队ID
  python team_id_cli.py verify "Liverpool"
  
  # 清理缓存
  python team_id_cli.py clean-cache
        """
    )
    
    subparsers = parser.add_subparsers(dest='command', help='命令')
    
    # get 命令: 获取球队ID
    get_parser = subparsers.add_parser('get', help='获取球队ID')
    get_parser.add_argument('team_name', help='球队名称')
    get_parser.add_argument('--refresh', action='store_true', help='强制刷新（忽略缓存）')
    
    # batch 命令: 批量获取
    batch_parser = subparsers.add_parser('batch', help='批量获取球队ID')
    batch_parser.add_argument('team_names', nargs='+', help='球队名称列表')
    batch_parser.add_argument('--refresh', action='store_true', help='强制刷新')
    
    # search 命令: 搜索球队
    search_parser = subparsers.add_parser('search', help='搜索球队')
    search_parser.add_argument('keyword', help='搜索关键词')
    
    # stats 命令: 显示统计
    stats_parser = subparsers.add_parser('stats', help='显示数据库统计')
    
    # add 命令: 添加球队
    add_parser = subparsers.add_parser('add', help='手动添加球队')
    add_parser.add_argument('team_name', help='球队名称')
    add_parser.add_argument('team_id', help='球队ID (8字符)')
    add_parser.add_argument('--league', default='Unknown', help='所属联赛')
    add_parser.add_argument('--verified', action='store_true', help='标记为已验证')
    add_parser.add_argument('--source', default='手动添加', help='数据来源')
    
    # verify 命令: 验证球队
    verify_parser = subparsers.add_parser('verify', help='验证球队ID')
    verify_parser.add_argument('team_name', help='球队名称')
    
    # export 命令: 导出数据库
    export_parser = subparsers.add_parser('export', help='导出数据库')
    export_parser.add_argument('output_file', help='输出文件路径')
    
    # import 命令: 导入数据库
    import_parser = subparsers.add_parser('import', help='导入数据库')
    import_parser.add_argument('input_file', help='输入文件路径')
    
    # clean-cache 命令: 清理缓存
    clean_parser = subparsers.add_parser('clean-cache', help='清理缓存文件')
    clean_parser.add_argument('--all', action='store_true', help='清理所有缓存')
    clean_parser.add_argument('--expired', action='store_true', help='只清理过期的缓存')
    
    # list 命令: 列出所有球队
    list_parser = subparsers.add_parser('list', help='列出所有球队')
    list_parser.add_argument('--limit', type=int, default=20, help='显示数量限制')
    list_parser.add_argument('--verified-only', action='store_true', help='只显示已验证的球队')
    
    args = parser.parse_args()
    
    if not args.command:
        parser.print_help()
        return
    
    print("=" * 70)
    print("球队ID数据库管理工具")
    print("=" * 70)
    
    # 创建管理器
    manager = TeamIDManager()
    
    if args.command == 'get':
        # 获取单个球队ID
        print(f"🔍 获取球队ID: {args.team_name}")
        
        team_id = manager.get_team_id(args.team_name, args.refresh)
        
        if team_id:
            team_data = manager.database.get(args.team_name, {})
            
            print(f"✅ 找到球队ID: {team_id}")
            print(f"   联赛: {team_data.get('league', 'Unknown')}")
            print(f"   验证状态: {'✅ 已验证' if team_data.get('verified', False) else '⚠ 待验证'}")
            print(f"   数据来源: {team_data.get('source', 'Unknown')}")
            print(f"   最后更新: {team_data.get('last_verified', 'Unknown')}")
            
            # 显示使用信息
            print(f"\n🔗 使用信息:")
            safe_name = args.team_name.lower().replace(' ', '-')
            print(f"   球队页面: https://www.flashscore.com/team/{safe_name}-{team_id}/")
            print(f"   比赛URL模式: .../{safe_name}-{team_id}/...")
        else:
            print(f"❌ 未找到球队ID: {args.team_name}")
    
    elif args.command == 'batch':
        # 批量获取
        print(f"🔍 批量获取 {len(args.team_names)} 个球队的ID")
        
        results = {}
        for team_name in args.team_names:
            print(f"\n处理: {team_name}")
            team_id = manager.get_team_id(team_name, args.refresh)
            
            if team_id:
                results[team_name] = team_id
                print(f"  ✅ 找到: {team_id}")
            else:
                results[team_name] = None
                print(f"  ❌ 未找到")
        
        # 显示汇总
        print(f"\n📋 批量查找结果:")
        found = sum(1 for v in results.values() if v)
        print(f"  成功: {found}/{len(results)}")
        
        for team_name, team_id in results.items():
            status = "✅" if team_id else "❌"
            print(f"  {status} {team_name}: {team_id or '未找到'}")
    
    elif args.command == 'search':
        # 搜索球队
        print(f"🔍 搜索球队: {args.keyword}")
        
        results = manager.search_teams(args.keyword)
        
        if results:
            print(f"✅ 找到 {len(results)} 个匹配:")
            for team_name, team_data in results:
                verified = "✅" if team_data.get('verified', False) else "⚠"
                print(f"  {verified} {team_name}: {team_data['id']} ({team_data.get('league', 'Unknown')})")
        else:
            print(f"❌ 未找到匹配的球队")
    
    elif args.command == 'stats':
        # 显示统计
        print("📊 球队ID数据库统计")
        
        stats = manager.get_stats()
        
        print(f"总球队数: {stats['total_teams']}")
        print(f"已验证球队: {stats['verified_teams']}")
        print(f"验证率: {stats['verification_rate']}")
        print(f"数据库文件: {stats['database_file']}")
        print(f"缓存目录: {stats['cache_dir']}")
        
        # 显示最近更新的球队
        print(f"\n📅 最近更新的球队:")
        sorted_teams = sorted(
            manager.database.items(),
            key=lambda x: x[1].get('last_verified', '2000-01-01'),
            reverse=True
        )
        
        for team_name, team_data in sorted_teams[:5]:
            verified = "✅" if team_data.get('verified', False) else "⚠"
            print(f"  {verified} {team_name}: {team_data['id']} ({team_data.get('last_verified', 'Unknown')})")
    
    elif args.command == 'add':
        # 添加球队
        print(f"📝 添加球队: {args.team_name} -> {args.team_id}")
        
        success = manager.add_team(
            args.team_name,
            args.team_id,
            league=args.league,
            verified=args.verified,
            source=args.source
        )
        
        if success:
            print(f"✅ 已添加到数据库")
            
            # 显示添加的信息
            team_data = manager.database[args.team_name]
            print(f"   联赛: {team_data['league']}")
            print(f"   验证状态: {'✅ 已验证' if team_data['verified'] else '⚠ 待验证'}")
            print(f"   数据来源: {team_data['source']}")
        else:
            print(f"❌ 添加失败")
    
    elif args.command == 'verify':
        # 验证球队
        print(f"🔍 验证球队: {args.team_name}")
        
        if args.team_name not in manager.database:
            print(f"❌ 球队不在数据库中")
            return
        
        team_data = manager.database[args.team_name]
        
        print(f"当前信息:")
        print(f"  球队ID: {team_data['id']}")
        print(f"  验证状态: {'✅ 已验证' if team_data.get('verified', False) else '⚠ 待验证'}")
        
        # 标记为已验证
        team_data['verified'] = True
        team_data['last_verified'] = datetime.now().strftime("%Y-%m-%d")
        team_data['source'] = "手动验证"
        
        manager._save_database()
        
        print(f"✅ 已标记为已验证")
    
    elif args.command == 'export':
        # 导出数据库
        print(f"💾 导出数据库到: {args.output_file}")
        
        success = manager.export_database(args.output_file)
        
        if success:
            print(f"✅ 导出成功")
        else:
            print(f"❌ 导出失败")
    
    elif args.command == 'import':
        # 导入数据库
        print(f"📥 从文件导入数据库: {args.input_file}")
        
        success = manager.import_database(args.input_file)
        
        if success:
            print(f"✅ 导入成功")
            print(f"   导入后总球队数: {len(manager.database)}")
        else:
            print(f"❌ 导入失败")
    
    elif args.command == 'clean-cache':
        # 清理缓存
        import glob
        
        cache_files = glob.glob(os.path.join(manager.cache_dir, "*.json"))
        
        print(f"🧹 清理缓存文件")
        print(f"  缓存目录: {manager.cache_dir}")
        print(f"  找到 {len(cache_files)} 个缓存文件")
        
        deleted = 0
        for cache_file in cache_files:
            try:
                if args.all:
                    # 清理所有缓存
                    os.remove(cache_file)
                    deleted += 1
                elif args.expired:
                    # 只清理过期的缓存
                    cached_data = manager._load_cache(cache_file)
                    if cached_data and manager._is_cache_expired(cached_data):
                        os.remove(cache_file)
                        deleted += 1
            except:
                pass
        
        print(f"✅ 已清理 {deleted} 个缓存文件")
    
    elif args.command == 'list':
        # 列出所有球队
        print(f"📋 列出球队 (显示前 {args.limit} 个)")
        
        teams = list(manager.database.items())
        
        if args.verified_only:
            teams = [(name, data) for name, data in teams if data.get('verified', False)]
            print(f"  只显示已验证的球队: {len(teams)} 个")
        
        for i, (team_name, team_data) in enumerate(teams[:args.limit]):
            verified = "✅" if team_data.get('verified', False) else "⚠"
            print(f"  {i+1:2d}. {verified} {team_name:30} {team_data['id']:10} ({team_data.get('league', 'Unknown')})")
        
        if len(teams) > args.limit:
            print(f"  ... 还有 {len(teams) - args.limit} 个球队未显示")
    
    print("\n" + "=" * 70)
    print("命令执行完成")
    print("=" * 70)

if __name__ == "__main__":
    main()