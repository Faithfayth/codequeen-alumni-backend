const mongoose = require('mongoose');

const cohortschema = mongoose.Schema({
    cohortname: { type: Number, required: true, unique: true }, // e.g., 15.   //Type is Number and unique index for fast lookups
    year: { type: Number, required: true },       
    graduationmonth: { type: Number, required: true }, 
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Users' }] 
});

module.exports = mongoose.model('Cohort', cohortschema);