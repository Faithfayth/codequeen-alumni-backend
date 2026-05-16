const mongoose = require('mongoose');

const profilesschema = mongoose.Schema({
    userID: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
    fullname: { type: String, required: true },
    bio: { type: String, required: true },
    profileimage: { type: String },
    cvUrl: { type: String },
    portfoliolink: { type: String },
    skills: { type: [String] },
    badges: { type: [String] },
});

module.exports = mongoose.model('Profiles', profilesschema);