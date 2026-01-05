// backend/createTeacher.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');
const Enseignant = require('./models/enseignant'); // Import the model

// 1. Connect to DB
connectDB();

const createTeacher = async () => {
    try {
        const passwordPlain = '123456'; 
        
        // 2. Hash Password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(passwordPlain, salt);

        // 3. Create Teacher Object (MongoDB style)
        const teacher = await Enseignant.create({
            nom: 'Professeur',
            prenom: 'Test',
            email: 'prof@test.com',
            password: hashedPassword,
            grade: 'Maitre Assistant',
            domaine: 'Informatique'
        });

        console.log('✅ Teacher Created Successfully!');
        console.log('ID:', teacher._id);
        console.log('Login: prof@test.com / 123456');

        process.exit();
    } catch (error) {
        console.error('❌ Error creating teacher:', error.message);
        process.exit(1);
    }
};

createTeacher();