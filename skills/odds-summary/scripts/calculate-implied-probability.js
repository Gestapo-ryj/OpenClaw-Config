#!/usr/bin/env node

/**
 * 计算隐含概率的工具脚本
 * 用法: node calculate-implied-probability.js <赔率1> <赔率2> [赔率3]
 */

const args = process.argv.slice(2);

if (args.length < 2) {
  console.log('用法: node calculate-implied-probability.js <赔率1> <赔率2> [赔率3]');
  console.log('示例: node calculate-implied-probability.js 2.50 3.20 2.80');
  process.exit(1);
}

// 将参数转换为数字
const odds = args.map(Number);

// 计算隐含概率
const impliedProbabilities = odds.map(odd => 1 / odd);
const totalProbability = impliedProbabilities.reduce((sum, prob) => sum + prob, 0);
const bookmakerMargin = totalProbability - 1;
const fairProbabilities = impliedProbabilities.map(prob => prob / totalProbability);
const fairOdds = fairProbabilities.map(prob => 1 / prob);

// 输出结果
console.log('\n📊 赔率分析结果');
console.log('='.repeat(40));

console.log('\n🎯 输入赔率:');
odds.forEach((odd, index) => {
  console.log(`  选项 ${index + 1}: ${odd.toFixed(2)}`);
});

console.log('\n📈 隐含概率分析:');
impliedProbabilities.forEach((prob, index) => {
  const percentage = (prob * 100).toFixed(2);
  console.log(`  选项 ${index + 1}: ${percentage}%`);
});

console.log(`\n💰 博彩公司利润: ${(bookmakerMargin * 100).toFixed(2)}%`);
console.log(`📊 总概率: ${(totalProbability * 100).toFixed(2)}%`);

console.log('\n⚖️ 公平赔率 (去除庄家利润):');
fairOdds.forEach((odd, index) => {
  console.log(`  选项 ${index + 1}: ${odd.toFixed(2)}`);
});

console.log('\n🎯 价值投注识别:');
const estimatedProbabilities = [0.40, 0.30, 0.30]; // 示例估算概率，实际应根据分析调整

odds.forEach((odd, index) => {
  if (index < estimatedProbabilities.length) {
    const value = (estimatedProbabilities[index] * odd) - 1;
    const valuePercent = (value * 100).toFixed(2);
    const recommendation = value > 0 ? '✅ 有价值' : '❌ 无价值';
    console.log(`  选项 ${index + 1}: 价值 ${valuePercent}% - ${recommendation}`);
  }
});

console.log('\n📝 计算公式:');
console.log('  隐含概率 = 1 / 赔率');
console.log('  总概率 = Σ(各选项隐含概率)');
console.log('  庄家利润 = 总概率 - 1');
console.log('  公平概率 = 隐含概率 / 总概率');
console.log('  公平赔率 = 1 / 公平概率');
console.log('  投注价值 = (估算概率 × 赔率) - 1');

console.log('\n⚠️ 提醒: 所有计算仅供参考，实际投注请谨慎决策');