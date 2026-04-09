const OddsAnalyzer = require('./skills/odds-analyzer/scripts/analyze-odds.js');

// 原始文本数据
const rawText = `Wed, 8 Apr 2026 17:30J League D2/D3 100 Year Vision2.00 -18.4%2.90 +5.5%3.40 +28.3% 18:00Asian Champ 21.28 4.40 8.50 23:15Russian Cup2.50 3.20 2.35 23:55Saudi League5.00 -16.7%3.90 +2.6%1.45
 Thu, 9 Apr 2026 00:45UE Europe2.40 3.00 -3.2%2.70 +3.8%01:45Russian Cup2.05 3.10 3.00 02:00Saudi League1.13 -1.7%7.00 +7.7%12.00 +9.1%02:00Saudi League1.60 +4.6%3.70 -5.1%4.20 -12.5% 03:00UE Champions1.60 -3.0%4.00 +8.1%3.90 -2.5% 03:00UE Champions1.42 -2.1%4.40 -2.2%5.00 +4.2%06:00Sudamericana Cup1.85 2.90 4.20 06:00Libertadores Cup2.40 2.70 -1.8%3.00 +1.7%06:00Sudamericana Cup4.30 +2.4%3.05 +1.7%1.77 -2.7% 06:00Sudamericana Cup2.30 -6.1%2.70 +1.9%3.10 +5.1% 06:00Libertadores Cup2.05 -2.4%2.85 3.50 +2.9%08:00Sudamericana Cup2.85 +3.6%2.65 2.55 -1.9%08:00Libertadores Cup2.50 2.70 2.85 08:30Libertadores Cup4.10 +7.9%3.20 +3.2%1.77 -5.3%08:30Libertadores Cup4.20 +2.4%3.10 1.77 -1.7% 09:00N America Champions1.58 -7.1%3.50 +12.9%5.00 +6.4%10:00Sudamericana Cup3.70 3.10 1.87 10:00Libertadores Cup2.35 +2.2%2.95 +1.7%2.80 -3.4% 11:00N America Champions1.30 -2.3%4.50 +2.3%8.00 +6.7%
 Fri, 10 Apr 202600:00Saudi League6.00 -7.7%4.40 +2.3%1.37 00:45UE Conference1.95 -1.0%3.00 -1.6%3.70 +5.7%02:00Saudi League2.05 +2.5%3.40 -2.9%2.90 -1.7% 03:00UE Conference2.45 3.10 2.55 03:00UE Conference1.95 -1.0%3.30 3.30 +3.1% 03:00UE Europe2.03 -1.0%3.05 -1.6%3.30 +3.1% 03:00UE Europe2.85 +1.8%3.05 -1.6%2.25 03:00UE Conference1.65 -2.9%3.40 +3.0%4.50 +4.7% 03:00UE Europe2.15 -2.3%3.05 3.05 +3.4% 06:00Libertadores Cup1.72 3.10 4.50 06:00Sudamericana Cup2.10 3.10 3.10 08:00Libertadores Cup2.75 2.70 2.55 08:30Sudamericana Cup3.20 2.90 2.15 10:00Libertadores Cup1.97 2.90 3.70 17:35A League2.75 3.30 2.20 Sat, 11 Apr 2026 01:00French League3.40 3.50 1.90 02:00Dutch League1.17 6.00 9.50 02:30German League3.05 +1.7%3.40 2.00 -1.5%02:45Italian League1.30 4.40 9.00 03:00English Premier1.75 -2.8%3.40 3.80 03:00English League Champ2.15 3.10 3.00 03:00Spanish League1.23 -1.6%5.20 8.50 -5.6% 03:05French League1.22 5.20 11.00 12:00J League 100 Year Vision2.45 2.90 2.55 13:00A League1.97 3.60 2.95 13:00J League 100 Year Vision2.35 2.95 2.65 13:00J League 100 Year Vision1.53 3.50 4.80 13:00J League 100 Year Vision2.75 2.80 2.35 14:00J League 100 Year Vision1.87 3.10 3.50 14:00J League 100 Year Vision2.85 3.10 2.10 15:00A League2.00 3.70 2.85 15:00J League 100 Year Vision1.82 3.30 3.40 15:00J League 100 Year Vision2.20 3.10 2.75 17:35A League2.40 3.50 2.40 19:30English Premier1.40 +2.2%4.10 -6.8%6.00 -7.7%19:30English League Champ1.10 8.50 12.00 19:30English League Champ2.75 3.40 2.15 19:30English League Champ2.20 3.10 2.85 20:00Spanish League1.70 3.40 4.20 21:00Italian League1.82 3.10 4.00 21:00Italian League2.05 2.90 3.40 21:00Swedish League1.35 4.40 6.50 21:00Swedish League2.60 3.20 2.35 21:00Swedish League2.50 2.75 2.80 21:30German League2.40 3.30 2.50 21:30German League2.90 -1.7%3.20 2.15 +2.4% 21:30German League1.92 3.50 -2.8%3.20 +3.2% 21:30German League1.45 -2.0%4.20 +2.4%5.20 +4.0% 22:00English Premier2.05 -2.4%3.10 3.20 +3.2% 22:00English Premier4.10 3.70 1.65 22:00English League Champ2.30 3.00 2.80 22:00English League Champ2.00 3.30 3.10 22:00English League Champ2.05 3.10 3.20 22:00English League Champ1.50 3.80 5.20 22:00English League Champ1.72 3.70 3.70 22:00English League Champ1.75 3.50 3.80 22:00English League Champ2.45 3.00 2.60 22:00Norwegian League1.35 4.40 7.00 22:30Dutch League1.60 3.40 5.00 Sun, 12 Apr 202600:00Italian League1.37 4.20 7.00 00:00Norwegian League3.10 3.80 1.85 00:30English Premier1.53 +5.5%3.90 -7.1%4.70 -6.0% 00:30German League7.50 4.70 1.30 00:30Spanish League1.20 6.00 9.00 00:45Dutch League3.50 3.80 1.80 01:00French League2.03 3.05 3.30 01:00US Soccer League2.05 3.20 3.05 02:00Dutch League1.82 3.70 3.40 02:30US Soccer League2.50 3.20 2.45 02:30US Soccer League2.20 3.30 2.75 02:45Italian League2.90 3.10 2.20 03:00Dutch League4.80 3.90 1.53 03:00Spanish League3.10 2.90 2.20 03:05French League1.35 4.30 7.50 04:30US Soccer League4.10 3.70 1.65 07:30US Soccer League1.45 3.80 6.00 07:30US Soccer League1.63 3.70 4.20 07:30US Soccer League2.20 2.90 3.10 07:30US Soccer League1.95 3.10 3.50 08:30US Soccer League2.00 3.40 3.05 08:30US Soccer League3.40 3.60 1.82 08:30US Soccer League1.55 3.80 4.70 13:00A League1.63 3.60 4.40 13:00J League 100 Year Vision1.75 3.00 4.10 15:00J League 100 Year Vision2.65 3.20 2.20 17:00A League2.95 3.40 2.03 18:15Dutch League2.35 3.40 2.50 18:30Italian League2.05 3.10 3.20 19:00English League Champ2.00 3.30 3.10 20:30Dutch League2.10 3.60 2.70 20:30Dutch League2.05 3.50 2.85 20:30Norwegian League2.20 3.30 2.75 21:00English Premier2.75 +3.8%3.30 +3.1%2.20 -4.3% 21:00English Premier2.50 3.05 2.50 21:00English Premier2.40 -4.0%3.20 2.55 +4.1%21:00Italian League5.20 3.50 1.55 21:30German League2.15 3.10 2.95 23:15French League2.80 3.00 2.30 23:15French League2.00 +2.6%2.90 3.80 23:30English Premier2.85 3.60 +2.9%2.03 -1.0% 23:30German League1.42 4.10 6.00 Mon, 13 Apr 202600:00Italian League1.77 3.05 4.30 01:30German League2.20 2.80 3.20 02:45French League1.63 3.50 4.50 02:45Italian League3.00 3.20 2.10 Tue, 14 Apr 202602:45Italian League2.20 2.90 3.10 03:00English Premier1.50 -2.0%4.00 +2.6%4.80 Last Updated on 2026-04-08 14:20:07`;

