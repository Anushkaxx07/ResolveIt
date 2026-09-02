const User = require('../models/User');

const getUsers = async (req, res, next) => {
  try {
    const users = await User.findAll(req.query);
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    next(error);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  getUserById
};
