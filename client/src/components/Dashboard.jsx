import React, { useState } from 'react';
import {
  Ticket,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Building,
  TrendingUp,
  ArrowRight,
  Laptop,
  Users,
  KeyRound,
  FileSpreadsheet
} from 'lucide-react';
import PriorityBadge from './PriorityBadge';
import StatusBadge from './StatusBadge';

export default function Dashboard({
  stats,
  onNavigateToTickets,
  onSelectTicket
}) {
  const [selectedDept, setSelectedDept] = useState('All');

  if (!stats) {
    return (
      <div className="p-12 text-center text-zinc-400">
        <Clock className="h-6 w-6 animate-spin text-[#F2CE54] mx-auto mb-2" />
        <p className="text-xs">Loading metrics...</p>
      </div>
    );
  }

  const {
    totalTickets = 0,
    openTickets = 0,
    inProgressTickets = 0,
    resolvedTickets = 0,
    closedTickets = 0,
    urgentTickets = 0,
    byCategory = [],
    byDepartment = [],
    byPriority = [],
    recentTickets = []
  } = stats;

  const resolutionRate = totalTickets > 0
    ? Math.round(((resolvedTickets + closedTickets) / totalTickets) * 100)
    : 0;

  const deptConfigs = {
    IT: {
      name: 'IT Support',
      icon: Laptop,
      color: 'bg-[#705E86]/25 text-[#C8BBD8] border border-[#8874A0]/35',
      desc: 'Hardware, Laptops, VPN & Network'
    },
    HR: {
      name: 'Human Resources',
      icon: Users,
      color: 'bg-[#705E86]/25 text-[#C8BBD8] border border-[#8874A0]/35',
      desc: 'Leave policies, Payroll & Benefits'
    },
    Facilities: {
      name: 'Facilities',
      icon: Building,
      color: 'bg-[#423F4B] text-zinc-300 border border-[#504C5B]',
      desc: 'Climate control & Access cards'
    },
    Finance: {
      name: 'Finance',
      icon: FileSpreadsheet,
      color: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30',
      desc: 'Reimbursements & Invoicing'
    },
    'Access Management': {
      name: 'Access Management',
      icon: KeyRound,
      color: 'bg-[#F2CE54]/15 text-[#F7DC7C] border border-[#F2CE54]/30',
      desc: 'SSO & Permissions'
    },
  };

  const displayCategories = selectedDept === 'All'
    ? byCategory
    : byCategory.filter((c) => c.department === selectedDept);

  const displayRecentTickets = selectedDept === 'All'
    ? recentTickets
    : recentTickets.filter((t) => t.Department === selectedDept);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-[#323039] via-[#323039] to-[#3E334B]/70 rounded-2xl p-6 sm:p-7 text-white shadow-xl border border-[#504C5B]/90">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#705E86]/20 border border-[#8874A0]/30 text-[#C8BBD8] text-[11px] font-medium uppercase tracking-wider mb-2.5">
              <TrendingUp className="h-3 w-3 text-[#F2CE54]" />
              <span>Service Operations Overview</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Service Desk Operations Dashboard
            </h1>
            <p className="text-zinc-400 text-xs sm:text-sm mt-1">
              Cross-department management across IT, HR, Facilities, Finance, and Access Management.
            </p>
          </div>

          <div className="bg-[#25232B]/75 p-2 rounded-xl border border-[#504C5B]/80 flex flex-col gap-1.5 shrink-0">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 px-1">
              Department Filter
            </span>
            <div className="flex flex-wrap gap-1">
              {['All', 'IT', 'HR', 'Facilities', 'Finance', 'Access Management'].map((dept) => (
                <button
                  key={dept}
                  onClick={() => setSelectedDept(dept)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                    selectedDept === dept
                      ? 'bg-[#F2CE54] text-[#25232B] font-semibold shadow-sm'
                      : 'bg-[#3A3742] text-zinc-400 hover:bg-[#423F4B] hover:text-zinc-100'
                  }`}
                >
                  {dept}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div
          onClick={() => onNavigateToTickets({ department: selectedDept, status: 'All' })}
          className="bg-[#323039] p-5 rounded-xl border border-[#504C5B]/80 hover:border-[#8874A0]/60 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Total Tickets</span>
            <div className="p-1.5 rounded-lg bg-[#3A3742] border border-[#504C5B] text-[#C8BBD8]">
              <Ticket className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-bold text-white tracking-tight">{totalTickets}</div>
          <p className="text-[11px] text-zinc-400 group-hover:text-[#F2CE54] mt-1.5 font-medium transition-colors">
            View queue →
          </p>
        </div>

        <div
          onClick={() => onNavigateToTickets({ department: selectedDept, status: 'Open' })}
          className="bg-[#323039] p-5 rounded-xl border border-[#504C5B]/80 hover:border-[#F2CE54]/50 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Open Requests</span>
            <div className="p-1.5 rounded-lg bg-[#F2CE54]/10 border border-[#F2CE54]/25 text-[#F2CE54]">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-bold text-white tracking-tight">{openTickets}</div>
          <p className="text-[11px] text-zinc-400 mt-1.5">{inProgressTickets} in progress</p>
        </div>

        <div
          onClick={() => onNavigateToTickets({ department: selectedDept, priority: 'High' })}
          className="bg-[#323039] p-5 rounded-xl border border-[#504C5B]/80 hover:border-rose-500/50 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">High Priority</span>
            <div className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/25 text-rose-400">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-bold text-rose-400 tracking-tight">{urgentTickets}</div>
          <p className="text-[11px] text-rose-300/80 group-hover:text-rose-300 mt-1.5 font-medium transition-colors">
            Immediate focus →
          </p>
        </div>

        <div
          onClick={() => onNavigateToTickets({ department: selectedDept, status: 'Resolved' })}
          className="bg-[#323039] p-5 rounded-xl border border-[#504C5B]/80 hover:border-emerald-500/50 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Resolution Rate</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-bold text-emerald-400 tracking-tight">{resolutionRate}%</div>
          <div className="w-full bg-[#423F4B] rounded-full h-1.5 mt-2.5 overflow-hidden">
            <div
              className="bg-emerald-400 h-1.5 rounded-full transition-all"
              style={{ width: `${resolutionRate}%` }}
            />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
            Departments Workload
          </h2>
          <span className="text-xs text-zinc-500">Click a card to filter</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {['IT', 'HR', 'Facilities', 'Finance', 'Access Management'].map((deptKey) => {
            const config = deptConfigs[deptKey];
            const deptStats = byDepartment.find((d) => d.department === deptKey);
            const count = deptStats ? deptStats.count : 0;
            const percentage = totalTickets > 0 ? Math.round((count / totalTickets) * 100) : 0;
            const Icon = config.icon;

            return (
              <div
                key={deptKey}
                onClick={() => onNavigateToTickets({ department: deptKey })}
                className={`p-4 rounded-xl border bg-[#323039] transition-all cursor-pointer hover:bg-[#3A3742] hover:border-[#8874A0]/50 ${
                  selectedDept === deptKey ? 'ring-1 ring-[#F2CE54] border-[#F2CE54]' : 'border-[#504C5B]/80'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2 rounded-lg ${config.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="text-lg font-bold text-white">
                    {count}
                  </span>
                </div>

                <h3 className="font-semibold text-xs text-zinc-100">{config.name}</h3>
                <p className="text-[11px] text-zinc-500 truncate mt-0.5">{config.desc}</p>
                <div className="w-full bg-[#423F4B] rounded-full h-1 mt-3 overflow-hidden">
                  <div
                    className="bg-[#8874A0] h-1 rounded-full"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="mt-2 text-[11px] text-zinc-400 flex justify-between">
                  <span>{percentage}% share</span>
                  <span className="text-zinc-300 hover:text-[#F2CE54] font-medium">Queue →</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-[#323039] p-5 rounded-xl border border-[#504C5B]/80 space-y-4">
          <h3 className="font-semibold text-xs text-zinc-300 uppercase tracking-wider">
            Tickets by Priority
          </h3>
          <div className="grid grid-cols-3 gap-3 text-center text-xs">
            {['High', 'Medium', 'Low'].map((pLevel) => {
              const match = byPriority.find((p) => p.priority?.toLowerCase() === pLevel.toLowerCase());
              const count = match ? match.count : 0;
              return (
                <div
                  key={pLevel}
                  onClick={() => onNavigateToTickets({ priority: pLevel, department: selectedDept })}
                  className="p-3.5 rounded-xl border border-[#504C5B]/80 bg-[#3A3742]/70 hover:bg-[#3A3742] hover:border-[#8874A0]/50 cursor-pointer transition-all"
                >
                  <PriorityBadge priority={pLevel} size="sm" />
                  <div className="text-2xl font-bold mt-2 text-white">{count}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-[#323039] p-5 rounded-xl border border-[#504C5B]/80 space-y-3">
          <h3 className="font-semibold text-xs text-zinc-300 uppercase tracking-wider">
            Top Categories ({selectedDept})
          </h3>
          <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1 text-xs">
            {displayCategories.slice(0, 5).map((cat) => (
              <div
                key={cat.category}
                onClick={() => onNavigateToTickets({ department: cat.department, categoryId: cat.categoryId })}
                className="flex items-center justify-between px-2.5 py-2 rounded-lg hover:bg-[#3A3742] cursor-pointer transition-colors"
              >
                <div>
                  <span className="font-medium text-zinc-100">{cat.category}</span>
                  <span className="text-[11px] text-zinc-500 ml-2">({cat.department})</span>
                </div>
                <span className="font-semibold text-zinc-200 bg-[#423F4B] border border-[#504C5B] px-2.5 py-0.5 rounded-md text-[11px]">
                  {cat.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-[#323039] p-5 rounded-xl border border-[#504C5B]/80 space-y-3">
        <div className="flex items-center justify-between pb-1">
          <h3 className="font-semibold text-xs text-zinc-300 uppercase tracking-wider">
            Recent Service Requests
          </h3>
          <button
            onClick={() => onNavigateToTickets({ department: selectedDept })}
            className="text-xs text-zinc-300 hover:text-[#F2CE54] flex items-center gap-1 font-medium transition-colors"
          >
            <span>View all</span>
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>

        <div className="divide-y divide-[#504C5B]/70 text-xs">
          {displayRecentTickets.map((t) => (
            <div
              key={t.TicketId}
              onClick={() => onSelectTicket(t)}
              className="py-3 flex items-center justify-between gap-3 hover:bg-[#3A3742]/70 px-2.5 rounded-lg cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="font-mono font-medium text-zinc-400 shrink-0">#{t.TicketId}</span>
                <div className="min-w-0">
                  <div className="font-medium text-sm text-zinc-100 truncate">{t.Title}</div>
                  <div className="text-[11px] text-zinc-400 mt-0.5">
                    {t.Department} • {t.CategoryName} • By {t.RequesterName}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <PriorityBadge priority={t.Priority} size="sm" />
                <StatusBadge status={t.Status} size="sm" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
