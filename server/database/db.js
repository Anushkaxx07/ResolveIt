const path = require('path');
const dotenv = require('dotenv');
const { MongoClient } = require('mongodb');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

let client = null;
let db = null;

function getMongoUri() {
  const uri = (process.env.MONGODB_URI || process.env.MONGO_URI || '').trim();
  if (!uri) {
    throw new Error(
      'Missing MONGODB_URI (or MONGO_URI) in server/.env. Please add your MongoDB connection string.'
    );
  }
  return uri;
}

function getDatabaseName(uri) {
  if (process.env.MONGODB_DB_NAME) {
    return process.env.MONGODB_DB_NAME.trim();
  }
  try {
    const parsed = new URL(uri);
    const dbFromPath = parsed.pathname.replace(/^\/+/, '');
    if (dbFromPath) return dbFromPath;
  } catch (e) {}
  return 'servicedesk';
}

async function connectDB() {
  if (db) return db;

  const uri = getMongoUri();
  const dbName = getDatabaseName(uri);

  client = new MongoClient(uri);
  await client.connect();
  db = client.db(dbName);
  return db;
}

function getDB() {
  if (!db) {
    throw new Error('Database not initialized. Call initDB() or connectDB() first.');
  }
  return db;
}

function getCollection(name) {
  return getDB().collection(name);
}

async function getNextSequence(sequenceName) {
  const result = await getCollection('counters').findOneAndUpdate(
    { _id: sequenceName },
    { $inc: { seq: 1 } },
    { upsert: true, returnDocument: 'after' }
  );
  return result.seq;
}

async function syncCounter(sequenceName, collectionName, idField) {
  const latest = await getCollection(collectionName)
    .find({}, { projection: { _id: 0, [idField]: 1 } })
    .sort({ [idField]: -1 })
    .limit(1)
    .toArray();

  const maxId = latest.length > 0 ? latest[0][idField] : 0;
  await getCollection('counters').updateOne(
    { _id: sequenceName },
    { $max: { seq: maxId } },
    { upsert: true }
  );
}

async function ensureIndexes() {
  await Promise.all([
    getCollection('users').createIndex({ UserId: 1 }, { unique: true }),
    getCollection('users').createIndex({ Email: 1 }, { unique: true }),
    getCollection('categories').createIndex({ CategoryId: 1 }, { unique: true }),
    getCollection('tickets').createIndex({ TicketId: 1 }, { unique: true }),
    getCollection('tickets').createIndex({ CategoryId: 1 }),
    getCollection('tickets').createIndex({ RequesterId: 1 }),
    getCollection('tickets').createIndex({ AssigneeId: 1 }),
    getCollection('comments').createIndex({ CommentId: 1 }, { unique: true }),
    getCollection('comments').createIndex({ TicketId: 1 }),
    getCollection('notifications').createIndex({ NotificationId: 1 }, { unique: true }),
    getCollection('notifications').createIndex({ TicketId: 1 }),
  ]);
}

