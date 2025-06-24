function generateRandomCaptainsLog() {
  const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const seaStates = ["Calm", "Slight", "Moderate", "Rough", "Very Rough", "High"];
  const cloudCovers = ["Clear", "Partly Cloudy", "Overcast"];
  //const visibilities = ["Excellent", "Good", "Moderate", "Poor", "Foggy"];
  const precipitations = ["None", "Rain", "Snow", "Hail"];
  const weatherDescriptions = ["Fair", "Squally", "Gale", "Sunny", "Cloudy", "Drizzle"];
  const incidentTypes = ["Medical Emergency", "Collision", "Grounding", "Fire", "Security Incident", "Pollution", "Machinery Breakdown", "Man Overboard"];
  const severities = ["Minor", "Moderate", "Serious", "Critical"];
  const positionTypes = ["Fix", "DR", "EP"];

  // Helper to get a random float with specified decimals
  const getRandomFloat = (min, max, decimals = 1) =>
    parseFloat((Math.random() * (max - min) + min).toFixed(decimals));

  // Helper to get a random integer
  const getRandomInt = (min, max) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

  // Helper to get a random element from an array
  const randomFromArray = (arr) => arr[getRandomInt(0, arr.length - 1)];

  // Helper to generate a current timestamp in YYYY-MM-DD HH:MM:SS format
  const generateTimestamp = (offsetHours = 0) => {
    const date = new Date();
    date.setHours(date.getHours() + offsetHours); // Apply offset for varied times
    return date.toISOString().slice(0, 19).replace('T', ' ');
  };

  // Generate random latitude (between -85 and 85) and longitude (between -175 and 175)
  const generateNumericPosition = () => ({
    latitude: getRandomFloat(-85, 85, 4),
    longitude: getRandomFloat(-175, 175, 4)
  });

  const currentPos = generateNumericPosition();
  const incidentPos = generateNumericPosition(); // A potentially different position for an incident

  return {
    // Data for the 'log_book' table
    log_book: {
      title: "Arctic Exploration Voyage",
      vessel_name: "MV Arctic Dawn",
      captain_name: "Capt. Jane Doe"
    },
    // Data for the 'navigational_logs' table
    navigational_logs: [{
      log_book_id: 1, // Assuming this log entry belongs to the first log book
      recorded_at: generateTimestamp(),
      latitude: currentPos.latitude,
      longitude: currentPos.longitude,
      position_type: randomFromArray(positionTypes),
      course_true: getRandomInt(0, 359),
      course_magnetic: getRandomInt(0, 359),
      course_compass: getRandomInt(0, 359),
      speed_knots: getRandomFloat(5, 25, 1),
      heading_degrees: getRandomInt(0, 359),
      remarks: "Proceeding as planned, calm seas."
    }],
    // Data for the 'meteorological_observations' table
    meteorological_observations: [{
      log_book_id: 1, // Assuming this log entry belongs to the first log book
      recorded_at: generateTimestamp(-1), // An hour before current
      barometric_pressure_mb: getRandomFloat(980, 1030, 2),
      air_temperature_celsius: getRandomFloat(-10, 30, 1),
      sea_temperature_celsius: getRandomFloat(-2, 28, 1),
      cloud_cover: randomFromArray(cloudCovers),
      visibility_nm: getRandomFloat(0.5, 20, 1),
      precipitation: randomFromArray(precipitations),
      wind_direction_true: randomFromArray(directions),
      wind_speed_knots: getRandomInt(0, 40),
      beaufort_force: getRandomInt(0, 8),
      sea_state_description: randomFromArray(seaStates),
      swell_height_meters: getRandomFloat(0, 5, 1),
      swell_direction_true: randomFromArray(directions),
      weather_description: randomFromArray(weatherDescriptions)
    }],
    // Data for the 'incident_reports' table
    incident_reports: [{
      log_book_id: 1, // Assuming this log entry belongs to the first log book
      incident_time: generateTimestamp(-2), // Two hours before current
      incident_type: randomFromArray(incidentTypes),
      description: "Minor engine vibration detected in port engine.",
      location_latitude: incidentPos.latitude,
      location_longitude: incidentPos.longitude,
      severity: randomFromArray(severities),
      persons_involved: "Chief Engineer, 2nd Engineer",
      damage_description: "No visible damage.",
      actions_taken: "RPM reduced, vibration monitored. Routine checks initiated.",
      notifications_made: "Company Operations Center",
      resolution: "Under investigation."
    }]
  };
}

module.exports = generateRandomCaptainsLog;