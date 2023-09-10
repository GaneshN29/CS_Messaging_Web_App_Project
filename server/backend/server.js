const mongoose = require("mongoose");
const express = require('express');
const models = require('./models');
const app = express();

app.use(express.json());
const cors = require('cors');
const ConnectDB = require("./db");
app.use(cors());
require('dotenv').config();
const app_url = process.env.APP_URL;
const port = process.env.SERVER_PORT;
ConnectDB();
const { LoginModel, canned_Message, Query, Message } = models;

//Fetching all canned Message
app.get('/cannedMessage', async (req, res) => {
  try {
   
    const queries = await canned_Message.find({});

    res.status(200).json(queries);
  } catch (error) {
    console.error('Error fetching queries:', error);
    res.status(500).json({ message: 'Error fetching queries' });
  }
});


//register customer
app.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    const existingUser = await LoginModel.findOne({ username });

    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    const newUser = new LoginModel({
     username: username,
      password: password,
      entity:"customer",
    });

    await newUser.save();
    res.status(201).json({ message: 'Registration successful' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


//Login Checking
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    LoginModel.findOne({ username: username, password: password }).then((user) => {
      if (user) {
        res.status(200).json({ entity: user.entity,id:user._id });
      } else {
        res.status(401).json({ message: 'Invalid credentials' });
      }
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

//Query Adding to Database
app.post('/query', async (req, res) => {

  try {
    const { username, query,createTimeStamp,id } = req.body;
    const newQuery = new Query({
      userId: id,
      query: query,
      username: username,
      agentname: "",
      createtimestamp: createTimeStamp,
      closetimestamp: new Date(0),
      Status: "created",
    });
    await newQuery.save();
    io.emit('dataUpdate', { newData: 'Your new data here' });
    res.status(200).json({ message: 'Query added successfully' });
  
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

//Getting all the query related to a customer
app.get('/querylist/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const queries = await Query.find({ userId: userId });

    res.status(200).json(queries);
  } catch (error) {
    console.error('Error fetching queries:', error);
    res.status(500).json({ message: 'Error fetching queries' });
  }
});

//Searching Query
app.get('/search', async (req, res) => {
  const queryKeyword = req.query.queryText;
  const customerName = req.query.customerName;
  const status = req.query.status; 
  try {
    let query = {};

    if (queryKeyword) {
      query.query = { $regex: queryKeyword, $options: 'i' };
    }

    if (customerName) {
      query.username = { $regex: customerName, $options: 'i' }; 
    }
    if (status && status !== 'all') {
      query.Status = status; 
    }

    if (!queryKeyword && !customerName && (!status || status === 'all')) {
      const allQueries = await Query.find({});
      return res.json(allQueries);
    }

    const searchResults = await Query.find(query);
    return res.json(searchResults);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});


//Updating the query as per Agent need(closing or opening)
app.post('/updateQuery', async (req, res) => {
  const { queryId, agentName, status } = req.body;
  let closedtimestamp=new Date(0);
  if(status==='closed'){
   closedtimestamp=new Date().toISOString();}
  
  try {
    const updatedQuery = await Query.findByIdAndUpdate(
      queryId,
      { agentname: agentName, Status: status,closetimestamp: closedtimestamp },
      { new: true }
    );

    if (!updatedQuery) {
      return res.status(404).json({ error: 'Query not found' });
    }
    io.emit('dataUpdate', { newData: 'Your new data here' });
    res.json({ message: 'Query updated successfully' });
  } catch (err) {
    console.error('Error updating query:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

//Creating a message prompt
app.post('/addMessage', async (req, res) => {
  try {
    const { queryId } = req.body;
    const existingMessage = await Message.findOne({ queryId: queryId });

    if (!existingMessage) {
      const newMessage = new Message({
        queryId: queryId,
        messages: [],
        closed:false,
      });
      await newMessage.save();
    }
    return res.json({ message: 'Message added successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

//Fetch all message
app.get('/messages', async (req, res) => {
  const queryId = req.query.queryId;

  if (!queryId) {
    return res.status(400).json({ error: 'Missing queryId parameter' });
  }

  try {
    const queryMessages = await Message.findOne({ queryId });
    res.json(queryMessages.messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
  
//Sending Message
app.post('/messageSend', async (req, res) => {
  const { queryId, username, message } = req.body;

  try {
    const updatedQuery = await Message.updateOne(
      { queryId: queryId },
      { $push: { messages: { username: username, message: message } } }
    );

    if (updatedQuery.nModified === 0) {
      return res.status(404).json({ error: 'Query not found' });
    }
    res.json({ message: 'Query updated successfully' });
  } catch (err) {
    console.error('Error updating query:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});


//WebSocket 
const io = require('socket.io')(server,{
  pingTimeout:600000,
  cors:{
    origin: app_url,
  }
});

//connecting and joining room
io.on("connection",(socket)=>{
  socket.on('setup',(userData)=>{
socket.join(userData._id);
socket.emit('connected');
  });

  socket.on("newMessage",(newMessage)=>{
    var chat = newMessage;
    if(chat){
      socket.in(chat.queryId).emit("message recieved",chat);
    }
  });
})


