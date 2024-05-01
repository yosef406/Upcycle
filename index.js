const server = require("http").createServer();
const express = require("express");
const WebSocket = require("ws");
const { v4: uuidv4 } = require("uuid");

const PORT = process.env.PORT || 5000;
// ***************************************************** WebSocket
const wss = new WebSocket.Server({ server: server });
let conn = { AI: null, clients: [] };

wss.on("connection", (ws) => {
  console.log("Client connected");

  ws.on("message", (msg) => {
    let parsedMsg = null;
    try {
      parsedMsg = JSON.parse(msg.toString());
    } catch (error) {
      console.log("Failed to parse message:", error);
      return;
    }

    if (parsedMsg) {
      console.log("Received message of type:", parsedMsg.type);

      switch (parsedMsg.type) {
        case "client":
          if (!conn.clients.includes(ws)) conn.clients.push(ws);
          conn.clients.forEach((c) => {
            if (ws != c) {
              c.send(JSON.stringify({ message: parsedMsg.message }));
            }
          });
          break;
        case "AI":
          // Register the AI client
          clients.AI = ws;
          break;
        case "user":
          // User message that needs to be processed by AI
          if (conn.AI) {
            conn.AI.send(JSON.stringify(parsedMsg));
          }
          break;
        default:
          console.log("Unhandled message type:", parsedMsg.type);
      }
    }
  });

  ws.on("close", () => {
    console.log("Client disconnected");
    if (ws === conn.AI) {
      console.log("AI client disconnected");
      clients.AI = null;
    } else {
      let index = conn.clients.indexOf(ws);
      if (index !== -1) {
        conn.clients.splice(index, 1);
      }
    }
  });
});

// ********************************************* app/http
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
