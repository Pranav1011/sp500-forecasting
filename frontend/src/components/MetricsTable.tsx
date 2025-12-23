'use client';

import { Card } from "./ui/Card";

interface ModelMetrics {
  mae: number;
  directional_accuracy: number;
}

interface BacktestMetrics {
  sharpe_ratio: number;
  max_drawdown: number;
  total_return: number;
  win_rate: number;
}

interface HorizonMetrics {
  xgboost: ModelMetrics;
  rf: ModelMetrics;
  ridge: ModelMetrics;
  ensemble: ModelMetrics;
  backtest: BacktestMetrics;
}

interface MetricsTableProps {
  metrics: Record<string, HorizonMetrics>;
}

export function MetricsTable({ metrics }: MetricsTableProps) {
  const models = ['xgboost', 'rf', 'ridge', 'ensemble'];
  const horizons = ['1d', '5d', '20d'];

  const formatPercent = (value: number) => `${(value * 100).toFixed(1)}%`;
  const formatNumber = (value: number) => value.toFixed(4);

  return (
    <Card title="Model Comparison" className="col-span-3">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-700">
              <th className="text-left py-2 px-3 text-gray-400 font-medium">Model</th>
              {horizons.map(h => (
                <th key={h} colSpan={2} className="text-center py-2 px-3 text-orange-500 font-medium border-l border-zinc-700">
                  {h.toUpperCase()}
                </th>
              ))}
            </tr>
            <tr className="border-b border-zinc-800">
              <th className="text-left py-1 px-3 text-gray-500 text-xs">-</th>
              {horizons.map(h => (
                <>
                  <th key={`${h}-mae`} className="text-right py-1 px-2 text-gray-500 text-xs border-l border-zinc-800">MAE</th>
                  <th key={`${h}-acc`} className="text-right py-1 px-2 text-gray-500 text-xs">Dir Acc</th>
                </>
              ))}
            </tr>
          </thead>
          <tbody>
            {models.map((model) => (
              <tr key={model} className="border-b border-zinc-800 hover:bg-zinc-800/50">
                <td className="py-2 px-3 font-medium text-white capitalize">{model}</td>
                {horizons.map(h => {
                  const data = metrics[h]?.[model as keyof HorizonMetrics] as ModelMetrics | undefined;
                  return (
                    <>
                      <td key={`${h}-${model}-mae`} className="text-right py-2 px-2 font-mono text-gray-300 border-l border-zinc-800">
                        {data ? formatNumber(data.mae) : '-'}
                      </td>
                      <td key={`${h}-${model}-acc`} className="text-right py-2 px-2 font-mono text-gray-300">
                        {data ? formatPercent(data.directional_accuracy) : '-'}
                      </td>
                    </>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
