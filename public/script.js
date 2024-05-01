// Establish WebSocket connection
let socket = new WebSocket("ws://localhost:5000");

// Handle connection establishment
socket.onopen = () => {
  console.log("Connected to the server");
  socket.send(JSON.stringify({ message: "", type: "client" }));
};

// Send message function
function sendMessage() {
  const input = document.getElementById("messageInput");
  if (input.value.trim() !== "") {
    socket.send(JSON.stringify({ message: input.value, type: "client" }));
    const outputDiv = document.getElementById("output");
    outputDiv.innerHTML += `<p style="color:green;">${input.value}</p>`;
    input.value = ""; // Clear input after sending
  }
}

// Send message on button click
document.getElementById("sendButton").addEventListener("click", sendMessage);

// Send message on enter key press
document
  .getElementById("messageInput")
  .addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      sendMessage();
    }
  });

// Handle incoming messages from the server
socket.onmessage = (event) => {
  const outputDiv = document.getElementById("output");
  const messageData = JSON.parse(event.data);
  outputDiv.innerHTML += `<p style="color:blue;">${messageData.message}</p>`; // Assuming server sends JSON with a message field
};

// Handle disconnection
socket.onclose = () => {
  console.log("Disconnected from the server");
};

// Handle errors
socket.onerror = (error) => {
  console.log("Error occurred:", error);
};

// jQuery example (this can be removed if not needed)
$("h1").html("Upcycle Pioneers Chat");
console.log($("h1"));
