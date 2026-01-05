import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export const revalidate = 60

export default async function ModelsPage() {
  const { data: models } = await supabase
    .from('models')
    .select('*')
    .order('provider, display_name')

  return (
    <main className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/" className="text-blue-400 hover:underline">
            Home
          </Link>
          <span className="mx-2 text-gray-500">/</span>
          <span>Models</span>
        </div>

        <h1 className="text-3xl font-bold mb-8">Models</h1>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {models?.map((model) => (
            <Link
              key={model.id}
              href={`/models/${model.id}`}
              className="block p-6 bg-gray-800 rounded-lg hover:bg-gray-700 transition"
            >
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-semibold">{model.display_name}</h2>
                <span className={`px-2 py-1 text-xs rounded ${
                  model.backend_type === 'api' ? 'bg-blue-600' : 'bg-green-600'
                }`}>
                  {model.backend_type}
                </span>
              </div>
              <p className="text-gray-400 text-sm mb-2">{model.provider}</p>
              <p className="text-gray-500 text-sm">{model.notes}</p>
              <div className="mt-4 text-gray-400 text-sm">
                Context: {model.context_length?.toLocaleString()} tokens
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}