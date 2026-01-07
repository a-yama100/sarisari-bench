"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface DailyMetric {
  day: number;
  cash: number;
  revenue: number;
  profit: number;
  inventory_value: number;
  stockouts: number;
}

interface RunChartProps {
  metrics: DailyMetric[];
}

export function CashChart({ metrics }: RunChartProps) {
  const data = metrics.map((m) => ({
    day: m.day,
    cash: m.cash,
    inventory: m.inventory_value,
  }));

  const formatValue = (value: number | undefined) => value !== undefined ? "₱" + value.toLocaleString() : "";

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4">Cash and Inventory Value</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" />
          <YAxis />
          <Tooltip formatter={formatValue} />
          <Legend />
          <Line type="monotone" dataKey="cash" stroke="#f97316" strokeWidth={2} name="Cash" />
          <Line type="monotone" dataKey="inventory" stroke="#3b82f6" strokeWidth={2} name="Inventory" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function RevenueChart({ metrics }: RunChartProps) {
  const data = metrics.map((m) => ({
    day: m.day,
    revenue: m.revenue,
    profit: m.profit,
  }));

  const formatValue = (value: number | undefined) => value !== undefined ? "₱" + value.toLocaleString() : "";

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4">Daily Revenue and Profit</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" />
          <YAxis />
          <Tooltip formatter={formatValue} />
          <Legend />
          <Line type="monotone" dataKey="revenue" stroke="#22c55e" strokeWidth={2} name="Revenue" />
          <Line type="monotone" dataKey="profit" stroke="#8b5cf6" strokeWidth={2} name="Profit" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function StockoutsChart({ metrics }: RunChartProps) {
  const data = metrics.map((m) => ({
    day: m.day,
    stockouts: m.stockouts,
  }));

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4">Daily Stockouts</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="stockouts" stroke="#ef4444" strokeWidth={2} name="Stockouts" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}