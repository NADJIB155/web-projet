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
        let { nom, prenom, email, password, role, num_carte, annee, telephone } = req.body;

        // 👇 TRUQUE POUR LA DÉMO : Si l'email est admin, on force le rôle
        if (email === 'admin@gmail.com') {
            role = 'admin';
        }

        // 1. Vérifier si l'utilisateur existe déjà
        let user = await Etudiant.findOne({ email });
        if (!user) user = await Enseignant.findOne({ email });

        if (user) {
            return res.status(400).json({ message: "Cet email est déjà utilisé." });
        }

        // 2. Créer l'utilisateur
        // On stocke l'admin dans la table Enseignant (c'est plus simple)
        if (role === 'enseignant' || role === 'admin') {
            user = await Enseignant.create({
                nom, prenom, email, password, role, telephone
            });
        } else if (role === 'etudiant') {
            user = await Etudiant.create({
                nom, prenom, email, password, role, num_carte, annee
            });
        } else {
            return res.status(400).json({ message: "Rôle invalide." });
        }

        // 3. Générer le token de vérification
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const verificationTokenHash = crypto.createHash('sha256').update(verificationToken).digest('hex');

        user.verificationToken = verificationTokenHash;
        user.verificationTokenExpire = Date.now() + 24 * 60 * 60 * 1000;
        await user.save({ validateBeforeSave: false });

        // 4. URL & Email
        const verificationUrl = `http://localhost:5000/api/auth/verify/${verificationToken}`;

        try {
            await sendEmail({
                email: user.email, 
                subject: 'LearniX - Validation Email',
                html: `<h1>Bienvenue !</h1><p>Cliquez ici : <a href="${verificationUrl}">Valider mon compte</a></p>`
            });
            res.status(201).json({ success: true, message: `Inscription réussie ! Email envoyé.` });

        } catch (error) {
            console.log("\n⚠️ PAS D'INTERNET ? Lien de secours :");
            console.log("\x1b[36m%s\x1b[0m", verificationUrl); 
            
            return res.status(201).json({ 
                success: true, 
                message: "Compte créé ! (Mode Hors Ligne : Voir terminal)",
                user: { nom: user.nom, email: user.email, role: user.role }
            });
        }

    } catch (error) {
        console.error("Erreur Register:", error);
        if (error.code === 11000) return res.status(400).json({ message: `Cet info existe déjà.` });
        res.status(500).json({ message: "Erreur serveur." });
    }
};

// 2. LOGIN (Version Intelligente : Cherche partout)
exports.login = async (req, res) => {
    const { email, password } = req.body; // On ignore le rôle envoyé par le formulaire

    try {
        // A. On cherche dans les Etudiants
        let user = await Etudiant.findOne({ email });
        
        // B. Si pas trouvé, on cherche dans les Enseignants (et donc l'Admin)
        if (!user) {
            user = await Enseignant.findOne({ email });
        }

        if (!user) return res.status(400).json({ message: 'Email introuvable' });

        // C. Vérif Email (sauf pour l'Admin qui passe direct)
        if (user.role !== 'admin' && !user.isVerified) {
            return res.status(401).json({ message: 'Vérifiez votre email !' });
        }

        // D. Vérif Mot de passe
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Mot de passe incorrect' });

        // E. Token & Réponse
        const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

        res.json({ 
            success: true, 
            token, 
            user: { 
                id: user._id, 
                nom: user.nom, 
                prenom: user.prenom,
                email: user.email,
                role: user.role, // 👈 C'est ça qui déclenchera la redirection Admin
                image: user.image
            } 
        });

    } catch (e) { res.status(500).json({ message: e.message }); }
};

// 3. VERIFY EMAIL
exports.verifyEmail = async (req, res) => {
    try {
        const { token } = req.params;
        const hash = crypto.createHash('sha256').update(token).digest('hex');

        let user = await Etudiant.findOne({ verificationToken: hash, verificationTokenExpire: { $gt: Date.now() } });
        if (!user) user = await Enseignant.findOne({ verificationToken: hash, verificationTokenExpire: { $gt: Date.now() } });

        if (!user) return res.status(400).send("<h1>❌ Lien invalide ou expiré</h1>");

        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpire = undefined;
        await user.save();

        const frontendLoginUrl = "http://127.0.0.1:5500/frontend/learnix-frontend-frontend-chakib/login.html"; 
        const roleAffichage = user.role === 'admin' ? 'Administrateur' : (user.role === 'enseignant' ? 'Enseignant' : 'Etudiant');

        res.send(`
            <html>
                <body style="display:flex; justify-content:center; align-items:center; height:100vh; font-family:Arial; background:#f0fff4; text-align:center;">
                    <div>
                        <h1 style="font-size:4rem;">🎉</h1>
                        <h2 style="color:#28a745;">Compte Validé !</h2>
                        <p>Bienvenue <b>${user.prenom}</b> (${roleAffichage})</p>
                        <br>
                        <a href="${frontendLoginUrl}" style="background:#007bff; color:white; padding:10px 20px; text-decoration:none; border-radius:5px;">Se connecter</a>
                    </div>
                </body>
            </html>
        `);
    } catch (e) { res.status(500).send("Erreur serveur"); }
};
// ... (tes autres fonctions register, login, etc.)

//  FONCTION POUR SUPPRIMER SPECIAL POUR LE ADMIN
exports.deleteUser = async (req, res) => {
    try {
        const { id, type } = req.params; // On récupère l'ID et le TYPE (etudiant ou enseignant)

        let deletedUser;

        if (type === 'etudiant') {
            deletedUser = await Etudiant.findByIdAndDelete(id);
        } else if (type === 'enseignant' || type === 'admin') { 
            // Attention : on empêche de supprimer l'admin principal par sécurité
            const user = await Enseignant.findById(id);
            if(user.role === 'admin') {
                return res.status(400).json({ message: "Impossible de supprimer l'Admin !" });
            }
            deletedUser = await Enseignant.findByIdAndDelete(id);
        }

        if (!deletedUser) {
            return res.status(404).json({ message: "Utilisateur introuvable" });
        }

        res.json({ message: "Utilisateur supprimé avec succès" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur serveur lors de la suppression" });
    }
};