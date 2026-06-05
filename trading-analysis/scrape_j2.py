#!/usr/bin/env python3
"""
J2/J3百年構想リーグ 45-55分进球后追小球策略分析

Scrapes match data from gekisaka.jp and analyzes:
- All goals scored in 45-55 minute window
- Whether more goals occurred AFTER the 45-55min window
- Win rate for "under" (no more goals) after 45-55min goal(s)

League IDs:  9=EAST-A, 10=EAST-B, 11=WEST-A, 12=WEST-B
Rounds: R15=20260506, R16=20260510, R17=20260516(East)/20260517(West), R18=20260524
"""

import re, time, sys, json
from datetime import datetime
from collections import defaultdict

try:
    import requests
except ImportError:
    print("ERROR: Please install requests: pip install requests")
    sys.exit(1)

LEAGUES = {9: "EAST-A", 10: "EAST-B", 11: "WEST-A", 12: "WEST-B"}

ROUND_INFO = [
    ("R15",9,"20260506"),("R15",10,"20260506"),("R15",11,"20260506"),("R15",12,"20260506"),
    ("R16",9,"20260510"),("R16",10,"20260510"),("R16",11,"20260510"),("R16",12,"20260510"),
    ("R17",9,"20260516"),("R17",10,"20260516"),("R17",11,"20260517"),("R17",12,"20260517"),
    ("R18",9,"20260524"),("R18",10,"20260524"),("R18",11,"20260524"),("R18",12,"20260524"),
]

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/125.0.0.0 Safari/537.36",
    "Accept-Language": "ja,en-US;q=0.9,en;q=0.8",
}
MAX_RETRIES, RETRY_DELAY = 3, 2
OUTPUT_DIR = "/Users/rongyingjie/.openclaw/workspace/trading-analysis"


# ─── Parsing Helpers ──────────────────────────────────────────────────────

def parse_goal_time(raw):
    """(half, base_minute, has_stoppage) or None"""
    raw = raw.strip().replace("分","").replace(" ","")
    m = re.match(r'^(\d+)\+(\d+)$', raw)
    if m:
        return (1 if int(m.group(1))<=45 else 2, int(m.group(1)), True)
    m = re.match(r'^(\d+)$', raw)
    if m:
        return (1 if int(m.group(1))<=45 else 2, int(m.group(1)), False)
    return None


def is_in_window(pt):
    if pt is None: return False
    # Must be second half AND minute 45-55 AND not stoppage time
    return pt[0] == 2 and 45 <= pt[1] <= 55 and not pt[2]


def fetch(url):
    for a in range(MAX_RETRIES):
        try:
            r = requests.get(url, headers=HEADERS, timeout=30)
            r.raise_for_status(); r.encoding='utf-8'; return r.text
        except Exception as e:
            print(f"  W: attempt {a+1}/{MAX_RETRIES}: {e}")
            if a < MAX_RETRIES-1: time.sleep(RETRY_DELAY)
    return None


def parse_goals(text):
    """Parse goal text, return list of dicts. Filters CSS/script noise.
    Handles: [Team]Player(XX分), [Team]Player(XX分+YY),
             [Team]A(XX分)、B(YY分) same team,
             [Team]A(XX分) [Team2]B(YY分) different teams,
             [Team]PlayerN(XX分、YY分) same player multiple goals.
    """
    if not text: return []
    t = text
    if t.startswith("得点:"): t = t[4:]
    t = t.replace("\n","").strip()
    if '.insertRule' in t or 'img {' in t: return []

    goals, last_team = [], None

    for seg in re.split(r'(?=\[)', t):
        seg = seg.strip()
        if not seg or '.insertRule' in seg: continue
        tm = re.match(r'\[([^\]]+)\](.*)', seg)
        if tm:
            last_team = tm.group(1)
            rest = tm.group(2)
        else:
            rest = seg
        rest = rest.strip()
        if not rest: continue

        # Find all parenthesized time expressions
        for pm in re.finditer(r'\(([^)]+)\)', rest):
            paren_content = pm.group(1).strip()
            if '分' not in paren_content:
                continue

            before = rest[:pm.start()].strip()
            before = re.sub(r'[、,]\s*$', '', before).strip()

            player = before
            if '、' in before or ',' in before:
                player = re.split(r'[、,]', before)[-1].strip()
            # Remove trailing digits (goal count indicator, e.g. "Player2")
            player = re.sub(r'\d+$', '', player).strip() if player else player

            # Parse time(s) inside parentheses
            times = re.split(r'[、,]', paren_content)
            for rt in times:
                rt = rt.strip()
                if rt and re.match(r'\d+分(?:\+\d+)?$', rt):
                    goals.append({"team": last_team or "UNK", "player": player,
                                  "raw_time": rt, "parsed": parse_goal_time(rt)})

    return goals


