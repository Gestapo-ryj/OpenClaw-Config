#!/usr/bin/env node

/**
 * Match Details Skill 使用示例
 * 展示如何调用各个功能模块
 */

const { analyzeMatch } = require('./match_analyzer.js');

/**
 * 示例1: 基本球队赛程查询
 */
async function example1() {
  console.log('='.repeat(60));
  console.log('示例1: 基本球队赛程查询');
  console.log('='.repeat(60));
  
  const result = await analyzeMatch('华奇巴托', {
    limit: 3,
    timeRange: 'recent',
    detailLevel: 'summary'
  });
  
  if (result.success) {
    console.log('✅ 查询成功');
    console.log(`球队: ${result.teamInfo.name} (ID: ${result.teamInfo.id})`);
    console.log(`联赛: ${result.teamInfo.league}`);
    console.log(`\n最近 ${result.schedule.matches.length} 场比赛:`);
    
    result.schedule.matches.forEach((match, index) => {
      console.log(`${index + 1}. ${match.matchTime} ${match.homeTeam} vs ${match.awayTeam}`);
      console.log(`   比分: ${match.score} (${match.status})`);
    });
  } else {
    console.log('❌ 查询失败:', result.error);
  }
}

/**
 * 示例2: 完整比赛分析
 */
async function example2() {
  console.log('\n' + '='.repeat(60));
  console.log('示例2: 完整比赛分析');
  console.log('='.repeat(60));
  
  const result = await analyzeMatch('华奇巴托', {
    matchId: '2921125', // 指定比赛ID
    detailLevel: 'full'
  });
  
  if (result.success && result.matchDetails) {
    console.log('✅ 分析成功');
    const details = result.matchDetails;
    
    console.log(`\n比赛: ${details.basicInfo.homeTeamName} vs ${details.basicInfo.guestTeamName}`);
    console.log(`比分: ${details.basicInfo.fullTimeScore}`);
    console.log(`时间: ${details.basicInfo.strTime}`);
    
    console.log('\n技术统计:');
    const stats = details.technicalStats;
    console.log(`射门: ${stats.home['射门'] || 'N/A'} vs ${stats.away['射门'] || 'N/A'}`);
    console.log(`射正: ${stats.home['射正'] || 'N/A'} vs ${stats.away['射正'] || 'N/A'}`);
    console.log(`控球率: ${stats.home['控球率'] || 'N/A'} vs ${stats.away['控球率'] || 'N/A'}`);
    
    console.log('\n进球时间线:');
    if (details.goalTimeline.length > 0) {
      details.goalTimeline.forEach(goal => {
        console.log(`${goal.minute}' ${goal.player}`);
      });
    } else {
      console.log('无进球数据');
    }
  } else {
    console.log('❌ 分析失败:', result.error);
  }
}

/**
 * 示例3: 错误处理
 */
async function example3() {
  console.log('\n' + '='.repeat(60));
  console.log('示例3: 错误处理 - 不存在的球队');
  console.log('='.repeat(60));
  
  const result = await analyzeMatch('不存在的球队名称测试');
  
  if (!result.success) {
    console.log('✅ 正确返回错误信息');
    console.log(`错误: ${result.error}`);
  } else {
    console.log('❌ 应该返回错误但成功了');
  }
}

/**
 * 示例4: 使用JSON格式输出
 */
async function example4() {
  console.log('\n' + '='.repeat(60));
  console.log('示例4: 使用JSON格式输出');
  console.log('='.repeat(60));
  
  const result = await analyzeMatch('华奇巴托', {
    limit: 2,
    detailLevel: 'summary'
  });
  
  if (result.success) {
    // 输出精简的JSON
    const simplified = {
      team: {
        id: result.teamInfo.id,
        name: result.teamInfo.name,
        league: result.teamInfo.league
      },
      recentMatches: result.schedule.matches.map(match => ({
        time: match.matchTime,
        home: match.homeTeam,
        away: match.awayTeam,
        score: match.score,
        status: match.status
      })),
      timestamp: result.timestamp
    };
    
    console.log(JSON.stringify(simplified, null, 2));
  }
}

/**
 * 示例5: 集成到其他应用
 */
async function example5() {
  console.log('\n' + '='.repeat(60));
  console.log('示例5: 集成到其他应用');
  console.log('='.repeat(60));
  
  // 模拟从用户输入获取球队名称
  const userInput = '华奇巴托';
  
  try {
    console.log(`用户查询: ${userInput}`);
    
    // 调用分析函数
    const analysis = await analyzeMatch(userInput, {
      limit: 1, // 只获取最近一场
      detailLevel: 'summary'
    });
    
    if (analysis.success) {
      // 生成用户友好的回复
      const team = analysis.teamInfo;
      const match = analysis.schedule.matches[0];
      
      let reply = `关于 ${team.name} 的信息:\n`;
      reply += `• 球队ID: ${team.id}\n`;
      reply += `• 所属联赛: ${team.league}\n\n`;
      
      if (match) {
        reply += `最近一场比赛:\n`;
        reply += `• 时间: ${match.matchTime}\n`;
        reply += `• 对阵: ${match.homeTeam} vs ${match.awayTeam}\n`;
        reply += `• 比分: ${match.score} (${match.status})\n`;
        
        if (match.detailUrl) {
          reply += `• 详情: ${match.detailUrl}`;
        }
      }
      
      console.log(reply);
    } else {
      console.log(`抱歉，找不到关于"${userInput}"的信息。`);
    }
    
  } catch (error) {
    console.log('查询过程中出现错误，请稍后重试。');
    console.error('错误详情:', error.message);
  }
}

/**
 * 运行所有示例
 */
async function runAllExamples() {
  console.log('Match Details Skill 使用示例\n');
  
  try {
    await example1();
    await example2();
    await example3();
    await example4();
    await example5();
    
    console.log('\n' + '='.repeat(60));
    console.log('所有示例执行完成');
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('示例执行出错:', error);
  }
}

// 运行示例
if (require.main === module) {
  runAllExamples();
}

module.exports = {
  example1,
  example2,
  example3,
  example4,
  example5,
  runAllExamples
};