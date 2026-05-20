const mongoose = require('mongoose');

const alumdirectoryschema = mongoose.Schema({
    userID: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true, unique: true }, // unique: true prevents duplicate profile cards
    name:   { type: String, required: true },
    email:  { type: String, required: true },
    contact:{ type: String, required: true },
    location: { type: String, required: true },
    graduationYear: { type: Number, required: true },
    cohort: { type: Number, required: true},
    // ADDED: Enforces the lock state so they cannot modify it after submission
    isLocked: { type: Boolean, default: false }
}, {
    // ADDED: Helps admins track when directory files were submitted
    timestamps: true
});

module.exports = mongoose.model('Alumdirectory', alumdirectoryschema);