const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const Etudiant = require('../models/etudiant'); 
const Enseignant = require('../models/enseignant');
const sendEmail = require('../utils/sendEmail');

const JWT_SECRET = process.env.JWT_SECRET;

// 1. REGISTER
exports.register = async (req, res) => {
    try {
        const { nom, prenom, email, password, role, num_carte, annee, telephone } = req.body;

        // 1. Vérifier si l'utilisateur existe déjà
        let user = await Etudiant.findOne({ email });
        if (!user) user = await Enseignant.findOne({ email });

        if (user) {
            return res.status(400).json({ message: "Cet email est déjà utilisé." });
        }

        // 2. Créer l'utilisateur 
        if (role === 'etudiant') {
            user = await Etudiant.create({
                nom, prenom, email, password, role, num_carte, annee
            });
        } else if (role === 'enseignant') {
            user = await Enseignant.create({
                nom, prenom, email, password, role, telephone
            });
        } else {
            return res.status(400).json({ message: "Rôle invalide." });
        }

        // 3. Générer le token de vérification
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const verificationTokenHash = crypto.createHash('sha256').update(verificationToken).digest('hex');

        user.verificationToken = verificationTokenHash;
        user.verificationTokenExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 heures
        
        // On sauvegarde le token dans la base de données
        await user.save({ validateBeforeSave: false });

        // 4. Créer l'URL de vérification 
        const verificationUrl = `http://localhost:5000/api/auth/verify/${verificationToken}`;

        // 5. Tentative d'envoi d'email (Avec sécurité Hors Ligne)
        try {
            await sendEmail({
                email: user.email, 
                subject: 'LearniX - Validation Email',
                html: `<h1>Bienvenue !</h1><p>Cliquez ici : <a href="${verificationUrl}">Valider mon compte</a></p>`
            });
            
            res.status(201).json({ success: true, message: `Inscription réussie ! Email envoyé.` });

        } catch (error) {
            // 👇 MODE HORS LIGNE / ERREUR EMAIL
            console.log("\n==================================================");
            console.log("⚠️  PAS D'INTERNET ? Impossible d'envoyer l'email.");
            console.log("🔗  VOICI TON LIEN DE VALIDATION (Copie-le dans le navigateur) :");
            console.log("\x1b[36m%s\x1b[0m", verificationUrl); 
            console.log("==================================================\n");

            //  ON DIT AU FRONTEND QUE C'EST BON QUAND MÊME
            return res.status(201).json({ 
                success: true, 
                message: "Compte créé ! (Mode Hors Ligne : Voir le lien dans le terminal)" 
            });
        }

    } catch (error) {
        console.error("Erreur Register:", error);
        // Gestion des doublons (numéro de carte, etc.)
        if (error.code === 11000) {
            const field = Object.keys(error.keyValue)[0];
            return res.status(400).json({ message: `Ce ${field} existe déjà.` });
        }
        res.status(500).json({ message: "Erreur serveur lors de l'inscription." });
    }

return res.status(201).json({ 
    success: true, 
    user: {
        nom: user.nom,
        email: user.email,
        role: user.role 
    },
    message: "Compte créé !" 
});
};
// --- Login & VerifyEmail (Ne changez rien si ça marche) ---
exports.login = async (req, res) => {
    const { email, password, role } = req.body;
    try {
        const Model = role === 'enseignant' ? Enseignant : Etudiant;
        const user = await Model.findOne({ email });

        if (!user) return res.status(400).json({ message: 'Email invalide' });
        if (!user.isVerified) return res.status(401).json({ message: 'Vérifiez votre email !' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Mot de passe incorrect' });

        const token = jwt.sign({ id: user._id, role: role }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ success: true, token, user: { id: user._id, nom: user.nom, role } });
    } catch (e) { res.status(500).json({ message: e.message }); }
};


// 
exports.verifyEmail = async (req, res) => {
    try {
        const { token } = req.params;
        const hash = crypto.createHash('sha256').update(token).digest('hex');

        // 1. On cherche d'abord dans les Étudiants
        let user = await Etudiant.findOne({ 
            verificationToken: hash, 
            verificationTokenExpire: { $gt: Date.now() } 
        });

        // 2. Si pas trouvé, on cherche dans les Enseignants
        if (!user) {
            user = await Enseignant.findOne({ 
                verificationToken: hash, 
                verificationTokenExpire: { $gt: Date.now() } 
            });
        }

        // 3. Si toujours pas trouvé (Lien mort ou hack)
        if (!user) {
            return res.status(400).send(`
                <html>
                <body style="display:flex; justify-content:center; align-items:center; height:100vh; font-family:Arial; background:#fff5f5;">
                    <div style="text-align:center; padding:40px; background:white; border-radius:10px; box-shadow:0 2px 10px rgba(0,0,0,0.1);">
                        <h1 style="color:#dc3545; font-size:40px;">❌</h1>
                        <h2 style="color:#333;">Lien invalide ou expiré</h2>
                        <p style="color:#666;">Ce lien ne fonctionne plus.</p>
                    </div>
                </body>
                </html>
            `);
        }

        // 4. VALIDATION COMPTE 
        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpire = undefined;
        await user.save();

    
        const frontendLoginUrl = "http://127.0.0.1:5500/frontend/learnix-frontend-frontend-chakib/login.html"; 

        
        const roleAffichage = user.role ? user.role : "compte";

        res.send(`
            <html>
                <head><title>Compte Vérifié</title></head>
                <body style="display:flex; justify-content:center; align-items:center; height:100vh; font-family:Arial, sans-serif; background-color:#f0fff4;">
                    <div style="text-align:center; background:white; padding:50px; border-radius:15px; box-shadow:0 10px 25px rgba(0,0,0,0.1);">
                        <h1 style="font-size:4rem; margin:0;">🎉</h1>
                        <h2 style="color:#28a745; margin-top:10px;">Email Vérifié !</h2>
                        
                        <p style="color:#555; font-size:18px; margin-bottom:30px;">
                            Bienvenue <b>${user.prenom}</b>, votre compte <b>${roleAffichage}</b> est maintenant actif.
                        </p>
                        
                        <a href="${frontendLoginUrl}" style="background-color:#007bff; color:white; padding:15px 30px; text-decoration:none; border-radius:30px; font-weight:bold; font-size:18px;">
                            Se connecter maintenant
                        </a>
                    </div>
                </body>
            </html>
        `);

    } catch (e) {
        console.error("Erreur Verify:", e);
        res.status(500).send("Erreur serveur interne.");
    }
};
