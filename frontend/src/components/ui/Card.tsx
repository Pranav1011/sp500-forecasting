import { cn } from "@/lib/utils";

interface CardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function Card({ title, children, className }: CardProps) {
  return (
    <div className={cn("bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden", className)}>
      <div className="px-4 py-2 bg-zinc-800 border-b border-zinc-700">
        <h3 className="text-sm font-semibold text-orange-500 uppercase tracking-wide">{title}</h3>
      </div>
      <div className="p-4">
        {children}
      </div>
    </div>
  );
}
