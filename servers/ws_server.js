const WebSocket = require("ws");
let wss;

function setup(params) {
  wss = new WebSocket.Server({ server: params });

  let clients = { AI: null, clients: [] };

  // Handle WebSocket connections
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
    });

    // Handle disconnections
    ws.on("close", () => {
      console.log("Client disconnected");
      clients.clients.splice(clients.clients.indexOf(ws), 1);
    });
  });

  return wss;
}

module.exports = { setup };
