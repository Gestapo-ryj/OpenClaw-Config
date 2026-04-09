/**
 * 新球体育(titan007.com)球队搜索脚本
 * 用于搜索球队ID和相关信息
 */

class TeamSearcher {
  constructor(options = {}) {
    this.baseUrl = options.baseUrl || 'https://ba2.titan007.com';
    this.searchEndpoint = options.searchEndpoint || '/homepage/MultiSearchResult';
    this.userAgent = options.userAgent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
  }

  /**
   * 搜索球队信息
   * @param {string} teamName - 球队名称
   * @param {string} searchType - 搜索类型：0=全部, 1=比赛, 2=联赛, 3=球队, 4=球员, 5=用户, 6=球吧
   * @returns {Promise<Object>} 搜索结果
   */
  async searchTeam(teamName, searchType = '3') {
    try {
      const searchData = {
        keyword: teamName,
        type: searchType,
        page: 0
      };

      // 构建请求参数
      const params = new URLSearchParams();
      params.append('keyword', teamName);
      params.append('type', searchType);
      params.append('page', '0');

      // 发送POST请求
      const response = await this.makeRequest(
        `${this.baseUrl}${this.searchEndpoint}`,
        {
          method: 'POST',
          headers: {
            'User-Agent': this.userAgent,
            'Content-Type': 'application/x-www-form-urlencoded',
            'X-Requested-With': 'XMLHttpRequest',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
            'Accept-Language': 'zh-CN,zh;q=0.9'
          },
          body: params.toString()
        }
      );

      return this.parseSearchResults(response, teamName);
    } catch (error) {
      console.error('搜索球队时出错:', error);
      return {
        success: false,
        error: error.message,
        teamName: teamName
      };
    }
  }

  /**
   * 发送HTTP请求
   * @param {string} url - 请求URL
   * @param {Object} options - 请求选项
   * @returns {Promise<string>} 响应文本
   */
  async makeRequest(url, options = {}) {
    // 在Node.js环境中使用fetch
    if (typeof fetch === 'undefined') {
      // 如果在非浏览器环境，需要引入node-fetch或使用其他HTTP客户端
      const https = require('https');
      return new Promise((resolve, reject) => {
        const reqOptions = {
          method: options.method || 'GET',
          headers: options.headers || {}
        };

        const req = https.request(url, reqOptions, (res) => {
          let data = '';
          res.on('data', (chunk) => {
            data += chunk;
          });
          res.on('end', () => {
            resolve(data);
          });
        });

        req.on('error', reject);

        if (options.body) {
          req.write(options.body);
        }
        req.end();
      });
    } else {
      // 在浏览器环境中使用fetch
      const response = await fetch(url, options);
      return await response.text();
    }
  }

  /**
   * 解析搜索结果
   * @param {string} html - HTML响应
   * @param {string} teamName - 搜索的球队名称
   * @returns {Object} 解析结果
   */
  parseSearchResults(html, teamName) {
    const result = {
      success: true,
      teamName: teamName,
      teams: [],
      matches: [],
      totalTeams: 0,
      totalMatches: 0
    };

    try {
      // 解析球队信息
      const teamRegex = /<li class="teamlis" onclick="window\.open\('\/\/zq\.titan007\.com\/cn\/team\/Summary\/(\d+)\.html'\)">\s*<div class="img"><img src="([^"]+)" \/><\/div>\s*<div class="name">([^<]+)<\/div>\s*<\/li>/g;
      let teamMatch;
      
      while ((teamMatch = teamRegex.exec(html)) !== null) {
        const teamId = teamMatch[1];
        const logoUrl = teamMatch[2];
        const name = teamMatch[3];
        
        result.teams.push({
          id: teamId,
          name: name,
          logoUrl: logoUrl,
          summaryUrl: `https://zq.titan007.com/cn/team/Summary/${teamId}.html`,
          isMainTeam: name === teamName || name.includes(teamName.replace(/[队隊]$/, ''))
        });
      }

