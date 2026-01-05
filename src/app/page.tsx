import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-center mb-4">
          Sarisari-Bench
        </h1>
        <p className="text-xl text-gray-400 text-center mb-12">
          AI Agent Benchmark for Sari-sari Store Management
        </p>
        
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <Link href="/leaderboard" className="block p-6 bg-gray-800 rounded-lg hover:bg-gray-700 transition">
            <h2 className="text-xl font-semibold mb-2">Leaderboard</h2>
            <p className="text-gray-400">View model rankings and scores</p>
          </Link>
          
          <Link href="/models" className="block p-6 bg-gray-800 rounded-lg hover:bg-gray-700 transition">
            <h2 className="text-xl font-semibold mb-2">Models</h2>
            <p className="text-gray-400">Compare AI model performance</p>
          </Link>
          
          <Link href="/runs" className="block p-6 bg-gray-800 rounded-lg hover:bg-gray-700 transition">
            <h2 className="text-xl font-semibold mb-2">Runs</h2>
            <p className="text-gray-400">Explore individual run details</p>
          </Link>
        </div>
      </div>
    </main>
  )
}
