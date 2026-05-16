//register
//login

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/users');

const register = async (req, res) => {

    const {username, email, password, confirmPassword, role, cohort, } = req.body;

    try {
        const existingUser = await User.findOne({email});//make password unique in model
        if (existingUser) {
            return res.status(400).json({ message: 'Email already belongs to existing user'});
        }
        if (password!==confirmPassword) {
            return res.status(400).json({ message: "Different passwords! They don't match!"});
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const newUser = new User({username, email, password:hashedPassword, role, cohort });

        await newUser.save();

        const token = jwt.sign({id: newUser._id, email: newUser.email}, process.env.JWT_SECRET, {expiresIn: '3h'});

        res.status(200).json({ message: 'User created SUCCESSFULLY', result: newUser, token });


    } catch (error) {
        res.status(500).json({ message: 'Error registering new user', error: error.message});
    }

}






module.exports = {register};




