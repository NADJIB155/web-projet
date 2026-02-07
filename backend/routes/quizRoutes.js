// backend/routes/quizRoutes.js
const express = require('express');
const router = express.Router();
const quizController = require('../Controller/quizController');
const { protect, authorize } = require('../middleware/authMiddleware');

// 1. Routes spécifiques (Doivent être AVANT les routes avec paramètres dynamiques)

// POST /api/quizzes (Prof seulement)
router.post('/', protect, authorize('enseignant'), quizController.createQuiz);

// POST /api/quizzes/submit (Étudiant seulement)
router.post('/submit', protect, authorize('etudiant'), quizController.submitQuiz);

// ✅ ROUTE SPÉCIFIQUE : Récupérer un seul quiz par son ID
// (Doit être avant /:courseId pour ne pas être confondue)
router.get('/detail/:id', protect, quizController.getQuizById);

// DELETE (Prof seulement)
router.delete('/:id', protect, authorize('enseignant'), quizController.deleteQuiz);

// 2. Routes génériques (Avec paramètres dynamiques)

// GET /api/quizzes/:courseId (Récupérer tous les quiz d'un cours)
router.get('/:courseId', protect, quizController.getQuizzesByCourse);

module.exports = router;