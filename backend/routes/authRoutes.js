const express = require('express');
const router = express.Router();
const authController = require('../Controller/authController');

// Register and Login routes
router.post('/register-student', authController.registerStudent);
router.post('/register-teacher', authController.registerTeacher);
router.post('/login', authController.login);


module.exports = router;