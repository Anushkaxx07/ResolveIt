const path = require('path');
const fs = require('fs');

let dbDriver = null;
let db = null;
const dbPath = path.resolve(__dirname, 'servicedesk.db');

try {
  const { DatabaseSync } = require('node:sqlite');
  db = new DatabaseSync(dbPath);
  dbDriver = 'node:sqlite';
} catch (e1) {
  try {
    const sqlite3 = require('sqlite3').verbose();
    db = new sqlite3.Database(dbPath);
    dbDriver = 'sqlite3';
  } catch (e2) {
    dbDriver = 'fallback';
  }
}

const all = async (sql, params = []) => {
  if (dbDriver === 'node:sqlite') {
    const stmt = db.prepare(sql);
    return stmt.all(...params);
  } else if (dbDriver === 'sqlite3') {
    return new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }
};

const get = async (sql, params = []) => {
  if (dbDriver === 'node:sqlite') {
    const stmt = db.prepare(sql);
    return stmt.get(...params) || null;
  } else if (dbDriver === 'sqlite3') {
    return new Promise((resolve, reject) => {
      db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row || null);
      });
    });
  }
};

const run = async (sql, params = []) => {
  if (dbDriver === 'node:sqlite') {
    const stmt = db.prepare(sql);
    const result = stmt.run(...params);
    return { lastID: Number(result.lastInsertRowid), changes: Number(result.changes) };
  } else if (dbDriver === 'sqlite3') {
    return new Promise((resolve, reject) => {
      db.run(sql, params, function (err) {
        if (err) reject(err);
        else resolve({ lastID: this.lastID, changes: this.changes });
      });
    });
  }
};

