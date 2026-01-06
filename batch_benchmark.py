#!/usr/bin/env python3
"""
Batch benchmark runner for multiple models
"""
import subprocess
import sys

# Models to test
MODELS = [
    # Ollama models
    'phi3-mini',
    'llama3.2-3b',
    'gemma2-2b',
    'codellama-7b',
    # LM Studio models
    'lmstudio-llama3.2-1b',
    'lmstudio-gemma3n',
    # API models
    'gpt-4.1-mini',
]

SEEDS = 3
DAYS = 30
START_SEED = 100

def main():
    print('=' * 60)
    print('BATCH BENCHMARK - Multiple Models')
    print('=' * 60)
    
    for model in MODELS:
        print(f'\n>>> Testing: {model}')
        cmd = [
            sys.executable, 'run_benchmark.py',
            '--model', model,
            '--seeds', str(SEEDS),
            '--days', str(DAYS),
            '--local',
            '--start-seed', str(START_SEED)
        ]
        subprocess.run(cmd)
    
    print('\n' + '=' * 60)
    print('BATCH COMPLETE')
    print('=' * 60)

if __name__ == '__main__':
    main()
