-- AssetFlow Industrial Grade Database Dump (PostgreSQL Compatible)
-- Designed for 1000+ Employees and High-Volume Asset Tracking

-- 1. Employees Table
CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id VARCHAR(20) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    department VARCHAR(50),
    role VARCHAR(50),
    status VARCHAR(20) DEFAULT 'Active', -- Active, On Leave, Terminated
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Assets Table
CREATE TABLE assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_tag VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL, -- Laptop, Mobile, Furniture, Peripheral
    serial_number VARCHAR(100) UNIQUE,
    model VARCHAR(100),
    purchase_date DATE,
    cost DECIMAL(10, 2),
    status VARCHAR(20) DEFAULT 'Available', -- Available, Assigned, Maintenance, Retired, Broken
    current_holder_id UUID REFERENCES employees(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Assignments Table (Tracking History)
CREATE TABLE assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID NOT NULL REFERENCES assets(id),
    employee_id UUID NOT NULL REFERENCES employees(id),
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    returned_at TIMESTAMP WITH TIME ZONE,
    condition_on_assign TEXT,
    condition_on_return TEXT,
    notes TEXT
);

-- 4. Maintenance Logs
CREATE TABLE maintenance_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID NOT NULL REFERENCES assets(id),
    service_date DATE NOT NULL,
    description TEXT NOT NULL,
    cost DECIMAL(10, 2),
    performed_by VARCHAR(100),
    next_service_date DATE
);

-- Indexes for Performance
CREATE INDEX idx_assets_status ON assets(status);
CREATE INDEX idx_assets_category ON assets(category);
CREATE INDEX idx_assignments_asset ON assignments(asset_id);
CREATE INDEX idx_assignments_employee ON assignments(employee_id);
CREATE INDEX idx_employees_dept ON employees(department);

-- Dummy Data for HR Department
INSERT INTO employees (employee_id, full_name, email, department, role) VALUES
('EMP001', 'Sarah Jenkins', 'sarah.j@company.com', 'HR', 'HR Director'),
('EMP002', 'Michael Chen', 'm.chen@company.com', 'Engineering', 'Senior Developer'),
('EMP003', 'Elena Rodriguez', 'elena.r@company.com', 'Marketing', 'Creative Lead');

-- Dummy Data for Assets
INSERT INTO assets (asset_tag, name, category, serial_number, model, status) VALUES
('AST-001', 'MacBook Pro 16"', 'Laptop', 'SN-MBP-9921', 'M2 Max', 'Available'),
('AST-002', 'iPhone 14 Pro', 'Mobile', 'SN-IPH-1102', '256GB Space Gray', 'Available'),
('AST-003', 'Dell UltraSharp 27"', 'Peripheral', 'SN-DEL-4432', 'U2723QE', 'Available');
