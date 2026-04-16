# 工作流程图示

## 完整4步流程
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  1. 查找球队ID  │───▶│ 2. 构造比赛URL  │───▶│ 3. 提取eventId  │───▶│ 4. 获取赔率数据 │
└─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 详细步骤

### 步骤1: 查找球队ID
- 输入: 球队名称 (如 "Liverpool")
- 输出: 球队ID (如 "lId4TMwf")
- 方法: 搜索FlashScore页面，提取ID

### 步骤2: 构造比赛URL
- 输入: 主队ID + 客队ID
- 输出: 比赛URL
- 格式: `https://www.flashscore.com/match/football/{主队}-{主队ID}/{客队}-{客队ID}/`
- 示例: `https://www.flashscore.com/match/football/liverpool-lId4TMwf/psg-CjhkPw0k/`

### 步骤3: 提取比赛ID (eventId)
- 输入: 比赛URL
- 输出: eventId (如 "OdLTIvyf")
- 方法: 解析页面HTML，提取 `event_id_c` 字段

### 步骤4: 获取赔率数据
- 输入: eventId
- 输出: JSON赔率数据
- API: `https://global.ds.lsapp.eu/odds/pq_graphql`
- 参数: eventId, bookmakerId, betType, betScope

## 验证示例: 利物浦 vs 巴黎圣日耳曼

### 输入数据
- 主队: Liverpool
- 客队: Paris Saint-Germain

### 处理过程
1. **球队ID**: Liverpool=`lId4TMwf`, PSG=`CjhkPw0k`
2. **比赛URL**: `https://www.flashscore.com/match/football/liverpool-lId4TMwf/psg-CjhkPw0k/`
3. **eventId**: `OdLTIvyf` (从页面提取)
4. **赔率数据**: 成功获取 (利物浦 2.57, 平局 4.28, 巴黎 2.46)

### 结果验证
- ✅ 所有步骤成功执行
- ✅ 数据准确有效
- ✅ API响应正常
