const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  city: { type: String, required: false },
  gestures: [
    {
      name: String,
      co2Saved: Number,
      date: { type: Date, default: Date.now }
    }
  ]
});

const User = mongoose.model('User', userSchema);

module.exports = User;
