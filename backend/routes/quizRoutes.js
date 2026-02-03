const express = require('express');
const router = express.Router();
const quizController = require('../Controller/quizController');

// 1. Import the guards
const { protect, authorize } = require('../middleware/authMiddleware');

// 2. Apply them to routes

// POST /api/quizzes (Only Teachers can create)
// Flow: protect -> checks token -> authorize -> checks if teacher -> createQuiz
router.post('/', protect, authorize('enseignant'), quizController.createQuiz);

// POST /api/quizzes/submit (Only Students can submit)
router.post('/submit', protect, authorize('etudiant'), quizController.submitQuiz);

// GET /api/quizzes/:courseId (Everyone who is logged in can view)
router.get('/:courseId', protect, quizController.getQuizzesByCourse);

// DELETE /api/quizzes/:id (Only Teachers can delete)
router.delete('/:id', protect, authorize('enseignant'), quizController.deleteQuiz);

module.exports = router;