'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface ModelDailyData {
  modelId: string
  modelName: string
  dailyCash: number[]
}

interface ModelComparisonChartProps {
  data: ModelDailyData[]
}

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4', '#84cc16', '#14b8a6', '#f43f5e', '#6366f1', '#a855f7', '#22c55e', '#eab308']

// Format number as PHP currency
const formatPeso = (value: number) => {
  return '₱' + value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function ModelComparisonChart({ data }: ModelComparisonChartProps) {
  const router = useRouter()
  const [hoveredModel, setHoveredModel] = useState<string | null>(null)

  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center bg-gray-100 rounded text-gray-400">
        No benchmark data yet. Run simulations locally to see results.
      </div>
    )
  }

  // Sort by final cash balance (descending)
  const sortedData = [...data].sort((a, b) => {
    const aFinal = a.dailyCash[a.dailyCash.length - 1] || 0
    const bFinal = b.dailyCash[b.dailyCash.length - 1] || 0
    return bFinal - aFinal
  })

  // Find the maximum days across all models
  const maxDays = Math.max(...sortedData.map(m => m.dailyCash.length), 30)

  // Transform data for recharts
  const chartData = []
  for (let day = 0; day < maxDays; day++) {
    const dayData: Record<string, number | string | null> = { day: day + 1 }
    sortedData.forEach(model => {
      if (day < model.dailyCash.length && model.dailyCash[day] !== undefined) {
        dayData[model.modelId] = model.dailyCash[day]
      } else {
        dayData[model.modelId] = null
      }
    })
    chartData.push(dayData)
  }

  // Calculate Y-axis domain based on actual data
  const allValues: number[] = []
  sortedData.forEach(model => {
    model.dailyCash.forEach(val => {
      if (val !== undefined && val !== null) allValues.push(val)
    })
  })
  const minValue = Math.min(...allValues)
  const maxValue = Math.max(...allValues)
  const padding = (maxValue - minValue) * 0.1
  const yMin = Math.floor((minValue - padding) / 100) * 100
  const yMax = Math.ceil((maxValue + padding) / 100) * 100

  const formatTooltipValue = (value: number | undefined) =>
    value !== undefined ? formatPeso(value) : ''

  return (
    <div className="[&_svg]:outline-none [&_*]:outline-none">
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="day"
            label={{ value: 'Day', position: 'insideBottom', offset: -5 }}
            tick={{ fontSize: 12 }}
            domain={[1, maxDays]}
            ticks={maxDays <= 30 ? [1, 5, 10, 15, 20, 25, 30] : undefined}
          />
          <YAxis
            label={{ value: 'Cash (PHP)', angle: -90, position: 'insideLeft' }}
            tickFormatter={(value) => '₱' + value.toLocaleString()}
            tick={{ fontSize: 12 }}
            domain={[yMin, yMax]}
          />
          <Tooltip
            formatter={formatTooltipValue}
            labelFormatter={(label) => 'Day ' + label}
            contentStyle={{ fontSize: 12 }}
          />
          {sortedData.map((model, index) => (
            <Line
              key={model.modelId}
              type="monotone"
              dataKey={model.modelId}
              name={model.modelName}
              stroke={COLORS[index % COLORS.length]}
              strokeWidth={hoveredModel === model.modelId ? 4 : 2}
              strokeOpacity={hoveredModel && hoveredModel !== model.modelId ? 0.3 : 1}
              dot={false}
              connectNulls={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>

      {/* Custom Legend */}
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4">
        {sortedData.map((model, index) => {
          const finalCash = model.dailyCash[model.dailyCash.length - 1] || 0
          const days = model.dailyCash.length
          return (
            <button
              key={model.modelId}
              className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-gray-100 transition-colors"
              style={{
                opacity: hoveredModel && hoveredModel !== model.modelId ? 0.4 : 1
              }}
              onMouseEnter={() => setHoveredModel(model.modelId)}
              onMouseLeave={() => setHoveredModel(null)}
              onClick={() => router.push('/models/' + model.modelId)}
            >
              <span
                className="inline-block w-3 h-1 rounded"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="text-xs font-medium" style={{ color: COLORS[index % COLORS.length] }}>
                {model.modelName}
              </span>
              <span className="text-xs text-gray-400">
                ({formatPeso(finalCash)}{days < 30 ? ' / ' + days + 'd' : ''})
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
