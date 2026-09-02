const API_BASE = '/api';

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  
  const storedUser = localStorage.getItem('smartdesk_user');
  let authHeaders = {};
  if (storedUser) {
    try {
      const parsed = JSON.parse(storedUser);
      if (parsed?.UserId) {
        authHeaders['x-user-id'] = String(parsed.UserId);
      }
    } catch (e) {}
  }

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(url, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'An error occurred while processing the request');
  }

  return data;
}

export const api = {
  login: (email, password, role = 'Employee') =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, role }),
    }),

  getMe: () => request('/auth/me'),

  getTickets: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '' && val !== 'All') {
        query.append(key, val);
      }
    });
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return request(`/tickets${queryString}`);
  },

  getTicketById: (id) => request(`/tickets/${id}`),

  createTicket: (ticketData) =>
    request('/tickets', {
      method: 'POST',
      body: JSON.stringify(ticketData),
    }),

  updateTicket: (id, updateData) =>
    request(`/tickets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    }),

  requestStatus: (id, { requestedStatus, staffUserId, notes }) =>
    request(`/tickets/${id}/request-status`, {
      method: 'PUT',
      body: JSON.stringify({ requestedStatus, staffUserId, notes }),
    }),

  approveStatus: (id) =>
    request(`/tickets/${id}/approve-status`, {
      method: 'PUT',
    }),

  rejectStatus: (id, reason = '') =>
    request(`/tickets/${id}/reject-status`, {
      method: 'PUT',
      body: JSON.stringify({ reason }),
    }),

  getStaffAvailability: (department) =>
    request(`/tickets/staff/availability${department ? `?department=${encodeURIComponent(department)}` : ''}`),

  closeTicket: (id, { ResolutionNotes, UserId } = {}) =>
    request(`/tickets/${id}/close`, {
      method: 'PUT',
      body: JSON.stringify({ ResolutionNotes, UserId }),
    }),

  addComment: (ticketId, commentData) =>
    request(`/tickets/${ticketId}/comments`, {
      method: 'POST',
      body: JSON.stringify(commentData),
    }),

  getNotifications: () => request('/notifications'),
  markNotificationRead: (id) =>
    request(`/notifications/${id}/read`, {
      method: 'PUT',
    }),

  getDashboardStats: () => request('/dashboard/stats'),

  getCategories: () => request('/categories'),
  getUsers: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/users${query ? `?${query}` : ''}`);
  }
};
