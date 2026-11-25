const { initDB, getCollection, closeDB } = require('./db');

async function viewDatabase() {
  console.log('\n--- USERS ---');
  const users = await getCollection('users')
    .find({}, { projection: { _id: 0, UserId: 1, Name: 1, Email: 1, Department: 1, Role: 1 } })
    .sort({ UserId: 1 })
    .toArray();
  console.table(users);

  console.log('\n--- CATEGORIES ---');
  const categories = await getCollection('categories')
    .find({}, { projection: { _id: 0, CategoryId: 1, Name: 1, Department: 1 } })
    .sort({ CategoryId: 1 })
    .toArray();
  console.table(categories);

  console.log('\n--- TICKETS ---');
  const tickets = await getCollection('tickets')
    .aggregate([
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
      {
        $project: {
          _id: 0,
          TicketId: 1,
          Title: 1,
          Department: '$category.Department',
          Priority: 1,
          Status: 1,
          RequestedStatus: 1,
          Requester: '$requester.Name',
          Assignee: { $ifNull: ['$assignee.Name', null] },
        },
      },
      { $sort: { TicketId: 1 } },
    ])
    .toArray();
  console.table(tickets);

  console.log('\n--- COMMENTS ---');
  const comments = await getCollection('comments')
    .aggregate([
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
          Author: '$user.Name',
          Notes: 1,
          IsResolution: {
            $cond: [{ $eq: ['$IsResolutionNote', 1] }, 'Yes', 'No'],
          },
        },
      },
      { $sort: { CommentId: 1 } },
    ])
    .toArray();
  console.table(comments);
}

async function resetDatabase() {
  await Promise.all([
    getCollection('notifications').deleteMany({}),
    getCollection('comments').deleteMany({}),
    getCollection('tickets').deleteMany({}),
    getCollection('categories').deleteMany({}),
    getCollection('users').deleteMany({}),
    getCollection('counters').deleteMany({}),
  ]);
  await initDB();
  console.log('Database reset successfully.');
  await viewDatabase();
}

const action = process.argv[2] || 'view';

(async () => {
  try {
    await initDB();
    if (action === 'reset') {
      await resetDatabase();
    } else {
      await viewDatabase();
    }
    await closeDB();
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    await closeDB();
    process.exit(1);
  }
})();
