'use client'

import { useRouter } from 'next/navigation'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from 'recharts'

interface PerformanceDataItem {
  modelId: string
  name: string
  avgScore: number
  relativePercent: number
}

interface RelativePerformanceChartProps {
  data: PerformanceDataItem[]
}

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4', '#84cc16', '#14b8a6', '#f43f5e', '#6366f1', '#a855f7']

export function RelativePerformanceChart({ data }: RelativePerformanceChartProps) {
  const router = useRouter()

  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center bg-gray-100 rounded text-gray-400">
        No benchmark data yet. Run simulations locally to see results.
      </div>
    )
  }

  const chartHeight = Math.max(300, data.length * 45)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const formatLabel = (value: any) => {
    const num = Number(value)
    return isNaN(num) ? '' : num.toFixed(1) + '%'
  }

  return (
    <div className="[&_svg]:outline-none [&_*]:outline-none">
      <div className="overflow-x-auto">
        <div style={{ minWidth: '400px', height: chartHeight }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 20, right: 60, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                type="number" 
                domain={[0, 105]}
                tickFormatter={(value) => value + '%'}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={120}
                tick={{ fontSize: 12, fontWeight: 500, fill: '#3b82f6', cursor: 'pointer' }}
              />
              <Tooltip
                formatter={(value) => [Number(value).toFixed(1) + '%', 'Performance']}
                labelFormatter={(label) => 'Model: ' + String(label)}
              />
              <Bar
                dataKey="relativePercent"
                name="Relative Performance"
                style={{ cursor: 'pointer' }}
                radius={[0, 4, 4, 0]}
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={entry.modelId} 
                    fill={COLORS[index % COLORS.length]}
                    onClick={() => router.push('/models/' + entry.modelId)}
                  />
                ))}
                <LabelList 
                  dataKey="relativePercent" 
                  position="right" 
                  formatter={formatLabel}
                  style={{ fontSize: 11, fill: '#6b7280' }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Table */}
      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 px-3 font-semibold text-gray-700">Rank</th>
              <th className="text-left py-2 px-3 font-semibold text-gray-700">Model</th>
              <th className="text-right py-2 px-3 font-semibold text-gray-700">Score (PHP)</th>
              <th className="text-right py-2 px-3 font-semibold text-gray-700">Performance</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr
                key={item.modelId}
                className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => router.push('/models/' + item.modelId)}
              >
                <td className="py-2 px-3 text-gray-500">{index + 1}</td>
                <td className="py-2 px-3">
                  <span 
                    className="font-medium hover:underline"
                    style={{ color: COLORS[index % COLORS.length] }}
                  >
                    {item.name}
                  </span>
                </td>
                <td className="py-2 px-3 text-right font-mono">{item.avgScore.toLocaleString()}</td>
                <td className="py-2 px-3 text-right">
                  <span className={index === 0 ? 'font-bold text-green-600' : ''}>
                    {item.relativePercent.toFixed(1)}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
