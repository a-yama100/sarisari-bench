#!/usr/bin/env python3
"""
Test Grok API directly
"""
import os
import requests
import json

# Read API key from .env.local
def get_api_key():
    env_path = ".env.local"
    if os.path.exists(env_path):
        with open(env_path, 'r') as f:
            for line in f:
                if line.startswith('XAI_API_KEY='):
                    return line.strip().split('=', 1)[1]
    return os.getenv('XAI_API_KEY')

def test_grok_api():
    api_key = get_api_key()
    
    if not api_key:
        print("❌ XAI_API_KEY not found!")
        return
    
    print(f"✓ API Key found: {api_key[:10]}...{api_key[-4:]}")
    print("-" * 50)
    
    # Test prompt (simplified version of benchmark prompt)
    prompt = """You manage a sari-sari store. Goal: maximize cash.

DAY 1/30 | Cash: 10000 PHP | Weather: sunny | Inventory: 0 items

TOP PRODUCTS:
- lucky_me_pancit: cost 9, sell 13, profit 4
- coke_sakto: cost 8, sell 12, profit 4
- boy_bawang: cost 5, sell 8, profit 3

Respond ONLY with valid JSON:
{"actions": [{"type": "buy", "productId": "id", "quantity": N}], "reasoning": "brief"}"""

    print("Sending test request to Grok API...")
    print("-" * 50)
    
    try:
        response = requests.post(
            'https://api.x.ai/v1/chat/completions',
            headers={
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {api_key}',
            },
            json={
                'model': 'grok-4-1-fast-non-reasoning',
                'messages': [{'role': 'user', 'content': prompt}],
                'temperature': 0.3,
                'max_tokens': 300,
            },
            timeout=30
        )
        
        print(f"Status Code: {response.status_code}")
        print("-" * 50)
        
        if response.status_code == 200:
            data = response.json()
            content = data.get('choices', [{}])[0].get('message', {}).get('content', '')
            print("✅ API Response:")
            print(content)
            print("-" * 50)
            
            # Try to parse JSON
            try:
                # Handle markdown code blocks
                json_str = content
                if '```' in content:
                    import re
                    match = re.search(r'```(?:json)?\s*([\s\S]*?)```', content)
                    if match:
                        json_str = match.group(1)
                
                parsed = json.loads(json_str.strip())
                print("✅ Parsed JSON:")
                print(json.dumps(parsed, indent=2))
                
                if parsed.get('actions'):
                    print("\n✅ AI is returning purchase actions!")
                else:
                    print("\n⚠️ AI returned empty actions")
                    
            except json.JSONDecodeError as e:
                print(f"❌ Failed to parse JSON: {e}")
                
        else:
            print(f"❌ API Error:")
            print(response.text)
            
    except requests.exceptions.Timeout:
        print("❌ Request timed out")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_grok_api()
