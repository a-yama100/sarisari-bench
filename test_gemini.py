import os
import requests
import json

# Load API key
api_key_path = r"D:\SoftWare\Gemini\API key.txt"
with open(api_key_path, "r") as f:
    api_key = f.read().strip()

# Test prompt (simplified version of what the simulation uses)
prompt = """You manage a sari-sari store. Goal: maximize cash by day 30.

DAY 1/30 | Cash: 10000 PHP | Weather: sunny | Inventory items: 0

INVENTORY:
- Empty

TOP PRODUCTS (by popularity):
- softdrinks_coke: cost 25, sell 35, profit 10, shelf 180d, popularity 0.95
- candy_chocnut: cost 2, sell 5, profit 3, shelf 90d, popularity 0.9
- snacks_piatos: cost 12, sell 20, profit 8, shelf 60d, popularity 0.88

CRITICAL RULES:
- Buy small quantities (5-15 units) of high-popularity items
- Keep at least 1000 PHP cash reserve for safety

Respond ONLY with valid JSON:
{"actions": [{"type": "buy", "productId": "id", "quantity": N}], "reasoning": "brief"}
To skip buying: {"actions": [], "reasoning": "reason"}"""

url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key={api_key}"

response = requests.post(url, json={
    "contents": [{"parts": [{"text": prompt}]}]
})

print("Status:", response.status_code)
data = response.json()
print("\nFull response:")
print(json.dumps(data, indent=2)[:2000])

if "candidates" in data:
    text = data["candidates"][0]["content"]["parts"][0]["text"]
    print("\n\nExtracted text:")
    print(text)
