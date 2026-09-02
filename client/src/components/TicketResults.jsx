import React, { useState, useEffect } from 'react';
import {
  Search,
  RotateCcw,
  ExternalLink,
  User,
  Shield,
  AlertCircle,
  PlusCircle,
  Wrench,
  AlertTriangle,
  Activity
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
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-slate-100 text-slate-700">
            {isSupportStaff ? <Shield className="h-5 w-5" /> : isDepartmentStaff ? <Wrench className="h-5 w-5" /> : <User className="h-5 w-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-sm sm:text-base text-slate-900">
                {isSupportStaff
                  ? 'Dispatch & Triage Queue'
                  : isDepartmentStaff
                  ? `${currentUser?.Department} Department Queue`
                  : 'My Requests'}
              </h2>
              <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                {currentUser?.Department}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
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
            className="self-start sm:self-auto px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-1.5 shrink-0"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Create Request</span>
          </button>
        )}
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={filters.search || ''}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              placeholder="Search tickets by ID, title, requester, assignee..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto pb-1 lg:pb-0">
            {isSupportStaff ? (
              <>
                <button
                  onClick={() => setActiveTab('pending_approval')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                    activeTab === 'pending_approval' ? 'bg-amber-100 text-amber-900 border border-amber-300 font-semibold' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <AlertTriangle className="h-3 w-3 text-amber-600" />
                  <span>Pending Approvals ({pendingApprovalCount})</span>
                </button>
                <button
                  onClick={() => setActiveTab('unassigned')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                    activeTab === 'unassigned' ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Unassigned ({tickets.filter((t) => !t.AssigneeId).length})
                </button>
                <button
                  onClick={() => setActiveTab('urgent')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                    activeTab === 'urgent' ? 'bg-red-600 text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  High Priority ({tickets.filter((t) => t.Priority === 'High' || t.Priority === 'Critical').length})
                </button>
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                    activeTab === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  All Tickets ({tickets.length})
                </button>
              </>
            ) : isDepartmentStaff ? (
              <>
                <button
                  onClick={() => setActiveTab('assigned_me')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                    activeTab === 'assigned_me' ? 'bg-slate-900 text-white font-semibold' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Assigned to Me ({tickets.filter((t) => t.AssigneeId === currentUser?.UserId).length})
                </button>
                <button
                  onClick={() => setActiveTab('dept_queue')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                    activeTab === 'dept_queue' ? 'bg-slate-900 text-white font-semibold' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {userDept} Queue ({tickets.filter((t) => t.Department === userDept).length})
                </button>
                <button
                  onClick={() => setActiveTab('resolved')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                    activeTab === 'resolved' ? 'bg-emerald-600 text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Resolved ({tickets.filter((t) => t.Department === userDept && (t.Status === 'Resolved' || t.Status === 'Closed')).length})
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setActiveTab('mine')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                    activeTab === 'mine' ? 'bg-slate-900 text-white font-semibold' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  My Requests ({tickets.filter((t) => t.RequesterId === currentUser?.UserId).length})
                </button>
                <button
                  onClick={() => setActiveTab('open')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                    activeTab === 'open' ? 'bg-slate-900 text-white font-semibold' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Active ({tickets.filter((t) => t.RequesterId === currentUser?.UserId && t.Status !== 'Closed' && t.Status !== 'Resolved').length})
                </button>
                <button
                  onClick={() => setActiveTab('resolved')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                    activeTab === 'resolved' ? 'bg-emerald-600 text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Resolved ({tickets.filter((t) => t.RequesterId === currentUser?.UserId && (t.Status === 'Closed' || t.Status === 'Resolved')).length})
                </button>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-t border-slate-100 pt-2.5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mr-1 shrink-0">
            Department:
          </span>
          {departments.map((dept) => (
            <button
              key={dept}
              onClick={() => setFilters({ ...filters, department: dept })}
              className={`px-2 py-1 rounded text-xs font-medium transition-colors shrink-0 ${
                (filters.department || 'All') === dept
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {dept}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
          <div>
            <select
              value={filters.status || 'All'}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:ring-1 focus:ring-blue-500"
            >
              <option value="All">All Statuses</option>
              <option value="Open">Open</option>
              <option value="Assigned">Assigned</option>
              <option value="In Progress">In Progress</option>
              <option value="Pending">Pending</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          <div>
            <select
              value={filters.priority || 'All'}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:ring-1 focus:ring-blue-500"
            >
              <option value="All">All Priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          <div>
            <button
              onClick={resetFilters}
              className="w-full flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-medium text-slate-600 transition-colors"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset</span>
            </button>
          </div>

          <div>
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors disabled:opacity-50"
            >
              <span>{isLoading ? 'Updating...' : 'Refresh'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase tracking-wider font-semibold text-slate-500">
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

            <tbody className="divide-y divide-slate-100">
              {filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-500">
                    <div className="max-w-xs mx-auto space-y-1">
                      <AlertCircle className="h-6 w-6 text-slate-300 mx-auto" />
                      <p className="font-medium text-slate-700">No tickets found</p>
                      <p className="text-xs text-slate-400">
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
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4 font-mono font-semibold text-blue-600">
                      #{ticket.TicketId}
                    </td>

                    <td className="py-3 px-4 max-w-xs">
                      <div className="font-medium text-slate-900 line-clamp-1">
                        {ticket.Title}
                      </div>
                      <div className="text-slate-400 line-clamp-1 text-[11px]">
                        {ticket.Description}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div>
                        <span className="font-medium text-slate-800">{ticket.Department}</span>
                        <div className="text-[10px] text-slate-400">{ticket.CategoryName}</div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <PriorityBadge priority={ticket.Priority} size="sm" />
                    </td>

                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        <StatusBadge status={ticket.Status} size="sm" />
                        {ticket.RequestedStatus && (
                          <div className="text-[10px] text-amber-700 font-medium">
                            Req: {ticket.RequestedStatus}
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-slate-600">
                      <div>{ticket.RequesterName}</div>
                      <div className="text-[10px] text-slate-400">{formatDate(ticket.CreatedDate)}</div>
                    </td>

                    <td className="py-3 px-4">
                      {ticket.AssigneeName ? (
                        <span className="font-medium text-slate-700">
                          {ticket.AssigneeName}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">
                          Unassigned
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectTicket(ticket);
                        }}
                        className="text-xs font-medium text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-1 rounded"
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

        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex justify-between">
          <span>Showing {filteredTickets.length} of {tickets.length} tickets</span>
        </div>
      </div>
    </div>
  );
}
