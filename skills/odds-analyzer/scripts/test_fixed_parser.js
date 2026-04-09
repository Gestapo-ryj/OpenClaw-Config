/**
 * 修复版赔率数据解析器
 * 针对sgodds.com的实际数据格式
 */

class FixedOddsParser {
  constructor() {
    this.threshold = 10;
  }

  /**
   * 解析sgodds.com数据（修复版）
   * @param {string} text - 页面文本内容
   * @returns {Array} 结构化赔率数据
   */
  parseSgoddsData(text) {
    const matches = [];
    const lines = text.split('\n');
    
    let currentDate = null;
    let currentTime = null;
    let currentLeague = null;
    let collectingOdds = false;
    let oddsLines = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (!line) continue;
      
      // 检测日期行，如 "Thu, 9 Apr 2026"
      const dateMatch = line.match(/(Mon|Tue|Wed|Thu|Fri|Sat|Sun),?\s+(\d+)\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{4})/);
      if (dateMatch) {
        currentDate = line;
        continue;
      }
      
      // 检测时间行，如 "08:00"（单独一行）
      const timeMatch = line.match(/^(\d{1,2}:\d{2})$/);
      if (timeMatch) {
        // 如果之前有正在收集的比赛，先处理
        if (collectingOdds && oddsLines.length >= 3) {
          const match = this.processOddsLines(currentDate, currentTime, currentLeague, oddsLines);
          if (match) matches.push(match);
        }
        
        // 重置状态
        currentTime = timeMatch[1];
        currentLeague = null;
        collectingOdds = false;
        oddsLines = [];
        continue;
      }
      
      // 检测联赛行（在时间行之后）
      if (currentTime && !currentLeague && !collectingOdds) {
        // 联赛行不包含数字和百分号
        if (!line.match(/\d/) && !line.includes('%')) {
          currentLeague = line;
          collectingOdds = true;
          continue;
        }
      }
      
