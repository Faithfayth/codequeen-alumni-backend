const mongoose = require('mongoose');

const enrollmentsschema = new mongoose.Schema({
    userID: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
    cohortID: { type: mongoose.Schema.Types.ObjectId, ref: 'Cohort', required: true },
    attendance: { type: Boolean, default: false },
    projectSubmission: { type: Boolean, default: false },
    // Status management
    adminverified: { 
        type: String, 
        enum: ['not-eligible', 'pending', 'approved'], 
        default: 'not-eligible' 
    },
}, { timestamps: true });

module.exports = mongoose.model('Enrollment', enrollmentsschema);