// backend/Controller/coursController.js
const Cours = require('../models/cours');
const Etudiant = require('../models/etudiant');
const Enseignant = require('../models/enseignant');

// 1. CREATE COURSE
exports.createCourse = async (req, res) => {
    try {
        const { titre, description, public_cible, cle_inscription, specialite, enseignant_id } = req.body;

        if (!enseignant_id) {
            return res.status(400).json({ message: "enseignant_id is missing" });
        }

        const newCourse = await Cours.create({
            titre,
            description,
            public_cible,
            cle_inscription,
            specialite,
            enseignant: enseignant_id
        });

        res.status(201).json({ message: "Course created!", course: newCourse });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 2. GET ALL COURSES
exports.getAllCourses = async (req, res) => {
    try {
        const courses = await Cours.find().populate('enseignant', 'nom prenom email');
        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 3. ENROLL STUDENT
exports.enrollStudent = async (req, res) => {
    const { student_id, course_id, enrollment_key } = req.body;

    try {
        const course = await Cours.findById(course_id);
        if (!course) return res.status(404).json({ message: "Course not found" });

        if (course.cle_inscription !== enrollment_key) {
            return res.status(400).json({ message: "Invalid Enrollment Key!" });
        }

        if (course.etudiants_inscrits.includes(student_id)) {
            return res.status(400).json({ message: "Already enrolled." });
        }

        course.etudiants_inscrits.push(student_id);
        await course.save();

        res.json({ message: "Enrollment Successful!" });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 4. UPDATE COURSE 
exports.updateCourse = async (req, res) => {
    try {
        // Find the course by ID (from the URL /api/cours/:id)
        let course = await Cours.findById(req.params.id);

        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        // Update fields only if they are sent in the body
        course.titre = req.body.titre || course.titre;
        course.description = req.body.description || course.description;
        course.cle_inscription = req.body.cle_inscription || course.cle_inscription;
        course.specialite = req.body.specialite || course.specialite;

        const updatedCourse = await course.save();
        res.json({ message: "Course updated successfully", course: updatedCourse });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 5. DELETE COURSE 
exports.deleteCourse = async (req, res) => {
    try {
        const course = await Cours.findByIdAndDelete(req.params.id);

        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        res.json({ message: "Course deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};