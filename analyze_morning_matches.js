// 解析sgodds.com赔率数据并分析今天上午的比赛
const oddsData = `Thu, 9 Apr 2026

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
10.00 +33.3%

22:00
Indian S League
2.60 +2.0%
2.75 -6.8%
2.55 +6.3%

 Fri, 10 Apr 2026

00:00
Saudi League
6.00 -7.7%
4.40 +2.3%
1.37

 00:45
UE Conference
1.95 -1.0%
3.05
3.60 +2.9%

02:00
Saudi League
2.03 +1.5%
3.50
2.90 -1.7%

 03:00
UE Conference
2.45
3.20 +3.2%
2.50 -2.0%

 03:00
UE Conference
2.00 +1.5%
3.20 -3.0%
3.20

 03:00
UE Europe
1.95 -4.9%
3.10
3.40 +6.2%

 03:00
UE Europe
3.20 +14.3%
3.20 +3.2%
2.00 -11.1%

 03:00
UE Conference
1.65 -2.9%
3.50 +6.1%
4.40 +2.3%

 03:00
UE Europe
2.20
3.05
2.95

 06:00
Libertadores Cup
1.72
3.05 -1.6%
4.70 +4.4%

06:00
Sudamericana Cup
2.05 -2.4%
3.10
3.20 +3.2%

 08:00
Libertadores Cup
2.75
2.70
2.55

08:30
Sudamericana Cup
3.30 +3.1%
2.90
2.10 -2.3%

 10:00
Libertadores Cup
2.03 +3.0%
2.90
3.50 -5.4%

 17:35
A League
2.75
3.30
2.20

 Sat, 11 Apr 2026

 01:00
French League
3.40
3.50
1.90

 02:00
Dutch League
1.17
6.00
9.50

 02:30
German League
3.05 +1.7%
3.40
2.00 -1.5%

 02:45
Italian League
1.28 -1.5%
4.50 +2.3%
9.50 +5.6%

 03:00
English Premier
1.75 -2.8%
3.40
3.80

 03:00
English League Champ
2.20 +2.3%
3.10
2.90 -3.3%

 03:00
Spanish League
1.25
5.20
7.50 -16.7%

 03:05
French League
1.22
5.20
11.00

 12:00
J League 100 Year Vision
2.45
2.90
2.55

 13:00
A League
1.97
3.60
2.95

 13:00
J League 100 Year Vision
2.35
2.95
2.65

 13:00
J League 100 Year Vision
1.53
3.50
4.80

 13:00
J League 100 Year Vision
2.75
2.85 +1.8%
2.35

 14:00
J League 100 Year Vision
1.87
3.10
3.50

 14:00
J League 100 Year Vision
2.85
3.10
2.10

 15:00
A League
2.00
3.70
2.85

 15:00
J League 100 Year Vision
1.85 +1.6%
3.20 -3.0%
3.40

 15:00
J League 100 Year Vision
2.20
3.05 -1.6%
2.75

 17:35
A League
2.40
3.50
2.40

 19:30
English Premier
1.40 +2.2%
4.20 -4.5%
6.00 -7.7%

19:30
English League Champ
1.10
8.00 -5.9%
13.00 +8.3%

 19:30
English League Champ
2.70 -1.8%
3.40
2.20 +2.3%

 19:30
English League Champ
2.20
3.10
2.85

20:00
Norwegian League
1.53
3.70 -5.1%
5.20 +8.3%

 20:00
Spanish League
1.70
3.40
4.20

 21:00
Italian League
1.85 +1.6%
3.10
4.00

 21:00
Italian League
2.10 +2.4%
2.85 -1.7%
3.40

21:00
Swedish League
1.35
4.40
6.50

21:00
Swedish League
2.60
3.20
2.35

21:00
Swedish League
2.40 -4.0%
2.85 +3.6%
2.80

 21:30
German League
2.50 +4.2%
3.30
2.40 -4.0%

 21:30
German League
2.80 -5.1%
3.20
2.20 +4.8%

 21:30
German League
1.92
3.50 -2.8%
3.20 +3.2%

 21:30
German League
1.45 -2.0%
4.20 +2.4%
5.20 +4.0%

 22:00
English Premier
2.05 -2.4%
3.10
3.20 +3.2%

 22:00
English Premier
4.10
3.70
1.65

22:00
English League Champ
2.30
3.05 +1.7%
2.75 -1.8%

22:00
English League Champ
2.00
3.40 +3.0%
3.20 +3.2%

22:00
English League Champ
2.05
3.10
3.20

22:00
English League Champ
1.50
3.80
5.20

 22:00
English League Champ
1.80 +4.7%
3.60 -2.7%
3.60 -2.7%

 22:00
English League Champ
1.70 -2.9%
3.40 -2.9%
4.10 +7.9%

22:00
English League Champ
2.45
3.00
2.60

 22:00
Norwegian League
1.35
4.40
7.00

 22:30
Dutch League
1.60
3.40
5.00

Sun, 12 Apr 2026

 00:00
Italian League
1.37
4.20
7.00

 00:00
Norwegian League
3.20 +3.2%
3.90 +2.6%
1.80 -2.7%

 00:30
English Premier
1.58 +9.0%
3.80 -9.5%
4.40 -12.0%

 00:30
German League
7.50
4.80 +2.1%
1.30

 00:30
Spanish League
1.25 +4.2%
5.20 -13.3%
8.00 -11.1%

 00:45
Dutch League
3.50
3.80
1.80

 01:00
French League
2.03
3.05
3.30

 01:00
US Soccer League
2.03 -1.0%
3.30 +3.1%
3.05

 02:00
Dutch League
1.82
3.70
3.40

 02:30
US Soccer League
2.50
3.20
2.45

 02:30
US Soccer League
2.05 -6.8%
3.40 +3.0%
2.95 +7.3%

 02:45
Italian League
2.85 -1.7%
3.10
2.20

 03:00
Dutch League
4.80
3.90
1.53

 03:00
Spanish League
2.90 -6.5%
2.95 +1.7%
2.30 +4.5%

 03:05
French League
1.35
4.40 +2.3%
7.00 -6.7%

 04:30
US Soccer League
4.20 +2.4%
3.70
1.63 -1.2%

 07:30
US Soccer League
1.45
3.80
6.00

 07:30
US Soccer League
1.63
3.70
4.20

 07:30
US Soccer League
2.20
2.90
3.10

 07:30
US Soccer League
2.00 +2.6%
3.10
3.30 -5.7%

 08:30
US Soccer League
2.00
3.40
3.05

 08:30
US Soccer League
3.30 -2.9%
3.60
1.87 +2.7%

 08:30
US Soccer League
1.55
3.70 -2.6%
4.80 +2.1%

 09:30
US Soccer League
2.20 +2.3%
3.10
2.85 -3.4%

 10:30
US Soccer League
1.75 +1.7%
3.60
3.70 -2.6%

 13:00
A League
1.63
3.60
4.30 -2.3%

 13:00
J League 100 Year Vision
1.75
3.00
4.10

 15:00
J League 100 Year Vision
2.65
3.20
2.20

 17:00
A League
2.95
3.40
2.03

 18:15
Dutch League
2.40 +2.1%
3.20 -5.9%
2.55 +2.0%

 18:30
Italian League
2.05
3.10
3.20

 19:00
English League Champ
2.00
3.30
3.10

 20:00
Spanish League
2.05 -2.4%
3.30 +3.1%
3.05 +1.7%

20:30
Dutch League
2.05
3.50
2.85

 21:00
English Premier
2.80 +5.7%
3.20
2.20 -4.3%

 21:00
English Premier
2.50
3.05
2.50

 21:00
English Premier
2.45 -2.0%
3.10 -3.1%
2.55 +4.1%

21:00
Italian League
5.20
3.50
1.55

 21:30
German League
2.15
3.10
2.95

 22:15
Spanish League
2.35 -2.1%
3.00
2.75 +1.9%

 22:45
Dutch League
1.63 +1.9%
3.90
3.90 -4.9%

 23:00
Norwegian League
2.25
3.30
2.65

 23:00
Norwegian League
1.55
3.80
4.70 -2.1%

 23:15
French League
2.80
3.00
2.30

 23:15
French League
2.00 +2.6%
2.90
3.80

 23:30
English Premier
2.85
3.60 +2.9%
2.03 -1.0%

 23:30
German League
1.42
4.10
6.00

Mon, 13 Apr 2026

 00:00
Italian League
1.80 +1.7%
3.10 +1.6%
4.20 -2.3%

 00:30
Spanish League
1.58
3.70 -2.6%
4.50

 01:30
German League
2.20
2.85 +1.8%
3.10 -3.1%

 02:45
French League
1.63
3.50
4.50

 02:45
Italian League
2.90 -3.3%
3.20
2.15 +2.4%

 03:00
Spanish League
2.15
3.20
2.90

Tue, 14 Apr 2026

01:00
Swedish League
3.20
3.40
1.95

 02:45
Italian League
2.20
2.90
3.10

 03:00
English Premier
1.50 -2.0%
4.00 +2.6%
4.80

 03:00
Spanish League
2.65 +3.9%
2.75 -1.8%
2.60 -1.9%

Last Updated on 2026-04-09 08:20:07`;

