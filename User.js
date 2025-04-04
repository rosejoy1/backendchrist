const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
  fullName: String,
  email: String,
  phone: String,
  houseName: String,
  place: String,
  parish: String,
  dob: Date,
  experience: Number,
  accommodation: String,
  gender: String,
  category: String,
  spouseName: String,
  spousePhone: String,
  numChildren: Number,
  children: [
    {
      name: String,
      age: Number,
      gender: String,
    },
  ],
  paymentStatus: { type: String, default: "No" }, // ✅ Ensure this exists
});

const User = mongoose.model("User", userSchema);

module.exports = User;
