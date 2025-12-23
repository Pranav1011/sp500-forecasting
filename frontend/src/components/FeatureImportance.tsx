'use client';

import { Card } from "./ui/Card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface FeatureImportanceProps {
  features: Record<string, number>;
  horizon: number;
}

export function FeatureImportance({ features, horizon }: FeatureImportanceProps) {
  const data = Object.entries(features)
    .slice(0, 10)
    .map(([name, value], index) => ({
      name: name.length > 12 ? name.slice(0, 12) + '…' : name,
      fullName: name,
      value: value,
      index
    }));

  const maxValue = Math.max(...data.map(d => d.value));

  return (
    <Card title={`Top Features - ${horizon}D`} accent="orange">
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 0, right: 20, top: 5, bottom: 5 }}>
            <XAxis
              type="number"
              stroke="#444"
              tick={{ fill: '#666', fontSize: 10 }}
              axisLine={{ stroke: '#333' }}
              domain={[0, maxValue * 1.1]}
            />
            <YAxis
              type="category"
              dataKey="name"
              stroke="#444"
              tick={{ fill: '#888', fontSize: 11 }}
              width={90}
              axisLine={{ stroke: '#333' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1a1a1a',
                border: '1px solid #333',
                borderRadius: '8px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
              }}
              formatter={(value: number) => [value.toFixed(4), 'Importance']}
              labelFormatter={(_, payload) => payload?.[0]?.payload?.fullName || ''}
              cursor={{ fill: 'rgba(255,102,0,0.1)' }}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={`rgba(255, 102, 0, ${1 - index * 0.08})`}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
