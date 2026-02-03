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

exports.getQuizzesByCourse = async (req, res) => {
    try {
        const { courseId } = req.params;
        const studentId = req.user.id; 

        // TEACHER: Access Control - Before showing the quiz, we check if the student is actually enrolled in this course.
        const course = await Cours.findById(courseId);
        if (!course) return res.status(404).json({ message: "Course not found" });

        // Allow teachers to view their own quizzes, or enrolled students
        const isEnrolled = course.etudiants_inscrits.includes(studentId);
        const isOwner = course.enseignant.toString() === studentId; // (Assuming req.user.id is used for both roles)

        if (!isEnrolled && !isOwner && req.user.role !== 'enseignant') {
            return res.status(403).json({ message: "You must enroll in this course to view quizzes." });
        }

        const quizzes = await Quiz.find({ cours: courseId });
        res.json(quizzes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 3. SUBMIT QUIZ (Updated Logic)
exports.submitQuiz = async (req, res) => {
    try {
        const { quizId, answers } = req.body; 
        // Expected format: answers = [{ questionId: "654...", selectedOption: "A" }]
        
        const studentId = req.user.id; 

        const quiz = await Quiz.findById(quizId);
        if (!quiz) return res.status(404).json({ message: "Quiz not found" });

        let score = 0;

        // TEACHER: Instead of using array index (which breaks if questions are shuffled), 
        // we loop through the database questions and find the matching answer provided by the student.
        quiz.questions.forEach((question) => {
            // Find the student's answer for THIS specific question ID
            const studentAnswer = answers.find(a => a.questionId === question._id.toString());
            
            if (studentAnswer && studentAnswer.selectedOption === question.correctAnswer) {
                score++;
            }
        });

        // Save Result
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

// 4. DELETE QUIZ
exports.deleteQuiz = async (req, res) => {
    try {
        const quiz = await Quiz.findByIdAndDelete(req.params.id);
        if (!quiz) return res.status(404).json({ message: "Quiz not found" });
        res.json({ message: "Quiz deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
