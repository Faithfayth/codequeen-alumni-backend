// STEP 1: Check if the user is logged in (Authentication)
const jwt = require('jsonwebtoken');

const User = require('../models/users');

const isAuth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        if(!token) {
            return res.status(401).json({ message: 'Unauthorized access, token is missing!'});
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);   //decoding the token
        
        const user = await User.findById(decoded.id);  //find the user using the id in the token (decoded.id)
        if (!user) throw new Error();

        req.user = user; 
        next();
    } catch (error) {
        res.status(401).json({ message: "Authentication required for access." });
    }
};

// STEP 2: Check if user is admin(isAdmin===true) aunthetication procedure
const isAdmin = (req, res, next) => {
    // We check if the field is exactly true
    if (req.user && req.user.isAdmin === true) {
        next(); 
    } else {
        res.status(403).json({ message: "Access Denied: You are NOT an Administrator." });
    }
};




module.exports = { isAuth, isAdmin};