import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { RunChartsWrapper } from '@/components/RunChartsWrapper';
import { Navbar } from '@/components/Navbar';

interface RunDetail {
  id: string;
  model_id: string;
  seed: number;
  horizon_days: number;
  status: string;
  final_score: number | null;
  started_at: string;
  finished_at: string | null;
  models?: {
    display_name: string;
    provider: string;
  };
}

interface DailyMetric {
  id: string;
  day: number;
  cash: number;
  revenue: number;
  profit: number;
  inventory_value: number;
  stockouts: number;
}

export default async function RunDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const { data: run, error: runError } = await supabase
    .from('runs')
    .select('*, models(display_name, provider)')
    .eq('id', id)
    .single();

  const { data: metrics } = await supabase
    .from('daily_metrics')
    .select('*')
    .eq('run_id', id)
    .order('day', { ascending: true });

  if (runError || !run) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
        <Navbar />
        <div className="max-w-4xl mx-auto p-8">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <p className="text-red-600 text-lg">Run not found</p>
            <Link href="/runs" className="text-orange-600 hover:underline mt-4 inline-block">
              Back to Runs
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const typedRun = run as RunDetail;
  const typedMetrics = (metrics || []) as DailyMetric[];

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    running: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString();
  };

  const formatPeso = (value: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
    }).format(value);
  };

  const totalRevenue = typedMetrics.reduce((sum, m) => sum + (m.revenue || 0), 0);
  const totalProfit = typedMetrics.reduce((sum, m) => sum + (m.profit || 0), 0);
  const totalStockouts = typedMetrics.reduce((sum, m) => sum + (m.stockouts || 0), 0);

  const statusClass = statusColors[typedRun.status] || 'bg-gray-100';

  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
      <Navbar />
      <div className="max-w-4xl mx-auto p-8">
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Run Details</h1>
            <span className={statusClass + " px-3 py-1 rounded-full text-sm font-medium"}>
              {typedRun.status}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <div>
              <p className="text-sm text-gray-500">Model</p>
              <Link href={`/models/${typedRun.model_id}`} className="text-lg font-semibold text-blue-600 hover:underline">
                {typedRun.models?.display_name || typedRun.model_id}
              </Link>
            </div>
            <div>
              <p className="text-sm text-gray-500">Seed</p>
              <p className="text-lg font-semibold text-gray-800">{typedRun.seed}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Days</p>
              <p className="text-lg font-semibold text-gray-800">{typedRun.horizon_days}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Final Score</p>
              <p className="text-lg font-semibold text-orange-600">
                {typedRun.final_score !== null ? formatPeso(typedRun.final_score) : '-'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 text-sm text-gray-600">
            <div>
              <p className="text-gray-500">Started</p>
              <p>{formatDate(typedRun.started_at)}</p>
            </div>
            <div>
              <p className="text-gray-500">Finished</p>
              <p>{typedRun.finished_at ? formatDate(typedRun.finished_at) : '-'}</p>
            </div>
          </div>
        </div>

        {typedMetrics.length > 0 ? (
          <>
            <RunChartsWrapper metrics={typedMetrics} />

            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-white rounded-xl shadow p-6 text-center">
                <p className="text-sm text-gray-500">Total Revenue</p>
                <p className="text-2xl font-bold text-green-600">{formatPeso(totalRevenue)}</p>
              </div>
              <div className="bg-white rounded-xl shadow p-6 text-center">
                <p className="text-sm text-gray-500">Total Profit</p>
                <p className="text-2xl font-bold text-blue-600">{formatPeso(totalProfit)}</p>
              </div>
              <div className="bg-white rounded-xl shadow p-6 text-center">
                <p className="text-sm text-gray-500">Total Stockouts</p>
                <p className="text-2xl font-bold text-red-600">{totalStockouts}</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Daily Metrics</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="py-3 px-4 text-sm font-semibold text-gray-600">Day</th>
                      <th className="py-3 px-4 text-sm font-semibold text-gray-600">Cash</th>
                      <th className="py-3 px-4 text-sm font-semibold text-gray-600">Revenue</th>
                      <th className="py-3 px-4 text-sm font-semibold text-gray-600">Profit</th>
                      <th className="py-3 px-4 text-sm font-semibold text-gray-600">Inventory</th>
                      <th className="py-3 px-4 text-sm font-semibold text-gray-600">Stockouts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {typedMetrics.map((metric) => (
                      <tr key={metric.id} className="border-b border-gray-100 hover:bg-orange-50">
                        <td className="py-3 px-4 font-medium text-gray-800">Day {metric.day}</td>
                        <td className="py-3 px-4 text-gray-600">{formatPeso(metric.cash)}</td>
                        <td className="py-3 px-4 text-green-600">{formatPeso(metric.revenue)}</td>
                        <td className="py-3 px-4 text-blue-600">{formatPeso(metric.profit)}</td>
                        <td className="py-3 px-4 text-gray-600">{formatPeso(metric.inventory_value)}</td>
                        <td className="py-3 px-4 text-red-600">{metric.stockouts}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <p className="text-gray-500">No metrics available yet. Run is {typedRun.status}.</p>
          </div>
        )}
      </div>
    </main>
  );
}