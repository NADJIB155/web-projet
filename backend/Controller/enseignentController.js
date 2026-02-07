const Enseignant = require("../models/enseignant");

// Récupérer tous les enseignants
exports.getEnseignant = async (req, res) => {
  try {
    // On récupère tous les profs (sans renvoyer leur mot de passe pour la sécurité)
    const enseignants = await Enseignant.find().select('-password');
    res.json(enseignants);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Récupérer par ID
exports.getEnseignantById = async (req, res) => {
  try {
    const enseignant = await Enseignant.findById(req.params.id).select('-password');
    if (!enseignant) {
      return res.status(404).json({ message: "Enseignant non trouvé" });
    }
    res.json(enseignant);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Ajouter enseignant (Si besoin d'ajout manuel hors inscription)
exports.ajoutEnseignant = async (req, res) => {
  try {
    const enseignant = await Enseignant.create(req.body);
    res.status(201).json(enseignant);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Modifier enseignant
exports.updateEnseignant = async (req, res) => {
  try {
    const enseignant = await Enseignant.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(enseignant);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Supprimer enseignant
exports.deleteEnseignant = async (req, res) => {
  try {
    await Enseignant.findByIdAndDelete(req.params.id);
    res.json({ message: "Enseignant supprimé avec succès" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};