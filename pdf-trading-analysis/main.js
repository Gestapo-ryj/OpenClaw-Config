// 主入口文件
// 演示PDF交易记录复盘能力的完整流程

const fs = require('fs');
const path = require('path');

// 导入模块
const TradingAnalyzer = require('./trading-analyzer');
const ReportGenerator = require('./report-generator');

class PDFTradingAnalysis {
  constructor() {
    this.data = [];
    this.analyzer = null;
    this.generator = null;
  }

  // 加载数据
  loadData(dataPath) {
    try {
      const rawData = fs.readFileSync(dataPath, 'utf8');
      this.data = JSON.parse(rawData);
      console.log(`✅ 数据加载成功: ${this.data.length} 条记录`);
      return this.data;
    } catch (error) {
      console.error(`❌ 加载数据失败: ${error.message}`);
      throw error;
    }
  }

  // 初始化分析器
  initAnalyzer() {
    if (this.data.length === 0) {
      throw new Error('请先加载数据');
    }
    
    this.analyzer = new TradingAnalyzer(this.data);
    console.log('✅ 分析器初始化成功');
    return this.analyzer;
  }

  // 初始化报告生成器
  initReportGenerator(outputDir = './reports') {
    if (!this.analyzer) {
      throw new Error('请先初始化分析器');
    }
    
    this.generator = new ReportGenerator(this.analyzer, outputDir);
    console.log(`✅ 报告生成器初始化成功，输出目录: ${outputDir}`);
    return this.generator;
  }

  // 运行完整分析
  async runFullAnalysis(dataPath) {
    console.log('🚀 开始完整分析流程');
    console.log('='.repeat(50));
    
    try {
      // 1. 加载数据
      this.loadData(dataPath);
      
      // 2. 初始化分析器
      this.initAnalyzer();
      
      // 3. 生成基本分析
      console.log('\n📊 生成基本分析...');
      const basicStats = this.analyzer.analyzeBasicStats();
      console.log(`   总投注: ${basicStats.totalBets}次`);
      console.log(`   胜率: ${basicStats.winRate}%`);
      console.log(`   净盈利: $${basicStats.netProfit.toFixed(2)}`);
      console.log(`   ROI: ${basicStats.roi}%`);
      
      // 4. 按日期分析
      console.log('\n📅 按日期分析...');
      const dailyStats = this.analyzer.analyzeByDate();
      console.log(`   分析 ${Object.keys(dailyStats).length} 天的数据`);
      
      // 5. 按类型分析
      console.log('\n🎯 按投注类型分析...');
      const typeStats = this.analyzer.analyzeByBetType();
      console.log(`   发现 ${Object.keys(typeStats).length} 种投注类型`);
      
      // 6. 生成报告
      console.log('\n📝 生成报告...');
      this.initReportGenerator();
      const report = this.generator.generateFullReport();
      
      // 7. 生成摘要
      console.log('\n📋 生成摘要...');
      this.generator.generateSummaryReport();
      
      console.log('\n✅ 分析完成！');
      console.log(`   报告已保存到: ${path.resolve('./reports')}`);
      
      return {
        success: true,
        stats: { basicStats, dailyStats, typeStats },
        reportPath: report.reportPath
      };
      
    } catch (error) {
      console.error(`❌ 分析失败: ${error.message}`);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // 快速分析
  quickAnalysis(dataPath) {
    try {
      this.loadData(dataPath);
      this.initAnalyzer();
      
      const basicStats = this.analyzer.analyzeBasicStats();
      
      console.log('\n⚡ 快速分析结果');
      console.log('='.repeat(30));
      console.log(`总投注次数: ${basicStats.totalBets}次`);
      console.log(`获胜次数: ${basicStats.winningBets}次 (${basicStats.winRate}%)`);
      console.log(`总投注金额: $${basicStats.totalStake.toFixed(2)}`);
      console.log(`总回报金额: $${basicStats.totalPayout.toFixed(2)}`);
      console.log(`净盈利: $${basicStats.netProfit.toFixed(2)}`);
      console.log(`投资回报率: ${basicStats.roi}%`);
      
      if (basicStats.netProfit > 0) {
        console.log('🎉 总体盈利！');
      } else {
        console.log('⚠️  总体亏损，需要调整策略');
      }
      
      return basicStats;
    } catch (error) {
      console.error(`快速分析失败: ${error.message}`);
      throw error;
    }
  }
}

// 命令行接口
if (require.main === module) {
  const args = process.argv.slice(2);
  const analysis = new PDFTradingAnalysis();
  
  if (args.length === 0) {
    console.log('PDF交易记录复盘系统');
    console.log('===================\n');
    console.log('使用方法:');
    console.log('  node main.js <数据文件路径> [选项]');
    console.log('');
    console.log('选项:');
    console.log('  --quick     快速分析');
    console.log('  --full      完整分析（默认）');
    console.log('');
    console.log('示例:');
    console.log('  node main.js sample-data/sample-transactions.json --quick');
    console.log('  node main.js sample-data/sample-transactions.json --full');
    console.log('');
    
    // 默认运行示例
    console.log('运行示例分析...\n');
    analysis.runFullAnalysis('./sample-data/sample-transactions.json');
    
  } else {
    const dataPath = args[0];
    const option = args[1] || '--full';
    
    if (!fs.existsSync(dataPath)) {
      console.error(`错误: 文件不存在 ${dataPath}`);
      process.exit(1);
    }
    
    if (option === '--quick') {
      analysis.quickAnalysis(dataPath);
    } else {
      analysis.runFullAnalysis(dataPath);
    }
  }
}

module.exports = PDFTradingAnalysis;