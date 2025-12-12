const mongoose = require('mongoose');

const ReplySchema = new mongoose.Schema({
  userId: String,
  username: String,
  avatar: String,
  text: String,
  date: { type: Date, default: Date.now }
});

const PostSchema = new mongoose.Schema({
  userId: String,
  username: String,
  avatar: String,
  text: String,
  likes: [String], // Array of user IDs who liked
  replies: [ReplySchema],
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Post', PostSchema);