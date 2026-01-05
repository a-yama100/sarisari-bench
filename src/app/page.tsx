import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      <div className="p-2 md:p-4">
        <div 
          className="rounded-2xl min-h-80 md:min-h-96 w-full bg-cover bg-center p-6 md:px-16 md:py-12 text-white flex flex-col justify-between relative"
          style={{ backgroundImage: "url('/images/hero.jpg')" }}
        >
          <div className="absolute inset-0 bg-black/50 rounded-2xl"></div>
          
          <div className="relative z-10">
            <div className="flex items-center space-x-6">
              <h2 className="text-xl font-bold">Sarisari-Bench</h2>
              <div className="flex-1 h-px bg-white/50"></div>
              <nav className="hidden md:flex space-x-6">
                <Link href="/leaderboard" className="hover:underline">Leaderboard</Link>
                <Link href="/models" className="hover:underline">Models</Link>
                <Link href="/runs" className="hover:underline">Runs</Link>
              </nav>
            </div>
          </div>

          <div className="relative z-10">
            <p className="text-sm mb-2">Benchmark</p>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Sarisari-Bench</h1>
            <p className="text-base md:text-lg max-w-2xl leading-relaxed">
              An AI agent benchmark for managing a sari-sari store in the Philippines. 
              We measure the ability of models to stay coherent and successfully manage 
              a simulated business over 30 days.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <p className="text-gray-600 mb-8 leading-relaxed">
          Long-term coherence in agents is more important than ever. We expect AI models to soon take 
          active part in the economy, managing entire businesses. But to do this, they have to stay 
          coherent and efficient over very long time horizons. This is what Sarisari-Bench measures: 
          the ability of models to stay coherent and successfully manage a simulated sari-sari store.
        </p>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-12">
          <h2 className="text-lg font-semibold mb-2">Money balance over time</h2>
          <p className="text-sm text-gray-500 mb-4">Average across 5 runs</p>
          <div className="h-64 flex items-center justify-center bg-gray-100 rounded text-gray-400">
            Chart will appear after benchmark runs
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-6">Explore</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <Link href="/leaderboard" className="block p-6 bg-gray-50 border border-gray-200 rounded-lg hover:border-gray-400 transition">
            <h3 className="text-lg font-semibold mb-2">Leaderboard</h3>
            <p className="text-gray-600 text-sm">View model rankings and scores</p>
          </Link>
          
          <Link href="/models" className="block p-6 bg-gray-50 border border-gray-200 rounded-lg hover:border-gray-400 transition">
            <h3 className="text-lg font-semibold mb-2">Models</h3>
            <p className="text-gray-600 text-sm">Compare AI model performance</p>
          </Link>
          
          <Link href="/runs" className="block p-6 bg-gray-50 border border-gray-200 rounded-lg hover:border-gray-400 transition">
            <h3 className="text-lg font-semibold mb-2">Runs</h3>
            <p className="text-gray-600 text-sm">Explore individual run details</p>
          </Link>
        </div>
      </div>
    </main>
  )
}