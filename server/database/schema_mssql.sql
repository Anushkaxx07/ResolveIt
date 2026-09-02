-- ====================================================================
-- Database Schema for Smart Employee Service Desk & Ticket Management Portal
-- Database Engine: Microsoft SQL Server (T-SQL)
-- ====================================================================

-- Create Database (if running as a fresh setup)
-- CREATE DATABASE ServiceDeskDB;
-- GO
-- USE ServiceDeskDB;
-- GO

-- 1. Drop existing tables in reverse dependency order if needed
IF OBJECT_ID('dbo.Comments', 'U') IS NOT NULL DROP TABLE dbo.Comments;
IF OBJECT_ID('dbo.Tickets', 'U') IS NOT NULL DROP TABLE dbo.Tickets;
IF OBJECT_ID('dbo.Categories', 'U') IS NOT NULL DROP TABLE dbo.Categories;
IF OBJECT_ID('dbo.Users', 'U') IS NOT NULL DROP TABLE dbo.Users;

-- 2. Create Users Table
CREATE TABLE dbo.Users (
    UserId INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL,
    Email NVARCHAR(120) NOT NULL UNIQUE,
    Department NVARCHAR(50) NOT NULL,
    Role NVARCHAR(20) NOT NULL DEFAULT 'Employee', -- 'Employee', 'SupportAgent', 'Admin'
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE()
);

-- 3. Create Categories / Departments Table
CREATE TABLE dbo.Categories (
    CategoryId INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL,
    Department NVARCHAR(50) NOT NULL, -- 'IT', 'HR', 'Facilities', 'Finance', 'Access Management'
    Description NVARCHAR(255) NULL,
    SLAHours INT NOT NULL DEFAULT 24
);

-- 4. Create Tickets Table
CREATE TABLE dbo.Tickets (
    TicketId INT IDENTITY(1001,1) PRIMARY KEY,
    Title NVARCHAR(200) NOT NULL,
    Description NVARCHAR(MAX) NOT NULL,
    CategoryId INT NOT NULL,
    Priority NVARCHAR(20) NOT NULL, -- 'Low', 'Medium', 'High', 'Critical'
    Status NVARCHAR(20) NOT NULL DEFAULT 'Open', -- 'Open', 'In Progress', 'Resolved', 'Closed'
    RequesterId INT NOT NULL,
    AssigneeId INT NULL,
    CreatedDate DATETIME NOT NULL DEFAULT GETDATE(),
    UpdatedDate DATETIME NOT NULL DEFAULT GETDATE(),
    ResolvedDate DATETIME NULL,
    CONSTRAINT FK_Tickets_Category FOREIGN KEY (CategoryId) REFERENCES dbo.Categories(CategoryId),
    CONSTRAINT FK_Tickets_Requester FOREIGN KEY (RequesterId) REFERENCES dbo.Users(UserId),
    CONSTRAINT FK_Tickets_Assignee FOREIGN KEY (AssigneeId) REFERENCES dbo.Users(UserId)
);

-- 5. Create Comments & Resolution Notes Table
CREATE TABLE dbo.Comments (
    CommentId INT IDENTITY(1,1) PRIMARY KEY,
    TicketId INT NOT NULL,
    UserId INT NOT NULL,
    Notes NVARCHAR(MAX) NOT NULL,
    CreatedDate DATETIME NOT NULL DEFAULT GETDATE(),
    IsResolutionNote BIT NOT NULL DEFAULT 0,
    CONSTRAINT FK_Comments_Ticket FOREIGN KEY (TicketId) REFERENCES dbo.Tickets(TicketId) ON DELETE CASCADE,
    CONSTRAINT FK_Comments_User FOREIGN KEY (UserId) REFERENCES dbo.Users(UserId)
);

-- 6. Helpful Indexes for High Performance Queries
CREATE NONCLUSTERED INDEX IX_Tickets_Status ON dbo.Tickets(Status);
CREATE NONCLUSTERED INDEX IX_Tickets_Priority ON dbo.Tickets(Priority);
CREATE NONCLUSTERED INDEX IX_Tickets_CategoryId ON dbo.Tickets(CategoryId);
CREATE NONCLUSTERED INDEX IX_Tickets_RequesterId ON dbo.Tickets(RequesterId);
CREATE NONCLUSTERED INDEX IX_Tickets_AssigneeId ON dbo.Tickets(AssigneeId);
CREATE NONCLUSTERED INDEX IX_Comments_TicketId ON dbo.Comments(TicketId);
