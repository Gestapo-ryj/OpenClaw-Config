/**
 * 集成示例：赔率分析 + 球队搜索
 * 展示如何将新球体育球队搜索功能整合到赔率分析中
 */

// 导入必要的模块
const OddsAnalyzer = require('./analyze-odds.js');
const TeamSearcher = require('./search_team.js');

class IntegratedOddsAnalysis {
  constructor(options = {}) {
    this.oddsAnalyzer = new OddsAnalyzer(options.oddsOptions || {});
    this.teamSearcher = new TeamSearcher(options.teamOptions || {});
    this.enableTeamSearch = options.enableTeamSearch !== false; // 默认启用球队搜索
  }

  /**
   * 执行完整的赔率分析（包含球队信息）
   * @param {string} oddsData - 赔率数据文本
   * @param {Array<string>} teamNames - 可选的球队名称数组（用于手动指定）
   * @returns {Promise<Object>} 完整分析结果
   */
  async analyzeWithTeamInfo(oddsData, teamNames = null) {
    console.log('开始赔率分析...');
    
    // 1. 提取和分析赔率数据
    const matches = this.oddsAnalyzer.extractFromSgoddsText(oddsData);
    const analysis = this.oddsAnalyzer.analyzeChanges(matches);
    
    console.log(`分析完成: ${analysis.totalMatches}场比赛, ${analysis.matchesWithChanges}场有显著变化`);
    
    // 2. 如果需要球队搜索，为每场有显著变化的比赛搜索球队信息
    if (this.enableTeamSearch && analysis.significantChanges.length > 0) {
      console.log('开始搜索球队信息...');
      
      for (const item of analysis.significantChanges) {
        const match = item.match;
        
        // 尝试推断球队名称
        let inferredTeamName = this.inferTeamNameFromMatch(match);
        
        // 如果提供了手动指定的球队名称，使用之
        if (teamNames && teamNames.length > 0) {
          // 简单匹配：使用第一个提供的球队名称
          inferredTeamName = teamNames[0];
        }
        
        if (inferredTeamName) {
          try {
            console.log(`搜索球队: ${inferredTeamName} (${match.time} ${match.league})`);
            const teamResult = await this.teamSearcher.searchTeam(inferredTeamName);
            
            // 将球队信息添加到比赛数据中
            match.teamSearchResult = teamResult;
            match.mainTeamId = this.teamSearcher.getMainTeamId(teamResult);
            
            // 标记是否成功找到球队
            match.teamFound = teamResult.success && teamResult.teams.length > 0;
            
            console.log(`球队搜索完成: ${match.teamFound ? '成功' : '失败'}`);
          } catch (error) {
            console.error(`搜索球队时出错: ${error.message}`);
            match.teamSearchError = error.message;
            match.teamFound = false;
          }
        } else {
          console.log(`无法推断球队名称: ${match.time} ${match.league}`);
          match.teamFound = false;
          match.teamSearchError = '无法推断球队名称';
        }
      }
      
      console.log('球队搜索完成');
    }
    
    // 3. 生成增强的报告
    const report = this.generateEnhancedReport(analysis);
    
    return {
      analysis,
      report,
      summary: {
        totalMatches: analysis.totalMatches,
        matchesWithChanges: analysis.matchesWithChanges,
        matchesWithTeamInfo: analysis.significantChanges.filter(item => 
          item.match.teamFound
        ).length,
        timestamp: new Date().toISOString()
      }
    };
  }

  /**
   * 从比赛信息推断球队名称
   * @param {Object} match - 比赛数据
   * @returns {string|null} 推断的球队名称
   */
  inferTeamNameFromMatch(match) {
    const { league, time } = match;
    
    // 根据联赛名称推断
    if (league.includes('Sudamericana Cup')) {
      return '科尔多瓦学院'; // 示例：南美杯常见球队
    } else if (league.includes('Libertadores Cup')) {
      return '博卡青年'; // 示例：解放者杯常见球队
    } else if (league.includes('N America Champions')) {
      return '洛杉矶银河'; // 示例：中北美冠军联赛常见球队
    } else if (league.includes('Indian S League')) {
      return '淡滨尼流浪'; // 示例：印度S联赛球队
    } else if (league.includes('A League')) {
      return '悉尼FC'; // 示例：澳超球队
    }
    
    // 如果无法推断，返回联赛名称的一部分
    const leagueParts = league.split(' ');
    if (leagueParts.length > 0) {
      return leagueParts[0]; // 返回联赛的第一个词
    }
    
    return null;
  }

