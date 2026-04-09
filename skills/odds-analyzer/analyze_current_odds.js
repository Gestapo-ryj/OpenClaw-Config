// 分析当前赔率数据
// 根据 odds-analyzer 技能要求

const rawData = `Sat, 4 Apr 2026 07:00Chilean League1.85 -9.8%3.10 +3.3%3.80 +15.2% 09:00Mexican League2.40 -9.4%3.30 +6.5%2.50 +6.4%11:00Mexican League1.48 -9.2%4.00 +8.1%5.20 +23.8%11:06Mexican League3.80 +15.2%3.30 1.80 -7.7% 11:15A League (Women)1.82 +1.1%3.60 3.40 -2.9% 12:00A League (Women)1.50 -3.2%4.10 +5.1%4.70 +4.4% 12:00J League 100 Year Vision2.55 +4.1%2.90 2.45 -3.9% 13:00J League 100 Year Vision3.80 +8.6%3.40 +6.2%1.72 -5.5% 13:00J League D2/D3 100 Year Vision2.15 3.00 +3.4%2.90 -1.7% 13:00J League D2/D3 100 Year Vision1.58 -1.3%3.60 +2.9%4.50 13:00J League D2/D3 100 Year Vision1.42 +3.6%3.60 -2.7%7.00 13:00J League D2/D3 100 Year Vision1.58 -4.2%3.60 +5.9%4.30 +4.9% 13:00J League D2/D3 100 Year Vision1.65 -14.1%3.20 +3.2%4.50 +32.4% 13:00J League D2/D3 100 Year Vision1.77 -17.7%3.20 +4.9%3.60 +26.3% 13:00J League D2/D3 100 Year Vision1.45 -3.3%3.90 +8.3%5.20 13:00J League D2/D3 100 Year Vision2.15 -2.3%3.10 +5.1%2.90 +1.8% 13:00J League D2/D3 100 Year Vision1.50 3.70 -2.6%4.80 13:00K League2.20 +2.3%3.10 2.90 -3.3%13:00K League2.05 +2.5%3.05 -4.7%3.20 14:00A League2.30 +4.5%3.40 +3.0%2.55 -5.6% 14:00J League 100 Year Vision2.25 +9.8%3.05 -1.6%2.70 -8.5% 15:00J League 100 Year Vision2.20 3.20 2.65 15:00J League D2/D3 100 Year Vision2.95 -4.8%2.90 -4.9%2.15 +5.9%15:30K League1.55 -3.1%3.50 +2.9%5.20 +4.0%15:30K League2.70 2.95 -3.3%2.40 +2.1% 16:35A League1.85 -3.6%3.50 +2.9%3.50 +9.4%19:00German League Div 22.05 3.30 +3.1%3.00 -1.6% 19:00German League Div 22.20 +2.3%3.30 -2.9%2.70 -1.8% 19:00German League Div 22.35 +2.2%3.30 2.55 -1.9% 19:30Singapore Premier League2.80 -6.7%3.50 -5.4%2.00 +7.0% 19:30Singapore Premier League3.40 +6.2%3.50 -7.9%1.77 19:30Indian S League4.20 -6.7%3.10 -3.1%1.70 +4.3% 19:45English Cup1.65 -4.1%3.80 +2.7%3.90 +5.4% 20:00Spanish League1.55 +1.3%3.80 4.80 -4.0% 20:00French League Div 22.70 +3.8%3.05 -1.6%2.40 -2.0% 20:00French League Div 21.50 -3.2%3.70 +2.8%5.50 +5.8% 20:00Spanish League Div 22.80 +3.7%3.20 -3.0%2.20 21:00Italian League1.92 +2.7%2.95 3.90 -2.5%21:00Swedish League3.20 3.10 -6.1%2.03 +3.0% 21:00Swedish League2.05 +1.0%3.20 3.10 21:30German League3.20 +3.2%3.60 1.90 -1.0% 21:30German League1.65 -2.9%3.70 4.10 +7.9% 21:30German League1.37 4.80 +9.1%5.50 -15.4% 21:30German League1.53 3.90 4.80 21:30German League6.00 -7.7%5.20 +10.6%1.30 -3.7% 21:30German League2.15 3.20 2.90 22:00Indian S League2.00 2.80 -3.4%3.50 +6.1% 22:15Spanish League5.00 +4.2%3.90 1.50 -2.0% 22:15Spanish League Div 22.30 +4.5%2.80 -3.4%3.00 -3.2% 22:30Dutch League1.50 +1.4%3.90 +2.6%5.00 -9.1% 23:00French League1.85 +2.8%3.30 3.70 -2.6%`;

// 解析数据
function parseOddsData(data) {
  const matches = [];
  const lines = data.split('\n');
  
  // 简单解析逻辑（实际应该更复杂）
  const regex = /(\d{2}:\d{2})([A-Za-z\s\d\(\)]+?)(\d+\.\d+)\s*([+-]?\d+\.\d+%)?(\d+\.\d+)\s*([+-]?\d+\.\d+%)?(\d+\.\d+)\s*([+-]?\d+\.\d+%)?/g;
  
  let match;
  while ((match = regex.exec(data)) !== null) {
    const time = match[1];
    const league = match[2].trim();
    const homeOdds = parseFloat(match[3]);
    const homeChange = match[4] ? parseFloat(match[4]) : 0;
    const drawOdds = parseFloat(match[5]);
    const drawChange = match[6] ? parseFloat(match[6]) : 0;
    const awayOdds = parseFloat(match[7]);
    const awayChange = match[8] ? parseFloat(match[8]) : 0;
    
    // 排除女足比赛（根据技能配置）
    if (league.includes('Women') || league.includes('(Women)')) {
      continue;
    }
    
    matches.push({
      time,
      league,
      home: { odds: homeOdds, change: homeChange },
      draw: { odds: drawOdds, change: drawChange },
      away: { odds: awayOdds, change: awayChange }
    });
  }
  
  return matches;
}

