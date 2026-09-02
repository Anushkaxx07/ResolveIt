const { initDB, all, run, get } = require('./db');

async function viewDatabase() {
  console.log('\n--- USERS ---');
  const users = await all(`SELECT UserId, Name, Email, Department, Role FROM Users`);
  console.table(users);

  console.log('\n--- CATEGORIES ---');
  const categories = await all(`SELECT CategoryId, Name, Department FROM Categories`);
  console.table(categories);

  console.log('\n--- TICKETS ---');
  const tickets = await all(`
    SELECT 
      t.TicketId,
      t.Title,
      c.Department,
      t.Priority,
      t.Status,
      t.RequestedStatus,
      u.Name AS Requester,
      u2.Name AS Assignee
    FROM Tickets t
    JOIN Categories c ON t.CategoryId = c.CategoryId
    JOIN Users u ON t.RequesterId = u.UserId
    LEFT JOIN Users u2 ON t.AssigneeId = u2.UserId
  `);
  console.table(tickets);

  console.log('\n--- COMMENTS ---');
  const comments = await all(`
    SELECT 
      cm.CommentId,
      cm.TicketId,
      u.Name AS Author,
      cm.Notes,
      CASE WHEN cm.IsResolutionNote = 1 THEN 'Yes' ELSE 'No' END AS IsResolution
    FROM Comments cm
    JOIN Users u ON cm.UserId = u.UserId
  `);
  console.table(comments);
}

async function resetDatabase() {
  await run(`DROP TABLE IF EXISTS Notifications`);
  await run(`DROP TABLE IF EXISTS Comments`);
  await run(`DROP TABLE IF EXISTS Tickets`);
  await run(`DROP TABLE IF EXISTS Categories`);
  await run(`DROP TABLE IF EXISTS Users`);
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
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
})();
