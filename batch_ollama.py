import subprocess, sys, time, json, os
from datetime import datetime

# sarisari-bench: Ollama models not yet benchmarked
# Already done: codellama-7b (2 runs in DB)
models = [
    'phi3-mini', 'llama3.2-3b', 'gemma2-2b',
    'deepseek-r1-7b', 'deepseek-r1-8b', 'qwen2.5-coder-7b', 'lfm2.5-thinking',
]
SEEDS = 3
DAYS = 30
START_SEED = 200

log = []
total = len(models)
count = 0

for model in models:
    count += 1
    print("\n" + "=" * 60)
    print("[{}/{}] {}  ({} seeds x {} days)".format(count, total, model, SEEDS, DAYS))
    print("=" * 60)
    start = time.time()
    try:
        result = subprocess.run(
            [sys.executable, 'run_benchmark.py',
             '--model', model, '--seeds', str(SEEDS), '--days', str(DAYS),
             '--local', '--start-seed', str(START_SEED)],
            timeout=1800
        )
        elapsed = time.time() - start
        status = 'completed' if result.returncode == 0 else 'failed (exit {})'.format(result.returncode)
    except subprocess.TimeoutExpired:
        elapsed = time.time() - start
        status = 'timeout'
    except Exception as e:
        elapsed = time.time() - start
        status = 'error: {}'.format(e)

    log.append({'model': model, 'status': status, 'elapsed': round(elapsed, 1)})
    print("  Status: {} | Time: {:.1f}s".format(status, elapsed))

print("\n" + "=" * 60)
print("SARISARI-BENCH BATCH COMPLETE")
print("=" * 60)
for entry in log:
    icon = 'OK' if 'completed' in entry['status'] else 'NG'
    print("  [{}] {} - {} ({:.0f}s)".format(icon, entry['model'], entry['status'], entry['elapsed']))

results_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'results')
os.makedirs(results_dir, exist_ok=True)
log_path = os.path.join(results_dir, 'batch_log_{}.json'.format(datetime.now().strftime('%Y%m%d_%H%M%S')))
with open(log_path, 'w') as f:
    json.dump(log, f, indent=2)
print("\nLog saved: {}".format(log_path))
