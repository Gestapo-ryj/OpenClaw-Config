// 分析投注交易历史
const bettingData = [
  // 4月5日
  { date: "05 Apr 2026", time: "12:56 AM", type: "Football", selection: "Spanish League - Atletico Madrid vs Barcelona - 1X2 Barcelona @ 1.82", amount: 15.00, result: "Win", payout: 27.30 },
  { date: "05 Apr 2026", time: "07:53 AM", type: "Football", selection: "US Soccer League (Live) - Charlotte FC vs Philadelphia U (Live) - Will Both Teams Score Yes @ 1.70", amount: 25.00, result: "Win", payout: 42.50 },
  { date: "05 Apr 2026", time: "07:57 AM", type: "Football", selection: "US Soccer League (Live) - Atlanta Utd vs Columbus Crew (Live) - Will Both Teams Score Yes @ 1.95", amount: 13.00, result: "Win", payout: 25.35 },
  { date: "05 Apr 2026", time: "11:13 AM", type: "Football", selection: "US Soccer League (Live) - LA Galaxy vs Minnesota Utd (Live) - Will Both Teams Score Yes @ 2.20", amount: 10.00, result: "Win", payout: 22.00 },
  { date: "05 Apr 2026", time: "11:22 AM", type: "Football", selection: "US Soccer League (Live) - Los Angeles FC vs Orlando City (Live) - Total Goals Over/Under 6.5 Over 6.5 @ 2.03", amount: 10.00, result: "Loss", payout: 0.00 },
  { date: "05 Apr 2026", time: "07:46 PM", type: "Football", selection: "German League Div 2 (Live) - Greuther Furth vs Paderborn (Live) - Will Both Teams Score Yes @ 1.67", amount: 25.00, result: "Loss", payout: 0.00 },
  { date: "05 Apr 2026", time: "08:49 PM", type: "Football", selection: "German League Div 2 (Live) - Hannover vs Elversberg (Live) - Total Goals Over/Under 3.5 Under 3.5 @ 1.42", amount: 20.00, result: "Win", payout: 28.40 },
  { date: "05 Apr 2026", time: "08:58 PM", type: "Football", selection: "Chinese League (Live) - Tianjin Jinmen vs Shenhua (Live) - Total Goals Over/Under 4.5 Under 4.5 @ 1.40", amount: 12.00, result: "Loss", payout: 0.00 },
  { date: "05 Apr 2026", time: "09:04 PM", type: "Football", selection: "German League Div 2 (Live) - Greuther Furth vs Paderborn (Live) - Total Goals Over/Under 1.5 Under 1.5 @ 2.07", amount: 20.00, result: "Loss", payout: 0.00 },
  { date: "05 Apr 2026", time: "09:05 PM", type: "Football", selection: "Italian League (Live) - Cremonese vs Bologna (Live) - Total Goals Over/Under 3.5 Under 3.5 @ 1.60", amount: 20.00, result: "Win", payout: 32.00 },
  { date: "05 Apr 2026", time: "10:51 PM", type: "Football", selection: "English Cup - West Ham vs Leeds - Asian Handicap Leeds 0 @ 1.82", amount: 16.00, result: "Push", payout: 16.00 },
  
  // 4月6日
  { date: "06 Apr 2026", time: "07:12 AM", type: "Football", selection: "Chilean League (Live) - Univ de Chile vs La Serena (Live) - Total Goals Over/Under 2.5 Under 2.5 @ 1.45", amount: 15.00, result: "Loss", payout: 0.00 },
  { date: "06 Apr 2026", time: "01:31 PM", type: "Football", selection: "Dutch League Div 2 - FC Oss vs Jong Utrecht - 1X2 Jong Utrecht @ 2.15", amount: 10.00, result: "Loss", payout: 0.00 },
  { date: "06 Apr 2026", time: "01:35 PM", type: "Football", selection: "Dutch League Div 2 - FC Oss vs Jong Utrecht - 1X2 Jong Utrecht @ 2.15, Dutch League Div 2 - Helmond Sport vs Waalwijk - 1X2 Waalwijk @ 1.95", amount: 2.50, result: "Loss", payout: 0.00 },
  { date: "06 Apr 2026", time: "01:39 PM", type: "Football", selection: "Dutch League Div 2 - Helmond Sport vs Waalwijk - 1X2 Waalwijk @ 1.95, English League One - Northampton vs Wigan - 1X2 Wigan @ 2.20, English League One - AFC Wimbledon vs Luton - 1X2 Luton @ 2.05", amount: 1.50, result: "Loss", payout: 0.00 },
  { date: "06 Apr 2026", time: "05:39 PM", type: "Football", selection: "Italian League - Udinese vs Como - Will Both Teams Score Yes @ 1.85", amount: 20.00, result: "Loss", payout: 0.00 },
  { date: "06 Apr 2026", time: "07:36 PM", type: "Football", selection: "Italian League Div 2 (Live) - Cesena vs Sudtirol (Live) - Total Goals Over/Under 3.5 Under 3.5 @ 1.49", amount: 20.00, result: "Win", payout: 29.80 },
  { date: "06 Apr 2026", time: "07:38 PM", type: "Football", selection: "English League Champ - Millwall vs Norwich - Will Both Teams Score Yes @ 1.67", amount: 20.00, result: "Win", payout: 33.40 },
  { date: "06 Apr 2026", time: "07:54 PM", type: "Football", selection: "Dutch League Div 2 (Live) - Helmond Sport vs Waalwijk (Live) - Total Goals Over/Under 4.5 Over 4.5 @ 1.77", amount: 10.00, result: "Loss", payout: 0.00 },
  { date: "06 Apr 2026", time: "08:01 PM", type: "Football", selection: "Italian League (Live) - Udinese vs Como (Live) - Total Goals Over/Under 0.5 Under 0.5 @ 2.00", amount: 13.00, result: "Win", payout: 26.00 },
  { date: "06 Apr 2026", time: "09:17 PM", type: "Football", selection: "Italian League (Live) - Lecce vs Atalanta (Live) - 1X2 Atalanta @ 1.75", amount: 15.00, result: "Win", payout: 26.25 },
  { date: "06 Apr 2026", time: "09:49 PM", type: "Football", selection: "Dutch League Div 2 (Live) - Almere vs Den Bosch (Live) - Total Goals Over/Under 3.5 Under 3.5 @ 1.60", amount: 20.00, result: "Win", payout: 32.00 },
  { date: "06 Apr 2026", time: "11:15 PM", type: "Football", selection: "Norwegian League (Live) - Hamarkameratene vs SK Brann (Live) - Will Both Teams Score Yes @ 1.90", amount: 15.00, result: "Win", payout: 28.50 },
  { date: "06 Apr 2026", time: "11:16 PM", type: "Football", selection: "English League Champ (Live) - Derby vs Stoke City (Live) - Will Both Teams Score No @ 1.45", amount: 15.00, result: "Win", payout: 21.75 },
  
  // 4月7日
  { date: "07 Apr 2026", time: "12:58 AM", type: "Football", selection: "French League Div 2 - Le Mans vs Pau - 1X2 Le Mans @ 1.63", amount: 17.00, result: "Win", payout: 27.71 },
  { date: "07 Apr 2026", time: "08:07 AM", type: "Football", selection: "Argentine League - Instituto ACC vs Defensa - Will Both Teams Score Yes @ 2.10", amount: 10.00, result: "Loss", payout: 0.00 },
  { date: "07 Apr 2026", time: "09:09 AM", type: "Football", selection: "Chilean League (Live) - Huachipato vs Univ Concepcion (Live) - Total Goals Over/Under 3.5 Under 3.5 @ 1.55", amount: 15.00, result: "Loss", payout: 0.00 },
  
  // 4月8日
  { date: "08 Apr 2026", time: "07:29 AM", type: "Football", selection: "N America Champions - Nashville SC vs Club America - Will Both Teams Score Yes @ 1.82", amount: 12.00, result: "Loss", payout: 0.00 },
  { date: "08 Apr 2026", time: "07:29 AM", type: "Football", selection: "N America Champions - Nashville SC vs Club America - 1X2 Nashville SC @ 1.90", amount: 12.00, result: "Loss", payout: 0.00 },
  { date: "08 Apr 2026", time: "07:32 AM", type: "Football", selection: "Mexican League - Queretaro vs Juarez - Halftime Total Goals 1 Goal @ 2.45, N America Champions - Nashville SC vs Club America - Will Both Teams Score Yes @ 1.85", amount: 1.50, result: "Loss", payout: 0.00 },
  { date: "08 Apr 2026", time: "07:32 AM", type: "Football", selection: "Mexican League - Queretaro vs Juarez - Halftime Total Goals 2 Goals @ 4.10, N America Champions - Nashville SC vs Club America - Will Both Teams Score Yes @ 1.85", amount: 1.50, result: "Loss", payout: 0.00 },
  { date: "08 Apr 2026", time: "07:51 AM", type: "Football", selection: "N America Champions - Los Angeles FC vs Cruz Azul - 1X2 Los Angeles FC @ 1.67", amount: 25.00, result: "Win", payout: 41.75 },
  { date: "08 Apr 2026", time: "03:19 PM", type: "Football", selection: "J League D2/D3 100 Year Vision - Tochigi SC vs V Hachinohe - 1X2 Tochigi SC @ 2.03", amount: 10.00, result: "Loss", payout: 0.00 },
  { date: "08 Apr 2026", time: "03:22 PM", type: "Football", selection: "N America Champions - Tigres UANL vs Seattle Sndrs - Total Goals Over/Under 2.5 Over 2.5 @ 1.77, J League D2/D3 100 Year Vision - Tochigi SC vs V Hachinohe - Halftime Total Goals 0 Goal @ 2.25", amount: 2.00, result: "Loss", payout: 0.00 },
  { date: "08 Apr 2026", time: "03:22 PM", type: "Football", selection: "J League D2/D3 100 Year Vision - Tochigi SC vs V Hachinohe - Halftime Total Goals 1 Goal @ 2.55, N America Champions - Tigres UANL vs Seattle Sndrs - Will Both Teams Score Yes @ 1.80", amount: 2.00, result: "Loss", payout: 0.00 },
  { date: "08 Apr 2026", time: "03:28 PM", type: "Football", selection: "J League D2/D3 100 Year Vision - Tochigi SC vs V Hachinohe - Halftime Total Goals 0 Goal @ 2.25, Russian Cup - Dinamo Moscow vs FC Krasnodar - Halftime Total Goals 0 Goal @ 3.20, Libertadores Cup - Mirassol vs Atletico Lanus - Will Both Teams Score Yes @ 2.05", amount: 1.50, result: "Loss", payout: 0.00 },
  
  // 4月9日
  { date: "09 Apr 2026", time: "10:17 AM", type: "Football", selection: "N America Champions (Live) - Tigres UANL vs Seattle Sndrs (Live) - Total Goals Over/Under 1.5 Under 1.5 @ 1.60", amount: 20.00, result: "Loss", payout: 0.00 },
  { date: "09 Apr 2026", time: "09:31 PM", type: "Football", selection: "UE Europe - Bologna vs Aston Villa - 1X2 Aston Villa @ 1.97", amount: 10.00, result: "Win", payout: 19.70 },
  { date: "09 Apr 2026", time: "09:32 PM", type: "Football", selection: "Saudi League - Damac vs Al Qadsiah (KSA) - Halftime Total Goals 0 Goal @ 3.40, UE Europe - Bologna vs Aston Villa - Total Goals Over/Under 2.5 Under 2.5 @ 1.67", amount: 1.50, result: "Loss", payout: 0.00 }
];

