// backend/Controller/quizController.js
const Quiz = require('../models/Quiz');
const Cours = require('../models/cours'); 
const Result = require('../models/result');

// 1. CREATE QUIZ
exports.createQuiz = async (req, res) => {
    try {
        const { titre, description, cours, questions, enseignant } = req.body;
        
        // Vérif prof (optionnel si géré par middleware, mais plus sûr ici)
        const profId = req.user ? req.user.id : enseignant;

        const newQuiz = await Quiz.create({
            titre,
            description,
            cours,
            questions,
            enseignant: profId
        });
        res.status(201).json({ message: "Quiz créé !", quiz: newQuiz });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 2. GET QUIZZES BY COURSE (Pour playlist.html)
exports.getQuizzesByCourse = async (req, res) => {
    try {
        const quizzes = await Quiz.find({ cours: req.params.courseId });
        res.json(quizzes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 3. GET SINGLE QUIZ (Pour take_quiz.html) ✅
exports.getQuizById = async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id);
        if (!quiz) {
            return res.status(404).json({ message: "Quiz introuvable" });
        }
        res.json(quiz);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

// 4. SUBMIT QUIZ
exports.submitQuiz = async (req, res) => {
    try {
        const { quizId, answers } = req.body; 
        const studentId = req.user.id; 

        const quiz = await Quiz.findById(quizId);
        if (!quiz) return res.status(404).json({ message: "Quiz not found" });

        let score = 0;
        quiz.questions.forEach((question) => {
            const studentAnswer = answers.find(a => a.questionId === question._id.toString());
            // Comparaison simple des valeurs
            if (studentAnswer && parseInt(studentAnswer.selectedOption) === question.correctAnswer) {
                score++;
            }
        });

        // Sauvegarde du résultat
        const newResult = await Result.create({
            student: studentId,
            quiz: quizId,
            score: score,
            totalQuestions: quiz.questions.length
        });

        res.status(200).json({ 
            message: `Score: ${score}/${quiz.questions.length}`, 
            result: newResult 
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 5. DELETE QUIZ
exports.deleteQuiz = async (req, res) => {
    try {
        await Quiz.findByIdAndDelete(req.params.id);
        res.json({ message: "Quiz supprimé" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};