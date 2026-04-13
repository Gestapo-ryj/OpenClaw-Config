// 报告生成器
// 用于生成交易记录复盘报告

const fs = require('fs');
const path = require('path');

class ReportGenerator {
  constructor(analyzer, outputDir = './reports') {
    this.analyzer = analyzer;
    this.outputDir = outputDir;
    
    // 确保输出目录存在
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
  }

  // 生成完整报告
  generateFullReport() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportDate = new Date().toLocaleDateString('zh-CN');
    
    // 获取分析结果
    const basicStats = this.analyzer.analyzeBasicStats();
    const dailyStats = this.analyzer.analyzeByDate();
    const typeStats = this.analyzer.analyzeByBetType();
    
    // 生成报告内容
    let report = `# 交易记录复盘报告\n\n`;
    report += `生成时间: ${reportDate}\n`;
    report += `分析数据: ${basicStats.totalBets} 条交易记录\n\n`;
    
    report += `## 执行摘要\n\n`;
    report += `- **总投注次数**: ${basicStats.totalBets}次\n`;
    report += `- **总投注金额**: $${basicStats.totalStake.toFixed(2)}\n`;
    report += `- **总回报金额**: $${basicStats.totalPayout.toFixed(2)}\n`;
    report += `- **净盈利**: $${basicStats.netProfit.toFixed(2)}\n`;
    report += `- **投资回报率**: ${basicStats.roi}%\n`;
    report += `- **总体胜率**: ${basicStats.winRate}%\n\n`;
    
    report += `## 详细分析\n\n`;
    
    // 每日表现
    report += `### 1. 每日表现分析\n\n`;
    report += `| 日期 | 投注次数 | 投注金额 | 回报金额 | 盈利 | 胜率 | ROI |\n`;
    report += `|------|----------|----------|----------|------|------|-----|\n`;
    
    Object.entries(dailyStats).forEach(([date, stats]) => {
      const profitColor = stats.profit >= 0 ? '🟢' : '🔴';
      report += `| ${date} | ${stats.bets} | $${stats.stake.toFixed(2)} | $${stats.payout.toFixed(2)} | ${profitColor} $${stats.profit.toFixed(2)} | ${stats.winRate}% | ${stats.roi}% |\n`;
    });
    report += `\n`;
    
    // 投注类型分析
    report += `### 2. 投注类型分析\n\n`;
    report += `| 投注类型 | 投注次数 | 投注金额 | 回报金额 | 盈利 | 胜率 | ROI |\n`;
    report += `|----------|----------|----------|----------|------|------|-----|\n`;
    
    Object.entries(typeStats).forEach(([type, stats]) => {
      const profitColor = stats.profit >= 0 ? '🟢' : '🔴';
      report += `| ${type} | ${stats.bets} | $${stats.stake.toFixed(2)} | $${stats.payout.toFixed(2)} | ${profitColor} $${stats.profit.toFixed(2)} | ${stats.winRate}% | ${stats.roi}% |\n`;
    });
    report += `\n`;
    
    // 关键发现
    report += `### 3. 关键发现与建议\n\n`;
    
    // 找出最赚钱的类型
    let bestType = '';
    let bestProfit = -Infinity;
    Object.entries(typeStats).forEach(([type, stats]) => {
      if (stats.profit > bestProfit) {
        bestProfit = stats.profit;
        bestType = type;
      }
    });
    
    // 找出最亏钱的类型
    let worstType = '';
    let worstProfit = Infinity;
    Object.entries(typeStats).forEach(([type, stats]) => {
      if (stats.profit < worstProfit) {
        worstProfit = stats.profit;
        worstType = type;
      }
    });
    
    // 找出胜率最高的类型
    let bestWinRateType = '';
    let bestWinRate = -1;
    Object.entries(typeStats).forEach(([type, stats]) => {
      const winRate = parseFloat(stats.winRate);
      if (winRate > bestWinRate && stats.bets >= 3) { // 至少3次投注
        bestWinRate = winRate;
        bestWinRateType = type;
      }
    });
    
