#!/usr/bin/env python3
"""
Sarisari-Bench Local Runner
Run simulations locally and upload results to Supabase
"""
import requests
import argparse
import sys

# Configuration
PROD_API_URL = "https://sarisari.phaiworks.com/api/simulate"
LOCAL_API_URL = "http://localhost:3000/api/simulate"

AVAILABLE_MODELS = [
    # API models - OpenAI
    "gpt-4o", "gpt-4o-mini", "gpt-4.1-mini", "gpt-4.1",
    
    # API models - Anthropic
    "claude-sonnet-4", "claude-haiku-3.5", "claude-opus-4",
    "claude-haiku-5.5", "claude-sonnet-5.5", "claude-opus-5.5", "claude-fable-5.1",
    
    # API models - Google
    "gemini-2.0-flash", "gemini-2.5-flash", "gemini-2.5-pro",
    "gemini-3.8-flash", "gemini-3.1-pro",
    
    # API models - xAI (Grok)
    "grok-4-1-fast", "grok-4-fast", "grok-3", "grok-3-mini",
    "grok-4.3", "grok-4.7",
    
    # Ollama models
    "codellama-7b", "phi3-mini", "llama3.2-3b", "gemma2-2b",
    "deepseek-r1-7b", "deepseek-r1-8b", "qwen2.5-coder-7b", "lfm2.5-thinking",
    
    # LM Studio models
    "lmstudio-llama3.2-1b", "lmstudio-gemma3n",
    
    # Other local
    "llama-3-70b"
]

def run_simulation(model_id: str, seed: int, days: int, api_url: str, use_ai: bool) -> dict:
    """Run a single simulation"""
    payload = {
        "modelId": model_id,
        "seed": seed,
        "horizonDays": days,
        "useAI": use_ai
    }
    
    response = requests.post(api_url, json=payload, timeout=3600)  # thinking models can take 30+ min per 30-day run
    
    if response.status_code != 200:
        raise Exception(f"API error: {response.status_code} - {response.text}")
    
    return response.json()

def main():
    parser = argparse.ArgumentParser(description="Run Sarisari-Bench simulations")
    parser.add_argument("--model", "-m", help="Model ID to test")
    parser.add_argument("--seeds", "-s", type=int, default=5, help="Number of seeds to run (default: 5)")
    parser.add_argument("--days", "-d", type=int, default=30, help="Simulation days (default: 30)")
    parser.add_argument("--start-seed", type=int, default=1, help="Starting seed number (default: 1)")
    parser.add_argument("--list", "-l", action="store_true", help="List available models")
    parser.add_argument("--local", action="store_true", help="Use local API (localhost:3000)")
    parser.add_argument("--no-ai", action="store_true", help="Use random strategy instead of AI")
    parser.add_argument("--seed-list", help="Comma-separated seeds (e.g. 42,123,999 = the seeds of the 2026-02 runs)")
    parser.add_argument("--api-url", help="Override the API URL (e.g. http://localhost:3222/api/simulate)")
    
    args = parser.parse_args()
    
    if args.list:
        print("Available models:")
        for m in AVAILABLE_MODELS:
            print(f"  - {m}")
        return
    
    if not args.model:
        print("Error: --model/-m is required")
        print("Use --list to see available models")
        sys.exit(1)
    
    if args.model not in AVAILABLE_MODELS:
        print(f"Error: Unknown model '{args.model}'")
        print("Use --list to see available models")
        sys.exit(1)
    
    api_url = args.api_url or (LOCAL_API_URL if args.local else PROD_API_URL)
    use_ai = not args.no_ai
    mode = "LOCAL" if (args.local or args.api_url) else "PROD"
    strategy = "AI" if use_ai else "Random"
    
    if args.seed_list:
        args.seeds = len(args.seed_list.split(","))
    print(f"Running {args.seeds} simulations for {args.model} ({args.days} days each)")
    print(f"Mode: {mode} | Strategy: {strategy}")
    print("-" * 50)
    
    if args.seed_list:
        seeds = [int(x) for x in args.seed_list.split(",")]
        args.seeds = len(seeds)
    else:
        seeds = [args.start_seed + i for i in range(args.seeds)]

    results = []
    for i, seed in enumerate(seeds):
        print(f"[{i+1}/{args.seeds}] Seed {seed}...", end=" ", flush=True)
        
        try:
            result = run_simulation(args.model, seed, args.days, api_url, use_ai)
            score = result.get("finalScore", 0)
            results.append(score)
            print(f"Score: {score:,} PHP (parse failures: {result.get('parseFailures', 0)})")
        except Exception as e:
            print(f"Error: {e}")
            results.append(None)
            # An API failure (no credits, model unavailable) will repeat on every seed.
            print("Stopping this model: the API failed.")
            break
    
    # Summary
    valid_results = [r for r in results if r is not None]
    if valid_results:
        avg = sum(valid_results) / len(valid_results)
        min_score = min(valid_results)
        max_score = max(valid_results)
        
        print("-" * 50)
        print(f"Results for {args.model}:")
        print(f"  Runs: {len(valid_results)}/{args.seeds}")
        print(f"  Average: {avg:,.0f} PHP")
        print(f"  Min: {min_score:,} PHP")
        print(f"  Max: {max_score:,} PHP")

        # Save locally
        import json, os
        from datetime import datetime
        results_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'results')
        os.makedirs(results_dir, exist_ok=True)
        fname = "{}_{}.json".format(args.model, datetime.now().strftime('%Y%m%d_%H%M%S'))
        local_data = {
            'model_id': args.model, 'seeds': args.seeds, 'days': args.days,
            'results': results, 'average': avg, 'min': min_score, 'max': max_score,
        }
        with open(os.path.join(results_dir, fname), 'w') as f:
            json.dump(local_data, f, indent=2)
        print(f"  Saved locally: results/{fname}")

if __name__ == "__main__":
    main()