// 分析赔率变化
function analyzeChanges(matches, threshold = 10) {
  const significantChanges = [];
  
  matches.forEach(match => {
    const changes = [];
    
    if (Math.abs(match.home.change) >= threshold) {
      changes.push(`主胜: ${match.home.change > 0 ? '+' : ''}${match.home.change}%`);
    }
    if (Math.abs(match.draw.change) >= threshold) {
      changes.push(`平局: ${match.draw.change > 0 ? '+' : ''}${match.draw.change}%`);
    }
    if (Math.abs(match.away.change) >= threshold) {
      changes.push(`客胜: ${match.away.change > 0 ? '+' : ''}${match.away.change}%`);
    }
    
    if (changes.length > 0) {
      significantChanges.push({
        match: `${match.time} ${match.league}`,
        changes: changes,
        homeOdds: match.home.odds,
        drawOdds: match.draw.odds,
        awayOdds: match.away.odds
      });
    }
  });
  
  return significantChanges;
}

// 生成报告
function generateReport(matches, significantChanges) {
  const now = new Date();
  const report = [];
  
  report.push(`## 赔率分析报告 - ${now.toLocaleDateString('zh-CN')}`);
  report.push('');
  
  // 统计数据
  report.push('### 📊 统计数据');
  report.push(`- 总比赛场次: ${matches.length}`);
  report.push(`- 变化超过10%的比赛: ${significantChanges.length}`);
  report.push('');
  
  if (significantChanges.length > 0) {
    report.push('### 🎯 重点关注比赛（变化超过10%）');
    significantChanges.forEach((match, index) => {
      report.push(`${index + 1}. **${match.match}**`);
      report.push(`   - 赔率: 主胜 ${match.homeOdds} | 平 ${match.drawOdds} | 客胜 ${match.awayOdds}`);
      report.push(`   - 显著变化: ${match.changes.join(', ')}`);
      
      // 简单分析
      const analysis = [];
      if (match.homeOdds < 1.8) analysis.push('主队被看好');
      if (match.awayOdds < 1.8) analysis.push('客队被看好');
      if (match.drawOdds < 3.0) analysis.push('平局可能性较高');
      
      if (analysis.length > 0) {
        report.push(`   - 分析: ${analysis.join('; ')}`);
      }
      report.push('');
    });
  }
  
  // 最大变化
  let maxIncrease = { value: 0, match: '', type: '' };
  let maxDecrease = { value: 0, match: '', type: '' };
  
  matches.forEach(match => {
    ['home', 'draw', 'away'].forEach(type => {
      const change = match[type].change;
      if (change > maxIncrease.value) {
        maxIncrease = { value: change, match: `${match.time} ${match.league}`, type };
      }
      if (change < maxDecrease.value) {
        maxDecrease = { value: change, match: `${match.time} ${match.league}`, type };
      }
    });
  });
  
  report.push('### 📈 最大变化');
  if (maxIncrease.value > 0) {
    report.push(`- 最大上升: ${maxIncrease.match} (${maxIncrease.type === 'home' ? '主胜' : maxIncrease.type === 'draw' ? '平局' : '客胜'} +${maxIncrease.value}%)`);
  }
  if (maxDecrease.value < 0) {
    report.push(`- 最大下降: ${maxDecrease.match} (${maxDecrease.type === 'home' ? '主胜' : maxDecrease.type === 'draw' ? '平局' : '客胜'} ${maxDecrease.value}%)`);
  }
  report.push('');
  
  // 趋势观察
  report.push('### 🔍 趋势观察');
  const eveningMatches = matches.filter(m => {
    const hour = parseInt(m.time.split(':')[0]);
    return hour >= 18 && hour <= 23;
  });
  
  if (eveningMatches.length > 0) {
    report.push(`1. 晚间比赛（18:00-23:00）共有 ${eveningMatches.length} 场，包括德甲、西甲、意甲等主流联赛`);
  }
  
  const asianMatches = matches.filter(m => 
    m.league.includes('J League') || 
    m.league.includes('K League') || 
    m.league.includes('A League')
  );
  
  if (asianMatches.length > 0) {
    report.push(`2. 亚洲联赛（日职联、K联赛、澳超）共有 ${asianMatches.length} 场，变化相对活跃`);
  }
  report.push('');
  
  // 风险提示
  report.push('### ⚠️ 风险提示');
  report.push('- 赔率实时变动，以上为当前参考数据');
  report.push('- 大变化可能反映重要信息（伤病、阵容变化等）');
  report.push('- 建议结合球队新闻、伤病信息综合分析');
  report.push('- 理性投注，控制风险');
  report.push('');
  report.push('---');
  report.push('*数据来源: sgodds.com | 分析时间: ' + now.toLocaleTimeString('zh-CN') + '*');
  
  return report.join('\n');
}

// 主函数
function main() {
  console.log('🔍 开始分析赔率数据...\n');
  
  // 解析数据
  const matches = parseOddsData(rawData);
  console.log(`✅ 成功解析 ${matches.length} 场比赛数据\n`);
  
  // 分析变化
  const threshold = 10; // 默认阈值
  const significantChanges = analyzeChanges(matches, threshold);
  
  // 生成报告
  const report = generateReport(matches, significantChanges);
  console.log(report);
}

// 运行分析
main();