'use client'

import { useRouter } from 'next/navigation'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface ChartDataItem {
  modelId: string
  name: string
  avgScore: number
  runs: number
}

interface LeaderboardChartProps {
  data: ChartDataItem[]
}

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4', '#84cc16']

export function LeaderboardChart({ data }: LeaderboardChartProps) {
  const router = useRouter()

  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center bg-gray-100 rounded text-gray-400">
        No benchmark data yet. Run simulations locally to see results.
      </div>
    )
  }

  const CustomYAxisTick = ({ x, y, payload }: { x: number; y: number; payload: { value: string } }) => {
    const modelData = data.find(d => d.name === payload.value)
    const modelId = modelData?.modelId || ''
    
    return (
      <g transform={`translate(${x},${y})`}>
        <text
          x={-5}
          y={0}
          dy={4}
          textAnchor="end"
          fontSize={14}
          fontWeight={500}
          fill="#3b82f6"
          style={{ cursor: 'pointer' }}
          onClick={() => router.push(`/models/${modelId}`)}
          onMouseEnter={(e) => { e.currentTarget.style.textDecoration = 'underline' }}
          onMouseLeave={(e) => { e.currentTarget.style.textDecoration = 'none' }}
        >
          {payload.value}
        </text>
      </g>
    )
  }

  return (
    <div className="h-80 [&_svg]:outline-none [&_*]:outline-none">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 120, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" domain={[0, 'dataMax']} />
          <YAxis
            type="category"
            dataKey="name"
            width={110}
            tick={CustomYAxisTick}
          />
          <Tooltip
            formatter={(value) => [`${Number(value).toLocaleString()} PHP`, 'Avg Score']}
            labelFormatter={(label) => `Model: ${label}`}
          />
          <Bar dataKey="avgScore" name="Average Score">
            {data.map((entry, index) => (
              <Cell key={entry.modelId} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-4 text-center text-sm text-gray-500">
        Based on {data.reduce((sum, d) => sum + d.runs, 0)} total runs across {data.length} models
      </div>
    </div>
  )
}