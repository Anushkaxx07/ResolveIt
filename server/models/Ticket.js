const { getCollection, getNextSequence } = require('../database/db');

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildTicketLookupStages(includeAssigneeEmail = false) {
  const project = {
    _id: 0,
    TicketId: 1,
    Title: 1,
    Description: 1,
    Priority: 1,
    Status: 1,
    RequestedStatus: 1,
    CreatedDate: 1,
    UpdatedDate: 1,
    ResolvedDate: 1,
    CategoryId: '$category.CategoryId',
    CategoryName: '$category.Name',
    Department: '$category.Department',
    RequesterId: '$requester.UserId',
    RequesterName: '$requester.Name',
    RequesterEmail: '$requester.Email',
    RequesterDepartment: '$requester.Department',
    AssigneeId: { $ifNull: ['$assignee.UserId', null] },
    AssigneeName: { $ifNull: ['$assignee.Name', null] },
    AssigneeDepartment: { $ifNull: ['$assignee.Department', null] },
    AssigneeRole: { $ifNull: ['$assignee.Role', null] },
  };

  if (includeAssigneeEmail) {
    project.AssigneeEmail = { $ifNull: ['$assignee.Email', null] };
  }

  return [
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
      $lookup: {
        from: 'users',
        localField: 'AssigneeId',
        foreignField: 'UserId',
        as: 'assignee',
      },
    },
    { $unwind: { path: '$assignee', preserveNullAndEmptyArrays: true } },
    { $project: project },
  ];
}

class Ticket {
  static async findAll(filters = {}) {
    const {
      status,
      priority,
      categoryId,
      department,
      search,
      requesterId,
      assigneeId,
      hasRequestedStatus,
    } = filters;

    const preMatch = {};

    if (hasRequestedStatus === 'true' || hasRequestedStatus === true) {
      preMatch.RequestedStatus = { $ne: null };
    }

    if (status && status !== 'All') {
      preMatch.Status = status;
    }

    if (priority && priority !== 'All') {
      preMatch.Priority = priority;
    }

    if (categoryId && categoryId !== 'All') {
      const catId = Number(categoryId);
      if (!Number.isNaN(catId)) preMatch.CategoryId = catId;
    }

    if (requesterId) {
      const reqId = Number(requesterId);
      if (!Number.isNaN(reqId)) preMatch.RequesterId = reqId;
    }

    if (assigneeId) {
      const assId = Number(assigneeId);
      if (!Number.isNaN(assId)) preMatch.AssigneeId = assId;
    }

    const pipeline = [];
    if (Object.keys(preMatch).length > 0) {
      pipeline.push({ $match: preMatch });
    }

    pipeline.push(...buildTicketLookupStages(false));

    const postMatch = {};
    if (department && department !== 'All') {
      postMatch.Department = department;
    }

    if (search && search.trim()) {
      const regex = new RegExp(escapeRegex(search.trim()), 'i');
      pipeline.push({
        $addFields: {
          TicketIdStr: { $toString: '$TicketId' },
        },
      });
      postMatch.$or = [
        { Title: regex },
        { Description: regex },
        { CategoryName: regex },
        { TicketIdStr: regex },
      ];
    }

    if (Object.keys(postMatch).length > 0) {
      pipeline.push({ $match: postMatch });
    }

    if (search && search.trim()) {
      pipeline.push({ $project: { TicketIdStr: 0 } });
    }

    pipeline.push({ $sort: { CreatedDate: -1 } });

    return await getCollection('tickets').aggregate(pipeline).toArray();
  }

  static async findById(ticketId) {
    const id = Number(ticketId);
    if (Number.isNaN(id)) return null;

    const results = await getCollection('tickets')
      .aggregate([{ $match: { TicketId: id } }, ...buildTicketLookupStages(true)])
      .toArray();

    return results[0] || null;
  }

  static async create({ Title, Description, CategoryId, Priority, RequesterId }) {
    const TicketId = await getNextSequence('TicketId');
    const now = new Date();

    await getCollection('tickets').insertOne({
      TicketId,
      Title: Title.trim(),
      Description: Description.trim(),
      CategoryId: Number(CategoryId),
      Priority,
      Status: 'Open',
      RequestedStatus: null,
      RequesterId: Number(RequesterId),
      AssigneeId: null,
      CreatedDate: now,
      UpdatedDate: now,
      ResolvedDate: null,
    });

    return await this.findById(TicketId);
  }

  static async update(ticketId, { Status, Priority, AssigneeId, CategoryId }) {
    const id = Number(ticketId);
    if (Number.isNaN(id)) return null;

    const existing = await getCollection('tickets').findOne({ TicketId: id });
    if (!existing) return null;

    const newStatus = Status || existing.Status;
    const newPriority = Priority || existing.Priority;
    const newAssigneeId =
      AssigneeId !== undefined
        ? AssigneeId === null || AssigneeId === ''
          ? null
          : Number(AssigneeId)
        : existing.AssigneeId;
    const newCategoryId = CategoryId ? Number(CategoryId) : existing.CategoryId;
    const resolvedDate =
      newStatus === 'Resolved' || newStatus === 'Closed' ? new Date() : null;

    await getCollection('tickets').updateOne(
      { TicketId: id },
      {
        $set: {
          Status: newStatus,
          Priority: newPriority,
          AssigneeId: newAssigneeId,
          CategoryId: newCategoryId,
          UpdatedDate: new Date(),
          ResolvedDate: resolvedDate,
        },
      }
    );

    return await this.findById(id);
  }

