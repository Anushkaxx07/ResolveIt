const Notification = require('../models/Notification');

const getNotifications = async (req, res, next) => {
  try {
    const list = await Notification.findAll(req.headers['x-user-id']);
    res.status(200).json({ success: true, count: list.length, data: list });
  } catch (error) {
    next(error);
  }
};

const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    await Notification.markAsRead(id);
    res.status(200).json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotifications,
  markAsRead
};
