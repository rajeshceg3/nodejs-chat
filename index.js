const express = require('express')
const socketio = require('socket.io')
const PORT = 3000

const app = express()
const server = app.listen(PORT, ()=>{
  console.log(`Server listening on ${PORT}`)
})

const io = socketio(server)
io.on('connection', ( socket)=>{

  // Received a messaged from connected client
  socket.on('message',(message)=>{
    console.log(`Message received from client is ${message}`)
  })

  // Send a broadcast to others
  socket.broadcast.emit('message', message)

  socket.on('disconnect',()=>{
    console.log("Client disconnected")
  })
})