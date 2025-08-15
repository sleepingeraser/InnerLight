-- CREATE DATABASE InnerLightDB
GO
USE InnerLightDB

-- drop existing tables if they exist
DROP TABLE IF EXISTS Appointments
DROP TABLE IF EXISTS Articles
DROP TABLE IF EXISTS Journals
DROP TABLE IF EXISTS Users

-- users table
CREATE TABLE Users (
  id INT PRIMARY KEY IDENTITY,
  username NVARCHAR(50) NOT NULL,
  email NVARCHAR(255) NOT NULL UNIQUE,
  password NVARCHAR(255) NOT NULL,
  role NVARCHAR(10) CHECK (role IN ('user', 'admin')) NOT NULL,
  createdAt DATETIME DEFAULT GETDATE()
)

-- journals table
CREATE TABLE Journals (
  id INT PRIMARY KEY IDENTITY,
  userId INT NOT NULL,
  title NVARCHAR(255),
  content NVARCHAR(MAX) NOT NULL,
  createdAt DATETIME DEFAULT GETDATE(),
  FOREIGN KEY (userId) REFERENCES Users(id)
)

-- articles table
CREATE TABLE Articles (
  id INT PRIMARY KEY IDENTITY,
  title NVARCHAR(255) NOT NULL,
  content NVARCHAR(MAX) NOT NULL,
  category NVARCHAR(50),
  createdAt DATETIME DEFAULT GETDATE()
)

-- appointments table
CREATE TABLE Appointments (
  id INT PRIMARY KEY IDENTITY,
  userId INT NOT NULL,
  status NVARCHAR(20) CHECK (status IN ('pending', 'approved', 'rejected')),
  scheduledAt DATETIME NOT NULL,  -- Note correct spelling
  createdAt DATETIME DEFAULT GETDATE()
)

-- sample data
INSERT INTO Users (username, email, password, role)
VALUES 
('Koyuki', 'koyukisky18@gmail.com', 'realme', 'admin'),
('Astra', 'astrastone19@gmail.com', 'pokemon', 'user')

INSERT INTO Articles (title, content, category)
VALUES
('5 Tips for Better Sleep', 'Content about sleep...', 'Wellness'),
('Mindfulness for Beginners', 'Content about mindfulness...', 'Mental Health')

SELECT * FROM Appointments
SELECT * FROM Articles
SELECT * FROM Journals
SELECT * FROM Users

DELETE FROM Users WHERE email = 'koyukisky18@gmail.com'