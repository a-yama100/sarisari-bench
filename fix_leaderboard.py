path = r"D:\サイト管理\AI_Field_Test\phapp-one\sarisari-bench\src\components\LeaderboardChart.tsx"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

old = ".toLocaleString()) + ' PHP'"
new = ".toLocaleString())"
content = content.replace(old, new)

old2 = 'String(Number(value).toLocaleString())'
new2 = '"\u20b1" + String(Number(value).toLocaleString())'
content = content.replace(old2, new2)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)

print("Updated: LeaderboardChart peso symbol")