      // 收集赔率行
      if (collectingOdds && currentLeague) {
        // 赔率行包含数字和可能的变化百分比
        if (line.match(/\d+\.\d+/)) {
          oddsLines.push(line);
          
          // 如果收集了3行赔率，处理比赛
          if (oddsLines.length >= 3) {
            const match = this.processOddsLines(currentDate, currentTime, currentLeague, oddsLines);
            if (match) matches.push(match);
            
            // 重置收集状态
            collectingOdds = false;
            oddsLines = [];
          }
        }
      }
    }
    
    // 处理最后可能未完成的比赛
    if (collectingOdds && oddsLines.length >= 3) {
      const match = this.processOddsLines(currentDate, currentTime, currentLeague, oddsLines);
      if (match) matches.push(match);
    }
    
    return matches;
  }

  /**
   * 处理赔率行数据
   * @param {string} date - 日期
   * @param {string} time - 时间
   * @param {string} league - 联赛
   * @param {Array<string>} oddsLines - 赔率行数组（3行）
   * @returns {Object|null} 比赛数据
   */
  processOddsLines(date, time, league, oddsLines) {
    try {
      // 解析三行赔率数据
      const homeWinLine = oddsLines[0];
      const drawLine = oddsLines[1];
      const awayWinLine = oddsLines[2];
      
      const homeWin = this.parseOddsLine(homeWinLine);
      const draw = this.parseOddsLine(drawLine);
      const awayWin = this.parseOddsLine(awayWinLine);
      
      if (!homeWin || !draw || !awayWin) {
        return null;
      }
      
      return {
        date: date,
        time: time,
        league: league,
        homeWin: {
          odds: homeWin.odds,
          change: homeWin.change
        },
        draw: {
          odds: draw.odds,
          change: draw.change
        },
        awayWin: {
          odds: awayWin.odds,
          change: awayWin.change
        }
      };
    } catch (error) {
      console.error('处理赔率行时出错:', error);
      return null;
    }
  }

  /**
   * 解析单行赔率数据
   * @param {string} line - 赔率行，如 "3.30 +20.0%" 或 "2.50"
   * @returns {Object|null} {odds: number, change: number}
   */
  parseOddsLine(line) {
    const match = line.match(/(\d+\.\d+)(?:\s+([+-]?\d+\.\d+)%)?/);
    if (!match) return null;
    
    const odds = parseFloat(match[1]);
    const changeStr = match[2];
    const change = changeStr ? parseFloat(changeStr) : 0;
    
    return { odds, change };
  }

  /**
   * 分析赔率变化
   * @param {Array} matches - 比赛数据
   * @returns {Object} 分析结果
   */
  analyzeChanges(matches) {
    const results = {
      totalMatches: matches.length,
      matchesWithChanges: 0,
      significantChanges: [],
      maxIncrease: { value: 0, match: null, option: null },
      maxDecrease: { value: 0, match: null, option: null }
    };

    matches.forEach(match => {
      let hasSignificantChange = false;
      const matchChanges = [];
      
      // 检查每个赔率选项
      ['homeWin', 'draw', 'awayWin'].forEach(option => {
        const change = Math.abs(match[option].change);
        if (change >= this.threshold) {
          hasSignificantChange = true;
          matchChanges.push({
            option,
            change: match[option].change,
            odds: match[option].odds
          });
          
          // 更新最大变化
          if (match[option].change > results.maxIncrease.value) {
            results.maxIncrease = {
              value: match[option].change,
              match: match,
              option: option
            };
          }
          if (match[option].change < results.maxDecrease.value) {
            results.maxDecrease = {
              value: match[option].change,
              match: match,
              option: option
            };
          }
        }
      });
      
      if (hasSignificantChange) {
        results.matchesWithChanges++;
        results.significantChanges.push({
          match,
          changes: matchChanges
        });
      }
    });
    
    return results;
  }

  /**
   * 生成简单报告
   * @param {Object} analysis - 分析结果
   * @returns {string} 报告文本
   */
  generateReport(analysis) {
    let report = `## 赔率分析报告（修复版）\n\n`;
    report += `### 📊 统计数据\n`;
    report += `- **总比赛场次**: ${analysis.totalMatches}\n`;
    report += `- **变化超过${this.threshold}%的比赛**: ${analysis.matchesWithChanges}\n\n`;
    
    if (analysis.significantChanges.length > 0) {
      report += `### 🔍 重点关注比赛\n\n`;
      
      analysis.significantChanges.forEach((item, index) => {
        const match = item.match;
        report += `${index + 1}. **${match.time} ${match.league}**\n`;
        report += `   - **赔率**: 主胜 ${match.homeWin.odds.toFixed(2)} (${match.homeWin.change >= 0 ? '+' : ''}${match.homeWin.change.toFixed(1)}%) | `;
        report += `平 ${match.draw.odds.toFixed(2)} (${match.draw.change >= 0 ? '+' : ''}${match.draw.change.toFixed(1)}%) | `;
        report += `客胜 ${match.awayWin.odds.toFixed(2)} (${match.awayWin.change >= 0 ? '+' : ''}${match.awayWin.change.toFixed(1)}%)\n`;
        
        item.changes.forEach(change => {
          const optionName = change.option === 'homeWin' ? '主胜' : 
                           change.option === 'draw' ? '平局' : '客胜';
          const direction = change.change > 0 ? '上升' : '下降';
          report += `   - **${optionName}**大幅${direction}${Math.abs(change.change).toFixed(1)}%\n`;
        });
        
        report += `\n`;
      });
      
      // 最大变化
      if (analysis.maxIncrease.value > 0) {
        const optionName = analysis.maxIncrease.option === 'homeWin' ? '主胜' : 
                         analysis.maxIncrease.option === 'draw' ? '平局' : '客胜';
        report += `### 📈 最大变化\n`;
        report += `- **最大上升**: ${analysis.maxIncrease.match.time} ${analysis.maxIncrease.match.league} - ${optionName} (+${analysis.maxIncrease.value.toFixed(1)}%)\n`;
      }
      if (analysis.maxDecrease.value < 0) {
        const optionName = analysis.maxDecrease.option === 'homeWin' ? '主胜' : 
                         analysis.maxDecrease.option === 'draw' ? '平局' : '客胜';
        report += `- **最大下降**: ${analysis.maxDecrease.match.time} ${analysis.maxDecrease.match.league} - ${optionName} (${analysis.maxDecrease.value.toFixed(1)}%)\n`;
      }
    }
    
    report += `\n---\n`;
    report += `*数据来源: sgodds.com | 分析时间: ${new Date().toLocaleString('zh-CN')}*\n`;
    report += `*提示: 赔率分析仅供参考，投注有风险，请理性决策*`;
    
    return report;
  }
}

// 测试
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

console.log('=== 测试修复版解析器 ===\n');

const parser = new FixedOddsParser();
const matches = parser.parseSgoddsData(testData);

console.log(`解析到 ${matches.length} 场比赛:\n`);
matches.forEach((match, i) => {
  console.log(`${i + 1}. ${match.time} ${match.league}`);
  console.log(`   主胜: ${match.homeWin.odds} (${match.homeWin.change}%)`);
  console.log(`   平局: ${match.draw.odds} (${match.draw.change}%)`);
  console.log(`   客胜: ${match.awayWin.odds} (${match.awayWin.change}%)\n`);
});

const analysis = parser.analyzeChanges(matches);
console.log(parser.generateReport(analysis));