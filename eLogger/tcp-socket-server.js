const net = require("net");
const insert_data = require("./db/db.js");

const {determine_time_interval, extractNavigationalStatus, getAISmessage} = require("./time_interval.js");


const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay))

let timeQueueBusy = false;  // Holds state if queue is in use
let currentValue = null;    // Optional: for logging/debug
function now() {
  return new Date().toISOString();
}

async function queueInsert(strData, delayMs) {
  if (timeQueueBusy) {
    console.log(`[${now()}] Queue is busy. Skipping.`);
    return;
  }

  timeQueueBusy = true;
  currentValue = strData;

  console.log(`[${now()}] Holding data for ${delayMs / 1000} seconds...`);
  await sleep(delayMs);

  insert_data(strData);
  console.log(`[${now()}] Inserted data.`);

  timeQueueBusy = false;
  currentValue = null;
}

const port = 3100;
const server = net.createServer((socket) => {
  console.log("Client connected");
  socket.on("data", async (data) => {    

    const strData = data.toString();    
    //call function that inserts the data to the sqlite server

    //search for the AIVDM messagees and determine the AIS status    
    let aisMessage = getAISmessage(strData);
    if (aisMessage !== undefined) {
      const status = extractNavigationalStatus(aisMessage);
      const delayMs = determine_time_interval(status) * 1000;
      await queueInsert(strData, delayMs);  // Push to time-controlled single-slot
    }    
    

  })
})

server.on("error", (err) => {
  console.log("Socket error", err);
})

server.listen(port, () => {
  console.log("TCP socket is running on port:", port);
});