def extract_matches(html):
    """Parse match data from HTML using <hr digest='...'> anchors."""
    matches = []
    for m in re.finditer(r'<hr\s+digest="([^"]*)"\s*/>', html):
        try:
            digest = m.group(1)
            # "八戸 0(終了)1 湘南 [プラスタ]" or "栃木C 2(終了)2(4PK5) 横浜FC [CFS]"
            dm = re.match(r'([^\s]+)\s+(\d+)\(終了\)(\d+(?:\(\d+PK\d+\))?)\s+([^\s\[]+)', digest)
            if not dm: continue
            home_team, home_goals, score_part, away_team = dm.group(1), int(dm.group(2)), dm.group(3), dm.group(4)
            ag = re.match(r'^(\d+)', score_part)
            if not ag: continue
            away_goals, has_pk = int(ag.group(1)), "PK" in score_part

            hr_end = m.end()
            nxt = html.find('<hr', hr_end)
            block = html[hr_end:nxt] if nxt>0 else html[hr_end:]
            clean = re.sub(r'<br\s*/?>',' ', block)
            clean = re.sub(r'<[^>]+>','', clean)
            clean = re.sub(r'\s+',' ', clean).strip()

            goals_text = ""
            td = clean.find("得点:")
            if td >= 0:
                # Limit to first 500 chars to avoid JS/CSS garbage after the goal info
                goals_raw = clean[td:td+500]
                goals_text = goals_raw.replace("得点:","",1).strip()

            matches.append({
                "home_team": home_team, "away_team": away_team,
                "home_goals": home_goals, "away_goals": away_goals,
                "total_goals": home_goals + away_goals, "has_pk": has_pk,
                "score_raw": f"{home_goals} - {away_goals}",
                "goals": parse_goals(goals_text),
            })
        except Exception as e:
            print(f"  W: parse error: {e}")
    return matches


# ─── Scraping ──────────────────────────────────────────────────────────────

def scrape_all():
    all_matches, ok, fail = [], 0, 0
    print("="*70+"\n  J2/J3百年構想リーグ - 45-55分进球数据分析\n"+"="*70)

    for rl, lid, dt in ROUND_INFO:
        ln = LEAGUES[lid]
        url = f"https://web.gekisaka.jp/jscore/detail/?league={lid}&date={dt}"
        print(f"  [{rl}/{ln}] {dt}...", end=" ", flush=True)

        html = fetch(url)
        if html is None: print("FAILED"); fail+=1; continue

        matches = extract_matches(html)
        if matches:
            for m in matches:
                m.update({"league":ln,"round":rl,"date":dt,"url":url})
            all_matches.extend(matches)
            print(f"{len(matches)} matches"); ok+=1
        else:
            print("no matches"); fail+=1
        time.sleep(1)

    print(f"\n  OK: {ok} pages, Failed: {fail} pages, Total: {len(all_matches)} matches\n")
    return all_matches


# ─── Analysis ──────────────────────────────────────────────────────────────

