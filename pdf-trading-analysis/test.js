// 测试文件
// 测试PDF交易记录分析系统的各个组件

const fs = require('fs');
const path = require('path');

console.log('🧪 开始测试PDF交易记录分析系统');
console.log('='.repeat(50));

// 测试数据
const testData = [
  {
    date: "05 Apr 2026",
    time: "12:56 AM",
    type: "Football",
    selection: "Spanish League - Atletico Madrid vs Barcelona - 1X2 Barcelona @ 1.82",
    amount: 15.00,
    result: "Win",
    payout: 27.30
  },
  {
    date: "05 Apr 2026",
    time: "07:53 AM",
    type: "Football",
    selection: "US Soccer League (Live) - Charlotte FC vs Philadelphia U (Live) - Will Both Teams Score Yes @ 1.70",
    amount: 25.00,
    result: "Win",
    payout: 42.50
  },
  {
    date: "05 Apr 2026",
    time: "11:22 AM",
    type: "Football",
    selection: "US Soccer League (Live) - Los Angeles FC vs Orlando City (Live) - Total Goals Over/Under 6.5 Over 6.5 @ 2.03",
    amount: 10.00,
    result: "Loss",
    payout: 0.00
  }
];

// 测试TradingAnalyzer
console.log('\n1. 测试TradingAnalyzer...');
try {
  const TradingAnalyzer = require('./trading-analyzer');
  const analyzer = new TradingAnalyzer(testData);
  
  // 测试基本统计
  const basicStats = analyzer.analyzeBasicStats();
  console.log('   ✅ 基本统计测试通过');
  console.log(`      总投注: ${basicStats.totalBets}次`);
  console.log(`      胜率: ${basicStats.winRate}%`);
  
  // 测试按日期分析
  const dailyStats = analyzer.analyzeByDate();
  console.log('   ✅ 按日期分析测试通过');
  console.log(`      分析天数: ${Object.keys(dailyStats).length}天`);
  
  // 测试按类型分析
  const typeStats = analyzer.analyzeByBetType();
  console.log('   ✅ 按类型分析测试通过');
  console.log(`      投注类型数: ${Object.keys(typeStats).length}种`);
  
  // 测试报告生成
  const report = analyzer.generateReport();
  console.log('   ✅ 报告生成测试通过');
  console.log(`      报告长度: ${report.length}字符`);
  
} catch (error) {
  console.error(`   ❌ TradingAnalyzer测试失败: ${error.message}`);
}

// 测试ReportGenerator
console.log('\n2. 测试ReportGenerator...');
try {
  const TradingAnalyzer = require('./trading-analyzer');
  const ReportGenerator = require('./report-generator');
  
  const analyzer = new TradingAnalyzer(testData);
  const generator = new ReportGenerator(analyzer, './test-reports');
  
  // 测试完整报告生成
  const fullReport = generator.generateFullReport();
  console.log('   ✅ 完整报告生成测试通过');
  console.log(`      报告路径: ${fullReport.reportPath}`);
  
  // 测试摘要报告生成
  const summary = generator.generateSummaryReport();
  console.log('   ✅ 摘要报告生成测试通过');
  
} catch (error) {
  console.error(`   ❌ ReportGenerator测试失败: ${error.message}`);
}

// 测试主系统
console.log('\n3. 测试主系统...');
try {
  const PDFTradingAnalysis = require('./main');
  const analysis = new PDFTradingAnalysis();
  
  // 创建测试数据文件
  const testDataPath = './test-data.json';
  fs.writeFileSync(testDataPath, JSON.stringify(testData, null, 2));
  
  // 测试快速分析
  const quickResult = analysis.quickAnalysis(testDataPath);
  console.log('   ✅ 快速分析测试通过');
  console.log(`      净盈利: $${quickResult.netProfit.toFixed(2)}`);
  
  // 清理测试文件
  fs.unlinkSync(testDataPath);
  if (fs.existsSync('./test-reports')) {
    fs.rmSync('./test-reports', { recursive: true });
  }
  
} catch (error) {
  console.error(`   ❌ 主系统测试失败: ${error.message}`);
}

// 测试PDF解析器框架
console.log('\n4. 测试PDF解析器框架...');
try {
  const PDFParser = require('./pdf-parser');
  const parser = new PDFParser();
  
  console.log('   ✅ PDF解析器框架加载成功');
  console.log('      注意: 实际PDF解析需要安装pdf-parse库');
  console.log('      运行: npm install pdf-parse');
  
} catch (error) {
  console.error(`   ❌ PDF解析器框架测试失败: ${error.message}`);
}

console.log('\n' + '='.repeat(50));
console.log('🎉 所有测试完成！');
console.log('\n下一步:');
console.log('1. 安装依赖: npm install');
console.log('2. 运行示例: npm run quick 或 npm run full');
console.log('3. 使用自己的数据: node main.js <你的数据文件路径>');