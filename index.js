const server = require("http").createServer();
const express = require("express");
const WebSocket = require("ws");
const { v4: uuidv4 } = require("uuid");

const PORT = process.env.PORT || 5000;
// ***************************************************** WebSocket

const wss = new WebSocket.Server({ server: server });
let clients = { AI: null, clients: [] };
let responses = {}; //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
wss.on("connection", (ws) => {
  console.log("Client connected");

  ws.on("message", (msg) => {
    console.log(msg.toString());
    let parsedMsg = null;
    try {
      parsedMsg = JSON.parse(msg.toString());
    } catch (error) {
      console.log(error);
      parsedMsg = null;
    }

    if (parsedMsg) {
      console.log(parsedMsg.type);
      if (parsedMsg.type == "client") clients.clients.push(ws);
      else if (parsedMsg.type == "AI") clients.AI = ws;
    }
    for (let i = 0; i < clients.clients.length; i++) {
      console.log(i);
    }
    wss.clients.forEach((element) => {
      element.send(clients.clients.length);
    });

    // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    // Handle messages from AI client
    if (parsedMsg && parsedMsg.uuid && responses[parsedMsg.uuid]) {
      // Send response back to the original HTTP client
      responses[parsedMsg.uuid].send({
        type: "AI-response",
        data: parsedMsg.data,
      });
      delete responses[parsedMsg.uuid]; // Cleanup
    }
    // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  });

  // Handle disconnections
  ws.on("close", () => {
    console.log("Client disconnected");
    clients.clients.splice(clients.clients.indexOf(ws), 1);
  });
});

// ********************************************* app
const app = express();
app.use(express.json());
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

app.post("/add-to-cart", (req, res) => {
  const { productId } = req.body;
  // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  const uuid = uuidv4(); // Generate a unique ID
  responses[uuid] = res; // Map the response object to the ID

  // Send a message to the AI client
  if (clients.AI) {
    clients.AI.send(
      JSON.stringify({ type: "add-to-cart", uuid: uuid, productId: productId })
    );
  } else {
    res.status(500).send({ error: "AI client not connected" });
  }
  // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
});

server.on("request", app);

server.listen(PORT, () => {
  console.log(`server is now listening on localhost:${PORT}`);
});