// 解析赔率数据
function parseOddsData(data) {
    const lines = data.split('\n');
    const matches = [];
    let currentDate = '';
    let currentMatch = null;
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // 跳过空行
        if (!line) continue;
        
        // 检测日期行
        if (line.includes('Apr 2026')) {
            currentDate = line;
            continue;
        }
        
        // 检测时间行 (格式: "08:00" 或 " 08:00")
        if (/^\d{1,2}:\d{2}$/.test(line.replace(/^\s+/, ''))) {
            // 如果有未完成的比赛，先保存
            if (currentMatch && currentMatch.time) {
                matches.push(currentMatch);
            }
            
            currentMatch = {
                date: currentDate,
                time: line.trim(),
                league: '',
                odds: [],
                changes: []
            };
            continue;
        }
        
        // 检测联赛行 (在时间行之后)
        if (currentMatch && !currentMatch.league && line && 
            !line.includes('%') && !/^\d+\.\d+/.test(line)) {
            currentMatch.league = line;
            continue;
        }
        
        // 检测赔率行 (包含数字和可能的变化百分比)
        if (currentMatch && currentMatch.league && 
            (line.includes('.') || line.includes('%'))) {
            const parts = line.split(/\s+/);
            
            // 解析赔率和变化
            for (const part of parts) {
                if (part.includes('.')) {
                    const oddsValue = parseFloat(part);
                    if (!isNaN(oddsValue)) {
                        currentMatch.odds.push(oddsValue);
                    }
                }
                
                if (part.includes('%')) {
                    const changeValue = parseFloat(part.replace('%', ''));
                    if (!isNaN(changeValue)) {
                        currentMatch.changes.push(changeValue);
                    }
                }
            }
            
            // 如果已经收集了3个赔率，保存比赛
            if (currentMatch.odds.length >= 3) {
                // 确保changes数组长度与odds一致
                while (currentMatch.changes.length < 3) {
                    currentMatch.changes.push(0);
                }
                matches.push(currentMatch);
                currentMatch = null;
            }
        }
    }
    
    return matches;
}