      // 解析比赛信息
      const matchRegex = /<li class="matchuplis" onclick="window\.open\('\/\/zq\.titan007\.com\/analysis\/(\d+)([^']+)'\)">\s*<span class="time">([^<]+)<\/span>\s*<span class="league">\s*<i>([^<]+)<\/i>&nbsp;&nbsp;<font[^>]*>([^<]+)<\/font>\s*<\/span>\s*<span class="team"[^>]*>\s*([^<]+)\s*<\/span>\s*<span class="score"[^>]*>\s*([^<]+)\s*<\/span>\s*<span class="team"[^>]*>\s*([^<]+)\s*<\/span>/g;
      let matchMatch;
      
      while ((matchMatch = matchRegex.exec(html)) !== null) {
        const matchId = matchMatch[1];
        const time = matchMatch[3];
        const sportType = matchMatch[4];
        const league = matchMatch[5];
        const homeTeam = matchMatch[6];
        const score = matchMatch[7];
        const awayTeam = matchMatch[8];
        
        result.matches.push({
          id: matchId,
          time: time,
          sportType: sportType,
          league: league,
          homeTeam: homeTeam,
          score: score,
          awayTeam: awayTeam,
          analysisUrl: `https://zq.titan007.com/analysis/${matchId}sb.htm`,
          oddsUrl: `https://bf.titan007.com/panlu/${matchId}cn.htm`,
          liveUrl: `https://live.titan007.com/detail/${matchId}sb.htm`
        });
      }

