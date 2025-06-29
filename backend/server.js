const express = require("express");
const connectDB = require("./config/db");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/teachers", require("./routes/teacherRoutes"));    // GET, POST for teachers
app.use("/api/rooms", require("./routes/roomRoutes"));          // GET, POST for rooms
app.use("/api/subjects", require("./routes/subjectRoutes"));    // GET, POST for subjects
app.use("/api/assignments", require("./routes/assignments"));   // Assign teachers to subjects
const timetableRoutes = require("./routes/timetableRoutes");
app.use("/api/timetable", timetableRoutes);
// Default route (optional)
app.get("/", (req, res) => {
  res.send("API is running...");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
