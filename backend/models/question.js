const QuestionSchema = new mongoose.Schema({
  quiz: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz" },
  enonce: String,
  choix: [String],
  correct: Number
});

module.exports = mongoose.model("Question", QuestionSchema);
