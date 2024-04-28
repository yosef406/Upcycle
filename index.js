const server = require("http").createServer();
const app = require("./servers/http_server");
const wss = require("./servers/ws_server");
const port = 5000;

wss.setup(server);

server.on("request", app);

server.listen(port, () => {
  console.log(`server is now listening on localhost:${port}`);
});
