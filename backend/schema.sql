-- MySQL Schema for College Asset Management System
-- Run this SQL in your MySQL database to create all required tables

CREATE DATABASE IF NOT EXISTS college_asset_mgmt;
USE college_asset_mgmt;

-- Assets table
CREATE TABLE IF NOT EXISTS assets (
    id VARCHAR(20) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    purchase_date DATE NOT NULL,
    status ENUM('Available', 'Allocated', 'Maintenance') DEFAULT 'Available',
    location VARCHAR(255) NOT NULL,
    quantity INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Asset Requests table
CREATE TABLE IF NOT EXISTS asset_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    asset_id VARCHAR(20) NOT NULL,
    quantity INT DEFAULT 1,
    reason TEXT,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    request_date DATE NOT NULL,
    user_name VARCHAR(255),
    asset_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (asset_id) REFERENCES assets(id)
);

-- Allocations table
CREATE TABLE IF NOT EXISTS allocations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    asset_id VARCHAR(20) NOT NULL,
    asset_name VARCHAR(255) NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    issue_date DATE NOT NULL,
    return_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (asset_id) REFERENCES assets(id)
);

-- Maintenance records table
CREATE TABLE IF NOT EXISTS maintenance_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    asset_id VARCHAR(20) NOT NULL,
    asset_name VARCHAR(255) NOT NULL,
    service_date DATE NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (asset_id) REFERENCES assets(id)
);

-- Insert default admin user
INSERT INTO users (name, email, password, role) VALUES
('Admin', 'admin@college.edu', 'admin123', 'admin'),
('Rahul Kumar', 'user@college.edu', 'user123', 'user');

-- Insert sample assets
INSERT INTO assets (id, name, category, purchase_date, status, location) VALUES
('AST-001', 'Dell Latitude 5520', 'Laptop', '2024-01-15', 'Available', 'Lab A'),
('AST-002', 'Epson EB-X51', 'Projector', '2023-08-20', 'Available', 'Room 201'),
('AST-003', 'HP LaserJet Pro', 'Printer', '2024-03-10', 'Available', 'Admin Office'),
('AST-004', 'Cisco Catalyst 2960', 'Network Switch', '2023-05-12', 'Maintenance', 'Server Room'),
('AST-005', 'MacBook Air M2', 'Laptop', '2024-06-01', 'Available', 'Lab B'),
('AST-006', 'Oscilloscope DSO1102E', 'Lab Equipment', '2022-11-08', 'Available', 'Electronics Lab'),
('AST-007', 'Canon EOS R50', 'Camera', '2024-02-28', 'Available', 'Media Room'),
('AST-008', 'BenQ GW2780', 'Monitor', '2023-09-15', 'Available', 'Lab A');

--Inser notifications
CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    message TEXT,
    type ENUM('request','approval','rejection'),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
