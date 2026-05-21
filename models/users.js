const mongoose = require('mongoose');

const usersschema = mongoose.Schema({
    username: { type: String, required: true },
    // FIX: Added unique constraint to protect against duplicate registrations
    email:    { type: String, required: true, unique: true, lowercase: true, trim: true }, 
    password: { type: String, required: true },
    role:     { type: String, enum: ['alumna', 'admin', 'partner', 'student'], required: true }, 
    cohort:   { type: Number, default: 0 },
    cohortHistory: [{ type: Number }], // e.g., [14, 15] - tracks re-applying students and graduations
    isMentor: { type: Boolean, default: false },
    isAdmin:  { type: Boolean, default: false },
    isleader: { type: Boolean, default: false },
}, { 
    // FIX: Automatically manages precise createdAt and updatedAt fields instead of the unmanaged timestamp field
    timestamps: true 
});

module.exports = mongoose.model('Users', usersschema);