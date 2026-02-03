const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');

// ⚠️ IMPORT IMPORTANT : On importe les modèles séparés
const Etudiant = require('../models/etudiant');
const Enseignant = require('../models/enseignant');

const { protect } = require('../middleware/authMiddleware');

// --- 1. CONFIGURATION MULTER (Images) ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `user-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5000000 },
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        if (mimetype && extname) return cb(null, true);
        cb(new Error('Images only!'));
    }
});

// --- 2. UPDATE PROFILE (CORRIGÉ) ---
router.put('/update', protect, upload.single('image'), async (req, res) => {
    try {
        // 💡 CORRECTION : On choisit le bon modèle selon le rôle
        const Model = req.user.role === 'enseignant' ? Enseignant : Etudiant;
        
        const user = await Model.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }

        // Mise à jour des champs texte
        user.nom = req.body.nom || user.nom;
        user.prenom = req.body.prenom || user.prenom;
        user.email = req.body.email || user.email;

        // Si une image est envoyée
        if (req.file) {
            user.image = req.file.path.replace(/\\/g, "/"); 
        }

        // Changement de mot de passe
        if (req.body.new_password && req.body.old_password) {
            const isMatch = await bcrypt.compare(req.body.old_password, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: "Ancien mot de passe incorrect" });
            }
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
                role: updatedUser.role, // Le rôle est conservé
                image: updatedUser.image
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur serveur update" });
    }
});

// --- 3. ROUTE CHAT (CONTACTS) ---
// Récupère la liste des gens à qui parler
router.get('/contacts/:role', protect, async (req, res) => {
    try {
        const myRole = req.params.role;
        let contacts = [];

        // Si je suis étudiant, je veux voir les profs (Enseignant)
        if (myRole === 'etudiant') {
            contacts = await Enseignant.find({}).select('nom prenom email role image');
        } 
        // Si je suis prof, je veux voir les étudiants (Etudiant)
        else if (myRole === 'enseignant') {
            contacts = await Etudiant.find({}).select('nom prenom email role image');
        }

        res.json(contacts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur chargement contacts" });
    }
});

// --- 4. ROUTE RECHERCHE PROFS ---
router.get('/teachers', async (req, res) => {
    try {
        const keyword = req.query.search
            ? {
                $or: [
                    { nom: { $regex: req.query.search, $options: 'i' } },
                    { prenom: { $regex: req.query.search, $options: 'i' } },
                ]
            }
            : {};

        const teachers = await Enseignant.find(keyword).select('-password');
        res.json(teachers);
    } catch (error) {
        res.status(500).json({ message: "Erreur recherche profs" });
    }
});

// On garde les routes Auth classiques gérées par le Controller
const { register, login, verifyEmail } = require('../Controller/authController');
router.post('/register', register);
router.post('/login', login);
router.get('/verify/:token/:role', verifyEmail);

module.exports = router;