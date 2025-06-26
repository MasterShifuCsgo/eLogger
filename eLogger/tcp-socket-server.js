const net = require("net");
const insert_data = require("./db/db.js");

const port = 3100;

const server = net.createServer((socket) => {
  console.log("Client connected");

  socket.on("data", (data) => {
    const strData = data.toString();    
    //call function that inserts the data to the sqlite server
    insert_data(strData);
  })
})

server.on("error", (err) => {
  console.log("Socket error", err);
})

server.listen(port, () => {
  console.log("TCP socket is running on port:", port);
});
