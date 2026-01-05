const jwt = require('jsonwebtoken');

// 1. PROTECT FUNCTION (The Security Guard)
const protect = (req, res, next) => {
    let token;

    // Check if the "Authorization" header exists and starts with "Bearer"
    // Standard format: "Authorization: Bearer <your_long_token_here>"
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // STEP A: Get the token string
            // We split "Bearer eyJhbG..." by space, and take the second part (the token code)
            token = req.headers.authorization.split(' ')[1];

            // STEP B: Verify the token
            // jwt.verify checks if the token is real and not expired.
            // It needs the SAME secret key you used in authController.js
            const decoded = jwt.verify(token, 'your_super_secret_key_123');

            // STEP C: Add the user info to the request
            // We attach the decoded data (id & role) to "req.user"
            // Now, every controller after this can use "req.user.id"!
            req.user = decoded;

            // STEP D: Open the gate
            // next() tells Express: "This user is good. Move to the next function (the controller)."
            next();

        } catch (error) {
            console.error(error);
            // 401 means "Unauthorized"
        return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    // If no token was found at all
    if (!token) {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }
};

// 2. AUTHORIZE FUNCTION (The VIP List)
// This checks if the user has the correct Role (e.g., only 'enseignant' can create quizzes)
const authorize = (...roles) => {
    return (req, res, next) => {
        // req.user was created in the 'protect' function above!
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ 
                message: `User role ${req.user.role} is not authorized to access this route` 
            });
        }
        next();
    };
};

module.exports = { protect, authorize };