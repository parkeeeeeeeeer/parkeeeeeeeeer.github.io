-- Cadets Table Creation with Password (MySQL/PostgreSQL Compatible)
CREATE TABLE IF NOT EXISTS cadets (
    id VARCHAR(50) PRIMARY KEY, -- Custom ID
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL, -- To store the hashed password
    username VARCHAR(100) UNIQUE NOT NULL, -- Username in format: 'C/LastName, FI'
    email VARCHAR(255) UNIQUE NOT NULL,
    commissioning_year YEAR NOT NULL,
  
    access_level ENUM('Cadre', 'Wing/CC', 'A3', 'A9', 'Flt/CC', 'IO', 'POC', 'GMC') NOT NULL,
    flight ENUM('POC','Alpha','Bravo','Charlie','Delta','Echo', 'Foxtrot','Golf','Hotel') DEFAULT 'POC',
    university ENUM('HU', 'AU', 'CUA', 'GU', 'GWU', 'MU', 'TWU', 'UDC', 'N/A') NOT NULL,
    phone_number VARCHAR(15) NOT NULL,
    student_id VARCHAR(15) NOT NULL,
    as_level ENUM('AS100', 'AS200/250/500', 'AS300', 'AS400', 'N/A') DEFAULT 'N/A'
);


-- Create a trigger to automatically assign a custom username format: 'C/LastName, FI'
CREATE OR REPLACE FUNCTION generate_cadet_username()
RETURNS TRIGGER AS $$
BEGIN
    -- Format username as 'C/LastName, FI'
    NEW.username := 'C/' || NEW.last_name || ', ' || LEFT(NEW.first_name, 1);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach the trigger to the cadets table to execute before an insert
CREATE TRIGGER cadet_username_trigger
BEFORE INSERT ON cadets
FOR EACH ROW
EXECUTE FUNCTION generate_cadet_username();

-- PFA Scores table linked via username
CREATE TABLE IF NOT EXISTS pfa_scores (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) REFERENCES cadets(username) ON DELETE CASCADE,  -- Foreign key linking to cadets.username
    gender ENUM('Male', 'Female') NOT NULL,
    age INT NOT NULL;
    test_date DATE NOT NULL,  
    pushups INT NOT NULL,     
    situps INT NOT NULL,      
    run_time INTERVAL NOT NULL,
    pfa_score DECIMAL(5, 2) CHECK (pfa_score >= 0 AND pfa_score <= 100)  -- Ensure valid score
);

CREATE TABLE IF NOT EXISTS sobs (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) REFERENCES cadets(username) ON DELETE CASCADE,  -- Foreign key linking to cadets.username
    objective_number VARCHAR(10),  -- Linking to the objective_number from Objectives table
    completed BOOLEAN DEFAULT FALSE,  -- Tracks whether the cadet has completed the SOB
    evaluation_date DATE,  -- Optional: Date when the SOB was evaluated
    comments TEXT,  -- Optional: Instructor comments on the cadet's performance
    UNIQUE (username, objective_number)  -- Ensures one record per cadet per SOB
);

-- Insert a record for each cadet and each SOB (this assumes that cadets and objectives have been populated)
INSERT INTO sobs (username, objective_number)
SELECT cadets.username, objectives.objective_number
FROM cadets
CROSS JOIN objectives;