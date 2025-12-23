'use client';

import { Card } from "./ui/Card";
import { XAxis, YAxis, Tooltip, ResponsiveContainer, Area, ComposedChart } from "recharts";
import { Info } from "lucide-react";

interface EquityData {
  Date?: string;
  cumulative_strategy: number;
  cumulative_benchmark: number;
}

interface EquityChartProps {
  data: EquityData[];
  horizon: number;
}

export function EquityChart({ data, horizon }: EquityChartProps) {
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
  };

  const formatValue = (value: number) => value.toFixed(2);

  // Calculate final values for display
  const finalStrategy = data.length > 0 ? data[data.length - 1].cumulative_strategy : 0;
  const finalBenchmark = data.length > 0 ? data[data.length - 1].cumulative_benchmark : 0;
  const outperformance = finalStrategy - finalBenchmark;

  return (
    <Card title={`Equity Curve - ${horizon}D Horizon`} className="col-span-2" accent="blue">
      {/* Explanation banner */}
      <div className="flex items-start gap-2 mb-4 p-3 bg-zinc-800/50 rounded-lg border border-zinc-700/50">
        <Info className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-gray-400 leading-relaxed">
          <span className="text-gray-300 font-medium">Equity curve</span> shows how $1 invested would have grown over time.
          <span className="text-orange-400"> Orange line</span> = our ML strategy.
          <span className="text-blue-400"> Blue line</span> = buy-and-hold S&P 500.
          Values are multipliers (e.g., 2.0 = doubled your money).
        </p>
      </div>

      {/* Legend with values */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-6 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-orange-500"></div>
            <span className="text-gray-400">Strategy</span>
            <span className="font-mono text-orange-400">{formatValue(finalStrategy)}x</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-blue-500"></div>
            <span className="text-gray-400">Benchmark (S&P 500)</span>
            <span className="font-mono text-blue-400">{formatValue(finalBenchmark)}x</span>
          </div>
        </div>
        <div className={`text-xs font-mono px-2 py-1 rounded ${outperformance > 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
          {outperformance > 0 ? '+' : ''}{formatValue(outperformance)} vs benchmark
        </div>
      </div>

      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="strategyGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ff6600" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#ff6600" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="benchmarkGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis
              dataKey="Date"
              tickFormatter={formatDate}
              stroke="#444"
              tick={{ fill: '#666', fontSize: 10 }}
              interval="preserveStartEnd"
              axisLine={{ stroke: '#333' }}
            />
            <YAxis
              stroke="#444"
              tick={{ fill: '#666', fontSize: 10 }}
              tickFormatter={(v) => `${v}x`}
              domain={['auto', 'auto']}
              axisLine={{ stroke: '#333' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1a1a1a',
                border: '1px solid #333',
                borderRadius: '8px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
              }}
              labelStyle={{ color: '#888', marginBottom: '8px' }}
              formatter={(value, name) => [
                `${formatValue(value as number)}x`,
                name === 'cumulative_strategy' ? 'Strategy' : 'Benchmark (S&P 500)'
              ]}
            />
            <Area
              type="monotone"
              dataKey="cumulative_benchmark"
              stroke="#3b82f6"
              strokeWidth={2}
              fill="url(#benchmarkGradient)"
              dot={false}
            />
            <Area
              type="monotone"
              dataKey="cumulative_strategy"
              stroke="#ff6600"
              strokeWidth={2}
              fill="url(#strategyGradient)"
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
