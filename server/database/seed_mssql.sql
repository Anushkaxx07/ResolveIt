-- ====================================================================
-- Seed Data for Smart Employee Service Desk Portal
-- Database Engine: Microsoft SQL Server (T-SQL)
-- ====================================================================

-- 1. Insert Users (Employees & Support Agents)
SET IDENTITY_INSERT dbo.Users ON;

INSERT INTO dbo.Users (UserId, Name, Email, Department, Role) VALUES
-- Employees
(1, 'Anushka Upadhyay', 'anushka@company.com', 'Engineering', 'Employee'),
(2, 'Sarah Williams', 'sarah.williams@company.com', 'Marketing', 'Employee'),
(3, 'Michael Brown', 'michael.brown@company.com', 'Sales', 'Employee'),
(4, 'Emily Davis', 'emily.davis@company.com', 'Product', 'Employee'),
-- Support Agents / Department Staff
(5, 'David Miller (IT Support)', 'david.miller@company.com', 'IT', 'SupportAgent'),
(6, 'Jessica Taylor (HR Staff)', 'jessica.taylor@company.com', 'HR', 'SupportAgent'),
(7, 'Robert Wilson (Facilities)', 'robert.wilson@company.com', 'Facilities', 'SupportAgent'),
(8, 'Elena Martinez (Finance)', 'elena.martinez@company.com', 'Finance', 'SupportAgent'),
(9, 'Marcus Vance (Access Admin)', 'marcus.vance@company.com', 'Access Management', 'SupportAgent'),
(10, 'Admin Supervisor', 'admin.desk@company.com', 'Executive', 'Admin');

SET IDENTITY_INSERT dbo.Users OFF;

-- 2. Insert Categories
SET IDENTITY_INSERT dbo.Categories ON;

INSERT INTO dbo.Categories (CategoryId, Name, Department, Description, SLAHours) VALUES
(1, 'Hardware & Laptops', 'IT', 'Laptops, monitors, peripherals, and workstation hardware issues', 8),
(2, 'Network & VPN', 'IT', 'VPN access, WiFi connectivity, office network stability', 4),
(3, 'Software & Tools', 'IT', 'Software licenses, installations, crash troubleshooting', 12),
(4, 'Leave & Benefits Policy', 'HR', 'Queries regarding paid leaves, medical insurance, maternity/paternity', 24),
(5, 'Payroll & Taxes', 'HR', 'Salary slips, tax declarations, bonus queries', 24),
(6, 'Workplace & Climate Control', 'Facilities', 'HVAC, seating allocation, lighting, sanitization', 8),
(7, 'Building Access & Badges', 'Facilities', 'Physical access cards, parking passes, visitor access', 12),
(8, 'Expense Reimbursement', 'Finance', 'Travel claims, client meal receipts, approval bottlenecks', 48),
(9, 'Vendor Invoicing', 'Finance', 'Purchase order reconciliation and vendor payment status', 48),
(10, 'Application Access & SSO', 'Access Management', 'Privilege elevation, database permissions, AWS/Azure access', 6),
(11, 'Role & Permission Change', 'Access Management', 'Departmental role migration and group permissions', 12);

SET IDENTITY_INSERT dbo.Categories OFF;

-- 3. Insert Tickets (Covering all sample scenarios)
SET IDENTITY_INSERT dbo.Tickets ON;

INSERT INTO dbo.Tickets (TicketId, Title, Description, CategoryId, Priority, Status, RequesterId, AssigneeId, CreatedDate, UpdatedDate, ResolvedDate) VALUES
-- Sample 1: IT VPN
(1001, 'Unable to access VPN while working remotely', 'Whenever I connect to the corporate GlobalProtect VPN from home, I receive a certificate validation timeout error. Cannot access internal repos or staging clusters.', 2, 'High', 'In Progress', 1, 5, DATEADD(hour, -18, GETDATE()), DATEADD(hour, -2, GETDATE()), NULL),

