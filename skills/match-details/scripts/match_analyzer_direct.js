#!/usr/bin/env node

/**
 * 直接使用球队ID的比赛分析脚本
 * 跳过搜索步骤，直接使用已知的球队ID
 */

const { getTeamSchedule } = require('./get_schedule.js');
const { getMatchDetails } = require('./get_match_details.js');

/**
 * 直接分析比赛
 * @param {string|number} teamId - 球队ID
 * @param {string} teamName - 球队名称（可选）
 * @param {Object} options - 选项
 * @returns {Promise<Object>} - 完整的分析结果
 */
async function analyzeMatchDirect(teamId, teamName = null, options = {}) {
  const {
    matchId = null,
    limit = 5,
    timeRange = 'recent',
    detailLevel = 'summary'
  } = options;
  
  const displayName = teamName || `球队ID: ${teamId}`;
  console.log(`开始分析: ${displayName} (ID: ${teamId})`);
  
  try {
    // 步骤1: 获取球队赛程
    console.log('1. 获取球队赛程...');
    const schedule = await getTeamSchedule(teamId, { limit, timeRange });
    
    console.log(`   找到 ${schedule.matches ? schedule.matches.length : 0} 场比赛`);
    
    // 步骤2: 确定目标比赛
    let targetMatchId = matchId;
    if (!targetMatchId && schedule.matches && schedule.matches.length > 0) {
      // 使用最近一场比赛
      targetMatchId = schedule.matches[0].matchId;
      console.log(`2. 使用最近一场比赛: ID ${targetMatchId}`);
    } else if (targetMatchId) {
      console.log(`2. 使用指定比赛: ID ${targetMatchId}`);
    } else {
      console.log(`2. 未找到比赛数据`);
    }
    
    // 步骤3: 获取比赛详情
    let matchDetails = null;
    if (targetMatchId) {
      console.log('3. 获取比赛详情...');
      matchDetails = await getMatchDetails(targetMatchId, { detailLevel });
      console.log(`   获取到比赛详情`);
    }
    
    // 步骤4: 生成报告
    console.log('4. 生成分析报告...');
    const report = generateReport(teamId, teamName, schedule, matchDetails, options);
    
    return {
      success: true,
      teamInfo: {
        id: teamId,
        name: teamName || '未知',
        source: 'direct_id'
      },
      schedule,
      matchDetails,
      report,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('分析过程中出错:', error.message);
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * 生成分析报告
 */
function generateReport(teamId, teamName, schedule, matchDetails, options) {
  const report = {
    title: `⚽ ${teamName || `球队${teamId}`} 比赛分析报告`,
    teamInfo: {
      id: teamId,
      name: teamName || '未知',
      source: 'direct_id'
    },
    scheduleSummary: {
      totalMatches: schedule.totalMatches || 0,
      displayedMatches: schedule.matches ? schedule.matches.length : 0,
      recentMatches: schedule.matches ? schedule.matches.slice(0, 3).map(match => ({
        matchId: match.matchId,
        time: match.matchTime,
        vs: `${match.homeTeam} vs ${match.awayTeam}`,
        score: match.score,
        status: match.status
      })) : []
    },
    analysis: {}
  };
  
  if (matchDetails) {
    report.matchAnalysis = {
      matchId: matchDetails.matchId,
      basicInfo: matchDetails.basicInfo || {},
      keyStats: matchDetails.technicalStats ? extractKeyStats(matchDetails.technicalStats) : {},
      goalSummary: matchDetails.goalTimeline ? matchDetails.goalTimeline.map(goal => ({
        minute: goal.minute,
        player: goal.player
      })) : [],
      eventCount: matchDetails.matchEvents ? matchDetails.matchEvents.length : 0
    };
    
    // 添加分析洞察
    if (matchDetails.technicalStats) {
      report.analysis.insights = generateInsights(matchDetails);
    }
  }
  
  return report;
}

/**
 * 提取关键统计数据
 */
function extractKeyStats(technicalStats) {
  const keyStats = {};
  const importantStats = ['射门', '射正', '控球率', '角球', '犯规', '黄牌', '预期进球(xG)'];
  
  for (const statName of importantStats) {
    if (technicalStats.home && technicalStats.home[statName] && technicalStats.away && technicalStats.away[statName]) {
      keyStats[statName] = {
        home: technicalStats.home[statName],
        away: technicalStats.away[statName],
        advantage: technicalStats[`${statName}_advantage`]
      };
    }
  }
  
  return keyStats;
}

/**
 * 生成分析洞察
 */
function generateInsights(matchDetails) {
  const insights = [];
  const stats = matchDetails.technicalStats;
  
  // 射门效率分析
  if (stats.home && stats.home['射门'] && stats.home['射正'] && stats.away && stats.away['射门'] && stats.away['射正']) {
    const homeShots = parseInt(stats.home['射门']);
    const homeOnTarget = parseInt(stats.home['射正']);
    const awayShots = parseInt(stats.away['射门']);
    const awayOnTarget = parseInt(stats.away['射正']);
    
    const homeAccuracy = homeShots > 0 ? Math.round((homeOnTarget / homeShots) * 100) : 0;
    const awayAccuracy = awayShots > 0 ? Math.round((awayOnTarget / awayShots) * 100) : 0;
    
    insights.push(`射门准确率: 主队 ${homeAccuracy}% vs 客队 ${awayAccuracy}%`);
  }
  
  // 控球率与比分关系
  if (stats.home && stats.home['控球率'] && stats.away && stats.away['控球率'] && matchDetails.basicInfo && matchDetails.basicInfo.homeScore !== undefined) {
    const homePossession = parseFloat(stats.home['控球率']);
    const awayPossession = parseFloat(stats.away['控球率']);
    const homeScore = matchDetails.basicInfo.homeScore;
    const awayScore = matchDetails.basicInfo.awayScore;
    
    if (homePossession < awayPossession && homeScore > awayScore) {
      insights.push('主队在控球率劣势的情况下取得胜利，显示高效反击');
    } else if (homePossession > awayPossession && homeScore < awayScore) {
      insights.push('主队控球占优但未能转化为胜利，进攻效率有待提高');
    }
  }
  
  // 进球时间分布
  if (matchDetails.goalTimeline && matchDetails.goalTimeline.length > 0) {
    const goals = matchDetails.goalTimeline;
    const firstHalfGoals = goals.filter(g => g.minute <= 45).length;
    const secondHalfGoals = goals.filter(g => g.minute > 45).length;
    
    insights.push(`进球分布: 上半场 ${firstHalfGoals}球，下半场 ${secondHalfGoals}球`);
    
    if (secondHalfGoals > firstHalfGoals * 2) {
      insights.push('下半场进球明显多于上半场，显示球队后劲十足');
    }
  }
  
  return insights;
}

/**
 * 格式化输出报告
 */
function formatReport(report, format = 'text') {
  if (format === 'json') {
    return JSON.stringify(report, null, 2);
  }
  
  let output = '';
  
  output += `\n${'='.repeat(60)}\n`;
  output += ` ${report.title}\n`;
  output += `${'='.repeat(60)}\n\n`;
  
  output += `📊 球队信息\n`;
  output += `   ID: ${report.teamInfo.id}\n`;
  output += `   名称: ${report.teamInfo.name}\n`;
  output += `   数据来源: ${report.teamInfo.source}\n\n`;
  
  output += `🗓️ 近期赛程 (显示 ${report.scheduleSummary.displayedMatches}/${report.scheduleSummary.totalMatches} 场)\n`;
  if (report.scheduleSummary.recentMatches.length > 0) {
    report.scheduleSummary.recentMatches.forEach((match, index) => {
      const statusIcon = match.status === '已结束' ? '✅' : match.status === '进行中' ? '⏳' : '⏰';
      output += `   ${index + 1}. ${match.time} ${match.vs} - ${match.score} ${statusIcon} (ID: ${match.matchId})\n`;
    });
  } else {
    output += `   未找到比赛数据\n`;
  }
  output += '\n';
  
  if (report.matchAnalysis) {
    output += `🔍 比赛分析 - ID: ${report.matchAnalysis.matchId}\n`;
    if (report.matchAnalysis.basicInfo.strTime) {
      output += `   时间: ${report.matchAnalysis.basicInfo.strTime}\n`;
    }
    if (report.matchAnalysis.basicInfo.fullTimeScore) {
      output += `   比分: ${report.matchAnalysis.basicInfo.fullTimeScore}\n`;
    }
    if (report.matchAnalysis.basicInfo.halfTimeScore) {
      output += `   半场: ${report.matchAnalysis.basicInfo.halfTimeScore}\n`;
    }
    output += '\n';
    
    if (Object.keys(report.matchAnalysis.keyStats).length > 0) {
      output += `📈 关键统计数据\n`;
      for (const [statName, data] of Object.entries(report.matchAnalysis.keyStats)) {
        const advantageSymbol = data.advantage === 'home' ? '←' : data.advantage === 'away' ? '→' : ' ';
        output += `   ${statName}: ${data.home} ${advantageSymbol} ${data.away}\n`;
      }
      output += '\n';
    }
    
    if (report.matchAnalysis.goalSummary.length > 0) {
      output += `🎯 进球时间线\n`;
      report.matchAnalysis.goalSummary.forEach(goal => {
        output += `   ${goal.minute}' ⚽ ${goal.player}\n`;
      });
      output += '\n';
    }
    
    output += `📊 比赛事件: ${report.matchAnalysis.eventCount} 个事件记录\n\n`;
    
    if (report.analysis.insights && report.analysis.insights.length > 0) {
      output += `💡 分析洞察\n`;
      report.analysis.insights.forEach((insight, index) => {
        output += `   ${index + 1}. ${insight}\n`;
      });
      output += '\n';
    }
  }
  
  output += `⏰ 报告生成时间: ${new Date().toLocaleString('zh-CN')}\n`;
  output += `📱 数据来源: titan007.com\n`;
  output += `${'='.repeat(60)}\n`;
  
  return output;
}

/**
 * 主函数
 */
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.error('请提供球队ID作为参数');
    console.log('用法: node match_analyzer_direct.js <球队ID> [球队名称] [选项]');
    console.log('示例: node match_analyzer_direct.js 1055 "华奇巴托"');
    console.log('\n选项:');
    console.log('  --match <比赛ID>     指定比赛ID（如未指定则使用最近一场）');
    console.log('  --limit <数量>       显示比赛数量 (默认: 5)');
    console.log('  --time <范围>        时间范围: recent/all/upcoming (默认: recent)');
    console.log('  --level <级别>       详细级别: summary/full (默认: summary)');
    console.log('  --format <格式>      输出格式: text/json (默认: text)');
    process.exit(1);
  }
  
  const teamId = args[0];
  let teamName = args[1] && !args[1].startsWith('--') ? args[1] : null;
  const options = {};
  
  // 解析选项
  let startIndex = teamName ? 2 : 1;
  for (let i = startIndex; i < args.length; i++) {
    if (args[i] === '--match' && args[i + 1]) {
      options.matchId = args[i + 1];
      i++;
    } else if (args[i] === '--limit' && args[i + 1]) {
      options.limit = parseInt(args[i + 1]);
      i++;
    } else if (args[i] === '--time' && args[i + 1]) {
      options.timeRange = args[i + 1];
      i++;
    } else if (args[i] === '--level' && args[i + 1]) {
      options.detailLevel = args[i + 1];
      i++;
    } else if (args[i] === '--format' && args[i + 1]) {
      options.outputFormat = args[i + 1];
      i++;
    }
  }
  
  try {
    const result = await analyzeMatchDirect(teamId, teamName, options);
    
    if (result.success) {
      const format = options.outputFormat || 'text';
      const report = formatReport(result.report, format);
      
      if (format === 'json') {
        console.log(report);
      } else {
        console.log(report);
        
        // 额外输出JSON格式用于程序处理
        console.log('\n=== 原始数据 (JSON) ===');
        console.log(JSON.stringify({
          success: true,
          teamId: result.teamInfo.id,
          teamName: result.teamInfo.name,
          matchId: result.matchDetails?.matchId,
          timestamp: result.timestamp
        }, null, 2));
      }
    } else {
      console.error('分析失败:', result.error);
      process.exit(1);
    }
    
  } catch (error) {
    console.error('程序执行出错:', error.message);
    process.exit(1);
  }
}

// 如果是直接运行此脚本
if (require.main === module) {
  main();
}

module.exports = {
  analyzeMatchDirect,
  generateReport,
  formatReport
};