import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'

export const revalidate = 60

export default async function ModelsPage() {
  const { data: models } = await supabase
    .from('models')
    .select('*')
    .order('display_name')

  return (
    <main className="min-h-screen bg-white text-gray-900 flex flex-col">
      <Navbar />
      <div className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">Models</h1>
        <div className="grid md:grid-cols-2 gap-6">
          {models?.map((model) => (
            <Link
              key={model.id}
              href={'/models/' + model.id}
              className="block p-6 bg-gray-50 border border-gray-200 rounded-lg hover:border-gray-400 transition"
            >
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold">{model.display_name}</h2>
                <span className={
                  'px-2 py-1 text-xs rounded ' +
                  (model.backend_type === 'api'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-green-100 text-green-700')
                }>
                  {model.backend_type}
                </span>
              </div>
              <p className="text-gray-500 text-sm mb-2">{model.provider}</p>
              <p className="text-gray-600 text-sm">{model.notes}</p>
              <div className="mt-4 text-gray-500 text-sm">
                Context: {model.context_length?.toLocaleString()} tokens
              </div>
            </Link>
          ))}
        </div>
      </div>
      <Footer />
    </main>
  )
}