def analyze(matches):
    res = {
        "total": len(matches),
        "with_goals": sum(1 for m in matches if m["total_goals"]>0),
        "window_any":0,"window_any_no_more":0,"window_any_more":0,
        "window_12":0,"window_12_no_more":0,"window_12_more":0,
        "breakdown": defaultdict(lambda:{"total":0,"no_more":0,"more":0}),
        "details": [],
    }
    for m in matches:
        goals = m.get("goals",[])
        if not goals: continue
        valid = [g for g in goals if g["parsed"] is not None]
        valid.sort(key=lambda g: (g["parsed"][1], 0 if not g["parsed"][2] else 1))
        if not valid: continue

        before = [g for g in valid if g["parsed"][1] < 45 or (g["parsed"][1]==45 and g["parsed"][2])]
        in_win = [g for g in valid if is_in_window(g["parsed"])]
        after = [g for g in valid if g["parsed"][1] > 55 or
                 (g["parsed"][1]>=45 and g["parsed"][2] and g["parsed"][0]==2)]

        if not in_win: continue
        res["window_any"] += 1
        nb, is_12, no_more = len(before), len(before)<=1, len(after)==0

        if no_more: res["window_any_no_more"] += 1
        else: res["window_any_more"] += 1

        if is_12:
            res["window_12"] += 1
            if no_more: res["window_12_no_more"] += 1
            else: res["window_12_more"] += 1

        res["breakdown"][nb]["total"] += 1
        if no_more: res["breakdown"][nb]["no_more"] += 1
        else: res["breakdown"][nb]["more"] += 1

        res["details"].append({
            "teams": f"{m['home_team']} vs {m['away_team']}",
            "score": f"{m['home_goals']}-{m['away_goals']}",
            "league": m["league"], "round": m["round"],
            "before": [f"[{g['team']}]{g['player']}({g['raw_time']})" for g in before],
            "window": [f"[{g['team']}]{g['player']}({g['raw_time']})" for g in in_win],
            "after": [f"[{g['team']}]{g['player']}({g['raw_time']})" for g in after],
            "no_more": no_more, "is_12": is_12,
        })
    return res


# ─── Report ────────────────────────────────────────────────────────────────

