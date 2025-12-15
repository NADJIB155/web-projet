const SupportSchema = new mongoose.Schema({
  cours: { type: mongoose.Schema.Types.ObjectId, ref: "Cours" },
  type: String,
  url_fichier: String
});

module.exports = mongoose.model("Support", SupportSchema);
