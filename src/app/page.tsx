import Link from 'next/link'
import Image from 'next/image'
import { supabaseAdmin } from '@/lib/supabase'
import { ModelComparisonChart } from '@/components/ModelComparisonChart'
import { ProfitPerformanceChart } from '@/components/ProfitPerformanceChart'
import { HomeNavbar } from '@/components/HomeNavbar'
import { Footer } from '@/components/Footer'

export const revalidate = 86400 // 24 hours

const INITIAL_CASH = 10000

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Sarisari-Bench",
  "description": "An AI agent benchmark for managing a sari-sari store in the Philippines. Measure the ability of models to stay coherent and manage a simulated business over 30 days.",
  "url": "https://sarisari-bench.phapp.one",
  "applicationCategory": "DeveloperApplication",
  "operatingSystem": "Web",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "author": {
    "@type": "Organization",
    "name": "Sarisari-Bench Team"
  },
  "datePublished": "2025-01-01",
  "softwareVersion": "1.0"
}

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is Sarisari-Bench?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Sarisari-Bench is an AI agent benchmark that simulates managing a sari-sari store (small neighborhood store) in the Philippines. It evaluates how well AI models can make coherent business decisions over a 30-day period."
      }
    },
    {
      "@type": "Question",
      "name": "How does the benchmark work?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Each AI model starts with 10,000 PHP and must manage inventory, handle customer demand, and make purchasing decisions over 30 simulated days. The primary metric is the final cash balance, measuring profitability and decision-making quality."
      }
    },
    {
      "@type": "Question",
      "name": "Which AI models are supported?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Sarisari-Bench supports major API models (GPT-4o, Claude, Gemini) and local LLMs via Ollama and LM Studio, including Llama, Phi, CodeLlama, and Gemma models."
      }
    },
    {
      "@type": "Question",
      "name": "What is a sari-sari store?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A sari-sari store is a small neighborhood convenience store commonly found in the Philippines. They sell everyday items like snacks, drinks, canned goods, and household essentials in small quantities."
      }
    },
    {
      "@type": "Question",
      "name": "How can I run the benchmark myself?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "You can clone the repository from GitHub and use the provided Python scripts (run_benchmark.py) to test models locally with your own API keys or local LLM setup."
      }
    }
  ]
}

async function getChartData() {
  const { data: runs } = await supabaseAdmin
    .from('runs')
    .select('id, model_id, seed, final_score')
    .eq('status', 'completed')
    .order('model_id')

  if (!runs || runs.length === 0) return []

  const { data: models } = await supabaseAdmin
    .from('models')
    .select('id, display_name')

  const modelMap = new Map(models?.map(m => [m.id, m.display_name]) || [])

  const modelScores: Record<string, { scores: number[], name: string }> = {}

  for (const run of runs) {
    if (!modelScores[run.model_id]) {
      modelScores[run.model_id] = {
        scores: [],
        name: modelMap.get(run.model_id) || run.model_id
      }
    }
    if (run.final_score !== null) {
      modelScores[run.model_id].scores.push(Number(run.final_score))
    }
  }

  return Object.entries(modelScores)
    .filter(([, data]) => data.scores.length > 0)
    .map(([modelId, data]) => ({
      modelId,
      name: data.name,
      avgScore: Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length),
      runs: data.scores.length
    }))
    .sort((a, b) => b.avgScore - a.avgScore)
}

function getProfitPerformanceData(chartData: { modelId: string; name: string; avgScore: number }[]) {
  if (chartData.length === 0) return []

  return chartData.map(item => ({
    modelId: item.modelId,
    name: item.name,
    avgScore: item.avgScore,
    profitPercent: (item.avgScore / INITIAL_CASH) * 100
  }))
}

