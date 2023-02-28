const express = require('express');
const { Server } = require("socket.io");
const PORT = 8050;
const app = express();
const server = app.listen(PORT, () => console.log(`app listening on port ${PORT}!`));
const io = new Server(server);
var data = [];
io.on("connection", (socket) => {
    console.log(`${socket.id} Connected`)
    socket.emit('hello','hello');
    socket.on('error',(res)=>{
        data.push(res)
        console.log(res)
    })
    socket.on('geterror',()=>socket.emit('geterror',data))
    socket.on('disconnect', () => {
        console.log(`${socket.id} Disconnected`);
    });

});
