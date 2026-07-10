const WebSocket = require("ws");

const PORT = process.env.PORT || 8080;

const server = new WebSocket.Server({ port: PORT });

console.log("Server läuft auf Port " + PORT);

server.on("connection", (socket) => {
    console.log("Client verbunden");

    socket.on("message", (message) => {
        server.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message.toString());
            }
        });
    });

    socket.on("close", () => {
        console.log("Client getrennt");
    });
});