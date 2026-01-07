path = r"D:\サイト管理\AI_Field_Test\phapp-one\sarisari-bench\src\app\leaderboard\page.tsx"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

old = 'text-left text-sm font-semibold text-gray-700">Model'
new = 'text-center text-sm font-semibold text-gray-700">Model'
content = content.replace(old, new)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)

print("Updated: Model header to center")
