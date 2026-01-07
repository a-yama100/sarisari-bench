path = r"D:\サイト管理\AI_Field_Test\phapp-one\sarisari-bench\run_benchmark.py"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

old = '"gpt-4o", "gpt-4o-mini", "gpt-4.1-mini",'
new = '"gpt-4o", "gpt-4o-mini", "gpt-4.1-mini", "gpt-4.1",'
content = content.replace(old, new)

old2 = '"claude-sonnet-4", "claude-haiku-3.5",'
new2 = '"claude-sonnet-4", "claude-haiku-3.5", "claude-opus-4",'
content = content.replace(old2, new2)

old3 = '"gemini-2.0-flash", "gemini-2.5-flash",'
new3 = '"gemini-2.0-flash", "gemini-2.5-flash", "gemini-2.5-pro",'
content = content.replace(old3, new3)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)

print("Added models to run_benchmark.py")
