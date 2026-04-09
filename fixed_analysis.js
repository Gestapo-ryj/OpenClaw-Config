// 重新解析赔率数据
const rawData = `Thu, 9 Apr 2026

 08:00
Sudamericana Cup
3.30 +20.0%
3.00 +13.2%
2.03 -21.9%

 08:00
Libertadores Cup
2.50
2.55 -5.6%
3.00 +5.3%

 08:30
Libertadores Cup
4.30 +13.2%
3.30 +6.5%
1.70 -9.1%

 08:30
Libertadores Cup
4.30 +4.9%
3.20 +3.2%
1.72 -4.4%

 09:00
N America Champions
1.63 -4.1%
3.70 +19.4%
4.10 -12.8%

10:00
Sudamericana Cup
4.00 +8.1%
3.10
1.80 -3.7%

10:00
Libertadores Cup
2.40 +4.3%
2.85 -1.7%
2.80 -3.4%

 11:00
N America Champions
1.17 -12.0%
5.80 +31.8%
10.00 +33.3%`;

// 手动解析上午比赛数据
const morningMatches = [
    {
        time: "08:00",
        league: "Sudamericana Cup",
        odds: [3.30, 3.00, 2.03],
        changes: [20.0, 13.2, -21.9]
    },
    {
        time: "08:00",
        league: "Libertadores Cup",
        odds: [2.50, 2.55, 3.00],
        changes: [0, -5.6, 5.3]
    },
    {
        time: "08:30",
        league: "Libertadores Cup",
        odds: [4.30, 3.30, 1.70],
        changes: [13.2, 6.5, -9.1]
    },
    {
        time: "08:30",
        league: "Libertadores Cup",
        odds: [4.30, 3.20, 1.72],
        changes: [4.9, 3.2, -4.4]
    },
    {
        time: "09:00",
        league: "N America Champions",
        odds: [1.63, 3.70, 4.10],
        changes: [-4.1, 19.4, -12.8]
    },
    {
        time: "10:00",
        league: "Sudamericana Cup",
        odds: [4.00, 3.10, 1.80],
        changes: [8.1, 0, -3.7]
    },
    {
        time: "10:00",
        league: "Libertadores Cup",
        odds: [2.40, 2.85, 2.80],
        changes: [4.3, -1.7, -3.4]
    },
    {
        time: "11:00",
        league: "N America Champions",
        odds: [1.17, 5.80, 10.00],
        changes: [-12.0, 31.8, 33.3]
    }
];

// 分析函数
function analyzeMatches(matches, threshold = 10) {
    const significantChanges = [];
    
    for (const match of matches) {
        for (let i = 0; i < match.changes.length; i++) {
            const change = match.changes[i];
            if (Math.abs(change) >= threshold) {
                significantChanges.push({
                    match: match,
                    option: i === 0 ? '主胜' : (i === 1 ? '平局' : '客胜'),
                    odds: match.odds[i],
                    change: change,
                    absChange: Math.abs(change)
                });
            }
        }
    }
    
    // 按变化幅度排序
    significantChanges.sort((a, b) => b.absChange - a.absChange);
    
    // 按比赛分组
    const matchesMap = new Map();
    for (const sc of significantChanges) {
        const key = `${sc.match.time} ${sc.match.league}`;
        if (!matchesMap.has(key)) {
            matchesMap.set(key, {
                match: sc.match,
                changes: []
            });
        }
        matchesMap.get(key).changes.push(sc);
    }
    
    return {
        matches,
        significantChanges,
        matchesWithSignificantChanges: matchesMap.size,
        matchesMap
    };
}