const initDB = async () => {
  await run(`
    CREATE TABLE IF NOT EXISTS Users (
      UserId INTEGER PRIMARY KEY AUTOINCREMENT,
      Name TEXT NOT NULL,
      Email TEXT NOT NULL UNIQUE,
      Password TEXT NOT NULL DEFAULT 'password123',
      Department TEXT NOT NULL,
      Role TEXT NOT NULL DEFAULT 'Employee'
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS Categories (
      CategoryId INTEGER PRIMARY KEY AUTOINCREMENT,
      Name TEXT NOT NULL,
      Department TEXT NOT NULL,
      Description TEXT
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS Tickets (
      TicketId INTEGER PRIMARY KEY AUTOINCREMENT,
      Title TEXT NOT NULL,
      Description TEXT NOT NULL,
      CategoryId INTEGER NOT NULL,
      Priority TEXT NOT NULL,
      Status TEXT NOT NULL DEFAULT 'Open',
      RequestedStatus TEXT DEFAULT NULL,
      RequesterId INTEGER NOT NULL,
      AssigneeId INTEGER,
      CreatedDate DATETIME DEFAULT CURRENT_TIMESTAMP,
      UpdatedDate DATETIME DEFAULT CURRENT_TIMESTAMP,
      ResolvedDate DATETIME,
      FOREIGN KEY (CategoryId) REFERENCES Categories(CategoryId),
      FOREIGN KEY (RequesterId) REFERENCES Users(UserId),
      FOREIGN KEY (AssigneeId) REFERENCES Users(UserId)
    )
  `);

  try {
    await run(`ALTER TABLE Tickets ADD COLUMN RequestedStatus TEXT DEFAULT NULL`);
  } catch (e) {}

  await run(`
    CREATE TABLE IF NOT EXISTS Comments (
      CommentId INTEGER PRIMARY KEY AUTOINCREMENT,
      TicketId INTEGER NOT NULL,
      UserId INTEGER NOT NULL,
      Notes TEXT NOT NULL,
      CreatedDate DATETIME DEFAULT CURRENT_TIMESTAMP,
      IsResolutionNote INTEGER DEFAULT 0,
      FOREIGN KEY (TicketId) REFERENCES Tickets(TicketId),
      FOREIGN KEY (UserId) REFERENCES Users(UserId)
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS Notifications (
      NotificationId INTEGER PRIMARY KEY AUTOINCREMENT,
      UserId INTEGER,
      TicketId INTEGER NOT NULL,
      Message TEXT NOT NULL,
      Read INTEGER DEFAULT 0,
      CreatedDate DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (TicketId) REFERENCES Tickets(TicketId)
    )
  `);

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
    [11, 'Support Admin Lead', 'admin@gmail.com', 'admin123', 'Executive / IT', 'SupportStaff']
  ];

  for (const u of users) {
    const exists = await get(`SELECT * FROM Users WHERE Email = ?`, [u[2]]);
    if (!exists) {
      await run(`INSERT INTO Users (UserId, Name, Email, Password, Department, Role) VALUES (?, ?, ?, ?, ?, ?)`, u);
    } else {
      await run(`UPDATE Users SET Name = ?, Password = ?, Department = ?, Role = ? WHERE Email = ?`, [u[1], u[3], u[4], u[5], u[2]]);
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
    [11, 'Role Permissions', 'Access Management', 'Role migration and system security groups']
  ];

  for (const c of categories) {
    const catExists = await get(`SELECT * FROM Categories WHERE CategoryId = ?`, [c[0]]);
    if (!catExists) {
      await run(`INSERT INTO Categories (CategoryId, Name, Department, Description) VALUES (?, ?, ?, ?)`, c);
    }
  }

  const sampleTickets = [
    [1001, 'Unable to access VPN while working remotely', 'Cannot connect to the corporate VPN from home. Certificate validation times out.', 2, 'High', 'Assigned', 'Resolved', 1, 5],
    [1002, 'Laptop not booting before a customer presentation', 'Dell Latitude laptop is stuck in a boot loop after a Windows update. Critical pitch at 3 PM.', 1, 'High', 'In Progress', null, 3, 5],
    [1003, 'Employee requesting leave policy clarification', 'Clarification needed regarding carry-forward privilege leaves into the next quarter.', 4, 'Low', 'Open', null, 2, null],
    [1004, 'Access request for a new application', 'Requesting read-only IAM access to AWS production monitoring dashboard for microservice metrics.', 10, 'Medium', 'Assigned', 'In Progress', 4, 9],
    [1005, 'Air conditioning issue in office workspace', 'The HVAC unit above Pod 4B is blowing hot air. Room temperature is exceeding 28C.', 6, 'Medium', 'Resolved', null, 1, 7],
    [1006, 'Reimbursement approval pending for more than 30 days', 'Expense claim #EXP-9921 for Chicago conference has been pending approval for over a month.', 8, 'Medium', 'Open', null, 3, null]
  ];

  for (const t of sampleTickets) {
    const ticketExists = await get(`SELECT * FROM Tickets WHERE TicketId = ?`, [t[0]]);
    if (!ticketExists) {
      await run(`
        INSERT INTO Tickets (TicketId, Title, Description, CategoryId, Priority, Status, RequestedStatus, RequesterId, AssigneeId, CreatedDate, UpdatedDate)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
      `, t);
    } else {
      await run(`UPDATE Tickets SET RequestedStatus = ? WHERE TicketId = ?`, [t[6], t[0]]);
    }
  }

  const notificationCount = await get(`SELECT COUNT(*) as count FROM Notifications`);
  if (!notificationCount || notificationCount.count === 0) {
    await run(`
      INSERT INTO Notifications (UserId, TicketId, Message, Read, CreatedDate)
      VALUES (11, 1001, 'David Miller (IT Staff) requested status change to "Resolved" on Ticket #1001', 0, datetime('now', '-10 minutes'))
    `);
    await run(`
      INSERT INTO Notifications (UserId, TicketId, Message, Read, CreatedDate)
      VALUES (11, 1004, 'Marcus Vance (Access Staff) requested status change to "In Progress" on Ticket #1004', 0, datetime('now', '-5 minutes'))
    `);
  }
};

module.exports = {
  db,
  all,
  get,
  run,
  initDB
};
