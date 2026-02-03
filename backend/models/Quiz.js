const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
    titre: { type: String, required: true },
    description: { type: String },
    
    // TEACHER: Links the Quiz to the Course so we can find it later.
    cours: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Cours',
        required: true 
    },

    enseignant: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Enseignant', 
        required: true 
    },

    questions: [{
        questionText: { type: String, required: true },
        
        // 🛠️ FIX: Defines a simple array of strings ["A", "B", "C"]
        // The previous code [{type:String}] expected objects like [{type: "A"}]
        options: {
            type: [String], 
            required: true
        }, 
        
        correctAnswer: { type: String, required: true } 
    }]
}, { timestamps: true });

module.exports = mongoose.model('Quiz', quizSchema);