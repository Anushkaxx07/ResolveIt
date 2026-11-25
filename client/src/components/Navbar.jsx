import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Ticket,
  PlusCircle,
  Shield,
  User,
  LogOut,
  Wrench,
  Bell,
  Sparkles
} from 'lucide-react';
import { api } from '../services/api';

export default function Navbar({
  currentView,
  setCurrentView,
  currentUser,
  onLogout,
  onSelectTicket
}) {
  const isSupportStaff = currentUser?.Role === 'SupportStaff' || currentUser?.Role === 'Admin';
  const isDepartmentStaff = currentUser?.Role === 'DepartmentStaff' || currentUser?.Role === 'SupportAgent';
  const isEmployee = currentUser?.Role === 'Employee';

  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (isSupportStaff) {
      loadNotifications();
      const interval = setInterval(loadNotifications, 10000);
      return () => clearInterval(interval);
    }
  }, [currentUser]);

  const loadNotifications = async () => {
    try {
      const res = await api.getNotifications();
      setNotifications(res.data || []);
    } catch (e) {}
  };

  const unreadCount = notifications.filter((n) => !n.Read).length;

  const handleNotificationClick = async (notif) => {
    try {
      await api.markNotificationRead(notif.NotificationId);
      await loadNotifications();
      if (onSelectTicket && notif.TicketId) {
        onSelectTicket(notif.TicketId);
        setShowNotifications(false);
      }
    } catch (e) {}
  };

  return (
    <header className="sticky top-0 z-30 bg-[#323039]/90 backdrop-blur-md border-b border-[#504C5B]/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#705E86] to-[#423F4B] border border-[#8874A0]/40 flex items-center justify-center shadow-sm">
              <Sparkles className="h-4 w-4 text-[#F2CE54]" />
            </div>
            <div className="flex items-center gap-2.5">
              <span className="font-bold text-lg text-white tracking-tight">
                Resolve<span className="text-[#F2CE54]">IT</span>
              </span>
              {isSupportStaff ? (
                <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider rounded-md bg-[#423F4B] text-zinc-300 border border-[#504C5B]">
                  <Shield className="h-3 w-3 text-[#A795BD]" /> Support Staff
                </span>
              ) : isDepartmentStaff ? (
                <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider rounded-md bg-[#423F4B] text-zinc-300 border border-[#504C5B]">
                  <Wrench className="h-3 w-3 text-[#A795BD]" /> {currentUser?.Department}
                </span>
              ) : (
                <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider rounded-md bg-[#423F4B] text-zinc-300 border border-[#504C5B]">
                  <User className="h-3 w-3 text-[#A795BD]" /> Employee
                </span>
              )}
            </div>
          </div>

          <nav className="flex items-center gap-1 bg-[#25232B]/70 p-1 rounded-xl border border-[#504C5B]/80">
            {(isSupportStaff || isDepartmentStaff) && (
              <button
                onClick={() => setCurrentView('dashboard')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  currentView === 'dashboard'
                    ? 'bg-[#423F4B] text-white shadow-sm border border-[#625D6F]/80'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-[#3A3742]'
                }`}
              >
                <LayoutDashboard className={`h-3.5 w-3.5 ${currentView === 'dashboard' ? 'text-[#F2CE54]' : ''}`} />
                <span>Dashboard</span>
              </button>
            )}

            <button
              onClick={() => setCurrentView('tickets')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                currentView === 'tickets'
                  ? 'bg-[#423F4B] text-white shadow-sm border border-[#625D6F]/80'
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-[#3A3742]'
              }`}
            >
              <Ticket className={`h-3.5 w-3.5 ${currentView === 'tickets' ? 'text-[#F2CE54]' : ''}`} />
              <span>
                {isSupportStaff ? 'Dispatch Queue' : isDepartmentStaff ? 'My Queue' : 'My Requests'}
              </span>
            </button>

            <button
              onClick={() => setCurrentView('create')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentView === 'create'
                  ? 'bg-[#E5BF3F] text-[#25232B] shadow-sm'
                  : 'bg-[#F2CE54] text-[#25232B] hover:bg-[#F7DC7C]'
              }`}
            >
              <PlusCircle className="h-3.5 w-3.5" />
              <span>{isEmployee ? 'New Ticket' : 'Log Ticket'}</span>
            </button>
          </nav>

          <div className="flex items-center gap-2.5 pl-2 relative">
            {isSupportStaff && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-[#423F4B] border border-[#504C5B]/80 relative transition-colors"
                  title="Stage Notifications"
                >
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-[#F2CE54] text-[#25232B] text-[10px] font-bold flex items-center justify-center ring-2 ring-[#323039]">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#323039] rounded-xl shadow-2xl border border-[#504C5B] p-4 z-50 space-y-3">
                    <div className="flex items-center justify-between border-b border-[#504C5B] pb-2.5">
                      <span className="text-xs font-semibold text-white uppercase tracking-wider">
                        Stage Requests
                      </span>
                      <span className="text-[11px] bg-[#705E86]/25 text-[#C8BBD8] px-2 py-0.5 rounded-md font-medium border border-[#8874A0]/35">
                        {unreadCount} Unread
                      </span>
                    </div>

                    <div className="max-h-72 overflow-y-auto space-y-2">
                      {notifications.length === 0 ? (
                        <p className="text-xs text-zinc-500 py-4 text-center">No notifications.</p>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.NotificationId}
                            onClick={() => handleNotificationClick(n)}
                            className={`p-3 rounded-lg text-xs border transition-colors cursor-pointer ${
                              n.Read
                                ? 'bg-[#3A3742] border-[#504C5B]/70 text-zinc-400 hover:border-[#625D6F]'
                                : 'bg-[#3E334B]/70 border-[#8874A0]/40 text-zinc-100 font-medium hover:border-[#F2CE54]/50'
                            }`}
                          >
                            <p className="leading-snug">{n.Message}</p>
                            <span className="text-[10px] text-zinc-500 mt-1 block">
                              {new Date(n.CreatedDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="text-right hidden sm:block">
              <p className="text-xs font-medium text-zinc-100 leading-none">{currentUser?.Name}</p>
              <p className="text-[11px] text-zinc-400 mt-0.5">{currentUser?.Email}</p>
            </div>

            <button
              type="button"
              onClick={onLogout}
              className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-[#423F4B] border border-[#504C5B]/80 transition-colors flex items-center gap-1.5 text-xs font-medium"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden md:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
