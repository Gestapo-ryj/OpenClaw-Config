#!/usr/bin/env node

/**
 * 球队赛程获取脚本
 * 通过球队ID获取球队赛程信息
 */

const https = require('https');

/**
 * 获取球队赛程
 * @param {string|number} teamId - 球队ID
 * @param {Object} options - 选项
 * @param {number} options.limit - 显示比赛数量限制
 * @param {string} options.timeRange - 时间范围: recent/all/upcoming
 * @returns {Promise<Object>} - 赛程信息
 */
async function getTeamSchedule(teamId, options = {}) {
  const { limit = 10, timeRange = 'recent' } = options;
  
  return new Promise((resolve, reject) => {
    // 尝试获取赛程页面
    const scheduleUrl = `https://zq.titan007.com/cn/team/TeamSche/${teamId}.html`;
    
    const requestOptions = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'Referer': 'https://zq.titan007.com/'
      }
    };
    
    https.get(scheduleUrl, requestOptions, (res) => {
      let html = '';
      
      res.on('data', (chunk) => {
        html += chunk;
      });
      
      res.on('end', () => {
        try {
          // 尝试从HTML中提取数据文件链接
          const dataFileMatch = html.match(/src="(\/jsData\/teamInfo\/teamDetail\/tdl\d+\.js)"/);
          
          if (dataFileMatch && dataFileMatch[1]) {
            // 获取数据文件
            fetchDataFile(`https://zq.titan007.com${dataFileMatch[1]}`, teamId, limit, timeRange)
              .then(resolve)
              .catch(reject);
          } else {
            // 如果没有找到数据文件，尝试从HTML中直接解析
            const schedule = parseScheduleFromHTML(html, teamId, limit, timeRange);
            resolve(schedule);
          }
        } catch (error) {
          reject(new Error(`解析赛程页面失败: ${error.message}`));
        }
      });
    }).on('error', (error) => {
      reject(new Error(`获取赛程页面失败: ${error.message}`));
    });
  });
}

/**
 * 获取数据文件
 */
function fetchDataFile(url, teamId, limit, timeRange) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let jsContent = '';
      
      res.on('data', (chunk) => {
        jsContent += chunk;
      });
      
      res.on('end', () => {
        try {
          const schedule = parseScheduleFromJS(jsContent, teamId, limit, timeRange);
          resolve(schedule);
        } catch (error) {
          reject(new Error(`解析数据文件失败: ${error.message}`));
        }
      });
    }).on('error', (error) => {
      reject(new Error(`获取数据文件失败: ${error.message}`));
    });
  });
}

/**
 * 从JavaScript数据文件中解析赛程
 */
function parseScheduleFromJS(jsContent, teamId, limit, timeRange) {
  // 尝试提取teamCount数组
  const teamCountMatch = jsContent.match(/var teamCount\s*=\s*(\[.*?\]);/s);
  
  if (!teamCountMatch) {
    throw new Error('未找到赛程数据');
  }
  
  try {
    // 简单的JSON解析（注意：实际数据可能不是标准JSON）
    const dataStr = teamCountMatch[1];
    // 清理数据字符串，使其成为有效的JSON
    const cleanedStr = dataStr
      .replace(/'/g, '"')  // 单引号转双引号
      .replace(/,\s*]/g, ']')  // 移除尾随逗号
      .replace(/,\s*}/g, '}'); // 移除对象中的尾随逗号
    
    const matches = JSON.parse(cleanedStr);
    
    return processMatches(matches, teamId, limit, timeRange);
  } catch (error) {
    // 如果JSON解析失败，尝试手动解析
    return parseScheduleManually(jsContent, teamId, limit, timeRange);
  }
}

/**
 * 手动解析赛程数据
 */
