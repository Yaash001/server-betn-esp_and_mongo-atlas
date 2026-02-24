// ----------------------------
// Import modules
// ----------------------------
const express = require("express");
const mongoose = require("mongoose");

const app = express();
app.use(express.json()); // Parse JSON bodies

// ----------------------------
// MongoDB Atlas Connection
// ----------------------------
mongoose.connect(
  "mongodb+srv://Yaash:010978@test.my3cvsb.mongodb.net/sun"
);

mongoose.connection.once("open", () => {
  console.log("✅ MongoDB Connected");
});

mongoose.connection.on("error", (err) => {
  console.error("❌ MongoDB connection error:", err);
});

// ----------------------------
// Schema & Model
// ----------------------------
const SunSchema = new mongoose.Schema({
  azimuth: Number,
  elevation: Number,
  timestamp: Number
});

const Sun = mongoose.model("datas", SunSchema); // Collection name: data

// ----------------------------
// API Endpoint
// ----------------------------
app.post("/sun", async (req, res) => {
  try {
    const data = new Sun(req.body);
    await data.save();
    console.log("☀ Data saved:", req.body);
    res.send("Saved to MongoDB");
  } catch (err) {
    console.error(err);
    res.status(500).send("DB Error");
  }
});

// ----------------------------
// Start Server
// ----------------------------
app.listen(3000, () => {
  console.log("🚀 Server running on http://localhost:3000");
});
