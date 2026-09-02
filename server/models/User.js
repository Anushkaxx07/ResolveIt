const { all, get, run } = require('../database/db');

class User {
  static async findAll(filters = {}) {
    let query = `SELECT UserId, Name, Email, Department, Role FROM Users WHERE 1=1`;
    const params = [];

    if (filters.role) {
      query += ` AND Role = ?`;
      params.push(filters.role);
    }

    if (filters.department) {
      query += ` AND Department = ?`;
      params.push(filters.department);
    }

    query += ` ORDER BY Name ASC`;
    return await all(query, params);
  }

  static async findById(userId) {
    return await get(`SELECT UserId, Name, Email, Department, Role FROM Users WHERE UserId = ?`, [userId]);
  }

  static async findByEmail(email) {
    return await get(`SELECT * FROM Users WHERE LOWER(Email) = LOWER(?)`, [email.trim()]);
  }
}

module.exports = User;
