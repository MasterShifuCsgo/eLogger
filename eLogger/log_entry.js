const db = require('better-sqlite3')('shiplog.db');


const stmt = db.prepare(`
  INSERT INTO log_entry (
    timestamp_utc, latitude, longitude,
    course_over_ground, speed_over_ground,
    heading, rudder_angle,
    wind_direction, wind_speed,
    sea_state, visibility,
    barometric_pressure, air_temp, water_temp,
    engine_rpm, engine_mode, generator_online,
    remarks
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

/*
  stmt.run(
    new Date().toISOString(),
    58.1234, 24.9876,
    85.3, 10.2,
    90.0, 0.0,
    270, 15,
    'Moderate', 'Good',
    1013.2, 17.5, 8.4,
    1500, 'Ahead', 'G1',
    'Engine stable, visibility dropping slightly.'
  );
*/






const insertNMEA = db.prepare(`
  INSERT INTO nmea_raw (log_entry_id, sentence, source, talker_type)
  VALUES (?, ?, ?, ?)
`);

/*
insertNMEA.run(42, "$GPRMC,123519,A,4807.038,N,...", "GPS", "RMC");


const rows = db.prepare(`
  SELECT * FROM log_entry ORDER BY timestamp_utc DESC LIMIT 5
`).all();
*/

console.table(rows);

