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
      <div className="p-12 text-center text-slate-500">
        <Clock className="h-6 w-6 animate-spin text-blue-600 mx-auto mb-2" />
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
      color: 'bg-blue-600',
      desc: 'Hardware, Laptops, VPN & Network'
    },
    HR: {
      name: 'Human Resources',
      icon: Users,
      color: 'bg-indigo-600',
      desc: 'Leave policies, Payroll & Benefits'
    },
    Facilities: {
      name: 'Facilities',
      icon: Building,
      color: 'bg-slate-700',
      desc: 'Climate control & Access cards'
    },
    Finance: {
      name: 'Finance',
      icon: FileSpreadsheet,
      color: 'bg-emerald-600',
      desc: 'Reimbursements & Invoicing'
    },
    'Access Management': {
      name: 'Access Management',
      icon: KeyRound,
      color: 'bg-violet-600',
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
    <div className="space-y-5">
      <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px] font-medium uppercase tracking-wider mb-2">
              <TrendingUp className="h-3 w-3" />
              <span>Service Operations Overview</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              Service Desk Operations Dashboard
            </h1>
            <p className="text-slate-400 text-xs mt-1">
              Cross-department management across IT, HR, Facilities, Finance, and Access Management.
            </p>
          </div>

          <div className="bg-slate-800 p-2.5 rounded-xl border border-slate-700 flex flex-col gap-1 shrink-0">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Department Filter:
            </span>
            <div className="flex flex-wrap gap-1">
              {['All', 'IT', 'HR', 'Facilities', 'Finance', 'Access Management'].map((dept) => (
                <button
                  key={dept}
                  onClick={() => setSelectedDept(dept)}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                    selectedDept === dept
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {dept}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div
          onClick={() => onNavigateToTickets({ department: selectedDept, status: 'All' })}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-slate-300 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Tickets</span>
            <Ticket className="h-4 w-4 text-blue-600" />
          </div>
          <div className="mt-3 text-2xl font-bold text-slate-900">{totalTickets}</div>
          <p className="text-[11px] text-blue-600 mt-1 font-medium">View queue →</p>
        </div>

        <div
          onClick={() => onNavigateToTickets({ department: selectedDept, status: 'Open' })}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-slate-300 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Open Requests</span>
            <Clock className="h-4 w-4 text-amber-600" />
          </div>
          <div className="mt-3 text-2xl font-bold text-slate-900">{openTickets}</div>
          <p className="text-[11px] text-slate-500 mt-1">{inProgressTickets} in progress</p>
        </div>

        <div
          onClick={() => onNavigateToTickets({ department: selectedDept, priority: 'High' })}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-slate-300 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">High Priority</span>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </div>
          <div className="mt-3 text-2xl font-bold text-red-600">{urgentTickets}</div>
          <p className="text-[11px] text-red-600 mt-1 font-medium">Immediate focus →</p>
        </div>

        <div
          onClick={() => onNavigateToTickets({ department: selectedDept, status: 'Resolved' })}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-slate-300 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Resolution Rate</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-3 text-2xl font-bold text-emerald-600">{resolutionRate}%</div>
          <div className="w-full bg-slate-100 rounded-full h-1 mt-2 overflow-hidden">
            <div
              className="bg-emerald-500 h-1 rounded-full"
              style={{ width: `${resolutionRate}%` }}
            />
          </div>
        </div>
      </div>

      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Departments Workload
          </h2>
          <span className="text-xs text-slate-400">Click to filter</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
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
                className={`p-3.5 rounded-xl border bg-white transition-colors cursor-pointer hover:border-slate-400 ${
                  selectedDept === deptKey ? 'ring-1 ring-blue-600 border-blue-600' : 'border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-1.5 rounded text-white ${config.color}`}>
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-xs font-bold text-slate-800">
                    {count}
                  </span>
                </div>

                <h3 className="font-semibold text-xs text-slate-900">{config.name}</h3>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">{config.desc}</p>
                <div className="mt-2 pt-2 border-t border-slate-100 text-[10px] text-slate-400 flex justify-between">
                  <span>{percentage}% share</span>
                  <span className="text-blue-600 font-medium">Queue →</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <h3 className="font-semibold text-xs text-slate-800 uppercase tracking-wider">
            Tickets by Priority
          </h3>
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            {['High', 'Medium', 'Low'].map((pLevel) => {
              const match = byPriority.find((p) => p.priority?.toLowerCase() === pLevel.toLowerCase());
              const count = match ? match.count : 0;
              return (
                <div
                  key={pLevel}
                  onClick={() => onNavigateToTickets({ priority: pLevel, department: selectedDept })}
                  className="p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer"
                >
                  <PriorityBadge priority={pLevel} size="sm" />
                  <div className="text-xl font-bold mt-1 text-slate-900">{count}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <h3 className="font-semibold text-xs text-slate-800 uppercase tracking-wider">
            Top Categories ({selectedDept})
          </h3>
          <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1 text-xs">
            {displayCategories.slice(0, 5).map((cat) => (
              <div
                key={cat.category}
                onClick={() => onNavigateToTickets({ department: cat.department, search: cat.category })}
                className="flex items-center justify-between p-1.5 rounded hover:bg-slate-50 cursor-pointer"
              >
                <div>
                  <span className="font-medium text-slate-800">{cat.category}</span>
                  <span className="text-[10px] text-slate-400 ml-2">({cat.department})</span>
                </div>
                <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                  {cat.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-xs text-slate-800 uppercase tracking-wider">
            Recent Service Requests
          </h3>
          <button
            onClick={() => onNavigateToTickets({ department: selectedDept })}
            className="text-xs text-blue-600 hover:underline flex items-center gap-1"
          >
            <span>View all</span>
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {displayRecentTickets.map((t) => (
            <div
              key={t.TicketId}
              onClick={() => onSelectTicket(t)}
              className="py-2.5 flex items-center justify-between gap-3 hover:bg-slate-50 px-1 rounded cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <span className="font-mono font-semibold text-blue-600">#{t.TicketId}</span>
                <div>
                  <div className="font-medium text-slate-900 truncate max-w-sm">{t.Title}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {t.Department} • {t.CategoryName} • By {t.RequesterName}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
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
