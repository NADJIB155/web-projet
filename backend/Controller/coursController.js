// backend/Controller/coursController.js
const Cours = require('../models/cours');
const Etudiant = require('../models/etudiant');
const Enseignant = require('../models/enseignant');


// 1. CREATE A COURSE (Teacher Only) 👨‍🏫
exports.createCourse = async (req, res) => {
    try {
        const { titre, description, public_cible, specialite, image } = req.body;

        // DEBUG: Check if the user is actually logged in
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: "Not authorized. Please send a valid Token." });
        }

        // Create the course and link it to the Teacher
        // We use 'req.user.id' which comes from the Token
        const newCourse = await Cours.create({
            titre,
            description,
            public_cible,
            specialite,
            image, 
            enseignant: req.user.id 
        });

        res.status(201).json(newCourse);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 2. GET ALL COURSES
exports.getAllCourses = async (req, res) => {
    try {
        const { enseignant } = req.query;
        let query = {};
        if (enseignant) {
            query.enseignant = enseignant;
        }
        const courses = await Cours.find(query).populate('enseignant', 'nom prenom email image');
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

// 6. GET SINGLE COURSE (New) 🔍
exports.getCourseById = async (req, res) => {
    try {
        const course = await Cours.findById(req.params.id).populate('enseignant', 'nom prenom');
        
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        res.json(course);
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

// 7. GET ENROLLED COURSES (For Students)
exports.getEnrolledCourses = async (req, res) => {
    try {
        // TEACHER: We search for courses where the 'etudiants_inscrits' array contains the Student's ID.
        // req.user.id comes from the auth middleware (token).
        const courses = await Cours.find({ etudiants_inscrits: req.user.id })
                                   .populate('enseignant', 'nom prenom');
        
        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 8. GET TEACHER'S COURSES (For Teacher Dashboard)
exports.getMyCourses = async (req, res) => {
    try {
        // TEACHER: We filter courses where the 'enseignant' field matches the logged-in Teacher's ID.
        const courses = await Cours.find({ enseignant: req.user.id });
        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// Add Video to Course
exports.addVideo = async (req, res) => {
    try {
        const courseId = req.params.id;
        // The file path comes from Multer
        const videoPath = req.file ? req.file.filename : null; 
        const { title } = req.body;

        if(!videoPath) return res.status(400).json({message: "No video uploaded"});

        const course = await Cours.findById(courseId);
        if(!course) return res.status(404).json({message: "Course not found"});

        // Add to content array
        course.contenu.push({
            titre: title || req.file.originalname,
            url: `uploads/${videoPath}`, // Save the path
            duree: 10, // Default duration or calculate it
            type: "video"
        });

        await course.save();
        res.status(200).json({ message: "Video added!", course });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};