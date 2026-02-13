const express = require('express');
const router = express.Router();
const { register, login, verifyEmail  , deleteUser  } = require('../Controller/authController');
const { protect } = require('../middleware/authMiddleware');

// Import pour l'upload d'image (Update profile)
const multer = require('multer');
const path = require('path');
const Etudiant = require('../models/etudiant');
const Enseignant = require('../models/enseignant');
const bcrypt = require('bcryptjs');

// --- CONFIGURATION MULTER (Pour l'update profile) ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `user-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const fileFilter = (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) return cb(null, true);
    cb(new Error('Images seulement !'));
};

const uploadProfile = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: fileFilter
});

// ==========================================
//  ON BRANCHE LE CONTROLLER
// ==========================================

// 1. REGISTER : Utilise la fonction register de authController.js
router.post('/register', register);

// 2. LOGIN : Utilise la fonction login de authController.js
router.post('/login', login);

// 3. VERIFY EMAIL : Utilise la fonction verifyEmail de authController.js

router.get('/verify/:token', verifyEmail);


// ==========================================
// ROUTE UPDATE 
// ==========================================
router.put('/update', protect, uploadProfile.single('image'), async (req, res) => {
    try {
        const Model = req.user.role === 'enseignant' ? Enseignant : Etudiant;
        const user = await Model.findById(req.user.id);

        if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });

        user.nom = req.body.nom || user.nom;
        user.prenom = req.body.prenom || user.prenom;
        user.email = req.body.email || user.email;

        if (req.file) {
            user.image = req.file.path.replace(/\\/g, "/"); 
        }

        if (req.body.new_password && req.body.old_password) {
            const isMatch = await bcrypt.compare(req.body.old_password, user.password);
            if (!isMatch) return res.status(400).json({ message: "Ancien mot de passe incorrect" });
            
            // Note: Si tu ajoutes le hook dans le modèle, tu n'auras plus besoin de hasher ici manuellement
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
        res.status(500).json({ message: "Erreur serveur" });
    }
});


// --- ROUTE ADMIN : Récupérer tous les utilisateurs ---
router.get('/all-users', async (req, res) => {
    try {
        const etudiants = await Etudiant.find({}).select('-password');
        const enseignants = await Enseignant.find({}).select('-password');

        // On fusionne les listes
        const users = [
            ...enseignants.map(u => ({ ...u._doc, type: u.role })), // Enseignants + Admin
            ...etudiants.map(u => ({ ...u._doc, type: 'etudiant' })) // Etudiants
        ];

        res.json(users);
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur" });
    }
});

router.delete('/users/:id/:type', deleteUser);
module.exports = router;