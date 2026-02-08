const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const etudiantSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  prenom: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  
  
  isVerified: { type: Boolean, default: false },
  verificationToken: String,
  verificationTokenExpire: Date, 

  num_carte: { type: String, required: true },
  annee: { type: String, required: true } 
}, { timestamps: true });

// Hash du mot de passe
etudiantSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

module.exports = mongoose.model('Etudiant', etudiantSchema);