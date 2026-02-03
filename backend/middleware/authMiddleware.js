const jwt = require('jsonwebtoken');
const Etudiant = require('../models/etudiant');
const Enseignant = require('../models/enseignant');

const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            // 1. Récupérer le token
            token = req.headers.authorization.split(' ')[1];

            // 2. Décoder le token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // 3. Chercher l'utilisateur dans la BONNE table
            // Le token contient l'ID et le ROLE (on l'a mis lors du login)
            let user;
            if (decoded.role === 'enseignant') {
                user = await Enseignant.findById(decoded.id).select('-password');
            } else {
                user = await Etudiant.findById(decoded.id).select('-password');
            }

            if (!user) {
                return res.status(401).json({ message: "Utilisateur introuvable avec ce token" });
            }

            req.user = user; // On attache l'utilisateur à la requête
            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: "Non autorisé, token invalide" });
        }
    } else {
        res.status(401).json({ message: "Non autorisé, aucun token" });
    }
};

// Middleware pour restreindre l'accès à certains rôles (ex: Prof seulement)
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ 
                message: `Le rôle ${req.user ? req.user.role : 'inconnu'} n'est pas autorisé à accéder à cette route` 
            });
        }
        next();
    };
};

module.exports = { protect, authorize };