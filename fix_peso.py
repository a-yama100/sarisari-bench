path = r"D:\サイト管理\AI_Field_Test\phapp-one\sarisari-bench\src\app\leaderboard\page.tsx"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

old = "return value.toLocaleString"
new = "return \"\u20b1\" + value.toLocaleString"
content = content.replace(old, new)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)

print("Updated: formatNumber with peso symbol")
