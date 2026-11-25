const { getCollection } = require('../database/db');

const getDashboardStats = async (req, res, next) => {
  try {
    const ticketsCol = getCollection('tickets');
    const categoriesCol = getCollection('categories');

    const [
      totalTickets,
      openTickets,
      inProgressTickets,
      resolvedTickets,
      closedTickets,
      urgentTickets,
      byCategory,
      byDepartment,
      byPriority,
      byStatus,
      recentTickets,
    ] = await Promise.all([
      ticketsCol.countDocuments(),
      ticketsCol.countDocuments({ Status: 'Open' }),
      ticketsCol.countDocuments({ Status: { $in: ['In Progress', 'Assigned'] } }),
      ticketsCol.countDocuments({ Status: 'Resolved' }),
      ticketsCol.countDocuments({ Status: 'Closed' }),
      ticketsCol.countDocuments({ Priority: 'High' }),
      categoriesCol
        .aggregate([
          {
            $lookup: {
              from: 'tickets',
              localField: 'CategoryId',
              foreignField: 'CategoryId',
              as: 'tickets',
            },
          },
          {
            $project: {
              _id: 0,
              categoryId: '$CategoryId',
              category: '$Name',
              department: '$Department',
              count: { $size: '$tickets' },
            },
          },
          { $sort: { count: -1 } },
        ])
        .toArray(),
      categoriesCol
        .aggregate([
          {
            $lookup: {
              from: 'tickets',
              localField: 'CategoryId',
              foreignField: 'CategoryId',
              as: 'tickets',
            },
          },
          {
            $group: {
              _id: '$Department',
              count: { $sum: { $size: '$tickets' } },
            },
          },
          {
            $project: {
              _id: 0,
              department: '$_id',
              count: 1,
            },
          },
          { $sort: { count: -1 } },
        ])
        .toArray(),
      ticketsCol
        .aggregate([
          { $group: { _id: '$Priority', count: { $sum: 1 } } },
          { $project: { _id: 0, priority: '$_id', count: 1 } },
        ])
        .toArray(),
      ticketsCol
        .aggregate([
          { $group: { _id: '$Status', count: { $sum: 1 } } },
          { $project: { _id: 0, status: '$_id', count: 1 } },
        ])
        .toArray(),
      ticketsCol
        .aggregate([
          { $sort: { CreatedDate: -1 } },
          { $limit: 10 },
          {
            $lookup: {
              from: 'categories',
              localField: 'CategoryId',
              foreignField: 'CategoryId',
              as: 'category',
            },
          },
          { $unwind: '$category' },
          {
            $lookup: {
              from: 'users',
              localField: 'RequesterId',
              foreignField: 'UserId',
              as: 'requester',
            },
          },
          { $unwind: '$requester' },
          {
            $project: {
              _id: 0,
              TicketId: 1,
              Title: 1,
              Priority: 1,
              Status: 1,
              RequestedStatus: 1,
              CreatedDate: 1,
              CategoryName: '$category.Name',
              Department: '$category.Department',
              RequesterName: '$requester.Name',
            },
          },
        ])
        .toArray(),
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalTickets,
        openTickets,
        inProgressTickets,
        resolvedTickets,
        closedTickets,
        urgentTickets,
        byCategory,
        byDepartment,
        byPriority,
        byStatus,
        recentTickets,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
};
