// 使用 OddsAnalyzer，但预处理文本
const OddsAnalyzer = require('./skills/odds-analyzer/scripts/analyze-odds.js');

// 原始文本
const rawText = `Wed, 8 Apr 2026 06:00Libertadores Cup5.20 +4.0%3.40 1.58 -1.3% 06:00Libertadores Cup1.45 3.90 +2.6%6.00 -7.7% 06:00Sudamericana Cup4.80 +11.6%3.60 +2.9%1.58 -4.2% 06:00Sudamericana Cup2.25 +25.0%2.95 -4.8%2.95 -26.3% 08:00N America Champions2.10 -12.5%2.95 -1.7%3.20 +18.5% 08:00Mexican League2.75 -9.8%3.10 2.30 +9.5% 08:00Libertadores Cup3.00 +5.3%2.90 +3.6%2.25 -6.3% 08:00Sudamericana Cup2.55 +8.5%2.90 +3.6%2.60 -11.9% 08:30Libertadores Cup3.30 +6.5%2.90 2.10 -4.5%08:30Sudamericana Cup5.80 +11.5%3.40 +3.0%1.53 -4.4% 10:00N America Champions1.72 -18.1%3.30 +6.5%4.00 +31.1%10:00Libertadores Cup1.87 -15.0%2.90 +11.5%4.10 +17.1%10:00Sudamericana Cup4.00 +11.1%2.95 +5.4%1.87 -8.8% 17:30J League D2/D3 100 Year Vision2.50 +2.0%2.70 -1.8%2.65 23:55Saudi League5.50 -8.3%3.90 +2.6%1.45
 Thu, 9 Apr 2026 00:45UE Europe2.40 3.05 -1.6%2.65 +1.9% 02:00Saudi League1.15 7.00 +7.7%10.00 -9.1%02:00Saudi League1.60 +4.6%3.70 -5.1%4.20 -12.5% 03:00UE Champions1.65 3.80 +2.7%3.90 -2.5% 03:00UE Champions1.48 +2.1%4.30 -4.4%4.70 -2.1%06:00Sudamericana Cup1.85 2.90 4.20 06:00Libertadores Cup2.35 -2.1%2.75 3.00 +1.7%06:00Sudamericana Cup4.30 +2.4%3.05 +1.7%1.77 -2.7% 06:00Sudamericana Cup2.45 2.65 2.95 06:00Libertadores Cup2.10 2.80 -1.8%3.50 +2.9%08:00Sudamericana Cup2.85 +3.6%2.65 2.55 -1.9%08:00Libertadores Cup2.50 2.70 2.85 08:30Libertadores Cup3.80 3.10 1.87 08:30Libertadores Cup4.20 +2.4%3.10 1.77 -1.7% 09:00N America Champions1.60 -5.9%3.40 +9.7%5.00 +6.4%10:00Sudamericana Cup3.70 3.05 -1.6%1.90 +1.6%10:00Libertadores Cup2.30 2.90 2.90 11:00N America Champions1.30 -2.3%4.50 +2.3%8.00 +6.7%Fri, 10 Apr 202600:00Saudi League6.00 -7.7%4.40 +2.3%1.37 00:45UE Conference2.00 +1.5%3.05 3.50 02:00Saudi League2.05 +2.5%3.50 2.85 -3.4% 03:00UE Conference2.45 3.10 2.55 03:00UE Conference1.95 -1.0%3.30 3.30 +3.1% 03:00UE Europe2.05 3.10 3.20 03:00UE Europe2.80 3.00 -3.2%2.30 +2.2% 03:00UE Conference1.70 3.30 4.30 03:00UE Europe2.15 -2.3%3.05 3.05 +3.4%Sat, 11 Apr 2026 02:30German League3.05 +1.7%3.40 2.00 -1.5% 03:00English Premier1.75 -2.8%3.40 3.80 19:30English Premier1.40 +2.2%4.10 -6.8%6.00 -7.7% 21:30German League2.40 3.30 2.50 21:30German League2.90 -1.7%3.20 2.15 +2.4% 21:30German League1.92 3.50 -2.8%3.20 +3.2% 21:30German League1.45 -2.0%4.20 +2.4%5.20 +4.0% 22:00English Premier2.05 -2.4%3.10 3.20 +3.2% 22:00English Premier4.10 3.70 1.65 Sun, 12 Apr 2026 00:30English Premier1.53 +5.5%3.90 -7.1%4.70 -6.0% 00:30German League7.50 4.70 1.30 21:00English Premier2.75 +3.8%3.30 +3.1%2.20 -4.3% 21:00English Premier2.50 3.05 2.50 21:00English Premier2.40 -4.0%3.20 2.55 +4.1% 21:30German League2.15 3.10 2.95 23:30English Premier2.85 3.60 +2.9%2.03 -1.0% 23:30German League1.42 4.10 6.00 Mon, 13 Apr 2026 01:30German League2.20 2.80 3.20 Tue, 14 Apr 2026 03:00English Premier1.50 -2.0%4.00 +2.6%4.80 Last Updated on 2026-04-08 06:50:24`;

// 预处理：在每个时间模式前添加换行符，但保留日期行
function preprocessText(text) {
  // 首先，在日期模式后添加换行符
  let processed = text.replace(/(Mon|Tue|Wed|Thu|Fri|Sat|Sun), \d+ (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) \d{4}/g, '\n$&');
  // 在每个时间模式前添加换行符（HH:MM且前面不是冒号）
  processed = processed.replace(/(\s|^)(\d{2}:\d{2})/g, '\n$2');
  // 移除开头的空行
  return processed.trim();
}

const processedText = preprocessText(rawText);
console.log('Processed text (first 500 chars):', processedText.substring(0, 500));

const analyzer = new OddsAnalyzer({ threshold: 10, excludeWomen: true });
const report = analyzer.quickAnalyze(processedText);
console.log('\n\n' + report);