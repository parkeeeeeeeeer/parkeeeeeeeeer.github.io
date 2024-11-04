CREATE TABLE cadets (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    commissioning_year YEAR NOT NULL,
    
    -- Cadre:
    -- Wing/CC: 
    -- A3: 
    -- A9:
    -- Flt/CC:
    -- IO:
    -- POC:
    -- GMC:
    access_level ENUM('Cadre', 'Wing/CC', 'A3','A9', 'Flt/CC','IO', 'POC', 'GMC') NOT NULL,
   
    gender ENUM('Male', 'Female','N/A') NOT NULL,
    university ENUM('HU', 'AU', 'CUA','GU','GWU','MU','TWU','UDC','N/A') NOT NULL,
    phone_number VARCHAR(15) NOT NULL,
    student_id VARCHAR(15) NOT NULL,
    as_level ENUM ('AS100','AS200/250/500','AS300','AS400','N/A')
);

INSERT INTO cadets (email, commissioning_year, access_level, gender, university, phone_number, student_id, as_level)
VALUES 
('jane.doe@university.edu', 2025, 'Cadre', 'N/A', 'N/A', '123-456-7890', 'S12345', 'N/A'),
('john.smith@university.edu', 2026, 'POC', 'Male', 'GWU', '987-654-3210', 'S67890', 'AS300'),
('alice.jones@university.edu', 2027, 'GMC', 'Female', 'HU', '555-555-5555', 'S54321', 'AS200/250/500'),
('bob.johnson@university.edu', 2024, 'Wing', 'Male', 'CUA', '444-444-4444', 'S98765', 'AS400'),
('lucy.brown@university.edu', 2028, 'GMC', 'Female', 'MU', '333-333-3333', 'S87654', 'AS100');
