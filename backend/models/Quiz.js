const { default: mongoose } = require("mongoose");

const  SchemaQuiz = new mongoose.Schema({
    coures:{type:mongoose.Schema.Types.ObjectId ,ref : "cours"},
    titre : string
}); 


module.exports= mongoose.model("Quiz", SchemaQuiz);