#!/usr/bin/env node

/**
 * 调试版比赛分析脚本
 * 打印详细的返回内容
 */

const { searchTeamId } = require('./search_team.js');
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
    // 步骤1: 搜索球队
    console.log('1. 搜索球队...');
    console.log(`   调用 searchTeamId("${teamName}")`);
    
    const teamInfo = await searchTeamId(teamName);
    console.log(`   ✅ 搜索完成`);
    console.log(`      返回的teamInfo对象:`);
    console.log(`        - id: ${teamInfo.id}`);
    console.log(`        - name: ${teamInfo.name}`);
    console.log(`        - league: ${teamInfo.league || '未指定'}`);
    console.log(`        - exactMatch: ${teamInfo.exactMatch}`);
    console.log(`        - type: ${teamInfo.type || '未指定'}`);
    console.log(`        - allMatches数量: ${teamInfo.allMatches ? teamInfo.allMatches.length : 0}`);
    
    if (teamInfo.allMatches && teamInfo.allMatches.length > 0) {
      console.log(`      所有匹配结果:`);
      teamInfo.allMatches.forEach((match, index) => {
        console.log(`        ${index + 1}. ${match.name} (ID: ${match.id}, 联赛: ${match.league})`);
      });
    }
    
    if (!teamInfo.exactMatch && teamInfo.allMatches && teamInfo.allMatches.length > 1) {
      console.log(`警告: 未找到精确匹配，使用最相关结果: ${teamInfo.name}`);
    }
    
    // 步骤2: 获取球队赛程
    console.log('\n2. 获取球队赛程...');
    console.log(`   调用 getTeamSchedule(${teamInfo.id}, { limit: ${limit}, timeRange: "${timeRange}" })`);
    
    const schedule = await getTeamSchedule(teamInfo.id, { limit, timeRange });
    console.log(`   ✅ 赛程获取完成`);
    console.log(`      返回的schedule对象:`);
    console.log(`        - teamId: ${schedule.teamId}`);
    console.log(`        - totalMatches: ${schedule.totalMatches}`);
    console.log(`        - source: ${schedule.source || '未指定'}`);
    console.log(`        - matches数量: ${schedule.matches ? schedule.matches.length : 0}`);
    
    if (schedule.matches && schedule.matches.length > 0) {
      console.log(`      比赛列表:`);
      schedule.matches.forEach((match, index) => {
        console.log(`        ${index + 1}. ${match.matchTime} ${match.homeTeam} vs ${match.awayTeam} - ${match.score} (ID: ${match.matchId})`);
      });
    } else {
      console.log(`      ⚠️ 未找到比赛数据`);
    }
    
    // 步骤3: 确定目标比赛
    let targetMatchId = matchId;
    if (!targetMatchId && schedule.matches && schedule.matches.length > 0) {
      // 使用最近一场比赛
      targetMatchId = schedule.matches[0].matchId;
      console.log(`\n3. 使用最近一场比赛: ID ${targetMatchId}`);
    } else if (targetMatchId) {
      console.log(`\n3. 使用指定比赛: ID ${targetMatchId}`);
    } else {
      console.log(`\n3. 未找到比赛数据，跳过比赛详情获取`);
    }
    
    // 步骤4: 获取比赛详情
    let matchDetails = null;
    if (targetMatchId) {
      console.log('\n4. 获取比赛详情...');
      console.log(`   调用 getMatchDetails(${targetMatchId}, { detailLevel: "${detailLevel}" })`);
      
      matchDetails = await getMatchDetails(targetMatchId, { detailLevel });
      console.log(`   ✅ 比赛详情获取完成`);
      console.log(`      返回的matchDetails对象:`);
      console.log(`        - matchId: ${matchDetails.matchId}`);
      console.log(`        - basicInfo: ${JSON.stringify(matchDetails.basicInfo || {}, null, 2).substring(0, 200)}...`);
      
      if (matchDetails.technicalStats) {
        console.log(`        - technicalStats: 有技术统计数据`);
      }
      
      if (matchDetails.goalTimeline) {
        console.log(`        - goalTimeline数量: ${matchDetails.goalTimeline.length}`);
      }
      
      if (matchDetails.matchEvents) {
        console.log(`        - matchEvents数量: ${matchDetails.matchEvents.length}`);
      }
    }
    
    // 步骤5: 生成报告
    console.log('\n5. 生成分析报告...');
    const report = generateReport(teamInfo, schedule, matchDetails, options);
    
    const result = {
      success: true,
      teamInfo,
      schedule,
      matchDetails,
      report,
      timestamp: new Date().toISOString()
    };
    
    console.log(`   ✅ 报告生成完成`);
    console.log(`      最终结果对象结构:`);
    console.log(`        - success: ${result.success}`);
    console.log(`        - teamInfo: ${result.teamInfo ? '有' : '无'}`);
    console.log(`        - schedule: ${result.schedule ? '有' : '无'}`);
    console.log(`        - matchDetails: ${result.matchDetails ? '有' : '无'}`);
    console.log(`        - report: ${result.report ? '有' : '无'}`);
    console.log(`        - timestamp: ${result.timestamp}`);
    
    return result;
    
  } catch (error) {
    console.error('\n❌ 分析过程中出错:', error.message);
    console.error(`错误堆栈: ${error.stack}`);
    
    const errorResult = {
      success: false,
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    };
    
    console.log(`\n返回的错误结果:`);
    console.log(JSON.stringify(errorResult, null, 2));
    
    return errorResult;
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
      exactMatch: teamInfo.exactMatch
    },
    scheduleSummary: {
      totalMatches: schedule.totalMatches || 0,
      displayedMatches: schedule.matches ? schedule.matches.length : 0,
      recentMatches: schedule.matches ? schedule.matches.slice(0, 3).map(match => ({
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
      hasTechnicalStats: !!matchDetails.technicalStats,
      hasGoalTimeline: !!matchDetails.goalTimeline,
      hasMatchEvents: !!matchDetails.matchEvents
    };
  }
  
  return report;
}

/**
 * 主函数
 */
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.error('请提供球队名称作为参数');
    console.log('用法: node match_analyzer_debug.js "球队名称" [选项]');
    console.log('选项:');
    console.log('  --match <比赛ID>     指定比赛ID（如未指定则使用最近一场）');
    console.log('  --limit <数量>       显示比赛数量 (默认: 5)');
    console.log('  --time <范围>        时间范围: recent/all/upcoming (默认: recent)');
    console.log('  --level <级别>       详细级别: summary/full (默认: summary)');
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
    }
  }
  
  console.log('='.repeat(80));
  console.log(`调试 Match Analyzer - 球队: "${teamName}"`);
  console.log('='.repeat(80));
  console.log(`选项: ${JSON.stringify(options, null, 2)}`);
  console.log('');
  
  try {
    const result = await analyzeMatch(teamName, options);
    
    console.log('\n' + '='.repeat(80));
    console.log('最终返回内容:');
    console.log('='.repeat(80));
    
    if (result.success) {
      console.log('\n✅ 分析成功!');
      console.log(`\n完整返回对象:`);
      console.log(JSON.stringify(result, null, 2));
      
      // 简化输出
      console.log('\n📋 简化总结:');
      console.log(`   球队: ${result.teamInfo.name} (ID: ${result.teamInfo.id})`);
      console.log(`   赛程数量: ${result.schedule.matches ? result.schedule.matches.length : 0}`);
      console.log(`   比赛详情: ${result.matchDetails ? '已获取' : '未获取'}`);
      console.log(`   报告标题: ${result.report.title}`);
    } else {
      console.log('\n❌ 分析失败!');
      console.log(`错误: ${result.error}`);
      if (result.stack) {
        console.log(`堆栈: ${result.stack.substring(0, 300)}...`);
      }
    }
    
  } catch (error) {
    console.error('\n❌ 程序执行出错:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// 如果是直接运行此脚本
if (require.main === module) {
  main();
}

module.exports = {
  analyzeMatch,
  generateReport
};