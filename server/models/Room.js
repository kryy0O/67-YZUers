const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  user: String,
  rating: Number,
  comment: String,
  date: { type: Date, default: Date.now }
});

const RoomSchema = new mongoose.Schema({
  title: String,
  price: Number,
  location: String,
  distance: Number,
  rating: Number,
  image: String,
  tags: [String],
  coords: {
    top: String,
    left: String
  },
  landlord: {
    name: String,
    phone: String
  },
  amenities: [String],
  reviews: [ReviewSchema],
  deposit: Number // New field for Deposit (Months)
});

module.exports = mongoose.model('Room', RoomSchema);