-- Sample 2: IT Laptop failure
(1002, 'Laptop not booting before a customer presentation', 'Dell Latitude 7420 stuck in a continuous boot loop after the mandatory Windows security update last night. I have an executive pitch at 3 PM today.', 1, 'High', 'In Progress', 3, 5, DATEADD(hour, -5, GETDATE()), DATEADD(hour, -1, GETDATE()), NULL),

-- Sample 3: HR Leave Policy
(1003, 'Employee requesting leave policy clarification', 'Need clarification regarding the carry-forward policy for privilege leaves into the next fiscal quarter and how compensatory-offs are calculated.', 4, 'Low', 'Open', 2, NULL, DATEADD(hour, -28, GETDATE()), DATEADD(hour, -28, GETDATE()), NULL),

-- Sample 4: Access Management
(1004, 'Access request for a new application (AWS Production ReadOnly)', 'Requesting read-only IAM access to AWS ECS cluster and CloudWatch metrics logs for the upcoming Q3 microservice performance audit.', 10, 'Medium', 'Open', 4, 9, DATEADD(hour, -12, GETDATE()), DATEADD(hour, -4, GETDATE()), NULL),

-- Sample 5: Facilities AC Issue
(1005, 'Air conditioning issue in office workspace', 'The HVAC unit above Pod 4B on the 3rd floor is blowing lukewarm air. Temperature is over 28C and causing discomfort for the team.', 6, 'Medium', 'Resolved', 1, 7, DATEADD(day, -2, GETDATE()), DATEADD(hour, -6, GETDATE()), DATEADD(hour, -6, GETDATE())),

-- Sample 6: Finance Reimbursement
(1006, 'Reimbursement approval pending for more than 30 days', 'Expense claim #EXP-9921 for the Chicago Tech Expo travel has been sitting in Pending Approval status for 34 days despite line-manager sign-off.', 8, 'Medium', 'Open', 3, 8, DATEADD(day, -4, GETDATE()), DATEADD(day, -1, GETDATE()), NULL),

-- Sample 7: Closed Hardware request
(1007, 'External 4K Monitor flickering intermittently', 'USB-C dock connection causes external monitor to flicker black every 5 minutes. Tried swapping HDMI cable.', 1, 'Low', 'Closed', 2, 5, DATEADD(day, -5, GETDATE()), DATEADD(day, -3, GETDATE()), DATEADD(day, -3, GETDATE())),

-- Sample 8: Critical Access request
(1008, 'Emergency Database Lockout for Lead DB Architect', 'Production database credentials revoked automatically after password rotation cron failure. Immediate unlock needed.', 10, 'High', 'Resolved', 4, 9, DATEADD(day, -1, GETDATE()), DATEADD(hour, -1, GETDATE()), DATEADD(hour, -1, GETDATE()));

SET IDENTITY_INSERT dbo.Tickets OFF;

-- 4. Insert Comments & Resolution Notes
SET IDENTITY_INSERT dbo.Comments ON;

INSERT INTO dbo.Comments (CommentId, TicketId, UserId, Notes, CreatedDate, IsResolutionNote) VALUES
(1, 1001, 5, 'Requested Alex to renew his client root certificate via self-service portal and cleared DNS cache.', DATEADD(hour, -10, GETDATE()), 0),
(2, 1001, 1, 'Downloaded the new certificate package. Still getting timeout on Gateway 2, testing Gateway 1 now.', DATEADD(hour, -3, GETDATE()), 0),
(3, 1002, 5, 'Arranged an urgent loaner MacBook at the Level 2 IT desk. Diagnosing Dell SSD boot sector.', DATEADD(hour, -2, GETDATE()), 0),
(4, 1005, 7, 'Facility HVAC technician inspected the thermostat. Cleaned compressor filter and rebalanced airflow. Room temp now stable at 22C.', DATEADD(hour, -6, GETDATE()), 1),
(5, 1007, 5, 'Replaced the faulty Thunderbolt docking station with a new Dell WD19S unit. Issue verified resolved.', DATEADD(day, -3, GETDATE()), 1),
(6, 1008, 9, 'Temporarily issued break-glass token and resynced the Vault credential lease rotation schedule.', DATEADD(hour, -1, GETDATE()), 1);

SET IDENTITY_INSERT dbo.Comments OFF;