// 预处理文本
function preprocessText(text) {
  // 在日期模式后添加换行符
  let processed = text.replace(/(Mon|Tue|Wed|Thu|Fri|Sat|Sun), \d+ (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) \d{4}/g, '\n$&');
  // 在每个时间模式前添加换行符（HH:MM且前面不是冒号）
  processed = processed.replace(/(\s|^)(\d{2}:\d{2})/g, '\n$2');
  // 移除开头的空行
  return processed.trim();
}

const processedText = preprocessText(rawText);
console.log('处理后的文本（前500字符）:', processedText.substring(0, 500));

// 创建自定义分析器来筛选今天的比赛
class UpcomingOddsAnalyzer extends OddsAnalyzer {
  constructor(options = {}) {
    super(options);
    this.targetDate = options.targetDate || 'Wed, 8 Apr 2026'; // 今天日期
    this.currentTime = options.currentTime || '14:30'; // 当前时间
  }

  // 重写提取方法，只提取目标日期且时间晚于当前时间的比赛
  extractFromSgoddsText(text) {
    const matches = [];
    const lines = text.split('\n');
    
    let currentDate = null;
    let currentTime = null;
    let currentLeague = null;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // 检测日期行
      const dateMatch = line.match(/(Mon|Tue|Wed|Thu|Fri|Sat|Sun),?\s+(\d+)\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{4})/);
      if (dateMatch) {
        currentDate = line;
        continue;
      }
      