async function initDB() {
  await connectDB();
  await ensureIndexes();

  const users = [
    [1, 'Anushka', 'anushka@company.com', 'password123', 'Engineering', 'Employee'],
    [2, 'Sarah Williams', 'sarah.williams@company.com', 'password123', 'Marketing', 'Employee'],
    [3, 'Michael Brown', 'michael.brown@company.com', 'password123', 'Sales', 'Employee'],
    [4, 'Emily Davis', 'emily.davis@company.com', 'password123', 'Product', 'Employee'],
    [5, 'David Miller', 'david.miller@company.com', 'password123', 'IT', 'DepartmentStaff'],
    [6, 'Jessica Taylor', 'jessica.taylor@company.com', 'password123', 'HR', 'DepartmentStaff'],
    [7, 'Robert Wilson', 'robert.wilson@company.com', 'password123', 'Facilities', 'DepartmentStaff'],
    [8, 'Elena Martinez', 'elena.martinez@company.com', 'password123', 'Finance', 'DepartmentStaff'],
    [9, 'Marcus Vance', 'marcus.vance@company.com', 'password123', 'Access Management', 'DepartmentStaff'],
    [12, 'Alex Turner', 'alex.turner@company.com', 'password123', 'IT', 'DepartmentStaff'],
    [10, 'Admin Supervisor', 'admin@company.com', 'admin123', 'Executive', 'SupportStaff'],
    [11, 'Support Admin Lead', 'admin@gmail.com', 'admin123', 'Executive / IT', 'SupportStaff'],
  ];

  const usersCol = getCollection('users');
  for (const [UserId, Name, Email, Password, Department, Role] of users) {
    const existing = await usersCol.findOne({ Email });
    if (!existing) {
      await usersCol.insertOne({ UserId, Name, Email, Password, Department, Role });
    } else {
      await usersCol.updateOne(
        { Email },
        { $set: { Name, Password, Department, Role } }
      );
    }
  }

  const categories = [
    [1, 'Hardware & Laptops', 'IT', 'Laptops, monitors, workstation peripherals'],
    [2, 'Network & VPN', 'IT', 'VPN access, WiFi, and office network connectivity'],
    [3, 'Software & Licenses', 'IT', 'Software tool installations and license provisioning'],
    [4, 'Leave Policy & Benefits', 'HR', 'Leave balance, holiday policies, and health insurance'],
    [5, 'Payroll & Taxes', 'HR', 'Salary queries and tax deductions'],
    [6, 'Workplace & Climate Control', 'Facilities', 'HVAC, seating, air conditioning, workspace lighting'],
    [7, 'Building Access & ID Cards', 'Facilities', 'Physical security badges and parking permits'],
    [8, 'Expense Reimbursement', 'Finance', 'Travel and expense report approvals'],
    [9, 'Vendor Invoicing', 'Finance', 'Vendor payments and purchase orders'],
    [10, 'Application Access & SSO', 'Access Management', 'Privilege elevation and database permissions'],
    [11, 'Role Permissions', 'Access Management', 'Role migration and system security groups'],
  ];

  const categoriesCol = getCollection('categories');
  for (const [CategoryId, Name, Department, Description] of categories) {
    const exists = await categoriesCol.findOne({ CategoryId });
    if (!exists) {
      await categoriesCol.insertOne({ CategoryId, Name, Department, Description });
    }
  }

  const sampleTickets = [
    [1001, 'Unable to access VPN while working remotely', 'Cannot connect to the corporate VPN from home. Certificate validation times out.', 2, 'High', 'Assigned', 'Resolved', 1, 5],
    [1002, 'Laptop not booting before a customer presentation', 'Dell Latitude laptop is stuck in a boot loop after a Windows update. Critical pitch at 3 PM.', 1, 'High', 'In Progress', null, 3, 5],
    [1003, 'Employee requesting leave policy clarification', 'Clarification needed regarding carry-forward privilege leaves into the next quarter.', 4, 'Low', 'Open', null, 2, null],
    [1004, 'Access request for a new application', 'Requesting read-only IAM access to AWS production monitoring dashboard for microservice metrics.', 10, 'Medium', 'Assigned', 'In Progress', 4, 9],
    [1005, 'Air conditioning issue in office workspace', 'The HVAC unit above Pod 4B is blowing hot air. Room temperature is exceeding 28C.', 6, 'Medium', 'Resolved', null, 1, 7],
    [1006, 'Reimbursement approval pending for more than 30 days', 'Expense claim #EXP-9921 for Chicago conference has been pending approval for over a month.', 8, 'Medium', 'Open', null, 3, null],
  ];

  const ticketsCol = getCollection('tickets');
  for (const [TicketId, Title, Description, CategoryId, Priority, Status, RequestedStatus, RequesterId, AssigneeId] of sampleTickets) {
    const exists = await ticketsCol.findOne({ TicketId });
    if (!exists) {
      const now = new Date();
      await ticketsCol.insertOne({
        TicketId,
        Title,
        Description,
        CategoryId,
        Priority,
        Status,
        RequestedStatus,
        RequesterId,
        AssigneeId,
        CreatedDate: now,
        UpdatedDate: now,
        ResolvedDate: null,
      });
    }
  }

  const notificationsCol = getCollection('notifications');
  const notificationCount = await notificationsCol.countDocuments();
  if (notificationCount === 0) {
    const now = Date.now();
    await notificationsCol.insertMany([
      {
        NotificationId: 1,
        UserId: 11,
        TicketId: 1001,
        Message: 'David Miller (IT Staff) requested status change to "Resolved" on Ticket #1001',
        Read: 0,
        CreatedDate: new Date(now - 10 * 60 * 1000),
      },
      {
        NotificationId: 2,
        UserId: 11,
        TicketId: 1004,
        Message: 'Marcus Vance (Access Staff) requested status change to "In Progress" on Ticket #1004',
        Read: 0,
        CreatedDate: new Date(now - 5 * 60 * 1000),
      },
    ]);
  }

  await Promise.all([
    syncCounter('UserId', 'users', 'UserId'),
    syncCounter('CategoryId', 'categories', 'CategoryId'),
    syncCounter('TicketId', 'tickets', 'TicketId'),
    syncCounter('CommentId', 'comments', 'CommentId'),
    syncCounter('NotificationId', 'notifications', 'NotificationId'),
  ]);
}

async function closeDB() {
  if (client) {
    await client.close();
    client = null;
    db = null;
  }
}

module.exports = {
  connectDB,
  getDB,
  getCollection,
  getNextSequence,
  initDB,
  closeDB,
};
