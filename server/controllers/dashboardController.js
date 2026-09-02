const { all, get } = require('../database/db');

const getDashboardStats = async (req, res, next) => {
  try {
    const totalRow = await get(`SELECT COUNT(*) as count FROM Tickets`);
    const openRow = await get(`SELECT COUNT(*) as count FROM Tickets WHERE Status = 'Open'`);
    const inProgressRow = await get(`SELECT COUNT(*) as count FROM Tickets WHERE Status = 'In Progress' OR Status = 'Assigned'`);
    const resolvedRow = await get(`SELECT COUNT(*) as count FROM Tickets WHERE Status = 'Resolved'`);
    const closedRow = await get(`SELECT COUNT(*) as count FROM Tickets WHERE Status = 'Closed'`);
    const urgentRow = await get(`SELECT COUNT(*) as count FROM Tickets WHERE Priority = 'High'`);

    const byCategory = await all(`
      SELECT c.Name as category, c.Department as department, COUNT(t.TicketId) as count
      FROM Categories c
      LEFT JOIN Tickets t ON c.CategoryId = t.CategoryId
      GROUP BY c.CategoryId, c.Name, c.Department
      ORDER BY count DESC
    `);

    const byDepartment = await all(`
      SELECT c.Department as department, COUNT(t.TicketId) as count
      FROM Categories c
      LEFT JOIN Tickets t ON c.CategoryId = t.CategoryId
      GROUP BY c.Department
      ORDER BY count DESC
    `);

    const byPriority = await all(`
      SELECT Priority as priority, COUNT(*) as count
      FROM Tickets
      GROUP BY Priority
    `);

    const byStatus = await all(`
      SELECT Status as status, COUNT(*) as count
      FROM Tickets
      GROUP BY Status
    `);

    const recentTickets = await all(`
      SELECT 
        t.TicketId, t.Title, t.Priority, t.Status, t.RequestedStatus, t.CreatedDate,
        c.Name as CategoryName, c.Department,
        u.Name as RequesterName
      FROM Tickets t
      INNER JOIN Categories c ON t.CategoryId = c.CategoryId
      INNER JOIN Users u ON t.RequesterId = u.UserId
      ORDER BY t.CreatedDate DESC
      LIMIT 10
    `);

    res.status(200).json({
      success: true,
      data: {
        totalTickets: totalRow?.count || 0,
        openTickets: openRow?.count || 0,
        inProgressTickets: inProgressRow?.count || 0,
        resolvedTickets: resolvedRow?.count || 0,
        closedTickets: closedRow?.count || 0,
        urgentTickets: urgentRow?.count || 0,
        byCategory,
        byDepartment,
        byPriority,
        byStatus,
        recentTickets
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats
};
