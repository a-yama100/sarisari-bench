import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="text-4xl font-bold text-center mb-6">
          Sarisari-Bench
        </h1>
        <p className="text-xl text-gray-600 text-center mb-8 leading-relaxed">
          An AI agent benchmark for managing a sari-sari store in the Philippines. 
          We measure the ability of models to stay coherent and successfully manage 
          a simulated business over 30 days.
        </p>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-12">
          <h2 className="text-lg font-semibold mb-2">Money balance over time</h2>
          <p className="text-sm text-gray-500 mb-4">Average across 5 runs</p>
          <div className="h-64 flex items-center justify-center bg-gray-100 rounded text-gray-400">
            Chart will appear after benchmark runs
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Link href="/leaderboard" className="block p-6 bg-gray-50 border border-gray-200 rounded-lg hover:border-gray-400 transition">
            <h2 className="text-lg font-semibold mb-2">Leaderboard</h2>
            <p className="text-gray-600 text-sm">View model rankings and scores</p>
          </Link>
          
          <Link href="/models" className="block p-6 bg-gray-50 border border-gray-200 rounded-lg hover:border-gray-400 transition">
            <h2 className="text-lg font-semibold mb-2">Models</h2>
            <p className="text-gray-600 text-sm">Compare AI model performance</p>
          </Link>
          
          <Link href="/runs" className="block p-6 bg-gray-50 border border-gray-200 rounded-lg hover:border-gray-400 transition">
            <h2 className="text-lg font-semibold mb-2">Runs</h2>
            <p className="text-gray-600 text-sm">Explore individual run details</p>
          </Link>
        </div>
      </div>
    </main>
  )
}