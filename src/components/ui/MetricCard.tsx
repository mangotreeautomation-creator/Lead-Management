import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subValue?: string;
  subtitle?: string;
  trend?: {
    value: string | number;
    isPositive: boolean;
  };
  icon?: any;
  iconColor?: string;
  description?: string;
  onClick?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subValue,
  subtitle,
  trend,
  icon,
  iconColor = 'indigo',
  description,
  onClick
}) => {
  const iconThemes: Record<string, string> = {
    emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    blue: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    indigo: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
    amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    rose: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
    purple: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20'
  };

  const themeClass = iconThemes[iconColor] || iconThemes.indigo;

  // Render icon properly whether passed as React element or component function
  const renderIcon = () => {
    if (!icon) return null;
    if (React.isValidElement(icon)) {
      return icon;
    }
    const IconComponent = icon as any;
    return <IconComponent className="h-5 w-5" />;
  };

  const formattedTrendValue = trend
    ? typeof trend.value === 'number'
      ? `${trend.value > 0 ? '+' : ''}${trend.value}%`
      : trend.value
    : null;

  return (
    <div
      onClick={onClick}
      className={`group relative overflow-hidden rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm transition-all duration-200 hover:border-slate-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/90 dark:hover:border-slate-700 ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate max-w-[130px]">
            {title}
          </p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              {value}
            </span>
            {subValue && (
              <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                {subValue}
              </span>
            )}
          </div>
        </div>

        {icon && (
          <div className={`rounded-lg border p-2 transition-transform duration-200 group-hover:scale-105 shrink-0 ${themeClass}`}>
            {renderIcon()}
          </div>
        )}
      </div>

      {(trend || subtitle || description) && (
        <div className="mt-2.5 flex items-center justify-between border-t border-slate-100 pt-2 text-[11px] dark:border-slate-800/80">
          {trend && (
            <span
              className={`inline-flex items-center gap-0.5 font-semibold ${
                trend.isPositive
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {trend.isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              {formattedTrendValue}
            </span>
          )}

          {(subtitle || description) && (
            <span className="text-slate-400 truncate ml-auto">
              {subtitle || description}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
