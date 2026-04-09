#!/usr/bin/env node

/**
 * 汇总今晚比赛的脚本
 * 基于之前分析的数据
 */

console.log('⚽ 今晚比赛汇总 (2026-04-08 晚至 2026-04-09 凌晨)\n');

// 基于之前分析的数据，今晚的比赛包括：
const tonightMatches = [
  {
    time: '00:45',
    league: 'UE Europe',
    homeOdds: '2.40',
    drawOdds: '3.00',
    awayOdds: '2.70',
    homeChange: '0%',
    drawChange: '-3.2%',
    awayChange: '+3.8%',
    note: '欧洲联赛'
  },
  {
    time: '01:45',
    league: 'Russian Cup',
    homeOdds: '2.05',
    drawOdds: '3.10',
    awayOdds: '3.00',
    homeChange: '0%',
    drawChange: '0%',
    awayChange: '0%',
    note: '俄罗斯杯'
  },
  {
    time: '02:00',
    league: 'Saudi League',
    homeOdds: '1.13',
    drawOdds: '7.00',
    awayOdds: '11.00',
    homeChange: '-1.7%',
    drawChange: '+7.7%',
    awayChange: '0%',
    note: '沙特联赛'
  },
  {
    time: '02:00',
    league: 'Saudi League',
    homeOdds: '1.63',
    drawOdds: '3.70',
    awayOdds: '4.10',
    homeChange: '+6.5%',
    drawChange: '-5.1%',
    awayChange: '-14.6%',
    note: '沙特联赛'
  },
  {
    time: '03:00',
    league: 'UE Champions',
    homeOdds: '1.65',
    drawOdds: '4.10',
    awayOdds: '3.70',
    homeChange: '0%',
    drawChange: '+10.8%',
    awayChange: '-7.5%',
    note: '欧冠联赛'
  },
  {
    time: '03:00',
    league: 'UE Champions',
    homeOdds: '1.42',
    drawOdds: '4.40',
    awayOdds: '5.00',
    homeChange: '-2.1%',
    drawChange: '-2.2%',
    awayChange: '+4.2%',
    note: '欧冠联赛'
  },
  {
    time: '06:00',
    league: 'Sudamericana Cup',
    homeOdds: '1.87',
    drawOdds: '2.85',
    awayOdds: '4.20',
    homeChange: '+1.1%',
    drawChange: '-1.7%',
    awayChange: '0%',
    note: '南美杯'
  },
  {
    time: '06:00',
    league: 'Libertadores Cup',
    homeOdds: '2.40',
    drawOdds: '2.70',
    awayOdds: '3.00',
    homeChange: '0%',
    drawChange: '-1.8%',
    awayChange: '+1.7%',
    note: '解放者杯'
  }
];

// 分析赔率变化
function analyzeOddsChanges(matches) {
  const significantChanges = [];
  
  matches.forEach(match => {
    const changes = [
      { type: '主胜', value: parseFloat(match.homeChange), odds: match.homeOdds },
      { type: '平局', value: parseFloat(match.drawChange), odds: match.drawOdds },
      { type: '客胜', value: parseFloat(match.awayChange), odds: match.awayOdds }
    ];
    
    // 找出变化超过10%的选项
    const bigChanges = changes.filter(change => Math.abs(change.value) >= 10);
    
    if (bigChanges.length > 0) {
      significantChanges.push({
        time: match.time,
        league: match.league,
        changes: bigChanges,
        note: match.note
      });
    }
  });
  
  return significantChanges;
}

// 找出热门比赛
function findHotMatches(matches) {
  return matches.filter(match => {
    // 低赔率比赛（主胜赔率 < 1.50）
    const homeOdds = parseFloat(match.homeOdds);
    return homeOdds < 1.50;
  });
}

// 找出势均力敌的比赛
function findCloseMatches(matches) {
  return matches.filter(match => {
    const homeOdds = parseFloat(match.homeOdds);
    const drawOdds = parseFloat(match.drawOdds);
    const awayOdds = parseFloat(match.awayOdds);
    
    // 赔率接近的比赛（最大赔率/最小赔率 < 2.0）
    const maxOdds = Math.max(homeOdds, drawOdds, awayOdds);
    const minOdds = Math.min(homeOdds, drawOdds, awayOdds);
    
    return maxOdds / minOdds < 2.0;
  });
}

// 显示比赛列表
console.log('📅 今晚比赛列表 (按时间排序):\n');
tonightMatches.forEach((match, index) => {
  console.log(`${index + 1}. ${match.time} ${match.league} (${match.note})`);
  console.log(`   赔率: ${match.homeOdds} (${match.homeChange}) / ${match.drawOdds} (${match.drawChange}) / ${match.awayOdds} (${match.awayChange})`);
  console.log('');
});

// 分析赔率变化
console.log('📈 显著赔率变化分析 (>10%):\n');
const significantChanges = analyzeOddsChanges(tonightMatches);

if (significantChanges.length > 0) {
  significantChanges.forEach(change => {
    console.log(`⏰ ${change.time} ${change.league}:`);
    change.changes.forEach(c => {
      const direction = c.value > 0 ? '上升' : '下降';
      console.log(`   ${c.type}赔率 ${c.odds} ${direction} ${Math.abs(c.value)}%`);
    });
    console.log('');
  });
} else {
  console.log('   今晚没有超过10%的显著赔率变化\n');
}

// 热门比赛
console.log('🔥 热门比赛 (主胜赔率 < 1.50):\n');
const hotMatches = findHotMatches(tonightMatches);

if (hotMatches.length > 0) {
  hotMatches.forEach(match => {
    console.log(`   ${match.time} ${match.league}: 主胜 ${match.homeOdds} (${match.homeChange})`);
  });
  console.log('');
} else {
  console.log('   今晚没有明显热门比赛\n');
}

// 势均力敌的比赛
console.log('⚖️ 势均力敌的比赛:\n');
const closeMatches = findCloseMatches(tonightMatches);

if (closeMatches.length > 0) {
  closeMatches.forEach(match => {
    console.log(`   ${match.time} ${match.league}: ${match.homeOdds} / ${match.drawOdds} / ${match.awayOdds}`);
  });
  console.log('');
} else {
  console.log('   今晚没有特别势均力敌的比赛\n');
}

// 总结
console.log('🎯 今晚比赛总结:\n');
console.log(`   总比赛场次: ${tonightMatches.length}`);
console.log(`   时间范围: 00:45 - 06:00`);
console.log(`   联赛类型: 欧洲联赛、俄罗斯杯、沙特联赛、欧冠、南美杯、解放者杯`);
console.log(`   显著变化: ${significantChanges.length} 场比赛有超过10%的赔率变化`);
console.log(`   热门比赛: ${hotMatches.length} 场`);
console.log(`   势均力敌: ${closeMatches.length} 场`);
console.log('');

// 重点关注
console.log('👀 重点关注:\n');
if (significantChanges.length > 0) {
  console.log('1. 赔率大幅变化的比赛值得关注，可能反映重要信息');
}

if (hotMatches.length > 0) {
  console.log('2. 低赔率比赛通常实力悬殊，但需注意冷门可能');
}

if (closeMatches.length > 0) {
  console.log('3. 势均力敌的比赛往往更精彩，结果难以预测');
}

console.log('\n📊 数据来源: sgodds.com (更新于 2026-04-08 19:00:05)');
console.log('⏰ 当前时间: 新加坡时间 2026-04-09 00:51');
console.log('💡 提示: 赔率仅供参考，投注需谨慎');