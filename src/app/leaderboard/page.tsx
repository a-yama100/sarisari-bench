import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'

export const revalidate = 60

interface ModelStats {
  id: string;
  display_name: string;
  provider: string;
  avg_score: number | null;
  run_count: number;
}

// Format number with 2 decimal places
const formatNumber = (value: number | null) => {
  if (value === null || value === undefined) return '-'
  return "₱" + value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default async function LeaderboardPage() {
  const { data: models } = await supabase
    .from('shared_models')
    .select('id, display_name, provider')
    .order('display_name')

  const { data: runStats } = await supabase
    .from('sb_runs')
    .select('model_id, final_score')
    .eq('status', 'completed')

  const modelStats: ModelStats[] = (models || []).map((model) => {
    const modelRuns = (runStats || []).filter((r) => r.model_id === model.id);
    const runCount = modelRuns.length;
    const avgScore = runCount > 0
      ? modelRuns.reduce((sum, r) => sum + (r.final_score || 0), 0) / runCount
      : null;
    return {
      id: model.id,
      display_name: model.display_name,
      provider: model.provider,
      avg_score: avgScore,
      run_count: runCount,
    };
  });

  const sortedStats = modelStats.sort((a, b) => {
    if (a.avg_score === null && b.avg_score === null) return 0;
    if (a.avg_score === null) return 1;
    if (b.avg_score === null) return -1;
    return b.avg_score - a.avg_score;
  });

  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 flex flex-col">
      <Navbar />
      <div className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Leaderboard</h1>
        
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px]">
              <thead className="bg-orange-100 border-b border-orange-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Rank</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Model</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Provider</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Avg Score</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Runs</th>
                </tr>
              </thead>
              <tbody>
                {sortedStats.map((model, index) => (
                  <tr key={model.id} className="border-b border-gray-100 hover:bg-orange-50">
                    <td className="px-6 py-4 text-gray-600 font-medium">
                      {model.avg_score !== null ? index + 1 : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <Link href={"/models/" + model.id} className="text-orange-600 hover:underline font-medium">
                        {model.display_name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{model.provider}</td>
                    <td className="px-6 py-4 text-right font-semibold text-green-600 font-mono">
                      {formatNumber(model.avg_score)}
                    </td>
                    <td className="px-6 py-4 text-right text-gray-600">{model.run_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        <p className="mt-6 text-gray-500 text-sm text-center">
          Rankings based on average final cash balance after 30-day simulations.
        </p>
      </div>
      <Footer />
    </main>
  )
}
