const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Room = require('./models/Room');
const User = require('./models/User');
const Post = require('./models/Post'); // <--- CRITICAL IMPORT
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' })); 

const JWT_SECRET = "yzu_secret_key_123"; 
const MONGO_URI = "mongodb+srv://rykhant67:Y1m2a3k4@ryanbase.8x378to.mongodb.net/yzu-housing?appName=RyanBase";

const ADMINS = ["rykhant67", "admin", "ryan", "jikan"]; 

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected to RyanBase'))
  .catch(err => console.error('❌ Connection Error:', err));

// --- ROUTES ---

// 1. Get Rooms
app.get('/api/rooms', async (req, res) => {
  try {
    const rooms = await Room.find().sort({ _id: -1 }); 
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch rooms" });
  }
});

// 2. CREATE ROOM
app.post('/api/rooms', async (req, res) => {
  try {
    const newRoom = await Room.create(req.body);
    res.json({ message: "Room published!", room: newRoom });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. DELETE ROOM
app.delete('/api/rooms/:id', async (req, res) => {
  try {
    await Room.findByIdAndDelete(req.params.id);
    res.json({ message: "Room deleted successfully!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. UPDATE USER PROFILE
app.put('/api/users/:id', async (req, res) => {
  try {
    const { avatar } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { avatar }, { new: true });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Failed to update profile" });
  }
});

// 5. Register
app.post('/api/register', async (req, res) => {
  const { username, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const user = await User.create({ username, email, password: hashedPassword });
    res.json({ message: "User created successfully!" });
  } catch (e) {
    res.status(400).json({ error: "Email already exists" });
  }
});

// 6. Login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ error: "User not found" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ error: "Wrong password" });

  const token = jwt.sign({ id: user._id }, JWT_SECRET);
  const isAdmin = ADMINS.includes(user.username);
  
  res.json({ 
    token, 
    user: { 
      id: user._id, 
      username: user.username, 
      email: user.email,
      avatar: user.avatar,
      bookmarks: user.bookmarks,
      isAdmin: isAdmin
    } 
  });
});

// 7. Bookmark
app.post('/api/bookmark', async (req, res) => {
  const { userId, roomId } = req.body;
  const user = await User.findById(userId);
  if (user.bookmarks.includes(roomId)) {
    user.bookmarks = user.bookmarks.filter(id => id.toString() !== roomId);
  } else {
    user.bookmarks.push(roomId);
  }
  await user.save();
  res.json(user.bookmarks);
});

// 8. Seed
app.post('/api/seed', async (req, res) => {
  try {
    await Room.deleteMany({});
    res.json({ message: "Database Reset!" });
  } catch (error) {
    res.status(500).json({ error: "Seed failed" });
  }
});

// --- 💬 COMMUNITY CHAT ROUTES ---

// Get Posts
app.get('/api/posts', async (req, res) => {
  try {
    const posts = await Post.find().sort({ date: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: "Failed to get posts" });
  }
});

// Create Post
app.post('/api/posts', async (req, res) => {
  try {
    const newPost = await Post.create(req.body);
    res.json(newPost);
  } catch (err) {
    res.status(500).json({ error: "Failed to post" });
  }
});

// Delete Post
app.delete('/api/posts/:id', async (req, res) => {
  try {
    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: "Post deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete" });
  }
});

// Like Post
app.put('/api/posts/:id/like', async (req, res) => {
  const { userId } = req.body;
  try {
    const post = await Post.findById(req.params.id);
    if (post.likes.includes(userId)) {
      post.likes = post.likes.filter(id => id !== userId);
    } else {
      post.likes.push(userId);
    }
    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: "Failed to like" });
  }
});

// Reply
app.post('/api/posts/:id/reply', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    post.replies.push(req.body);
    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: "Failed to reply" });
  }
});

// Delete Reply
app.delete('/api/posts/:id/reply/:replyId', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    post.replies = post.replies.filter(r => r._id.toString() !== req.params.replyId);
    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: "Failed to delete reply" });
  }
});

app.listen(5000, () => console.log('🚀 Server running on port 5000'));