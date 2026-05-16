const mongoose = require('mongoose');
const mentorchat = require('./mentorchat');

const mentorrequestsschema = mongoose.Schema({
    mentorID: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
    menteeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },   
    status: { type: String, enum: ['pending', 'accepted', 'rejected'], required: true }, //pending, accepted, rejected (this will be set by the mentor after reviewing the mentee's request)
});

module.exports = mongoose.model('Mentorrequests', mentorrequestsschema);