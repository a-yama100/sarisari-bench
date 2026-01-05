import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export const revalidate = 60

export default async function LeaderboardPage() {
  const { data: models } = await supabase
    .from('models')
    .select('*')
    .order('display_name')

  return (
    <main className="min-h-screen bg-white text-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8 text-sm">
          <Link href="/" className="text-blue-600 hover:underline">Home</Link>
          <span className="mx-2 text-gray-400">/</span>
          <span className="text-gray-600">Leaderboard</span>
        </div>

        <h1 className="text-3xl font-bold mb-8">Leaderboard</h1>

        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Rank</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Model</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Provider</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Avg Score</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Runs</th>
              </tr>
            </thead>
            <tbody>
              {models?.map((model, index) => (
                <tr key={model.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-6 py-4 text-gray-600">{index + 1}</td>
                  <td className="px-6 py-4">
                    <Link href={`/models/${model.id}`} className="text-blue-600 hover:underline font-medium">
                      {model.display_name}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{model.provider}</td>
                  <td className="px-6 py-4 text-right text-gray-500">-</td>
                  <td className="px-6 py-4 text-right text-gray-500">0</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-4 text-gray-500 text-sm">
          Scores will update after benchmark runs are completed.
        </p>
      </div>
    </main>
  )
}