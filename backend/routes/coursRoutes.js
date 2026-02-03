const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Cours = require('../models/Cours'); 
const { protect } = require('../middleware/authMiddleware'); 

// --- CONFIGURATION MULTER POUR LES VIDÉOS ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/videos/'); // Dossier où seront stockées les vidéos
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 100 * 1024 * 1024 } // Limite à 100MB par vidéo
});

// ==========================================
// ROUTES
// ==========================================

// 1. Récupérer tous les cours (pour la page home/courses)


router.get('/', async (req, res) => {
    try {
        //  On prépare un filtre vide
        let filter = {};
        
        // Si l'URL contient ?enseignant=ID, on filtre par cet ID
        if (req.query.enseignant) {
            filter = { enseignant: req.query.enseignant };
        }

        // On applique le filtre au .find()
        const cours = await Cours.find(filter).populate('enseignant', 'nom prenom image');
        res.json(cours);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 2. Récupérer les détails d'un cours spécifique (utilisé par playlist.html)
router.get('/:id', async (req, res) => {
    try {
        const cours = await Cours.findById(req.params.id).populate('enseignant', 'nom prenom');
        if (!cours) return res.status(404).json({ message: "Cours non trouvé" });
        res.json(cours);
    } catch (err) {
        res.status(500).json({ message: "ID invalide" });
    }
});

// 3. S'inscrire à un cours (Enroll Now)
router.post('/:id/enroll', protect, async (req, res) => {
    try {
        const cours = await Cours.findById(req.params.id);
        if (!cours) return res.status(404).json({ message: "Cours non trouvé" });

        // Vérifier si l'étudiant est déjà inscrit
        if (cours.etudiants_inscrits.includes(req.user.id)) {
            return res.status(400).json({ message: "Déjà inscrit à ce cours" });
        }

        cours.etudiants_inscrits.push(req.user.id);
        await cours.save();
        res.json({ message: "Inscription réussie" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 4. Ajouter une vidéo à la playlist (Réservé aux enseignants)
router.post('/:id/add-video', protect, upload.single('video'), async (req, res) => {
    try {
        if (req.user.role !== 'enseignant') {
            return res.status(403).json({ message: "Accès refusé" });
        }

        const cours = await Cours.findById(req.params.id);
        if (!req.file) return res.status(400).json({ message: "Veuillez uploader une vidéo" });

        const nouvelleVideo = {
            titre: req.body.titre || "Sans titre",
            videoUrl: req.file.path.replace(/\\/g, "/") // Normalise le chemin pour le web
        };

        cours.contenu.push(nouvelleVideo);
        await cours.save();
        res.status(201).json({ message: "Vidéo ajoutée", cours });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;