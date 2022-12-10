const express = require('express')
const socketio = require('socket.io')
const passport = require('passport')
const session = require('express-session')
const bcrypt = require('bcryptjs')
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken')
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
app.get('/', (req, res) => {
  res.send(`
    <h1>Super Fast chat </h1>
    <form action="/login" method="post">
      <input type="text" name="username" placeholder="Username" required />
      <input type="password" name="password" placeholder="Password" required />
      <button type="submit">Login</button>
    </form>
  `);
});

// Initialize socket io
const io = socketio(server);


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

app.post('/register',(req,res)=>{

  const username = req.body.username;
  const password = req.body.password;

  if(users.has(username)){
    res.status(409).send("Provided username is not available");
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

app.post('login',(req,res)=>{
  const username = req.body.username;
  const password = req.body.password;

  if ( !users.has(username)){
    res.status(401).send(`User ${username} is not registered`);
    return;
  }

  const userdetails = getUserDetails(username);
  const passwordValid = bcrypt.compareSync(password, userdetails.password);

  if(!passwordValid){
    res.json({
      success: false,
      message : " Incorrect credentials"
    })
  }
  else{
    const token = jwt.sign({username:userdetails.username}, jwtSecret);
    req.session.token = token;
    res.json({
      success: true,
      token : token
    })
  }

  })
