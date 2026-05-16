const mongoose = require('mongoose');

const usersschema = mongoose.Schema({
    username: { type: String, required: true },
    email:    { type: String, required: true },
    password: { type: String, required: true },
    role:     { type: String, enum: ['alumna','admin', 'partner', 'student'], required: true }, //
    cohort:   { type: Number, default: 0 },
    timestamp: { type: Date},
    isMentor: { type: Boolean, default: false },
    isAdmin: { type: Boolean, default: false },
    isleader: { type: Boolean, default: false },
});


module.exports = mongoose.model('Users', usersschema);