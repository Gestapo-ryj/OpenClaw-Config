// 分析今天比赛赔率的脚本
const OddsAnalyzer = require('/Users/rongyingjie/.openclaw/workspace/skills/odds-analyzer/scripts/analyze-odds.js');

// 从网页获取的赔率数据
const todayOddsData = `Thu, 9 Apr 2026
22:00
Indian S League
2.60 +2.0%
2.75 -6.8%
2.55 +6.3%

Fri, 10 Apr 2026
00:00
Saudi League
5.80 -10.8%
4.10 -4.7%
1.42 +3.6%

00:45
UE Conference
1.95 -1.0%
3.05
3.60 +2.9%

02:00
Saudi League
1.87 -6.5%
3.60 +2.9%
3.20 +8.5%

03:00
UE Conference
2.25 -8.2%
3.10
2.80 +9.8%

03:00
UE Conference
2.00 +1.5%
3.20 -3.0%
3.20

03:00
UE Europe
2.00 -2.4%
3.00 -3.2%
3.40 +6.2%

03:00
UE Europe
3.40 +21.4%
3.10
1.95 -13.3%

03:00
UE Conference
1.63 -4.1%
3.50 +6.1%
4.50 +4.7%

03:00
UE Europe
2.15 -2.3%
3.00 -1.6%
3.10 +5.1%

06:00
Libertadores Cup
1.70 -1.2%
3.10
4.80 +6.7%

06:00
Sudamericana Cup
2.05 -2.4%
3.10
3.20 +3.2%

08:00
Libertadores Cup
2.85 +3.6%
2.65 -1.9%
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

19:30
Indian S League
1.82
3.10
3.60

22:00
Indian S League
1.48
3.70
5.00`;

// 创建分析器实例
const analyzer = new OddsAnalyzer({
  threshold: 5, // 变化阈值5%
  timeRange: 'all', // 分析所有时间
  outputDetail: 'full', // 完整输出
  excludeWomen: true // 排除女足比赛
});

console.log('=== 2026年4月9日-10日比赛赔率分析 ===\n');

// 分析赔率数据并生成报告
const report = analyzer.quickAnalyze(todayOddsData);

console.log(report);

// 特别关注变化较大的比赛
console.log('\n=== 重点关注比赛（变化超过10%）===');
const significantMatches = analysis.matches.filter(match => 
  match.odds.some(odd => Math.abs(odd.change) >= 10)
);

if (significantMatches.length > 0) {
  significantMatches.forEach((match, index) => {
    console.log(`\n${index + 1}. ${match.time} ${match.league}`);
    match.odds.forEach((odd, oddIndex) => {
      const option = oddIndex === 0 ? '主胜' : oddIndex === 1 ? '平局' : '客胜';
      console.log(`   ${option}: ${odd.odds} (${odd.change > 0 ? '+' : ''}${odd.change}%)`);
    });
    
    // 找出最大变化
    const maxChange = Math.max(...match.odds.map(o => Math.abs(o.change)));
    const maxChangeOdd = match.odds.find(o => Math.abs(o.change) === maxChange);
    const maxChangeOption = match.odds.indexOf(maxChangeOdd) === 0 ? '主胜' : 
                          match.odds.indexOf(maxChangeOdd) === 1 ? '平局' : '客胜';
    
    console.log(`   📈 最大变化: ${maxChangeOption} ${maxChangeOdd.change > 0 ? '+' : ''}${maxChangeOdd.change}%`);
  });
} else {
  console.log('没有发现变化超过10%的比赛');
}

// 分析投注机会
console.log('\n=== 潜在投注机会分析 ===');

// 1. 赔率大幅下降的比赛（市场看好）
const droppingOddsMatches = analysis.matches.filter(match =>
  match.odds.some(odd => odd.change <= -8)
);

if (droppingOddsMatches.length > 0) {
  console.log('\n1. 市场看好的比赛（赔率大幅下降）：');
  droppingOddsMatches.forEach((match, index) => {
    const droppingOdds = match.odds.filter(odd => odd.change <= -8);
    droppingOdds.forEach(odd => {
      const option = match.odds.indexOf(odd) === 0 ? '主胜' : 
                    match.odds.indexOf(odd) === 1 ? '平局' : '客胜';
      console.log(`   - ${match.time} ${match.league}: ${option} ${odd.odds} (${odd.change}%)`);
    });
  });
}

// 2. 赔率大幅上升的比赛（可能被低估）
const risingOddsMatches = analysis.matches.filter(match =>
  match.odds.some(odd => odd.change >= 8)
);

if (risingOddsMatches.length > 0) {
  console.log('\n2. 可能被低估的比赛（赔率大幅上升）：');
  risingOddsMatches.forEach((match, index) => {
    const risingOdds = match.odds.filter(odd => odd.change >= 8);
    risingOdds.forEach(odd => {
      const option = match.odds.indexOf(odd) === 0 ? '主胜' : 
                    match.odds.indexOf(odd) === 1 ? '平局' : '客胜';
      console.log(`   - ${match.time} ${match.league}: ${option} ${odd.odds} (${odd.change}%)`);
    });
  });
}

// 3. 平局赔率异常的比赛
const drawOpportunities = analysis.matches.filter(match => {
  const drawOdd = match.odds[1]; // 平局赔率
  return drawOdd && drawOdd.odds >= 3.0 && Math.abs(drawOdd.change) <= 5;
});

if (drawOpportunities.length > 0) {
  console.log('\n3. 平局机会较高的比赛：');
  drawOpportunities.forEach((match, index) => {
    const drawOdd = match.odds[1];
    console.log(`   - ${match.time} ${match.league}: 平局 ${drawOdd.odds} (${drawOdd.change}%)`);
  });
}

// 4. 高风险高回报比赛
const highRiskMatches = analysis.matches.filter(match => {
  const maxOdds = Math.max(...match.odds.map(o => o.odds));
  return maxOdds >= 4.0;
});

if (highRiskMatches.length > 0) {
  console.log('\n4. 高风险高回报比赛：');
  highRiskMatches.forEach((match, index) => {
    const maxOdd = Math.max(...match.odds.map(o => o.odds));
    const maxOddIndex = match.odds.findIndex(o => o.odds === maxOdd);
    const option = maxOddIndex === 0 ? '主胜' : maxOddIndex === 1 ? '平局' : '客胜';
    console.log(`   - ${match.time} ${match.league}: ${option} ${maxOdd}`);
  });
}

console.log('\n=== 投注建议 ===');
console.log('1. 关注变化超过10%的比赛，市场预期变化明显');
console.log('2. 赔率大幅下降的选项通常被市场看好');
console.log('3. 赔率大幅上升的选项可能存在价值投注机会');
console.log('4. 平局赔率高于3.0且变化不大的比赛值得关注');
console.log('5. 高风险高回报比赛适合小注尝试');

console.log('\n=== 风险提示 ===');
console.log('1. 赔率变化受多种因素影响，需结合球队基本面分析');
console.log('2. 大幅变化可能是市场过度反应');
console.log('3. 投注前请确认最新赔率和球队信息');
console.log('4. 理性投注，控制风险');