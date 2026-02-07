const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const Etudiant = require('../models/etudiant');
const Enseignant = require('../models/enseignant');
const sendEmail = require('../utils/sendEmail'); // On l'utilise vraiment cette fois !

const JWT_SECRET = process.env.JWT_SECRET;

// 1. REGISTER (AVEC ENVOI D'EMAIL)
 
exports.register = async (req, res) => {
    const { nom, prenom, email, password, role } = req.body;

    try {
        // Vérifier si l'utilisateur existe déjà
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Créer l'utilisateur (isVerified: false par défaut)
        const user = await User.create({
            nom,
            prenom,
            email,
            password,
            role,
            isVerified: false // ⛔ Important : pas vérifié au début
        });

        // Générer le token de vérification (pas le token de connexion !)
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const verificationTokenHash = crypto.createHash('sha256').update(verificationToken).digest('hex');

        user.verificationToken = verificationTokenHash;
        user.verificationTokenExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 heures
        await user.save();

        // Construire l'URL de vérification (Assurez-vous que le port est bon)
        const verificationUrl = `http://${req.headers.host}/api/auth/verify/${verificationToken}`;

        const message = `
            <h1>Email Verification</h1>
            <p>Please verify your email by clicking the link below:</p>
            <a href="${verificationUrl}" clicktracking=off>${verificationUrl}</a>
        `;

        try {
            await sendEmail({
                to: user.email,
                subject: 'LearniX - Email Verification',
                text: message
            });

            // ✅ CORRECTION ICI : On ne renvoie PAS de token JWT !
            // On renvoie juste un message de succès.
            res.status(201).json({ 
                success: true, 
                message: `Registration successful! An email has been sent to ${user.email}. Please verify before logging in.` 
            });

        } catch (error) {
            user.verificationToken = undefined;
            user.verificationTokenExpire = undefined;
            await user.save();
            return res.status(500).json({ message: 'Email could not be sent' });
        }

    } catch (error) {
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