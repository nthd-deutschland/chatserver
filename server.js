const WebSocket = require("ws");

const PORT = process.env.PORT || 8080;

const server = new WebSocket.Server({ port: PORT });

const rooms = new Map();

console.log("✅ Server läuft auf Port " + PORT);


server.on("connection", (socket) => {


    console.log("🔗 Neuer Client verbunden");


    socket.on("message", (message) => {


        let data;


        try {

            data = JSON.parse(message.toString());

        } catch (err) {

            console.log("❌ Ungültige Nachricht:", message.toString());

            return;

        }



        // Raum beitreten

        if (data.type === "join") {


            socket.room = data.room;


            if (!rooms.has(data.room)) {

                rooms.set(data.room, new Set());

            }


            rooms.get(data.room).add(socket);


            console.log("🚪 Beitritt zu Raum:", data.room);

            console.log("👥 Clients im Raum:", rooms.get(data.room).size);


            return;

        }




        // Normale Chat Nachricht

        if (data.type === "message") {


            console.log("💬 Nachricht erhalten:", data);



            if (!socket.room) {

                console.log("❌ Client ist keinem Raum beigetreten.");

                return;

            }


            const clients = rooms.get(socket.room);


            if (!clients) {

                console.log("❌ Raum existiert nicht:", socket.room);

                return;

            }



            console.log("📤 Sende an", clients.size, "Clients");



            clients.forEach(client => {


                if (client.readyState === WebSocket.OPEN) {


                    client.send(JSON.stringify({

                        type: "message",

                        sender: data.sender,

                        text: data.text

                    }));


                }


            });


        }





        // Benutzer tippt gerade

        if (data.type === "typing") {


            if (!socket.room) {

                return;

            }



            const clients = rooms.get(socket.room);



            if (!clients) {

                return;

            }



            clients.forEach(client => {


                if (client.readyState === WebSocket.OPEN) {


                    client.send(JSON.stringify({

                        type: "typing",

                        sender: data.sender,

                        status: data.status

                    }));


                }


            });


        }



    });





    socket.on("close", () => {



        if (socket.room && rooms.has(socket.room)) {



            rooms.get(socket.room).delete(socket);



            console.log("❌ Client verlassen:", socket.room);




            if (rooms.get(socket.room).size === 0) {


                rooms.delete(socket.room);


                console.log("🗑️ Raum gelöscht:", socket.room);


            }


        }



    });



});
