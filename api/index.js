
require("dotenv").config();
const express = require("express");
const app = express();
const axios = require("axios").default;
const PORT = process.env.API_PORT;
const DATA_SENDER_PORT = process.env.DATA_SENDER_PORT;
const CaptainsLogDatabase = require("./db/database.js");

app.use(express.json());

//get route
app.get('/', async (req, res) => {
    try {
        const response = await axios.get(`http://localhost:${DATA_SENDER_PORT}`);
        const data = response.data;

        // Create a new CaptainsLogDatabase instance.
        // We pass null for logBookId to create a new one, and use data from generateRandomCaptainsLog for details.
        const dbInstance = new CaptainsLogDatabase(
            1, // logBookId (null to create a new one)
            data.log_book.title,
            data.log_book.vessel_name,
            data.log_book.captain_name
        );

        // Log Navigational Data
        if (data.navigational_logs && data.navigational_logs.length > 0) {
            data.navigational_logs.forEach(logEntry => { 
                dbInstance.createNavigationalLog(logEntry);
            });
        }

        // Log Meteorological Observations
        if (data.meteorological_observations && data.meteorological_observations.length > 0) {
            data.meteorological_observations.forEach(obsEntry => {
                dbInstance.createMeteorologicalObservation(obsEntry);
            });
        }

        // Log Incident Reports
        if (data.incident_reports && data.incident_reports.length > 0) {
            data.incident_reports.forEach(incidentEntry => {
                dbInstance.createIncidentReport(incidentEntry);
            });
        }        

        res.send("Data logged successfully!"); // Send a success response
    } catch (error) {
        console.error("Error fetching or logging data:", error.message);
        res.status(500).send(`Error: ${error.message}`); // Send an error response
    }
});

app.listen(PORT, () => {
  console.log("Started eLogger port: ", PORT);
});
