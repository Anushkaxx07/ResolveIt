import React, { useState, useEffect } from 'react';
import {
  X,
  Clock,
  Send,
  MessageSquare,
  ArrowRight,
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-[#323039] w-full max-w-3xl rounded-2xl shadow-2xl border border-[#504C5B] overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-5 py-3.5 border-b border-[#504C5B]/80 bg-[#3A3742] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-xs font-semibold text-zinc-200 bg-[#423F4B] px-2.5 py-0.5 rounded-md border border-[#504C5B]">
              #{ticketId}
            </span>
            <span className="text-xs font-medium text-[#C8BBD8] bg-[#705E86]/20 border border-[#8874A0]/35 px-2.5 py-0.5 rounded-md">
              {ticket?.Department} Department
            </span>
            {isSupportStaff ? (
              <span className="text-xs text-zinc-400 bg-[#423F4B] border border-[#504C5B] px-2 py-0.5 rounded-md hidden sm:inline">
                Support Staff Dispatch
              </span>
            ) : isDepartmentStaff ? (
              <span className="text-xs text-zinc-400 bg-[#423F4B] border border-[#504C5B] px-2 py-0.5 rounded-md hidden sm:inline">
                Department Specialist
              </span>
            ) : (
              <span className="text-xs text-zinc-400 bg-[#423F4B] border border-[#504C5B] px-2 py-0.5 rounded-md hidden sm:inline">
                Employee Request
              </span>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-[#423F4B] transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {loading ? (
            <div className="py-12 text-center text-zinc-400">
              <Clock className="h-6 w-6 animate-spin text-[#F2CE54] mx-auto mb-2" />
              <p className="text-xs">Loading ticket details...</p>
            </div>
          ) : error ? (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-200 text-xs">
              {error}
            </div>
          ) : ticket ? (
            <>
              {actionSuccess && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-200 text-xs flex items-center justify-between">
                  <span>{actionSuccess}</span>
                  <button onClick={() => setActionSuccess('')} className="text-emerald-300 hover:text-white font-bold">✕</button>
                </div>
              )}

              {isSupportStaff && ticket.RequestedStatus && (
                <div className="p-4 rounded-xl bg-[#F2CE54]/10 border border-[#F2CE54]/35 text-zinc-100 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-[#F7DC7C]">
                      Stage Change Request Pending Approval
                    </span>
                    <span className="text-[11px] bg-[#F2CE54] text-[#25232B] px-2 py-0.5 rounded-md font-semibold">
                      Action Required
                    </span>
                  </div>

                  <div className="text-xs text-zinc-300">
                    Department staff <strong className="text-white">{ticket.AssigneeName || 'Specialist'}</strong> requested transition:
                    <div className="mt-1.5 flex items-center gap-2 font-medium">
                      <span className="px-2 py-0.5 rounded bg-[#423F4B] border border-[#504C5B] text-zinc-200">
                        {ticket.Status}
                      </span>
                      <ArrowRight className="h-3 w-3 text-[#F2CE54]" />
                      <span className="px-2 py-0.5 rounded bg-[#F2CE54] text-[#25232B] font-semibold">
                        {ticket.RequestedStatus}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-[#F2CE54]/20">
                    <button
                      type="button"
                      onClick={handleApproveStatus}
                      disabled={isUpdating}
                      className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-[#25232B] rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                    >
                      <ThumbsUp className="h-3 w-3" />
                      <span>Approve</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowRejectDialog(true)}
                      disabled={isUpdating}
                      className="px-3 py-1.5 bg-[#423F4B] hover:bg-rose-500/20 text-rose-300 border border-rose-500/35 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors"
                    >
                      <ThumbsDown className="h-3 w-3" />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <PriorityBadge priority={ticket.Priority} size="sm" />
                  <StatusBadge status={ticket.Status} size="sm" />
                  <span className="text-xs text-zinc-500 ml-auto">
                    Created: {formatDate(ticket.CreatedDate)}
                  </span>
                </div>

                <h2 className="text-lg font-bold text-white leading-snug">
                  {ticket.Title}
                </h2>
              </div>

              {(ticket.Status === 'Resolved' || ticket.Status === 'Closed' || latestResolutionNote) && (
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-100 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold text-emerald-300">
                    <span>Resolution Summary</span>
                    {ticket.ResolvedDate && (
                      <span className="text-[11px] text-emerald-400/90">
                        {formatDate(ticket.ResolvedDate)}
                      </span>
                    )}
                  </div>
                  <p className="text-xs leading-relaxed text-zinc-200">
                    {latestResolutionNote ? latestResolutionNote.Notes : 'Issue resolved and closed.'}
                  </p>
                  {ticket.AssigneeName && (
                    <div className="text-[11px] text-emerald-300/90 pt-1.5 border-t border-emerald-500/20">
                      Handled by: <strong className="text-white">{ticket.AssigneeName}</strong>
                    </div>
                  )}
                </div>
              )}

              <div className="bg-[#3A3742]/70 p-3.5 rounded-xl border border-[#504C5B]/80 space-y-2">
                <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                  Lifecycle Progress
                </div>
                <div className="grid grid-cols-5 gap-1.5 text-center text-xs">
                  {statusSteps.map((step, idx) => {
                    const isPassed = idx <= currentStatusIndex;
                    const isCurrent = idx === currentStatusIndex;
                    return (
                      <div
                        key={step}
                        className={`p-1.5 rounded-lg text-xs font-medium transition-colors ${
                          isCurrent
                            ? 'bg-[#F2CE54] text-[#25232B] font-semibold'
                            : isPassed
                            ? 'bg-[#705E86]/30 text-[#C8BBD8] border border-[#8874A0]/35'
                            : 'bg-[#323039] text-zinc-500 border border-[#504C5B]/70'
                        }`}
                      >
                        {step}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-[#3A3742]/70 border border-[#504C5B]/80 rounded-xl p-4">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Description
                </div>
                <p className="text-xs text-zinc-200 whitespace-pre-line leading-relaxed">
                  {ticket.Description}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl border border-[#504C5B]/80 bg-[#3A3742]/70 space-y-1">
                  <div className="text-zinc-500 font-semibold uppercase tracking-wider text-[10px]">
                    Requester
                  </div>
                  <div className="font-semibold text-white">{ticket.RequesterName}</div>
                  <div className="text-zinc-400 text-[11px]">{ticket.RequesterEmail}</div>
                </div>

                <div className="p-3.5 rounded-xl border border-[#504C5B]/80 bg-[#3A3742]/70 space-y-1">
                  <div className="text-zinc-500 font-semibold uppercase tracking-wider text-[10px]">
                    Handling Staff
                  </div>
                  <div className="font-semibold text-white">
                    {ticket.AssigneeName ? ticket.AssigneeName : 'Unassigned'}
                  </div>
                  <div className="text-zinc-400 text-[11px]">{ticket.CategoryName} ({ticket.Department})</div>
                </div>
              </div>

              {isSupportStaff && (
                <div className="p-4 rounded-xl border border-[#504C5B]/80 bg-[#3A3742]/70 space-y-3.5">
                  <div className="flex items-center justify-between pb-2.5 border-b border-[#504C5B]/80">
                    <div>
                      <h3 className="text-xs font-semibold text-white uppercase tracking-wider">
                        Dispatch & Assignment
                      </h3>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        Assign available staff from {ticket.Department} or handle directly.
                      </p>
                    </div>

                    {ticket.Status !== 'Closed' && (
                      <button
                        type="button"
                        onClick={() => setShowCloseDialog(true)}
                        className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-[#25232B] text-xs font-semibold rounded-lg transition-colors"
                      >
                        Resolve & Close
                      </button>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-medium text-zinc-300">
                      <span>{ticket.Department} Staff Availability:</span>
                      <button
                        type="button"
                        onClick={handleAssignToMyself}
                        disabled={isUpdating}
                        className="text-[#C8BBD8] hover:text-[#F2CE54] hover:underline transition-colors"
                      >
                        Assign to me
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {staffAvailability.map((st) => (
                        <div
                          key={st.UserId}
                          className="p-2.5 rounded-lg border border-[#504C5B]/80 bg-[#323039] flex items-center justify-between text-xs"
                        >
                          <div>
                            <div className="font-semibold text-zinc-100">{st.Name}</div>
                            <div className="text-[11px] text-zinc-400">
                              {st.isAvailable ? 'Available (0 active)' : `${st.activeTicketsCount} active`}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleAssignToStaff(st)}
                            disabled={isUpdating}
                            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                              ticket.AssigneeId === st.UserId
                                ? 'bg-[#705E86] text-white font-semibold'
                                : 'bg-[#423F4B] hover:bg-[#504C5B] text-zinc-300 hover:text-white border border-[#504C5B]'
                            }`}
                          >
                            {ticket.AssigneeId === st.UserId ? 'Assigned' : 'Assign'}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#504C5B]/80">
                    <div>
                      <label className="block text-[11px] font-medium text-zinc-400 mb-1">Status</label>
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="w-full text-xs bg-[#423F4B] border border-[#504C5B] text-white rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-[#A795BD]"
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
                      <label className="block text-[11px] font-medium text-zinc-400 mb-1">Priority</label>
                      <select
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                        className="w-full text-xs bg-[#423F4B] border border-[#504C5B] text-white rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-[#A795BD]"
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
                      className="px-4 py-1.5 bg-[#F2CE54] hover:bg-[#F7DC7C] text-[#25232B] rounded-lg text-xs font-semibold transition-colors"
                    >
                      {isUpdating ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              )}

              {isDepartmentStaff && (
                <div className="p-4 rounded-xl border border-[#504C5B]/80 bg-[#3A3742]/70 space-y-3">
                  <div className="pb-2 border-b border-[#504C5B]/80">
                    <h3 className="text-xs font-semibold text-white uppercase tracking-wider">
                      Request Stage Update
                    </h3>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Submit status transitions to Support Staff for review:
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button
                      type="button"
                      onClick={() => handleDepartmentStaffRequest('In Progress')}
                      disabled={isUpdating || ticket.Status === 'In Progress'}
                      className="p-2 rounded-lg border border-[#504C5B] bg-[#323039] hover:bg-[#705E86]/25 hover:border-[#8874A0]/50 text-zinc-200 text-xs font-medium text-center disabled:opacity-40 transition-colors"
                    >
                      Request In Progress
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDepartmentStaffRequest('Pending')}
                      disabled={isUpdating || ticket.Status === 'Pending'}
                      className="p-2 rounded-lg border border-[#504C5B] bg-[#323039] hover:bg-[#705E86]/25 hover:border-[#8874A0]/50 text-zinc-200 text-xs font-medium text-center disabled:opacity-40 transition-colors"
                    >
                      Request Pending
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDepartmentStaffRequest('Resolved')}
                      disabled={isUpdating || ticket.Status === 'Resolved'}
                      className="p-2 rounded-lg border border-[#504C5B] bg-[#323039] hover:bg-[#705E86]/25 hover:border-[#8874A0]/50 text-zinc-200 text-xs font-medium text-center disabled:opacity-40 transition-colors"
                    >
                      Request Resolved
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDepartmentStaffRequest('Closed')}
                      disabled={isUpdating || ticket.Status === 'Closed'}
                      className="p-2 rounded-lg border border-[#504C5B] bg-[#323039] hover:bg-[#705E86]/25 hover:border-[#8874A0]/50 text-zinc-200 text-xs font-medium text-center disabled:opacity-40 transition-colors"
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
                      className="w-full text-xs p-2.5 border border-[#504C5B] rounded-lg bg-[#423F4B] text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-[#A795BD]"
                    />
                  </div>
                </div>
              )}

              {showRejectDialog && (
                <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl space-y-2">
                  <div className="text-xs font-semibold text-rose-300">
                    Reason for Rejection
                  </div>
                  <textarea
                    rows={2}
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Enter reason..."
                    className="w-full text-xs p-2.5 border border-rose-500/35 rounded-lg bg-[#423F4B] text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-rose-400"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setShowRejectDialog(false)}
                      className="px-3 py-1.5 text-xs text-zinc-300 bg-[#423F4B] border border-[#504C5B] rounded-lg hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleRejectStatus}
                      disabled={isUpdating}
                      className="px-3 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-lg"
                    >
                      Confirm Rejection
                    </button>
                  </div>
                </div>
              )}

              {showCloseDialog && (
                <div className="p-3.5 bg-[#3A3742] border border-[#504C5B] rounded-xl space-y-2">
                  <div className="text-xs font-semibold text-zinc-200">
                    Resolution Notes
                  </div>
                  <textarea
                    rows={3}
                    value={closeNote}
                    onChange={(e) => setCloseNote(e.target.value)}
                    placeholder="Enter resolution notes..."
                    className="w-full text-xs p-2.5 border border-[#504C5B] rounded-lg bg-[#423F4B] text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-[#A795BD]"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setShowCloseDialog(false)}
                      className="px-3 py-1.5 text-xs text-zinc-300 bg-[#423F4B] border border-[#504C5B] rounded-lg hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCloseTicket}
                      disabled={isUpdating}
                      className="px-3 py-1.5 text-xs font-semibold text-[#25232B] bg-emerald-500 hover:bg-emerald-400 rounded-lg"
                    >
                      Confirm Close
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2 border-b border-[#504C5B]/80 pb-2">
                  <MessageSquare className="h-4 w-4 text-[#A795BD]" />
                  <h3 className="font-semibold text-xs text-zinc-300 uppercase tracking-wider">
                    Activity & Notes ({ticket.comments?.length || 0})
                  </h3>
                </div>

                <div className="space-y-2">
                  {ticket.comments?.length === 0 ? (
                    <p className="text-xs text-zinc-500 italic">No notes recorded yet.</p>
                  ) : (
                    ticket.comments?.map((cm) => (
                      <div
                        key={cm.CommentId}
                        className={`p-3 rounded-xl border text-xs space-y-1 ${
                          cm.IsResolutionNote
                            ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-100'
                            : 'bg-[#3A3742]/70 border-[#504C5B]/80 text-zinc-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 font-medium">
                            <span className="text-white">{cm.UserName}</span>
                            <span className="text-[10px] text-zinc-400">({cm.UserRole})</span>
                            {cm.IsResolutionNote ? (
                              <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                                Resolution Note
                              </span>
                            ) : null}
                          </div>
                          <span className="text-[11px] text-zinc-500">{formatDate(cm.CreatedDate)}</span>
                        </div>
                        <p className="leading-relaxed whitespace-pre-line">{cm.Notes}</p>
                      </div>
                    ))
                  )}
                </div>

                <form onSubmit={handleAddComment} className="space-y-2.5 pt-2">
                  <textarea
                    rows={2}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add an activity note or reply..."
                    className="w-full text-xs p-3 rounded-xl border border-[#504C5B] bg-[#423F4B] text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-[#A795BD]"
                  />
                  <div className="flex items-center justify-between">
                    {(isSupportStaff || isDepartmentStaff) ? (
                      <label className="flex items-center gap-1.5 text-xs text-zinc-400 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isResolutionNote}
                          onChange={(e) => setIsResolutionNote(e.target.checked)}
                          className="rounded accent-[#F2CE54]"
                        />
                        <span>Mark as resolution note</span>
                      </label>
                    ) : (
                      <span className="text-xs text-zinc-500">{currentUser?.Name}</span>
                    )}

                    <button
                      type="submit"
                      disabled={isUpdating || !newComment.trim()}
                      className="px-3.5 py-1.5 rounded-lg bg-[#F2CE54] hover:bg-[#F7DC7C] text-[#25232B] text-xs font-semibold flex items-center gap-1 disabled:opacity-50 transition-colors"
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

        <div className="px-5 py-3 bg-[#3A3742] border-t border-[#504C5B]/80 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 bg-[#423F4B] hover:bg-[#504C5B] border border-[#504C5B] text-zinc-300 hover:text-white text-xs font-medium rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
