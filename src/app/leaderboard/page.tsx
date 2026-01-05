import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export const revalidate = 60

export default async function LeaderboardPage() {
  const { data: models } = await supabase
    .from('models')
    .select('*')
    .order('display_name')

  return (
    <main className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/" className="text-blue-400 hover:underline">
            Home
          </Link>
          <span className="mx-2 text-gray-500">/</span>
          <span>Leaderboard</span>
        </div>

        <h1 className="text-3xl font-bold mb-8">Leaderboard</h1>

        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left">Rank</th>
                <th className="px-6 py-3 text-left">Model</th>
                <th className="px-6 py-3 text-left">Provider</th>
                <th className="px-6 py-3 text-right">Avg Score</th>
                <th className="px-6 py-3 text-right">Runs</th>
              </tr>
            </thead>
            <tbody>
              {models?.map((model, index) => (
                <tr key={model.id} className="border-t border-gray-700 hover:bg-gray-750">
                  <td className="px-6 py-4">{index + 1}</td>
                  <td className="px-6 py-4">
                    <Link href={`/models/${model.id}`} className="text-blue-400 hover:underline">
                      {model.display_name}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-gray-400">{model.provider}</td>
                  <td className="px-6 py-4 text-right">-</td>
                  <td className="px-6 py-4 text-right">0</td>
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