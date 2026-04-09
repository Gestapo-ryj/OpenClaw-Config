const OddsAnalyzer = require('./skills/odds-analyzer/scripts/analyze-odds.js');

// 原始文本数据
const rawText = `Wed, 8 Apr 2026 17:30J League D2/D3 100 Year Vision2.15 -12.2%2.70 -1.8%3.30 +24.5% 18:00Asian Champ 21.30 +1.6%4.40 7.00 -17.6%23:15Russian Cup2.50 3.20 2.35 23:55Saudi League5.20 -13.3%3.80 1.50 +3.4%
 Thu, 9 Apr 2026 00:45UE Europe2.40 3.00 -3.2%2.70 +3.8%01:45Russian Cup2.05 3.10 3.00 02:00Saudi League1.13 -1.7%7.00 +7.7%11.00 02:00Saudi League1.63 +6.5%3.70 -5.1%4.10 -14.6% 03:00UE Champions1.65 4.10 +10.8%3.70 -7.5% 03:00UE Champions1.42 -2.1%4.40 -2.2%5.00 +4.2%06:00Sudamericana Cup1.87 +1.1%2.85 -1.7%4.20 06:00Libertadores Cup2.40 2.70 -1.8%3.00 +1.7%06:00Sudamericana Cup4.30 +2.4%3.05 +1.7%1.77 -2.7% 06:00Sudamericana Cup2.35 -4.1%2.65 3.10 +5.1% 06:00Libertadores Cup2.00 -4.8%2.95 +3.5%3.50 +2.9%08:00Sudamericana Cup2.95 +7.3%2.70 +1.9%2.40 -7.7%08:00Libertadores Cup2.50 2.70 2.85 08:30Libertadores Cup4.10 +7.9%3.20 +3.2%1.77 -5.3%08:30Libertadores Cup4.20 +2.4%3.10 1.77 -1.7% 09:00N America Champions1.55 -8.8%3.60 +16.1%5.20 +10.6%10:00Sudamericana Cup3.70 3.10 1.87 10:00Libertadores Cup2.25 -2.2%2.95 +1.7%2.95 +1.7% 11:00N America Champions1.30 -2.3%4.50 +2.3%8.00 +6.7%22:00Indian S League2.55 2.95 2.40
 Fri, 10 Apr 202600:00Saudi League6.00 -7.7%4.40 +2.3%1.37 00:45UE Conference1.95 -1.0%3.00 -1.6%3.70 +5.7%02:00Saudi League2.05 +2.5%3.40 -2.9%2.90 -1.7% 03:00UE Conference2.45 3.20 +3.2%2.50 -2.0% 03:00UE Conference2.00 +1.5%3.30 3.20 03:00UE Europe2.03 -1.0%3.05 -1.6%3.30 +3.1% 03:00UE Europe2.95 +5.4%3.05 -1.6%2.20 -2.2% 03:00UE Conference1.65 -2.9%3.40 +3.0%4.50 +4.7% 03:00UE Europe2.20 3.05 2.95 06:00Libertadores Cup1.72 3.10 4.50 06:00Sudamericana Cup2.10 3.10 3.10 08:00Libertadores Cup2.75 2.70 2.55 08:30Sudamericana Cup3.20 2.90 2.15 10:00Libertadores Cup2.03 +3.0%2.90 3.50 -5.4% 17:35A League2.75 3.30 2.20 Sat, 11 Apr 2026 01:00French League3.40 3.50 1.90 02:00Dutch League1.17 6.00 9.50 02:30German League3.10 +3.3%3.50 +2.9%2.00 -1.5% 02:45Italian League1.28 -1.5%4.50 +2.3%9.50 +5.6% 03:00English Premier1.75 -2.8%3.40 3.80 03:00English League Champ2.15 3.10 3.00 03:00Spanish League1.23 -1.6%5.20 8.50 -5.6% 03:05French League1.22 5.20 11.00 12:00J League 100 Year Vision2.45 2.90 2.55 13:00A League1.97 3.60 2.95 13:00J League 100 Year Vision2.35 2.95 2.65 13:00J League 100 Year Vision1.53 3.50 4.80 13:00J League 100 Year Vision2.75 2.80 2.35 14:00J League 100 Year Vision1.87 3.10 3.50 14:00J League 100 Year Vision2.85 3.10 2.10 15:00A League2.00 3.70 2.85 15:00J League 100 Year Vision1.82 3.30 3.40 15:00J League 100 Year Vision2.15 -2.3%3.10 2.75 17:35A League2.40 3.50 2.40 19:30English Premier1.40 +2.2%4.20 -4.5%6.00 -7.7%19:30English League Champ1.10 8.50 12.00 19:30English League Champ2.75 3.40 2.15 19:30English League Champ2.20 3.10 2.85 20:00Norwegian League1.55 +1.3%3.60 -7.7%5.00 +4.2% 20:00Spanish League1.70 3.40 4.20 21:00Italian League1.85 +1.6%3.10 4.00 21:00Italian League2.10 +2.4%2.85 -1.7%3.40 21:00Swedish League1.35 4.40 6.50 21:00Swedish League2.60 3.20 2.35 21:00Swedish League2.20 -12.0%2.85 +3.6%3.10 +10.7% 21:30German League2.40 3.30 2.50 21:30German League2.90 -1.7%3.20 2.15 +2.4% 21:30German League1.92 3.50 -2.8%3.20 +3.2% 21:30German League1.45 -2.0%4.20 +2.4%5.20 +4.0% 22:00English Premier2.05 -2.4%3.10 3.20 +3.2% 22:00English Premier4.10 3.70 1.65 22:00English League Champ2.30 3.00 2.80 22:00English League Champ2.00 3.30 3.10 22:00English League Champ2.05 3.10 3.20 22:00English League Champ1.50 3.80 5.20 22:00English League Champ1.80 +4.7%3.60 -2.7%3.60 -2.7% 22:00English League Champ1.70 -2.9%3.40 -2.9%4.10 +7.9%22:00English League Champ2.45 3.00 2.60 22:00Norwegian League1.35 4.40 7.00 22:30Dutch League1.60 3.40 5.00 Sun, 12 Apr 2026 00:00Italian League1.37 4.20 7.00 00:00Norwegian League3.10 3.80 1.85 00:30English Premier1.53 +5.5%3.90 -7.1%4.70 -6.0% 00:30German League7.50 4.50 -4.3%1.33 +2.3% 00:30Spanish League1.22 +1.7%6.00 8.00 -11.1% 00:45Dutch League3.50 3.80 1.80 01:00French League2.03 3.05 3.30 01:00US Soccer League2.05 3.20 3.05 02:00Dutch League1.82 3.70 3.40 02:30US Soccer League2.50 3.20 2.45 02:30US Soccer League2.05 -6.8%3.40 +3.0%2.95 +7.3% 02:45Italian League2.85 -1.7%3.10 2.20 03:00Dutch League4.80 3.90 1.53 03:00Spanish League3.10 2.90 2.20 03:05French League1.35 4.30 7.50 04:30US Soccer League4.10 3.70 1.65 07:30US Soccer League1.45 3.80 6.00 07:30US Soccer League1.63 3.70 4.20 07:30US Soccer League2.20 2.90 3.10 07:30US Soccer League1.95 3.10 3.50 08:30US Soccer League2.00 3.40 3.05 08:30US Soccer League3.40 3.60 1.82 08:30US Soccer League1.55 3.80 4.70 13:00A League1.63 3.60 4.40 13:00J League 100 Year Vision1.75 3.00 4.10 15:00J League 100 Year Vision2.65 3.20 2.20 17:00A League2.95 3.40 2.03 18:15Dutch League2.35 3.40 2.50 18:30Italian League2.05 3.10 3.20 19:00English League Champ2.00 3.30 3.10 20:30Dutch League2.10 3.60 2.70 20:30Dutch League2.05 3.50 2.85 20:30Norwegian League2.20 3.30 2.75 21:00English Premier2.75 +3.8%3.30 +3.1%2.20 -4.3% 21:00English Premier2.50 3.05 2.50 21:00English Premier2.40 -4.0%3.20 2.55 +4.1%21:00Italian League5.20 3.50 1.55 21:30German League2.15 3.10 2.95 23:15French League2.80 3.00 2.30 23:15French League2.00 +2.6%2.90 3.80 23:30English Premier2.85 3.60 +2.9%2.03 -1.0% 23:30German League1.42 4.10 6.00 Mon, 13 Apr 202600:00Italian League1.77 3.05 4.30 01:30German League2.20 2.80 3.20 02:45French League1.63 3.50 4.50 02:45Italian League3.00 3.20 2.10 Tue, 14 Apr 202602:45Italian League2.20 2.90 3.10 03:00English Premier1.50 -2.0%4.00 +2.6%4.80 Last Updated on 2026-04-08 19:00:05`;

