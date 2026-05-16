const mongoose = require('mongoose');

const enrollmentsschema = mongoose.Schema({
    userID:     { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
    cohortID:   { type: mongoose.Schema.Types.ObjectId, ref: 'Cohort', required: true },
    attendance: { type: Boolean, required: true },
    projectSubmission: { type: Boolean, required: true },
    adminverified:     { type: Boolean, required: true },
});

module.exports = mongoose.model('Enrollments', enrollmentsschema);