'use client';

import { Card } from "./ui/Card";
import { MetricBadge } from "./ui/MetricBadge";
import { TrendingUp, TrendingDown } from "lucide-react";

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

// Tooltip explanations for backtest metrics
const TOOLTIPS = {
  sharpe: "Risk-adjusted return metric. Measures excess return per unit of volatility. >1 is good, >2 is excellent.",
  sortino: "Like Sharpe but only penalizes downside volatility. Better for strategies with asymmetric returns.",
  max_dd: "Maximum Drawdown - the largest peak-to-trough decline. Shows worst-case loss scenario.",
  win_rate: "Percentage of trades that were profitable. >50% means more winners than losers.",
  return: "Total cumulative return of the strategy during the backtest period.",
  trades: "Number of trading signals generated during the backtest period.",
};

export function BacktestSummary({ data }: BacktestSummaryProps) {
  const formatPercent = (value: number) => `${(value * 100).toFixed(1)}%`;
  const formatNumber = (value: number) => value.toFixed(2);

  const getTrend = (value: number) => value > 0 ? 'up' : value < 0 ? 'down' : 'neutral';

  const horizonLabels: Record<string, string> = {
    '1d': 'Daily',
    '5d': 'Weekly',
    '20d': 'Monthly'
  };

  return (
    <Card title="Backtest Performance" accent="green">
      <div className="grid grid-cols-3 gap-4">
        {Object.entries(data).map(([horizon, metrics]) => {
          const isPositive = metrics.total_return > 0;

          return (
            <div
              key={horizon}
              className={`relative bg-zinc-800/30 rounded-lg p-5 border ${isPositive ? 'border-green-500/20' : 'border-red-500/20'}`}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-xl font-bold text-white">{horizon.toUpperCase()}</h4>
                  <span className="text-xs text-gray-500">{horizonLabels[horizon]} Horizon</span>
                </div>
                {isPositive ? (
                  <TrendingUp className="w-5 h-5 text-green-500/50" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-red-500/50" />
                )}
              </div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                <MetricBadge label="Sharpe" value={formatNumber(metrics.sharpe_ratio)} trend={getTrend(metrics.sharpe_ratio)} tooltip={TOOLTIPS.sharpe} />
                <MetricBadge label="Sortino" value={formatNumber(metrics.sortino_ratio)} trend={getTrend(metrics.sortino_ratio)} tooltip={TOOLTIPS.sortino} />
                <MetricBadge label="Max DD" value={formatPercent(metrics.max_drawdown)} trend="down" tooltip={TOOLTIPS.max_dd} />
                <MetricBadge label="Win Rate" value={formatPercent(metrics.win_rate)} trend={metrics.win_rate > 0.5 ? 'up' : 'down'} tooltip={TOOLTIPS.win_rate} />
                <MetricBadge label="Return" value={formatPercent(metrics.total_return)} trend={getTrend(metrics.total_return)} tooltip={TOOLTIPS.return} />
                <MetricBadge label="Trades" value={metrics.num_trades.toString()} trend="neutral" tooltip={TOOLTIPS.trades} />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