def gen_report(res):
    now = datetime.now().strftime("%Y-%m-%d %H:%M")
    w, w12 = res["window_any"], res["window_12"]
    pa = res["window_any_no_more"]/w*100 if w else 0
    pb = res["window_12_no_more"]/w12*100 if w12 else 0

    lines = [
        "# J2/J3百年構想リーグ 45-55分进球追小球策略分析报告\n",
        f"> 生成时间: {now}",
        "> 数据来源: [ゲキサカ](https://web.gekisaka.jp/jscore/detail/)",
        "> 联赛: J2/J3百年構想リーグ (EAST-A, EAST-B, WEST-A, WEST-B)",
        "> 轮次: R15-R18\n",
        "## 📊 数据概览\n",
        "| 指标 | 数值 |",
        "|------|------|",
        f"| 总比赛数 | {res['total']} |",
        f"| 有进球的比赛 | {res['with_goals']} |",
        f"| 45-55分钟有进球的比赛 | {w} |",
        f"| 其中45-55分钟进球是第1或第2个进球 | {w12} |\n",
        "## 🎯 核心分析：45-55分钟进球后追小球\n",
        "### 场景A：所有45-55分钟有进球的比赛\n",
        "| 后续情况 | 场次 | 占比 |",
        "|----------|------|------|",
        f"| 之后无进球（小球赢✅） | {res['window_any_no_more']} | {pa:.1f}% |",
        f"| 之后有进球（小球输❌） | {res['window_any_more']} | {100-pa:.1f}% |",
        f"| **合计** | {w} | 100% |\n",
        "### 场景B：45-55分钟进球是第1或第2个进球时\n",
        "> *对投注最有参考意义——进球少说明比赛尚未定局*\n",
        "| 后续情况 | 场次 | 占比 |",
        "|----------|------|------|",
        f"| 之后无进球（小球赢✅） | {res['window_12_no_more']} | {pb:.1f}% |",
        f"| 之后有进球（小球输❌） | {res['window_12_more']} | {100-pb:.1f}% |",
        f"| **合计** | {w12} | 100% |\n",
        "## 📈 按赛前进球数分拆\n",
        "| 赛前已进球数 | 总场次 | 无后续(小球赢) | 有后续(小球输) | 小球胜率 |",
        "|-------------|--------|----------------|----------------|----------|",
    ]
    for k in sorted(res["breakdown"].keys()):
        d = res["breakdown"][k]
        wr = d["no_more"]/d["total"]*100 if d["total"] else 0
        lines.append(f"| {k}球 | {d['total']} | {d['no_more']} | {d['more']} | {wr:.1f}% |")

    lines.append("\n## 📋 详细比赛日志\n")
    if res["details"]:
        for i, md in enumerate(res["details"], 1):
            lbl = "✅" if md["no_more"] else "❌"
            star = "★" if md["is_12"] else " "
            lines.append(f"### {i}. {md['teams']} ({md['score']}) {lbl}{star}")
            lines.append(f"- 联赛/轮次: {md['league']} / {md['round']}")
            lines.append(f"- 赛前进球: {', '.join(md['before']) if md['before'] else '无'}")
            lines.append(f"- **45-55分进球: {', '.join(md['window'])}**")
            lines.append(f"- 后续进球: {', '.join(md['after']) if md['after'] else '无 ✅'}")
            lines.append(f"- 判定: **{'小球赢 ✅' if md['no_more'] else '小球输 ❌'}**\n")
    else:
        lines.append("*无数据*\n")

    lines.append("## 💡 总结与建议\n")
    lines.append("### 核心数据\n")
    lines.append(f"- 总样本: {res['total']}场比赛")
    lines.append(f"- 其中{w}场在45-55分钟有进球")
    lines.append(f"- 场景B（最有参考意义）: {w12}场")
    lines.append(f"  - 之后无进球: **{res['window_12_no_more']}场 ({pb:.1f}%)**")
    lines.append(f"  - 之后有进球: {res['window_12_more']}场 ({100-pb:.1f}%)")

    if pb >= 60:
        lines.append("\n### ✅ 策略判断\n")
        lines.append(f"在45-55分钟期间，当进球是第1或第2个进球时，之后不再有进球的概率为 **{pb:.1f}%**。")
        lines.append("这个数据对追小球策略有一定参考价值。")
        lines.append("- 建议：在此场景出现后，考虑在合适赔率时追击小球")
        lines.append("- 注意：这是一个统计参考，实际投注需结合更多因素")
    elif pb >= 50:
        lines.append(f"\n### 🤔 策略判断\n")
        lines.append(f"胜率 {pb:.1f}% 略偏向有利，但差异不大。")
        lines.append("建议结合球队防守数据、比赛走势等综合判断。")
    else:
        lines.append(f"\n### ⚠️ 策略提醒\n")
        lines.append(f"胜率 {pb:.1f}% 显示追小球的优势不显著。")
        lines.append("建议寻找更多数据验证，谨慎使用此策略。")

    lines.append(f"\n\n---\n*报告自动生成于 {now}*")
    return "\n".join(lines)


# ─── Main ──────────────────────────────────────────────────────────────────

def main():
    print("\n  Phase 1: Scraping...\n")
    matches = scrape_all()
    if not matches:
        print("  ERROR: No data collected."); return

    # Save raw (convert parsed tuples to lists)
    raw = []
    for m in matches:
        m2 = dict(m)
        for g in m2.get("goals",[]):
            if "parsed" in g and g["parsed"] is not None:
                g["parsed"] = list(g["parsed"])
        raw.append(m2)
    with open(f"{OUTPUT_DIR}/scraped_data.json","w",encoding="utf-8") as f:
        json.dump(raw, f, ensure_ascii=False, indent=2)
    print(f"  Raw data: {OUTPUT_DIR}/scraped_data.json")

    print("\n  Phase 2: Analyzing...\n")
    res = analyze(matches)
    print(f"  Window matches: {res['window_any']}")
    print(f"  1st/2nd goal: {res['window_12']}")
    print(f"  Win: {res['window_12_no_more']} / Lose: {res['window_12_more']}")

    print("\n  Phase 3: Report...\n")
    report = gen_report(res)
    path = f"{OUTPUT_DIR}/j2_goal_time_analysis.md"
    with open(path, "w", encoding="utf-8") as f:
        f.write(report)
    print(f"  Report: {path}\n  Done ✅\n")

if __name__ == "__main__":
    main()
