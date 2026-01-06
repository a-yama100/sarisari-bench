"use client";

import { CashChart, RevenueChart, StockoutsChart } from './RunCharts';

interface DailyMetric {
  id: string;
  day: number;
  cash: number;
  revenue: number;
  profit: number;
  inventory_value: number;
  stockouts: number;
}

interface RunChartsWrapperProps {
  metrics: DailyMetric[];
}

export function RunChartsWrapper({ metrics }: RunChartsWrapperProps) {
  return (
    <div className="space-y-6 mb-8">
      <CashChart metrics={metrics} />
      <RevenueChart metrics={metrics} />
      <StockoutsChart metrics={metrics} />
    </div>
  );
}