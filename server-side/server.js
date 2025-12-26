require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");

const User = require("./models/User");
const authRoutes = require("./routes/auth");
const accessRequestRoutes = require("./routes/accessRequest");
const userRoutes = require("./routes/users");
const videoRoutes = require("./routes/videos");

const app = express();

/* ✅ MIDDLEWARES — MUST COME FIRST */
app.use(cors());
app.use(express.json());

/* ✅ ROUTES */
app.use("/auth", authRoutes);
app.use("/api/access", accessRequestRoutes);
app.use("/api/users", userRoutes);
app.use("/api/videos", videoRoutes);

/* ✅ DATABASE CONNECTION */
const MONGO_URL = "mongodb://127.0.0.1:27017/pulsegen";

mongoose.connect(MONGO_URL)
  .then(async () => {
    console.log("✅ MongoDB connected successfully");

    // ✅ CREATE DEFAULT ADMIN AFTER DB CONNECTS
    const adminExists = await User.findOne({ username: "ADMIN" });

    if (!adminExists) {
      const hashedPassword = await bcrypt.hash("admin", 10);

      await User.create({
        username: "ADMIN",
        email: "classmonitor.bot@gmail.com",
        password: hashedPassword,
        role: "admin"
      });

      console.log("✅ Default ADMIN user created");
    } else {
      // ✅ UPDATE EXISTING ADMIN EMAIL IF NOT SET
      if (!adminExists.email) {
        await User.updateOne(
          { username: "ADMIN" },
          { email: "classmonitor.bot@gmail.com" }
        );
        console.log("✅ Default ADMIN email updated");
      }
    }
  })
  .catch((error) => {
    console.error("❌ MongoDB connection failed:", error.message);
  });

/* ✅ TEST ROUTE */
app.get("/", (req, res) => {
  res.send("Server is running");
});

/* ✅ START SERVER */
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
