const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const xlsx = require("xlsx");
const QRCode = require("qrcode");
const User = require("./User");

const app = express();

dotenv.config();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors({ origin: "*" }));

// **Connect to MongoDB**
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));

// **Form Submission Route**
app.post("/submit-form", async (req, res) => {
  try {
    console.log(req.body);

    const {
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
      homeLocation,
      spousePhone,
      numChildren,
      children,
      paymentOption,
    } = req.body;

    const paymentStatus = paymentOption === "Pay Now" ? "Yes" : "No";

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
      children,
      paymentStatus,
    });

    await newUser.save();

    let qrCodeDataURL = null;
    if (paymentOption === "Pay Now") {
      const upiId = "jesusyouthmananthavasy@okhdfcbank";
      const upiString = `upi://pay?pa=${upiId}&pn=${fullName}&cu=INR`;
      qrCodeDataURL = await QRCode.toDataURL(upiString);
    }

    res.status(201).json({
      message: "Form submitted successfully!",
      paymentStatus,
      qrCode: qrCodeDataURL,
    });
  } catch (error) {
    console.error("Error submitting form:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

// **Get All Registered Users**
app.get("/registered-users", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).send("Error fetching users");
  }
});

// **Get User by ID**
app.get("/user/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).send("User not found");
    res.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).send("Error fetching user");
  }
});



// **Update Payment Status**
app.post("/update-payment-status", async (req, res) => {
  const { email, paymentStatus } = req.body;
  
  if (!email) {
      return res.status(400).json({ message: "Email is required" });
  }

  try {
      // Assuming you're using MongoDB with Mongoose
      const user = await User.findOneAndUpdate(
          { email },
          { paymentStatus },
          { new: true }
      );

      if (!user) {
          return res.status(404).json({ message: "User not found" });
      }

      res.json({ message: "Payment status updated successfully", user });
  } catch (error) {
      res.status(500).json({ message: "Server error", error });
  }
});

// **Export Data to Excel**
app.get("/export-excel", async (req, res) => {
  try {
    const users = await User.find();

    if (!users || users.length === 0) {
      return res.status(404).json({ message: "No users found" });
    }

    const data = users.map((user) => ({
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
      PaymentStatus: user.paymentStatus || "No", // ✅ Include payment status in export
      ChildrenDetails:
        user.children && user.children.length > 0
          ? user.children
              .map((child) => `${child.name} (${child.age} years, ${child.gender})`)
              .join(", ")
          : "N/A",
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

// **Start Server**
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running at ${process.env.PORT ? `https://backendchrist.onrender.com` : `http://localhost:${PORT}`}`);
});