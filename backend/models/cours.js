 
const mongoose = require("mongoose"); 

const SchemaCours = new mongoose.Schema({
  titre: String,
  
  // Reference to  Enseignant  model
  enseignant: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Enseignant" 
  },
  
  public: String,
  cle_inscription: String,
  description: String
});


// This forces Mongoose to look exactly in the "cours" collection you see in Compass.
module.exports = mongoose.model("cours", SchemaCours, "cours");