#!/usr/bin/env node

/**
 * 比赛详情获取脚本
 * 通过比赛ID获取比赛的详细数据
 */

const https = require('https');

/**
 * 获取比赛详情
 * @param {string|number} matchId - 比赛ID
 * @param {Object} options - 选项
 * @returns {Promise<Object>} - 比赛详情
 */
async function getMatchDetails(matchId, options = {}) {
  const { detailLevel = 'full' } = options;
  
  return new Promise((resolve, reject) => {
    const url = `https://live.titan007.com/detail/${matchId}cn.htm`;
    
    const requestOptions = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'Referer': 'https://zq.titan007.com/'
      }
    };
    
    https.get(url, requestOptions, (res) => {
      let html = '';
      
      res.on('data', (chunk) => {
        html += chunk;
      });
      
      res.on('end', () => {
        try {
          const matchDetails = parseMatchDetails(html, matchId, detailLevel);
          resolve(matchDetails);
        } catch (error) {
          reject(new Error(`解析比赛详情失败: ${error.message}`));
        }
      });
    }).on('error', (error) => {
      reject(new Error(`获取比赛详情失败: ${error.message}`));
    });
  });
}

/**
 * 解析比赛详情
 */
function parseMatchDetails(html, matchId, detailLevel) {
  // 提取基本信息
  const basicInfo = extractBasicInfo(html);
  
  // 提取技术统计
  const stats = extractTechnicalStats(html);
  
  // 提取进球时间线
  const goals = extractGoalTimeline(html);
  
  // 提取阵容信息
  const lineups = extractLineupInfo(html);
  
  // 提取比赛事件
  const events = extractMatchEvents(html);
  
  // 提取球队统计
  const teamStats = extractTeamStats(html);
  
  // 构建结果对象
  const result = {
    matchId,
    basicInfo,
    technicalStats: stats,
    goalTimeline: goals,
    matchEvents: events,
    source: 'titan007.com',
    timestamp: new Date().toISOString()
  };
  
  // 根据详细级别添加额外信息
  if (detailLevel === 'full') {
    result.lineups = lineups;
    result.teamStats = teamStats;
  }
  
  return result;
}

/**
 * 提取基本信息
 */
