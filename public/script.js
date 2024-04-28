// Establish WebSocket connection
let socket = new WebSocket("wss://localhost:5000");

// Handle connection establishment
socket.onopen = () => {
  console.log("Connected to the server");
  // Send a message to the server upon connection
  socket.send(JSON.stringify({ message: "Hello Server !", type: "client" }));
};

// Handle incoming messages from the server
socket.onmessage = (event) => {
  const outputDiv = document.getElementById("output");
  outputDiv.innerHTML += `<p>${event.data}</p>`;
};

// Handle disconnection
socket.onclose = () => {
  console.log("Disconnected from the server");
};

// Handle errors
socket.onerror = (error) => {
  console.log("Error occurred while establishing connection:", error);
};

$("h1").html("next step");
console.log($("h1"));
