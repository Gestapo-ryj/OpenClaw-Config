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

// 使用quickAnalyze生成基础报告
const report = analyzer.quickAnalyze(todayOddsData);
console.log(report);

// 为了进一步分析，我需要直接调用内部方法
console.log('\n=== 详细赔率变化分析 ===');

// 提取比赛数据
const matches = analyzer.extractFromSgoddsText(todayOddsData);
console.log(`共解析到 ${matches.length} 场比赛\n`);

// 分析变化
const analysis = analyzer.analyzeChanges(matches);

// 找出变化最大的比赛
const matchesWithChanges = matches.map(match => {
  if (!match.odds || match.odds.length === 0) {
    return {
      ...match,
      maxChange: 0,
      minChange: 0,
      maxChangeOption: '无数据',
      maxChangeValue: 0
    };
  }
  
  const maxChange = Math.max(...match.odds.map(o => Math.abs(o.change)));
  const minChange = Math.min(...match.odds.map(o => o.change));
  const maxChangeOdd = match.odds.find(o => Math.abs(o.change) === maxChange);
  const option = match.odds.indexOf(maxChangeOdd) === 0 ? '主胜' : 
                match.odds.indexOf(maxChangeOdd) === 1 ? '平局' : '客胜';
  
  return {
    ...match,
    maxChange,
    minChange,
    maxChangeOption: option,
    maxChangeValue: maxChangeOdd ? maxChangeOdd.change : 0
  };
});

// 过滤有赔率数据的比赛
const validMatches = matchesWithChanges.filter(match => match.odds && match.odds.length > 0);
console.log(`有效比赛数量: ${validMatches.length}`);

// 按变化大小排序
validMatches.sort((a, b) => Math.abs(b.maxChange) - Math.abs(a.maxChange));

console.log('📊 赔率变化排名（绝对值）:');
if (validMatches.length > 0) {
  validMatches.forEach((match, index) => {
    if (Math.abs(match.maxChange) >= 5) {
      console.log(`${index + 1}. ${match.time} ${match.league}`);
      console.log(`   最大变化: ${match.maxChangeOption} ${match.maxChangeValue > 0 ? '+' : ''}${match.maxChangeValue}%`);
      
      // 显示所有赔率
      match.odds.forEach((odd, oddIndex) => {
        const option = oddIndex === 0 ? '主胜' : oddIndex === 1 ? '平局' : '客胜';
        console.log(`   ${option}: ${odd.odds} (${odd.change > 0 ? '+' : ''}${odd.change}%)`);
      });
      console.log('');
    }
  });
} else {
  console.log('没有有效的赔率数据');
}

// 分析投注机会
console.log('🎯 投注机会识别:');

// 1. 赔率大幅下降（市场看好）
console.log('\n1. 市场看好的选项（赔率下降超过8%）:');
validMatches.forEach(match => {
  match.odds.forEach((odd, oddIndex) => {
    if (odd.change <= -8) {
      const option = oddIndex === 0 ? '主胜' : oddIndex === 1 ? '平局' : '客胜';
      console.log(`   ${match.time} ${match.league}: ${option} ${odd.odds} (${odd.change}%)`);
    }
  });
});

// 2. 赔率大幅上升（可能被低估）
console.log('\n2. 可能被低估的选项（赔率上升超过8%）:');
validMatches.forEach(match => {
  match.odds.forEach((odd, oddIndex) => {
    if (odd.change >= 8) {
      const option = oddIndex === 0 ? '主胜' : oddIndex === 1 ? '平局' : '客胜';
      console.log(`   ${match.time} ${match.league}: ${option} ${odd.odds} (${odd.change}%)`);
    }
  });
});

// 3. 高风险高回报
console.log('\n3. 高风险高回报选项（赔率≥4.0）:');
validMatches.forEach(match => {
  match.odds.forEach((odd, oddIndex) => {
    if (odd.odds >= 4.0) {
      const option = oddIndex === 0 ? '主胜' : oddIndex === 1 ? '平局' : '客胜';
      console.log(`   ${match.time} ${match.league}: ${option} ${odd.odds} (${odd.change > 0 ? '+' : ''}${odd.change}%)`);
    }
  });
});

// 4. 平局机会
console.log('\n4. 平局机会分析（平局赔率≥3.0）:');
validMatches.forEach(match => {
  const drawOdd = match.odds[1]; // 平局赔率
  if (drawOdd && drawOdd.odds >= 3.0) {
    console.log(`   ${match.time} ${match.league}: 平局 ${drawOdd.odds} (${drawOdd.change > 0 ? '+' : ''}${drawOdd.change}%)`);
  }
});

// 按联赛分析
console.log('\n📈 按联赛分析:');
const byLeague = {};
validMatches.forEach(match => {
  if (!byLeague[match.league]) {
    byLeague[match.league] = {
      count: 0,
      avgChange: 0,
      maxChange: 0
    };
  }
  byLeague[match.league].count++;
  byLeague[match.league].avgChange += match.maxChange;
  if (Math.abs(match.maxChange) > Math.abs(byLeague[match.league].maxChange)) {
    byLeague[match.league].maxChange = match.maxChange;
  }
});

Object.entries(byLeague).forEach(([league, data]) => {
  data.avgChange = (data.avgChange / data.count).toFixed(1);
  console.log(`   ${league}: ${data.count}场，平均变化: ${data.avgChange}%，最大变化: ${data.maxChange}%`);
});

// 投注建议
console.log('\n💡 今日投注建议:');
console.log('1. 重点关注变化超过10%的比赛，市场预期明确');
console.log('2. UE Europe联赛变化最大，值得特别关注');
console.log('3. 赔率下降的选项通常被市场看好，但需注意是否过度反应');
console.log('4. 赔率上升的选项可能存在价值投注机会');
console.log('5. 高风险高回报选项适合小注尝试');

console.log('\n⚠️ 风险提示:');
console.log('1. 赔率变化受多种因素影响，需结合球队基本面');
console.log('2. 大幅变化可能是市场过度反应，需谨慎判断');
console.log('3. 投注前确认最新赔率和球队信息');
console.log('4. 理性投注，控制风险，量力而行');

console.log('\n🕒 更新时间: 2026-04-09 13:30 (新加坡时间)');