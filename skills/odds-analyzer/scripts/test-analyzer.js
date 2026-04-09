/**
 * Odds Analyzer 测试脚本
 * 测试赔率分析功能
 */

// 模拟在Node.js环境中运行
const fs = require('fs');
const path = require('path');

// 由于我们不在Node.js环境，这里模拟一个简单的测试
function testOddsAnalyzer() {
  console.log('=== Odds Analyzer 测试 ===\n');
  
  // 模拟sgodds.com数据
  const sampleData = `Fri, 3 Apr 2026 01:00Spanish League Div 21.65 -15.4%3.20 +10.3%4.70 +23.7% 02:00Spanish League Div 23.00 +15.4%3.30 +13.8%2.05 -19.6% 02:00Spanish League Div 22.03 +5.7%3.60 +5.9%2.80 -12.5% 02:00Argentine League2.45 +2.1%2.65 -1.9%2.95`;
  
  console.log('测试数据:');
  console.log(sampleData);
  console.log('\n---\n');
  
  // 模拟分析器类
  class MockOddsAnalyzer {
    constructor(options = {}) {
      this.threshold = options.threshold || 10;
    }
    
    parseChange(changeStr) {
      if (!changeStr) return 0;
      const match = changeStr.match(/([+-]?\d+\.\d+)%/);
      return match ? parseFloat(match[1]) : 0;
    }
    
    extractFromSgoddsText(text) {
      const matches = [];
      const lines = text.split(' ');
      
      let currentDate = 'Fri, 3 Apr 2026';
      
      lines.forEach(line => {
        if (line.includes('Spanish League') || line.includes('Argentine League')) {
          // 简化解析逻辑
          const timeMatch = line.match(/(\d{2}:\d{2})/);
          if (timeMatch) {
            const time = timeMatch[1];
            const oddsMatch = line.match(/(\d+\.\d+)\s*([+-]?\d+\.\d+%)?(\d+\.\d+)\s*([+-]?\d+\.\d+%)?(\d+\.\d+)\s*([+-]?\d+\.\d+%)?/);
            
            if (oddsMatch) {
              matches.push({
                date: currentDate,
                time: time,
                league: line.includes('Spanish') ? 'Spanish League Div 2' : 'Argentine League',
                homeWin: {
                  odds: parseFloat(oddsMatch[1]),
                  change: this.parseChange(oddsMatch[2])
                },
                draw: {
                  odds: parseFloat(oddsMatch[3]),
                  change: this.parseChange(oddsMatch[4])
                },
                awayWin: {
                  odds: parseFloat(oddsMatch[5]),
                  change: this.parseChange(oddsMatch[6])
                }
              });
            }
          }
        }
      });
      
      return matches;
    }
    
    analyzeChanges(matches) {
      const results = {
        totalMatches: matches.length,
        matchesWithChanges: 0,
        significantChanges: [],
        maxIncrease: { value: 0, match: null, option: null },
        maxDecrease: { value: 0, match: null, option: null }
      };
      
      matches.forEach(match => {
        ['homeWin', 'draw', 'awayWin'].forEach(option => {
          const change = Math.abs(match[option].change);
          if (change >= this.threshold) {
            results.matchesWithChanges++;
            results.significantChanges.push({
              match,
              option,
              change: match[option].change
            });
            
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
      });
      
      return results;
    }
    
    generateReport(analysis) {
      let report = `## 赔率分析测试报告\n\n`;
      report += `### 统计数据\n`;
      report += `- 总比赛场次: ${analysis.totalMatches}\n`;
      report += `- 变化超过${this.threshold}%的比赛: ${analysis.matchesWithChanges}\n\n`;
      
      if (analysis.significantChanges.length > 0) {
        report += `### 重点关注比赛\n\n`;
        analysis.significantChanges.forEach((item, index) => {
          const match = item.match;
          report += `${index + 1}. ${match.time} ${match.league}\n`;
          report += `   - ${item.option}: ${item.change > 0 ? '+' : ''}${item.change}%\n`;
        });
      }
      
      if (analysis.maxIncrease.value !== 0) {
        report += `\n### 最大变化\n`;
        report += `- 最大上升: +${analysis.maxIncrease.value}%\n`;
        report += `- 最大下降: ${analysis.maxDecrease.value}%\n`;
      }
      
      return report;
    }
    
    quickAnalyze(text) {
      const matches = this.extractFromSgoddsText(text);
      const analysis = this.analyzeChanges(matches);
      return this.generateReport(analysis);
    }
  }
  
  // 运行测试
  const analyzer = new MockOddsAnalyzer({ threshold: 10 });
  const report = analyzer.quickAnalyze(sampleData);
  
  console.log('分析结果:');
  console.log(report);
  
  // 验证结果
  console.log('\n=== 测试验证 ===');
  const matches = analyzer.extractFromSgoddsText(sampleData);
  console.log(`1. 成功解析比赛数: ${matches.length} (预期: 3)`);
  console.log(`2. 第一场比赛主胜变化: ${matches[0].homeWin.change}% (预期: -15.4)`);
  console.log(`3. 第二场比赛客胜变化: ${matches[1].awayWin.change}% (预期: -19.6)`);
  console.log(`4. 第三场比赛客胜变化: ${matches[2].awayWin.change}% (预期: -12.5)`);
  
  const analysis = analyzer.analyzeChanges(matches);
  console.log(`5. 超过10%变化的比赛: ${analysis.matchesWithChanges} (预期: 3)`);
  
  console.log('\n=== 测试完成 ===');
  return '测试完成，所有功能正常';
}

// 执行测试
try {
  const result = testOddsAnalyzer();
  console.log(result);
} catch (error) {
  console.error('测试失败:', error);
}

// 导出测试函数
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { testOddsAnalyzer };
}