async function getModelComparisonData() {
  const { data: runs } = await supabaseAdmin
    .from('runs')
    .select('id, model_id')
    .eq('status', 'completed')

  if (!runs || runs.length === 0) return []

  const { data: models } = await supabaseAdmin
    .from('models')
    .select('id, display_name')

  const modelMap = new Map(models?.map(m => [m.id, m.display_name]) || [])

  const runsByModel: Record<string, string[]> = {}
  for (const run of runs) {
    if (!runsByModel[run.model_id]) {
      runsByModel[run.model_id] = []
    }
    runsByModel[run.model_id].push(run.id)
  }

  const modelDataArray = []

  for (const [modelId, runIds] of Object.entries(runsByModel)) {
    const { data: metrics } = await supabaseAdmin
      .from('daily_metrics')
      .select('run_id, day, cash')
      .in('run_id', runIds)
      .order('day')

    if (!metrics || metrics.length === 0) continue

    const dayTotals: Record<number, { sum: number, count: number }> = {}
    for (const metric of metrics) {
      const day = metric.day
      if (!dayTotals[day]) {
        dayTotals[day] = { sum: 0, count: 0 }
      }
      dayTotals[day].sum += Number(metric.cash)
      dayTotals[day].count += 1
    }

    const avgCash: number[] = []
    for (let day = 1; day <= 30; day++) {
      if (dayTotals[day]) {
        avgCash.push(Math.round(dayTotals[day].sum / dayTotals[day].count))
      }
    }

    if (avgCash.length > 0) {
      modelDataArray.push({
        modelId,
        modelName: modelMap.get(modelId) || modelId,
        dailyCash: avgCash
      })
    }
  }

  return modelDataArray
}

const faqItems = [
  {
    question: "What is Sarisari-Bench?",
    answer: "Sarisari-Bench is an AI agent benchmark that simulates managing a sari-sari store (small neighborhood store) in the Philippines. It evaluates how well AI models can make coherent business decisions over a 30-day period."
  },
  {
    question: "How does the benchmark work?",
    answer: "Each AI model starts with 10,000 PHP and must manage inventory, handle customer demand, and make purchasing decisions over 30 simulated days. The primary metric is the final cash balance, measuring profitability and decision-making quality."
  },
  {
    question: "Which AI models are supported?",
    answer: "Sarisari-Bench supports major API models (GPT-4o, Claude, Gemini) and local LLMs via Ollama and LM Studio, including Llama, Phi, CodeLlama, and Gemma models."
  },
  {
    question: "What is a sari-sari store?",
    answer: "A sari-sari store is a small neighborhood convenience store commonly found in the Philippines. They sell everyday items like snacks, drinks, canned goods, and household essentials in small quantities."
  },
  {
    question: "How can I run the benchmark myself?",
    answer: "You can clone the repository from GitHub and use the provided Python scripts (run_benchmark.py) to test models locally with your own API keys or local LLM setup."
  }
]

export default async function Home() {
  const chartData = await getChartData()
  const comparisonData = await getModelComparisonData()
  const profitData = getProfitPerformanceData(chartData)

  return (
    <main className="min-h-screen bg-white text-gray-900 flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <div className="flex-1">
        <div className="p-2 md:p-4">
          <div className="rounded-2xl min-h-80 md:min-h-96 w-full p-6 md:px-16 md:py-12 text-white flex flex-col justify-between relative overflow-hidden">
            <Image
              src="/images/hero.jpg"
              alt="Sari-sari store in the Philippines"
              fill
              priority
              className="object-cover"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-black/50 rounded-2xl"></div>
            <HomeNavbar />
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

        <div className="container mx-auto px-4 py-2 max-w-4xl">
          <div className="mb-4">
            <p className="text-gray-600 leading-relaxed">
              Long-term coherence in agents is more important than ever. We expect AI models to soon take
              active part in the economy, managing entire businesses. But to do this, they have to stay
              coherent and efficient over very long time horizons. This is what Sarisari-Bench measures:
              the ability of models to stay coherent and successfully manage a simulated sari-sari store.
            </p>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold mb-2">Return on Investment</h2>
            <p className="text-sm text-gray-500 mb-4">Final cash as percentage of initial ₱{INITIAL_CASH.toLocaleString()} (click to view details)</p>
            <ProfitPerformanceChart data={profitData} initialCash={INITIAL_CASH} />
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-12">
            <h2 className="text-lg font-semibold mb-2">Cash Balance Over Time</h2>
            <p className="text-sm text-gray-500 mb-4">Average daily cash balance by model (click legend to view model details)</p>
            <ModelComparisonChart data={comparisonData} />
          </div>

          <h2 className="text-2xl font-bold mb-6">Explore</h2>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
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

          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqItems.map((item, index) => (
                <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-5">
                  <h3 className="font-semibold text-gray-900 mb-2">{item.question}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{item.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
