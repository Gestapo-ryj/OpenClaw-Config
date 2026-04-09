#!/usr/bin/env node

/**
 * 从HTML页面提取球队数据的脚本
 */

const https = require('https');

/**
 * 从HTML中提取球队数据
 */
async function extractTeamDataFromHTML(teamName) {
  return new Promise((resolve, reject) => {
    const encodedName = encodeURIComponent(teamName);
    const url = `https://ba2.titan007.com/homepage/multisearch?keyword=${encodedName}&type=0`;
    
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
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
        console.log(`HTML页面大小: ${data.length} 字符`);
        
        // 尝试多种提取方法
        const extractedData = tryAllExtractionMethods(data, teamName);
        
        if (extractedData) {
          resolve(extractedData);
        } else {
          reject(new Error('无法从HTML中提取球队数据'));
        }
      });
    }).on('error', (error) => {
      reject(new Error(`获取HTML失败: ${error.message}`));
    });
  });
}

/**
 * 尝试所有提取方法
 */
function tryAllExtractionMethods(html, teamName) {
  console.log('\n尝试提取方法:');
  
  // 方法1: 查找script标签中的JSON数据
  console.log('1. 查找script标签中的JSON数据...');
  const scriptPatterns = [
    /<script[^>]*>[\s\S]*?var\s+data\s*=\s*(\{[\s\S]*?\});[\s\S]*?<\/script>/i,
    /<script[^>]*>[\s\S]*?var\s+searchData\s*=\s*(\{[\s\S]*?\});[\s\S]*?<\/script>/i,
    /<script[^>]*>[\s\S]*?var\s+result\s*=\s*(\{[\s\S]*?\});[\s\S]*?<\/script>/i,
    /window\.__INITIAL_STATE__\s*=\s*(\{[\s\S]*?\});/i,
    /<script[^>]*type=["']application\/json["'][^>]*>([\s\S]*?)<\/script>/gi
  ];
  
  for (const pattern of scriptPatterns) {
    const match = html.match(pattern);
    if (match && match[1]) {
      console.log(`   找到匹配模式: ${pattern.toString().substring(0, 50)}...`);
      try {
        const jsonData = JSON.parse(match[1]);
        console.log(`   成功解析JSON数据`);
        return parseExtractedData(jsonData, teamName);
      } catch (error) {
        console.log(`   JSON解析失败: ${error.message}`);
      }
    }
  }
  
  // 方法2: 查找球队链接
  console.log('2. 查找球队链接...');
  const teamLinkPatterns = [
    /<a[^>]*href=["']\/cn\/team\/Summary\/(\d+)\.html["'][^>]*>([^<]+)<\/a>/gi,
    /<a[^>]*href=["']\/team\/(\d+)\/?["'][^>]*>([^<]+)<\/a>/gi,
    /<a[^>]*href=["'][^"']*team[^"']*\/(\d+)[^"']*["'][^>]*>([^<]+)<\/a>/gi
  ];
  
  const teams = [];
  for (const pattern of teamLinkPatterns) {
    let match;
    while ((match = pattern.exec(html)) !== null) {
      const id = match[1];
      const name = match[2].trim();
      
      // 过滤掉非球队链接
      if (!name.includes('首页') && !name.includes('返回') && name.length > 1) {
        teams.push({
          id: parseInt(id),
          name: name,
          league: '未知'
        });
      }
    }
    
    if (teams.length > 0) {
      console.log(`   找到 ${teams.length} 个球队链接`);
      break;
    }
  }
  
  if (teams.length > 0) {
    // 去重
    const uniqueTeams = [];
    const seenIds = new Set();
    
    for (const team of teams) {
      if (!seenIds.has(team.id)) {
        seenIds.add(team.id);
        uniqueTeams.push(team);
      }
    }
    
    // 找到最匹配的球队
    const exactMatch = uniqueTeams.find(team => 
      team.name === teamName || 
      team.name.includes(teamName) || 
      teamName.includes(team.name)
    );
    
    const selectedTeam = exactMatch || uniqueTeams[0];
    
    return {
      id: selectedTeam.id,
      name: selectedTeam.name,
      league: selectedTeam.league,
      exactMatch: !!exactMatch,
      allMatches: uniqueTeams,
      source: 'html_links'
    };
  }
  
  // 方法3: 查找JSON-LD数据
  console.log('3. 查找JSON-LD数据...');
  const jsonLdPattern = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let jsonLdMatch;
  
  while ((jsonLdMatch = jsonLdPattern.exec(html)) !== null) {
    try {
      const jsonData = JSON.parse(jsonLdMatch[1]);
      if (jsonData['@type'] === 'SportsTeam' || jsonData.name) {
        console.log(`   找到JSON-LD数据: ${jsonData.name || '未知'}`);
        return {
          id: jsonData['@id'] || jsonData.url || '未知',
          name: jsonData.name || teamName,
          league: jsonData.sport || jsonData.league || '未知',
          exactMatch: jsonData.name === teamName,
          allMatches: [{
            id: jsonData['@id'] || jsonData.url || '未知',
            name: jsonData.name || teamName,
            league: jsonData.sport || jsonData.league || '未知'
          }],
          source: 'json_ld'
        };
      }
    } catch (error) {
      // 继续尝试
    }
  }
  
  // 方法4: 查找隐藏的input字段
  console.log('4. 查找隐藏的表单数据...');
  const inputPatterns = [
    /<input[^>]*name=["']teamId["'][^>]*value=["'](\d+)["'][^>]*>/gi,
    /<input[^>]*value=["'](\d+)["'][^>]*name=["']teamId["'][^>]*>/gi,
    /data-team-id=["'](\d+)["']/gi,
    /data-id=["'](\d+)["'][^>]*data-type=["']team["']/gi
  ];
  
  for (const pattern of inputPatterns) {
    const match = html.match(pattern);
    if (match) {
      console.log(`   找到隐藏字段: ${match[0].substring(0, 50)}...`);
      // 这里需要更复杂的解析来获取球队名称
    }
  }
  
  return null;
}

/**
 * 解析提取的数据
 */
function parseExtractedData(jsonData, teamName) {
  console.log(`解析提取的数据:`, typeof jsonData);
  
  // 尝试不同的数据结构
  let teams = [];
  
  if (jsonData.data && Array.isArray(jsonData.data)) {
    teams = jsonData.data.filter(item => item.type === 2);
  } else if (jsonData.list && Array.isArray(jsonData.list)) {
    teams = jsonData.list.filter(item => item.type === 2);
  } else if (jsonData.teams && Array.isArray(jsonData.teams)) {
    teams = jsonData.teams;
  } else if (Array.isArray(jsonData)) {
    teams = jsonData.filter(item => item.type === 2);
  }
  
  if (teams.length === 0) {
    throw new Error('未找到球队数据');
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
    exactMatch: !!exactMatch,
    allMatches: teams.map(team => ({
      id: team.id,
      name: team.name,
      league: team.league || '未知'
    })),
    source: 'html_json'
  };
}

/**
 * 主函数
 */
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.error('请提供球队名称作为参数');
    console.log('用法: node extract_from_html.js "球队名称"');
    process.exit(1);
  }
  
  const teamName = args[0];
  
  try {
    console.log(`从HTML页面提取球队数据: ${teamName}`);
    const teamInfo = await extractTeamDataFromHTML(teamName);
    
    console.log('\n=== 提取结果 ===');
    console.log(`球队ID: ${teamInfo.id}`);
    console.log(`球队名称: ${teamInfo.name}`);
    console.log(`所属联赛: ${teamInfo.league}`);
    console.log(`是否精确匹配: ${teamInfo.exactMatch ? '是' : '否'}`);
    console.log(`数据来源: ${teamInfo.source}`);
    
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
      source: teamInfo.source,
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

module.exports = { extractTeamDataFromHTML };