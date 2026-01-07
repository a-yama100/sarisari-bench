import { NextRequest, NextResponse } from 'next/server';
import { SimulationEngine } from '@/lib/simulation';
import { supabaseAdmin } from '@/lib/supabase';
import { getAIDecision } from '@/lib/ai-provider';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { modelId, seed, horizonDays = 30, initialCash = 10000, useAI = true } = body;

    if (!modelId) {
      return NextResponse.json({ error: 'modelId is required' }, { status: 400 });
    }

    // Create a new run record
    const { data: run, error: runError } = await supabaseAdmin
      .from('runs')
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
      return NextResponse.json({ error: 'Failed to create run', details: runError }, { status: 500 });
    }

    // Initialize simulation engine
    const engine = new SimulationEngine({
      seed: run.seed,
      horizonDays: horizonDays,
      initialCash: initialCash,
      maxInventorySlots: 100,
    });

    // Run simulation for each day
    for (let day = 1; day <= horizonDays; day++) {
      const state = engine.getCurrentState();
      
      let actions: { type: 'buy'; productId: string; quantity: number }[];
      
      if (useAI) {
        // Use AI to decide actions
        const decision = await getAIDecision(modelId, state, day, horizonDays);
        actions = decision.actions;
      } else {
        // Fallback to simple random strategy
        actions = generateSimpleActions(engine);
      }

      const dayState = engine.simulateDay(actions);

      // Save daily metrics
      await supabaseAdmin.from('daily_metrics').insert({
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
      .from('runs')
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