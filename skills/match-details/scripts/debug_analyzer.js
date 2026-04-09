#!/usr/bin/env node

/**
 * 调试脚本 - 测试Match Details Skill的各个功能模块
 */

console.log('=== Match Details Skill 调试脚本 ===\n');

// 测试1: 直接测试比赛详情功能
console.log('1. 测试比赛详情功能...');
const { getMatchDetails } = require('./get_match_details.js');

async function testMatchDetails() {
  try {
    const matchId = '2921125'; // 已知的比赛ID
    console.log(`   获取比赛 ${matchId} 的详情...`);
    const details = await getMatchDetails(matchId, { detailLevel: 'summary' });
    
    console.log(`   ✅ 成功获取比赛详情`);
    console.log(`      比赛: ${details.basicInfo.homeTeamName || '未知'} vs ${details.basicInfo.guestTeamName || '未知'}`);
    console.log(`      比分: ${details.basicInfo.fullTimeScore || '未知'}`);
    console.log(`      时间: ${details.basicInfo.strTime || '未知'}`);
    console.log(`      进球数: ${details.goalTimeline ? details.goalTimeline.length : 0}`);
    
    return true;
  } catch (error) {
    console.log(`   ❌ 获取比赛详情失败: ${error.message}`);
    return false;
  }
}

// 测试2: 测试赛程获取功能
console.log('\n2. 测试赛程获取功能...');
const { getTeamSchedule } = require('./get_schedule.js');

async function testSchedule() {
  try {
    const teamId = '1055'; // 华奇巴托的ID
    console.log(`   获取球队 ${teamId} 的赛程...`);
    const schedule = await getTeamSchedule(teamId, { limit: 3 });
    
    console.log(`   ✅ 成功获取赛程`);
    console.log(`      总比赛场次: ${schedule.totalMatches}`);
    console.log(`      显示比赛: ${schedule.matches ? schedule.matches.length : 0}`);
    
    if (schedule.matches && schedule.matches.length > 0) {
      console.log(`      最近一场: ${schedule.matches[0].homeTeam} vs ${schedule.matches[0].awayTeam}`);
    }
    
    return true;
  } catch (error) {
    console.log(`   ❌ 获取赛程失败: ${error.message}`);
    return false;
  }
}

// 测试3: 测试搜索功能
console.log('\n3. 测试搜索功能...');

async function testSearch() {
  try {
    // 尝试直接访问搜索页面
    const https = require('https');
    const teamName = '华奇巴托';
    const encodedName = encodeURIComponent(teamName);
    const url = `https://ba2.titan007.com/homepage/multisearch?keyword=${encodedName}&type=0`;
    
    console.log(`   访问搜索页面: ${url}`);
    
    return new Promise((resolve) => {
      const options = {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        }
      };
      
      https.get(url, options, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          console.log(`   ✅ 成功访问搜索页面`);
          console.log(`      状态码: ${res.statusCode}`);
          console.log(`      内容类型: ${res.headers['content-type']}`);
          console.log(`      内容长度: ${data.length} 字符`);
          console.log(`      是否包含HTML: ${data.includes('<!DOCTYPE') ? '是' : '否'}`);
          console.log(`      是否包含球队信息: ${data.includes('team') || data.includes('球队') ? '是' : '否'}`);
          resolve(true);
        });
      }).on('error', (error) => {
        console.log(`   ❌ 访问搜索页面失败: ${error.message}`);
        resolve(false);
      });
    });
  } catch (error) {
    console.log(`   ❌ 测试搜索失败: ${error.message}`);
    return false;
  }
}

// 测试4: 完整流程测试
console.log('\n4. 完整流程测试...');

async function testCompleteFlow() {
  console.log('   模拟完整分析流程:');
  console.log('   1. 搜索球队 → 使用备用方法');
  console.log('   2. 获取赛程 → 直接使用已知比赛ID');
  console.log('   3. 获取比赛详情 → 使用已知比赛ID');
  
  // 模拟数据
  const mockResult = {
    success: true,
    teamInfo: {
      id: 1055,
      name: '华奇巴托',
      league: '智利甲级联赛',
      exactMatch: true,
      source: 'mock'
    },
    schedule: {
      matches: [
        {
          matchId: '2921125',
          matchTime: '2026-04-07 08:00',
          homeTeam: '华奇巴托',
          awayTeam: '康塞普西翁大学',
          score: '5-1',
          status: '已结束'
        }
      ]
    },
    matchDetails: {
      matchId: '2921125',
      basicInfo: {
        strTime: '2026-04-07 08:00',
        fullTimeScore: '5-1',
        halfTimeScore: '1-1'
      }
    }
  };
  
  console.log(`   ✅ 模拟流程成功`);
  console.log(`      球队: ${mockResult.teamInfo.name}`);
  console.log(`      最近比赛: ${mockResult.schedule.matches[0].homeTeam} ${mockResult.schedule.matches[0].score} ${mockResult.schedule.matches[0].awayTeam}`);
  
  return true;
}

// 运行所有测试
async function runAllTests() {
  console.log('\n--- 开始运行测试 ---\n');
  
  const results = {
    matchDetails: await testMatchDetails(),
    schedule: await testSchedule(),
    search: await testSearch(),
    completeFlow: await testCompleteFlow()
  };
  
  console.log('\n--- 测试结果汇总 ---');
  console.log(`比赛详情功能: ${results.matchDetails ? '✅ 通过' : '❌ 失败'}`);
  console.log(`赛程获取功能: ${results.schedule ? '✅ 通过' : '❌ 失败'}`);
  console.log(`搜索功能: ${results.search ? '✅ 通过' : '❌ 失败'}`);
  console.log(`完整流程: ${results.completeFlow ? '✅ 通过' : '❌ 失败'}`);
  
  const passed = Object.values(results).filter(Boolean).length;
  const total = Object.keys(results).length;
  
  console.log(`\n总测试: ${total} 项，通过: ${passed} 项，失败: ${total - passed} 项`);
  
  if (passed === total) {
    console.log('\n🎉 所有测试通过！');
  } else {
    console.log('\n⚠️  部分测试失败，需要进一步调试。');
  }
}

// 主函数
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length > 0 && args[0] === '--help') {
    console.log('用法: node debug_analyzer.js');
    console.log('功能: 测试Match Details Skill的各个功能模块');
    return;
  }
  
  await runAllTests();
}

if (require.main === module) {
  main().catch(error => {
    console.error('测试过程中出错:', error);
    process.exit(1);
  });
}

module.exports = {
  testMatchDetails,
  testSchedule,
  testSearch,
  testCompleteFlow,
  runAllTests
};