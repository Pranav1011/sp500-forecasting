'use client';

import { Card } from "./ui/Card";
import { MetricBadge } from "./ui/MetricBadge";

interface BacktestData {
  sharpe_ratio: number;
  sortino_ratio: number;
  max_drawdown: number;
  total_return: number;
  benchmark_return: number;
  win_rate: number;
  directional_accuracy: number;
  num_trades: number;
}

interface BacktestSummaryProps {
  data: Record<string, BacktestData>;
}

export function BacktestSummary({ data }: BacktestSummaryProps) {
  const formatPercent = (value: number) => `${(value * 100).toFixed(1)}%`;
  const formatNumber = (value: number) => value.toFixed(2);

  const getTrend = (value: number) => value > 0 ? 'up' : value < 0 ? 'down' : 'neutral';

  return (
    <Card title="Backtest Performance">
      <div className="grid grid-cols-3 gap-4">
        {Object.entries(data).map(([horizon, metrics]) => (
          <div key={horizon} className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
            <h4 className="text-lg font-bold text-orange-500 mb-4">{horizon.toUpperCase()}</h4>
            <div className="grid grid-cols-2 gap-3">
              <MetricBadge label="Sharpe" value={formatNumber(metrics.sharpe_ratio)} trend={getTrend(metrics.sharpe_ratio)} />
              <MetricBadge label="Sortino" value={formatNumber(metrics.sortino_ratio)} trend={getTrend(metrics.sortino_ratio)} />
              <MetricBadge label="Max DD" value={formatPercent(metrics.max_drawdown)} trend="down" />
              <MetricBadge label="Win Rate" value={formatPercent(metrics.win_rate)} trend={metrics.win_rate > 0.5 ? 'up' : 'down'} />
              <MetricBadge label="Return" value={formatPercent(metrics.total_return)} trend={getTrend(metrics.total_return)} />
              <MetricBadge label="Trades" value={metrics.num_trades.toString()} trend="neutral" />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
