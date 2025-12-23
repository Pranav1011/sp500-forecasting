import { cn } from "@/lib/utils";

interface CardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  accent?: 'orange' | 'green' | 'red' | 'blue';
}

export function Card({ title, children, className, accent = 'orange' }: CardProps) {
  const accentColors = {
    orange: 'text-orange-500',
    green: 'text-green-500',
    red: 'text-red-500',
    blue: 'text-blue-500',
  };

  return (
    <div className={cn(
      "bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-lg overflow-hidden card-hover",
      className
    )}>
      <div className="px-4 py-2.5 bg-gradient-to-r from-zinc-800 to-zinc-800/50 border-b border-zinc-700/50">
        <h3 className={cn("text-xs font-semibold uppercase tracking-wider", accentColors[accent])}>
          {title}
        </h3>
      </div>
      <div className="p-4">
        {children}
      </div>
    </div>
  );
}
