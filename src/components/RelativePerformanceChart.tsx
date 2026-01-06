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
  Rectangle,
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

// Custom bar with PHP label inside
interface CustomBarProps {
  x?: number
  y?: number
  width?: number
  height?: number
  fill?: string
  payload?: PerformanceDataItem
  index?: number
}

const CustomBar = (props: CustomBarProps) => {
  const { x = 0, y = 0, width = 0, height = 0, fill, payload } = props
  
  return (
    <g>
      <Rectangle x={x} y={y} width={width} height={height} fill={fill} radius={[0, 4, 4, 0]} />
      {payload && width > 80 && (
        <>
          <rect
            x={x + 8}
            y={y + (height - 18) / 2}
            width={72}
            height={18}
            fill="rgba(0,0,0,0.7)"
            rx={3}
            ry={3}
          />
          <text
            x={x + 8 + 36}
            y={y + height / 2 + 1}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="white"
            fontSize={11}
            fontWeight={500}
          >
            {payload.avgScore.toLocaleString()} PHP
          </text>
        </>
      )}
    </g>
  )
}

export function RelativePerformanceChart({ data }: RelativePerformanceChartProps) {
  const router = useRouter()

  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center bg-gray-100 rounded text-gray-400">
        No benchmark data yet. Run simulations locally to see results.
      </div>
    )
  }

  const handleBarClick = (entry: { modelId?: string }) => {
    if (entry.modelId) {
      router.push('/models/' + entry.modelId)
    }
  }

  const chartHeight = Math.max(300, data.length * 45)

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
                onClick={(e) => {
                  const modelData = data.find(d => d.name === e.value)
                  if (modelData) {
                    router.push('/models/' + modelData.modelId)
                  }
                }}
              />
              <Tooltip
                formatter={(value: number, name: string, props: { payload?: PerformanceDataItem }) => {
                  const score = props.payload?.avgScore || 0
                  return [value.toFixed(1) + '% (' + score.toLocaleString() + ' PHP)', 'Performance']
                }}
                labelFormatter={(label) => 'Model: ' + label}
              />
              <Bar
                dataKey="relativePercent"
                name="Relative Performance"
                onClick={(data) => handleBarClick(data)}
                style={{ cursor: 'pointer' }}
                shape={(props: CustomBarProps) => <CustomBar {...props} />}
              >
                {data.map((entry, index) => (
                  <Cell key={entry.modelId} fill={COLORS[index % COLORS.length]} />
                ))}
                <LabelList
                  dataKey="relativePercent"
                  position="right"
                  formatter={(value: number) => value.toFixed(1) + '%'}
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
