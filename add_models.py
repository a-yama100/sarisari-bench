path = r"D:\サイト管理\AI_Field_Test\phapp-one\sarisari-bench\src\lib\ai-provider.ts"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# Add GPT-4.1 after gpt-4.1-mini
old1 = "'gpt-4.1-mini': { provider: 'openai', modelName: 'gpt-4.1-mini' },"
new1 = "'gpt-4.1-mini': { provider: 'openai', modelName: 'gpt-4.1-mini' },\n  'gpt-4.1': { provider: 'openai', modelName: 'gpt-4.1' },"
content = content.replace(old1, new1)

# Add Claude Opus 4 after claude-haiku-3.5
old2 = "'claude-haiku-3.5': { provider: 'anthropic', modelName: 'claude-3-5-haiku-20241022' },"
new2 = "'claude-haiku-3.5': { provider: 'anthropic', modelName: 'claude-3-5-haiku-20241022' },\n  'claude-opus-4': { provider: 'anthropic', modelName: 'claude-opus-4-20250514' },"
content = content.replace(old2, new2)

# Add Gemini 2.5 Pro after gemini-2.5-flash
old3 = "'gemini-2.5-flash': { provider: 'google', modelName: 'gemini-2.5-flash' },"
new3 = "'gemini-2.5-flash': { provider: 'google', modelName: 'gemini-2.5-flash' },\n  'gemini-2.5-pro': { provider: 'google', modelName: 'gemini-2.5-pro' },"
content = content.replace(old3, new3)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)

print("Added: gpt-4.1, claude-opus-4, gemini-2.5-pro")