// 生成报告
function generateReport(analysis) {
    const report = [];
    
    report.push(`## 📊 今天上午比赛赔率分析报告 (2026年4月9日)`);
    report.push(``);
    report.push(`### 📈 统计数据`);
    report.push(`- **上午比赛总数**: ${analysis.matches.length} 场`);
    report.push(`- **有显著变化比赛**: ${analysis.matchesWithSignificantChanges} 场`);
    report.push(`- **显著变化总数**: ${analysis.significantChanges.length} 次`);
    report.push(`- **数据更新时间**: 2026-04-09 08:20:07`);
    report.push(``);
    
    if (analysis.significantChanges.length > 0) {
        report.push(`### 🔍 重点关注比赛 (变化超过10%)`);
        report.push(``);
        
        let matchCount = 1;
        for (const [key, data] of analysis.matchesMap) {
            const match = data.match;
            const changes = data.changes;
            
            report.push(`${matchCount}. **${match.time} ${match.league}**`);
            report.push(`   - **赔率**: 主胜 ${match.odds[0].toFixed(2)} (${match.changes[0] >= 0 ? '+' : ''}${match.changes[0].toFixed(1)}%) | ` +
                       `平 ${match.odds[1].toFixed(2)} (${match.changes[1] >= 0 ? '+' : ''}${match.changes[1].toFixed(1)}%) | ` +
                       `客胜 ${match.odds[2].toFixed(2)} (${match.changes[2] >= 0 ? '+' : ''}${match.changes[2].toFixed(1)}%)`);
            
            // 分析变化
            const changeAnalysis = [];
            for (const sc of changes) {
                const direction = sc.change > 0 ? '上升' : '下降';
                changeAnalysis.push(`${sc.option}大幅${direction}${Math.abs(sc.change).toFixed(1)}%`);
            }
            
            report.push(`   - **分析**: ${changeAnalysis.join('；')}`);
            
            // 提供联赛信息
            let leagueInfo = '';
            if (match.league.includes('Sudamericana')) {
                leagueInfo = '南美杯（南美俱乐部二级赛事）';
            } else if (match.league.includes('Libertadores')) {
                leagueInfo = '解放者杯（南美顶级俱乐部赛事）';
            } else if (match.league.includes('N America Champions')) {
                leagueInfo = '中北美及加勒比海冠军联赛';
            }
            
            if (leagueInfo) {
                report.push(`   - **联赛信息**: ${leagueInfo}`);
            }
            report.push(``);
            
            matchCount++;
        }
    }
    
    // 最大变化
    if (analysis.significantChanges.length > 0) {
        report.push(`### 📊 最大变化统计`);
        const maxRise = analysis.significantChanges.filter(sc => sc.change > 0)[0];
        const maxFall = analysis.significantChanges.filter(sc => sc.change < 0)[0];
        
        if (maxRise) {
            report.push(`- **最大上升**: ${maxRise.match.time} ${maxRise.match.league} - ${maxRise.option} (+${maxRise.change.toFixed(1)}%)`);
        }
        if (maxFall) {
            report.push(`- **最大下降**: ${maxFall.match.time} ${maxFall.match.league} - ${maxFall.option} (${maxFall.change.toFixed(1)}%)`);
        }
        report.push(``);
    }
    
    // 趋势分析
    report.push(`### 📈 趋势观察`);
    report.push(`1. **南美赛事波动大**: 南美杯和解放者杯比赛赔率变化较为显著`);
    report.push(`2. **北美冠军联赛极端变化**: 11:00比赛出现极端变化，平局和客胜赔率大幅上升`);
    report.push(`3. **时间分布**: 08:00-09:00时段变化较多，10:00后相对稳定`);
    report.push(``);
    
    // 所有比赛概览
    report.push(`### 📋 上午比赛概览`);
    report.push(``);
    report.push(`| 时间 | 联赛 | 主胜 | 平局 | 客胜 | 显著变化 |`);
    report.push(`|------|------|------|------|------|----------|`);
    
    for (const match of analysis.matches) {
        const hasSignificant = analysis.matchesMap.has(`${match.time} ${match.league}`);
        const changeMark = hasSignificant ? '🔴' : '⚪';
        
        report.push(`| ${match.time} | ${match.league} | ${match.odds[0].toFixed(2)} (${match.changes[0] >= 0 ? '+' : ''}${match.changes[0].toFixed(1)}%) | ` +
                   `${match.odds[1].toFixed(2)} (${match.changes[1] >= 0 ? '+' : ''}${match.changes[1].toFixed(1)}%) | ` +
                   `${match.odds[2].toFixed(2)} (${match.changes[2] >= 0 ? '+' : ''}${match.changes[2].toFixed(1)}%) | ${changeMark} |`);
    }
    
    report.push(``);
    
    report.push(`### ⚠️ 风险提示`);
    report.push(`1. **仅供参考**: 赔率分析基于公开数据，仅供参考`);
    report.push(`2. **多重因素**: 赔率变化受伤病、天气、阵容、市场情绪等多重因素影响`);
    report.push(`3. **信息滞后**: 线上赔率数据可能有延迟，建议关注最新球队新闻`);
    report.push(`4. **理性投注**: 投注有风险，请理性对待，量力而行`);
    report.push(`5. **南美赛事特点**: 南美比赛常有较大波动，需谨慎对待`);
    
    return report.join('\n');
}

// 执行分析
console.log('开始分析今天上午比赛赔率...\n');
const analysis = analyzeMatches(morningMatches, 10);
const report = generateReport(analysis);
console.log(report);

console.log('\n=== 分析总结 ===');
console.log(`• 上午比赛: ${analysis.matches.length}场`);
console.log(`• 显著变化: ${analysis.significantChanges.length}次`);
console.log(`• 重点关注: ${analysis.matchesWithSignificantChanges}场比赛`);
console.log(`• 最大变化: +${analysis.significantChanges[0]?.change.toFixed(1) || 0}% / ${analysis.significantChanges.filter(sc => sc.change < 0)[0]?.change.toFixed(1) || 0}%`);