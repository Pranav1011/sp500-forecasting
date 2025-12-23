'use client';

import { Card } from "./ui/Card";
import { MetricBadge } from "./ui/MetricBadge";
import { TrendingUp, TrendingDown, Minus, Activity } from "lucide-react";

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

  const getGradient = (value: number) => {
    if (value > 0) return 'from-green-500/10 to-transparent';
    if (value < 0) return 'from-red-500/10 to-transparent';
    return 'from-gray-500/10 to-transparent';
  };

  return (
    <Card title="Predictions" accent="orange">
      <div className="grid grid-cols-3 gap-4">
        {horizons.map((horizon) => {
          const data = predictions[horizon];
          if (!data) return (
            <div key={horizon} className="text-gray-500 text-center py-8 bg-zinc-800/30 rounded-lg border border-zinc-700/50">
              <Activity className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <span className="text-sm">No data for {horizon}</span>
            </div>
          );

          const Icon = data.total_return > 0 ? TrendingUp : data.total_return < 0 ? TrendingDown : Minus;
          const borderColor = data.total_return > 0 ? 'border-green-500/30' : 'border-red-500/30';

          return (
            <div
              key={horizon}
              className={`relative bg-gradient-to-b ${getGradient(data.total_return)} bg-zinc-800/30 rounded-lg p-4 border ${borderColor} overflow-hidden`}
            >
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-20 h-20 opacity-5">
                <Icon className="w-full h-full" />
              </div>

              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-white">{horizon.toUpperCase()}</span>
                    <span className="text-xs text-gray-500 bg-zinc-700/50 px-2 py-0.5 rounded">
                      {horizon === '1d' ? 'Daily' : horizon === '5d' ? 'Weekly' : 'Monthly'}
                    </span>
                  </div>
                  <Icon className={`w-6 h-6 ${data.total_return > 0 ? 'text-green-400' : 'text-red-400'}`} />
                </div>

                <div className="space-y-3">
                  <MetricBadge
                    label="Directional Accuracy"
                    value={formatPercent(data.directional_accuracy)}
                    trend={data.directional_accuracy > 0.5 ? 'up' : 'down'}
                    size="lg"
                  />
                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-zinc-700/50">
                    <MetricBadge
                      label="Sharpe Ratio"
                      value={formatNumber(data.sharpe_ratio)}
                      trend={getTrend(data.sharpe_ratio)}
                      size="md"
                    />
                    <MetricBadge
                      label="Total Return"
                      value={formatPercent(data.total_return)}
                      trend={getTrend(data.total_return)}
                      size="md"
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
