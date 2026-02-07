const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { protect } = require('../middleware/authMiddleware');
const coursController = require('../Controller/coursController');

// ==========================================
// CONFIGURATION MULTER (Images & Vidéos)
// ==========================================

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Séparation des dossiers : images dans uploads/, vidéos dans uploads/videos/
        if (file.fieldname === 'video') {
            cb(null, 'uploads/videos/');
        } else {
            cb(null, 'uploads/'); 
        }
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    if (file.fieldname === "image") {
        if (!file.mimetype.startsWith('image/')) {
            return cb(new Error('Seules les images sont autorisées pour la miniature !'), false);
        }
    }
    cb(null, true);
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 2000 * 1024 * 1024 } // Limite à 20000MB pour les vidéos
});

// ==========================================
// ROUTES
// ==========================================

// 1. CRÉER UN COURS (Accepte une image obligatoire lors de la création)
router.post('/', protect, upload.single('image'), coursController.createCourse);

// 2. RÉCUPÉRER TOUS LES COURS (Vérifie le nom dans ton Controller : getAllCourses ou getAllCours)
router.get('/', coursController.getAllCourses);

// 3. RÉCUPÉRER LES COURS DU PROF (Dashboard)
router.get('/my-courses', protect, coursController.getMyCourses);

// 4. RÉCUPÉRER LES COURS INSCRITS (Étudiant)
router.get('/enrolled', protect, coursController.getEnrolledCourses);

// 5. DÉTAILS D'UN COURS UNIQUE
router.get('/:id', coursController.getCourseById);

// 6. METTRE À JOUR UN COURS
router.put('/:id', protect, coursController.updateCourse);

// 7. SUPPRIMER UN COURS
router.delete('/:id', protect, coursController.deleteCourse);

// 8. S'INSCRIRE À UN COURS
router.post('/:id/enroll', protect, coursController.enrollStudent);

// 9. AJOUTER UNE VIDÉO À UN COURS EXISTANT
router.post('/:id/videos', protect, upload.single('video'), coursController.addVideo);

module.exports = router;