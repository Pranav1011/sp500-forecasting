'use client';

import { Card } from "./ui/Card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Info } from "lucide-react";

interface FeatureImportanceProps {
  features: Record<string, number>;
  horizon: number;
}

// Feature name explanations
const FEATURE_EXPLANATIONS: Record<string, string> = {
  'xle_open': 'Energy sector ETF opening price',
  'sma_50': '50-day Simple Moving Average',
  'sma_200': '200-day Simple Moving Average',
  'ema_10': '10-day Exponential Moving Average',
  'ema_200': '200-day Exponential Moving Average',
  'volatility_5': '5-day rolling volatility',
  'volatility_20': '20-day rolling volatility',
  'xlf_high': 'Financial sector ETF high price',
  'usd_index_low': 'US Dollar Index low',
  'bb_upper': 'Bollinger Band upper limit',
  'vix_sma_10': 'VIX 10-day moving average',
  'rsi_14': '14-day Relative Strength Index',
  'macd': 'MACD momentum indicator',
};

export function FeatureImportance({ features, horizon }: FeatureImportanceProps) {
  const data = Object.entries(features)
    .slice(0, 10)
    .map(([name, value], index) => ({
      name: name.length > 12 ? name.slice(0, 12) + '…' : name,
      fullName: name,
      explanation: FEATURE_EXPLANATIONS[name] || name,
      value: value,
      index
    }));

  const maxValue = Math.max(...data.map(d => d.value));

  return (
    <Card title={`Top Features - ${horizon}D`} accent="orange">
      {/* Explanation banner */}
      <div className="flex items-start gap-2 mb-3 p-2.5 bg-zinc-800/50 rounded-lg border border-zinc-700/50">
        <Info className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-gray-400 leading-relaxed">
          <span className="text-gray-300 font-medium">Feature importance</span> shows which inputs the XGBoost model relies on most for predictions. Higher values = more influence on the forecast.
        </p>
      </div>

      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 0, right: 20, top: 5, bottom: 5 }}>
            <XAxis
              type="number"
              stroke="#444"
              tick={{ fill: '#666', fontSize: 10 }}
              axisLine={{ stroke: '#333' }}
              domain={[0, maxValue * 1.1]}
              tickFormatter={(v) => v.toFixed(2)}
            />
            <YAxis
              type="category"
              dataKey="name"
              stroke="#444"
              tick={{ fill: '#888', fontSize: 10 }}
              width={85}
              axisLine={{ stroke: '#333' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1a1a1a',
                border: '1px solid #333',
                borderRadius: '8px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
                padding: '12px'
              }}
              formatter={(value) => [(value as number).toFixed(4), 'Importance Score']}
              labelFormatter={(_, payload) => {
                const item = payload?.[0]?.payload;
                return item ? `${item.fullName}\n${item.explanation}` : '';
              }}
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
