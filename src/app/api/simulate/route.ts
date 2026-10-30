import { NextRequest, NextResponse } from 'next/server';
import { SimulationEngine } from '@/lib/simulation';
import { supabaseAdmin } from '@/lib/supabase';
import { getAIDecision, AIProviderError } from '@/lib/ai-provider';
import { rateLimit, clientIp, TOO_MANY } from '@/lib/security/rateLimit';

// 1 回の実行で AI の API を日数分呼ぶ（有料）ので、受け付ける値の幅を決めておく
const MAX_HORIZON_DAYS = 30;
const MAX_INITIAL_CASH = 10_000_000;
const MAX_MODEL_ID_LENGTH = 100;

export async function POST(request: NextRequest) {
  try {
    // 環境変数 SIMULATE_API_TOKEN を設定したときは、x-simulate-token が一致する呼び出しだけ受け付ける
    const token = process.env.SIMULATE_API_TOKEN;
    if (token && request.headers.get('x-simulate-token') !== token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 回数制限: 同じ IP から 1 時間に 60 回まで（AI の API の料金を使い込まれないように）
    if (!(await rateLimit('simulate:ip:' + clientIp(request), 3600, 60))) {
      return NextResponse.json(TOO_MANY, { status: 429 });
    }

    const body = await request.json();
    const { modelId, seed, horizonDays = 30, initialCash = 10000, useAI = true } = body;

    if (!modelId) {
      return NextResponse.json({ error: 'modelId is required' }, { status: 400 });
    }
    if (typeof modelId !== 'string' || modelId.length > MAX_MODEL_ID_LENGTH) {
      return NextResponse.json({ error: 'Invalid modelId' }, { status: 400 });
    }
    if (!Number.isInteger(horizonDays) || horizonDays < 1 || horizonDays > MAX_HORIZON_DAYS) {
      return NextResponse.json({ error: 'horizonDays must be an integer from 1 to ' + MAX_HORIZON_DAYS }, { status: 400 });
    }
    if (typeof initialCash !== 'number' || !Number.isFinite(initialCash) || initialCash <= 0 || initialCash > MAX_INITIAL_CASH) {
      return NextResponse.json({ error: 'Invalid initialCash' }, { status: 400 });
    }
    if (seed !== undefined && seed !== null && (!Number.isInteger(seed) || seed < 0 || seed > 2147483647)) {
      return NextResponse.json({ error: 'Invalid seed' }, { status: 400 });
    }
    if (typeof useAI !== 'boolean') {
      return NextResponse.json({ error: 'Invalid useAI' }, { status: 400 });
    }

    // Create a new run record
    const { data: run, error: runError } = await supabaseAdmin
      .from('sb_runs')
      .insert({
        model_id: modelId,
        seed: seed || Math.floor(Math.random() * 100000),
        horizon_days: horizonDays,
        status: 'running',
        config: { initialCash, useAI },
      })
      .select()
      .single();

    if (runError || !run) {
      console.error('Run creation error:', runError);
      // DB のエラーの中身は返さない（ログにだけ残す）
      return NextResponse.json({ error: 'Failed to create run' }, { status: 500 });
    }

    // Initialize simulation engine
    const engine = new SimulationEngine({
      seed: run.seed,
      horizonDays: horizonDays,
      initialCash: initialCash,
      maxInventorySlots: 100,
    });

    // Days on which the model replied but the reply was not valid JSON (counted, not an error).
    let parseFailures = 0;

    // Run simulation for each day
    for (let day = 1; day <= horizonDays; day++) {
      const state = engine.getCurrentState();
      
      let actions: { type: 'buy'; productId: string; quantity: number }[];
      
      if (useAI) {
        // Use AI to decide actions. An API failure aborts the run and marks it failed,
        // so it never shows up as a completed run with an untouched score.
        let decision;
        try {
          decision = await getAIDecision(modelId, state, day, horizonDays);
        } catch (error) {
          if (!(error instanceof AIProviderError)) throw error;
          await supabaseAdmin
            .from('sb_runs')
            .update({ status: 'failed', finished_at: new Date().toISOString() })
            .eq('id', run.id);
          return NextResponse.json(
            { error: 'AI provider failed', details: error.message, runId: run.id, day },
            { status: 502 }
          );
        }
        if (decision.reasoning === 'Failed to parse AI response') parseFailures++;
        actions = decision.actions;
      } else {
        // Fallback to simple random strategy
        actions = generateSimpleActions(engine);
      }

      const dayState = engine.simulateDay(actions);

      // Save daily metrics
      await supabaseAdmin.from('sb_daily_metrics').insert({
        run_id: run.id,
        day: dayState.day,
        cash: dayState.cash,
        revenue: dayState.revenue,
        profit: dayState.profit,
        inventory_value: calculateInventoryValue(dayState.inventory),
        stockouts: dayState.stockouts,
      });
    }

    // Get final results
    const results = engine.getResults();

    // Update run with final score
    await supabaseAdmin
      .from('sb_runs')
      .update({
        status: 'completed',
        final_score: results.finalScore,
        finished_at: new Date().toISOString(),
      })
      .eq('id', run.id);

    return NextResponse.json({
      runId: run.id,
      finalScore: results.finalScore,
      totalRevenue: results.totalRevenue,
      totalProfit: results.totalProfit,
      totalStockouts: results.totalStockouts,
      parseFailures,
    });
  } catch (error) {
    console.error('Simulation error:', error);
    return NextResponse.json({ error: 'Simulation failed' }, { status: 500 });
  }
}

// Simple random buying strategy (baseline)
function generateSimpleActions(engine: SimulationEngine) {
  const state = engine.getCurrentState();
  const actions: { type: 'buy'; productId: string; quantity: number }[] = [];

  if (state.cash > 1000) {
    const products = ['coke_sakto', 'lucky_me_pancit', 'boy_bawang', 'century_tuna'];
    const randomProduct = products[Math.floor(Math.random() * products.length)];
    actions.push({
      type: 'buy',
      productId: randomProduct,
      quantity: Math.floor(Math.random() * 10) + 5,
    });
  }

  return actions;
}

function calculateInventoryValue(inventory: { productId: string; quantity: number }[]) {
  return inventory.reduce((sum, item) => sum + item.quantity * 10, 0);
}
