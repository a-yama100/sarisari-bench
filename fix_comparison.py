path = r"D:\サイト管理\AI_Field_Test\phapp-one\sarisari-bench\src\components\ModelComparisonChart.tsx"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace("Cash (PHP)", "Cash (\u20b1)")

with open(path, "w", encoding="utf-8") as f:
    f.write(content)

print("Updated: ModelComparisonChart")