// 分析上午比赛 (08:00-12:00)
function analyzeMorningMatches(matches, threshold = 10) {
    const morningMatches = [];
    const significantChanges = [];
    
    for (const match of matches) {
        // 提取小时
        const hour = parseInt(match.time.split(':')[0]);
        
        // 筛选上午比赛 (08:00-12:00)
        if (hour >= 8 && hour < 12) {
            morningMatches.push(match);
            
            // 检查是否有显著变化
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
    }
    
    // 按变化幅度排序
    significantChanges.sort((a, b) => b.absChange - a.absChange);
    
    return {
        morningMatches,
        significantChanges,
        totalMatches: morningMatches.length,
        matchesWithSignificantChanges: new Set(significantChanges.map(sc => sc.match.time + sc.match.league)).size
    };
}

// 获取球队信息
async function getTeamInfo(match) {
    // 根据联赛和时间搜索球队信息
    const searchQuery = `${match.time} ${match.league} 对阵 2026年4月9日`;
    return searchQuery;
}

// 生成报告
function generateReport(analysis) {
    const report = [];
    
    report.push(`## 📊 今天上午比赛赔率分析报告 (2026年4月9日)`);
    report.push(``);
    report.push(`### 📈 统计数据`);
    report.push(`- **上午比赛总数**: ${analysis.totalMatches} 场`);
    report.push(`- **有显著变化比赛**: ${analysis.matchesWithSignificantChanges} 场`);
    report.push(`- **数据更新时间**: 2026-04-09 08:20:07`);
    report.push(``);
    
    if (analysis.significantChanges.length > 0) {
        report.push(`### 🔍 重点关注比赛 (变化超过10%)`);
        report.push(``);
        
        // 按比赛分组
        const matchesMap = new Map();
        for (const sc of analysis.significantChanges) {
            const key = `${sc.match.time} ${sc.match.league}`;
            if (!matchesMap.has(key)) {
                matchesMap.set(key, {
                    match: sc.match,
                    changes: []
                });
            }
            matchesMap.get(key).changes.push(sc);
        }
        
        let matchCount = 1;
        for (const [key, data] of matchesMap) {
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
            report.push(`   - **球队信息**: 需要进一步搜索获取具体对阵`);
            report.push(``);
            
            matchCount++;
        }
    } else {
        report.push(`### 🔍 重点关注比赛`);
        report.push(`- 上午比赛中没有发现变化超过10%的赔率`);
        report.push(``);
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
    
    // 所有上午比赛列表
    report.push(`### 📋 所有上午比赛列表 (08:00-12:00)`);
    report.push(``);
    for (const match of analysis.morningMatches) {
        const hasSignificant = match.changes.some(c => Math.abs(c) >= 10);
        const marker = hasSignificant ? '🔴' : '⚪';
        report.push(`${marker} **${match.time} ${match.league}**`);
        report.push(`   主胜: ${match.odds[0].toFixed(2)} (${match.changes[0] >= 0 ? '+' : ''}${match.changes[0].toFixed(1)}%) | ` +
                   `平: ${match.odds[1].toFixed(2)} (${match.changes[1] >= 0 ? '+' : ''}${match.changes[1].toFixed(1)}%) | ` +
                   `客胜: ${match.odds[2].toFixed(2)} (${match.changes[2] >= 0 ? '+' : ''}${match.changes[2].toFixed(1)}%)`);
        report.push(``);
    }
    
    report.push(`### ⚠️ 风险提示`);
    report.push(`1. 赔率分析仅供参考，实际投注需谨慎`);
    report.push(`2. 赔率变化可能受多种因素影响（伤病、天气、阵容等）`);
    report.push(`3. 建议结合球队最新信息进行综合判断`);
    report.push(`4. 投注有风险，请理性对待`);
    
    return report.join('\n');
}

// 主函数
async function main() {
    console.log('开始解析赔率数据...');
    const matches = parseOddsData(oddsData);
    console.log(`解析到 ${matches.length} 场比赛数据`);
    
    console.log('\n分析上午比赛...');
    const analysis = analyzeMorningMatches(matches, 10);
    
    console.log('\n生成报告...');
    const report = generateReport(analysis);
    
    console.log(report);
    
    // 输出统计信息
    console.log('\n=== 分析完成 ===');
    console.log(`上午比赛总数: ${analysis.totalMatches}`);
    console.log(`有显著变化比赛: ${analysis.matchesWithSignificantChanges}`);
    console.log(`显著变化总数: ${analysis.significantChanges.length}`);
}

// 执行
main().catch(console.error);