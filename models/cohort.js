const mongoose = require('mongoose');

const cohortSchema = mongoose.Schema({
    // Changed to String to support labels like "Cohort 15"
    cohortname: { 
        type: String, 
        required: true, 
        unique: true 
    }, 
    year: { 
        type: Number, 
        required: true 
    }, 
    // Now stored as a formal Date object
    graduationYear: { 
        type: Date, 
        required: true 
    }, 
    students: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Users' 
    }] 
}, { timestamps: true });

module.exports = mongoose.model('Cohort', cohortSchema);