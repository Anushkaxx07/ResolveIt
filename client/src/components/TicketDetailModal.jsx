import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Users,
  Building,
  Calendar,
  Clock,
  Send,
  CheckCircle,
  AlertTriangle,
  MessageSquare,
  Shield,
  FileCheck,
  CheckCheck,
  ArrowRight,
  UserCheck,
  Wrench,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import PriorityBadge from './PriorityBadge';
import StatusBadge from './StatusBadge';

export default function TicketDetailModal({
  ticketId,
  onClose,
  currentUser,
  users = [],
  categories = [],
  api,
  onTicketUpdated
}) {
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [staffAvailability, setStaffAvailability] = useState([]);

  const isSupportStaff = currentUser?.Role === 'SupportStaff' || currentUser?.Role === 'Admin';
  const isDepartmentStaff = currentUser?.Role === 'DepartmentStaff' || currentUser?.Role === 'SupportAgent';
  const isEmployee = currentUser?.Role === 'Employee';

  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [newComment, setNewComment] = useState('');
  const [isResolutionNote, setIsResolutionNote] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');

  const [stageNotes, setStageNotes] = useState('');
  const [showCloseDialog, setShowCloseDialog] = useState(false);
  const [closeNote, setCloseNote] = useState('');
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    loadTicketDetails();
  }, [ticketId]);

  const loadTicketDetails = async () => {
    try {
      setLoading(true);
      const res = await api.getTicketById(ticketId);
      setTicket(res.data);
      setStatus(res.data.Status);
      setPriority(res.data.Priority);
      setAssigneeId(res.data.AssigneeId || '');

      if (res.data?.Department) {
        try {
          const availRes = await api.getStaffAvailability(res.data.Department);
          setStaffAvailability(availRes.data || []);
        } catch (e) {}
      }
    } catch (err) {
      setError(err.message || 'Failed to load ticket details');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProperties = async () => {
    if (!isSupportStaff) return;
    try {
      setIsUpdating(true);
      setActionSuccess('');

      await api.updateTicket(ticketId, {
        Status: status,
        Priority: priority,
        AssigneeId: assigneeId ? Number(assigneeId) : null,
      });

      setActionSuccess('Ticket properties saved.');
      await loadTicketDetails();
      if (onTicketUpdated) onTicketUpdated();
    } catch (err) {
      setError(err.message || 'Failed to update ticket');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAssignToMyself = async () => {
    if (!isSupportStaff || !currentUser) return;
    try {
      setIsUpdating(true);
      await api.updateTicket(ticketId, {
        AssigneeId: currentUser.UserId,
        Status: ticket.Status === 'Open' ? 'In Progress' : ticket.Status,
      });
      setAssigneeId(currentUser.UserId);
      setStatus(ticket.Status === 'Open' ? 'In Progress' : ticket.Status);
      setActionSuccess(`Assigned to ${currentUser.Name}`);
      await loadTicketDetails();
      if (onTicketUpdated) onTicketUpdated();
    } catch (err) {
      setError(err.message || 'Failed to assign ticket');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAssignToStaff = async (staffMember) => {
    if (!isSupportStaff || !staffMember) return;
    try {
      setIsUpdating(true);
      await api.updateTicket(ticketId, {
        AssigneeId: staffMember.UserId,
        Status: 'Assigned',
      });
      setAssigneeId(staffMember.UserId);
      setStatus('Assigned');
      setActionSuccess(`Assigned to ${staffMember.Name} (${staffMember.Department})`);
      await loadTicketDetails();
      if (onTicketUpdated) onTicketUpdated();
    } catch (err) {
      setError(err.message || 'Failed to assign ticket');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDepartmentStaffRequest = async (requestedStage) => {
    if (!isDepartmentStaff) return;
    try {
      setIsUpdating(true);
      await api.requestStatus(ticketId, {
        requestedStatus: requestedStage,
        staffUserId: currentUser.UserId,
        notes: stageNotes || `Stage transition request: ${requestedStage}`
      });

      setStageNotes('');
      setActionSuccess(`Status transition request for "${requestedStage}" submitted.`);
      await loadTicketDetails();
      if (onTicketUpdated) onTicketUpdated();
    } catch (err) {
      setError(err.message || 'Failed to submit status request');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleApproveStatus = async () => {
    if (!isSupportStaff) return;
    try {
      setIsUpdating(true);
      await api.approveStatus(ticketId);
      setActionSuccess(`Approved stage change to "${ticket.RequestedStatus}".`);
      await loadTicketDetails();
      if (onTicketUpdated) onTicketUpdated();
    } catch (err) {
      setError(err.message || 'Failed to approve status');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRejectStatus = async () => {
    if (!isSupportStaff) return;
    try {
      setIsUpdating(true);
      await api.rejectStatus(ticketId, rejectReason || 'Requires further review.');
      setShowRejectDialog(false);
      setRejectReason('');
      setActionSuccess('Status request rejected.');
      await loadTicketDetails();
      if (onTicketUpdated) onTicketUpdated();
    } catch (err) {
      setError(err.message || 'Failed to reject status');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setIsUpdating(true);
      await api.addComment(ticketId, {
        Notes: newComment.trim(),
        UserId: currentUser?.UserId || 1,
        IsResolutionNote: (isSupportStaff || isDepartmentStaff) && isResolutionNote ? 1 : 0,
      });

      setNewComment('');
      setIsResolutionNote(false);
      setActionSuccess('Note recorded.');
      await loadTicketDetails();
      if (onTicketUpdated) onTicketUpdated();
    } catch (err) {
      setError(err.message || 'Failed to add comment');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCloseTicket = async () => {
    try {
      setIsUpdating(true);
      await api.closeTicket(ticketId, {
        ResolutionNotes: closeNote || `Resolved and closed by ${currentUser?.Name}.`,
        UserId: currentUser?.UserId || 11,
      });

      setShowCloseDialog(false);
      setActionSuccess('Ticket marked as Resolved and Closed.');
      await loadTicketDetails();
      if (onTicketUpdated) onTicketUpdated();
    } catch (err) {
      setError(err.message || 'Failed to close ticket');
    } finally {
      setIsUpdating(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const latestResolutionNote = ticket?.comments?.slice().reverse().find((c) => c.IsResolutionNote);
  const statusSteps = ['Open', 'Assigned', 'In Progress', 'Resolved', 'Closed'];
  const currentStatusIndex = statusSteps.indexOf(ticket?.Status || 'Open');

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-white w-full max-w-3xl rounded-xl shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              #{ticketId}
            </span>
            <span className="text-xs font-medium text-slate-700 bg-slate-200/70 px-2 py-0.5 rounded">
              {ticket?.Department} Department
            </span>
            {isSupportStaff ? (
              <span className="text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded hidden sm:inline">
                Support Staff Dispatch
              </span>
            ) : isDepartmentStaff ? (
              <span className="text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded hidden sm:inline">
                Department Specialist
              </span>
            ) : (
              <span className="text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded hidden sm:inline">
                Employee Request
              </span>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {loading ? (
            <div className="py-12 text-center text-slate-500">
              <Clock className="h-6 w-6 animate-spin text-blue-600 mx-auto mb-2" />
              <p className="text-xs">Loading ticket details...</p>
            </div>
          ) : error ? (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs">
              {error}
            </div>
          ) : ticket ? (
            <>
              {actionSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs flex items-center justify-between">
                  <span>{actionSuccess}</span>
                  <button onClick={() => setActionSuccess('')} className="text-emerald-600 hover:text-emerald-900 font-bold">✕</button>
                </div>
              )}

              {isSupportStaff && ticket.RequestedStatus && (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-amber-900">
                      Stage Change Request Pending Approval
                    </span>
                    <span className="text-[11px] bg-amber-200 px-2 py-0.5 rounded text-amber-900 font-medium">
                      Action Required
                    </span>
                  </div>

                  <div className="text-xs text-slate-800">
                    Department staff <strong>{ticket.AssigneeName || 'Specialist'}</strong> requested transition:
                    <div className="mt-1 flex items-center gap-2 font-medium">
                      <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                        {ticket.Status}
                      </span>
                      <ArrowRight className="h-3 w-3 text-slate-400" />
                      <span className="px-2 py-0.5 rounded bg-amber-300 text-amber-950 font-bold">
                        {ticket.RequestedStatus}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-amber-200">
                    <button
                      type="button"
                      onClick={handleApproveStatus}
                      disabled={isUpdating}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold flex items-center gap-1 transition-colors"
                    >
                      <ThumbsUp className="h-3 w-3" />
                      <span>Approve</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowRejectDialog(true)}
                      disabled={isUpdating}
                      className="px-3 py-1 bg-white hover:bg-red-50 text-red-700 border border-red-300 rounded text-xs font-medium transition-colors"
                    >
                      <ThumbsDown className="h-3 w-3" />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <PriorityBadge priority={ticket.Priority} size="sm" />
                  <StatusBadge status={ticket.Status} size="sm" />
                  <span className="text-xs text-slate-400 ml-auto">
                    Created: {formatDate(ticket.CreatedDate)}
                  </span>
                </div>

                <h2 className="text-lg font-bold text-slate-900">
                  {ticket.Title}
                </h2>
              </div>

              {(ticket.Status === 'Resolved' || ticket.Status === 'Closed' || latestResolutionNote) && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold text-emerald-800">
                    <span>Resolution Summary</span>
                    {ticket.ResolvedDate && (
                      <span className="text-[11px] text-emerald-600">
                        {formatDate(ticket.ResolvedDate)}
                      </span>
                    )}
                  </div>
                  <p className="text-xs leading-relaxed">
                    {latestResolutionNote ? latestResolutionNote.Notes : 'Issue resolved and closed.'}
                  </p>
                  {ticket.AssigneeName && (
                    <div className="text-[11px] text-emerald-700 pt-1 border-t border-emerald-200">
                      Handled by: <strong>{ticket.AssigneeName}</strong>
                    </div>
                  )}
                </div>
              )}

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1.5">
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Lifecycle Progress
                </div>
                <div className="grid grid-cols-5 gap-1.5 text-center text-xs">
                  {statusSteps.map((step, idx) => {
                    const isPassed = idx <= currentStatusIndex;
                    const isCurrent = idx === currentStatusIndex;
                    return (
                      <div
                        key={step}
                        className={`p-1.5 rounded text-xs font-medium transition-colors ${
                          isCurrent
                            ? 'bg-blue-600 text-white'
                            : isPassed
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-white text-slate-400 border border-slate-200'
                        }`}
                      >
                        {step}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-lg p-3.5">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Description
                </div>
                <p className="text-xs text-slate-800 whitespace-pre-line leading-relaxed">
                  {ticket.Description}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg border border-slate-200 bg-white space-y-1">
                  <div className="text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                    Requester
                  </div>
                  <div className="font-semibold text-slate-900">{ticket.RequesterName}</div>
                  <div className="text-slate-500 text-[11px]">{ticket.RequesterEmail}</div>
                </div>

                <div className="p-3 rounded-lg border border-slate-200 bg-white space-y-1">
                  <div className="text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                    Handling Staff
                  </div>
                  <div className="font-semibold text-slate-900">
                    {ticket.AssigneeName ? ticket.AssigneeName : 'Unassigned'}
                  </div>
                  <div className="text-slate-500 text-[11px]">{ticket.CategoryName} ({ticket.Department})</div>
                </div>
              </div>

              {isSupportStaff && (
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Dispatch & Assignment
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        Assign available staff from {ticket.Department} or handle directly.
                      </p>
                    </div>

                    {ticket.Status !== 'Closed' && (
                      <button
                        type="button"
                        onClick={() => setShowCloseDialog(true)}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded transition-colors"
                      >
                        Resolve & Close
                      </button>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                      <span>{ticket.Department} Staff Availability:</span>
                      <button
                        type="button"
                        onClick={handleAssignToMyself}
                        disabled={isUpdating}
                        className="text-blue-600 hover:underline"
                      >
                        Assign to me
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {staffAvailability.map((st) => (
                        <div
                          key={st.UserId}
                          className="p-2 rounded border bg-white flex items-center justify-between text-xs"
                        >
                          <div>
                            <div className="font-semibold text-slate-800">{st.Name}</div>
                            <div className="text-[11px] text-slate-400">
                              {st.isAvailable ? 'Available (0 active)' : `${st.activeTicketsCount} active`}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleAssignToStaff(st)}
                            disabled={isUpdating}
                            className={`px-2.5 py-0.5 rounded text-xs font-medium ${
                              ticket.AssigneeId === st.UserId
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                            }`}
                          >
                            {ticket.AssigneeId === st.UserId ? 'Assigned' : 'Assign'}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Status</label>
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="w-full text-xs bg-white border border-slate-300 rounded p-1.5"
                      >
                        <option value="Open">Open</option>
                        <option value="Assigned">Assigned</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Pending">Pending</option>
                        <option value="Resolved">Resolved</option>
                        <option value="Closed">Closed</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Priority</label>
                      <select
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                        className="w-full text-xs bg-white border border-slate-300 rounded p-1.5"
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={handleSaveProperties}
                      disabled={isUpdating}
                      className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold"
                    >
                      {isUpdating ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              )}

              {isDepartmentStaff && (
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                  <div className="pb-1 border-b border-slate-200">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Request Stage Update
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Submit status transitions to Support Staff for review:
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button
                      type="button"
                      onClick={() => handleDepartmentStaffRequest('In Progress')}
                      disabled={isUpdating || ticket.Status === 'In Progress'}
                      className="p-2 rounded border bg-white hover:bg-slate-50 text-slate-800 text-xs font-medium text-center disabled:opacity-50"
                    >
                      Request In Progress
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDepartmentStaffRequest('Pending')}
                      disabled={isUpdating || ticket.Status === 'Pending'}
                      className="p-2 rounded border bg-white hover:bg-slate-50 text-slate-800 text-xs font-medium text-center disabled:opacity-50"
                    >
                      Request Pending
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDepartmentStaffRequest('Resolved')}
                      disabled={isUpdating || ticket.Status === 'Resolved'}
                      className="p-2 rounded border bg-white hover:bg-slate-50 text-slate-800 text-xs font-medium text-center disabled:opacity-50"
                    >
                      Request Resolved
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDepartmentStaffRequest('Closed')}
                      disabled={isUpdating || ticket.Status === 'Closed'}
                      className="p-2 rounded border bg-white hover:bg-slate-50 text-slate-800 text-xs font-medium text-center disabled:opacity-50"
                    >
                      Request Closed
                    </button>
                  </div>

                  <div>
                    <input
                      type="text"
                      value={stageNotes}
                      onChange={(e) => setStageNotes(e.target.value)}
                      placeholder="Optional notes with this status request..."
                      className="w-full text-xs p-2 border border-slate-300 rounded bg-white"
                    />
                  </div>
                </div>
              )}

              {showRejectDialog && (
                <div className="p-3.5 bg-red-50 border border-red-200 rounded-lg space-y-2">
                  <div className="text-xs font-semibold text-red-900">
                    Reason for Rejection
                  </div>
                  <textarea
                    rows={2}
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Enter reason..."
                    className="w-full text-xs p-2 border border-red-300 rounded bg-white"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setShowRejectDialog(false)}
                      className="px-2.5 py-1 text-xs text-slate-600 bg-white border border-slate-200 rounded"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleRejectStatus}
                      disabled={isUpdating}
                      className="px-3 py-1 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded"
                    >
                      Confirm Rejection
                    </button>
                  </div>
                </div>
              )}

              {showCloseDialog && (
                <div className="p-3.5 bg-slate-50 border border-slate-300 rounded-lg space-y-2">
                  <div className="text-xs font-semibold text-slate-900">
                    Resolution Notes
                  </div>
                  <textarea
                    rows={3}
                    value={closeNote}
                    onChange={(e) => setCloseNote(e.target.value)}
                    placeholder="Enter resolution notes..."
                    className="w-full text-xs p-2 border border-slate-300 rounded bg-white"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setShowCloseDialog(false)}
                      className="px-2.5 py-1 text-xs text-slate-600 bg-white border border-slate-200 rounded"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCloseTicket}
                      disabled={isUpdating}
                      className="px-3 py-1 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded"
                    >
                      Confirm Close
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                  <MessageSquare className="h-4 w-4 text-slate-400" />
                  <h3 className="font-semibold text-xs text-slate-800 uppercase tracking-wider">
                    Activity & Notes ({ticket.comments?.length || 0})
                  </h3>
                </div>

                <div className="space-y-2">
                  {ticket.comments?.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No notes recorded yet.</p>
                  ) : (
                    ticket.comments?.map((cm) => (
                      <div
                        key={cm.CommentId}
                        className={`p-3 rounded-lg border text-xs space-y-1 ${
                          cm.IsResolutionNote
                            ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                            : 'bg-slate-50 border-slate-200 text-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 font-medium">
                            <span>{cm.UserName}</span>
                            <span className="text-[10px] text-slate-500">({cm.UserRole})</span>
                            {cm.IsResolutionNote ? (
                              <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-emerald-200 text-emerald-900">
                                Resolution Note
                              </span>
                            ) : null}
                          </div>
                          <span className="text-[11px] text-slate-400">{formatDate(cm.CreatedDate)}</span>
                        </div>
                        <p className="leading-relaxed whitespace-pre-line">{cm.Notes}</p>
                      </div>
                    ))
                  )}
                </div>

                <form onSubmit={handleAddComment} className="space-y-2 pt-2">
                  <textarea
                    rows={2}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add an activity note or reply..."
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                  />
                  <div className="flex items-center justify-between">
                    {(isSupportStaff || isDepartmentStaff) ? (
                      <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isResolutionNote}
                          onChange={(e) => setIsResolutionNote(e.target.checked)}
                          className="rounded text-blue-600"
                        />
                        <span>Mark as resolution note</span>
                      </label>
                    ) : (
                      <span className="text-xs text-slate-400">{currentUser?.Name}</span>
                    )}

                    <button
                      type="submit"
                      disabled={isUpdating || !newComment.trim()}
                      className="px-3.5 py-1.5 rounded bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1 disabled:opacity-50 transition-colors"
                    >
                      <Send className="h-3 w-3" />
                      <span>Post Note</span>
                    </button>
                  </div>
                </form>
              </div>
            </>
          ) : null}
        </div>

        <div className="px-5 py-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-medium rounded transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
