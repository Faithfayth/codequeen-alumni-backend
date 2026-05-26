const jwt = require('jsonwebtoken');
const User = require('../models/users');

// STEP 1: Authenticaton Guard Layer
const isAuth = async (req, res, next) => {
    try {
        // FIX: Grab authorization header safely using lowercase naming strings
        const authHeader = req.headers['authorization'] || req.header('Authorization');
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Unauthorized access, token is missing!' });
        }

        const token = authHeader.replace('Bearer ', '').trim();
        const decoded = jwt.verify(token, process.env.JWT_SECRET);   
        
        const user = await User.findById(decoded.id);  
        if (!user) {
            return res.status(401).json({ message: "User account no longer exists inside the database." });
        }

        req.user = user; 
        next();
    } catch (error) {
        return res.status(401).json({ message: "Authentication required for access.", error: error.message });
    }
};

// STEP 2: Administrator Authorization Guard
const isAdmin = (req, res, next) => {
    if (req.user && req.user.isAdmin === true) {
        next(); 
    } else {
        res.status(403).json({ message: "Access Denied: You are NOT an Administrator." });
    }
};

// STEP 3: Alumni Authorization Guard
const isAlumna = (req, res, next) => {
    if (req.user && (req.user.role === 'alumna' || req.user.isAdmin === true)) {
        next();
    } else {
        res.status(403).json({ message: "Access Denied: Alumni status required." });
    }
};

// STEP 4: Corporate Partner Authorization Guard
const isPartner = (req, res, next) => {
    if (req.user && (req.user.role === 'partner' || req.user.isAdmin === true)) {
        next();
    } else {
        res.status(403).json({ message: "Access Denied: Partner status required." });
    }
};

// STEP 5: Student Authorization Guard
const isStudent = (req, res, next) => {
    if (req.user && (req.user.role === 'student' || req.user.isAdmin === true)) {
        next();
    } else {
        res.status(403).json({ message: "Access Denied: Student status required." });
    }
};

module.exports = { isAuth, isAdmin, isAlumna, isPartner, isStudent };