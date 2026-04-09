/**
 * 足球赔率分析脚本
 * 用于分析sgodds.com等赔率数据
 */

class OddsAnalyzer {
  constructor(options = {}) {
    this.threshold = options.threshold || 10; // 默认10%变化阈值
    this.minOdds = options.minOdds || 1.01;
    this.maxOdds = options.maxOdds || 100;
    this.leagueFilter = options.leagueFilter || null;
    this.timeFilter = options.timeFilter || null;
    this.excludeWomen = options.excludeWomen !== undefined ? options.excludeWomen : true; // 默认排除女足比赛
  }

  /**
   * 从sgodds.com页面文本提取赔率数据（修复版）
   * 针对实际数据格式：时间、联赛、赔率各占一行
   * @param {string} text - 页面文本内容
   * @returns {Array} 结构化赔率数据
   */
  extractFromSgoddsText(text) {
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
          
          // 排除女足比赛（如果启用）
          if (this.excludeWomen && this.isWomenLeague(currentLeague)) {
            // 跳过女足比赛，重置状态
            currentTime = null;
            currentLeague = null;
            continue;
          }
          
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
   * 判断是否为女足联赛
   * @param {string} leagueName - 联赛名称
   * @returns {boolean} 是否为女足联赛
   */
  isWomenLeague(leagueName) {
    const womenKeywords = [
      'Women',
      'Women\'s',
      'Womens',
      '女子',
      '女足',
      'Female',
      'Ladies',
      'Frauen',
      'Femenino',
      'Féminin'
    ];
    
    const lowerLeague = leagueName.toLowerCase();
    return womenKeywords.some(keyword => 
      lowerLeague.includes(keyword.toLowerCase())
    );
  }

  /**
   * 解析变化百分比字符串
   * @param {string} changeStr - 如 "+10.3%" 或 "-15.4%"
   * @returns {number} 变化百分比数值
   */
  parseChange(changeStr) {
    if (!changeStr) return 0;
    const match = changeStr.match(/([+-]?\d+\.\d+)%/);
    return match ? parseFloat(match[1]) : 0;
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
      maxDecrease: { value: 0, match: null, option: null },
      byLeague: {},
      byTime: {}
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
      
      // 按联赛统计
      if (!results.byLeague[match.league]) {
        results.byLeague[match.league] = {
          count: 0,
          changes: []
        };
      }
      results.byLeague[match.league].count++;
      
      // 按时间统计
      const hour = parseInt(match.time.split(':')[0]);
      const timeSlot = this.getTimeSlot(hour);
      if (!results.byTime[timeSlot]) {
        results.byTime[timeSlot] = {
          count: 0,
          changes: []
        };
      }
      results.byTime[timeSlot].count++;
    });
    
    return results;
  }

  /**
   * 获取时间段
   * @param {number} hour - 小时
   * @returns {string} 时间段
   */
  getTimeSlot(hour) {
    if (hour >= 0 && hour < 6) return '凌晨 (00:00-06:00)';
    if (hour >= 6 && hour < 12) return '上午 (06:00-12:00)';
    if (hour >= 12 && hour < 18) return '下午 (12:00-18:00)';
    return '晚上 (18:00-24:00)';
  }

  /**
   * 生成分析报告
   * @param {Object} analysis - 分析结果
   * @returns {string} 报告文本
   */
  generateReport(analysis) {
    let report = `## 赔率分析报告\n\n`;
    report += `### 统计数据\n`;
    report += `- 总比赛场次: ${analysis.totalMatches}\n`;
    report += `- 变化超过${this.threshold}%的比赛: ${analysis.matchesWithChanges}\n\n`;
    
    if (analysis.significantChanges.length > 0) {
      report += `### 重点关注比赛（变化超过${this.threshold}%）\n\n`;
      
      analysis.significantChanges.forEach((item, index) => {
        const match = item.match;
        report += `${index + 1}. **${match.time} ${match.league}**\n`;
        report += `   - 赔率: ${match.homeWin.odds} / ${match.draw.odds} / ${match.awayWin.odds}\n`;
        
        item.changes.forEach(change => {
          const optionName = {
            'homeWin': '主胜',
            'draw': '平局',
            'awayWin': '客胜'
          }[change.option];
          
          report += `   - ${optionName}: ${change.change > 0 ? '+' : ''}${change.change}% (赔率: ${change.odds})\n`;
        });
        report += '\n';
      });
    }
    
    if (analysis.maxIncrease.value !== 0) {
      report += `### 最大变化\n`;
      report += `- **最大上升**: ${analysis.maxIncrease.value > 0 ? '+' : ''}${analysis.maxIncrease.value}%\n`;
      report += `  - 比赛: ${analysis.maxIncrease.match.time} ${analysis.maxIncrease.match.league}\n`;
      report += `  - 选项: ${analysis.maxIncrease.option === 'homeWin' ? '主胜' : analysis.maxIncrease.option === 'draw' ? '平局' : '客胜'}\n`;
    }
    
    if (analysis.maxDecrease.value !== 0) {
      report += `- **最大下降**: ${analysis.maxDecrease.value > 0 ? '+' : ''}${analysis.maxDecrease.value}%\n`;
      report += `  - 比赛: ${analysis.maxDecrease.match.time} ${analysis.maxDecrease.match.league}\n`;
      report += `  - 选项: ${analysis.maxDecrease.option === 'homeWin' ? '主胜' : analysis.maxDecrease.option === 'draw' ? '平局' : '客胜'}\n`;
    }
    
    report += `\n### 按联赛分布\n`;
    Object.entries(analysis.byLeague).forEach(([league, data]) => {
      report += `- ${league}: ${data.count}场比赛\n`;
    });
    
    report += `\n### 按时间段分布\n`;
    Object.entries(analysis.byTime).forEach(([timeSlot, data]) => {
      report += `- ${timeSlot}: ${data.count}场比赛\n`;
    });
    
    report += `\n### 分析说明\n`;
    report += `1. 赔率变化反映了市场对比赛结果的预期变化\n`;
    report += `2. 大幅变化可能源于球队新闻、伤病、阵容调整等信息\n`;
    report += `3. 多个选项同时变化通常比单一选项变化更有意义\n`;
    report += `4. 临近比赛开始的变化通常更准确反映最新情况\n`;
    
    report += `\n---\n`;
    report += `*数据来源: sgodds.com | 分析时间: ${new Date().toLocaleString('zh-CN')}*\n`;
    report += `*提示: 赔率分析仅供参考，投注有风险，请理性决策*`;
    
    return report;
  }

  /**
   * 快速分析函数（一站式）
   * @param {string} text - sgodds.com页面文本
   * @returns {string} 分析报告
   */
  quickAnalyze(text) {
    try {
      const matches = this.extractFromSgoddsText(text);
      const analysis = this.analyzeChanges(matches);
      return this.generateReport(analysis);
    } catch (error) {
      return `分析失败: ${error.message}\n请检查数据格式是否正确。`;
    }
  }
}

// 导出供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
  module.exports = OddsAnalyzer;
}

// 示例使用
if (typeof window === 'undefined' && require.main === module) {
  // Node.js环境测试
  const fs = require('fs');
  const path = require('path');
  
  // 读取示例数据
  const sampleData = fs.readFileSync(
    path.join(__dirname, '../references/sample-sgodds.txt'), 
    'utf8'
  );
  
  const analyzer = new OddsAnalyzer({ threshold: 10 });
  const report = analyzer.quickAnalyze(sampleData);
  console.log(report);
}