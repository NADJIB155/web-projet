const express = require('express');
const router = express.Router();
const { 
    createCourse, 
    getAllCourses, 
    enrollStudent, 
    updateCourse, 
    deleteCourse 
} = require('../Controller/coursController'); 

const { protect, authorize } = require('../middleware/authMiddleware');

// Public Routes (or Protected depending on your logic)
router.get('/', getAllCourses);
router.post('/enroll', protect, enrollStudent); // Only logged in students/users can enroll

// Teacher Routes (Protected)
router.post('/', protect, authorize('enseignant'), createCourse);

// NEW: Update and Delete Routes (Requires ID)
router.route('/:id')
    .put(protect, authorize('enseignant'), updateCourse)    // Update
    .delete(protect, authorize('enseignant'), deleteCourse); // Delete

module.exports = router;