import { cn } from "@/lib/utils";

interface MetricBadgeProps {
  label: string;
  value: string | number;
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
}

export function MetricBadge({ label, value, trend = 'neutral', className }: MetricBadgeProps) {
  const trendColors = {
    up: 'text-green-400',
    down: 'text-red-400',
    neutral: 'text-gray-300'
  };

  return (
    <div className={cn("flex flex-col", className)}>
      <span className="text-xs text-gray-500 uppercase tracking-wide">{label}</span>
      <span className={cn("text-lg font-mono font-bold", trendColors[trend])}>
        {value}
      </span>
    </div>
  );
}
