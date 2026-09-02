const { all, get, run } = require('../database/db');

class Category {
  static async findAll(department = null) {
    let query = `SELECT CategoryId, Name, Department, Description FROM Categories`;
    const params = [];

    if (department && department !== 'All') {
      query += ` WHERE Department = ?`;
      params.push(department);
    }

    query += ` ORDER BY Department ASC, Name ASC`;
    return await all(query, params);
  }

  static async findById(categoryId) {
    return await get(`SELECT * FROM Categories WHERE CategoryId = ?`, [categoryId]);
  }
}

module.exports = Category;
