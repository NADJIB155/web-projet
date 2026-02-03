const mongoose = require("mongoose"); 

const SchemaCours = new mongoose.Schema({
  titre: { type: String, required: true },
  description: String,
  
  // Renamed 'public' to 'public_cible' to avoid conflict with JS keywords, 
  // but you can keep 'public' if you prefer.
  public_cible: String, 
  
  cle_inscription: String,
  specialite: String,
  
  // --- RELATIONSHIP: LINK TO TEACHER ---
  enseignant: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Enseignant",
      required: true
  },

  // --- RELATIONSHIP: ENROLLED STUDENTS ---
  // TEACHER: I added this array to track which students have joined the course.
  // It allows us to build the "My Enrolled Courses" page easily.
  etudiants_inscrits: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Etudiant"
  }],

  // --- CONTENT: IMAGES ---
  // TEACHER: I added this so each course can have a thumbnail image 
  // instead of a generic placeholder.
  image: { 
      type: String, 
      default: 'default-course.png' 
  },
  
  // --- CONTENT: VIDEOS ---
  // TEACHER: I added this array to store the actual lessons (Title + URL).
  // Without this, the course is just a description with no content to watch.
  contenu: [{
      titre: String,
      url: String, // e.g., "video1.mp4" or a YouTube link
      duree: Number // minutes
  }]

}, { timestamps: true }); // <--- proper closing of the Schema object

module.exports = mongoose.models.Cours || mongoose.model('Cours', SchemaCours);