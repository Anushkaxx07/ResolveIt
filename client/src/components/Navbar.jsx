import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Ticket,
  PlusCircle,
  Shield,
  User,
  LogOut,
  Wrench,
  Bell
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
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-slate-900 tracking-tight">
                Resolve<span className="text-blue-600">IT</span>
              </span>
              {isSupportStaff ? (
                <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1">
                  <Shield className="h-3 w-3 text-slate-500" /> Support Staff
                </span>
              ) : isDepartmentStaff ? (
                <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1">
                  <Wrench className="h-3 w-3 text-slate-500" /> {currentUser?.Department} Specialist
                </span>
              ) : (
                <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1">
                  <User className="h-3 w-3 text-slate-500" /> Employee
                </span>
              )}
            </div>
          </div>

          <nav className="flex items-center gap-1.5 sm:gap-2">
            {(isSupportStaff || isDepartmentStaff) && (
              <button
                onClick={() => setCurrentView('dashboard')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                  currentView === 'dashboard'
                    ? 'bg-slate-100 text-slate-900 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>Dashboard</span>
              </button>
            )}

            <button
              onClick={() => setCurrentView('tickets')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                currentView === 'tickets'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Ticket className="h-4 w-4" />
              <span>
                {isSupportStaff ? 'Dispatch Queue' : isDepartmentStaff ? 'My Queue' : 'My Requests'}
              </span>
            </button>

            <button
              onClick={() => setCurrentView('create')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors ${
                currentView === 'create'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-900 text-white hover:bg-slate-800'
              }`}
            >
              <PlusCircle className="h-4 w-4" />
              <span>{isEmployee ? 'New Ticket' : 'Log Ticket'}</span>
            </button>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3 border-l border-slate-200 pl-3 relative">
            {isSupportStaff && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 relative transition-colors"
                  title="Stage Notifications"
                >
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-lg border border-slate-200 p-4 z-50 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Stage Requests
                      </span>
                      <span className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                        {unreadCount} Unread
                      </span>
                    </div>

                    <div className="max-h-72 overflow-y-auto space-y-2">
                      {notifications.length === 0 ? (
                        <p className="text-xs text-slate-400 py-4 text-center">No notifications.</p>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.NotificationId}
                            onClick={() => handleNotificationClick(n)}
                            className={`p-2.5 rounded-lg text-xs border transition-colors cursor-pointer ${
                              n.Read
                                ? 'bg-slate-50 border-slate-200 text-slate-600'
                                : 'bg-blue-50 border-blue-200 text-blue-950 font-medium'
                            }`}
                          >
                            <p className="leading-snug">{n.Message}</p>
                            <span className="text-[10px] text-slate-400 mt-1 block">
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
              <p className="text-xs font-semibold text-slate-800 leading-none">{currentUser?.Name}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">{currentUser?.Email}</p>
            </div>

            <button
              type="button"
              onClick={onLogout}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors flex items-center gap-1 text-xs font-medium"
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
