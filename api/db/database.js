const BetterSqlite3 = require("better-sqlite3");
// Initialize the database connection.
// The database file will be created in the './db/' directory.
const db = new BetterSqlite3("./api/db/database.db");

/**
 * @class CaptainsLogDatabase
 * @description Manages operations for a Captain's Log database.
 * Allows creating a new log book or interacting with an existing one,
 * and adding entries for navigational data, meteorological observations,
 * and incident reports.
 */
class CaptainsLogDatabase {
    /**
     * @constructor
     * @param {number|null} [logBookId=null] - The ID of an existing log book to use. If null or not found, a new log book will be created.
     * @param {string} [title=''] - The title for a new log book. Required if creating a new log book.
     * @param {string} [vesselName=''] - The name of the vessel for a new log book. Required if creating a new log book.
     * @param {string} [captainName=''] - The name of the captain for a new log book. Required if creating a new log book.
     */
    constructor(logBookId = null, title = '', vesselName = '', captainName = '') {
        this.logBookId = logBookId;

        // Ensure the database tables exist. This is crucial for initial setup.
        // This method will create tables if they don't exist, or do nothing if they do.
        this.#createTables();

        // If a logBookId is provided, attempt to load the existing log book.
        if (this.logBookId !== null) {
            const result = db.prepare(`SELECT id FROM log_book WHERE id = ?`).get(this.logBookId);
            if (result && result.id) {
                console.log(`Successfully loaded log book with ID: ${this.logBookId}`);
            } else {
                // If log book ID not found, treat as a new log book creation.
                console.warn(`Log book with ID ${this.logBookId} not found. Creating a new one.`);
                this.logBookId = null; // Reset to null to trigger new creation.
            }
        }

        // If no logBookId was provided or found, create a new log book entry.
        if (this.logBookId === null) {
            // Validate that required parameters for a new log book are provided.
            if (!title || !vesselName || !captainName) {
                console.error("Failed to create new log book: title, vesselName, and captainName are required.");
                throw new Error("Missing required parameters for new log book.");
            }
            try {
                // Insert a new row into the log_book table, setting the start date to now.
                const result = db.prepare("INSERT INTO log_book (title, vessel_name, captain_name, start_date) VALUES (?, ?, ?, DATE('now'))").run(title, vesselName, captainName);
                this.logBookId = result.lastInsertRowid; // Get the ID of the newly inserted row.
                console.log(`Created new log book with ID: ${this.logBookId} and title: "${title}"`);
            } catch (error) {
                console.error("Error creating new log book:", error.message);
                throw error; // Re-throw the error to indicate failure in construction.
            }
        }
    }

    /**
     * @private
     * @description Creates the necessary database tables if they do not already exist.
     * This method ensures the database schema is set up before operations.
     */
    #createTables() {
        // Enable foreign key constraints to maintain referential integrity.
        db.exec("PRAGMA foreign_keys = ON;");

        // Create the 'log_book' table if it doesn't already exist.
        db.exec(`
            CREATE TABLE IF NOT EXISTS log_book (
                id INTEGER PRIMARY KEY,
                title TEXT NOT NULL,
                vessel_name TEXT NOT NULL,
                captain_name TEXT NOT NULL,
                start_date TEXT, -- YYYY-MM-DD format
                end_date TEXT    -- YYYY-MM-DD format
            );
        `);

        // Create the 'navigational_logs' table if it doesn't already exist.
        db.exec(`
            CREATE TABLE IF NOT EXISTS navigational_logs (
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
        `);
        // Add indexes for faster lookups on recorded_at and position.
        db.exec(`CREATE INDEX IF NOT EXISTS navigational_logs_recorded_at_index ON navigational_logs(recorded_at);`);
        db.exec(`CREATE INDEX IF NOT EXISTS navigational_logs_position_index ON navigational_logs(latitude, longitude);`);

