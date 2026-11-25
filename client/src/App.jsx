import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import TicketResults from './components/TicketResults';
import TicketForm from './components/TicketForm';
import TicketDetailModal from './components/TicketDetailModal';
import LoginPage from './components/LoginPage';
import { api } from './services/api';

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('smartdesk_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const [currentView, setCurrentView] = useState('tickets');
  const [tickets, setTickets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const isSupportStaff = currentUser?.Role === 'SupportStaff' || currentUser?.Role === 'Admin';
  const isDepartmentStaff = currentUser?.Role === 'DepartmentStaff' || currentUser?.Role === 'SupportAgent';
  const isEmployee = currentUser?.Role === 'Employee';

  const [filters, setFilters] = useState({
    search: '',
    department: 'All',
    categoryId: 'All',
    status: 'All',
    priority: 'All',
  });

  useEffect(() => {
    if (currentUser) {
      if (isSupportStaff) {
        setCurrentView('dashboard');
      } else {
        setCurrentView('tickets');
      }
    }
  }, [currentUser?.UserId, currentUser?.Role]);

  const loadInitialData = async () => {
    if (!currentUser) return;

    try {
      setIsLoading(true);
      const [catRes, userRes] = await Promise.all([
        api.getCategories(),
        api.getUsers(),
      ]);

      setCategories(catRes.data || []);
      setUsers(userRes.data || []);

      await Promise.all([loadTickets(), (isSupportStaff || isDepartmentStaff) ? loadDashboardStats() : Promise.resolve()]);
    } catch (err) {
      console.error('Failed to load initial data:', err);
      setErrorMessage('Could not connect to backend server. Make sure the server is running on port 5000.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadTickets = async () => {
    try {
      const res = await api.getTickets(filters);
      setTickets(res.data || []);
    } catch (err) {
      console.error('Failed to load tickets:', err);
    }
  };

  const loadDashboardStats = async () => {
    try {
      const res = await api.getDashboardStats();
      setStats(res.data || null);
    } catch (err) {
      console.error('Failed to load dashboard stats:', err);
    }
  };

  useEffect(() => {
    if (currentUser) {
      loadInitialData();
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      loadTickets();
    }
  }, [filters]);

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    if (user.Role === 'SupportStaff' || user.Role === 'Admin') {
      setCurrentView('dashboard');
    } else {
      setCurrentView('tickets');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('smartdesk_user');
    setCurrentUser(null);
    setTickets([]);
    setStats(null);
    setSelectedTicketId(null);
  };

  const handleCreateTicket = async (ticketData) => {
    const res = await api.createTicket({
      ...ticketData,
      RequesterId: currentUser?.UserId || 1,
    });

    await Promise.all([loadTickets(), (isSupportStaff || isDepartmentStaff) ? loadDashboardStats() : Promise.resolve()]);
    setCurrentView('tickets');
    if (res.data?.TicketId) {
      setSelectedTicketId(res.data.TicketId);
    }
  };

  const handleNavigateToTicketsWithFilter = (newFilters = {}) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
    }));
    setCurrentView('tickets');
  };

  if (!currentUser) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-[#25232B] text-zinc-100 flex flex-col">
      <Navbar
        currentView={currentView}
        setCurrentView={(view) => {
          if (view === 'dashboard' && isEmployee) {
            alert('Access Denied: Restricted to Support Staff.');
            return;
          }
          setCurrentView(view);
        }}
        currentUser={currentUser}
        onLogout={handleLogout}
        onSelectTicket={(ticketId) => setSelectedTicketId(ticketId)}
      />

      {errorMessage && (
        <div className="bg-[#3E334B] border-b border-[#F2CE54]/40 text-[#F7DC7C] px-4 py-2 text-center text-xs font-semibold flex items-center justify-center gap-2">
          <span>{errorMessage}</span>
          <button
            onClick={() => {
              setErrorMessage(null);
              loadInitialData();
            }}
            className="underline ml-2"
          >
            Retry
          </button>
        </div>
      )}

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentView === 'dashboard' && (isSupportStaff || isDepartmentStaff) && (
          <Dashboard
            stats={stats}
            onNavigateToTickets={handleNavigateToTicketsWithFilter}
            onSelectTicket={(ticket) => setSelectedTicketId(ticket.TicketId)}
          />
        )}

        {currentView === 'tickets' && (
          <TicketResults
            tickets={tickets}
            categories={categories}
            currentUser={currentUser}
            onSelectTicket={(ticket) => setSelectedTicketId(ticket.TicketId)}
            filters={filters}
            setFilters={setFilters}
            onRefresh={() => {
              loadTickets();
              if (isSupportStaff || isDepartmentStaff) loadDashboardStats();
            }}
            isLoading={isLoading}
            onNavigateToCreate={() => setCurrentView('create')}
          />
        )}

        {currentView === 'create' && (
          <TicketForm
            categories={categories}
            currentUser={currentUser}
            onSubmitTicket={handleCreateTicket}
            onCancel={() => setCurrentView('tickets')}
          />
        )}
      </main>

      {selectedTicketId && (
        <TicketDetailModal
          ticketId={selectedTicketId}
          onClose={() => setSelectedTicketId(null)}
          currentUser={currentUser}
          users={users}
          categories={categories}
          api={api}
          onTicketUpdated={() => {
            loadTickets();
            if (isSupportStaff || isDepartmentStaff) loadDashboardStats();
          }}
        />
      )}

      <footer className="border-t border-[#504C5B]/80 bg-[#323039]/60 py-4 mt-10 text-center text-xs text-zinc-500">
        <p>
          ResolveIT Enterprise Service Desk • Authenticated as <strong className="text-zinc-200 font-medium">{currentUser?.Name}</strong> <span className="text-[#A795BD]">({currentUser?.Role})</span>
        </p>
      </footer>
    </div>
  );
}
