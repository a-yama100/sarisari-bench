import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export const revalidate = 60

interface Props {
  params: Promise<{ id: string }>
}

export default async function ModelDetailPage({ params }: Props) {
  const { id } = await params
  
  const { data: model } = await supabase
    .from('models')
    .select('*')
    .eq('id', id)
    .single()

  if (!model) {
    notFound()
  }

  const { data: runs } = await supabase
    .from('runs')
    .select('*')
    .eq('model_id', id)
    .order('started_at', { ascending: false })
    .limit(10)

  return (
    <main className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/" className="text-blue-400 hover:underline">Home</Link>
          <span className="mx-2 text-gray-500">/</span>
          <Link href="/models" className="text-blue-400 hover:underline">Models</Link>
          <span className="mx-2 text-gray-500">/</span>
          <span>{model.display_name}</span>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold">{model.display_name}</h1>
            <span className={`px-3 py-1 rounded ${
              model.backend_type === 'api' ? 'bg-blue-600' : 'bg-green-600'
            }`}>
              {model.backend_type}
            </span>
          </div>
          
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Provider:</span>
              <span className="ml-2">{model.provider}</span>
            </div>
            <div>
              <span className="text-gray-400">Context Length:</span>
              <span className="ml-2">{model.context_length?.toLocaleString()} tokens</span>
            </div>
            <div>
              <span className="text-gray-400">Notes:</span>
              <span className="ml-2">{model.notes || '-'}</span>
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-4">Recent Runs</h2>
        
        {runs && runs.length > 0 ? (
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left">Run ID</th>
                  <th className="px-6 py-3 text-left">Seed</th>
                  <th className="px-6 py-3 text-left">Status</th>
                  <th className="px-6 py-3 text-right">Final Score</th>
                  <th className="px-6 py-3 text-right">Started</th>
                </tr>
              </thead>
              <tbody>
                {runs.map((run) => (
                  <tr key={run.id} className="border-t border-gray-700">
                    <td className="px-6 py-4">
                      <Link href={`/runs/${run.id}`} className="text-blue-400 hover:underline">
                        {run.id.slice(0, 8)}...
                      </Link>
                    </td>
                    <td className="px-6 py-4">{run.seed}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded ${
                        run.status === 'completed' ? 'bg-green-600' :
                        run.status === 'running' ? 'bg-yellow-600' : 'bg-gray-600'
                      }`}>
                        {run.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
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
          <p className="text-gray-500">No runs yet for this model.</p>
        )}
      </div>
    </main>
  )
}