        // Create the 'meteorological_observations' table if it doesn't already exist.
        db.exec(`
            CREATE TABLE IF NOT EXISTS meteorological_observations (
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
        `);
        // Add index for faster lookups on recorded_at.
        db.exec(`CREATE INDEX IF NOT EXISTS meteorological_observations_recorded_at_index ON meteorological_observations(recorded_at);`);

        // Create the 'incident_reports' table if it doesn't already exist.
        db.exec(`
            CREATE TABLE IF NOT EXISTS incident_reports (
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
        `);
        // Add index for faster lookups on incident_time.
        db.exec(`CREATE INDEX IF NOT EXISTS incident_reports_incident_time_index ON incident_reports(incident_time);`);

        console.log("Database tables checked/created successfully.");
    }

    /**
     * Inserts a new navigational log entry into the 'navigational_logs' table.
     * @param {object} data - Object containing navigational log details.
     * @param {number} data.latitude - Decimal degrees latitude.
     * @param {number} data.longitude - Decimal degrees longitude.
     * @param {string} [data.recorded_at] - Timestamp (YYYY-MM-DD HH:MM:SS). Defaults to current UTC time.
     * @param {string} [data.position_type] - Type of position (e.g., 'DR', 'EP', 'Fix').
     * @param {number} [data.course_true] - True course in degrees (0-359).
     * @param {number} [data.course_magnetic] - Magnetic course in degrees (0-359).
     * @param {number} [data.course_compass] - Compass course in degrees (0-359).
     * @param {number} [data.speed_knots] - Speed through water or over ground in knots.
     * @param {number} [data.heading_degrees] - Current heading in degrees (0-359) if different from course.
     * @param {string} [data.remarks] - Any relevant remarks.
     */
    createNavigationalLog(data) {
        // Basic validation for essential coordinates.
        if (typeof data.latitude !== 'number' || typeof data.longitude !== 'number') {
            console.error("Missing or invalid required data for navigational log: latitude and longitude must be numbers.");
            return;
        }
        // Use provided timestamp or generate current UTC timestamp.
        const recordedAt = data.recorded_at || new Date().toISOString().slice(0, 19).replace('T', ' ');

        // Prepare and execute the SQL INSERT statement.
        const stmt = db.prepare(`
            INSERT INTO navigational_logs (
                log_book_id, recorded_at, latitude, longitude, position_type,
                course_true, course_magnetic, course_compass, speed_knots,
                heading_degrees, remarks
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        stmt.run(
            this.logBookId,
            recordedAt,
            data.latitude,
            data.longitude,
            data.position_type || null, // Use null if optional data is not provided.
            data.course_true || null,
            data.course_magnetic || null,
            data.course_compass || null,
            data.speed_knots || null,
            data.heading_degrees || null,
            data.remarks || null
        );

        console.log(`Navigational log added for Log Book ID ${this.logBookId} at ${recordedAt}`);
    }

    /**
     * Inserts a new meteorological observation entry into the 'meteorological_observations' table.
     * @param {object} data - Object containing meteorological observation details.
     * @param {string} [data.recorded_at] - Timestamp (YYYY-MM-DD HH:MM:SS). Defaults to current UTC time.
     * @param {number} [data.barometric_pressure_mb] - Barometric pressure in millibars.
     * @param {number} [data.air_temperature_celsius] - Air temperature in Celsius.
     * @param {number} [data.sea_temperature_celsius] - Sea temperature in Celsius.
     * @param {string} [data.cloud_cover] - e.g., 'Clear', 'Partly Cloudy', 'Overcast'.
     * @param {number} [data.visibility_nm] - Visibility in nautical miles.
     * @param {string} [data.precipitation] - e.g., 'None', 'Rain', 'Snow'.
     * @param {string} [data.wind_direction_true] - Wind direction (e.g., 'NW', 'SE').
     * @param {number} [data.wind_speed_knots] - Wind speed in knots.
     * @param {number} [data.beaufort_force] - Beaufort scale force (0-12).
     * @param {string} [data.sea_state_description] - e.g., 'Calm', 'Moderate', 'Rough'.
     * @param {number} [data.swell_height_meters] - Swell height in meters.
     * @param {string} [data.swell_direction_true] - Swell direction (e.g., 'NW').
     * @param {string} [data.weather_description] - General weather summary.
     */
    createMeteorologicalObservation(data) {
        // Use provided timestamp or generate current UTC timestamp.
        const recordedAt = data.recorded_at || new Date().toISOString().slice(0, 19).replace('T', ' ');

        // Prepare and execute the SQL INSERT statement.
        const stmt = db.prepare(`
            INSERT INTO meteorological_observations (
                log_book_id, recorded_at, barometric_pressure_mb, air_temperature_celsius,
                sea_temperature_celsius, cloud_cover, visibility_nm, precipitation,
                wind_direction_true, wind_speed_knots, beaufort_force,
                sea_state_description, swell_height_meters, swell_direction_true,
                weather_description
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        stmt.run(
            this.logBookId,
            recordedAt,
            data.barometric_pressure_mb || null,
            data.air_temperature_celsius || null,
            data.sea_temperature_celsius || null,
            data.cloud_cover || null,
            data.visibility_nm || null,
            data.precipitation || null,
            data.wind_direction_true || null,
            data.wind_speed_knots || null,
            data.beaufort_force || null,
            data.sea_state_description || null,
            data.swell_height_meters || null,
            data.swell_direction_true || null,
            data.weather_description || null
        );
        console.log(`Meteorological observation added for Log Book ID ${this.logBookId} at ${recordedAt}`);
    }

    /**
     * Inserts a new incident report entry into the 'incident_reports' table.
     * @param {object} data - Object containing incident report details.
     * @param {string} data.incident_type - Type of incident (e.g., 'Medical Emergency', 'Collision').
     * @param {string} data.description - Description of the incident.
     * @param {string} [data.incident_time] - Timestamp (YYYY-MM-DD HH:MM:SS). Defaults to current UTC time.
     * @param {number} [data.location_latitude] - Latitude of incident.
     * @param {number} [data.location_longitude] - Longitude of incident.
     * @param {string} [data.severity] - Severity of incident (e.g., 'Minor', 'Critical').
     * @param {string} [data.persons_involved] - Names of persons involved/affected.
     * @param {string} [data.damage_description] - Description of any damage.
     * @param {string} [data.actions_taken] - Actions taken.
     * @param {string} [data.notifications_made] - Notifications made (e.g., 'USCG', 'Company').
     * @param {string} [data.resolution] - Resolution details.
     */
    createIncidentReport(data) {
        // Basic validation for essential incident details.
        if (!data.incident_type || !data.description) {
            console.error("Missing required data for incident report: incident_type and description.");
            return;
        }
        // Use provided timestamp or generate current UTC timestamp.
        const incidentTime = data.incident_time || new Date().toISOString().slice(0, 19).replace('T', ' ');

        // Prepare and execute the SQL INSERT statement.
        const stmt = db.prepare(`
            INSERT INTO incident_reports (
                log_book_id, incident_time, incident_type, description,
                location_latitude, location_longitude, severity,
                persons_involved, damage_description, actions_taken,
                notifications_made, resolution
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        stmt.run(
            this.logBookId,
            incidentTime,
            data.incident_type,
            data.description,
            data.location_latitude || null,
            data.location_longitude || null,
            data.severity || null,
            data.persons_involved || null,
            data.damage_description || null,
            data.actions_taken || null,
            data.notifications_made || null,
            data.resolution || null
        );
        console.log(`Incident report added for Log Book ID ${this.logBookId} at ${incidentTime}`);
    }

    /**
     * Closes the database connection.
     */
    close() {
        db.close();
        console.log("Database connection closed.");
    }
}

module.exports = CaptainsLogDatabase;
