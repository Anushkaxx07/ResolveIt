const { getCollection } = require('../database/db');

class Notification {
  static async findAll(userId) {
    return await getCollection('notifications')
      .aggregate([
        { $sort: { CreatedDate: -1 } },
        { $limit: 20 },
        {
          $lookup: {
            from: 'tickets',
            localField: 'TicketId',
            foreignField: 'TicketId',
            as: 'ticket',
          },
        },
        { $unwind: { path: '$ticket', preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: 'categories',
            localField: 'ticket.CategoryId',
            foreignField: 'CategoryId',
            as: 'category',
          },
        },
        { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
        {
          $project: {
            _id: 0,
            NotificationId: 1,
            TicketId: 1,
            Message: 1,
            Read: 1,
            CreatedDate: 1,
            TicketTitle: '$ticket.Title',
            TicketStatus: '$ticket.Status',
            RequestedStatus: '$ticket.RequestedStatus',
            Department: '$category.Department',
          },
        },
      ])
      .toArray();
  }

  static async markAsRead(notificationId) {
    const id = Number(notificationId);
    if (Number.isNaN(id)) return null;

    return await getCollection('notifications').updateOne(
      { NotificationId: id },
      { $set: { Read: 1 } }
    );
  }

  static async markAllAsRead() {
    return await getCollection('notifications').updateMany({}, { $set: { Read: 1 } });
  }
}

module.exports = Notification;
