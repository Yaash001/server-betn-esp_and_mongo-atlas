// ----------------------------
// Import modules
// ----------------------------
const express = require("express");
const mongoose = require("mongoose");
const SunCalc = require("suncalc");
const axios = require("axios");

const app = express();
app.use(express.json());

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
  recordedAt: Date
});

const Sun = mongoose.model("datas", SunSchema);

// ----------------------------
// Helper Functions
// ----------------------------
function roundToTwo(num) {
  return Number(parseFloat(num).toFixed(2));
}

async function getLocationFromIP() {
  const response = await axios.get("http://ip-api.com/json");
  return {
    lat: response.data.lat,
    lon: response.data.lon
  };
}

// ----------------------------
// API Endpoint
// ----------------------------// ----------------------------
// API Endpoint
// ----------------------------
app.post("/sun", async (req, res) => {
  try {
    // Ensure data is an array for uniform processing
    const records = Array.isArray(req.body) ? req.body : [req.body];

    // Get dynamic latitude & longitude once (for efficiency)
    const { lat, lon } = await getLocationFromIP();

    const savedRecords = [];
    const ignoredRecords = [];

    for (let record of records) {
      // Convert epoch to Date
      const recordedDate = new Date(record.timestamp * 1000);

      // Round values
      const az = roundToTwo(record.azimuth);
      const el = roundToTwo(record.elevation);

      // Only store if sun is above horizon
      if (el > 0) {
        const data = new Sun({
          azimuth: az,
          elevation: el,
          recordedAt: recordedDate
        });

        await data.save();
        savedRecords.push({ azimuth: az, elevation: el, recordedAt: recordedDate });
      } else {
        ignoredRecords.push({ azimuth: az, elevation: el, recordedAt: recordedDate });
      }
    }

    console.log("☀ Daylight Data Saved:", savedRecords);
    if (ignoredRecords.length > 0) console.log("🌙 Night data ignored:", ignoredRecords);

    res.send({
      saved: savedRecords.length,
      ignored: ignoredRecords.length,
      savedRecords,
      ignoredRecords
    });

  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});
// ----------------------------
// Start Server
// ----------------------------
app.listen(3000, () => {
  console.log("🚀 Server running on http://localhost:3000");
});