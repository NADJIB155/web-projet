const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const enseignantSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  prenom: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'enseignant' },
  
  isVerified: { type: Boolean, default: false },
  verificationToken: String,
  verificationTokenExpire: Date 
}, { timestamps: true });

// Hash du mot de passe
enseignantSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

module.exports = mongoose.model('Enseignant', enseignantSchema);