# FlashScore API 文档

## API端点
```
https://global.ds.lsapp.eu/odds/pq_graphql
```

## 必需参数
- `_hash`: ope2
- `eventId`: 8字符比赛ID
- `bookmakerId`: 417
- `betType`: HOME_DRAW_AWAY
- `betScope`: FULL_TIME

## 示例URL
```
https://global.ds.lsapp.eu/odds/pq_graphql?_hash=ope2&eventId=OdLTIvyf&bookmakerId=417&betType=HOME_DRAW_AWAY&betScope=FULL_TIME
```

## 响应格式
```json
{
  "data": {
    "findPrematchOddsForBookmaker": {
      "home": {"value": 2.57, "opening": 2.28},
      "draw": {"value": 4.28, "opening": 4.57},
      "away": {"value": 2.46, "opening": 2.8}
    }
  }
}
```
