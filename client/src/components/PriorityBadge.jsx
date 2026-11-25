import React from 'react';

export default function PriorityBadge({ priority, size = 'md' }) {
  const p = priority ? priority.toLowerCase() : 'low';

  const config = {
    high: {
      bg: 'bg-rose-500/10',
      text: 'text-rose-300',
      border: 'border-rose-500/25',
      dot: 'bg-rose-400',
      label: 'High',
    },
    critical: {
      bg: 'bg-rose-500/15',
      text: 'text-rose-200',
      border: 'border-rose-500/35',
      dot: 'bg-rose-400',
      label: 'Critical',
    },
    medium: {
      bg: 'bg-[#F2CE54]/15',
      text: 'text-[#F7DC7C]',
      border: 'border-[#F2CE54]/35',
      dot: 'bg-[#F2CE54]',
      label: 'Medium',
    },
    low: {
      bg: 'bg-zinc-500/10',
      text: 'text-zinc-300',
      border: 'border-zinc-500/25',
      dot: 'bg-zinc-400',
      label: 'Low',
    },
  };

  const current = config[p] || config.low;
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-md border ${current.bg} ${current.text} ${current.border} ${sizeClasses}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${current.dot}`} />
      <span>{current.label}</span>
    </span>
  );
}
