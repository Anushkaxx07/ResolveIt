const { getCollection } = require('../database/db');

class Category {
  static async findAll(department = null) {
    const query = {};
    if (department && department !== 'All') {
      query.Department = department;
    }

    return await getCollection('categories')
      .find(query, { projection: { _id: 0 } })
      .sort({ Department: 1, Name: 1 })
      .toArray();
  }

  static async findById(categoryId) {
    const id = Number(categoryId);
    if (Number.isNaN(id)) return null;

    return await getCollection('categories').findOne(
      { CategoryId: id },
      { projection: { _id: 0 } }
    );
  }
}

module.exports = Category;
