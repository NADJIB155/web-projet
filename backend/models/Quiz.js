const mongoose = require('mongoose');

const quizSchema = mongoose.Schema({
    titre: { type: String, required: true },
    description: { type: String },
    
    // Link the Quiz to a specific Course
    cours: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Cours', 
        required: true 
    },

    // The Teacher who created it
    enseignant: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Enseignant', 
        required: true 
    },

    // List of Questions inside the Quiz
    questions: [{
        questionText: { type: String, required: true },
        options: [{ type: String, required: true }], // e.g., ["A", "B", "C", "D"]
        correctAnswer: { type: String, required: true } // The correct option
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Quiz', quizSchema);