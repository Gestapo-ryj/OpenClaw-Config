// 测试更新后的OddsAnalyzer
const OddsAnalyzer = require('./analyze-odds.js');

const testData = `Thu, 9 Apr 2026

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

 11:00
N America Champions
1.17 -12.0%
5.80 +31.8%
10.00 +33.3%`;

console.log('=== 测试更新后的OddsAnalyzer ===\n');

const analyzer = new OddsAnalyzer({
  threshold: 10,
  excludeWomen: true
});

const matches = analyzer.extractFromSgoddsText(testData);
console.log(`解析到 ${matches.length} 场比赛:\n`);

matches.forEach((match, i) => {
  console.log(`${i + 1}. ${match.time} ${match.league}`);
  console.log(`   主胜: ${match.homeWin.odds.toFixed(2)} (${match.homeWin.change >= 0 ? '+' : ''}${match.homeWin.change.toFixed(1)}%)`);
  console.log(`   平局: ${match.draw.odds.toFixed(2)} (${match.draw.change >= 0 ? '+' : ''}${match.draw.change.toFixed(1)}%)`);
  console.log(`   客胜: ${match.awayWin.odds.toFixed(2)} (${match.awayWin.change >= 0 ? '+' : ''}${match.awayWin.change.toFixed(1)}%)\n`);
});

const analysis = analyzer.analyzeChanges(matches);
console.log(analyzer.generateReport(analysis));

// 测试排除女足功能
console.log('\n=== 测试女足排除功能 ===\n');
const testDataWithWomen = `Thu, 9 Apr 2026

 08:00
Women's League
1.50 +10.0%
3.80 +5.0%
5.00 -8.0%

 09:00
Premier League
2.00 +15.0%
3.20 -5.0%
3.50 -12.0%`;

const analyzer2 = new OddsAnalyzer({
  threshold: 10,
  excludeWomen: true
});

const matches2 = analyzer2.extractFromSgoddsText(testDataWithWomen);
console.log(`排除女足后解析到 ${matches2.length} 场比赛 (应只有1场英超比赛):`);
matches2.forEach((match, i) => {
  console.log(`${i + 1}. ${match.time} ${match.league}`);
});