'use client';

import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

interface ShopifyMetricCardProps {
  title: string;
  tooltipText?: string;
  value: string;
  trend?: {
    value: string;
    isPositive: boolean;
    periodText?: string;
  };
  subtitle?: string;
  sparklineData?: number[];
  sparklineColor?: string;
  onClick?: () => void;
  className?: string;
}

export const ShopifyMetricCard: React.FC<ShopifyMetricCardProps> = ({
  title,
  tooltipText,
  value,
  trend,
  subtitle,
  sparklineData = [12, 19, 15, 25, 22, 30, 28, 38, 45],
  sparklineColor = '#2c6ecb',
  onClick,
  className = ''
}) => {
  // Generate SVG path for mini sparkline (like Shopify Analytics)
  const min = Math.min(...sparklineData);
  const max = Math.max(...sparklineData);
  const range = max - min || 1;
  const width = 80;
  const height = 32;

  const points = sparklineData.map((val, idx) => {
    const x = (idx / (sparklineData.length - 1)) * width;
    const y = height - ((val - min) / range) * (height - 6) - 3;
    return `${x},${y}`;
  });

  const pathD = `M ${points.join(' L ')}`;
  const areaD = `M ${points[0]} L ${points.join(' L ')} L ${width},${height} L 0,${height} Z`;

  return (
    <div
      onClick={onClick}
      className={`group relative rounded-xl border border-[#e1e3e5] bg-white p-4 shadow-shopify dark:border-[#27272a] dark:bg-[#18181b] shopify-interactive hover:border-slate-300 dark:hover:border-slate-700 ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
    >
      <div className="flex items-start justify-between">
        {/* Metric Label with Shopify-style dotted underline */}
        <div>
          <span
            className="dotted-tooltip text-[13px] font-medium text-[#616161] dark:text-[#a1a1aa]"
            title={tooltipText || title}
          >
            {title}
          </span>
        </div>

        {/* Mini Sparkline Chart (Shopify signature aesthetic) */}
        <div className="h-8 w-20 flex-shrink-0">
          <svg viewBox={`0 0 ${width} ${height}`} className="overflow-visible h-full w-full">
            <defs>
              <linearGradient id={`sparkGrad-${title.replace(/[^a-zA-Z]/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={sparklineColor} stopOpacity="0.25" />
                <stop offset="100%" stopColor={sparklineColor} stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <path
              d={areaD}
              fill={`url(#sparkGrad-${title.replace(/[^a-zA-Z]/g, '')})`}
            />
            <path
              d={pathD}
              fill="none"
              stroke={sparklineColor}
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      {/* Main KPI Value */}
      <div className="mt-2 flex items-baseline gap-2">
        <h3 className="text-[22px] font-semibold tracking-tight text-[#1a1a1a] dark:text-white">
          {value}
        </h3>

        {/* Trend Indicator */}
        {trend && (
          <span
            className={`flex items-center text-xs font-medium ${
              trend.isPositive
                ? 'text-[#008060] dark:text-emerald-400'
                : 'text-[#de3618] dark:text-rose-400'
            }`}
          >
            {trend.isPositive ? (
              <ArrowUpRight className="h-3.5 w-3.5 mr-0.5" />
            ) : (
              <ArrowDownRight className="h-3.5 w-3.5 mr-0.5" />
            )}
            <span>{trend.value}</span>
          </span>
        )}
      </div>

      {/* Subtitle / Context */}
      {subtitle && (
        <p className="mt-1 text-[11px] text-[#8c8c8c] dark:text-[#71717a] truncate">
          {subtitle}
        </p>
      )}
    </div>
  );
};