    report += `#### 表现最佳\n`;
    if (bestType) {
      report += `- **${bestType}** 类型盈利最高: $${typeStats[bestType].profit.toFixed(2)} (${typeStats[bestType].roi}% ROI)\n`;
    }
    
    if (bestWinRateType && bestWinRateType !== bestType) {
      report += `- **${bestWinRateType}** 类型胜率最高: ${typeStats[bestWinRateType].winRate}%\n`;
    }
    
    report += `\n#### 需要改进\n`;
    if (worstType) {
      report += `- **${worstType}** 类型亏损最多: $${Math.abs(typeStats[worstType].profit).toFixed(2)}\n`;
    }
    
    report += `\n#### 建议\n`;
    report += `1. **加强优势**: 继续在 ${bestType} 类型上投注，但注意风险管理\n`;
    report += `2. **改进弱点**: 减少或重新评估 ${worstType} 类型的投注策略\n`;
    report += `3. **分散风险**: 不要过度集中在单一投注类型上\n`;
    report += `4. **记录学习**: 记录每次投注的决策过程和结果，定期复盘\n\n`;
    
    // 趋势分析
    report += `### 4. 趋势分析\n\n`;
    
    const dates = Object.keys(dailyStats).sort();
    if (dates.length >= 3) {
      const firstDate = dates[0];
      const lastDate = dates[dates.length - 1];
      const firstProfit = dailyStats[firstDate].profit;
      const lastProfit = dailyStats[lastDate].profit;
      
      report += `- **时间范围**: ${firstDate} 到 ${lastDate}\n`;
      report += `- **初期表现**: ${firstDate} 盈利 $${firstProfit.toFixed(2)}\n`;
      report += `- **近期表现**: ${lastDate} 盈利 $${lastProfit.toFixed(2)}\n`;
      
      if (lastProfit > firstProfit) {
        report += `- **趋势**: 盈利呈上升趋势 📈\n`;
      } else if (lastProfit < firstProfit) {
        report += `- **趋势**: 盈利呈下降趋势 📉\n`;
      } else {
        report += `- **趋势**: 盈利保持稳定 ↔️\n`;
      }
    }
    
    report += `\n## 附录\n\n`;
    report += `### 数据统计\n`;
    report += `- 分析时间: ${new Date().toLocaleString('zh-CN')}\n`;
    report += `- 数据来源: PDF交易记录\n`;
    report += `- 报告版本: 1.0\n`;
    
    // 保存报告
    const reportPath = path.join(this.outputDir, `trading-report-${timestamp}.md`);
    fs.writeFileSync(reportPath, report);
    
    console.log(`报告已生成: ${reportPath}`);
    
    return {
      reportPath,
      reportContent: report,
      stats: { basicStats, dailyStats, typeStats }
    };
  }

  // 生成简版报告
  generateSummaryReport() {
    const basicStats = this.analyzer.analyzeBasicStats();
    
    let summary = `交易记录摘要报告\n`;
    summary += `================\n\n`;
    summary += `📊 基本统计\n`;
    summary += `总投注: ${basicStats.totalBets}次\n`;
    summary += `胜率: ${basicStats.winRate}%\n`;
    summary += `投注金额: $${basicStats.totalStake.toFixed(2)}\n`;
    summary += `回报金额: $${basicStats.totalPayout.toFixed(2)}\n`;
    summary += `净盈利: $${basicStats.netProfit.toFixed(2)}\n`;
    summary += `ROI: ${basicStats.roi}%\n`;
    
    const summaryPath = path.join(this.outputDir, 'summary-report.txt');
    fs.writeFileSync(summaryPath, summary);
    
    console.log(`摘要报告已生成: ${summaryPath}`);
    
    return summary;
  }
}

// 使用示例
if (require.main === module) {
  console.log('报告生成器');
  console.log('===========');
  console.log('这是一个报告生成器的示例，需要配合TradingAnalyzer使用。');
  console.log('');
  console.log('使用方法:');
  console.log('const analyzer = new TradingAnalyzer(data);');
  console.log('const generator = new ReportGenerator(analyzer);');
  console.log('generator.generateFullReport();');
}

module.exports = ReportGenerator;