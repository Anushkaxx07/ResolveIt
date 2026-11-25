const { getCollection, getNextSequence } = require('../database/db');

class Comment {
  static async findByTicketId(ticketId) {
    const id = Number(ticketId);
    if (Number.isNaN(id)) return [];

    return await getCollection('comments')
      .aggregate([
        { $match: { TicketId: id } },
        {
          $lookup: {
            from: 'users',
            localField: 'UserId',
            foreignField: 'UserId',
            as: 'user',
          },
        },
        { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
        {
          $project: {
            _id: 0,
            CommentId: 1,
            TicketId: 1,
            UserId: 1,
            UserName: '$user.Name',
            UserRole: '$user.Role',
            Notes: 1,
            CreatedDate: 1,
            IsResolutionNote: 1,
          },
        },
        { $sort: { CreatedDate: 1 } },
      ])
      .toArray();
  }

  static async create({ TicketId, UserId, Notes, IsResolutionNote = false }) {
    const CommentId = await getNextSequence('CommentId');
    const doc = {
      CommentId,
      TicketId: Number(TicketId),
      UserId: Number(UserId),
      Notes: Notes.trim(),
      CreatedDate: new Date(),
      IsResolutionNote: IsResolutionNote ? 1 : 0,
    };

    await getCollection('comments').insertOne(doc);
    const { _id, ...cleanDoc } = doc;
    return cleanDoc;
  }
}

module.exports = Comment;
