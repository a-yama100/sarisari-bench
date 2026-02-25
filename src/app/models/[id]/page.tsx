import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'

export const revalidate = 60

interface Props {
  params: Promise<{ id: string }>
}

// Format number as PHP currency
const formatPeso = (value: number | null) => {
  if (value === null || value === undefined) return '-'
  return '₱' + value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default async function ModelDetailPage({ params }: Props) {
  const { id } = await params
  
  const { data: model } = await supabase
    .from('shared_models')
    .select('*')
    .eq('id', id)
    .single()

  if (!model) {
    notFound()
  }

  const { data: runs } = await supabase
    .from('sb_runs')
    .select('*')
    .eq('model_id', id)
    .order('created_at', { ascending: false })
    .limit(10)

  return (
    <main className="min-h-screen bg-white text-gray-900 flex flex-col">
      <Navbar />
      <div className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold">{model.display_name}</h1>
            <span className={"px-3 py-1 rounded text-sm " + (
              model.backend_type === 'api'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-green-100 text-green-700'
            )}>
              {model.backend_type}
            </span>
          </div>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Provider:</span>
              <span className="ml-2 text-gray-900">{model.provider}</span>
            </div>
            <div>
              <span className="text-gray-500">Context Length:</span>
              <span className="ml-2 text-gray-900">{model.context_length?.toLocaleString()} tokens</span>
            </div>
            <div>
              <span className="text-gray-500">Notes:</span>
              <span className="ml-2 text-gray-900">{model.notes || '-'}</span>
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-4">Recent Runs</h2>
        
        {runs && runs.length > 0 ? (
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[500px]">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Run ID</th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Seed</th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Status</th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Final Score</th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Started</th>
                  </tr>
                </thead>
                <tbody>
                  {runs.map((run) => (
                    <tr key={run.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-6 py-4 text-center">
                        <Link href={"/runs/" + run.id} className="text-blue-600 hover:underline">
                          {run.id.slice(0, 8)}...
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-right font-mono text-gray-600">{run.seed}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={"px-2 py-1 text-xs rounded " + (
                          run.status === 'completed' ? 'bg-green-100 text-green-700' :
                          run.status === 'running' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'
                        )}>
                          {run.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-mono text-gray-600">
                        {formatPeso(run.final_score)}
                      </td>
                      <td className="px-6 py-4 text-right text-gray-500">
                        {new Date(run.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
            <p className="text-gray-500">No runs yet for this model.</p>
          </div>
        )}
      </div>
      <Footer />
    </main>
  )
}
