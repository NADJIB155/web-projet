  const bcrypt = require('bcryptjs');
  const jwt = require('jsonwebtoken');
  const Etudiant = require('../models/etudiant');
  const Enseignant = require('../models/enseignant');

// Secret key (Store in .env for real apps)
const JWT_SECRET = 'your_super_secret_key_123'; 

// 1. REGISTER STUDENT
exports.registerStudent = async (req, res) => {
    const { nom, prenom, email, password, num_carte, annee } = req.body;

    if (!nom || !email || !password || !num_carte) {
        return res.status(400).json({ message: 'Please fill in all fields' });
    }

    try {
        const existingUser = await Etudiant.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const student = await Etudiant.create({
            nom, prenom, email, 
            password: hashedPassword, 
            num_carte, annee
        });

        res.status(201).json({ 
            message: 'Student registered successfully!',
            user: { id: student._id, email: student.email }
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 2. REGISTER TEACHER (✨ NEW FUNCTION ADDED)
exports.registerTeacher = async (req, res) => {
    // Note: I removed 'num_carte' & 'annee' assuming teachers don't have them.
    // Add 'matricule' here if your Enseignant model requires it.
    const { nom, prenom, email, password } = req.body;

    if (!nom || !email || !password) {
        return res.status(400).json({ message: 'Please fill in all fields' });
    }

    try {
        const existingUser = await Enseignant.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Teacher already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const teacher = await Enseignant.create({
            nom, prenom, email,
            password: hashedPassword
        });

        res.status(201).json({ 
            message: 'Teacher registered successfully!',
            user: { id: teacher._id, email: teacher.email }
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 3. LOGIN (Universal)
exports.login = async (req, res) => {
    const { email, password, role } = req.body; 

    if (!email || !password || !role) {
        return res.status(400).json({ message: 'Please provide email, password, and role' });
    }

    try {
        let user;
        
        if (role === 'etudiant') {
            user = await Etudiant.findOne({ email });
        } else if (role === 'enseignant') {
            user = await Enseignant.findOne({ email });
        } else {
            return res.status(400).json({ message: 'Invalid role' });
        }

        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user._id, role: role }, 
            JWT_SECRET, 
            { expiresIn: '1h' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                nom: user.nom,
                prenom: user.prenom,
                role: role
            }
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};