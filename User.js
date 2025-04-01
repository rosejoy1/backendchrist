const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: String,
  houseName: String,
  place: String,
  parish: String,
  email: String,
  phone: String,
  dob: Date,
  experience: Number,
  accommodation: String,
  homeLocation:String,
  gender: String,
  category: String,
  spouseName: String,
  spousePhone: String,
  numChildren: { type: Number, default: 0 },
  children: [
      {
          name: String,
          age: Number,
          gender: String,
      },
  ],
});

const User = mongoose.model('User', userSchema);

module.exports = User;
