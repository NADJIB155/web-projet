const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const Etudiant = require('../models/etudiant');
const Enseignant = require('../models/enseignant');
const sendEmail = require('../utils/sendEmail'); // On l'utilise vraiment cette fois !

const JWT_SECRET = process.env.JWT_SECRET;

// 1. REGISTER (AVEC ENVOI D'EMAIL)
exports.register = async (req, res) => {
    try {
        const { nom, prenom, email, password, role, num_carte, annee } = req.body;

        if (!nom || !email || !password || !role) {
            return res.status(400).json({ message: 'Veuillez remplir tous les champs.' });
        }

        const Model = role === 'enseignant' ? Enseignant : Etudiant;

        const existingUser = await Model.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Cet email est déjà utilisé.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Génération du token de vérification
        const verifyToken = crypto.randomBytes(20).toString('hex');

        const userData = {
            nom, prenom, email,
            password: hashedPassword,
            role,
            verificationToken: verifyToken,
            isVerified: false // <--- IMPORTANT : False pour obliger la vérification
        };

        if (role === 'etudiant') {
            if (!num_carte || !annee) return res.status(400).json({ message: 'Carte et Année requises' });
            userData.num_carte = num_carte;
            userData.annee = annee;
        }

        // Création de l'utilisateur (non vérifié pour l'instant)
        const user = await Model.create(userData);

        // --- ENVOI DE L'EMAIL ---
        // Remplacez par VOTRE lien Tunnel (sans le slash à la fin)
        const BASE_URL = 'https://wv7pc13r-5000.euw.devtunnels.ms'; 
        
        const verifyUrl = `${BASE_URL}/api/auth/verify/${verifyToken}/${role}`;

        const message = `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
                <h1 style="color: #8e44ad;">Bienvenue sur LearniX !</h1>
                <p>Merci de vous être inscrit. Cliquez sur le bouton ci-dessous pour activer votre compte :</p>
                <a href="${verifyUrl}" style="background-color: #8e44ad; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Activer mon compte</a>
                <p style="margin-top: 20px; color: gray; font-size: 12px;">Si le bouton ne marche pas, copiez ce lien : ${verifyUrl}</p>
            </div>
        `;

        try {
            await sendEmail({
                email: user.email,
                subject: 'LearniX - Activation de compte',
                message
            });

            res.status(201).json({ 
                message: `Inscription réussie ! Un email a été envoyé à ${user.email}. Vérifiez vos spams.` 
            });

        } catch (emailError) {
            // Si l'envoi échoue, on supprime l'utilisateur pour qu'il puisse réessayer
            await Model.findByIdAndDelete(user._id);
            console.error("❌ Erreur Email:", emailError);
            return res.status(500).json({ message: "L'envoi de l'email a échoué. Vérifiez votre connexion." });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

// 2. LOGIN
exports.login = async (req, res) => {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
        return res.status(400).json({ message: 'Email, mot de passe et rôle requis' });
    }

    try {
        const Model = role === 'enseignant' ? Enseignant : Etudiant;
        const user = await Model.findOne({ email });

        if (!user) return res.status(400).json({ message: 'Identifiants invalides' });

        // VÉRIFICATION OBLIGATOIRE
        if (!user.isVerified) {
            return res.status(401).json({ message: 'Veuillez vérifier votre email avant de vous connecter !' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Identifiants invalides' });

        const token = jwt.sign({ id: user._id, role: role }, JWT_SECRET, { expiresIn: '7d' });

        res.json({
            message: 'Connexion réussie',
            token,
            user: { id: user._id, nom: user.nom, prenom: user.prenom, role: role }
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 3. VERIFY EMAIL
exports.verifyEmail = async (req, res) => {
    try {
        const { token, role } = req.params;
        const Model = role === 'enseignant' ? Enseignant : Etudiant;

        const user = await Model.findOne({ verificationToken: token });

        if (!user) return res.status(400).send("<h1>Lien invalide ou expiré</h1>");

        user.isVerified = true;
        user.verificationToken = undefined;
        await user.save();

        // Jolie page de confirmation
        res.send(`
            <div style="text-align: center; font-family: Arial; margin-top: 50px;">
                <h1 style="color: green;">Email Vérifié ! 🎉</h1>
                <p>Votre compte est actif.</p>
                <p>Vous pouvez retourner sur l'application et vous connecter.</p>
            </div>
        `);
    } catch (error) {
        res.status(500).send(error.message);
    }
};