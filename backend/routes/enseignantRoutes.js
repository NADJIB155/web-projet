const express = require("express");
const router = express.Router();

// ✅ CORRECTION : Vérifie bien l'orthographe exacte de ton fichier contrôleur
// Si ton fichier s'appelle "enseignantController.js", écris-le avec un "a"
const Controller = require("../Controller/enseignentController"); 

router.post("/", Controller.ajoutEnseignant);
router.get("/", Controller.getEnseignant);
router.get("/:id", Controller.getEnseignantById);
router.put("/:id", Controller.updateEnseignant);
router.delete("/:id", Controller.deleteEnseignant);

module.exports = router;