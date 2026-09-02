const { all, get, run } = require('../database/db');

class Ticket {
  static async findAll(filters = {}) {
    const { status, priority, categoryId, department, search, requesterId, assigneeId, hasRequestedStatus } = filters;

    let query = `
      SELECT 
        t.TicketId,
        t.Title,
        t.Description,
        t.Priority,
        t.Status,
        t.RequestedStatus,
        t.CreatedDate,
        t.UpdatedDate,
        t.ResolvedDate,
        c.CategoryId,
        c.Name AS CategoryName,
        c.Department,
        u1.UserId AS RequesterId,
        u1.Name AS RequesterName,
        u1.Email AS RequesterEmail,
        u1.Department AS RequesterDepartment,
        u2.UserId AS AssigneeId,
        u2.Name AS AssigneeName,
        u2.Department AS AssigneeDepartment,
        u2.Role AS AssigneeRole
      FROM Tickets t
      INNER JOIN Categories c ON t.CategoryId = c.CategoryId
      INNER JOIN Users u1 ON t.RequesterId = u1.UserId
      LEFT JOIN Users u2 ON t.AssigneeId = u2.UserId
      WHERE 1=1
    `;

    const params = [];

    if (hasRequestedStatus === 'true' || hasRequestedStatus === true) {
      query += ` AND t.RequestedStatus IS NOT NULL`;
    }

    if (status && status !== 'All') {
      query += ` AND t.Status = ?`;
      params.push(status);
    }

    if (priority && priority !== 'All') {
      query += ` AND t.Priority = ?`;
      params.push(priority);
    }

    if (categoryId && categoryId !== 'All') {
      query += ` AND t.CategoryId = ?`;
      params.push(categoryId);
    }

    if (department && department !== 'All') {
      query += ` AND c.Department = ?`;
      params.push(department);
    }

    if (requesterId) {
      query += ` AND t.RequesterId = ?`;
      params.push(requesterId);
    }

    if (assigneeId) {
      query += ` AND t.AssigneeId = ?`;
      params.push(assigneeId);
    }

    if (search) {
      query += ` AND (t.Title LIKE ? OR t.Description LIKE ? OR CAST(t.TicketId AS TEXT) LIKE ?)`;
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    query += ` ORDER BY t.CreatedDate DESC`;

    return await all(query, params);
  }

  static async findById(ticketId) {
    const ticketQuery = `
      SELECT 
        t.TicketId,
        t.Title,
        t.Description,
        t.Priority,
        t.Status,
        t.RequestedStatus,
        t.CreatedDate,
        t.UpdatedDate,
        t.ResolvedDate,
        c.CategoryId,
        c.Name AS CategoryName,
        c.Department,
        u1.UserId AS RequesterId,
        u1.Name AS RequesterName,
        u1.Email AS RequesterEmail,
        u1.Department AS RequesterDepartment,
        u2.UserId AS AssigneeId,
        u2.Name AS AssigneeName,
        u2.Email AS AssigneeEmail,
        u2.Department AS AssigneeDepartment,
        u2.Role AS AssigneeRole
      FROM Tickets t
      INNER JOIN Categories c ON t.CategoryId = c.CategoryId
      INNER JOIN Users u1 ON t.RequesterId = u1.UserId
      LEFT JOIN Users u2 ON t.AssigneeId = u2.UserId
      WHERE t.TicketId = ?
    `;

    return await get(ticketQuery, [ticketId]);
  }

  static async create({ Title, Description, CategoryId, Priority, RequesterId }) {
    const insertQuery = `
      INSERT INTO Tickets (Title, Description, CategoryId, Priority, Status, RequestedStatus, RequesterId, CreatedDate, UpdatedDate)
      VALUES (?, ?, ?, ?, 'Open', NULL, ?, datetime('now'), datetime('now'))
    `;

    const result = await run(insertQuery, [Title.trim(), Description.trim(), CategoryId, Priority, RequesterId]);
    return await this.findById(result.lastID);
  }

  static async update(ticketId, { Status, Priority, AssigneeId, CategoryId }) {
    const existing = await get(`SELECT * FROM Tickets WHERE TicketId = ?`, [ticketId]);
    if (!existing) return null;

    const newStatus = Status || existing.Status;
    const newPriority = Priority || existing.Priority;
    const newAssigneeId = AssigneeId !== undefined ? AssigneeId : existing.AssigneeId;
    const newCategoryId = CategoryId || existing.CategoryId;
    const resolvedDate = newStatus === 'Resolved' || newStatus === 'Closed' ? new Date().toISOString() : null;

    const updateSql = `
      UPDATE Tickets 
      SET Status = ?, Priority = ?, AssigneeId = ?, CategoryId = ?, UpdatedDate = datetime('now'), ResolvedDate = ?
      WHERE TicketId = ?
    `;

    await run(updateSql, [newStatus, newPriority, newAssigneeId, newCategoryId, resolvedDate, ticketId]);
    return await this.findById(ticketId);
  }

  static async requestStatus(ticketId, { requestedStatus, staffUserId, notes }) {
    const ticket = await this.findById(ticketId);
    if (!ticket) return null;

    await run(`
      UPDATE Tickets 
      SET RequestedStatus = ?, UpdatedDate = datetime('now')
      WHERE TicketId = ?
    `, [requestedStatus, ticketId]);

    if (notes && notes.trim()) {
      await run(`
        INSERT INTO Comments (TicketId, UserId, Notes, IsResolutionNote, CreatedDate)
        VALUES (?, ?, ?, ?, datetime('now'))
      `, [ticketId, staffUserId, `[Status Change Request: "${requestedStatus}"] - ${notes.trim()}`, requestedStatus === 'Resolved' ? 1 : 0]);
    }

    const staffName = ticket.AssigneeName || 'Department Staff';
    const message = `${staffName} (${ticket.Department} Staff) requested status change to "${requestedStatus}" on Ticket #${ticketId}: "${ticket.Title}"`;

    await run(`
      INSERT INTO Notifications (UserId, TicketId, Message, Read, CreatedDate)
      VALUES (NULL, ?, ?, 0, datetime('now'))
    `, [ticketId, message]);

    return await this.findById(ticketId);
  }

  static async approveStatus(ticketId) {
    const ticket = await this.findById(ticketId);
    if (!ticket || !ticket.RequestedStatus) return null;

    const newStatus = ticket.RequestedStatus;
    const resolvedDate = newStatus === 'Resolved' || newStatus === 'Closed' ? new Date().toISOString() : null;

    await run(`
      UPDATE Tickets 
      SET Status = ?, RequestedStatus = NULL, ResolvedDate = ?, UpdatedDate = datetime('now')
      WHERE TicketId = ?
    `, [newStatus, resolvedDate, ticketId]);

    await run(`
      INSERT INTO Comments (TicketId, UserId, Notes, IsResolutionNote, CreatedDate)
      VALUES (?, 11, ?, ?, datetime('now'))
    `, [ticketId, `Support Staff APPROVED stage transition to "${newStatus}".`, newStatus === 'Resolved' ? 1 : 0]);

    return await this.findById(ticketId);
  }

  static async rejectStatus(ticketId, reason) {
    const ticket = await this.findById(ticketId);
    if (!ticket) return null;

    const requested = ticket.RequestedStatus;

    await run(`
      UPDATE Tickets 
      SET RequestedStatus = NULL, UpdatedDate = datetime('now')
      WHERE TicketId = ?
    `, [ticketId]);

    await run(`
      INSERT INTO Comments (TicketId, UserId, Notes, IsResolutionNote, CreatedDate)
      VALUES (?, 11, ?, 0, datetime('now'))
    `, [ticketId, `Support Staff REJECTED requested status change to "${requested}". Reason: ${reason || 'Requires further verification.'}`]);

    return await this.findById(ticketId);
  }

  static async getStaffAvailability(department) {
    let sql = `
      SELECT 
        u.UserId,
        u.Name,
        u.Email,
        u.Department,
        u.Role,
        COUNT(CASE WHEN t.Status IN ('Assigned', 'In Progress', 'Pending') THEN 1 END) AS activeTicketsCount
      FROM Users u
      LEFT JOIN Tickets t ON u.UserId = t.AssigneeId
      WHERE u.Role = 'DepartmentStaff'
    `;

    const params = [];
    if (department && department !== 'All') {
      sql += ` AND u.Department = ?`;
      params.push(department);
    }

    sql += ` GROUP BY u.UserId, u.Name, u.Email, u.Department, u.Role ORDER BY activeTicketsCount ASC, u.Name ASC`;

    const rows = await all(sql, params);
    return rows.map((r) => ({
      ...r,
      isAvailable: r.activeTicketsCount === 0,
      workloadStatus: r.activeTicketsCount === 0 ? 'Available (0 Active)' : `${r.activeTicketsCount} Active Tickets`
    }));
  }

  static async close(ticketId) {
    const updateSql = `
      UPDATE Tickets
      SET Status = 'Closed', RequestedStatus = NULL, ResolvedDate = datetime('now'), UpdatedDate = datetime('now')
      WHERE TicketId = ?
    `;
    return await run(updateSql, [ticketId]);
  }
}

module.exports = Ticket;