function parseScheduleManually(jsContent, teamId, limit, timeRange) {
  const matches = [];
  
  // 查找类似数组格式的数据
  const arrayPattern = /\[\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*'([^']+)'\s*,\s*'([^']+)'\s*,\s*'([^']+)'\s*,\s*'([^']+)'\s*,\s*'([^']+)'\s*,\s*'([^']+)'/g;
  let match;
  
  while ((match = arrayPattern.exec(jsContent)) !== null && matches.length < limit * 2) {
    const [
      fullMatch,
      matchId,
      homeTeamId,
      awayTeamId,
      matchTime,
      leagueId,
      leagueName,
      colorCode,
      homeTeamName,
      awayTeamName
    ] = match;
    
    // 检查是否包含比分数据（后续字段）
    const scoreMatch = jsContent.substring(match.index + fullMatch.length).match(/,\s*(\d+)\s*,\s*(\d+)/);
    
    matches.push({
      matchId: parseInt(matchId),
      homeTeamId: parseInt(homeTeamId),
      awayTeamId: parseInt(awayTeamId),
      matchTime,
      leagueId,
      leagueName: leagueName.replace(/\^/g, ' - '),
      homeTeamName: homeTeamName.replace(/\^/g, ' / '),
      awayTeamName: awayTeamName.replace(/\^/g, ' / '),
      homeScore: scoreMatch ? parseInt(scoreMatch[1]) : null,
      awayScore: scoreMatch ? parseInt(scoreMatch[2]) : null,
      isHomeTeam: parseInt(homeTeamId) === parseInt(teamId)
    });
  }
  
  return processMatches(matches, teamId, limit, timeRange);
}

/**
 * 从HTML中解析赛程
 */
function parseScheduleFromHTML(html, teamId, limit, timeRange) {
  // 简单的HTML解析，提取比赛信息
  const matches = [];
  const matchPattern = /<tr[^>]*>[\s\S]*?<td[^>]*>([^<]+)<\/td>[\s\S]*?<td[^>]*>([^<]+)<\/td>[\s\S]*?<td[^>]*>([^<]+)<\/td>[\s\S]*?<td[^>]*>([^<]*)<\/td>/g;
  let match;
  
  while ((match = matchPattern.exec(html)) !== null && matches.length < limit) {
    const [, time, league, vs, score] = match;
    
    // 解析比分
    let homeScore = null;
    let awayScore = null;
    let isCompleted = false;
    
    if (score && score.includes('-')) {
      const scoreParts = score.split('-').map(s => s.trim());
      if (scoreParts.length === 2 && !isNaN(scoreParts[0]) && !isNaN(scoreParts[1])) {
        homeScore = parseInt(scoreParts[0]);
        awayScore = parseInt(scoreParts[1]);
        isCompleted = true;
      }
    }
    
    // 解析对阵双方
    let homeTeamName = '';
    let awayTeamName = '';
    let isHomeTeam = true;
    
    if (vs.includes('vs')) {
      const teams = vs.split('vs').map(t => t.trim());
      homeTeamName = teams[0];
      awayTeamName = teams[1];
      isHomeTeam = homeTeamName.includes(teamId.toString()); // 简化判断
    }
    
    matches.push({
      matchTime: time.trim(),
      leagueName: league.trim(),
      homeTeamName,
      awayTeamName,
      homeScore,
      awayScore,
      isCompleted,
      isHomeTeam
    });
  }
  
  return {
    teamId,
    totalMatches: matches.length,
    matches: matches.slice(0, limit),
    source: 'html',
    timestamp: new Date().toISOString()
  };
}

/**
 * 处理比赛数据
 */
function processMatches(matches, teamId, limit, timeRange) {
  // 过滤和排序
  let filteredMatches = matches;
  
  // 按时间排序（最新的在前面）
  filteredMatches.sort((a, b) => {
    const timeA = new Date(a.matchTime.replace(/-/g, '/'));
    const timeB = new Date(b.matchTime.replace(/-/g, '/'));
    return timeB - timeA;
  });
  
  // 应用时间范围过滤
  const now = new Date();
  if (timeRange === 'recent') {
    // 最近30天的比赛
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    filteredMatches = filteredMatches.filter(match => {
      const matchTime = new Date(match.matchTime.replace(/-/g, '/'));
      return matchTime >= thirtyDaysAgo && matchTime <= now;
    });
  } else if (timeRange === 'upcoming') {
    // 未来比赛
    filteredMatches = filteredMatches.filter(match => {
      const matchTime = new Date(match.matchTime.replace(/-/g, '/'));
      return matchTime > now;
    });
  }
  // 'all' 显示所有比赛
  
  // 应用数量限制
  filteredMatches = filteredMatches.slice(0, limit);
  
  // 格式化比赛信息
  const formattedMatches = filteredMatches.map(match => {
    const matchTime = new Date(match.matchTime.replace(/-/g, '/'));
    const isCompleted = match.homeScore !== null && match.awayScore !== null;
    const isFuture = matchTime > now;
    
    let status = '未开始';
    if (isCompleted) status = '已结束';
    else if (!isFuture && !isCompleted) status = '进行中';
    
    return {
      matchId: match.matchId,
      matchTime: match.matchTime,
      league: match.leagueName,
      homeTeam: match.homeTeamName,
      awayTeam: match.awayTeamName,
      score: isCompleted ? `${match.homeScore}-${match.awayScore}` : '未开始',
      homeScore: match.homeScore,
      awayScore: match.awayScore,
      status,
      isHomeGame: match.isHomeTeam,
      detailUrl: match.matchId ? `https://live.titan007.com/detail/${match.matchId}cn.htm` : null
    };
  });
  
  return {
    teamId,
    totalMatches: matches.length,
    displayedMatches: formattedMatches.length,
    matches: formattedMatches,
    source: 'js_data',
    timestamp: new Date().toISOString()
  };
}

/**
 * 主函数
 */
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.error('请提供球队ID作为参数');
    console.log('用法: node get_schedule.js <球队ID> [选项]');
    console.log('选项:');
    console.log('  --limit <数量>     显示比赛数量 (默认: 10)');
    console.log('  --time <范围>      时间范围: recent/all/upcoming (默认: recent)');
    process.exit(1);
  }
  
  const teamId = args[0];
  const options = {};
  
  // 解析选项
  for (let i = 1; i < args.length; i++) {
    if (args[i] === '--limit' && args[i + 1]) {
      options.limit = parseInt(args[i + 1]);
      i++;
    } else if (args[i] === '--time' && args[i + 1]) {
      options.timeRange = args[i + 1];
      i++;
    }
  }
  
  try {
    console.log(`正在获取球队 ${teamId} 的赛程...`);
    const schedule = await getTeamSchedule(teamId, options);
    
    console.log('\n=== 球队赛程 ===');
    console.log(`球队ID: ${schedule.teamId}`);
    console.log(`总比赛场次: ${schedule.totalMatches}`);
    console.log(`显示比赛: ${schedule.displayedMatches}`);
    console.log(`数据来源: ${schedule.source}`);
    
    console.log('\n=== 比赛列表 ===');
    schedule.matches.forEach((match, index) => {
      console.log(`${index + 1}. ${match.matchTime} ${match.league}`);
      console.log(`   ${match.homeTeam} vs ${match.awayTeam}`);
      console.log(`   比分: ${match.score} (${match.status})`);
      console.log(`   比赛ID: ${match.matchId || '未知'}`);
      if (match.detailUrl) {
        console.log(`   详情: ${match.detailUrl}`);
      }
      console.log();
    });
    
    // 输出为JSON格式
    console.log('=== JSON输出 ===');
    console.log(JSON.stringify({
      success: true,
      schedule,
      timestamp: new Date().toISOString()
    }, null, 2));
    
  } catch (error) {
    console.error('错误:', error.message);
    console.log(JSON.stringify({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, null, 2));
    process.exit(1);
  }
}

// 如果是直接运行此脚本
if (require.main === module) {
  main();
}

module.exports = { getTeamSchedule, parseScheduleFromJS, parseScheduleFromHTML };