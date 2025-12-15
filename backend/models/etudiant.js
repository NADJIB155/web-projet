const mongoose=require("mongoose");


const SchemaEtudiant = new mongoose.Schema({
    num_carte: Number,
    nom:String,
    prenom:String,
    annee:String,
     email : {type : String , unique : true},
     password : String
});

module.exports=mongoose.model("Etudiant" , SchemaEtudiant);