-- ====================================================
-- SQL Server 2017 Database Schema
-- Project: Student Equivalent Certificate Registry
-- Compatible with: Windows Server 2022 / SQL Server 2017
-- ====================================================

-- 1. Create Database if not exists
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'StudentRegistryDb')
BEGIN
    CREATE DATABASE [StudentRegistryDb];
END
GO

USE [StudentRegistryDb];
GO

-- 2. Drop existing tables if they exist (in reverse order of foreign keys)
IF OBJECT_ID('dbo.StandardStudentGrades', 'U') IS NOT NULL DROP TABLE dbo.StandardStudentGrades;
IF OBJECT_ID('dbo.IGStudentGradeCounts', 'U') IS NOT NULL DROP TABLE dbo.IGStudentGradeCounts;
IF OBJECT_ID('dbo.IGStudentGrades', 'U') IS NOT NULL DROP TABLE dbo.IGStudentGrades;
IF OBJECT_ID('dbo.SaudiStudentGrades', 'U') IS NOT NULL DROP TABLE dbo.SaudiStudentGrades;
IF OBJECT_ID('dbo.SaudiStudentTotals', 'U') IS NOT NULL DROP TABLE dbo.SaudiStudentTotals;
IF OBJECT_ID('dbo.Students', 'U') IS NOT NULL DROP TABLE dbo.Students;
GO

-- 3. Create Students Table (Primary Table)
CREATE TABLE dbo.Students (
    Id INT IDENTITY(1,1) NOT NULL,
    StudentName NVARCHAR(100) NOT NULL,
    StudentNameEn NVARCHAR(100) NOT NULL,
    NationalId NVARCHAR(20) NOT NULL,
    Phone NVARCHAR(20) NOT NULL,
    Email NVARCHAR(150) NOT NULL,
    GuardianName NVARCHAR(100) NOT NULL,
    GuardianPhone NVARCHAR(20) NOT NULL,
    GuardianRelation NVARCHAR(100) NOT NULL,
    AddressGov NVARCHAR(100) NOT NULL,
    AddressCenter NVARCHAR(100) NOT NULL,
    AddressVillage NVARCHAR(100) NULL,
    AddressStreet NVARCHAR(200) NOT NULL,
    AddressBuilding NVARCHAR(50) NOT NULL,
    AddressFloor NVARCHAR(20) NULL,
    Certification NVARCHAR(100) NOT NULL,
    Track NVARCHAR(100) NOT NULL,
    PhotoPath NVARCHAR(500) NOT NULL,
    SubmittedAt DATETIME2(7) NOT NULL CONSTRAINT DF_Students_SubmittedAt DEFAULT SYSUTCDATETIME(),
    CONSTRAINT PK_Students PRIMARY KEY CLUSTERED (Id ASC),
    CONSTRAINT UQ_Students_NationalId UNIQUE NONCLUSTERED (NationalId ASC)
);
GO

-- Create Index on NationalId for search optimization
CREATE NONCLUSTERED INDEX IX_Students_NationalId ON dbo.Students (NationalId ASC);
GO

-- 4. Create SaudiStudentTotals Table (One-to-One with Students)
CREATE TABLE dbo.SaudiStudentTotals (
    StudentId INT NOT NULL,
    YearsCount NVARCHAR(50) NOT NULL,
    TotalAchieved DECIMAL(18,2) NOT NULL,
    TotalWeighted DECIMAL(18,2) NOT NULL,
    TotalCoefficients INT NOT NULL,
    SchoolPercentage DECIMAL(18,2) NOT NULL,
    AptitudeScore DECIMAL(18,2) NOT NULL,
    FinalPercentage DECIMAL(18,2) NOT NULL,
    CONSTRAINT PK_SaudiStudentTotals PRIMARY KEY CLUSTERED (StudentId ASC),
    CONSTRAINT FK_SaudiStudentTotals_Students_StudentId FOREIGN KEY (StudentId) 
        REFERENCES dbo.Students (Id) ON DELETE CASCADE
);
GO

