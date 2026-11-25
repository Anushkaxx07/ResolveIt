import React, { useState, useEffect } from 'react';
import {
  Search,
  RotateCcw,
  User,
  Shield,
  AlertCircle,
  PlusCircle,
  Wrench,
  AlertTriangle
} from 'lucide-react';
import PriorityBadge from './PriorityBadge';
import StatusBadge from './StatusBadge';

export default function TicketResults({
  tickets = [],
  categories = [],
  currentUser,
  onSelectTicket,
  filters,
  setFilters,
  onRefresh,
  isLoading,
  onNavigateToCreate
}) {
  const isSupportStaff = currentUser?.Role === 'SupportStaff' || currentUser?.Role === 'Admin';
  const isDepartmentStaff = currentUser?.Role === 'DepartmentStaff' || currentUser?.Role === 'SupportAgent';
  const isEmployee = currentUser?.Role === 'Employee';
  const userDept = currentUser?.Department;

  const getDefaultTab = () => {
    if (isSupportStaff) return 'all';
    if (isDepartmentStaff) return 'assigned_me';
    return 'mine';
  };

  const [activeTab, setActiveTab] = useState(getDefaultTab());

  useEffect(() => {
    setActiveTab(getDefaultTab());
  }, [currentUser]);

  const departments = ['All', 'IT', 'HR', 'Facilities', 'Finance', 'Access Management'];

  const filteredTickets = tickets.filter((ticket) => {
    if (activeTab === 'mine') {
      if (ticket.RequesterId !== currentUser?.UserId) return false;
    } else if (activeTab === 'assigned_me') {
      if (ticket.AssigneeId !== currentUser?.UserId) return false;
    } else if (activeTab === 'dept_queue') {
      if (userDept && ticket.Department !== userDept) return false;
    } else if (activeTab === 'pending_approval') {
      if (!ticket.RequestedStatus) return false;
    } else if (activeTab === 'unassigned') {
      if (ticket.AssigneeId !== null) return false;
    } else if (activeTab === 'urgent') {
      if (ticket.Priority !== 'High' && ticket.Priority !== 'Critical') return false;
    } else if (activeTab === 'open') {
      if (ticket.Status === 'Closed' || ticket.Status === 'Resolved') return false;
    } else if (activeTab === 'resolved') {
      if (ticket.Status !== 'Closed' && ticket.Status !== 'Resolved') return false;
    }

    if (filters.department && filters.department !== 'All' && ticket.Department !== filters.department) {
      return false;
    }

    if (filters.status && filters.status !== 'All' && ticket.Status !== filters.status) {
      return false;
    }

    if (filters.priority && filters.priority !== 'All' && ticket.Priority !== filters.priority) {
      return false;
    }

    if (filters.categoryId && filters.categoryId !== 'All' && String(ticket.CategoryId) !== String(filters.categoryId)) {
      return false;
    }

    if (filters.search) {
      const q = filters.search.toLowerCase();
      const matchTitle = ticket.Title?.toLowerCase().includes(q);
      const matchDesc = ticket.Description?.toLowerCase().includes(q);
      const matchId = String(ticket.TicketId).includes(q);
      const matchRequester = ticket.RequesterName?.toLowerCase().includes(q);
      const matchAssignee = ticket.AssigneeName?.toLowerCase().includes(q);
      const matchCategory = ticket.CategoryName?.toLowerCase().includes(q);

      if (!matchTitle && !matchDesc && !matchId && !matchRequester && !matchAssignee && !matchCategory) {
        return false;
      }
    }

    return true;
  });

  const resetFilters = () => {
    setFilters({
      search: '',
      department: 'All',
      categoryId: 'All',
      status: 'All',
      priority: 'All',
    });
    setActiveTab(getDefaultTab());
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const pendingApprovalCount = tickets.filter((t) => t.RequestedStatus !== null).length;

  return (
    <div className="space-y-4">
      <div className="bg-[#323039] p-5 rounded-xl border border-[#504C5B]/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-[#705E86]/20 border border-[#8874A0]/30 text-[#C8BBD8]">
            {isSupportStaff ? <Shield className="h-5 w-5" /> : isDepartmentStaff ? <Wrench className="h-5 w-5" /> : <User className="h-5 w-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-base text-white">
                {isSupportStaff
                  ? 'Dispatch & Triage Queue'
                  : isDepartmentStaff
                  ? `${currentUser?.Department} Department Queue`
                  : 'My Requests'}
              </h2>
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-[#423F4B] text-zinc-300 border border-[#504C5B]">
                {currentUser?.Department}
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              {isSupportStaff
                ? 'Assign available department staff and review stage change requests.'
                : isDepartmentStaff
                ? 'Manage assigned tickets and request stage transitions.'
                : 'Submit and track support requests across company departments.'}
            </p>
          </div>
        </div>

        {isEmployee && onNavigateToCreate && (
          <button
            onClick={onNavigateToCreate}
            className="self-start sm:self-auto px-3.5 py-2 bg-[#F2CE54] hover:bg-[#F7DC7C] text-[#25232B] text-xs font-semibold rounded-xl shadow-sm transition-colors flex items-center gap-1.5 shrink-0"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Create Request</span>
          </button>
        )}
      </div>

      <div className="bg-[#323039] p-4 rounded-xl border border-[#504C5B]/80 space-y-3.5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <input
              type="text"
              value={filters.search || ''}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              placeholder="Search tickets by ID, title, requester, assignee..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-[#423F4B] border border-[#504C5B] text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#8874A0]/60 focus:border-[#A795BD] transition-colors"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
            {isSupportStaff ? (
              <>
                <button
                  onClick={() => setActiveTab('pending_approval')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    activeTab === 'pending_approval'
                      ? 'bg-[#F2CE54]/15 text-[#F7DC7C] border border-[#F2CE54]/40 font-semibold'
                      : 'bg-[#3A3742] text-zinc-400 hover:bg-[#423F4B] hover:text-zinc-100 border border-[#504C5B]/70'
                  }`}
                >
                  <AlertTriangle className="h-3 w-3 text-[#F2CE54]" />
                  <span>Pending Approvals ({pendingApprovalCount})</span>
                </button>
                <button
                  onClick={() => setActiveTab('unassigned')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                    activeTab === 'unassigned'
                      ? 'bg-[#705E86]/30 text-white border border-[#8874A0]/50 font-semibold'
                      : 'bg-[#3A3742] text-zinc-400 hover:bg-[#423F4B] hover:text-zinc-100 border border-[#504C5B]/70'
                  }`}
                >
                  Unassigned ({tickets.filter((t) => !t.AssigneeId).length})
                </button>
                <button
                  onClick={() => setActiveTab('urgent')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                    activeTab === 'urgent'
                      ? 'bg-rose-500/20 text-rose-200 border border-rose-500/40 font-semibold'
                      : 'bg-[#3A3742] text-zinc-400 hover:bg-[#423F4B] hover:text-zinc-100 border border-[#504C5B]/70'
                  }`}
                >
                  High Priority ({tickets.filter((t) => t.Priority === 'High' || t.Priority === 'Critical').length})
                </button>
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                    activeTab === 'all'
                      ? 'bg-[#423F4B] text-white border border-[#625D6F] font-semibold'
                      : 'bg-[#3A3742] text-zinc-400 hover:bg-[#423F4B] hover:text-zinc-100 border border-[#504C5B]/70'
                  }`}
                >
                  All Tickets ({tickets.length})
                </button>
              </>
            ) : isDepartmentStaff ? (
              <>
                <button
                  onClick={() => setActiveTab('assigned_me')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                    activeTab === 'assigned_me'
                      ? 'bg-[#705E86]/30 text-white border border-[#8874A0]/50 font-semibold'
                      : 'bg-[#3A3742] text-zinc-400 hover:bg-[#423F4B] hover:text-zinc-100 border border-[#504C5B]/70'
                  }`}
                >
                  Assigned to Me ({tickets.filter((t) => t.AssigneeId === currentUser?.UserId).length})
                </button>
                <button
                  onClick={() => setActiveTab('dept_queue')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                    activeTab === 'dept_queue'
                      ? 'bg-[#423F4B] text-white border border-[#625D6F] font-semibold'
                      : 'bg-[#3A3742] text-zinc-400 hover:bg-[#423F4B] hover:text-zinc-100 border border-[#504C5B]/70'
                  }`}
                >
                  {userDept} Queue ({tickets.filter((t) => t.Department === userDept).length})
                </button>
                <button
                  onClick={() => setActiveTab('resolved')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                    activeTab === 'resolved'
                      ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-500/40 font-semibold'
                      : 'bg-[#3A3742] text-zinc-400 hover:bg-[#423F4B] hover:text-zinc-100 border border-[#504C5B]/70'
                  }`}
                >
                  Resolved ({tickets.filter((t) => t.Department === userDept && (t.Status === 'Resolved' || t.Status === 'Closed')).length})
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setActiveTab('mine')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                    activeTab === 'mine'
                      ? 'bg-[#705E86]/30 text-white border border-[#8874A0]/50 font-semibold'
                      : 'bg-[#3A3742] text-zinc-400 hover:bg-[#423F4B] hover:text-zinc-100 border border-[#504C5B]/70'
                  }`}
                >
                  My Requests ({tickets.filter((t) => t.RequesterId === currentUser?.UserId).length})
                </button>
                <button
                  onClick={() => setActiveTab('open')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                    activeTab === 'open'
                      ? 'bg-[#423F4B] text-white border border-[#625D6F] font-semibold'
                      : 'bg-[#3A3742] text-zinc-400 hover:bg-[#423F4B] hover:text-zinc-100 border border-[#504C5B]/70'
                  }`}
                >
                  Active ({tickets.filter((t) => t.RequesterId === currentUser?.UserId && t.Status !== 'Closed' && t.Status !== 'Resolved').length})
                </button>
                <button
                  onClick={() => setActiveTab('resolved')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                    activeTab === 'resolved'
                      ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-500/40 font-semibold'
                      : 'bg-[#3A3742] text-zinc-400 hover:bg-[#423F4B] hover:text-zinc-100 border border-[#504C5B]/70'
                  }`}
                >
                  Resolved ({tickets.filter((t) => t.RequesterId === currentUser?.UserId && (t.Status === 'Closed' || t.Status === 'Resolved')).length})
                </button>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#504C5B]/70 pt-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-[11px] font-medium text-zinc-500 mr-1 shrink-0">
              Dept:
            </span>
            {departments.map((dept) => (
              <button
                key={dept}
                onClick={() => setFilters({ ...filters, department: dept })}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors shrink-0 ${
                  (filters.department || 'All') === dept
                    ? 'bg-[#705E86]/35 text-white border border-[#8874A0]/45'
                    : 'bg-[#3A3742] text-zinc-400 hover:bg-[#423F4B] hover:text-zinc-200'
                }`}
              >
                {dept}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <select
              value={filters.status || 'All'}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="text-xs bg-[#423F4B] border border-[#504C5B] rounded-lg px-2.5 py-1.5 text-zinc-200 focus:outline-none focus:ring-1 focus:ring-[#A795BD]"
            >
              <option value="All">All Statuses</option>
              <option value="Open">Open</option>
              <option value="Assigned">Assigned</option>
              <option value="In Progress">In Progress</option>
              <option value="Pending">Pending</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>

            <select
              value={filters.priority || 'All'}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
              className="text-xs bg-[#423F4B] border border-[#504C5B] rounded-lg px-2.5 py-1.5 text-zinc-200 focus:outline-none focus:ring-1 focus:ring-[#A795BD]"
            >
              <option value="All">All Priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            <button
              onClick={resetFilters}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#504C5B] bg-[#3A3742] hover:bg-[#423F4B] text-xs font-medium text-zinc-400 hover:text-white transition-colors"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset</span>
            </button>

            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="px-3 py-1.5 rounded-lg bg-[#423F4B] hover:bg-[#504C5B] border border-[#625D6F] text-zinc-200 text-xs font-medium transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Updating...' : 'Refresh'}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-[#323039] rounded-xl border border-[#504C5B]/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#3A3742]/90 border-b border-[#504C5B]/80 text-[11px] uppercase tracking-wider font-semibold text-zinc-400">
              <tr>
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Requester</th>
                <th className="py-3 px-4">Assignee</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#504C5B]/60">
              {filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-zinc-400">
                    <div className="max-w-xs mx-auto space-y-1.5">
                      <AlertCircle className="h-6 w-6 text-zinc-600 mx-auto" />
                      <p className="font-medium text-zinc-200">No tickets found</p>
                      <p className="text-xs text-zinc-500">
                        No requests match the selected filters.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTickets.map((ticket) => (
                  <tr
                    key={ticket.TicketId}
                    onClick={() => onSelectTicket(ticket)}
                    className="hover:bg-[#3A3742]/80 cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-4 font-mono font-medium text-zinc-400">
                      #{ticket.TicketId}
                    </td>

                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-medium text-sm text-zinc-100 line-clamp-1">
                        {ticket.Title}
                      </div>
                      <div className="text-zinc-500 line-clamp-1 text-[11px] mt-0.5">
                        {ticket.Description}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div>
                        <span className="font-medium text-zinc-200">{ticket.Department}</span>
                        <div className="text-[11px] text-zinc-500">{ticket.CategoryName}</div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <PriorityBadge priority={ticket.Priority} size="sm" />
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        <StatusBadge status={ticket.Status} size="sm" />
                        {ticket.RequestedStatus && (
                          <div className="text-[10px] text-[#F7DC7C] font-medium">
                            Req: {ticket.RequestedStatus}
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-zinc-200">
                      <div>{ticket.RequesterName}</div>
                      <div className="text-[11px] text-zinc-500">{formatDate(ticket.CreatedDate)}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      {ticket.AssigneeName ? (
                        <span className="font-medium text-zinc-200">
                          {ticket.AssigneeName}
                        </span>
                      ) : (
                        <span className="text-zinc-500 italic">
                          Unassigned
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectTicket(ticket);
                        }}
                        className="text-xs font-medium text-zinc-200 hover:text-white bg-[#423F4B] hover:bg-[#705E86]/35 border border-[#504C5B] hover:border-[#8874A0]/50 px-2.5 py-1 rounded-lg transition-colors"
                      >
                        {isSupportStaff ? 'Dispatch' : isDepartmentStaff ? 'View' : 'Track'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-2.5 bg-[#3A3742]/70 border-t border-[#504C5B]/80 text-xs text-zinc-500 flex justify-between">
          <span>Showing {filteredTickets.length} of {tickets.length} tickets</span>
        </div>
      </div>
    </div>
  );
}
