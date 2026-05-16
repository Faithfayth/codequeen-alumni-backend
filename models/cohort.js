const mongoose = require('mongoose');

const cohortschema = mongoose.Schema({
    cohortname: { type: String, required: true },
    year: { type: Number, required: true },
    graduationYear: { type: Number, required: true },
});

module.exports = mongoose.model('Cohort', cohortschema);