-- 5. Create SaudiStudentGrades Table (One-to-Many with Students)
CREATE TABLE dbo.SaudiStudentGrades (
    Id INT IDENTITY(1,1) NOT NULL,
    StudentId INT NOT NULL,
    YearLabel NVARCHAR(50) NOT NULL, -- e.g., 'Year 1', 'Year 2', 'Year 3'
    SubjectName NVARCHAR(150) NOT NULL,
    Coefficient INT NOT NULL,
    Achieved DECIMAL(18,2) NOT NULL,
    Weighted DECIMAL(18,2) NOT NULL,
    CONSTRAINT PK_SaudiStudentGrades PRIMARY KEY CLUSTERED (Id ASC),
    CONSTRAINT FK_SaudiStudentGrades_Students_StudentId FOREIGN KEY (StudentId) 
        REFERENCES dbo.Students (Id) ON DELETE CASCADE
);
GO

-- Create Index on StudentId and YearLabel for rapid retrieval of reports
CREATE NONCLUSTERED INDEX IX_SaudiStudentGrades_StudentId_YearLabel ON dbo.SaudiStudentGrades (StudentId ASC, YearLabel ASC);
GO

-- 6. Create IGStudentGrades Table (One-to-One with Students)
CREATE TABLE dbo.IGStudentGrades (
    StudentId INT NOT NULL,
    IgProgram NVARCHAR(50) NOT NULL, -- e.g., 'IGCSE', 'AS-Levels', 'A-Levels'
    Factor DECIMAL(18,2) NOT NULL,
    SportsBonus DECIMAL(18,2) NOT NULL,
    ScorePercentage DECIMAL(18,2) NOT NULL,
    GovernmentScore DECIMAL(18,2) NOT NULL,
    CONSTRAINT PK_IGStudentGrades PRIMARY KEY CLUSTERED (StudentId ASC),
    CONSTRAINT FK_IGStudentGrades_Students_StudentId FOREIGN KEY (StudentId) 
        REFERENCES dbo.Students (Id) ON DELETE CASCADE
);
GO

-- 7. Create IGStudentGradeCounts Table (One-to-Many with Students)
CREATE TABLE dbo.IGStudentGradeCounts (
    Id INT IDENTITY(1,1) NOT NULL,
    StudentId INT NOT NULL,
    GradeType NVARCHAR(50) NOT NULL, -- e.g., 'igcse-legacy', 'igcse-numeric', 'as-level', 'a-level'
    Grade NVARCHAR(20) NOT NULL, -- e.g., 'A_STAR', 'A', '9', '8'
    Count INT NOT NULL,
    CONSTRAINT PK_IGStudentGradeCounts PRIMARY KEY CLUSTERED (Id ASC),
    CONSTRAINT FK_IGStudentGradeCounts_Students_StudentId FOREIGN KEY (StudentId) 
        REFERENCES dbo.Students (Id) ON DELETE CASCADE
);
GO

-- Create Index on StudentId
CREATE NONCLUSTERED INDEX IX_IGStudentGradeCounts_StudentId ON dbo.IGStudentGradeCounts (StudentId ASC);
GO

-- 8. Create StandardStudentGrades Table (One-to-Many with Students)
CREATE TABLE dbo.StandardStudentGrades (
    Id INT IDENTITY(1,1) NOT NULL,
    StudentId INT NOT NULL,
    YearOfStudy NVARCHAR(50) NOT NULL,
    SubjectName NVARCHAR(150) NOT NULL,
    Grade DECIMAL(18,2) NOT NULL,
    WeightedPercentage DECIMAL(18,2) NOT NULL,
    Achieved DECIMAL(18,2) NOT NULL,
    CONSTRAINT PK_StandardStudentGrades PRIMARY KEY CLUSTERED (Id ASC),
    CONSTRAINT FK_StandardStudentGrades_Students_StudentId FOREIGN KEY (StudentId) 
        REFERENCES dbo.Students (Id) ON DELETE CASCADE
);
GO

-- Create Index on StudentId and YearOfStudy
CREATE NONCLUSTERED INDEX IX_StandardStudentGrades_StudentId_YearOfStudy ON dbo.StandardStudentGrades (StudentId ASC, YearOfStudy ASC);
GO
