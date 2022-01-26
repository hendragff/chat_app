const path = require('path');
const express = require('express');
const http = require('http');
const socketio = require('socket.io')
const formatMessage = require('./utils/messages')
const {userJoin, getCurrUser, userLeave, getRoomUser} = require('./utils/users')
const app = express();
const server = http.createServer(app)
const io = socketio(server)
// static folder
app.use(express.static(path.join(__dirname, 'public')));
const bot = 'HiAdmin!'
// run client connect
io.on('connection', socket =>{
    socket.on('joinRoom', ({username, room}) => {
        const user = userJoin(socket.id, username, room)
        socket.join(user.room);
        // greetings
        socket.emit('message', formatMessage(bot,'Welcome to Hi!'))

        //bc when user connect 
        socket.broadcast.to(user.room).emit('message',formatMessage(bot,`${user.username} has joined the chat!`));
        
        // user and room info
        io.to(user.room).emit('roomUsers',{
            room: user.room,
            users: getRoomUser(user.room)
        })
    })

    // chatMessage listener
    socket.on('chatMessage', msg =>{
        const user = getCurrUser(socket.id)
        io.to(user.room).emit('message', formatMessage(user.username, msg))
    })
    //bc when user disconnect
    socket.on('disconnect', () => {
    const user = userLeave(socket.id)

    if(user){
        io.to(user.room).emit('message',formatMessage(bot,`${user.username} has left the chat!`))
    // user and room info
    io.to(user.room).emit('roomUsers',{
        room: user.room,
        users: getRoomUser(user.room)
    })
    }
   
    }) 
})

const port = 3000 || process.env.port;
server.listen(port, () => console.log(`Server running on port ${port}`));