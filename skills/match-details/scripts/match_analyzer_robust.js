#!/usr/bin/env node

/**
 * 健壮版比赛分析脚本
 * 使用健壮版的搜索功能
 */

const { searchTeamId } = require('./search_team_robust.js');
const { getTeamSchedule } = require('./get_schedule.js');
const { getMatchDetails } = require('./get_match_details.js');

/**
 * 完整的比赛分析流程
 * @param {string} teamName - 球队名称
 * @param {Object} options - 选项
 * @returns {Promise<Object>} - 完整的分析结果
 */
async function analyzeMatch(teamName, options = {}) {
  const {
    matchId = null,
    limit = 5,
    timeRange = 'recent',
    detailLevel = 'summary'
  } = options;
  
  console.log(`开始分析: ${teamName}`);
  
  try {
    // 步骤1: 搜索球队（使用健壮版）
    console.log('1. 搜索球队...');
    const teamInfo = await searchTeamId(teamName);
    
    console.log(`   找到球队: ${teamInfo.name} (ID: ${teamInfo.id}, 来源: ${teamInfo.source})`);
    
    if (!teamInfo.exactMatch) {
      console.log(`   ⚠️ 未找到精确匹配，使用近似结果`);
    }
    
    // 步骤2: 获取球队赛程
    console.log('2. 获取球队赛程...');
    const schedule = await getTeamSchedule(teamInfo.id, { limit, timeRange });
    
    console.log(`   赛程获取结果:`);
    console.log(`     - 总比赛场次: ${schedule.totalMatches}`);
    console.log(`     - 找到比赛: ${schedule.matches ? schedule.matches.length : 0}`);
    console.log(`     - 数据来源: ${schedule.source || '未知'}`);
    
    // 步骤3: 确定目标比赛
    let targetMatchId = matchId;
    if (!targetMatchId && schedule.matches && schedule.matches.length > 0) {
      // 使用最近一场比赛
      targetMatchId = schedule.matches[0].matchId;
      console.log(`3. 使用最近一场比赛: ID ${targetMatchId}`);
    } else if (targetMatchId) {
      console.log(`3. 使用指定比赛: ID ${targetMatchId}`);
    } else {
      console.log(`3. 未找到比赛数据`);
    }
    
    // 步骤4: 获取比赛详情
    let matchDetails = null;
    if (targetMatchId) {
      console.log('4. 获取比赛详情...');
      matchDetails = await getMatchDetails(targetMatchId, { detailLevel });
      console.log(`   比赛详情获取成功`);
    }
    
    // 步骤5: 生成报告
    console.log('5. 生成分析报告...');
    const report = generateReport(teamInfo, schedule, matchDetails, options);
    
    const result = {
      success: true,
      teamInfo,
      schedule,
      matchDetails,
      report,
      timestamp: new Date().toISOString()
    };
    
    console.log(`   ✅ 分析完成`);
    
    return result;
    
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
function generateReport(teamInfo, schedule, matchDetails, options) {
  const report = {
    title: `⚽ ${teamInfo.name} 比赛分析报告`,
    teamInfo: {
      id: teamInfo.id,
      name: teamInfo.name,
      league: teamInfo.league,
      exactMatch: teamInfo.exactMatch,
      source: teamInfo.source
    },
    scheduleSummary: {
      totalMatches: schedule.totalMatches || 0,
      displayedMatches: schedule.matches ? schedule.matches.length : 0,
      source: schedule.source || '未知',
      recentMatches: schedule.matches ? schedule.matches.slice(0, 3).map(match => ({
        matchId: match.matchId,
        time: match.matchTime,
        vs: `${match.homeTeam} vs ${match.awayTeam}`,
        score: match.score,
        status: match.status
      })) : []
    },
    analysis: {
      dataQuality: assessDataQuality(teamInfo, schedule, matchDetails)
    }
  };
  
  if (matchDetails) {
    report.matchAnalysis = {
      matchId: matchDetails.matchId,
      basicInfo: matchDetails.basicInfo || {},
      hasTechnicalStats: !!matchDetails.technicalStats,
      hasGoalTimeline: !!matchDetails.goalTimeline,
      hasMatchEvents: !!matchDetails.matchEvents,
      dataSource: 'titan007.com'
    };
  }
  
  return report;
}

/**
 * 评估数据质量
 */
function assessDataQuality(teamInfo, schedule, matchDetails) {
  const assessment = {
    teamSearch: teamInfo.source === 'api_json' ? 'high' : teamInfo.source === 'html_links' ? 'medium' : 'low',
    schedule: schedule.matches && schedule.matches.length > 0 ? 'high' : 'low',
    matchDetails: matchDetails ? 'high' : 'none'
  };
  
  // 计算总体质量
  const scores = {
    high: 3,
    medium: 2,
    low: 1,
    none: 0
  };
  
  const totalScore = scores[assessment.teamSearch] + scores[assessment.schedule] + scores[assessment.matchDetails];
  const maxScore = 9;
  
  assessment.overall = totalScore >= 6 ? 'good' : totalScore >= 3 ? 'fair' : 'poor';
  assessment.score = `${totalScore}/${maxScore}`;
  
  return assessment;
}

/**
 * 格式化输出报告
 */
function formatReport(report, format = 'text') {
  if (format === 'json') {
    return JSON.stringify(report, null, 2);
  }
  
  let output = '';
  
  output += `\n${'='.repeat(70)}\n`;
  output += ` ${report.title}\n`;
  output += `${'='.repeat(70)}\n\n`;
  
  output += `📊 球队信息\n`;
  output += `   名称: ${report.teamInfo.name}\n`;
  output += `   ID: ${report.teamInfo.id}\n`;
  output += `   联赛: ${report.teamInfo.league}\n`;
  output += `   匹配精度: ${report.teamInfo.exactMatch ? '精确' : '近似'}\n`;
  output += `   数据来源: ${report.teamInfo.source}\n\n`;
  
  output += `🗓️ 赛程信息\n`;
  output += `   总比赛场次: ${report.scheduleSummary.totalMatches}\n`;
  output += `   显示比赛: ${report.scheduleSummary.displayedMatches}\n`;
  output += `   数据来源: ${report.scheduleSummary.source}\n`;
  
  if (report.scheduleSummary.recentMatches.length > 0) {
    output += `\n   最近比赛:\n`;
    report.scheduleSummary.recentMatches.forEach((match, index) => {
      const statusIcon = match.status === '已结束' ? '✅' : match.status === '进行中' ? '⏳' : '⏰';
      output += `     ${index + 1}. ${match.time} ${match.vs} - ${match.score} ${statusIcon}\n`;
    });
  } else {
    output += `\n   ⚠️ 未找到比赛数据\n`;
  }
  output += '\n';
  
  if (report.matchAnalysis) {
    output += `🔍 比赛分析\n`;
    output += `   比赛ID: ${report.matchAnalysis.matchId}\n`;
    
    if (report.matchAnalysis.basicInfo.strTime) {
      output += `   时间: ${report.matchAnalysis.basicInfo.strTime}\n`;
    }
    if (report.matchAnalysis.basicInfo.fullTimeScore) {
      output += `   比分: ${report.matchAnalysis.basicInfo.fullTimeScore}\n`;
    }
    if (report.matchAnalysis.basicInfo.halfTimeScore) {
      output += `   半场: ${report.matchAnalysis.basicInfo.halfTimeScore}\n`;
    }
    
    output += `   技术统计: ${report.matchAnalysis.hasTechnicalStats ? '✅ 有' : '❌ 无'}\n`;
    output += `   进球时间线: ${report.matchAnalysis.hasGoalTimeline ? '✅ 有' : '❌ 无'}\n`;
    output += `   比赛事件: ${report.matchAnalysis.hasMatchEvents ? '✅ 有' : '❌ 无'}\n`;
    output += `   数据来源: ${report.matchAnalysis.dataSource}\n\n`;
  }
  
  output += `📈 数据质量评估\n`;
  output += `   球队搜索: ${report.analysis.dataQuality.teamSearch === 'high' ? '✅ 高' : report.analysis.dataQuality.teamSearch === 'medium' ? '⚠️ 中' : '❌ 低'}\n`;
  output += `   赛程数据: ${report.analysis.dataQuality.schedule === 'high' ? '✅ 高' : '❌ 低'}\n`;
  output += `   比赛详情: ${report.analysis.dataQuality.matchDetails === 'high' ? '✅ 高' : report.analysis.dataQuality.matchDetails === 'medium' ? '⚠️ 中' : '❌ 无'}\n`;
  output += `   总体质量: ${report.analysis.dataQuality.overall === 'good' ? '✅ 良好' : report.analysis.dataQuality.overall === 'fair' ? '⚠️ 一般' : '❌ 较差'}\n`;
  output += `   质量分数: ${report.analysis.dataQuality.score}\n\n`;
  
  output += `💡 建议\n`;
  if (report.analysis.dataQuality.overall === 'good') {
    output += `   数据质量良好，分析结果可靠\n`;
  } else if (report.analysis.dataQuality.overall === 'fair') {
    output += `   数据质量一般，部分数据可能不准确\n`;
  } else {
    output += `   数据质量较差，建议手动验证关键信息\n`;
  }
  output += '\n';
  
  output += `⏰ 报告生成时间: ${new Date().toLocaleString('zh-CN')}\n`;
  output += `${'='.repeat(70)}\n`;
  
  return output;
}

/**
 * 主函数
 */
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.error('请提供球队名称作为参数');
    console.log('用法: node match_analyzer_robust.js "球队名称" [选项]');
    console.log('选项:');
    console.log('  --match <比赛ID>     指定比赛ID（如未指定则使用最近一场）');
    console.log('  --limit <数量>       显示比赛数量 (默认: 5)');
    console.log('  --time <范围>        时间范围: recent/all/upcoming (默认: recent)');
    console.log('  --level <级别>       详细级别: summary/full (默认: summary)');
    console.log('  --format <格式>      输出格式: text/json (默认: text)');
    process.exit(1);
  }
  
  const teamName = args[0];
  const options = {};
  
  // 解析选项
  for (let i = 1; i < args.length; i++) {
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
  
  console.log(`分析球队: ${teamName}`);
  console.log(`选项: ${JSON.stringify(options, null, 2)}`);
  console.log('');
  
  try {
    const result = await analyzeMatch(teamName, options);
    
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
          dataQuality: result.report.analysis.dataQuality,
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
  analyzeMatch,
  generateReport,
  formatReport
};