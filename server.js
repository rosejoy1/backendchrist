const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const xlsx = require('xlsx');
const User = require('./User');  // Ensure path to User model is correct

const app = express();

dotenv.config(); // Load environment variables from .env file

// Middleware to parse form data
app.use(express.urlencoded({ extended: true }));  // For form submissions
app.use(express.json()); // For handling JSON requests

// Enable CORS for all origins (you can replace "*" with specific origins for security)
app.use(cors());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    console.log("MongoDB connected successfully");
})
.catch((err) => {
    console.error("MongoDB connection error:", err);
});
app.post('/submit-form', async (req, res) => {
  try {
    console.log(req.body);  // Log the request body to debug

    const { 
      fullName, email, phone, houseName, place, parish, dob, experience, 
      accommodation, gender, category, spouseName, homeLocation,spousePhone, numChildren, children 
    } = req.body;

    // Create new user document
    const newUser = new User({
      fullName,
      email,
      phone,
      houseName,
      place,
      parish,
      dob,
      experience,
      accommodation,
      gender,
      category,
      spouseName,
      spousePhone,
      homeLocation,
      numChildren,
      children
    });

    // Save to database
    await newUser.save();
    res.status(201).json({ message: "Form submitted successfully!" });

  } catch (error) {
    console.error("Error submitting form:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

// GET route to fetch all users
app.get('/registered-users', async (req, res) => {
  try {
    const users = await User.find();  // Fetch all users from the database
    res.json(users);  // Send users data as JSON response
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).send('Error fetching users');
  }
});

// Route to fetch a specific user by ID (for example)
app.get('/user/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id);  // Fetch user by ID
    if (!user) {
      return res.status(404).send('User not found');
    }
    res.json(user);  // Send user data as JSON response
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).send('Error fetching user');
  }
});

app.get('/export-excel', async (req, res) => {
  try {
    const users = await User.find();

    if (!users || users.length === 0) {
      return res.status(404).json({ message: "No users found" });
    }

    const data = users.map(user => ({
      ID: user._id.toString(),
      FullName: user.fullName || "N/A",
      HouseName: user.houseName || "N/A",
      Place: user.place || "N/A",
      Parish: user.parish || "N/A",
      Email: user.email || "N/A",
      Phone: user.phone || "N/A",
      DateOfBirth: user.dob ? new Date(user.dob).toLocaleDateString() : "N/A",
      Experience: user.experience || "N/A",
      Accommodation: user.accommodation || "N/A",
      Gender: user.gender || "N/A",
      Category: user.category || "N/A",
      SpouseName: user.spouseName || "N/A",
      SpousePhone: user.spousePhone || "N/A",
      NumberOfChildren: user.numChildren || 0,
      ChildrenDetails: user.children && user.children.length > 0 
        ? user.children.map(child => `${child.name} (${child.age} years, ${child.gender})`).join(", ") 
        : "N/A"
    }));

    const ws = xlsx.utils.json_to_sheet(data);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, "Users");

    const buffer = xlsx.write(wb, { bookType: "xlsx", type: "buffer" });

    res.setHeader("Content-Disposition", "attachment; filename=registered_users.xlsx");
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    
    res.send(buffer);
  } catch (error) {
    console.error("Error exporting data:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});



// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
