//register
//login
//directories

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/users');
const { autoAssignToCohort } = require('../helpers/assignCohort');

// ==========================================
// 1. AUTHENTICATION LIFECYCLE CONTROLLERS
// ==========================================

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

        await autoAssignToCohort(newUser._id, cohort);

        const token = jwt.sign(
            { id: newUser._id, email: newUser.email, role: newUser.role, isAdmin: newUser.isAdmin }, 
            process.env.JWT_SECRET, 
            { expiresIn: '3h' }
        );

        newUser.password = undefined; // Strip password hash out of the return response JSON

        res.status(201).json({ message: 'User created SUCCESSFULLY', result: newUser, token });

    } catch (error) {
        res.status(500).json({ message: 'Error registering new user', error: error.message });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const existingUser = await User.findOne({ email });

        if (!existingUser) {
            return res.status(404).json({ message: 'User with this email not found' });
        }

        const isPasswordCorrect = await bcrypt.compare(password, existingUser.password);

        if (!isPasswordCorrect) {
            return res.status(400).json({ message: 'This password is incorrect!!' });
        }

        const token = jwt.sign(
            { id: existingUser._id, email: existingUser.email, role: existingUser.role, isAdmin: existingUser.isAdmin }, 
            process.env.JWT_SECRET, 
            { expiresIn: '3h' }
        );
        
        res.status(200).json({ 
            message: 'logged in successfully', 
            result: { 
                username: existingUser.username, 
                email: existingUser.email,
                role: existingUser.role,
                isAdmin: existingUser.isAdmin,
                cohort: existingUser.cohort
            }, 
            token 
        });
    } catch (error) {
        res.status(500).json({ message: 'Error occurred during login', error: error.message });
    }
};

// ==========================================
// 2. ADMINISTRATIVE DIRECTORY CONTROLLERS
// ==========================================

// FETCH ALL STUDENTS (Admin Only)
const getAllStudents = async (req, res) => {
    try {
        const students = await User.find({ role: 'student' }).select('-password').sort({ createdAt: -1 });
        res.status(200).json({ count: students.length, result: students });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch student directory", error: error.message });
    }
};

// FETCH ALL ALUMNAE (Admin Only)
const getAllAlumnae = async (req, res) => {
    try {
        const alumnae = await User.find({ role: 'alumna' }).select('-password').sort({ createdAt: -1 });
        res.status(200).json({ count: alumnae.length, result: alumnae });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch alumnae directory", error: error.message });
    }
};

// FETCH ALL PARTNERS (Admin Only)
const getAllPartners = async (req, res) => {
    try {
        const partners = await User.find({ role: 'partner' }).select('-password').sort({ createdAt: -1 });
        res.status(200).json({ count: partners.length, result: partners });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch corporate partner directory", error: error.message });
    }
};

// FETCH ALL ADMINS (Admin Only)
const getAllAdmins = async (req, res) => {
    try {
        const admins = await User.find({ isAdmin: true }).select('-password').sort({ createdAt: -1 });
        res.status(200).json({ count: admins.length, result: admins });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch administrative staff index", error: error.message });
    }
};

// All functions exported together cleanly from one file
module.exports = { 
    register, 
    login, 
    getAllStudents, 
    getAllAlumnae, 
    getAllPartners, 
    getAllAdmins 
};









//implement registration, using admin token.