  /**
   * 生成增强的报告（包含球队信息）
   * @param {Object} analysis - 分析结果
   * @returns {string} 报告文本
   */
  generateEnhancedReport(analysis) {
    let report = this.oddsAnalyzer.generateReport(analysis);
    
    // 添加球队信息部分
    if (analysis.significantChanges.length > 0) {
      report += '\n\n## 🔍 球队信息补充\n\n';
      
      let hasTeamInfo = false;
      
      for (const item of analysis.significantChanges) {
        const match = item.match;
        
        if (match.teamFound && match.teamSearchResult) {
          hasTeamInfo = true;
          
          report += `### ${match.time} ${match.league}\n`;
          
          const teamResult = match.teamSearchResult;
          const mainTeamId = match.mainTeamId;
          const mainTeam = teamResult.teams.find(t => t.id === mainTeamId);
          
          if (mainTeam) {
            report += `**主要球队**: ${mainTeam.name}\n`;
            report += `**球队ID**: ${mainTeamId}\n`;
            report += `**详情页**: ${mainTeam.summaryUrl}\n\n`;
          }
          
          // 显示所有找到的球队
          if (teamResult.teams.length > 1) {
            report += `**相关球队**:\n`;
            teamResult.teams.forEach(team => {
              const isMain = team.id === mainTeamId ? ' 🏆' : '';
              report += `- ${team.name}${isMain} (ID: ${team.id})\n`;
            });
            report += '\n';
          }
        } else if (match.teamSearchError) {
          report += `### ${match.time} ${match.league}\n`;
          report += `⚠️ 球队搜索失败: ${match.teamSearchError}\n\n`;
        }
      }
      
      if (!hasTeamInfo) {
        report += '⚠️ 未找到相关球队信息\n';
        report += '**建议**:\n';
        report += '1. 手动提供球队名称进行搜索\n';
        report += '2. 检查联赛名称是否准确\n';
        report += '3. 球队可能不在新球体育数据库中\n\n';
      }
      
      // 添加使用说明
      report += '### 💡 球队ID使用说明\n';
      report += '获取到的球队ID可用于:\n';
      report += '1. **查询球队详情**: 访问球队主页获取完整信息\n';
      report += '2. **查看赛程**: 获取球队未来比赛安排\n';
      report += '3. **数据分析**: 获取球队历史数据和统计\n';
      report += '4. **赔率跟踪**: 结合赔率变化进行深度分析\n\n';
      
      report += '**示例链接**:\n';
      const firstMatchWithTeam = analysis.significantChanges.find(item => 
        item.match.mainTeamId
      );
      if (firstMatchWithTeam) {
        const teamId = firstMatchWithTeam.match.mainTeamId;
        report += `- 球队主页: https://zq.titan007.com/cn/team/Summary/${teamId}.html\n`;
        report += `- 球队赛程: https://zq.titan007.com/cn/team/Schedule/${teamId}.html\n`;
        report += `- 球队数据: https://zq.titan007.com/cn/team/Data/${teamId}.html\n`;
      }
    }
    
    report += '\n---\n';
    report += '*数据来源: sgodds.com (赔率) + 新球体育(titan007.com) (球队信息)*\n';
    report += `*分析时间: ${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}*`;
    
    return report;
  }

  /**
   * 批量分析多个赔率数据集
   * @param {Array<Object>} datasets - 数据集数组 [{data: '赔率数据', teamNames: ['球队1', '球队2']}]
   * @returns {Promise<Array<Object>>} 分析结果数组
   */
  async batchAnalyze(datasets) {
    const results = [];
    
    for (let i = 0; i < datasets.length; i++) {
      const dataset = datasets[i];
      console.log(`分析数据集 ${i + 1}/${datasets.length}...`);
      
      try {
        const result = await this.analyzeWithTeamInfo(
          dataset.data,
          dataset.teamNames
        );
        results.push(result);
      } catch (error) {
        console.error(`分析数据集 ${i + 1} 时出错:`, error);
        results.push({
          error: error.message,
          datasetIndex: i
        });
      }
      
      // 避免请求过于频繁
      await this.sleep(1000);
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
  module.exports = IntegratedOddsAnalysis;
}

// 如果直接运行，提供示例
if (require.main === module) {
  (async () => {
    console.log('=== 集成赔率分析示例 ===\n');
    
    // 示例赔率数据（简化版）
    const exampleOddsData = `Thu, 9 Apr 2026

 08:00
Sudamericana Cup
3.30 +20.0%
3.00 +13.2%
2.03 -21.9%

 08:00
Libertadores Cup
2.50
2.55 -5.6%
3.00 +5.3%

 11:00
N America Champions
1.17 -12.0%
5.80 +31.8%
10.00 +33.3%`;

    // 创建分析器
    const analyzer = new IntegratedOddsAnalysis({
      oddsOptions: {
        threshold: 10,
        excludeWomen: true
      },
      teamOptions: {
        // 使用默认配置
      },
      enableTeamSearch: true
    });

    // 执行分析
    console.log('执行赔率分析...\n');
    const result = await analyzer.analyzeWithTeamInfo(exampleOddsData, ['科尔多瓦学院']);
    
    // 输出报告
    console.log(result.report);
    
    // 输出摘要
    console.log('\n=== 分析摘要 ===');
    console.log(`总比赛数: ${result.summary.totalMatches}`);
    console.log(`显著变化: ${result.summary.matchesWithChanges}`);
    console.log(`有球队信息: ${result.summary.matchesWithTeamInfo}`);
    console.log(`分析时间: ${result.summary.timestamp}`);
    
  })().catch(console.error);
}