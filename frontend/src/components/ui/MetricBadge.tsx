import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface MetricBadgeProps {
  label: string;
  value: string | number;
  trend?: 'up' | 'down' | 'neutral';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

export function MetricBadge({
  label,
  value,
  trend = 'neutral',
  size = 'md',
  showIcon = false,
  className
}: MetricBadgeProps) {
  const trendConfig = {
    up: { color: 'text-green-400', glow: 'glow-green', Icon: TrendingUp },
    down: { color: 'text-red-400', glow: 'glow-red', Icon: TrendingDown },
    neutral: { color: 'text-gray-300', glow: '', Icon: Minus }
  };

  const sizeConfig = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl'
  };

  const { color, glow, Icon } = trendConfig[trend];

  return (
    <div className={cn("flex flex-col gap-0.5", className)}>
      <span className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">{label}</span>
      <div className="flex items-center gap-1.5">
        <span className={cn("font-mono font-bold", sizeConfig[size], color, glow)}>
          {value}
        </span>
        {showIcon && <Icon className={cn("w-3.5 h-3.5", color)} />}
      </div>
    </div>
  );
}
