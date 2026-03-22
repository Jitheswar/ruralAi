import type { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  iconColor?: string;
  iconBg?: string;
}

export default function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  iconColor = 'text-primary',
  iconBg = 'bg-primary/10',
}: StatsCardProps) {
  return (
    <div className="bg-card text-card-foreground rounded-xl shadow-sm border border-border p-5 transition-all duration-200 hover:shadow-md hover:border-border/80">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold tracking-tight">{value}</p>
            {trend && (
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${trend.startsWith('+')
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'
                  : 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400'
                }`}>
                {trend}
              </span>
            )}
          </div>
        </div>
        <div className={`p-2.5 rounded-xl ${iconBg}`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
      </div>
    </div>
  );
}
