

const mongoose = require('mongoose');

const enseignantSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: true
  },
  prenom: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  // Optional: You can add a role field if you want to track it in the DB
  role: {
    type: String,
    default: 'enseignant'
  }
}, { timestamps: true });

module.exports = mongoose.model('Enseignant', enseignantSchema);