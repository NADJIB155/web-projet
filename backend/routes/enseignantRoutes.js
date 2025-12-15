const express = require("express");

const router = express.Router();

const Controller = require("../Controller/enseignentController");


router.post("/",Controller.ajoutEnseignant);
router.get("/",Controller.getEnseignant);
router.get("/:id",Controller.getEnseignantById);
router.put("/:id",Controller.updateEnseignant);
router.delete("/:",Controller.deleteEnseignant);


module.exports = router ;