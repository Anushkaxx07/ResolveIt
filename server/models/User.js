const { getCollection, getNextSequence } = require('../database/db');

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

class User {
  static async findAll(filters = {}) {
    const query = {};

    if (filters.role) {
      query.Role = filters.role;
    }

    if (filters.department) {
      query.Department = filters.department;
    }

    return await getCollection('users')
      .find(query, { projection: { _id: 0, Password: 0 } })
      .sort({ Name: 1 })
      .toArray();
  }

  static async findById(userId) {
    const id = Number(userId);
    if (Number.isNaN(id)) return null;

    return await getCollection('users').findOne(
      { UserId: id },
      { projection: { _id: 0, Password: 0 } }
    );
  }

  static async findByEmail(email) {
    if (!email) return null;
    const pattern = new RegExp(`^${escapeRegex(email.trim())}$`, 'i');

    return await getCollection('users').findOne(
      { Email: pattern },
      { projection: { _id: 0 } }
    );
  }

  static async create({ Name, Email, Password, Department, Role = 'Employee' }) {
    const UserId = await getNextSequence('UserId');
    const doc = {
      UserId,
      Name: Name.trim(),
      Email: Email.trim().toLowerCase(),
      Password,
      Department: Department.trim(),
      Role,
    };

    await getCollection('users').insertOne(doc);
    const { _id, Password: _, ...safeUser } = doc;
    return safeUser;
  }
}

module.exports = User;
