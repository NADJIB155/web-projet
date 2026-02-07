// backend/Controller/coursController.js
const Cours = require('../models/cours');
const Etudiant = require('../models/etudiant');
const Enseignant = require('../models/enseignant');

// 1. CREATE A COURSE (Teacher Only) 👨‍🏫
exports.createCourse = async (req, res) => {
    try {
        const { titre, description, public_cible, specialite, cle_inscription } = req.body;

        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: "Non autorisé." });
        }

        let imagePath = 'images/thumb-1.png'; 
        if (req.file) {
            imagePath = req.file.path.replace(/\\/g, "/");
        }

        const newCourse = await Cours.create({
            titre,
            description,
            public_cible,
            specialite,
            cle_inscription, // On s'assure que la clé est bien enregistrée
            image: imagePath,
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
        // On peuple l'enseignant
        const courses = await Cours.find(query).populate('enseignant', 'nom prenom email image');
        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 3. ENROLL STUDENT (Version Corrigée & Robuste) ✅
exports.enrollStudent = async (req, res) => {
    // On préfère utiliser l'ID du token (plus sécurisé)
    const student_id = req.user ? req.user.id : req.body.student_id;
    // On accepte l'ID dans l'URL ou dans le body
    const course_id = req.params.id || req.body.course_id; 
    const { enrollment_key } = req.body;

    try {
        const course = await Cours.findById(course_id);
        if (!course) return res.status(404).json({ message: "Course not found" });

        // --- LOGS POUR DÉBOGAGE ---
        console.log(`📝 Inscription pour : ${course.titre}`);
        console.log(`👤 Student ID : ${student_id}`);
        console.log(`🔑 Clé DB: '${course.cle_inscription}' | Clé User: '${enrollment_key}'`);

        // 1. VÉRIFICATION CLÉ (Logique réparée)
        const dbKey = String(course.cle_inscription || "").trim();
        const userKey = String(enrollment_key || "").trim();

        // Si le cours A une clé (non vide), on vérifie qu'elle correspond
        if (dbKey !== "") {
            if (dbKey !== userKey) {
                console.log("❌ Clé incorrecte");
                return res.status(400).json({ message: `Clé invalide !` });
            }
        } 
        // Si dbKey est vide (""), c'est un cours public, on laisse passer !

        // 2. VÉRIFICATION DÉJÀ INSCRIT
        if (!course.etudiants_inscrits) course.etudiants_inscrits = [];
        
        // Comparaison robuste (String vs String)
        const isAlreadyEnrolled = course.etudiants_inscrits.some(id => String(id) === String(student_id));

        if (isAlreadyEnrolled) {
            console.log("⚠️ Déjà inscrit (Autorisé)");
            // On renvoie un succès pour que le frontend laisse passer l'utilisateur
            return res.status(200).json({ message: "Vous êtes déjà inscrit !", alreadyEnrolled: true });
        }

        // 3. SAUVEGARDE
        course.etudiants_inscrits.push(student_id);
        
        // Force Mongoose à voir le changement
        course.markModified('etudiants_inscrits'); 
        
        await course.save();

        console.log("✅ Inscription réussie et sauvegardée.");
        res.status(200).json({ message: "Inscription réussie !" });

    } catch (error) {
        console.error("❌ Erreur serveur:", error);
        res.status(500).json({ message: error.message });
    }
};

// 4. UPDATE COURSE 
exports.updateCourse = async (req, res) => {
    try {
        let course = await Cours.findById(req.params.id);
        if (!course) return res.status(404).json({ message: "Course not found" });

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
        if (!course) return res.status(404).json({ message: "Course not found" });
        res.json({ message: "Course deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 6. GET SINGLE COURSE
exports.getCourseById = async (req, res) => {
    try {
        const course = await Cours.findById(req.params.id).populate('enseignant', 'nom prenom');
        if (!course) return res.status(404).json({ message: "Course not found" });
        res.json(course);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 7. GET ENROLLED COURSES (For Students)
exports.getEnrolledCourses = async (req, res) => {
    try {
        const courses = await Cours.find({ etudiants_inscrits: req.user.id })
                                   .populate('enseignant', 'nom prenom');
        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 8. GET TEACHER'S COURSES
exports.getMyCourses = async (req, res) => {
    try {
        const courses = await Cours.find({ enseignant: req.user.id });
        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 9. ADD VIDEO TO COURSE
exports.addVideo = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "Aucun fichier vidéo reçu." });
        }

        const courseId = req.params.id;
        const videoFilename = req.file.filename;
        const { title } = req.body;

        const course = await Cours.findById(courseId);
        if (!course) return res.status(404).json({ message: "Cours introuvable !" });

        const videoUrl = `uploads/videos/${videoFilename}`;

        course.contenu.push({
            titre: title || req.file.originalname,
            url: videoUrl,
            duree: 10, 
            type: "video"
        });

        await course.save();
        res.status(200).json({ message: "Video added!", course });

    } catch (error) {
        res.status(500).json({ message: "Erreur upload : " + error.message });
    }
};