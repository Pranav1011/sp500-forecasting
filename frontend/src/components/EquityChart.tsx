'use client';

import { Card } from "./ui/Card";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";

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

  return (
    <Card title={`Equity Curve - ${horizon}D Horizon`} className="col-span-2">
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <XAxis
              dataKey="Date"
              tickFormatter={formatDate}
              stroke="#666"
              tick={{ fill: '#888', fontSize: 11 }}
              interval="preserveStartEnd"
            />
            <YAxis
              stroke="#666"
              tick={{ fill: '#888', fontSize: 11 }}
              tickFormatter={formatValue}
              domain={['auto', 'auto']}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1a1a1a',
                border: '1px solid #333',
                borderRadius: '4px'
              }}
              labelStyle={{ color: '#888' }}
              formatter={(value: number) => [formatValue(value), '']}
            />
            <Legend
              wrapperStyle={{ paddingTop: '10px' }}
              formatter={(value) => <span className="text-gray-400 text-sm">{value}</span>}
            />
            <Line
              type="monotone"
              dataKey="cumulative_strategy"
              stroke="#ff6600"
              strokeWidth={2}
              dot={false}
              name="Strategy"
            />
            <Line
              type="monotone"
              dataKey="cumulative_benchmark"
              stroke="#4a9eff"
              strokeWidth={2}
              dot={false}
              name="Benchmark (S&P 500)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
