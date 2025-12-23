'use client';

import { Card } from "./ui/Card";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, Area, ComposedChart } from "recharts";

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

  return (
    <Card title={`Equity Curve - ${horizon}D Horizon`} className="col-span-2" accent="blue">
      <div className="flex items-center gap-6 mb-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-0.5 bg-orange-500"></div>
          <span className="text-gray-400">Strategy</span>
          <span className="font-mono text-orange-400">{formatValue(finalStrategy)}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-0.5 bg-blue-500"></div>
          <span className="text-gray-400">Benchmark</span>
          <span className="font-mono text-blue-400">{formatValue(finalBenchmark)}</span>
        </div>
      </div>
      <div className="h-64">
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
              tickFormatter={formatValue}
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
              formatter={(value: number, name: string) => [
                formatValue(value),
                name === 'cumulative_strategy' ? 'Strategy' : 'Benchmark'
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
