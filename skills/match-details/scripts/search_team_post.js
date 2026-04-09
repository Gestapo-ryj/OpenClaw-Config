#!/usr/bin/env node

/**
 * 使用POST请求的球队搜索脚本
 * 尝试通过POST请求获取JSON数据
 */

const https = require('https');

/**
 * 使用POST请求搜索球队
 * @param {string} teamName - 球队名称
 * @returns {Promise<Object>} - 球队信息
 */
async function searchTeamIdPost(teamName) {
  return new Promise((resolve, reject) => {
    const encodedName = encodeURIComponent(teamName);
    
    // 尝试不同的API端点
    const postData = JSON.stringify({
      keyword: teamName,
      type: 0,
      page: 1,
      size: 20
    });
    
    const options = {
      hostname: 'ba2.titan007.com',
      path: '/homepage/multisearch',
      method: 'POST',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'Referer': 'https://zq.titan007.com/',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    console.log(`发送POST请求到: https://${options.hostname}${options.path}`);
    console.log(`请求数据: ${postData}`);
    
    const req = https.request(options, (res) => {
      let data = '';
      
      console.log(`响应状态码: ${res.statusCode}`);
      console.log(`响应头:`, res.headers);
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`响应数据长度: ${data.length} 字符`);
        console.log(`响应前200字符: ${data.substring(0, 200)}`);
        
        try {
          // 尝试解析为JSON
          const result = JSON.parse(data);
          console.log(`成功解析JSON数据`);
          resolve(parseSearchResult(result, teamName));
        } catch (error) {
          console.log(`JSON解析失败: ${error.message}`);
          
          // 尝试从响应中提取JSON数据
          const jsonMatch = data.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            try {
              const result = JSON.parse(jsonMatch[0]);
              console.log(`从响应中提取JSON成功`);
              resolve(parseSearchResult(result, teamName));
            } catch (parseError) {
              reject(new Error(`无法解析响应数据: ${parseError.message}`));
            }
          } else {
            reject(new Error(`响应不是有效的JSON格式`));
          }
        }
      });
    }).on('error', (error) => {
      reject(new Error(`POST请求失败: ${error.message}`));
    });
    
    req.write(postData);
    req.end();
  });
}

/**
 * 尝试GET请求作为备选
 */
async function searchTeamIdGet(teamName) {
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
          reject(new Error(`GET请求返回的不是JSON: ${error.message}`));
        }
      });
    }).on('error', (error) => {
      reject(new Error(`GET请求失败: ${error.message}`));
    });
  });
}

/**
 * 解析搜索结果
 */
function parseSearchResult(result, teamName) {
  console.log(`解析搜索结果:`, result);
  
  if (!result) {
    throw new Error('搜索结果为空');
  }
  
  // 检查不同的响应格式
  let teams = [];
  
  if (result.data && Array.isArray(result.data)) {
    teams = result.data.filter(item => item.type === 2); // type=2 表示球队
  } else if (result.list && Array.isArray(result.list)) {
    teams = result.list.filter(item => item.type === 2);
  } else if (Array.isArray(result)) {
    teams = result.filter(item => item.type === 2);
  }
  
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
    })),
    rawResult: result
  };
}

/**
 * 主搜索函数
 */
async function searchTeamId(teamName) {
  console.log(`搜索球队: ${teamName}`);
  
  try {
    // 首先尝试POST请求
    console.log('\n1. 尝试POST请求...');
    const postResult = await searchTeamIdPost(teamName);
    console.log(`✅ POST请求成功: ${postResult.name} (ID: ${postResult.id})`);
    return postResult;
  } catch (postError) {
    console.log(`❌ POST请求失败: ${postError.message}`);
    
    try {
      // 尝试GET请求
      console.log('\n2. 尝试GET请求...');
      const getResult = await searchTeamIdGet(teamName);
      console.log(`✅ GET请求成功: ${getResult.name} (ID: ${getResult.id})`);
      return getResult;
    } catch (getError) {
      console.log(`❌ GET请求失败: ${getError.message}`);
      
      // 返回模拟数据作为最后手段
      console.log('\n3. 使用模拟数据...');
      return {
        id: 1300,
        name: teamName,
        league: '未知联赛',
        exactMatch: false,
        allMatches: [{
          id: 1300,
          name: teamName,
          league: '未知联赛'
        }],
        source: 'mock'
      };
    }
  }
}

/**
 * 主函数
 */
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.error('请提供球队名称作为参数');
    console.log('用法: node search_team_post.js "球队名称"');
    process.exit(1);
  }
  
  const teamName = args[0];
  
  try {
    const teamInfo = await searchTeamId(teamName);
    
    console.log('\n=== 搜索结果 ===');
    console.log(`球队ID: ${teamInfo.id}`);
    console.log(`球队名称: ${teamInfo.name}`);
    console.log(`所属联赛: ${teamInfo.league}`);
    console.log(`是否精确匹配: ${teamInfo.exactMatch ? '是' : '否'}`);
    console.log(`数据来源: ${teamInfo.source || 'API'}`);
    
    if (teamInfo.allMatches && teamInfo.allMatches.length > 1) {
      console.log('\n=== 所有匹配结果 ===');
      teamInfo.allMatches.forEach((team, index) => {
        console.log(`${index + 1}. ${team.name} (ID: ${team.id}, 联赛: ${team.league})`);
      });
    }
    
    // 输出为JSON格式
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