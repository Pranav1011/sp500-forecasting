'use client';

import { Card } from "./ui/Card";
import { MetricBadge } from "./ui/MetricBadge";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface PredictionData {
  horizon_days: number;
  directional_accuracy: number;
  sharpe_ratio: number;
  total_return: number;
}

interface PredictionPanelProps {
  predictions: Record<string, PredictionData | null>;
}

export function PredictionPanel({ predictions }: PredictionPanelProps) {
  const horizons = ['1d', '5d', '20d'];

  const getTrend = (value: number) => {
    if (value > 0) return 'up';
    if (value < 0) return 'down';
    return 'neutral';
  };

  const formatPercent = (value: number) => `${(value * 100).toFixed(2)}%`;
  const formatNumber = (value: number) => value.toFixed(2);

  return (
    <Card title="Predictions">
      <div className="grid grid-cols-3 gap-4">
        {horizons.map((horizon) => {
          const data = predictions[horizon];
          if (!data) return (
            <div key={horizon} className="text-gray-500 text-center py-4">
              No data for {horizon}
            </div>
          );

          const Icon = data.total_return > 0 ? TrendingUp : data.total_return < 0 ? TrendingDown : Minus;

          return (
            <div key={horizon} className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
              <div className="flex items-center justify-between mb-3">
                <span className="text-lg font-bold text-white">{horizon.toUpperCase()}</span>
                <Icon className={`w-5 h-5 ${data.total_return > 0 ? 'text-green-400' : 'text-red-400'}`} />
              </div>
              <div className="space-y-2">
                <MetricBadge
                  label="Dir. Accuracy"
                  value={formatPercent(data.directional_accuracy)}
                  trend={data.directional_accuracy > 0.5 ? 'up' : 'down'}
                />
                <MetricBadge
                  label="Sharpe Ratio"
                  value={formatNumber(data.sharpe_ratio)}
                  trend={getTrend(data.sharpe_ratio)}
                />
                <MetricBadge
                  label="Total Return"
                  value={formatPercent(data.total_return)}
                  trend={getTrend(data.total_return)}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
