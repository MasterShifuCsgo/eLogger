CREATE TABLE IF NOT EXISTS log_entry (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp_utc TEXT NOT NULL,
    latitude REAL,
    longitude REAL,
    course_over_ground REAL,
    speed_over_ground REAL,
    heading REAL,
    rudder_angle REAL,
    wind_direction REAL,
    wind_speed REAL,
    sea_state TEXT,
    visibility TEXT,
    barometric_pressure REAL,
    air_temp REAL,
    water_temp REAL,
    engine_rpm REAL,
    engine_mode TEXT,
    generator_online TEXT,
    remarks TEXT
);

CREATE TABLE IF NOT EXISTS nmea_raw (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    log_entry_id INTEGER,
    sentence TEXT NOT NULL,
    source TEXT,
    talker_type TEXT,
    received_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (log_entry_id) REFERENCES log_entry(id) ON DELETE CASCADE
);
