require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();

// ==========================================
// 1. MIDDLEWARES (CORS SPÉCIAL TUNNEL)
// ==========================================
app.use(cors({
    origin: '*', // <--- AUTORISE TOUT LE MONDE (Mobile, Tunnel, PC)
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json()); 

// ==========================================
// 2. CONNEXION DB
// ==========================================
connectDB();

// ==========================================
// 3. DOSSIER UPLOADS PUBLIC
// ==========================================
// Permet d'afficher les images de profil sur le téléphone
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ==========================================
// 4. ROUTES
// ==========================================
app.get("/", (req, res) => {
  res.send("API E-learning ready!");
});

app.use("/enseignant", require("./routes/enseignantRoutes"));
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/cours", require("./routes/coursRoutes"));
app.use('/api/forum', require('./routes/forumRoutes'));
app.use("/api/quizzes", require("./routes/quizRoutes"));

// ==========================================
// 5. DÉMARRAGE SERVEUR
// ==========================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

