const mongoose = require('mongoose');

const etudiantSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  prenom: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  verificationToken: String,
  num_carte: { type: String, required: true },
  annee: { type: String, required: true } 
}, { timestamps: true });

module.exports = mongoose.model('Etudiant', etudiantSchema);