// 分析函数
function analyzeBettingHistory(data) {
  console.log('=== 投注历史分析报告（4月5日-4月11日）===');
  console.log(`分析时间: ${new Date().toLocaleString('zh-CN')}`);
  console.log('');
  
  // 基本统计
  const totalBets = data.length;
  const winningBets = data.filter(bet => bet.result === "Win").length;
  const losingBets = data.filter(bet => bet.result === "Loss").length;
  const pushBets = data.filter(bet => bet.result === "Push").length;
  
  const totalStake = data.reduce((sum, bet) => sum + bet.amount, 0);
  const totalPayout = data.reduce((sum, bet) => sum + bet.payout, 0);
  const netProfit = totalPayout - totalStake;
  const roi = ((netProfit / totalStake) * 100).toFixed(2);
  
  console.log('📊 基本统计');
  console.log(`总投注次数: ${totalBets}次`);
  console.log(`获胜次数: ${winningBets}次 (${((winningBets/totalBets)*100).toFixed(1)}%)`);
  console.log(`失败次数: ${losingBets}次 (${((losingBets/totalBets)*100).toFixed(1)}%)`);
  console.log(`平局次数: ${pushBets}次 (${((pushBets/totalBets)*100).toFixed(1)}%)`);
  console.log(`总投注金额: $${totalStake.toFixed(2)}`);
  console.log(`总回报金额: $${totalPayout.toFixed(2)}`);
  console.log(`净盈利: $${netProfit.toFixed(2)}`);
  console.log(`投资回报率: ${roi}%`);
  console.log('');
  
  // 按日期分析
  console.log('📅 按日期分析');
  const dailyStats = {};
  data.forEach(bet => {
    if (!dailyStats[bet.date]) {
      dailyStats[bet.date] = { bets: 0, stake: 0, payout: 0, wins: 0, losses: 0 };
    }
    dailyStats[bet.date].bets++;
    dailyStats[bet.date].stake += bet.amount;
    dailyStats[bet.date].payout += bet.payout;
    if (bet.result === "Win") dailyStats[bet.date].wins++;
    if (bet.result === "Loss") dailyStats[bet.date].losses++;
  });
  
  Object.entries(dailyStats).forEach(([date, stats]) => {
    const profit = stats.payout - stats.stake;
    const winRate = ((stats.wins / stats.bets) * 100).toFixed(1);
    console.log(`${date}: ${stats.bets}注，投注$${stats.stake.toFixed(2)}，回报$${stats.payout.toFixed(2)}，盈利$${profit.toFixed(2)}，胜率${winRate}%`);
  });
  console.log('');
  
  // 按投注类型分析
  console.log('🎯 按投注类型分析');
  const betTypeStats = {};
  data.forEach(bet => {
    // 提取投注类型
    let betType = "其他";
    const selection = bet.selection.toLowerCase();
    
