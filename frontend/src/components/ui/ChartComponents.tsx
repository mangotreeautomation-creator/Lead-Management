'use client';

import React, { useState } from 'react';
import { formatCurrency, formatNumber } from '../../utils/formatters';

interface AreaChartDataPoint {
  label?: string;
  date?: string;
  value: number;
  secondaryValue?: number;
}

export const AreaChart: React.FC<{
  data: AreaChartDataPoint[];
  height?: number;
  color?: string;
}> = ({ data, height = 220, color = '#6366f1' }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!data || data.length === 0) return null;

  const maxValue = Math.max(...data.map(d => Math.max(d.value, d.secondaryValue || 0)), 100);
  const paddingX = 40;
  const paddingY = 25;
  const width = 680;
  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;

  const points = data.map((d, i) => {
    const x = paddingX + (i / Math.max(data.length - 1, 1)) * chartWidth;
    const y = height - paddingY - (d.value / maxValue) * chartHeight;
    return { x, y, data: d };
  });

  const pathD = points.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`;

  return (
    <div className="relative w-full overflow-hidden">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full overflow-visible"
        style={{ maxHeight: height }}
      >
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.35" />
            <stop offset="100%" stopColor={color} stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Horizontal grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
          const y = height - paddingY - pct * chartHeight;
          return (
            <g key={i}>
              <line
                x1={paddingX}
                y1={y}
                x2={width - paddingX}
                y2={y}
                stroke="currentColor"
                strokeDasharray="4 4"
                className="text-slate-200 dark:text-slate-800"
                strokeWidth="1"
              />
              <text
                x={paddingX - 8}
                y={y + 3}
                textAnchor="end"
                className="fill-slate-400 text-[9px] font-medium"
              >
                {formatNumber(Math.round(maxValue * pct))}
              </text>
            </g>
          );
        })}

        {/* Gradient Area */}
        <path d={areaD} fill="url(#areaGrad)" />

        {/* Line */}
        <path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Interactive hover points */}
        {points.map((p, i) => (
          <g
            key={i}
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}
            className="cursor-pointer"
          >
            <circle
              cx={p.x}
              cy={p.y}
              r={hoveredIndex === i ? 5.5 : 3}
              fill={color}
              stroke="#ffffff"
              strokeWidth="2"
              className="transition-all duration-150"
            />
            <rect
              x={p.x - 12}
              y={0}
              width={24}
              height={height}
              fill="transparent"
            />
          </g>
        ))}
      </svg>

      {/* Hover tooltip */}
      {hoveredIndex !== null && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-lg border border-slate-200 bg-slate-900/95 px-3 py-1.5 text-xs text-white shadow-xl dark:border-slate-700"
          style={{
            left: `${(points[hoveredIndex].x / width) * 100}%`,
            top: `${(points[hoveredIndex].y / height) * 100 - 8}%`
          }}
        >
          <p className="text-[10px] text-slate-400">{data[hoveredIndex].label || data[hoveredIndex].date}</p>
          <p className="font-bold text-emerald-400">{formatCurrency(data[hoveredIndex].value)}</p>
          {data[hoveredIndex].secondaryValue !== undefined && (
            <p className="text-[10px] text-slate-300">
              Count: {formatNumber(data[hoveredIndex].secondaryValue)}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export const RevenueAreaChart = AreaChart;

// Horizontal Comparison Bar
export const HorizontalBar: React.FC<{
  items: Array<{ label: string; value: number; color?: string; sublabel?: string }>;
}> = ({ items }) => {
  const total = items.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="space-y-3.5">
      {items.map((item, idx) => {
        const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
        return (
          <div key={idx} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-800 dark:text-slate-200">{item.label}</span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(item.value)}</span>
                <span className="text-[10px] text-slate-400 font-medium">({pct}%)</span>
              </div>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${pct}%`, backgroundColor: item.color || '#6366f1' }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export const HorizontalComparisonBar: React.FC<{
  label: string;
  sublabel?: string;
  value: number;
  total: number;
  formattedValue: string;
  color?: string;
}> = ({ label, sublabel, value, total, formattedValue, color = 'bg-brand-500' }) => {
  const percentage = total > 0 ? Math.min(Math.round((value / total) * 100), 100) : 0;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-slate-800 dark:text-slate-200">{label}</span>
        <span className="font-semibold text-slate-900 dark:text-white">{formattedValue}</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {sublabel && (
        <div className="flex justify-between text-[10px] text-slate-400">
          <span>{sublabel}</span>
          <span>{percentage}% share</span>
        </div>
      )}
    </div>
  );
};

// Funnel Chart
export const FunnelChart: React.FC<{
  steps: Array<{ label: string; count: number; conversionRate: number }>;
}> = ({ steps }) => {
  return (
    <div className="space-y-2.5">
      {steps.map((step, idx) => {
        return (
          <div key={idx} className="relative flex items-center gap-3 rounded-xl border border-slate-100 p-2.5 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/20">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-xs font-bold text-white shadow-sm">
              {idx + 1}
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-800 dark:text-slate-200">{step.label}</span>
                <span className="text-slate-900 dark:text-white">{formatNumber(step.count)}</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200/80 dark:bg-slate-700">
                <div
                  className="h-full rounded-full bg-brand-500 transition-all duration-500"
                  style={{ width: `${Math.min(step.conversionRate, 100)}%` }}
                />
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {step.conversionRate}%
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export const FunnelStep: React.FC<{
  stepNumber: number;
  title: string;
  count: number;
  percentage: number;
  amount?: number;
  color: string;
}> = ({ stepNumber, title, count, percentage, amount, color }) => {
  return (
    <div className="relative flex items-center gap-4 rounded-lg border border-slate-100 p-3 dark:border-slate-800/80">
      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg font-bold text-white ${color}`}>
        {stepNumber}
      </div>
      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-slate-800 dark:text-slate-200">{title}</span>
          <span className="text-slate-900 dark:text-white">{formatNumber(count)}</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className={`h-full rounded-full transition-all duration-500 ${color}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
      <div className="text-right">
        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
          {percentage.toFixed(1)}%
        </span>
        {amount !== undefined && (
          <p className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
            {formatCurrency(amount)}
          </p>
        )}
      </div>
    </div>
  );
};
