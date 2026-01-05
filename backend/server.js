const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json()); // This fixes the "undefined" error!

// Connection DB
connectDB();

// Test route
app.get("/", (req, res) => {
  res.send("API E-learning ready!");
});

// --- Routes ---
app.use("/enseignant", require("./routes/enseignantRoutes"));
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/cours", require("./routes/coursRoutes"));

// This one line handles ALL quiz logic (POST, GET, etc.)
// The URL will be: http://localhost:5000/api/quiz
app.use("/api/quizzes", require("./routes/quizRoutes"));

// Start the server
app.listen(5000, () => console.log("Server running on port 5000"));