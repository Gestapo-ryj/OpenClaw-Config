// 分析今天比赛赔率的脚本
const fs = require('fs');

// 从web_fetch获取的数据
const oddsData = `Fri, 10 Apr 2026

 08:00
Libertadores Cup
2.90 +5.5%
2.50 -7.4%
2.65 +3.9%

 08:30
Sudamericana Cup
3.00 -6.3%
2.80 -3.4%
2.30 +7.0%

 10:00
Libertadores Cup
2.05 +4.1%
2.85 -1.7%
3.50 -5.4%

 17:35
A League
2.70 -1.8%
3.30
2.20

18:30
Indian FB League
2.20 +2.3%
3.05 +1.7%
2.75 -3.5%

 19:30
Singapore Premier League
2.25
3.60
2.35

19:30
Indian S League
1.80 -1.1%
3.10
3.70 +2.8%

22:00
Indian S League
1.48
3.60 -2.7%
5.20 +4.0%

 Sat, 11 Apr 2026

 00:30
German League Div 2
1.95
3.40 -2.9%
3.20 +3.2%

 00:30
German League Div 2
2.80 -5.1%
3.40
2.10 +3.4%

 01:00
French League
3.30 -2.9%
3.40 -2.9%
1.92 +1.1%

 02:00
Dutch League
1.17
6.00
9.50

 02:00
French League Div 2
2.45 -3.9%
2.95
2.65 +3.9%

02:00
French League Div 2
4.10 +2.5%
3.30 +3.1%
1.75 -1.1%

02:00
French League Div 2
2.40 -5.9%
3.40 -2.9%
2.45 +8.9%

02:00
French League Div 2
1.65
3.50
4.30

02:00
French League Div 2
2.15
2.90
3.20

02:00
Dutch League Div 2
2.55
3.20
2.40

02:00
Dutch League Div 2
2.50
3.30
2.40

02:00
Dutch League Div 2
2.55 +2.0%
3.60
2.20 -2.2%

 02:00
Dutch League Div 2
1.70
3.80
3.70

 02:30
German League
3.05 +1.7%
3.40
2.00 -1.5%

 02:30
Spanish League Div 2
2.10 +6.6%
2.90 -6.5%
3.30 -2.9%

 02:30
Italian League Div 2
2.25 -4.3%
3.10 +3.3%
2.80 +1.8%

 02:45
Italian League
1.30
4.50 +2.3%
9.00

 03:00
English Premier
1.77 -1.7%
3.40
3.70 -2.6%

 03:00
English League Champ
2.15
3.10
2.95 -1.7%

 03:00
Spanish League
1.27 +1.6%
5.20
7.00 -22.2%

 03:05
French League
1.23 +0.8%
5.20
10.00 -9.1%

 08:00
Chilean League
1.95
3.30
3.30

08:00
Argentine League
1.67 +2.5%
3.00 -6.3%
5.20

09:00
Mexican League
2.25
3.20
2.75

11:06
Mexican League
1.77 +1.1%
3.40
3.80 -2.6%

 12:00
J League 100 Year Vision
2.45
2.90
2.55

 13:00
A League
1.97
3.60
2.95

 13:00
J League 100 Year Vision
2.35
2.95
2.65

 13:00
J League 100 Year Vision
1.53
3.50
5.00 +4.2%

 13:00
J League 100 Year Vision
2.70 -1.8%
2.85 +1.8%
2.35

 14:00
J League 100 Year Vision
1.87
3.05 -1.6%
3.50

 14:00
J League 100 Year Vision
2.90 +1.8%
3.10
2.10

 15:00
A League
2.05 +2.5%
3.70
2.75 -3.5%

 15:00
J League 100 Year Vision
1.85 +1.6%
3.20 -3.0%
3.40

 15:00
J League 100 Year Vision
2.20
3.05 -1.6%
2.75

 17:35
A League
2.40
3.50
2.40

19:00
German League Div 2
2.15 +4.9%
3.10 -3.1%
3.00 -3.2%

19:00
German League Div 2
2.00 +2.6%
3.50
3.05

 19:00
German League Div 2
1.67 -5.6%
3.80 +2.7%
3.80 +8.6%

 19:30
English Premier
1.40 +2.2%
4.20 -4.5%
6.00 -7.7%

19:30
English League Champ
1.10
8.50
12.00

 19:30
English League Champ
2.70 -1.8%
3.40
2.20 +2.3%

 19:30
English League Champ
2.15 -2.3%
3.10
2.95 +3.5%

19:30
English League One
1.70
3.80 +2.7%
3.70 -2.6%

19:30
English League One
1.50 +3.4%
3.70 -2.6%
5.50 -8.3%

19:30
English League One
1.50
3.90
4.80

 20:00
Norwegian League
1.50 -2.0%
3.80 -2.6%
5.20 +8.3%

 20:00
Spanish League
1.70
3.40
4.20

20:00
French League Div 2
3.20
2.95
2.10

20:00
French League Div 2
2.10
2.95
3.20

 21:00
Italian League
1.85 +1.6%
3.10
4.00

 21:00
Italian League
2.10 +2.4%
2.85 -1.7%
3.40

21:00
Swedish League
1.30 -3.7%
4.50 +2.3%
7.50 +15.4%

21:00
Swedish League
2.60
3.20
2.35

21:00
Swedish League
2.40 -4.0%
2.85 +3.6%
2.80

21:00
Italian League Div 2
4.30
3.60
1.63

21:00
Italian League Div 2
2.20 -4.3%
2.95
3.05 +7.0%

 21:00
Italian League Div 2
2.85
2.80
2.40

 21:00
Italian League Div 2
2.15
3.00
3.10

 21:30
German League
2.40
3.30
2.50

 21:30
German League
2.80 -5.1%
3.20
2.20 +4.8%

 21:30
German League
1.95 +1.6%
3.60
3.10

 21:30
German League
1.45 -2.0%
4.20 +2.4%
5.20 +4.0%

 22:00
English Premier
2.05 -2.4%
3.10
3.20 +3.2%

 22:00
English Premier
4.10
3.70
1.65

22:00
English League Champ
2.30
3.00
2.80

22:00
English League Champ
2.00
3.30
3.10

22:00
English League Champ
2.05
3.10
3.20

22:00
English League Champ
1.50
3.80
5.20

 22:00
English League Champ
1.80 +4.7%
3.60 -2.7%
3.60 -2.7%

 22:00
English League Champ
1.70 -2.9%
3.40 -2.9%
4.10 +7.9%

22:00
English League Champ
2.45
3.00
2.60

 22:00
Norwegian League
1.28 -5.2%
4.80 +9.1%
8.50 +21.4%

22:00
English League One
1.85
3.40
3.50

22:00
English League One
1.77
3.60
3.60

22:00
English League One
1.75 -1.1%
3.30 +3.1%
4.10

22:00
English League One
2.15
3.10
3.00

22:00
English League One
2.15
2.80
3.30

22:00
English League One
2.30
3.10
2.70

22:00
English League One
2.30
3.30
2.60

 22:15
Spanish League
2.30
3.05
2.75

22:15
Spanish League Div 2
2.10 +5.0%
2.90 -6.5%
3.30 -2.9%

 22:15
Spanish League Div 2
2.10
2.85
3.40

 22:30
Dutch League
1.60
3.40
5.00

 22:30
Dutch League Div 2
2.75 +1.9%
3.60
2.10

 23:15
Italian League Div 2
2.50
2.95 +1.7%
2.60 -1.9%

 Sun, 12 Apr 2026

 00:00
Italian League
1.37
4.20
7.00

 00:00
Norwegian League
3.20 +3.2%
3.80
1.82 -1.6%

00:00
Saudi League
4.70
3.80
1.55

00:00
Saudi League
1.87
3.40
3.40

00:05
Saudi League
2.35 -9.6%
3.10
2.65 +10.4%

 00:30
English Premier
1.58 +9.0%
3.80 -9.5%
4.40 -12.0%

 00:30
German League
7.50
4.80 +2.1%
1.30

 00:30
Spanish League
1.25 +4.2%
5.20 -13.3%
8.00 -11.1%

 00:30
Spanish League Div 2
2.25
2.95
2.95

 00:45
Dutch League
3.50
3.80
1.80

 01:00
French League
2.03
3.05
3.30

 01:00
US Soccer League
2.03 -1.0%
3.30 +3.1%
3.05

 02:00
Dutch League
1.82
3.70
3.40

02:00
Saudi League
12.00
7.00
1.12

 02:30
US Soccer League
2.50
3.20
2.45

 02:30
US Soccer League
2.05 -6.8%
3.40 +3.0%
2.95 +7.3%

 02:30
German League Div 2
2.50
3.40
2.35

 02:45
Italian League
2.85 -1.7%
3.10
2.20

 03:00
Dutch League
4.80
3.90
1.53

 03:00
Spanish League
2.90 -6.5%
2.95 +1.7%
2.30 +4.5%

 03:05
French League
1.35
4.40 +2.3%
7.00 -6.7%

 04:30
US Soccer League
4.20 +2.4%
3.70
1.63 -1.2%

 07:30
US Soccer League
1.45
3.80
6.00

 07:30
US Soccer League
1.63
3.70
4.20

 07:30
US Soccer League
2.20
2.90
3.10

 07:30
US Soccer League
2.00 +2.6%
3.10
3.30 -5.7%

 08:30
US Soccer League
2.00
3.40
3.05

 08:30
US Soccer League
3.30 -2.9%
3.60
1.87 +2.7%

 08:30
US Soccer League
1.55
3.70 -2.6%
4.80 +2.1%

 09:30
US Soccer League
2.20 +2.3%
3.10
2.85 -3.4%

 10:30
US Soccer League
1.75 +1.7%
3.60
3.70 -2.6%

 13:00
A League
1.63
3.60
4.30 -2.3%

 13:00
J League 100 Year Vision
1.75
3.00
4.10

 15:00
J League 100 Year Vision
2.65
3.20
2.20

 17:00
A League
2.95
3.40
2.03

 18:15
Dutch League
2.40 +2.1%
3.20 -5.9%
2.55 +2.0%

 18:30
Italian League
2.05
3.10
3.20

 19:00
English League Champ
2.00
3.30
3.10

 20:00
Spanish League
2.05 -2.4%
3.30 +3.1%
3.05 +1.7%

20:00
Swedish League
1.58
3.70
4.70

20:00
Swedish League
2.35
3.00
2.75

 20:30
Dutch League
2.15 +2.4%
3.50 -2.8%
2.70

 20:30
Dutch League
2.05
3.50
2.85

 20:30
Norwegian League
2.15 -2.3%
3.40 +3.0%
2.75

 21:00
English Premier
2.80 +5.7%
3.20
2.20 -4.3%

 21:00
English Premier
2.50
3.05
2.50

 21:00
English Premier
2.45 -2.0%
3.10 -3.1%
2.55 +4.1%

21:00
Italian League
5.20
3.50
1.55

 21:30
German League
2.15
3.10
2.95

 22:15
Spanish League
2.35 -2.1%
3.00
2.75 +1.9%

 22:45
Dutch League
1.63 +1.9%
3.90
3.90 -4.9%

 23:00
Norwegian League
2.25
3.30
2.65

 23:00
Norwegian League
1.55
3.80
4.70 -2.1%

 23:15
French League
2.80
3.00
2.30

 23:15
French League
2.00 +2.6%
2.90
3.80

 23:30
English Premier
2.85
3.60 +2.9%
2.03 -1.0%

 23:30
German League
1.42
4.10
6.00

Mon, 13 Apr 2026

 00:00
Italian League
1.80 +1.7%
3.10 +1.6%
4.20 -2.3%

 00:30
Spanish League
1.58
3.70 -2.6%
4.50

 01:30
German League
