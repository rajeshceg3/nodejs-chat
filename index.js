const express = require('express')
const socketio = require('socket.io')
const passport = require('passport')
const session = require('express-session')
const bcrypt = require('bcryptjs')
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken')
const path = require('path')
const jwtSecret = 'jwt-secret-code';
const PORT = 3000

const app = express()
app.use(bodyParser.urlencoded({extended:false}))
app.use(session({ 
  secret : 'secret-key',
  resave : false,
  saveUninitialized : false
}))

app.use(passport.initialize())
app.use(passport.session())

// Set up a temporary store for user data
// Later we'll hook it up to db
const users = new Map();


// Initialize the server
const server = app.listen(PORT, ()=>{
  console.log(`Server listening on ${PORT}`)
})

// Collect username and password and validate it
app.get('/login', (req, res) => {
  res.send(`
    <h1>Super Fast chat </h1>
    <form action="/loginAPI" method="post">
      <input type="text" name="username" placeholder="Username" required />
      <input type="password" name="password" placeholder="Password" required />
      <button type="submit">Login</button>
    </form>
  `);
});

// Provide a form for user registration 
app.get('/register', (req, res) => {
  res.send(`
    <h1>Super Fast chat </h1>
    <form action="/registerAPI" method="post">
      <input type="text" name="username" placeholder="Username" required />
      <input type="password" name="password" placeholder="Password" required />
      <button type="submit">Create Account</button>
    </form>
  `);
});

// Initialize socket io
const io = socketio(server);

// Server listens for the clients to connect using connection event
io.on('connection', ( clientSocket)=>{
  // Once a client connects, its info will be available in the socket
  passport.authenticate('jwt',{ session: false}, ( err, user)=>{
    if ( err || !user ){
      clientSocket.emit('error', "User not authenticated");
      return;
    }

    console.log(`${user.username} is authenticated and logged in`);
    
  // Received a messaged from connected client
  clientSocket.on('message',(message)=>{
    console.log(`Message received from ${user.username} is ${message}`)
  })

  // Send a broadcast to others
  clientSocket.broadcast.emit('message', {
    user : user.username,
    message: message
  })

  clientSocket.on('disconnect',()=>{
    console.log(`${user.username} is now disconnected`);
  })
  })
})

app.post('/registerAPI',(req,res)=>{

  const username = req.body.username;
  const password = req.body.password;

  if(users.has(username)){
    res.status(409).send("Provided username is already taken");
    return;
  }

  bcrypt.hash(password, 10, ( err, hash)=>{
    if( err ){
      res.status(500).send("Issue with hashing the password");
      return;
    }

    users.set(username, {
      username: username,
      password: hash
    });

    res.send("User Registration is Successful");

  })
})

function getUserDetails(username){
  return users.get(username);
}

function credentialsvalid(username, password,res){
  if ( !users.has(username)){
    res.status(401).send(`User ${username} is not registered`);
    return;
  }

  // Get the stored details, in prod it will be read from db 
  const userdetails = getUserDetails(username);
  return bcrypt.compareSync(password, userdetails.password);
}


app.post('/loginAPI',(req,res)=>{
  if(!credentialsvalid(req.body.username, req.body.password,res)){
    res.json({
      success: false,
      message : " Incorrect credentials"
    })
  }
  else{
    const token = jwt.sign({username:getUserDetails(req.body.username).username}, jwtSecret);
    res.json({
      success: true,
      token : token
    }); 
  }
  })
