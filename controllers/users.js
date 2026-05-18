//register
//login

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/users');
// Note: Double-check your file paths. If you put it in src/services/, change path to '../services/cohortService'
const { autoAssignToCohort } = require('../helpers/assignCohort');

const register = async (req, res) => {
    const { username, email, password, confirmPassword, role, cohort, isMentor, isAdmin, isleader } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already belongs to existing user' });
        }
        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Different passwords! They don't match!" });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const newUser = new User({ username, email, password: hashedPassword, role, cohort, isMentor, isAdmin, isleader });

        await newUser.save();

        // Safe background automation: Updates cohort students array and user cohortHistory array
        await autoAssignToCohort(newUser._id, cohort);

        //Added core role gates to token payload so authorization middleware functions correctly
        const token = jwt.sign(
            { id: newUser._id, email: newUser.email, role: newUser.role, isAdmin: newUser.isAdmin }, 
            process.env.JWT_SECRET, 
            { expiresIn: '3h' }
        );

        // Security best practice: Strip hashed password out of JSON response
        // newUser.password = undefined;

        res.status(201).json({ message: 'User created SUCCESSFULLY', result: newUser, token });

    } catch (error) {
        res.status(500).json({ message: 'Error registering new user', error: error.message });
    }
}

const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const existingUser = await User.findOne({ email });

        if (!existingUser) {
            // BUG FIX: Removed 'error.message' which causes server to crash here
            return res.status(404).json({ message: 'User with this email not found' });
        }

        const isPasswordCorrect = await bcrypt.compare(password, existingUser.password);

        if (!isPasswordCorrect) {
            return res.status(400).json({ message: 'This password is incorrect!!' });
        }

        // BUG FIX: Added authorization tracking details into your active sign-in token structure
        const token = jwt.sign(
            { id: existingUser._id, email: existingUser.email, role: existingUser.role, isAdmin: existingUser.isAdmin }, 
            process.env.JWT_SECRET, 
            { expiresIn: '3h' }
        );
        
        res.status(200).json({ 
            message: 'logged in successfully', 
            result: { 
                name: existingUser.username, 
                email: existingUser.email,
                role: existingUser.role,
                isAdmin: existingUser.isAdmin
            }, 
            token 
        });
    } catch (error) {
        res.status(500).json({ message: 'Error occurred during login', error: error.message });
    }
}

module.exports = { register, login };