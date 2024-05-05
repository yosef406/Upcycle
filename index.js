const server = require("http").createServer();
const express = require("express");
const WebSocket = require("ws");
const { v4: uuidv4 } = require("uuid");
import OpenAI from "openai";

const PORT = process.env.PORT || 5000;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
// ***************************************************** open ai
const openai = new OpenAI();

async function openAiVision(params) {
  const response = await openai.chat.completions.create({
    model: "gpt-4-turbo",
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: "What’s in this image?" },
          {
            type: "image_url",
            image_url: {
              url: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Gfp-wisconsin-madison-the-nature-boardwalk.jpg/2560px-Gfp-wisconsin-madison-the-nature-boardwalk.jpg",
            },
          },
        ],
      },
    ],
  });
  console.log(response.choices[0]);
}
async function openAiImages(params) {
  const image = await openai.images.generate({
    model: "dall-e-3",
    prompt: "A cute baby sea otter",
  });

  console.log(image.data);
}

// ***************************************************** WebSocket
const wss = new WebSocket.Server({ server: server });
let conn = { AI: null, clientsID: {}, clientsWs: {} };

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
          handleClient(ws, parsedMsg);
          break;
        case "AI":
          handleAI(ws, parsedMsg);
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
      conn.AI = null;
    } else {
      let id = conn.clientsWs[ws];
      if (id) {
        delete conn.clientsID[id];
        delete conn.clientsWs[ws];
      }
    }
  });
});

function handleClient(ws, parsedMsg) {
  if (parsedMsg.request == "AI" && conn.AI.readyState === WebSocket.OPEN) {
    // send the id of the requester
    let requester = conn.clientsWs[ws];
    conn.AI.send(JSON.stringify({ ...parsedMsg, requester }));
  } else if (parsedMsg.request == "open") {
    let id = uuidv4();
    conn.clientsID[id] = ws;
    conn.clientsWs[ws] = id;
  } else {
    for (const c in conn.clientsID) {
      if (ws != c) {
        c.send(JSON.stringify({ message: parsedMsg.message }));
      }
    }
  }
}

function handleAI(ws, parsedMsg) {
  // Register the AI client
  if (parsedMsg.request == "open") {
    conn.AI = ws;
  } else {
    let requester = conn.clientsID[parsedMsg.requester];
    requester.send(JSON.stringify({ message: parsedMsg.message }));
  }
}

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
