const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Connection DB
connectDB();

// Test route
app.get("/", (req, res) => {
  res.send("API E-learning ready!");
});

// les  Routes 
app.use("/enseignant", require("./routes/enseignantRoutes"));

app.listen(5000, () => console.log("Server running on port 5000"));
