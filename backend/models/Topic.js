const mongoose = require('mongoose');

// Schéma pour une réponse
const reponseSchema = new mongoose.Schema({
    // refPath permet de choisir dynamiquement la collection (Etudiant ou Enseignant)
    auteur: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'reponses.auteurModel' },
    auteurModel: { type: String, required: true, enum: ['Etudiant', 'Enseignant'] },
    contenu: { type: String, required: true },
    date: { type: Date, default: Date.now }
});

// Schéma pour le sujet
const topicSchema = new mongoose.Schema({
    titre: { type: String, required: true },
    contenu: { type: String, required: true },
    
    auteur: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'auteurModel' },
    auteurModel: { type: String, required: true, enum: ['Etudiant', 'Enseignant'] },
    
    createdAt: { type: Date, default: Date.now },
    reponses: [reponseSchema]
});

module.exports = mongoose.models.Topic || mongoose.model('Topic', topicSchema);