import React from 'react';

export default function StatusBadge({ status, size = 'md' }) {
  const s = status ? status.toLowerCase() : 'open';

  const config = {
    open: {
      bg: 'bg-[#F2CE54]/10',
      text: 'text-[#F7DC7C]',
      border: 'border-[#F2CE54]/25',
      label: 'Open',
    },
    assigned: {
      bg: 'bg-[#705E86]/25',
      text: 'text-[#C8BBD8]',
      border: 'border-[#8874A0]/35',
      label: 'Assigned',
    },
    'in progress': {
      bg: 'bg-amber-500/10',
      text: 'text-amber-300',
      border: 'border-amber-500/25',
      label: 'In Progress',
    },
    pending: {
      bg: 'bg-[#604F74]/30',
      text: 'text-purple-200',
      border: 'border-[#A795BD]/30',
      label: 'Pending',
    },
    resolved: {
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-300',
      border: 'border-emerald-500/25',
      label: 'Resolved',
    },
    closed: {
      bg: 'bg-zinc-700/30',
      text: 'text-zinc-300',
      border: 'border-zinc-600/40',
      label: 'Closed',
    },
  };

  const current = config[s] || config.open;
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center font-medium rounded-md border ${current.bg} ${current.text} ${current.border} ${sizeClasses}`}
    >
      {current.label}
    </span>
  );
}
