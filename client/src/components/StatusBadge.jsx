import React from 'react';

export default function StatusBadge({ status, size = 'md' }) {
  const s = status ? status.toLowerCase() : 'open';

  const config = {
    open: {
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-200',
      label: 'Open',
    },
    assigned: {
      bg: 'bg-indigo-50',
      text: 'text-indigo-700',
      border: 'border-indigo-200',
      label: 'Assigned',
    },
    'in progress': {
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-200',
      label: 'In Progress',
    },
    pending: {
      bg: 'bg-purple-50',
      text: 'text-purple-700',
      border: 'border-purple-200',
      label: 'Pending',
    },
    resolved: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
      label: 'Resolved',
    },
    closed: {
      bg: 'bg-slate-100',
      text: 'text-slate-700',
      border: 'border-slate-200',
      label: 'Closed',
    },
  };

  const current = config[s] || config.open;
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center font-medium rounded border ${current.bg} ${current.text} ${current.border} ${sizeClasses}`}
    >
      {current.label}
    </span>
  );
}
