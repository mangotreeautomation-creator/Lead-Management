import React from 'react';

export type BadgeVariant =
  | 'emerald'
  | 'amber'
  | 'rose'
  | 'blue'
  | 'indigo'
  | 'purple'
  | 'slate'
  | 'zinc'
  | 'primary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'neutral'
  | 'info';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'slate',
  size = 'sm',
  dot = false
}) => {
  // Normalize semantic variants to color keys
  const normalizedVariant = (() => {
    switch (variant) {
      case 'primary': return 'indigo';
      case 'success': return 'emerald';
      case 'warning': return 'amber';
      case 'danger': return 'rose';
      case 'info': return 'blue';
      case 'neutral': return 'slate';
      default: return variant;
    }
  })();

  const styles: Record<string, { bg: string; text: string; dot: string; border: string }> = {
    emerald: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/40',
      text: 'text-emerald-700 dark:text-emerald-400',
      dot: 'bg-emerald-500',
      border: 'border-emerald-200 dark:border-emerald-800/60'
    },
    amber: {
      bg: 'bg-amber-50 dark:bg-amber-950/40',
      text: 'text-amber-700 dark:text-amber-400',
      dot: 'bg-amber-500',
      border: 'border-amber-200 dark:border-amber-800/60'
    },
    rose: {
      bg: 'bg-rose-50 dark:bg-rose-950/40',
      text: 'text-rose-700 dark:text-rose-400',
      dot: 'bg-rose-500',
      border: 'border-rose-200 dark:border-rose-800/60'
    },
    blue: {
      bg: 'bg-blue-50 dark:bg-blue-950/40',
      text: 'text-blue-700 dark:text-blue-400',
      dot: 'bg-blue-500',
      border: 'border-blue-200 dark:border-blue-800/60'
    },
    indigo: {
      bg: 'bg-indigo-50 dark:bg-indigo-950/40',
      text: 'text-indigo-700 dark:text-indigo-400',
      dot: 'bg-indigo-500',
      border: 'border-indigo-200 dark:border-indigo-800/60'
    },
    purple: {
      bg: 'bg-purple-50 dark:bg-purple-950/40',
      text: 'text-purple-700 dark:text-purple-400',
      dot: 'bg-purple-500',
      border: 'border-purple-200 dark:border-purple-800/60'
    },
    slate: {
      bg: 'bg-slate-100 dark:bg-slate-800/60',
      text: 'text-slate-700 dark:text-slate-300',
      dot: 'bg-slate-500',
      border: 'border-slate-200 dark:border-slate-700'
    },
    zinc: {
      bg: 'bg-zinc-100 dark:bg-zinc-800/60',
      text: 'text-zinc-700 dark:text-zinc-300',
      dot: 'bg-zinc-500',
      border: 'border-zinc-200 dark:border-zinc-700'
    }
  };

  const current = styles[normalizedVariant] || styles.slate;
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${current.bg} ${current.text} ${current.border} ${sizeClasses}`}
    >
      {dot && (
        <span className={`h-1.5 w-1.5 rounded-full ${current.dot}`} />
      )}
      {children}
    </span>
  );
};
