const { default: mongoose } = require("mongoose");

const SchemaCours = new mongoose.Schema({
  titre: String,

  //ici le trype (objectid) pour luniciter didentifiant dans mongodb et le ref pour faire reference a la collection enseignant c'est lequivalent
  //d'une cle etrangere dans sql
  enseignant: { type: mongoose.Schema.Types.ObjectId, ref: "enseignant" },
  public: String,
  cle_inscription: String,
  description: String
});


module.exports = mongoose.model("cours",SchemaCours);