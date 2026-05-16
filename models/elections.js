const mongoose = require('mongoose');

const electionsschema = mongoose.Schema({
    electionName: { type: String, required: true },
    description: { type: String, required: true },
    candidates: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Users' }, 
                 {manifesto: { type: String, required: true }}, 
                 {votesCount: { type: Number, default: 0 }}, 
                 {imageurl: { type: String, required: true }}], //array of user IDs who are candidates in the election
    voters: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Users' }], //array of user IDs who have voted in the election
    isActive: { type: Boolean, required: true }, //indicates whether the election is currently active or not
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
});

module.exports = mongoose.model('Elections', electionsschema);