function extractBasicInfo(html) {
  const info = {};
  
  // 从JavaScript变量中提取信息
  const varPatterns = {
    scheduleID: /var scheduleID\s*=\s*(\d+);/,
    strTime: /var strTime\s*=\s*'([^']+)';/,
    homeTeamName: /var homeTeamName\s*=\s*'([^']+)';/,
    guestTeamName: /var guestTeamName\s*=\s*'([^']+)';/,
    homeTeamFlg: /var homeTeamFlg\s*=\s*'([^']+)';/,
    guestTeamFlg: /var guestTeamFlg\s*=\s*'([^']+)';/
  };
  
  for (const [key, pattern] of Object.entries(varPatterns)) {
    const match = html.match(pattern);
    if (match) {
      info[key] = match[1];
    }
  }
  
  // 从标题中提取联赛信息
  const titleMatch = html.match(/<title>([^<]+)<\/title>/);
  if (titleMatch) {
    const title = titleMatch[1];
    // 尝试提取联赛信息（如"智利甲"）
    const leagueMatch = title.match(/\(([^)]+赛季[^)]+)\)/);
    if (leagueMatch) {
      info.league = leagueMatch[1];
    }
  }
  
  // 提取比分信息
  const scoreMatch = html.match(/<div class=['"]data['"][^>]*>.*?<span[^>]*>.*?<i[^>]*>(\d+)<\/i>.*?<span[^>]*>.*?<i[^>]*>(\d+)<\/i>/s);
  if (scoreMatch) {
    info.homeScore = parseInt(scoreMatch[1]);
    info.awayScore = parseInt(scoreMatch[2]);
    info.fullTimeScore = `${info.homeScore}-${info.awayScore}`;
  }
  
  // 提取半场比分
  const halfTimeMatch = html.match(/半场.*?(\d+)\s*[-:]\s*(\d+)/);
  if (halfTimeMatch) {
    info.halfTimeScore = `${halfTimeMatch[1]}-${halfTimeMatch[2]}`;
  }
  
  return info;
}

/**
 * 提取技术统计
 */
function extractTechnicalStats(html) {
  const stats = {
    home: {},
    away: {}
  };
  
  // 查找技术统计表格
  const statsSection = html.match(/<ul[^>]*class=['"]listbox new['"][^>]*>([\s\S]*?)<\/ul>/);
  if (!statsSection) return stats;
  
  const statsHtml = statsSection[1];
  
  // 解析每项统计
  const statItems = statsHtml.match(/<li[^>]*class=['"]lists['"][^>]*>([\s\S]*?)<\/li>/g) || [];
  
  statItems.forEach(item => {
    // 提取统计名称和数值
    const nameMatch = item.match(/<span[^>]*>([^<]+)<\/span>/);
    const homeValueMatch = item.match(/<span[^>]*>(\d+\.?\d*%?)<\/span>/g);
    
    if (nameMatch && homeValueMatch && homeValueMatch.length >= 2) {
      const statName = nameMatch[1].trim();
      const homeValue = homeValueMatch[0].replace(/<[^>]*>/g, '').trim();
      const awayValue = homeValueMatch[1].replace(/<[^>]*>/g, '').trim();
      
      // 确定优势方
      let advantage = 'equal';
      if (statName.includes('率') || statName.includes('成功率')) {
        // 百分比类型，数值大的优势
        const homeNum = parseFloat(homeValue);
        const awayNum = parseFloat(awayValue);
        if (homeNum > awayNum) advantage = 'home';
        else if (awayNum > homeNum) advantage = 'away';
      } else {
        // 数值类型，根据统计类型判断
        const homeNum = parseInt(homeValue);
        const awayNum = parseInt(awayValue);
        
        if (statName.includes('失球') || statName.includes('犯规') || statName.includes('黄牌')) {
          // 这些是越少越好
          if (homeNum < awayNum) advantage = 'home';
          else if (awayNum < homeNum) advantage = 'away';
        } else {
          // 其他是越多越好
          if (homeNum > awayNum) advantage = 'home';
          else if (awayNum > homeNum) advantage = 'away';
        }
      }
      
      stats.home[statName] = homeValue;
      stats.away[statName] = awayValue;
      stats[`${statName}_advantage`] = advantage;
    }
  });
  
  return stats;
}

/**
 * 提取进球时间线
 */
function extractGoalTimeline(html) {
  const goals = [];
  
  // 查找进球事件
  const goalPattern = /<img[^>]*src=['"]\/images\/bf_img2\/1\.png['"][^>]*>.*?(\d+)['"]\s*[^>]*>.*?([^<]+)/g;
  let match;
  
  while ((match = goalPattern.exec(html)) !== null) {
    const minute = match[1];
    const playerInfo = match[2];
    
    // 提取球员姓名（简化处理）
    const playerMatch = playerInfo.match(/>([^<]+)</) || playerInfo.match(/([^>]+)$/);
    const playerName = playerMatch ? playerMatch[1].trim() : playerInfo.trim();
    
    goals.push({
      minute: parseInt(minute),
      player: playerName,
      description: `${minute}' 进球`
    });
  }
  
  // 按时间排序
  goals.sort((a, b) => a.minute - b.minute);
  
  return goals;
}

/**
 * 提取阵容信息
 */
function extractLineupInfo(html) {
  const lineups = {
    home: { formation: '未知', players: [] },
    away: { formation: '未知', players: [] }
  };
  
  // 提取阵型信息
  const formationMatch = html.match(/<div class=['"]homeN['"][^>]*>.*?(\d+-\d+-\d+)/);
  if (formationMatch) {
    lineups.home.formation = formationMatch[1];
  }
  
  const awayFormationMatch = html.match(/<div class=['"]guestN['"][^>]*>.*?(\d+-\d+-\d+)/);
  if (awayFormationMatch) {
    lineups.away.formation = awayFormationMatch[1];
  }
  
  // 提取球员信息（简化版本）
  const playerPattern = /<div class=['"]play['"][^>]*>.*?<em class=['"]num['"]>(\d+)\s*<\/em>.*?<a[^>]*>([^<]+)<\/a>.*?姓名：([^<]+).*?生日：([^<]+).*?身高：([^<]+).*?身价：([^<]+).*?国籍：([^<]+)/g;
  let playerMatch;
  
  while ((playerMatch = playerPattern.exec(html)) !== null) {
    const player = {
      number: playerMatch[1].trim(),
      name: playerMatch[2].trim(),
      fullName: playerMatch[3].trim(),
      birthday: playerMatch[4].trim(),
      height: playerMatch[5].trim(),
      value: playerMatch[6].trim(),
      nationality: playerMatch[7].trim()
    };
    
    // 简单判断是主队还是客队球员（根据上下文）
    // 这里需要更复杂的逻辑来准确分配，暂时都放到主队
    lineups.home.players.push(player);
  }
  
  return lineups;
}

/**
 * 提取比赛事件
 */
function extractMatchEvents(html) {
  const events = [];
  
  // 查找事件表格
  const eventsSection = html.match(/<ul[^>]*class=['"]listbox['"][^>]*id=['"]teamEventDiv['"][^>]*>([\s\S]*?)<\/ul>/);
  if (!eventsSection) return events;
  
  const eventsHtml = eventsSection[1];
  
  // 解析事件行
  const eventRows = eventsHtml.match(/<li[^>]*class=['"]lists['"][^>]*>([\s\S]*?)<\/li>/g) || [];
  
  eventRows.forEach(row => {
    // 提取时间
    const timeMatch = row.match(/<span[^>]*>(\d+['+']?)<\/span>/);
    if (!timeMatch) return;
    
    const time = timeMatch[1];
    
    // 提取事件类型和描述
    let eventType = '其他';
    let description = '';
    
    // 检查各种事件图标
    if (row.includes('bf_img2/1.png')) {
      eventType = '进球';
    } else if (row.includes('bf_img2/3.png')) {
      eventType = '黄牌';
    } else if (row.includes('bf_img2/11.png')) {
      eventType = '换人';
    } else if (row.includes('bf_img2/12.png')) {
      eventType = '助攻';
    }
    
    // 提取球员信息
    const playerMatch = row.match(/<a[^>]*>([^<]+)<\/a>/g);
    if (playerMatch) {
      const players = playerMatch.map(p => p.replace(/<[^>]*>/g, '').trim());
      description = `${eventType}: ${players.join(', ')}`;
    } else {
      description = `${eventType} ${time}`;
    }
    
    events.push({
      time,
      type: eventType,
      description,
      rawHtml: row.substring(0, 100) // 保存部分原始HTML用于调试
    });
  });
  
  // 按时间排序
  events.sort((a, b) => {
    const timeA = parseTime(a.time);
    const timeB = parseTime(b.time);
    return timeA - timeB;
  });
  
  return events;
}

/**
 * 解析时间字符串
 */
function parseTime(timeStr) {
  if (timeStr.includes("+")) {
    const parts = timeStr.split("+");
    return parseInt(parts[0]) * 100 + parseInt(parts[1] || 0);
  }
  return parseInt(timeStr) * 100;
}

/**
 * 提取球队统计
 */
function extractTeamStats(html) {
  const stats = {
    home: {},
    away: {}
  };
  
  // 查找近期表现表格
  const recentStatsMatch = html.match(/<table[^>]*id=['"]techCountAll['"][^>]*>([\s\S]*?)<\/table>/);
  if (recentStatsMatch) {
    const tableHtml = recentStatsMatch[1];
    
    // 解析表格行
    const rowPattern = /<tr>.*?<td[^>]*>([^<]+)<\/td>.*?<td[^>]*>([^<]+)<\/td>.*?<td[^>]*>([^<]+)<\/td>.*?<td[^>]*>([^<]+)<\/td>.*?<td[^>]*>([^<]+)<\/td>/g;
    let rowMatch;
    
    while ((rowMatch = rowPattern.exec(tableHtml)) !== null) {
      const statName = rowMatch[3].trim();
      const homeRecent3 = rowMatch[1].trim();
      const homeRecent10 = rowMatch[2].trim();
      const awayRecent3 = rowMatch[4].trim();
      const awayRecent10 = rowMatch[5].trim();
      
      if (statName && statName !== '&nbsp;') {
        stats.home[statName] = { recent3: homeRecent3, recent10: homeRecent10 };
        stats.away[statName] = { recent3: awayRecent3, recent10: awayRecent10 };
      }
    }
  }
  
  return stats;
}

/**
 * 主函数
 */
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.error('请提供比赛ID作为参数');
    console.log('用法: node get_match_details.js <比赛ID> [选项]');
    console.log('选项:');
    console.log('  --level <级别>     详细级别: summary/full (默认: full)');
    process.exit(1);
  }
  
  const matchId = args[0];
  const options = {};
  
  // 解析选项
  for (let i = 1; i < args.length; i++) {
    if (args[i] === '--level' && args[i + 1]) {
      options.detailLevel = args[i + 1];
      i++;
    }
  }
  
  try {
    console.log(`正在获取比赛 ${matchId} 的详情...`);
    const details = await getMatchDetails(matchId, options);
    
    console.log('\n=== 比赛基本信息 ===');
    console.log(`比赛ID: ${details.matchId}`);
    console.log(`比赛时间: ${details.basicInfo.strTime || '未知'}`);
    console.log(`主队: ${details.basicInfo.homeTeamName || '未知'} ${details.basicInfo.homeScore || ''}`);
    console.log(`客队: ${details.basicInfo.guestTeamName || '未知'} ${details.basicInfo.awayScore || ''}`);
    console.log(`全场比分: ${details.basicInfo.fullTimeScore || '未知'}`);
    console.log(`半场比分: ${details.basicInfo.halfTimeScore || '未知'}`);
    console.log(`联赛: ${details.basicInfo.league || '未知'}`);
    
    console.log('\n=== 技术统计 ===');
    const stats = details.technicalStats;
    for (const [statName, homeValue] of Object.entries(stats.home)) {
      if (!statName.includes('_advantage')) {
        const awayValue = stats.away[statName];
        const advantage = stats[`${statName}_advantage`];
        let advantageSymbol = ' ';
        if (advantage === 'home') advantageSymbol = '←';
        else if (advantage === 'away') advantageSymbol = '→';
        
        console.log(`${statName}: ${homeValue} ${advantageSymbol} ${awayValue}`);
      }
    }
    
    console.log('\n=== 进球时间线 ===');
    if (details.goalTimeline.length > 0) {
      details.goalTimeline.forEach(goal => {
        console.log(`${goal.minute}' ⚽ ${goal.player}`);
      });
    } else {
      console.log('无进球数据');
    }
    
    console.log('\n=== 比赛事件 ===');
    if (details.matchEvents.length > 0) {
      details.matchEvents.forEach(event => {
        console.log(`${event.time} ${event.type}: ${event.description}`);
      });
    } else {
      console.log('无事件数据');
    }
    
    if (options.detailLevel === 'full' && details.lineups) {
      console.log('\n=== 阵容信息 ===');
      console.log(`主队阵型: ${details.lineups.home.formation}`);
      console.log(`主队球员: ${details.lineups.home.players.length}名`);
      
      console.log(`\n客队阵型: ${details.lineups.away.formation}`);
      console.log(`客队球员: ${details.lineups.away.players.length}名`);
    }
    
    if (options.detailLevel === 'full' && details.teamStats) {
      console.log('\n=== 球队近期表现 ===');
      console.log('主队 (近3场/近10场):');
      for (const [statName, values] of Object.entries(details.teamStats.home)) {
        console.log(`  ${statName}: ${values.recent3} / ${values.recent10}`);
      }
    }
    
    // 输出为JSON格式
    console.log('\n=== JSON输出 ===');
    console.log(JSON.stringify({
      success: true,
      matchDetails: details,
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

module.exports = { getMatchDetails, parseMatchDetails };