const mongoose = require('mongoose');

const enrollmentsschema = new mongoose.Schema({
    userID: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
    cohortID: { type: mongoose.Schema.Types.ObjectId, ref: 'Cohort', required: true },
    attendance: { type: Boolean, default: false },
    projectSubmission: {  //when there is no project submitted by student its 'not-eligible', when project is submitted but not approved, its 'pending', when project is approved, its 'approved',
        type: String, 
        enum: ['not-eligible', 'pending', 'approved'],
        default: 'not-eligible'},
    // Status management
    adminverified: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Enrollment', enrollmentsschema);