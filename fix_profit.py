path = r"D:\サイト管理\AI_Field_Test\phapp-one\sarisari-bench\src\components\ProfitPerformanceChart.tsx"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace("Final Cash (PHP)", "Final Cash (\u20b1)")
content = content.replace("Profit (PHP)", "Profit (\u20b1)")

with open(path, "w", encoding="utf-8") as f:
    f.write(content)

print("Updated: ProfitPerformanceChart")
