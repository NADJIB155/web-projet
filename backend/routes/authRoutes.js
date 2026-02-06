const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer'); // ✅ On utilise Multer directement ici
const path = require('path');

// Import des Modèles
const Etudiant = require('../models/etudiant');
const Enseignant = require('../models/enseignant');

const { protect } = require('../middleware/authMiddleware');

// --- 1. CONFIGURATION MULTER SPÉCIALE IMAGES ---
// On crée une configuration spécifique pour les photos de profil
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Dossier de destination
    },
    filename: (req, file, cb) => {
        // Nom du fichier : user-TIMESTAMP.jpg
        cb(null, `user-${Date.now()}${path.extname(file.originalname)}`);
    }
});

// Filtre pour n'accepter que les images
const fileFilter = (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) return cb(null, true);
    cb(new Error('Images seulement (jpeg, jpg, png)!'));
};

const uploadProfile = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Limite 5MB
    fileFilter: fileFilter
});


// --- 2. ROUTES AUTHENTIFICATION ---

// REGISTER
router.post('/register', async (req, res) => {
    try {
        const { nom, prenom, email, password, role } = req.body;
        
        const Model = role === 'enseignant' ? Enseignant : Etudiant;

        const userExists = await Model.findOne({ email });
        if (userExists) return res.status(400).json({ message: "Cet email est déjà utilisé" });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await Model.create({
            nom, prenom, email, role,
            password: hashedPassword,
            image: 'images/pic-1.jpg'
        });

        res.status(201).json({ message: "Compte créé avec succès !" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// LOGIN
router.post('/login', async (req, res) => {
    try {
        const { email, password, role } = req.body;
        const Model = role === 'enseignant' ? Enseignant : Etudiant;

        const user = await Model.findOne({ email });
        if (!user) return res.status(400).json({ message: "Identifiants invalides" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Identifiants invalides" });

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
            expiresIn: '30d'
        });

        res.json({
            token,
            user: {
                id: user._id,
                nom: user.nom,
                prenom: user.prenom,
                email: user.email,
                role: user.role,
                image: user.image
            }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


// --- 3. UPDATE PROFILE (CORRIGÉ) ---
// ✅ On utilise uploadProfile.single('image') qui est défini dans ce fichier
router.put('/update', protect, uploadProfile.single('image'), async (req, res) => {
    try {
        const Model = req.user.role === 'enseignant' ? Enseignant : Etudiant;
        const user = await Model.findById(req.user.id);

        if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });

        // Mise à jour textes
        user.nom = req.body.nom || user.nom;
        user.prenom = req.body.prenom || user.prenom;
        user.email = req.body.email || user.email;

        // Mise à jour Image
        if (req.file) {
            // On normalise le chemin (remplace \ par / pour Windows)
            user.image = req.file.path.replace(/\\/g, "/"); 
        }

        // Mise à jour Mot de passe
        if (req.body.new_password && req.body.old_password) {
            const isMatch = await bcrypt.compare(req.body.old_password, user.password);
            if (!isMatch) return res.status(400).json({ message: "Ancien mot de passe incorrect" });
            
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(req.body.new_password, salt);
        }

        const updatedUser = await user.save();

        res.json({
            message: "Profil mis à jour",
            user: {
                id: updatedUser._id,
                nom: updatedUser.nom,
                prenom: updatedUser.prenom,
                email: updatedUser.email,
                role: updatedUser.role,
                image: updatedUser.image
            }
        });

    } catch (error) {
        console.error("Erreur update:", error);
        res.status(500).json({ message: "Erreur serveur lors de la mise à jour" });
    }
});

module.exports = router;