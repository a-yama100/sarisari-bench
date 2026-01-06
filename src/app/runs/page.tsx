import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'

export const revalidate = 60

export default async function RunsPage() {
  const { data: runs } = await supabase
    .from('runs')
    .select('*, models(display_name)')
    .order('started_at', { ascending: false })
    .limit(50)

  return (
    <main className="min-h-screen bg-white text-gray-900 flex flex-col">
      <Navbar />
      <div className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">All Runs</h1>

        {runs && runs.length > 0 ? (
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Run ID</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Model</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Seed</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Days</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Final Score</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {runs.map((run) => (
                    <tr key={run.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <Link href={`/runs/${run.id}`} className="text-blue-600 hover:underline">
                          {run.id.slice(0, 8)}...
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <Link href={`/models/${run.model_id}`} className="text-blue-600 hover:underline">
                          {run.models?.display_name || run.model_id}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{run.seed}</td>
                      <td className="px-6 py-4 text-gray-600">{run.horizon_days}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded ${
                          run.status === 'completed' ? 'bg-green-100 text-green-700' :
                          run.status === 'running' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {run.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-mono text-gray-600">
                        {run.final_score?.toLocaleString() || '-'}
                      </td>
                      <td className="px-6 py-4 text-right text-gray-500">
                        {new Date(run.started_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
            <p className="text-gray-500 mb-2">No runs yet.</p>
            <p className="text-gray-400 text-sm">
              Benchmark runs will appear here once executed.
            </p>
          </div>
        )}
      </div>
      <Footer />
    </main>
  )
}