  static async requestStatus(ticketId, { requestedStatus, staffUserId, notes }) {
    const ticket = await this.findById(ticketId);
    if (!ticket) return null;

    const now = new Date();
    await getCollection('tickets').updateOne(
      { TicketId: ticket.TicketId },
      { $set: { RequestedStatus: requestedStatus, UpdatedDate: now } }
    );

    if (notes && notes.trim()) {
      const CommentId = await getNextSequence('CommentId');
      await getCollection('comments').insertOne({
        CommentId,
        TicketId: ticket.TicketId,
        UserId: Number(staffUserId),
        Notes: `[Status Change Request: "${requestedStatus}"] - ${notes.trim()}`,
        IsResolutionNote: requestedStatus === 'Resolved' ? 1 : 0,
        CreatedDate: now,
      });
    }

    const staffName = ticket.AssigneeName || 'Department Staff';
    const message = `${staffName} (${ticket.Department} Staff) requested status change to "${requestedStatus}" on Ticket #${ticket.TicketId}: "${ticket.Title}"`;

    const NotificationId = await getNextSequence('NotificationId');
    await getCollection('notifications').insertOne({
      NotificationId,
      UserId: null,
      TicketId: ticket.TicketId,
      Message: message,
      Read: 0,
      CreatedDate: now,
    });

    return await this.findById(ticket.TicketId);
  }

  static async approveStatus(ticketId) {
    const ticket = await this.findById(ticketId);
    if (!ticket || !ticket.RequestedStatus) return null;

    const newStatus = ticket.RequestedStatus;
    const now = new Date();
    const resolvedDate =
      newStatus === 'Resolved' || newStatus === 'Closed' ? now : null;

    await getCollection('tickets').updateOne(
      { TicketId: ticket.TicketId },
      {
        $set: {
          Status: newStatus,
          RequestedStatus: null,
          ResolvedDate: resolvedDate,
          UpdatedDate: now,
        },
      }
    );

    const CommentId = await getNextSequence('CommentId');
    await getCollection('comments').insertOne({
      CommentId,
      TicketId: ticket.TicketId,
      UserId: 11,
      Notes: `Support Staff APPROVED stage transition to "${newStatus}".`,
      IsResolutionNote: newStatus === 'Resolved' ? 1 : 0,
      CreatedDate: now,
    });

    return await this.findById(ticket.TicketId);
  }

  static async rejectStatus(ticketId, reason) {
    const ticket = await this.findById(ticketId);
    if (!ticket) return null;

    const requested = ticket.RequestedStatus;
    const now = new Date();

    await getCollection('tickets').updateOne(
      { TicketId: ticket.TicketId },
      { $set: { RequestedStatus: null, UpdatedDate: now } }
    );

    const CommentId = await getNextSequence('CommentId');
    await getCollection('comments').insertOne({
      CommentId,
      TicketId: ticket.TicketId,
      UserId: 11,
      Notes: `Support Staff REJECTED requested status change to "${requested}". Reason: ${reason || 'Requires further verification.'}`,
      IsResolutionNote: 0,
      CreatedDate: now,
    });

    return await this.findById(ticket.TicketId);
  }

  static async getStaffAvailability(department) {
    const userQuery = { Role: 'DepartmentStaff' };
    if (department && department !== 'All') {
      userQuery.Department = department;
    }

    const [staffUsers, activeCounts] = await Promise.all([
      getCollection('users')
        .find(userQuery, { projection: { _id: 0, Password: 0 } })
        .toArray(),
      getCollection('tickets')
        .aggregate([
          {
            $match: {
              AssigneeId: { $ne: null },
              Status: { $in: ['Assigned', 'In Progress', 'Pending'] },
            },
          },
          {
            $group: {
              _id: '$AssigneeId',
              count: { $sum: 1 },
            },
          },
        ])
        .toArray(),
    ]);

    const countMap = new Map(activeCounts.map((row) => [row._id, row.count]));

    return staffUsers
      .map((u) => {
        const activeTicketsCount = countMap.get(u.UserId) || 0;
        return {
          ...u,
          activeTicketsCount,
          isAvailable: activeTicketsCount === 0,
          workloadStatus:
            activeTicketsCount === 0
              ? 'Available (0 Active)'
              : `${activeTicketsCount} Active Tickets`,
        };
      })
      .sort((a, b) => {
        if (a.activeTicketsCount !== b.activeTicketsCount) {
          return a.activeTicketsCount - b.activeTicketsCount;
        }
        return a.Name.localeCompare(b.Name);
      });
  }

  static async close(ticketId) {
    const id = Number(ticketId);
    if (Number.isNaN(id)) return null;

    const now = new Date();
    return await getCollection('tickets').updateOne(
      { TicketId: id },
      {
        $set: {
          Status: 'Closed',
          RequestedStatus: null,
          ResolvedDate: now,
          UpdatedDate: now,
        },
      }
    );
  }
}

module.exports = Ticket;
