#!/usr/bin/env node

/**
 * 球队搜索脚本
 * 通过球队名称搜索titan007.com获取球队ID
 */

const https = require('https');

/**
 * 搜索球队ID
 * @param {string} teamName - 球队名称
 * @returns {Promise<Object>} - 球队信息
 */
async function searchTeamId(teamName) {
  return new Promise((resolve, reject) => {
    const encodedName = encodeURIComponent(teamName);
    const url = `https://ba2.titan007.com/homepage/multisearch?keyword=${encodedName}&type=0`;
    
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'Referer': 'https://zq.titan007.com/'
      }
    };
    
    https.get(url, options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve(parseSearchResult(result, teamName));
        } catch (error) {
          reject(new Error(`解析搜索结果失败: ${error.message}`));
        }
      });
    }).on('error', (error) => {
      reject(new Error(`搜索请求失败: ${error.message}`));
    });
  });
}

/**
 * 解析搜索结果
 * @param {Object} result - API响应
 * @param {string} teamName - 搜索的球队名称
 * @returns {Object} - 解析后的球队信息
 */
function parseSearchResult(result, teamName) {
  if (!result || !result.data) {
    throw new Error('搜索结果为空');
  }
  
  const teams = result.data.filter(item => item.type === 2); // type=2 表示球队
  
  if (teams.length === 0) {
    throw new Error(`未找到球队: ${teamName}`);
  }
  
  // 优先选择完全匹配的球队
  const exactMatch = teams.find(team => 
    team.name === teamName || 
    team.name.includes(teamName) || 
    teamName.includes(team.name)
  );
  
  const selectedTeam = exactMatch || teams[0];
  
  return {
    id: selectedTeam.id,
    name: selectedTeam.name,
    league: selectedTeam.league || '未知',
    type: selectedTeam.type,
    exactMatch: !!exactMatch,
    allMatches: teams.map(team => ({
      id: team.id,
      name: team.name,
      league: team.league || '未知'
    }))
  };
}

/**
 * 主函数
 */
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.error('请提供球队名称作为参数');
    console.log('用法: node search_team.js "球队名称"');
    process.exit(1);
  }
  
  const teamName = args[0];
  
  try {
    console.log(`正在搜索球队: ${teamName}`);
    const teamInfo = await searchTeamId(teamName);
    
    console.log('\n=== 搜索结果 ===');
    console.log(`球队ID: ${teamInfo.id}`);
    console.log(`球队名称: ${teamInfo.name}`);
    console.log(`所属联赛: ${teamInfo.league}`);
    console.log(`是否精确匹配: ${teamInfo.exactMatch ? '是' : '否'}`);
    
    if (teamInfo.allMatches.length > 1) {
      console.log('\n=== 所有匹配结果 ===');
      teamInfo.allMatches.forEach((team, index) => {
        console.log(`${index + 1}. ${team.name} (ID: ${team.id}, 联赛: ${team.league})`);
      });
    }
    
    // 输出为JSON格式，便于其他脚本使用
    console.log('\n=== JSON输出 ===');
    console.log(JSON.stringify({
      success: true,
      team: {
        id: teamInfo.id,
        name: teamInfo.name,
        league: teamInfo.league
      },
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

module.exports = { searchTeamId, parseSearchResult };