// 预处理文本
function preprocessText(text) {
  // 在日期模式后添加换行符
  let processed = text.replace(/(Mon|Tue|Wed|Thu|Fri|Sat|Sun), \d+ (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) \d{4}/g, '\n$&');
  // 在每个时间模式前添加换行符（HH:MM且前面不是冒号）
  processed = processed.replace(/(\s|^)(\d{2}:\d{2})/g, '\n$2');
  // 移除开头的空行
  return processed.trim();
}

const processedText = preprocessText(rawText);

// 创建自定义分析器来筛选今晚的比赛
class TonightOddsAnalyzer extends OddsAnalyzer {
  constructor(options = {}) {
    super(options);
    this.currentTime = options.currentTime || '19:09'; // 当前时间
    this.tonightStart = options.tonightStart || '19:00'; // 今晚开始时间
    this.tonightEnd = options.tonightEnd || '04:00'; // 今晚结束时间（次日凌晨）
  }

  // 重写提取方法，筛选今晚比赛
  extractFromSgoddsText(text) {
    const matches = [];
    const lines = text.split('\n');
    
    let currentDate = null;
    let currentTime = null;
    let currentLeague = null;
    let currentDateObj = null; // 存储日期对象
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // 检测日期行
      const dateMatch = line.match(/(Mon|Tue|Wed|Thu|Fri|Sat|Sun),?\s+(\d+)\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{4})/);
      if (dateMatch) {
        currentDate = line;
        // 解析日期
        const dateStr = `${dateMatch[2]} ${dateMatch[3]} ${dateMatch[4]}`;
        currentDateObj = new Date(dateStr);
        continue;
      }
      
      // 如果没有日期，跳过
      if (!currentDateObj) {
        continue;
      }
      
      // 检测时间行
      const timeMatch = line.match(/(\d{1,2}:\d{2})([A-Za-z].*)/);
      if (timeMatch) {
        currentTime = timeMatch[1];
        
        // 计算比赛时间
        const matchHour = parseInt(currentTime.split(':')[0]);
        const matchMinute = parseInt(currentTime.split(':')[1]);
        
        // 创建比赛时间对象
        const matchDate = new Date(currentDateObj);
        matchDate.setHours(matchHour, matchMinute, 0, 0);
        
        // 计算当前时间
        const now = new Date();
        const [currentHour, currentMinute] = this.currentTime.split(':').map(Number);
        now.setHours(currentHour, currentMinute, 0, 0