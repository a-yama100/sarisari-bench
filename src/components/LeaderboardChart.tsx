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

interface CustomTickProps {
  x: number
  y: number
  payload: { value: string }
  data: ChartDataItem[]
  onClickLabel: (modelId: string) => void
}

function CustomYAxisTick({ x, y, payload, data, onClickLabel }: CustomTickProps) {
  const modelData = data.find(d => d.name === payload.value)
  const modelId = modelData?.modelId || ''
  
  return (
    <text
      x={x}
      y={y}
      dy={4}
      textAnchor="end"
      fontSize={12}
      fontWeight={500}
      fill="#3b82f6"
      style={{ cursor: 'pointer' }}
      onClick={() => onClickLabel(modelId)}
      onMouseEnter={(e) => { e.currentTarget.style.textDecoration = 'underline' }}
      onMouseLeave={(e) => { e.currentTarget.style.textDecoration = 'none' }}
    >
      {payload.value}
    </text>
  )
}

export function LeaderboardChart({ data }: LeaderboardChartProps) {
  const router = useRouter()

  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center bg-gray-100 rounded text-gray-400">
        No benchmark data yet. Run simulations locally to see results.
      </div>
    )
  }

  const handleBarClick = (entry: { name?: string }) => {
    const modelData = data.find(d => d.name === entry.name)
    if (modelData) {
      router.push('/models/' + modelData.modelId)
    }
  }

  const handleLabelClick = (modelId: string) => {
    if (modelId) {
      router.push('/models/' + modelId)
    }
  }

  const chartHeight = Math.max(300, data.length * 50)

  return (
    <div className="[&_svg]:outline-none [&_*]:outline-none">
      <div className="overflow-x-auto">
        <div style={{ minWidth: '400px', height: chartHeight }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 20, right: 30, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 'dataMax']} />
              <YAxis
                type="category"
                dataKey="name"
                width={120}
                tick={(props) => (
                  <CustomYAxisTick
                    {...props}
                    data={data}
                    onClickLabel={handleLabelClick}
                  />
                )}
              />
              <Tooltip
                formatter={(value) => [String(Number(value).toLocaleString()) + ' PHP', 'Avg Score']}
                labelFormatter={(label) => 'Model: ' + String(label)}
              />
              <Bar
                dataKey="avgScore"
                name="Average Score"
                onClick={(data) => handleBarClick(data)}
                style={{ cursor: 'pointer' }}
              >
                {data.map((entry, index) => (
                  <Cell key={entry.modelId} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="mt-4 text-center text-sm text-gray-500">
        Based on {data.reduce((sum, d) => sum + d.runs, 0)} total runs across {data.length} models
      </div>
    </div>
  )
}
