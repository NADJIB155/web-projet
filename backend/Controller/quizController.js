const Quiz = require('../models/Quiz');
const Cours = require('../models/cours'); 
const Result = require('../models/result');

// 1. CREATE QUIZ
exports.createQuiz = async (req, res) => {
    try {
        // We read 'cours' and 'enseignant' directly to match your Postman JSON
        const { titre, description, cours, questions, enseignant } = req.body;

        console.log("Received Data:", req.body); // This will print in your terminal for debugging

        // Check if Course exists
        const courseExists = await Cours.findById(cours);
        if (!courseExists) {
            return res.status(404).json({ message: "Course not found (ID is wrong)" });
        }

        // Create the Quiz
        const newQuiz = await Quiz.create({
            titre,
            description,
            cours: cours,           // Save the ID
            enseignant: enseignant, // Save the ID
            questions
        });

        res.status(201).json({ message: "Quiz created successfully!", quiz: newQuiz });
    } catch (error) {
        console.error("Error creating quiz:", error);
        res.status(500).json({ message: error.message });
    }
};

// 2. GET QUIZZES
exports.getQuizzesByCourse = async (req, res) => {
    try {
        const { courseId } = req.params;
        const quizzes = await Quiz.find({ cours: courseId });
        res.json(quizzes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 3. SUBMIT QUIZ & CALCULATE SCORE
exports.submitQuiz = async (req, res) => {
    try {
        const { quizId, answers } = req.body; // answers = [{ questionId: "...", selectedOption: "..." }]
        const studentId = req.user.id; // Comes from the token middleware

        // 1. Fetch the Quiz to check correct answers
        const quiz = await Quiz.findById(quizId);
        if (!quiz) return res.status(404).json({ message: "Quiz not found" });

        let score = 0;

        // 2. Loop through questions to calculate score
        // (This assumes answers are sent in order, or you match by Question ID)
        quiz.questions.forEach((question, index) => {
            if (answers[index] && answers[index].selectedOption === question.correctAnswer) {
        score++;
         }
        });

        // 3. Save the Result
        const newResult = await Result.create({
            student: studentId,
            quiz: quizId,
            score: score,
            totalQuestions: quiz.questions.length
        });

        res.status(200).json({ 
            message: `You scored ${score} out of ${quiz.questions.length}`, 
            result: newResult 
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
