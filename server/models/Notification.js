const { all, get, run } = require('../database/db');

class Notification {
  static async findAll(userId) {
    let sql = `
      SELECT 
        n.NotificationId,
        n.TicketId,
        n.Message,
        n.Read,
        n.CreatedDate,
        t.Title AS TicketTitle,
        t.Status AS TicketStatus,
        t.RequestedStatus,
        c.Department
      FROM Notifications n
      LEFT JOIN Tickets t ON n.TicketId = t.TicketId
      LEFT JOIN Categories c ON t.CategoryId = c.CategoryId
      ORDER BY n.CreatedDate DESC
      LIMIT 20
    `;
    return await all(sql);
  }

  static async markAsRead(notificationId) {
    return await run(`UPDATE Notifications SET Read = 1 WHERE NotificationId = ?`, [notificationId]);
  }

  static async markAllAsRead() {
    return await run(`UPDATE Notifications SET Read = 1`);
  }
}

module.exports = Notification;
