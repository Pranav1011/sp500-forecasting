import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus, Info } from "lucide-react";

interface MetricBadgeProps {
  label: string;
  value: string | number;
  trend?: 'up' | 'down' | 'neutral';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  tooltip?: string;
  className?: string;
}

export function MetricBadge({
  label,
  value,
  trend = 'neutral',
  size = 'md',
  showIcon = false,
  tooltip,
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
    <div className={cn("flex flex-col gap-0.5 group relative", className)}>
      <span className="text-[10px] text-gray-500 uppercase tracking-wider font-medium flex items-center gap-1">
        {label}
        {tooltip && (
          <span className="relative">
            <Info className="w-3 h-3 text-gray-600 cursor-help hover:text-gray-400 transition-colors" />
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-xs text-gray-300 normal-case tracking-normal font-normal w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 shadow-xl">
              {tooltip}
              <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-zinc-700"></span>
            </span>
          </span>
        )}
      </span>
      <div className="flex items-center gap-1.5">
        <span className={cn("font-mono font-bold", sizeConfig[size], color, glow)}>
          {value}
        </span>
        {showIcon && <Icon className={cn("w-3.5 h-3.5", color)} />}
      </div>
    </div>
  );
}
