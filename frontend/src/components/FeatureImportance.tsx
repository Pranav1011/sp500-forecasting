'use client';

import { Card } from "./ui/Card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface FeatureImportanceProps {
  features: Record<string, number>;
  horizon: number;
}

export function FeatureImportance({ features, horizon }: FeatureImportanceProps) {
  const data = Object.entries(features)
    .slice(0, 10)
    .map(([name, value]) => ({
      name: name.length > 15 ? name.slice(0, 15) + '...' : name,
      fullName: name,
      value: value
    }));

  return (
    <Card title={`Top Features - ${horizon}D`}>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 80, right: 20 }}>
            <XAxis type="number" stroke="#666" tick={{ fill: '#888', fontSize: 10 }} />
            <YAxis
              type="category"
              dataKey="name"
              stroke="#666"
              tick={{ fill: '#888', fontSize: 11 }}
              width={75}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1a1a1a',
                border: '1px solid #333',
                borderRadius: '4px'
              }}
              formatter={(value: number) => [value.toFixed(4), 'Importance']}
              labelFormatter={(label, payload) => payload?.[0]?.payload?.fullName || label}
            />
            <Bar dataKey="value" fill="#ff6600" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
