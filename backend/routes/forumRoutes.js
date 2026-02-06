const express = require('express');
const router = express.Router();
const Topic = require('../models/Topic');
const { protect } = require('../middleware/authMiddleware');

// Helper pour savoir si c'est un prof ou un étudiant (Gestion des Majuscules)
const getRoleModel = (role) => {
    return role === 'enseignant' ? 'Enseignant' : 'Etudiant';
};

// 1. Récupérer tous les sujets
router.get('/', async (req, res) => {
    try {
        const topics = await Topic.find()
            .populate('auteur', 'nom prenom image') // Mongoose utilise auteurModel pour savoir où chercher
            .sort({ createdAt: -1 });
        res.json(topics);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 2. Récupérer un sujet unique avec ses réponses
router.get('/:id', async (req, res) => {
    try {
        const topic = await Topic.findById(req.params.id)
            .populate('auteur', 'nom prenom image')
            .populate('reponses.auteur', 'nom prenom image'); // Populate dynamique
        
        if (!topic) return res.status(404).json({ message: "Sujet introuvable" });
        res.json(topic);
    } catch (err) {
        res.status(500).json({ message: "Erreur serveur" });
    }
});

// 3. Créer un nouveau sujet
router.post('/', protect, async (req, res) => {
    try {
        const newTopic = new Topic({
            titre: req.body.titre,
            contenu: req.body.contenu,
            auteur: req.user.id,
            // On enregistre si c'est un prof ou un étudiant
            auteurModel: getRoleModel(req.user.role) 
        });
        const savedTopic = await newTopic.save();
        res.status(201).json(savedTopic);
    } catch (err) {
        res.status(400).json({ message: "Erreur création sujet" });
    }
});

// 4. Ajouter une réponse
router.post('/:id/reply', protect, async (req, res) => {
    try {
        const topic = await Topic.findById(req.params.id);
        if (!topic) return res.status(404).json({ message: "Sujet introuvable" });

        const reponse = {
            auteur: req.user.id,
            auteurModel: getRoleModel(req.user.role), // <-- C'est ça qui manquait !
            contenu: req.body.contenu
        };

        topic.reponses.push(reponse);
        await topic.save();
        
        res.status(201).json(topic);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur ajout réponse" });
    }
});

module.exports = router;