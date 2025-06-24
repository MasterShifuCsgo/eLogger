PRAGMA foreign_keys = ON;

-- 1. Log Book Table
-- Central table for each distinct log book or voyage.
CREATE TABLE log_book (
    id INTEGER PRIMARY KEY,
    title TEXT NOT NULL,
    vessel_name TEXT NOT NULL,
    captain_name TEXT NOT NULL,
    start_date TEXT, -- YYYY-MM-DD format
    end_date TEXT   -- YYYY-MM-DD format
);

-- 2. Navigational Log Entries
-- Captures the core navigational data at specific timestamps.
CREATE TABLE navigational_logs (
    id INTEGER PRIMARY KEY,
    log_book_id INTEGER NOT NULL,
    recorded_at TEXT NOT NULL, -- YYYY-MM-DD HH:MM:SS format (UTC recommended)
    latitude REAL NOT NULL,    -- Decimal degrees (e.g., 34.25)
    longitude REAL NOT NULL,   -- Decimal degrees (e.g., -118.0)
    position_type TEXT,        -- 'DR' (Dead Reckoning), 'EP' (Estimated), 'Fix' (Actual)
    course_true REAL,          -- Degrees True (0-359)
    course_magnetic REAL,      -- Degrees Magnetic (0-359)
    course_compass REAL,       -- Degrees Compass (0-359)
    speed_knots REAL,          -- Speed through water or over ground
    heading_degrees REAL,      -- Current heading if different from course
    remarks TEXT,
    FOREIGN KEY (log_book_id) REFERENCES log_book(id)
);
CREATE INDEX navigational_logs_recorded_at_index ON navigational_logs(recorded_at);
CREATE INDEX navigational_logs_position_index ON navigational_logs(latitude, longitude);

-- 3. Meteorological Observations
-- Records weather and sea conditions.
CREATE TABLE meteorological_observations (
    id INTEGER PRIMARY KEY,
    log_book_id INTEGER NOT NULL,
    recorded_at TEXT NOT NULL, -- YYYY-MM-DD HH:MM:SS format
    barometric_pressure_mb REAL,
    air_temperature_celsius REAL,
    sea_temperature_celsius REAL,
    cloud_cover TEXT,          -- e.g., 'Clear', 'Partly Cloudy', 'Overcast'
    visibility_nm REAL,        -- Nautical miles
    precipitation TEXT,        -- e.g., 'None', 'Rain', 'Snow', 'Hail'
    wind_direction_true TEXT,  -- e.g., 'NW', 'SE'
    wind_speed_knots REAL,
    beaufort_force INTEGER,    -- Beaufort scale (0-12)
    sea_state_description TEXT,-- e.g., 'Calm', 'Moderate', 'Rough'
    swell_height_meters REAL,
    swell_direction_true TEXT,
    weather_description TEXT,  -- General summary (e.g., 'Fair', 'Squally', 'Gale')
    FOREIGN KEY (log_book_id) REFERENCES log_book(id)
);
CREATE INDEX meteorological_observations_recorded_at_index ON meteorological_observations(recorded_at);

-- 4. Incident Reports
-- Detailed reports for any significant incidents.
CREATE TABLE incident_reports (
    id INTEGER PRIMARY KEY,
    log_book_id INTEGER NOT NULL,
    incident_time TEXT NOT NULL, -- YYYY-MM-DD HH:MM:SS format
    incident_type TEXT NOT NULL, -- e.g., 'Medical Emergency', 'Collision', 'Grounding', 'Fire', 'Security Incident', 'Pollution'
    description TEXT NOT NULL,
    location_latitude REAL,
    location_longitude REAL,
    severity TEXT,               -- e.g., 'Minor', 'Serious', 'Critical'
    persons_involved TEXT,       -- Names of persons involved/affected
    damage_description TEXT,     -- Description of any damage
    actions_taken TEXT,
    notifications_made TEXT,     -- e.g., 'USCG', 'Company', 'Port Authority'
    resolution TEXT,
    FOREIGN KEY (log_book_id) REFERENCES log_book(id)
);
CREATE INDEX incident_reports_incident_time_index ON incident_reports(incident_time);
