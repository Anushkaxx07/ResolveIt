const { all, get, run } = require('../database/db');

class Comment {
  static async findByTicketId(ticketId) {
    const query = `
      SELECT 
        c.CommentId,
        c.TicketId,
        c.UserId,
        u.Name AS UserName,
        u.Role AS UserRole,
        c.Notes,
        c.CreatedDate,
        c.IsResolutionNote
      FROM Comments c
      INNER JOIN Users u ON c.UserId = u.UserId
      WHERE c.TicketId = ?
      ORDER BY c.CreatedDate ASC
    `;
    return await all(query, [ticketId]);
  }

  static async create({ TicketId, UserId, Notes, IsResolutionNote = false }) {
    const insertQuery = `
      INSERT INTO Comments (TicketId, UserId, Notes, IsResolutionNote, CreatedDate)
      VALUES (?, ?, ?, ?, datetime('now'))
    `;
    const result = await run(insertQuery, [TicketId, UserId, Notes.trim(), IsResolutionNote ? 1 : 0]);
    return await get(`SELECT * FROM Comments WHERE CommentId = ?`, [result.lastID]);
  }
}

module.exports = Comment;