      // 只处理目标日期的比赛
      if (currentDate !== this.targetDate) {
        continue;
      }
      
      // 检测时间行
      const timeMatch = line.match(/(\d{1,2}:\d{2})([A-Za-z].*)/);
      if (timeMatch) {
        currentTime = timeMatch[1];
        
        // 检查比赛时间是否晚于当前时间
        const matchHour = parseInt(currentTime.split(':')[0]);
        const matchMinute = parseInt(currentTime.split(':')[1]);
        const currentHour = parseInt(this.currentTime.split(':')[0]);
        const currentMinute = parseInt(this.currentTime.split(':')[1]);
        
        // 如果比赛时间早于当前时间，跳过
        if (matchHour < currentHour || (matchHour === currentHour && matchMinute <= currentMinute)) {
          continue;
        }
        
        const rest = timeMatch[2];
        
        // 提取联赛和赔率
        const leagueMatch = rest.match(/^([A-Za-z\s\.\(\)]+)(\d+\.\d+.*)/);
        if (leagueMatch) {
          currentLeague = leagueMatch[1].trim();
          const oddsPart = leagueMatch[2];
          
          // 提取三个赔率及其变化
          const oddsMatch = oddsPart.match(/(\d+\.\d+)\s*([+-]?\d+\.\d+%)?\s*(\d+\.\d+)\s*([+-]?\d+\.\d+%)?\s*(\d+\.\d+)\s*([+-]?\d+\.\d+%)?/);
          
          if (oddsMatch) {
            const match = {
              date: currentDate,
              time: currentTime,
              league: currentLeague,
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
              },
              rawLine: line
            };
            
            // 排除女足比赛（如果启用）
            if (this.excludeWomen && currentLeague.includes('(Women)')) {
              continue;
            }
            
            matches.push(match);
          }
        }
      }
    }
    
    return matches;
  }
  
  // 生成定制报告
  generateCustomReport(matches, analysis) {
    let report = `## 今日未开始比赛赔率分析\n\n`;
    report += `### 📅 筛选条件\n`;
    report += `- 目标日期: ${this.targetDate}\n`;
    report += `- 当前时间: ${this.currentTime}\n`;
    report += `- 变化阈值: ${this.threshold}%\n`;
    report += `- 数据更新时间: 2026-04-08 14:20:07\n\n`;
    
    report += `### 📊 统计数据\n`;
    report += `- 未开始比赛场次: ${matches.length}\n`;
    report += `- 变化超过${this.threshold}%的比赛: ${analysis.matchesWithChanges}\n\n`;
    
    if (matches.length === 0) {
      report += `⚠️ **未找到符合条件的比赛**\n`;
      report += `可能原因：\n`;
      report += `1. 所有今天比赛已开始\n`;
      report += `2. 数据格式解析问题\n`;
      report += `3. 当前时间设置可能过早或过晚\n\n`;
    } else {
      report += `### 🏆 未开始比赛列表\n`;
      matches.forEach((match, index) => {
        report += `${index + 1}. **${match.time} ${match.league}**\n`;
        report += `   - 赔率: ${match.homeWin.odds} / ${match.draw.odds} / ${match.awayWin.odds}\n`;
        report += `   - 变化: 主胜${match.homeWin.change > 0 ? '+' : ''}${match.homeWin.change}% | 平${match.draw.change > 0 ? '+' : ''}${match.draw.change}% | 客胜${match.awayWin.change > 0 ? '+' : ''}${match.awayWin.change}%\n`;
        
        // 简单赔率分析
        const favorites = [];
        if (match.homeWin.odds < 1.8) favorites.push('主队被看好');
        if (match.draw.odds < 2.8) favorites.push('平局可能性高');
        if (match.awayWin.odds < 1.8) favorites.push('客队被看好');
        
        if (favorites.length > 0) {
          report += `   - 市场预期: ${favorites.join('; ')}\n`;
        }
        report += '\n';
      });
    }
    
    if (analysis.significantChanges.length > 0) {
      report += `### 🔥 重点关注比赛（变化超过${this.threshold}%）\n\n`;
      
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
        
        // 变化分析
        if (item.changes.length >= 2) {
          report += `   - **分析**: 多个选项同时变化，值得重点关注\n`;
        } else {
          const change = item.changes[0];
          if (Math.abs(change.change) > 20) {
            report += `   - **分析**: 极端变化(${change.change}%)，可能反映重要市场信息\n`;
          }
        }
        report += '\n';
      });
    }
    
    if (analysis.maxIncrease.value !== 0) {
      report += `### 📈 最大变化\n`;
      report += `- **最大上升**: ${analysis.maxIncrease.value > 0 ? '+' : ''}${analysis.maxIncrease.value}%\n`;
      report += `  - 比赛: ${analysis.maxIncrease.match.time} ${analysis.maxIncrease.match.league}\n`;
      report += `  - 选项: ${analysis.maxIncrease.option === 'homeWin' ? '主胜' : analysis.maxIncrease.option === 'draw' ? '平局' : '客胜'}\n`;
    }
    
    if (analysis.maxDecrease.value !== 0) {
      report += `- **最大下降**: ${analysis.maxDecrease.value > 0 ? '+' : ''}${analysis.maxDecrease.value}%\n`;
      report += `  - 比赛: ${analysis.maxDecrease.match.time} ${analysis.maxDecrease.match.league}\n`;
      report += `  - 选项: ${analysis.maxDecrease.option === 'homeWin' ? '主胜' : analysis.maxIncrease.option === 'draw' ? '平局' : '客胜'}\n`;
    }
    
    if (matches.length > 0) {
      report += `\n### 🕒 时间分布\n`;
      const timeSlots = {
        '傍晚 (17:00-19:00)': 0,
        '晚上 (19:00-23:00)': 0,
        '深夜 (23:00-01:00)': 0
      };
      
      matches.forEach(match => {
        const hour = parseInt(match.time.split(':')[0]);
        if (hour >= 17 && hour < 19) {
          timeSlots['傍晚 (17:00-19:00)']++;
        } else if (hour >= 19 && hour < 23) {
          timeSlots['晚上 (19:00-23:00)']++;
        } else if (hour >= 23 || hour < 1) {
          timeSlots['深夜 (23:00-01:00)']++;
        }
      });
      
      Object.entries(timeSlots).forEach(([slot, count]) => {
        if (count > 0) {
          report += `- ${slot}: ${count}场比赛\n`;
        }
      });
    }
    
    report += `\n### 💡 投注建议\n`;
    if (analysis.significantChanges.length > 0) {
      report += `1. **关注变化大的比赛**：赔率大幅变动通常反映市场新信息\n`;
      report += `2. **交叉验证**：结合球队新闻、伤病等信息判断变化原因\n`;
      report += `3. **时机选择**：未开始比赛仍有时间观察赔率进一步变化\n`;
    } else {
      report += `1. **赔率相对稳定**：未开始比赛赔率变化不大，市场预期一致\n`;
      report += `2. **关注临场变化**：比赛开始前1-2小时可能有关键变化\n`;
      report += `3. **做好研究**：利用比赛开始前时间研究球队基本面\n`;
    }
    
    report += `\n---\n`;
    report += `*数据来源: sgodds.com | 分析时间: ${new Date().toLocaleString('zh-CN')}*\n`;
    report += `*提示: 赔率分析仅供参考，投注有风险，请理性决策*`;
    
    return report;
  }
}

// 执行分析
console.log('🔍 分析今日未开始比赛赔率...\n');

const analyzer = new UpcomingOddsAnalyzer({ 
  threshold: 10, 
  excludeWomen: true,
  targetDate: 'Wed, 8 Apr 2026',
  currentTime: '14:30'
});

try {
  const matches = analyzer.extractFromSgoddsText(processedText);
  console.log(`✅ 找到 ${matches.length} 场未开始比赛\n`);
  
  if (matches.length > 0) {
    console.log('📋 比赛列表:');
    matches.forEach((match, index) => {
      console.log(`${index + 1}. ${match.time} ${match.league} - ${match.homeWin.odds}/${match.draw.odds}/${match.awayWin.odds}`);
    });
    console.log('');
  }
  
  const analysis = analyzer.analyzeChanges(matches);
  const report = analyzer.generateCustomReport(matches, analysis);
  console.log(report);
} catch (error) {
  console.log(`❌ 分析失败: ${error.message}`);
  console.log('错误堆栈:', error.stack);
}