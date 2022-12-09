const express = require('express')
const socketio = require('socket.io')
const passport = require('passport')
const session = require('express-session')
const PORT = 3000

const app = express()
app.use(session({ secret : 'secret-key'}))
app.use(passport.initialize())
app.use(passport.session())

const server = app.listen(PORT, ()=>{
  console.log(`Server listening on ${PORT}`)
})

const io = socketio(server)
io.on('connection', ( socket)=>{
  passport.authenticate('jwt',{ session: false}, ( err, user)=>{
    if ( err || !user ){
      socket.emit('error', "User not authenticated");
      return;
    }

    console.log(`${user.username} is authenticated and logged in`);
    
  // Received a messaged from connected client
  socket.on('message',(message)=>{
    console.log(`Message received from ${user.username} is ${message}`)
  })

  // Send a broadcast to others
  socket.broadcast.emit('message', {
    user : user.username,
    message: message
  })

  socket.on('disconnect',()=>{
    console.log(`${user.username} is now disconnected`);
  })
  })
})