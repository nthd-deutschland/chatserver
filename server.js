const WebSocket = require("ws");

const PORT = process.env.PORT || 8080;

const server = new WebSocket.Server({ port: PORT });

const rooms = new Map();

console.log("Server läuft auf Port " + PORT);

server.on("connection", (socket) => {

    console.log("Client verbunden");

    socket.on("message", (message) => {

        let data;

        try{
            data = JSON.parse(message.toString());
        }catch{
            return;
        }

        // Benutzer tritt einem Raum bei
        if(data.type === "join"){

            socket.room = data.room;

            if(!rooms.has(data.room)){
                rooms.set(data.room,new Set());
            }

            rooms.get(data.room).add(socket);

            console.log("Beitritt zu Raum:",data.room);

            return;
        }

        // Chatnachricht
        if(data.type === "message"){

            if(!socket.room) return;

            const clients = rooms.get(socket.room);

            if(!clients) return;

            clients.forEach(client=>{

                if(client.readyState===WebSocket.OPEN){

                    client.send(JSON.stringify({

                        type:"message",

                        sender:data.sender,

                        text:data.text

                    }));

                }

            });

        }

    });

    socket.on("close",()=>{

        if(socket.room && rooms.has(socket.room)){

            rooms.get(socket.room).delete(socket);

            if(rooms.get(socket.room).size===0){

                rooms.delete(socket.room);

            }

        }

        console.log("Client getrennt");

    });

});