      // 统计总数
      const teamCountMatch = html.match(/搜索到 关键字[^"]+"[^"]*"的球队 (\d+) 个/);
      const matchCountMatch = html.match(/搜索到 关键字[^"]+"[^"]*"的比赛 (\d+) 个/);

      if (teamCountMatch) result.totalTeams = parseInt(teamCountMatch[1]);
      if (matchCountMatch) result.totalMatches = parseInt(matchCountMatch[1]);

      // 如果没有找到球队，尝试更宽松的匹配
      if (result.teams.length === 0) {
        const looseTeamRegex = /<div class="name">([^<]*科尔多瓦[^<]*)<\/div>/g;
        let looseMatch;
        while ((looseMatch = looseTeamRegex.exec(html)) !== null) {
          const name = looseMatch[1];
          // 尝试从上下文提取ID
          const idMatch = html.substring(looseMatch.index - 100, looseMatch.index).match(/Summary\/(\d+)\.html/);
          result.teams.push({
            id: idMatch ? idMatch[1] : 'unknown',
            name: name,
            logoUrl: '//pic.static007.com/images/teamicon.png',
            summaryUrl: idMatch ? `https://zq.titan007.com/cn/team/Summary/${idMatch[1]}.html` : null,
            isMainTeam: name.includes(teamName.replace(/[队隊]$/, ''))
          });
        }
      }

    } catch (error) {
      console.error('解析搜索结果时出错:', error);
      result.success = false;
      result.error = `解析错误: ${error.message}`;
    }

    return result;
  }

  /**
   * 获取主要球队ID（一线队）
   * @param {Object} searchResult - 搜索结果
   * @returns {string|null} 球队ID
   */
  getMainTeamId(searchResult) {
    if (!searchResult.success || searchResult.teams.length === 0) {
      return null;
    }

    // 优先选择名称完全匹配的球队
    const exactMatch = searchResult.teams.find(team => 
      team.name === searchResult.teamName || 
      team.isMainTeam
    );

    if (exactMatch) {
      return exactMatch.id;
    }

    // 如果没有完全匹配，选择第一个球队
    return searchResult.teams[0].id;
  }

  /**
   * 生成球队搜索报告
   * @param {Object} searchResult - 搜索结果
   * @returns {string} 报告文本
   */
  generateSearchReport(searchResult) {
    if (!searchResult.success) {
      return `## 🔍 球队搜索失败\n\n**错误**: ${searchResult.error || '未知错误'}\n\n**搜索球队**: ${searchResult.teamName}`;
    }

    let report = `## 🔍 球队搜索结果\n\n`;
    report += `**搜索球队**: ${searchResult.teamName}\n`;
    report += `**找到球队**: ${searchResult.totalTeams} 个\n`;
    report += `**相关比赛**: ${searchResult.totalMatches} 场\n\n`;

    if (searchResult.teams.length > 0) {
      report += `### 📋 球队列表\n\n`;
      
      searchResult.teams.forEach((team, index) => {
        const isMain = team.isMainTeam ? ' 🏆' : '';
        report += `${index + 1}. **${team.name}**${isMain}\n`;
        report += `   - **球队ID**: ${team.id}\n`;
        report += `   - **详情页**: ${team.summaryUrl}\n`;
        if (team.logoUrl && team.logoUrl !== '//pic.static007.com/images/teamicon.png') {
          report += `   - **队徽**: ${team.logoUrl}\n`;
        }
        report += `\n`;
      });

      // 显示主要球队ID
      const mainTeamId = this.getMainTeamId(searchResult);
      if (mainTeamId) {
        const mainTeam = searchResult.teams.find(t => t.id === mainTeamId);
        report += `### 🎯 主要球队ID\n`;
        report += `**${mainTeam.name}** 的球队ID是: **${mainTeamId}**\n\n`;
        report += `**使用示例**:\n`;
        report += `- 球队主页: https://zq.titan007.com/cn/team/Summary/${mainTeamId}.html\n`;
        report += `- 球队赛程: https://zq.titan007.com/cn/team/Schedule/${mainTeamId}.html\n`;
        report += `- 球队数据: https://zq.titan007.com/cn/team/Data/${mainTeamId}.html\n\n`;
      }
    }

    if (searchResult.matches.length > 0) {
      report += `### ⚽ 相关比赛\n\n`;
      searchResult.matches.forEach((match, index) => {
        report += `${index + 1}. **${match.time} ${match.league}**\n`;
        report += `   - **对阵**: ${match.homeTeam} ${match.score} ${match.awayTeam}\n`;
        report += `   - **比赛ID**: ${match.id}\n`;
        report += `   - **分析页**: ${match.analysisUrl}\n`;
        report += `   - **赔率页**: ${match.oddsUrl}\n`;
        report += `\n`;
      });
    }

    if (searchResult.teams.length === 0 && searchResult.matches.length === 0) {
      report += `⚠️ 未找到相关球队或比赛信息。\n`;
      report += `**建议**:\n`;
      report += `1. 检查球队名称拼写\n`;
      report += `2. 尝试使用球队的英文名称搜索\n`;
      report += `3. 尝试搜索球队所在联赛\n`;
    }

    report += `\n---\n`;
    report += `*数据来源: 新球体育(titan007.com)*\n`;
    report += `*搜索时间: ${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}*`;

    return report;
  }

  /**
   * 批量搜索球队ID
   * @param {Array<string>} teamNames - 球队名称数组
   * @returns {Promise<Array<Object>>} 搜索结果数组
   */
  async batchSearchTeams(teamNames) {
    const results = [];
    for (const teamName of teamNames) {
      console.log(`正在搜索: ${teamName}`);
      const result = await this.searchTeam(teamName);
      results.push(result);
      // 避免请求过于频繁
      await this.sleep(500);
    }
    return results;
  }

  /**
   * 休眠函数
   * @param {number} ms - 毫秒数
   * @returns {Promise<void>}
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TeamSearcher;
}

// 如果直接运行，提供示例
if (require.main === module) {
  (async () => {
    const searcher = new TeamSearcher();
    const result = await searcher.searchTeam('科尔多瓦学院');
    console.log(searcher.generateSearchReport(result));
    
    // 获取主要球队ID
    const mainTeamId = searcher.getMainTeamId(result);
    if (mainTeamId) {
      console.log(`\n主要球队ID: ${mainTeamId}`);
    }
  })();
}