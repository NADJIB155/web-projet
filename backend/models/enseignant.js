//on va creer un  bd non relationele on utilisons la biblio mongoose qelle permetre de le schema (structure de document.json ) et de la collection associe dans mongodb (model) et meme faire les operations de crud 
//1st importer cette biblio 
const mongoose = require("mongoose");


const SchemaEnseignant = new mongoose.Schema(
    {
        nom: String,
        prenom:String,
        domaine : String,
        grade: String ,
        //ici type-> string c'est pour preciser le champ est du text et la unique : true pour que mongodb interdire d'avoir 2enseignants avec le meme email 
        email : {type : String , unique : true}

    });

//on va ici creer le modele base sur ce schema

module.exports = mongoose.model("enseignant",SchemaEnseignant);