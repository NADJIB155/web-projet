const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { protect } = require('../middleware/authMiddleware');

// ✅ IMPORT DU CONTROLLER (Vérifie que le chemin est bon)
const coursController = require('../Controller/coursController');

// ==========================================
// CONFIGURATION MULTER (Images & Vidéos)
// ==========================================

// Configuration du stockage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // On sépare les dossiers selon le type de fichier
        if (file.fieldname === 'video') {
            cb(null, 'uploads/videos/');
        } else {
            // Pour l'image du cours (fieldname === 'image')
            cb(null, 'uploads/'); 
        }
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

// Filtre pour accepter images et vidéos
const fileFilter = (req, file, cb) => {
    if (file.fieldname === "image") {
        // Accepter seulement les images
        if (!file.mimetype.startsWith('image/')) {
            return cb(new Error('Seules les images sont autorisées pour la miniature !'), false);
        }
    }
    // (Tu peux ajouter un filtre vidéo ici si tu veux)
    cb(null, true);
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 500 * 1024 * 1024 } // Limite 500MB (pour les grosses vidéos)
});

// ==========================================
// ROUTES
// ==========================================

// 1. CRÉER UN COURS (Avec upload d'image) 🆕
// C'est la route qui te manquait pour le "Publish Course"
router.post('/', 
    protect, 
    upload.single('image'), // 'image' doit correspondre au name dans ton FormData frontend
    coursController.createCourse
);

// 2. RÉCUPÉRER TOUS LES COURS
router.get('/', coursController.getAllCourses);

// 3. RÉCUPÉRER LES COURS DU PROF CONNECTÉ (Dashboard)
router.get('/my-courses', protect, coursController.getMyCourses);

// 4. RÉCUPÉRER LES COURS INSCRITS (Pour l'étudiant)
router.get('/enrolled', protect, coursController.getEnrolledCourses);

// 5. DÉTAILS D'UN COURS UNIQUE
router.get('/:id', coursController.getCourseById);

// 6. METTRE À JOUR UN COURS
router.put('/:id', protect, coursController.updateCourse);

// 7. SUPPRIMER UN COURS
router.delete('/:id', protect, coursController.deleteCourse);

// 8. S'INSCRIRE À UN COURS
router.post('/:id/enroll', protect, coursController.enrollStudent);

// 9. AJOUTER UNE VIDÉO (Avec upload vidéo)
router.post('/:id/videos', 
    protect, 
    upload.single('video'), // 'video' doit correspondre au name dans le frontend
    coursController.addVideo
);

module.exports = router;