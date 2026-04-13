// 交易记录分析器
// 用于分析投注交易历史数据

class TradingAnalyzer {
  constructor(data) {
    this.data = data;
    this.stats = {};
  }

  // 基本统计分析
  analyzeBasicStats() {
    const totalBets = this.data.length;
    const winningBets = this.data.filter(bet => bet.result === "Win").length;
    const losingBets = this.data.filter(bet => bet.result === "Loss").length;
    const pushBets = this.data.filter(bet => bet.result === "Push").length;
    
    const totalStake = this.data.reduce((sum, bet) => sum + bet.amount, 0);
    const totalPayout = this.data.reduce((sum, bet) => sum + bet.payout, 0);
    const netProfit = totalPayout - totalStake;
    const roi = ((netProfit / totalStake) * 100).toFixed(2);
    
    this.stats.basic = {
      totalBets,
      winningBets,
      losingBets,
      pushBets,
      totalStake,
      totalPayout,
      netProfit,
      roi,
      winRate: ((winningBets / totalBets) * 100).toFixed(1)
    };
    
    return this.stats.basic;
  }

  // 按日期分析
  analyzeByDate() {
    const dailyStats = {};
    
    this.data.forEach(bet => {
      if (!dailyStats[bet.date]) {
        dailyStats[bet.date] = {
          bets: 0,
          stake: 0,
          payout: 0,
          wins: 0,
          losses: 0,
          pushes: 0
        };
      }
      
      dailyStats[bet.date].bets++;
      dailyStats[bet.date].stake += bet.amount;
      dailyStats[bet.date].payout += bet.payout;
      
      if (bet.result === "Win") dailyStats[bet.date].wins++;
      if (bet.result === "Loss") dailyStats[bet.date].losses++;
      if (bet.result === "Push") dailyStats[bet.date].pushes++;
    });
    
    // 计算每日盈利和胜率
    Object.keys(dailyStats).forEach(date => {
      const stats = dailyStats[date];
      stats.profit = stats.payout - stats.stake;
      stats.winRate = stats.bets > 0 ? ((stats.wins / stats.bets) * 100).toFixed(1) : "0.0";
      stats.roi = stats.stake > 0 ? ((stats.profit / stats.stake) * 100).toFixed(2) : "0.00";
    });
    
    this.stats.daily = dailyStats;
    return dailyStats;
  }

  // 按投注类型分析
  analyzeByBetType() {
    const typeStats = {};
    
    this.data.forEach(bet => {
      // 提取投注类型
      let betType = this.extractBetType(bet.selection);
      
      if (!typeStats[betType]) {
        typeStats[betType] = {
          bets: 0,
          stake: 0,
          payout: 0,
          wins: 0,
          losses: 0,
          pushes: 0
        };
      }
      
      typeStats[betType].bets++;
      typeStats[betType].stake += bet.amount;
      typeStats[betType].payout += bet.payout;
      
      if (bet.result === "Win") typeStats[betType].wins++;
      if (bet.result === "Loss") typeStats[betType].losses++;
      if (bet.result === "Push") typeStats[betType].pushes++;
    });
    
    // 计算每种类型的盈利和胜率
    Object.keys(typeStats).forEach(type => {
      const stats = typeStats[type];
      stats.profit = stats.payout - stats.stake;
      stats.winRate = stats.bets > 0 ? ((stats.wins / stats.bets) * 100).toFixed(1) : "0.0";
      stats.roi = stats.stake > 0 ? ((stats.profit / stats.stake) * 100).toFixed(2) : "0.00";
    });
    
    this.stats.byType = typeStats;
    return typeStats;
  }

  // 提取投注类型
  extractBetType(selection) {
    const sel = selection.toLowerCase();
    
    if (sel.includes('both teams score') || sel.includes('will both teams score')) {
      return sel.includes('yes') ? '双进-是' : '双进-否';
    }
    
    if (sel.includes('total goals') || sel.includes('over/under')) {
      return sel.includes('over') ? '总进球-大' : '总进球-小';
    }
    
    if (sel.includes('1x2') || sel.includes('asian handicap')) {
      return '胜负盘';
    }
    
    if (sel.includes('halftime')) {
      return '半场盘';
    }
    
    return '其他';
  }

  // 生成分析报告
  generateReport() {
    const basic = this.analyzeBasicStats();
    const daily = this.analyzeByDate();
    const byType = this.analyzeByBetType();
    
    let report = '=== 交易记录分析报告 ===\n\n';
    
    // 基本统计
    report += '📊 基本统计\n';
    report += `总投注次数: ${basic.totalBets}次\n`;
    report += `获胜次数: ${basic.winningBets}次 (${basic.winRate}%)\n`;
    report += `失败次数: ${basic.losingBets}次 (${((basic.losingBets/basic.totalBets)*100).toFixed(1)}%)\n`;
    report += `平局次数: ${basic.pushBets}次 (${((basic.pushBets/basic.totalBets)*100).toFixed(1)}%)\n`;
    report += `总投注金额: $${basic.totalStake.toFixed(2)}\n`;
    report += `总回报金额: $${basic.totalPayout.toFixed(2)}\n`;
    report += `净盈利: $${basic.netProfit.toFixed(2)}\n`;
    report += `投资回报率: ${basic.roi}%\n\n`;
    
    // 每日统计
    report += '📅 每日统计\n';
    Object.entries(daily).forEach(([date, stats]) => {
      report += `${date}: ${stats.bets}注，投注$${stats.stake.toFixed(2)}，回报$${stats.payout.toFixed(2)}，盈利$${stats.profit.toFixed(2)}，胜率${stats.winRate}%\n`;
    });
    report += '\n';
    
    // 按类型统计
    report += '🎯 按投注类型统计\n';
    Object.entries(byType).forEach(([type, stats]) => {
      report += `${type}: ${stats.bets}注，投注$${stats.stake.toFixed(2)}，回报$${stats.payout.toFixed(2)}，盈利$${stats.profit.toFixed(2)}，胜率${stats.winRate}%，ROI ${stats.roi}%\n`;
    });
    
    return report;
  }
}

// 示例数据
const sampleData = [
  { date: "05 Apr 2026", time: "12:56 AM", type: "Football", selection: "Spanish League - Atletico Madrid vs Barcelona - 1X2 Barcelona @ 1.82", amount: 15.00, result: "Win", payout: 27.30 },
  { date: "05 Apr 2026", time: "07:53 AM", type: "Football", selection: "US Soccer League (Live) - Charlotte FC vs Philadelphia U (Live) - Will Both Teams Score Yes @ 1.70", amount: 25.00, result: "Win", payout: 42.50 },
  { date: "05 Apr 2026", time: "07:57 AM", type: "Football", selection: "US Soccer League (Live) - Atlanta Utd vs Columbus Crew (Live) - Will Both Teams Score Yes @ 1.95", amount: 13.00, result: "Win", payout: 25.35 }
];

// 使用示例
if (require.main === module) {
  const analyzer = new TradingAnalyzer(sampleData);
  const report = analyzer.generateReport();
  console.log(report);
}

module.exports = TradingAnalyzer;