import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export const revalidate = 60

export default async function RunsPage() {
  const { data: runs } = await supabase
    .from('runs')
    .select('*, models(display_name)')
    .order('started_at', { ascending: false })
    .limit(50)

  return (
    <main className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/" className="text-blue-400 hover:underline">Home</Link>
          <span className="mx-2 text-gray-500">/</span>
          <span>Runs</span>
        </div>

        <h1 className="text-3xl font-bold mb-8">All Runs</h1>

        {runs && runs.length > 0 ? (
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left">Run ID</th>
                  <th className="px-6 py-3 text-left">Model</th>
                  <th className="px-6 py-3 text-left">Seed</th>
                  <th className="px-6 py-3 text-left">Days</th>
                  <th className="px-6 py-3 text-left">Status</th>
                  <th className="px-6 py-3 text-right">Final Score</th>
                  <th className="px-6 py-3 text-right">Date</th>
                </tr>
              </thead>
              <tbody>
                {runs.map((run) => (
                  <tr key={run.id} className="border-t border-gray-700 hover:bg-gray-750">
                    <td className="px-6 py-4">
                      <Link href={`/runs/${run.id}`} className="text-blue-400 hover:underline">
                        {run.id.slice(0, 8)}...
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <Link href={`/models/${run.model_id}`} className="hover:underline">
                        {run.models?.display_name || run.model_id}
                      </Link>
                    </td>
                    <td className="px-6 py-4">{run.seed}</td>
                    <td className="px-6 py-4">{run.horizon_days}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded ${
                        run.status === 'completed' ? 'bg-green-600' :
                        run.status === 'running' ? 'bg-yellow-600' : 'bg-gray-600'
                      }`}>
                        {run.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-mono">
                      {run.final_score?.toLocaleString() || '-'}
                    </td>
                    <td className="px-6 py-4 text-right text-gray-400">
                      {new Date(run.started_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-gray-800 rounded-lg p-8 text-center">
            <p className="text-gray-400 mb-4">No runs yet.</p>
            <p className="text-gray-500 text-sm">
              Benchmark runs will appear here once executed.
            </p>
          </div>
        )}
      </div>
    </main>
  )
}