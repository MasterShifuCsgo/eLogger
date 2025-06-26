

//holds the class which interacts with the database

let currentLog = {
  timestamp_utc: null,
  latitude: null,
  longitude: null,
  course_over_ground: null,
  speed_over_ground: null,
  heading: null,
  rudder_angle: null,
  wind_direction: null,
  wind_speed: null,
  sea_state: null,
  visibility: null,
  barometric_pressure: null,
  air_temp: null,
  water_temp: null,
  engine_rpm: null,
  engine_mode: null,
  generator_online: null,
  remarks: null
};

function parseNMEA(line) {
  if (!line.startsWith("$")) return;

  const fields = line.split(",");
  const type = fields[0].slice(3);

  function parseLat(value, hemisphere) {
  if (!value || !hemisphere) return null;
  const deg = parseFloat(value.slice(0, 2));
  const min = parseFloat(value.slice(2));
  let coord = deg + min / 60;
  return hemisphere === "S" ? -coord : coord;
}

function parseLon(value, hemisphere) {
  if (!value || !hemisphere) return null;
  const deg = parseFloat(value.slice(0, 3));
  const min = parseFloat(value.slice(3));
  let coord = deg + min / 60;
  return hemisphere === "W" ? -coord : coord;
}

function parseTimestamp(timeStr, dateStr) {
  if (!timeStr || !dateStr) return null;
  // HHMMSS.ss + DDMMYY
  const h = timeStr.slice(0, 2);
  const m = timeStr.slice(2, 4);
  const s = timeStr.slice(4, 6);
  const d = dateStr.slice(0, 2);
  const mo = dateStr.slice(2, 4);
  const y = "20" + dateStr.slice(4, 6);
  return `${y}-${mo}-${d}T${h}:${m}:${s}Z`;
}

function parseZda(fields) {
  const timeStr = fields[1];
  const day = fields[2];
  const month = fields[3];
  const year = fields[4];
  if (!timeStr || !day || !month || !year) return null;
  const h = timeStr.slice(0, 2);
  const m = timeStr.slice(2, 4);
  const s = timeStr.slice(4, 6);
  return `${year}-${month}-${day}T${h}:${m}:${s}Z`;
}



switch (type) {
  case "RMC":
    currentLog.latitude = parseLat(fields[3], fields[4]);
    currentLog.longitude = parseLon(fields[5], fields[6]);
    currentLog.speed_over_ground = parseFloat(fields[7]);
    currentLog.course_over_ground = parseFloat(fields[8]);
    currentLog.timestamp_utc = parseTimestamp(fields[1], fields[9]);
    break;

  case "VTG": // Velocity made good
    currentLog.course_over_ground = parseFloat(fields[1]); // true track
    currentLog.speed_over_ground = parseFloat(fields[5]); // knots
    break;

  case "VHW": // Water heading and speed
    currentLog.heading = parseFloat(fields[1]); // true heading
    break;

  case "HDT": // True heading from compass/gyro
    currentLog.heading = parseFloat(fields[1]);
    break;

  case "GLL": // Geographic position
    currentLog.latitude = parseLat(fields[1], fields[2]);
    currentLog.longitude = parseLon(fields[3], fields[4]);
    break;

  case "GGA": // GPS fix data
    currentLog.latitude = parseLat(fields[2], fields[3]);
    currentLog.longitude = parseLon(fields[4], fields[5]);
    break;

  case "GSA": // DOP info (optional, not mapped)
    // Could track fix quality, satellites used
    break;

  case "ZDA": // Date and time
    currentLog.timestamp_utc = parseZda(fields);
    break;

  case "VBW": // Dual ground/water speed
    currentLog.speed_over_ground = parseFloat(fields[1]); // Foreward water speed
    break;

  case "MWV": // Wind speed and angle
    currentLog.wind_direction = parseFloat(fields[1]);
    currentLog.wind_speed = parseFloat(fields[3]);
    break;

  case "APB": // Autopilot data — rudder?
    currentLog.rudder_angle = parseFloat(fields[4]) || null;
    break;

  case "RMB": // Recommended Minimum Navigation Info
    // May have position and status
    break;

  // AIS messages – typically handled elsewhere or parsed via a library
  case "VDM":
  case "VDO":
    // Skip unless you're doing AIS decoding
    break;

  default:
    // Unknown or unimplemented sentence
    break;
}
}

function insert_data(data) {
  let NmeaDataLines = data.split('\n');
  for(let i = 0; i < NmeaDataLines.length; i++){
    parseNMEA(NmeaDataLines[i]);
  }
  console.log(currentLog)
}

module.exports = insert_data;