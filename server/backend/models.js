
const mongoose = require('mongoose');

// Define the login schema and model
const loginSchema = new mongoose.Schema({
  username: String,
  password: String,
  entity: String,
});
const LoginModel = mongoose.model('login', loginSchema);

// Define the canned message schema and model
const cannedMessageSchema = new mongoose.Schema({
  message: String,
});
const canned_Message = mongoose.model('cannedMessage', cannedMessageSchema);

// Define the query schema and model
const querySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'login',
  },
  query: String,
  username: {
    type: String,
    ref: 'login',
  },
  agentname: {
    type: String,
    ref: 'login',
  },
  createtimestamp: Date,
  closetimestamp: Date,
  Status: String,
});
const Query = mongoose.model('Query', querySchema);

// Define the message schema and model
const messageSchema = new mongoose.Schema({
  queryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Query',
  },
  messages: [
    {
      username: String,
      message: String,
    },
  ],
});
const Message = mongoose.model('Message', messageSchema);

module.exports = {
  LoginModel,
  canned_Message,
  Query,
  Message,
};
