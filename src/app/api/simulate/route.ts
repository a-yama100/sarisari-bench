import { NextRequest, NextResponse } from 'next/server';
import { SimulationEngine } from '@/lib/simulation';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { modelId, seed, horizonDays = 30, initialCash = 5000 } = body;

    if (!modelId) {
      return NextResponse.json({ error: 'modelId is required' }, { status: 400 });
    }

    // Create a new run record
    const { data: run, error: runError } = await supabase
      .from('runs')
      .insert({
        model_id: modelId,
        seed: seed || Math.floor(Math.random() * 100000),
        horizon_days: horizonDays,
        status: 'running',
        config: { initialCash },
      })
      .select()
      .single();

    if (runError || !run) {
      return NextResponse.json({ error: 'Failed to create run' }, { status: 500 });
    }

    // Initialize simulation engine
    const engine = new SimulationEngine({
      seed: run.seed,
      horizonDays: horizonDays,
      initialCash: initialCash,
      maxInventorySlots: 100,
    });

    // Run simulation for each day
    // For now, use a simple random buying strategy
    for (let day = 1; day <= horizonDays; day++) {
      const actions = generateSimpleActions(engine, initialCash);
      const dayState = engine.simulateDay(actions);

      // Save daily metrics
      await supabase.from('daily_metrics').insert({
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
    await supabase
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
function generateSimpleActions(engine: SimulationEngine, budget: number) {
  const state = engine.getCurrentState();
  const actions: { type: 'buy'; productId: string; quantity: number }[] = [];
  
  // Simple strategy: buy random products if cash > 1000
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
  // Simplified calculation
  return inventory.reduce((sum, item) => sum + item.quantity * 10, 0);
}